import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Copy,
  Trash2,
  Send,
  Save,
  Check,
  AlertCircle,
  Hash,
  RefreshCw,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Minus,
  Sliders
} from 'lucide-react';
import {
  MessageContainer,
  ComponentSection,
  ComponentSeparator,
  ComponentActionRow,
  ComponentMedia,
  ContainerSubComponent,
  MessageBuilderConfig,
  WelcomeButton,
  getDefaultContainer,
} from '../types/guildConfig';
import { ActionRowEditor } from './messageBuilder/ActionRowEditor';
import { MediaEditor } from './messageBuilder/MediaEditor';
import { MarkdownToolbar } from './messageBuilder/MarkdownToolbar';
import { LiveDiscordSimulator } from './messageBuilder/LiveDiscordSimulator';

interface MessageStyleBuilderProps {
  type: 'welcome' | 'goodbye';
  guild: {
    id: string;
    name: string;
    icon?: string | null;
  };
  onBackToDashboard: () => void;
}

export function MessageStyleBuilder({ type, guild, onBackToDashboard }: MessageStyleBuilderProps) {
  const isWelcome = type === 'welcome';
  const titleText = isWelcome ? 'Powitania (/welcome)' : 'Pożegnania (/goodbye)';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Guild config state
  const [enabled, setEnabled] = useState(true);
  const [channelId, setChannelId] = useState('');
  const [plainMessage, setPlainMessage] = useState('');
  const [containers, setContainers] = useState<MessageContainer[]>([getDefaultContainer()]);

  // Channels list
  const [channels, setChannels] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingChannels, setLoadingChannels] = useState(false);

  // Test sending
  const [testSending, setTestSending] = useState(false);
  const [testSuccess, setTestSuccess] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  // Expandable tree node state
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [showAddMenu, setShowAddMenu] = useState<string | null>(null);

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Load guild configuration
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch(`/api/guilds/${guild.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data && data.success && data.config) {
          const cfg: MessageBuilderConfig = isWelcome ? data.config.welcome : data.config.goodbye;
          if (cfg) {
            setEnabled(Boolean(cfg.enabled));
            setChannelId(cfg.channelId || '');
            if (cfg.message !== undefined) setPlainMessage(cfg.message);
            if (Array.isArray(cfg.containers) && cfg.containers.length > 0) {
              setContainers(cfg.containers);
            } else {
              setContainers([getDefaultContainer()]);
            }
          }
        }
      })
      .catch((err) => console.error('Błąd pobierania konfiguracji:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    // Fetch channels
    fetchChannels();

    return () => {
      isMounted = false;
    };
  }, [guild.id, type]);

  const fetchChannels = async () => {
    setLoadingChannels(true);
    try {
      const res = await fetch(`/api/bot/proxy/guilds/${guild.id}/channels`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.channels)) {
          setChannels(data.channels);
          return;
        }
      }
    } catch {
      // fallback
    } finally {
      setLoadingChannels(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);

    try {
      // Prepare embed fallback for Discord API compatibility
      const firstContainer = containers[0];
      const color = firstContainer ? firstContainer.color : '#5865F2';

      let description = '';
      let thumbnailUrl = '';
      let imageUrl = '';
      let buttons: WelcomeButton[] = [];

      if (firstContainer) {
        firstContainer.components.forEach((c) => {
          if (c.type === 'section') {
            const sec = c as ComponentSection;
            sec.texts.forEach((t) => {
              description += (description ? '\n\n' : '') + t.content;
            });
            if (sec.accessory && sec.accessory.type === 'Thumbnail' && sec.accessory.url) {
              thumbnailUrl = sec.accessory.url;
            }
            if (sec.accessory && sec.accessory.type === 'Image' && sec.accessory.url) {
              imageUrl = sec.accessory.url;
            }
          } else if (c.type === 'action_row') {
            const row = c as ComponentActionRow;
            if (row.rowType !== 'select_menu' && row.buttons) {
              buttons.push(...row.buttons);
            }
          } else if (c.type === 'media') {
            const media = c as ComponentMedia;
            if (media.url && !imageUrl) {
              imageUrl = media.url;
            }
          }
        });
      }

      const updatedModuleConfig: MessageBuilderConfig = {
        enabled,
        channelId: channelId || null,
        message: plainMessage,
        useEmbed: true,
        containers,
        embed: {
          color,
          title: isWelcome ? '👋 Witamy na serwerze!' : '👋 Pożegnanie',
          description: description || plainMessage,
          thumbnailUrl,
          imageUrl,
          fields: [],
          footerText: `KitekBot • ${guild.name}`,
          includeTimestamp: true,
        },
        buttons,
      };

      const res = await fetch(`/api/guilds/${guild.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [type]: updatedModuleConfig,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert(data.error || 'Wystąpił błąd podczas zapisywania konfiguracji.');
      }
    } catch (err: any) {
      alert(err.message || 'Błąd połączenia z serwerem API.');
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!channelId) {
      setTestError('Wybierz lub podaj kanał docelowy przed wysłaniem testu!');
      setTimeout(() => setTestError(null), 4000);
      return;
    }

    setTestSending(true);
    setTestSuccess(null);
    setTestError(null);

    try {
      const firstContainer = containers[0];
      const color = firstContainer ? firstContainer.color : '#5865F2';

      let description = '';
      let thumbnailUrl = '';
      let imageUrl = '';
      let buttons: WelcomeButton[] = [];

      if (firstContainer) {
        firstContainer.components.forEach((c) => {
          if (c.type === 'section') {
            const sec = c as ComponentSection;
            sec.texts.forEach((t) => {
              description += (description ? '\n\n' : '') + t.content;
            });
            if (sec.accessory && sec.accessory.type === 'Thumbnail' && sec.accessory.url) {
              thumbnailUrl = sec.accessory.url;
            }
            if (sec.accessory && sec.accessory.type === 'Image' && sec.accessory.url) {
              imageUrl = sec.accessory.url;
            }
          } else if (c.type === 'action_row') {
            const row = c as ComponentActionRow;
            if (row.rowType !== 'select_menu' && row.buttons) {
              buttons.push(...row.buttons);
            }
          } else if (c.type === 'media') {
            const media = c as ComponentMedia;
            if (media.url && !imageUrl) {
              imageUrl = media.url;
            }
          }
        });
      }

      const payload = {
        [type]: {
          enabled: true,
          channelId,
          message: plainMessage,
          useEmbed: true,
          containers,
          embed: {
            color,
            title: isWelcome ? '👋 Witamy na serwerze!' : '👋 Pożegnanie',
            description: description || plainMessage,
            thumbnailUrl,
            imageUrl,
            fields: [],
            footerText: `KitekBot • Test wiadomości`,
            includeTimestamp: true,
          },
          buttons,
        },
      };

      const endpoint = isWelcome
        ? `/api/bot/proxy/guilds/${guild.id}/test-welcome`
        : `/api/bot/proxy/guilds/${guild.id}/test-goodbye`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestSuccess(data.message || 'Pomyślnie wysłano wiadomość testową na Discord!');
        setTimeout(() => setTestSuccess(null), 5000);
      } else {
        setTestError(data.error || 'Nie udało się wysłać wiadomości testowej.');
        setTimeout(() => setTestError(null), 5000);
      }
    } catch (err: any) {
      setTestError(err.message || 'Błąd połączenia z botem.');
      setTimeout(() => setTestError(null), 5000);
    } finally {
      setTestSending(false);
    }
  };

  // Tree manipulation handlers
  const updateContainerColor = (cIndex: number, color: string) => {
    setContainers((prev) => {
      const copy = [...prev];
      copy[cIndex] = { ...copy[cIndex], color };
      return copy;
    });
  };

  const updateContainerSpoiler = (cIndex: number, spoiler: boolean) => {
    setContainers((prev) => {
      const copy = [...prev];
      copy[cIndex] = { ...copy[cIndex], spoiler };
      return copy;
    });
  };

  const duplicateContainer = (cIndex: number) => {
    setContainers((prev) => {
      const item = prev[cIndex];
      const newItem: MessageContainer = {
        ...JSON.parse(JSON.stringify(item)),
        id: `container-${Date.now()}`,
      };
      return [...prev.slice(0, cIndex + 1), newItem, ...prev.slice(cIndex + 1)];
    });
  };

  const removeContainer = (cIndex: number) => {
    setContainers((prev) => {
      const next = prev.filter((_, i) => i !== cIndex);
      if (next.length === 0) {
        return [getDefaultContainer()];
      }
      return next;
    });
  };

  const moveContainer = (cIndex: number, dir: -1 | 1) => {
    setContainers((prev) => {
      const newIdx = cIndex + dir;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[cIndex];
      copy[cIndex] = copy[newIdx];
      copy[newIdx] = temp;
      return copy;
    });
  };

  // Sub-component manipulations
  const addSubComponent = (
    cIndex: number,
    compType: 'section' | 'separator' | 'action_row' | 'media'
  ) => {
    setContainers((prev) => {
      const copy = [...prev];
      const target = { ...copy[cIndex] };
      const currentList = [...target.components];

      const newId = `${compType.slice(0, 3)}-${Date.now()}`;
      if (compType === 'section') {
        const sec: ComponentSection = {
          id: newId,
          type: 'section',
          accessory: { type: 'None', url: '', description: '' },
          texts: [{ id: `txt-${Date.now()}`, content: '' }],
        };
        currentList.push(sec);
      } else if (compType === 'separator') {
        const sep: ComponentSeparator = {
          id: newId,
          type: 'separator',
          spacing: 'Small',
          divider: true,
        };
        currentList.push(sep);
      } else if (compType === 'media') {
        const media: ComponentMedia = {
          id: newId,
          type: 'media',
          url: '',
          caption: '',
          spoiler: false,
        };
        currentList.push(media);
      } else {
        const row: ComponentActionRow = {
          id: newId,
          type: 'action_row',
          rowType: 'buttons',
          buttons: [
            {
              id: `btn-${Date.now()}`,
              label: 'Przycisk',
              style: 'PRIMARY',
              customId: `btn_${Date.now()}`,
              actions: [],
            },
          ],
        };
        currentList.push(row);
      }

      target.components = currentList;
      copy[cIndex] = target;
      return copy;
    });
    setShowAddMenu(null);
  };

  const clearSubComponents = (cIndex: number) => {
    setContainers((prev) => {
      const copy = [...prev];
      copy[cIndex] = { ...copy[cIndex], components: [] };
      return copy;
    });
  };

  const moveSubComponent = (cIndex: number, compIdx: number, dir: -1 | 1) => {
    setContainers((prev) => {
      const copy = [...prev];
      const target = { ...copy[cIndex] };
      const list = [...target.components];
      const newIdx = compIdx + dir;
      if (newIdx < 0 || newIdx >= list.length) return prev;
      const temp = list[compIdx];
      list[compIdx] = list[newIdx];
      list[newIdx] = temp;
      target.components = list;
      copy[cIndex] = target;
      return copy;
    });
  };

  const duplicateSubComponent = (cIndex: number, compIdx: number) => {
    setContainers((prev) => {
      const copy = [...prev];
      const target = { ...copy[cIndex] };
      const list = [...target.components];
      const item = list[compIdx];
      const newItem = {
        ...JSON.parse(JSON.stringify(item)),
        id: `${item.type.slice(0, 3)}-${Date.now()}`,
      };
      list.splice(compIdx + 1, 0, newItem);
      target.components = list;
      copy[cIndex] = target;
      return copy;
    });
  };

  const removeSubComponent = (cIndex: number, compIdx: number) => {
    setContainers((prev) => {
      const copy = [...prev];
      const target = { ...copy[cIndex] };
      target.components = target.components.filter((_, i) => i !== compIdx);
      copy[cIndex] = target;
      return copy;
    });
  };

  // Section details
  const updateSectionAccessory = (cIndex: number, compIdx: number, patch: any) => {
    setContainers((prev) => {
      const copy = [...prev];
      const target = { ...copy[cIndex] };
      const comp = target.components[compIdx] as ComponentSection;
      if (comp && comp.type === 'section') {
        const newSec: ComponentSection = {
          ...comp,
          accessory: { ...(comp.accessory || { type: 'None', url: '' }), ...patch },
        };
        target.components = [
          ...target.components.slice(0, compIdx),
          newSec,
          ...target.components.slice(compIdx + 1),
        ];
        copy[cIndex] = target;
      }
      return copy;
    });
  };

  const updateSectionText = (cIndex: number, compIdx: number, textIdx: number, content: string) => {
    setContainers((prev) => {
      const copy = [...prev];
      const target = { ...copy[cIndex] };
      const comp = target.components[compIdx] as ComponentSection;
      if (comp && comp.type === 'section') {
        const newTexts = [...comp.texts];
        newTexts[textIdx] = { ...newTexts[textIdx], content };
        const newSec: ComponentSection = { ...comp, texts: newTexts };
        target.components = [
          ...target.components.slice(0, compIdx),
          newSec,
          ...target.components.slice(compIdx + 1),
        ];
        copy[cIndex] = target;
      }
      return copy;
    });
  };

  const addSectionText = (cIndex: number, compIdx: number) => {
    setContainers((prev) => {
      const copy = [...prev];
      const target = { ...copy[cIndex] };
      const comp = target.components[compIdx] as ComponentSection;
      if (comp && comp.type === 'section') {
        const newSec: ComponentSection = {
          ...comp,
          texts: [...comp.texts, { id: `txt-${Date.now()}`, content: '' }],
        };
        target.components = [
          ...target.components.slice(0, compIdx),
          newSec,
          ...target.components.slice(compIdx + 1),
        ];
        copy[cIndex] = target;
      }
      return copy;
    });
  };

  // Separator details
  const updateSeparator = (cIndex: number, compIdx: number, patch: Partial<ComponentSeparator>) => {
    setContainers((prev) => {
      const copy = [...prev];
      const target = { ...copy[cIndex] };
      const comp = target.components[compIdx] as ComponentSeparator;
      if (comp && comp.type === 'separator') {
        const newSep: ComponentSeparator = { ...comp, ...patch };
        target.components = [
          ...target.components.slice(0, compIdx),
          newSep,
          ...target.components.slice(compIdx + 1),
        ];
        copy[cIndex] = target;
      }
      return copy;
    });
  };

  // Action row & Media updates
  const updateActionRow = (cIndex: number, compIdx: number, patch: Partial<ComponentActionRow>) => {
    setContainers((prev) => {
      const copy = [...prev];
      const target = { ...copy[cIndex] };
      const comp = target.components[compIdx] as ComponentActionRow;
      if (comp && comp.type === 'action_row') {
        const newRow: ComponentActionRow = { ...comp, ...patch };
        target.components = [
          ...target.components.slice(0, compIdx),
          newRow,
          ...target.components.slice(compIdx + 1),
        ];
        copy[cIndex] = target;
      }
      return copy;
    });
  };

  const updateMedia = (cIndex: number, compIdx: number, patch: Partial<ComponentMedia>) => {
    setContainers((prev) => {
      const copy = [...prev];
      const target = { ...copy[cIndex] };
      const comp = target.components[compIdx] as ComponentMedia;
      if (comp && comp.type === 'media') {
        const newMedia: ComponentMedia = { ...comp, ...patch };
        target.components = [
          ...target.components.slice(0, compIdx),
          newMedia,
          ...target.components.slice(compIdx + 1),
        ];
        copy[cIndex] = target;
      }
      return copy;
    });
  };

  const isUrlValid = (url: string) => {
    if (!url) return true;
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('{');
  };

  return (
    <div className="flex-1 w-full flex flex-col bg-[#32333d] text-[#dbdee1] font-['Montserrat',sans-serif] min-h-screen">
      {/* Top Header Bar */}
      <div className="h-14 border-b border-[#25262d] bg-[#2d2e36] px-6 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="text-xs font-bold text-neutral-400 hover:text-white uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            ← Dashboard
          </button>
          <span className="text-neutral-600">/</span>
          <div className="flex items-center gap-2">
            {guild.icon ? (
              <img src={guild.icon} alt={guild.name} className="w-5 h-5 rounded-full" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-[#5865F2] flex items-center justify-center text-[10px] font-black text-white">
                {guild.name.slice(0, 1)}
              </div>
            )}
            <span className="text-white font-black text-sm truncate max-w-xs">{guild.name}</span>
          </div>
          <span className="text-neutral-600">/</span>
          <span className="text-[#5865F2] font-black text-sm">{titleText}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSendTest}
            disabled={testSending || !channelId}
            className="px-3.5 py-1.5 bg-[#292a36] hover:bg-[#343545] text-white border border-[#3b3c4f] rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5 text-[#5865F2]" />
            <span>{testSending ? 'Wysyłanie...' : 'Wyślij Test'}</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-950/40 transition-all active:scale-95 disabled:opacity-50"
          >
            {saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Zapisano!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Zapisywanie...' : 'Zapisz'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {testSuccess && (
        <div className="bg-emerald-950/90 border-b border-emerald-500/40 px-6 py-2.5 text-xs font-bold text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{testSuccess}</span>
        </div>
      )}
      {testError && (
        <div className="bg-rose-950/90 border-b border-rose-500/40 px-6 py-2.5 text-xs font-bold text-rose-300 flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{testError}</span>
        </div>
      )}

      {/* Settings Ribbon: Channel & State */}
      <div className="bg-[#2d2e36] border-b border-[#25262d] px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-4 h-4 rounded accent-[#5865F2] cursor-pointer"
            />
            <span className="text-xs font-black uppercase tracking-wider text-white">
              Włączony moduł
            </span>
          </label>

          <div className="h-4 w-[1px] bg-[#3b3c47]" />

          {/* Channel Selector */}
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-neutral-400" />
            <span className="text-xs font-bold text-neutral-300 uppercase">Kanał docelowy:</span>
            {channels.length > 0 ? (
              <select
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
                className="bg-[#202128] border border-[#3b3c47] rounded-lg px-3 py-1.5 text-xs font-mono text-white outline-none focus:border-[#5865F2]"
              >
                <option value="">Wybierz kanał...</option>
                {channels.map((c) => (
                  <option key={c.id} value={c.id}>
                    #{c.name} ({c.id})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
                placeholder="Wklej ID kanału (np. 123456...)"
                className="bg-[#202128] border border-[#3b3c47] rounded-lg px-3 py-1.5 text-xs font-mono text-white outline-none focus:border-[#5865F2] w-48"
              />
            )}
            <button
              onClick={fetchChannels}
              title="Odśwież kanały"
              className="p-1.5 hover:bg-[#202128] rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingChannels ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Variable Pills */}
        <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
          <span className="text-neutral-400 font-bold uppercase mr-1">Zmienne:</span>
          {['{user}', '{user.name}', '{server.name}', '{memberCount}'].map((v) => (
            <button
              key={v}
              onClick={() => {
                navigator.clipboard.writeText(v);
              }}
              title="Kliknij, aby skopiować"
              className="px-2.5 py-1 rounded-lg bg-[#202128] hover:bg-[#272831] border border-[#3b3c47] text-indigo-300 font-mono text-[10px] font-bold cursor-pointer transition-colors"
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace: Tree Builder on Left, Interactive Simulator on Right */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-y-auto">
        {/* LEFT COLUMN: THE COMPONENT BUILDER TREE */}
        <div className="lg:col-span-7 p-6 border-r border-[#25262d] space-y-6 overflow-y-auto bg-[#32333d]">
          {/* Plain Message Box */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-neutral-400">
              Wiadomość tekstowa nad embedem (opcjonalnie)
            </label>
            <div className="bg-[#272831] border border-[#3b3c47] focus-within:border-[#5865F2] rounded-xl overflow-hidden">
              <input
                type="text"
                value={plainMessage}
                onChange={(e) => setPlainMessage(e.target.value)}
                placeholder="np. Witamy na serwerze {user}!"
                className="w-full bg-transparent px-3.5 py-2.5 text-xs text-white outline-none"
              />
              <MarkdownToolbar
                charCount={plainMessage.length}
                maxChars={2000}
                onInsert={(prefix, suffix = '') => {
                  setPlainMessage((prev) => prev + prefix + suffix);
                }}
              />
            </div>
          </div>

          {/* Root Component Tree Header */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 cursor-pointer select-none">
                <ChevronDown className="w-4 h-4 text-neutral-400" />
                <span className="text-sm font-bold text-white">Components (Kontenery Embed)</span>
                <span className="text-xs text-neutral-400 font-mono">
                  {containers.length}/5
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#5865F2]/20 border border-[#5865F2]/40 text-indigo-300 text-[10px] font-black uppercase tracking-wider">
                  ADVANCED
                </span>
              </div>
            </div>

            {/* Containers List */}
            {containers.map((container, cIdx) => {
              const isContainerOpen = expandedNodes[container.id] !== false;

              return (
                <div
                  key={container.id}
                  className="bg-[#202128] border border-[#2e2f3d] rounded-2xl overflow-hidden shadow-lg space-y-0"
                >
                  {/* Container Header Bar */}
                  <div className="bg-[#262732] px-4 py-3 border-b border-[#2e2f3d] flex items-center justify-between select-none">
                    <div
                      onClick={() => toggleNode(container.id)}
                      className="flex items-center gap-2 cursor-pointer flex-1"
                    >
                      {isContainerOpen ? (
                        <ChevronDown className="w-4 h-4 text-neutral-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-neutral-400" />
                      )}
                      <div
                        className="w-3 h-3 rounded-full border border-white/20"
                        style={{ backgroundColor: container.color || '#5865F2' }}
                      />
                      <span className="text-xs font-black text-white">Kontener #{cIdx + 1}</span>
                      <span className="text-xs text-neutral-400">
                        ({container.components.length} komponentów)
                      </span>
                    </div>

                    {/* Actions: Up, Down, Duplicate, Delete */}
                    <div className="flex items-center gap-1 text-neutral-400">
                      <button
                        onClick={() => moveContainer(cIdx, -1)}
                        disabled={cIdx === 0}
                        className="p-1 hover:text-white disabled:opacity-20 cursor-pointer"
                        title="Przesuń w górę"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveContainer(cIdx, 1)}
                        disabled={cIdx === containers.length - 1}
                        className="p-1 hover:text-white disabled:opacity-20 cursor-pointer"
                        title="Przesuń w dół"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => duplicateContainer(cIdx)}
                        className="p-1 hover:text-white cursor-pointer"
                        title="Duplikuj kontener"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeContainer(cIdx)}
                        className="p-1 hover:text-rose-400 cursor-pointer"
                        title="Usuń kontener"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Container Content */}
                  {isContainerOpen && (
                    <div className="p-4 space-y-4">
                      {/* COLOR ROW */}
                      <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#2d2e3c]">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                            Pasek Koloru (Embed Color)
                          </label>
                          <div className="flex items-center gap-2">
                            <div className="relative flex items-center">
                              <span className="absolute left-2.5 text-neutral-500 font-mono text-xs">#</span>
                              <input
                                type="text"
                                value={container.color.replace('#', '')}
                                onChange={(e) => updateContainerColor(cIdx, `#${e.target.value.replace('#', '')}`)}
                                placeholder="rrggbb"
                                className="w-28 bg-[#181920] border border-[#383948] rounded-lg pl-6 pr-2 py-1.5 text-xs font-mono text-white outline-none focus:border-[#5865F2]"
                              />
                            </div>
                            <input
                              type="color"
                              value={container.color.startsWith('#') ? container.color : '#5865F2'}
                              onChange={(e) => updateContainerColor(cIdx, e.target.value)}
                              className="w-8 h-8 rounded-lg border border-[#383948] bg-transparent cursor-pointer"
                            />
                          </div>
                        </div>

                        <div className="space-y-1 text-right">
                          <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block">
                            Ukryj jako Spoiler
                          </label>
                          <input
                            type="checkbox"
                            checked={Boolean(container.spoiler)}
                            onChange={(e) => updateContainerSpoiler(cIdx, e.target.checked)}
                            className="w-4 h-4 rounded accent-[#5865F2] cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Nested Components Header */}
                      <div className="space-y-3 pt-1">
                        <div className="flex items-center justify-between text-xs font-bold text-neutral-300">
                          <span className="uppercase tracking-wider text-[11px]">
                            Komponenty wewnątrz ({container.components.length}/10)
                          </span>
                        </div>

                        {/* Empty container prompt */}
                        {container.components.length === 0 && (
                          <div className="p-5 border border-dashed border-[#3b3c47] rounded-xl text-center space-y-1.5 bg-[#202128]">
                            <Layers className="w-5 h-5 text-neutral-400 mx-auto" />
                            <p className="text-xs font-bold text-neutral-200">Pusty kontener embed</p>
                            <p className="text-[11px] text-neutral-400">
                              Użyj przycisku poniżej, aby dodać sekcję tekstu, przyciski akcji, separator lub grafikę.
                            </p>
                          </div>
                        )}

                        {/* Components Tree items inside this Container */}
                        <div className="space-y-3">
                          {container.components.map((comp, compIdx) => {
                            const isCompOpen = expandedNodes[comp.id] !== false;

                            // 1. SECTION
                            if (comp.type === 'section') {
                              const sec = comp as ComponentSection;
                              const accUrl = sec.accessory?.url || '';
                              const isAccValid = isUrlValid(accUrl);

                              return (
                                <div
                                  key={sec.id}
                                  className="bg-[#181920] border border-[#2d2e3c] rounded-xl overflow-hidden"
                                >
                                  {/* Section Header */}
                                  <div className="p-3 bg-[#23242e] flex items-center justify-between select-none border-b border-[#2d2e3c]">
                                    <div
                                      onClick={() => toggleNode(sec.id)}
                                      className="flex items-center gap-2 cursor-pointer flex-1"
                                    >
                                      {isCompOpen ? (
                                        <ChevronDown className="w-4 h-4 text-neutral-400" />
                                      ) : (
                                        <ChevronRight className="w-4 h-4 text-neutral-400" />
                                      )}
                                      <span className="text-xs font-black text-white">📄 Section (Sekcja)</span>
                                      <span className="text-xs text-neutral-400">
                                        - {sec.texts.length} akapitów tekstu
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-1 text-neutral-400">
                                      <button
                                        onClick={() => moveSubComponent(cIdx, compIdx, -1)}
                                        disabled={compIdx === 0}
                                        className="p-1 hover:text-white disabled:opacity-20 cursor-pointer"
                                      >
                                        <ChevronUp className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => moveSubComponent(cIdx, compIdx, 1)}
                                        disabled={compIdx === container.components.length - 1}
                                        className="p-1 hover:text-white disabled:opacity-20 cursor-pointer"
                                      >
                                        <ChevronDown className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => duplicateSubComponent(cIdx, compIdx)}
                                        className="p-1 hover:text-white cursor-pointer"
                                      >
                                        <Copy className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => removeSubComponent(cIdx, compIdx)}
                                        className="p-1 hover:text-rose-400 cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Section Body */}
                                  {isCompOpen && (
                                    <div className="p-4 space-y-4">
                                      {/* Accessory Box */}
                                      <div className="p-3.5 bg-[#202129] rounded-xl border border-[#323342] space-y-3">
                                        <div className="flex items-center justify-between">
                                          <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-300">
                                            Załącznik wizualny (Accessory)
                                          </label>
                                          <select
                                            value={sec.accessory?.type || 'None'}
                                            onChange={(e) =>
                                              updateSectionAccessory(cIdx, compIdx, {
                                                type: e.target.value as any,
                                              })
                                            }
                                            className="bg-[#181920] border border-[#383948] rounded-lg px-2.5 py-1 text-xs text-white font-semibold outline-none"
                                          >
                                            <option value="None">Brak (None)</option>
                                            <option value="Thumbnail">Miniatura po prawej (Thumbnail)</option>
                                            <option value="Image">Duży baner na dole (Image)</option>
                                          </select>
                                        </div>

                                        {sec.accessory && sec.accessory.type !== 'None' && (
                                          <div className="space-y-2 pt-1">
                                            <input
                                              type="url"
                                              value={sec.accessory.url || ''}
                                              onChange={(e) =>
                                                updateSectionAccessory(cIdx, compIdx, { url: e.target.value })
                                              }
                                              placeholder="Wklej URL obrazu (np. https://...)"
                                              className="w-full bg-[#181920] border border-[#383948] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#5865F2]"
                                            />
                                          </div>
                                        )}
                                      </div>

                                      {/* Texts List */}
                                      <div className="space-y-3">
                                        <div className="flex items-center justify-between text-xs font-bold text-neutral-300">
                                          <span>Akapity Tekstu ({sec.texts.length}/3)</span>
                                          {sec.texts.length < 3 && (
                                            <button
                                              type="button"
                                              onClick={() => addSectionText(cIdx, compIdx)}
                                              className="text-[11px] text-[#5865F2] hover:underline font-bold cursor-pointer"
                                            >
                                              + Dodaj akapit
                                            </button>
                                          )}
                                        </div>

                                        {sec.texts.map((t, tIdx) => (
                                          <div
                                            key={t.id}
                                            className="bg-[#202129] border border-[#323342] rounded-xl overflow-hidden focus-within:border-[#5865F2]"
                                          >
                                            <textarea
                                              value={t.content}
                                              onChange={(e) =>
                                                updateSectionText(cIdx, compIdx, tIdx, e.target.value)
                                              }
                                              rows={3}
                                              maxLength={4000}
                                              placeholder="Treść akapitu tekstu..."
                                              className="w-full bg-transparent p-3 text-xs text-white outline-none resize-y leading-relaxed font-sans"
                                            />
                                            <MarkdownToolbar
                                              charCount={t.content.length}
                                              maxChars={4000}
                                              onInsert={(prefix, suffix = '') => {
                                                updateSectionText(
                                                  cIdx,
                                                  compIdx,
                                                  tIdx,
                                                  t.content + prefix + suffix
                                                );
                                              }}
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            }

                            // 2. SEPARATOR
                            if (comp.type === 'separator') {
                              const sep = comp as ComponentSeparator;

                              return (
                                <div
                                  key={sep.id}
                                  className="bg-[#181920] border border-[#2d2e3c] rounded-xl p-3 flex items-center justify-between gap-4"
                                >
                                  <div className="flex items-center gap-3">
                                    <Minus className="w-4 h-4 text-neutral-400" />
                                    <span className="text-xs font-bold text-white">➖ Separator</span>
                                    <div className="flex items-center gap-1 bg-[#23242e] p-1 rounded-lg border border-[#383948]">
                                      {(['Small', 'Medium', 'Large'] as const).map((s) => (
                                        <button
                                          key={s}
                                          type="button"
                                          onClick={() => updateSeparator(cIdx, compIdx, { spacing: s })}
                                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                                            sep.spacing === s
                                              ? 'bg-[#5865F2] text-white'
                                              : 'text-neutral-400 hover:text-white'
                                          }`}
                                        >
                                          {s}
                                        </button>
                                      ))}
                                    </div>
                                    <label className="flex items-center gap-1.5 text-xs text-neutral-300 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={Boolean(sep.divider)}
                                        onChange={(e) =>
                                          updateSeparator(cIdx, compIdx, { divider: e.target.checked })
                                        }
                                        className="accent-[#5865F2] rounded"
                                      />
                                      <span>Kreska (Divider)</span>
                                    </label>
                                  </div>

                                  <button
                                    onClick={() => removeSubComponent(cIdx, compIdx)}
                                    className="p-1 hover:text-rose-400 text-neutral-400 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              );
                            }

                            // 3. ACTION ROW
                            if (comp.type === 'action_row') {
                              const row = comp as ComponentActionRow;

                              return (
                                <div
                                  key={row.id}
                                  className="bg-[#181920] border border-[#2d2e3c] rounded-xl overflow-hidden"
                                >
                                  {/* Header */}
                                  <div className="p-3 bg-[#23242e] flex items-center justify-between select-none border-b border-[#2d2e3c]">
                                    <div
                                      onClick={() => toggleNode(row.id)}
                                      className="flex items-center gap-2 cursor-pointer flex-1"
                                    >
                                      {isCompOpen ? (
                                        <ChevronDown className="w-4 h-4 text-neutral-400" />
                                      ) : (
                                        <ChevronRight className="w-4 h-4 text-neutral-400" />
                                      )}
                                      <span className="text-xs font-black text-white">
                                        🔘 Action Row ({row.rowType === 'select_menu' ? 'Menu Rozwijane' : 'Przyciski'})
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-1 text-neutral-400">
                                      <button
                                        onClick={() => moveSubComponent(cIdx, compIdx, -1)}
                                        disabled={compIdx === 0}
                                        className="p-1 hover:text-white disabled:opacity-20 cursor-pointer"
                                      >
                                        <ChevronUp className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => moveSubComponent(cIdx, compIdx, 1)}
                                        disabled={compIdx === container.components.length - 1}
                                        className="p-1 hover:text-white disabled:opacity-20 cursor-pointer"
                                      >
                                        <ChevronDown className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => duplicateSubComponent(cIdx, compIdx)}
                                        className="p-1 hover:text-white cursor-pointer"
                                      >
                                        <Copy className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => removeSubComponent(cIdx, compIdx)}
                                        className="p-1 hover:text-rose-400 cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Body */}
                                  {isCompOpen && (
                                    <div className="p-4">
                                      <ActionRowEditor
                                        row={row}
                                        onChange={(patch) => updateActionRow(cIdx, compIdx, patch)}
                                      />
                                    </div>
                                  )}
                                </div>
                              );
                            }

                            // 4. MEDIA BANNER
                            if (comp.type === 'media') {
                              const media = comp as ComponentMedia;

                              return (
                                <div
                                  key={media.id}
                                  className="bg-[#181920] border border-[#2d2e3c] rounded-xl overflow-hidden"
                                >
                                  <div className="p-3 bg-[#23242e] flex items-center justify-between select-none border-b border-[#2d2e3c]">
                                    <div
                                      onClick={() => toggleNode(media.id)}
                                      className="flex items-center gap-2 cursor-pointer flex-1"
                                    >
                                      {isCompOpen ? (
                                        <ChevronDown className="w-4 h-4 text-neutral-400" />
                                      ) : (
                                        <ChevronRight className="w-4 h-4 text-neutral-400" />
                                      )}
                                      <span className="text-xs font-black text-white">
                                        🖼️ Media (Baner Graficzny)
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-1 text-neutral-400">
                                      <button
                                        onClick={() => moveSubComponent(cIdx, compIdx, -1)}
                                        disabled={compIdx === 0}
                                        className="p-1 hover:text-white disabled:opacity-20 cursor-pointer"
                                      >
                                        <ChevronUp className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => moveSubComponent(cIdx, compIdx, 1)}
                                        disabled={compIdx === container.components.length - 1}
                                        className="p-1 hover:text-white disabled:opacity-20 cursor-pointer"
                                      >
                                        <ChevronDown className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => duplicateSubComponent(cIdx, compIdx)}
                                        className="p-1 hover:text-white cursor-pointer"
                                      >
                                        <Copy className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => removeSubComponent(cIdx, compIdx)}
                                        className="p-1 hover:text-rose-400 cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  {isCompOpen && (
                                    <div className="p-4">
                                      <MediaEditor
                                        media={media}
                                        onChange={(patch) => updateMedia(cIdx, compIdx, patch)}
                                      />
                                    </div>
                                  )}
                                </div>
                              );
                            }

                            return null;
                          })}
                        </div>

                        {/* Buttons under Container: Add Component ^, Clear Components */}
                        <div className="flex items-center gap-2 pt-2 relative">
                          <div className="relative">
                            <button
                              onClick={() =>
                                setShowAddMenu(showAddMenu === container.id ? null : container.id)
                              }
                              className="px-3.5 py-2 bg-[#5865F2] hover:bg-[#4752C4] active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-indigo-950/40"
                            >
                              <span>+ Dodaj Komponent</span>
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>

                            {showAddMenu === container.id && (
                              <div className="absolute left-0 bottom-full mb-1.5 bg-[#202128] border border-[#343547] rounded-xl shadow-2xl p-1.5 w-52 z-30 space-y-1 animate-in fade-in zoom-in-95">
                                <button
                                  onClick={() => addSubComponent(cIdx, 'section')}
                                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#2c2d3b] text-xs font-bold text-white flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <span>📄 Section (Tekst + Grafika)</span>
                                </button>
                                <button
                                  onClick={() => addSubComponent(cIdx, 'separator')}
                                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#2c2d3b] text-xs font-bold text-white flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <span>➖ Separator (Odstęp / Linia)</span>
                                </button>
                                <button
                                  onClick={() => addSubComponent(cIdx, 'action_row')}
                                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#2c2d3b] text-xs font-bold text-white flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <span>🔘 Action Row (Przyciski / Menu)</span>
                                </button>
                                <button
                                  onClick={() => addSubComponent(cIdx, 'media')}
                                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#2c2d3b] text-xs font-bold text-white flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <span>🖼️ Media (Baner Obrazkowy)</span>
                                </button>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => clearSubComponents(cIdx)}
                            className="px-3 py-2 bg-transparent hover:bg-rose-500/10 border border-rose-500/40 text-rose-400 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                          >
                            Wyczyść komponenty
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Bottom Global Controls: Add Component (adds container), Clear Components */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  const newC = getDefaultContainer();
                  newC.id = `container-${Date.now()}`;
                  setContainers((prev) => [...prev, newC]);
                }}
                disabled={containers.length >= 5}
                className="px-4 py-2 bg-[#262732] hover:bg-[#303140] border border-[#3b3c4f] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-40"
              >
                <Layers className="w-4 h-4 text-[#5865F2]" />
                <span>+ Dodaj Nowy Kontener Embed ({containers.length}/5)</span>
              </button>
              <button
                onClick={() => setContainers([getDefaultContainer()])}
                className="px-3.5 py-2 bg-transparent hover:bg-rose-500/10 border border-rose-500/40 text-rose-400 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Wyczyść do pustego embedu
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE DISCORD LIVE SIMULATOR */}
        <div className="lg:col-span-5 p-6 bg-[#272831] overflow-y-auto space-y-4 border-l border-[#25262d]">
          <div className="flex items-center justify-between pb-3 border-b border-[#2d2e3c]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#5865F2]" />
              <span className="text-xs font-black uppercase text-white tracking-wider">
                Symulator Na Żywo Discord
              </span>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
              ● Interaktywny
            </span>
          </div>

          <LiveDiscordSimulator
            containers={containers}
            plainMessage={plainMessage}
            guildName={guild.name}
          />
        </div>
      </div>
    </div>
  );
}
