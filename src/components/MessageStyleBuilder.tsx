import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Copy,
  Trash2,
  Plus,
  Send,
  Save,
  Check,
  AlertCircle,
  Hash,
  RefreshCw,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  MessageContainer,
  ComponentSection,
  ComponentSeparator,
  ComponentActionRow,
  ContainerSubComponent,
  MessageBuilderConfig,
  WelcomeButton,
  getDefaultContainer,
} from '../types/guildConfig';

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
  const [testSending, setTestSending] = useState(false);
  const [testSuccess, setTestSuccess] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const [channels, setChannels] = useState<{ id: string; name: string }[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(false);

  // Builder State
  const [enabled, setEnabled] = useState(true);
  const [channelId, setChannelId] = useState<string>('');
  const [plainMessage, setPlainMessage] = useState(
    isWelcome
      ? 'Hej {user}, witamy w naszych progach! 🌟 Rozgość się i zapoznaj z regulaminem.'
      : '{user} opuścił nasz serwer. Żegnaj i powodzenia! 👋'
  );
  const [containers, setContainers] = useState<MessageContainer[]>([getDefaultContainer()]);

  // Collapsed state map
  const [expandedNodes, setExpandedNodes] = useState<{ [id: string]: boolean }>({
    'root-components': true,
    'container-1': true,
    'sec-1': true,
    'sec-1-accessory': true,
    'sec-1-texts': true,
    'sep-1': true,
    'sec-2': true,
    'sep-2': true,
    'row-1': true,
  });

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
            if (cfg.message) setPlainMessage(cfg.message);
            if (Array.isArray(cfg.containers) && cfg.containers.length > 0) {
              setContainers(cfg.containers);
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
          } else if (c.type === 'separator') {
            description += '\n\n───────────────\n';
          } else if (c.type === 'action_row') {
            const row = c as ComponentActionRow;
            buttons = [...buttons, ...row.buttons];
          }
        });
      }

      const payloadConfig: MessageBuilderConfig = {
        enabled,
        channelId: channelId || null,
        message: plainMessage,
        useEmbed: containers.length > 0,
        containers,
        embed: {
          color,
          title: isWelcome ? '👋 Witamy na serwerze!' : '👋 Pożegnanie',
          description: description || plainMessage,
          thumbnailUrl,
          imageUrl,
          fields: [],
          footerText: `KitekBot ${type.toUpperCase()} • ${guild.name}`,
          includeTimestamp: true,
        },
        buttons,
      };

      const res = await fetch(`/api/guilds/${guild.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [type]: payloadConfig,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Błąd zapisu:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!channelId) {
      setTestError('Wybierz najpierw kanał docelowy z listy powyżej!');
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
          } else if (c.type === 'separator') {
            description += '\n\n───────────────\n';
          } else if (c.type === 'action_row') {
            const row = c as ComponentActionRow;
            buttons = [...buttons, ...row.buttons];
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
    setContainers((prev) => prev.filter((_, i) => i !== cIndex));
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
  const addSubComponent = (cIndex: number, compType: 'section' | 'separator' | 'action_row') => {
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
          texts: [{ id: `txt-${Date.now()}`, content: 'Nowa treść sekcji...' }],
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
      } else {
        const row: ComponentActionRow = {
          id: newId,
          type: 'action_row',
          buttons: [
            {
              id: `btn-${Date.now()}`,
              label: 'Przycisk',
              style: 'PRIMARY',
              customId: `btn_${Date.now()}`,
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
          texts: [...comp.texts, { id: `txt-${Date.now()}`, content: 'Kolejny akapit tekstu...' }],
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

  const clearSectionTexts = (cIndex: number, compIdx: number) => {
    setContainers((prev) => {
      const copy = [...prev];
      const target = { ...copy[cIndex] };
      const comp = target.components[compIdx] as ComponentSection;
      if (comp && comp.type === 'section') {
        const newSec: ComponentSection = { ...comp, texts: [] };
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

  // Action Row buttons
  const addRowButton = (cIndex: number, compIdx: number) => {
    setContainers((prev) => {
      const copy = [...prev];
      const target = { ...copy[cIndex] };
      const comp = target.components[compIdx] as ComponentActionRow;
      if (comp && comp.type === 'action_row') {
        if (comp.buttons.length >= 5) return prev;
        const newBtn: WelcomeButton = {
          id: `btn-${Date.now()}`,
          label: `Przycisk ${comp.buttons.length + 1}`,
          style: 'PRIMARY',
          customId: `btn_${Date.now()}`,
        };
        const newRow: ComponentActionRow = {
          ...comp,
          buttons: [...comp.buttons, newBtn],
        };
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

  const updateRowButton = (cIndex: number, compIdx: number, btnIdx: number, patch: Partial<WelcomeButton>) => {
    setContainers((prev) => {
      const copy = [...prev];
      const target = { ...copy[cIndex] };
      const comp = target.components[compIdx] as ComponentActionRow;
      if (comp && comp.type === 'action_row') {
        const newButtons = [...comp.buttons];
        newButtons[btnIdx] = { ...newButtons[btnIdx], ...patch };
        const newRow: ComponentActionRow = { ...comp, buttons: newButtons };
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

  const removeRowButton = (cIndex: number, compIdx: number, btnIdx: number) => {
    setContainers((prev) => {
      const copy = [...prev];
      const target = { ...copy[cIndex] };
      const comp = target.components[compIdx] as ComponentActionRow;
      if (comp && comp.type === 'action_row') {
        const newButtons = comp.buttons.filter((_, i) => i !== btnIdx);
        const newRow: ComponentActionRow = { ...comp, buttons: newButtons };
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

  const isUrlValid = (url: string) => {
    if (!url) return true;
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('{');
  };

  return (
    <div className="flex-1 w-full flex flex-col bg-[#1e1f22] text-[#dbdee1] min-h-screen">
      {/* Top Header Bar */}
      <div className="h-14 border-b border-[#2b2d31] bg-[#232428] px-6 flex items-center justify-between shrink-0">
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
            className="px-3.5 py-1.5 bg-[#2b2d31] hover:bg-[#35373c] text-white border border-[#3b3e45] rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5 text-[#5865F2]" />
            <span>{testSending ? 'Wysyłanie...' : 'Wyślij Test'}</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow transition-all active:scale-95 disabled:opacity-50"
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
        <div className="bg-emerald-950/80 border-b border-emerald-500/40 px-6 py-2 text-xs font-bold text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{testSuccess}</span>
        </div>
      )}
      {testError && (
        <div className="bg-rose-950/80 border-b border-rose-500/40 px-6 py-2 text-xs font-bold text-rose-300 flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{testError}</span>
        </div>
      )}

      {/* Settings Ribbon: Channel & State */}
      <div className="bg-[#2b2d31] border-b border-[#1e1f22] px-6 py-3 flex flex-wrap items-center justify-between gap-4">
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

          <div className="h-4 w-[1px] bg-neutral-700" />

          {/* Channel Selector */}
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-neutral-400" />
            <span className="text-xs font-bold text-neutral-300 uppercase">Kanał docelowy:</span>
            {channels.length > 0 ? (
              <select
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
                className="bg-[#1e1f22] border border-[#3b3e45] rounded-md px-3 py-1 text-xs font-mono text-white outline-none focus:border-[#5865F2]"
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
                className="bg-[#1e1f22] border border-[#3b3e45] rounded-md px-3 py-1 text-xs font-mono text-white outline-none focus:border-[#5865F2] w-48"
              />
            )}
            <button
              onClick={fetchChannels}
              title="Odśwież kanały"
              className="p-1 hover:bg-[#35373c] rounded text-neutral-400 hover:text-white"
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
              className="px-2 py-0.5 rounded bg-[#1e1f22] hover:bg-[#35373c] border border-[#383a40] text-indigo-300 font-mono text-[10px] cursor-pointer"
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace (Split View: Tree Builder on Left, Live Discord Preview on Right) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-y-auto">
        {/* LEFT COLUMN: THE AUTHENTIC COMPONENT BUILDER TREE (As shown in user screenshots) */}
        <div className="lg:col-span-7 p-6 border-r border-[#2b2d31] space-y-6 overflow-y-auto">
          {/* Plain Message Box */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-neutral-400">
              Wiadomość tekstowa nad embedem (opcjonalnie)
            </label>
            <input
              type="text"
              value={plainMessage}
              onChange={(e) => setPlainMessage(e.target.value)}
              placeholder="np. Witamy na serwerze {user}!"
              className="w-full bg-[#2b2d31] border border-[#3b3e45] focus:border-[#5865F2] rounded-lg px-3 py-2 text-xs text-white outline-none"
            />
          </div>

          {/* Root Component Tree Header */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 cursor-pointer select-none">
                <ChevronDown className="w-4 h-4 text-neutral-400" />
                <span className="text-sm font-bold text-white">Components</span>
                <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-black flex items-center justify-center">
                  !
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  {containers.length}/5
                </span>
                <span className="px-1.5 py-0.2 rounded bg-[#5865F2] text-white text-[9px] font-black uppercase tracking-wider">
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
                  className="bg-[#2b2d31] border border-[#383a40] rounded-xl overflow-hidden shadow-md space-y-0"
                >
                  {/* Container Header Bar */}
                  <div className="bg-[#232428] px-4 py-3 border-b border-[#313338] flex items-center justify-between select-none">
                    <div
                      onClick={() => toggleNode(container.id)}
                      className="flex items-center gap-2 cursor-pointer flex-1"
                    >
                      {isContainerOpen ? (
                        <ChevronDown className="w-4 h-4 text-neutral-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-neutral-400" />
                      )}
                      <span className="text-xs font-bold text-white">Container</span>
                      <span className="w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                        !
                      </span>
                      <span className="text-xs text-neutral-400">- Text</span>
                    </div>

                    {/* Actions: Up, Down, Duplicate, Delete */}
                    <div className="flex items-center gap-1.5 text-neutral-400">
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
                      <div className="flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                            COLOR
                          </label>
                          <div className="flex items-center gap-2">
                            <div className="relative flex items-center">
                              <span className="absolute left-2.5 text-neutral-500 font-mono text-xs">#</span>
                              <input
                                type="text"
                                value={container.color.replace('#', '')}
                                onChange={(e) => updateContainerColor(cIdx, `#${e.target.value.replace('#', '')}`)}
                                placeholder="rrggbb"
                                className="w-28 bg-[#1e1f22] border border-[#383a40] rounded-md pl-6 pr-2 py-1.5 text-xs font-mono text-white outline-none focus:border-[#5865F2]"
                              />
                            </div>
                            <input
                              type="color"
                              value={container.color.startsWith('#') ? container.color : '#5865F2'}
                              onChange={(e) => updateContainerColor(cIdx, e.target.value)}
                              className="w-8 h-8 rounded border border-[#383a40] bg-transparent cursor-pointer"
                            />
                          </div>
                        </div>

                        <div className="space-y-1 text-right">
                          <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block">
                            SPOILER
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
                      <div className="space-y-2 pt-2 border-t border-[#383a40]">
                        <div className="flex items-center gap-2 select-none">
                          <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                          <span className="text-xs font-bold text-white">Components</span>
                          <span className="w-3 h-3 rounded-full bg-rose-500 text-white text-[8px] font-black flex items-center justify-center">
                            !
                          </span>
                          <span className="text-xs text-neutral-400 font-mono">
                            {container.components.length}/10
                          </span>
                        </div>

                        {/* Components Tree items inside this Container */}
                        <div className="space-y-2 pl-2 border-l border-[#383a40]">
                          {container.components.map((comp, compIdx) => {
                            const isCompOpen = expandedNodes[comp.id] !== false;

                            if (comp.type === 'section') {
                              const sec = comp as ComponentSection;
                              const accUrl = sec.accessory?.url || '';
                              const isAccValid = isUrlValid(accUrl);

                              return (
                                <div
                                  key={sec.id}
                                  className="bg-[#232428] border border-[#313338] rounded-lg overflow-hidden"
                                >
                                  {/* Section Header */}
                                  <div className="px-3 py-2 flex items-center justify-between select-none">
                                    <div
                                      onClick={() => toggleNode(sec.id)}
                                      className="flex items-center gap-2 cursor-pointer flex-1"
                                    >
                                      {isCompOpen ? (
                                        <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                                      ) : (
                                        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                                      )}
                                      <span className="text-xs font-bold text-white">Section</span>
                                      <span className="w-3 h-3 rounded-full bg-rose-500 text-white text-[8px] font-black flex items-center justify-center">
                                        !
                                      </span>
                                      <span className="text-xs text-neutral-400">- Text</span>
                                    </div>

                                    <div className="flex items-center gap-1 text-neutral-400">
                                      <button
                                        onClick={() => moveSubComponent(cIdx, compIdx, -1)}
                                        disabled={compIdx === 0}
                                        className="p-1 hover:text-white disabled:opacity-20 cursor-pointer"
                                      >
                                        <ChevronUp className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => moveSubComponent(cIdx, compIdx, 1)}
                                        disabled={compIdx === container.components.length - 1}
                                        className="p-1 hover:text-white disabled:opacity-20 cursor-pointer"
                                      >
                                        <ChevronDown className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => duplicateSubComponent(cIdx, compIdx)}
                                        className="p-1 hover:text-white cursor-pointer"
                                      >
                                        <Copy className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => removeSubComponent(cIdx, compIdx)}
                                        className="p-1 hover:text-rose-400 cursor-pointer"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Section Body (Matching Image 2) */}
                                  {isCompOpen && (
                                    <div className="p-3 border-t border-[#2b2d31] space-y-3 bg-[#1e1f22]">
                                      {/* ACCESSORY TYPE */}
                                      <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                                          ACCESSORY TYPE
                                        </label>
                                        <select
                                          value={sec.accessory?.type || 'None'}
                                          onChange={(e) =>
                                            updateSectionAccessory(cIdx, compIdx, {
                                              type: e.target.value as any,
                                            })
                                          }
                                          className="w-full bg-[#2b2d31] border border-[#383a40] rounded-md px-3 py-1.5 text-xs text-white outline-none focus:border-[#5865F2]"
                                        >
                                          <option value="None">None</option>
                                          <option value="Thumbnail">Thumbnail (Miniatura)</option>
                                          <option value="Image">Image (Duży baner)</option>
                                        </select>
                                      </div>

                                      {/* Accessory Box */}
                                      {sec.accessory && sec.accessory.type !== 'None' && (
                                        <div className="p-3 rounded-lg bg-[#232428] border border-[#313338] space-y-2">
                                          <div className="flex items-center gap-1 text-xs font-bold text-white">
                                            <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                                            <span>Accessory</span>
                                            <span className="w-3 h-3 rounded-full bg-rose-500 text-white text-[8px] font-black flex items-center justify-center">
                                              !
                                            </span>
                                          </div>

                                          <div className="flex items-center justify-between gap-4">
                                            <div className="space-y-1 flex-1">
                                              <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                                                FILE URL
                                              </label>
                                              <input
                                                type="text"
                                                value={accUrl}
                                                onChange={(e) =>
                                                  updateSectionAccessory(cIdx, compIdx, {
                                                    url: e.target.value,
                                                  })
                                                }
                                                placeholder="https://..."
                                                className="w-full bg-[#1e1f22] border border-[#383a40] focus:border-[#5865F2] rounded px-2.5 py-1 text-xs font-mono text-white outline-none"
                                              />
                                              {!isAccValid && (
                                                <span className="text-[10px] text-rose-400 font-bold flex items-center gap-1 mt-0.5">
                                                  ❗ Invalid URL
                                                </span>
                                              )}
                                            </div>

                                            <div className="space-y-1 text-right">
                                              <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block">
                                                SPOILER
                                              </label>
                                              <input
                                                type="checkbox"
                                                checked={Boolean(sec.accessory.spoiler)}
                                                onChange={(e) =>
                                                  updateSectionAccessory(cIdx, compIdx, {
                                                    spoiler: e.target.checked,
                                                  })
                                                }
                                                className="w-4 h-4 rounded accent-[#5865F2] cursor-pointer"
                                              />
                                            </div>
                                          </div>

                                          <div className="space-y-1">
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-neutral-400">
                                              <span>DESCRIPTION</span>
                                              <span className="font-mono">
                                                {(sec.accessory.description || '').length} / 80
                                              </span>
                                            </div>
                                            <input
                                              type="text"
                                              maxLength={80}
                                              value={sec.accessory.description || ''}
                                              onChange={(e) =>
                                                updateSectionAccessory(cIdx, compIdx, {
                                                  description: e.target.value,
                                                })
                                              }
                                              placeholder="Opis / alt text"
                                              className="w-full bg-[#1e1f22] border border-[#383a40] focus:border-[#5865F2] rounded px-2.5 py-1 text-xs text-white outline-none"
                                            />
                                          </div>
                                        </div>
                                      )}

                                      {/* Nested Text Displays inside Section (Image 2) */}
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-xs font-bold text-neutral-300">
                                          <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                                          <span>Components</span>
                                          <span className="font-mono text-neutral-400">
                                            {sec.texts.length} / 3
                                          </span>
                                        </div>

                                        {sec.texts.map((txt, tIdx) => (
                                          <div
                                            key={txt.id}
                                            className="p-3 bg-[#232428] rounded-lg border border-[#313338] space-y-2"
                                          >
                                            <div className="flex items-center justify-between text-xs text-neutral-300">
                                              <div className="flex items-center gap-1.5">
                                                <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                                                <span className="font-bold text-white">
                                                  Text Display
                                                </span>
                                                <span className="text-[11px] text-neutral-400 truncate max-w-[200px]">
                                                  - {txt.content.slice(0, 24)}...
                                                </span>
                                              </div>
                                            </div>

                                            <div className="space-y-1">
                                              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-neutral-400">
                                                <span>CONTENT</span>
                                                <span className="font-mono">
                                                  {txt.content.length} / 4000
                                                </span>
                                              </div>
                                              <textarea
                                                rows={3}
                                                maxLength={4000}
                                                value={txt.content}
                                                onChange={(e) =>
                                                  updateSectionText(cIdx, compIdx, tIdx, e.target.value)
                                                }
                                                className="w-full bg-[#1e1f22] border border-[#383a40] focus:border-[#5865F2] rounded p-2.5 text-xs text-white outline-none font-mono resize-y"
                                              />
                                            </div>
                                          </div>
                                        ))}

                                        {/* Buttons: Add Text, Clear Texts */}
                                        <div className="flex items-center gap-2 pt-1">
                                          <button
                                            onClick={() => addSectionText(cIdx, compIdx)}
                                            disabled={sec.texts.length >= 3}
                                            className="px-3 py-1.5 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded text-xs font-bold transition-colors cursor-pointer disabled:opacity-40"
                                          >
                                            Add Text
                                          </button>
                                          <button
                                            onClick={() => clearSectionTexts(cIdx, compIdx)}
                                            className="px-3 py-1.5 bg-transparent hover:bg-rose-500/10 border border-rose-500/60 text-rose-400 rounded text-xs font-bold transition-colors cursor-pointer"
                                          >
                                            Clear Texts
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            } else if (comp.type === 'separator') {
                              const sep = comp as ComponentSeparator;

                              return (
                                <div
                                  key={sep.id}
                                  className="bg-[#232428] border border-[#313338] rounded-lg overflow-hidden"
                                >
                                  <div className="px-3 py-2 flex items-center justify-between select-none">
                                    <div
                                      onClick={() => toggleNode(sep.id)}
                                      className="flex items-center gap-2 cursor-pointer flex-1"
                                    >
                                      {isCompOpen ? (
                                        <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                                      ) : (
                                        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                                      )}
                                      <span className="text-xs font-bold text-white">Separator</span>
                                    </div>

                                    <div className="flex items-center gap-1 text-neutral-400">
                                      <button
                                        onClick={() => moveSubComponent(cIdx, compIdx, -1)}
                                        disabled={compIdx === 0}
                                        className="p-1 hover:text-white disabled:opacity-20 cursor-pointer"
                                      >
                                        <ChevronUp className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => moveSubComponent(cIdx, compIdx, 1)}
                                        disabled={compIdx === container.components.length - 1}
                                        className="p-1 hover:text-white disabled:opacity-20 cursor-pointer"
                                      >
                                        <ChevronDown className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => duplicateSubComponent(cIdx, compIdx)}
                                        className="p-1 hover:text-white cursor-pointer"
                                      >
                                        <Copy className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => removeSubComponent(cIdx, compIdx)}
                                        className="p-1 hover:text-rose-400 cursor-pointer"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Separator Body (Image 2) */}
                                  {isCompOpen && (
                                    <div className="p-3 border-t border-[#2b2d31] bg-[#1e1f22] flex items-center justify-between gap-4">
                                      <div className="space-y-1 flex-1">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                                          SPACING
                                        </label>
                                        <select
                                          value={sep.spacing}
                                          onChange={(e) =>
                                            updateSeparator(cIdx, compIdx, {
                                              spacing: e.target.value as any,
                                            })
                                          }
                                          className="w-full bg-[#2b2d31] border border-[#383a40] rounded-md px-3 py-1.5 text-xs text-white outline-none focus:border-[#5865F2]"
                                        >
                                          <option value="Small">Small</option>
                                          <option value="Medium">Medium</option>
                                          <option value="Large">Large</option>
                                        </select>
                                      </div>

                                      <div className="space-y-1 text-right">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block">
                                          DIVIDER
                                        </label>
                                        <input
                                          type="checkbox"
                                          checked={Boolean(sep.divider)}
                                          onChange={(e) =>
                                            updateSeparator(cIdx, compIdx, {
                                              divider: e.target.checked,
                                            })
                                          }
                                          className="w-4 h-4 rounded accent-[#5865F2] cursor-pointer"
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            } else if (comp.type === 'action_row') {
                              const row = comp as ComponentActionRow;

                              return (
                                <div
                                  key={row.id}
                                  className="bg-[#232428] border border-[#313338] rounded-lg overflow-hidden"
                                >
                                  <div className="px-3 py-2 flex items-center justify-between select-none">
                                    <div
                                      onClick={() => toggleNode(row.id)}
                                      className="flex items-center gap-2 cursor-pointer flex-1"
                                    >
                                      {isCompOpen ? (
                                        <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                                      ) : (
                                        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                                      )}
                                      <span className="text-xs font-bold text-white">Action Row</span>
                                      <span className="text-xs text-neutral-400">- Buttons ({row.buttons.length}/5)</span>
                                    </div>

                                    <div className="flex items-center gap-1 text-neutral-400">
                                      <button
                                        onClick={() => moveSubComponent(cIdx, compIdx, -1)}
                                        disabled={compIdx === 0}
                                        className="p-1 hover:text-white disabled:opacity-20 cursor-pointer"
                                      >
                                        <ChevronUp className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => moveSubComponent(cIdx, compIdx, 1)}
                                        disabled={compIdx === container.components.length - 1}
                                        className="p-1 hover:text-white disabled:opacity-20 cursor-pointer"
                                      >
                                        <ChevronDown className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => duplicateSubComponent(cIdx, compIdx)}
                                        className="p-1 hover:text-white cursor-pointer"
                                      >
                                        <Copy className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => removeSubComponent(cIdx, compIdx)}
                                        className="p-1 hover:text-rose-400 cursor-pointer"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>

                                  {isCompOpen && (
                                    <div className="p-3 border-t border-[#2b2d31] bg-[#1e1f22] space-y-3">
                                      {row.buttons.map((btn, bIdx) => (
                                        <div
                                          key={btn.id}
                                          className="p-2.5 bg-[#232428] rounded border border-[#313338] grid grid-cols-1 sm:grid-cols-4 gap-2 items-center"
                                        >
                                          <input
                                            type="text"
                                            value={btn.label}
                                            onChange={(e) =>
                                              updateRowButton(cIdx, compIdx, bIdx, {
                                                label: e.target.value,
                                              })
                                            }
                                            placeholder="Napis przycisku"
                                            className="bg-[#1e1f22] border border-[#383a40] rounded px-2 py-1 text-xs text-white"
                                          />
                                          <select
                                            value={btn.style}
                                            onChange={(e) =>
                                              updateRowButton(cIdx, compIdx, bIdx, {
                                                style: e.target.value as any,
                                              })
                                            }
                                            className="bg-[#1e1f22] border border-[#383a40] rounded px-2 py-1 text-xs text-white"
                                          >
                                            <option value="PRIMARY">Primary (Niebieski)</option>
                                            <option value="SECONDARY">Secondary (Szary)</option>
                                            <option value="SUCCESS">Success (Zielony)</option>
                                            <option value="DANGER">Danger (Czerwony)</option>
                                            <option value="LINK">Link (URL)</option>
                                          </select>
                                          <input
                                            type="text"
                                            value={btn.style === 'LINK' ? btn.url || '' : btn.customId || ''}
                                            onChange={(e) =>
                                              updateRowButton(cIdx, compIdx, bIdx, {
                                                url: btn.style === 'LINK' ? e.target.value : undefined,
                                                customId: btn.style !== 'LINK' ? e.target.value : undefined,
                                              })
                                            }
                                            placeholder={btn.style === 'LINK' ? 'https://...' : 'ID przycisku'}
                                            className="bg-[#1e1f22] border border-[#383a40] rounded px-2 py-1 text-xs text-white font-mono"
                                          />
                                          <div className="flex items-center justify-end">
                                            <button
                                              onClick={() => removeRowButton(cIdx, compIdx, bIdx)}
                                              className="p-1 text-neutral-400 hover:text-rose-400"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </div>
                                      ))}

                                      <button
                                        onClick={() => addRowButton(cIdx, compIdx)}
                                        disabled={row.buttons.length >= 5}
                                        className="px-3 py-1 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded text-xs font-bold"
                                      >
                                        + Dodaj przycisk ({row.buttons.length}/5)
                                      </button>
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
                              className="px-3 py-1.5 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <span>Add Component</span>
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>

                            {showAddMenu === container.id && (
                              <div className="absolute left-0 bottom-full mb-1 bg-[#232428] border border-[#383a40] rounded-lg shadow-2xl p-1.5 w-44 z-30 space-y-1 animate-in fade-in zoom-in-95">
                                <button
                                  onClick={() => addSubComponent(cIdx, 'section')}
                                  className="w-full text-left px-3 py-1.5 rounded hover:bg-[#35373c] text-xs font-bold text-white flex items-center gap-2"
                                >
                                  <span>📄 Section (Tekst + Grafika)</span>
                                </button>
                                <button
                                  onClick={() => addSubComponent(cIdx, 'separator')}
                                  className="w-full text-left px-3 py-1.5 rounded hover:bg-[#35373c] text-xs font-bold text-white flex items-center gap-2"
                                >
                                  <span>➖ Separator (Odstęp / Linia)</span>
                                </button>
                                <button
                                  onClick={() => addSubComponent(cIdx, 'action_row')}
                                  className="w-full text-left px-3 py-1.5 rounded hover:bg-[#35373c] text-xs font-bold text-white flex items-center gap-2"
                                >
                                  <span>🔘 Action Row (Przyciski)</span>
                                </button>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => clearSubComponents(cIdx)}
                            className="px-3 py-1.5 bg-transparent hover:bg-rose-500/10 border border-rose-500/60 text-rose-400 rounded-md text-xs font-bold transition-colors cursor-pointer"
                          >
                            Clear Components
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
                className="px-3 py-1.5 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
              >
                <span>Add Component</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setContainers([])}
                className="px-3 py-1.5 bg-transparent hover:bg-rose-500/10 border border-rose-500/60 text-rose-400 rounded-md text-xs font-bold transition-colors cursor-pointer"
              >
                Clear Components
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REALISTIC DISCORD LIVE CHAT PREVIEW */}
        <div className="lg:col-span-5 p-6 bg-[#313338] overflow-y-auto space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#3f4147]">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-neutral-400" />
              <span className="text-xs font-black uppercase text-neutral-300">
                Podgląd na żywo Discord
              </span>
            </div>
            <span className="text-[10px] text-neutral-400 font-mono">Real-time preview</span>
          </div>

          {/* Discord Message Mockup */}
          <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-[#2e3035]/50 transition-colors">
            {/* Bot Avatar */}
            <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center font-black text-white shrink-0 overflow-hidden shadow">
              <img
                src="https://cdn.discordapp.com/embed/avatars/0.png"
                alt="Bot Avatar"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Message Body */}
            <div className="flex-1 min-w-0 space-y-2">
              {/* Header: Bot Name, BOT badge, timestamp */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm hover:underline cursor-pointer">
                  KitekBot
                </span>
                <span className="bg-[#5865F2] text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded uppercase">
                  BOT ✓
                </span>
                <span className="text-neutral-400 text-xs">Dzisiaj o 12:00</span>
              </div>

              {/* Plain Message Text */}
              {plainMessage && (
                <div className="text-sm text-[#dbdee1] leading-relaxed whitespace-pre-wrap font-sans">
                  {plainMessage
                    .replace(/{user}/g, '@Użytkownik')
                    .replace(/{server\.name}/g, guild.name)
                    .replace(/{memberCount}/g, '142')}
                </div>
              )}

              {/* Containers / Embed Cards Preview */}
              {containers.map((c) => (
                <div
                  key={c.id}
                  className="rounded-lg bg-[#2b2d31] border-l-4 p-4 space-y-3 shadow-md relative"
                  style={{ borderLeftColor: c.color || '#5865F2' }}
                >
                  {c.components.map((comp) => {
                    if (comp.type === 'section') {
                      const sec = comp as ComponentSection;
                      const hasThumb = sec.accessory?.type === 'Thumbnail' && sec.accessory.url;
                      const hasBanner = sec.accessory?.type === 'Image' && sec.accessory.url;

                      return (
                        <div key={sec.id} className="space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0 space-y-1.5">
                              {sec.texts.map((t) => (
                                <div
                                  key={t.id}
                                  className="text-sm text-[#dbdee1] whitespace-pre-wrap font-sans leading-relaxed"
                                >
                                  {t.content
                                    .replace(/{user}/g, '@Użytkownik')
                                    .replace(/{server\.name}/g, guild.name)
                                    .replace(/{memberCount}/g, '142')}
                                </div>
                              ))}
                            </div>

                            {hasThumb && (
                              <img
                                src={sec.accessory!.url}
                                alt="Thumbnail"
                                className="w-16 h-16 rounded object-cover border border-[#383a40] shrink-0"
                              />
                            )}
                          </div>

                          {hasBanner && (
                            <div className="mt-2 rounded overflow-hidden max-h-48 border border-[#383a40]">
                              <img
                                src={sec.accessory!.url}
                                alt="Banner"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                      );
                    } else if (comp.type === 'separator') {
                      const sep = comp as ComponentSeparator;
                      return (
                        <div
                          key={comp.id}
                          className={`w-full ${
                            sep.spacing === 'Large'
                              ? 'my-3'
                              : sep.spacing === 'Medium'
                              ? 'my-2'
                              : 'my-1'
                          }`}
                        >
                          {sep.divider && <div className="h-[1px] bg-[#3f4147] w-full" />}
                        </div>
                      );
                    } else if (comp.type === 'action_row') {
                      const row = comp as ComponentActionRow;
                      return (
                        <div key={row.id} className="flex flex-wrap items-center gap-2 pt-1">
                          {row.buttons.map((btn) => {
                            let btnBg = 'bg-[#5865F2] hover:bg-[#4752C4] text-white';
                            if (btn.style === 'SECONDARY')
                              btnBg = 'bg-[#4e5058] hover:bg-[#6d6f78] text-white';
                            if (btn.style === 'SUCCESS')
                              btnBg = 'bg-[#248046] hover:bg-[#1a6334] text-white';
                            if (btn.style === 'DANGER')
                              btnBg = 'bg-[#da373c] hover:bg-[#a1282c] text-white';
                            if (btn.style === 'LINK')
                              btnBg = 'bg-[#4e5058] hover:bg-[#6d6f78] text-white';

                            return (
                              <div
                                key={btn.id}
                                className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm select-none ${btnBg}`}
                              >
                                {btn.emoji && <span>{btn.emoji}</span>}
                                <span>{btn.label}</span>
                                {btn.style === 'LINK' && <ExternalLink className="w-3 h-3 opacity-70" />}
                              </div>
                            );
                          })}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
