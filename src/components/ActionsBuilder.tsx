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
  Hash,
  Shield,
  Loader2,
  X,
  Radio,
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
  ExternalLink,
  ChevronRight,
  Maximize2,
  Minimize2,
  Move
} from 'lucide-react';
import {
  ActionFlow,
  ActionTriggerConfig,
  ActionStep,
  ActionTriggerType,
  ActionStepType,
  ActionStepCategory,
  GuildConfig
} from '../types/guildConfig';
import { BotGhostToolbox, TOOLBOX_BLOCKS, ToolboxBlockItem } from './botghost/BotGhostToolbox';
import { BotGhostEmbedPreview } from './botghost/BotGhostEmbedPreview';
import { BotGhostVariablesModal } from './botghost/BotGhostVariablesModal';
import { BotGhostSimulatorModal } from './botghost/BotGhostSimulatorModal';
import { BotGhostNodeCanvas } from './botghost/BotGhostNodeCanvas';

interface ActionsBuilderProps {
  guild: { id: string; name: string; icon: string | null };
  onBackToDashboard: () => void;
}

// Definicje Wyzwalaczy (Triggers)
const TRIGGER_OPTIONS: {
  type: ActionTriggerType;
  title: string;
  badge: string;
  desc: string;
  icon: any;
  color: string;
  bgColor: string;
}[] = [
  {
    type: 'command',
    title: 'Komenda Slash lub Czatu',
    badge: 'Slash / Prefiks',
    desc: 'Uruchamia się po wpisaniu komendy (np. /pomoc, !ranga, /zweryfikuj)',
    icon: FileCode,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10'
  },
  {
    type: 'message_sent',
    title: 'Wiadomość na kanale',
    badge: 'Wiadomość',
    desc: 'Reaguje na słowa kluczowe lub treść wiadomości wysłanej na czacie',
    icon: MessageSquare,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10'
  },
  {
    type: 'member_join',
    title: 'Dołączenie użytkownika (Join)',
    badge: 'Nowy członek',
    desc: 'Wyzwala akcje zaraz po wejściu nowej osoby na serwer (Auto-rola, Powitanie)',
    icon: UserCheck,
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/10'
  },
  {
    type: 'member_leave',
    title: 'Opuszczenie serwera (Leave)',
    badge: 'Odejście',
    desc: 'Wyzwala akcje po wyjściu członka z serwera',
    icon: UserMinus,
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10'
  },
  {
    type: 'button_click',
    title: 'Kliknięcie przycisku bota',
    badge: 'Interakcja Button',
    desc: 'Uruchamia przepływ po kliknięciu wybranego przycisku pod wiadomością',
    icon: Zap,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10'
  },
  {
    type: 'reaction_add',
    title: 'Dodanie reakcji emoji',
    badge: 'Reakcja',
    desc: 'Reaguje na dodanie konkretnej reakcji do wiadomości',
    icon: Sparkles,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10'
  }
];

// Szablony gotowych komend
const QUICK_TEMPLATES: {
  id: string;
  name: string;
  desc: string;
  icon: any;
  flow: ActionFlow;
}[] = [
  {
    id: 'tpl-help',
    name: 'Komenda /pomoc (Embed)',
    desc: 'Wysyła estetyczną kartę Embed z informacjami o serwerze',
    icon: FileCode,
    flow: {
      id: 'flow-help-embed',
      name: 'Komenda /pomoc',
      description: 'Panel informacyjny serwera wywoływany przez /pomoc',
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
          embedDescription: 'Cześć {user}! Znajdziesz tutaj wszystkie najważniejsze informacje i zasady serwera.\n\n• **📜 Regulamin**: Zapoznaj się z zasadami na kanale regulaminu.\n• **🎫 Zgłoszenia**: Masz problem? Otwórz ticket!\n• **⭐ Rangi**: Zdobywaj poziomy aktywności na czacie!',
          embedColor: '#5865F2',
          embedFooter: 'KitekBot • Styl BotGhost',
          includeTimestamp: true,
          targetChannel: 'same'
        }
      ]
    }
  },
  {
    id: 'tpl-autorole',
    name: 'Auto-Rola i Powitanie',
    desc: 'Po wejściu gracza wita go i automatycznie nadaje rolę',
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
          durationSeconds: 2
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
    id: 'tpl-verify',
    name: 'Weryfikacja Przyciskiem',
    desc: 'Kliknięcie w przycisk [Zweryfikuj] nadaje rangę',
    icon: Zap,
    flow: {
      id: 'flow-verify-btn',
      name: 'Weryfikacja Przyciskiem',
      description: 'Kliknięcie w przycisk nadaje rangę zweryfikowanego',
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
          messageText: '✅ Twoje konto zostało pomyślnie zweryfikowane! Witamy na {server.name}.'
        }
      ]
    }
  }
];

export function ActionsBuilder({ guild, onBackToDashboard }: ActionsBuilderProps) {
  const [flows, setFlows] = useState<ActionFlow[]>([]);
  const [editingFlowId, setEditingFlowId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Wyszukiwarka i filtr
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'command' | 'message' | 'event'>('all');

  // Pasek boczny BotGhost Toolbox
  const [isToolboxOpen, setIsToolboxOpen] = useState(true);

  // Tryb widoku: 'nodes' (swobodna plansza z kablami) lub 'list' (tradycyjna lista)
  const [canvasMode, setCanvasMode] = useState<'nodes' | 'list'>('nodes');

  // Modale
  const [isVariablesModalOpen, setIsVariablesModalOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);
  const [insertAtIndex, setInsertAtIndex] = useState<number | null>(null);

  // Dane serwera
  const [availableChannels, setAvailableChannels] = useState<{ id: string; name: string }[]>([]);
  const [availableRoles, setAvailableRoles] = useState<{ id: string; name: string }[]>([]);

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
        initialFlows = QUICK_TEMPLATES.map((t) => ({ ...t.flow }));
      }

      setFlows(initialFlows);
    } catch (e: any) {
      setError('Błąd ładowania komend: ' + e.message);
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
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch (err: any) {
      setError('Błąd zapisu: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const currentFlow = flows.find((f) => f.id === editingFlowId) || null;

  const handleUpdateCurrentFlow = (updater: (prev: ActionFlow) => ActionFlow) => {
    if (!currentFlow) return;
    const updated = updater(currentFlow);
    const updatedFlows = flows.map((f) => (f.id === updated.id ? updated : f));
    setFlows(updatedFlows);
  };

  const handleCreateNewCommand = () => {
    const newFlow: ActionFlow = {
      id: 'flow-' + Date.now(),
      name: 'Nowa Komenda Slash',
      description: 'Własna komenda utworzona w BotGhost Builder',
      enabled: true,
      trigger: {
        type: 'command',
        commandName: 'komenda_' + Math.floor(Math.random() * 900 + 100),
        commandDescription: 'Własna komenda bota Discord',
        channelScope: 'all',
        roleScope: 'everyone'
      },
      steps: [
        {
          id: 'step-1',
          type: 'send_message',
          messageText: '👋 Cześć {user}! To jest komenda na serwerze {server.name}.',
          targetChannel: 'same'
        }
      ]
    };
    const updated = [...flows, newFlow];
    saveAllFlows(updated);
    setEditingFlowId(newFlow.id);
  };

  const handleAddStep = (type: ActionStepType, targetIndex: number | null = null) => {
    if (!currentFlow) return;
    const newStepId = 'step-' + Math.random().toString(36).substring(2, 9);
    let newStep: ActionStep = { id: newStepId, type };

    switch (type) {
      case 'condition_if':
        newStep = {
          ...newStep,
          conditionType: 'has_role',
          conditionValue: 'Gracz',
          thenSteps: [],
          elseSteps: []
        };
        break;
      case 'wait':
        newStep = { ...newStep, durationSeconds: 2 };
        break;
      case 'cooldown':
        newStep = { ...newStep, cooldownSeconds: 15 };
        break;
      case 'send_message':
        newStep = { ...newStep, messageText: 'Wiadomość z bota: Witaj {user}!', targetChannel: 'same' };
        break;
      case 'send_embed':
        newStep = {
          ...newStep,
          embedTitle: '📌 Informacja',
          embedDescription: 'Treść karty embed dla użytkownika {user}.',
          embedColor: '#5865F2',
          embedFooter: 'KitekBot • BotGhost System',
          includeTimestamp: true,
          targetChannel: 'same'
        };
        break;
      case 'send_ephemeral':
        newStep = { ...newStep, messageText: '🔒 Dyskretna wiadomość widoczna wyłącznie dla Ciebie ({user}).' };
        break;
      case 'send_dm':
        newStep = { ...newStep, messageText: '👋 Wiadomość prywatna od bota na serwerze {server.name}!' };
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
        newStep = { ...newStep, timeoutMinutes: 10, reason: 'Naruszenie regulaminu' };
        break;
      case 'kick_member':
        newStep = { ...newStep, reason: 'Wyrzucenie przez regułę bota' };
        break;
      case 'ban_member':
        newStep = { ...newStep, reason: 'Permanentny ban', deleteMessageDays: 1 };
        break;
      case 'create_ticket':
        newStep = { ...newStep, newChannelName: 'ticket-{user.name}', categoryName: '🎫・TICKETY' };
        break;
      case 'create_channel':
        newStep = { ...newStep, newChannelName: 'nowy-kanal', categoryName: 'KANAŁY TEKSTOWE' };
        break;
      case 'random_choice':
        newStep = { ...newStep, randomOptions: ['Opcja 1: Sukces!', 'Opcja 2: Spróbuj ponownie!', 'Opcja 3: Super!'] };
        break;
      case 'purge_messages':
        newStep = { ...newStep, purgeCount: 10 };
        break;
      default:
        break;
    }

    handleUpdateCurrentFlow((prev) => {
      const steps = [...prev.steps];
      const idx = targetIndex !== null ? targetIndex : insertAtIndex;
      
      // Oblicz pozycję na planszy (Node Canvas)
      const lastStep = steps[steps.length - 1];
      const nextY = lastStep && typeof lastStep.y === 'number' ? lastStep.y + 260 : 320 + steps.length * 260;
      const stepWithPos: ActionStep = {
        ...newStep,
        x: typeof newStep.x === 'number' ? newStep.x : 380,
        y: typeof newStep.y === 'number' ? newStep.y : nextY
      };

      if (idx !== null && idx >= 0 && idx <= steps.length) {
        steps.splice(idx, 0, stepWithPos);
      } else {
        steps.push(stepWithPos);
      }

      // Automatyczne połączenie kablem
      const conns = [...(prev.connections || [])];
      const fromNodeId = steps.length === 1 ? 'trigger' : steps[steps.length - 2].id;
      conns.push({
        id: `conn-${fromNodeId}-${stepWithPos.id}`,
        fromNodeId,
        fromPort: 'default',
        toNodeId: stepWithPos.id
      });

      return { ...prev, steps, connections: conns };
    });

    setInsertAtIndex(null);
  };

  const handleMoveStep = (index: number, dir: 'up' | 'down') => {
    if (!currentFlow) return;
    handleUpdateCurrentFlow((prev) => {
      const steps = [...prev.steps];
      const target = dir === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= steps.length) return prev;
      const tmp = steps[index];
      steps[index] = steps[target];
      steps[target] = tmp;
      return { ...prev, steps };
    });
  };

  const handleDuplicateStep = (index: number) => {
    if (!currentFlow) return;
    handleUpdateCurrentFlow((prev) => {
      const steps = [...prev.steps];
      const copy = {
        ...JSON.parse(JSON.stringify(steps[index])),
        id: 'step-' + Math.random().toString(36).substring(2, 9)
      };
      steps.splice(index + 1, 0, copy);
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

  // Wstawianie zmiennej pomocniczej
  const insertVarIntoField = (varTag: string, currentValue: string, setter: (val: string) => void) => {
    setter(currentValue ? `${currentValue} ${varTag}` : varTag);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-neutral-400">
        <Loader2 className="w-8 h-8 animate-spin text-[#5865F2] mb-3" />
        <p className="text-sm font-bold">Ładowanie BotGhost Studio...</p>
      </div>
    );
  }

  // =========================================================================
  // WIDOK 1: PRZEGLĄD KOMEND (DASHBOARD KART)
  // =========================================================================
  if (!editingFlowId || !currentFlow) {
    const filteredFlows = flows.filter((f) => {
      const matches =
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.trigger.commandName && f.trigger.commandName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (f.description && f.description.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!matches) return false;
      if (filterCategory === 'all') return true;
      if (filterCategory === 'command') return f.trigger.type === 'command';
      if (filterCategory === 'message') return f.trigger.type === 'message_sent';
      if (filterCategory === 'event') return f.trigger.type === 'member_join' || f.trigger.type === 'member_leave';
      return true;
    });

    return (
      <div className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 select-none">
        {/* NAGŁÓWEK GŁÓWNY */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#2d2e38]">
          <div className="flex items-center gap-3.5">
            <button
              onClick={onBackToDashboard}
              title="Wróć do listy serwerów"
              className="p-2.5 bg-[#1f2027] hover:bg-[#252630] text-neutral-400 hover:text-white rounded-xl border border-[#343542] transition-all cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <Terminal className="w-6 h-6 text-[#5865F2]" />
                  <span>Kreator Komend BotGhost</span>
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-[#5865F2]/20 text-[#8590ff] border border-[#5865F2]/40">
                  Builder v5.8.0
                </span>
                <span className="text-xs text-neutral-400 font-medium">
                  na serwerze <strong className="text-white">{guild.name}</strong>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                Wizualny edytor przepływów logicznych — twórz komendy slash, automatyczne powitania i akcje reakcji bez pisania kodu!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="create-new-command-btn"
              onClick={handleCreateNewCommand}
              className="px-4 py-2.5 bg-gradient-to-r from-[#5865F2] to-[#7289DA] hover:from-[#4752C4] hover:to-[#5865F2] text-white rounded-xl text-xs sm:text-sm font-black tracking-wide uppercase transition-all shadow-lg shadow-indigo-950/40 flex items-center gap-2 active:scale-95 cursor-pointer border border-[#8590ff]/40"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Utwórz nową komendę</span>
            </button>
          </div>
        </div>

        {/* WYSZUKIWARKA I STATYSTYKI */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Szukaj komendy (np. /pomoc, !ranga)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#181920] border border-[#2d2e38] rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#5865F2]"
            />
          </div>

          <div className="flex items-center justify-between px-4 py-2.5 bg-[#181920] border border-[#2d2e38] rounded-xl">
            <span className="text-xs font-bold text-neutral-400 uppercase">Wszystkie komendy</span>
            <span className="text-base font-black text-white">{flows.length}</span>
          </div>

          <div className="flex items-center justify-between px-4 py-2.5 bg-[#181920] border border-[#2d2e38] rounded-xl">
            <span className="text-xs font-bold text-neutral-400 uppercase">Aktywne w bocie</span>
            <span className="text-base font-black text-emerald-400">
              {flows.filter((f) => f.enabled).length}
            </span>
          </div>
        </div>

        {/* FILTRY KATEGORII */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
          {[
            { id: 'all', label: 'Wszystkie' },
            { id: 'command', label: 'Komendy Slash ( / )' },
            { id: 'message', label: 'Wiadomości Czatu ( 💬 )' },
            { id: 'event', label: 'Zdarzenia Join / Leave ( ⚡ )' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                filterCategory === cat.id
                  ? 'bg-[#5865F2] text-white'
                  : 'bg-[#181920] text-neutral-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* LISTA KART KOMEND */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFlows.map((flow) => (
            <div
              key={flow.id}
              onClick={() => setEditingFlowId(flow.id)}
              className="p-5 rounded-2xl bg-[#181920] hover:bg-[#1d1e26] border border-[#2d2e38] hover:border-[#5865F2] transition-all cursor-pointer group flex flex-col justify-between shadow-lg hover:shadow-indigo-950/20"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {flow.trigger.commandName ? `/${flow.trigger.commandName}` : flow.trigger.type}
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      flow.enabled
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-neutral-800 text-neutral-500 border-neutral-700'
                    }`}
                  >
                    {flow.enabled ? 'Aktywna' : 'Wyłączona'}
                  </span>
                </div>

                <h3 className="text-base font-black text-white group-hover:text-[#8590ff] transition-colors">
                  {flow.name}
                </h3>
                <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                  {flow.description || 'Brak opisu komendy'}
                </p>

                {/* Podsumowanie bloków */}
                <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                  {flow.steps.slice(0, 3).map((st, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-black/40 border border-white/10 text-[10px] text-neutral-300 font-bold"
                    >
                      {st.type}
                    </span>
                  ))}
                  {flow.steps.length > 3 && (
                    <span className="text-[10px] text-neutral-500 font-bold">
                      +{flow.steps.length - 3} więcej
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#262732] flex items-center justify-between text-xs">
                <span className="text-[#8590ff] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Otwórz w edytorze</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>

                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      const copy: ActionFlow = {
                        ...JSON.parse(JSON.stringify(flow)),
                        id: 'flow-' + Date.now(),
                        name: `${flow.name} (Kopia)`
                      };
                      saveAllFlows([...flows, copy]);
                    }}
                    title="Duplikuj komendę"
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Usunąć tę komendę?')) {
                        saveAllFlows(flows.filter((f) => f.id !== flow.id));
                      }
                    }}
                    title="Usuń komendę"
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // =========================================================================
  // WIDOK 2: BOTGHOST VISUAL BUILDER (CANVAS + TOOLBOX)
  // =========================================================================
  const trigDef = TRIGGER_OPTIONS.find((t) => t.type === currentFlow.trigger.type) || TRIGGER_OPTIONS[0];
  const TrigIcon = trigDef.icon;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#13141a]">
      {/* 1. GÓRNY PASEK BREADCRUMBS I NARZĘDZI (BOTGHOST STUDIO HEADER) */}
      <header className="px-5 py-3 bg-[#181920] border-b border-[#2a2b36] flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 z-30 select-none shadow-md">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => {
              saveAllFlows(flows, false);
              setEditingFlowId(null);
            }}
            title="Powrót do listy komend"
            className="p-2 rounded-xl bg-[#23242e] hover:bg-[#2c2d3a] text-neutral-300 hover:text-white border border-[#343542] transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Wróć</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span className="hidden sm:inline">Commands</span>
            <span className="hidden sm:inline">/</span>
            <input
              type="text"
              value={currentFlow.name}
              onChange={(e) => handleUpdateCurrentFlow((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Nazwa komendy..."
              className="text-sm sm:text-base font-black text-white bg-transparent border-b border-transparent hover:border-[#5865F2] focus:border-[#5865F2] focus:outline-none px-1"
            />
          </div>

          <span className="font-mono text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
            /{currentFlow.trigger.commandName || 'komenda'}
          </span>
        </div>

        {/* PRZYCISKI GŁÓWNEJ NAWIGACJI */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Zmienne Discord */}
          <button
            onClick={() => setIsVariablesModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-[#23242e] hover:bg-[#2a2b37] border border-[#343542] text-neutral-300 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#8590ff]" />
            <span>Zmienne {"{x}"}</span>
          </button>

          {/* Testuj w symulatorze */}
          <button
            onClick={() => setIsSimulatorOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#5865F2]/15 hover:bg-[#5865F2]/25 border border-[#5865F2]/40 text-[#8590ff] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-[#8590ff]" />
            <span>Testuj w Discordzie</span>
          </button>

          {/* Przełącznik aktywności */}
          <button
            onClick={() =>
              handleUpdateCurrentFlow((prev) => {
                const updated = { ...prev, enabled: !prev.enabled };
                saveAllFlows(flows.map((f) => (f.id === updated.id ? updated : f)), false);
                return updated;
              })
            }
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
              currentFlow.enabled
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-neutral-800 text-neutral-500 border-neutral-700'
            }`}
          >
            <Radio className="w-3 h-3" />
            <span>{currentFlow.enabled ? 'Aktywna' : 'Wyłączona'}</span>
          </button>

          {/* Przełącznik trybu widoku: Plansza z kablami / Lista kaskadowa */}
          <div className="flex items-center bg-[#23242e] p-0.5 rounded-xl border border-[#343542]">
            <button
              onClick={() => setCanvasMode('nodes')}
              title="Swobodna plansza z kablami łączącymi (Node Graph)"
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                canvasMode === 'nodes'
                  ? 'bg-[#5865F2] text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Move className="w-3.5 h-3.5" />
              <span>Plansza & Kable</span>
            </button>
            <button
              onClick={() => setCanvasMode('list')}
              title="Klasyczna lista kaskadowa"
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                canvasMode === 'list'
                  ? 'bg-[#5865F2] text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Lista</span>
            </button>
          </div>

          {/* Przycisk zapisu */}
          <button
            id="save-command-flow-btn"
            onClick={() => saveAllFlows(flows)}
            disabled={saving}
            className="px-4 py-1.5 bg-[#5865F2] hover:bg-[#4752C4] disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md shadow-indigo-950/40 cursor-pointer"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : saveSuccess ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{saveSuccess ? 'Zapisano!' : 'Zapisz'}</span>
          </button>
        </div>
      </header>

      {/* 2. GŁÓWNY OBSZAR: LEWY PRZYBORNIK + PŁÓTNO BOTGHOST */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEWY PRZYBORNIK KLOCKÓW BOTGHOST */}
        <BotGhostToolbox
          isOpen={isToolboxOpen}
          onToggle={() => setIsToolboxOpen(!isToolboxOpen)}
          onAddStep={(type) => handleAddStep(type)}
          onChangeTrigger={() => setIsTriggerModalOpen(true)}
          onOpenVariables={() => setIsVariablesModalOpen(true)}
        />

        {/* PŁÓTNO BOTGHOST: SWOBODNA PLANSZA Z KABLAMI LUB LISTA KASKADOWA */}
        {canvasMode === 'nodes' ? (
          <BotGhostNodeCanvas
            flow={currentFlow}
            serverName={guild.name}
            onUpdateFlow={handleUpdateCurrentFlow}
            onOpenTriggerModal={() => setIsTriggerModalOpen(true)}
            onOpenVariables={() => setIsVariablesModalOpen(true)}
            availableRoles={availableRoles}
          />
        ) : (
          <main
            className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col items-center select-none"
            style={{
              backgroundImage: 'radial-gradient(circle, #2b2d39 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          >
          {/* =============================================================== */}
          {/* 1. KARTA WYZWALACZA (BOTGHOST TRIGGER CARD)                     */}
          {/* =============================================================== */}
          <div className="w-full max-w-2xl rounded-2xl bg-[#1e1f26] border-2 border-amber-500/60 shadow-2xl overflow-hidden">
            {/* Banner nagłówka wyzwalacza */}
            <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 px-5 py-3 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-black/20 text-white">
                  <TrigIcon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-100 block">
                    ⚡ Wyzwalacz (Trigger)
                  </span>
                  <h3 className="text-sm font-black text-white">{trigDef.title}</h3>
                </div>
              </div>

              <button
                onClick={() => setIsTriggerModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-black/25 hover:bg-black/40 text-xs font-bold text-white transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>Zmień zdarzenie</span>
                <Sliders className="w-3 h-3" />
              </button>
            </div>

            {/* Pola formularza wyzwalacza */}
            <div className="p-5 space-y-4 bg-[#181920]">
              {currentFlow.trigger.type === 'command' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                      Nazwa komendy Slash *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 font-mono font-bold">/</span>
                      <input
                        type="text"
                        placeholder="np. pomoc, ranga"
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
                        className="w-full pl-7 pr-3 py-2 bg-[#121318] border border-[#31323f] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                      Opis komendy w menu Discorda
                    </label>
                    <input
                      type="text"
                      placeholder="np. Wyświetla pomoc i informacje"
                      value={currentFlow.trigger.commandDescription || ''}
                      onChange={(e) =>
                        handleUpdateCurrentFlow((prev) => ({
                          ...prev,
                          trigger: { ...prev.trigger, commandDescription: e.target.value }
                        }))
                      }
                      className="w-full px-3 py-2 bg-[#121318] border border-[#31323f] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              {currentFlow.trigger.type === 'message_sent' && (
                <div>
                  <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                    Fraza lub słowo kluczowe *
                  </label>
                  <input
                    type="text"
                    placeholder="np. !pomoc, hejka, ip"
                    value={currentFlow.trigger.messageContent || ''}
                    onChange={(e) =>
                      handleUpdateCurrentFlow((prev) => ({
                        ...prev,
                        trigger: { ...prev.trigger, messageContent: e.target.value }
                      }))
                    }
                    className="w-full px-3 py-2 bg-[#121318] border border-[#31323f] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              {currentFlow.trigger.type === 'button_click' && (
                <div>
                  <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                    Identyfikator przycisku (Custom ID) *
                  </label>
                  <input
                    type="text"
                    placeholder="np. verify_btn, ticket_open"
                    value={currentFlow.trigger.buttonCustomId || ''}
                    onChange={(e) =>
                      handleUpdateCurrentFlow((prev) => ({
                        ...prev,
                        trigger: { ...prev.trigger, buttonCustomId: e.target.value }
                      }))
                    }
                    className="w-full px-3 py-2 bg-[#121318] border border-[#31323f] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              )}

              {/* Zasięg ról i kanałów */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-3 border-t border-[#252632]">
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
                    className="w-full px-3 py-2 bg-[#121318] border border-[#31323f] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="all">Wszystkie kanały serwera</option>
                    <option value="specific">Tylko wybrany kanał</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                    Uprawnienia wykonania
                  </label>
                  <select
                    value={currentFlow.trigger.roleScope || 'everyone'}
                    onChange={(e) =>
                      handleUpdateCurrentFlow((prev) => ({
                        ...prev,
                        trigger: { ...prev.trigger, roleScope: e.target.value as any }
                      }))
                    }
                    className="w-full px-3 py-2 bg-[#121318] border border-[#31323f] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="everyone">Wszyscy użytkownicy (@everyone)</option>
                    <option value="admin_only">Tylko Administratorzy</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* =============================================================== */}
          {/* 2. ŁAŃCUCH BLOKÓW AKCJI (BOTGHOST ACTION NODES + CONNECTORS)     */}
          {/* =============================================================== */}
          {currentFlow.steps.map((step, index) => {
            const blockDef = TOOLBOX_BLOCKS.find((b) => b.type === step.type) || TOOLBOX_BLOCKS[0];
            const StepIcon = blockDef.icon;

            return (
              <div key={step.id} className="w-full max-w-2xl flex flex-col items-center">
                {/* PIONOWA LINIA ŁĄCZĄCA Z PRZYCISKIEM (+) W STYLU BOTGHOST */}
                <div className="py-2.5 flex flex-col items-center relative group/conn">
                  <div className="w-0.5 h-6 bg-[#3b3d4f] group-hover/conn:bg-[#5865F2] transition-colors" />
                  <button
                    onClick={() => {
                      setInsertAtIndex(index);
                      // Domyślnie dodaj wiadomość lub otwórz przybornik
                      setIsToolboxOpen(true);
                    }}
                    title="Wstaw blok akcji w tym miejscu"
                    className="my-1 w-6 h-6 rounded-full bg-[#1e1f26] border-2 border-[#3b3d4f] hover:border-[#5865F2] hover:bg-[#5865F2] text-neutral-400 hover:text-white flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer z-10"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                  <div className="w-0.5 h-6 bg-[#3b3d4f] group-hover/conn:bg-[#5865F2] transition-colors" />
                </div>

                {/* KARTA BLOKU AKCJI (BOTGHOST ACTION CARD) */}
                <div
                  className={`w-full rounded-2xl border bg-[#1e1f26] shadow-xl overflow-hidden transition-all ${blockDef.borderColor}`}
                >
                  {/* Górna belka nagłówkowa karty */}
                  <div
                    className={`px-4 py-2.5 flex items-center justify-between border-b ${blockDef.bgColor} ${blockDef.borderColor}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-black/40 text-white font-mono">
                        #{index + 1}
                      </span>
                      <div className={`p-1.5 rounded-lg bg-black/25 ${blockDef.color}`}>
                        <StepIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-white">{blockDef.title}</span>
                        <span className="ml-2 text-[10px] font-bold text-neutral-400 uppercase">
                          ({blockDef.categoryLabel})
                        </span>
                      </div>
                    </div>

                    {/* Narzędzia sterowania: góra, dół, duplikuj, usuń */}
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

                  {/* Zawartość bloku akcji */}
                  <div className="p-4 space-y-3.5 bg-[#181920]">
                    {/* Szybkie pigułki zmiennych nad każdym polem tekstowym */}
                    <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] text-neutral-400 pb-1">
                      <span className="font-bold text-neutral-500 uppercase">Zmienne:</span>
                      {['{user}', '{server.name}', '{channel}', '{args}'].map((tg) => (
                        <button
                          key={tg}
                          type="button"
                          onClick={() => {
                            if (step.type === 'send_message' || step.type === 'send_ephemeral' || step.type === 'send_dm') {
                              handleUpdateCurrentFlow((prev) => {
                                const st = [...prev.steps];
                                st[index] = {
                                  ...st[index],
                                  messageText: (st[index].messageText || '') + ' ' + tg
                                };
                                return { ...prev, steps: st };
                              });
                            } else if (step.type === 'send_embed') {
                              handleUpdateCurrentFlow((prev) => {
                                const st = [...prev.steps];
                                st[index] = {
                                  ...st[index],
                                  embedDescription: (st[index].embedDescription || '') + ' ' + tg
                                };
                                return { ...prev, steps: st };
                              });
                            }
                          }}
                          className="px-2 py-0.5 rounded bg-[#252632] hover:bg-[#5865F2] hover:text-white text-neutral-300 font-mono transition-colors cursor-pointer border border-[#313340]"
                        >
                          {tg}
                        </button>
                      ))}
                    </div>

                    {/* --- 1. WARUNEK IF (ROZGAŁĘZIENIE THEN / ELSE W STYLU BOTGHOST) --- */}
                    {step.type === 'condition_if' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-purple-300 uppercase mb-1">
                              Typ warunku
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
                              className="w-full px-3 py-2 bg-[#121318] border border-purple-500/40 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400 cursor-pointer"
                            >
                              <option value="has_role">Użytkownik posiada rolę</option>
                              <option value="has_permission">Posiada uprawnienia Administratora</option>
                              <option value="message_contains">Wiadomość zawiera frazę</option>
                              <option value="random_chance">Losowa szansa (%)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-purple-300 uppercase mb-1">
                              Wartość warunku
                            </label>
                            <input
                              type="text"
                              placeholder="np. Gracz, VIP, 50"
                              value={step.conditionValue || ''}
                              onChange={(e) =>
                                handleUpdateCurrentFlow((prev) => {
                                  const steps = [...prev.steps];
                                  steps[index] = { ...steps[index], conditionValue: e.target.value };
                                  return { ...prev, steps };
                                })
                              }
                              className="w-full px-3 py-2 bg-[#121318] border border-purple-500/40 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
                            />
                          </div>
                        </div>

                        {/* WIZUALNE ROZGAŁĘZIENIE NA GAŁĘZIE: THEN vs ELSE */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                          {/* Gałąź THEN */}
                          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/40 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5" />
                                <span>Gdy Prawda (THEN)</span>
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-400">
                              Jeśli warunek jest spełniony, bot kontynuuje wykonywanie kolejnych klocków.
                            </p>
                          </div>

                          {/* Gałąź ELSE */}
                          <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/40 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                                <X className="w-3.5 h-3.5" />
                                <span>W Przeciwnym Razie (ELSE)</span>
                              </span>
                            </div>
                            <input
                              type="text"
                              placeholder="Komunikat błędu dla użytkownika..."
                              value={step.messageText || ''}
                              onChange={(e) =>
                                handleUpdateCurrentFlow((prev) => {
                                  const steps = [...prev.steps];
                                  steps[index] = { ...steps[index], messageText: e.target.value };
                                  return { ...prev, steps };
                                })
                              }
                              className="w-full px-3 py-1.5 bg-[#121318] border border-rose-500/30 rounded-lg text-xs text-white focus:outline-none focus:border-rose-400"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* --- 2. WIADOMOŚĆ TEKSTOWA / EPHEMERAL / DM --- */}
                    {(step.type === 'send_message' || step.type === 'send_ephemeral' || step.type === 'send_dm') && (
                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold text-emerald-300 uppercase">
                          Treść wiadomości *
                        </label>
                        <textarea
                          rows={3}
                          value={step.messageText || ''}
                          onChange={(e) =>
                            handleUpdateCurrentFlow((prev) => {
                              const steps = [...prev.steps];
                              steps[index] = { ...steps[index], messageText: e.target.value };
                              return { ...prev, steps };
                            })
                          }
                          placeholder="Wpisz treść wiadomości bota..."
                          className="w-full px-3.5 py-2.5 bg-[#121318] border border-[#31323f] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    )}

                    {/* --- 3. KARTA EMBED Z PODGLĄDEM DISCORDA NA ŻYWO --- */}
                    {step.type === 'send_embed' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-emerald-300 uppercase mb-1">
                              Tytuł Embedu
                            </label>
                            <input
                              type="text"
                              value={step.embedTitle || ''}
                              onChange={(e) =>
                                handleUpdateCurrentFlow((prev) => {
                                  const steps = [...prev.steps];
                                  steps[index] = { ...steps[index], embedTitle: e.target.value };
                                  return { ...prev, steps };
                                })
                              }
                              className="w-full px-3 py-2 bg-[#121318] border border-[#31323f] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-emerald-300 uppercase mb-1">
                              Kolor paska (HEX)
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
                                className="w-9 h-9 rounded-lg bg-transparent border-0 cursor-pointer"
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
                                className="flex-1 px-3 py-2 bg-[#121318] border border-[#31323f] rounded-xl text-xs text-white font-mono"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-emerald-300 uppercase mb-1">
                            Opis Embedu
                          </label>
                          <textarea
                            rows={3}
                            value={step.embedDescription || ''}
                            onChange={(e) =>
                              handleUpdateCurrentFlow((prev) => {
                                const steps = [...prev.steps];
                                steps[index] = { ...steps[index], embedDescription: e.target.value };
                                return { ...prev, steps };
                              })
                            }
                            className="w-full px-3.5 py-2 bg-[#121318] border border-[#31323f] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        {/* Podgląd embedu na żywo */}
                        <BotGhostEmbedPreview
                          title={step.embedTitle}
                          description={step.embedDescription}
                          color={step.embedColor}
                          footer={step.embedFooter}
                          serverName={guild.name}
                        />
                      </div>
                    )}

                    {/* --- 4. CZEKAJ / WAIT --- */}
                    {step.type === 'wait' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-purple-300">
                          <span>Czas oczekiwania:</span>
                          <span className="font-mono text-white text-sm">{step.durationSeconds || 2} sekundy</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="30"
                          value={step.durationSeconds || 2}
                          onChange={(e) =>
                            handleUpdateCurrentFlow((prev) => {
                              const steps = [...prev.steps];
                              steps[index] = { ...steps[index], durationSeconds: parseInt(e.target.value) || 2 };
                              return { ...prev, steps };
                            })
                          }
                          className="w-full accent-purple-500 cursor-pointer"
                        />
                      </div>
                    )}

                    {/* --- 5. NADAJ / ODBIERZ ROLĘ --- */}
                    {(step.type === 'give_role' || step.type === 'remove_role') && (
                      <div>
                        <label className="block text-[11px] font-bold text-sky-300 uppercase mb-1">
                          Nazwa roli serwerowej *
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="np. Zweryfikowany, Gracz"
                            value={step.roleName || ''}
                            onChange={(e) =>
                              handleUpdateCurrentFlow((prev) => {
                                const steps = [...prev.steps];
                                steps[index] = { ...steps[index], roleName: e.target.value };
                                return { ...prev, steps };
                              })
                            }
                            className="flex-1 px-3 py-2 bg-[#121318] border border-sky-500/40 rounded-xl text-xs text-white focus:outline-none focus:border-sky-400"
                          />
                          {availableRoles.length > 0 && (
                            <select
                              onChange={(e) => {
                                if (!e.target.value) return;
                                handleUpdateCurrentFlow((prev) => {
                                  const steps = [...prev.steps];
                                  steps[index] = { ...steps[index], roleName: e.target.value };
                                  return { ...prev, steps };
                                });
                              }}
                              className="px-3 py-2 bg-[#121318] border border-[#31323f] rounded-xl text-xs text-neutral-300 focus:outline-none cursor-pointer"
                            >
                              <option value="">Wybierz rolę...</option>
                              {availableRoles.map((r) => (
                                <option key={r.id} value={r.name}>
                                  @{r.name}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    )}

                    {/* --- 6. MODERACJA (TIMEOUT / KICK / BAN) --- */}
                    {(step.type === 'timeout_member' || step.type === 'kick_member' || step.type === 'ban_member') && (
                      <div className="space-y-3">
                        {step.type === 'timeout_member' && (
                          <div>
                            <label className="block text-[11px] font-bold text-rose-300 uppercase mb-1">
                              Czas wyciszenia (w minutach)
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
                              className="w-full px-3 py-2 bg-[#121318] border border-rose-500/30 rounded-xl text-xs text-white focus:outline-none"
                            />
                          </div>
                        )}
                        <div>
                          <label className="block text-[11px] font-bold text-rose-300 uppercase mb-1">
                            Powód kary (Audit Log)
                          </label>
                          <input
                            type="text"
                            placeholder="np. Naruszenie regulaminu"
                            value={step.reason || ''}
                            onChange={(e) =>
                              handleUpdateCurrentFlow((prev) => {
                                const steps = [...prev.steps];
                                steps[index] = { ...steps[index], reason: e.target.value };
                                return { ...prev, steps };
                              })
                            }
                            className="w-full px-3 py-2 bg-[#121318] border border-rose-500/30 rounded-xl text-xs text-white focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* --- 7. UTWÓRZ TICKET / KANAŁ --- */}
                    {(step.type === 'create_ticket' || step.type === 'create_channel') && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-amber-300 uppercase mb-1">
                            Nazwa kanału *
                          </label>
                          <input
                            type="text"
                            placeholder="ticket-{user.name}"
                            value={step.newChannelName || ''}
                            onChange={(e) =>
                              handleUpdateCurrentFlow((prev) => {
                                const steps = [...prev.steps];
                                steps[index] = { ...steps[index], newChannelName: e.target.value };
                                return { ...prev, steps };
                              })
                            }
                            className="w-full px-3 py-2 bg-[#121318] border border-amber-500/30 rounded-xl text-xs text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-amber-300 uppercase mb-1">
                            Kategoria
                          </label>
                          <input
                            type="text"
                            placeholder="🎫・TICKETY"
                            value={step.categoryName || ''}
                            onChange={(e) =>
                              handleUpdateCurrentFlow((prev) => {
                                const steps = [...prev.steps];
                                steps[index] = { ...steps[index], categoryName: e.target.value };
                                return { ...prev, steps };
                              })
                            }
                            className="w-full px-3 py-2 bg-[#121318] border border-amber-500/30 rounded-xl text-xs text-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* =============================================================== */}
          {/* 3. DOLNY PRZYCISK DODAWANIA BLOKU DO KOŃCA ŁAŃCUCHA             */}
          {/* =============================================================== */}
          <div className="pt-6 w-full max-w-md flex flex-col items-center gap-2">
            <div className="w-0.5 h-6 bg-[#3b3d4f]" />
            <button
              id="add-block-bottom-btn"
              onClick={() => {
                setInsertAtIndex(null);
                setIsToolboxOpen(true);
              }}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#5865F2] hover:bg-[#4752C4] active:scale-[0.98] text-white text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-950/40 cursor-pointer border border-[#8590ff]/40"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
              <span>+ Dodaj kolejną akcję (BotGhost)</span>
            </button>
            <span className="text-[11px] text-neutral-400">
              Wybierz klocek z lewego przybornika lub kliknij powyżej
            </span>
          </div>
        </main>
        )}
      </div>

      {/* =================================================================== */}
      {/* MODALE: ZMIENNE DISCORD, SYMULATOR, ZMIANA WYZWALACZA               */}
      {/* =================================================================== */}
      <BotGhostVariablesModal
        isOpen={isVariablesModalOpen}
        onClose={() => setIsVariablesModalOpen(false)}
      />

      <BotGhostSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        flow={currentFlow}
        serverName={guild.name}
      />

      {/* MODAL ZMIANY WYZWALACZA */}
      {isTriggerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#1e1f26] border border-[#3b3c4a] p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#2d2e38]">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Wybierz Wyzwalacz (Trigger)</span>
              </h3>
              <button
                onClick={() => setIsTriggerModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {TRIGGER_OPTIONS.map((opt) => (
                <div
                  key={opt.type}
                  onClick={() => {
                    handleUpdateCurrentFlow((prev) => ({
                      ...prev,
                      trigger: { ...prev.trigger, type: opt.type }
                    }));
                    setIsTriggerModalOpen(false);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    currentFlow.trigger.type === opt.type
                      ? 'bg-amber-500/20 border-amber-500 text-white'
                      : 'bg-[#181920] border-[#2d2e38] hover:border-white/30 text-neutral-300'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${opt.bgColor} ${opt.color}`}>
                    <opt.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{opt.title}</h4>
                    <p className="text-[10px] text-neutral-400 mt-0.5">{opt.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
