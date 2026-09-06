import React, { useState, useEffect } from 'react';
import {
  Zap,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Clock,
  MessageSquare,
  EyeOff,
  Mail,
  UserCheck,
  UserX,
  UserMinus,
  Ban,
  FileCode,
  Tag,
  CheckCircle2,
  AlertCircle,
  Play,
  Save,
  Sliders,
  Sparkles,
  HelpCircle,
  Hash,
  Shield,
  Loader2,
  X,
  Radio,
  CornerDownRight,
  ArrowLeft,
  Search,
  Check,
  Split,
  Layers,
  Terminal,
  VolumeX,
  FolderPlus,
  Ticket,
  Smile,
  ExternalLink
} from 'lucide-react';
import {
  ActionFlow,
  ActionTriggerConfig,
  ActionStep,
  ActionTriggerType,
  ActionStepType,
  ActionStepCategory,
  GuildConfig,
  getDefaultActionsConfig
} from '../types/guildConfig';

interface ActionsBuilderProps {
  guild: { id: string; name: string; icon: string | null };
  onBackToDashboard: () => void;
}

// Definicje Wyzwalaczy (Scratch Hat Blocks - Pomarańczowe)
const TRIGGER_DEFINITIONS: {
  type: ActionTriggerType;
  title: string;
  badge: string;
  desc: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
}[] = [
  {
    type: 'command',
    title: 'Komenda Slash lub Czatu',
    badge: 'Slash / Prefiks',
    desc: 'Uruchamia się po wpisaniu komendy (np. /pomoc, !ranga, /zweryfikuj)',
    icon: FileCode,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30'
  },
  {
    type: 'message_sent',
    title: 'Wiadomość na kanale',
    badge: 'Treść wiadomości',
    desc: 'Reaguje na słowa kluczowe lub treść wiadomości wysłanej na czacie',
    icon: MessageSquare,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30'
  },
  {
    type: 'member_join',
    title: 'Dołączenie użytkownika (Join)',
    badge: 'Nowy członek',
    desc: 'Wyzwala akcje zaraz po wejściu nowej osoby na serwer (Auto-rola, Powitanie)',
    icon: UserCheck,
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/30'
  },
  {
    type: 'member_leave',
    title: 'Opuszczenie serwera (Leave)',
    badge: 'Wyjście / Kick',
    desc: 'Wyzwala akcje po wyjściu lub wyrzuceniu członka z serwera',
    icon: UserMinus,
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30'
  },
  {
    type: 'button_click',
    title: 'Kliknięcie przycisku bota',
    badge: 'Interakcja Button',
    desc: 'Uruchamia przepływ po kliknięciu wybranego przycisku pod wiadomością',
    icon: Zap,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30'
  },
  {
    type: 'select_menu',
    title: 'Wybór z menu rozwijanego',
    badge: 'Select Menu',
    desc: 'Uruchamia przepływ po wybraniu opcji z listy rozwijanej',
    icon: Sliders,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30'
  },
  {
    type: 'reaction_add',
    title: 'Dodanie reakcji emoji',
    badge: 'Reakcja',
    desc: 'Reaguje na dodanie konkretnej reakcji do wiadomości',
    icon: Sparkles,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30'
  },
  {
    type: 'schedule',
    title: 'Harmonogram czasowy (Interval)',
    badge: 'Cykliczny',
    desc: 'Uruchamia komendę automatycznie co określony czas (np. co 60 minut)',
    icon: Clock,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30'
  }
];

// Definicje Bloków Akcji i Logiki (Kategorie Scratch: Logic, Message, Member, Moderation, Channel)
const STEP_DEFINITIONS: {
  type: ActionStepType;
  title: string;
  badge: string;
  desc: string;
  icon: any;
  category: ActionStepCategory;
  categoryName: string;
  color: string;
  bgColor: string;
  borderColor: string;
  accentBg: string;
}[] = [
  // --- KATEGORIA: LOGIKA I KONTROLA (FIOLET / PURPURA - SCRATCH CONTROL) ---
  {
    type: 'condition_if',
    title: 'Warunek IF (Jeżeli...)',
    badge: 'Logika',
    desc: 'Sprawdza czy użytkownik posiada rolę, uprawnienia lub czy wiadomość zawiera tekst',
    icon: Split,
    category: 'logic',
    categoryName: 'Logika & Kontrola',
    color: 'text-purple-300',
    bgColor: 'bg-purple-950/40',
    borderColor: 'border-purple-500/50',
    accentBg: 'bg-purple-600'
  },
  {
    type: 'cooldown',
    title: 'Cooldown (Limit czasowy)',
    badge: 'Kontrola',
    desc: 'Ogranicza częstotliwość użycia komendy na użytkownika (np. 1 raz na 10 sekund)',
    icon: Clock,
    category: 'logic',
    categoryName: 'Logika & Kontrola',
    color: 'text-purple-300',
    bgColor: 'bg-purple-950/40',
    borderColor: 'border-purple-500/50',
    accentBg: 'bg-purple-600'
  },
  {
    type: 'wait',
    title: 'Czekaj / Opóźnienie (Wait)',
    badge: 'Opóźnienie',
    desc: 'Wstrzymuje wykonanie kolejnych kroków o zadany czas (np. 3 sekundy)',
    icon: Clock,
    category: 'logic',
    categoryName: 'Logika & Kontrola',
    color: 'text-purple-300',
    bgColor: 'bg-purple-950/40',
    borderColor: 'border-purple-500/50',
    accentBg: 'bg-purple-600'
  },
  {
    type: 'stop_flow',
    title: 'Zatrzymaj wykonywanie (Stop)',
    badge: 'Przerwanie',
    desc: 'Przerywa dalsze wykonywanie komendy, jeśli nie spełniono warunków',
    icon: AlertCircle,
    category: 'logic',
    categoryName: 'Logika & Kontrola',
    color: 'text-purple-300',
    bgColor: 'bg-purple-950/40',
    borderColor: 'border-purple-500/50',
    accentBg: 'bg-purple-600'
  },
  {
    type: 'random_choice',
    title: 'Losowa wiadomość / Wybór',
    badge: 'Losowość',
    desc: 'Wybiera losowy wariant odpowiedzi lub losuje wynik (np. rzut monetą)',
    icon: Sparkles,
    category: 'logic',
    categoryName: 'Logika & Kontrola',
    color: 'text-purple-300',
    bgColor: 'bg-purple-950/40',
    borderColor: 'border-purple-500/50',
    accentBg: 'bg-purple-600'
  },

  // --- KATEGORIA: WIADOMOŚCI I EMBEDY (SZMARAGD / ZIELEŃ - SCRATCH LOOKS) ---
  {
    type: 'send_message',
    title: 'Wyślij wiadomość na kanał',
    badge: 'Wiadomość',
    desc: 'Wysyła publiczną wiadomość tekstową na bieżący lub wybrany kanał',
    icon: MessageSquare,
    category: 'message',
    categoryName: 'Wiadomości & Embedy',
    color: 'text-emerald-300',
    bgColor: 'bg-emerald-950/40',
    borderColor: 'border-emerald-500/50',
    accentBg: 'bg-emerald-600'
  },
  {
    type: 'send_embed',
    title: 'Wyślij sformatowany Embed',
    badge: 'Embed',
    desc: 'Elegancka karta z kolorem, tytułem, opisem, obrazkiem i stopką',
    icon: Layers,
    category: 'message',
    categoryName: 'Wiadomości & Embedy',
    color: 'text-emerald-300',
    bgColor: 'bg-emerald-950/40',
    borderColor: 'border-emerald-500/50',
    accentBg: 'bg-emerald-600'
  },
  {
    type: 'send_ephemeral',
    title: 'Odpowiedź Ephemeral (Tylko autor)',
    badge: 'Dyskretna',
    desc: 'Prywatna odpowiedź widoczna wyłącznie dla osoby wywołującej komendę',
    icon: EyeOff,
    category: 'message',
    categoryName: 'Wiadomości & Embedy',
    color: 'text-emerald-300',
    bgColor: 'bg-emerald-950/40',
    borderColor: 'border-emerald-500/50',
    accentBg: 'bg-emerald-600'
  },
  {
    type: 'send_dm',
    title: 'Wyślij wiadomość prywatną (DM)',
    badge: 'Wiadomość DM',
    desc: 'Wysyła prywatną wiadomość bezpośrednio na skrzynkę użytkownika',
    icon: Mail,
    category: 'message',
    categoryName: 'Wiadomości & Embedy',
    color: 'text-emerald-300',
    bgColor: 'bg-emerald-950/40',
    borderColor: 'border-emerald-500/50',
    accentBg: 'bg-emerald-600'
  },
  {
    type: 'add_reaction',
    title: 'Dodaj reakcję emoji',
    badge: 'Reakcja',
    desc: 'Dodaje reakcję emoji do wiadomości wywołującej (np. ✅, ⭐, 🎉)',
    icon: Smile,
    category: 'message',
    categoryName: 'Wiadomości & Embedy',
    color: 'text-emerald-300',
    bgColor: 'bg-emerald-950/40',
    borderColor: 'border-emerald-500/50',
    accentBg: 'bg-emerald-600'
  },
  {
    type: 'delete_message',
    title: 'Usuń wiadomość wywołującą',
    badge: 'Czyszczenie',
    desc: 'Kasuje wiadomość użytkownika po wpisaniu komendy, by utrzymać porządek',
    icon: Trash2,
    category: 'message',
    categoryName: 'Wiadomości & Embedy',
    color: 'text-emerald-300',
    bgColor: 'bg-emerald-950/40',
    borderColor: 'border-emerald-500/50',
    accentBg: 'bg-emerald-600'
  },
  {
    type: 'purge_messages',
    title: 'Wyczyść wiadomości (Purge)',
    badge: 'Czystka czatu',
    desc: 'Usuwa określoną liczbę ostatnich wiadomości na kanale (np. 10 lub 50)',
    icon: Trash2,
    category: 'message',
    categoryName: 'Wiadomości & Embedy',
    color: 'text-emerald-300',
    bgColor: 'bg-emerald-950/40',
    borderColor: 'border-emerald-500/50',
    accentBg: 'bg-emerald-600'
  },

  // --- KATEGORIA: ROLE I UŻYTKOWNICY (BŁĘKIT / SKY - SCRATCH SENSING) ---
  {
    type: 'give_role',
    title: 'Nadaj rolę',
    badge: 'Rola +',
    desc: 'Automatycznie przypisuje wskazaną rolę użytkownikowi na serwerze',
    icon: UserCheck,
    category: 'member',
    categoryName: 'Role & Użytkownicy',
    color: 'text-sky-300',
    bgColor: 'bg-sky-950/40',
    borderColor: 'border-sky-500/50',
    accentBg: 'bg-sky-600'
  },
  {
    type: 'remove_role',
    title: 'Odbierz rolę',
    badge: 'Rola -',
    desc: 'Odbiera wskazaną rolę użytkownikowi na serwerze',
    icon: UserX,
    category: 'member',
    categoryName: 'Role & Użytkownicy',
    color: 'text-sky-300',
    bgColor: 'bg-sky-950/40',
    borderColor: 'border-sky-500/50',
    accentBg: 'bg-sky-600'
  },
  {
    type: 'change_nickname',
    title: 'Zmień pseudonim (Nick)',
    badge: 'Pseudonim',
    desc: 'Zmienia pseudonim członka na serwerze na zadany szablon',
    icon: Tag,
    category: 'member',
    categoryName: 'Role & Użytkownicy',
    color: 'text-sky-300',
    bgColor: 'bg-sky-950/40',
    borderColor: 'border-sky-500/50',
    accentBg: 'bg-sky-600'
  },

  // --- KATEGORIA: MODERACJA (CZERWIEŃ / RÓŻ - SCRATCH OPERATORS) ---
  {
    type: 'timeout_member',
    title: 'Wycisz użytkownika (Timeout)',
    badge: 'Wyciszenie',
    desc: 'Nakłada przerwę / wyciszenie na określony czas (np. 10 minut, 1h)',
    icon: VolumeX,
    category: 'moderation',
    categoryName: 'Moderacja & Kary',
    color: 'text-rose-300',
    bgColor: 'bg-rose-950/40',
    borderColor: 'border-rose-500/50',
    accentBg: 'bg-rose-600'
  },
  {
    type: 'kick_member',
    title: 'Wyrzuć użytkownika (Kick)',
    badge: 'Wyrzucenie',
    desc: 'Wyrzuca użytkownika z serwera z podanym powodem',
    icon: UserMinus,
    category: 'moderation',
    categoryName: 'Moderacja & Kary',
    color: 'text-rose-300',
    bgColor: 'bg-rose-950/40',
    borderColor: 'border-rose-500/50',
    accentBg: 'bg-rose-600'
  },
  {
    type: 'ban_member',
    title: 'Zbanuj użytkownika (Ban)',
    badge: 'Ban',
    desc: 'Banuje użytkownika i opcjonalnie usuwa historię wiadomości',
    icon: Ban,
    category: 'moderation',
    categoryName: 'Moderacja & Kary',
    color: 'text-red-400',
    bgColor: 'bg-red-950/50',
    borderColor: 'border-red-500/60',
    accentBg: 'bg-red-600'
  },

  // --- KATEGORIA: KANAŁY & TICKETY ---
  {
    type: 'create_channel',
    title: 'Utwórz kanał tekstowy',
    badge: 'Kanał +',
    desc: 'Tworzy nowy kanał tekstowy w określonej kategorii serwera',
    icon: FolderPlus,
    category: 'channel',
    categoryName: 'Kanały & Tickety',
    color: 'text-amber-300',
    bgColor: 'bg-amber-950/40',
    borderColor: 'border-amber-500/50',
    accentBg: 'bg-amber-600'
  },
  {
    type: 'create_ticket',
    title: 'Utwórz dedykowany pokój zgłoszenia',
    badge: 'Ticket',
    desc: 'Tworzy prywatny pokój zgłoszenia dostępny tylko dla autora i obsługi',
    icon: Ticket,
    category: 'channel',
    categoryName: 'Kanały & Tickety',
    color: 'text-amber-300',
    bgColor: 'bg-amber-950/40',
    borderColor: 'border-amber-500/50',
    accentBg: 'bg-amber-600'
  }
];

// Domyślne szablony gotowych komend
const PRESET_TEMPLATES: {
  id: string;
  name: string;
  desc: string;
  icon: any;
  flow: ActionFlow;
}[] = [
  {
    id: 'preset-help-embed',
    name: 'Komenda /pomoc (Embed)',
    desc: 'Wysyła estetyczną kartę Embed z informacjami o serwerze i komendach',
    icon: FileCode,
    flow: {
      id: 'flow-help-embed',
      name: 'Komenda /pomoc',
      description: 'Panel informacyjny serwera wywoływany przez /pomoc lub !pomoc',
      enabled: true,
      trigger: {
        type: 'command',
        commandName: 'pomoc',
        commandDescription: 'Wyświetla panel pomocy serwera',
        channelScope: 'all',
        roleScope: 'everyone'
      },
      steps: [
        {
          id: 's-1',
          type: 'send_embed',
          embedTitle: '🤖 Witamy w Centrum Pomocy {server.name}',
          embedDescription: 'Cześć {user}! Znajdziesz tutaj wszystkie najważniejsze informacje i zasady serwera.\n\n• **📜 Regulamin**: Zapoznaj się z zasadami na kanale z regulaminem.\n• **🎫 Zgłoszenia**: Masz problem? Skorzystaj z komendy `/ticket`.\n• **⭐ Rangi**: Bądź aktywny, aby zdobywać wyższe poziomy!',
          embedColor: '#5865F2',
          embedFooter: 'KitekBot • Styl BotGhost',
          includeTimestamp: true,
          targetChannel: 'same'
        }
      ]
    }
  },
  {
    id: 'preset-auto-role',
    name: 'Auto-Rola i Powitanie',
    desc: 'Po wejściu gracza wita go, czeka 3s i automatycznie nadaje rolę',
    icon: UserCheck,
    flow: {
      id: 'flow-autorole',
      name: 'Nowy Członek (Auto-Rola)',
      description: 'Automatyczne powitanie i nadanie rangi po dołączeniu',
      enabled: true,
      trigger: {
        type: 'member_join',
        channelScope: 'all'
      },
      steps: [
        {
          id: 's-w1',
          type: 'send_message',
          messageText: '🎉 Witaj na serwerze {user}! Cieszymy się, że do nas dołączyłeś!',
          targetChannel: 'same'
        },
        {
          id: 's-w2',
          type: 'wait',
          durationSeconds: 3
        },
        {
          id: 's-w3',
          type: 'give_role',
          roleName: 'Gracz'
        }
      ]
    }
  },
  {
    id: 'preset-verify-button',
    name: 'Weryfikacja Przyciskiem',
    desc: 'Po kliknięciu przycisku weryfikacji nadaje rolę i wysyła odpowiedź Ephemeral',
    icon: Zap,
    flow: {
      id: 'flow-verify-btn',
      name: 'Weryfikacja Przyciskiem',
      description: 'Kliknięcie w przycisk [Zweryfikuj się] nadaje rangę',
      enabled: true,
      trigger: {
        type: 'button_click',
        buttonCustomId: 'verify_btn',
        channelScope: 'all'
      },
      steps: [
        {
          id: 's-v1',
          type: 'give_role',
          roleName: 'Zweryfikowany'
        },
        {
          id: 's-v2',
          type: 'send_ephemeral',
          messageText: '✅ Twoje konto zostało pomyślnie zweryfikowane! Uzyskałeś dostęp do serwera.'
        }
      ]
    }
  },
  {
    id: 'preset-roll-dice',
    name: 'Rzut Kostką / Losowanie',
    desc: 'Losuje wynik rzutu kością lub monetą i odpowiada użytkownikowi',
    icon: Sparkles,
    flow: {
      id: 'flow-dice-roll',
      name: 'Komenda /losuj',
      description: 'Losowy rzut kostką dla członków',
      enabled: true,
      trigger: {
        type: 'command',
        commandName: 'losuj',
        commandDescription: 'Rzuca wirtualną kostką',
        channelScope: 'all',
        roleScope: 'everyone'
      },
      steps: [
        {
          id: 's-r1',
          type: 'random_choice',
          randomOptions: [
            '🎲 Wyrzuciłeś: **1**!',
            '🎲 Wyrzuciłeś: **2**!',
            '🎲 Wyrzuciłeś: **3**!',
            '🎲 Wyrzuciłeś: **4**!',
            '🎲 Wyrzuciłeś: **5**!',
            '🎲 Wyrzuciłeś: **6**! 🎉 Szczęśliwy rzut!'
          ],
          targetChannel: 'same'
        }
      ]
    }
  }
];

export function ActionsBuilder({ guild, onBackToDashboard }: ActionsBuilderProps) {
  const [flows, setFlows] = useState<ActionFlow[]>([]);
  // null = widok przeglądu komend (karty jak serwery w BotGhost), string = widok edycji bloków Scratch
  const [editingFlowId, setEditingFlowId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Wyszukiwarka i filtr komend
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'command' | 'message' | 'event' | 'button'>('all');

  // Modal wyboru bloku do dodania
  const [isAddStepModalOpen, setIsAddStepModalOpen] = useState<boolean>(false);
  const [insertAtIndex, setInsertAtIndex] = useState<number | null>(null);
  const [stepCategoryFilter, setStepCategoryFilter] = useState<ActionStepCategory | 'all'>('all');

  // Modal wyboru wyzwalacza
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState<boolean>(false);

  // Symulator na żywo (Live Simulator)
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [simulating, setSimulating] = useState<boolean>(false);
  const [simLogs, setSimLogs] = useState<{ id: string; text: string; time: string; type: 'info' | 'success' | 'wait' | 'warn' }[]>([]);

  // Dane kanałów i ról serwera
  const [availableChannels, setAvailableChannels] = useState<{ id: string; name: string }[]>([]);
  const [availableRoles, setAvailableRoles] = useState<{ id: string; name: string }[]>([]);

  // Załadowanie konfiguracji
  useEffect(() => {
    loadGuildConfig();
    loadGuildDetails();
  }, [guild.id]);

  const loadGuildDetails = async () => {
    try {
      const res = await fetch(`/api/bot/proxy/guilds/${guild.id}/details`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (Array.isArray(data.channels)) setAvailableChannels(data.channels);
          if (Array.isArray(data.roles)) setAvailableRoles(data.roles);
        }
      }
    } catch {}
  };

  const loadGuildConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      const localKey = `kitek_guild_config_${guild.id}`;
      const cached = localStorage.getItem(localKey);
      let initialFlows: ActionFlow[] = [];

      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed.actions) && parsed.actions.length > 0) {
            initialFlows = parsed.actions;
          }
        } catch {}
      }

      // Próba pobrania z API
      try {
        const res = await fetch(`/api/guilds/${guild.id}`);
        if (res.ok) {
          const remoteConfig: GuildConfig = await res.json();
          if (Array.isArray(remoteConfig.actions) && remoteConfig.actions.length > 0) {
            initialFlows = remoteConfig.actions;
          }
        }
      } catch {}

      if (initialFlows.length === 0) {
        initialFlows = PRESET_TEMPLATES.map((t) => ({ ...t.flow }));
      }

      setFlows(initialFlows);
    } catch (e: any) {
      setError('Nie udało się załadować listy komend: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const saveAllFlows = async (flowsToSave: ActionFlow[], showBadge: boolean = true) => {
    setSaving(true);
    setError(null);
    try {
      const localKey = `kitek_guild_config_${guild.id}`;
      let currentConfig: any = {};
      try {
        const cached = localStorage.getItem(localKey);
        if (cached) currentConfig = JSON.parse(cached);
      } catch {}

      const updatedConfig = {
        ...currentConfig,
        guildId: guild.id,
        guildName: guild.name,
        actions: flowsToSave,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem(localKey, JSON.stringify(updatedConfig));

      // Zapis na backendzie
      try {
        await fetch(`/api/guilds/${guild.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedConfig)
        });
      } catch {}

      setFlows(flowsToSave);
      if (showBadge) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err: any) {
      setError('Błąd zapisu komend: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Aktywny edytowany flow
  const currentFlow = flows.find((f) => f.id === editingFlowId) || null;

  const handleUpdateCurrentFlow = (updater: (prev: ActionFlow) => ActionFlow) => {
    if (!currentFlow) return;
    const updated = updater(currentFlow);
    const updatedFlows = flows.map((f) => (f.id === updated.id ? updated : f));
    setFlows(updatedFlows);
  };

  const handleToggleFlow = (flowId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = flows.map((f) => (f.id === flowId ? { ...f, enabled: !f.enabled } : f));
    saveAllFlows(updated, false);
  };

  const handleDeleteFlow = (flowId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm('Czy na pewno chcesz usunąć tę komendę?')) return;
    const updated = flows.filter((f) => f.id !== flowId);
    if (editingFlowId === flowId) setEditingFlowId(null);
    saveAllFlows(updated);
  };

  const handleDuplicateFlow = (flow: ActionFlow, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const duplicated: ActionFlow = {
      ...JSON.parse(JSON.stringify(flow)),
      id: 'flow-' + Date.now(),
      name: `${flow.name} (Kopia)`,
      trigger: {
        ...flow.trigger,
        commandName: flow.trigger.commandName ? `${flow.trigger.commandName}_kopia` : undefined
      }
    };
    const updated = [...flows, duplicated];
    saveAllFlows(updated);
  };

  const handleCreateNewCommand = () => {
    const newFlow: ActionFlow = {
      id: 'flow-' + Date.now(),
      name: 'Nowa Komenda Slash',
      description: 'Opisz działanie nowej komendy',
      enabled: true,
      trigger: {
        type: 'command',
        commandName: 'moja_komenda',
        commandDescription: 'Własna komenda utworzona w edytorze bloków',
        channelScope: 'all',
        roleScope: 'everyone'
      },
      steps: [
        {
          id: 'step-' + Date.now(),
          type: 'send_message',
          messageText: '👋 Witaj {user}! To jest nowa komenda na serwerze {server.name}.',
          targetChannel: 'same'
        }
      ]
    };
    const updated = [...flows, newFlow];
    saveAllFlows(updated);
    setEditingFlowId(newFlow.id);
  };

  const handleAddPreset = (preset: typeof PRESET_TEMPLATES[0]) => {
    const newFlow: ActionFlow = {
      ...JSON.parse(JSON.stringify(preset.flow)),
      id: 'flow-' + Date.now(),
      name: `${preset.flow.name} (${Math.floor(Math.random() * 90 + 10)})`
    };
    const updated = [...flows, newFlow];
    saveAllFlows(updated);
    setEditingFlowId(newFlow.id);
  };

  // Dodanie kroku akcji
  const handleAddStep = (type: ActionStepType) => {
    if (!currentFlow) return;
    const newStepId = 'step-' + Math.random().toString(36).substring(2, 9);
    let newStep: ActionStep = {
      id: newStepId,
      type
    };

    switch (type) {
      case 'condition_if':
        newStep = {
          ...newStep,
          conditionType: 'has_role',
          conditionValue: 'Gracz',
          messageText: '⚠️ Nie masz wymaganych uprawnień!',
          thenSteps: []
        };
        break;
      case 'cooldown':
        newStep = { ...newStep, cooldownSeconds: 10 };
        break;
      case 'wait':
        newStep = { ...newStep, durationSeconds: 3 };
        break;
      case 'send_message':
        newStep = {
          ...newStep,
          messageText: 'Wiadomość bota: Witaj {user}!',
          targetChannel: 'same'
        };
        break;
      case 'send_embed':
        newStep = {
          ...newStep,
          embedTitle: '📌 Tytuł Wiadomości',
          embedDescription: 'Treść karty embed dla użytkownika {user}.',
          embedColor: '#5865F2',
          embedFooter: 'KitekBot • Scratch System',
          includeTimestamp: true,
          targetChannel: 'same'
        };
        break;
      case 'send_ephemeral':
        newStep = {
          ...newStep,
          messageText: '🔒 Wiadomość widoczna wyłącznie dla Ciebie ({user}).'
        };
        break;
      case 'send_dm':
        newStep = {
          ...newStep,
          messageText: '👋 Wiadomość prywatna DM od bota na serwerze {server.name}!'
        };
        break;
      case 'add_reaction':
        newStep = { ...newStep, emoji: '✅' };
        break;
      case 'give_role':
        newStep = { ...newStep, roleName: 'Zweryfikowany' };
        break;
      case 'remove_role':
        newStep = { ...newStep, roleName: 'Gość' };
        break;
      case 'change_nickname':
        newStep = { ...newStep, newNickname: '[Zweryfikowany] {user.name}' };
        break;
      case 'timeout_member':
        newStep = { ...newStep, timeoutMinutes: 10, reason: 'Naruszenie regulaminu czatu' };
        break;
      case 'kick_member':
        newStep = { ...newStep, reason: 'Wyrzucony za pośrednictwem automatyzacji bota' };
        break;
      case 'ban_member':
        newStep = { ...newStep, reason: 'Zbanowany przez regułę blokową', deleteMessageDays: 1 };
        break;
      case 'create_channel':
        newStep = { ...newStep, newChannelName: 'nowy-kanal', categoryName: 'KANAŁY TEKSTOWE' };
        break;
      case 'create_ticket':
        newStep = { ...newStep, newChannelName: 'ticket-{user.name}', categoryName: '🎫・TICKETY' };
        break;
      case 'random_choice':
        newStep = {
          ...newStep,
          randomOptions: ['Wariant 1: Sukces!', 'Wariant 2: Spróbuj ponownie!', 'Wariant 3: Wspaniale!']
        };
        break;
      case 'purge_messages':
        newStep = { ...newStep, purgeCount: 10 };
        break;
      default:
        break;
    }

    handleUpdateCurrentFlow((prev) => {
      const steps = [...prev.steps];
      if (insertAtIndex !== null && insertAtIndex >= 0 && insertAtIndex <= steps.length) {
        steps.splice(insertAtIndex, 0, newStep);
      } else {
        steps.push(newStep);
      }
      return { ...prev, steps };
    });

    setIsAddStepModalOpen(false);
    setInsertAtIndex(null);
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    if (!currentFlow) return;
    handleUpdateCurrentFlow((prev) => {
      const steps = [...prev.steps];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= steps.length) return prev;
      const temp = steps[index];
      steps[index] = steps[targetIndex];
      steps[targetIndex] = temp;
      return { ...prev, steps };
    });
  };

  const handleDuplicateStep = (index: number) => {
    if (!currentFlow) return;
    handleUpdateCurrentFlow((prev) => {
      const steps = [...prev.steps];
      const stepToCopy = steps[index];
      const duplicated = {
        ...JSON.parse(JSON.stringify(stepToCopy)),
        id: 'step-' + Math.random().toString(36).substring(2, 9)
      };
      steps.splice(index + 1, 0, duplicated);
      return { ...prev, steps };
    });
  };

  const handleDeleteStep = (index: number) => {
    if (!currentFlow) return;
    handleUpdateCurrentFlow((prev) => {
      const steps = prev.steps.filter((_, i) => i !== index);
      return { ...prev, steps };
    });
  };

  // Uruchomienie symulacji na żywo
  const handleRunSimulation = async () => {
    if (!currentFlow) return;
    setIsSimulatorOpen(true);
    setSimulating(true);
    setSimLogs([]);

    const log = (text: string, type: 'info' | 'success' | 'wait' | 'warn' = 'info') => {
      const time = new Date().toLocaleTimeString();
      setSimLogs((prev) => [...prev, { id: Math.random().toString(36), text, time, type }]);
    };

    log(`🚀 [Start] Uruchamianie komendy: "${currentFlow.name}"`, 'info');
    log(`🎯 [Wyzwalacz] Typ: ${currentFlow.trigger.type} (${currentFlow.trigger.commandName ? '/' + currentFlow.trigger.commandName : 'Zdarzenie serwera'})`, 'info');

    for (let i = 0; i < currentFlow.steps.length; i++) {
      const step = currentFlow.steps[i];
      const stepDef = STEP_DEFINITIONS.find((s) => s.type === step.type);
      const title = stepDef?.title || step.type;

      if (step.type === 'wait') {
        const secs = step.durationSeconds || 3;
        log(`⏳ [Krok ${i + 1}] Oczekiwanie ${secs}s...`, 'wait');
        await new Promise((r) => setTimeout(r, Math.min(secs * 400, 1500)));
        log(`⏱️ [Krok ${i + 1}] Czas minął! Przejście do kolejnego bloku.`, 'info');
      } else if (step.type === 'condition_if') {
        log(`🔍 [Krok ${i + 1}] Sprawdzanie warunku IF (${step.conditionType}: "${step.conditionValue || 'Rola'}")...`, 'info');
        await new Promise((r) => setTimeout(r, 400));
        log(`✅ [Krok ${i + 1}] Warunek spełniony (PASS)! Wykonywanie gałęzi THEN.`, 'success');
      } else if (step.type === 'cooldown') {
        log(`⏱️ [Krok ${i + 1}] Zastosowano cooldown ${step.cooldownSeconds || 10}s na użytkownika.`, 'info');
      } else if (step.type === 'send_message') {
        log(`💬 [Krok ${i + 1}] Wysłano wiadomość: "${step.messageText?.substring(0, 40)}..."`, 'success');
      } else if (step.type === 'send_embed') {
        log(`📄 [Krok ${i + 1}] Wysłano kartę Embed: "${step.embedTitle || 'Bez tytułu'}"`, 'success');
      } else if (step.type === 'send_ephemeral') {
        log(`🔒 [Krok ${i + 1}] Odpowiedź Ephemeral: "${step.messageText?.substring(0, 40)}..."`, 'success');
      } else if (step.type === 'give_role') {
        log(`👑 [Krok ${i + 1}] Nadano rolę: @${step.roleName || 'Rola'} użytkownikowi!`, 'success');
      } else if (step.type === 'remove_role') {
        log(`🗑️ [Krok ${i + 1}] Odebrano rolę: @${step.roleName || 'Rola'}!`, 'info');
      } else if (step.type === 'add_reaction') {
        log(`✨ [Krok ${i + 1}] Dodano reakcję: ${step.emoji || '✅'} do wiadomości.`, 'success');
      } else {
        log(`⚙️ [Krok ${i + 1}] Wykonano blok: ${title}`, 'success');
      }
      await new Promise((r) => setTimeout(r, 200));
    }

    log(`🏁 [Sukces] Przepływ komendy "${currentFlow.name}" zakończony pomyślnie!`, 'success');
    setSimulating(false);
  };

  // Filtrowanie komend w widoku listy
  const filteredFlows = flows.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.trigger.commandName && f.trigger.commandName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (f.description && f.description.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterCategory === 'all') return true;
    if (filterCategory === 'command') return f.trigger.type === 'command';
    if (filterCategory === 'message') return f.trigger.type === 'message_sent';
    if (filterCategory === 'event') return f.trigger.type === 'member_join' || f.trigger.type === 'member_leave' || f.trigger.type === 'schedule';
    if (filterCategory === 'button') return f.trigger.type === 'button_click' || f.trigger.type === 'select_menu' || f.trigger.type === 'reaction_add';
    return true;
  });

  // Pomocnik wstawiania zmiennych do tekstu
  const insertVariable = (variable: string, fieldSetter: (val: string) => void, currentValue: string) => {
    fieldSetter(currentValue ? `${currentValue} ${variable}` : variable);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-neutral-400">
        <Loader2 className="w-8 h-8 animate-spin text-[#5865F2] mb-3" />
        <p className="text-sm font-bold">Ładowanie systemu komend i bloków Scratch...</p>
      </div>
    );
  }

  // =========================================================================
  // WIDOK 1: PRZEGLĄD KOMEND (BOTGHOST COMMANDS DASHBOARD)
  // =========================================================================
  if (!editingFlowId || !currentFlow) {
    return (
      <div className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* NAGŁÓWEK GŁÓWNY */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#3b3c47]">
          <div className="flex items-center gap-3.5">
            <button
              onClick={onBackToDashboard}
              title="Wróć do listy serwerów"
              className="p-2.5 bg-[#272831] hover:bg-[#202128] text-neutral-400 hover:text-white rounded-xl border border-[#3b3c47] transition-all cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <Terminal className="w-6 h-6 text-[#5865F2]" />
                  <span>Własne Komendy</span>
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wider uppercase bg-[#5865F2]/20 text-[#8590ff] border border-[#5865F2]/40">
                  Styl BotGhost & Scratch
                </span>
                <span className="text-xs text-neutral-400 font-medium">
                  na serwerze <strong className="text-white font-bold">{guild.name}</strong>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-300 font-medium mt-1">
                Wizualny edytor komend i automatyzacji blokowych — układaj klocki jak w Scratchu i twórz unikalne funkcje bota!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="create-new-command-top-btn"
              onClick={handleCreateNewCommand}
              className="px-4 py-2.5 bg-gradient-to-r from-[#5865F2] to-[#7289DA] hover:from-[#4752C4] hover:to-[#5865F2] text-white rounded-xl text-xs sm:text-sm font-black tracking-wide uppercase transition-all shadow-lg shadow-indigo-950/40 flex items-center gap-2 active:scale-95 cursor-pointer border border-[#8590ff]/50"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Utwórz komendę</span>
            </button>
          </div>
        </div>

        {/* PASEK STATYSTYK I WYSZUKIWARKI */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Szukaj komendy (np. /pomoc, !ranga)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#272831] border border-[#3b3c47] rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#5865F2] transition-colors"
            />
          </div>

          <div className="flex items-center justify-between px-4 py-2.5 bg-[#272831] border border-[#3b3c47] rounded-xl">
            <span className="text-xs font-bold text-neutral-400 uppercase">Wszystkie komendy</span>
            <span className="text-base font-black text-white">{flows.length}</span>
          </div>

          <div className="flex items-center justify-between px-4 py-2.5 bg-[#272831] border border-[#3b3c47] rounded-xl">
            <span className="text-xs font-bold text-neutral-400 uppercase">Aktywne w bocie</span>
            <span className="text-base font-black text-emerald-400">
              {flows.filter((f) => f.enabled).length}
            </span>
          </div>
        </div>

        {/* FILTRY KATEGORII */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'Wszystkie' },
            { id: 'command', label: 'Komendy Slash / Prefiks ( / )' },
            { id: 'message', label: 'Wiadomości Czatu ( 💬 )' },
            { id: 'event', label: 'Zdarzenia & Auto-Role ( ⚡ )' },
            { id: 'button', label: 'Przyciski & Reakcje ( 🔘 )' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                filterCategory === cat.id
                  ? 'bg-[#5865F2] text-white shadow-sm'
                  : 'bg-[#272831] text-neutral-400 hover:text-white hover:bg-[#202128]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* SZABLONY SZYBKIEGO STARTU */}
        <div className="p-4 rounded-2xl bg-[#2a2b35] border border-[#3f404e] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Szybkie szablony BotGhost (Kliknij, aby dodać)</span>
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {PRESET_TEMPLATES.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleAddPreset(preset)}
                className="p-3 rounded-xl bg-[#202128] hover:bg-[#1a1b21] border border-[#3b3c47] hover:border-[#5865F2]/50 text-left transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-[#5865F2]/10 text-[#8590ff] group-hover:scale-105 transition-transform">
                    <preset.icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-black text-white group-hover:text-[#8590ff] transition-colors">
                    {preset.name}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                  {preset.desc}
                </p>
                <span className="text-[10px] font-bold text-emerald-400 mt-2 flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Dodaj ten szablon
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* SIATKA KART KOMEND (JAK KARTY SERWERÓW W BOTGHOST) */}
        {filteredFlows.length === 0 ? (
          <div className="py-16 text-center bg-[#272831] border border-[#3b3c47] rounded-2xl p-6 space-y-3">
            <Terminal className="w-10 h-10 text-neutral-500 mx-auto" />
            <h3 className="text-base font-bold text-white">Brak pasujących komend</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Nie znaleziono komend odpowiadających kryteriom wyszukiwania. Utwórz pierwszą własną komendę lub wybierz gotowy szablon!
            </p>
            <button
              onClick={handleCreateNewCommand}
              className="mt-2 px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-xl text-xs font-bold transition-all"
            >
              + Utwórz nową komendę
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFlows.map((flow) => {
              const trigDef = TRIGGER_DEFINITIONS.find((t) => t.type === flow.trigger.type) || TRIGGER_DEFINITIONS[0];
              const TrigIcon = trigDef.icon;

              return (
                <div
                  key={flow.id}
                  onClick={() => setEditingFlowId(flow.id)}
                  className={`p-4 rounded-2xl bg-[#282933] hover:bg-[#23242e] border transition-all duration-200 flex flex-col justify-between group cursor-pointer shadow-md relative overflow-hidden ${
                    flow.enabled
                      ? 'border-[#3f404e] hover:border-[#5865F2]'
                      : 'border-neutral-800 opacity-65 hover:opacity-100 hover:border-neutral-600'
                  }`}
                >
                  {/* Górna belka karty */}
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`p-2.5 rounded-xl border ${trigDef.bgColor} ${trigDef.color} ${trigDef.borderColor} shrink-0`}>
                          <TrigIcon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-black text-white truncate group-hover:text-[#8590ff] transition-colors">
                            {flow.name}
                          </h3>
                          <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1">
                            {flow.trigger.type === 'command' ? (
                              <span className="text-amber-400 font-bold">/{flow.trigger.commandName || 'komenda'}</span>
                            ) : (
                              <span>{trigDef.badge}</span>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Przełącznik aktywności */}
                      <button
                        onClick={(e) => handleToggleFlow(flow.id, e)}
                        title={flow.enabled ? 'Komenda aktywna (Kliknij, aby wyłączyć)' : 'Komenda nieaktywna (Kliknij, aby włączyć)'}
                        className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 cursor-pointer shrink-0 ${
                          flow.enabled ? 'bg-emerald-500' : 'bg-neutral-600'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 shadow-sm ${
                            flow.enabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <p className="text-xs text-neutral-400 line-clamp-2 min-h-[32px] leading-relaxed">
                      {flow.description || 'Brak opisu komendy.'}
                    </p>

                    {/* Podgląd bloków Scratch wewnątrz komendy */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-[#202128] text-neutral-300 border border-[#3b3c47]">
                        🧩 {flow.steps.length} {flow.steps.length === 1 ? 'blok' : 'bloków'}
                      </span>
                      {flow.steps.slice(0, 3).map((st, idx) => {
                        const stepDef = STEP_DEFINITIONS.find((s) => s.type === st.type);
                        return (
                          <span
                            key={idx}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border truncate max-w-[110px] ${
                              stepDef?.bgColor || 'bg-neutral-800'
                            } ${stepDef?.color || 'text-neutral-300'} ${stepDef?.borderColor || 'border-neutral-700'}`}
                          >
                            {stepDef?.badge || st.type}
                          </span>
                        );
                      })}
                      {flow.steps.length > 3 && (
                        <span className="text-[10px] text-neutral-500 font-bold">
                          +{flow.steps.length - 3} więcej
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dolny pasek akcji */}
                  <div className="pt-3 mt-3 border-t border-[#343542] flex items-center justify-between gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingFlowId(flow.id);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-black tracking-wide uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Edytuj bloki Scratch</span>
                    </button>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleDuplicateFlow(flow, e)}
                        title="Duplikuj komendę"
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteFlow(flow.id, e)}
                        title="Usuń komendę"
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // WIDOK 2: WIZUALNY EDYTOR BLOKÓW W STYLU SCRATCH
  // =========================================================================
  const trigDef = TRIGGER_DEFINITIONS.find((t) => t.type === currentFlow.trigger.type) || TRIGGER_DEFINITIONS[0];
  const TrigIcon = trigDef.icon;

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* GÓRNY PASEK NAWIGACJI I ZAPISU */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#282933] border border-[#3b3c47] shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              saveAllFlows(flows, false);
              setEditingFlowId(null);
            }}
            title="Powrót do listy komend"
            className="p-2 bg-[#1f2027] hover:bg-[#181920] text-neutral-300 hover:text-white rounded-xl border border-[#3b3c47] transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Powrót do komend</span>
          </button>

          <div className="min-w-0">
            <input
              type="text"
              value={currentFlow.name}
              onChange={(e) => handleUpdateCurrentFlow((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Nazwa komendy..."
              className="text-base sm:text-lg font-black text-white bg-transparent border-b border-transparent hover:border-[#5865F2] focus:border-[#5865F2] focus:outline-none transition-colors px-1"
            />
            <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-400">
              <span className="font-mono text-amber-400">/{currentFlow.trigger.commandName || 'komenda'}</span>
              <span>&bull;</span>
              <span>{currentFlow.steps.length} {currentFlow.steps.length === 1 ? 'blok akcji' : 'bloków akcji'}</span>
            </div>
          </div>
        </div>

        {/* PRZYCISKI AKCJI GÓRNEJ */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Symulator */}
          <button
            onClick={handleRunSimulation}
            title="Przetestuj wykonanie komendy w symulatorze"
            className="px-3.5 py-2 bg-[#2d2e38] hover:bg-[#23242c] text-neutral-200 hover:text-white rounded-xl text-xs font-bold border border-[#3f404e] transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
            <span>Testuj w symulatorze</span>
          </button>

          {/* Przełącznik aktywności */}
          <button
            onClick={() => handleToggleFlow(currentFlow.id)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
              currentFlow.enabled
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700'
            }`}
          >
            <Radio className="w-3 h-3" />
            <span>{currentFlow.enabled ? 'Aktywna' : 'Wyłączona'}</span>
          </button>

          {/* Przycisk zapisu */}
          <button
            id="save-command-flow-btn"
            onClick={() => saveAllFlows(flows)}
            disabled={saving}
            className="px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-md shadow-indigo-950/40 cursor-pointer"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : saveSuccess ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{saveSuccess ? 'Zapisano!' : 'Zapisz komendę'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* PÓŁKA KATEGORII KLOCKÓW SCRATCH (SCRATCH PALETTE BAR) */}
      <div className="p-4 rounded-2xl bg-[#24252f] border border-[#3b3c47] space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-neutral-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#5865F2]" />
            <span>Kategorie Klocków Scratch (Wybierz, aby wstawić blok)</span>
          </span>
          <span className="text-[11px] text-neutral-400 font-medium">
            Łącz klocki pionowo w interaktywny przepływ!
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          <button
            onClick={() => setIsTriggerModalOpen(true)}
            className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-left transition-all flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-3 h-3 rounded-full bg-amber-400 group-hover:scale-110 transition-transform" />
            <div className="min-w-0">
              <div className="text-xs font-black truncate">Wyzwalacze</div>
              <div className="text-[10px] text-amber-300/70 truncate">Zmień zdarzenie</div>
            </div>
          </button>

          <button
            onClick={() => {
              setStepCategoryFilter('logic');
              setIsAddStepModalOpen(true);
            }}
            className="p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-left transition-all flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-3 h-3 rounded-full bg-purple-400 group-hover:scale-110 transition-transform" />
            <div className="min-w-0">
              <div className="text-xs font-black truncate">Logika & Kontrola</div>
              <div className="text-[10px] text-purple-300/70 truncate">IF, Czekaj, Cooldown</div>
            </div>
          </button>

          <button
            onClick={() => {
              setStepCategoryFilter('message');
              setIsAddStepModalOpen(true);
            }}
            className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-left transition-all flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-3 h-3 rounded-full bg-emerald-400 group-hover:scale-110 transition-transform" />
            <div className="min-w-0">
              <div className="text-xs font-black truncate">Wiadomości</div>
              <div className="text-[10px] text-emerald-300/70 truncate">Embed, DM, Ephemeral</div>
            </div>
          </button>

          <button
            onClick={() => {
              setStepCategoryFilter('member');
              setIsAddStepModalOpen(true);
            }}
            className="p-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 text-left transition-all flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-3 h-3 rounded-full bg-sky-400 group-hover:scale-110 transition-transform" />
            <div className="min-w-0">
              <div className="text-xs font-black truncate">Role & Użytkownicy</div>
              <div className="text-[10px] text-sky-300/70 truncate">Nadaj / Odbierz rangę</div>
            </div>
          </button>

          <button
            onClick={() => {
              setStepCategoryFilter('moderation');
              setIsAddStepModalOpen(true);
            }}
            className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-left transition-all flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-3 h-3 rounded-full bg-rose-400 group-hover:scale-110 transition-transform" />
            <div className="min-w-0">
              <div className="text-xs font-black truncate">Moderacja</div>
              <div className="text-[10px] text-rose-300/70 truncate">Timeout, Kick, Ban</div>
            </div>
          </button>
        </div>
      </div>

      {/* GŁÓWNA PLANSZA BLOKÓW SCRATCH (PUZZLE STACK CANVAS) */}
      <div className="relative flex flex-col items-center space-y-0 pt-2 pb-8">
        {/* ================================================================= */}
        {/* BLOK 0: SCRATCH HAT BLOCK (WYZWALACZ / EVENT)                     */}
        {/* ================================================================= */}
        <div className="w-full max-w-3xl rounded-3xl bg-[#282933] border-2 border-amber-500/70 shadow-2xl overflow-hidden relative group">
          {/* Scratch Hat Curve Header (Pomarańczowa wypukłość czapki) */}
          <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 px-5 py-3 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-black/20 text-white">
                <TrigIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black tracking-wider uppercase text-amber-100">
                  Wyzwalacz (Hat Block - Kiedy...)
                </span>
                <h2 className="text-sm font-black text-white">{trigDef.title}</h2>
              </div>
            </div>

            <button
              onClick={() => setIsTriggerModalOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-black/25 hover:bg-black/40 text-xs font-bold text-white transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>Zmień wyzwalacz</span>
              <Sliders className="w-3 h-3" />
            </button>
          </div>

          {/* Pola konfiguracji wyzwalacza */}
          <div className="p-5 space-y-4 bg-[#23242e]">
            {currentFlow.trigger.type === 'command' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                    Nazwa komendy (bez spacji) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 font-mono font-bold">/</span>
                    <input
                      type="text"
                      placeholder="np. pomoc, ranga, zweryfikuj"
                      value={currentFlow.trigger.commandName || ''}
                      onChange={(e) =>
                        handleUpdateCurrentFlow((prev) => ({
                          ...prev,
                          trigger: {
                            ...prev.trigger,
                            commandName: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '')
                          }
                        }))
                      }
                      className="w-full pl-7 pr-3 py-2 bg-[#191a21] border border-[#3b3c47] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                    Opis komendy w Discordzie
                  </label>
                  <input
                    type="text"
                    placeholder="np. Wyświetla panel pomocy serwera"
                    value={currentFlow.trigger.commandDescription || ''}
                    onChange={(e) =>
                      handleUpdateCurrentFlow((prev) => ({
                        ...prev,
                        trigger: { ...prev.trigger, commandDescription: e.target.value }
                      }))
                    }
                    className="w-full px-3 py-2 bg-[#191a21] border border-[#3b3c47] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            {currentFlow.trigger.type === 'message_sent' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                    Treść lub fraza wyzwalająca *
                  </label>
                  <input
                    type="text"
                    placeholder="np. !pomoc, !ip, hejka"
                    value={currentFlow.trigger.messageContent || ''}
                    onChange={(e) =>
                      handleUpdateCurrentFlow((prev) => ({
                        ...prev,
                        trigger: { ...prev.trigger, messageContent: e.target.value }
                      }))
                    }
                    className="w-full px-3 py-2 bg-[#191a21] border border-[#3b3c47] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                    Sposób dopasowania wiadomości
                  </label>
                  <select
                    value={currentFlow.trigger.messageMatchType || 'contains'}
                    onChange={(e) =>
                      handleUpdateCurrentFlow((prev) => ({
                        ...prev,
                        trigger: { ...prev.trigger, messageMatchType: e.target.value as any }
                      }))
                    }
                    className="w-full px-3 py-2 bg-[#191a21] border border-[#3b3c47] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="contains">Wiadomość zawiera frazę</option>
                    <option value="starts_with">Wiadomość zaczyna się od</option>
                    <option value="exact">Dokładne dopasowanie całej treści</option>
                  </select>
                </div>
              </div>
            )}

            {currentFlow.trigger.type === 'button_click' && (
              <div>
                <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                  Identyfikator przycisku (Custom ID) *
                </label>
                <input
                  type="text"
                  placeholder="np. verify_btn, ticket_open, pomoc_btn"
                  value={currentFlow.trigger.buttonCustomId || ''}
                  onChange={(e) =>
                    handleUpdateCurrentFlow((prev) => ({
                      ...prev,
                      trigger: { ...prev.trigger, buttonCustomId: e.target.value }
                    }))
                  }
                  className="w-full px-3 py-2 bg-[#191a21] border border-[#3b3c47] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            )}

            {/* Zasięg kanałów i ról */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-[#31333f]">
              <div>
                <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                  Zasięg kanału
                </label>
                <select
                  value={currentFlow.trigger.channelScope}
                  onChange={(e) =>
                    handleUpdateCurrentFlow((prev) => ({
                      ...prev,
                      trigger: { ...prev.trigger, channelScope: e.target.value as any }
                    }))
                  }
                  className="w-full px-3 py-2 bg-[#191a21] border border-[#3b3c47] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="all">Wszystkie kanały serwera</option>
                  <option value="specific">Tylko wybrany kanał</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                  Kto może używać?
                </label>
                <select
                  value={currentFlow.trigger.roleScope || 'everyone'}
                  onChange={(e) =>
                    handleUpdateCurrentFlow((prev) => ({
                      ...prev,
                      trigger: { ...prev.trigger, roleScope: e.target.value as any }
                    }))
                  }
                  className="w-full px-3 py-2 bg-[#191a21] border border-[#3b3c47] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="everyone">Wszyscy użytkownicy (@everyone)</option>
                  <option value="admin_only">Tylko Administratorzy</option>
                </select>
              </div>
            </div>
          </div>

          {/* Puzzle Tab notch dolny */}
          <div className="h-3 bg-[#23242e] flex justify-center items-center">
            <div className="w-12 h-2.5 bg-[#282933] border-x border-b border-amber-500/50 rounded-b-md" />
          </div>
        </div>

        {/* ================================================================= */}
        {/* LISTA BLOKÓW AKCJI I LOGIKI (SCRATCH PUZZLE CONNECTOR STACK)      */}
        {/* ================================================================= */}
        {currentFlow.steps.map((step, index) => {
          const stepDef = STEP_DEFINITIONS.find((s) => s.type === step.type) || STEP_DEFINITIONS[0];
          const StepIcon = stepDef.icon;

          return (
            <div key={step.id} className="w-full max-w-3xl flex flex-col items-center">
              {/* Przycisk wstawiania bloku pomiędzy klocki */}
              <div className="py-1.5 flex justify-center group/ins">
                <button
                  onClick={() => {
                    setInsertAtIndex(index);
                    setIsAddStepModalOpen(true);
                  }}
                  title="Wstaw nowy blok w tym miejscu"
                  className="px-3 py-1 rounded-full bg-[#1e1f26] hover:bg-[#5865F2] text-neutral-400 hover:text-white border border-[#3b3c47] hover:border-[#5865F2] text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 shadow-sm opacity-50 group-hover/ins:opacity-100 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Wstaw blok</span>
                </button>
              </div>

              {/* Klocek akcji w stylu Scratch */}
              <div
                className={`w-full rounded-2xl border-2 shadow-xl overflow-hidden transition-all bg-[#282933] ${stepDef.borderColor}`}
              >
                {/* Belka nagłówkowa klocka (Scratch block header) */}
                <div
                  className={`px-4 py-2.5 text-white flex items-center justify-between ${stepDef.bgColor} border-b ${stepDef.borderColor}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-black/30 text-white">
                      #{index + 1}
                    </span>
                    <div className={`p-1.5 rounded-lg bg-black/20 ${stepDef.color}`}>
                      <StepIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-white">{stepDef.title}</span>
                      <span className="ml-2 text-[10px] uppercase font-bold opacity-75">
                        ({stepDef.categoryName})
                      </span>
                    </div>
                  </div>

                  {/* Narzędzia bloku: góra, dół, duplikuj, usuń */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMoveStep(index, 'up')}
                      disabled={index === 0}
                      title="Przesuń w górę"
                      className="p-1 rounded text-neutral-300 hover:text-white hover:bg-black/20 disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveStep(index, 'down')}
                      disabled={index === currentFlow.steps.length - 1}
                      title="Przesuń w dół"
                      className="p-1 rounded text-neutral-300 hover:text-white hover:bg-black/20 disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDuplicateStep(index)}
                      title="Duplikuj blok"
                      className="p-1 rounded text-neutral-300 hover:text-white hover:bg-black/20 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteStep(index)}
                      title="Usuń blok"
                      className="p-1 rounded text-neutral-300 hover:text-rose-400 hover:bg-black/20 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Pola konfiguracji wnętrza klocka */}
                <div className="p-4 space-y-3.5 bg-[#23242e]">
                  {/* --- BLOK: WARUNEK IF (LOGIKA) --- */}
                  {step.type === 'condition_if' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-purple-300 uppercase mb-1">
                            Warunek logiczny (Jeżeli...)
                          </label>
                          <select
                            value={step.conditionType || 'has_role'}
                            onChange={(e) =>
                              handleUpdateCurrentFlow((prev) => {
                                const steps = [...prev.steps];
                                steps[index] = { ...steps[index], conditionType: e.target.value as any };
                                return { ...prev, steps };
                              })
                            }
                            className="w-full px-3 py-2 bg-[#191a21] border border-purple-500/40 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400 cursor-pointer"
                          >
                            <option value="has_role">Użytkownik posiada rolę</option>
                            <option value="has_permission">Użytkownik ma uprawnienia Administratora</option>
                            <option value="message_contains">Wiadomość zawiera określony tekst</option>
                            <option value="random_chance">Losowa szansa (%)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-purple-300 uppercase mb-1">
                            Wartość warunku
                          </label>
                          <input
                            type="text"
                            placeholder="np. Nazwa roli lub tekst"
                            value={step.conditionValue || ''}
                            onChange={(e) =>
                              handleUpdateCurrentFlow((prev) => {
                                const steps = [...prev.steps];
                                steps[index] = { ...steps[index], conditionValue: e.target.value };
                                return { ...prev, steps };
                              })
                            }
                            className="w-full px-3 py-2 bg-[#191a21] border border-purple-500/40 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                          Wiadomość błędu (gdy warunek nie jest spełniony)
                        </label>
                        <input
                          type="text"
                          placeholder="np. ⚠️ Nie masz uprawnień do wykonania tej akcji!"
                          value={step.messageText || ''}
                          onChange={(e) =>
                            handleUpdateCurrentFlow((prev) => {
                              const steps = [...prev.steps];
                              steps[index] = { ...steps[index], messageText: e.target.value };
                              return { ...prev, steps };
                            })
                          }
                          className="w-full px-3 py-2 bg-[#191a21] border border-[#3b3c47] rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
                        />
                      </div>
                    </div>
                  )}

                  {/* --- BLOK: COOLDOWN --- */}
                  {step.type === 'cooldown' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-purple-300 uppercase mb-1">
                          Czas cooldownu (w sekundach)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="3600"
                          value={step.cooldownSeconds || 10}
                          onChange={(e) =>
                            handleUpdateCurrentFlow((prev) => {
                              const steps = [...prev.steps];
                              steps[index] = { ...steps[index], cooldownSeconds: parseInt(e.target.value) || 5 };
                              return { ...prev, steps };
                            })
                          }
                          className="w-full px-3 py-2 bg-[#191a21] border border-purple-500/40 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
                        />
                      </div>
                      <div className="flex items-center text-xs text-neutral-400 pt-5">
                        <span>Zabezpiecza przed spamowaniem komendą na serwerze.</span>
                      </div>
                    </div>
                  )}

                  {/* --- BLOK: WAIT / OPÓŹNIENIE --- */}
                  {step.type === 'wait' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-purple-300 uppercase mb-1">
                          Czas oczekiwania (sekundy)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="300"
                          value={step.durationSeconds || 3}
                          onChange={(e) =>
                            handleUpdateCurrentFlow((prev) => {
                              const steps = [...prev.steps];
                              steps[index] = { ...steps[index], durationSeconds: parseInt(e.target.value) || 1 };
                              return { ...prev, steps };
                            })
                          }
                          className="w-full px-3 py-2 bg-[#191a21] border border-purple-500/40 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
                        />
                      </div>
                      <div className="flex items-center text-xs text-neutral-400 pt-5">
                        <span>Wstrzymuje wykonanie kolejnych klocków o zadany czas.</span>
                      </div>
                    </div>
                  )}

                  {/* --- BLOK: WYŚLIJ WIADOMOŚĆ / EPHEMERAL / DM --- */}
                  {(step.type === 'send_message' || step.type === 'send_ephemeral' || step.type === 'send_dm') && (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold text-emerald-300 uppercase">
                          Treść wiadomości (obsługuje Markdown i zmienne)
                        </label>
                        {step.type === 'send_message' && (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-neutral-400">Kanał docelowy:</span>
                            <select
                              value={step.targetChannel || 'same'}
                              onChange={(e) =>
                                handleUpdateCurrentFlow((prev) => {
                                  const steps = [...prev.steps];
                                  steps[index] = { ...steps[index], targetChannel: e.target.value as any };
                                  return { ...prev, steps };
                                })
                              }
                              className="px-2 py-1 bg-[#191a21] border border-[#3b3c47] rounded-lg text-xs text-white cursor-pointer"
                            >
                              <option value="same">Ten sam kanał co komenda</option>
                              {availableChannels.map((c) => (
                                <option key={c.id} value={c.id}>
                                  #{c.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>

                      <textarea
                        rows={3}
                        placeholder="Wpisz treść wiadomości... Np. Witaj {user} na serwerze {server.name}!"
                        value={step.messageText || ''}
                        onChange={(e) =>
                          handleUpdateCurrentFlow((prev) => {
                            const steps = [...prev.steps];
                            steps[index] = { ...steps[index], messageText: e.target.value };
                            return { ...prev, steps };
                          })
                        }
                        className="w-full px-3 py-2 bg-[#191a21] border border-emerald-500/30 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-400 leading-relaxed font-sans"
                      />

                      {/* Pomocnik wstawiania zmiennych */}
                      <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                        <span className="text-neutral-500 font-bold">Wstaw zmienną:</span>
                        {['{user}', '{user.name}', '{server.name}', '{channel}'].map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() =>
                              insertVariable(
                                v,
                                (val) =>
                                  handleUpdateCurrentFlow((prev) => {
                                    const steps = [...prev.steps];
                                    steps[index] = { ...steps[index], messageText: val };
                                    return { ...prev, steps };
                                  }),
                                step.messageText || ''
                              )
                            }
                            className="px-2 py-0.5 rounded bg-[#2a2b38] hover:bg-[#343647] text-neutral-300 font-mono text-[10px] border border-[#3f4050] transition-colors cursor-pointer"
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* --- BLOK: WYŚLIJ EMBED --- */}
                  {step.type === 'send_embed' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-emerald-300 uppercase mb-1">
                            Tytuł Embedu *
                          </label>
                          <input
                            type="text"
                            placeholder="np. 📌 Informacje o Serwerze"
                            value={step.embedTitle || ''}
                            onChange={(e) =>
                              handleUpdateCurrentFlow((prev) => {
                                const steps = [...prev.steps];
                                steps[index] = { ...steps[index], embedTitle: e.target.value };
                                return { ...prev, steps };
                              })
                            }
                            className="w-full px-3 py-2 bg-[#191a21] border border-emerald-500/30 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-emerald-300 uppercase mb-1">
                            Kolor paska bocznego
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={step.embedColor || '#5865F2'}
                              onChange={(e) =>
                                handleUpdateCurrentFlow((prev) => {
                                  const steps = [...prev.steps];
                                  steps[index] = { ...steps[index], embedColor: e.target.value };
                                  return { ...prev, steps };
                                })
                              }
                              className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border-0"
                            />
                            <input
                              type="text"
                              value={step.embedColor || '#5865F2'}
                              onChange={(e) =>
                                handleUpdateCurrentFlow((prev) => {
                                  const steps = [...prev.steps];
                                  steps[index] = { ...steps[index], embedColor: e.target.value };
                                  return { ...prev, steps };
                                })
                              }
                              className="w-full px-2.5 py-1.5 bg-[#191a21] border border-[#3b3c47] rounded-lg text-xs text-white font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-emerald-300 uppercase mb-1">
                          Główny opis karty Embed
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Opis w formacie Markdown..."
                          value={step.embedDescription || ''}
                          onChange={(e) =>
                            handleUpdateCurrentFlow((prev) => {
                              const steps = [...prev.steps];
                              steps[index] = { ...steps[index], embedDescription: e.target.value };
                              return { ...prev, steps };
                            })
                          }
                          className="w-full px-3 py-2 bg-[#191a21] border border-emerald-500/30 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400 font-sans"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                            Stopka Embedu (Footer)
                          </label>
                          <input
                            type="text"
                            placeholder="np. KitekBot • System Zgłoszeń"
                            value={step.embedFooter || ''}
                            onChange={(e) =>
                              handleUpdateCurrentFlow((prev) => {
                                const steps = [...prev.steps];
                                steps[index] = { ...steps[index], embedFooter: e.target.value };
                                return { ...prev, steps };
                              })
                            }
                            className="w-full px-3 py-2 bg-[#191a21] border border-[#3b3c47] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                            URL Obrazka / Bannera
                          </label>
                          <input
                            type="text"
                            placeholder="https://..."
                            value={step.embedImageUrl || ''}
                            onChange={(e) =>
                              handleUpdateCurrentFlow((prev) => {
                                const steps = [...prev.steps];
                                steps[index] = { ...steps[index], embedImageUrl: e.target.value };
                                return { ...prev, steps };
                              })
                            }
                            className="w-full px-3 py-2 bg-[#191a21] border border-[#3b3c47] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* --- BLOK: DODAJ REAKCJĘ --- */}
                  {step.type === 'add_reaction' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-emerald-300 uppercase mb-1">
                          Emoji reakcji *
                        </label>
                        <input
                          type="text"
                          placeholder="np. ✅, ⭐, 🎉"
                          value={step.emoji || '✅'}
                          onChange={(e) =>
                            handleUpdateCurrentFlow((prev) => {
                              const steps = [...prev.steps];
                              steps[index] = { ...steps[index], emoji: e.target.value };
                              return { ...prev, steps };
                            })
                          }
                          className="w-full px-3 py-2 bg-[#191a21] border border-emerald-500/30 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400 text-center text-lg"
                        />
                      </div>
                      <div className="flex items-center text-xs text-neutral-400 pt-5">
                        <span>Bot automatycznie doda tę reakcję pod wywołującą wiadomością.</span>
                      </div>
                    </div>
                  )}

                  {/* --- BLOK: NADAJ / ODBIERZ ROLĘ --- */}
                  {(step.type === 'give_role' || step.type === 'remove_role') && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-sky-300 uppercase mb-1">
                          Nazwa roli na serwerze *
                        </label>
                        <input
                          type="text"
                          placeholder="np. Gracz, Zweryfikowany, VIP"
                          value={step.roleName || ''}
                          onChange={(e) =>
                            handleUpdateCurrentFlow((prev) => {
                              const steps = [...prev.steps];
                              steps[index] = { ...steps[index], roleName: e.target.value };
                              return { ...prev, steps };
                            })
                          }
                          className="w-full px-3 py-2 bg-[#191a21] border border-sky-500/30 rounded-xl text-xs text-white focus:outline-none focus:border-sky-400"
                        />
                      </div>

                      {availableRoles.length > 0 && (
                        <div>
                          <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">
                            Lub wybierz z ról serwera:
                          </label>
                          <select
                            onChange={(e) => {
                              if (!e.target.value) return;
                              handleUpdateCurrentFlow((prev) => {
                                const steps = [...prev.steps];
                                steps[index] = { ...steps[index], roleName: e.target.value };
                                return { ...prev, steps };
                              });
                            }}
                            className="w-full px-3 py-2 bg-[#191a21] border border-[#3b3c47] rounded-xl text-xs text-white cursor-pointer"
                          >
                            <option value="">Wybierz rolę...</option>
                            {availableRoles.map((r) => (
                              <option key={r.id} value={r.name}>
                                @{r.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )}

                  {/* --- BLOK: MODERACJA (TIMEOUT / KICK / BAN) --- */}
                  {(step.type === 'timeout_member' || step.type === 'kick_member' || step.type === 'ban_member') && (
                    <div className="space-y-3">
                      {step.type === 'timeout_member' && (
                        <div>
                          <label className="block text-[11px] font-bold text-rose-300 uppercase mb-1">
                            Czas trwania wyciszenia (w minutach)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="40320"
                            value={step.timeoutMinutes || 10}
                            onChange={(e) =>
                              handleUpdateCurrentFlow((prev) => {
                                const steps = [...prev.steps];
                                steps[index] = { ...steps[index], timeoutMinutes: parseInt(e.target.value) || 5 };
                                return { ...prev, steps };
                              })
                            }
                            className="w-full px-3 py-2 bg-[#191a21] border border-rose-500/30 rounded-xl text-xs text-white focus:outline-none focus:border-rose-400"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-[11px] font-bold text-rose-300 uppercase mb-1">
                          Powód kary (zapisany w Audit Logu Discorda)
                        </label>
                        <input
                          type="text"
                          placeholder="np. Naruszenie regulaminu serwera"
                          value={step.reason || ''}
                          onChange={(e) =>
                            handleUpdateCurrentFlow((prev) => {
                              const steps = [...prev.steps];
                              steps[index] = { ...steps[index], reason: e.target.value };
                              return { ...prev, steps };
                            })
                          }
                          className="w-full px-3 py-2 bg-[#191a21] border border-rose-500/30 rounded-xl text-xs text-white focus:outline-none focus:border-rose-400"
                        />
                      </div>
                    </div>
                  )}

                  {/* --- BLOK: LOSOWY WYBÓR (RANDOM CHOICE) --- */}
                  {step.type === 'random_choice' && (
                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold text-purple-300 uppercase">
                        Warianty odpowiedzi (jeden losowany przy każdym wywołaniu)
                      </label>
                      {(step.randomOptions || []).map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <span className="text-xs font-mono text-neutral-400">#{optIdx + 1}</span>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) =>
                              handleUpdateCurrentFlow((prev) => {
                                const steps = [...prev.steps];
                                const opts = [...(steps[index].randomOptions || [])];
                                opts[optIdx] = e.target.value;
                                steps[index] = { ...steps[index], randomOptions: opts };
                                return { ...prev, steps };
                              })
                            }
                            className="flex-1 px-3 py-1.5 bg-[#191a21] border border-[#3b3c47] rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateCurrentFlow((prev) => {
                                const steps = [...prev.steps];
                                const opts = (steps[index].randomOptions || []).filter((_, i) => i !== optIdx);
                                steps[index] = { ...steps[index], randomOptions: opts };
                                return { ...prev, steps };
                              })
                            }
                            className="p-1.5 text-neutral-400 hover:text-rose-400 rounded-lg hover:bg-white/5 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateCurrentFlow((prev) => {
                            const steps = [...prev.steps];
                            const currentOpts = steps[index].randomOptions || [];
                            const newOpts = [...currentOpts, `Nowy wariant ${currentOpts.length + 1}`];
                            steps[index] = { ...steps[index], randomOptions: newOpts };
                            return { ...prev, steps };
                          })
                        }
                        className="px-3 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Dodaj wariant</span>
                      </button>
                    </div>
                  )}

                  {/* --- BLOK: UTWÓRZ KANAŁ / TICKET --- */}
                  {(step.type === 'create_channel' || step.type === 'create_ticket') && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-amber-300 uppercase mb-1">
                          Nazwa nowego kanału *
                        </label>
                        <input
                          type="text"
                          placeholder="np. ticket-{user.name}"
                          value={step.newChannelName || ''}
                          onChange={(e) =>
                            handleUpdateCurrentFlow((prev) => {
                              const steps = [...prev.steps];
                              steps[index] = { ...steps[index], newChannelName: e.target.value };
                              return { ...prev, steps };
                            })
                          }
                          className="w-full px-3 py-2 bg-[#191a21] border border-amber-500/30 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-amber-300 uppercase mb-1">
                          Kategoria serwera
                        </label>
                        <input
                          type="text"
                          placeholder="np. 🎫・TICKETY"
                          value={step.categoryName || ''}
                          onChange={(e) =>
                            handleUpdateCurrentFlow((prev) => {
                              const steps = [...prev.steps];
                              steps[index] = { ...steps[index], categoryName: e.target.value };
                              return { ...prev, steps };
                            })
                          }
                          className="w-full px-3 py-2 bg-[#191a21] border border-amber-500/30 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Puzzle notch dolny */}
                <div className="h-3 bg-[#23242e] flex justify-center items-center">
                  <div className={`w-12 h-2.5 bg-[#282933] border-x border-b ${stepDef.borderColor} rounded-b-md`} />
                </div>
              </div>
            </div>
          );
        })}

        {/* PRZYCISK DODAWANIA KOLEJNEGO KLOCKA NA KOŃCU PRZEPŁYWU */}
        <div className="pt-6 w-full max-w-md flex flex-col items-center gap-2">
          <button
            id="add-step-bottom-btn"
            onClick={() => {
              setInsertAtIndex(null);
              setStepCategoryFilter('all');
              setIsAddStepModalOpen(true);
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#5865F2] hover:bg-[#4752C4] active:scale-[0.98] text-white text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-950/40 cursor-pointer border border-[#8590ff]/40"
          >
            <Plus className="w-5 h-5 stroke-[3]" />
            <span>+ Dodaj klocek Scratch</span>
          </button>
          <span className="text-[11px] text-neutral-400 font-medium">
            Możesz dodać nielimitowaną liczbę klocków akcji, logiki i moderacji
          </span>
        </div>
      </div>

      {/* ================================================================= */}
      {/* MODAL: WYBÓR BLOKU DO DODANIA                                    */}
      {/* ================================================================= */}
      {isAddStepModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl rounded-3xl bg-[#282933] border border-[#3b3c47] shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#3b3c47]">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#5865F2]" />
                  <span>Wybierz klocek Scratch do wstawienia</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Wybierz akcję, warunek logiczny lub działanie na użytkowniku
                </p>
              </div>
              <button
                onClick={() => setIsAddStepModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-xl hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filtr kategorii w modalu */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'all', label: 'Wszystkie klocki' },
                { id: 'logic', label: '🟪 Logika & Kontrola' },
                { id: 'message', label: '🟩 Wiadomości & Embedy' },
                { id: 'member', label: '🟦 Role & Użytkownicy' },
                { id: 'moderation', label: '🟥 Moderacja & Kary' },
                { id: 'channel', label: '🟧 Kanały & Tickety' }
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setStepCategoryFilter(c.id as any)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                    stepCategoryFilter === c.id
                      ? 'bg-[#5865F2] text-white shadow-sm'
                      : 'bg-[#1f2027] text-neutral-400 hover:text-white'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Lista klocków */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {STEP_DEFINITIONS.filter(
                (st) => stepCategoryFilter === 'all' || st.category === stepCategoryFilter
              ).map((step) => {
                const Icon = step.icon;
                return (
                  <button
                    key={step.type}
                    onClick={() => handleAddStep(step.type)}
                    className={`p-3.5 rounded-2xl border text-left transition-all duration-150 flex items-start gap-3 cursor-pointer group hover:scale-[1.01] ${step.bgColor} ${step.borderColor} hover:border-white/50`}
                  >
                    <div className={`p-2 rounded-xl bg-black/30 ${step.color} shrink-0 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white group-hover:text-white">
                          {step.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-300 line-clamp-2 mt-1 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL: WYBÓR WYZWALACZA (HAT BLOCK)                               */}
      {/* ================================================================= */}
      {isTriggerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-[#282933] border border-[#3b3c47] shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#3b3c47]">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <span>Wybierz zdarzenie wyzwalające (Wyzwalacz)</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Wybierz, co uruchomi ten zestaw klocków na Twoim serwerze Discord
                </p>
              </div>
              <button
                onClick={() => setIsTriggerModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-xl hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {TRIGGER_DEFINITIONS.map((trig) => {
                const Icon = trig.icon;
                const isSelected = currentFlow.trigger.type === trig.type;
                return (
                  <button
                    key={trig.type}
                    onClick={() => {
                      handleUpdateCurrentFlow((prev) => ({
                        ...prev,
                        trigger: { ...prev.trigger, type: trig.type }
                      }));
                      setIsTriggerModalOpen(false);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all duration-150 flex items-start gap-3 cursor-pointer group ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400'
                        : `${trig.bgColor} ${trig.borderColor} hover:border-amber-400/60`
                    }`}
                  >
                    <div className={`p-2 rounded-xl bg-black/30 ${trig.color} shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-white">{trig.title}</div>
                      <p className="text-[11px] text-neutral-300 mt-1 leading-relaxed">{trig.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL: SYMULATOR NA ŻYWO (LIVE SIMULATOR CONSOLE)                  */}
      {/* ================================================================= */}
      {isSimulatorOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-3xl bg-[#1e1f28] border border-[#3b3c47] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Nagłówek konsoli */}
            <div className="p-4 bg-[#181921] border-b border-[#333441] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">Symulator Wykonywania Bloków</h4>
                  <span className="text-[10px] text-neutral-400">
                    Podgląd na żywo dla komendy: {currentFlow.name}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsSimulatorOpen(false)}
                className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Konsola logów */}
            <div className="p-4 flex-1 overflow-y-auto font-mono text-xs space-y-2 bg-[#14151c] min-h-[250px]">
              {simLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-2 rounded-lg leading-relaxed ${
                    log.type === 'success'
                      ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/20'
                      : log.type === 'wait'
                      ? 'bg-amber-950/40 text-amber-300 border border-amber-500/20 animate-pulse'
                      : 'bg-neutral-900 text-neutral-300 border border-neutral-800'
                  }`}
                >
                  <span className="text-neutral-500 mr-2 text-[10px]">{log.time}</span>
                  <span>{log.text}</span>
                </div>
              ))}
              {simulating && (
                <div className="flex items-center gap-2 text-neutral-400 text-xs pt-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#5865F2]" />
                  <span>Trwa wykonywanie kolejnych klocków...</span>
                </div>
              )}
            </div>

            {/* Dolne przyciski */}
            <div className="p-3.5 bg-[#181921] border-t border-[#333441] flex items-center justify-between">
              <button
                onClick={handleRunSimulation}
                disabled={simulating}
                className="px-3.5 py-1.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>Uruchom ponownie test</span>
              </button>
              <button
                onClick={() => setIsSimulatorOpen(false)}
                className="px-3 py-1.5 rounded-lg text-neutral-400 hover:text-white text-xs font-bold"
              >
                Zamknij konsolę
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
