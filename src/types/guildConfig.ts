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

export type ComponentActionType =
  | 'text_response'
  | 'ephemeral_reply'
  | 'give_role'
  | 'remove_role'
  | 'send_dm'
  | 'kick'
  | 'ban';

export interface ComponentAction {
  id: string;
  type: ComponentActionType;
  target?: 'channel' | 'ephemeral' | 'dm';
  response?: string;
  roleName?: string;
  roleId?: string;
  reason?: string;
  publicReply?: boolean;
  pingRoles?: boolean;
}

export interface WelcomeButton {
  id: string;
  label: string;
  style: 'PRIMARY' | 'SECONDARY' | 'SUCCESS' | 'DANGER' | 'LINK';
  url?: string;
  customId?: string;
  emoji?: string;
  disabled?: boolean;
  actions?: ComponentAction[];
}

export interface SelectMenuOption {
  id: string;
  label: string;
  value: string;
  description?: string;
  emoji?: string;
  actions?: ComponentAction[];
}

export interface ComponentSelectMenu {
  id: string;
  customId: string;
  placeholder?: string;
  disabled?: boolean;
  minValues?: number;
  maxValues?: number;
  options: SelectMenuOption[];
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

export interface ComponentMedia {
  id: string;
  type: 'media';
  url: string;
  caption?: string;
  spoiler?: boolean;
}

export interface ComponentActionRow {
  id: string;
  type: 'action_row';
  rowType?: 'buttons' | 'select_menu';
  buttons: WelcomeButton[];
  selectMenu?: ComponentSelectMenu;
}

export type ContainerSubComponent =
  | ComponentSection
  | ComponentSeparator
  | ComponentActionRow
  | ComponentMedia;

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

export function createDefaultAction(type: ComponentActionType = 'ephemeral_reply'): ComponentAction {
  const id = 'act-' + Math.random().toString(36).substring(2, 8);
  switch (type) {
    case 'give_role':
      return {
        id,
        type: 'give_role',
        target: 'ephemeral',
        roleName: 'Zweryfikowany',
        roleId: '',
        response: '✅ Pomyślnie nadano Ci rolę na serwerze!',
      };
    case 'remove_role':
      return {
        id,
        type: 'remove_role',
        target: 'ephemeral',
        roleName: 'Niezweryfikowany',
        roleId: '',
        response: '🗑️ Usunięto wskazaną rolę z Twojego konta.',
      };
    case 'send_dm':
      return {
        id,
        type: 'send_dm',
        target: 'dm',
        response: '👋 Witaj {user}! Dziękujemy za aktywność na serwerze {server.name}. Zapoznaj się z zasadami.',
      };
    case 'kick':
      return {
        id,
        type: 'kick',
        target: 'ephemeral',
        reason: 'Wyrzucony za pośrednictwem przycisku powitalnego',
        response: '👢 Użytkownik został pomyślnie wyrzucony z serwera.',
      };
    case 'ban':
      return {
        id,
        type: 'ban',
        target: 'ephemeral',
        reason: 'Zbanowany za pośrednictwem przycisku powitalnego',
        response: '🔨 Użytkownik został zbanowany na serwerze.',
      };
    case 'text_response':
      return {
        id,
        type: 'text_response',
        target: 'channel',
        response: '📢 {user} skorzystał z opcji weryfikacji serwerowej!',
        publicReply: true,
      };
    case 'ephemeral_reply':
    default:
      return {
        id,
        type: 'ephemeral_reply',
        target: 'ephemeral',
        response: '✅ Dziękujemy! Twoje konto zostało pomyślnie zweryfikowane.',
      };
  }
}

export function getDefaultContainer(): MessageContainer {
  return {
    id: `container-${Date.now()}`,
    color: '#5865F2',
    spoiler: false,
    components: [],
  };
}

export function getDefaultWelcomeConfig(): WelcomeConfig {
  return {
    enabled: true,
    channelId: null,
    message: '',
    useEmbed: true,
    containers: [getDefaultContainer()],
    embed: {
      color: '#5865F2',
      title: '',
      description: '',
      fields: [],
      footerText: '',
      includeTimestamp: false,
    },
    buttons: [],
  };
}

export function getDefaultGoodbyeConfig(): GoodbyeConfig {
  return {
    enabled: true,
    channelId: null,
    message: '',
    useEmbed: true,
    containers: [
      {
        id: `container-${Date.now()}`,
        color: '#ED4245',
        spoiler: false,
        components: [],
      },
    ],
    embed: {
      color: '#ED4245',
      title: '',
      description: '',
      fields: [],
      footerText: '',
      includeTimestamp: false,
    },
    buttons: [],
  };
}
