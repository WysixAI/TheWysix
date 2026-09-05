import React, { useState } from 'react';
import {
  MessageContainer,
  ComponentSection,
  ComponentSeparator,
  ComponentActionRow,
  ComponentMedia,
  WelcomeButton,
  ComponentAction,
} from '../../types/guildConfig';
import { ExternalLink, ChevronDown, Check, Shield, AlertTriangle, UserX, UserMinus, Send, MessageSquare } from 'lucide-react';

interface LiveDiscordSimulatorProps {
  containers: MessageContainer[];
  plainMessage?: string;
  guildName?: string;
}

interface SimulatedToast {
  id: string;
  type: string;
  title: string;
  description: string;
  color: string;
}

export const LiveDiscordSimulator: React.FC<LiveDiscordSimulatorProps> = ({
  containers,
  plainMessage,
  guildName = 'Mój Serwer Discord',
}) => {
  const [openSelectId, setOpenSelectId] = useState<string | null>(null);
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});
  const [toasts, setToasts] = useState<SimulatedToast[]>([]);

  const showToast = (toast: SimulatedToast) => {
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, 4500);
  };

  const handleExecuteActions = (label: string, actions?: ComponentAction[]) => {
    if (!actions || actions.length === 0) {
      showToast({
        id: `t-${Date.now()}`,
        type: 'info',
        title: `Kliknięto "${label}"`,
        description: 'Ten komponent nie ma jeszcze przypisanych akcji w edytorze.',
        color: '#5865F2',
      });
      return;
    }

    actions.forEach((act, idx) => {
      setTimeout(() => {
        let title = '🤖 Akcja Bota';
        let desc = act.response || 'Wykonano akcję!';
        let color = '#5865F2';

        desc = desc
          .replace(/{user}/g, '@Użytkownik')
          .replace(/{user\.name}/g, 'Jan Kowalski')
          .replace(/{server\.name}/g, guildName);

        switch (act.type) {
          case 'give_role':
            title = `🛡️ Nadano Rolę: @${act.roleName || 'Użytkownik'}`;
            color = '#22c55e';
            break;
          case 'remove_role':
            title = `❌ Odebrano Rolę: @${act.roleName || 'Rola'}`;
            color = '#f59e0b';
            break;
          case 'kick':
            title = `👢 Wyrzucono Użytkownika (Kick)`;
            desc = `Powód: ${act.reason || 'Brak'}\n${desc}`;
            color = '#f43f5e';
            break;
          case 'ban':
            title = `🔨 Zbanowano Użytkownika (Ban)`;
            desc = `Powód: ${act.reason || 'Brak'}\n${desc}`;
            color = '#ef4444';
            break;
          case 'send_dm':
            title = `✉️ Wiadomość na DM wysłana do @Użytkownik`;
            color = '#a855f7';
            break;
          case 'text_response':
            title = `💬 Wiadomość na kanał`;
            color = '#5865F2';
            break;
          case 'ephemeral_reply':
          default:
            title = `🔒 Prywatna odpowiedź (Tylko dla Ciebie)`;
            color = '#5865F2';
            break;
        }

        showToast({
          id: `t-${Date.now()}-${idx}`,
          type: act.type,
          title,
          description: desc,
          color,
        });
      }, idx * 300);
    });
  };

  const getButtonStyleClasses = (style: WelcomeButton['style'], disabled?: boolean) => {
    if (disabled) return 'bg-[#35363c] text-neutral-500 cursor-not-allowed';
    switch (style) {
      case 'PRIMARY':
        return 'bg-[#5865F2] hover:bg-[#4752C4] text-white active:scale-95';
      case 'SUCCESS':
        return 'bg-[#248046] hover:bg-[#1a6334] text-white active:scale-95';
      case 'DANGER':
        return 'bg-[#DA373C] hover:bg-[#a1282c] text-white active:scale-95';
      case 'SECONDARY':
      default:
        return 'bg-[#4E5058] hover:bg-[#6D6F78] text-white active:scale-95';
    }
  };

  const renderFormattedText = (text: string) => {
    const formatted = text
      .replace(/{user}/g, '@Użytkownik')
      .replace(/{server\.name}/g, guildName)
      .replace(/{memberCount}/g, '142')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/__(.*?)__/g, '<u>$1</u>')
      .replace(/~~(.*?)~~/g, '<del>$1</del>');

    return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  return (
    <div className="relative space-y-4">
      {/* Active Toasts from simulator */}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 space-y-2 max-w-sm pointer-events-none">
          {toasts.map((t) => (
            <div
              key={t.id}
              style={{ borderLeftColor: t.color }}
              className="pointer-events-auto bg-[#181920]/95 backdrop-blur-md border border-[#31323f] border-l-4 rounded-xl p-3 shadow-2xl text-xs space-y-1 animate-in slide-in-from-bottom-3 fade-in duration-200"
            >
              <div className="font-bold text-white flex items-center gap-1.5">
                <span>{t.title}</span>
              </div>
              <p className="text-neutral-300 whitespace-pre-wrap leading-relaxed">
                {t.description}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Main Discord Message View */}
      <div className="bg-[#313338] rounded-xl p-4 sm:p-5 text-[#dbdee1] font-sans border border-[#232428] shadow-2xl space-y-3">
        {/* Message Header */}
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center text-white font-black text-sm shrink-0 overflow-hidden shadow">
            <span className="text-lg">🤖</span>
          </div>

          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-white text-sm hover:underline cursor-pointer">
                KitekBot
              </span>
              <span className="bg-[#5865F2] text-white text-[10px] font-black uppercase px-1.5 py-0.5 rounded-[4px] tracking-wide">
                BOT
              </span>
              <span className="text-[11px] text-neutral-400">
                Dzisiaj o 14:32
              </span>
            </div>

            {/* Plain text message if present */}
            {plainMessage && (
              <div className="text-sm text-[#dbdee1] leading-relaxed pt-0.5 whitespace-pre-wrap">
                {renderFormattedText(plainMessage)}
              </div>
            )}
          </div>
        </div>

        {/* Containers (Embed / Message Cards) */}
        <div className="space-y-2 sm:pl-13.5">
          {containers.map((c, cIdx) => (
            <div
              key={c.id || cIdx}
              style={{ borderLeftColor: c.color || '#5865F2' }}
              className="bg-[#2b2d31] border-l-4 rounded-r-lg p-3 sm:p-4 text-xs space-y-3.5 shadow-md border-t border-r border-b border-[#242529]"
            >
              {c.components.map((comp) => {
                // 1. SECTION
                if (comp.type === 'section') {
                  const sec = comp as ComponentSection;
                  const thumb = sec.accessory?.type === 'Thumbnail' ? sec.accessory.url : null;
                  const img = sec.accessory?.type === 'Image' ? sec.accessory.url : null;

                  return (
                    <div key={sec.id} className="space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2 flex-1 min-w-0">
                          {sec.texts.map((t) => (
                            <div
                              key={t.id}
                              className="text-sm text-[#dbdee1] leading-relaxed whitespace-pre-wrap"
                            >
                              {renderFormattedText(t.content)}
                            </div>
                          ))}
                        </div>

                        {thumb && (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden shrink-0 border border-[#1e1f22]">
                            <img
                              src={thumb}
                              alt="Thumbnail"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {img && (
                        <div className="rounded-lg overflow-hidden border border-[#1e1f22] max-h-60 mt-2">
                          <img
                            src={img}
                            alt="Accessory Banner"
                            className="w-full h-auto object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                }

                // 2. SEPARATOR
                if (comp.type === 'separator') {
                  const sep = comp as ComponentSeparator;
                  const py = sep.spacing === 'Large' ? 'py-4' : sep.spacing === 'Medium' ? 'py-2.5' : 'py-1';

                  return (
                    <div key={sep.id} className={py}>
                      {sep.divider && <div className="w-full h-[1px] bg-[#3f4147]" />}
                    </div>
                  );
                }

                // 3. MEDIA BANNER
                if (comp.type === 'media') {
                  const media = comp as ComponentMedia;

                  return (
                    <div key={media.id} className="space-y-1">
                      <div className="rounded-lg overflow-hidden border border-[#1e1f22] max-h-64 relative group">
                        <img
                          src={media.url}
                          alt={media.caption || 'Media'}
                          className={`w-full h-auto object-cover ${media.spoiler ? 'blur-lg hover:blur-none transition-all cursor-pointer' : ''}`}
                        />
                        {media.spoiler && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none group-hover:opacity-0 transition-opacity">
                            <span className="px-3 py-1 bg-black/80 rounded-full text-xs font-bold text-white uppercase tracking-wider">
                              SPOILER
                            </span>
                          </div>
                        )}
                      </div>
                      {media.caption && (
                        <p className="text-[11px] text-neutral-400 italic px-1">
                          {media.caption}
                        </p>
                      )}
                    </div>
                  );
                }

                // 4. ACTION ROW (Buttons or Select Menu)
                if (comp.type === 'action_row') {
                  const row = comp as ComponentActionRow;

                  if (row.rowType === 'select_menu' && row.selectMenu) {
                    const menu = row.selectMenu;
                    const isOpen = openSelectId === menu.id;
                    const selectedVal = selectedValues[menu.id];
                    const selectedOpt = menu.options.find((o) => o.value === selectedVal);

                    return (
                      <div key={row.id} className="relative pt-1">
                        <button
                          type="button"
                          disabled={menu.disabled}
                          onClick={() => setOpenSelectId(isOpen ? null : menu.id)}
                          className={`w-full bg-[#1e1f22] border border-[#2b2d31] hover:border-[#3f4147] rounded-md px-3 py-2 text-left text-xs text-[#dbdee1] flex items-center justify-between transition-colors cursor-pointer ${
                            menu.disabled ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {selectedOpt ? (
                              <>
                                <span>{selectedOpt.emoji || '💬'}</span>
                                <span className="font-semibold text-white truncate">
                                  {selectedOpt.label}
                                </span>
                              </>
                            ) : (
                              <span className="text-neutral-400">
                                {menu.placeholder || 'Wybierz opcję z menu...'}
                              </span>
                            )}
                          </div>
                          <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Options */}
                        {isOpen && (
                          <div className="absolute left-0 right-0 top-full mt-1 bg-[#232428] border border-[#1e1f22] rounded-md shadow-2xl z-40 overflow-hidden py-1">
                            {menu.options.length === 0 ? (
                              <div className="p-3 text-center text-xs text-neutral-400">
                                Brak skonfigurowanych opcji
                              </div>
                            ) : (
                              menu.options.map((opt) => (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedValues((prev) => ({ ...prev, [menu.id]: opt.value }));
                                    setOpenSelectId(null);
                                    handleExecuteActions(opt.label, opt.actions);
                                  }}
                                  className="w-full px-3 py-2 text-left hover:bg-[#35373c] flex items-start justify-between gap-2 transition-colors cursor-pointer group"
                                >
                                  <div className="flex items-start gap-2.5">
                                    <span className="text-sm pt-0.5">{opt.emoji || '💬'}</span>
                                    <div>
                                      <div className="text-xs font-bold text-white group-hover:text-indigo-300">
                                        {opt.label}
                                      </div>
                                      {opt.description && (
                                        <div className="text-[11px] text-neutral-400">
                                          {opt.description}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {selectedVal === opt.value && (
                                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                  )}
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }

                  // Standard buttons row
                  return (
                    <div key={row.id} className="flex flex-wrap items-center gap-2 pt-1">
                      {row.buttons.map((btn) => (
                        <button
                          key={btn.id}
                          type="button"
                          disabled={btn.disabled}
                          onClick={() => {
                            if (btn.style === 'LINK' && btn.url) {
                              window.open(btn.url, '_blank');
                            } else {
                              handleExecuteActions(btn.label, btn.actions);
                            }
                          }}
                          className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${getButtonStyleClasses(
                            btn.style,
                            btn.disabled
                          )}`}
                        >
                          {btn.emoji && <span>{btn.emoji}</span>}
                          <span>{btn.label}</span>
                          {btn.style === 'LINK' && <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />}
                        </button>
                      ))}
                    </div>
                  );
                }

                return null;
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <p className="text-[11px] text-neutral-400 font-medium">
          💡 <strong className="text-neutral-300">Interaktywny Symulator:</strong> Kliknij przycisk lub wybierz opcję z menu, aby przetestować przypisane akcje bota na żywo!
        </p>
      </div>
    </div>
  );
};
