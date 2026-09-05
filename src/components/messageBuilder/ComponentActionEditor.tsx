import React, { useState } from 'react';
import { ComponentAction, ComponentActionType, createDefaultAction } from '../../types/guildConfig';
import { MarkdownToolbar } from './MarkdownToolbar';
import { Plus, Trash2, ChevronDown, ChevronUp, Copy, Shield, AlertTriangle, MessageSquare, Send, UserX, UserMinus } from 'lucide-react';

interface ComponentActionEditorProps {
  actions?: ComponentAction[];
  onChange: (actions: ComponentAction[]) => void;
  maxActions?: number;
}

export const ComponentActionEditor: React.FC<ComponentActionEditorProps> = ({
  actions = [],
  onChange,
  maxActions = 3,
}) => {
  const [openActionId, setOpenActionId] = useState<string | null>(actions[0]?.id || null);

  const addAction = (type: ComponentActionType = 'ephemeral_reply') => {
    if (actions.length >= maxActions) return;
    const newAct = createDefaultAction(type);
    onChange([...actions, newAct]);
    setOpenActionId(newAct.id);
  };

  const updateAction = (index: number, patch: Partial<ComponentAction>) => {
    const copy = [...actions];
    copy[index] = { ...copy[index], ...patch };
    onChange(copy);
  };

  const removeAction = (index: number) => {
    onChange(actions.filter((_, i) => i !== index));
  };

  const clearActions = () => {
    onChange([]);
  };

  const duplicateAction = (index: number) => {
    if (actions.length >= maxActions) return;
    const target = actions[index];
    const copy = {
      ...JSON.parse(JSON.stringify(target)),
      id: 'act-' + Math.random().toString(36).substring(2, 8),
    };
    const list = [...actions];
    list.splice(index + 1, 0, copy);
    onChange(list);
    setOpenActionId(copy.id);
  };

  const getActionIcon = (type: ComponentActionType) => {
    switch (type) {
      case 'give_role':
        return <Shield className="w-3.5 h-3.5 text-emerald-400" />;
      case 'remove_role':
        return <UserMinus className="w-3.5 h-3.5 text-amber-400" />;
      case 'kick':
        return <UserX className="w-3.5 h-3.5 text-rose-400" />;
      case 'ban':
        return <AlertTriangle className="w-3.5 h-3.5 text-red-500" />;
      case 'send_dm':
        return <Send className="w-3.5 h-3.5 text-purple-400" />;
      case 'text_response':
      case 'ephemeral_reply':
      default:
        return <MessageSquare className="w-3.5 h-3.5 text-[#5865F2]" />;
    }
  };

  const getActionLabel = (act: ComponentAction) => {
    switch (act.type) {
      case 'give_role':
        return `Nadaj Rolę (${act.roleName || 'Brak'})`;
      case 'remove_role':
        return `Odbierz Rolę (${act.roleName || 'Brak'})`;
      case 'kick':
        return `Wyrzuć Użytkownika (Kick)`;
      case 'ban':
        return `Zbanuj Użytkownika (Ban)`;
      case 'send_dm':
        return `Wiadomość Prywatna (DM)`;
      case 'text_response':
        return `Wiadomość na Kanał`;
      case 'ephemeral_reply':
      default:
        return `Odpowiedź Prywatna (Ephemeral)`;
    }
  };

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
          <span>Akcje Komponentu</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${
            actions.length >= maxActions
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'bg-[#1e1f26] text-neutral-400 border border-[#363744]'
          }`}>
            {actions.length} / {maxActions}
          </span>
        </span>
        {actions.length > 0 && (
          <button
            type="button"
            onClick={clearActions}
            className="text-[11px] text-rose-400 hover:text-rose-300 transition-colors font-bold cursor-pointer"
          >
            Wyczyść wszystkie
          </button>
        )}
      </div>

      {actions.map((act, aIdx) => {
        const isOpen = openActionId === act.id;

        return (
          <div
            key={act.id}
            className="bg-[#1a1b22] border border-[#343542] rounded-xl overflow-hidden shadow-sm transition-all"
          >
            {/* Header */}
            <div className="p-2.5 bg-[#202129] flex items-center justify-between gap-2 border-b border-[#2d2e3b]">
              <button
                type="button"
                onClick={() => setOpenActionId(isOpen ? null : act.id)}
                className="flex items-center gap-2 flex-1 text-left cursor-pointer group"
              >
                <div className="p-1 rounded bg-[#272832] border border-[#3b3c4b]">
                  {getActionIcon(act.type)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-white group-hover:text-indigo-300 transition-colors">
                    Akcja {aIdx + 1}
                  </span>
                  <span className="text-xs text-neutral-400 font-medium">
                    &bull; {getActionLabel(act)}
                  </span>
                </div>
              </button>

              <div className="flex items-center gap-1 text-neutral-400">
                <button
                  type="button"
                  onClick={() => duplicateAction(aIdx)}
                  disabled={actions.length >= maxActions}
                  title="Duplikuj akcję"
                  className="p-1 hover:text-white disabled:opacity-30 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeAction(aIdx)}
                  title="Usuń akcję"
                  className="p-1 hover:text-rose-400 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setOpenActionId(isOpen ? null : act.id)}
                  className="p-1 hover:text-white cursor-pointer"
                >
                  {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Body */}
            {isOpen && (
              <div className="p-3.5 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                      Typ Akcji
                    </label>
                    <select
                      value={act.type}
                      onChange={(e) => updateAction(aIdx, { type: e.target.value as ComponentActionType })}
                      className="w-full bg-[#202129] border border-[#3b3c4b] focus:border-[#5865F2] rounded-lg px-3 py-2 text-white text-xs font-semibold outline-none"
                    >
                      <option value="ephemeral_reply">🔒 Odpowiedź Prywatna (Ephemeral)</option>
                      <option value="text_response">💬 Wiadomość na Kanał (Publiczna)</option>
                      <option value="send_dm">✉️ Wiadomość Prywatna (DM)</option>
                      <option value="give_role">🛡️ Nadaj Rolę (Give Role)</option>
                      <option value="remove_role">❌ Odbierz Rolę (Remove Role)</option>
                      <option value="kick">👢 Wyrzuć z Serwera (Kick)</option>
                      <option value="ban">🔨 Zbanuj na Serwerze (Ban)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                      Cel Odpowiedzi (Target)
                    </label>
                    <select
                      value={act.target || (act.type === 'ephemeral_reply' ? 'ephemeral' : 'channel')}
                      onChange={(e) => updateAction(aIdx, { target: e.target.value as any })}
                      className="w-full bg-[#202129] border border-[#3b3c4b] focus:border-[#5865F2] rounded-lg px-3 py-2 text-white text-xs font-semibold outline-none"
                    >
                      <option value="ephemeral">Prywatnie (Tylko dla klikającego)</option>
                      <option value="channel">Na aktualny kanał</option>
                      <option value="dm">Prywatny czat bota (DM)</option>
                    </select>
                  </div>
                </div>

                {/* Role inputs */}
                {(act.type === 'give_role' || act.type === 'remove_role') && (
                  <div className="p-3 bg-[#202129] rounded-xl border border-[#363744] space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Konfiguracja Roli</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
                          Nazwa roli (np. Zweryfikowany)
                        </label>
                        <input
                          type="text"
                          value={act.roleName || ''}
                          onChange={(e) => updateAction(aIdx, { roleName: e.target.value })}
                          placeholder="Zweryfikowany"
                          className="w-full bg-[#181920] border border-[#3b3c4b] rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-neutral-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
                          ID roli Discord (Opcjonalnie)
                        </label>
                        <input
                          type="text"
                          value={act.roleId || ''}
                          onChange={(e) => updateAction(aIdx, { roleId: e.target.value })}
                          placeholder="123456789012345678"
                          className="w-full bg-[#181920] border border-[#3b3c4b] rounded-lg px-3 py-1.5 text-xs text-white font-mono placeholder:text-neutral-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Kick / Ban reason */}
                {(act.type === 'kick' || act.type === 'ban') && (
                  <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/30 space-y-2">
                    <label className="block text-[11px] font-bold uppercase text-rose-300">
                      Powód kary ({act.type.toUpperCase()})
                    </label>
                    <input
                      type="text"
                      value={act.reason || ''}
                      onChange={(e) => updateAction(aIdx, { reason: e.target.value })}
                      placeholder="Naruszenie regulaminu serwera..."
                      className="w-full bg-[#181920] border border-[#3b3c4b] rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-neutral-500"
                    />
                  </div>
                )}

                {/* Response Text with Markdown Toolbar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-300">
                      Treść wiadomości / Odpowiedzi
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-[11px] text-neutral-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(act.publicReply)}
                          onChange={(e) => updateAction(aIdx, { publicReply: e.target.checked })}
                          className="accent-[#5865F2] rounded"
                        />
                        <span>Publiczna</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-[11px] text-neutral-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(act.pingRoles)}
                          onChange={(e) => updateAction(aIdx, { pingRoles: e.target.checked })}
                          className="accent-[#5865F2] rounded"
                        />
                        <span>Oznacz role</span>
                      </label>
                    </div>
                  </div>

                  <div className="border border-[#3b3c4b] rounded-xl overflow-hidden focus-within:border-[#5865F2] bg-[#181920]">
                    <textarea
                      value={act.response || ''}
                      onChange={(e) => updateAction(aIdx, { response: e.target.value })}
                      rows={3}
                      placeholder="Wpisz treść wiadomości..."
                      className="w-full bg-transparent p-3 text-xs text-white resize-y outline-none leading-relaxed"
                    />
                    <MarkdownToolbar
                      charCount={(act.response || '').length}
                      maxChars={2000}
                      onInsert={(prefix, suffix = '') => {
                        const current = act.response || '';
                        updateAction(aIdx, { response: current + prefix + suffix });
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Wspiera zmienne: <code className="text-indigo-300 font-mono">&#123;user&#125;</code>, <code className="text-indigo-300 font-mono">&#123;user.name&#125;</code>, <code className="text-indigo-300 font-mono">&#123;server.name&#125;</code>
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {actions.length < maxActions && (
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => addAction('ephemeral_reply')}
            className="px-3.5 py-1.5 bg-[#5865F2] hover:bg-[#4752C4] active:scale-95 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Dodaj Akcję</span>
          </button>
        </div>
      )}
    </div>
  );
};
