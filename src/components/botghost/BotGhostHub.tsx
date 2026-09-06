import React, { useState } from 'react';
import {
  Search,
  Plus,
  Terminal,
  Calendar,
  Clock,
  Database,
  Hammer,
  FileText,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Settings,
  Share2,
  Server,
  Activity,
  Users,
  AlertTriangle,
  Award,
  LifeBuoy,
  Sliders,
  Webhook,
  FileCode,
  Shield,
  MessageSquare,
  Copy,
  Trash2,
  Play,
  HelpCircle,
  FolderArchive,
  Crown,
  ShoppingBag,
  Cpu,
  Gem,
  Gift
} from 'lucide-react';
import { ActionFlow } from '../../types/guildConfig';

interface BotGhostHubProps {
  guild: { id: string; name: string; icon: string | null };
  flows: ActionFlow[];
  onOpenCommand: (flowId: string) => void;
  onCreateNewCommand: () => void;
  onDuplicateCommand: (flow: ActionFlow) => void;
  onDeleteCommand: (flowId: string) => void;
  onToggleFlow: (flowId: string) => void;
  onBackToDashboard: () => void;
}

export function BotGhostHub({
  guild,
  flows,
  onOpenCommand,
  onCreateNewCommand,
  onDuplicateCommand,
  onDeleteCommand,
  onToggleFlow,
  onBackToDashboard
}: BotGhostHubProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSidebarTab, setActiveSidebarTab] = useState('modules');
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const filteredFlows = flows.filter((f) => {
    const q = searchQuery.toLowerCase();
    return (
      f.name.toLowerCase().includes(q) ||
      (f.trigger.commandName && f.trigger.commandName.toLowerCase().includes(q)) ||
      (f.description && f.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#14151a] text-neutral-200 font-sans select-none">
      {/* =================================================================== */}
      {/* 1. GÓRNA NAWIGACJA (BOTGHOST TOP NAVIGATION BAR)                    */}
      {/* =================================================================== */}
      <header className="h-14 bg-[#191a20] border-b border-[#272832] px-4 flex items-center justify-between z-30 shrink-0">
        {/* Lewa strona: Logo maskotki duszka + menu nawigacji */}
        <div className="flex items-center gap-6">
          {/* Logo duszka BotGhost */}
          <div className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity">
            <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-rose-600 via-orange-500 to-amber-400 p-0.5 shadow-md shadow-orange-950/40 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-6 h-6 fill-white">
                <path d="M18 4C11.373 4 6 9.373 6 16v13.5c0 .828.672 1.5 1.5 1.5.4 0 .78-.16 1.06-.44L11 28l2.44 2.56c.56.59 1.5.61 2.09.05L18 28.3l2.47 2.31c.59.56 1.53.54 2.09-.05L25 28l2.44 2.56c.28.28.66.44 1.06.44.828 0 1.5-.672 1.5-1.5V16c0-6.627-5.373-12-12-12z" />
                <circle cx="13" cy="15" r="2.2" fill="#14151a" />
                <circle cx="23" cy="15" r="2.2" fill="#14151a" />
                <path d="M15 19c.8 1.2 2 1.8 3 1.8s2.2-.6 3-1.8" stroke="#14151a" strokeWidth="1.6" strokeLinecap="round" fill="none" />
              </svg>
            </div>
            <span className="text-base font-black tracking-tight text-white hidden sm:inline">
              Bot<span className="text-orange-500">Ghost</span>
            </span>
          </div>

          {/* Linki nawigacji */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-neutral-400">
            <button className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
              Home
            </button>
            <button className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
              Tutorials
            </button>
            <button className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
              Tools
            </button>
            <button className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
              Updates
            </button>
            <button className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
              Docs
            </button>
            <button className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
              Support
            </button>
            <button className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
              Affiliate
            </button>
            <button className="px-3 py-1.5 rounded-lg text-white font-bold bg-white/10 transition-colors cursor-pointer">
              Dashboard
            </button>
          </nav>
        </div>

        {/* Prawa strona: Przyciski akcji (Start, Invite, Support, Tour) */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            onClick={() => onOpenCommand(flows[0]?.id || '')}
            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-950/40 cursor-pointer transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Start</span>
          </button>

          <button
            onClick={() => {
              const clientId = '1368350667634376785';
              window.open(
                `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands`,
                '_blank'
              );
            }}
            className="px-3 py-1.5 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-indigo-950/40 cursor-pointer transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Invite</span>
          </button>

          <button
            onClick={() => window.open('https://discord.gg', '_blank')}
            className="hidden sm:flex px-3 py-1.5 rounded-lg bg-[#272832] hover:bg-[#323340] text-neutral-300 hover:text-white text-xs font-bold items-center gap-1.5 border border-[#343542] cursor-pointer transition-all"
          >
            <LifeBuoy className="w-3.5 h-3.5 text-neutral-400" />
            <span>Support</span>
          </button>

          <button
            onClick={onCreateNewCommand}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-rose-950/40 cursor-pointer transition-all"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Tour</span>
          </button>
        </div>
      </header>

      {/* =================================================================== */}
      {/* 2. UKŁAD GŁÓWNY: LEWY SIDEBAR + PRZESTRZEŃ MODUŁÓW                 */}
      {/* =================================================================== */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEWY BOCZNY PANEL BOTGHOST (SIDEBAR) */}
        <aside className="w-60 bg-[#16171d] border-r border-[#24252e] flex flex-col shrink-0 overflow-y-auto hidden lg:flex">
          {/* Selektor Aktywnego Bota (np. LunarBOT / KitekBot) */}
          <div className="p-3 border-b border-[#24252e]">
            <div className="flex items-center justify-between p-2 rounded-xl bg-[#1d1e26] border border-[#2c2d38] hover:border-[#5865F2]/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-2.5 min-w-0">
                {guild.icon ? (
                  <img src={guild.icon} alt={guild.name} className="w-7 h-7 rounded-lg object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-[#5865F2] flex items-center justify-center text-white font-black text-xs">
                    {guild.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-xs font-extrabold text-white truncate">{guild.name}</div>
                  <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>LunarBOT • Online</span>
                  </div>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />
            </div>
          </div>

          {/* Grupa 1: Główne Moduły */}
          <div className="p-3 space-y-1">
            <button
              onClick={() => setActiveSidebarTab('modules')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSidebarTab === 'modules'
                  ? 'bg-gradient-to-r from-red-500/20 to-red-500/5 text-red-400 border border-red-500/30'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Hammer className="w-4 h-4 text-red-400" />
              <span>Modules</span>
            </button>

            <button
              onClick={() => setActiveSidebarTab('premium')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 transition-all cursor-pointer"
            >
              <Crown className="w-4 h-4 text-amber-400" />
              <span>Premium</span>
            </button>

            <button
              onClick={() => setActiveSidebarTab('market')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-neutral-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-neutral-400" />
              <span>Market</span>
            </button>

            <button
              onClick={() => setActiveSidebarTab('botpanel')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 transition-all cursor-pointer"
            >
              <Cpu className="w-4 h-4 text-sky-400" />
              <span>BotPanel</span>
            </button>

            <button
              onClick={() => setActiveSidebarTab('hosting')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-teal-300 hover:text-teal-200 hover:bg-teal-500/10 transition-all cursor-pointer"
            >
              <Gem className="w-4 h-4 text-teal-400" />
              <span>Priority Hosting</span>
            </button>

            <button
              onClick={() => setActiveSidebarTab('free_premium')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Gift className="w-4 h-4 text-emerald-400" />
                <span>Free Premium</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30">
                Free!
              </span>
            </button>
          </div>

          {/* Grupa: Settings */}
          <div className="px-3 pt-3 pb-1">
            <div className="text-[10px] font-black tracking-wider uppercase text-neutral-500 px-3 mb-1">
              Settings
            </div>
            <div className="space-y-0.5">
              {[
                { icon: Settings, label: 'Settings' },
                { icon: Share2, label: 'Invite' },
                { icon: Database, label: 'Data Storage' },
                { icon: Server, label: 'Servers' },
                { icon: Activity, label: 'Status' },
                { icon: Users, label: 'Collab' },
                { icon: AlertTriangle, label: 'Error Logs' },
                { icon: Award, label: 'Active Developer Badge' }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      if (item.label === 'Servers') onBackToDashboard();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                  >
                    <Icon className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grupa: Featured & Favourited */}
          <div className="px-3 pt-3 pb-4">
            <div className="text-[10px] font-black tracking-wider uppercase text-neutral-500 px-3 mb-1">
              Featured & Favourited
            </div>
            <div className="space-y-0.5">
              {[
                { icon: Terminal, label: 'Custom Commands', active: true },
                { icon: Calendar, label: 'Custom Events' },
                { icon: Clock, label: 'Timed Events' },
                { icon: Database, label: 'Data Storage' },
                { icon: Webhook, label: 'Webhooks' },
                { icon: FileText, label: 'Transcripts' },
                { icon: FileCode, label: 'IFTTT' },
                { icon: MessageSquare, label: 'Message Builder' },
                { icon: Shield, label: 'Moderation' }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      if (item.label === 'Custom Commands') {
                        if (flows.length > 0) onOpenCommand(flows[0].id);
                        else onCreateNewCommand();
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      item.active
                        ? 'text-red-400 bg-red-500/10 font-bold'
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${item.active ? 'text-red-400' : 'text-neutral-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* GŁÓWNA TREŚĆ: BANNER + BUILDERS + FEATURED & FAVOURITED */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 bg-[#14151a]">
          {/* =============================================================== */}
          {/* HERO BANNER: "Try Premium Free: 24 Hours Access"               */}
          {/* =============================================================== */}
          {!bannerDismissed && (
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#1e1c3a] via-[#1a1b32] to-[#251d3b] border border-[#3b3464] p-6 sm:p-8 shadow-2xl">
              {/* Efekt migoczących gwiazdek w tle */}
              <div className="absolute inset-0 pointer-events-none opacity-40">
                <div className="absolute top-4 left-1/3 text-amber-300 text-xs">✦</div>
                <div className="absolute top-10 right-1/4 text-white text-sm">✨</div>
                <div className="absolute bottom-6 left-1/2 text-purple-300 text-xs">✦</div>
                <div className="absolute top-6 right-1/3 text-indigo-200 text-sm">✨</div>
              </div>

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="max-w-2xl space-y-3">
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Try Premium Free: 24 Hours Access
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-300 font-medium leading-relaxed">
                    Join our server and unlock <strong className="text-indigo-400">24 hours</strong> of premium features completely free! Experience the full power of our bot with unlimited access to all premium commands and features.
                  </p>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => alert('Przyznano darmowe 24h Premium dla bota!')}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6b46c1] to-[#805ad5] hover:from-[#553c9a] hover:to-[#6b46c1] text-white font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-purple-950/50 cursor-pointer active:scale-95"
                    >
                      Claim Premium
                    </button>
                    <button
                      onClick={() => window.open('https://discord.gg', '_blank')}
                      className="px-5 py-2.5 rounded-xl bg-[#272836] hover:bg-[#303142] text-white font-bold text-xs sm:text-sm transition-all border border-[#404154] flex items-center gap-2 cursor-pointer"
                    >
                      <span>Join Server</span>
                      <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Maskotka czerwonego duszka BotGhost z wyciągniętymi rękami */}
                <div className="shrink-0 flex items-center justify-center">
                  <div className="relative w-28 h-28 sm:w-36 sm:h-36">
                    <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-2xl">
                      {/* Ciało duszka */}
                      <path
                        d="M60 14 C40 14, 28 32, 28 56 C28 84, 34 100, 42 96 C48 92, 54 102, 60 98 C66 94, 72 102, 78 96 C86 90, 92 84, 92 56 C92 32, 80 14, 60 14 Z"
                        fill="#ff4d4d"
                      />
                      {/* Ręce rozłożone */}
                      <path d="M28 50 C18 42, 10 46, 12 54 C14 62, 24 64, 28 58 Z" fill="#ff4d4d" />
                      <path d="M92 50 C102 42, 110 46, 108 54 C106 62, 96 64, 92 58 Z" fill="#ff4d4d" />
                      {/* Oczy z wyrazem zaskoczenia / radości */}
                      <ellipse cx="48" cy="46" rx="7" ry="10" fill="#ffffff" />
                      <ellipse cx="72" cy="46" rx="7" ry="10" fill="#ffffff" />
                      <circle cx="50" cy="46" r="4.5" fill="#14151a" />
                      <circle cx="70" cy="46" r="4.5" fill="#14151a" />
                      <circle cx="52" cy="43" r="1.5" fill="#ffffff" />
                      <circle cx="72" cy="43" r="1.5" fill="#ffffff" />
                      {/* Otwarta buzia */}
                      <ellipse cx="60" cy="64" rx="8" ry="10" fill="#14151a" />
                      <path d="M54 68 C57 72, 63 72, 66 68 Z" fill="#ff9999" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* SEKCJA 1: MODULES -> "Builders" (3 DUŻE KARTY Z OBRAZKA 1)       */}
          {/* =============================================================== */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                  MODULES
                </span>
                <h3 className="text-xl font-black text-white tracking-tight">
                  Builders
                </h3>
              </div>

              {/* Pole wyszukiwania z czerwoną lupą */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-red-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search modules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#1c1d24] border border-[#2e2f3a] rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
            </div>

            {/* 3 Duże Karty Kreatorów */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 1. Command Builder */}
              <div
                id="botghost-card-command-builder"
                onClick={() => {
                  if (flows.length > 0) onOpenCommand(flows[0].id);
                  else onCreateNewCommand();
                }}
                className="group p-6 rounded-2xl bg-[#1d1e25] hover:bg-[#23242d] border border-[#2a2b36] hover:border-amber-500/60 transition-all cursor-pointer shadow-lg flex flex-col justify-center min-h-[140px]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-[#14151a] shrink-0 shadow-md shadow-amber-950/40 group-hover:scale-105 transition-transform">
                    <Hammer className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-white group-hover:text-amber-400 transition-colors">
                      Command Builder
                    </h4>
                    <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                      Click here to start building a custom command.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Event Builder */}
              <div
                id="botghost-card-event-builder"
                onClick={() => {
                  const eventFlow = flows.find((f) => f.trigger.type === 'member_join' || f.trigger.type === 'member_leave');
                  if (eventFlow) onOpenCommand(eventFlow.id);
                  else onCreateNewCommand();
                }}
                className="group p-6 rounded-2xl bg-[#1d1e25] hover:bg-[#23242d] border border-[#2a2b36] hover:border-amber-500/60 transition-all cursor-pointer shadow-lg flex flex-col justify-center min-h-[140px]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-[#14151a] shrink-0 shadow-md shadow-amber-950/40 group-hover:scale-105 transition-transform">
                    <Hammer className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-white group-hover:text-amber-400 transition-colors">
                      Event Builder
                    </h4>
                    <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                      Click here to start building a custom event.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Message Builder */}
              <div
                id="botghost-card-message-builder"
                onClick={() => {
                  const msgFlow = flows.find((f) => f.trigger.type === 'message_sent');
                  if (msgFlow) onOpenCommand(msgFlow.id);
                  else onCreateNewCommand();
                }}
                className="group p-6 rounded-2xl bg-[#1d1e25] hover:bg-[#23242d] border border-[#2a2b36] hover:border-amber-500/60 transition-all cursor-pointer shadow-lg flex flex-col justify-center min-h-[140px]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-[#14151a] shrink-0 shadow-md shadow-amber-950/40 group-hover:scale-105 transition-transform">
                    <FileText className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-white group-hover:text-amber-400 transition-colors">
                      Message Builder
                    </h4>
                    <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                      Create and manage reusable Discord embed messages.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =============================================================== */}
          {/* SEKCJA 2: MODULES -> "Featured & Favourited" (4 OKRĄGŁE IKONY)   */}
          {/* =============================================================== */}
          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                MODULES
              </span>
              <h3 className="text-xl font-black text-white tracking-tight">
                Featured & Favourited
              </h3>
            </div>

            {/* 4 Karty z Okrągłymi Ikonami */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Custom Commands */}
              <div
                onClick={() => {
                  if (flows.length > 0) onOpenCommand(flows[0].id);
                  else onCreateNewCommand();
                }}
                className="group p-6 rounded-2xl bg-[#1d1e25] hover:bg-[#23242d] border border-[#2a2b36] hover:border-red-500/50 transition-all cursor-pointer shadow-lg flex flex-col items-center text-center space-y-3"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-600 to-red-500 p-0.5 shadow-lg shadow-red-950/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <div className="w-full h-full rounded-full bg-[#1c1d24] flex items-center justify-center">
                    <span className="font-mono text-xl font-black text-red-400">/</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-black text-white group-hover:text-red-400 transition-colors">
                    Custom Commands
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                    Create complex slash commands to personalize your bot
                  </p>
                </div>
              </div>

              {/* 2. Custom Events */}
              <div
                onClick={onCreateNewCommand}
                className="group p-6 rounded-2xl bg-[#1d1e25] hover:bg-[#23242d] border border-[#2a2b36] hover:border-red-500/50 transition-all cursor-pointer shadow-lg flex flex-col items-center text-center space-y-3"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-600 to-red-500 p-0.5 shadow-lg shadow-red-950/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <div className="w-full h-full rounded-full bg-[#1c1d24] flex items-center justify-center">
                    <Calendar className="w-7 h-7 text-red-400" />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-black text-white group-hover:text-red-400 transition-colors">
                    Custom Events
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                    Create complex events to personalize your bot
                  </p>
                </div>
              </div>

              {/* 3. Timed Events */}
              <div
                onClick={onCreateNewCommand}
                className="group p-6 rounded-2xl bg-[#1d1e25] hover:bg-[#23242d] border border-[#2a2b36] hover:border-red-500/50 transition-all cursor-pointer shadow-lg flex flex-col items-center text-center space-y-3"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-600 to-red-500 p-0.5 shadow-lg shadow-red-950/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <div className="w-full h-full rounded-full bg-[#1c1d24] flex items-center justify-center">
                    <Clock className="w-7 h-7 text-red-400" />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-black text-white group-hover:text-red-400 transition-colors">
                    Timed Events
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                    Trigger custom events through schedules or intervals
                  </p>
                </div>
              </div>

              {/* 4. Data Storage */}
              <div
                onClick={() => alert('Zmienne i pamięć podręczna są aktywne w KitekBot v6.0.0!')}
                className="group p-6 rounded-2xl bg-[#1d1e25] hover:bg-[#23242d] border border-[#2a2b36] hover:border-sky-500/50 transition-all cursor-pointer shadow-lg flex flex-col items-center text-center space-y-3"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-sky-600 to-cyan-400 p-0.5 shadow-lg shadow-sky-950/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <div className="w-full h-full rounded-full bg-[#1c1d24] flex items-center justify-center">
                    <Database className="w-7 h-7 text-sky-400" />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-black text-white group-hover:text-sky-400 transition-colors">
                    Data Storage
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                    Create custom variables to store data for your bot
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* =============================================================== */}
          {/* SEKCJA 3: TWOJE AKTYWNE KOMENDY BOTA (ZARZĄDZANIE)               */}
          {/* =============================================================== */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                  ZARZĄDZANIE KOMENDAMI
                </span>
                <h3 className="text-xl font-black text-white tracking-tight">
                  Twoje Komendy ({flows.length})
                </h3>
              </div>

              <button
                id="botghost-create-command-btn"
                onClick={onCreateNewCommand}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-950/40 cursor-pointer active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Utwórz nową komendę</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFlows.map((flow) => (
                <div
                  key={flow.id}
                  onClick={() => onOpenCommand(flow.id)}
                  className="p-5 rounded-2xl bg-[#191a22] hover:bg-[#1f202a] border border-[#272834] hover:border-red-500/60 transition-all cursor-pointer group flex flex-col justify-between shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {flow.trigger.commandName ? `/${flow.trigger.commandName}` : flow.trigger.type}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFlow(flow.id);
                        }}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                          flow.enabled
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-neutral-800 text-neutral-500 border-neutral-700'
                        }`}
                      >
                        {flow.enabled ? 'Aktywna' : 'Wyłączona'}
                      </button>
                    </div>

                    <h4 className="text-base font-black text-white group-hover:text-red-400 transition-colors">
                      {flow.name}
                    </h4>
                    <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                      {flow.description || 'Brak opisu komendy'}
                    </p>

                    <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                      {flow.steps.slice(0, 3).map((st, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-black/40 border border-white/10 text-[10px] text-neutral-300 font-semibold"
                        >
                          {st.type}
                        </span>
                      ))}
                      {flow.steps.length > 3 && (
                        <span className="text-[10px] text-neutral-500 font-bold">
                          +{flow.steps.length - 3} więcej
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#242530] flex items-center justify-between text-xs">
                    <span className="text-red-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Otwórz w edytorze</span>
                      <span className="text-sm">→</span>
                    </span>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onDuplicateCommand(flow)}
                        title="Duplikuj komendę"
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteCommand(flow.id)}
                        title="Usuń komendę"
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
