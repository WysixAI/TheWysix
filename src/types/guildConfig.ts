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

export interface ComponentFile {
  id: string;
  type: 'file';
  fileName: string;
  fileUrl: string;
  fileSize?: string;
  description?: string;
  spoiler?: boolean;
  hidden?: boolean;
}

export interface EmbedFieldItem {
  id: string;
  name: string;
  value: string;
  inline?: boolean;
}

export interface ComponentFields {
  id: string;
  type: 'fields';
  fields: EmbedFieldItem[];
  hidden?: boolean;
}

export interface ComponentQuote {
  id: string;
  type: 'quote';
  content: string;
  author?: string;
  hidden?: boolean;
}

export interface ComponentCodeBlock {
  id: string;
  type: 'code_block';
  code: string;
  language?: string;
  hidden?: boolean;
}

export interface ComponentTimestamp {
  id: string;
  type: 'timestamp';
  timestamp: string; // ISO or unix timestamp
  format: 'R' | 'F' | 'D' | 'T'; // R: Relative, F: Full, D: Date, T: Time
  label?: string;
  hidden?: boolean;
}

export interface ComponentSection {
  id: string;
  type: 'section';
  accessory?: ComponentAccessory;
  texts: ComponentTextDisplay[];
  hidden?: boolean;
}

export interface ComponentSeparator {
  id: string;
  type: 'separator';
  spacing: 'Small' | 'Medium' | 'Large';
  divider: boolean;
  hidden?: boolean;
}

export interface ComponentMedia {
  id: string;
  type: 'media';
  url: string;
  caption?: string;
  spoiler?: boolean;
  hidden?: boolean;
}

export interface ComponentActionRow {
  id: string;
  type: 'action_row';
  rowType?: 'buttons' | 'select_menu';
  buttons: WelcomeButton[];
  selectMenu?: ComponentSelectMenu;
  hidden?: boolean;
}

export type ContainerSubComponent =
  | ComponentSection
  | ComponentSeparator
  | ComponentActionRow
  | ComponentMedia
  | ComponentFile
  | ComponentFields
  | ComponentQuote
  | ComponentCodeBlock
  | ComponentTimestamp;

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

export type ActionTriggerType =
  | 'command'           // Komenda slash lub z prefiksem (np. !pomoc, !ranga)
  | 'message_sent'      // Wysłanie wiadomości na kanale
  | 'member_join'       // Dołączenie użytkownika do serwera
  | 'member_leave'      // Opuszczenie serwera przez użytkownika
  | 'reaction_add'      // Dodanie reakcji do wiadomości
  | 'button_click';     // Kliknięcie w przycisk / interakcja

export interface ActionTriggerConfig {
  type: ActionTriggerType;
  commandName?: string;
  commandDescription?: string;
  channelScope: 'all' | 'specific';
  channelId?: string;
  channelName?: string;
  messageMatchType?: 'contains' | 'exact' | 'starts_with' | 'any';
  messageContent?: string;
  ignoreBots?: boolean;
  roleScope?: 'everyone' | 'admin_only' | 'specific_role';
  allowedRoleId?: string;
}

export type ActionStepType =
  | 'wait'              // Czekaj określony czas (np. 5s)
  | 'send_message'      // Wyślij wiadomość na kanał
  | 'send_ephemeral'    // Dyskretna odpowiedź (widoczna tylko dla klikającego)
  | 'send_dm'           // Wiadomość prywatna do użytkownika
  | 'give_role'         // Nadaj rolę
  | 'remove_role'       // Odbierz rolę
  | 'kick_member'       // Wyrzuć użytkownika
  | 'ban_member'        // Zbanuj użytkownika
  | 'delete_message'    // Usuń wiadomość wywołującą
  | 'send_embed'        // Wyślij sformatowany Embed
  | 'random_message'    // Wybierz 1 z kilku wariantów
  | 'change_nickname';  // Zmień nick użytkownika

export interface ActionStep {
  id: string;
  type: ActionStepType;
  durationSeconds?: number;
  messageText?: string;
  targetChannel?: 'same' | 'specific';
  channelId?: string;
  roleName?: string;
  roleId?: string;
  reason?: string;
  deleteMessageDays?: number;
  embedTitle?: string;
  embedDescription?: string;
  embedColor?: string;
  embedImageUrl?: string;
  embedFooter?: string;
  randomOptions?: string[];
  newNickname?: string;
}

export interface ActionFlow {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  trigger: ActionTriggerConfig;
  steps: ActionStep[];
}

export interface GuildConfig {
  guildId: string;
  guildName: string;
  prefix: string;
  language: string;
  welcome?: WelcomeConfig;
  goodbye?: GoodbyeConfig;
  actions?: ActionFlow[];
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

export function getDefaultActionsConfig(): ActionFlow[] {
  return [
    {
      id: 'flow-welcome-auto',
      name: 'Automatyczne powitanie i rola',
      description: 'Gdy nowy użytkownik dołączy, wyślij wiadomość, poczekaj 5s i nadaj rolę',
      enabled: true,
      trigger: {
        type: 'member_join',
        channelScope: 'all',
      },
      steps: [
        {
          id: 'step-1',
          type: 'send_message',
          messageText: '👋 Witamy serdecznie {user} na serwerze **{server.name}**!',
          targetChannel: 'same'
        },
        {
          id: 'step-2',
          type: 'wait',
          durationSeconds: 5
        },
        {
          id: 'step-3',
          type: 'give_role',
          roleName: 'Nowy Członek'
        }
      ]
    },
    {
      id: 'flow-command-help',
      name: 'Komenda !pomoc',
      description: 'Odpowiedź na wpisanie komendy !pomoc na czacie',
      enabled: true,
      trigger: {
        type: 'command',
        commandName: '!pomoc',
        channelScope: 'all',
        roleScope: 'everyone'
      },
      steps: [
        {
          id: 'step-h1',
          type: 'send_message',
          messageText: '🤖 **KitekBot Pomoc**:\nOto lista dostępnych funkcji na serwerze {server.name}!\nSprawdź regulamin oraz przypisane role.',
          targetChannel: 'same'
        }
      ]
    }
  ];
}

