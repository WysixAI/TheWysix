import fs from 'fs';
import path from 'path';

export interface GuildConfig {
  guildId: string;
  guildName?: string;
  prefix: string;
  language: string;
  welcome: {
    enabled: boolean;
    channelId: string | null;
    message: string;
  };
  goodbye: {
    enabled: boolean;
    channelId: string | null;
    message: string;
  };
  moderation: {
    antiLink: boolean;
    antiSpam: boolean;
    logChannelId: string | null;
    muteRoleId: string | null;
  };
  autoRole: {
    enabled: boolean;
    roleId: string | null;
  };
  economy: {
    enabled: boolean;
    currencyName: string;
    dailyAmount: number;
  };
  embedColor: string;
  customSettings?: Record<string, any>;
  updatedAt: string;
}

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const SERWERY_DIR = isServerless ? path.join('/tmp', 'Serwery') : path.join(process.cwd(), 'Serwery');

// In-memory cache fallback to guarantee 100% uptime on serverless environments
const memoryConfigs = new Map<string, GuildConfig>();

// Ensure Serwery/ directory exists safely without crashing on read-only environments
try {
  if (!fs.existsSync(SERWERY_DIR)) {
    fs.mkdirSync(SERWERY_DIR, { recursive: true });
  }
} catch (e: any) {
  console.warn('[ConfigManager] Read-only filesystem detected, running with in-memory configs:', e.message);
}

export function getDefaultConfig(guildId: string, guildName?: string): GuildConfig {
  return {
    guildId,
    guildName: guildName || `Serwer ${guildId}`,
    prefix: '!',
    language: 'pl',
    welcome: {
      enabled: false,
      channelId: null,
      message: 'Witaj {user} na serwerze {server}! Życzymy miłego pobytu 🎉',
    },
    goodbye: {
      enabled: false,
      channelId: null,
      message: '{user} opuścił nasz serwer. Żegnaj! 👋',
    },
    moderation: {
      antiLink: false,
      antiSpam: false,
      logChannelId: null,
      muteRoleId: null,
    },
    autoRole: {
      enabled: false,
      roleId: null,
    },
    economy: {
      enabled: true,
      currencyName: 'Monety',
      dailyAmount: 100,
    },
    embedColor: '#5865F2',
    updatedAt: new Date().toISOString(),
  };
}

export function getGuildConfig(guildId: string, guildName?: string): GuildConfig {
  if (memoryConfigs.has(guildId)) {
    return memoryConfigs.get(guildId)!;
  }

  const filePath = path.join(SERWERY_DIR, `${guildId}.json`);
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(data);
      const full = { ...getDefaultConfig(guildId, guildName), ...parsed, guildId };
      memoryConfigs.set(guildId, full);
      return full;
    }
  } catch (err) {
    console.warn(`Błąd odczytu konfiguracji dla serwera ${guildId}:`, err);
  }

  // If doesn't exist, create default
  const defaultConf = getDefaultConfig(guildId, guildName);
  saveGuildConfig(guildId, defaultConf);
  return defaultConf;
}

export function saveGuildConfig(guildId: string, config: Partial<GuildConfig>): GuildConfig {
  const current = memoryConfigs.get(guildId) || getDefaultConfig(guildId);

  const updated: GuildConfig = {
    ...current,
    ...config,
    guildId,
    updatedAt: new Date().toISOString(),
  };

  memoryConfigs.set(guildId, updated);

  try {
    const filePath = path.join(SERWERY_DIR, `${guildId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (e: any) {
    // Non-fatal on serverless
    console.warn(`[ConfigManager] Zapisano w pamięci RAM (błąd zapisu pliku ${guildId}):`, e.message);
  }

  return updated;
}

export function getAllConfigs(): GuildConfig[] {
  const result: GuildConfig[] = Array.from(memoryConfigs.values());
  try {
    if (fs.existsSync(SERWERY_DIR)) {
      const files = fs.readdirSync(SERWERY_DIR);
      for (const f of files) {
        if (!f.endsWith('.json')) continue;
        const gId = f.replace('.json', '');
        if (memoryConfigs.has(gId)) continue;
        try {
          const content = fs.readFileSync(path.join(SERWERY_DIR, f), 'utf-8');
          const parsed = JSON.parse(content);
          if (parsed && parsed.guildId) {
            result.push(parsed);
          }
        } catch {}
      }
    }
  } catch {}
  return result;
}
