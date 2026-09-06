import React from 'react';
import { X, Copy, Check, Hash, User, Shield, Server, Sparkles, Terminal } from 'lucide-react';

interface BotGhostVariablesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVariable?: (variable: string) => void;
}

interface VariableDef {
  tag: string;
  name: string;
  desc: string;
  example: string;
  category: 'user' | 'server' | 'channel' | 'command' | 'random';
}

const VARIABLES: VariableDef[] = [
  {
    tag: '{user}',
    name: 'Wzmianka użytkownika',
    desc: 'Wstawia klikalną wzmiankę (@Użytkownik) osoby wywołującej',
    example: '@JanKowalski',
    category: 'user'
  },
  {
    tag: '{user.name}',
    name: 'Nazwa użytkownika',
    desc: 'Sama nazwa użytkownika bez symbolu @',
    example: 'JanKowalski',
    category: 'user'
  },
  {
    tag: '{user.id}',
    name: 'ID Użytkownika',
    desc: 'Unikalny numeryczny identyfikator Discord użytkownika',
    example: '1368350667634376785',
    category: 'user'
  },
  {
    tag: '{user.avatar}',
    name: 'Awatar użytkownika',
    desc: 'Bezpośredni adres URL do zdjęcia profilowego użytkownika',
    example: 'https://cdn.discordapp.com/avatars/...',
    category: 'user'
  },
  {
    tag: '{server.name}',
    name: 'Nazwa serwera',
    desc: 'Aktualna nazwa serwera Discord',
    example: 'Oficjalny Serwer KitekBot',
    category: 'server'
  },
  {
    tag: '{server.memberCount}',
    name: 'Liczba członków',
    desc: 'Całkowita liczba członków obecnych na serwerze',
    example: '142',
    category: 'server'
  },
  {
    tag: '{server.id}',
    name: 'ID Serwera',
    desc: 'Identyfikator serwera Discord (Guild ID)',
    example: '987654321098765432',
    category: 'server'
  },
  {
    tag: '{channel}',
    name: 'Wzmianka kanału',
    desc: 'Klikalna wzmianka o kanale (#ogólny)',
    example: '#ogólny',
    category: 'channel'
  },
  {
    tag: '{channel.name}',
    name: 'Nazwa kanału',
    desc: 'Tekstowa nazwa kanału, na którym wywołano akcję',
    example: 'ogólny',
    category: 'channel'
  },
  {
    tag: '{channel.id}',
    name: 'ID Kanału',
    desc: 'Identyfikator kanału Discord',
    example: '123456789012345678',
    category: 'channel'
  },
  {
    tag: '{args}',
    name: 'Argumenty komendy',
    desc: 'Wszystkie dodatkowe słowa/parametry wpisane po nazwie komendy',
    example: 'powód bana lub tekst',
    category: 'command'
  },
  {
    tag: '{random.1-100}',
    name: 'Losowa liczba (1-100)',
    desc: 'Generuje losową liczbę całkowitą z podanego zakresu',
    example: '42',
    category: 'random'
  }
];

export function BotGhostVariablesModal({ isOpen, onClose, onSelectVariable }: BotGhostVariablesModalProps) {
  const [copiedTag, setCopiedTag] = React.useState<string | null>(null);
  const [activeCategory, setActiveCategory] = React.useState<'all' | 'user' | 'server' | 'channel' | 'command'>('all');
  const [search, setSearch] = React.useState('');

  if (!isOpen) return null;

  const handleCopy = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    if (onSelectVariable) {
      onSelectVariable(tag);
    }
    setTimeout(() => setCopiedTag(null), 1800);
  };

  const filtered = VARIABLES.filter((v) => {
    const matchesCat = activeCategory === 'all' || v.category === activeCategory;
    const matchesSearch =
      v.tag.toLowerCase().includes(search.toLowerCase()) ||
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.desc.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-2xl bg-[#1e1f26] border border-[#3b3c4a] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Nagłówek w stylu BotGhost */}
        <div className="px-6 py-4 bg-[#181920] border-b border-[#2d2e38] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#5865F2]/10 border border-[#5865F2]/30 text-[#8590ff]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>Zmienne Dynamiczne Discord</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#5865F2]/20 text-[#8590ff] border border-[#5865F2]/40">
                  BotGhost Tags
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                Kliknij dowolny tag, aby go skopiować lub wstawić bezpośrednio do akcji.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wyszukiwarka i filtry */}
        <div className="p-4 bg-[#1a1b22] border-b border-[#2d2e38] space-y-3">
          <input
            type="text"
            placeholder="Szukaj zmiennej (np. {user}, serwer, avatar)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3.5 py-2 bg-[#131418] border border-[#343542] rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#5865F2]"
          />
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {[
              { id: 'all', label: 'Wszystkie' },
              { id: 'user', label: '👤 Użytkownik' },
              { id: 'server', label: '🌐 Serwer' },
              { id: 'channel', label: '💬 Kanał' },
              { id: 'command', label: '⚡ Komenda' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`px-3 py-1 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-[#5865F2] text-white'
                    : 'bg-[#23242e] text-neutral-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista zmiennych */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          {filtered.map((v) => (
            <div
              key={v.tag}
              onClick={() => handleCopy(v.tag)}
              className="p-3 rounded-xl bg-[#23242e] hover:bg-[#2a2b37] border border-[#343542] hover:border-[#5865F2] transition-all flex items-center justify-between gap-3 cursor-pointer group"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 group-hover:border-amber-400/50 transition-colors">
                    {v.tag}
                  </span>
                  <span className="text-xs font-bold text-white truncate">{v.name}</span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">{v.desc}</p>
                <span className="text-[10px] text-neutral-500 font-mono mt-0.5 block">
                  Przykład: <span className="text-neutral-300">{v.example}</span>
                </span>
              </div>

              <div className="shrink-0">
                {copiedTag === v.tag ? (
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Skopiowano
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-lg bg-[#181920] group-hover:bg-[#5865F2] text-neutral-400 group-hover:text-white text-xs font-bold flex items-center gap-1 transition-all">
                    <Copy className="w-3.5 h-3.5" /> Wstaw
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
