export type RoomType = 'kitchen' | 'bathroom' | 'bedroom' | 'living-room' | 'dining-room' | 'office';
export type SurfaceCategory = 'walls' | 'cabinets' | 'countertops' | 'backsplash' | 'flooring' | 'ceiling' | 'trim' | 'fixtures' | 'accent-wall' | 'vanity' | 'shower-surround';
export interface MaterialColor { id: string; name: string; hex: string; hue: string; swatchUrl?: string; }
export interface MaterialLine { id: string; brand: string; line: string; material: string; category: SurfaceCategory; profileLabel: string; textureImage?: string; description: string; colors: MaterialColor[]; }
export interface RoomZone { id: string; name: string; category: SurfaceCategory; enabled: boolean; selectedLine: MaterialLine; selectedColor: MaterialColor; maskTarget?: string; }
export interface RoomTemplate { type: RoomType; label: string; icon: string; defaultZones: SurfaceCategory[]; description: string; }
export type RenderPhase = 'idle' | 'paint' | 'cabinets' | 'countertops' | 'flooring' | 'done';
export interface InteriorZonePayload { name: string; category: SurfaceCategory; brand: string; lineName: string; colorName: string; colorHex: string; hue: string; materialType: string; }
export interface BrandConfig { name: string; tagline: string; presenter: string; primaryColor: string; logoUrl: string; accentGradient: string; }
