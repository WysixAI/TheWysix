import React, { useState, useEffect } from 'react';
import { X, Play, RotateCcw, Bot, User, CheckCircle2, AlertCircle, Clock, MessageSquare, Shield, Layers, EyeOff } from 'lucide-react';
import { ActionFlow, ActionStep } from '../../types/guildConfig';
import { BotGhostEmbedPreview } from './BotGhostEmbedPreview';

interface BotGhostSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  flow: ActionFlow;
  serverName: string;
}

interface SimulatedMessage {
  id: string;
  sender: 'user' | 'bot';
  content?: string;
  isEphemeral?: boolean;
  embed?: {
    title?: string;
    description?: string;
    color?: string;
    footer?: string;
    includeTimestamp?: boolean;
  };
  time: string;
}

interface ExecutionLog {
  id: string;
  stepIndex: number;
  text: string;
  type: 'info' | 'success' | 'wait' | 'warn';
  time: string;
}

export function BotGhostSimulatorModal({
  isOpen,
  onClose,
  flow,
  serverName
}: BotGhostSimulatorModalProps) {
  const [messages, setMessages] = useState<SimulatedMessage[]>([]);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'logs'>('chat');

  useEffect(() => {
    if (isOpen) {
      runSimulation();
    }
  }, [isOpen]);

  const runSimulation = async () => {
    setIsRunning(true);
    setMessages([]);
    setLogs([]);

    const addLog = (text: string, type: 'info' | 'success' | 'wait' | 'warn' = 'info', stepIndex: number = 0) => {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLogs((prev) => [...prev, { id: Math.random().toString(36), text, type, time, stepIndex }]);
    };

    const addMsg = (msg: Omit<SimulatedMessage, 'id' | 'time'>) => {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [...prev, { ...msg, id: Math.random().toString(36), time }]);
    };

    // 1. Użytkownik wpisuje komendę
    const cmdTrigger = flow.trigger.commandName ? `/${flow.trigger.commandName}` : `[Zdarzenie: ${flow.trigger.type}]`;
    addMsg({
      sender: 'user',
      content: cmdTrigger
    });
    addLog(`Wywołano wyzwalacz: ${cmdTrigger} przez Użytkownika`, 'info', 0);

    await new Promise((r) => setTimeout(r, 600));

    // 2. Wykonywanie kolejnych kroków
    for (let i = 0; i < flow.steps.length; i++) {
      const step = flow.steps[i];

      if (step.type === 'wait') {
        const secs = step.durationSeconds || 2;
        addLog(`Oczekiwanie ${secs}s (Wait Delay)...`, 'wait', i + 1);
        await new Promise((r) => setTimeout(r, Math.min(secs * 300, 1500)));
        addLog(`Czas minął, przejście do kolejnego kroku`, 'info', i + 1);
      } else if (step.type === 'condition_if') {
        addLog(`Warunek IF (${step.conditionType || 'has_role'}): Spełniony (PASS)`, 'success', i + 1);
        await new Promise((r) => setTimeout(r, 400));
      } else if (step.type === 'cooldown') {
        addLog(`Zastosowano limit Cooldown: ${step.cooldownSeconds || 10}s`, 'info', i + 1);
      } else if (step.type === 'send_message') {
        addMsg({
          sender: 'bot',
          content: (step.messageText || 'Wiadomość z bota').replace(/{user}/g, '@Użytkownik').replace(/{server.name}/g, serverName)
        });
        addLog(`Wysłano wiadomość tekstową na kanale`, 'success', i + 1);
      } else if (step.type === 'send_ephemeral') {
        addMsg({
          sender: 'bot',
          isEphemeral: true,
          content: (step.messageText || 'Dyskretna wiadomość').replace(/{user}/g, '@Użytkownik').replace(/{server.name}/g, serverName)
        });
        addLog(`Wysłano odpowiedź Ephemeral (tylko dla autora)`, 'success', i + 1);
      } else if (step.type === 'send_embed') {
        addMsg({
          sender: 'bot',
          embed: {
            title: step.embedTitle || '🤖 KitekBot Embed',
            description: (step.embedDescription || 'Treść embedu').replace(/{user}/g, '@Użytkownik').replace(/{server.name}/g, serverName),
            color: step.embedColor || '#5865F2',
            footer: step.embedFooter || 'KitekBot Simulator',
            includeTimestamp: step.includeTimestamp !== false
          }
        });
        addLog(`Wysłano sformatowaną kartę Embed`, 'success', i + 1);
      } else if (step.type === 'give_role') {
        addLog(`Nadano rolę @${step.roleName || 'Rola'} użytkownikowi!`, 'success', i + 1);
      } else if (step.type === 'remove_role') {
        addLog(`Odebrano rolę @${step.roleName || 'Rola'}!`, 'info', i + 1);
      } else if (step.type === 'add_reaction') {
        addLog(`Dodano reakcję ${step.emoji || '✅'} do wiadomości`, 'success', i + 1);
      } else {
        addLog(`Wykonano blok: ${step.type}`, 'success', i + 1);
      }

      await new Promise((r) => setTimeout(r, 350));
    }

    addLog(`Zakończono pomyślnie cały przepływ komendy "${flow.name}"!`, 'success', flow.steps.length);
    setIsRunning(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-3xl rounded-2xl bg-[#1e1f24] border border-[#3b3c4a] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Pasek tytułowy okna Discord */}
        <div className="px-5 py-3.5 bg-[#16171b] border-b border-[#2e2f3a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white"># test-komend</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#5865F2]/20 text-[#8590ff] font-bold border border-[#5865F2]/40">
                  BotGhost Simulator
                </span>
              </div>
              <span className="text-[11px] text-neutral-400">
                Symulacja komendy: <strong className="text-neutral-200">{flow.name}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={runSimulation}
              disabled={isRunning}
              className="px-3 py-1.5 rounded-lg bg-[#272832] hover:bg-[#32333f] text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-[#3a3b49] cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin text-[#8590ff]' : ''}`} />
              <span>{isRunning ? 'Wykonywanie...' : 'Uruchom ponownie'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Przełącznik widoków: Chat Discord vs Logi */}
        <div className="px-5 py-2 bg-[#1a1b20] border-b border-[#2d2e38] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'chat'
                  ? 'bg-[#5865F2] text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Czat Discord ({messages.length})
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'logs'
                  ? 'bg-[#5865F2] text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Krok po kroku ({logs.length})
            </button>
          </div>

          <span className="text-[11px] text-neutral-400 font-mono">
            {isRunning ? '🟡 Symulacja w toku...' : '🟢 Zakończono'}
          </span>
        </div>

        {/* Zawartość czatu Discord */}
        {activeTab === 'chat' ? (
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#313338]">
            {messages.length === 0 && (
              <div className="text-center py-12 text-neutral-400 text-xs">
                Inicjalizacja symulatora...
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className="flex items-start gap-3 text-xs leading-relaxed group animate-in fade-in duration-200">
                {/* Awatar */}
                {msg.sender === 'bot' ? (
                  <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center text-white shrink-0 shadow">
                    <Bot className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-neutral-600 flex items-center justify-center text-white shrink-0 shadow">
                    <User className="w-5 h-5" />
                  </div>
                )}

                {/* Treść */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">
                      {msg.sender === 'bot' ? 'KitekBot' : 'Użytkownik'}
                    </span>
                    {msg.sender === 'bot' && (
                      <span className="bg-[#5865F2] text-white text-[9px] font-black px-1.5 py-0.2 rounded uppercase tracking-wider">
                        BOT
                      </span>
                    )}
                    <span className="text-[10px] text-neutral-400">Dzisiaj o {msg.time}</span>
                  </div>

                  {msg.content && (
                    <p className="text-[#dbdee1] text-xs mt-1 whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  )}

                  {msg.embed && (
                    <div className="mt-2 max-w-lg">
                      <BotGhostEmbedPreview
                        title={msg.embed.title}
                        description={msg.embed.description}
                        color={msg.embed.color}
                        footer={msg.embed.footer}
                        includeTimestamp={msg.embed.includeTimestamp}
                        serverName={serverName}
                      />
                    </div>
                  )}

                  {msg.isEphemeral && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-neutral-400">
                      <EyeOff className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Tylko Ty możesz to zobaczyć • <span className="text-[#5865F2] hover:underline cursor-pointer">Ukryj wiadomość</span></span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Widok logów */
          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#121316] font-mono text-xs">
            {logs.map((log) => (
              <div
                key={log.id}
                className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
                  log.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : log.type === 'wait'
                    ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                    : 'bg-[#1a1b22] border-[#2e2f3b] text-neutral-300'
                }`}
              >
                <span className="text-neutral-500 text-[10px] shrink-0 pt-0.5">
                  [{log.time}]
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 font-bold shrink-0">
                  Krok #{log.stepIndex}
                </span>
                <span className="flex-1">{log.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
