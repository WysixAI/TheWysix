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
  | 'command'           // Komenda slash lub z prefiksem (np. !pomoc, !ranga, /zweryfikuj)
  | 'message_sent'      // Wysłanie wiadomości na kanale (zawiera tekst, zaczyna się od)
  | 'member_join'       // Dołączenie użytkownika do serwera (Join event)
  | 'member_leave'      // Opuszczenie serwera przez użytkownika (Leave event)
  | 'button_click'      // Kliknięcie w przycisk bota
  | 'select_menu'       // Wybór z menu rozwijanego
  | 'reaction_add'      // Dodanie reakcji do wiadomości
  | 'schedule';         // Harmonogram czasowy (Interval / cron)

export interface ActionTriggerConfig {
  type: ActionTriggerType;
  commandName?: string;
  commandDescription?: string;
  slashOnly?: boolean;
  prefixOnly?: boolean;
  channelScope: 'all' | 'specific';
  channelId?: string;
  channelName?: string;
  messageMatchType?: 'contains' | 'exact' | 'starts_with' | 'regex' | 'any';
  messageContent?: string;
  ignoreBots?: boolean;
  roleScope?: 'everyone' | 'admin_only' | 'specific_role';
  allowedRoleId?: string;
  buttonCustomId?: string;
  reactionEmoji?: string;
  scheduleIntervalMinutes?: number;
  cooldownSeconds?: number;
}

export type ActionStepCategory = 'logic' | 'message' | 'member' | 'moderation' | 'channel';

export type ActionStepType =
  // Logika & Kontrola (Scratch Control / Logic)
  | 'condition_if'      // Warunek IF (rola, uprawnienia, kanał, szansa %)
  | 'wait'              // Czekaj określony czas (np. 5s)
  | 'cooldown'          // Ograniczenie czasowe / cooldown na użytkownika
  | 'stop_flow'         // Zatrzymaj wykonywanie komendy
  | 'random_choice'     // Losowy wybór z puli
  // Wiadomości & Treści
  | 'send_message'      // Wyślij wiadomość na kanał
  | 'send_embed'        // Wyślij sformatowany Embed
  | 'send_ephemeral'    // Dyskretna odpowiedź (widoczna tylko dla klikającego)
  | 'send_dm'           // Wiadomość prywatna do użytkownika
  | 'add_reaction'      // Dodaj reakcję emoji do wiadomości
  | 'delete_message'    // Usuń wiadomość wywołującą
  | 'purge_messages'    // Wyczyść ostatnie N wiadomości
  // Użytkownicy & Role
  | 'give_role'         // Nadaj rolę
  | 'remove_role'       // Odbierz rolę
  | 'change_nickname'   // Zmień nick użytkownika
  | 'timeout_member'    // Wycisz użytkownika (Timeout)
  | 'kick_member'       // Wyrzuć użytkownika (Kick)
  | 'ban_member'        // Zbanuj użytkownika (Ban)
  // Kanały & Tickety
  | 'create_channel'    // Utwórz nowy kanał tekstowy
  | 'delete_channel'    // Usuń wybrany kanał
  | 'create_ticket'     // Utwórz dedykowany pokój zgłoszenia
  // Zgodność wsteczna
  | 'random_message';

export interface ActionConnection {
  id: string;
  fromNodeId: string; // 'trigger' lub id kroku
  fromPort?: 'default' | 'then' | 'else';
  toNodeId: string;   // id kroku docelowego
}

export interface ActionStep {
  id: string;
  type: ActionStepType;
  title?: string;
  collapsed?: boolean;
  // Pozycja na płótnie (Drag & Drop Canvas)
  x?: number;
  y?: number;
  nextStepId?: string;
  thenStepId?: string;
  elseStepId?: string;
  // Timing & Cooldown
  durationSeconds?: number;
  cooldownSeconds?: number;
  // Messages & Embeds
  messageText?: string;
  targetChannel?: 'same' | 'specific' | 'dm';
  channelId?: string;
  channelName?: string;
  replyToMessage?: boolean;
  embedTitle?: string;
  embedDescription?: string;
  embedColor?: string;
  embedImageUrl?: string;
  embedThumbnailUrl?: string;
  embedFooter?: string;
  includeTimestamp?: boolean;
  emoji?: string;
  purgeCount?: number;
  // Roles & Members
  roleName?: string;
  roleId?: string;
  reason?: string;
  deleteMessageDays?: number;
  newNickname?: string;
  timeoutMinutes?: number;
  // Logic & Conditions
  conditionType?: 'has_role' | 'has_permission' | 'is_channel' | 'message_contains' | 'random_chance';
  conditionValue?: string;
  chancePercent?: number;
  thenSteps?: ActionStep[];
  elseSteps?: ActionStep[];
  // Channel creation
  newChannelName?: string;
  categoryName?: string;
  // Legacy
  randomOptions?: string[];
}

export interface ActionFlow {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  trigger: ActionTriggerConfig;
  triggerPosition?: { x: number; y: number };
  errorHandlerPosition?: { x: number; y: number };
  steps: ActionStep[];
  connections?: ActionConnection[];
  updatedAt?: string;
}

export type TicketComponentType = 'buttons' | 'select_menu' | 'both';

export type TicketButtonStyle = 'PRIMARY' | 'SECONDARY' | 'SUCCESS' | 'DANGER' | 'LINK';

export interface TicketButtonConfig {
  id: string;
  label: string;
  emoji?: string;
  style: TicketButtonStyle;
  customColor?: string; // Wybarwienie przycisku (np. #5865F2, #57F287, #ED4245, #4E5058, itp.)
  customId: string;
  categoryName?: string;
  channelPrefix?: string;
  supportRoleName?: string;
  supportRoleId?: string;
  ticketWelcomeTitle?: string;
  ticketWelcomeMessage?: string;
  ticketWelcomeColor?: string;
  disabled?: boolean;
}

export interface TicketSelectOption {
  id: string;
  label: string;
  value: string;
  description?: string;
  emoji?: string;
  colorAccent?: string; // Wybarwienie opcji
  categoryName?: string;
  channelPrefix?: string;
  supportRoleName?: string;
  supportRoleId?: string;
  ticketWelcomeMessage?: string;
}

export interface TicketSelectMenuConfig {
  customId: string;
  placeholder: string;
  colorAccent?: string; // Wybarwienie ramki/tła select menu
  minValues: number;
  maxValues: number;
  options: TicketSelectOption[];
}

export interface TicketPanelConfig {
  channelId: string | null;
  channelName?: string;
  messageContent?: string;
  useEmbed: boolean;
  embed: {
    title: string;
    description: string;
    color: string;
    authorName?: string;
    authorIcon?: string;
    thumbnailUrl?: string;
    imageUrl?: string;
    footerText?: string;
    includeTimestamp?: boolean;
  };
  componentType: TicketComponentType;
  buttons: TicketButtonConfig[];
  selectMenu: TicketSelectMenuConfig;
}

export interface TicketSettings {
  categoryName: string;
  categoryId?: string;
  supportRoleName: string;
  supportRoleId?: string;
  closeButtonText: string;
  transcriptEnabled: boolean;
  deleteDelaySeconds: number;
}

export interface TicketConfig {
  enabled: boolean;
  panel: TicketPanelConfig;
  settings: TicketSettings;
}

export interface GuildConfig {
  guildId: string;
  guildName: string;
  prefix: string;
  language: string;
  welcome?: WelcomeConfig;
  goodbye?: GoodbyeConfig;
  actions?: ActionFlow[];
  ticket?: TicketConfig;
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
  return [];
}

export function getDefaultTicketConfig(): TicketConfig {
  return {
    enabled: true,
    panel: {
      channelId: null,
      channelName: 'pomoc',
      messageContent: '👋 **Potrzebujesz pomocy lub masz sprawę do administracji?** Utwórz prywatny ticket poniżej!',
      useEmbed: true,
      embed: {
        title: '🎫 Centrum Zgłoszeń i Pomocy',
        description: 'Wybierz odpowiednią opcję poniżej, aby skontaktować się z zespołem wsparcia.\n\n• **🛠️ Pomoc Techniczna** — problemy z serwerem, botem lub kontem\n• **💳 Płatności & VIP** — zamówienia, rangi i darowizny\n• **🚨 Zgłoś Gracza** — naruszenia regulaminu i błędy\n\nNasz zespół odpowiada tak szybko, jak to możliwe!',
        color: '#5865F2',
        footerText: 'System Zgłoszeń KitekBot • Kliknij, aby utworzyć zgłoszenie',
        includeTimestamp: true,
      },
      componentType: 'buttons',
      buttons: [
        {
          id: 'btn-support-1',
          label: 'Pomoc Techniczna',
          emoji: '🛠️',
          style: 'PRIMARY',
          customColor: '#5865F2',
          customId: 'ticket_create_support',
          categoryName: 'Pomoc Techniczna',
          channelPrefix: 'pomoc',
          supportRoleName: 'Pomocnik',
          ticketWelcomeTitle: '🛠️ Zgłoszenie: Pomoc Techniczna',
          ticketWelcomeMessage: 'Witaj {user}! Dziękujemy za utworzenie zgłoszenia. Opisz szczegółowo swój problem, a obsługa serwera wkrótce Ci pomoże.',
          ticketWelcomeColor: '#5865F2',
        },
        {
          id: 'btn-support-2',
          label: 'Płatności & VIP',
          emoji: '💳',
          style: 'SUCCESS',
          customColor: '#57F287',
          customId: 'ticket_create_billing',
          categoryName: 'Płatności & VIP',
          channelPrefix: 'platnosci',
          supportRoleName: 'Administrator',
          ticketWelcomeTitle: '💳 Zgłoszenie: Płatności & Rangi',
          ticketWelcomeMessage: 'Witaj {user}! Podaj szczegóły transakcji, nick z gry lub identyfikator zakupu.',
          ticketWelcomeColor: '#57F287',
        },
        {
          id: 'btn-support-3',
          label: 'Zgłoś Gracza',
          emoji: '🚨',
          style: 'DANGER',
          customColor: '#ED4245',
          customId: 'ticket_create_report',
          categoryName: 'Zgłoszenie Gracza',
          channelPrefix: 'zgloszenie',
          supportRoleName: 'Moderator',
          ticketWelcomeTitle: '🚨 Zgłoszenie: Naruszenie Regulaminu',
          ticketWelcomeMessage: 'Witaj {user}! Podaj nick zgłaszanego gracza oraz dołącz dowody (zrzuty ekranu, logi, wideo).',
          ticketWelcomeColor: '#ED4245',
        },
      ],
      selectMenu: {
        customId: 'ticket_select_category',
        placeholder: '📂 Wybierz kategorię zgłoszenia z listy...',
        colorAccent: '#5865F2',
        minValues: 1,
        maxValues: 1,
        options: [
          {
            id: 'opt-1',
            label: 'Pomoc Techniczna',
            value: 'tech_support',
            description: 'Problemy z botem, serwerem lub konfiguracją',
            emoji: '🛠️',
            colorAccent: '#5865F2',
            categoryName: 'Pomoc Techniczna',
            channelPrefix: 'pomoc',
            supportRoleName: 'Pomocnik',
            ticketWelcomeMessage: 'Witaj {user}! Opisz szczegółowo problem techniczny.',
          },
          {
            id: 'opt-2',
            label: 'Płatności & Rangi VIP',
            value: 'billing',
            description: 'Pytania dotyczące rang, sklepu i transakcji',
            emoji: '💳',
            colorAccent: '#57F287',
            categoryName: 'Płatności',
            channelPrefix: 'platnosci',
            supportRoleName: 'Administrator',
            ticketWelcomeMessage: 'Witaj {user}! Podaj dane dotyczące zamówienia.',
          },
          {
            id: 'opt-3',
            label: 'Zgłoszenie Gracza / Skarga',
            value: 'report',
            description: 'Naruszenie zasad serwera lub nieodpowiednie zachowanie',
            emoji: '🚨',
            colorAccent: '#ED4245',
            categoryName: 'Zgłoszenia',
            channelPrefix: 'skarga',
            supportRoleName: 'Moderator',
            ticketWelcomeMessage: 'Witaj {user}! Załącz dowody oraz nick zgłaszanego gracza.',
          },
          {
            id: 'opt-4',
            label: 'Inne Pytanie / Kontakt',
            value: 'general',
            description: 'Wszelkie inne zapytania do zarządu serwera',
            emoji: '💬',
            colorAccent: '#FEE75C',
            categoryName: 'Pytania Ogólne',
            channelPrefix: 'kontakt',
            supportRoleName: 'Support',
            ticketWelcomeMessage: 'Witaj {user}! Zadaj swoje pytanie, wkrótce odpowiemy.',
          },
        ],
      },
    },
    settings: {
      categoryName: '🎫・Tickety',
      supportRoleName: 'Support',
      closeButtonText: '🔒 Zamknij Ticket',
      transcriptEnabled: true,
      deleteDelaySeconds: 5,
    },
  };
}


