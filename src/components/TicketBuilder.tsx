import React, { useState, useEffect } from 'react';
import {
  Ticket,
  Send,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Layers,
  Palette,
  Hash,
  MessageSquare,
  Shield,
  HelpCircle,
  ChevronDown,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Lock,
  FileText,
  Clock,
  Settings2,
  Copy,
  ChevronRight,
  Eye,
  Sliders,
  Check
} from 'lucide-react';
import {
  GuildConfig,
  TicketConfig,
  TicketButtonConfig,
  TicketSelectOption,
  TicketButtonStyle,
  TicketComponentType,
  getDefaultTicketConfig
} from '../types/guildConfig';

interface TicketBuilderProps {
  guild: { id: string; name: string; icon?: string | null };
  onBackToDashboard: () => void;
}

const DISCORD_COLOR_PRESETS = [
  { name: 'Blurple', hex: '#5865F2' },
  { name: 'Emerald', hex: '#57F287' },
  { name: 'Crimson', hex: '#ED4245' },
  { name: 'Gold', hex: '#FEE75C' },
  { name: 'Fuchsia', hex: '#EB459E' },
  { name: 'Dark', hex: '#2B2D31' },
  { name: 'Aqua', hex: '#1ABC9C' },
  { name: 'Navy', hex: '#34495E' },
];

const BUTTON_STYLE_OPTIONS: { style: TicketButtonStyle; name: string; bg: string; border: string; desc: string }[] = [
  { style: 'PRIMARY', name: 'Primary (Blurple)', bg: '#5865F2', border: '#7983f5', desc: 'Główny niebieski przycisk Discord' },
  { style: 'SUCCESS', name: 'Success (Zielony)', bg: '#248046', border: '#3ba55d', desc: 'Pozytywny zielony przycisk akcji' },
  { style: 'DANGER', name: 'Danger (Czerwony)', bg: '#DA373C', border: '#ed4245', desc: 'Czerwony przycisk ostrzeżenia / skargi' },
  { style: 'SECONDARY', name: 'Secondary (Grafit)', bg: '#4E5058', border: '#6d6f78', desc: 'Neutralny szary przycisk' },
  { style: 'LINK', name: 'Link (Szary)', bg: '#4E5058', border: '#6d6f78', desc: 'Przycisk z odnośnikiem WWW' },
];

const POPULAR_EMOJIS = ['🎫', '🛠️', '💳', '🚨', '❓', '💬', '🔒', '⭐', '🛡️', '📌', '✉️', '📦', '🔑', '🎯'];

export const TicketBuilder: React.FC<TicketBuilderProps> = ({ guild, onBackToDashboard }) => {
  const [ticketConfig, setTicketConfig] = useState<TicketConfig>(() => getDefaultTicketConfig());
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [sendingPanel, setSendingPanel] = useState<boolean>(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string; messageId?: string } | null>(null);

  // Guild Discord channels from bot
  const [serverChannels, setServerChannels] = useState<{ id: string; name: string; type?: number }[]>([]);
  const [loadingChannels, setLoadingChannels] = useState<boolean>(false);

  // Active view tabs within ticket builder
  const [activeTab, setActiveTab] = useState<'panel' | 'components' | 'settings'>('panel');
  const [selectedButtonIndex, setSelectedButtonIndex] = useState<number>(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number>(0);

  // Live simulation test modal
  const [simulatedTicket, setSimulatedTicket] = useState<{
    open: boolean;
    channelName: string;
    category: string;
    title: string;
    message: string;
    color: string;
    supportRole: string;
  } | null>(null);

  // Dropdown open in preview
  const [previewSelectOpen, setPreviewSelectOpen] = useState<boolean>(false);

  // 1. Fetch guild configuration and channels
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      try {
        // Fetch config
        const confRes = await fetch(`/api/guilds/${guild.id}`);
        if (confRes.ok) {
          const data: GuildConfig = await confRes.json();
          if (data && data.ticket) {
            setTicketConfig(data.ticket);
          } else {
            setTicketConfig(getDefaultTicketConfig());
          }
        }

        // Fetch channels via bot proxy
        setLoadingChannels(true);
        const detailsRes = await fetch(`/api/bot/proxy/guilds/${guild.id}/details`);
        if (detailsRes.ok) {
          const detailsData = await detailsRes.json();
          if (detailsData && Array.isArray(detailsData.channels)) {
            const textChs = detailsData.channels.filter((c: any) => c.type === 0 || c.type === 'GUILD_TEXT' || !c.type);
            if (isMounted) setServerChannels(textChs);
          }
        }
      } catch (err) {
        console.error('Błąd ładowania danych ticketów:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
          setLoadingChannels(false);
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [guild.id]);

  // 2. Save configuration
  const handleSave = async (silent = false) => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch(`/api/guilds/${guild.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket: ticketConfig }),
      });
      if (res.ok) {
        if (!silent) {
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
        }
        return true;
      }
    } catch (err) {
      console.error('Błąd zapisu konfiguracji:', err);
    } finally {
      setSaving(false);
    }
    return false;
  };

  // 3. Send Ticket Panel to Discord Channel
  const handleSendPanel = async () => {
    setSendingPanel(true);
    setSendResult(null);

    // Auto-save first
    await handleSave(true);

    try {
      const res = await fetch(`/api/bot/proxy/guilds/${guild.id}/send-ticket-panel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: ticketConfig.panel.channelId,
          channelName: ticketConfig.panel.channelName || 'pomoc',
          panel: ticketConfig.panel,
          settings: ticketConfig.settings,
        }),
      });

      const data = await res.json();
      if (data && data.success) {
        const chName = ticketConfig.panel.channelName || 'wskazany kanał';
        setSendResult({
          success: true,
          message: `✅ Panel ticketów został pomyślnie wysłany na kanał #${chName} na Discordzie! Użytkownicy mogą teraz klikać i tworzyć zgłoszenia.`,
          messageId: data.messageId,
        });
      } else {
        setSendResult({
          success: false,
          message: data?.error || 'Nie udało się wysłać panelu. Sprawdź, czy bot ma uprawnienia do wysyłania wiadomości i embedów na wybranym kanale.',
        });
      }
    } catch (err: any) {
      setSendResult({
        success: false,
        message: err.message || 'Wystąpił błąd połączenia z serwerem bota podczas wysyłania panelu.',
      });
    } finally {
      setSendingPanel(false);
    }
  };

  // Helper updaters
  const updatePanel = (updater: (prev: TicketConfig['panel']) => TicketConfig['panel']) => {
    setTicketConfig((prev) => ({
      ...prev,
      panel: updater(prev.panel),
    }));
  };

  const updateEmbed = (updater: (prev: TicketConfig['panel']['embed']) => TicketConfig['panel']['embed']) => {
    updatePanel((panel) => ({
      ...panel,
      embed: updater(panel.embed),
    }));
  };

  const updateSettings = (updater: (prev: TicketConfig['settings']) => TicketConfig['settings']) => {
    setTicketConfig((prev) => ({
      ...prev,
      settings: updater(prev.settings),
    }));
  };

  // Button management
  const handleAddButton = () => {
    const id = `btn-${Date.now()}`;
    const newBtn: TicketButtonConfig = {
      id,
      label: `Zgłoszenie #${ticketConfig.panel.buttons.length + 1}`,
      emoji: '🎫',
      style: 'PRIMARY',
      customColor: '#5865F2',
      customId: `ticket_create_${ticketConfig.panel.buttons.length + 1}`,
      categoryName: 'Pomoc Ogólna',
      channelPrefix: 'ticket',
      supportRoleName: 'Support',
      ticketWelcomeTitle: '🎫 Nowe Zgłoszenie',
      ticketWelcomeMessage: 'Witaj {user}! Dziękujemy za utworzenie zgłoszenia. Opisz swój problem poniżej.',
      ticketWelcomeColor: '#5865F2',
    };
    updatePanel((p) => ({
      ...p,
      buttons: [...p.buttons, newBtn],
    }));
    setSelectedButtonIndex(ticketConfig.panel.buttons.length);
  };

  const handleRemoveButton = (index: number) => {
    updatePanel((p) => ({
      ...p,
      buttons: p.buttons.filter((_, i) => i !== index),
    }));
    if (selectedButtonIndex >= index && selectedButtonIndex > 0) {
      setSelectedButtonIndex((prev) => prev - 1);
    }
  };

  const updateButton = (index: number, patch: Partial<TicketButtonConfig>) => {
    updatePanel((p) => {
      const copy = [...p.buttons];
      if (copy[index]) {
        copy[index] = { ...copy[index], ...patch };
      }
      return { ...p, buttons: copy };
    });
  };

  // Select option management
  const handleAddOption = () => {
    const id = `opt-${Date.now()}`;
    const newOpt: TicketSelectOption = {
      id,
      label: `Kategoria #${ticketConfig.panel.selectMenu.options.length + 1}`,
      value: `cat_${ticketConfig.panel.selectMenu.options.length + 1}`,
      description: 'Opis kategorii i wymagane informacje',
      emoji: '📂',
      colorAccent: '#5865F2',
      categoryName: 'Pomoc',
      channelPrefix: 'ticket',
      supportRoleName: 'Support',
      ticketWelcomeMessage: 'Witaj {user}! Opisz sprawę dla wybranej kategorii.',
    };
    updatePanel((p) => ({
      ...p,
      selectMenu: {
        ...p.selectMenu,
        options: [...p.selectMenu.options, newOpt],
      },
    }));
    setSelectedOptionIndex(ticketConfig.panel.selectMenu.options.length);
  };

  const handleRemoveOption = (index: number) => {
    updatePanel((p) => ({
      ...p,
      selectMenu: {
        ...p.selectMenu,
        options: p.selectMenu.options.filter((_, i) => i !== index),
      },
    }));
    if (selectedOptionIndex >= index && selectedOptionIndex > 0) {
      setSelectedOptionIndex((prev) => prev - 1);
    }
  };

  const updateOption = (index: number, patch: Partial<TicketSelectOption>) => {
    updatePanel((p) => {
      const copy = [...p.selectMenu.options];
      if (copy[index]) {
        copy[index] = { ...copy[index], ...patch };
      }
      return {
        ...p,
        selectMenu: { ...p.selectMenu, options: copy },
      };
    });
  };

  // Helper for button Discord background colors
  const getButtonBgClass = (btn: TicketButtonConfig) => {
    if (btn.style === 'SUCCESS') return 'bg-[#248046] hover:bg-[#1a6334] text-white border-[#3ba55d]/40';
    if (btn.style === 'DANGER') return 'bg-[#DA373C] hover:bg-[#a12829] text-white border-[#ed4245]/40';
    if (btn.style === 'SECONDARY') return 'bg-[#4E5058] hover:bg-[#3b3d44] text-white border-[#6d6f78]/40';
    if (btn.style === 'LINK') return 'bg-[#4E5058] hover:bg-[#3b3d44] text-white border-[#6d6f78]/40';
    // PRIMARY default
    return 'bg-[#5865F2] hover:bg-[#4752C4] text-white border-[#7983f5]/40';
  };

  // Trigger test simulation modal
  const handleSimulateOpen = (source: {
    label: string;
    category?: string;
    channelPrefix?: string;
    supportRoleName?: string;
    ticketWelcomeTitle?: string;
    ticketWelcomeMessage?: string;
    ticketWelcomeColor?: string;
  }) => {
    setSimulatedTicket({
      open: true,
      channelName: `${source.channelPrefix || 'ticket'}-twoj-nick`,
      category: source.category || ticketConfig.settings.categoryName || '🎫・TICKETY',
      title: source.ticketWelcomeTitle || `🎫 Zgłoszenie: ${source.label}`,
      message: source.ticketWelcomeMessage || 'Witaj @Użytkownik! Dziękujemy za kontakt z administracją.',
      color: source.ticketWelcomeColor || ticketConfig.panel.embed.color || '#5865F2',
      supportRole: source.supportRoleName || ticketConfig.settings.supportRoleName || 'Support',
    });
  };

  if (loading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-[#5865F2]" />
        <p className="text-sm font-bold text-neutral-300">Ładowanie modułu Ticketów dla serwera...</p>
      </div>
    );
  }

  const { panel, settings } = ticketConfig;
  const currentButton = panel.buttons[selectedButtonIndex] || panel.buttons[0];
  const currentOption = panel.selectMenu.options[selectedOptionIndex] || panel.selectMenu.options[0];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-16">
      {/* 1. TOP HEADER & BAR: NAZWA SERWERA + KANAŁ + WYŚLIJ (SEND) + ZAPISZ */}
      <div className="bg-[#2b2d38] border border-[#3a3b48] rounded-2xl p-5 shadow-xl shadow-black/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#5865F2]/20 border border-[#5865F2]/40 flex items-center justify-center text-[#5865F2] shrink-0 shadow-inner">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                System Zgłoszeń (Tickets V2)
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-[#5865F2]/20 border border-[#5865F2]/40 text-[#8590ff] text-[10px] font-black uppercase">
                v5.5.0
              </span>
            </div>
            <p className="text-xs text-neutral-300 font-medium">
              Serwer: <span className="text-white font-bold">{guild.name}</span> • Komponenty Discord V2 bez ograniczeń
            </p>
          </div>
        </div>

        {/* AKCJE: KANAŁ DOCELOWY + PRZYCISK SEND + ZAPISZ */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Wybór kanału do wysłania panelu */}
          <div className="flex items-center gap-2 bg-[#202128] border border-[#3b3c47] rounded-xl px-3 py-2 flex-1 md:flex-initial">
            <Hash className="w-4 h-4 text-neutral-400 shrink-0" />
            <div className="flex flex-col min-w-[140px]">
              <span className="text-[9px] uppercase font-bold text-neutral-400">Kanał panelu:</span>
              <select
                value={panel.channelId || ''}
                onChange={(e) => {
                  const selId = e.target.value;
                  const found = serverChannels.find((c) => c.id === selId);
                  updatePanel((p) => ({
                    ...p,
                    channelId: selId || null,
                    channelName: found ? found.name : p.channelName,
                  }));
                }}
                className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
              >
                <option value="" className="bg-[#202128] text-neutral-400">
                  Wybierz kanał...
                </option>
                {serverChannels.map((ch) => (
                  <option key={ch.id} value={ch.id} className="bg-[#202128] text-white">
                    #{ch.name}
                  </option>
                ))}
                {!serverChannels.some((c) => c.id === panel.channelId) && panel.channelName && (
                  <option value={panel.channelId || 'custom'} className="bg-[#202128] text-white">
                    #{panel.channelName} (domyślny)
                  </option>
                )}
              </select>
            </div>
          </div>

          {/* PRZYCISK SEND: Natychmiastowe wysłanie wiadomości/embeda na kanał */}
          <button
            id="send-ticket-panel-btn"
            onClick={handleSendPanel}
            disabled={sendingPanel}
            title="Wyślij ten panel ticketów na wskazany kanał Discord"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-950/40 flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {sendingPanel ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{sendingPanel ? 'Wysyłanie...' : 'Send (Wyślij)'}</span>
          </button>

          {/* Przycisk Zapisz */}
          <button
            id="save-ticket-config-btn"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-4 py-2.5 bg-[#5865F2] hover:bg-[#4752C4] active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo-950/40 flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : saveSuccess ? (
              <Check className="w-4 h-4 text-emerald-300" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Zapisywanie...' : saveSuccess ? 'Zapisano!' : 'Zapisz'}</span>
          </button>
        </div>
      </div>

      {/* BANNER WYNIKU WYSŁANIA (SEND RESULT) */}
      {sendResult && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200 ${
            sendResult.success
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          {sendResult.success ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
          )}
          <div className="flex-1 text-xs sm:text-sm font-medium leading-relaxed">
            {sendResult.message}
            {sendResult.messageId && (
              <span className="block mt-1 text-[11px] opacity-75 font-mono">
                ID Wiadomości na Discordzie: {sendResult.messageId}
              </span>
            )}
          </div>
          <button
            onClick={() => setSendResult(null)}
            className="text-neutral-400 hover:text-white text-xs px-2 py-1 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. NAWIGACJA ZAKŁADEK EDYTORA */}
      <div className="flex items-center gap-2 border-b border-[#3b3c47] pb-3">
        <button
          onClick={() => setActiveTab('panel')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'panel'
              ? 'bg-[#5865F2] text-white shadow-md shadow-indigo-950/40'
              : 'bg-[#272831] hover:bg-[#202128] text-neutral-300 hover:text-white border border-[#3b3c47]'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>1. Wiadomość & Karta Embed</span>
        </button>

        <button
          onClick={() => setActiveTab('components')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'components'
              ? 'bg-[#5865F2] text-white shadow-md shadow-indigo-950/40'
              : 'bg-[#272831] hover:bg-[#202128] text-neutral-300 hover:text-white border border-[#3b3c47]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>2. Komponenty V2 (Przyciski & Menu)</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-black">
            {panel.componentType === 'buttons'
              ? panel.buttons.length
              : panel.componentType === 'select_menu'
              ? panel.selectMenu.options.length
              : `${panel.buttons.length}+${panel.selectMenu.options.length}`}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-[#5865F2] text-white shadow-md shadow-indigo-950/40'
              : 'bg-[#272831] hover:bg-[#202128] text-neutral-300 hover:text-white border border-[#3b3c47]'
          }`}
        >
          <Settings2 className="w-4 h-4" />
          <span>3. Ustawienia Kanałów & Ról</span>
        </button>
      </div>

      {/* 3. DWUKOLUMNOWY UKŁAD: PO LEWEJ EDYTOR, PO PRAWEJ LIVE DISCORD PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEWA STRONA: EDYTOR (7 KOLUMN) */}
        <div className="lg:col-span-7 space-y-6">
          {/* ZAKŁADKA 1: WIADOMOŚĆ & EMBED */}
          {activeTab === 'panel' && (
            <div className="bg-[#32333d] border border-[#272831] rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#272831]">
                <div>
                  <h2 className="text-base font-black text-white uppercase flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#5865F2]" />
                    <span>Treść Wiadomości i Karty Embed</span>
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Wiadomość wyświetlana na Discordzie, pod którą pojawią się przyciski lub select menu.
                  </p>
                </div>
              </div>

              {/* Zwykła wiadomość tekstowa (Content nad embedem) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300 flex items-center justify-between">
                  <span>Wiadomość zwykła (opcjonalny tekst nad kartą):</span>
                  <span className="text-[10px] text-neutral-500">Obsługuje wzmianki @role</span>
                </label>
                <textarea
                  value={panel.messageContent || ''}
                  onChange={(e) => updatePanel((p) => ({ ...p, messageContent: e.target.value }))}
                  placeholder="np. 👋 Kliknij poniższy przycisk, aby utworzyć prywatne zgłoszenie do administracji..."
                  rows={2}
                  className="w-full bg-[#202128] border border-[#3b3c47] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#5865F2]"
                />
              </div>

              {/* Karta Embed: Tytuł */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300">Tytuł karty Embed:</label>
                <input
                  type="text"
                  value={panel.embed.title}
                  onChange={(e) => updateEmbed((emb) => ({ ...emb, title: e.target.value }))}
                  placeholder="🎫 Centrum Zgłoszeń i Pomocy"
                  className="w-full bg-[#202128] border border-[#3b3c47] rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#5865F2]"
                />
              </div>

              {/* Karta Embed: Opis */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300 flex items-center justify-between">
                  <span>Opis karty Embed:</span>
                  <span className="text-[10px] text-neutral-500">Obsługuje Markdown (**pogrubienie**, listy)</span>
                </label>
                <textarea
                  value={panel.embed.description}
                  onChange={(e) => updateEmbed((emb) => ({ ...emb, description: e.target.value }))}
                  placeholder="Opisz zasady zgłoszeń, kategorie i czas oczekiwania na odpowiedź..."
                  rows={6}
                  className="w-full bg-[#202128] border border-[#3b3c47] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-[#5865F2]"
                />
              </div>

              {/* Karta Embed: Wybór Koloru z Palety Discord */}
              <div className="space-y-2 pt-2 border-t border-[#272831]">
                <label className="text-xs font-bold text-neutral-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-[#5865F2]" />
                    <span>Kolor paska bocznego Embed:</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-neutral-300">{panel.embed.color}</span>
                </label>

                {/* Szybkie presety Discorda */}
                <div className="flex flex-wrap items-center gap-2">
                  {DISCORD_COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.hex}
                      onClick={() => updateEmbed((emb) => ({ ...emb, color: preset.hex }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                        panel.embed.color.toLowerCase() === preset.hex.toLowerCase()
                          ? 'border-white text-white shadow-sm'
                          : 'border-transparent text-neutral-300 hover:text-white'
                      }`}
                      style={{ backgroundColor: preset.hex }}
                    >
                      <span>{preset.name}</span>
                      {panel.embed.color.toLowerCase() === preset.hex.toLowerCase() && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </button>
                  ))}

                  {/* Własny kolor HEX */}
                  <div className="flex items-center gap-2 ml-auto">
                    <input
                      type="color"
                      value={panel.embed.color}
                      onChange={(e) => updateEmbed((emb) => ({ ...emb, color: e.target.value }))}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                  </div>
                </div>
              </div>

              {/* Stopka & Timestamp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#272831]">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300">Tekst w stopce (Footer):</label>
                  <input
                    type="text"
                    value={panel.embed.footerText || ''}
                    onChange={(e) => updateEmbed((emb) => ({ ...emb, footerText: e.target.value }))}
                    placeholder="System Zgłoszeń KitekBot"
                    className="w-full bg-[#202128] border border-[#3b3c47] rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#5865F2]"
                  />
                </div>

                <div className="space-y-1.5 flex flex-col justify-end">
                  <label className="flex items-center gap-2.5 p-2 rounded-xl bg-[#202128] border border-[#3b3c47] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={panel.embed.includeTimestamp ?? true}
                      onChange={(e) => updateEmbed((emb) => ({ ...emb, includeTimestamp: e.target.checked }))}
                      className="rounded accent-[#5865F2] w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-neutral-300">Wyświetl znacznik czasu (Timestamp)</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ZAKŁADKA 2: KOMPONENTY V2 (PRZYCISKI & SELECT MENU) */}
          {activeTab === 'components' && (
            <div className="space-y-5">
              {/* WYBÓR TYPU KOMPONENTÓW */}
              <div className="bg-[#32333d] border border-[#272831] rounded-2xl p-5 shadow-xl space-y-3">
                <label className="text-xs font-black uppercase text-neutral-300 tracking-wider">
                  Wybierz rodzaj komponentów panelu (Components V2):
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => updatePanel((p) => ({ ...p, componentType: 'buttons' }))}
                    className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      panel.componentType === 'buttons'
                        ? 'bg-[#5865F2]/20 border-[#5865F2] text-white'
                        : 'bg-[#202128] border-[#3b3c47] text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-xs uppercase">🔘 Przyciski (Buttons)</span>
                      {panel.componentType === 'buttons' && <Check className="w-4 h-4 text-[#5865F2]" />}
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-tight">
                      Bezpośrednie, kolorowe przyciski pod embedem (Primary, Success, Danger, itp.).
                    </p>
                  </button>

                  <button
                    onClick={() => updatePanel((p) => ({ ...p, componentType: 'select_menu' }))}
                    className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      panel.componentType === 'select_menu'
                        ? 'bg-[#5865F2]/20 border-[#5865F2] text-white'
                        : 'bg-[#202128] border-[#3b3c47] text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-xs uppercase">📋 Menu (Select Menu)</span>
                      {panel.componentType === 'select_menu' && <Check className="w-4 h-4 text-[#5865F2]" />}
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-tight">
                      Rozwijana lista kategorii z opisami i emoji (np. dla wielu tematów pomocy).
                    </p>
                  </button>

                  <button
                    onClick={() => updatePanel((p) => ({ ...p, componentType: 'both' }))}
                    className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      panel.componentType === 'both'
                        ? 'bg-[#5865F2]/20 border-[#5865F2] text-white'
                        : 'bg-[#202128] border-[#3b3c47] text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-xs uppercase">🔀 Przyciski + Menu</span>
                      {panel.componentType === 'both' && <Check className="w-4 h-4 text-[#5865F2]" />}
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-tight">
                      Jednocześnie przyciski szybkich akcji oraz rozwijana lista kategorii.
                    </p>
                  </button>
                </div>
              </div>

              {/* SEKCJA PRZYCISKÓW (JEŚLI WYBRANO BUTTONS LUB BOTH) */}
              {(panel.componentType === 'buttons' || panel.componentType === 'both') && (
                <div className="bg-[#32333d] border border-[#272831] rounded-2xl p-6 shadow-xl space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-[#272831]">
                    <div>
                      <h3 className="text-sm font-black text-white uppercase flex items-center gap-2">
                        <span>🔘 Przyciski Zgłoszeń ({panel.buttons.length})</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                          Bez ograniczeń
                        </span>
                      </h3>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Kliknij w przycisk, aby edytować jego styl, wybarwienie, rolę i wiadomość powitalną.
                      </p>
                    </div>

                    <button
                      onClick={handleAddButton}
                      className="px-3 py-1.5 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Dodaj Przycisk</span>
                    </button>
                  </div>

                  {/* LISTA PRZYCISKÓW W FORMIE WYBARWIONYCH KAFELKÓW */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {panel.buttons.map((btn, idx) => {
                      const isSelected = selectedButtonIndex === idx;
                      return (
                        <div
                          key={btn.id || idx}
                          onClick={() => setSelectedButtonIndex(idx)}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'ring-2 ring-white shadow-lg'
                              : 'hover:brightness-110 opacity-90'
                          } ${getButtonBgClass(btn)}`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-base shrink-0">{btn.emoji || '🎫'}</span>
                            <div className="truncate">
                              <span className="text-xs font-bold block truncate">{btn.label}</span>
                              <span className="text-[10px] opacity-80 block truncate">
                                {btn.categoryName || 'Zgłoszenie'}
                              </span>
                            </div>
                          </div>

                          {panel.buttons.length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveButton(idx);
                              }}
                              className="p-1 rounded hover:bg-black/30 text-white/80 hover:text-white transition-colors"
                              title="Usuń ten przycisk"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* EDYTOR WYBRANEGO PRZYCISKU */}
                  {currentButton && (
                    <div className="bg-[#24252f] border border-[#3b3c48] rounded-xl p-4.5 space-y-4 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between pb-2 border-b border-[#3b3c48]">
                        <span className="text-xs font-black text-white uppercase flex items-center gap-2">
                          <Sliders className="w-3.5 h-3.5 text-[#5865F2]" />
                          <span>Edycja Przycisku: {currentButton.label}</span>
                        </span>
                        <span className="text-[11px] font-mono text-neutral-400">
                          ID: {currentButton.customId}
                        </span>
                      </div>

                      {/* Etykieta & Emoji */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-[11px] font-bold text-neutral-300">Etykieta przycisku:</label>
                          <input
                            type="text"
                            value={currentButton.label}
                            onChange={(e) => updateButton(selectedButtonIndex, { label: e.target.value })}
                            placeholder="np. Pomoc Techniczna"
                            className="w-full bg-[#1b1c23] border border-[#3b3c47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-neutral-300">Emoji:</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={currentButton.emoji || ''}
                              onChange={(e) => updateButton(selectedButtonIndex, { emoji: e.target.value })}
                              placeholder="🛠️"
                              className="w-14 text-center bg-[#1b1c23] border border-[#3b3c47] rounded-xl px-2 py-2 text-sm text-white focus:outline-none focus:border-[#5865F2]"
                            />
                            {/* Szybkie emoji */}
                            <div className="flex items-center gap-1 overflow-x-auto py-1">
                              {POPULAR_EMOJIS.slice(0, 5).map((em) => (
                                <button
                                  key={em}
                                  type="button"
                                  onClick={() => updateButton(selectedButtonIndex, { emoji: em })}
                                  className="text-sm p-1 rounded hover:bg-white/10 cursor-pointer"
                                >
                                  {em}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* WYBARWIENIE I STYL PRZYCISKU (ABY SIĘ WYBARWIAŁ!) */}
                      <div className="space-y-2 pt-2 border-t border-[#3b3c48]">
                        <label className="text-[11px] font-bold text-neutral-300 flex items-center justify-between">
                          <span>Styl i wybarwienie przycisku (Discord Styles):</span>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            Styl: {currentButton.style}
                          </span>
                        </label>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {BUTTON_STYLE_OPTIONS.map((st) => {
                            const isSelected = currentButton.style === st.style;
                            return (
                              <button
                                key={st.style}
                                type="button"
                                onClick={() => updateButton(selectedButtonIndex, { style: st.style, customColor: st.bg })}
                                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer text-white font-bold text-xs ${
                                  isSelected ? 'ring-2 ring-white shadow-md' : 'opacity-80 hover:opacity-100'
                                }`}
                                style={{ backgroundColor: st.bg, borderColor: st.border }}
                              >
                                <span>{st.name}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* KATEGORIA I NAZWA KANAŁU TICKETU */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#3b3c48]">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-neutral-300">Nazwa kategorii:</label>
                          <input
                            type="text"
                            value={currentButton.categoryName || ''}
                            onChange={(e) => updateButton(selectedButtonIndex, { categoryName: e.target.value })}
                            placeholder="np. Pomoc Techniczna"
                            className="w-full bg-[#1b1c23] border border-[#3b3c47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-neutral-300">Prefiks kanału:</label>
                          <input
                            type="text"
                            value={currentButton.channelPrefix || 'ticket'}
                            onChange={(e) => updateButton(selectedButtonIndex, { channelPrefix: e.target.value })}
                            placeholder="np. pomoc"
                            className="w-full bg-[#1b1c23] border border-[#3b3c47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-neutral-300">Rola wsparcia:</label>
                          <input
                            type="text"
                            value={currentButton.supportRoleName || 'Support'}
                            onChange={(e) => updateButton(selectedButtonIndex, { supportRoleName: e.target.value })}
                            placeholder="@Pomocnik"
                            className="w-full bg-[#1b1c23] border border-[#3b3c47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* POWITANIE W KANALE PO KLIKNIĘCIU */}
                      <div className="space-y-2 pt-2 border-t border-[#3b3c48]">
                        <label className="text-[11px] font-bold text-neutral-300">
                          Wiadomość powitalna w utworzonym kanale zgłoszenia:
                        </label>
                        <input
                          type="text"
                          value={currentButton.ticketWelcomeTitle || ''}
                          onChange={(e) => updateButton(selectedButtonIndex, { ticketWelcomeTitle: e.target.value })}
                          placeholder="Tytuł embeda w tickecie (np. 🛠️ Zgłoszenie Pomoc)"
                          className="w-full bg-[#1b1c23] border border-[#3b3c47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none mb-2"
                        />
                        <textarea
                          value={currentButton.ticketWelcomeMessage || ''}
                          onChange={(e) => updateButton(selectedButtonIndex, { ticketWelcomeMessage: e.target.value })}
                          placeholder="Witaj {user}! Dziękujemy za zgłoszenie. Nasz zespół wkrótce odpowie."
                          rows={3}
                          className="w-full bg-[#1b1c23] border border-[#3b3c47] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SEKCJA SELECT MENU (JEŚLI WYBRANO SELECT_MENU LUB BOTH) */}
              {(panel.componentType === 'select_menu' || panel.componentType === 'both') && (
                <div className="bg-[#32333d] border border-[#272831] rounded-2xl p-6 shadow-xl space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-[#272831]">
                    <div>
                      <h3 className="text-sm font-black text-white uppercase flex items-center gap-2">
                        <span>📋 Menu Rozwijane / Kategorie ({panel.selectMenu.options.length})</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                          Bez ograniczeń
                        </span>
                      </h3>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Użytkownik rozwija listę i wybiera temat zgłoszenia, a bot tworzy dedykowany kanał.
                      </p>
                    </div>

                    <button
                      onClick={handleAddOption}
                      className="px-3 py-1.5 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Dodaj Opcję</span>
                    </button>
                  </div>

                  {/* PLACEHOLDER I WYBARWIENIE MENU */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-neutral-300">Placeholder (Tekst zachęty):</label>
                      <input
                        type="text"
                        value={panel.selectMenu.placeholder}
                        onChange={(e) =>
                          updatePanel((p) => ({
                            ...p,
                            selectMenu: { ...p.selectMenu, placeholder: e.target.value },
                          }))
                        }
                        placeholder="📂 Wybierz kategorię zgłoszenia..."
                        className="w-full bg-[#202128] border border-[#3b3c47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-neutral-300 flex items-center justify-between">
                        <span>Wybarwienie akcentu Menu:</span>
                        <span className="text-xs font-mono font-bold text-neutral-300">
                          {panel.selectMenu.colorAccent || '#5865F2'}
                        </span>
                      </label>
                      <div className="flex items-center gap-2">
                        {['#5865F2', '#57F287', '#ED4245', '#FEE75C', '#EB459E', '#1ABC9C'].map((col) => (
                          <button
                            key={col}
                            type="button"
                            onClick={() =>
                              updatePanel((p) => ({
                                ...p,
                                selectMenu: { ...p.selectMenu, colorAccent: col },
                              }))
                            }
                            className={`w-7 h-7 rounded-lg border transition-all cursor-pointer ${
                              panel.selectMenu.colorAccent === col ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                            }`}
                            style={{ backgroundColor: col, borderColor: 'rgba(255,255,255,0.3)' }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* LISTA OPCJI SELECT MENU */}
                  <div className="space-y-2">
                    {panel.selectMenu.options.map((opt, idx) => {
                      const isSelected = selectedOptionIndex === idx;
                      return (
                        <div
                          key={opt.id || idx}
                          onClick={() => setSelectedOptionIndex(idx)}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#202128] border-[#5865F2] ring-1 ring-[#5865F2]'
                              : 'bg-[#202128]/70 border-[#3b3c47] hover:border-neutral-500'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-lg shrink-0">{opt.emoji || '📂'}</span>
                            <div className="truncate">
                              <span className="text-xs font-bold text-white block truncate">{opt.label}</span>
                              {opt.description && (
                                <span className="text-[11px] text-neutral-400 block truncate">{opt.description}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] px-2 py-0.5 rounded bg-black/40 text-neutral-300 font-mono">
                              #{opt.channelPrefix || 'ticket'}
                            </span>
                            {panel.selectMenu.options.length > 1 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveOption(idx);
                                }}
                                className="p-1 rounded hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* EDYCJA WYBRANEJ OPCJI SELECT MENU */}
                  {currentOption && (
                    <div className="bg-[#24252f] border border-[#3b3c48] rounded-xl p-4.5 space-y-3.5">
                      <span className="text-xs font-black text-white uppercase flex items-center gap-2">
                        <Sliders className="w-3.5 h-3.5 text-[#5865F2]" />
                        <span>Edycja Opcji Menu: {currentOption.label}</span>
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-[11px] font-bold text-neutral-300">Tytuł opcji (Label):</label>
                          <input
                            type="text"
                            value={currentOption.label}
                            onChange={(e) => updateOption(selectedOptionIndex, { label: e.target.value })}
                            placeholder="np. Pomoc Techniczna"
                            className="w-full bg-[#1b1c23] border border-[#3b3c47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-neutral-300">Emoji:</label>
                          <input
                            type="text"
                            value={currentOption.emoji || ''}
                            onChange={(e) => updateOption(selectedOptionIndex, { emoji: e.target.value })}
                            placeholder="🛠️"
                            className="w-full bg-[#1b1c23] border border-[#3b3c47] rounded-xl px-3 py-2 text-xs text-white text-center focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-neutral-300">Opis (Description widoczny pod tytułem):</label>
                        <input
                          type="text"
                          value={currentOption.description || ''}
                          onChange={(e) => updateOption(selectedOptionIndex, { description: e.target.value })}
                          placeholder="np. Zgłaszanie błędów w grze lub problemów z botem"
                          className="w-full bg-[#1b1c23] border border-[#3b3c47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#3b3c48]">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-neutral-300">Prefiks kanału:</label>
                          <input
                            type="text"
                            value={currentOption.channelPrefix || 'pomoc'}
                            onChange={(e) => updateOption(selectedOptionIndex, { channelPrefix: e.target.value })}
                            placeholder="pomoc"
                            className="w-full bg-[#1b1c23] border border-[#3b3c47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-neutral-300">Rola wsparcia:</label>
                          <input
                            type="text"
                            value={currentOption.supportRoleName || 'Support'}
                            onChange={(e) => updateOption(selectedOptionIndex, { supportRoleName: e.target.value })}
                            placeholder="Support"
                            className="w-full bg-[#1b1c23] border border-[#3b3c47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-neutral-300">Wartość ID (Value):</label>
                          <input
                            type="text"
                            value={currentOption.value}
                            onChange={(e) => updateOption(selectedOptionIndex, { value: e.target.value })}
                            placeholder="tech_support"
                            className="w-full bg-[#1b1c23] border border-[#3b3c47] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ZAKŁADKA 3: USTAWIENIA KANAŁÓW I RÓL */}
          {activeTab === 'settings' && (
            <div className="bg-[#32333d] border border-[#272831] rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#272831]">
                <div>
                  <h2 className="text-base font-black text-white uppercase flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#5865F2]" />
                    <span>Ustawienia Tworzenia Kanałów i Uprawnień</span>
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Konfiguracja zachowania bota podczas tworzenia i zamykania ticketów na Discordzie.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300">Kategoria na Discordzie:</label>
                  <input
                    type="text"
                    value={settings.categoryName}
                    onChange={(e) => updateSettings((s) => ({ ...s, categoryName: e.target.value }))}
                    placeholder="🎫・TICKETY"
                    className="w-full bg-[#202128] border border-[#3b3c47] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                  />
                  <p className="text-[10px] text-neutral-400">
                    Bot utworzy lub znajdzie kategorię o tej nazwie i w niej umieści kanały ticketów.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300">Główna Rola Wsparcia (Support):</label>
                  <input
                    type="text"
                    value={settings.supportRoleName}
                    onChange={(e) => updateSettings((s) => ({ ...s, supportRoleName: e.target.value }))}
                    placeholder="Support"
                    className="w-full bg-[#202128] border border-[#3b3c47] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                  />
                  <p className="text-[10px] text-neutral-400">
                    Członkowie z tą rolą automatycznie otrzymają dostęp do nowo otwartego ticketu.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-[#272831]">
                <label className="text-xs font-bold text-neutral-300">Etykieta przycisku zamknięcia zgłoszenia:</label>
                <input
                  type="text"
                  value={settings.closeButtonText}
                  onChange={(e) => updateSettings((s) => ({ ...s, closeButtonText: e.target.value }))}
                  placeholder="🔒 Zamknij Ticket"
                  className="w-full bg-[#202128] border border-[#3b3c47] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#272831]">
                <label className="flex items-center gap-3 p-3 rounded-xl bg-[#202128] border border-[#3b3c47] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.transcriptEnabled}
                    onChange={(e) => updateSettings((s) => ({ ...s, transcriptEnabled: e.target.checked }))}
                    className="rounded accent-[#5865F2] w-4 h-4"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-white block">Generuj transkrypcję (zapis czatu)</span>
                    <span className="text-[10px] text-neutral-400">Zapisuje historię wiadomości przed usunięciem kanału</span>
                  </div>
                </label>

                <div className="p-3 rounded-xl bg-[#202128] border border-[#3b3c47] flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-300">Czas usunięcia kanału po zamknięciu:</span>
                  <span className="px-2.5 py-1 bg-[#5865F2]/20 text-[#8590ff] font-mono text-xs font-bold rounded-lg">
                    {settings.deleteDelaySeconds}s
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PRAWA STRONA: LIVE DISCORD PREVIEW (5 KOLUMN) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#2b2d31] border border-[#1e1f22] rounded-2xl p-5 shadow-2xl space-y-4 sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-[#383a40]">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#5865F2]" />
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  Podgląd na żywo (Discord Preview)
                </span>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono">
                Kanał: #{panel.channelName || 'pomoc'}
              </span>
            </div>

            {/* WIADOMOŚĆ DISCORD W TRYBIE CIEMNYM */}
            <div className="space-y-3 font-sans text-sm">
              {/* Nagłówek bota */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center text-white font-black shrink-0 text-sm shadow">
                  KB
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm hover:underline cursor-pointer">
                      KitekBot
                    </span>
                    <span className="px-1 py-0.2 rounded bg-[#5865F2] text-[9px] font-black text-white uppercase tracking-wider">
                      BOT
                    </span>
                    <span className="text-[11px] text-[#949ba4]">Dzisiaj o 12:00</span>
                  </div>

                  {/* Zwykła wiadomość tekstowa */}
                  {panel.messageContent && (
                    <div className="text-sm text-[#dbdee1] mt-1.5 leading-relaxed whitespace-pre-wrap">
                      {panel.messageContent}
                    </div>
                  )}

                  {/* KARTA EMBED DISCORD */}
                  <div
                    className="mt-2.5 rounded-md bg-[#2b2d31] border-l-4 p-4 space-y-2.5 shadow"
                    style={{ borderLeftColor: panel.embed.color || '#5865F2' }}
                  >
                    {panel.embed.title && (
                      <h4 className="font-bold text-white text-base leading-tight">
                        {panel.embed.title}
                      </h4>
                    )}

                    {panel.embed.description && (
                      <div className="text-xs text-[#dbdee1] whitespace-pre-wrap leading-relaxed">
                        {panel.embed.description}
                      </div>
                    )}

                    {/* Stopka Embed */}
                    {(panel.embed.footerText || panel.embed.includeTimestamp) && (
                      <div className="pt-2 border-t border-[#383a40] text-[10px] text-[#949ba4] flex items-center gap-2">
                        {panel.embed.footerText && <span>{panel.embed.footerText}</span>}
                        {panel.embed.includeTimestamp && <span>• Dzisiaj o 12:00</span>}
                      </div>
                    )}
                  </div>

                  {/* PRZYCISKI V2 (POD EMBEDEM) */}
                  {(panel.componentType === 'buttons' || panel.componentType === 'both') && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {panel.buttons.map((btn) => (
                        <button
                          key={btn.id}
                          onClick={() => handleSimulateOpen(btn)}
                          title="Kliknij, aby przetestować symulację utworzenia zgłoszenia"
                          className={`px-3.5 py-2 rounded font-bold text-xs flex items-center gap-2 transition-transform active:scale-95 cursor-pointer shadow ${getButtonBgClass(
                            btn
                          )}`}
                        >
                          {btn.emoji && <span className="text-sm">{btn.emoji}</span>}
                          <span>{btn.label}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* SELECT MENU V2 (POD PRZYCISKAMI) */}
                  {(panel.componentType === 'select_menu' || panel.componentType === 'both') && (
                    <div className="mt-3 relative">
                      <button
                        onClick={() => setPreviewSelectOpen(!previewSelectOpen)}
                        className="w-full bg-[#1e1f22] border border-[#383a40] rounded px-3 py-2.5 text-xs text-[#dbdee1] flex items-center justify-between cursor-pointer hover:border-[#5865F2]"
                        style={{
                          borderColor: previewSelectOpen
                            ? panel.selectMenu.colorAccent || '#5865F2'
                            : undefined,
                        }}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-[#949ba4]">
                            {panel.selectMenu.placeholder || 'Wybierz opcję...'}
                          </span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-[#949ba4] transition-transform ${
                            previewSelectOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {/* Dropdown opcji po kliknięciu */}
                      {previewSelectOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-[#232428] border border-[#383a40] rounded-md shadow-2xl z-30 overflow-hidden animate-in fade-in duration-100">
                          {panel.selectMenu.options.map((opt) => (
                            <div
                              key={opt.id}
                              onClick={() => {
                                setPreviewSelectOpen(false);
                                handleSimulateOpen(opt);
                              }}
                              className="px-3 py-2.5 hover:bg-[#35373c] cursor-pointer flex items-center justify-between gap-2 border-b border-[#2b2d31] last:border-0"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="text-base">{opt.emoji || '📂'}</span>
                                <div className="truncate">
                                  <span className="text-xs font-bold text-white block truncate">
                                    {opt.label}
                                  </span>
                                  {opt.description && (
                                    <span className="text-[10px] text-[#949ba4] block truncate">
                                      {opt.description}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-[#949ba4]" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Wskazówka pod podglądem */}
            <div className="p-3 rounded-xl bg-[#202128] border border-[#383a40] text-[11px] text-neutral-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Kliknij dowolny przycisk lub opcję w podglądzie, aby przetestować działanie tworzenia ticketu!
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL SYMULACJI UTWORZENIA TICKETU */}
      {simulatedTicket && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#2b2d31] border border-[#383a40] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#383a40]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
                  #
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">{simulatedTicket.channelName}</h3>
                  <p className="text-[10px] text-neutral-400">Kategoria: {simulatedTicket.category}</p>
                </div>
              </div>
              <button
                onClick={() => setSimulatedTicket(null)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#232428] border border-[#383a40] space-y-3">
              <div
                className="rounded-md bg-[#2b2d31] border-l-4 p-4 space-y-2"
                style={{ borderLeftColor: simulatedTicket.color }}
              >
                <h4 className="font-bold text-white text-sm">{simulatedTicket.title}</h4>
                <p className="text-xs text-[#dbdee1] leading-relaxed whitespace-pre-wrap">
                  {simulatedTicket.message}
                </p>
                <div className="pt-2 text-[10px] text-[#949ba4]">
                  Dostęp mają: Autor oraz rola <span className="text-[#8590ff]">@{simulatedTicket.supportRole}</span>
                </div>
              </div>

              {/* Przycisk zamknięcia zgłoszenia */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => {
                    alert('🔒 Zgłoszenie zostało zamknięte! Kanał zostanie usunięty po upływie odliczenia.');
                    setSimulatedTicket(null);
                  }}
                  className="px-3 py-1.5 bg-[#DA373C] hover:bg-[#a12829] text-white font-bold text-xs rounded flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{settings.closeButtonText || '🔒 Zamknij Ticket'}</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSimulatedTicket(null)}
                className="px-4 py-2 bg-[#35373c] hover:bg-[#404249] text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Zamknij podgląd
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
