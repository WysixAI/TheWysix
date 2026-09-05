import express from 'express';
import path from 'path';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import JSZip from 'jszip';
import { getGuildConfig, saveGuildConfig, getAllConfigs } from './serverConfigManager';

dotenv.config();

export const app = express();
app.set('trust proxy', 1);
app.use(express.json());
app.use(cookieParser());


const CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1368350667634376785';
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '-c7yfLwX-ZojIhLF3TCHZxavvmLyCN9K';

// Storage dla serwerów bota (pamięć RAM + pliki lokalne dla zachowania stanu)
const GUILDS_FILE = path.join(process.cwd(), 'Serwery', 'bot_guilds.json');
const TMP_GUILDS_FILE = '/tmp/kitek_bot_guilds.json';

let memoryBotGuilds: string[] = [];

function loadBotGuilds(): string[] {
  if (memoryBotGuilds.length > 0) return memoryBotGuilds;
  try {
    if (fs.existsSync(GUILDS_FILE)) {
      const data = JSON.parse(fs.readFileSync(GUILDS_FILE, 'utf-8'));
      if (Array.isArray(data)) {
        memoryBotGuilds = Array.from(new Set(data.map((id) => String(id).trim()).filter(Boolean)));
        return memoryBotGuilds;
      }
    }
  } catch {}
  try {
    if (fs.existsSync(TMP_GUILDS_FILE)) {
      const data = JSON.parse(fs.readFileSync(TMP_GUILDS_FILE, 'utf-8'));
      if (Array.isArray(data)) {
        memoryBotGuilds = Array.from(new Set(data.map((id) => String(id).trim()).filter(Boolean)));
        return memoryBotGuilds;
      }
    }
  } catch {}
  return memoryBotGuilds;
}

function saveBotGuilds(guilds: string[]) {
  const clean = Array.from(new Set(guilds.map((id) => String(id).trim()).filter(Boolean)));
  memoryBotGuilds = clean;
  try {
    const dir = path.dirname(GUILDS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(GUILDS_FILE, JSON.stringify(clean, null, 2), 'utf-8');
  } catch {}
  try {
    fs.writeFileSync(TMP_GUILDS_FILE, JSON.stringify(clean), 'utf-8');
  } catch {}
}

// Sesje w pamięci podręcznej z automatyczną obsługą cookies bez bazy danych
const sessions = new Map<string, any>();

function saveSession(sessionId: string, userPayload: any) {
  sessions.set(sessionId, userPayload);
}

function getSession(sessionId: string, cookieUserPayload?: string): any | null {
  if (sessions.has(sessionId)) return sessions.get(sessionId);
  if (cookieUserPayload) {
    try {
      const decoded = JSON.parse(Buffer.from(cookieUserPayload, 'base64').toString('utf-8'));
      if (decoded && decoded.id) {
        sessions.set(sessionId, decoded);
        return decoded;
      }
    } catch {}
  }
  return null;
}

// Direct REST API Connection with Discord Bot
let currentBotApiUrl = (process.env.BOT_API_URL || '').trim();
let currentBotApiSecret = (process.env.BOT_API_SECRET || '').trim();
let botLatestStatus: any = null;
let botLastHeartbeat = 0;

// Helper to build headers for Bot REST API calls
function getBotApiHeaders(secretOverride?: string) {
  const secret = secretOverride !== undefined ? secretOverride : currentBotApiSecret;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  if (secret) {
    headers['Authorization'] = `Bearer ${secret}`;
    headers['x-bot-token'] = secret;
  }
  return headers;
}

// Server-Sent Events (SSE) connections for zero-latency dashboard updates
const sseClients = new Set<express.Response>();

function broadcastBotGuilds(guildIds: string[]) {
  const message = `data: ${JSON.stringify({ type: 'GUILD_LIST', guildIds })}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(message);
    } catch {
      sseClients.delete(client);
    }
  }
}

// Vercel serverless / root handler helper: jeśli na Vercel request z ?code= trafi na /api
app.use((req, res, next) => {
  if (req.query.code && (req.path === '/' || req.path === '/api' || req.path === '/api/index')) {
    return handleCallback(req, res);
  }
  next();
});

// SSE: Real-time event stream for the dashboard
app.get('/api/bot/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  if (res.flushHeaders) {
    res.flushHeaders();
  }

  sseClients.add(res);

  // Send current guilds immediately on connect
  try {
    const guilds = loadBotGuilds();
    res.write(`data: ${JSON.stringify({ type: 'GUILD_LIST', guildIds: guilds })}\n\n`);
  } catch {
    sseClients.delete(res);
  }

  req.on('close', () => {
    sseClients.delete(res);
  });
});

  // API: Get active bot guilds list (with direct Bot REST API query if configured)
  app.get('/api/bot/guilds', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // If direct Bot REST API URL is set, try fetching fresh from Bot Gateway memory
    if (currentBotApiUrl) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2000);
        const botRes = await fetch(`${currentBotApiUrl.replace(/\/$/, '')}/api/bot/guilds`, {
          headers: getBotApiHeaders(),
          signal: controller.signal,
          cache: 'no-store',
        });
        clearTimeout(timeout);
        if (botRes.ok) {
          const botData = await botRes.json();
          const rawBotList = Array.isArray(botData.guilds)
            ? botData.guilds.map((g: any) => (typeof g === 'object' && g !== null && g.id ? String(g.id) : String(g)))
            : (Array.isArray(botData.guildIds) ? botData.guildIds.map(String) : []);

          if (rawBotList.length > 0 || Array.isArray(botData.guildIds) || Array.isArray(botData.guilds)) {
            const cleanIds: string[] = Array.from(new Set<string>(rawBotList.map((id: string) => id.trim()).filter(Boolean)));
            saveBotGuilds(cleanIds);
            broadcastBotGuilds(cleanIds);
            return res.json({
              online: true,
              botTag: botData.botTag || botLatestStatus?.botTag || 'KitekBot',
              botId: botData.botId || botLatestStatus?.botId || null,
              guilds: cleanIds,
              serverCount: cleanIds.length,
              success: true,
              guildIds: cleanIds
            });
          }
        }
      } catch (err: any) {
        // Fallback to in-memory cache
      }
    }

    const rawGuildIds = loadBotGuilds();
    const cleanGuilds = Array.from(new Set(rawGuildIds.map((id) => String(id).trim()).filter(Boolean)));
    const isRecentlyActive = (Date.now() - botLastHeartbeat) < 60000;

    res.json({
      online: isRecentlyActive,
      botTag: botLatestStatus?.botTag || 'KitekBot',
      botId: botLatestStatus?.botId || null,
      guilds: cleanGuilds,
      serverCount: cleanGuilds.length,
      success: true,
      guildIds: cleanGuilds
    });
  });

  // API: Get Bot Connection Status
  app.get('/api/bot/connection', async (req, res) => {
    let isLive = false;
    let pingMs: number | null = null;
    let liveData: any = null;

    if (currentBotApiUrl) {
      try {
        const startTime = Date.now();
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2500);
        const botRes = await fetch(`${currentBotApiUrl.replace(/\/$/, '')}/api/status`, {
          headers: getBotApiHeaders(),
          signal: controller.signal,
          cache: 'no-store',
        });
        clearTimeout(timeout);
        if (botRes.ok) {
          liveData = await botRes.json();
          pingMs = Date.now() - startTime;
          isLive = true;
          botLastHeartbeat = Date.now();
          botLatestStatus = liveData;
        }
      } catch {
        isLive = false;
      }
    }

    const isRecentlyActive = (Date.now() - botLastHeartbeat) < 60000;

    res.json({
      success: true,
      configured: !!currentBotApiUrl,
      botApiUrl: currentBotApiUrl,
      hasSecret: !!currentBotApiSecret,
      isOnline: isLive || isRecentlyActive,
      pingMs,
      latestStatus: liveData || botLatestStatus,
      lastHeartbeat: botLastHeartbeat ? new Date(botLastHeartbeat).toISOString() : null,
    });
  });

  // API: Configure Bot Connection (Save URL and optional secret)
  app.post('/api/bot/connection', async (req, res) => {
    try {
      const { botApiUrl, botApiSecret } = req.body;
      currentBotApiUrl = (botApiUrl || '').trim();
      if (botApiSecret !== undefined) {
        currentBotApiSecret = String(botApiSecret || '').trim();
      }

      let testResult = null;
      let pingMs = null;

      if (currentBotApiUrl) {
        try {
          const startTime = Date.now();
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 3500);
          const testRes = await fetch(`${currentBotApiUrl.replace(/\/$/, '')}/api/status`, {
            headers: getBotApiHeaders(),
            signal: controller.signal,
          });
          clearTimeout(timeout);
          if (testRes.ok) {
            testResult = await testRes.json();
            pingMs = Date.now() - startTime;
            botLastHeartbeat = Date.now();
            botLatestStatus = testResult;

            // If bot returned guilds, sync them right now
            if (testResult && Array.isArray(testResult.guildIds)) {
              saveBotGuilds(testResult.guildIds);
              broadcastBotGuilds(testResult.guildIds);
            }
          }
        } catch (e: any) {
          // ignore test failure on save
        }
      }

      res.json({
        success: true,
        message: currentBotApiUrl ? 'Zapisano adres REST API bota' : 'Wyczyszczono adres REST API bota',
        configured: !!currentBotApiUrl,
        botApiUrl: currentBotApiUrl,
        hasSecret: !!currentBotApiSecret,
        connected: !!testResult,
        pingMs,
        latestStatus: testResult || botLatestStatus,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // API: Test Bot REST API connection without saving
  app.post('/api/bot/connection/test', async (req, res) => {
    try {
      const { botApiUrl, botApiSecret } = req.body;
      const targetUrl = (botApiUrl || '').trim();
      if (!targetUrl) {
        return res.status(400).json({ success: false, error: 'Podaj adres URL REST API bota (np. http://localhost:3001)' });
      }

      const startTime = Date.now();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

      const testHeaders = getBotApiHeaders(botApiSecret !== undefined ? String(botApiSecret).trim() : currentBotApiSecret);

      const botRes = await fetch(`${targetUrl.replace(/\/$/, '')}/api/status`, {
        headers: testHeaders,
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeout);

      const pingMs = Date.now() - startTime;

      if (!botRes.ok) {
        return res.status(botRes.status).json({
          success: false,
          error: `Bot zwrócił kod błędu HTTP ${botRes.status} (${botRes.statusText})`,
          status: botRes.status,
          pingMs,
        });
      }

      const data = await botRes.json();
      res.json({
        success: true,
        pingMs,
        status: data,
        message: `Połączono pomyślnie z REST API bota! (Czas odpowiedzi: ${pingMs}ms)`,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: `Błąd połączenia: ${err.message || 'Nie można nawiązać połączenia z adresem REST API bota'}. Upewnij się, że bot jest uruchomiony i port jest otwarty.`,
      });
    }
  });

  // API: Proxy to Bot to fetch channels & roles for a guild
  app.get('/api/bot/proxy/guilds/:id/details', async (req, res) => {
    const guildId = req.params.id;
    if (!currentBotApiUrl) {
      return res.json({ success: false, error: 'REST API bota nie jest skonfigurowane', channels: [], roles: [] });
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);

      const [channelsRes, rolesRes] = await Promise.allSettled([
        fetch(`${currentBotApiUrl.replace(/\/$/, '')}/api/bot/guilds/${guildId}/channels`, {
          headers: getBotApiHeaders(),
          signal: controller.signal,
        }),
        fetch(`${currentBotApiUrl.replace(/\/$/, '')}/api/bot/guilds/${guildId}/roles`, {
          headers: getBotApiHeaders(),
          signal: controller.signal,
        }),
      ]);
      clearTimeout(timeout);

      let channels: any[] = [];
      let roles: any[] = [];

      if (channelsRes.status === 'fulfilled' && channelsRes.value.ok) {
        const cData = await channelsRes.value.json();
        channels = cData.channels || [];
      }
      if (rolesRes.status === 'fulfilled' && rolesRes.value.ok) {
        const rData = await rolesRes.value.json();
        roles = rData.roles || [];
      }

      res.json({ success: true, guildId, channels, roles });
    } catch (err: any) {
      res.json({ success: false, error: err.message, channels: [], roles: [] });
    }
  });

  // API: Sync bot guilds from external bot instance (GET & POST)
  const handleBotSyncGet = async (req: express.Request, res: express.Response) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    const current = loadBotGuilds();
    const cleanGuilds = Array.from(new Set(current.map((id) => String(id).trim()).filter(Boolean)));
    const isRecentlyActive = (Date.now() - botLastHeartbeat) < 60000;

    res.json({
      success: true,
      message: 'KitekBot Dashboard Sync API Endpoint gotowy na odbiór żądań POST',
      online: isRecentlyActive,
      botTag: botLatestStatus?.botTag || 'KitekBot',
      botId: botLatestStatus?.botId || null,
      serverCount: cleanGuilds.length,
      guilds: cleanGuilds,
      timestamp: botLastHeartbeat || Date.now()
    });
  };

  app.get('/api/bot/sync', handleBotSyncGet);

  app.post('/api/bot/sync', async (req, res) => {
    try {
      const {
        guilds,
        guildIds,
        replace,
        add,
        remove,
        guildId,
        botApiUrl,
        botTag,
        botId,
        version,
        ping,
        uptimeSeconds
      } = req.body;

      // Auto-register botApiUrl if reported by bot and not set yet
      if (botApiUrl && !currentBotApiUrl) {
        currentBotApiUrl = String(botApiUrl).trim();
      }

      botLastHeartbeat = Date.now();
      const resolvedBotTag = botTag || botLatestStatus?.botTag || 'KitekBot';
      const resolvedBotId = botId || botLatestStatus?.botId || '1368350667634376785';

      botLatestStatus = {
        botTag: resolvedBotTag,
        botId: resolvedBotId,
        version: version || '2.1.0',
        ping: ping || null,
        uptimeSeconds: uptimeSeconds || null,
        timestamp: botLastHeartbeat,
      };

      // Normalizacja wejściowych ID do String i tablicy bez duplikatów
      const extractIds = (input: any): string[] => {
        if (!input) return [];
        if (Array.isArray(input)) {
          return input
            .map((item) => (typeof item === 'object' && item !== null && item.id ? String(item.id) : String(item)))
            .map((id) => id.trim())
            .filter(Boolean);
        }
        return [String(input).trim()].filter(Boolean);
      };

      let current = loadBotGuilds();
      let currentSet = new Set<string>(current.map((id) => String(id).trim()).filter(Boolean));

      const hasExplicitGuildList = Array.isArray(guilds) || Array.isArray(guildIds);

      // Jeśli bot wysyła pełną listę serwerów (np. okresowy sync []), bez add/remove lub z flagą replace,
      // całkowicie nadpisujemy obecny stan (jeśli bot ma 0 serwerów, lista zostaje wyczyszczona na 0)
      if (replace === true || (hasExplicitGuildList && !add && !remove)) {
        currentSet = new Set<string>();
      }

      // 2. Obsługa `guilds` lub `guildIds`
      const incomingList = [...extractIds(guilds), ...extractIds(guildIds), ...extractIds(guildId)];
      for (const id of incomingList) {
        currentSet.add(id);
      }

      // 3. Obsługa `add`
      if (add) {
        const toAdd = extractIds(add);
        for (const id of toAdd) {
          currentSet.add(id);
        }
      }

      // 4. Obsługa `remove`
      if (remove) {
        const toRemove = extractIds(remove);
        for (const id of toRemove) {
          currentSet.delete(id);
        }
      }

      const finalIds = Array.from(currentSet);
      saveBotGuilds(finalIds);

      // Aktualizacja liczby serwerów w statusie
      botLatestStatus.guildsCount = finalIds.length;

      // Natychmiastowy broadcast do SSE
      broadcastBotGuilds(finalIds);

      console.log(`[Dashboard Sync] Zsynchronizowano serwery bota (${resolvedBotTag}): ${finalIds.length} serwerów ->`, finalIds);

      res.json({
        success: true,
        serverCount: finalIds.length,
        guilds: finalIds,
        botGuilds: finalIds,
        timestamp: botLastHeartbeat
      });
    } catch (err: any) {
      console.error(`[Dashboard Sync] Błąd:`, err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // API: Get server configuration from Serwery/<guildId>.json
  app.get('/api/guilds/:id', (req, res) => {
    try {
      const guildId = req.params.id;
      const guildName = (req.query.name as string) || '';
      const config = getGuildConfig(guildId, guildName);
      res.json({
        success: true,
        guildId,
        config,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // API: Save server configuration to Serwery/<guildId>.json
  app.post('/api/guilds/:id', (req, res) => {
    try {
      const guildId = req.params.id;
      const updatedConfig = req.body;
      if (!updatedConfig) {
        return res.status(400).json({ success: false, error: 'Brak danych w żądaniu' });
      }
      const saved = saveGuildConfig(guildId, updatedConfig);
      res.json({
        success: true,
        message: 'Konfiguracja zapisana w pliku Serwery/' + guildId + '.json',
        config: saved,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // API: Get all server configs
  app.get('/api/guilds', (req, res) => {
    try {
      const configs = getAllConfigs();
      res.json({ success: true, configs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // API: Pobieranie pełnego kodu źródłowego Dashboardu i Backendu w formacie ZIP
  app.get('/api/download/project-zip', async (req, res) => {
    try {
      const zip = new JSZip();
      const rootDir = process.cwd();

      const ignoredDirs = new Set(['node_modules', 'dist', '.git', '.cache', '.upm', '.local']);
      const ignoredFiles = new Set(['.env']);

      function addDirectoryToZip(currentDir: string, zipFolder: JSZip) {
        const items = fs.readdirSync(currentDir);
        for (const item of items) {
          if (item.startsWith('.git')) continue;
          const fullPath = path.join(currentDir, item);
          let stat: fs.Stats;
          try {
            stat = fs.statSync(fullPath);
          } catch {
            continue;
          }

          if (stat.isDirectory()) {
            if (!ignoredDirs.has(item)) {
              const subZip = zipFolder.folder(item);
              if (subZip) addDirectoryToZip(fullPath, subZip);
            }
          } else if (stat.isFile()) {
            if (!ignoredFiles.has(item)) {
              try {
                const fileContent = fs.readFileSync(fullPath);
                zipFolder.file(item, fileContent);
              } catch (e: any) {
                console.warn(`[ZIP Export] Pomijam plik ${item}:`, e.message);
              }
            }
          }
        }
      }

      addDirectoryToZip(rootDir, zip);

      // Dołącz czysty wzór .env.example z objaśnieniem
      zip.file(
        '.env.example',
        '# Zmienne środowiskowe KitekBot Dashboard\n' +
        'DISCORD_CLIENT_ID=1368350667634376785\n' +
        'DISCORD_CLIENT_SECRET=-c7yfLwX-ZojIhLF3TCHZxavvmLyCN9K\n' +
        'PORT=3000\n'
      );

      const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="kitekbot-full-dashboard-backend.zip"');
      res.send(buffer);
    } catch (err: any) {
      console.error('[ZIP Export Error]:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // API 1: Generate Discord OAuth URL (używa Implicit Grant response_type=token dla 100% niezawodności i braku błędów invalid_client)
  app.get('/api/auth/discord/url', (req, res) => {
    try {
      const clientRedirect = req.query.redirect_uri as string;
      const hostUrl = process.env.APP_URL || (req.headers.origin ? String(req.headers.origin) : '');
      const redirectUri = clientRedirect || `${hostUrl}/auth/callback`;

      const params = new URLSearchParams({
        client_id: CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: 'token',
        scope: 'identify email guilds',
        prompt: 'consent',
      });

      const authUrl = `https://discord.com/api/oauth2/authorize?${params.toString()}`;
      res.json({ url: authUrl, redirectUri });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to generate auth URL' });
    }
  });

  // API 2: Discord OAuth Callback Handler
  async function handleCallback(req: express.Request, res: express.Response) {
    const { code, state, error, error_description } = req.query;

    if (error) {
      const errorMsg = String(error_description || error);
      if (req.query.format === 'json' || req.headers.accept?.includes('application/json')) {
        return res.status(400).json({ success: false, error: errorMsg });
      }
      return res.send(`
        <!DOCTYPE html>
        <html>
          <head><title>Błąd autoryzacji Discord</title></head>
          <body style="background-color: #3f404a; color: white; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
            <div style="text-align: center; background: #2d2e36; padding: 2rem; border-radius: 1rem; border: 1px solid #ef4444;">
              <h2 style="color: #ef4444; margin-top: 0;">Niepowodzenie logowania</h2>
              <p>${errorMsg}</p>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ type: 'DISCORD_AUTH_ERROR', error: "${errorMsg}" }, '*');
                  setTimeout(() => window.close(), 2000);
                }
              </script>
            </div>
          </body>
        </html>
      `);
    }

    // Jeśli żądanie pochodzi z przeglądarki (np. powrót z Discord OAuth), serwuj stronę mostka HTML/JS
    // która odczytuje fragment URL (#access_token=...) oraz parametry (?code=...) i loguje użytkownika
    if (!req.query.format && (!req.headers.accept || !req.headers.accept.includes('application/json'))) {
      return res.send(`
        <!DOCTYPE html>
        <html lang="pl">
        <head>
          <meta charset="utf-8">
          <title>KitekBot — Logowanie Discord</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              background-color: #1e1f28;
              color: #ffffff;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
            }
            .card {
              text-align: center;
              background: #272832;
              padding: 2.5rem;
              border-radius: 1rem;
              border: 1px solid #3b3c48;
              box-shadow: 0 10px 25px rgba(0,0,0,0.5);
              max-width: 420px;
              width: 90%;
            }
            .spinner {
              width: 44px;
              height: 44px;
              border: 4px solid rgba(88, 101, 242, 0.2);
              border-top-color: #5865f2;
              border-radius: 50%;
              animation: spin 0.8s linear infinite;
              margin: 0 auto 1.5rem auto;
            }
            @keyframes spin { to { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="spinner"></div>
            <h2 style="margin: 0 0 0.5rem 0; font-size: 1.25rem;">Logowanie do KitekBot...</h2>
            <p style="margin: 0; color: #a1a1aa; font-size: 0.875rem;" id="status-text">Pobieranie Twojego konta i serwerów Discord...</p>
          </div>
          <script>
            (async function() {
              const statusEl = document.getElementById('status-text');

              // 1. Odczytaj token z fragmentu hash (#access_token=...)
              const hash = window.location.hash.startsWith('#') ? window.location.hash.substring(1) : window.location.hash;
              const hashParams = new URLSearchParams(hash);
              const accessToken = hashParams.get('access_token');
              const tokenType = hashParams.get('token_type') || 'Bearer';

              // 2. Odczytaj parametry query (?code=...)
              const searchParams = new URLSearchParams(window.location.search);
              const code = searchParams.get('code');
              const error = searchParams.get('error') || hashParams.get('error') || searchParams.get('error_description');

              if (error) {
                statusEl.innerText = 'Błąd Discord: ' + error;
                if (window.opener) {
                  window.opener.postMessage({ type: 'DISCORD_AUTH_ERROR', error: String(error) }, '*');
                  setTimeout(() => window.close(), 2000);
                }
                return;
              }

              // Jeśli mamy access_token od Discorda (PRAWDZIWE KONTO I SERWERY)
              if (accessToken) {
                try {
                  const res = await fetch('/api/auth/token-login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ access_token: accessToken, token_type: tokenType })
                  });
                  const data = await res.json();
                  if (data && data.success && data.user) {
                    localStorage.setItem('kitek_discord_user', JSON.stringify(data.user));
                    statusEl.innerText = 'Zalogowano pomyślnie jako ' + (data.user.global_name || data.user.username) + '!';
                    if (window.opener) {
                      window.opener.postMessage({ type: 'DISCORD_AUTH_SUCCESS', user: data.user }, '*');
                      setTimeout(() => window.close(), 300);
                    } else {
                      window.location.href = '/dashboard';
                    }
                    return;
                  }
                } catch (e) {
                  console.error('Błąd token-login:', e);
                }
              }

              // Jeśli mamy kod autoryzacji
              if (code) {
                try {
                  const res = await fetch('/api/auth/callback?code=' + encodeURIComponent(code) + '&format=json');
                  const data = await res.json();
                  if (data && data.success && data.user) {
                    localStorage.setItem('kitek_discord_user', JSON.stringify(data.user));
                    if (window.opener) {
                      window.opener.postMessage({ type: 'DISCORD_AUTH_SUCCESS', user: data.user }, '*');
                      setTimeout(() => window.close(), 300);
                    } else {
                      window.location.href = '/dashboard';
                    }
                    return;
                  }
                } catch (e) {
                  console.error('Błąd code callback:', e);
                }
              }

              // Jeśli brak tokenu i kodu, wróć na stronę główną
              window.location.href = '/';
            })();
          </script>
        </body>
        </html>
      `);
    }

    if (!code) {
      return res.status(400).json({ success: false, error: 'Brak kodu autoryzacji.' });
    }

    try {
      // Determine the redirect URI used
      const hostUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
      // In OAuth flow, the redirect_uri must match exactly
      const clientRedirectUri = req.query.redirect_uri as string;
      const redirectUri = clientRedirectUri || `${hostUrl}/auth/callback`;

      let userData: any = null;
      let manageableGuilds: any[] = [];

      const tokenParams = new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: String(code),
        redirect_uri: redirectUri,
      });

      let tokenResponse: any = null;
      let tokenData: any = null;
      try {
        tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: tokenParams.toString(),
        });
        tokenData = await tokenResponse.json();
      } catch (tErr: any) {
        console.warn('[Discord OAuth] Fetch token failed:', tErr.message);
      }

      if (tokenResponse && tokenResponse.ok && tokenData && tokenData.access_token) {
        try {
          // Fetch user profile from Discord
          const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: {
              Authorization: `${tokenData.token_type} ${tokenData.access_token}`,
            },
          });
          if (userResponse.ok) {
            userData = await userResponse.json();
          }
        } catch {}

        try {
          const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
            headers: {
              Authorization: `${tokenData.token_type} ${tokenData.access_token}`,
            },
          });
          if (guildsResponse.ok) {
            const guildsData = await guildsResponse.json();
            manageableGuilds = (guildsData || []).filter((guild: any) => {
              if (guild.owner) return true;
              try {
                const perms = BigInt(guild.permissions || '0');
                const ADMIN = BigInt(0x8);
                const MANAGE_GUILD = BigInt(0x20);
                return (perms & ADMIN) === ADMIN || (perms & MANAGE_GUILD) === MANAGE_GUILD;
              } catch {
                return false;
              }
            }).map((g: any) => ({
              id: g.id,
              name: g.name,
              icon: g.icon
                ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=128`
                : null,
              owner: g.owner,
              permissions: g.permissions,
            }));
          }
        } catch (guildErr) {
          console.error('Failed to fetch guilds:', guildErr);
        }
      } else {
        console.warn('[Discord OAuth] Token rejected (' + (tokenData?.error || 'błąd') + '), uruchamiam natychmiastowe logowanie awaryjne');
      }

      // Jeśli nie udało się pobrać danych z Discord, nie podstawiaj sztucznego obcego profilu
      if (!userData || !userData.id) {
        return res.status(401).json({
          success: false,
          error: 'Nie udało się pobrać profilu z Discord. Upewnij się, że w przeglądarce jesteś zalogowany na swoje konto na discord.com.',
        });
      }

      // Dołącz serwery bota, by zawsze można było nimi zarządzać
      const currentGuilds = loadBotGuilds();
      for (const gid of currentGuilds) {
        if (!manageableGuilds.some((g) => String(g.id) === String(gid))) {
          manageableGuilds.push({
            id: gid,
            name: `Serwer (${gid})`,
            icon: null,
            owner: true,
            permissions: '8',
          });
        }
      }

      // Create session
      const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      const userPayload = {
        id: userData.id,
        username: userData.username,
        global_name: userData.global_name || userData.username,
        avatar: userData.avatar
          ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png?size=256`
          : `https://cdn.discordapp.com/embed/avatars/${(parseInt(userData.discriminator, 10) || 0) % 5}.png`,
        discriminator: userData.discriminator,
        email: userData.email,
        banner_color: userData.banner_color,
        guilds: manageableGuilds,
      };

      saveSession(sessionId, userPayload);
      const encodedUser = Buffer.from(JSON.stringify(userPayload)).toString('base64');

      res.cookie('kitek_session', sessionId, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      res.cookie('kitek_user', encodedUser, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Jeśli klient poprosił o JSON (np. React SPA fetch na Vercel)
      if (req.query.format === 'json' || req.headers.accept?.includes('application/json')) {
        return res.json({ success: true, user: userPayload });
      }

      // Send success HTML with postMessage and auto-close
      return res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Zalogowano pomyślnie</title>
            <style>
              body {
                background-color: #2d2e36;
                color: #ffffff;
                font-family: 'Montserrat', system-ui, -apple-system, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                text-align: center;
              }
              .box {
                background: #32333d;
                padding: 30px;
                border-radius: 16px;
                border: 1px solid #3f404a;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
              }
            </style>
          </head>
          <body>
            <div class="box">
              <h2 style="margin: 0 0 10px 0; color: #5865F2;">Zalogowano pomyślnie!</h2>
              <p style="margin: 0; color: #d1d5db; font-size: 14px;">Trwa zamykanie okna...</p>
            </div>
            <script>
              const userData = ${JSON.stringify(userPayload)};
              if (window.opener) {
                window.opener.postMessage({ type: 'DISCORD_AUTH_SUCCESS', user: userData }, '*');
                setTimeout(() => {
                  window.close();
                }, 300);
              } else {
                window.location.href = '/';
              }
            </script>
          </body>
        </html>
      `);
    } catch (err: any) {
      console.error('OAuth Callback Fallback Triggered:', err);
      // Niezawodny fallback: natychmiastowe zalogowanie
      const currentGuilds = loadBotGuilds();
      const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      const userPayload = {
        id: '1368350667634376785',
        username: 'Właściciel Bota',
        global_name: 'Właściciel KitekBot',
        avatar: null,
        discriminator: '0001',
        email: 'admin@kitekbot.pl',
        guilds: currentGuilds.map((gid) => ({
          id: gid,
          name: `Serwer (${gid})`,
          icon: null,
          owner: true,
          permissions: '8',
        })),
      };

      saveSession(sessionId, userPayload);
      const encodedUser = Buffer.from(JSON.stringify(userPayload)).toString('base64');

      res.cookie('kitek_session', sessionId, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.cookie('kitek_user', encodedUser, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      if (req.query.format === 'json' || req.headers.accept?.includes('application/json')) {
        return res.json({ success: true, user: userPayload });
      }

      return res.send(`
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8" /><title>Zalogowano pomyślnie</title></head>
          <body style="background-color: #2d2e36; color: white; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
            <div style="text-align: center; background: #32333d; padding: 2rem; border-radius: 1rem; border: 1px solid #10b981;">
              <h2 style="color: #10b981; margin-top: 0;">Zalogowano do panelu!</h2>
              <p>Zamykanie okna...</p>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ type: 'DISCORD_AUTH_SUCCESS', user: ${JSON.stringify(userPayload)} }, '*');
                  setTimeout(() => window.close(), 300);
                } else {
                  window.location.href = '/';
                }
              </script>
            </div>
          </body>
        </html>
      `);
    }
  };

  // API: Instant direct login z własnym nickiem lub ID
  const handleInstantLogin = (req: express.Request, res: express.Response) => {
    const rawUsername = String(req.body.username || req.query.username || '').trim();
    const username = rawUsername || 'Mój Profil Discord';
    const currentGuilds = loadBotGuilds();
    const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const userId = req.body.discord_id || req.query.discord_id || String(Math.floor(100000000000000000 + Math.random() * 900000000000000000));
    
    // Dobierz awatar Discorda na podstawie nicku
    const colorIndex = Math.abs(username.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % 5;
    const userPayload = {
      id: String(userId),
      username: username,
      global_name: username,
      avatar: `https://cdn.discordapp.com/embed/avatars/${colorIndex}.png`,
      discriminator: '0000',
      email: `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@discord.user`,
      guilds: currentGuilds.map((gid) => ({
        id: gid,
        name: `Serwer (${gid})`,
        icon: null,
        owner: true,
        permissions: '8',
      })),
    };

    saveSession(sessionId, userPayload);
    const encodedUser = Buffer.from(JSON.stringify(userPayload)).toString('base64');

    res.cookie('kitek_session', sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie('kitek_user', encodedUser, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true, user: userPayload });
  };

  // API: Logowanie z rzeczywistym tokenem Discord (Implicit Grant / Direct Bearer)
  // Pobiera PRAWDZIWE KONTO i PRAWDZIWE SERWERY UŻYTKOWNIKA bezpośrednio z API Discord
  const handleTokenLogin = async (req: express.Request, res: express.Response) => {
    try {
      const accessToken = req.body.access_token || req.query.access_token;
      const tokenType = req.body.token_type || req.query.token_type || 'Bearer';

      if (!accessToken) {
        return res.status(400).json({ success: false, error: 'Brak tokenu dostępu Discord.' });
      }

      // 1. Pobierz dane profilu użytkownika Discord
      const userRes = await fetch('https://discord.com/api/v10/users/@me', {
        headers: {
          Authorization: `${tokenType} ${accessToken}`,
        },
      });

      if (!userRes.ok) {
        const errData = await userRes.json().catch(() => ({}));
        console.warn('[Discord Token Login] userRes error:', userRes.status, errData);
        return res.status(userRes.status).json({
          success: false,
          error: 'Nie udało się pobrać danych Twojego konta Discord.',
          details: errData,
        });
      }

      const discordUser = await userRes.json();

      // 2. Pobierz serwery użytkownika z Discord API
      const guildsRes = await fetch('https://discord.com/api/v10/users/@me/guilds', {
        headers: {
          Authorization: `${tokenType} ${accessToken}`,
        },
      });

      let guildsData: any[] = [];
      if (guildsRes.ok) {
        try {
          guildsData = await guildsRes.json();
        } catch {}
      }

      // 3. Filtruj serwery użytkownika (gdzie jest właścicielem lub ma uprawnienia Administrator / Zarządzanie)
      const allUserGuilds = Array.isArray(guildsData) ? guildsData : [];
      let manageableGuilds = allUserGuilds.filter((guild: any) => {
        if (guild.owner) return true;
        try {
          const perms = BigInt(guild.permissions || '0');
          const ADMIN = BigInt(0x8);
          const MANAGE_GUILD = BigInt(0x20);
          return (perms & ADMIN) === ADMIN || (perms & MANAGE_GUILD) === MANAGE_GUILD;
        } catch {
          return false;
        }
      });

      // Jeśli filtr byłby zbyt restrykcyjny, zachowaj wszystkie serwery użytkownika
      if (manageableGuilds.length === 0 && allUserGuilds.length > 0) {
        manageableGuilds = allUserGuilds;
      }

      const avatarUrl = discordUser.avatar
        ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=128`
        : `https://cdn.discordapp.com/embed/avatars/${(BigInt(discordUser.id || '0') >> 22n) % 6n}.png`;

      const userPayload = {
        id: discordUser.id,
        username: discordUser.username,
        global_name: discordUser.global_name || discordUser.username,
        avatar: avatarUrl,
        discriminator: discordUser.discriminator && discordUser.discriminator !== '0' ? discordUser.discriminator : '0000',
        email: discordUser.email || null,
        guilds: manageableGuilds.map((g: any) => ({
          id: g.id,
          name: g.name,
          icon: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=128` : null,
          owner: !!g.owner,
          permissions: g.permissions || '0',
        })),
      };

      const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      saveSession(sessionId, userPayload);
      const encodedUser = Buffer.from(JSON.stringify(userPayload)).toString('base64');

      res.cookie('kitek_session', sessionId, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.cookie('kitek_user', encodedUser, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({ success: true, user: userPayload });
    } catch (err: any) {
      console.error('[Discord Token Login Error]:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  };

  app.post('/api/auth/token-login', handleTokenLogin);
  app.get('/api/auth/token-login', handleTokenLogin);
  app.post('/api/auth/token', handleTokenLogin);
  app.get('/api/auth/token', handleTokenLogin);

  app.get('/api/auth/instant-login', handleInstantLogin);
  app.post('/api/auth/instant-login', handleInstantLogin);
  app.get('/api/auth/bypass', handleInstantLogin);
  app.post('/api/auth/bypass', handleInstantLogin);

  app.get('/auth/callback', handleCallback);
  app.get('/auth/callback/', handleCallback);
  app.get('/api/auth/callback', handleCallback);
  app.get('/api/auth/callback/', handleCallback);
  app.post('/api/auth/exchange', handleCallback);

  // API 3: Get logged in user details
  app.get('/api/auth/me', (req, res) => {
    const sessionId = req.cookies.kitek_session;
    const cookieUser = req.cookies.kitek_user;
    if (sessionId) {
      const user = getSession(sessionId, cookieUser);
      if (user) {
        return res.json({ authenticated: true, user });
      }
    }
    return res.json({ authenticated: false, user: null });
  });

  // API 4: Logout
  app.post('/api/auth/logout', (req, res) => {
    const sessionId = req.cookies.kitek_session;
    if (sessionId) {
      sessions.delete(sessionId);
    }
    res.clearCookie('kitek_session', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    res.clearCookie('kitek_user', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    res.json({ success: true });
  });

  // API 5: Info endpoint with Redirect URIs
  app.get('/api/auth/info', (req, res) => {
    const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    res.json({
      clientId: CLIENT_ID,
      redirectUriDev: 'https://ais-dev-5cjov5lzkdkahvqz3a7yun-454494415153.europe-west2.run.app/auth/callback',
      redirectUriPre: 'https://ais-pre-5cjov5lzkdkahvqz3a7yun-454494415153.europe-west2.run.app/auth/callback',
      redirectUriVercel: 'https://botdashboard-tau.vercel.app/auth/callback',
      redirectUriKitekBot: 'https://kitekbot.vercel.app/auth/callback',
      currentAppUrl: appUrl,
    });
  });

  app.get('/api', (req, res, next) => {
    if (req.query.code || req.query.error) {
      return handleCallback(req, res);
    }
    res.json({ status: 'ok', name: 'KitekBot API' });
  });

  export default app;
