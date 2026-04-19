import React from 'react';
import { MaterialColor } from '../../types';

interface ColorGridProps {
  colors: MaterialColor[];
  selectedColorId: string;
  onSelect: (color: MaterialColor) => void;
  onMouseEnter: (color: MaterialColor) => void;
  onMouseLeave: () => void;
  isExpanded: boolean;
  ringColor?: string;
}

const ColorGrid: React.FC<ColorGridProps> = ({
  colors, selectedColorId, onSelect, onMouseEnter, onMouseLeave, isExpanded, ringColor = '#3B82F6',
}) => {
  if (!isExpanded) return null;
  return (
    <div className="grid grid-cols-6 gap-1.5">
      {colors.map((color) => {
        const isSelected = color.id === selectedColorId;
        return (
          <button key={color.id} onClick={() => onSelect(color)} onMouseEnter={() => onMouseEnter(color)} onMouseLeave={onMouseLeave}
            className={`group relative aspect-square rounded-md border-2 transition-all duration-150 hover:scale-110 hover:shadow-lg ${
              isSelected ? 'border-[var(--ring)] shadow-[0_0_8px_var(--ring-glow)] scale-105' : 'border-transparent hover:border-white/30'
            }`}
            style={{ backgroundColor: color.hex, '--ring': ringColor, '--ring-glow': `${ringColor}66` } as React.CSSProperties}
            title={`${color.name} — ${color.hue}`}>
            {isSelected && <div className="absolute inset-0 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-white shadow-md" /></div>}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 bg-[#0F172A] border border-[#334155] rounded text-[8px] text-[#E2E8F0] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
              {color.name}
            </div>
          </button>
        );
      })}
    </div>
  );
};
export default ColorGrid;
