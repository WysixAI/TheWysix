import { useState, useEffect, useCallback, useRef } from 'react';
import { LogIn, LogOut, Plus, ShieldCheck, Crown, ExternalLink, RefreshCw, Loader2, Sparkles, Server, FolderArchive, Settings, CheckCircle2, Sliders, Bot, Radio, Wifi, WifiOff, Copy, Check, AlertCircle } from 'lucide-react';
import { GuildSettingsModal } from './components/GuildSettingsModal';
import { DownloadBotView } from './components/DownloadBotView';
import { BotApiConnectionModal } from './components/BotApiConnectionModal';

interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions?: string;
}

interface DiscordUser {
  id: string;
  username: string;
  global_name?: string;
  avatar: string;
  discriminator?: string;
  email?: string;
  banner_color?: string | null;
  guilds?: DiscordGuild[];
}

function DiscordIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );
  const [user, setUser] = useState<DiscordUser | null>(() => {
    try {
      const saved = localStorage.getItem('kitek_discord_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [authenticating, setAuthenticating] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [copiedRedirect, setCopiedRedirect] = useState<boolean>(false);
  const [selectedGuildForSettings, setSelectedGuildForSettings] = useState<{ id: string; name: string; icon: string | null } | null>(null);
  const [isBotApiModalOpen, setIsBotApiModalOpen] = useState<boolean>(false);
  const [botConnectionInfo, setBotConnectionInfo] = useState<{
    botStatus: 'online' | 'offline' | 'unconfigured';
    ping: number | null;
    botTag: string | null;
    version: string | null;
  }>({
    botStatus: 'unconfigured',
    ping: null,
    botTag: null,
    version: null
  });
  const [waitingGuildIds, setWaitingGuildIds] = useState<string[]>([]);
  const [botOnline, setBotOnline] = useState<boolean>(false);
  const [botTag, setBotTag] = useState<string>('KitekBot');
  const [botGuildIds, setBotGuildIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('kitek_bot_guild_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const updateBotGuildsState = (rawIds: string[]) => {
    const cleanIds = Array.from(new Set(rawIds.map((id) => String(id).trim()).filter(Boolean)));
    setBotGuildIds(cleanIds);
    setWaitingGuildIds((prev) => prev.filter((id) => !cleanIds.includes(String(id).trim())));
    setSelectedGuildForSettings((prev) => {
      if (prev && !cleanIds.includes(String(prev.id).trim())) {
        return null;
      }
      return prev;
    });
    try {
      localStorage.setItem('kitek_bot_guild_ids', JSON.stringify(cleanIds));
    } catch {
      // ignore
    }
  };

  const isFetchingGuildsRef = useRef(false);
  const isFetchingConnectionRef = useRef(false);

  const fetchBotConnectionInfo = async () => {
    if (isFetchingConnectionRef.current) return;
    isFetchingConnectionRef.current = true;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(`/api/bot/connection?t=${Date.now()}`, {
        cache: 'no-store',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        setBotConnectionInfo({
          botStatus: data.botStatus || 'unconfigured',
          ping: data.ping,
          botTag: data.botTag,
          version: data.version
        });
      }
    } catch {
      // Bezpiecznie ignorujemy chwilowy brak odpowiedzi podczas restartu kontenera
    } finally {
      isFetchingConnectionRef.current = false;
    }
  };

  const fetchBotGuilds = useCallback(async () => {
    if (isFetchingGuildsRef.current) return;
    isFetchingGuildsRef.current = true;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(`/api/bot/guilds?_t=${Date.now()}`, {
        cache: 'no-store',
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();

        if (Array.isArray(data.guilds)) {
          const normalized = data.guilds.map((id: unknown) => String(id).trim()).filter(Boolean);
          setBotGuildIds(normalized);
          setWaitingGuildIds((prev) => prev.filter((id) => !normalized.includes(String(id).trim())));
          setSelectedGuildForSettings((prev) => {
            if (prev && !normalized.includes(String(prev.id).trim())) {
              return null;
            }
            return prev;
          });
          try {
            localStorage.setItem('kitek_bot_guild_ids', JSON.stringify(normalized));
          } catch {
            // ignore
          }
        }

        setBotOnline(Boolean(data.online));

        if (data.botTag) {
          setBotTag(data.botTag);
        }
      }
    } catch {
      // Ciche obsłużenie chwilowej przerwy w łączności sieciowej
    } finally {
      isFetchingGuildsRef.current = false;
    }
  }, []);

  // Fetch session, subscribe to real-time SSE stream & fallback poll
  useEffect(() => {
    fetchUserData();
    fetchBotGuilds();
    fetchBotConnectionInfo();

    // 1. Server-Sent Events (SSE) for 0-latency live push from bot
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/bot/events');
      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed && Array.isArray(parsed.guildIds)) {
            updateBotGuildsState(parsed.guildIds);
          }
        } catch {
          // ignore
        }
      };
      eventSource.onerror = () => {
        // SSE reconnects automatically
      };
    } catch {
      // fallback to polling
    }

    // 2. High-frequency fallback poll
    const pollInterval = setInterval(() => {
      fetchBotGuilds();
      fetchBotConnectionInfo();
    }, 2000);

    const handleFocus = () => {
      fetchBotGuilds();
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchBotGuilds();
      }
    };
    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      fetchBotGuilds();
      const res = await fetch(`/api/auth/me?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
          try {
            localStorage.setItem('kitek_discord_user', JSON.stringify(data.user));
          } catch {}
          if (window.location.pathname === '/login' || window.location.pathname === '/') {
            navigateTo('/dashboard');
          }
        } else {
          const saved = localStorage.getItem('kitek_discord_user');
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              setUser(parsed);
              if (window.location.pathname === '/login' || window.location.pathname === '/') {
                navigateTo('/dashboard');
              }
            } catch {
              setUser(null);
            }
          }
        }
      }
    } catch {
      const saved = localStorage.getItem('kitek_discord_user');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setUser(parsed);
        } catch {
          // ignore
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Dedicated check for /auth/callback (works seamlessly with Vercel SPA routing)
  const isAuthCallbackPage = typeof window !== 'undefined' && window.location.pathname.startsWith('/auth/callback');

  useEffect(() => {
    if (!isAuthCallbackPage) return;

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error') || urlParams.get('error_description');

    if (error) {
      if (window.opener) {
        window.opener.postMessage({ type: 'DISCORD_AUTH_ERROR', error: String(error) }, '*');
        setTimeout(() => window.close(), 1200);
      }
      return;
    }

    if (code) {
      const redirectUri = `${window.location.origin}/auth/callback`;
      fetch(`/api/auth/callback?code=${encodeURIComponent(code)}&redirect_uri=${encodeURIComponent(redirectUri)}&format=json`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success && data.user) {
            localStorage.setItem('kitek_discord_user', JSON.stringify(data.user));
            if (window.opener) {
              window.opener.postMessage({ type: 'DISCORD_AUTH_SUCCESS', user: data.user }, '*');
              setTimeout(() => window.close(), 300);
            } else {
              window.location.href = '/';
            }
          } else {
            throw new Error(data?.error || 'Błąd autoryzacji');
          }
        })
        .catch((err) => {
          if (window.opener) {
            window.opener.postMessage({ type: 'DISCORD_AUTH_ERROR', error: err.message }, '*');
            setTimeout(() => window.close(), 2000);
          }
        });
    }
  }, [isAuthCallbackPage]);

  // Listen for popup message after Discord OAuth callback
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      const isAllowedOrigin =
        origin === window.location.origin ||
        origin.endsWith('.run.app') ||
        origin.endsWith('.vercel.app') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1');

      if (!isAllowedOrigin) {
        return;
      }

      if (event.data?.type === 'DISCORD_AUTH_SUCCESS') {
        const userData = event.data.user;
        setUser(userData);
        localStorage.setItem('kitek_discord_user', JSON.stringify(userData));
        setAuthenticating(false);
        setAuthError(null);
        fetchBotGuilds();
        navigateTo('/dashboard');
      } else if (event.data?.type === 'DISCORD_AUTH_ERROR') {
        setAuthError(event.data.error || 'Błąd autoryzacji Discord');
        setAuthenticating(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleDiscordLogin = async () => {
    try {
      setAuthenticating(true);
      setAuthError(null);

      const currentOrigin = window.location.origin;
      const redirectUri = `${currentOrigin}/auth/callback`;

      const res = await fetch(`/api/auth/discord/url?redirect_uri=${encodeURIComponent(redirectUri)}`);
      let authUrl = '';

      if (res.ok) {
        const data = await res.json();
        authUrl = data.url;
      } else {
        const params = new URLSearchParams({
          client_id: '1368350667634376785',
          redirect_uri: redirectUri,
          response_type: 'code',
          scope: 'identify email guilds',
          prompt: 'consent',
        });
        authUrl = `https://discord.com/api/oauth2/authorize?${params.toString()}`;
      }

      const width = 580;
      const height = 720;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        authUrl,
        'discord_oauth_popup',
        `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
      );

      if (!popup) {
        setAuthError('Zezwól na wyskakujące okienka (popups) w przeglądarce, aby się zalogować.');
        setAuthenticating(false);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Nie udało się połączyć z Discord');
      setAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // continue
    }
    setUser(null);
    localStorage.removeItem('kitek_discord_user');
    navigateTo('/login');
  };

  const addBotToGuild = (guildId: string) => {
    const clientId = '1368350667634376785';
    setWaitingGuildIds((prev) => Array.from(new Set([...prev, String(guildId).trim()])));

    // Discord bot invite URL with Administrator permissions (8)
    const botInviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands&guild_id=${guildId}&disable_guild_select=true`;
    window.open(botInviteUrl, '_blank');

    // Szybkie sprawdzanie co 700ms przez pierwszą minutę
    const interval = setInterval(() => {
      fetchBotGuilds();
    }, 700);
    setTimeout(() => {
      clearInterval(interval);
      setWaitingGuildIds((prev) => prev.filter((id) => id !== String(guildId).trim()));
    }, 60000);
  };

  const isDashboard = currentPath === '/dashboard';
  const isDownload = currentPath === '/download' || currentPath === '/pobierz';
  const isLogin = currentPath === '/login';

  const userGuildsCount = user?.guilds?.length || 0;
  const isGuildBotPresent = (guildId: string) => {
    return Array.isArray(botGuildIds) && botGuildIds.some((id) => String(id) === String(guildId));
  };
  const activeWithBotCount = user?.guilds?.filter((g) => isGuildBotPresent(g.id)).length || 0;

  if (isAuthCallbackPage) {
    return (
      <div className="min-h-screen bg-[#24252f] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="bg-[#2c2d38] border border-[#3f404d] rounded-2xl p-8 max-w-sm w-full shadow-2xl space-y-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center mx-auto text-indigo-400">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-xl font-black text-white">Logowanie Discord</h2>
          <p className="text-sm text-neutral-300">
            Autoryzacja przebiegła pomyślnie. Trwa finalizowanie logowania i zamykanie okna...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#3f404a] text-white flex flex-col font-['Montserrat',sans-serif] relative overflow-hidden selection:bg-[#5865F2] selection:text-white">
      {/* Modal konfiguracji serwera po kliknięciu Manage */}
      {selectedGuildForSettings && (
        <GuildSettingsModal
          guild={selectedGuildForSettings}
          onClose={() => {
            setSelectedGuildForSettings(null);
            fetchBotGuilds();
          }}
        />
      )}

      {/* Modal konfiguracji połączenia z botem przez REST / HTTPS API */}
      <BotApiConnectionModal
        isOpen={isBotApiModalOpen}
        onClose={() => setIsBotApiModalOpen(false)}
        onConnected={() => {
          fetchBotGuilds();
          fetchBotConnectionInfo();
        }}
      />

      {/* 
        WARSTWA GÓRNA (TOP BAR) - Z-INDEX 20:
        Pasek u góry jest nad lewym panelem bocznym (warstwa nadrzędna).
      */}
      <header
        id="top-bar"
        className="fixed top-0 left-0 right-0 h-16 bg-[#2d2e36] border-b border-[#25262d] flex items-center justify-between px-6 z-20 shadow-lg shadow-black/25"
      >
        <div className="flex items-center gap-3">
          <button
            id="brand-logo-btn"
            onClick={() => navigateTo(user ? '/dashboard' : '/login')}
            className="flex items-center focus:outline-none cursor-pointer"
          >
            <span
              id="kitekbot-title"
              className="text-2xl sm:text-3xl font-black tracking-tight kitek-animated-text uppercase select-none"
              style={{ fontWeight: 900 }}
            >
              KitekBot
            </span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Przycisk statusu REST / HTTPS API bota */}
          <button
            id="topbar-bot-rest-api-btn"
            onClick={() => setIsBotApiModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#272831] hover:bg-[#202128] border border-[#3b3c47] hover:border-[#5865F2] text-xs font-bold transition-all cursor-pointer shadow-sm"
            title="Kliknij, aby skonfigurować lub sprawdzić połączenie REST API bota"
          >
            {botConnectionInfo.botStatus === 'online' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 font-extrabold hidden sm:inline">REST API:</span>
                <span className="text-white font-extrabold">{botConnectionInfo.ping ? `${botConnectionInfo.ping}ms` : 'Online'}</span>
              </>
            ) : botConnectionInfo.botStatus === 'offline' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-red-400 font-extrabold hidden sm:inline">REST API:</span>
                <span className="text-neutral-300">Offline</span>
              </>
            ) : (
              <>
                <Radio className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-400 font-bold hidden sm:inline">Połącz z botem</span>
                <span className="text-neutral-400 text-[11px]">(REST API)</span>
              </>
            )}
          </button>

          {user && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#272831] border border-[#3b3c47] text-xs font-bold text-neutral-300">
              <Server className="w-3.5 h-3.5 text-[#5865F2]" />
              <span>Twoje serwery:</span>
              <span className="text-white font-extrabold px-1.5 py-0.5 rounded bg-[#5865F2]/20 text-[#8590ff]">
                {userGuildsCount}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* GŁÓWNY UKŁAD STRONY Z PANELEM BOCZNYM I ZAWARTOŚCIĄ */}
      <div className="flex flex-1 w-full min-h-screen pt-16 relative">
        {/* 
          LEWY PANEL BOCZNY (SIDEBAR) - Z-INDEX 10:
          Jest szerszy, od góry do dołu, umieszczony warstwowo pod górnym paskiem.
        */}
        <aside
          id="left-sidebar"
          className="w-64 sm:w-72 bg-[#32333d] border-r border-[#272831] flex flex-col justify-between z-10 shrink-0 select-none shadow-md shadow-black/10"
        >
          <div className="p-4 flex flex-col flex-1">
            {/* KATEGORIE / PRZYCISKI W PANELU */}
            <div className="flex-1 flex flex-col justify-start items-center py-4 space-y-2">
              <div className="w-full px-1 flex flex-col items-center space-y-2">
                {!user ? (
                  <button
                    id="category-login-btn"
                    onClick={handleDiscordLogin}
                    disabled={authenticating}
                    className="w-full py-2.5 px-4 rounded-xl font-extrabold tracking-wide text-sm sm:text-base text-center uppercase transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer shadow-md bg-[#5865F2] hover:bg-[#4752C4] active:scale-[0.98] text-white border border-[#6b77f5] hover:shadow-indigo-900/40 disabled:opacity-75"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {authenticating ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <DiscordIcon className="w-5 h-5 shrink-0" />
                    )}
                    <span>Login</span>
                  </button>
                ) : (
                  <>
                    {/* Kategoria: Dashboard z licznikiem serwerów */}
                    <button
                      id="category-dashboard-btn"
                      onClick={() => navigateTo('/dashboard')}
                      className={`w-full py-2.5 px-4 rounded-xl font-extrabold tracking-wide text-sm text-center uppercase transition-all duration-200 flex items-center justify-between cursor-pointer shadow-md ${
                        isDashboard
                          ? 'bg-[#272831] text-white border border-[#5865F2]/50 shadow-indigo-950/20'
                          : 'bg-[#272831] hover:bg-[#202128] text-neutral-300 hover:text-white border border-[#3b3c47]'
                      }`}
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      <div className="flex items-center gap-3">
                        <Server className="w-4 h-4 shrink-0 text-[#5865F2]" />
                        <span>Dashboard</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-[#5865F2]/20 text-[#8590ff] text-xs font-black">
                        {userGuildsCount}
                      </span>
                    </button>

                    {/* Kategoria: Połączenie REST API */}
                    <button
                      id="category-rest-api-btn"
                      onClick={() => setIsBotApiModalOpen(true)}
                      className="w-full py-2.5 px-4 rounded-xl font-extrabold tracking-wide text-sm text-center uppercase transition-all duration-200 flex items-center justify-between cursor-pointer shadow-md bg-[#272831] hover:bg-[#202128] text-neutral-300 hover:text-white border border-[#3b3c47] hover:border-[#5865F2]"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      <div className="flex items-center gap-3">
                        <Radio className="w-4 h-4 shrink-0 text-amber-400" />
                        <span>Połączenie REST</span>
                      </div>
                      {botConnectionInfo.botStatus === 'online' ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-500/50 animate-pulse" />
                      ) : botConnectionInfo.botStatus === 'offline' ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-400 font-bold">API</span>
                      )}
                    </button>

                    {/* Kategoria: Pobierz Pliki */}
                    <button
                      id="category-download-btn"
                      onClick={() => navigateTo('/download')}
                      className={`w-full py-2.5 px-4 rounded-xl font-extrabold tracking-wide text-sm text-center uppercase transition-all duration-200 flex items-center justify-start gap-3 cursor-pointer shadow-md ${
                        isDownload
                          ? 'bg-[#272831] text-white border border-emerald-500/50 shadow-emerald-950/20'
                          : 'bg-[#272831] hover:bg-[#202128] text-neutral-300 hover:text-white border border-[#3b3c47]'
                      }`}
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      <FolderArchive className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>Pobierz Pliki</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* SEKCJA NA SAMYM DOLE: NICK I LOGO NAD KRESKĄ V2.0.0 KITEKBOT + WYLOGOWANIE */}
            <div className="flex flex-col">
              {user && (
                <div
                  id="sidebar-user-bottom-info"
                  className="mb-3 px-3 py-2 rounded-xl bg-[#272831] border border-[#3b3c47] flex items-center justify-between gap-2 shadow-inner group/user relative"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <img
                      src={user.avatar}
                      alt={user.username}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full border border-[#5865F2] shrink-0"
                    />
                    <div className="overflow-hidden min-w-0 flex-1">
                      <div className="text-xs font-black truncate text-white leading-tight">
                        {user.global_name || user.username}
                      </div>
                      <div className="text-[10px] text-neutral-400 font-medium truncate">
                        @{user.username}
                      </div>
                    </div>
                  </div>

                  {/* Przycisk wylogowania ze zmianą koloru na czerwony po najechaniu i tooltipem */}
                  <div className="relative group/logout shrink-0">
                    <button
                      id="sidebar-bottom-logout-btn"
                      onClick={handleLogout}
                      aria-label="Wyloguj się z konta"
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-500/15 border border-transparent hover:border-red-500/30 transition-all duration-200 cursor-pointer flex items-center justify-center"
                    >
                      <LogOut className="w-4 h-4 transition-transform group-hover/logout:scale-110" />
                    </button>

                    {/* Tooltip przy najechaniu */}
                    <div className="absolute bottom-full right-0 mb-2 hidden group-hover/logout:flex items-center px-2.5 py-1 rounded-md bg-neutral-900 text-red-400 border border-red-500/40 text-[10px] font-bold whitespace-nowrap shadow-lg shadow-black/50 z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                      Wyloguj się z konta
                    </div>
                  </div>
                </div>
              )}

              {/* Kreska i napis v2.9.0 KitekBot */}
              <div className="pt-3 border-t border-[#2a2b34] text-center text-xs text-neutral-400 font-medium">
                v2.9.0 &bull; KitekBot REST API
              </div>
            </div>
          </div>
        </aside>

        {/* GŁÓWNY OBSZAR ROBOCZY / TREŚĆ */}
        <main
          id="main-content-area"
          className="flex-1 p-6 sm:p-10 flex flex-col relative z-0 overflow-y-auto"
        >
          {authError && (
            <div className="mb-6 max-w-2xl mx-auto w-full bg-red-500/10 border border-red-500/40 rounded-xl p-4 text-red-300 text-sm text-center">
              {authError}
            </div>
          )}

          {isDownload ? (
            /* WIDOK: POBIERZ PLIKI BOTA */
            <DownloadBotView />
          ) : user && isDashboard ? (
            /* WIDOK DASHBOARD: LISTA SERWERÓW GDZIE UŻYTKOWNIK MOŻE DODAĆ BOTA LUB KLIKNĄĆ MANAGE */
            <div className="w-full max-w-5xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#363744]">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-3">
                      <Server className="w-7 h-7 text-[#5865F2]" />
                      <span>Wybierz serwer</span>
                    </h1>
                    <span className="px-3 py-1 rounded-xl bg-[#5865F2]/20 border border-[#5865F2]/40 text-[#8590ff] font-extrabold text-xs uppercase tracking-wide">
                      Twoje serwery: {userGuildsCount}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-300 font-medium mt-1.5">
                    Posiadasz uprawnienia na <strong className="text-white">{userGuildsCount}</strong> {userGuildsCount === 1 ? 'serwerze' : 'serwerach'}. Kliknij <span className="text-[#5865F2] font-bold">Manage</span> na serwerze z botem lub <span className="text-white font-bold">Dodaj bota</span>, aby go zaprosić.
                  </p>
                </div>

                <button
                  onClick={() => {
                    fetchUserData();
                    fetchBotGuilds();
                  }}
                  title="Odśwież status serwerów"
                  className="px-3.5 py-2 bg-[#2d2e36] hover:bg-[#25262e] border border-[#3b3c47] rounded-xl text-xs font-bold text-neutral-300 hover:text-white transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Odśwież ({activeWithBotCount} z botem)</span>
                </button>
              </div>

              {/* Baner informacyjny REST API */}
              <div className="p-4 rounded-2xl bg-[#32333d] border border-[#3b3c47] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    botConnectionInfo.botStatus === 'online'
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                      : botConnectionInfo.botStatus === 'offline'
                      ? 'bg-red-500/15 border-red-500/40 text-red-400'
                      : 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                  }`}>
                    {botConnectionInfo.botStatus === 'online' ? (
                      <Wifi className="w-5 h-5" />
                    ) : botConnectionInfo.botStatus === 'offline' ? (
                      <WifiOff className="w-5 h-5" />
                    ) : (
                      <Radio className="w-5 h-5 animate-pulse" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-white">
                        {botConnectionInfo.botStatus === 'online'
                          ? 'Połączono z Botem przez REST API'
                          : botConnectionInfo.botStatus === 'offline'
                          ? 'Brak połączenia z REST API Bota'
                          : 'Połączenie z Botem przez REST / HTTPS API'}
                      </span>
                      <span className="px-2 py-0.2 rounded-md bg-[#5865F2]/20 border border-[#5865F2]/40 text-[#8590ff] text-[10px] font-black uppercase">
                        v2.1.0
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 mt-0.5">
                      {botConnectionInfo.botStatus === 'online'
                        ? `Bot jest aktywny i połączony z panelem (${botConnectionInfo.botTag || 'KitekBot'}). Ping: ${botConnectionInfo.ping ? botConnectionInfo.ping + 'ms' : 'OK'}.`
                        : 'Wprowadź publiczny adres bota (np. z Pterodactyl lub VPS), aby panel bezpośrednio komunikował się z instancją bota.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsBotApiModalOpen(true)}
                  className="px-4 py-2.5 bg-[#272831] hover:bg-[#202128] border border-[#484a58] hover:border-[#5865F2] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 shadow-sm"
                >
                  <Radio className="w-3.5 h-3.5 text-amber-400" />
                  <span>{botConnectionInfo.botStatus === 'online' ? 'Zarządzaj połączeniem API' : 'Skonfiguruj REST API'}</span>
                </button>
              </div>

              {user.guilds && user.guilds.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {user.guilds.map((server) => {
                    const isBotInServer =
                      Array.isArray(botGuildIds) &&
                      botGuildIds.some(
                        (id) => String(id) === String(server.id)
                      );

                    if (server.name === 'Steam Generator' || isBotInServer) {
                      console.log({
                        serverId: String(server.id),
                        serverName: server.name,
                        botGuildIds,
                        isBotInServer
                      });
                    }

                    return (
                      <div
                        key={server.id}
                        className={`bg-[#32333d] border ${
                          isBotInServer ? 'border-[#5865F2]/60 shadow-indigo-950/20' : 'border-[#272831] hover:border-[#3f404a]'
                        } rounded-2xl p-5 shadow-lg shadow-black/20 flex flex-col justify-between transition-all duration-200 group`}
                      >
                        <div>
                          <div className="flex items-center gap-4 mb-5">
                            {server.icon ? (
                              <img
                                src={server.icon}
                                alt={server.name}
                                referrerPolicy="no-referrer"
                                className="w-14 h-14 rounded-2xl object-cover border border-[#3f404a] group-hover:border-[#5865F2] transition-colors"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-2xl bg-[#272831] border border-[#3f404a] flex items-center justify-center text-lg font-black text-white group-hover:border-[#5865F2] transition-colors">
                                {server.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <h3 className="font-black text-white text-base truncate leading-snug">
                                {server.name}
                              </h3>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                {server.owner ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-[10px] font-bold text-amber-400 uppercase">
                                    <Crown className="w-3 h-3" />
                                    Właściciel
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-[10px] font-bold text-indigo-300 uppercase">
                                    <ShieldCheck className="w-3 h-3" />
                                    Zarządca
                                  </span>
                                )}

                                {isBotInServer && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 uppercase">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Aktywny
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Pojedynczy przycisk Akcji: MANAGE jeśli bot jest na serwerze, SPINNER jeśli czeka, lub DODAJ BOTA jeśli go nie ma */}
                        <div className="pt-2 border-t border-[#272831]">
                          {isBotInServer ? (
                            <button
                              id={`manage-guild-btn-${server.id}`}
                              onClick={() => setSelectedGuildForSettings({ id: server.id, name: server.name, icon: server.icon })}
                              className="w-full py-3 px-4 bg-[#5865F2] hover:bg-[#4752C4] active:scale-[0.98] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo-950/40 flex items-center justify-center gap-2 cursor-pointer group-hover:shadow-indigo-900/60"
                            >
                              <Sliders className="w-4 h-4" />
                              <span>Manage</span>
                            </button>
                          ) : waitingGuildIds.includes(String(server.id).trim()) ? (
                            <button
                              id={`waiting-bot-guild-btn-${server.id}`}
                              disabled
                              className="w-full py-3 px-4 bg-[#282933] border border-[#5865F2] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-wait"
                            >
                              <Loader2 className="w-4 h-4 animate-spin text-[#5865F2]" />
                              <span className="text-[#c7d2fe] animate-pulse">Wykrywanie bota...</span>
                            </button>
                          ) : (
                            <button
                              id={`add-bot-guild-btn-${server.id}`}
                              onClick={() => addBotToGuild(server.id)}
                              className="w-full py-3 px-4 bg-[#202128] hover:bg-[#282933] border border-[#3b3c47] hover:border-[#5865F2] active:scale-[0.98] text-neutral-200 hover:text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <Plus className="w-4 h-4 text-white" />
                              <span>Dodaj bota</span>
                              <ExternalLink className="w-3 h-3 opacity-60" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-[#32333d] border border-[#272831] rounded-2xl p-10 text-center max-w-lg mx-auto space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-[#272831] border border-[#3b3c47] flex items-center justify-center text-neutral-400">
                    <Server className="w-7 h-7" />
                  </div>
                  <h2 className="text-xl font-black text-white uppercase">Nie znaleziono serwerów</h2>
                  <p className="text-xs text-neutral-400 leading-relaxed font-medium">
                    Nie posiadasz uprawnień Administratora ani Zarządzania serwerem na żadnym serwerze Discord przypisanym do tego konta lub Discord jeszcze ich nie zsynchronizował.
                  </p>
                  <button
                    onClick={() => {
                      fetchUserData();
                      fetchBotGuilds();
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#272831] hover:bg-[#202128] border border-[#3b3c47] text-white font-bold rounded-xl text-xs uppercase cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sprawdź ponownie</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* WIDOK STRONY /login LUB WIDOK DOMYŚLNY DLA NIEZALOGOWANEGO */
            <div className="flex-1 flex items-center justify-center">
              <div
                id="discord-login-card"
                className="w-full max-w-md bg-[#32333d] border border-[#272831] rounded-2xl p-8 sm:p-10 shadow-2xl shadow-black/40 text-center"
              >
                <div className="inline-flex p-3.5 rounded-2xl bg-[#5865F2]/10 border border-[#5865F2]/30 text-[#5865F2] mb-4">
                  <DiscordIcon className="w-10 h-10" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-2">
                  Logowanie KitekBot
                </h1>
                <p className="text-sm text-neutral-300 font-medium mb-6">
                  Zaloguj się kontem Discord, aby przejść do panelu serwerów <span className="text-white font-bold">Dashboard</span>.
                </p>

                <button
                  id="main-discord-login-btn"
                  onClick={handleDiscordLogin}
                  disabled={authenticating}
                  className="w-full py-3.5 px-6 bg-[#5865F2] hover:bg-[#4752C4] active:scale-[0.98] text-white font-black uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-950/50 hover:shadow-indigo-900/70 transition-all flex items-center justify-center gap-3 cursor-pointer text-base disabled:opacity-75"
                >
                  {authenticating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Łączenie z Discord...</span>
                    </>
                  ) : (
                    <>
                      <DiscordIcon className="w-6 h-6 shrink-0" />
                      <span>Zaloguj przez Discord</span>
                    </>
                  )}
                </button>

                {/* Sekcja pomocnicza: Konfiguracja Redirect URI w Discord Developer Portal */}
                <div className="mt-6 pt-5 border-t border-[#3f404a] text-left">
                  <div className="flex items-center gap-2 text-amber-300 text-xs font-bold mb-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>Błąd &quot;Nieprawidłowe parametry adresu URL&quot;?</span>
                  </div>
                  <p className="text-[11px] text-neutral-300 mb-2.5 leading-relaxed">
                    Discord wymaga wpisania dokładnego adresu Redirect URI w <strong>Discord Developer Portal &rarr; Applications &rarr; OAuth2 &rarr; Redirects</strong>:
                  </p>

                  <div className="bg-[#24252f] p-2.5 rounded-xl border border-[#3b3c47] flex items-center justify-between gap-2 shadow-inner">
                    <code className="text-[11px] text-indigo-300 font-mono truncate select-all font-semibold">
                      {typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : 'https://kitekbot.vercel.app/auth/callback'}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        const uri = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : 'https://kitekbot.vercel.app/auth/callback';
                        navigator.clipboard.writeText(uri);
                        setCopiedRedirect(true);
                        setTimeout(() => setCopiedRedirect(false), 2000);
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#5865F2] hover:bg-[#4752C4] active:scale-95 text-white flex items-center gap-1 shrink-0 cursor-pointer transition-all"
                    >
                      {copiedRedirect ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span className="text-emerald-300">Skopiowano!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Kopiuj</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <a
                      href="https://discord.com/developers/applications/1368350667634376785/oauth2"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] text-indigo-400 hover:text-indigo-300 font-bold hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Otwórz Discord Developer Portal (OAuth2)</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
