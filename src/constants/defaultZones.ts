import { RoomType, RoomZone } from '../types';
import { PAINT_OPTIONS, TRIM_PAINT_OPTIONS } from './paintCatalog';
import { CABINET_OPTIONS, VANITY_OPTIONS } from './cabinetCatalog';
import { COUNTERTOP_OPTIONS } from './countertopCatalog';
import { TILE_OPTIONS, SHOWER_TILE_OPTIONS } from './tileCatalog';
import { FLOORING_OPTIONS } from './flooringCatalog';

const P = PAINT_OPTIONS;
const T = TRIM_PAINT_OPTIONS;
const C = CABINET_OPTIONS;
const V = VANITY_OPTIONS;
const CT = COUNTERTOP_OPTIONS;
const TI = TILE_OPTIONS;
const ST = SHOWER_TILE_OPTIONS;
const F = FLOORING_OPTIONS;

function zone(id: string, name: string, cat: RoomZone['category'], line: any[], enabled = true): RoomZone {
  const l = line[0]; return { id, name, category: cat, enabled, selectedLine: l, selectedColor: l.colors[0] };
}

const KITCHEN_ZONES: RoomZone[] = [
  zone('k-walls', 'Wall Color', 'walls', P),
  zone('k-trim', 'Trim & Baseboards', 'trim', T, false),
  zone('k-cabinets', 'Cabinets', 'cabinets', C),
  zone('k-countertops', 'Countertops', 'countertops', CT),
  zone('k-backsplash', 'Backsplash', 'backsplash', TI),
  zone('k-flooring', 'Flooring', 'flooring', F),
];

const BATHROOM_ZONES: RoomZone[] = [
  zone('b-walls', 'Wall Color', 'walls', P),
  zone('b-trim', 'Trim & Baseboards', 'trim', T, false),
  zone('b-vanity', 'Vanity Cabinet', 'vanity', V),
  zone('b-countertops', 'Vanity Top', 'countertops', CT),
  zone('b-shower', 'Shower Surround', 'shower-surround', ST),
  zone('b-flooring', 'Flooring', 'flooring', F),
];

const LIVING_ZONES: RoomZone[] = [
  zone('lr-walls', 'Wall Color', 'walls', P),
  zone('lr-accent', 'Accent Wall', 'accent-wall', [P[2]], false), // Bold Accents line
  zone('lr-trim', 'Trim & Baseboards', 'trim', T, false),
  zone('lr-flooring', 'Flooring', 'flooring', F),
];

const BEDROOM_ZONES: RoomZone[] = [
  zone('br-walls', 'Wall Color', 'walls', P),
  zone('br-accent', 'Accent Wall', 'accent-wall', [P[2]], false), // Bold Accents line
  zone('br-trim', 'Trim & Baseboards', 'trim', T, false),
  zone('br-flooring', 'Flooring', 'flooring', F),
];

const ROOM_ZONE_MAP: Record<RoomType, RoomZone[]> = {
  kitchen: KITCHEN_ZONES,
  bathroom: BATHROOM_ZONES,
  'living-room': LIVING_ZONES,
  bedroom: BEDROOM_ZONES,
  'dining-room': LIVING_ZONES,
  office: LIVING_ZONES,
};

export function getDefaultZonesForRoom(roomType: RoomType): RoomZone[] {
  // Deep clone so each render gets fresh state
  return JSON.parse(JSON.stringify(ROOM_ZONE_MAP[roomType] || KITCHEN_ZONES));
}
