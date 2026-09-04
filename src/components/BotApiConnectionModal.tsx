import { useState, useEffect } from 'react';
import { Radio, Wifi, WifiOff, CheckCircle2, AlertCircle, RefreshCw, Loader2, Key, Globe, Shield, Activity, Cpu, Server, X } from 'lucide-react';

interface BotConnectionData {
  botApiUrl: string;
  botApiSecretSet: boolean;
  botStatus: 'online' | 'offline' | 'unconfigured';
  ping: number | null;
  botTag: string | null;
  botId: string | null;
  botAvatar: string | null;
  uptimeSeconds: number | null;
  guildsCount: number | null;
  version: string | null;
  memoryMb: number | null;
  lastChecked: number;
}

interface BotApiConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected?: () => void;
}

export function BotApiConnectionModal({ isOpen, onClose, onConnected }: BotApiConnectionModalProps) {
  const [apiUrl, setApiUrl] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connectionData, setConnectionData] = useState<BotConnectionData | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchConnectionStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/bot/connection?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setConnectionData(data);
        if (data.botApiUrl && !apiUrl) {
          setApiUrl(data.botApiUrl);
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchConnectionStatus();
      setStatusMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveAndTest = async () => {
    try {
      setTesting(true);
      setStatusMessage(null);

      // 1. Zapisz konfigurację w Dashboardzie
      const saveRes = await fetch('/api/bot/connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botApiUrl: apiUrl.trim(),
          botApiSecret: apiSecret.trim()
        })
      });

      const saveData = await saveRes.json();
      if (!saveRes.ok || !saveData.success) {
        setStatusMessage({ type: 'error', text: saveData.error || 'Błąd zapisu danych połączenia' });
        setTesting(false);
        return;
      }

      // 2. Przetestuj bezpośrednio ping do bota przez REST API
      const testRes = await fetch('/api/bot/connection/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botApiUrl: apiUrl.trim(),
          botApiSecret: apiSecret.trim()
        })
      });

      const testData = await testRes.json();
      if (testRes.ok && testData.success) {
        setStatusMessage({
          type: 'success',
          text: `Połączono pomyślnie z botem ${testData.botTag || ''}! Ping: ${testData.ping ? testData.ping + 'ms' : 'OK'} | Serwery: ${testData.guildsCount ?? 0}`
        });
        await fetchConnectionStatus();
        if (onConnected) onConnected();
      } else {
        setStatusMessage({
          type: 'error',
          text: testData.error || 'Nie udało się połączyć z REST API bota. Upewnij się, że bot jest uruchomiony na serwerze i port jest otwarty.'
        });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Wystąpił błąd sieci' });
    } finally {
      setTesting(false);
    }
  };

  const handleSyncNow = async () => {
    try {
      setTesting(true);
      const res = await fetch('/api/bot/proxy/sync-now', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({ type: 'success', text: 'Wymuszono natychmiastową synchronizację stanu bota z Discord Gateway!' });
        await fetchConnectionStatus();
        if (onConnected) onConnected();
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Nie udało się wymusić synchronizacji' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Błąd połączenia' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#2d2e36] border border-[#3b3c47] rounded-3xl w-full max-w-xl shadow-2xl shadow-black/60 overflow-hidden flex flex-col my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* NAGŁÓWEK */}
        <div className="p-6 border-b border-[#25262d] bg-[#272831] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#5865F2]/20 border border-[#5865F2]/40 flex items-center justify-center text-[#5865F2]">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                Połączenie REST / HTTPS API Bota
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-extrabold border border-emerald-500/30">
                  v2.1.0
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Dwukierunkowa komunikacja w czasie rzeczywistym między panelem a botem
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#32333d] hover:bg-[#3d3e4a] border border-[#3f404a] text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ZAWARTOŚĆ */}
        <div className="p-6 space-y-6">
          {/* KAFELEK STATUSU NA ŻYWO */}
          <div className="p-4 rounded-2xl bg-[#23242c] border border-[#353642] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-neutral-400 tracking-wider flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-[#5865F2]" />
                Stan Połączenia REST API
              </span>

              {connectionData?.botStatus === 'online' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-black">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  ONLINE (Połączono)
                </span>
              ) : connectionData?.botStatus === 'offline' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-black">
                  <WifiOff className="w-3.5 h-3.5" />
                  Brak odpowiedzi
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-black">
                  Nieskonfigurowane
                </span>
              )}
            </div>

            {/* METRYKI BOTA */}
            {connectionData?.botStatus === 'online' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#2e2f3a]">
                <div className="p-2 rounded-xl bg-[#2b2c36] border border-[#393a46] text-center">
                  <div className="text-[10px] text-neutral-400 font-bold uppercase">Opóźnienie</div>
                  <div className="text-sm font-black text-emerald-400">
                    {connectionData.ping ? `${connectionData.ping}ms` : '< 1ms'}
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-[#2b2c36] border border-[#393a46] text-center">
                  <div className="text-[10px] text-neutral-400 font-bold uppercase">Serwery</div>
                  <div className="text-sm font-black text-white">
                    {connectionData.guildsCount ?? 0}
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-[#2b2c36] border border-[#393a46] text-center">
                  <div className="text-[10px] text-neutral-400 font-bold uppercase">Pamięć RAM</div>
                  <div className="text-sm font-black text-[#8590ff]">
                    {connectionData.memoryMb ? `${connectionData.memoryMb} MB` : 'N/A'}
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-[#2b2c36] border border-[#393a46] text-center">
                  <div className="text-[10px] text-neutral-400 font-bold uppercase">Wersja</div>
                  <div className="text-sm font-black text-white">
                    {connectionData.version || 'v2.1.0'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* FORMULARZ KONFIGURACJI */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold uppercase text-neutral-300 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#5865F2]" />
                  Adres URL REST / HTTPS API Bota (BOT_API_URL)
                </span>
                <span className="text-[10px] font-normal text-neutral-400">
                  (opcjonalny dla zaawansowanych)
                </span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="np. http://51.77.x.x:3001 lub http://localhost:3001"
                  className="flex-1 px-4 py-3 bg-[#23242c] border border-[#3a3b47] focus:border-[#5865F2] rounded-xl text-white text-sm placeholder-neutral-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setApiUrl('http://localhost:3001')}
                  className="px-3 py-2 bg-[#2a2b36] hover:bg-[#343542] border border-[#3e404e] text-[11px] font-bold text-neutral-300 hover:text-white rounded-xl transition-colors cursor-pointer shrink-0"
                  title="Wstaw http://localhost:3001"
                >
                  Localhost
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase text-neutral-300 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  Klucz API Bota (BOT_API_SECRET)
                </span>
                <span className="text-[10px] font-normal text-neutral-400">
                  (opcjonalny - Twoje własne hasło)
                </span>
              </label>
              <input
                type="password"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder={connectionData?.botApiSecretSet ? '•••••••••••••••• (skonfigurowano)' : 'Zostaw puste lub wpisz hasło z pliku .env bota'}
                className="w-full px-4 py-3 bg-[#23242c] border border-[#3a3b47] focus:border-[#5865F2] rounded-xl text-white text-sm placeholder-neutral-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* POMOC: SKĄD TO WZIĄĆ */}
          <div className="p-4 rounded-2xl bg-[#202129] border border-[#353744] space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Skąd wziąć BOT_API_URL i BOT_API_SECRET?</span>
            </div>

            <div className="space-y-2.5 text-xs text-neutral-300 leading-relaxed">
              <div className="p-2.5 rounded-xl bg-[#262732] border border-[#383a48]">
                <div className="font-extrabold text-white mb-0.5 flex items-center gap-1.5">
                  <span className="text-[#5865F2]">1. BOT_API_URL:</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#5865F2]/20 text-[#8590ff] font-bold">OPCJONALNE</span>
                </div>
                <p className="text-[11px] text-neutral-300">
                  To adres, pod którym uruchomiony jest Twój bot. Jeśli bot działa na hostingu (Pterodactyl, VPS), to jest jego <strong>IP i port</strong> (np. <code className="text-[#8590ff]">http://51.77.20.10:3001</code>). Jeśli uruchamiasz bota na swoim komputerze, wpisz <code className="text-[#8590ff]">http://localhost:3001</code>.
                </p>
                <p className="text-[11px] text-emerald-400 mt-1 font-semibold">
                  💡 Pamiętaj: Jeśli uruchomisz bota z pobranej paczki ZIP, bot sam wysyła swoje serwery do panelu przez wbudowany DASHBOARD_URL i wszystko działa automatycznie nawet bez wypełniania tego pola!
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-[#262732] border border-[#383a48]">
                <div className="font-extrabold text-white mb-0.5 flex items-center gap-1.5">
                  <span className="text-amber-400">2. BOT_API_SECRET:</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">OPCJONALNE</span>
                </div>
                <p className="text-[11px] text-neutral-300">
                  <strong>Wymyślasz go sam!</strong> Nie musisz go nigdzie szukać w Discordzie. Jeśli chcesz zabezpieczyć bota hasłem przed niepowołanymi osobami, wpisz dowolne wymyślone hasło w pliku <code className="text-amber-300">.env</code> bota (<code className="text-amber-300">BOT_API_SECRET=mojehaslo123</code>) i to samo hasło wpisz tutaj.
                </p>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Jeśli zostawisz to pole puste w pliku <code className="text-neutral-300">.env</code>, tutaj również zostaw je puste.
                </p>
              </div>
            </div>
          </div>

          {/* KOMUNIKAT BŁĘDU / SUKCESU */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl text-xs font-bold flex items-start gap-2.5 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/15 border border-red-500/30 text-red-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              )}
              <div className="flex-1">{statusMessage.text}</div>
            </div>
          )}

          {/* PRZYCISKI AKCJI */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={handleSaveAndTest}
              disabled={testing || loading}
              className="w-full sm:flex-1 py-3 px-5 bg-[#5865F2] hover:bg-[#4752C4] active:scale-[0.98] disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo-950/40 flex items-center justify-center gap-2 cursor-pointer"
            >
              {testing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Testowanie połączenia...</span>
                </>
              ) : (
                <>
                  <Wifi className="w-4 h-4" />
                  <span>Połącz i Przetestuj REST API</span>
                </>
              )}
            </button>

            {connectionData?.botStatus === 'online' && (
              <button
                onClick={handleSyncNow}
                disabled={testing}
                className="w-full sm:w-auto py-3 px-4 bg-[#23242c] hover:bg-[#1e1f26] border border-[#3b3c47] text-neutral-300 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
                <span>Wymuś Sync</span>
              </button>
            )}
          </div>
        </div>

        {/* STOPKA */}
        <div className="p-4 bg-[#272831] border-t border-[#25262d] text-center text-[11px] text-neutral-400 font-medium">
          KitekBot REST API v2.1.0 &bull; Port 3001 &bull; Pełna synchronizacja stanów serwerów
        </div>
      </div>
    </div>
  );
}
