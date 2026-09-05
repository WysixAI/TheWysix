import React, { useState } from 'react';
import {
  Sparkles,
  MessageSquare,
  GripVertical,
  Plus,
  Trash2,
  Copy,
  Check,
  Palette,
  Image as ImageIcon,
  Hash,
  Shield,
  ExternalLink,
  UserPlus,
  UserMinus,
  Send,
  Sliders,
  ChevronDown,
  Layers,
  HelpCircle,
  Flame,
  Star,
  Heart,
  Globe,
  Bell,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Info
} from 'lucide-react';

export interface EmbedField {
  id: string;
  name: string;
  value: string;
  inline: boolean;
}

export interface DiscordButtonComponent {
  id: string;
  type: 'button';
  style: 'primary' | 'secondary' | 'success' | 'danger' | 'link';
  label: string;
  emojiGraphic: 'discord' | 'sparkles' | 'heart' | 'star' | 'shield' | 'flame' | 'link' | 'none';
  customIdOrUrl: string;
  disabled: boolean;
}

export interface SelectOption {
  id: string;
  label: string;
  value: string;
  description?: string;
  emojiGraphic?: 'role' | 'channel' | 'star' | 'bell' | 'sparkles';
}

export interface DiscordSelectMenuComponent {
  id: string;
  type: 'select';
  placeholder: string;
  customId: string;
  disabled: boolean;
  options: SelectOption[];
}

export type DiscordComponentV2 = DiscordButtonComponent | DiscordSelectMenuComponent;

export interface ActionRowV2 {
  id: string;
  components: DiscordComponentV2[];
}

export interface EmbedV2Data {
  authorName: string;
  authorIcon: string;
  authorUrl: string;
  title: string;
  titleUrl: string;
  description: string;
  color: string;
  fields: EmbedField[];
  thumbnailUrl: string;
  imageUrl: string;
  footerText: string;
  footerIcon: string;
  showTimestamp: boolean;
}

interface WelcomesGoodbyesViewProps {
  userGuilds: Array<{ id: string; name: string; icon: string | null }>;
  onBackToDashboard?: () => void;
}

const PRESET_COLORS = [
  { name: 'Discord Blurple', hex: '#5865F2' },
  { name: 'Emerald Green', hex: '#57F287' },
  { name: 'Cyber Gold', hex: '#FEE75C' },
  { name: 'Neon Fuchsia', hex: '#EB459E' },
  { name: 'Ruby Red', hex: '#ED4245' },
  { name: 'Obsidian Dark', hex: '#2B2D31' }
];

export const WelcomesGoodbyesView: React.FC<WelcomesGoodbyesViewProps> = ({
  userGuilds,
  onBackToDashboard
}) => {
  const [activeTab, setActiveTab] = useState<'welcome' | 'goodbye'>('welcome');
  const [selectedGuildId, setSelectedGuildId] = useState<string>(
    userGuilds[0]?.id || '123456789'
  );

  // Główne ustawienia modułu z niestandardowymi grafikami
  const [isEnabled, setIsEnabled] = useState(true);
  const [sendInDm, setSendInDm] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState('welcome-channel');
  const [autoRole, setAutoRole] = useState('Użytkownik');
  const [autoRoleEnabled, setAutoRoleEnabled] = useState(true);

  // Dane Embed v2
  const [embedData, setEmbedData] = useState<EmbedV2Data>({
    authorName: '🐾 Oficjalny KitekBot • Powitania',
    authorIcon: 'https://cdn.discordapp.com/embed/avatars/0.png',
    authorUrl: '',
    title: '👋 Witamy na serwerze {guild.name}!',
    titleUrl: '',
    description:
      'Cześć {user.mention}! Cieszymy się, że do nas dołączyłeś.\nJesteś naszym **{member.count}** członkiem!\n\nZapoznaj się z zasadami i wybierz swoje role w panelu poniżej.',
    color: '#5865F2',
    fields: [
      {
        id: 'f1',
        name: '📌 Regulamin',
        value: 'Przeczytaj zasady na kanale <#regulamin>',
        inline: true
      },
      {
        id: 'f2',
        name: '💬 Pogawędki',
        value: 'Przywitaj się na <#ogólny>',
        inline: true
      }
    ],
    thumbnailUrl: 'https://cdn.discordapp.com/embed/avatars/1.png',
    imageUrl:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
    footerText: 'KitekBot v4.7.0 • Bezpieczna Społeczność',
    footerIcon: 'https://cdn.discordapp.com/embed/avatars/0.png',
    showTimestamp: true
  });

  // Komponenty v2 z Action Rows
  const [actionRows, setActionRows] = useState<ActionRowV2[]>([
    {
      id: 'row-1',
      components: [
        {
          id: 'btn-1',
          type: 'button',
          style: 'primary',
          label: 'Odbierz Rolę',
          emojiGraphic: 'sparkles',
          customIdOrUrl: 'role_verify',
          disabled: false
        },
        {
          id: 'btn-2',
          type: 'button',
          style: 'secondary',
          label: 'Regulamin Serwera',
          emojiGraphic: 'shield',
          customIdOrUrl: 'rules_open',
          disabled: false
        },
        {
          id: 'btn-3',
          type: 'button',
          style: 'link',
          label: 'Strona KitekBot',
          emojiGraphic: 'link',
          customIdOrUrl: 'https://kitekbot.vercel.app',
          disabled: false
        }
      ]
    },
    {
      id: 'row-2',
      components: [
        {
          id: 'select-1',
          type: 'select',
          placeholder: 'Wybierz kanał, od którego chcesz zacząć...',
          customId: 'channel_picker',
          disabled: false,
          options: [
            {
              id: 'opt-1',
              label: '💬 Pogaduszki Ogólne',
              value: 'chat_main',
              description: 'Główny kanał rozmów tekstowych społeczności',
              emojiGraphic: 'channel'
            },
            {
              id: 'opt-2',
              label: '🎮 Strefa Gier',
              value: 'chat_games',
              description: 'Dyskusje o grach, streamy i wspólne granie',
              emojiGraphic: 'sparkles'
            },
            {
              id: 'opt-3',
              label: '📢 Ogłoszenia i Eventy',
              value: 'chat_news',
              description: 'Najważniejsze nowości i konkursy na serwerze',
              emojiGraphic: 'bell'
            }
          ]
        }
      ]
    }
  ]);

  // Stan przeciągania elementów (Drag and Drop / "drag and put")
  const [draggedComponent, setDraggedComponent] = useState<{
    rowId: string;
    componentId: string;
  } | null>(null);
  const [draggedFieldId, setDraggedFieldId] = useState<string | null>(null);

  // Status powiadomień
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [testSent, setTestSent] = useState(false);

  // Wybrany serwer
  const currentGuild = userGuilds.find((g) => g.id === selectedGuildId) || {
    name: 'Mój Serwer Discord',
    id: selectedGuildId,
    icon: null
  };

  // Obsługa wstawiania zmiennych do opisu
  const handleInsertPlaceholder = (tag: string) => {
    setEmbedData((prev) => ({
      ...prev,
      description: prev.description + ' ' + tag
    }));
  };

  // Dodawanie pola w Embedzie
  const handleAddField = () => {
    const newField: EmbedField = {
      id: `field-${Date.now()}`,
      name: 'Nowe Pole',
      value: 'Wartość pola embed',
      inline: true
    };
    setEmbedData((prev) => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
  };

  const handleUpdateField = (id: string, key: keyof EmbedField, value: any) => {
    setEmbedData((prev) => ({
      ...prev,
      fields: prev.fields.map((f) => (f.id === id ? { ...f, [key]: value } : f))
    }));
  };

  const handleDeleteField = (id: string) => {
    setEmbedData((prev) => ({
      ...prev,
      fields: prev.fields.filter((f) => f.id !== id)
    }));
  };

  // Przeciąganie pól Embed ("drag and put")
  const handleFieldDragStart = (id: string) => {
    setDraggedFieldId(id);
  };

  const handleFieldDrop = (targetId: string) => {
    if (!draggedFieldId || draggedFieldId === targetId) return;
    const fields = [...embedData.fields];
    const sourceIndex = fields.findIndex((f) => f.id === draggedFieldId);
    const targetIndex = fields.findIndex((f) => f.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) return;

    const [removed] = fields.splice(sourceIndex, 1);
    fields.splice(targetIndex, 0, removed);
    setEmbedData((prev) => ({ ...prev, fields }));
    setDraggedFieldId(null);
  };

  // Zarządzanie Komponentami v2 (Action Rows / Buttons / Selects)
  const handleAddButton = (rowId: string) => {
    setActionRows((prev) =>
      prev.map((row) => {
        if (row.id === rowId) {
          if (row.components.length >= 5) return row;
          const newBtn: DiscordButtonComponent = {
            id: `btn-${Date.now()}`,
            type: 'button',
            style: 'primary',
            label: 'Nowy Przycisk',
            emojiGraphic: 'sparkles',
            customIdOrUrl: `custom_action_${Date.now()}`,
            disabled: false
          };
          return { ...row, components: [...row.components, newBtn] };
        }
        return row;
      })
    );
  };

  const handleAddActionRow = () => {
    if (actionRows.length >= 5) return;
    const newRow: ActionRowV2 = {
      id: `row-${Date.now()}`,
      components: []
    };
    setActionRows((prev) => [...prev, newRow]);
  };

  const handleDeleteActionRow = (rowId: string) => {
    setActionRows((prev) => prev.filter((r) => r.id !== rowId));
  };

  const handleDeleteComponent = (rowId: string, compId: string) => {
    setActionRows((prev) =>
      prev.map((row) => {
        if (row.id === rowId) {
          return {
            ...row,
            components: row.components.filter((c) => c.id !== compId)
          };
        }
        return row;
      })
    );
  };

  const handleUpdateComponent = (
    rowId: string,
    compId: string,
    updated: Partial<DiscordComponentV2>
  ) => {
    setActionRows((prev) =>
      prev.map((row) => {
        if (row.id === rowId) {
          return {
            ...row,
            components: row.components.map((c) =>
              c.id === compId ? ({ ...c, ...updated } as DiscordComponentV2) : c
            )
          };
        }
        return row;
      })
    );
  };

  // Drag and drop dla Components v2 ("drag and put")
  const handleComponentDragStart = (rowId: string, componentId: string) => {
    setDraggedComponent({ rowId, componentId });
  };

  const handleComponentDrop = (targetRowId: string, targetComponentId?: string) => {
    if (!draggedComponent) return;
    const { rowId: srcRowId, componentId: srcCompId } = draggedComponent;

    // Pobierz komponent
    const srcRow = actionRows.find((r) => r.id === srcRowId);
    const comp = srcRow?.components.find((c) => c.id === srcCompId);
    if (!comp) return;

    setActionRows((prev) => {
      // Klonujemy stan
      const next = prev.map((r) => ({ ...r, components: [...r.components] }));
      const sRow = next.find((r) => r.id === srcRowId);
      const tRow = next.find((r) => r.id === targetRowId);
      if (!sRow || !tRow) return prev;

      // Usuń z wiersza źródłowego
      sRow.components = sRow.components.filter((c) => c.id !== srcCompId);

      // Wstaw do wiersza docelowego
      if (targetComponentId) {
        const targetIndex = tRow.components.findIndex((c) => c.id === targetComponentId);
        if (targetIndex !== -1) {
          tRow.components.splice(targetIndex, 0, comp);
        } else {
          tRow.components.push(comp);
        }
      } else {
        tRow.components.push(comp);
      }
      return next;
    });

    setDraggedComponent(null);
  };

  // Niestandardowa grafika dla ikon przycisków
  const renderGraphicBadge = (graphic: string) => {
    switch (graphic) {
      case 'discord':
        return (
          <span className="w-4 h-4 rounded bg-[#5865F2] text-white flex items-center justify-center text-[9px] font-black">
            D
          </span>
        );
      case 'sparkles':
        return <Sparkles className="w-4 h-4 text-yellow-400" />;
      case 'heart':
        return <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />;
      case 'star':
        return <Star className="w-4 h-4 text-amber-400 fill-amber-400" />;
      case 'shield':
        return <Shield className="w-4 h-4 text-indigo-400" />;
      case 'flame':
        return <Flame className="w-4 h-4 text-red-500" />;
      case 'link':
        return <ExternalLink className="w-4 h-4 text-neutral-300" />;
      case 'role':
        return <Shield className="w-4 h-4 text-emerald-400" />;
      case 'channel':
        return <Hash className="w-4 h-4 text-neutral-400" />;
      case 'bell':
        return <Bell className="w-4 h-4 text-amber-400" />;
      default:
        return null;
    }
  };

  // Zapisz konfigurację
  const handleSave = () => {
    setSaveStatus('Konfiguracja została pomyślnie zapisana!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  // Testowa wiadomość
  const handleSendTest = () => {
    setTestSent(true);
    setTimeout(() => setTestSent(false), 2500);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Pasek URL nawigacji: panel.kitekbot.vercel.app/PowitaniaIPozegnania */}
      <div className="bg-[#2a2b34] border border-[#3b3c48] rounded-2xl px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-neutral-400 font-semibold">Ścieżka panelu:</span>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#1e1f26] border border-[#3a3b47] rounded-xl text-emerald-400 font-bold">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>panel.kitekbot.vercel.app/PowitaniaIPozegnania</span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="px-3 py-1.5 rounded-xl bg-[#24252f] hover:bg-[#1e1f26] border border-[#3d3e4b] text-neutral-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
            >
              &larr; Wróć do serwerów
            </button>
          )}

          <button
            onClick={handleSendTest}
            className="px-3.5 py-1.5 rounded-xl bg-[#2b2d39] hover:bg-[#343644] border border-[#484a5c] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            {testSent ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Wysłano test!</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 text-[#5865F2]" />
                <span>Testuj na Discordzie</span>
              </>
            )}
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] active:scale-95 text-white text-xs font-black uppercase tracking-wide transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Zapisz zmiany</span>
          </button>
        </div>
      </div>

      {saveStatus && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-bold text-center animate-in fade-in">
          {saveStatus}
        </div>
      )}

      {/* Nagłówek modułu i wybór serwera */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-[#363744]">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#5865F2]/20 border border-[#5865F2]/40 text-[#5865F2] flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2.5">
                <span>Powitania i Pożegnania</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-extrabold uppercase">
                  Embed v2 & Components v2
                </span>
              </h1>
              <p className="text-xs text-neutral-300 font-medium">
                Konfiguruj bogate wiadomości powitalne z interaktywnymi komponentami Discord i funkcją przeciągania (drag & put).
              </p>
            </div>
          </div>
        </div>

        {/* Niestandardowy selektor serwera z grafiką */}
        <div className="flex items-center gap-3 bg-[#2a2b34] p-2 rounded-2xl border border-[#3b3c48]">
          <span className="text-xs text-neutral-400 font-bold uppercase pl-2">Serwer:</span>
          <select
            value={selectedGuildId}
            onChange={(e) => setSelectedGuildId(e.target.value)}
            className="bg-[#1e1f26] border border-[#3a3b47] rounded-xl px-3 py-1.5 text-xs font-bold text-white outline-none cursor-pointer"
          >
            {userGuilds.map((guild) => (
              <option key={guild.id} value={guild.id}>
                {guild.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Przełącznik zakładek: Powitania vs Pożegnania */}
      <div className="flex items-center gap-2 border-b border-[#363744] pb-2">
        <button
          onClick={() => setActiveTab('welcome')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'welcome'
              ? 'bg-[#5865F2] text-white shadow-md'
              : 'bg-[#272831] hover:bg-[#202128] text-neutral-400 hover:text-white'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Wiadomości Powitalne (Welcome)</span>
        </button>

        <button
          onClick={() => setActiveTab('goodbye')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'goodbye'
              ? 'bg-red-500 text-white shadow-md'
              : 'bg-[#272831] hover:bg-[#202128] text-neutral-400 hover:text-white'
          }`}
        >
          <UserMinus className="w-4 h-4" />
          <span>Wiadomości Pożegnalne (Goodbye)</span>
        </button>
      </div>

      {/* GŁÓWNY UKŁAD: KREATOR PO LEWEJ, LIVE DISCORD PREVIEW PO PRAWEJ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEWA KOLUMNA: USTAWIENIA, EMBED BUILDER V2, KOMPONENTY V2 */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. SEKCJA: GŁÓWNE PRZEŁĄCZNIKI Z NIESTANDARDOWYMI GRAFIKAMI */}
          <div className="bg-[#32333d] border border-[#272831] rounded-2xl p-5 shadow-lg space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#5865F2]" />
              <span>Główne Opcje Modułu (Niestandardowe Przełączniki i Menu)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Niestandardowy przełącznik 1: Aktywacja modułu */}
              <div
                onClick={() => setIsEnabled(!isEnabled)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isEnabled
                    ? 'bg-emerald-500/10 border-emerald-500/50 shadow-sm shadow-emerald-950/40'
                    : 'bg-[#252630] border-[#3b3c47] opacity-75'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${
                      isEnabled ? 'bg-emerald-500 text-white' : 'bg-[#3b3c47] text-neutral-400'
                    }`}
                  >
                    {isEnabled ? <Check className="w-4 h-4 stroke-[3]" /> : '✕'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Moduł Powitań</div>
                    <div className="text-[10px] text-neutral-400">
                      {isEnabled ? 'Włączony na serwerze' : 'Wyłączony'}
                    </div>
                  </div>
                </div>

                {/* Graficzny custom switch */}
                <div
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors relative ${
                    isEnabled ? 'bg-emerald-500' : 'bg-neutral-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                      isEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>

              {/* Niestandardowy przełącznik 2: Wysyłanie w DM */}
              <div
                onClick={() => setSendInDm(!sendInDm)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  sendInDm
                    ? 'bg-[#5865F2]/15 border-[#5865F2]/50 shadow-sm'
                    : 'bg-[#252630] border-[#3b3c47]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      sendInDm ? 'bg-[#5865F2] text-white' : 'bg-[#3b3c47] text-neutral-400'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Wiadomość Prywatna (DM)</div>
                    <div className="text-[10px] text-neutral-400">
                      {sendInDm ? 'Wysyłaj bezpośrednio do gracza' : 'Wysyłaj na kanał publiczny'}
                    </div>
                  </div>
                </div>

                <div
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors relative ${
                    sendInDm ? 'bg-[#5865F2]' : 'bg-neutral-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                      sendInDm ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Niestandardowe menu rozwijane z grafikami kanałów i ról */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Kanał powitań z custom grafiką */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-[#5865F2]" />
                  <span>Kanał powitań:</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedChannel}
                    onChange={(e) => setSelectedChannel(e.target.value)}
                    className="w-full bg-[#252630] border border-[#3b3c47] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none cursor-pointer appearance-none font-medium"
                  >
                    <option value="welcome-channel"># 💬 powitania-serwera</option>
                    <option value="general"># 💬 ogólny</option>
                    <option value="rules"># 📜 regulamin-i-pomoc</option>
                    <option value="logs"># 🔒 bot-logi</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Rola dla nowego użytkownika z custom grafiką tarczy */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Rola początkowa (Auto-Role):</span>
                </label>
                <div className="relative">
                  <select
                    value={autoRole}
                    onChange={(e) => setAutoRole(e.target.value)}
                    className="w-full bg-[#252630] border border-[#3b3c47] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none cursor-pointer appearance-none font-medium"
                  >
                    <option value="Użytkownik">🛡️ @Użytkownik (Podstawowa)</option>
                    <option value="Nowicjusz">🛡️ @Nowicjusz</option>
                    <option value="Zweryfikowany">🛡️ @Zweryfikowany</option>
                    <option value="Brak roli">❌ Bez automatycznej roli</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. SEKCJA: KREATOR EMBED V2 */}
          <div className="bg-[#32333d] border border-[#272831] rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-emerald-400" />
                <span>Kreator Embed v2</span>
              </h2>
              <span className="text-[11px] text-neutral-400 font-medium">
                Wspiera Markdown & Zmienne
              </span>
            </div>

            {/* Szybkie wstawianie zmiennych */}
            <div className="bg-[#252630] p-3 rounded-xl border border-[#3b3c47] space-y-2">
              <span className="text-[11px] font-bold text-neutral-300 uppercase tracking-wide">
                Wstaw zmienne dynamiczne jednym kliknięciem:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { tag: '{user}', label: 'Użytkownik' },
                  { tag: '{user.mention}', label: 'Wzmianka (@User)' },
                  { tag: '{guild.name}', label: 'Nazwa Serwera' },
                  { tag: '{member.count}', label: 'Liczba Członków' }
                ].map((item) => (
                  <button
                    key={item.tag}
                    type="button"
                    onClick={() => handleInsertPlaceholder(item.tag)}
                    className="px-2.5 py-1 rounded-lg bg-[#32333d] hover:bg-[#5865F2] hover:text-white text-indigo-300 border border-[#484a5a] text-[11px] font-mono font-bold transition-all cursor-pointer"
                  >
                    {item.tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Kolor embeda */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                Kolor bocznego paska embeda:
              </label>
              <div className="flex items-center gap-2.5 flex-wrap">
                {PRESET_COLORS.map((col) => (
                  <button
                    key={col.hex}
                    type="button"
                    onClick={() => setEmbedData({ ...embedData, color: col.hex })}
                    className={`w-7 h-7 rounded-xl transition-transform cursor-pointer border ${
                      embedData.color.toLowerCase() === col.hex.toLowerCase()
                        ? 'scale-110 border-white ring-2 ring-white/50'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: col.hex }}
                    title={col.name}
                  />
                ))}
                <input
                  type="text"
                  value={embedData.color}
                  onChange={(e) => setEmbedData({ ...embedData, color: e.target.value })}
                  placeholder="#5865F2"
                  className="w-24 px-2 py-1 bg-[#252630] border border-[#3b3c47] rounded-lg text-xs font-mono text-white text-center"
                />
              </div>
            </div>

            {/* Tytuł & Autor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  Autor Embeda:
                </label>
                <input
                  type="text"
                  value={embedData.authorName}
                  onChange={(e) => setEmbedData({ ...embedData, authorName: e.target.value })}
                  className="w-full px-3 py-2 bg-[#252630] border border-[#3b3c47] rounded-xl text-xs text-white"
                  placeholder="np. KitekBot Powitania"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  Tytuł Embeda:
                </label>
                <input
                  type="text"
                  value={embedData.title}
                  onChange={(e) => setEmbedData({ ...embedData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#252630] border border-[#3b3c47] rounded-xl text-xs text-white"
                  placeholder="np. Witamy na serwerze!"
                />
              </div>
            </div>

            {/* Treść / Opis Embeda */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Treść wiadomości (Opis embeda):
              </label>
              <textarea
                rows={4}
                value={embedData.description}
                onChange={(e) => setEmbedData({ ...embedData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#252630] border border-[#3b3c47] rounded-xl text-xs text-white leading-relaxed font-sans"
              />
            </div>

            {/* Pola Embed v2 z opcją przeciągania "drag and put" */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <GripVertical className="w-4 h-4 text-neutral-400" />
                  <span>Pola Embeda (Przeciągnij i upuść / Drag and Put):</span>
                </span>
                <button
                  type="button"
                  onClick={handleAddField}
                  className="px-2.5 py-1 rounded-lg bg-[#5865F2]/20 hover:bg-[#5865F2]/30 text-indigo-300 border border-[#5865F2]/40 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Dodaj pole</span>
                </button>
              </div>

              {embedData.fields.map((field, idx) => (
                <div
                  key={field.id}
                  draggable
                  onDragStart={() => handleFieldDragStart(field.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleFieldDrop(field.id)}
                  className={`p-3 bg-[#252630] border rounded-xl flex items-center gap-3 transition-all ${
                    draggedFieldId === field.id
                      ? 'border-[#5865F2] opacity-50 bg-[#2d2e3d]'
                      : 'border-[#3b3c47] hover:border-[#4f5161]'
                  }`}
                >
                  <div className="cursor-grab active:cursor-grabbing text-neutral-400 hover:text-white">
                    <GripVertical className="w-4 h-4" />
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) => handleUpdateField(field.id, 'name', e.target.value)}
                      placeholder="Nazwa pola"
                      className="px-2.5 py-1.5 bg-[#1e1f26] border border-[#3b3c47] rounded-lg text-xs text-white"
                    />
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => handleUpdateField(field.id, 'value', e.target.value)}
                      placeholder="Wartość pola"
                      className="px-2.5 py-1.5 bg-[#1e1f26] border border-[#3b3c47] rounded-lg text-xs text-white"
                    />
                  </div>

                  <label className="flex items-center gap-1.5 text-[11px] text-neutral-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={field.inline}
                      onChange={(e) => handleUpdateField(field.id, 'inline', e.target.checked)}
                      className="rounded accent-[#5865F2]"
                    />
                    <span>Inline</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => handleDeleteField(field.id)}
                    className="p-1.5 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Obrazy: Miniaturka i Obraz główny */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  URL Miniatury (Prawy górny róg):
                </label>
                <input
                  type="text"
                  value={embedData.thumbnailUrl}
                  onChange={(e) => setEmbedData({ ...embedData, thumbnailUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-[#252630] border border-[#3b3c47] rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  URL Dużego Bannera (Dół):
                </label>
                <input
                  type="text"
                  value={embedData.imageUrl}
                  onChange={(e) => setEmbedData({ ...embedData, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-[#252630] border border-[#3b3c47] rounded-xl text-xs text-white"
                />
              </div>
            </div>

            {/* Stopka */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2">
              <input
                type="text"
                value={embedData.footerText}
                onChange={(e) => setEmbedData({ ...embedData, footerText: e.target.value })}
                placeholder="Tekst stopki embeda..."
                className="flex-1 px-3 py-2 bg-[#252630] border border-[#3b3c47] rounded-xl text-xs text-white"
              />
              <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={embedData.showTimestamp}
                  onChange={(e) => setEmbedData({ ...embedData, showTimestamp: e.target.checked })}
                  className="rounded accent-[#5865F2]"
                />
                <span>Pokaż aktualny znacznik czasu</span>
              </label>
            </div>
          </div>

          {/* 3. SEKCJA: COMPONENTS V2 (ACTION ROWS & PRZYCISKI / SELECT MENUS) Z PRZECIĄGANIEM DRAG AND PUT */}
          <div className="bg-[#32333d] border border-[#272831] rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#5865F2]" />
                  <span>Discord Components v2 (Action Rows & Przyciski)</span>
                </h2>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Przeciągaj komponenty pomiędzy wierszami (Drag & Put) i twórz interaktywne menu pod wiadomością.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddActionRow}
                disabled={actionRows.length >= 5}
                className="px-3 py-1.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Dodaj wiersz ({actionRows.length}/5)</span>
              </button>
            </div>

            {/* Lista wierszy (Action Rows) */}
            <div className="space-y-4">
              {actionRows.map((row, rIdx) => (
                <div
                  key={row.id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleComponentDrop(row.id)}
                  className="p-4 bg-[#252630] border border-[#3b3c47] rounded-2xl space-y-3 shadow-inner"
                >
                  <div className="flex items-center justify-between border-b border-[#363744] pb-2">
                    <span className="text-xs font-black uppercase tracking-wide text-neutral-300 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-[#5865F2]/20 text-[#8590ff] flex items-center justify-center text-[10px] font-mono">
                        {rIdx + 1}
                      </span>
                      <span>Action Row #{rIdx + 1}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAddButton(row.id)}
                        disabled={row.components.length >= 5}
                        className="px-2.5 py-1 rounded-lg bg-[#32333d] hover:bg-[#3d3f4d] text-white text-[11px] font-bold border border-[#484a5c] transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40"
                      >
                        <Plus className="w-3 h-3 text-emerald-400" />
                        <span>Dodaj Przycisk</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteActionRow(row.id)}
                        className="p-1 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                        title="Usuń wiersz"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Komponenty w tym wierszu */}
                  {row.components.length === 0 ? (
                    <div className="py-4 text-center text-xs text-neutral-500 font-medium border border-dashed border-[#3a3b47] rounded-xl">
                      Przeciągnij tutaj komponent lub kliknij &quot;Dodaj Przycisk&quot;
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {row.components.map((comp) => {
                        if (comp.type === 'button') {
                          return (
                            <div
                              key={comp.id}
                              draggable
                              onDragStart={() => handleComponentDragStart(row.id, comp.id)}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.stopPropagation();
                                handleComponentDrop(row.id, comp.id);
                              }}
                              className={`p-3 bg-[#1e1f26] border rounded-xl flex flex-wrap sm:flex-nowrap items-center gap-3 transition-all ${
                                draggedComponent?.componentId === comp.id
                                  ? 'border-[#5865F2] opacity-50'
                                  : 'border-[#3b3c47] hover:border-[#4d4f5f]'
                              }`}
                            >
                              <div
                                className="cursor-grab active:cursor-grabbing text-neutral-400 hover:text-white"
                                title="Przeciągnij i upuść w innym wierszu"
                              >
                                <GripVertical className="w-4 h-4" />
                              </div>

                              {/* Styl przycisku */}
                              <select
                                value={comp.style}
                                onChange={(e) =>
                                  handleUpdateComponent(row.id, comp.id, {
                                    style: e.target.value as any
                                  })
                                }
                                className="bg-[#292a34] border border-[#3d3e4d] rounded-lg px-2 py-1 text-xs text-white font-bold outline-none cursor-pointer"
                              >
                                <option value="primary">Primary (Blurple)</option>
                                <option value="secondary">Secondary (Szary)</option>
                                <option value="success">Success (Zielony)</option>
                                <option value="danger">Danger (Czerwony)</option>
                                <option value="link">Link (URL)</option>
                              </select>

                              {/* Grafika ikony */}
                              <select
                                value={comp.emojiGraphic}
                                onChange={(e) =>
                                  handleUpdateComponent(row.id, comp.id, {
                                    emojiGraphic: e.target.value as any
                                  })
                                }
                                className="bg-[#292a34] border border-[#3d3e4d] rounded-lg px-2 py-1 text-xs text-white outline-none cursor-pointer"
                              >
                                <option value="none">Brak ikony</option>
                                <option value="sparkles">✨ Iskry</option>
                                <option value="shield">🛡️ Tarcza</option>
                                <option value="heart">❤️ Serce</option>
                                <option value="star">⭐ Gwiazda</option>
                                <option value="flame">🔥 Ogień</option>
                                <option value="link">🔗 Link</option>
                              </select>

                              {/* Etykieta przycisku */}
                              <input
                                type="text"
                                value={comp.label}
                                onChange={(e) =>
                                  handleUpdateComponent(row.id, comp.id, { label: e.target.value })
                                }
                                placeholder="Tekst przycisku"
                                className="flex-1 min-w-[120px] px-2.5 py-1 bg-[#292a34] border border-[#3d3e4d] rounded-lg text-xs text-white"
                              />

                              {/* Custom ID lub URL */}
                              <input
                                type="text"
                                value={comp.customIdOrUrl}
                                onChange={(e) =>
                                  handleUpdateComponent(row.id, comp.id, {
                                    customIdOrUrl: e.target.value
                                  })
                                }
                                placeholder={comp.style === 'link' ? 'https://...' : 'custom_id'}
                                className="w-28 px-2 py-1 bg-[#292a34] border border-[#3d3e4d] rounded-lg text-[11px] font-mono text-neutral-300"
                              />

                              <button
                                type="button"
                                onClick={() => handleDeleteComponent(row.id, comp.id)}
                                className="p-1 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        } else {
                          // Select menu
                          return (
                            <div
                              key={comp.id}
                              draggable
                              onDragStart={() => handleComponentDragStart(row.id, comp.id)}
                              onDragOver={(e) => e.preventDefault()}
                              className="p-3 bg-[#1e1f26] border border-[#3b3c47] rounded-xl space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="cursor-grab active:cursor-grabbing text-neutral-400">
                                    <GripVertical className="w-4 h-4" />
                                  </div>
                                  <span className="text-xs font-bold text-white">
                                    Select Menu Component v2
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteComponent(row.id, comp.id)}
                                  className="text-neutral-400 hover:text-red-400 p-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              <input
                                type="text"
                                value={comp.placeholder}
                                onChange={(e) =>
                                  handleUpdateComponent(row.id, comp.id, {
                                    placeholder: e.target.value
                                  })
                                }
                                placeholder="Placeholder menu..."
                                className="w-full px-3 py-1.5 bg-[#292a34] border border-[#3d3e4d] rounded-lg text-xs text-white"
                              />
                            </div>
                          );
                        }
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PRAWA KOLUMNA: AUTENTYCZNY PODGLĄD DISCORD NA ŻYWO (LIVE DISCORD PREVIEW V2) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-20 bg-[#2b2d31] border border-[#1e1f22] rounded-2xl p-5 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-[#35373c] mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Podgląd na żywo (Discord v2)</span>
              </span>
              <span className="text-[11px] text-neutral-400 font-mono">#{selectedChannel}</span>
            </div>

            {/* Wiadomość bota w stylu Discord */}
            <div className="flex items-start gap-4">
              {/* Awatar bota */}
              <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center font-black text-white text-base shadow-md shrink-0 select-none">
                🐾
              </div>

              <div className="flex-1 min-w-0">
                {/* Linia nagłówka użytkownika Discord */}
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-bold text-white text-sm hover:underline cursor-pointer">
                    KitekBot
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-[#5865F2] text-white text-[10px] font-extrabold uppercase leading-tight tracking-wider select-none">
                    BOT
                  </span>
                  <span className="text-xs text-neutral-400">Dzisiaj o 12:00</span>
                </div>

                {/* Treść tekstowa wiadomości */}
                <div className="text-xs text-neutral-300 leading-relaxed mb-3">
                  Witaj <span className="text-[#c9cdfb] font-semibold bg-[#5865F2]/20 px-1 py-0.5 rounded cursor-pointer">@NowyUżytkownik</span>! Twoja przygoda właśnie się zaczyna.
                </div>

                {/* KARTA EMBED V2 */}
                <div
                  className="rounded-lg bg-[#2b2d31] border border-[#1e1f22] p-4 shadow-md space-y-3 relative overflow-hidden"
                  style={{
                    borderLeftWidth: '4px',
                    borderLeftColor: embedData.color || '#5865F2'
                  }}
                >
                  {/* Prawy górny róg: Miniaturka */}
                  {embedData.thumbnailUrl && (
                    <img
                      src={embedData.thumbnailUrl}
                      alt="Thumbnail"
                      className="w-14 h-14 rounded-lg object-cover absolute top-4 right-4 border border-[#35373c]"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  )}

                  {/* Autor */}
                  {embedData.authorName && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
                      {embedData.authorIcon && (
                        <img
                          src={embedData.authorIcon}
                          alt="Icon"
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      )}
                      <span>{embedData.authorName}</span>
                    </div>
                  )}

                  {/* Tytuł */}
                  {embedData.title && (
                    <div className="text-base font-bold text-white hover:underline cursor-pointer">
                      {embedData.title.replace('{guild.name}', currentGuild.name)}
                    </div>
                  )}

                  {/* Opis embeda z podmienionymi tagami */}
                  {embedData.description && (
                    <div className="text-xs text-neutral-300 leading-relaxed whitespace-pre-line">
                      {embedData.description
                        .replace(/{user}/g, 'NowyUżytkownik')
                        .replace(/{user.mention}/g, '@NowyUżytkownik')
                        .replace(/{guild.name}/g, currentGuild.name)
                        .replace(/{member.count}/g, '142')}
                    </div>
                  )}

                  {/* Pola Embeda */}
                  {embedData.fields.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      {embedData.fields.map((f) => (
                        <div
                          key={f.id}
                          className={f.inline ? 'col-span-1' : 'col-span-2'}
                        >
                          <div className="text-xs font-bold text-neutral-200">{f.name}</div>
                          <div className="text-xs text-neutral-400 mt-0.5">{f.value}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Duży baner graficzny */}
                  {embedData.imageUrl && (
                    <div className="pt-2">
                      <img
                        src={embedData.imageUrl}
                        alt="Banner"
                        className="w-full max-h-48 rounded-lg object-cover border border-[#35373c]"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Stopka */}
                  {(embedData.footerText || embedData.showTimestamp) && (
                    <div className="flex items-center gap-2 text-[11px] text-neutral-400 pt-1 border-t border-[#35373c]">
                      {embedData.footerIcon && (
                        <img
                          src={embedData.footerIcon}
                          alt="Footer Icon"
                          className="w-4 h-4 rounded-full"
                        />
                      )}
                      <span>{embedData.footerText}</span>
                      {embedData.showTimestamp && (
                        <>
                          <span>•</span>
                          <span>Dzisiaj o 12:00</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* KOMPONENTY V2 POD WIADOMOŚCIĄ (BUTTONS & SELECT MENUS) */}
                <div className="mt-3 space-y-2">
                  {actionRows.map((row) => (
                    <div key={row.id} className="flex flex-wrap gap-2">
                      {row.components.map((comp) => {
                        if (comp.type === 'button') {
                          // Styl przycisku Discord
                          const bgClass =
                            comp.style === 'primary'
                              ? 'bg-[#5865F2] hover:bg-[#4752C4] text-white'
                              : comp.style === 'secondary'
                              ? 'bg-[#4E5058] hover:bg-[#6D6F78] text-white'
                              : comp.style === 'success'
                              ? 'bg-[#248046] hover:bg-[#1a6334] text-white'
                              : comp.style === 'danger'
                              ? 'bg-[#DA373C] hover:bg-[#a1282c] text-white'
                              : 'bg-[#4E5058] hover:bg-[#6D6F78] text-white';

                          return (
                            <button
                              key={comp.id}
                              type="button"
                              className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer ${bgClass}`}
                            >
                              {renderGraphicBadge(comp.emojiGraphic)}
                              <span>{comp.label}</span>
                            </button>
                          );
                        } else {
                          // Select menu w stylu Discord
                          return (
                            <div
                              key={comp.id}
                              className="w-full bg-[#1e1f22] border border-[#35373c] rounded p-2 text-xs text-neutral-300 flex items-center justify-between cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <Hash className="w-3.5 h-3.5 text-neutral-400" />
                                <span>{comp.placeholder}</span>
                              </div>
                              <ChevronDown className="w-4 h-4 text-neutral-400" />
                            </div>
                          );
                        }
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
