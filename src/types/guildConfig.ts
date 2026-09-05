export interface WelcomeEmbedField {
  id: string;
  name: string;
  value: string;
  inline?: boolean;
}

export interface WelcomeEmbed {
  color?: string;
  authorName?: string;
  authorIcon?: string;
  authorUrl?: string;
  title?: string;
  titleUrl?: string;
  description?: string;
  fields?: WelcomeEmbedField[];
  thumbnailUrl?: string;
  imageUrl?: string;
  footerText?: string;
  footerIcon?: string;
  includeTimestamp?: boolean;
}

export interface WelcomeButton {
  id: string;
  label: string;
  style: 'PRIMARY' | 'SECONDARY' | 'SUCCESS' | 'DANGER' | 'LINK';
  url?: string;
  customId?: string;
  emoji?: string;
}

export interface WelcomeConfig {
  enabled: boolean;
  channelId: string | null;
  message: string;
  useEmbed: boolean;
  embed: WelcomeEmbed;
  buttons?: WelcomeButton[];
}

export interface GuildConfig {
  guildId: string;
  guildName: string;
  prefix: string;
  language: string;
  welcome: WelcomeConfig;
  embedColor?: string;
  updatedAt: string;
}

export function getDefaultWelcomeConfig(): WelcomeConfig {
  return {
    enabled: true,
    channelId: null,
    message: 'Hej {user}, witamy w naszych progach! 🌟 Rozgość się i zapoznaj z regulaminem.',
    useEmbed: true,
    embed: {
      color: '#5865F2',
      authorName: 'Oficjalny Serwer KitekBot',
      authorIcon: 'https://cdn.discordapp.com/embed/avatars/0.png',
      authorUrl: '',
      title: '👋 Witamy nowego użytkownika!',
      titleUrl: '',
      description: 'Cieszymy się, że jesteś z nami, **{user}**! Jesteś naszym **{memberCount}** członkiem na serwerze **{server.name}**!\n\nPamiętaj, aby zachowywać kulturę i sprawdzić poniższe kanały:',
      fields: [
        {
          id: 'f-1',
          name: '📜 Regulamin',
          value: 'Sprawdź najważniejsze zasady panujące na serwerze.',
          inline: true,
        },
        {
          id: 'f-2',
          name: '💬 Dyskusje',
          value: 'Dołącz do rozmów na kanale głównym!',
          inline: true,
        },
      ],
      thumbnailUrl: '',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      footerText: 'KitekBot Welcome System • Życzymy miłej zabawy!',
      footerIcon: 'https://cdn.discordapp.com/embed/avatars/0.png',
      includeTimestamp: true,
    },
    buttons: [
      {
        id: 'btn-1',
        label: 'Odwiedź stronę bota',
        style: 'LINK',
        url: 'https://kitekbot.vercel.app',
        emoji: '🌐',
      },
      {
        id: 'btn-2',
        label: 'Zweryfikuj konto',
        style: 'SUCCESS',
        customId: 'verify_welcome_btn',
        emoji: '✅',
      },
    ],
  };
}
