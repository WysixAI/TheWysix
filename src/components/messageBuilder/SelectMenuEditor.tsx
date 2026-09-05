import React, { useState } from 'react';
import { ComponentSelectMenu, SelectMenuOption } from '../../types/guildConfig';
import { ComponentActionEditor } from './ComponentActionEditor';
import { Plus, Trash2, ChevronDown, ChevronUp, Copy, Smile, ListFilter } from 'lucide-react';

interface SelectMenuEditorProps {
  menu: ComponentSelectMenu;
  onChange: (patch: Partial<ComponentSelectMenu>) => void;
}

const COMMON_EMOJIS = ['👋', '❓', '🌟', '🛡️', '💬', '🎉', '📢', '📌', '💎', '🔥', '⚙️', '🎁'];

export const SelectMenuEditor: React.FC<SelectMenuEditorProps> = ({ menu, onChange }) => {
  const [openOptionId, setOpenOptionId] = useState<string | null>(menu.options[0]?.id || null);
  const [openEmojiPicker, setOpenEmojiPicker] = useState<string | null>(null);

  const addOption = () => {
    if (menu.options.length >= 25) return;
    const newOpt: SelectMenuOption = {
      id: `opt-${Date.now()}`,
      label: `Opcja #${menu.options.length + 1}`,
      value: `val_${Date.now()}`,
      description: 'Opis wybranej opcji...',
      emoji: '💬',
      actions: [],
    };
    onChange({ options: [...menu.options, newOpt] });
    setOpenOptionId(newOpt.id);
  };

  const updateOption = (index: number, patch: Partial<SelectMenuOption>) => {
    const copy = [...menu.options];
    copy[index] = { ...copy[index], ...patch };
    onChange({ options: copy });
  };

  const duplicateOption = (index: number) => {
    if (menu.options.length >= 25) return;
    const item = menu.options[index];
    const copy: SelectMenuOption = {
      ...JSON.parse(JSON.stringify(item)),
      id: `opt-${Date.now()}`,
      value: `val_${Date.now()}`,
      label: `${item.label} (Kopia)`,
    };
    const list = [...menu.options];
    list.splice(index + 1, 0, copy);
    onChange({ options: list });
    setOpenOptionId(copy.id);
  };

  const removeOption = (index: number) => {
    onChange({ options: menu.options.filter((_, i) => i !== index) });
  };

  const clearOptions = () => {
    onChange({ options: [] });
  };

  return (
    <div className="space-y-4 pt-1">
      {/* Top row: Placeholder & Disabled */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
        <div className="sm:col-span-8 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold uppercase tracking-wider text-neutral-300 text-[11px]">
              Placeholder (Tekst zastępczy)
            </label>
            <span className="text-[11px] font-mono text-neutral-400">
              {(menu.placeholder || '').length} / 150
            </span>
          </div>
          <input
            type="text"
            value={menu.placeholder || ''}
            maxLength={150}
            onChange={(e) => onChange({ placeholder: e.target.value })}
            placeholder="Wybierz opcję z menu..."
            className="w-full bg-[#1e1f26] border border-[#363744] focus:border-[#5865F2] rounded-xl px-3 py-2 text-xs text-white placeholder:text-neutral-500 outline-none"
          />
        </div>

        <div className="sm:col-span-4 flex items-center justify-start sm:justify-end pb-2">
          <label className="flex items-center gap-2 text-xs font-bold text-neutral-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={Boolean(menu.disabled)}
              onChange={(e) => onChange({ disabled: e.target.checked })}
              className="accent-[#5865F2] w-4 h-4 rounded cursor-pointer"
            />
            <span>Zablokowane (Disabled)</span>
          </label>
        </div>
      </div>

      {/* Options Header & Clear */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <ListFilter className="w-4 h-4 text-[#5865F2]" />
          <span className="text-xs font-black uppercase tracking-wider text-white">
            Opcje Menu ({menu.options.length}/25)
          </span>
        </div>
        {menu.options.length > 0 && (
          <button
            type="button"
            onClick={clearOptions}
            className="px-2.5 py-1 text-rose-400 hover:text-rose-300 border border-rose-500/30 hover:border-rose-500/60 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            Wyczyść Opcje
          </button>
        )}
      </div>

      {/* Options Cards */}
      <div className="space-y-3">
        {menu.options.map((opt, oIdx) => {
          const isOpen = openOptionId === opt.id;

          return (
            <div
              key={opt.id}
              className="bg-[#1e1f26] border border-[#343542] rounded-xl overflow-hidden shadow-md transition-all"
            >
              {/* Option Bar */}
              <div className="p-3 bg-[#23242d] flex items-center justify-between gap-2 border-b border-[#2e2f3c]">
                <button
                  type="button"
                  onClick={() => setOpenOptionId(isOpen ? null : opt.id)}
                  className="flex items-center gap-2.5 flex-1 text-left cursor-pointer group"
                >
                  <div className="w-6 h-6 rounded-md bg-[#181920] border border-[#3b3c4b] flex items-center justify-center text-sm">
                    {opt.emoji || '💬'}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white group-hover:text-indigo-300 transition-colors">
                      {opt.label || `Opcja #${oIdx + 1}`}
                    </span>
                    {opt.actions && opt.actions.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-bold">
                        {opt.actions.length} {opt.actions.length === 1 ? 'akcja' : 'akcje'}
                      </span>
                    )}
                  </div>
                </button>

                <div className="flex items-center gap-1 text-neutral-400">
                  <button
                    type="button"
                    onClick={() => duplicateOption(oIdx)}
                    disabled={menu.options.length >= 25}
                    title="Duplikuj opcję"
                    className="p-1 hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeOption(oIdx)}
                    title="Usuń opcję"
                    className="p-1 hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenOptionId(isOpen ? null : opt.id)}
                    className="p-1 hover:text-white cursor-pointer"
                  >
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Option Details */}
              {isOpen && (
                <div className="p-4 space-y-4 text-xs bg-[#1a1b22]">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    {/* Emoji */}
                    <div className="sm:col-span-3 space-y-1 relative">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300">
                        Emoji
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setOpenEmojiPicker(openEmojiPicker === opt.id ? null : opt.id)}
                          className="w-10 h-9 rounded-xl bg-[#23242d] border border-[#383949] hover:border-[#5865F2] flex items-center justify-center text-lg cursor-pointer transition-colors"
                        >
                          {opt.emoji || <Smile className="w-4 h-4 text-neutral-400" />}
                        </button>
                        <input
                          type="text"
                          value={opt.emoji || ''}
                          onChange={(e) => updateOption(oIdx, { emoji: e.target.value })}
                          placeholder="np. 👋"
                          className="w-full bg-[#23242d] border border-[#383949] rounded-xl px-2 py-2 text-xs text-white placeholder:text-neutral-500"
                        />
                      </div>

                      {openEmojiPicker === opt.id && (
                        <div className="absolute left-0 top-full mt-1 p-2 bg-[#202128] border border-[#363744] rounded-xl shadow-2xl z-50 grid grid-cols-4 gap-1 animate-in fade-in zoom-in-95">
                          {COMMON_EMOJIS.map((e) => (
                            <button
                              key={e}
                              type="button"
                              onClick={() => {
                                updateOption(oIdx, { emoji: e });
                                setOpenEmojiPicker(null);
                              }}
                              className="w-7 h-7 flex items-center justify-center text-sm hover:bg-[#2e2f3b] rounded cursor-pointer transition-colors"
                            >
                              {e}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Label */}
                    <div className="sm:col-span-9 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-300">
                          Etykieta (Label)
                        </label>
                        <span className="text-[11px] font-mono text-neutral-400">
                          {opt.label.length} / 80
                        </span>
                      </div>
                      <input
                        type="text"
                        maxLength={80}
                        value={opt.label}
                        onChange={(e) => updateOption(oIdx, { label: e.target.value })}
                        placeholder="Nazwa opcji"
                        className="w-full bg-[#23242d] border border-[#383949] focus:border-[#5865F2] rounded-xl px-3 py-2 text-xs text-white placeholder:text-neutral-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-300">
                        Opis opcji (Description)
                      </label>
                      <span className="text-[11px] font-mono text-neutral-400">
                        {(opt.description || '').length} / 100
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={100}
                      value={opt.description || ''}
                      onChange={(e) => updateOption(oIdx, { description: e.target.value })}
                      placeholder="Krótki opis widoczny pod etykietą..."
                      className="w-full bg-[#23242d] border border-[#383949] focus:border-[#5865F2] rounded-xl px-3 py-2 text-xs text-white placeholder:text-neutral-500 outline-none"
                    />
                  </div>

                  {/* Actions inside Option */}
                  <div className="p-3 bg-[#16171d] rounded-xl border border-[#2b2c39]">
                    <ComponentActionEditor
                      actions={opt.actions || []}
                      onChange={(actions) => updateOption(oIdx, { actions })}
                      maxActions={3}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Option Button */}
      {menu.options.length < 25 && (
        <button
          type="button"
          onClick={addOption}
          className="w-full py-2.5 px-4 bg-[#23242e] hover:bg-[#2b2c3a] border border-[#383948] hover:border-[#5865F2] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4 text-[#5865F2]" />
          <span>Dodaj Opcję do Menu ({menu.options.length}/25)</span>
        </button>
      )}
    </div>
  );
};
