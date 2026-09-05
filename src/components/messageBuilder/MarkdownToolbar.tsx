import React, { useState } from 'react';
import { Bold, Italic, Underline, Strikethrough, AtSign, Smile } from 'lucide-react';

interface MarkdownToolbarProps {
  onInsert: (prefix: string, suffix?: string) => void;
  charCount?: number;
  maxChars?: number;
}

const COMMON_EMOJIS = ['👋', '🎉', '🌟', '🛡️', '✅', '❌', '💬', '🚀', '👑', '🔥', '📌', '🔔'];

export const MarkdownToolbar: React.FC<MarkdownToolbarProps> = ({
  onInsert,
  charCount,
  maxChars,
}) => {
  const [showEmoji, setShowEmoji] = useState(false);

  return (
    <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-[#1a1b22] border-t border-[#363744] text-xs text-neutral-400">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onInsert('**', '**')}
          title="Pogrubienie (Bold)"
          className="p-1 rounded hover:bg-[#282935] hover:text-white transition-colors cursor-pointer"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onInsert('*', '*')}
          title="Kursywa (Italic)"
          className="p-1 rounded hover:bg-[#282935] hover:text-white transition-colors cursor-pointer"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onInsert('__', '__')}
          title="Podkreślenie (Underline)"
          className="p-1 rounded hover:bg-[#282935] hover:text-white transition-colors cursor-pointer"
        >
          <Underline className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onInsert('~~', '~~')}
          title="Przekreślenie (Strikethrough)"
          className="p-1 rounded hover:bg-[#282935] hover:text-white transition-colors cursor-pointer"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>
        <div className="w-[1px] h-3.5 bg-[#363744] mx-1" />
        <button
          type="button"
          onClick={() => onInsert('{user}', '')}
          title="Oznacz użytkownika ({user})"
          className="p-1 rounded hover:bg-[#282935] hover:text-indigo-400 transition-colors cursor-pointer flex items-center gap-0.5 font-bold text-[11px]"
        >
          <AtSign className="w-3.5 h-3.5" />
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmoji(!showEmoji)}
            title="Wstaw emotikonę"
            className="p-1 rounded hover:bg-[#282935] hover:text-amber-400 transition-colors cursor-pointer"
          >
            <Smile className="w-3.5 h-3.5" />
          </button>
          {showEmoji && (
            <div className="absolute left-0 bottom-full mb-1 p-2 bg-[#202128] border border-[#363744] rounded-xl shadow-2xl z-50 grid grid-cols-4 gap-1 animate-in fade-in zoom-in-95">
              {COMMON_EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => {
                    onInsert(e, '');
                    setShowEmoji(false);
                  }}
                  className="w-7 h-7 flex items-center justify-center text-sm hover:bg-[#2e2f3b] rounded cursor-pointer transition-colors"
                >
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {maxChars !== undefined && (
        <span className={`text-[11px] font-mono ${charCount && charCount > maxChars ? 'text-rose-400 font-bold' : 'text-neutral-500'}`}>
          {charCount ?? 0} / {maxChars}
        </span>
      )}
    </div>
  );
};
