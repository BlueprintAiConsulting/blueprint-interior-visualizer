import React from 'react';
import { ChefHat, Bath, Sofa, Bed } from 'lucide-react';
import { RoomType } from '../../types';
import { ROOM_TEMPLATES } from '../../constants/roomTemplates';
interface RoomTypeSelectorProps { selectedRoom: RoomType; onSelectRoom: (room: RoomType) => void; }
const ICONS: Record<string, React.FC<{ className?: string }>> = { ChefHat, Bath, Sofa, Bed };
const RoomTypeSelector: React.FC<RoomTypeSelectorProps> = ({ selectedRoom, onSelectRoom }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {ROOM_TEMPLATES.map((room) => {
        const isSelected = room.type === selectedRoom;
        const Icon = ICONS[room.icon];
        return (
          <button key={room.type} onClick={() => onSelectRoom(room.type)}
            className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border transition-all ${
              isSelected ? 'bg-[#1E3A8A]/40 border-[#3B82F6]/60 text-[#60A5FA] shadow-[0_0_12px_rgba(59,130,246,0.2)]'
                : 'bg-[#0A0E17] border-[#1E293B] text-[#64748B] hover:border-[#334155] hover:text-[#94A3B8]'}`}>
            {Icon && <Icon className="w-5 h-5" />}
            <span className="text-[10px] font-bold uppercase tracking-wider">{room.label}</span>
          </button>
        );
      })}
    </div>
  );
};
export default RoomTypeSelector;
