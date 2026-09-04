import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, AlertCircle, MessageSquare, Shield, Users, Coins, Palette, ArrowLeft, Loader2, Sparkles, Sliders } from 'lucide-react';
import { GuildConfig } from '../serverConfigManager';

interface GuildSettingsModalProps {
  guild: {
    id: string;
    name: string;
    icon: string | null;
  };
  onClose: () => void;
}

export function GuildSettingsModal({ guild, onClose }: GuildSettingsModalProps) {
  const [config, setConfig] = useState<GuildConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'welcome' | 'moderation' | 'economy'>('general');
  const [botChannels, setBotChannels] = useState<{ id: string; name: string; type: number }[]>([]);
  const [botRoles, setBotRoles] = useState<{ id: string; name: string; color: number }[]>([]);

  useEffect(() => {
    fetchConfig();
    fetchGuildDiscordData();
  }, [guild.id]);

  const fetchGuildDiscordData = async () => {
    try {
      const [chRes, roRes] = await Promise.all([
        fetch(`/api/bot/proxy/guilds/${guild.id}/channels`),
        fetch(`/api/bot/proxy/guilds/${guild.id}/roles`)
      ]);
      if (chRes.ok) {
        const chData = await chRes.json();
        if (chData.success && Array.isArray(chData.channels)) {
          setBotChannels(chData.channels);
        }
      }
      if (roRes.ok) {
        const roData = await roRes.json();
        if (roData.success && Array.isArray(roData.roles)) {
          setBotRoles(roData.roles);
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
      if (data.success && data.config) {
        setConfig(data.config);
      } else {
        setError(data.error || 'Nie udało się pobrać konfiguracji');
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
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setError(data.error || 'Nie udało się zapisać zmian');
      }
    } catch (err: any) {
      setError(err.message || 'Błąd wysyłania konfiguracji');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-[#2e2f38] border border-[#3f404d] rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-[#25262e] border-b border-[#383944] flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            {guild.icon ? (
              <img
                src={guild.icon}
                alt={guild.name}
                referrerPolicy="no-referrer"
                className="w-11 h-11 rounded-xl object-cover border border-[#5865F2]"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-[#353642] border border-[#5865F2] flex items-center justify-center text-white font-black text-sm">
                {guild.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-lg font-black text-white leading-tight">{guild.name}</h2>
              <p className="text-xs text-neutral-400 font-mono">ID: {guild.id} &bull; Serwery/{guild.id}.json</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-[#353642] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#383944] bg-[#292a33] px-4 overflow-x-auto gap-2 py-2">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'general'
                ? 'bg-[#5865F2] text-white shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-[#353642]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Ogólne</span>
          </button>
          <button
            onClick={() => setActiveTab('welcome')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'welcome'
                ? 'bg-[#5865F2] text-white shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-[#353642]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Powitania i Pożegnania</span>
          </button>
          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'moderation'
                ? 'bg-[#5865F2] text-white shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-[#353642]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Moderacja</span>
          </button>
          <button
            onClick={() => setActiveTab('economy')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'economy'
                ? 'bg-[#5865F2] text-white shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-[#353642]'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Ekonomia</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="py-16 text-center text-neutral-400 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#5865F2]" />
              <p className="text-sm font-medium">Odczytywanie pliku Serwery/{guild.id}.json...</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-red-300 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : config ? (
            <>
              {/* Tab: Ogólne */}
              {activeTab === 'general' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                        Prefix komend bota
                      </label>
                      <input
                        type="text"
                        value={config.prefix || '!'}
                        onChange={(e) => setConfig({ ...config, prefix: e.target.value })}
                        className="w-full bg-[#202128] border border-[#3f404d] focus:border-[#5865F2] rounded-xl px-4 py-2.5 text-white font-mono text-sm outline-none transition-colors"
                        placeholder="np. ! lub k!"
                      />
                      <p className="text-[11px] text-neutral-400 mt-1">Symbol poprzedzający komendy na Discordzie</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                        Język komunikatów
                      </label>
                      <select
                        value={config.language || 'pl'}
                        onChange={(e) => setConfig({ ...config, language: e.target.value })}
                        className="w-full bg-[#202128] border border-[#3f404d] focus:border-[#5865F2] rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-colors"
                      >
                        <option value="pl">Polski (PL)</option>
                        <option value="en">English (EN)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                        Kolor wbudowanych ramek (Embed Hex)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={config.embedColor || '#5865F2'}
                          onChange={(e) => setConfig({ ...config, embedColor: e.target.value })}
                          className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={config.embedColor || '#5865F2'}
                          onChange={(e) => setConfig({ ...config, embedColor: e.target.value })}
                          className="flex-1 bg-[#202128] border border-[#3f404d] rounded-xl px-4 py-2 text-white font-mono text-sm outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5 flex items-center justify-between">
                        <span>Automatyczna Rola (AutoRole)</span>
                        {botRoles.length > 0 && (
                          <span className="text-[10px] text-emerald-400 font-normal">Zsynchronizowano z bota</span>
                        )}
                      </label>
                      {botRoles.length > 0 ? (
                        <select
                          value={config.autoRole?.roleId || ''}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              autoRole: {
                                enabled: !!e.target.value,
                                roleId: e.target.value || null,
                              },
                            })
                          }
                          className="w-full bg-[#202128] border border-[#3f404d] focus:border-[#5865F2] rounded-xl px-4 py-2.5 text-white text-sm outline-none cursor-pointer"
                        >
                          <option value="">-- Brak automatycznej roli --</option>
                          {botRoles.map((role) => (
                            <option key={role.id} value={role.id}>
                              @{role.name} ({role.id})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={config.autoRole?.roleId || ''}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              autoRole: {
                                enabled: !!e.target.value,
                                roleId: e.target.value || null,
                              },
                            })
                          }
                          className="w-full bg-[#202128] border border-[#3f404d] focus:border-[#5865F2] rounded-xl px-4 py-2.5 text-white font-mono text-sm outline-none"
                          placeholder="np. 123456789012345678"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Powitania */}
              {activeTab === 'welcome' && (
                <div className="space-y-6">
                  {/* Sekcja Powitań */}
                  <div className="bg-[#23242c] p-4 rounded-xl border border-[#383944] space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-black text-sm text-white">Wiadomości Powitalne</h4>
                        <p className="text-xs text-neutral-400">Wysyłaj wiadomość, gdy nowy członek dołączy do serwera</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={config.welcome?.enabled || false}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            welcome: { ...config.welcome, enabled: e.target.checked },
                          })
                        }
                        className="w-5 h-5 accent-[#5865F2] cursor-pointer rounded"
                      />
                    </div>

                    {config.welcome?.enabled && (
                      <div className="space-y-3 pt-2 border-t border-[#31323d]">
                        <div>
                          <label className="block text-xs font-bold text-neutral-300 mb-1 flex items-center justify-between">
                            <span>Kanał Powitań</span>
                            {botChannels.length > 0 && (
                              <span className="text-[10px] text-emerald-400 font-normal">Zsynchronizowano z bota</span>
                            )}
                          </label>
                          {botChannels.length > 0 ? (
                            <select
                              value={config.welcome?.channelId || ''}
                              onChange={(e) =>
                                setConfig({
                                  ...config,
                                  welcome: { ...config.welcome, channelId: e.target.value || null },
                                })
                              }
                              className="w-full bg-[#1b1c22] border border-[#3f404d] rounded-lg px-3 py-2 text-white text-xs cursor-pointer"
                            >
                              <option value="">-- Wybierz kanał tekstowy --</option>
                              {botChannels.map((ch) => (
                                <option key={ch.id} value={ch.id}>
                                  #{ch.name} ({ch.id})
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={config.welcome?.channelId || ''}
                              onChange={(e) =>
                                setConfig({
                                  ...config,
                                  welcome: { ...config.welcome, channelId: e.target.value || null },
                                })
                              }
                              className="w-full bg-[#1b1c22] border border-[#3f404d] rounded-lg px-3 py-2 text-white font-mono text-xs"
                              placeholder="ID kanału tekstowego (np. 9876543210)"
                            />
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-neutral-300 mb-1">
                            Treść wiadomości (zmienne: {'{user}'}, {'{server}'})
                          </label>
                          <textarea
                            rows={3}
                            value={config.welcome?.message || ''}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                welcome: { ...config.welcome, message: e.target.value },
                              })
                            }
                            className="w-full bg-[#1b1c22] border border-[#3f404d] rounded-lg px-3 py-2 text-white text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sekcja Pożegnań */}
                  <div className="bg-[#23242c] p-4 rounded-xl border border-[#383944] space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-black text-sm text-white">Wiadomości Pożegnalne</h4>
                        <p className="text-xs text-neutral-400">Wysyłaj wiadomość, gdy ktoś opuści serwer</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={config.goodbye?.enabled || false}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            goodbye: { ...config.goodbye, enabled: e.target.checked },
                          })
                        }
                        className="w-5 h-5 accent-[#5865F2] cursor-pointer rounded"
                      />
                    </div>

                    {config.goodbye?.enabled && (
                      <div className="space-y-3 pt-2 border-t border-[#31323d]">
                        <div>
                          <label className="block text-xs font-bold text-neutral-300 mb-1 flex items-center justify-between">
                            <span>Kanał Pożegnań</span>
                            {botChannels.length > 0 && (
                              <span className="text-[10px] text-emerald-400 font-normal">Zsynchronizowano z bota</span>
                            )}
                          </label>
                          {botChannels.length > 0 ? (
                            <select
                              value={config.goodbye?.channelId || ''}
                              onChange={(e) =>
                                setConfig({
                                  ...config,
                                  goodbye: { ...config.goodbye, channelId: e.target.value || null },
                                })
                              }
                              className="w-full bg-[#1b1c22] border border-[#3f404d] rounded-lg px-3 py-2 text-white text-xs cursor-pointer"
                            >
                              <option value="">-- Wybierz kanał tekstowy --</option>
                              {botChannels.map((ch) => (
                                <option key={ch.id} value={ch.id}>
                                  #{ch.name} ({ch.id})
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={config.goodbye?.channelId || ''}
                              onChange={(e) =>
                                setConfig({
                                  ...config,
                                  goodbye: { ...config.goodbye, channelId: e.target.value || null },
                                })
                              }
                              className="w-full bg-[#1b1c22] border border-[#3f404d] rounded-lg px-3 py-2 text-white font-mono text-xs"
                              placeholder="ID kanału tekstowego"
                            />
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-neutral-300 mb-1">Treść wiadomości</label>
                          <textarea
                            rows={3}
                            value={config.goodbye?.message || ''}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                goodbye: { ...config.goodbye, message: e.target.value },
                              })
                            }
                            className="w-full bg-[#1b1c22] border border-[#3f404d] rounded-lg px-3 py-2 text-white text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab: Moderacja */}
              {activeTab === 'moderation' && (
                <div className="space-y-4">
                  <div className="bg-[#23242c] p-4 rounded-xl border border-[#383944] flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-sm text-white">System Anty-Link</h4>
                      <p className="text-xs text-neutral-400">Automatycznie usuwa nieautoryzowane linki wysyłane przez użytkowników</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.moderation?.antiLink || false}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          moderation: { ...config.moderation, antiLink: e.target.checked },
                        })
                      }
                      className="w-5 h-5 accent-[#5865F2] cursor-pointer rounded"
                    />
                  </div>

                  <div className="bg-[#23242c] p-4 rounded-xl border border-[#383944] flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-sm text-white">System Anty-Spam</h4>
                      <p className="text-xs text-neutral-400">Wykrywa zbyt szybkie wysyłanie wiadomości</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.moderation?.antiSpam || false}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          moderation: { ...config.moderation, antiSpam: e.target.checked },
                        })
                      }
                      className="w-5 h-5 accent-[#5865F2] cursor-pointer rounded"
                    />
                  </div>
                </div>
              )}

              {/* Tab: Ekonomia */}
              {activeTab === 'economy' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                        Nazwa waluty serwerowej
                      </label>
                      <input
                        type="text"
                        value={config.economy?.currencyName || 'Monety'}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            economy: { ...config.economy, currencyName: e.target.value },
                          })
                        }
                        className="w-full bg-[#202128] border border-[#3f404d] rounded-xl px-4 py-2.5 text-white text-sm outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                        Dzienna nagroda (!daily)
                      </label>
                      <input
                        type="number"
                        value={config.economy?.dailyAmount || 100}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            economy: { ...config.economy, dailyAmount: parseInt(e.target.value) || 0 },
                          })
                        }
                        className="w-full bg-[#202128] border border-[#3f404d] rounded-xl px-4 py-2.5 text-white font-mono text-sm outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer with Save Button */}
        <div className="p-4 bg-[#25262e] border-t border-[#383944] flex items-center justify-between">
          <div className="text-xs text-neutral-400">
            {saveSuccess && (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" /> Zapisano do Serwery/{guild.id}.json!
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-neutral-300 hover:text-white bg-[#353642] hover:bg-[#3d3e4d] rounded-xl transition-colors cursor-pointer"
            >
              Zamknij
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !config}
              className="px-5 py-2 text-xs font-black uppercase tracking-wider text-white bg-[#5865F2] hover:bg-[#4752C4] active:scale-95 rounded-xl shadow-lg shadow-indigo-950/40 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Zapisywanie...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Zapisz</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
