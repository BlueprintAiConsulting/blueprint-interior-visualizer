import React from 'react';
import { RoomZone, MaterialLine, MaterialColor, SurfaceCategory } from '../../types';
import { PAINT_OPTIONS, TRIM_PAINT_OPTIONS } from '../../constants/paintCatalog';
import { CABINET_OPTIONS, VANITY_OPTIONS } from '../../constants/cabinetCatalog';
import { COUNTERTOP_OPTIONS } from '../../constants/countertopCatalog';
import { TILE_OPTIONS, SHOWER_TILE_OPTIONS } from '../../constants/tileCatalog';
import { FLOORING_OPTIONS } from '../../constants/flooringCatalog';
import ColorGrid from './ColorGrid';
import { ChevronDown } from 'lucide-react';

interface InteriorCatalogProps {
  zones: RoomZone[];
  setZones: React.Dispatch<React.SetStateAction<RoomZone[]>>;
  expandedZoneId: string | null;
  setExpandedZoneId: (id: string | null) => void;
  onColorMouseEnter: (color: MaterialColor) => void;
  onColorMouseLeave: () => void;
}

function getLinesForCategory(category: SurfaceCategory): MaterialLine[] {
  switch (category) {
    case 'walls': case 'accent-wall': case 'ceiling': return PAINT_OPTIONS.filter(p => p.category === 'walls');
    case 'trim': return TRIM_PAINT_OPTIONS;
    case 'cabinets': return CABINET_OPTIONS;
    case 'vanity': return VANITY_OPTIONS;
    case 'countertops': return COUNTERTOP_OPTIONS;
    case 'backsplash': return TILE_OPTIONS;
    case 'shower-surround': return SHOWER_TILE_OPTIONS;
    case 'flooring': return FLOORING_OPTIONS;
    default: return PAINT_OPTIONS;
  }
}

const InteriorCatalog: React.FC<InteriorCatalogProps> = ({ zones, setZones, expandedZoneId, setExpandedZoneId, onColorMouseEnter, onColorMouseLeave }) => {
  return (
    <div className="space-y-2">
      {zones.map((zone) => {
        const isExpanded = expandedZoneId === zone.id;
        const isAlwaysOn = zone.id.endsWith('-walls') || zone.id.endsWith('-cabinets') || zone.id.endsWith('-vanity');
        const availableLines = getLinesForCategory(zone.category);
        return (
          <div key={zone.id} className={`rounded-lg border overflow-hidden transition-all ${zone.enabled ? 'border-[#1E3A8A]/60 bg-[#0F172A]' : 'border-[#1E293B] bg-[#0A0E17]'}`}>
            <div className="flex items-center gap-3 p-3">
              {!isAlwaysOn ? (
                <button onClick={() => setZones(prev => prev.map(z => z.id === zone.id ? { ...z, enabled: !z.enabled } : z))}
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${zone.enabled ? 'bg-[#3B82F6]' : 'bg-[#1E293B] border border-[#334155]'}`}>
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${zone.enabled ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              ) : (
                <div className="w-9 shrink-0 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-[#3B82F6]" /></div>
              )}
              <span className={`text-xs font-bold flex-1 transition-colors ${zone.enabled ? 'text-[#E2E8F0]' : 'text-[#475569]'}`}>{zone.name}</span>
              {zone.enabled && (
                <button onClick={() => setExpandedZoneId(isExpanded ? null : zone.id)} className="flex items-center gap-1.5 group">
                  <div className="w-4 h-4 rounded-sm border border-white/20 shrink-0" style={{ backgroundColor: zone.selectedColor.hex }} />
                  <span className="text-[9px] text-[#94A3B8] group-hover:text-[#E2E8F0] truncate max-w-[80px] transition-colors">{zone.selectedColor.name}</span>
                  <ChevronDown className={`w-3 h-3 text-[#64748B] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>
            {zone.enabled && isExpanded && (
              <div className="border-t border-[#1E293B] bg-[#0A0E17]/80 p-3 space-y-3">
                {availableLines.length > 1 && (
                  <div className="flex gap-1 flex-wrap">
                    {availableLines.map(line => (
                      <button key={line.id} onClick={() => setZones(prev => prev.map(z => z.id === zone.id ? { ...z, selectedLine: line, selectedColor: line.colors[0] } : z))}
                        className={`px-2 py-1 rounded text-[8px] font-bold uppercase tracking-wider transition-colors ${zone.selectedLine.id === line.id ? 'bg-[#1E3A8A] text-[#60A5FA]' : 'bg-[#1E293B] text-[#64748B] hover:text-[#94A3B8]'}`}>
                        {line.line}
                      </button>
                    ))}
                  </div>
                )}
                <div className="rounded-lg overflow-hidden relative h-8 border border-[#334155] bg-[#0F172A]">
                  <div className="absolute inset-0 flex items-center px-3">
                    <p className="text-[9px] font-bold text-[#60A5FA]">{zone.selectedLine.brand}</p>
                    <span className="text-[8px] text-[#64748B] ml-2">— {zone.selectedLine.profileLabel}</span>
                  </div>
                </div>
                <ColorGrid colors={zone.selectedLine.colors} selectedColorId={zone.selectedColor.id}
                  onSelect={c => setZones(prev => prev.map(z => z.id === zone.id ? { ...z, selectedColor: c } : z))}
                  onMouseEnter={onColorMouseEnter} onMouseLeave={onColorMouseLeave} isExpanded={true} ringColor="#3B82F6" />
                <div className="flex items-center gap-2 pt-1 border-t border-[#1E293B]">
                  <div className="w-3 h-3 rounded-sm border border-white/20" style={{ backgroundColor: zone.selectedColor.hex }} />
                  <span className="text-[9px] text-[#94A3B8]"><strong className="text-[#E2E8F0]">{zone.selectedColor.name}</strong> — {zone.selectedColor.hue}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
export default InteriorCatalog;
