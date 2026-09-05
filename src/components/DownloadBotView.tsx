import React, { useState } from 'react';
import { Download, FolderArchive, FileCode, CheckCircle2, Copy, Sparkles, History, ArrowRight, ExternalLink, GitCommit, Clock, Check } from 'lucide-react';
import { generateBotZip } from '../botZipGenerator';

interface ChangeLogEntry {
  version: string;
  date: string;
  badge: string;
  badgeColor: string;
  changes: string[];
}

const BOT_CHANGELOG: ChangeLogEntry[] = [
  {
    version: "v3.0.0",
    date: "Dzisiaj, 05.09.2026",
    badge: "NAJNOWSZA (v3.0.0)",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    changes: [
      "Naprawiono błąd 'Unexpected token <, <!doctype ... is not valid JSON' poprzez wykluczenie ścieżek /api/ z reguły SPA fallback w vercel.json",
      "Dodano bezpieczne parsowanie odpowiedzi fetch() we wszystkich komponentach (ochrona przed awarią przy odpowiedziach HTML/proxy)",
      "Wdrożono automatyczną normalizację prefiksu /api/ w middleware Express dla bezserwerowych wywołań Vercel Serverless",
      "Zapewniono wymuszone zwracanie formatu JSON przy błędach autoryzacji OAuth (parametr format=json i nagłówek Accept)"
    ]
  },
  {
    version: "v2.9.0",
    date: "Dzisiaj, 05.09.2026",
    badge: "STABILNA",
    badgeColor: "bg-[#5865F2]/20 text-indigo-300 border-[#5865F2]/40",
    changes: [
      "Wdrożono natywny bezserwerowy eksport Express dla środowiska Vercel (eliminacja przedwczesnego zamykania wywołań asynchronicznych)",
      "Utworzono dedykowane punkty wejścia Serverless: /api/auth/callback.ts, /api/[...slug].ts oraz /api/index.ts",
      "Zoptymalizowano reguły routingu rewrites w vercel.json dla bezbłędnej obsługi OAuth oraz API",
      "Usunięto przestarzałą definicję @types/jszip i zoptymalizowano proces instalacji pakietów"
    ]
  },
  {
    version: "v2.8.0",
    date: "Dzisiaj, 05.09.2026",
    badge: "STABILNA",
    badgeColor: "bg-[#5865F2]/20 text-indigo-300 border-[#5865F2]/40",
    changes: [
      "Naprawiono krytyczny błąd Vercel 500 FUNCTION_INVOCATION_FAILED (read-only filesystem EROFS w środowiskach AWS Lambda)",
      "Dodano bezpieczny silnik pamięci podręcznej in-memory dla konfiguracji serwerów z obsługą katalogu /tmp na platformach serverless",
      "Wdrożono zaawansowaną obsługę błędów i automatyczną detekcję ścieżek URL w bezserwerowym entrypoincie /api/index.ts",
      "Zabezpieczono procedurę startu serwera przed próbą otwierania portu 3000 w środowisku Vercel Serverless"
    ]
  },
  {
    version: "v2.7.0",
    date: "Dzisiaj, 05.09.2026",
    badge: "STABILNA",
    badgeColor: "bg-[#5865F2]/20 text-indigo-300 border-[#5865F2]/40",
    changes: [
      "Dodano interaktywnego asystenta konfiguracji OAuth2 Redirect URI z kopiowaniem adresu domeny jednym kliknięciem (rozwiązanie błędu 'Nieprawidłowe parametry adresu URL')",
      "Obsługa niestandardowych i produkcyjnych domen Vercel (m.in. kitekbot.vercel.app)",
      "Zapewniono bezpośrednie odnośniki do konfiguracji Discord Developer Portal",
      "Aktualizacja silnika synchronizacji i obsługi logowania"
    ]
  },
  {
    version: "v2.6.0",
    date: "Dzisiaj, 05.09.2026",
    badge: "STABILNA",
    badgeColor: "bg-[#5865F2]/20 text-indigo-300 border-[#5865F2]/40",
    changes: [
      "Pełne wsparcie i optymalizacja hostingu pod platformę Vercel (eliminacja błędu 404 na /auth/callback)",
      "Wdrożono bezserwerowy punkt wejścia /api/index.ts oraz kompleksowe reguły routingu rewrites w vercel.json",
      "Dodano dwutorową obsługę logowania OAuth: natywny handler Express Serverless + fallback SPA w React z natychmiastową wymianą kodu przez /api/auth/callback?format=json",
      "Rozszerzono walidację zdarzeń okna popup o domeny Vercel (*.vercel.app)",
      "Wprowadzono trwałą synchronizację sesji użytkowników w chmurze Upstash Redis dla środowisk bezstanowych Serverless"
    ]
  },
  {
    version: "v2.5.0",
    date: "04.09.2026",
    badge: "STABILNA",
    badgeColor: "bg-[#5865F2]/20 text-indigo-300 border-[#5865F2]/40",
    changes: [
      "Wdrożono natychmiastowy eksport pełnego kodu źródłowego Dashboardu i Backendu Express do pliku ZIP (/api/download/project-zip)",
      "Umożliwiono pełną analizę architektury przepływu: bot /api/bot/sync -> Redis/RAM -> SSE broadcast -> React UI",
      "Dodano kompletną kartę pobierania repozytorium projektu w sekcji Pobierz Pliki z czystym wzorem .env.example",
      "Stabilizacja i zabezpieczenie zapytań pollingu bota z wykorzystaniem AbortController i timeoutów"
    ]
  },
  {
    version: "v2.4.0",
    date: "04.09.2026",
    badge: "STABILNA",
    badgeColor: "bg-[#5865F2]/20 text-indigo-300 border-[#5865F2]/40",
    changes: [
      "Naprawiono błąd startowy (ReferenceError: Events is not defined) w pliku index.js",
      "Dodano poprawny import modułu Events z biblioteki discord.js z bezpiecznym fallbackiem 'ready'",
      "Całkowicie wyeliminowano crashe procesu na hostingu Pterodactyl i w środowiskach Node.js v22",
      "Zachowano pełną dwukierunkową synchronizację statusu serwerów z Dashboardem w czasie rzeczywistym"
    ]
  },
  {
    version: "v2.3.0",
    date: "04.09.2026",
    badge: "STABILNA",
    badgeColor: "bg-[#5865F2]/20 text-indigo-300 border-[#5865F2]/40",
    changes: [
      "Naprawiono synchronizację zerowego stanu serwerów (0 serwerów): gdy bot jest na 0 serwerach, Dashboard natychmiast czyści listę i pokazuje 'Dodaj bota'",
      "Pełna autorytatywność listy serwerów: okresowe raporty guildIds: [] bezwzględnie czyszczą stare lub nieistniejące serwery z bazy Redis i pamięci RAM",
      "Wyczyszczono przedawnione identyfikatory testowe z pamięci podręcznej i chmury",
      "Dodano natywną obsługę Events.ClientReady z Discord.js w celu eliminacji ostrzeżeń o deprecacji",
      "Wzmocniono odporność na desynchronizację w środowiskach kontenerowych Pterodactyl i Cloud Run"
    ]
  },
  {
    version: "v2.2.0",
    date: "04.09.2026",
    badge: "STABILNA",
    badgeColor: "bg-[#5865F2]/20 text-indigo-300 border-[#5865F2]/40",
    changes: [
      "Naprawiono pełen przepływ wykrywania serwera i synchronizacji statusu 'Zarządzaj' (Manage)",
      "Zoptymalizowano obsługę zdarzeń guildCreate (natychmiastowe add) i guildDelete (natychmiastowe remove)",
      "Znormalizowano typy Guild ID do stringów w całym łańcuchu: Bot -> /api/bot/sync -> Redis/RAM -> /api/bot/guilds -> React",
      "Dodano buforowanie awaryjne w pamięci RAM serwera dla natychmiastowej responsywności przy opóźnieniach Redis",
      "Zabezpieczono endpointy przed duplikatami i zapewniono format guilds: string[]"
    ]
  },
  {
    version: "v2.1.0",
    date: "04.09.2026",
    badge: "STABILNA",
    badgeColor: "bg-[#5865F2]/20 text-indigo-300 border-[#5865F2]/40",
    changes: [
      "Wbudowany poradnik 'Skąd wziąć BOT_API_URL i BOT_API_SECRET' w oknie połączenia REST API",
      "Szybki przycisk 'Localhost' oraz automatyczne wykrywanie hosta bez konieczności manualnej konfiguracji",
      "Wyjaśnienie opcjonalności parametrów: bot synchronizuje się w 100% samoczynnie przez DASHBOARD_URL",
      "Automatyczne raportowanie portu i statusu bota do Dashboardu przy każdym pulsie synchronizacji"
    ]
  },
  {
    version: "v2.0.0",
    date: "02.09.2026",
    badge: "STABILNA (REST API)",
    badgeColor: "bg-[#5865F2]/20 text-indigo-300 border-[#5865F2]/40",
    changes: [
      "Dwukierunkowe REST / HTTPS API bota z endpointami `/api/status`, `/api/bot/guilds`, `/api/bot/guilds/:id/channels` i `/api/bot/guilds/:id/roles`",
      "Obsługa opcjonalnego klucza autoryzacji BOT_API_SECRET w nagłówkach Bearer dla bezpiecznego połączenia przez Internet",
      "Konfigurator połączenia REST API w panelu Web Dashboard z automatycznym wykrywaniem i testem opóźnienia ping",
      "Natychmiastowe zaciąganie listy kanałów i ról serwera bezpośrednio z instancji bota w czasie rzeczywistym",
      "Pełne wsparcie dla publicznych adresów IP i domen HTTPS bota na hostingu Pterodactyl, VPS i kontenerach"
    ]
  },
  {
    version: "v1.9.0",
    date: "30.08.2026",
    badge: "STABILNA",
    badgeColor: "bg-[#5865F2]/20 text-indigo-300 border-[#5865F2]/40",
    changes: [
      "Błyskawiczne usuwanie statusu 'Manage' i natychmiastowe przywrócenie 'Dodaj bota' w czasie < 1s po wyrzuceniu bota",
      "Dwukierunkowy Live Push SSE ze wskaźnikiem synchronizacji na żywo",
      "Automatyczne czyszczenie lokalnej pamięci podręcznej i zamykanie modala konfiguracji dla opuszczonych serwerów",
      "Optymalizacja obsługi pustej listy serwerów w Upstash Redis"
    ]
  },
  {
    version: "v1.8.0",
    date: "30.08.2026",
    badge: "STABILNA",
    badgeColor: "bg-[#5865F2]/20 text-indigo-300 border-[#5865F2]/40",
    changes: [
      "Wdrożono Server-Sent Events (SSE) do natychmiastowego przekazywania zmian stanu gildii bez opóźnień sieciowych",
      "Dodano wyłączenie buforowania (Cache-Control: no-store) dla zapytań stanu serwerów",
      "Błyskawiczne przełączanie przycisku Dodaj bota <-> Manage z zachowaniem stanu w localStorage i Upstash Redis",
      "Natychmiastowe odświeżanie interfejsu przy wejściu bota na serwer lub jego opuszczeniu"
    ]
  },
  {
    version: "v1.7.0",
    date: "30.08.2026",
    badge: "STABILNA",
    badgeColor: "bg-[#5865F2]/20 text-indigo-300 border-[#5865F2]/40",
    changes: [
      "Wdrożono trwałe przechowywanie listy serwerów w chmurze Upstash Redis (REST API) zamiast plików dyskowych",
      "Pełna odporność na restarty instancji i read-only filesystem w Google Cloud Run",
      "Dwukierunkowa, bezopóźnieniowa synchronizacja statusu aktywności gildii bota w czasie rzeczywistym",
      "Brak zewnętrznych zależności npm dla bazy danych (lekki natywny fetch REST API)"
    ]
  },
  {
    version: "v1.6.0",
    date: "30.08.2026",
    badge: "STABILNA",
    badgeColor: "bg-[#5865F2]/20 text-indigo-300 border-[#5865F2]/40",
    changes: [
      "Wprowadzono szczegółowe logowanie synchronizacji w konsoli bota (kod HTTP, liczba serwerów, adres URL)",
      "Dodano wsparcie dla zmiennej środowiskowej ACTIVE_BOT_GUILDS jako niezawodny fallback w pamięci RAM",
      "Usunięto zależność blokującą od zapisu do plików dyskowych (obsługa środowisk read-only i kontenerów)",
      "Wzmocniono logi odbierania pakietów synchronizacji po stronie serwera Web Dashboardu"
    ]
  },
  {
    version: "v1.5.0",
    date: "30.08.2026",
    badge: "STABILNA",
    badgeColor: "bg-[#5865F2]/20 text-indigo-300 border-[#5865F2]/40",
    changes: [
      "Naprawiono błąd składni (SyntaxError: Unexpected identifier) w komendzie /stan",
      "Bezpieczna konkatenacja ciągów znaków bez ryzykownych zagnieżdżonych szablonów w index.js",
      "Wzmocniono odporność procedury startowej na hostingu Pterodactyl i Node.js v22",
      "Dodano pełne wsparcie dla komend slash (/pomoc, /ping, /stan, /daily) z bezpieczną obsługą odpowiedzi"
    ]
  },
  {
    version: "v1.4.0",
    date: "30.08.2026",
    badge: "STABILNA",
    badgeColor: "bg-[#5865F2]/20 text-indigo-300 border-[#5865F2]/40",
    changes: [
      "Automatyczne czyszczenie i sanityzacja tokenu Discord (usunięcie cudzysłowów, zbędnych spacji i prefiksu 'Bot ')",
      "Dodano rejestrację globalnych komend slash: `/pomoc`, `/ping`, `/stan`, `/daily`",
      "Dodano wymuszone pobieranie pełnej pamięci podręcznej serwerów (`client.guilds.fetch()`) przy starcie",
      "Czytelne logi błędów w konsoli hostingu (Pterodactyl/VPS) z bezpośrednim linkiem do Developer Portal przy problemach z tokenem",
      "Dodano wysyłanie metadanych bota (wersja, tag, id, timestamp) w pakiecie synchronizacji do Web Dashboardu",
      "Zabezpieczono automatyczną instalację zależności npm w środowiskach kontenerowych"
    ]
  },
  {
    version: "v1.3.0",
    date: "30.08.2026",
    badge: "STABILNA",
    badgeColor: "bg-[#5865F2]/20 text-indigo-300 border-[#5865F2]/40",
    changes: [
      "Dwukierunkowa, błyskawiczna synchronizacja bota z panelem Web (wykrywanie dodania i wyrzucenia w 1-2s)",
      "Obsługa zdarzeń `guildDelete` oraz `guildCreate` z natychmiastowym czyszczeniem pamięci",
      "Dodano automatyczny endpoint weryfikacji API `/api/bot/check/:guildId` przed otwarciem Manage",
      "Dodano animowany stan oczekiwania (spinner) w Dashboardzie podczas zapraszania bota",
      "Zoptymalizowano zapis plików konfiguracyjnych w katalogu Serwery/*.json"
    ]
  },
  {
    version: "v1.2.0",
    date: "30.08.2026",
    badge: "POPRZEDNIA",
    badgeColor: "bg-neutral-800 text-neutral-400 border-neutral-700",
    changes: [
      "Wdrożono trwałe zapisywanie listy aktywnych serwerów bota w Serwery/active_bot_guilds.json",
      "Przebudowano nawigację do jednego, zintegrowanego przycisku Manage / Dodaj bota na kafelkach",
      "Poprawiono uprawnienia bota (Administrator - 8) przy generowaniu linku zaproszenia"
    ]
  },
  {
    version: "v1.1.0",
    date: "30.08.2026",
    badge: "BAZA",
    badgeColor: "bg-neutral-800 text-neutral-400 border-neutral-700",
    changes: [
      "Pełne moduły: Powitania (Welcome), Pożegnania (Goodbye), AntyLink, AntySpam, Ekonomia",
      "Wbudowany serwer Express API w bocie (port 3001) do komunikacji z webem",
      "Pliki konfiguracyjne z automatycznym tworzeniem katalogu Serwery/"
    ]
  },
  {
    version: "v1.0.0",
    date: "29.08.2026",
    badge: "START",
    badgeColor: "bg-neutral-800 text-neutral-400 border-neutral-700",
    changes: [
      "Inicjalna wersja silnika bota Discord.js v14 i generatora paczek ZIP"
    ]
  }
];

export function DownloadBotView() {
  const [token, setToken] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const totalChangesCount = BOT_CHANGELOG.reduce((acc, curr) => acc + curr.changes.length, 0);

  const handleDownload = async () => {
    try {
      setGenerating(true);
      const currentDashboardOrigin = window.location.origin;
      const zip = generateBotZip(token.trim(), '1368350667634376785', '-c7yfLwX-ZojIhLF3TCHZxavvmLyCN9K', currentDashboardOrigin);
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'kitekbot-discord-bot.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Błąd generowania ZIP:', err);
    } finally {
      setGenerating(false);
    }
  };

  const copyEnvCommand = () => {
    navigator.clipboard.writeText(`npm install && npm start`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="pb-4 border-b border-[#363744]">
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-3">
          <FolderArchive className="w-8 h-8 text-[#5865F2]" />
          <span>Pobierz Pliki Bota</span>
        </h1>
        <p className="text-sm text-neutral-300 font-medium mt-1">
          Pobierz kompletny pakiet źródłowy Node.js bota KitekBot z wbudowanym systemem plików <code className="bg-[#202128] px-2 py-0.5 rounded text-amber-400 font-mono">Serwery/*.json</code> oraz API. Wystarczy wgrać na hosting!
        </p>
      </div>

      {/* Main Download Card */}
      <div className="bg-[#32333d] border border-[#272831] rounded-2xl p-6 sm:p-8 shadow-xl shadow-black/25 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#5865F2]/10 border border-[#5865F2]/30 text-indigo-400 text-xs font-bold uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gotowa paczka ZIP do pobrania</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white">
            Pobierz gotowy projekt KitekBot
          </h2>

          <p className="text-sm text-neutral-300 leading-relaxed font-medium">
            Pakiet zawiera pełen kod bota <strong className="text-white">Discord.js v14</strong>, mechanizm odczytu i zapisu plików konfiguracyjnych w katalogu <code className="bg-[#202128] px-1.5 py-0.5 rounded text-[#5865F2] font-mono">Serwery/</code> w locie oraz serwer Express API synchronizujący ustawienia z Dashboardem.
          </p>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
              Twój Token Bota Discord (Opcjonalnie - możesz wpisać też w pliku .env po pobraniu)
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Wklej token bota (np. MTM2ODM...)"
              className="w-full bg-[#202128] border border-[#3f404d] focus:border-[#5865F2] rounded-xl px-4 py-3 text-white text-sm font-mono outline-none transition-all placeholder:text-neutral-500"
            />
            <p className="text-[11px] text-neutral-400">
              Token znajdziesz w <a href="https://discord.com/developers/applications" target="_blank" rel="noreferrer" className="text-[#5865F2] underline hover:text-indigo-400 inline-flex items-center gap-1">Discord Developer Portal <ExternalLink className="w-3 h-3 inline" /></a> &rarr; Bot &rarr; Reset Token.
            </p>
          </div>

          <button
            onClick={handleDownload}
            disabled={generating}
            className="w-full py-4 px-6 bg-[#5865F2] hover:bg-[#4752C4] active:scale-[0.99] text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-950/50 hover:shadow-indigo-900/70 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            <span>{generating ? 'Generowanie archiwum ZIP...' : 'Pobierz Pliki Bota (.ZIP)'}</span>
          </button>
        </div>

        {/* Tree Structure Preview */}
        <div className="lg:col-span-5 bg-[#202128] border border-[#2d2e38] rounded-xl p-5 flex flex-col justify-between font-mono text-xs text-neutral-300">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-[#5865F2]" />
              <span>Struktura plików w paczce:</span>
            </div>

            <div className="bg-[#181920] p-4 rounded-lg border border-[#272832] text-[13px] leading-relaxed text-neutral-300 space-y-1">
              <div className="text-[#5865F2] font-bold">bot/</div>
              <div className="pl-4 text-emerald-400">├── index.js <span className="text-neutral-500 text-[11px] font-sans">(główny bot + API)</span></div>
              <div className="pl-4 text-amber-400">├── .env <span className="text-neutral-500 text-[11px] font-sans">(tokeny i klucze)</span></div>
              <div className="pl-4 text-blue-400">├── package.json <span className="text-neutral-500 text-[11px] font-sans">(zależności)</span></div>
              <div className="pl-4 text-purple-400">├── Serwery/ <span className="text-neutral-500 text-[11px] font-sans">(tworzy się sam!)</span></div>
              <div className="pl-8 text-neutral-400">└── 123456789.json <span className="text-neutral-500 text-[11px] font-sans">(konfiguracja)</span></div>
              <div className="pl-4 text-pink-400">└── utils/</div>
              <div className="pl-8 text-cyan-400">└── configManager.js <span className="text-neutral-500 text-[11px] font-sans">(czytanie/zapis)</span></div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#272832] flex items-center justify-between text-[11px]">
            <span className="text-neutral-400">Node.js 18+ / Discord.js v14</span>
            <span className="text-emerald-400 font-bold">Wszystko skonfigurowane</span>
          </div>
        </div>
      </div>

      {/* NEW: Full Dashboard & Backend Source Code Download Card */}
      <div className="bg-gradient-to-r from-[#20212b] to-[#282937] border border-[#5865F2]/40 rounded-2xl p-6 sm:p-8 shadow-xl shadow-indigo-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold uppercase">
            <FileCode className="w-3.5 h-3.5" />
            <span>Pełny kod źródłowy projektu</span>
          </div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            Pobierz Cały Dashboard &amp; Backend (.ZIP)
          </h3>
          <p className="text-sm text-neutral-300 leading-relaxed font-medium">
            Pobierz kompletną paczkę z całym panelem i serwerem: <code className="text-amber-400 bg-neutral-900/80 px-1.5 py-0.5 rounded font-mono text-xs">server.ts</code> (Express API, obsługa <code className="text-indigo-300 font-mono text-xs">/api/bot/sync</code>, Redis, SSE), frontend React 19 (<code className="text-emerald-400 font-mono text-xs">src/App.tsx</code>) oraz wzorzec <code className="text-purple-300 font-mono text-xs">.env.example</code>. Możesz natychmiast przejrzeć rzeczywisty przepływ danych w IDE.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-neutral-400 font-mono">
            <span className="bg-[#181922] px-2.5 py-1 rounded-lg border border-[#343545]">
              🔀 Przepływ: Bot &rarr; /api/bot/sync &rarr; Redis/RAM &rarr; SSE &rarr; React
            </span>
          </div>
        </div>

        <a
          href="/api/download/project-zip"
          download="kitekbot-full-dashboard-backend.zip"
          className="w-full md:w-auto px-6 py-3.5 bg-[#5865F2] hover:bg-[#4752C4] active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-indigo-950/50 flex items-center justify-center gap-2.5 shrink-0 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Pobierz Cały Projekt (.ZIP)</span>
        </a>
      </div>

      {/* Changelog & Update History Section */}
      <div className="bg-[#32333d] border border-[#272831] rounded-2xl p-6 sm:p-8 shadow-xl shadow-black/25 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#272832]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#5865F2]/20 border border-[#5865F2]/40 text-[#5865F2]">
              <History className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Historia Zmian & Aktualizacji</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-[11px]">
                  {totalChangesCount} wprowadzonych zmian
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-medium mt-0.5">
                Sprawdź co dokładnie zostało dodane i zaktualizowane w kodzie źródłowym bota oraz w panelu.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#202128] border border-[#3b3c47] text-xs font-mono text-neutral-300 self-start sm:self-auto">
            <GitCommit className="w-4 h-4 text-[#5865F2]" />
            <span>Wersja: <strong className="text-emerald-400">v2.1.0</strong></span>
          </div>
        </div>

        {/* Timeline List of Changes */}
        <div className="space-y-6">
          {BOT_CHANGELOG.map((log) => (
            <div
              key={log.version}
              className="p-5 rounded-xl bg-[#202128] border border-[#2d2e38] space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-sm font-black text-white">{log.version}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${log.badgeColor}`}>
                    {log.badge}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
                  <Clock className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{log.date}</span>
                </div>
              </div>

              <ul className="space-y-2 pt-1 border-t border-[#272832]">
                {log.changes.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-neutral-300 leading-relaxed font-medium">
                    <span className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400 mt-0.5 shrink-0">
                      <Check className="w-3 h-3" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
