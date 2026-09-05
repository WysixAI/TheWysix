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

export interface ComponentAccessory {
  type: 'Thumbnail' | 'Image' | 'Button' | 'None';
  url: string;
  description?: string;
  spoiler?: boolean;
}

export interface ComponentTextDisplay {
  id: string;
  content: string;
}

export interface ComponentSection {
  id: string;
  type: 'section';
  accessory?: ComponentAccessory;
  texts: ComponentTextDisplay[];
}

export interface ComponentSeparator {
  id: string;
  type: 'separator';
  spacing: 'Small' | 'Medium' | 'Large';
  divider: boolean;
}

export interface ComponentActionRow {
  id: string;
  type: 'action_row';
  buttons: WelcomeButton[];
}

export type ContainerSubComponent = ComponentSection | ComponentSeparator | ComponentActionRow;

export interface MessageContainer {
  id: string;
  color: string;
  spoiler?: boolean;
  components: ContainerSubComponent[];
}

export interface MessageBuilderConfig {
  enabled: boolean;
  channelId: string | null;
  message: string;
  useEmbed: boolean;
  containers: MessageContainer[];
  // Legacy / fallback fields for standard Discord embeds
  embed: WelcomeEmbed;
  buttons: WelcomeButton[];
}

export type WelcomeConfig = MessageBuilderConfig;
export type GoodbyeConfig = MessageBuilderConfig;

export interface GuildConfig {
  guildId: string;
  guildName: string;
  prefix: string;
  language: string;
  welcome: WelcomeConfig;
  goodbye: GoodbyeConfig;
  embedColor?: string;
  updatedAt: string;
}

export function getDefaultContainer(): MessageContainer {
  return {
    id: 'container-1',
    color: '#5865F2',
    spoiler: false,
    components: [
      {
        id: 'sec-1',
        type: 'section',
        accessory: {
          type: 'Thumbnail',
          url: 'https://cdn.discordapp.com/embed/avatars/0.png',
          description: 'Logo serwera',
          spoiler: false,
        },
        texts: [
          {
            id: 'txt-1',
            content: '``` NAZWA SERWERA ```\nOPIS: Witamy na naszym serwerze, {user}! Życzymy udanego pobytu i zapraszamy do rozmów.',
          },
        ],
      },
      {
        id: 'sep-1',
        type: 'separator',
        spacing: 'Small',
        divider: true,
      },
      {
        id: 'sec-2',
        type: 'section',
        accessory: {
          type: 'None',
          url: '',
          description: '',
        },
        texts: [
          {
            id: 'txt-2',
            content: '📜 **Regulamin:** Zapoznaj się z zasadami panującymi na serwerze.\n💬 **Pogadanki:** Dołącz do dyskusji na kanale głównym!',
          },
        ],
      },
      {
        id: 'sep-2',
        type: 'separator',
        spacing: 'Small',
        divider: true,
      },
      {
        id: 'row-1',
        type: 'action_row',
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
      },
    ],
  };
}

export function getDefaultWelcomeConfig(): WelcomeConfig {
  const container = getDefaultContainer();
  return {
    enabled: true,
    channelId: null,
    message: 'Hej {user}, witamy w naszych progach! 🌟 Rozgość się i zapoznaj z regulaminem.',
    useEmbed: true,
    containers: [container],
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

export function getDefaultGoodbyeConfig(): GoodbyeConfig {
  return {
    enabled: true,
    channelId: null,
    message: '{user} opuścił nasz serwer. Żegnaj i powodzenia! 👋',
    useEmbed: true,
    containers: [
      {
        id: 'container-goodbye',
        color: '#ED4245',
        spoiler: false,
        components: [
          {
            id: 'sec-goodbye-1',
            type: 'section',
            accessory: {
              type: 'Thumbnail',
              url: 'https://cdn.discordapp.com/embed/avatars/1.png',
              description: 'Pożegnanie',
            },
            texts: [
              {
                id: 'txt-goodbye-1',
                content: '``` POŻEGNANIE ```\n**{user}** opuścił serwer **{server.name}**.\nZostało nas teraz **{memberCount}** członków.',
              },
            ],
          },
          {
            id: 'sep-goodbye-1',
            type: 'separator',
            spacing: 'Small',
            divider: true,
          },
        ],
      },
    ],
    embed: {
      color: '#ED4245',
      title: '👋 Ktoś opuścił serwer...',
      description: '**{user}** opuścił nasz serwer **{server.name}**.\nZostało nas teraz **{memberCount}** członków.',
      fields: [],
      footerText: 'KitekBot Goodbye System',
      includeTimestamp: true,
    },
    buttons: [],
  };
}
