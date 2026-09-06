import React, { useState } from 'react';
import {
  Search,
  Plus,
  Layers,
  MessageSquare,
  Split,
  UserCheck,
  UserX,
  VolumeX,
  Trash2,
  Ban,
  Clock,
  Sparkles,
  Ticket,
  FolderPlus,
  EyeOff,
  Mail,
  Smile,
  AlertCircle,
  Tag,
  ChevronRight,
  ChevronDown,
  FileCode,
  Zap,
  Sliders,
  Radio,
  ExternalLink
} from 'lucide-react';
import { ActionStepType, ActionStepCategory, ActionTriggerType } from '../../types/guildConfig';

interface BotGhostToolboxProps {
  onAddStep: (type: ActionStepType) => void;
  onChangeTrigger: () => void;
  onOpenVariables: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export interface ToolboxBlockItem {
  type: ActionStepType;
  title: string;
  badge: string;
  desc: string;
  icon: any;
  category: ActionStepCategory;
  categoryLabel: string;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
}

export const TOOLBOX_BLOCKS: ToolboxBlockItem[] = [
  // --- KATEGORIA: LOGIKA I KONTROLA (Fiolet) ---
  {
    type: 'condition_if',
    title: 'Warunek IF (Jeżeli...)',
    badge: 'Logika & IF',
    desc: 'Rozgałęzienie przepływu: gałęzie THEN i ELSE w zależności od roli lub uprawnień',
    icon: Split,
    category: 'logic',
    categoryLabel: 'Logika & Przepływ',
    color: 'text-purple-300',
    bgColor: 'bg-purple-500/10 hover:bg-purple-500/20',
    borderColor: 'border-purple-500/30 hover:border-purple-400',
    glowColor: 'shadow-purple-950/40'
  },
  {
    type: 'wait',
    title: 'Opóźnienie (Wait / Delay)',
    badge: 'Czekaj',
    desc: 'Wstrzymuje wykonanie kolejnych akcji o zadany czas w sekundach',
    icon: Clock,
    category: 'logic',
    categoryLabel: 'Logika & Przepływ',
    color: 'text-purple-300',
    bgColor: 'bg-purple-500/10 hover:bg-purple-500/20',
    borderColor: 'border-purple-500/30 hover:border-purple-400',
    glowColor: 'shadow-purple-950/40'
  },
  {
    type: 'cooldown',
    title: 'Cooldown (Limit użycia)',
    badge: 'Ograniczenie',
    desc: 'Limituje częstotliwość użycia komendy na użytkownika (np. raz na 15s)',
    icon: Clock,
    category: 'logic',
    categoryLabel: 'Logika & Przepływ',
    color: 'text-purple-300',
    bgColor: 'bg-purple-500/10 hover:bg-purple-500/20',
    borderColor: 'border-purple-500/30 hover:border-purple-400',
    glowColor: 'shadow-purple-950/40'
  },
  {
    type: 'stop_flow',
    title: 'Zatrzymaj (Stop Flow)',
    badge: 'Przerwij',
    desc: 'Natychmiast przerywa dalsze wykonywanie komendy',
    icon: AlertCircle,
    category: 'logic',
    categoryLabel: 'Logika & Przepływ',
    color: 'text-purple-300',
    bgColor: 'bg-purple-500/10 hover:bg-purple-500/20',
    borderColor: 'border-purple-500/30 hover:border-purple-400',
    glowColor: 'shadow-purple-950/40'
  },
  {
    type: 'random_choice',
    title: 'Losowy Wybór (Random)',
    badge: 'Losowość',
    desc: 'Losuje jedną z przygotowanych odpowiedzi tekstowych',
    icon: Sparkles,
    category: 'logic',
    categoryLabel: 'Logika & Przepływ',
    color: 'text-purple-300',
    bgColor: 'bg-purple-500/10 hover:bg-purple-500/20',
    borderColor: 'border-purple-500/30 hover:border-purple-400',
    glowColor: 'shadow-purple-950/40'
  },

  // --- KATEGORIA: WIADOMOŚCI I EMBEDY (Zieleń / Szmaragd) ---
  {
    type: 'send_message',
    title: 'Wyślij Wiadomość',
    badge: 'Wiadomość',
    desc: 'Standardowa wiadomość tekstowa na kanale Discord',
    icon: MessageSquare,
    category: 'message',
    categoryLabel: 'Wiadomości & Treść',
    color: 'text-emerald-300',
    bgColor: 'bg-emerald-500/10 hover:bg-emerald-500/20',
    borderColor: 'border-emerald-500/30 hover:border-emerald-400',
    glowColor: 'shadow-emerald-950/40'
  },
  {
    type: 'send_embed',
    title: 'Wyślij Kartę Embed',
    badge: 'Rich Embed',
    desc: 'Elegancka karta z kolorowym paskiem, autorem, opisem i stopką',
    icon: Layers,
    category: 'message',
    categoryLabel: 'Wiadomości & Treść',
    color: 'text-emerald-300',
    bgColor: 'bg-emerald-500/10 hover:bg-emerald-500/20',
    borderColor: 'border-emerald-500/30 hover:border-emerald-400',
    glowColor: 'shadow-emerald-950/40'
  },
  {
    type: 'send_ephemeral',
    title: 'Odpowiedź Ephemeral',
    badge: 'Tylko dla autora',
    desc: 'Dyskretna odpowiedź widoczna tylko dla osoby wpisującej komendę',
    icon: EyeOff,
    category: 'message',
    categoryLabel: 'Wiadomości & Treść',
    color: 'text-emerald-300',
    bgColor: 'bg-emerald-500/10 hover:bg-emerald-500/20',
    borderColor: 'border-emerald-500/30 hover:border-emerald-400',
    glowColor: 'shadow-emerald-950/40'
  },
  {
    type: 'send_dm',
    title: 'Wyślij Wiadomość DM',
    badge: 'Prywatna DM',
    desc: 'Wysyła bezpośrednią wiadomość na skrzynkę użytkownika',
    icon: Mail,
    category: 'message',
    categoryLabel: 'Wiadomości & Treść',
    color: 'text-emerald-300',
    bgColor: 'bg-emerald-500/10 hover:bg-emerald-500/20',
    borderColor: 'border-emerald-500/30 hover:border-emerald-400',
    glowColor: 'shadow-emerald-950/40'
  },
  {
    type: 'add_reaction',
    title: 'Dodaj Reakcję Emoji',
    badge: 'Reakcja',
    desc: 'Dodaje emoji pod wywołaną wiadomością użytkownika',
    icon: Smile,
    category: 'message',
    categoryLabel: 'Wiadomości & Treść',
    color: 'text-emerald-300',
    bgColor: 'bg-emerald-500/10 hover:bg-emerald-500/20',
    borderColor: 'border-emerald-500/30 hover:border-emerald-400',
    glowColor: 'shadow-emerald-950/40'
  },
  {
    type: 'delete_message',
    title: 'Usuń Wiadomość',
    badge: 'Czyszczenie',
    desc: 'Kasuje wpis użytkownika, aby zachować porządek na kanale',
    icon: Trash2,
    category: 'message',
    categoryLabel: 'Wiadomości & Treść',
    color: 'text-emerald-300',
    bgColor: 'bg-emerald-500/10 hover:bg-emerald-500/20',
    borderColor: 'border-emerald-500/30 hover:border-emerald-400',
    glowColor: 'shadow-emerald-950/40'
  },
  {
    type: 'purge_messages',
    title: 'Wyczyść Czat (Purge)',
    badge: 'Czystka',
    desc: 'Kasuje określoną liczbę ostatnich wiadomości z kanału',
    icon: Trash2,
    category: 'message',
    categoryLabel: 'Wiadomości & Treść',
    color: 'text-emerald-300',
    bgColor: 'bg-emerald-500/10 hover:bg-emerald-500/20',
    borderColor: 'border-emerald-500/30 hover:border-emerald-400',
    glowColor: 'shadow-emerald-950/40'
  },

  // --- KATEGORIA: ROLE I UŻYTKOWNICY (Błękit / Indigo) ---
  {
    type: 'give_role',
    title: 'Nadaj Rolę',
    badge: 'Rola +',
    desc: 'Automatycznie przypisuje wybraną rangę użytkownikowi',
    icon: UserCheck,
    category: 'member',
    categoryLabel: 'Role & Członkowie',
    color: 'text-sky-300',
    bgColor: 'bg-sky-500/10 hover:bg-sky-500/20',
    borderColor: 'border-sky-500/30 hover:border-sky-400',
    glowColor: 'shadow-sky-950/40'
  },
  {
    type: 'remove_role',
    title: 'Odbierz Rolę',
    badge: 'Rola -',
    desc: 'Odbiera określoną rangę użytkownikowi na serwerze',
    icon: UserX,
    category: 'member',
    categoryLabel: 'Role & Członkowie',
    color: 'text-sky-300',
    bgColor: 'bg-sky-500/10 hover:bg-sky-500/20',
    borderColor: 'border-sky-500/30 hover:border-sky-400',
    glowColor: 'shadow-sky-950/40'
  },
  {
    type: 'change_nickname',
    title: 'Zmień Pseudonim (Nick)',
    badge: 'Nick',
    desc: 'Modyfikuje pseudonim użytkownika na serwerze Discord',
    icon: Tag,
    category: 'member',
    categoryLabel: 'Role & Członkowie',
    color: 'text-sky-300',
    bgColor: 'bg-sky-500/10 hover:bg-sky-500/20',
    borderColor: 'border-sky-500/30 hover:border-sky-400',
    glowColor: 'shadow-sky-950/40'
  },

  // --- KATEGORIA: MODERACJA (Czerwień / Róż) ---
  {
    type: 'timeout_member',
    title: 'Wycisz (Timeout)',
    badge: 'Wyciszenie',
    desc: 'Blokuje możliwość pisania i mówienia na określony czas',
    icon: VolumeX,
    category: 'moderation',
    categoryLabel: 'Moderacja & Kary',
    color: 'text-rose-300',
    bgColor: 'bg-rose-500/10 hover:bg-rose-500/20',
    borderColor: 'border-rose-500/30 hover:border-rose-400',
    glowColor: 'shadow-rose-950/40'
  },
  {
    type: 'kick_member',
    title: 'Wyrzuć (Kick)',
    badge: 'Wyrzucenie',
    desc: 'Wyrzuca gracza z serwera z podanym powodem w audycie',
    icon: UserX,
    category: 'moderation',
    categoryLabel: 'Moderacja & Kary',
    color: 'text-rose-300',
    bgColor: 'bg-rose-500/10 hover:bg-rose-500/20',
    borderColor: 'border-rose-500/30 hover:border-rose-400',
    glowColor: 'shadow-rose-950/40'
  },
  {
    type: 'ban_member',
    title: 'Zbanuj (Ban)',
    badge: 'Permanentny Ban',
    desc: 'Blokuje użytkownikowi permanentnie dostęp do serwera',
    icon: Ban,
    category: 'moderation',
    categoryLabel: 'Moderacja & Kary',
    color: 'text-red-400',
    bgColor: 'bg-red-500/15 hover:bg-red-500/25',
    borderColor: 'border-red-500/30 hover:border-red-400',
    glowColor: 'shadow-red-950/40'
  },

  // --- KATEGORIA: KANAŁY I TICKETY (Bursztyn) ---
  {
    type: 'create_ticket',
    title: 'Utwórz Kanał Ticketu',
    badge: 'Ticket Room',
    desc: 'Tworzy prywatny pokój zgłoszenia z dostępem dla autora i administracji',
    icon: Ticket,
    category: 'channel',
    categoryLabel: 'Kanały & Tickety',
    color: 'text-amber-300',
    bgColor: 'bg-amber-500/10 hover:bg-amber-500/20',
    borderColor: 'border-amber-500/30 hover:border-amber-400',
    glowColor: 'shadow-amber-950/40'
  },
  {
    type: 'create_channel',
    title: 'Utwórz Nowy Kanał',
    badge: 'Kanał +',
    desc: 'Tworzy kanał tekstowy lub głosowy w wybranej kategorii',
    icon: FolderPlus,
    category: 'channel',
    categoryLabel: 'Kanały & Tickety',
    color: 'text-amber-300',
    bgColor: 'bg-amber-500/10 hover:bg-amber-500/20',
    borderColor: 'border-amber-500/30 hover:border-amber-400',
    glowColor: 'shadow-amber-950/40'
  }
];

export function BotGhostToolbox({
  onAddStep,
  onChangeTrigger,
  onOpenVariables,
  isOpen,
  onToggle
}: BotGhostToolboxProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<ActionStepCategory | 'all'>('all');

  const filteredBlocks = TOOLBOX_BLOCKS.filter((b) => {
    const matchesCat = activeCategory === 'all' || b.category === activeCategory;
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.desc.toLowerCase().includes(search.toLowerCase()) ||
      b.badge.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <aside
      className={`shrink-0 bg-[#17181f] border-r border-[#2d2e38] flex flex-col transition-all duration-200 z-20 select-none ${
        isOpen ? 'w-80' : 'w-14'
      }`}
    >
      {/* Pasek nagłówka przybornika */}
      <div className="p-3.5 border-b border-[#2d2e38] flex items-center justify-between gap-2">
        {isOpen ? (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-[#5865F2]/20 text-[#8590ff] border border-[#5865F2]/40">
              <Layers className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-black text-white uppercase tracking-wider truncate">
                Przybornik Akcji
              </h3>
              <span className="text-[10px] text-neutral-400 font-medium truncate block">
                Styl BotGhost Builder
              </span>
            </div>
          </div>
        ) : (
          <button
            onClick={onToggle}
            title="Rozwiń przybornik bloków"
            className="w-full flex justify-center text-[#8590ff] hover:text-white p-1"
          >
            <Layers className="w-5 h-5" />
          </button>
        )}

        {isOpen && (
          <button
            onClick={onToggle}
            title="Zwiń pasek boczny"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <>
          {/* Wyszukiwarka bloków */}
          <div className="p-3 border-b border-[#2d2e38] space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Szukaj klocka akcji..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#121318] border border-[#31323f] rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#5865F2]"
              />
            </div>

            {/* Zakładki kategorii */}
            <div className="flex items-center gap-1 overflow-x-auto text-[11px] pb-0.5">
              {[
                { id: 'all', label: 'Wszystkie' },
                { id: 'logic', label: '🧠 Logika' },
                { id: 'message', label: '💬 Treść' },
                { id: 'member', label: '🛡️ Role' },
                { id: 'moderation', label: '⚔️ Kary' },
                { id: 'channel', label: '📁 Kanały' }
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id as any)}
                  className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer ${
                    activeCategory === c.id
                      ? 'bg-[#5865F2] text-white'
                      : 'bg-[#21222b] text-neutral-400 hover:text-white'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Szybka akcja zmiany wyzwalacza */}
          <div className="px-3 pt-3">
            <button
              onClick={onChangeTrigger}
              className="w-full p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-left transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Zap className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <div className="min-w-0">
                  <div className="text-xs font-black truncate">Zmień Wyzwalacz (Trigger)</div>
                  <div className="text-[10px] text-amber-300/70 truncate">Slash, czat, reakcja, join</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-400/60 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Przewijana lista klocków do kliknięcia lub przeciągnięcia */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <div className="text-[10px] font-black uppercase tracking-wider text-neutral-400 px-1 flex items-center justify-between">
              <span>Klocki akcji</span>
              <span className="text-[#8590ff] font-bold">Chwyć i przeciągnij</span>
            </div>

            {filteredBlocks.map((block) => {
              const Icon = block.icon;
              return (
                <div
                  key={block.type}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/json', JSON.stringify({ type: block.type }));
                    e.dataTransfer.setData('text/plain', block.type);
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  onClick={() => onAddStep(block.type)}
                  className={`p-2.5 rounded-xl border transition-all flex items-start gap-2.5 cursor-grab active:cursor-grabbing group hover:scale-[1.01] active:scale-[0.99] select-none ${block.bgColor} ${block.borderColor} ${block.glowColor}`}
                  title="Kliknij lub przeciągnij na planszę w dowolne miejsce!"
                >
                  <div className={`p-1.5 rounded-lg bg-black/30 ${block.color} shrink-0 group-hover:scale-110 transition-transform mt-0.5 pointer-events-none`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1 pointer-events-none">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-white group-hover:text-white truncate">
                        {block.title}
                      </span>
                      <Plus className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-colors shrink-0" />
                    </div>
                    <p className="text-[10px] text-neutral-400 line-clamp-2 mt-0.5 leading-tight">
                      {block.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dolny przycisk szybkiego wywołania Zmiennych */}
          <div className="p-3 border-t border-[#2d2e38] bg-[#14151b]">
            <button
              onClick={onOpenVariables}
              className="w-full py-2 px-3 rounded-xl bg-[#23242e] hover:bg-[#2b2c39] border border-[#363847] hover:border-[#5865F2] text-xs font-bold text-neutral-300 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#8590ff]" />
              <span>Zmienne Discord {"{x}"}</span>
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
