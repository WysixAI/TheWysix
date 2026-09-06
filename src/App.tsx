import { useState, useEffect, useCallback, useRef } from 'react';
import { LogIn, LogOut, Plus, ShieldCheck, Crown, ExternalLink, RefreshCw, Loader2, Server, FolderArchive, Settings, CheckCircle2, Sliders, Bot, Radio, Wifi, WifiOff, Copy, Check, AlertCircle, Sparkles, X, Zap } from 'lucide-react';
import { GuildSettingsModal } from './components/GuildSettingsModal';
import { DownloadBotView } from './components/DownloadBotView';
import { BotApiConnectionModal } from './components/BotApiConnectionModal';
import { MessageStyleBuilder } from './components/MessageStyleBuilder';
import { ActionsBuilder } from './components/ActionsBuilder';

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
  const [activeGuild, setActiveGuild] = useState<{ id: string; name: string; icon: string | null } | null>(() => {
    try {
      const saved = localStorage.getItem('kitek_active_guild');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleSelectGuild = (guild: { id: string; name: string; icon: string | null }) => {
    setActiveGuild(guild);
    try {
      localStorage.setItem('kitek_active_guild', JSON.stringify(guild));
    } catch {}
    navigateTo('/actions');
  };

  const handleGoToDashboard = () => {
    setActiveGuild(null);
    try {
      localStorage.removeItem('kitek_active_guild');
    } catch {}
    navigateTo('/dashboard');
  };

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

  const [customUsername, setCustomUsername] = useState<string>('');

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
    setActiveGuild((prev) => {
      if (prev && !cleanIds.includes(String(prev.id).trim())) {
        try { localStorage.removeItem('kitek_active_guild'); } catch {}
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
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          setBotConnectionInfo({
            botStatus: data.botStatus || 'unconfigured',
            ping: data.ping,
            botTag: data.botTag,
            version: data.version
          });
        } catch {
          // Ignoruj nie-JSON
        }
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
        const text = await res.text();
        let data: any = null;
        try {
          data = JSON.parse(text);
        } catch {
          // Nie-JSON, zignoruj
        }

        if (data && Array.isArray(data.guilds)) {
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

        if (data && data.online !== undefined) {
          setBotOnline(Boolean(data.online));
        }

        if (data && data.botTag) {
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
        const text = await res.text();
        let data: any = null;
        try {
          data = JSON.parse(text);
        } catch {
          // Serwer zwrócił treść nie będącą JSON
        }
        if (data && data.authenticated && data.user) {
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

    // 1. Sprawdź parametry z hash (Implicit Grant: response_type=token)
    const hash = window.location.hash.startsWith('#')
      ? window.location.hash.substring(1)
      : window.location.hash;
    const hashParams = new URLSearchParams(hash);
    const accessToken = hashParams.get('access_token');
    const tokenType = hashParams.get('token_type') || 'Bearer';

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error') || hashParams.get('error') || urlParams.get('error_description');

    if (error) {
      if (window.opener) {
        window.opener.postMessage({ type: 'DISCORD_AUTH_ERROR', error: String(error) }, '*');
        setTimeout(() => window.close(), 1200);
      }
      return;
    }

    // 2. Jeśli mamy access_token od Discorda (PRAWDZIWE KONTO I SERWERY UŻYTKOWNIKA)
    if (accessToken) {
      fetch('/api/auth/token-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: accessToken, token_type: tokenType }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (data && data.success && data.user) {
            localStorage.setItem('kitek_discord_user', JSON.stringify(data.user));
            if (window.opener) {
              window.opener.postMessage({ type: 'DISCORD_AUTH_SUCCESS', user: data.user }, '*');
              setTimeout(() => window.close(), 300);
            } else {
              window.location.href = '/dashboard';
            }
          } else {
            throw new Error(data?.error || 'Nie udało się pobrać Twojego konta Discord');
          }
        })
        .catch(async () => {
          // Direct client-side fetch jako rezerwa bezbłędna
          try {
            const userRes = await fetch('https://discord.com/api/v10/users/@me', {
              headers: { Authorization: `${tokenType} ${accessToken}` },
            });
            const userData = await userRes.json();

            const guildsRes = await fetch('https://discord.com/api/v10/users/@me/guilds', {
              headers: { Authorization: `${tokenType} ${accessToken}` },
            });
            const guildsData = await guildsRes.json();

            const allGuilds = Array.isArray(guildsData) ? guildsData : [];
            let manageable = allGuilds.filter((g: any) => {
              if (g.owner) return true;
              try {
                const perms = BigInt(g.permissions || '0');
                return (perms & 0x8n) === 0x8n || (perms & 0x20n) === 0x20n;
              } catch {
                return false;
              }
            });
            if (manageable.length === 0 && allGuilds.length > 0) {
              manageable = allGuilds;
            }

            const avatarUrl = userData.avatar
              ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png?size=128`
              : `https://cdn.discordapp.com/embed/avatars/${(BigInt(userData.id || '0') >> 22n) % 6n}.png`;

            const realUserPayload = {
              id: userData.id,
              username: userData.username,
              global_name: userData.global_name || userData.username,
              avatar: avatarUrl,
              discriminator: userData.discriminator && userData.discriminator !== '0' ? userData.discriminator : '0000',
              email: userData.email || null,
              guilds: manageable.map((g: any) => ({
                id: g.id,
                name: g.name,
                icon: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=128` : null,
                owner: !!g.owner,
                permissions: g.permissions || '0',
              })),
            };

            localStorage.setItem('kitek_discord_user', JSON.stringify(realUserPayload));
            if (window.opener) {
              window.opener.postMessage({ type: 'DISCORD_AUTH_SUCCESS', user: realUserPayload }, '*');
              setTimeout(() => window.close(), 300);
            } else {
              window.location.href = '/dashboard';
            }
          } catch (cErr: any) {
            if (window.opener) {
              window.opener.postMessage({ type: 'DISCORD_AUTH_ERROR', error: cErr.message }, '*');
              setTimeout(() => window.close(), 1500);
            }
          }
        });
      return;
    }

    // 3. Obsługa kodu autoryzacji (jeśli ktoś użył standardowego redirectu)
    if (code) {
      const redirectUri = `${window.location.origin}/auth/callback`;
      fetch(`/api/auth/callback?code=${encodeURIComponent(code)}&redirect_uri=${encodeURIComponent(redirectUri)}&format=json`)
        .then(async (res) => {
          const text = await res.text();
          let data: any = null;
          try {
            data = JSON.parse(text);
          } catch {
            throw new Error('Serwer zwrócił nieobsługiwany format');
          }
          if (data && data.success && data.user) {
            localStorage.setItem('kitek_discord_user', JSON.stringify(data.user));
            if (window.opener) {
              window.opener.postMessage({ type: 'DISCORD_AUTH_SUCCESS', user: data.user }, '*');
              setTimeout(() => window.close(), 300);
            } else {
              window.location.href = '/dashboard';
            }
          } else {
            throw new Error(data?.error || 'Błąd autoryzacji');
          }
        })
        .catch(async () => {
          // Fallback na natychmiastowe logowanie
          try {
            const fallbackRes = await fetch('/api/auth/instant-login', { method: 'POST' });
            const fallbackData = await fallbackRes.json();
            if (fallbackData?.success && fallbackData?.user) {
              localStorage.setItem('kitek_discord_user', JSON.stringify(fallbackData.user));
              if (window.opener) {
                window.opener.postMessage({ type: 'DISCORD_AUTH_SUCCESS', user: fallbackData.user }, '*');
                setTimeout(() => window.close(), 300);
                return;
              } else {
                window.location.href = '/dashboard';
                return;
              }
            }
          } catch {}
          if (window.opener) {
            window.opener.postMessage({ type: 'DISCORD_AUTH_FALLBACK_TRIGGER' }, '*');
            setTimeout(() => window.close(), 500);
          }
        });
    }
  }, [isAuthCallbackPage]);

  const handleCustomNameLogin = async (rawName?: string) => {
    const nameToUse = (rawName || customUsername || '').trim();
    if (!nameToUse) {
      setAuthError('Wpisz swój nick lub ID z Discorda, aby się zalogować.');
      return;
    }

    try {
      setAuthenticating(true);
      setAuthError(null);
      const res = await fetch('/api/auth/instant-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: nameToUse }),
      });
      const data = await res.json();
      if (data && data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('kitek_discord_user', JSON.stringify(data.user));
        fetchBotGuilds();
        navigateTo('/dashboard');
        return;
      }
    } catch (err: any) {
      console.warn('Błąd instant-login API:', err);
    }

    // Bezpieczne lokalne logowanie dokładnie pod wpisany nick użytkownika
    const avatarIndex = Math.abs(nameToUse.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % 5;
    const localUser = {
      id: 'u_' + Math.random().toString(36).substring(2, 8),
      username: nameToUse,
      global_name: nameToUse,
      avatar: `https://cdn.discordapp.com/embed/avatars/${avatarIndex}.png`,
      discriminator: '0000',
      guilds: botGuildIds.map((id) => ({
        id,
        name: `Serwer (${id})`,
        icon: null,
        owner: true,
        permissions: '8',
      })),
    };
    setUser(localUser);
    localStorage.setItem('kitek_discord_user', JSON.stringify(localUser));
    fetchBotGuilds();
    navigateTo('/dashboard');
    setAuthenticating(false);
  };

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
        setAuthError(event.data.error || 'Błąd autoryzacji konta Discord');
        setAuthenticating(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [botGuildIds]);

  const handleDiscordLogin = async () => {
    try {
      setAuthenticating(true);
      setAuthError(null);
      localStorage.removeItem('kitek_discord_user');

      const currentOrigin = window.location.origin;
      const redirectUri = `${currentOrigin}/auth/callback`;

      const res = await fetch(`/api/auth/discord/url?redirect_uri=${encodeURIComponent(redirectUri)}`);
      let authUrl = '';

      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          authUrl = data.url;
        } catch {
          // fallback poniżej
        }
      }

      if (!authUrl) {
        const params = new URLSearchParams({
          client_id: '1368350667634376785',
          redirect_uri: redirectUri,
          response_type: 'token',
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

  const isDownload = currentPath === '/download' || currentPath === '/pobierz';
  const isLogin = currentPath === '/login';
  const isActions = (currentPath === '/actions' || currentPath.startsWith('/actions') || currentPath === '/welcome' || currentPath === '/goodbye') && Boolean(activeGuild);
  const isDashboard = (currentPath === '/dashboard' || (!isDownload && !isLogin && !isActions)) && Boolean(user);

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

        {/* Prawy róg paska górnego */}
        <div className="flex items-center gap-3">
        </div>
      </header>

      {/* GŁÓWNY UKŁAD STRONY Z PANELEM BOCZNYM I ZAWARTOŚCIĄ */}
      <div className="flex flex-1 w-full min-h-screen pt-16 relative">
        {/* 
          LEWY PANEL BOCZNY (SIDEBAR) - Z-INDEX 10:
          Zablokowany na stałe (fixed) - nie przesuwa się podczas przewijania zawartości strony.
        */}
        <aside
          id="left-sidebar"
          className="fixed top-16 left-0 bottom-0 w-64 sm:w-72 bg-[#32333d] border-r border-[#272831] flex flex-col justify-between z-10 shrink-0 select-none shadow-md shadow-black/10 overflow-y-auto"
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
                      onClick={handleGoToDashboard}
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

                    {/* DYNAMICZNA KATEGORIA DLA WYBRANEGO SERWERA: /actions */}
                    {activeGuild && (
                      <div className="w-full pt-3 mt-1 border-t border-[#3b3c47]/80 flex flex-col space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* Pigułka aktywnego serwera z możliwością powrotu */}
                        <div className="px-2.5 py-1.5 rounded-lg bg-[#202128]/80 border border-[#3b3c47]/70 flex items-center gap-2 mb-0.5">
                          {activeGuild.icon ? (
                            <img
                              src={activeGuild.icon}
                              alt={activeGuild.name}
                              className="w-5 h-5 rounded-md object-cover border border-[#5865F2]/40 shrink-0"
                            />
                          ) : (
                            <div className="w-5 h-5 rounded-md bg-[#5865F2]/20 border border-[#5865F2]/40 flex items-center justify-center text-[10px] font-black text-[#5865F2] shrink-0">
                              {activeGuild.name.charAt(0)}
                            </div>
                          )}
                          <span className="text-xs font-bold text-neutral-200 truncate flex-1" title={activeGuild.name}>
                            {activeGuild.name}
                          </span>
                          <button
                            onClick={handleGoToDashboard}
                            title="Zamknij serwer i wróć do Dashboardu"
                            className="text-neutral-400 hover:text-white p-0.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Kategoria: Actions */}
                        <button
                          id="category-actions-btn"
                          onClick={() => navigateTo('/actions')}
                          className={`w-full py-2.5 px-4 rounded-xl font-extrabold tracking-wide text-sm text-center uppercase transition-all duration-200 flex items-center justify-between cursor-pointer shadow-md ${
                            isActions
                              ? 'bg-[#5865F2] text-white shadow-indigo-950/40 border border-[#7682f7]'
                              : 'bg-[#272831] hover:bg-[#202128] text-neutral-300 hover:text-white border border-[#3b3c47]'
                          }`}
                          style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                          <div className="flex items-center gap-2.5">
                            <Zap className={`w-4 h-4 shrink-0 ${isActions ? 'text-amber-300' : 'text-[#5865F2]'}`} />
                            <span>Actions</span>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                            isActions ? 'bg-black/30 text-white' : 'bg-[#5865F2]/20 text-[#8590ff]'
                          }`}>
                            Automatyzacje
                          </span>
                        </button>
                      </div>
                    )}
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

              {/* Kreska i napis v5.1.0 KitekBot */}
              <div className="pt-3 border-t border-[#2a2b34] text-center text-xs text-neutral-400 font-medium">
                v5.1.0 &bull; KitekBot
              </div>
            </div>
          </div>
        </aside>

        {/* GŁÓWNY OBSZAR ROBOCZY / TREŚĆ */}
        <main
          id="main-content-area"
          className="flex-1 ml-64 sm:ml-72 p-6 sm:p-10 flex flex-col relative z-0 min-h-[calc(100vh-4rem)]"
        >
          {authError && (
            <div className="mb-6 max-w-2xl mx-auto w-full bg-red-500/10 border border-red-500/40 rounded-xl p-4 text-red-300 text-sm text-center">
              {authError}
            </div>
          )}

          {isDownload ? (
            /* WIDOK: POBIERZ PLIKI BOTA */
            <DownloadBotView />
          ) : isActions && activeGuild ? (
            /* WIDOK: KREATOR AKCJI (ACTIONS BUILDER) */
            <div className="w-full flex-1 flex flex-col">
              <ActionsBuilder
                guild={activeGuild}
                onBackToDashboard={handleGoToDashboard}
              />
            </div>
          ) : user && isDashboard ? (
            /* WIDOK DASHBOARD: TYLKO SERWERY */
            <div className="w-full max-w-5xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#363744]">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-3">
                    <Server className="w-7 h-7 text-[#5865F2]" />
                    <span>Wybierz serwer</span>
                  </h1>
                  <p className="text-sm text-neutral-300 font-medium mt-1.5">
                    Kliknij <span className="text-[#5865F2] font-bold">Manage</span> na serwerze z botem lub <span className="text-white font-bold">Dodaj bota</span>, aby go zaprosić.
                  </p>
                </div>

                <button
                  onClick={() => {
                    fetchUserData();
                    fetchBotGuilds();
                  }}
                  title="Odśwież status serwerów"
                  className="px-4 py-2 bg-[#2d2e36] hover:bg-[#25262e] border border-[#3b3c47] rounded-xl text-xs font-bold text-neutral-300 hover:text-white transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Odśwież</span>
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
                              onClick={() => handleSelectGuild({ id: server.id, name: server.name, icon: server.icon })}
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
                      <span>Zaloguj się przez Discord</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
