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

const SERWERY_DIR = path.join(process.cwd(), 'Serwery');

// Ensure Serwery/ directory exists
if (!fs.existsSync(SERWERY_DIR)) {
  fs.mkdirSync(SERWERY_DIR, { recursive: true });
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
  const filePath = path.join(SERWERY_DIR, `${guildId}.json`);
  if (fs.existsSync(filePath)) {
    try {
      const data = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(data);
      // Merge with default values in case new fields are added
      return { ...getDefaultConfig(guildId, guildName), ...parsed, guildId };
    } catch (err) {
      console.error(`Błąd odczytu konfiguracji dla serwera ${guildId}:`, err);
    }
  }
  // If doesn't exist, create default
  const defaultConf = getDefaultConfig(guildId, guildName);
  saveGuildConfig(guildId, defaultConf);
  return defaultConf;
}

export function saveGuildConfig(guildId: string, config: Partial<GuildConfig>): GuildConfig {
  const filePath = path.join(SERWERY_DIR, `${guildId}.json`);
  const current = fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    : getDefaultConfig(guildId);

  const updated: GuildConfig = {
    ...current,
    ...config,
    guildId,
    updatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf-8');
  return updated;
}

export function getAllConfigs(): GuildConfig[] {
  try {
    const files = fs.readdirSync(SERWERY_DIR);
    return files
      .filter((f) => f.endsWith('.json'))
      .map((f) => {
        try {
          const content = fs.readFileSync(path.join(SERWERY_DIR, f), 'utf-8');
          return JSON.parse(content);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}
