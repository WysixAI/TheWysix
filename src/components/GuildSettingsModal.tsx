import React, { useState, useEffect } from 'react';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  Send,
  Plus,
  Trash2,
  Palette,
  Eye,
  Code2,
  SlidersHorizontal,
  Layout,
  MousePointerClick,
  HelpCircle,
  Hash,
  RefreshCw
} from 'lucide-react';
import {
  GuildConfig,
  WelcomeConfig,
  WelcomeEmbedField,
  WelcomeButton,
  getDefaultWelcomeConfig
} from '../types/guildConfig';

interface GuildSettingsModalProps {
  guild: {
    id: string;
    name: string;
    icon: string | null;
  };
  onClose: () => void;
}

const DISCORD_COLOR_PALETTE = [
  { name: 'Blurple', hex: '#5865F2' },
  { name: 'Green', hex: '#57F287' },
  { name: 'Yellow', hex: '#FEE75C' },
  { name: 'Fuchsia', hex: '#EB459E' },
  { name: 'Red', hex: '#ED4245' },
  { name: 'Dark', hex: '#2B2D31' },
  { name: 'Gold', hex: '#E67E22' },
  { name: 'Cyan', hex: '#00B0F4' },
  { name: 'White', hex: '#FFFFFF' },
];

export function GuildSettingsModal({ guild, onClose }: GuildSettingsModalProps) {
  const [config, setConfig] = useState<GuildConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [botChannels, setBotChannels] = useState<{ id: string; name: string; type: number }[]>([]);
  const [activeTab, setActiveTab] = useState<'content' | 'embed' | 'buttons'>('content');
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  useEffect(() => {
    fetchConfig();
    fetchGuildDiscordData();
  }, [guild.id]);

  const fetchGuildDiscordData = async () => {
    try {
      const res = await fetch(`/api/bot/proxy/guilds/${guild.id}/details`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.channels)) {
          setBotChannels(data.channels);
        }
      }
    } catch {
      // ignore
    }
  };

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/guilds/${guild.id}?name=${encodeURIComponent(guild.name)}`);
      const data = await res.json();
      if (data && data.success && data.config) {
        const c: GuildConfig = data.config;
        if (!c.welcome) {
          c.welcome = getDefaultWelcomeConfig();
        }
        setConfig(c);
      } else {
        setError(data?.error || 'Nie udało się pobrać konfiguracji');
      }
    } catch (err: any) {
      setError(err.message || 'Błąd połączenia z API bota');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    try {
      setSaving(true);
      setError(null);
      setSaveSuccess(false);

      const res = await fetch(`/api/guilds/${guild.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (data && data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setError(data?.error || 'Nie udało się zapisać zmian');
      }
    } catch (err: any) {
      setError(err.message || 'Błąd wysyłania konfiguracji');
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!config) return;
    try {
      setSendingTest(true);
      setTestResult(null);

      const res = await fetch(`/api/bot/proxy/guilds/${guild.id}/test-welcome`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (data.success) {
        setTestResult({ success: true, message: data.message || 'Wysłano pomyślnie test na Discord!' });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Bot nie mógł wysłać wiadomości. Upewnij się, że bot ma uprawnienia na wybranym kanale.',
        });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: 'Błąd połączenia: ' + err.message });
    } finally {
      setSendingTest(false);
      setTimeout(() => setTestResult(null), 6000);
    }
  };

  const updateWelcome = (patch: Partial<WelcomeConfig>) => {
    if (!config) return;
    setConfig({
      ...config,
      welcome: {
        ...config.welcome,
        ...patch,
      },
    });
  };

  const updateEmbed = (patch: Partial<WelcomeConfig['embed']>) => {
    if (!config) return;
    setConfig({
      ...config,
      welcome: {
        ...config.welcome,
        embed: {
          ...config.welcome.embed,
          ...patch,
        },
      },
    });
  };

  const addField = () => {
    if (!config) return;
    const currentFields = config.welcome.embed.fields || [];
    const newField: WelcomeEmbedField = {
      id: `f-${Date.now()}`,
      name: `Tytuł pola ${currentFields.length + 1}`,
      value: 'Wartość pola lub krótki opis',
      inline: true,
    };
    updateEmbed({ fields: [...currentFields, newField] });
  };

  const removeField = (id: string) => {
    if (!config) return;
    const currentFields = config.welcome.embed.fields || [];
    updateEmbed({ fields: currentFields.filter((f) => f.id !== id) });
  };

  const updateField = (id: string, patch: Partial<WelcomeEmbedField>) => {
    if (!config) return;
    const currentFields = config.welcome.embed.fields || [];
    updateEmbed({
      fields: currentFields.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    });
  };

  const addButton = () => {
    if (!config) return;
    const currentButtons = config.welcome.buttons || [];
    if (currentButtons.length >= 5) return;
    const newBtn: WelcomeButton = {
      id: `b-${Date.now()}`,
      label: `Przycisk ${currentButtons.length + 1}`,
      style: 'PRIMARY',
      customId: `btn_${Date.now()}`,
      emoji: '👉',
    };
    updateWelcome({ buttons: [...currentButtons, newBtn] });
  };

  const removeButton = (id: string) => {
    if (!config) return;
    const currentButtons = config.welcome.buttons || [];
    updateWelcome({ buttons: currentButtons.filter((b) => b.id !== id) });
  };

  const updateButton = (id: string, patch: Partial<WelcomeButton>) => {
    if (!config) return;
    const currentButtons = config.welcome.buttons || [];
    updateWelcome({
      buttons: currentButtons.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    });
  };

  const insertVariable = (variableKey: string) => {
    if (!config) return;
    if (activeTab === 'embed') {
      updateEmbed({
        description: (config.welcome.embed.description || '') + ` ${variableKey} `,
      });
    } else {
      updateWelcome({
        message: (config.welcome.message || '') + ` ${variableKey} `,
      });
    }
    setCopiedVar(variableKey);
    setTimeout(() => setCopiedVar(null), 1500);
  };

  const copyJsonPayload = () => {
    if (!config) return;
    const payload = {
      content: config.welcome.message,
      embeds: config.welcome.useEmbed ? [config.welcome.embed] : [],
      components: config.welcome.buttons?.length
        ? [
            {
              type: 1,
              components: config.welcome.buttons.map((b) => ({
                type: 2,
                label: b.label,
                style: b.style === 'LINK' ? 5 : b.style === 'SUCCESS' ? 3 : b.style === 'DANGER' ? 4 : b.style === 'SECONDARY' ? 2 : 1,
                url: b.style === 'LINK' ? b.url : undefined,
                custom_id: b.style !== 'LINK' ? b.customId : undefined,
              })),
            },
          ]
        : [],
    };
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  // Replace preview variables
  const formatPreviewText = (text?: string) => {
    if (!text) return '';
    return text
      .replace(/{user\.mention}/g, '@NowyUżytkownik')
      .replace(/{user\.tag}/g, 'NowyUżytkownik#0001')
      .replace(/{user\.name}/g, 'NowyUżytkownik')
      .replace(/{user\.id}/g, '123456789012345678')
      .replace(/{user}/g, '@NowyUżytkownik')
      .replace(/{server\.name}/g, guild.name)
      .replace(/{server}/g, guild.name)
      .replace(/{memberCount}/g, '1,420');
  };

  const welcome = config?.welcome || getDefaultWelcomeConfig();

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#1e1f22] border border-[#35373c] rounded-2xl w-[98vw] max-w-[1650px] h-[95vh] max-h-[96vh] shadow-2xl flex flex-col overflow-hidden text-neutral-200">
        {/* ================= GÓRNY PASEK NARZĘDZIOWY (TOP BAR) ================= */}
        <div className="px-5 py-3.5 bg-[#25262b] border-b border-[#313338] flex flex-wrap items-center justify-between gap-4 shrink-0">
          {/* Dane serwera */}
          <div className="flex items-center gap-3.5 min-w-0">
            {guild.icon ? (
              <img
                src={guild.icon}
                alt={guild.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-xl object-cover border border-[#5865F2] shadow-sm shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-[#353642] border border-[#5865F2] flex items-center justify-center text-white font-black text-sm shrink-0">
                {guild.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white truncate leading-tight">{guild.name}</h2>
                <span className="px-2 py-0.5 rounded-md bg-[#5865F2]/20 text-[#5865F2] border border-[#5865F2]/30 text-[11px] font-bold tracking-wide flex items-center gap-1 shrink-0">
                  <Sparkles className="w-3 h-3" />
                  <span>Kreator Powitań</span>
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-mono truncate">
                Edytor w stylu message.style &bull; ID: {guild.id}
              </p>
            </div>
          </div>

          {/* Szybkie akcje: Wybór kanału, przełącznik aktywności, zapis */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Wybór kanału Discord */}
            <div className="flex items-center gap-1.5 bg-[#1a1b1e] px-3 py-1.5 rounded-xl border border-[#35373c]">
              <Hash className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span className="text-xs text-neutral-400 font-medium whitespace-nowrap">Kanał:</span>
              <select
                value={welcome.channelId || ''}
                onChange={(e) => updateWelcome({ channelId: e.target.value || null })}
                className="bg-transparent text-xs font-semibold text-white outline-none cursor-pointer pr-2"
              >
                <option value="" className="bg-[#25262b] text-neutral-400">
                  -- Wybierz kanał bota --
                </option>
                {botChannels.length > 0 ? (
                  botChannels.map((ch) => (
                    <option key={ch.id} value={ch.id} className="bg-[#25262b] text-white">
                      #{ch.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="default_general" className="bg-[#25262b] text-white">
                      #general / #powitania
                    </option>
                    <option value="welcome_channel" className="bg-[#25262b] text-white">
                      #welcome
                    </option>
                  </>
                )}
              </select>
            </div>

            {/* Przełącznik Włącz / Wyłącz */}
            <button
              onClick={() => updateWelcome({ enabled: !welcome.enabled })}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 border shadow-sm ${
                welcome.enabled
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:bg-neutral-700 hover:text-white'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${welcome.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-500'}`}
              />
              <span>{welcome.enabled ? 'Powitania WŁĄCZONE' : 'Powitania WYŁĄCZONE'}</span>
            </button>

            {/* Wyślij test na Discord */}
            <button
              onClick={handleSendTest}
              disabled={sendingTest || !welcome.channelId}
              title={!welcome.channelId ? 'Wybierz najpierw kanał' : 'Wyślij wiadomość testową na wybrany kanał'}
              className="px-3.5 py-1.5 rounded-xl bg-[#35373c] hover:bg-[#43454b] active:scale-95 text-xs font-bold text-neutral-200 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {sendingTest ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 text-indigo-400" />}
              <span>Wyślij test</span>
            </button>

            {/* Zapisz konfigurację */}
            <button
              onClick={handleSave}
              disabled={saving}
              className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95 ${
                saveSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#5865F2] hover:bg-[#4752C4] text-white'
              }`}
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : saveSuccess ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>{saveSuccess ? 'Zapisano!' : 'Zapisz'}</span>
            </button>

            {/* Zamknij */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-[#35373c] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Powiadomienie o wyniku testu */}
        {testResult && (
          <div
            className={`px-5 py-2 text-xs font-semibold flex items-center justify-between border-b ${
              testResult.success
                ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-200 border-amber-500/30'
            }`}
          >
            <div className="flex items-center gap-2">
              {testResult.success ? <Check className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />}
              <span>{testResult.message}</span>
            </div>
            <button onClick={() => setTestResult(null)} className="text-neutral-400 hover:text-white text-xs underline cursor-pointer">
              Ukryj
            </button>
          </div>
        )}

        {/* ================= GŁÓWNA PRZESTRZEŃ ROBOCZA (SPLIT VIEW) ================= */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-neutral-400">
            <Loader2 className="w-10 h-10 animate-spin text-[#5865F2]" />
            <p className="text-sm font-medium">Ładowanie edytora powitań dla {guild.name}...</p>
          </div>
        ) : error ? (
          <div className="p-8 flex-1 flex flex-col items-center justify-center text-center">
            <div className="bg-red-500/10 border border-red-500/30 p-5 rounded-2xl max-w-lg text-red-300 text-sm space-y-3">
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
              <p className="font-bold">{error}</p>
              <button
                onClick={fetchConfig}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
              >
                Spróbuj ponownie
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
            {/* ================= LEWA KOLUMNA: INSPEKTOR & KREATOR (54%) ================= */}
            <div className="w-full lg:w-[54%] border-r border-[#313338] flex flex-col bg-[#232428] min-h-0">
              {/* Zakładki edytora */}
              <div className="flex items-center gap-1.5 px-4 pt-3 pb-2 border-b border-[#313338] bg-[#1e1f22] overflow-x-auto shrink-0">
                <button
                  onClick={() => setActiveTab('content')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === 'content'
                      ? 'bg-[#5865F2] text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white hover:bg-[#2b2d31]'
                  }`}
                >
                  <Layout className="w-3.5 h-3.5" />
                  <span>1. Treść wiadomości</span>
                </button>

                <button
                  onClick={() => setActiveTab('embed')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === 'embed'
                      ? 'bg-[#5865F2] text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white hover:bg-[#2b2d31]'
                  }`}
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>2. Embed Builder</span>
                  {welcome.useEmbed && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                </button>

                <button
                  onClick={() => setActiveTab('buttons')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === 'buttons'
                      ? 'bg-[#5865F2] text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white hover:bg-[#2b2d31]'
                  }`}
                >
                  <MousePointerClick className="w-3.5 h-3.5" />
                  <span>3. Przyciski ({welcome.buttons?.length || 0}/5)</span>
                </button>
              </div>

              {/* Pasek zmiennych (Pill Inserter) */}
              <div className="px-5 py-2.5 bg-[#1b1c1e] border-b border-[#313338] flex items-center gap-2 overflow-x-auto text-[11px] shrink-0">
                <span className="text-neutral-400 font-bold uppercase tracking-wider text-[10px] whitespace-nowrap">
                  Wstaw zmienną:
                </span>
                {[
                  { key: '{user}', label: '@Użytkownik' },
                  { key: '{user.name}', label: 'Nick' },
                  { key: '{server.name}', label: 'Nazwa Serwera' },
                  { key: '{memberCount}', label: 'Liczba członków' },
                  { key: '{user.id}', label: 'ID Gracza' },
                ].map((v) => (
                  <button
                    key={v.key}
                    onClick={() => insertVariable(v.key)}
                    className="px-2 py-0.5 rounded-md bg-[#2b2d31] hover:bg-[#5865F2] text-neutral-300 hover:text-white font-mono text-[11px] cursor-pointer transition-all whitespace-nowrap border border-[#3a3b44] flex items-center gap-1"
                    title={`Kliknij, aby wstawić ${v.key}`}
                  >
                    <span>{v.label}</span>
                    <span className="text-[10px] opacity-60">({v.key})</span>
                  </button>
                ))}
                {copiedVar && (
                  <span className="text-emerald-400 font-bold text-[10px] animate-pulse whitespace-nowrap">
                    Wstawiono {copiedVar}!
                  </span>
                )}
              </div>

              {/* Zawartość zakładek */}
              <div className="p-5 overflow-y-auto flex-1 space-y-6">
                {/* 1. TREŚĆ WIADOMOŚCI */}
                {activeTab === 'content' && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                          Tekst powitalny (nad kartą Embed)
                        </label>
                        <span className="text-[11px] text-neutral-500 font-mono">
                          {welcome.message?.length || 0} znaków
                        </span>
                      </div>
                      <textarea
                        value={welcome.message}
                        onChange={(e) => updateWelcome({ message: e.target.value })}
                        rows={4}
                        placeholder="Wpisz treść wiadomości powitalnej..."
                        className="w-full px-3.5 py-2.5 bg-[#1e1f22] border border-[#35373c] focus:border-[#5865F2] rounded-xl text-xs text-white placeholder-neutral-500 outline-none transition-all resize-y font-sans leading-relaxed"
                      />
                      <p className="mt-1.5 text-[11px] text-neutral-400 leading-normal">
                        Ten tekst pojawi się w Discordzie jako zwykła wiadomość bezpośrednio nad kartą Embed (jeśli włączona).
                        Możesz używać formatowania Discord: <code>**pogrubienie**</code>, <code>*kursywa*</code>, emotek serwera oraz zmiennych.
                      </p>
                    </div>

                    {/* Kanał docelowy */}
                    <div className="p-4 bg-[#1e1f22] border border-[#35373c] rounded-xl space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                        <Hash className="w-4 h-4 text-[#5865F2]" />
                        <span>Kanał do wysyłania powitań</span>
                      </h4>
                      <p className="text-[11px] text-neutral-400">
                        Wybierz kanał tekstowy z listy Twojego serwera lub podaj dokładne ID kanału Discord:
                      </p>
                      <div className="flex gap-2">
                        <select
                          value={welcome.channelId || ''}
                          onChange={(e) => updateWelcome({ channelId: e.target.value || null })}
                          className="flex-1 px-3 py-2 bg-[#2b2d31] border border-[#3a3b44] rounded-xl text-xs text-white outline-none cursor-pointer"
                        >
                          <option value="">-- Wybierz z wykrytych kanałów --</option>
                          {botChannels.map((ch) => (
                            <option key={ch.id} value={ch.id}>
                              #{ch.name} (ID: {ch.id})
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={welcome.channelId || ''}
                          onChange={(e) => updateWelcome({ channelId: e.target.value || null })}
                          placeholder="Lub wpisz ID kanału..."
                          className="w-48 px-3 py-2 bg-[#2b2d31] border border-[#3a3b44] rounded-xl text-xs text-white placeholder-neutral-500 outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. EMBED BUILDER */}
                {activeTab === 'embed' && (
                  <div className="space-y-6">
                    {/* Przełącznik Embed */}
                    <div className="flex items-center justify-between p-3.5 bg-[#1e1f22] border border-[#35373c] rounded-xl">
                      <div>
                        <h4 className="text-xs font-bold text-white">Używaj karty Embed</h4>
                        <p className="text-[11px] text-neutral-400">
                          Kolorowa, zaawansowana karta wiadomości z autorem, tytułem, polami i miniaturkami
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={welcome.useEmbed}
                          onChange={(e) => updateWelcome({ useEmbed: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-[#35373c] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5865F2]" />
                      </label>
                    </div>

                    {welcome.useEmbed && (
                      <>
                        {/* Kolor Embedu */}
                        <div className="p-4 bg-[#1e1f22] border border-[#35373c] rounded-xl space-y-3">
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                            Kolor paska bocznego Embedu
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={welcome.embed.color || '#5865F2'}
                              onChange={(e) => updateEmbed({ color: e.target.value })}
                              className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                            />
                            <input
                              type="text"
                              value={welcome.embed.color || '#5865F2'}
                              onChange={(e) => updateEmbed({ color: e.target.value })}
                              className="w-28 px-3 py-2 bg-[#2b2d31] border border-[#3a3b44] rounded-xl text-xs text-white font-mono outline-none"
                            />
                            {/* Paleta Discord */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {DISCORD_COLOR_PALETTE.map((c) => (
                                <button
                                  key={c.name}
                                  type="button"
                                  onClick={() => updateEmbed({ color: c.hex })}
                                  style={{ backgroundColor: c.hex }}
                                  title={c.name}
                                  className={`w-6 h-6 rounded-full cursor-pointer transition-transform hover:scale-110 ${
                                    welcome.embed.color?.toLowerCase() === c.hex.toLowerCase()
                                      ? 'ring-2 ring-white scale-110'
                                      : ''
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Autor */}
                        <div className="p-4 bg-[#1e1f22] border border-[#35373c] rounded-xl space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                            Sekcja Autora (Author)
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] text-neutral-400 mb-1">Nazwa autora</label>
                              <input
                                type="text"
                                value={welcome.embed.authorName || ''}
                                onChange={(e) => updateEmbed({ authorName: e.target.value })}
                                placeholder="np. KitekBot Official"
                                className="w-full px-3 py-2 bg-[#2b2d31] border border-[#3a3b44] rounded-xl text-xs text-white placeholder-neutral-500 outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-neutral-400 mb-1">Ikona autora (URL grafiki)</label>
                              <input
                                type="text"
                                value={welcome.embed.authorIcon || ''}
                                onChange={(e) => updateEmbed({ authorIcon: e.target.value })}
                                placeholder="https://..."
                                className="w-full px-3 py-2 bg-[#2b2d31] border border-[#3a3b44] rounded-xl text-xs text-white placeholder-neutral-500 outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Tytuł & Opis */}
                        <div className="p-4 bg-[#1e1f22] border border-[#35373c] rounded-xl space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                            Tytuł i Opis (Title & Description)
                          </h4>
                          <div>
                            <label className="block text-[11px] text-neutral-400 mb-1">Tytuł Embedu</label>
                            <input
                              type="text"
                              value={welcome.embed.title || ''}
                              onChange={(e) => updateEmbed({ title: e.target.value })}
                              placeholder="np. 👋 Witaj na serwerze!"
                              className="w-full px-3 py-2 bg-[#2b2d31] border border-[#3a3b44] rounded-xl text-xs text-white placeholder-neutral-500 outline-none font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-neutral-400 mb-1">Link w tytule (opcjonalnie)</label>
                            <input
                              type="text"
                              value={welcome.embed.titleUrl || ''}
                              onChange={(e) => updateEmbed({ titleUrl: e.target.value })}
                              placeholder="https://twojastrona.pl"
                              className="w-full px-3 py-2 bg-[#2b2d31] border border-[#3a3b44] rounded-xl text-xs text-white placeholder-neutral-500 outline-none font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-neutral-400 mb-1">
                              Główny Opis (Description - markdown)
                            </label>
                            <textarea
                              value={welcome.embed.description || ''}
                              onChange={(e) => updateEmbed({ description: e.target.value })}
                              rows={4}
                              placeholder="Wpisz treść opisu embedu..."
                              className="w-full px-3.5 py-2.5 bg-[#2b2d31] border border-[#3a3b44] rounded-xl text-xs text-white placeholder-neutral-500 outline-none font-sans leading-relaxed resize-y"
                            />
                          </div>
                        </div>

                        {/* Pola (Fields) */}
                        <div className="p-4 bg-[#1e1f22] border border-[#35373c] rounded-xl space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                              Dodatkowe Pola (Fields - {welcome.embed.fields?.length || 0})
                            </h4>
                            <button
                              type="button"
                              onClick={addField}
                              className="px-3 py-1 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Dodaj pole</span>
                            </button>
                          </div>

                          {welcome.embed.fields && welcome.embed.fields.length > 0 ? (
                            <div className="space-y-3">
                              {welcome.embed.fields.map((f, idx) => (
                                <div
                                  key={f.id}
                                  className="p-3 bg-[#2b2d31] border border-[#3a3b44] rounded-xl space-y-2 relative"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-neutral-400">Pole #{idx + 1}</span>
                                    <div className="flex items-center gap-3">
                                      <label className="flex items-center gap-1.5 text-[11px] text-neutral-300 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={f.inline || false}
                                          onChange={(e) => updateField(f.id, { inline: e.target.checked })}
                                          className="rounded text-[#5865F2] focus:ring-0"
                                        />
                                        <span>Inline (w jednej linii)</span>
                                      </label>
                                      <button
                                        type="button"
                                        onClick={() => removeField(f.id)}
                                        className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                                        title="Usuń to pole"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <input
                                      type="text"
                                      value={f.name}
                                      onChange={(e) => updateField(f.id, { name: e.target.value })}
                                      placeholder="Tytuł pola..."
                                      className="px-2.5 py-1.5 bg-[#1e1f22] border border-[#35373c] rounded-lg text-xs text-white outline-none font-semibold"
                                    />
                                    <input
                                      type="text"
                                      value={f.value}
                                      onChange={(e) => updateField(f.id, { value: e.target.value })}
                                      placeholder="Wartość pola..."
                                      className="px-2.5 py-1.5 bg-[#1e1f22] border border-[#35373c] rounded-lg text-xs text-white outline-none"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-neutral-500 italic py-2">
                              Brak pól. Kliknij &quot;Dodaj pole&quot;, aby podzielić treść na sekcje.
                            </p>
                          )}
                        </div>

                        {/* Grafiki (Images) */}
                        <div className="p-4 bg-[#1e1f22] border border-[#35373c] rounded-xl space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                            Grafiki Embedu (Images)
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-[11px] text-neutral-400 mb-1">
                                Miniaturka (Thumbnail URL - mała po prawej)
                              </label>
                              <input
                                type="text"
                                value={welcome.embed.thumbnailUrl || ''}
                                onChange={(e) => updateEmbed({ thumbnailUrl: e.target.value })}
                                placeholder="https://..."
                                className="w-full px-3 py-2 bg-[#2b2d31] border border-[#3a3b44] rounded-xl text-xs text-white placeholder-neutral-500 outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-neutral-400 mb-1">
                                Baner / Główny obraz (Image URL - duża grafika na dole)
                              </label>
                              <input
                                type="text"
                                value={welcome.embed.imageUrl || ''}
                                onChange={(e) => updateEmbed({ imageUrl: e.target.value })}
                                placeholder="https://..."
                                className="w-full px-3 py-2 bg-[#2b2d31] border border-[#3a3b44] rounded-xl text-xs text-white placeholder-neutral-500 outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Stopka (Footer) */}
                        <div className="p-4 bg-[#1e1f22] border border-[#35373c] rounded-xl space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                            Stopka (Footer & Timestamp)
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] text-neutral-400 mb-1">Tekst stopki</label>
                              <input
                                type="text"
                                value={welcome.embed.footerText || ''}
                                onChange={(e) => updateEmbed({ footerText: e.target.value })}
                                placeholder="np. KitekBot System"
                                className="w-full px-3 py-2 bg-[#2b2d31] border border-[#3a3b44] rounded-xl text-xs text-white placeholder-neutral-500 outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-neutral-400 mb-1">Ikona stopki (URL)</label>
                              <input
                                type="text"
                                value={welcome.embed.footerIcon || ''}
                                onChange={(e) => updateEmbed({ footerIcon: e.target.value })}
                                placeholder="https://..."
                                className="w-full px-3 py-2 bg-[#2b2d31] border border-[#3a3b44] rounded-xl text-xs text-white placeholder-neutral-500 outline-none"
                              />
                            </div>
                          </div>
                          <label className="flex items-center gap-2 pt-1 text-xs text-neutral-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={welcome.embed.includeTimestamp || false}
                              onChange={(e) => updateEmbed({ includeTimestamp: e.target.checked })}
                              className="rounded text-[#5865F2] focus:ring-0"
                            />
                            <span>Pokaż aktualną datę i godzinę (Timestamp)</span>
                          </label>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* 3. PRZYCISKI (COMPONENTS V2) */}
                {activeTab === 'buttons' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                          Przyciski Discord (Action Row)
                        </h4>
                        <p className="text-[11px] text-neutral-400">
                          Dodaj klikalne przyciski pod wiadomością powitalną (maksymalnie 5 w wierszu)
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={addButton}
                        disabled={(welcome.buttons?.length || 0) >= 5}
                        className="px-3 py-1.5 bg-[#5865F2] hover:bg-[#4752C4] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Dodaj przycisk</span>
                      </button>
                    </div>

                    {welcome.buttons && welcome.buttons.length > 0 ? (
                      <div className="space-y-3">
                        {welcome.buttons.map((btn, idx) => (
                          <div
                            key={btn.id}
                            className="p-4 bg-[#1e1f22] border border-[#35373c] rounded-xl space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-neutral-300 flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-[#5865F2] text-white flex items-center justify-center text-[10px]">
                                  {idx + 1}
                                </span>
                                <span>Przycisk: {btn.label || 'Bez etykiety'}</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => removeButton(btn.id)}
                                className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[11px] text-neutral-400 mb-1">Etykieta przycisku</label>
                                <input
                                  type="text"
                                  value={btn.label}
                                  onChange={(e) => updateButton(btn.id, { label: e.target.value })}
                                  placeholder="np. Odwiedź stronę"
                                  className="w-full px-3 py-2 bg-[#2b2d31] border border-[#3a3b44] rounded-xl text-xs text-white outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] text-neutral-400 mb-1">Emoji (opcjonalnie)</label>
                                <input
                                  type="text"
                                  value={btn.emoji || ''}
                                  onChange={(e) => updateButton(btn.id, { emoji: e.target.value })}
                                  placeholder="🌐, 🎮, ✅"
                                  className="w-full px-3 py-2 bg-[#2b2d31] border border-[#3a3b44] rounded-xl text-xs text-white outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] text-neutral-400 mb-1">Styl przycisku</label>
                                <select
                                  value={btn.style}
                                  onChange={(e) => updateButton(btn.id, { style: e.target.value as any })}
                                  className="w-full px-3 py-2 bg-[#2b2d31] border border-[#3a3b44] rounded-xl text-xs text-white outline-none cursor-pointer"
                                >
                                  <option value="PRIMARY">Blurple (Primary)</option>
                                  <option value="SECONDARY">Szary (Secondary)</option>
                                  <option value="SUCCESS">Zielony (Success)</option>
                                  <option value="DANGER">Czerwony (Danger)</option>
                                  <option value="LINK">Link URL (Odnośnik)</option>
                                </select>
                              </div>
                            </div>

                            {btn.style === 'LINK' ? (
                              <div>
                                <label className="block text-[11px] text-neutral-400 mb-1">Adres URL odnośnika</label>
                                <input
                                  type="text"
                                  value={btn.url || ''}
                                  onChange={(e) => updateButton(btn.id, { url: e.target.value })}
                                  placeholder="https://example.com"
                                  className="w-full px-3 py-2 bg-[#2b2d31] border border-[#3a3b44] rounded-xl text-xs text-white outline-none font-mono"
                                />
                              </div>
                            ) : (
                              <div>
                                <label className="block text-[11px] text-neutral-400 mb-1">
                                  Custom ID (identyfikator interakcji bota)
                                </label>
                                <input
                                  type="text"
                                  value={btn.customId || ''}
                                  onChange={(e) => updateButton(btn.id, { customId: e.target.value })}
                                  placeholder="np. verify_btn"
                                  className="w-full px-3 py-2 bg-[#2b2d31] border border-[#3a3b44] rounded-xl text-xs text-white outline-none font-mono"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-[#1e1f22] border border-[#35373c] rounded-xl text-neutral-400 space-y-2">
                        <MousePointerClick className="w-8 h-8 text-neutral-500 mx-auto" />
                        <p className="text-xs font-semibold">Brak przycisków akcji</p>
                        <p className="text-[11px] text-neutral-500">
                          Kliknij &quot;Dodaj przycisk&quot;, aby utworzyć przycisk z linkiem lub akcją bota.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ================= PRAWA KOLUMNA: REAL DISCORD LIVE PREVIEW (46%) ================= */}
            <div className="w-full lg:w-[46%] flex flex-col bg-[#313338] min-h-0">
              {/* Belka kanału Discord */}
              <div className="px-5 py-3 bg-[#2b2d31] border-b border-[#1e1f22] flex items-center justify-between shrink-0 shadow-sm">
                <div className="flex items-center gap-2 text-white text-xs font-bold">
                  <Hash className="w-4 h-4 text-neutral-400" />
                  <span>
                    {botChannels.find((c) => c.id === welcome.channelId)?.name || 'powitania'}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-normal px-2 py-0.5 rounded bg-[#1e1f22]">
                    Podgląd na żywo Discord
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyJsonPayload}
                    className="px-2.5 py-1 bg-[#1e1f22] hover:bg-[#35373c] text-[11px] font-bold text-neutral-300 rounded-lg flex items-center gap-1 cursor-pointer transition-all border border-[#3a3b44]"
                    title="Kopiuj surowy Discord JSON Payload"
                  >
                    {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Code2 className="w-3.5 h-3.5" />}
                    <span>{copiedJson ? 'Skopiowano JSON!' : 'Kopiuj JSON'}</span>
                  </button>
                </div>
              </div>

              {/* Obszar podglądu wiadomości Discord */}
              <div className="p-6 overflow-y-auto flex-1 flex flex-col justify-start">
                <div className="max-w-2xl w-full mx-auto flex gap-3.5">
                  {/* Avatar bota */}
                  <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center text-white font-black text-xs shrink-0 shadow-md">
                    🐾
                  </div>

                  {/* Ciało wiadomości Discord */}
                  <div className="flex-1 space-y-2 min-w-0">
                    {/* Header wiadomości */}
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-sm text-white hover:underline cursor-pointer">
                        KitekBot
                      </span>
                      <span className="bg-[#5865F2] text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded tracking-wider">
                        BOT ✓
                      </span>
                      <span className="text-[11px] text-neutral-400">Dzisiaj o 12:45</span>
                    </div>

                    {/* Treść zwykłego tekstu */}
                    {welcome.message && (
                      <div className="text-sm text-neutral-200 leading-relaxed break-words whitespace-pre-wrap">
                        {formatPreviewText(welcome.message)}
                      </div>
                    )}

                    {/* Karta Embed Discord */}
                    {welcome.useEmbed && (
                      <div
                        className="rounded-r-lg p-4 bg-[#2b2d31] border border-[#1e1f22] max-w-xl space-y-3 relative overflow-hidden shadow-lg"
                        style={{
                          borderLeftWidth: '4px',
                          borderLeftColor: welcome.embed.color || '#5865F2',
                        }}
                      >
                        {/* Miniaturka w prawym górnym rogu */}
                        {welcome.embed.thumbnailUrl && (
                          <img
                            src={welcome.embed.thumbnailUrl}
                            alt="thumbnail"
                            referrerPolicy="no-referrer"
                            className="w-16 h-16 rounded-lg object-cover absolute top-4 right-4 border border-[#1e1f22]"
                          />
                        )}

                        {/* Autor */}
                        {welcome.embed.authorName && (
                          <div className="flex items-center gap-2 text-xs font-bold text-neutral-200">
                            {welcome.embed.authorIcon && (
                              <img
                                src={welcome.embed.authorIcon}
                                alt="author"
                                referrerPolicy="no-referrer"
                                className="w-5 h-5 rounded-full object-cover"
                              />
                            )}
                            <span className={welcome.embed.authorUrl ? 'hover:underline text-white cursor-pointer' : ''}>
                              {formatPreviewText(welcome.embed.authorName)}
                            </span>
                          </div>
                        )}

                        {/* Tytuł */}
                        {welcome.embed.title && (
                          <h3 className="text-base font-black text-white leading-snug">
                            {welcome.embed.titleUrl ? (
                              <a
                                href={welcome.embed.titleUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#00B0F4] hover:underline"
                              >
                                {formatPreviewText(welcome.embed.title)}
                              </a>
                            ) : (
                              formatPreviewText(welcome.embed.title)
                            )}
                          </h3>
                        )}

                        {/* Opis */}
                        {welcome.embed.description && (
                          <div className="text-xs text-neutral-300 leading-relaxed whitespace-pre-wrap">
                            {formatPreviewText(welcome.embed.description)}
                          </div>
                        )}

                        {/* Pola (Fields) */}
                        {welcome.embed.fields && welcome.embed.fields.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            {welcome.embed.fields.map((f) => (
                              <div
                                key={f.id}
                                className={f.inline ? 'col-span-1' : 'col-span-1 sm:col-span-2'}
                              >
                                <div className="text-xs font-bold text-neutral-200">{formatPreviewText(f.name)}</div>
                                <div className="text-xs text-neutral-300 mt-0.5 leading-relaxed">
                                  {formatPreviewText(f.value)}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Duży baner graficzny */}
                        {welcome.embed.imageUrl && (
                          <div className="pt-2">
                            <img
                              src={welcome.embed.imageUrl}
                              alt="embed banner"
                              referrerPolicy="no-referrer"
                              className="w-full max-h-72 rounded-lg object-cover border border-[#1e1f22]"
                            />
                          </div>
                        )}

                        {/* Stopka */}
                        {(welcome.embed.footerText || welcome.embed.includeTimestamp) && (
                          <div className="pt-2 border-t border-[#35373c] flex items-center gap-2 text-[11px] text-neutral-400">
                            {welcome.embed.footerIcon && (
                              <img
                                src={welcome.embed.footerIcon}
                                alt="footer"
                                referrerPolicy="no-referrer"
                                className="w-4 h-4 rounded-full object-cover"
                              />
                            )}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {welcome.embed.footerText && (
                                <span>{formatPreviewText(welcome.embed.footerText)}</span>
                              )}
                              {welcome.embed.footerText && welcome.embed.includeTimestamp && <span>&bull;</span>}
                              {welcome.embed.includeTimestamp && <span>Dzisiaj o 12:45</span>}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Przyciski Action Row */}
                    {welcome.buttons && welcome.buttons.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-2">
                        {welcome.buttons.map((btn) => {
                          const getStyleClasses = () => {
                            switch (btn.style) {
                              case 'SUCCESS':
                                return 'bg-[#248046] hover:bg-[#1a6334] text-white';
                              case 'DANGER':
                                return 'bg-[#da373c] hover:bg-[#a1282c] text-white';
                              case 'SECONDARY':
                                return 'bg-[#4e5058] hover:bg-[#6d6f78] text-white';
                              case 'LINK':
                                return 'bg-[#4e5058] hover:bg-[#6d6f78] text-white';
                              case 'PRIMARY':
                              default:
                                return 'bg-[#5865F2] hover:bg-[#4752C4] text-white';
                            }
                          };

                          return (
                            <button
                              key={btn.id}
                              type="button"
                              className={`px-4 py-2 rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${getStyleClasses()}`}
                            >
                              {btn.emoji && <span>{btn.emoji}</span>}
                              <span>{btn.label || 'Przycisk'}</span>
                              {btn.style === 'LINK' && <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
