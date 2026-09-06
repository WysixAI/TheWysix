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
  Shuffle,
  Tag,
  CheckCircle2,
  AlertCircle,
  Play,
  Save,
  ArrowRight,
  Sliders,
  Sparkles,
  HelpCircle,
  Hash,
  Shield,
  Loader2,
  X,
  Radio,
  CornerDownRight,
  ArrowLeft
} from 'lucide-react';
import {
  ActionFlow,
  ActionTriggerConfig,
  ActionStep,
  ActionTriggerType,
  ActionStepType,
  GuildConfig,
  getDefaultActionsConfig
} from '../types/guildConfig';

interface ActionsBuilderProps {
  guild: { id: string; name: string; icon: string | null };
  onBackToDashboard: () => void;
}

const TRIGGER_TYPES: {
  type: ActionTriggerType;
  title: string;
  desc: string;
  icon: any;
  color: string;
}[] = [
  {
    type: 'command',
    title: 'Komenda czatu / slash',
    desc: 'Uruchamia się po wpisaniu komendy (np. !pomoc, !ranga, /zweryfikuj)',
    icon: FileCode,
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30'
  },
  {
    type: 'message_sent',
    title: 'Wysłanie wiadomości na kanale',
    desc: 'Reaguje na treść wpisaną na dowolnym lub określonym kanale',
    icon: MessageSquare,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
  },
  {
    type: 'member_join',
    title: 'Dołączenie nowego użytkownika',
    desc: 'Wyzwala akcje zaraz po wejściu nowej osoby na serwer',
    icon: UserCheck,
    color: 'text-sky-400 bg-sky-500/10 border-sky-500/30'
  },
  {
    type: 'member_leave',
    title: 'Opuszczenie serwera',
    desc: 'Wyzwala akcje po wyjściu lub wyrzuceniu członka z serwera',
    icon: UserMinus,
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/30'
  },
  {
    type: 'button_click',
    title: 'Kliknięcie przycisku lub wybór w menu',
    desc: 'Uruchamia przepływ po interakcji z komponentem bota',
    icon: Zap,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
  },
  {
    type: 'reaction_add',
    title: 'Dodanie reakcji do wiadomości',
    desc: 'Reaguje na dodanie reakcji przez użytkownika',
    icon: Sparkles,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/30'
  }
];

const STEP_TYPES: {
  type: ActionStepType;
  title: string;
  desc: string;
  icon: any;
  category: 'flow' | 'message' | 'member' | 'moderation';
  color: string;
}[] = [
  {
    type: 'wait',
    title: 'Czekaj / Opóźnienie (Wait)',
    desc: 'Wstrzymuje wykonanie kolejnych kroków o zadany czas (np. 5s)',
    icon: Clock,
    category: 'flow',
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
  },
  {
    type: 'send_message',
    title: 'Wyślij wiadomość na kanał',
    desc: 'Wysyła publiczną wiadomość na ten sam lub wybrany kanał',
    icon: MessageSquare,
    category: 'message',
    color: 'text-sky-400 bg-sky-500/10 border-sky-500/30'
  },
  {
    type: 'send_ephemeral',
    title: 'Odpowiedź Ephemeral',
    desc: 'Dyskretna wiadomość widoczna wyłącznie dla wywołującego',
    icon: EyeOff,
    category: 'message',
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30'
  },
  {
    type: 'send_dm',
    title: 'Wyślij wiadomość prywatną (DM)',
    desc: 'Wysyła prywatną wiadomość bezpośrednio na skrzynkę użytkownika',
    icon: Mail,
    category: 'message',
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/30'
  },
  {
    type: 'send_embed',
    title: 'Wyślij sformatowany Embed',
    desc: 'Elegancka karta z kolorem, tytułem, opisem i stopką',
    icon: Sparkles,
    category: 'message',
    color: 'text-pink-400 bg-pink-500/10 border-pink-500/30'
  },
  {
    type: 'random_message',
    title: 'Losowa wiadomość',
    desc: 'Wysyła 1 losowo wybraną wiadomość z podanej puli wariantów',
    icon: Shuffle,
    category: 'message',
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
  },
  {
    type: 'give_role',
    title: 'Nadaj rolę',
    desc: 'Automatycznie przypisuje wskazaną rolę użytkownikowi',
    icon: UserCheck,
    category: 'member',
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
  },
  {
    type: 'remove_role',
    title: 'Odbierz rolę',
    desc: 'Odbiera wskazaną rolę użytkownikowi',
    icon: UserX,
    category: 'member',
    color: 'text-orange-400 bg-orange-500/10 border-orange-500/30'
  },
  {
    type: 'change_nickname',
    title: 'Zmień pseudonim',
    desc: 'Zmienia pseudonim członka na serwerze',
    icon: Tag,
    category: 'member',
    color: 'text-teal-400 bg-teal-500/10 border-teal-500/30'
  },
  {
    type: 'delete_message',
    title: 'Usuń wiadomość wywołującą',
    desc: 'Kasuje wiadomość użytkownika (np. czyszczenie komendy)',
    icon: Trash2,
    category: 'moderation',
    color: 'text-red-400 bg-red-500/10 border-red-500/30'
  },
  {
    type: 'kick_member',
    title: 'Wyrzuć użytkownika (Kick)',
    desc: 'Wyrzuca użytkownika z serwera z podanym powodem',
    icon: UserMinus,
    category: 'moderation',
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/30'
  },
  {
    type: 'ban_member',
    title: 'Zbanuj użytkownika (Ban)',
    desc: 'Banuje użytkownika i opcjonalnie usuwa jego wiadomości',
    icon: Ban,
    category: 'moderation',
    color: 'text-red-500 bg-red-600/10 border-red-500/40'
  }
];

export function ActionsBuilder({ guild, onBackToDashboard }: ActionsBuilderProps) {
  const [flows, setFlows] = useState<ActionFlow[]>([]);
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Trigger modal selector state
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState<boolean>(false);
  // Add step modal state
  const [isStepModalOpen, setIsStepModalOpen] = useState<boolean>(false);

  // Simulation test state
  const [simulating, setSimulating] = useState<boolean>(false);
  const [simulationLogs, setSimulationLogs] = useState<{ id: string; text: string; time: string; type: 'info' | 'success' | 'wait' }[]>([]);
  const [simulationCountdown, setSimulationCountdown] = useState<number | null>(null);

  // Channels & roles cache for selection
  const [availableChannels, setAvailableChannels] = useState<{ id: string; name: string }[]>([]);
  const [availableRoles, setAvailableRoles] = useState<{ id: string; name: string }[]>([]);

  // Load server configuration
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
          if (Array.isArray(data.channels)) {
            setAvailableChannels(data.channels);
          }
          if (Array.isArray(data.roles)) {
            setAvailableRoles(data.roles);
          }
        }
      }
    } catch {}
  };

  const loadGuildConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/guilds/${guild.id}?name=${encodeURIComponent(guild.name)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.config) {
          const loadedFlows = Array.isArray(data.config.actions) && data.config.actions.length > 0
            ? data.config.actions
            : getDefaultActionsConfig();
          setFlows(loadedFlows);
          if (loadedFlows.length > 0) {
            setSelectedFlowId(loadedFlows[0].id);
          }
        } else {
          const def = getDefaultActionsConfig();
          setFlows(def);
          setSelectedFlowId(def[0]?.id || null);
        }
      } else {
        const def = getDefaultActionsConfig();
        setFlows(def);
        setSelectedFlowId(def[0]?.id || null);
      }
    } catch (err: any) {
      setError('Błąd wczytywania konfiguracji akcji: ' + err.message);
      const def = getDefaultActionsConfig();
      setFlows(def);
      setSelectedFlowId(def[0]?.id || null);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const res = await fetch(`/api/guilds/${guild.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actions: flows })
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      } else {
        throw new Error('Nie udało się zapisać akcji.');
      }
    } catch (err: any) {
      setError('Błąd zapisu: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const currentFlow = flows.find((f) => f.id === selectedFlowId) || flows[0] || null;

  const handleCreateFlow = () => {
    const newFlow: ActionFlow = {
      id: 'flow-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      name: `Nowa Akcja #${flows.length + 1}`,
      description: 'Opis nowej reguły automatyzacji',
      enabled: true,
      trigger: {
        type: 'command',
        commandName: `!akcja${flows.length + 1}`,
        channelScope: 'all',
        roleScope: 'everyone'
      },
      steps: [
        {
          id: 'step-' + Math.random().toString(36).substring(2, 8),
          type: 'send_message',
          messageText: 'Witaj {user}! Akcja została pomyślnie wykonana na serwerze {server.name}.',
          targetChannel: 'same'
        }
      ]
    };
    const updated = [...flows, newFlow];
    setFlows(updated);
    setSelectedFlowId(newFlow.id);
  };

  const handleDeleteFlow = (flowId: string) => {
    if (flows.length <= 1) {
      alert('Musisz zachować przynajmniej jedną akcję na liście.');
      return;
    }
    const updated = flows.filter((f) => f.id !== flowId);
    setFlows(updated);
    if (selectedFlowId === flowId) {
      setSelectedFlowId(updated[0]?.id || null);
    }
  };

  const handleDuplicateFlow = (flow: ActionFlow) => {
    const duplicated: ActionFlow = {
      ...flow,
      id: 'flow-' + Date.now().toString(36),
      name: `${flow.name} (Kopia)`,
      steps: flow.steps.map((s) => ({ ...s, id: 'step-' + Math.random().toString(36).substring(2, 8) }))
    };
    setFlows([...flows, duplicated]);
    setSelectedFlowId(duplicated.id);
  };

  const updateCurrentFlow = (patch: Partial<ActionFlow>) => {
    if (!currentFlow) return;
    setFlows((prev) =>
      prev.map((f) => (f.id === currentFlow.id ? { ...f, ...patch } : f))
    );
  };

  const updateCurrentTrigger = (patch: Partial<ActionTriggerConfig>) => {
    if (!currentFlow) return;
    updateCurrentFlow({
      trigger: { ...currentFlow.trigger, ...patch }
    });
  };

  // Reordering steps (move up / down)
  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (!currentFlow) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentFlow.steps.length) return;

    const newSteps = [...currentFlow.steps];
    const temp = newSteps[index];
    newSteps[index] = newSteps[targetIndex];
    newSteps[targetIndex] = temp;

    updateCurrentFlow({ steps: newSteps });
  };

  const addStep = (type: ActionStepType) => {
    if (!currentFlow) return;
    const id = 'step-' + Math.random().toString(36).substring(2, 8);
    let newStep: ActionStep = { id, type };

    switch (type) {
      case 'wait':
        newStep.durationSeconds = 5;
        break;
      case 'send_message':
        newStep.messageText = 'Wiadomość z automatyzacji KitekBot dla {user}!';
        newStep.targetChannel = 'same';
        break;
      case 'send_ephemeral':
        newStep.messageText = '🔒 Dyskretna odpowiedź widoczna tylko dla Ciebie, {user}.';
        break;
      case 'send_dm':
        newStep.messageText = '👋 Hej {user}, to prywatna wiadomość z serwera {server.name}!';
        break;
      case 'give_role':
        newStep.roleName = 'Zweryfikowany';
        break;
      case 'remove_role':
        newStep.roleName = 'Nowy';
        break;
      case 'kick_member':
        newStep.reason = 'Wyrzucony przez automatyczną regułę KitekBot';
        break;
      case 'ban_member':
        newStep.reason = 'Zbanowany przez automatyczną regułę KitekBot';
        newStep.deleteMessageDays = 1;
        break;
      case 'delete_message':
        break;
      case 'send_embed':
        newStep.embedTitle = '📢 Ważne powiadomienie';
        newStep.embedDescription = 'Treść sformatowanej wiadomości embed dla {user}.';
        newStep.embedColor = '#5865F2';
        newStep.embedFooter = 'KitekBot Automation';
        break;
      case 'random_message':
        newStep.randomOptions = [
          'Opcja 1: Witaj serdecznie!',
          'Opcja 2: Cześć i czołem!',
          'Opcja 3: Miło Cię widzieć!'
        ];
        break;
      case 'change_nickname':
        newStep.newNickname = '{user.name} [Zweryfikowany]';
        break;
    }

    updateCurrentFlow({ steps: [...currentFlow.steps, newStep] });
    setIsStepModalOpen(false);
  };

  const updateStep = (stepId: string, patch: Partial<ActionStep>) => {
    if (!currentFlow) return;
    const updated = currentFlow.steps.map((s) => (s.id === stepId ? { ...s, ...patch } : s));
    updateCurrentFlow({ steps: updated });
  };

  const deleteStep = (stepId: string) => {
    if (!currentFlow) return;
    const updated = currentFlow.steps.filter((s) => s.id !== stepId);
    updateCurrentFlow({ steps: updated });
  };

  const duplicateStep = (step: ActionStep, index: number) => {
    if (!currentFlow) return;
    const copy: ActionStep = {
      ...step,
      id: 'step-' + Math.random().toString(36).substring(2, 8)
    };
    const newSteps = [...currentFlow.steps];
    newSteps.splice(index + 1, 0, copy);
    updateCurrentFlow({ steps: newSteps });
  };

  // Run simulation of the flow
  const runSimulation = async () => {
    if (!currentFlow || simulating) return;
    setSimulating(true);
    setSimulationLogs([]);
    setSimulationCountdown(null);

    const now = () => new Date().toLocaleTimeString();
    const addLog = (text: string, type: 'info' | 'success' | 'wait' = 'info') => {
      setSimulationLogs((prev) => [...prev, { id: Math.random().toString(), text, time: now(), type }]);
    };

    addLog(`🚀 [Trigger] Wywołano wyzwalacz: ${getTriggerBadge(currentFlow.trigger).label}`, 'info');

    for (let i = 0; i < currentFlow.steps.length; i++) {
      const step = currentFlow.steps[i];
      const stepNum = i + 1;

      if (step.type === 'wait') {
        const secs = step.durationSeconds || 5;
        addLog(`⏱️ [Krok ${stepNum}] Czekam ${secs} sekund...`, 'wait');
        for (let s = secs; s > 0; s--) {
          setSimulationCountdown(s);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        setSimulationCountdown(null);
        addLog(`⏱️ [Krok ${stepNum}] Upłynęło ${secs}s, wznawiam kolejne kroki.`, 'info');
      } else if (step.type === 'send_message') {
        addLog(`💬 [Krok ${stepNum}] Wysłano wiadomość na kanał: "${step.messageText || ''}"`, 'success');
        await new Promise((resolve) => setTimeout(resolve, 400));
      } else if (step.type === 'send_ephemeral') {
        addLog(`🔒 [Krok ${stepNum}] Wysłano odpowiedź ephemeral (tylko dla użytkownika): "${step.messageText || ''}"`, 'success');
        await new Promise((resolve) => setTimeout(resolve, 400));
      } else if (step.type === 'send_dm') {
        addLog(`✉️ [Krok ${stepNum}] Wysłano wiadomość prywatną (DM) do użytkownika`, 'success');
        await new Promise((resolve) => setTimeout(resolve, 400));
      } else if (step.type === 'give_role') {
        addLog(`🏷️ [Krok ${stepNum}] Nadano rolę: @${step.roleName || 'Rola'}`, 'success');
        await new Promise((resolve) => setTimeout(resolve, 400));
      } else if (step.type === 'remove_role') {
        addLog(`🚫 [Krok ${stepNum}] Odebrano rolę: @${step.roleName || 'Rola'}`, 'info');
        await new Promise((resolve) => setTimeout(resolve, 400));
      } else if (step.type === 'delete_message') {
        addLog(`🗑️ [Krok ${stepNum}] Usunięto wiadomość wywołującą trigger`, 'info');
        await new Promise((resolve) => setTimeout(resolve, 300));
      } else if (step.type === 'send_embed') {
        addLog(`📌 [Krok ${stepNum}] Wysłano sformatowany Embed: "${step.embedTitle || 'Embed'}"`, 'success');
        await new Promise((resolve) => setTimeout(resolve, 400));
      } else if (step.type === 'random_message') {
        const opts = step.randomOptions || ['Wariant A'];
        const chosen = opts[Math.floor(Math.random() * opts.length)];
        addLog(`🔀 [Krok ${stepNum}] Wylosowano odpowiedź: "${chosen}"`, 'success');
        await new Promise((resolve) => setTimeout(resolve, 400));
      } else if (step.type === 'kick_member') {
        addLog(`👢 [Krok ${stepNum}] Wyrzucono użytkownika (Powód: ${step.reason || 'Brak'})`, 'info');
        await new Promise((resolve) => setTimeout(resolve, 400));
      } else if (step.type === 'ban_member') {
        addLog(`🔨 [Krok ${stepNum}] Zbanowano użytkownika (Powód: ${step.reason || 'Brak'})`, 'info');
        await new Promise((resolve) => setTimeout(resolve, 400));
      } else if (step.type === 'change_nickname') {
        addLog(`📝 [Krok ${stepNum}] Zmieniono pseudonim na: ${step.newNickname || 'Nowy nick'}`, 'success');
        await new Promise((resolve) => setTimeout(resolve, 400));
      }
    }

    addLog('🎉 Wszystkie kroki akcji zostały wykonane pomyślnie!', 'success');
    setSimulating(false);
  };

  const getTriggerBadge = (t: ActionTriggerConfig) => {
    switch (t.type) {
      case 'command':
        return { label: `Komenda: ${t.commandName || '!komenda'}`, color: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30' };
      case 'message_sent':
        return { label: `Wiadomość na ${t.channelScope === 'specific' ? '#' + (t.channelName || 'kanał') : 'dowolnym kanale'}`, color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' };
      case 'member_join':
        return { label: 'Dołączenie użytkownika (Member Join)', color: 'text-sky-400 bg-sky-500/15 border-sky-500/30' };
      case 'member_leave':
        return { label: 'Opuszczenie serwera (Member Leave)', color: 'text-rose-400 bg-rose-500/15 border-rose-500/30' };
      case 'button_click':
        return { label: 'Kliknięcie przycisku / Menu', color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' };
      case 'reaction_add':
        return { label: 'Dodanie reakcji', color: 'text-purple-400 bg-purple-500/15 border-purple-500/30' };
      default:
        return { label: 'Trigger', color: 'text-neutral-300 bg-neutral-800 border-neutral-700' };
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#5865F2] mb-3" />
        <div className="text-base font-bold text-white">Wczytywanie konfiguracji akcji...</div>
        <div className="text-xs text-neutral-400 mt-1">Łączenie z serwerem {guild.name}</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col space-y-6 pb-20">
      {/* GÓRNY PASEK Z TYTUŁEM I PRZYCISKAMI AKCJI */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#363744]">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="p-2 rounded-xl bg-[#272831] hover:bg-[#202128] border border-[#3b3c47] text-neutral-300 hover:text-white transition-all cursor-pointer shadow-sm"
            title="Wróć do wyboru serwerów"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#5865F2]/20 border border-[#5865F2]/40 text-[#5865F2]">
                <Zap className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-black uppercase tracking-tight text-white">
                Kreator Akcji (Actions & Flows)
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#5865F2]/20 text-[#8590ff] text-xs font-black border border-[#5865F2]/40">
                v5.4.0
              </span>
            </div>
            <p className="text-xs text-neutral-300 font-medium mt-1">
              Serwer: <span className="text-white font-bold">{guild.name}</span> • Konfiguruj wyzwalacze, opóźnienia i sekwencje akcji
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            onClick={handleCreateFlow}
            className="px-3.5 py-2 rounded-xl bg-[#272831] hover:bg-[#202128] border border-[#3b3c47] text-neutral-200 hover:text-white font-bold text-xs uppercase flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4 text-[#5865F2]" />
            <span>Nowa Akcja</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-5 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg ${
              saveSuccess
                ? 'bg-emerald-600 text-white shadow-emerald-950/40 border border-emerald-400'
                : 'bg-[#5865F2] hover:bg-[#4752C4] active:scale-[0.98] text-white shadow-indigo-950/40 border border-[#6b77f5]'
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Zapisywanie...</span>
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Zapisano pomyślnie!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Zapisz zmiany</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/40 text-red-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* GŁÓWNY WIDOK: LISTA PRZEPŁYWÓW PO LEWEJ + EDYTOR PO PRAWEJ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEWA KOLUMNA: LISTA ZDEFINIOWANYCH AKCJI */}
        <div className="lg:col-span-4 bg-[#32333d] border border-[#272831] rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between px-1 pb-2 border-b border-[#272831]">
            <span className="text-xs font-black uppercase tracking-wider text-neutral-300">
              Twoje Akcje ({flows.length})
            </span>
            <button
              onClick={handleCreateFlow}
              className="text-[11px] font-bold text-[#8590ff] hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Dodaj</span>
            </button>
          </div>

          <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
            {flows.map((flow) => {
              const isSelected = flow.id === currentFlow?.id;
              const badge = getTriggerBadge(flow.trigger);
              return (
                <div
                  key={flow.id}
                  onClick={() => setSelectedFlowId(flow.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group flex flex-col space-y-2 ${
                    isSelected
                      ? 'bg-[#272831] border-[#5865F2] shadow-md shadow-indigo-950/30'
                      : 'bg-[#2a2b34] hover:bg-[#272831] border-[#383944] text-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${flow.enabled ? 'bg-emerald-400' : 'bg-neutral-500'}`} />
                      <span className="font-extrabold text-xs text-white truncate">
                        {flow.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateFlow(flow);
                        }}
                        title="Duplikuj akcję"
                        className="p-1 rounded text-neutral-400 hover:text-white hover:bg-white/10"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFlow(flow.id);
                        }}
                        title="Usuń akcję"
                        className="p-1 rounded text-neutral-400 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-neutral-400">
                    <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${badge.color}`}>
                      {badge.label}
                    </span>
                    <span className="font-semibold text-neutral-400">
                      {flow.steps.length} {flow.steps.length === 1 ? 'krok' : flow.steps.length < 5 ? 'kroki' : 'kroków'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleCreateFlow}
            className="w-full py-2.5 px-3 rounded-xl border border-dashed border-[#3b3c47] hover:border-[#5865F2] text-neutral-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 bg-[#272831]/50 hover:bg-[#272831] cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#5865F2]" />
            <span>Utwórz kolejną akcję</span>
          </button>
        </div>

        {/* PRAWA KOLUMNA: EDYTOR WYBRANEGO PRZEPŁYWU */}
        {currentFlow ? (
          <div className="lg:col-span-8 space-y-6">
            {/* GŁÓWNE DANE AKCJI (NAZWA, OPIS, WŁĄCZONA) */}
            <div className="bg-[#32333d] border border-[#272831] rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider text-neutral-400">
                    Nazwa akcji
                  </label>
                  <input
                    type="text"
                    value={currentFlow.name}
                    onChange={(e) => updateCurrentFlow({ name: e.target.value })}
                    placeholder="np. Automatyczne powitanie"
                    className="w-full bg-[#272831] border border-[#3b3c47] rounded-xl px-3.5 py-2 text-sm font-bold text-white focus:outline-none focus:border-[#5865F2]"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2 sm:pt-5">
                  <span className="text-xs font-bold text-neutral-300">
                    {currentFlow.enabled ? 'Aktywna' : 'Nieaktywna'}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateCurrentFlow({ enabled: !currentFlow.enabled })}
                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${
                      currentFlow.enabled ? 'bg-[#5865F2]' : 'bg-[#272831] border border-[#3b3c47]'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                        currentFlow.enabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-neutral-400">
                  Krótki opis / notatka
                </label>
                <input
                  type="text"
                  value={currentFlow.description || ''}
                  onChange={(e) => updateCurrentFlow({ description: e.target.value })}
                  placeholder="np. Wysyła powitanie na kanale, czeka 5s i nadaje rolę Zweryfikowany"
                  className="w-full bg-[#272831] border border-[#3b3c47] rounded-xl px-3.5 py-2 text-xs text-neutral-200 focus:outline-none focus:border-[#5865F2] mt-1"
                />
              </div>
            </div>

            {/* 1. BLOK TRIGGERA (WYWOLYWACZA) - "na start będzie postawion trigger i klikać wyświadcza się mnie gdzie ustawiasz co to za trigger" */}
            <div className="bg-[#32333d] border-2 border-[#5865F2]/40 rounded-2xl p-5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#5865F2] text-white text-[10px] font-black uppercase px-3 py-0.5 rounded-bl-xl tracking-wider">
                1. Wyzwalacz (Trigger)
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#272831]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-[#5865F2]" />
                    <h3 className="text-base font-black uppercase tracking-tight text-white">
                      Wyzwalacz Akcji
                    </h3>
                  </div>
                  <p className="text-xs text-neutral-300">
                    Kliknij poniżej, aby wybrać co uruchamia tę akcję i skonfigurować gdzie i kiedy ma zadziałać.
                  </p>
                </div>

                <button
                  onClick={() => setIsTriggerModalOpen(true)}
                  className="px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white font-extrabold text-xs uppercase rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Zmień typ triggera</span>
                </button>
              </div>

              {/* SZCZEGÓŁOWA KONFIGURACJA AKTUALNEGO TRIGGERA */}
              <div className="pt-4 space-y-4">
                <div
                  onClick={() => setIsTriggerModalOpen(true)}
                  className="p-4 rounded-xl bg-[#272831] border border-[#3b3c47] hover:border-[#5865F2] transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${getTriggerBadge(currentFlow.trigger).color}`}>
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-white uppercase group-hover:text-[#8590ff] transition-colors">
                        {getTriggerBadge(currentFlow.trigger).label}
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">
                        {TRIGGER_TYPES.find((t) => t.type === currentFlow.trigger.type)?.desc}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#8590ff] group-hover:underline">
                    Zmień &rarr;
                  </span>
                </div>

                {/* Parametry zależne od wybranego triggera */}
                {currentFlow.trigger.type === 'command' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#202128] border border-[#2d2e36]">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-neutral-300">
                        Nazwa komendy (np. !pomoc lub /weryfikacja)
                      </label>
                      <input
                        type="text"
                        value={currentFlow.trigger.commandName || ''}
                        onChange={(e) => updateCurrentTrigger({ commandName: e.target.value })}
                        placeholder="!pomoc"
                        className="w-full bg-[#272831] border border-[#3b3c47] rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#5865F2]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-neutral-300">
                        Kto może użyć komendy
                      </label>
                      <select
                        value={currentFlow.trigger.roleScope || 'everyone'}
                        onChange={(e) => updateCurrentTrigger({ roleScope: e.target.value as any })}
                        className="w-full bg-[#272831] border border-[#3b3c47] rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#5865F2] cursor-pointer"
                      >
                        <option value="everyone">Wszyscy użytkownicy</option>
                        <option value="admin_only">Tylko Administratorzy</option>
                        <option value="specific_role">Tylko wybrana rola</option>
                      </select>
                    </div>
                  </div>
                )}

                {currentFlow.trigger.type === 'message_sent' && (
                  <div className="p-4 rounded-xl bg-[#202128] border border-[#2d2e36] space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-neutral-300">
                          Gdzie (Zasięg kanałów)
                        </label>
                        <select
                          value={currentFlow.trigger.channelScope}
                          onChange={(e) => updateCurrentTrigger({ channelScope: e.target.value as any })}
                          className="w-full bg-[#272831] border border-[#3b3c47] rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#5865F2] cursor-pointer"
                        >
                          <option value="all">Wszystkie kanały serwera</option>
                          <option value="specific">Tylko konkretny kanał</option>
                        </select>
                      </div>

                      {currentFlow.trigger.channelScope === 'specific' && (
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-neutral-300">
                            Wybierz kanał
                          </label>
                          {availableChannels.length > 0 ? (
                            <select
                              value={currentFlow.trigger.channelId || ''}
                              onChange={(e) => {
                                const sel = availableChannels.find((c) => c.id === e.target.value);
                                updateCurrentTrigger({ channelId: e.target.value, channelName: sel?.name });
                              }}
                              className="w-full bg-[#272831] border border-[#3b3c47] rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#5865F2] cursor-pointer"
                            >
                              <option value="">-- Wybierz kanał z bota --</option>
                              {availableChannels.map((c) => (
                                <option key={c.id} value={c.id}>
                                  #{c.name} ({c.id})
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={currentFlow.trigger.channelName || currentFlow.trigger.channelId || ''}
                              onChange={(e) => updateCurrentTrigger({ channelName: e.target.value, channelId: e.target.value })}
                              placeholder="np. ogolny lub ID kanału"
                              className="w-full bg-[#272831] border border-[#3b3c47] rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#5865F2]"
                            />
                          )}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-neutral-300">
                          Kiedy (Filtr treści wiadomości)
                        </label>
                        <select
                          value={currentFlow.trigger.messageMatchType || 'contains'}
                          onChange={(e) => updateCurrentTrigger({ messageMatchType: e.target.value as any })}
                          className="w-full bg-[#272831] border border-[#3b3c47] rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#5865F2] cursor-pointer"
                        >
                          <option value="any">Każda wysłana wiadomość</option>
                          <option value="contains">Wiadomość zawiera słowo/frazę</option>
                          <option value="exact">Wiadomość jest dokładnie równa</option>
                          <option value="starts_with">Wiadomość zaczyna się od</option>
                        </select>
                      </div>

                      {currentFlow.trigger.messageMatchType !== 'any' && (
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-neutral-300">
                            Szukana fraza / słowo
                          </label>
                          <input
                            type="text"
                            value={currentFlow.trigger.messageContent || ''}
                            onChange={(e) => updateCurrentTrigger({ messageContent: e.target.value })}
                            placeholder="np. hej, pomoc, regulamin"
                            className="w-full bg-[#272831] border border-[#3b3c47] rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#5865F2]"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* STRZAŁKA PRZEPŁYWU W DÓŁ */}
            <div className="flex flex-col items-center justify-center -my-2 z-10">
              <div className="w-0.5 h-6 bg-[#5865F2]/50" />
              <div className="p-1 rounded-full bg-[#272831] border border-[#5865F2] text-[#8590ff]">
                <ChevronDown className="w-4 h-4" />
              </div>
              <div className="w-0.5 h-6 bg-[#5865F2]/50" />
            </div>

            {/* 2. KROKI AKCJI (ACTION STEPS) - "i zeby dalo sie ruszac kazdym przestawiac jakby go i doadj wiecj funckej tam" */}
            <div className="bg-[#32333d] border border-[#272831] rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#272831]">
                <div>
                  <h3 className="text-base font-black uppercase tracking-tight text-white flex items-center gap-2">
                    <span>2. Sekwencja Akcji (Kroki do wykonania)</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                      {currentFlow.steps.length}
                    </span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Użyj strzałek <span className="text-white font-bold">↑ / ↓</span>, aby dowolnie przestawiać kolejność wykonywania kroków.
                  </p>
                </div>

                <button
                  onClick={() => setIsStepModalOpen(true)}
                  className="px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white font-black text-xs uppercase rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Dodaj krok akcji</span>
                </button>
              </div>

              {currentFlow.steps.length === 0 ? (
                <div className="p-8 rounded-xl border border-dashed border-[#3b3c47] text-center space-y-3">
                  <Clock className="w-8 h-8 mx-auto text-neutral-500" />
                  <div className="text-sm font-bold text-white">Brak kroków w tej akcji</div>
                  <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                    Kliknij przycisk poniżej, aby dodać pierwszą akcję (np. Odczekaj 5 sekund lub Wyślij wiadomość na kanał).
                  </p>
                  <button
                    onClick={() => setIsStepModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5865F2] text-white text-xs font-bold uppercase cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Wybierz pierwszy krok</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentFlow.steps.map((step, index) => {
                    const stepMeta = STEP_TYPES.find((s) => s.type === step.type);
                    const StepIcon = stepMeta?.icon || Zap;
                    const isFirst = index === 0;
                    const isLast = index === currentFlow.steps.length - 1;

                    return (
                      <div
                        key={step.id}
                        className="p-4 rounded-xl bg-[#272831] border border-[#3b3c47] hover:border-[#4a4b59] transition-all space-y-3 group"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            {/* NUMER KROKU I IKONA */}
                            <span className="w-6 h-6 rounded-lg bg-[#202128] border border-[#3b3c47] text-[11px] font-black flex items-center justify-center text-neutral-300">
                              {index + 1}
                            </span>
                            <div className={`p-1.5 rounded-lg border ${stepMeta?.color || 'text-neutral-300 bg-neutral-800'}`}>
                              <StepIcon className="w-4 h-4" />
                            </div>
                            <span className="font-black text-xs text-white uppercase">
                              {stepMeta?.title || step.type}
                            </span>
                          </div>

                          {/* KONTROLKI PRZESTAWIANIA (GÓRA / DÓŁ) I USUWANIA */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => moveStep(index, 'up')}
                              disabled={isFirst}
                              title="Przesuń w górę"
                              className="p-1.5 rounded-lg bg-[#202128] hover:bg-[#2e2f3a] text-neutral-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => moveStep(index, 'down')}
                              disabled={isLast}
                              title="Przesuń w dół"
                              className="p-1.5 rounded-lg bg-[#202128] hover:bg-[#2e2f3a] text-neutral-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => duplicateStep(step, index)}
                              title="Duplikuj ten krok"
                              className="p-1.5 rounded-lg bg-[#202128] hover:bg-[#2e2f3a] text-neutral-400 hover:text-white cursor-pointer transition-colors"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteStep(step.id)}
                              title="Usuń ten krok"
                              className="p-1.5 rounded-lg bg-[#202128] hover:bg-red-500/20 text-neutral-400 hover:text-red-400 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* EDYCJA DANYCH DLA KONKRETNEGO KROKU */}
                        <div className="pt-2 border-t border-[#363744]">
                          {/* 1. OPÓŹNIENIE (WAIT / DELAY) */}
                          {step.type === 'wait' && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-neutral-300">
                                  Czas oczekiwania: <span className="text-amber-400 font-black">{step.durationSeconds || 5} sekund</span>
                                </span>
                                <div className="flex gap-1">
                                  {[1, 3, 5, 10, 30, 60].map((sec) => (
                                    <button
                                      key={sec}
                                      onClick={() => updateStep(step.id, { durationSeconds: sec })}
                                      className={`px-2 py-0.5 text-[10px] font-black rounded cursor-pointer transition-all ${
                                        step.durationSeconds === sec
                                          ? 'bg-amber-500 text-black font-black'
                                          : 'bg-[#202128] text-neutral-400 hover:text-white'
                                      }`}
                                    >
                                      {sec}s
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <input
                                type="range"
                                min="1"
                                max="120"
                                value={step.durationSeconds || 5}
                                onChange={(e) => updateStep(step.id, { durationSeconds: parseInt(e.target.value) || 1 })}
                                className="w-full accent-amber-400 cursor-pointer"
                              />
                            </div>
                          )}

                          {/* 2. WYŚLIJ WIADOMOŚĆ NA KANAŁ */}
                          {step.type === 'send_message' && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-[11px] text-neutral-400">
                                <span className="font-bold">Treść wiadomości</span>
                                <span className="text-[10px]">Zmienne: {'{user}'}, {'{server.name}'}</span>
                              </div>
                              <textarea
                                value={step.messageText || ''}
                                onChange={(e) => updateStep(step.id, { messageText: e.target.value })}
                                rows={2}
                                placeholder="Wpisz treść wiadomości..."
                                className="w-full bg-[#202128] border border-[#3b3c47] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                              />
                            </div>
                          )}

                          {/* 3. ODPOWIEDŹ EPHEMERAL */}
                          {step.type === 'send_ephemeral' && (
                            <div className="space-y-2">
                              <div className="text-[11px] font-bold text-neutral-300">
                                Treść dyskretnej odpowiedzi (widoczna tylko dla klikającego)
                              </div>
                              <input
                                type="text"
                                value={step.messageText || ''}
                                onChange={(e) => updateStep(step.id, { messageText: e.target.value })}
                                placeholder="np. Twoje zgłoszenie zostało przyjęte."
                                className="w-full bg-[#202128] border border-[#3b3c47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                              />
                            </div>
                          )}

                          {/* 4. WIADOMOŚĆ PRYWATNA (DM) */}
                          {step.type === 'send_dm' && (
                            <div className="space-y-2">
                              <div className="text-[11px] font-bold text-neutral-300">
                                Treść wiadomości prywatnej (Direct Message do użytkownika)
                              </div>
                              <textarea
                                value={step.messageText || ''}
                                onChange={(e) => updateStep(step.id, { messageText: e.target.value })}
                                rows={2}
                                placeholder="Witaj na serwerze! Sprawdź ważne informacje..."
                                className="w-full bg-[#202128] border border-[#3b3c47] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                              />
                            </div>
                          )}

                          {/* 5. NADAJ ROLĘ */}
                          {step.type === 'give_role' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-neutral-300">Nazwa roli</label>
                                <input
                                  type="text"
                                  value={step.roleName || ''}
                                  onChange={(e) => updateStep(step.id, { roleName: e.target.value })}
                                  placeholder="np. Zweryfikowany"
                                  className="w-full bg-[#202128] border border-[#3b3c47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-neutral-300">Lub ID roli z serwera</label>
                                {availableRoles.length > 0 ? (
                                  <select
                                    value={step.roleId || ''}
                                    onChange={(e) => {
                                      const sel = availableRoles.find((r) => r.id === e.target.value);
                                      updateStep(step.id, { roleId: e.target.value, roleName: sel?.name || step.roleName });
                                    }}
                                    className="w-full bg-[#202128] border border-[#3b3c47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5865F2] cursor-pointer"
                                  >
                                    <option value="">-- Wybierz z ról serwera --</option>
                                    {availableRoles.map((r) => (
                                      <option key={r.id} value={r.id}>
                                        @{r.name}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <input
                                    type="text"
                                    value={step.roleId || ''}
                                    onChange={(e) => updateStep(step.id, { roleId: e.target.value })}
                                    placeholder="np. 123456789012345678"
                                    className="w-full bg-[#202128] border border-[#3b3c47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                                  />
                                )}
                              </div>
                            </div>
                          )}

                          {/* 6. ODBIERZ ROLĘ */}
                          {step.type === 'remove_role' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-neutral-300">Nazwa odbieranej roli</label>
                                <input
                                  type="text"
                                  value={step.roleName || ''}
                                  onChange={(e) => updateStep(step.id, { roleName: e.target.value })}
                                  placeholder="np. Niezweryfikowany"
                                  className="w-full bg-[#202128] border border-[#3b3c47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-neutral-300">Lub ID roli</label>
                                <input
                                  type="text"
                                  value={step.roleId || ''}
                                  onChange={(e) => updateStep(step.id, { roleId: e.target.value })}
                                  placeholder="ID roli..."
                                  className="w-full bg-[#202128] border border-[#3b3c47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                                />
                              </div>
                            </div>
                          )}

                          {/* 7. WYŚLIJ EMBED */}
                          {step.type === 'send_embed' && (
                            <div className="space-y-3 p-3 rounded-xl bg-[#202128] border border-[#2e2f3a]">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-neutral-400">Tytuł Embedu</label>
                                  <input
                                    type="text"
                                    value={step.embedTitle || ''}
                                    onChange={(e) => updateStep(step.id, { embedTitle: e.target.value })}
                                    placeholder="Tytuł..."
                                    className="w-full bg-[#272831] border border-[#3b3c47] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-neutral-400">Kolor HEX</label>
                                  <div className="flex gap-2 items-center">
                                    <input
                                      type="color"
                                      value={step.embedColor || '#5865F2'}
                                      onChange={(e) => updateStep(step.id, { embedColor: e.target.value })}
                                      className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                                    />
                                    <input
                                      type="text"
                                      value={step.embedColor || '#5865F2'}
                                      onChange={(e) => updateStep(step.id, { embedColor: e.target.value })}
                                      className="flex-1 bg-[#272831] border border-[#3b3c47] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-neutral-400">Opis Embedu</label>
                                <textarea
                                  value={step.embedDescription || ''}
                                  onChange={(e) => updateStep(step.id, { embedDescription: e.target.value })}
                                  rows={2}
                                  placeholder="Treść sformatowanego opisu embedu..."
                                  className="w-full bg-[#272831] border border-[#3b3c47] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                                />
                              </div>
                            </div>
                          )}

                          {/* 8. KICK / BAN */}
                          {(step.type === 'kick_member' || step.type === 'ban_member') && (
                            <div className="space-y-2">
                              <label className="text-[11px] font-bold text-neutral-300">
                                Powód (zapisywany w Dzienniku Zdarzeń / Audit Log serwera)
                              </label>
                              <input
                                type="text"
                                value={step.reason || ''}
                                onChange={(e) => updateStep(step.id, { reason: e.target.value })}
                                placeholder="np. Złamanie regulaminu serwera"
                                className="w-full bg-[#202128] border border-[#3b3c47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                              />
                            </div>
                          )}

                          {/* 9. RANDOM MESSAGE */}
                          {step.type === 'random_message' && (
                            <div className="space-y-2">
                              <label className="text-[11px] font-bold text-neutral-300">
                                Warianty odpowiedzi (jeden na linijkę):
                              </label>
                              <textarea
                                value={(step.randomOptions || []).join('\n')}
                                onChange={(e) =>
                                  updateStep(step.id, {
                                    randomOptions: e.target.value.split('\n').filter(Boolean)
                                  })
                                }
                                rows={3}
                                placeholder="Wariant 1&#10;Wariant 2&#10;Wariant 3"
                                className="w-full bg-[#202128] border border-[#3b3c47] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                              />
                            </div>
                          )}

                          {/* 10. CHANGE NICKNAME */}
                          {step.type === 'change_nickname' && (
                            <div className="space-y-2">
                              <label className="text-[11px] font-bold text-neutral-300">
                                Nowy pseudonim (możesz użyć {'{user.name}'})
                              </label>
                              <input
                                type="text"
                                value={step.newNickname || ''}
                                onChange={(e) => updateStep(step.id, { newNickname: e.target.value })}
                                placeholder="{user.name} [Rola]"
                                className="w-full bg-[#202128] border border-[#3b3c47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                              />
                            </div>
                          )}

                          {/* 11. DELETE MESSAGE */}
                          {step.type === 'delete_message' && (
                            <div className="text-xs text-neutral-400 italic">
                              Wiadomość, która wywołała ten trigger zostanie natychmiast skasowana z kanału.
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. TESTER AKCJI NA ŻYWO (SIMULATOR) */}
            <div className="bg-[#2a2b34] border border-[#383944] rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-black uppercase text-white">
                    Tester przepływu akcji
                  </span>
                </div>

                <button
                  onClick={runSimulation}
                  disabled={simulating}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs uppercase flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-950/30"
                >
                  {simulating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>
                        {simulationCountdown !== null ? `Odliczanie: ${simulationCountdown}s...` : 'Wykonywanie kroków...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Uruchom test</span>
                    </>
                  )}
                </button>
              </div>

              {simulationLogs.length > 0 && (
                <div className="p-3.5 rounded-xl bg-[#1d1e25] border border-[#2d2e36] font-mono text-[11px] space-y-1.5 max-h-48 overflow-y-auto">
                  {simulationLogs.map((log) => (
                    <div
                      key={log.id}
                      className={`flex items-start gap-2 ${
                        log.type === 'success'
                          ? 'text-emerald-300'
                          : log.type === 'wait'
                          ? 'text-amber-300'
                          : 'text-neutral-300'
                      }`}
                    >
                      <span className="text-neutral-500 text-[10px] shrink-0">[{log.time}]</span>
                      <span>{log.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 p-12 text-center text-neutral-400 bg-[#32333d] rounded-2xl border border-[#272831]">
            Wybierz akcję z listy po lewej stronie lub kliknij Nowa Akcja.
          </div>
        )}
      </div>

      {/* MODAL: WYBÓR TYPU TRIGGERA */}
      {isTriggerModalOpen && currentFlow && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#32333d] border border-[#3b3c47] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#272831]">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#5865F2]" />
                <h3 className="text-lg font-black uppercase text-white">
                  Wybierz Wyzwalacz (Trigger)
                </h3>
              </div>
              <button
                onClick={() => setIsTriggerModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-300">
              Wskaż zdarzenie, które uruchomi tę akcję:
            </p>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {TRIGGER_TYPES.map((t) => {
                const Icon = t.icon;
                const isCurrent = currentFlow.trigger.type === t.type;
                return (
                  <div
                    key={t.type}
                    onClick={() => {
                      updateCurrentTrigger({ type: t.type });
                      setIsTriggerModalOpen(false);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 group ${
                      isCurrent
                        ? 'bg-[#272831] border-[#5865F2] shadow-md shadow-indigo-950/30'
                        : 'bg-[#2a2b34] hover:bg-[#272831] border-[#383944]'
                    }`}
                  >
                    <div className={`p-2 rounded-xl border shrink-0 ${t.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-black text-white group-hover:text-[#8590ff] transition-colors">
                        {t.title}
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">
                        {t.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: WYBÓR NOWEGO KROKU AKCJI */}
      {isStepModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#32333d] border border-[#3b3c47] rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#272831]">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#5865F2]" />
                <h3 className="text-lg font-black uppercase text-white">
                  Dodaj Krok do Akcji
                </h3>
              </div>
              <button
                onClick={() => setIsStepModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-300">
              Wybierz rodzaj działania, które bot ma wykonać:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
              {STEP_TYPES.map((step) => {
                const Icon = step.icon;
                return (
                  <button
                    key={step.type}
                    onClick={() => addStep(step.type)}
                    className="p-3.5 rounded-xl bg-[#2a2b34] hover:bg-[#272831] border border-[#383944] hover:border-[#5865F2] transition-all cursor-pointer flex items-start gap-3 text-left group"
                  >
                    <div className={`p-2 rounded-xl border shrink-0 ${step.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-black text-white group-hover:text-[#8590ff] transition-colors">
                        {step.title}
                      </div>
                      <div className="text-[10px] text-neutral-400 mt-0.5 line-clamp-2">
                        {step.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
