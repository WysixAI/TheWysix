import React from 'react';
import { Bot, Sparkles, MessageSquare } from 'lucide-react';

interface BotGhostEmbedPreviewProps {
  title?: string;
  description?: string;
  color?: string;
  footer?: string;
  includeTimestamp?: boolean;
  imageUrl?: string;
  thumbnailUrl?: string;
  serverName?: string;
}

export function BotGhostEmbedPreview({
  title = 'Tytuł Embedu',
  description = 'Opis wiadomości z obsługą zmiennych {user} i {server.name}...',
  color = '#5865F2',
  footer = 'KitekBot • System BotGhost',
  includeTimestamp = true,
  imageUrl,
  thumbnailUrl,
  serverName = 'Serwer Discord'
}: BotGhostEmbedPreviewProps) {
  // Podmienianie zmiennych poglądowych
  const formatText = (txt: string) => {
    return txt
      .replace(/{user}/g, '@Użytkownik')
      .replace(/{user.name}/g, 'Użytkownik')
      .replace(/{server.name}/g, serverName)
      .replace(/{channel}/g, '#ogólny')
      .replace(/{args}/g, 'przykładowy argument');
  };

  const parsedTitle = formatText(title || 'Brak tytułu');
  const parsedDesc = formatText(description || 'Brak treści wiadomości');
  const parsedFooter = formatText(footer || '');

  return (
    <div className="rounded-xl bg-[#2b2d31] p-3 text-neutral-200 shadow-lg border border-[#383a40] text-xs font-sans select-none">
      <div className="text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-neutral-300">
          <MessageSquare className="w-3.5 h-3.5 text-[#5865F2]" />
          Podgląd na żywo w Discordzie
        </span>
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/30 font-mono text-neutral-400">
          {color}
        </span>
      </div>

      {/* Kontener Embedu z pionowym paskiem koloru */}
      <div className="flex rounded-lg overflow-hidden bg-[#1e1f22] border border-[#2b2d31]">
        {/* Lewy kolorowy pasek */}
        <div
          className="w-1.5 shrink-0"
          style={{ backgroundColor: color || '#5865F2' }}
        />

        {/* Zawartość embedu */}
        <div className="p-3 space-y-2 flex-1 min-w-0">
          {/* Tytuł */}
          {parsedTitle && (
            <h4 className="font-bold text-sm text-white hover:underline cursor-pointer leading-snug break-words">
              {parsedTitle}
            </h4>
          )}

          {/* Opis */}
          {parsedDesc && (
            <p className="text-xs text-[#dbdee1] whitespace-pre-wrap leading-relaxed break-words">
              {parsedDesc}
            </p>
          )}

          {/* Obrazek główny */}
          {imageUrl && (
            <div className="mt-2 rounded-lg overflow-hidden border border-[#2b2d31] max-h-48 bg-black/20">
              <img
                src={imageUrl}
                alt="Embed attachment"
                className="w-full h-auto object-cover max-h-48"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Stopka i timestamp */}
          {(parsedFooter || includeTimestamp) && (
            <div className="pt-1.5 mt-1 border-t border-white/5 flex items-center gap-1.5 text-[10px] text-[#949ba4]">
              {parsedFooter && <span>{parsedFooter}</span>}
              {parsedFooter && includeTimestamp && <span>•</span>}
              {includeTimestamp && <span>Dzisiaj o {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
            </div>
          )}
        </div>

        {/* Miniaturka (Thumbnail) */}
        {thumbnailUrl && (
          <div className="p-3 pl-0 shrink-0 hidden sm:block">
            <img
              src={thumbnailUrl}
              alt="Thumbnail"
              className="w-14 h-14 rounded-lg object-cover bg-black/20 border border-white/5"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
