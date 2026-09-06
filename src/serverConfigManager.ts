import fs from 'fs';
import path from 'path';
import {
  WelcomeEmbedField,
  WelcomeButton,
  WelcomeEmbed,
  WelcomeConfig,
  GoodbyeConfig,
  GuildConfig,
  ActionFlow,
  TicketConfig,
  getDefaultWelcomeConfig,
  getDefaultGoodbyeConfig,
  getDefaultActionsConfig,
  getDefaultTicketConfig,
} from './types/guildConfig';

export type {
  WelcomeEmbedField,
  WelcomeButton,
  WelcomeEmbed,
  WelcomeConfig,
  GoodbyeConfig,
  GuildConfig,
  ActionFlow,
  TicketConfig,
};
export {
  getDefaultWelcomeConfig,
  getDefaultGoodbyeConfig,
  getDefaultActionsConfig,
  getDefaultTicketConfig,
};

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
    welcome: getDefaultWelcomeConfig(),
    goodbye: getDefaultGoodbyeConfig(),
    actions: getDefaultActionsConfig(),
    ticket: getDefaultTicketConfig(),
    embedColor: '#5865F2',
    updatedAt: new Date().toISOString(),
  };
}

export function getGuildConfig(guildId: string, guildName?: string): GuildConfig {
  if (memoryConfigs.has(guildId)) {
    return memoryConfigs.get(guildId)!;
  }

  const defaultConf = getDefaultConfig(guildId, guildName);
  const filePath = path.join(SERWERY_DIR, `${guildId}.json`);
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(data);
      const mergedWelcome: WelcomeConfig = {
        ...defaultConf.welcome,
        ...(parsed.welcome || {}),
        containers: Array.isArray(parsed.welcome?.containers) && parsed.welcome.containers.length > 0
          ? parsed.welcome.containers
          : defaultConf.welcome.containers,
        embed: {
          ...defaultConf.welcome.embed,
          ...(parsed.welcome?.embed || {}),
          fields: Array.isArray(parsed.welcome?.embed?.fields)
            ? parsed.welcome.embed.fields
            : defaultConf.welcome.embed.fields,
        },
        buttons: Array.isArray(parsed.welcome?.buttons)
          ? parsed.welcome.buttons
          : defaultConf.welcome.buttons,
      };

      const mergedGoodbye: GoodbyeConfig = {
        ...defaultConf.goodbye,
        ...(parsed.goodbye || {}),
        containers: Array.isArray(parsed.goodbye?.containers) && parsed.goodbye.containers.length > 0
          ? parsed.goodbye.containers
          : defaultConf.goodbye.containers,
        embed: {
          ...defaultConf.goodbye.embed,
          ...(parsed.goodbye?.embed || {}),
          fields: Array.isArray(parsed.goodbye?.embed?.fields)
            ? parsed.goodbye.embed.fields
            : defaultConf.goodbye.embed.fields,
        },
        buttons: Array.isArray(parsed.goodbye?.buttons)
          ? parsed.goodbye.buttons
          : defaultConf.goodbye.buttons,
      };

      const mergedActions: ActionFlow[] = Array.isArray(parsed.actions)
        ? parsed.actions
        : defaultConf.actions || [];

      const mergedTicket: TicketConfig = {
        ...defaultConf.ticket!,
        ...(parsed.ticket || {}),
        panel: {
          ...defaultConf.ticket!.panel,
          ...(parsed.ticket?.panel || {}),
          embed: {
            ...defaultConf.ticket!.panel.embed,
            ...(parsed.ticket?.panel?.embed || {}),
          },
          buttons: Array.isArray(parsed.ticket?.panel?.buttons)
            ? parsed.ticket.panel.buttons
            : defaultConf.ticket!.panel.buttons,
          selectMenu: {
            ...defaultConf.ticket!.panel.selectMenu,
            ...(parsed.ticket?.panel?.selectMenu || {}),
            options: Array.isArray(parsed.ticket?.panel?.selectMenu?.options)
              ? parsed.ticket.panel.selectMenu.options
              : defaultConf.ticket!.panel.selectMenu.options,
          },
        },
        settings: {
          ...defaultConf.ticket!.settings,
          ...(parsed.ticket?.settings || {}),
        },
      };

      const full: GuildConfig = {
        ...defaultConf,
        ...parsed,
        guildId,
        welcome: mergedWelcome,
        goodbye: mergedGoodbye,
        actions: mergedActions,
        ticket: mergedTicket,
      };
      memoryConfigs.set(guildId, full);
      return full;
    }
  } catch (err) {
    console.warn(`Błąd odczytu konfiguracji dla serwera ${guildId}:`, err);
  }

  // If doesn't exist, create default
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
