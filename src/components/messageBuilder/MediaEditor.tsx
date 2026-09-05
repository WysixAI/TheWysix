import React from 'react';
import { ComponentMedia } from '../../types/guildConfig';
import { Image, EyeOff, Link } from 'lucide-react';

interface MediaEditorProps {
  media: ComponentMedia;
  onChange: (patch: Partial<ComponentMedia>) => void;
}

const PRESET_BANNERS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&auto=format&fit=crop&q=80',
];

export const MediaEditor: React.FC<MediaEditorProps> = ({ media, onChange }) => {
  return (
    <div className="space-y-4 pt-1 text-xs">
      <div className="space-y-1.5">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300">
          Adres URL Grafiki / Baneru (Image URL)
        </label>
        <div className="relative">
          <Link className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="url"
            value={media.url || ''}
            onChange={(e) => onChange({ url: e.target.value })}
            placeholder="https://example.com/banner.png"
            className="w-full bg-[#1e1f26] border border-[#363744] focus:border-[#5865F2] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-neutral-500 outline-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-neutral-400 font-medium">Szybkie tła:</span>
        {PRESET_BANNERS.map((banner, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onChange({ url: banner })}
            className="px-2.5 py-1 bg-[#23242e] hover:bg-[#2e2f3d] border border-[#383949] rounded-lg text-[11px] text-neutral-300 hover:text-white cursor-pointer transition-colors"
          >
            Baner #{idx + 1}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        <div className="sm:col-span-8 space-y-1">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300">
            Podpis pod grafiką (Opcjonalnie)
          </label>
          <input
            type="text"
            value={media.caption || ''}
            onChange={(e) => onChange({ caption: e.target.value })}
            placeholder="Krótki podpis pod grafiką..."
            className="w-full bg-[#1e1f26] border border-[#363744] focus:border-[#5865F2] rounded-xl px-3 py-2 text-xs text-white placeholder:text-neutral-500 outline-none"
          />
        </div>

        <div className="sm:col-span-4 flex items-center justify-start sm:justify-end pt-3 sm:pt-0">
          <label className="flex items-center gap-2 text-xs font-bold text-neutral-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={Boolean(media.spoiler)}
              onChange={(e) => onChange({ spoiler: e.target.checked })}
              className="accent-[#5865F2] w-4 h-4 rounded cursor-pointer"
            />
            <EyeOff className="w-3.5 h-3.5 text-neutral-400" />
            <span>Ukryj jako Spoiler</span>
          </label>
        </div>
      </div>

      {/* Preview if URL given */}
      {media.url && (
        <div className="p-2 bg-[#181920] rounded-xl border border-[#2b2c39] overflow-hidden">
          <div className="text-[10px] uppercase font-bold text-neutral-400 mb-1.5 flex items-center gap-1">
            <Image className="w-3 h-3 text-[#5865F2]" />
            <span>Podgląd miniatury baneru</span>
          </div>
          <div className="relative rounded-lg overflow-hidden max-h-48 border border-[#2e2f3d]">
            <img
              src={media.url}
              alt={media.caption || 'Baner'}
              className={`w-full h-auto object-cover ${media.spoiler ? 'blur-md hover:blur-none transition-all' : ''}`}
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
