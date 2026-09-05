import React, { useState } from 'react';
import { ComponentActionRow, WelcomeButton, ComponentSelectMenu } from '../../types/guildConfig';
import { SelectMenuEditor } from './SelectMenuEditor';
import { ComponentActionEditor } from './ComponentActionEditor';
import { Plus, Trash2, ChevronDown, ChevronUp, Copy, ExternalLink, Smile, ShieldAlert } from 'lucide-react';

interface ActionRowEditorProps {
  row: ComponentActionRow;
  onChange: (patch: Partial<ComponentActionRow>) => void;
}

const COMMON_EMOJIS = ['👋', '✅', '❌', '⭐', '🚀', '🔥', '🛡️', '💎', '🎮', '🔔'];

export const ActionRowEditor: React.FC<ActionRowEditorProps> = ({ row, onChange }) => {
  const [openButtonId, setOpenButtonId] = useState<string | null>(row.buttons[0]?.id || null);
  const [openEmojiPicker, setOpenEmojiPicker] = useState<string | null>(null);

  const rowType = row.rowType || (row.selectMenu ? 'select_menu' : 'buttons');

  const switchRowType = (newType: 'buttons' | 'select_menu') => {
    if (newType === 'select_menu') {
      const defaultMenu: ComponentSelectMenu = row.selectMenu || {
        id: `sel-${Date.now()}`,
        customId: `sel_${Date.now()}`,
        placeholder: 'Wybierz interesującą Cię opcję...',
        options: [
          {
            id: `opt-${Date.now()}-1`,
            label: 'Pierwsza opcja',
            value: `val_1_${Date.now()}`,
            description: 'Opis pierwszej opcji',
            emoji: '👋',
            actions: [],
          },
          {
            id: `opt-${Date.now()}-2`,
            label: 'Druga opcja',
            value: `val_2_${Date.now()}`,
            description: 'Opis drugiej opcji',
            emoji: '🌟',
            actions: [],
          },
        ],
      };
      onChange({ rowType: 'select_menu', selectMenu: defaultMenu });
    } else {
      const defaultButtons: WelcomeButton[] =
        row.buttons && row.buttons.length > 0
          ? row.buttons
          : [
              {
                id: `btn-${Date.now()}`,
                label: 'Przycisk',
                style: 'PRIMARY',
                customId: `btn_${Date.now()}`,
                actions: [],
              },
            ];
      onChange({ rowType: 'buttons', buttons: defaultButtons });
    }
  };

  // Button operations
  const addButton = () => {
    if (row.buttons.length >= 5) return;
    const newBtn: WelcomeButton = {
      id: `btn-${Date.now()}`,
      label: `Przycisk ${row.buttons.length + 1}`,
      style: 'PRIMARY',
      customId: `btn_${Date.now()}`,
      actions: [],
    };
    onChange({ buttons: [...row.buttons, newBtn] });
    setOpenButtonId(newBtn.id);
  };

  const updateButton = (index: number, patch: Partial<WelcomeButton>) => {
    const copy = [...row.buttons];
    copy[index] = { ...copy[index], ...patch };
    onChange({ buttons: copy });
  };

  const duplicateButton = (index: number) => {
    if (row.buttons.length >= 5) return;
    const item = row.buttons[index];
    const copy: WelcomeButton = {
      ...JSON.parse(JSON.stringify(item)),
      id: `btn-${Date.now()}`,
      customId: `btn_${Date.now()}`,
      label: `${item.label} (Kopia)`,
    };
    const list = [...row.buttons];
    list.splice(index + 1, 0, copy);
    onChange({ buttons: list });
    setOpenButtonId(copy.id);
  };

  const removeButton = (index: number) => {
    onChange({ buttons: row.buttons.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4 pt-1">
      {/* Selector: Buttons or Select Menu */}
      <div className="flex items-center justify-between pb-2 border-b border-[#2d2e3b]">
        <div className="flex items-center gap-1.5 p-1 bg-[#191a21] border border-[#343542] rounded-xl">
          <button
            type="button"
            onClick={() => switchRowType('buttons')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              rowType === 'buttons'
                ? 'bg-[#5865F2] text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            🔘 Przyciski (Buttons)
          </button>
          <button
            type="button"
            onClick={() => switchRowType('select_menu')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              rowType === 'select_menu'
                ? 'bg-[#5865F2] text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            📋 Menu Rozwijane (Select Menu)
          </button>
        </div>

        <div className="text-[11px] text-neutral-400 font-medium">
          {rowType === 'buttons' ? `Przyciski: ${row.buttons.length}/5` : 'Pojedynczy komponent na wiersz'}
        </div>
      </div>

      {/* RENDER SELECT MENU */}
      {rowType === 'select_menu' && row.selectMenu && (
        <SelectMenuEditor
          menu={row.selectMenu}
          onChange={(patch) =>
            onChange({ selectMenu: { ...row.selectMenu!, ...patch } })
          }
        />
      )}

      {/* RENDER BUTTONS */}
      {rowType === 'buttons' && (
        <div className="space-y-3">
          {row.buttons.map((btn, bIdx) => {
            const isOpen = openButtonId === btn.id;

            return (
              <div
                key={btn.id}
                className="bg-[#1e1f26] border border-[#343542] rounded-xl overflow-hidden shadow-md transition-all"
              >
                {/* Button Bar */}
                <div className="p-3 bg-[#23242d] flex items-center justify-between gap-2 border-b border-[#2e2f3c]">
                  <button
                    type="button"
                    onClick={() => setOpenButtonId(isOpen ? null : btn.id)}
                    className="flex items-center gap-2.5 flex-1 text-left cursor-pointer group"
                  >
                    <div
                      className={`w-4 h-4 rounded-full border ${
                        btn.style === 'PRIMARY'
                          ? 'bg-[#5865F2] border-indigo-400'
                          : btn.style === 'SUCCESS'
                          ? 'bg-[#248046] border-emerald-400'
                          : btn.style === 'DANGER'
                          ? 'bg-[#DA373C] border-rose-400'
                          : btn.style === 'LINK'
                          ? 'bg-neutral-600 border-neutral-400'
                          : 'bg-[#4E5058] border-neutral-400'
                      }`}
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white group-hover:text-indigo-300 transition-colors">
                        {btn.label || `Przycisk #${bIdx + 1}`}
                      </span>
                      {btn.emoji && <span className="text-xs">{btn.emoji}</span>}
                      {btn.actions && btn.actions.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-bold">
                          {btn.actions.length} {btn.actions.length === 1 ? 'akcja' : 'akcje'}
                        </span>
                      )}
                    </div>
                  </button>

                  <div className="flex items-center gap-1 text-neutral-400">
                    <button
                      type="button"
                      onClick={() => duplicateButton(bIdx)}
                      disabled={row.buttons.length >= 5}
                      title="Duplikuj przycisk"
                      className="p-1 hover:text-white disabled:opacity-30 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeButton(bIdx)}
                      title="Usuń przycisk"
                      className="p-1 hover:text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpenButtonId(isOpen ? null : btn.id)}
                      className="p-1 hover:text-white cursor-pointer"
                    >
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Button Details */}
                {isOpen && (
                  <div className="p-4 space-y-4 text-xs bg-[#1a1b22]">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      {/* Label */}
                      <div className="sm:col-span-8 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-300">
                            Napis na przycisku (Label)
                          </label>
                          <span className="text-[11px] font-mono text-neutral-400">
                            {btn.label.length} / 80
                          </span>
                        </div>
                        <input
                          type="text"
                          maxLength={80}
                          value={btn.label}
                          onChange={(e) => updateButton(bIdx, { label: e.target.value })}
                          placeholder="np. Zweryfikuj się"
                          className="w-full bg-[#23242d] border border-[#383949] focus:border-[#5865F2] rounded-xl px-3 py-2 text-xs text-white placeholder:text-neutral-500 outline-none"
                        />
                      </div>

                      {/* Style */}
                      <div className="sm:col-span-4 space-y-1">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300">
                          Styl / Kolor
                        </label>
                        <select
                          value={btn.style}
                          onChange={(e) =>
                            updateButton(bIdx, { style: e.target.value as WelcomeButton['style'] })
                          }
                          className="w-full bg-[#23242d] border border-[#383949] focus:border-[#5865F2] rounded-xl px-3 py-2 text-xs text-white font-semibold outline-none"
                        >
                          <option value="PRIMARY">Blurple (Niebieski)</option>
                          <option value="SECONDARY">Szary (Secondary)</option>
                          <option value="SUCCESS">Zielony (Success)</option>
                          <option value="DANGER">Czerwony (Danger)</option>
                          <option value="LINK">Link URL (Zewnętrzny)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                      {/* Emoji */}
                      <div className="sm:col-span-4 space-y-1 relative">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300">
                          Emoji przycisku
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setOpenEmojiPicker(openEmojiPicker === btn.id ? null : btn.id)}
                            className="w-10 h-9 rounded-xl bg-[#23242d] border border-[#383949] hover:border-[#5865F2] flex items-center justify-center text-lg cursor-pointer transition-colors"
                          >
                            {btn.emoji || <Smile className="w-4 h-4 text-neutral-400" />}
                          </button>
                          <input
                            type="text"
                            value={btn.emoji || ''}
                            onChange={(e) => updateButton(bIdx, { emoji: e.target.value })}
                            placeholder="np. 👋"
                            className="w-full bg-[#23242d] border border-[#383949] rounded-xl px-2 py-2 text-xs text-white placeholder:text-neutral-500"
                          />
                        </div>

                        {openEmojiPicker === btn.id && (
                          <div className="absolute left-0 top-full mt-1 p-2 bg-[#202128] border border-[#363744] rounded-xl shadow-2xl z-50 grid grid-cols-4 gap-1 animate-in fade-in zoom-in-95">
                            {COMMON_EMOJIS.map((e) => (
                              <button
                                key={e}
                                type="button"
                                onClick={() => {
                                  updateButton(bIdx, { emoji: e });
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

                      {/* Disabled toggle */}
                      <div className="sm:col-span-8 flex items-center justify-start sm:justify-end pt-3 sm:pt-4">
                        <label className="flex items-center gap-2 text-xs font-bold text-neutral-300 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={Boolean(btn.disabled)}
                            onChange={(e) => updateButton(bIdx, { disabled: e.target.checked })}
                            className="accent-[#5865F2] w-4 h-4 rounded cursor-pointer"
                          />
                          <span>Zablokowany (Disabled)</span>
                        </label>
                      </div>
                    </div>

                    {/* URL if LINK */}
                    {btn.style === 'LINK' ? (
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300">
                          Adres URL Odnośnika
                        </label>
                        <div className="relative">
                          <ExternalLink className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="url"
                            value={btn.url || ''}
                            onChange={(e) => updateButton(bIdx, { url: e.target.value })}
                            placeholder="https://twojastrona.pl"
                            className="w-full bg-[#23242d] border border-[#383949] focus:border-[#5865F2] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-neutral-500 outline-none"
                          />
                        </div>
                      </div>
                    ) : (
                      /* Actions configuration for interactive buttons */
                      <div className="p-3 bg-[#16171d] rounded-xl border border-[#2b2c39]">
                        <ComponentActionEditor
                          actions={btn.actions || []}
                          onChange={(actions) => updateButton(bIdx, { actions })}
                          maxActions={3}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {row.buttons.length < 5 && (
            <button
              type="button"
              onClick={addButton}
              className="w-full py-2.5 px-4 bg-[#23242e] hover:bg-[#2b2c3a] border border-[#383948] hover:border-[#5865F2] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4 text-[#5865F2]" />
              <span>Dodaj Przycisk do Wiersza ({row.buttons.length}/5)</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
