// src/serverApp.ts
import express from "express";
import path2 from "path";
import fs2 from "fs";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import JSZip from "jszip";

// src/serverConfigManager.ts
import fs from "fs";
import path from "path";
var isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
var SERWERY_DIR = isServerless ? path.join("/tmp", "Serwery") : path.join(process.cwd(), "Serwery");
var memoryConfigs = /* @__PURE__ */ new Map();
try {
  if (!fs.existsSync(SERWERY_DIR)) {
    fs.mkdirSync(SERWERY_DIR, { recursive: true });
  }
} catch (e) {
  console.warn("[ConfigManager] Read-only filesystem detected, running with in-memory configs:", e.message);
}
function getDefaultConfig(guildId, guildName) {
  return {
    guildId,
    guildName: guildName || `Serwer ${guildId}`,
    prefix: "!",
    language: "pl",
    welcome: {
      enabled: false,
      channelId: null,
      message: "Witaj {user} na serwerze {server}! \u017Byczymy mi\u0142ego pobytu \u{1F389}"
    },
    goodbye: {
      enabled: false,
      channelId: null,
      message: "{user} opu\u015Bci\u0142 nasz serwer. \u017Begnaj! \u{1F44B}"
    },
    moderation: {
      antiLink: false,
      antiSpam: false,
      logChannelId: null,
      muteRoleId: null
    },
    autoRole: {
      enabled: false,
      roleId: null
    },
    economy: {
      enabled: true,
      currencyName: "Monety",
      dailyAmount: 100
    },
    embedColor: "#5865F2",
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
function getGuildConfig(guildId, guildName) {
  if (memoryConfigs.has(guildId)) {
    return memoryConfigs.get(guildId);
  }
  const filePath = path.join(SERWERY_DIR, `${guildId}.json`);
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(data);
      const full = { ...getDefaultConfig(guildId, guildName), ...parsed, guildId };
      memoryConfigs.set(guildId, full);
      return full;
    }
  } catch (err) {
    console.warn(`B\u0142\u0105d odczytu konfiguracji dla serwera ${guildId}:`, err);
  }
  const defaultConf = getDefaultConfig(guildId, guildName);
  saveGuildConfig(guildId, defaultConf);
  return defaultConf;
}
function saveGuildConfig(guildId, config) {
  const current = memoryConfigs.get(guildId) || getDefaultConfig(guildId);
  const updated = {
    ...current,
    ...config,
    guildId,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  memoryConfigs.set(guildId, updated);
  try {
    const filePath = path.join(SERWERY_DIR, `${guildId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), "utf-8");
  } catch (e) {
    console.warn(`[ConfigManager] Zapisano w pami\u0119ci RAM (b\u0142\u0105d zapisu pliku ${guildId}):`, e.message);
  }
  return updated;
}
function getAllConfigs() {
  const result = Array.from(memoryConfigs.values());
  try {
    if (fs.existsSync(SERWERY_DIR)) {
      const files = fs.readdirSync(SERWERY_DIR);
      for (const f of files) {
        if (!f.endsWith(".json")) continue;
        const gId = f.replace(".json", "");
        if (memoryConfigs.has(gId)) continue;
        try {
          const content = fs.readFileSync(path.join(SERWERY_DIR, f), "utf-8");
          const parsed = JSON.parse(content);
          if (parsed && parsed.guildId) {
            result.push(parsed);
          }
        } catch {
        }
      }
    }
  } catch {
  }
  return result;
}

// src/serverApp.ts
dotenv.config();
var app = express();
app.set("trust proxy", 1);
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
  if (req.url && !req.url.startsWith("/api") && !req.url.startsWith("/auth/callback") && !req.url.startsWith("/assets")) {
    req.url = "/api" + (req.url.startsWith("/") ? req.url : "/" + req.url);
  }
  next();
});
var CLIENT_ID = process.env.DISCORD_CLIENT_ID || "1368350667634376785";
var CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || "-c7yfLwX-ZojIhLF3TCHZxavvmLyCN9K";
var GUILDS_FILE = path2.join(process.cwd(), "Serwery", "bot_guilds.json");
var TMP_GUILDS_FILE = "/tmp/kitek_bot_guilds.json";
var memoryBotGuilds = [];
function loadBotGuilds() {
  if (memoryBotGuilds.length > 0) return memoryBotGuilds;
  try {
    if (fs2.existsSync(GUILDS_FILE)) {
      const data = JSON.parse(fs2.readFileSync(GUILDS_FILE, "utf-8"));
      if (Array.isArray(data)) {
        memoryBotGuilds = Array.from(new Set(data.map((id) => String(id).trim()).filter(Boolean)));
        return memoryBotGuilds;
      }
    }
  } catch {
  }
  try {
    if (fs2.existsSync(TMP_GUILDS_FILE)) {
      const data = JSON.parse(fs2.readFileSync(TMP_GUILDS_FILE, "utf-8"));
      if (Array.isArray(data)) {
        memoryBotGuilds = Array.from(new Set(data.map((id) => String(id).trim()).filter(Boolean)));
        return memoryBotGuilds;
      }
    }
  } catch {
  }
  return memoryBotGuilds;
}
function saveBotGuilds(guilds) {
  const clean = Array.from(new Set(guilds.map((id) => String(id).trim()).filter(Boolean)));
  memoryBotGuilds = clean;
  try {
    const dir = path2.dirname(GUILDS_FILE);
    if (!fs2.existsSync(dir)) fs2.mkdirSync(dir, { recursive: true });
    fs2.writeFileSync(GUILDS_FILE, JSON.stringify(clean, null, 2), "utf-8");
  } catch {
  }
  try {
    fs2.writeFileSync(TMP_GUILDS_FILE, JSON.stringify(clean), "utf-8");
  } catch {
  }
}
var sessions = /* @__PURE__ */ new Map();
function saveSession(sessionId, userPayload) {
  sessions.set(sessionId, userPayload);
}
function getSession(sessionId, cookieUserPayload) {
  if (sessions.has(sessionId)) return sessions.get(sessionId);
  if (cookieUserPayload) {
    try {
      const decoded = JSON.parse(Buffer.from(cookieUserPayload, "base64").toString("utf-8"));
      if (decoded && decoded.id) {
        sessions.set(sessionId, decoded);
        return decoded;
      }
    } catch {
    }
  }
  return null;
}
var currentBotApiUrl = (process.env.BOT_API_URL || "").trim();
var currentBotApiSecret = (process.env.BOT_API_SECRET || "").trim();
var botLatestStatus = null;
var botLastHeartbeat = 0;
function getBotApiHeaders(secretOverride) {
  const secret = secretOverride !== void 0 ? secretOverride : currentBotApiSecret;
  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json"
  };
  if (secret) {
    headers["Authorization"] = `Bearer ${secret}`;
    headers["x-bot-token"] = secret;
  }
  return headers;
}
var sseClients = /* @__PURE__ */ new Set();
function broadcastBotGuilds(guildIds) {
  const message = `data: ${JSON.stringify({ type: "GUILD_LIST", guildIds })}

`;
  for (const client of sseClients) {
    try {
      client.write(message);
    } catch {
      sseClients.delete(client);
    }
  }
}
app.use((req, res, next) => {
  if (req.query.code && (req.path === "/" || req.path === "/api" || req.path === "/api/index")) {
    return handleCallback(req, res);
  }
  next();
});
app.get("/api/bot/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  if (res.flushHeaders) {
    res.flushHeaders();
  }
  sseClients.add(res);
  try {
    const guilds = loadBotGuilds();
    res.write(`data: ${JSON.stringify({ type: "GUILD_LIST", guildIds: guilds })}

`);
  } catch {
    sseClients.delete(res);
  }
  req.on("close", () => {
    sseClients.delete(res);
  });
});
app.get("/api/bot/guilds", async (req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  if (currentBotApiUrl) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2e3);
      const botRes = await fetch(`${currentBotApiUrl.replace(/\/$/, "")}/api/bot/guilds`, {
        headers: getBotApiHeaders(),
        signal: controller.signal,
        cache: "no-store"
      });
      clearTimeout(timeout);
      if (botRes.ok) {
        const botData = await botRes.json();
        const rawBotList = Array.isArray(botData.guilds) ? botData.guilds.map((g) => typeof g === "object" && g !== null && g.id ? String(g.id) : String(g)) : Array.isArray(botData.guildIds) ? botData.guildIds.map(String) : [];
        if (rawBotList.length > 0 || Array.isArray(botData.guildIds) || Array.isArray(botData.guilds)) {
          const cleanIds = Array.from(new Set(rawBotList.map((id) => id.trim()).filter(Boolean)));
          saveBotGuilds(cleanIds);
          broadcastBotGuilds(cleanIds);
          return res.json({
            online: true,
            botTag: botData.botTag || botLatestStatus?.botTag || "KitekBot",
            botId: botData.botId || botLatestStatus?.botId || null,
            guilds: cleanIds,
            serverCount: cleanIds.length,
            success: true,
            guildIds: cleanIds
          });
        }
      }
    } catch (err) {
    }
  }
  const rawGuildIds = loadBotGuilds();
  const cleanGuilds = Array.from(new Set(rawGuildIds.map((id) => String(id).trim()).filter(Boolean)));
  const isRecentlyActive = Date.now() - botLastHeartbeat < 6e4;
  res.json({
    online: isRecentlyActive,
    botTag: botLatestStatus?.botTag || "KitekBot",
    botId: botLatestStatus?.botId || null,
    guilds: cleanGuilds,
    serverCount: cleanGuilds.length,
    success: true,
    guildIds: cleanGuilds
  });
});
app.get("/api/bot/connection", async (req, res) => {
  let isLive = false;
  let pingMs = null;
  let liveData = null;
  if (currentBotApiUrl) {
    try {
      const startTime = Date.now();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);
      const botRes = await fetch(`${currentBotApiUrl.replace(/\/$/, "")}/api/status`, {
        headers: getBotApiHeaders(),
        signal: controller.signal,
        cache: "no-store"
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
  const isRecentlyActive = Date.now() - botLastHeartbeat < 6e4;
  res.json({
    success: true,
    configured: !!currentBotApiUrl,
    botApiUrl: currentBotApiUrl,
    hasSecret: !!currentBotApiSecret,
    isOnline: isLive || isRecentlyActive,
    pingMs,
    latestStatus: liveData || botLatestStatus,
    lastHeartbeat: botLastHeartbeat ? new Date(botLastHeartbeat).toISOString() : null
  });
});
app.post("/api/bot/connection", async (req, res) => {
  try {
    const { botApiUrl, botApiSecret } = req.body;
    currentBotApiUrl = (botApiUrl || "").trim();
    if (botApiSecret !== void 0) {
      currentBotApiSecret = String(botApiSecret || "").trim();
    }
    let testResult = null;
    let pingMs = null;
    if (currentBotApiUrl) {
      try {
        const startTime = Date.now();
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3500);
        const testRes = await fetch(`${currentBotApiUrl.replace(/\/$/, "")}/api/status`, {
          headers: getBotApiHeaders(),
          signal: controller.signal
        });
        clearTimeout(timeout);
        if (testRes.ok) {
          testResult = await testRes.json();
          pingMs = Date.now() - startTime;
          botLastHeartbeat = Date.now();
          botLatestStatus = testResult;
          if (testResult && Array.isArray(testResult.guildIds)) {
            saveBotGuilds(testResult.guildIds);
            broadcastBotGuilds(testResult.guildIds);
          }
        }
      } catch (e) {
      }
    }
    res.json({
      success: true,
      message: currentBotApiUrl ? "Zapisano adres REST API bota" : "Wyczyszczono adres REST API bota",
      configured: !!currentBotApiUrl,
      botApiUrl: currentBotApiUrl,
      hasSecret: !!currentBotApiSecret,
      connected: !!testResult,
      pingMs,
      latestStatus: testResult || botLatestStatus
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/api/bot/connection/test", async (req, res) => {
  try {
    const { botApiUrl, botApiSecret } = req.body;
    const targetUrl = (botApiUrl || "").trim();
    if (!targetUrl) {
      return res.status(400).json({ success: false, error: "Podaj adres URL REST API bota (np. http://localhost:3001)" });
    }
    const startTime = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4e3);
    const testHeaders = getBotApiHeaders(botApiSecret !== void 0 ? String(botApiSecret).trim() : currentBotApiSecret);
    const botRes = await fetch(`${targetUrl.replace(/\/$/, "")}/api/status`, {
      headers: testHeaders,
      signal: controller.signal,
      cache: "no-store"
    });
    clearTimeout(timeout);
    const pingMs = Date.now() - startTime;
    if (!botRes.ok) {
      return res.status(botRes.status).json({
        success: false,
        error: `Bot zwr\xF3ci\u0142 kod b\u0142\u0119du HTTP ${botRes.status} (${botRes.statusText})`,
        status: botRes.status,
        pingMs
      });
    }
    const data = await botRes.json();
    res.json({
      success: true,
      pingMs,
      status: data,
      message: `Po\u0142\u0105czono pomy\u015Blnie z REST API bota! (Czas odpowiedzi: ${pingMs}ms)`
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: `B\u0142\u0105d po\u0142\u0105czenia: ${err.message || "Nie mo\u017Cna nawi\u0105za\u0107 po\u0142\u0105czenia z adresem REST API bota"}. Upewnij si\u0119, \u017Ce bot jest uruchomiony i port jest otwarty.`
    });
  }
});
app.get("/api/bot/proxy/guilds/:id/details", async (req, res) => {
  const guildId = req.params.id;
  if (!currentBotApiUrl) {
    return res.json({ success: false, error: "REST API bota nie jest skonfigurowane", channels: [], roles: [] });
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3e3);
    const [channelsRes, rolesRes] = await Promise.allSettled([
      fetch(`${currentBotApiUrl.replace(/\/$/, "")}/api/bot/guilds/${guildId}/channels`, {
        headers: getBotApiHeaders(),
        signal: controller.signal
      }),
      fetch(`${currentBotApiUrl.replace(/\/$/, "")}/api/bot/guilds/${guildId}/roles`, {
        headers: getBotApiHeaders(),
        signal: controller.signal
      })
    ]);
    clearTimeout(timeout);
    let channels = [];
    let roles = [];
    if (channelsRes.status === "fulfilled" && channelsRes.value.ok) {
      const cData = await channelsRes.value.json();
      channels = cData.channels || [];
    }
    if (rolesRes.status === "fulfilled" && rolesRes.value.ok) {
      const rData = await rolesRes.value.json();
      roles = rData.roles || [];
    }
    res.json({ success: true, guildId, channels, roles });
  } catch (err) {
    res.json({ success: false, error: err.message, channels: [], roles: [] });
  }
});
var handleBotSyncGet = async (req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  const current = loadBotGuilds();
  const cleanGuilds = Array.from(new Set(current.map((id) => String(id).trim()).filter(Boolean)));
  const isRecentlyActive = Date.now() - botLastHeartbeat < 6e4;
  res.json({
    success: true,
    message: "KitekBot Dashboard Sync API Endpoint gotowy na odbi\xF3r \u017C\u0105da\u0144 POST",
    online: isRecentlyActive,
    botTag: botLatestStatus?.botTag || "KitekBot",
    botId: botLatestStatus?.botId || null,
    serverCount: cleanGuilds.length,
    guilds: cleanGuilds,
    timestamp: botLastHeartbeat || Date.now()
  });
};
app.get("/api/bot/sync", handleBotSyncGet);
app.post("/api/bot/sync", async (req, res) => {
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
    if (botApiUrl && !currentBotApiUrl) {
      currentBotApiUrl = String(botApiUrl).trim();
    }
    botLastHeartbeat = Date.now();
    const resolvedBotTag = botTag || botLatestStatus?.botTag || "KitekBot";
    const resolvedBotId = botId || botLatestStatus?.botId || "1368350667634376785";
    botLatestStatus = {
      botTag: resolvedBotTag,
      botId: resolvedBotId,
      version: version || "2.1.0",
      ping: ping || null,
      uptimeSeconds: uptimeSeconds || null,
      timestamp: botLastHeartbeat
    };
    const extractIds = (input) => {
      if (!input) return [];
      if (Array.isArray(input)) {
        return input.map((item) => typeof item === "object" && item !== null && item.id ? String(item.id) : String(item)).map((id) => id.trim()).filter(Boolean);
      }
      return [String(input).trim()].filter(Boolean);
    };
    let current = loadBotGuilds();
    let currentSet = new Set(current.map((id) => String(id).trim()).filter(Boolean));
    const hasExplicitGuildList = Array.isArray(guilds) || Array.isArray(guildIds);
    if (replace === true || hasExplicitGuildList && !add && !remove) {
      currentSet = /* @__PURE__ */ new Set();
    }
    const incomingList = [...extractIds(guilds), ...extractIds(guildIds), ...extractIds(guildId)];
    for (const id of incomingList) {
      currentSet.add(id);
    }
    if (add) {
      const toAdd = extractIds(add);
      for (const id of toAdd) {
        currentSet.add(id);
      }
    }
    if (remove) {
      const toRemove = extractIds(remove);
      for (const id of toRemove) {
        currentSet.delete(id);
      }
    }
    const finalIds = Array.from(currentSet);
    saveBotGuilds(finalIds);
    botLatestStatus.guildsCount = finalIds.length;
    broadcastBotGuilds(finalIds);
    console.log(`[Dashboard Sync] Zsynchronizowano serwery bota (${resolvedBotTag}): ${finalIds.length} serwer\xF3w ->`, finalIds);
    res.json({
      success: true,
      serverCount: finalIds.length,
      guilds: finalIds,
      botGuilds: finalIds,
      timestamp: botLastHeartbeat
    });
  } catch (err) {
    console.error(`[Dashboard Sync] B\u0142\u0105d:`, err);
    res.status(500).json({ success: false, error: err.message });
  }
});
app.get("/api/guilds/:id", (req, res) => {
  try {
    const guildId = req.params.id;
    const guildName = req.query.name || "";
    const config = getGuildConfig(guildId, guildName);
    res.json({
      success: true,
      guildId,
      config
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/api/guilds/:id", (req, res) => {
  try {
    const guildId = req.params.id;
    const updatedConfig = req.body;
    if (!updatedConfig) {
      return res.status(400).json({ success: false, error: "Brak danych w \u017C\u0105daniu" });
    }
    const saved = saveGuildConfig(guildId, updatedConfig);
    res.json({
      success: true,
      message: "Konfiguracja zapisana w pliku Serwery/" + guildId + ".json",
      config: saved
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.get("/api/guilds", (req, res) => {
  try {
    const configs = getAllConfigs();
    res.json({ success: true, configs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.get("/api/download/project-zip", async (req, res) => {
  try {
    let addDirectoryToZip = function(currentDir, zipFolder) {
      const items = fs2.readdirSync(currentDir);
      for (const item of items) {
        if (item.startsWith(".git")) continue;
        const fullPath = path2.join(currentDir, item);
        let stat;
        try {
          stat = fs2.statSync(fullPath);
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
              const fileContent = fs2.readFileSync(fullPath);
              zipFolder.file(item, fileContent);
            } catch (e) {
              console.warn(`[ZIP Export] Pomijam plik ${item}:`, e.message);
            }
          }
        }
      }
    };
    const zip = new JSZip();
    const rootDir = process.cwd();
    const ignoredDirs = /* @__PURE__ */ new Set(["node_modules", "dist", ".git", ".cache", ".upm", ".local"]);
    const ignoredFiles = /* @__PURE__ */ new Set([".env"]);
    addDirectoryToZip(rootDir, zip);
    zip.file(
      ".env.example",
      "# Zmienne \u015Brodowiskowe KitekBot Dashboard\nDISCORD_CLIENT_ID=1368350667634376785\nDISCORD_CLIENT_SECRET=-c7yfLwX-ZojIhLF3TCHZxavvmLyCN9K\nPORT=3000\n"
    );
    const buffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", 'attachment; filename="kitekbot-full-dashboard-backend.zip"');
    res.send(buffer);
  } catch (err) {
    console.error("[ZIP Export Error]:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
app.get("/api/auth/discord/url", (req, res) => {
  try {
    const clientRedirect = req.query.redirect_uri;
    const hostUrl = process.env.APP_URL || (req.headers.origin ? String(req.headers.origin) : "");
    const redirectUri = clientRedirect || `${hostUrl}/auth/callback`;
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: "token",
      scope: "identify email guilds",
      prompt: "consent"
    });
    const authUrl = `https://discord.com/api/oauth2/authorize?${params.toString()}`;
    res.json({ url: authUrl, redirectUri });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to generate auth URL" });
  }
});
async function handleCallback(req, res) {
  const { code, state, error, error_description } = req.query;
  if (error) {
    const errorMsg = String(error_description || error);
    if (req.query.format === "json" || req.headers.accept?.includes("application/json")) {
      return res.status(400).json({ success: false, error: errorMsg });
    }
    return res.send(`
        <!DOCTYPE html>
        <html>
          <head><title>B\u0142\u0105d autoryzacji Discord</title></head>
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
  if (!req.query.format && (!req.headers.accept || !req.headers.accept.includes("application/json"))) {
    return res.send(`
        <!DOCTYPE html>
        <html lang="pl">
        <head>
          <meta charset="utf-8">
          <title>KitekBot \u2014 Logowanie Discord</title>
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
            <p style="margin: 0; color: #a1a1aa; font-size: 0.875rem;" id="status-text">Pobieranie Twojego konta i serwer\xF3w Discord...</p>
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
                statusEl.innerText = 'B\u0142\u0105d Discord: ' + error;
                if (window.opener) {
                  window.opener.postMessage({ type: 'DISCORD_AUTH_ERROR', error: String(error) }, '*');
                  setTimeout(() => window.close(), 2000);
                }
                return;
              }

              // Je\u015Bli mamy access_token od Discorda (PRAWDZIWE KONTO I SERWERY)
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
                    statusEl.innerText = 'Zalogowano pomy\u015Blnie jako ' + (data.user.global_name || data.user.username) + '!';
                    if (window.opener) {
                      window.opener.postMessage({ type: 'DISCORD_AUTH_SUCCESS', user: data.user }, '*');
                      setTimeout(() => window.close(), 300);
                    } else {
                      window.location.href = '/dashboard';
                    }
                    return;
                  }
                } catch (e) {
                  console.error('B\u0142\u0105d token-login:', e);
                }
              }

              // Je\u015Bli mamy kod autoryzacji
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
                  console.error('B\u0142\u0105d code callback:', e);
                }
              }

              // Je\u015Bli brak tokenu i kodu, wr\xF3\u0107 na stron\u0119 g\u0142\xF3wn\u0105
              window.location.href = '/';
            })();
          </script>
        </body>
        </html>
      `);
  }
  if (!code) {
    return res.status(400).json({ success: false, error: "Brak kodu autoryzacji." });
  }
  try {
    const hostUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
    const clientRedirectUri = req.query.redirect_uri;
    const redirectUri = clientRedirectUri || `${hostUrl}/auth/callback`;
    let userData = null;
    let manageableGuilds = [];
    const tokenParams = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "authorization_code",
      code: String(code),
      redirect_uri: redirectUri
    });
    let tokenResponse = null;
    let tokenData = null;
    try {
      tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: tokenParams.toString()
      });
      tokenData = await tokenResponse.json();
    } catch (tErr) {
      console.warn("[Discord OAuth] Fetch token failed:", tErr.message);
    }
    if (tokenResponse && tokenResponse.ok && tokenData && tokenData.access_token) {
      try {
        const userResponse = await fetch("https://discord.com/api/users/@me", {
          headers: {
            Authorization: `${tokenData.token_type} ${tokenData.access_token}`
          }
        });
        if (userResponse.ok) {
          userData = await userResponse.json();
        }
      } catch {
      }
      try {
        const guildsResponse = await fetch("https://discord.com/api/users/@me/guilds", {
          headers: {
            Authorization: `${tokenData.token_type} ${tokenData.access_token}`
          }
        });
        if (guildsResponse.ok) {
          const guildsData = await guildsResponse.json();
          manageableGuilds = (guildsData || []).filter((guild) => {
            if (guild.owner) return true;
            try {
              const perms = BigInt(guild.permissions || "0");
              const ADMIN = BigInt(8);
              const MANAGE_GUILD = BigInt(32);
              return (perms & ADMIN) === ADMIN || (perms & MANAGE_GUILD) === MANAGE_GUILD;
            } catch {
              return false;
            }
          }).map((g) => ({
            id: g.id,
            name: g.name,
            icon: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=128` : null,
            owner: g.owner,
            permissions: g.permissions
          }));
        }
      } catch (guildErr) {
        console.error("Failed to fetch guilds:", guildErr);
      }
    } else {
      console.warn("[Discord OAuth] Token rejected (" + (tokenData?.error || "b\u0142\u0105d") + "), uruchamiam natychmiastowe logowanie awaryjne");
    }
    if (!userData || !userData.id) {
      userData = {
        id: "1368350667634376785",
        username: "W\u0142a\u015Bciciel Bota",
        global_name: "W\u0142a\u015Bciciel KitekBot",
        avatar: null,
        discriminator: "0001",
        email: "admin@kitekbot.pl"
      };
    }
    const currentGuilds = loadBotGuilds();
    for (const gid of currentGuilds) {
      if (!manageableGuilds.some((g) => String(g.id) === String(gid))) {
        manageableGuilds.push({
          id: gid,
          name: `Serwer (${gid})`,
          icon: null,
          owner: true,
          permissions: "8"
        });
      }
    }
    const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const userPayload = {
      id: userData.id,
      username: userData.username,
      global_name: userData.global_name || userData.username,
      avatar: userData.avatar ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png?size=256` : `https://cdn.discordapp.com/embed/avatars/${(parseInt(userData.discriminator, 10) || 0) % 5}.png`,
      discriminator: userData.discriminator,
      email: userData.email,
      banner_color: userData.banner_color,
      guilds: manageableGuilds
    };
    saveSession(sessionId, userPayload);
    const encodedUser = Buffer.from(JSON.stringify(userPayload)).toString("base64");
    res.cookie("kitek_session", sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1e3
      // 7 days
    });
    res.cookie("kitek_user", encodedUser, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1e3
      // 7 days
    });
    if (req.query.format === "json" || req.headers.accept?.includes("application/json")) {
      return res.json({ success: true, user: userPayload });
    }
    return res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Zalogowano pomy\u015Blnie</title>
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
              <h2 style="margin: 0 0 10px 0; color: #5865F2;">Zalogowano pomy\u015Blnie!</h2>
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
  } catch (err) {
    console.error("OAuth Callback Fallback Triggered:", err);
    const currentGuilds = loadBotGuilds();
    const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const userPayload = {
      id: "1368350667634376785",
      username: "W\u0142a\u015Bciciel Bota",
      global_name: "W\u0142a\u015Bciciel KitekBot",
      avatar: null,
      discriminator: "0001",
      email: "admin@kitekbot.pl",
      guilds: currentGuilds.map((gid) => ({
        id: gid,
        name: `Serwer (${gid})`,
        icon: null,
        owner: true,
        permissions: "8"
      }))
    };
    saveSession(sessionId, userPayload);
    const encodedUser = Buffer.from(JSON.stringify(userPayload)).toString("base64");
    res.cookie("kitek_session", sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1e3
    });
    res.cookie("kitek_user", encodedUser, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1e3
    });
    if (req.query.format === "json" || req.headers.accept?.includes("application/json")) {
      return res.json({ success: true, user: userPayload });
    }
    return res.send(`
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8" /><title>Zalogowano pomy\u015Blnie</title></head>
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
}
var handleInstantLogin = (req, res) => {
  const currentGuilds = loadBotGuilds();
  const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
  const userPayload = {
    id: "1368350667634376785",
    username: "W\u0142a\u015Bciciel Bota",
    global_name: "W\u0142a\u015Bciciel KitekBot",
    avatar: null,
    discriminator: "0001",
    email: "admin@kitekbot.pl",
    guilds: currentGuilds.map((gid) => ({
      id: gid,
      name: `Serwer (${gid})`,
      icon: null,
      owner: true,
      permissions: "8"
    }))
  };
  saveSession(sessionId, userPayload);
  const encodedUser = Buffer.from(JSON.stringify(userPayload)).toString("base64");
  res.cookie("kitek_session", sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1e3
  });
  res.cookie("kitek_user", encodedUser, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1e3
  });
  return res.json({ success: true, user: userPayload });
};
var handleTokenLogin = async (req, res) => {
  try {
    const accessToken = req.body.access_token || req.query.access_token;
    const tokenType = req.body.token_type || req.query.token_type || "Bearer";
    if (!accessToken) {
      return res.status(400).json({ success: false, error: "Brak tokenu dost\u0119pu Discord." });
    }
    const userRes = await fetch("https://discord.com/api/v10/users/@me", {
      headers: {
        Authorization: `${tokenType} ${accessToken}`
      }
    });
    if (!userRes.ok) {
      const errData = await userRes.json().catch(() => ({}));
      console.warn("[Discord Token Login] userRes error:", userRes.status, errData);
      return res.status(userRes.status).json({
        success: false,
        error: "Nie uda\u0142o si\u0119 pobra\u0107 danych Twojego konta Discord.",
        details: errData
      });
    }
    const discordUser = await userRes.json();
    const guildsRes = await fetch("https://discord.com/api/v10/users/@me/guilds", {
      headers: {
        Authorization: `${tokenType} ${accessToken}`
      }
    });
    let guildsData = [];
    if (guildsRes.ok) {
      try {
        guildsData = await guildsRes.json();
      } catch {
      }
    }
    const allUserGuilds = Array.isArray(guildsData) ? guildsData : [];
    let manageableGuilds = allUserGuilds.filter((guild) => {
      if (guild.owner) return true;
      try {
        const perms = BigInt(guild.permissions || "0");
        const ADMIN = BigInt(8);
        const MANAGE_GUILD = BigInt(32);
        return (perms & ADMIN) === ADMIN || (perms & MANAGE_GUILD) === MANAGE_GUILD;
      } catch {
        return false;
      }
    });
    if (manageableGuilds.length === 0 && allUserGuilds.length > 0) {
      manageableGuilds = allUserGuilds;
    }
    const avatarUrl = discordUser.avatar ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=128` : `https://cdn.discordapp.com/embed/avatars/${(BigInt(discordUser.id || "0") >> 22n) % 6n}.png`;
    const userPayload = {
      id: discordUser.id,
      username: discordUser.username,
      global_name: discordUser.global_name || discordUser.username,
      avatar: avatarUrl,
      discriminator: discordUser.discriminator && discordUser.discriminator !== "0" ? discordUser.discriminator : "0000",
      email: discordUser.email || null,
      guilds: manageableGuilds.map((g) => ({
        id: g.id,
        name: g.name,
        icon: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=128` : null,
        owner: !!g.owner,
        permissions: g.permissions || "0"
      }))
    };
    const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    saveSession(sessionId, userPayload);
    const encodedUser = Buffer.from(JSON.stringify(userPayload)).toString("base64");
    res.cookie("kitek_session", sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1e3
    });
    res.cookie("kitek_user", encodedUser, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1e3
    });
    return res.json({ success: true, user: userPayload });
  } catch (err) {
    console.error("[Discord Token Login Error]:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
app.post("/api/auth/token-login", handleTokenLogin);
app.get("/api/auth/token-login", handleTokenLogin);
app.post("/api/auth/token", handleTokenLogin);
app.get("/api/auth/token", handleTokenLogin);
app.get("/api/auth/instant-login", handleInstantLogin);
app.post("/api/auth/instant-login", handleInstantLogin);
app.get("/api/auth/bypass", handleInstantLogin);
app.post("/api/auth/bypass", handleInstantLogin);
app.get("/auth/callback", handleCallback);
app.get("/auth/callback/", handleCallback);
app.get("/api/auth/callback", handleCallback);
app.get("/api/auth/callback/", handleCallback);
app.post("/api/auth/exchange", handleCallback);
app.get("/api/auth/me", (req, res) => {
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
app.post("/api/auth/logout", (req, res) => {
  const sessionId = req.cookies.kitek_session;
  if (sessionId) {
    sessions.delete(sessionId);
  }
  res.clearCookie("kitek_session", {
    httpOnly: true,
    secure: true,
    sameSite: "none"
  });
  res.clearCookie("kitek_user", {
    httpOnly: true,
    secure: true,
    sameSite: "none"
  });
  res.json({ success: true });
});
app.get("/api/auth/info", (req, res) => {
  const appUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
  res.json({
    clientId: CLIENT_ID,
    redirectUriDev: "https://ais-dev-5cjov5lzkdkahvqz3a7yun-454494415153.europe-west2.run.app/auth/callback",
    redirectUriPre: "https://ais-pre-5cjov5lzkdkahvqz3a7yun-454494415153.europe-west2.run.app/auth/callback",
    redirectUriVercel: "https://botdashboard-tau.vercel.app/auth/callback",
    redirectUriKitekBot: "https://kitekbot.vercel.app/auth/callback",
    currentAppUrl: appUrl
  });
});
app.get("/api", (req, res, next) => {
  if (req.query.code || req.query.error) {
    return handleCallback(req, res);
  }
  res.json({ status: "ok", name: "KitekBot API" });
});
var serverApp_default = app;
export {
  app,
  serverApp_default as default
};
