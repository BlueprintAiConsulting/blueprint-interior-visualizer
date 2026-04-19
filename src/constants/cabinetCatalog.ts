import { MaterialLine } from '../types';
export const CABINET_OPTIONS: MaterialLine[] = [
  { id: 'cab-shaker-painted', brand: 'Cabinets', line: 'Painted Shaker', material: 'Painted MDF Shaker Door', category: 'cabinets', profileLabel: 'Full Overlay Shaker — Square Panel', description: 'Classic shaker — #1 choice in PA remodels.', colors: [
    { id: 'cs-white', name: 'White', hex: '#F0EDE5', hue: 'Clean warm white painted finish' },
    { id: 'cs-dove-white', name: 'Dove White', hex: '#E5DDD0', hue: 'Soft creamy off-white' },
    { id: 'cs-gray-mist', name: 'Gray Mist', hex: '#C4BFB5', hue: 'Light warm gray painted' },
    { id: 'cs-agreeable-gray', name: 'Agreeable Gray', hex: '#B8B0A2', hue: 'Medium warm greige painted' },
    { id: 'cs-naval', name: 'Naval', hex: '#2F3D4F', hue: 'Deep classic navy blue painted' },
    { id: 'cs-iron-ore', name: 'Iron Ore', hex: '#484644', hue: 'Dark charcoal-gray painted' },
    { id: 'cs-sage-green', name: 'Sage Green', hex: '#8A9A7E', hue: 'Muted sage green painted' },
    { id: 'cs-black', name: 'Black', hex: '#2A2A2A', hue: 'Matte black painted finish' },
    { id: 'cs-classic-gray', name: 'Classic Gray', hex: '#C8C4BC', hue: 'True neutral warm gray' },
    { id: 'cs-fossil', name: 'Fossil', hex: '#9E9688', hue: 'Medium warm taupe-gray' },
  ]},
  { id: 'cab-shaker-stained', brand: 'Cabinets', line: 'Stained Shaker', material: 'Stained Maple Shaker Door', category: 'cabinets', profileLabel: 'Full Overlay Shaker — Natural Wood Grain', description: 'Natural wood shaker.', colors: [
    { id: 'ss-natural-maple', name: 'Natural Maple', hex: '#D0B888', hue: 'Light blonde maple natural finish' },
    { id: 'ss-honey', name: 'Honey', hex: '#B89458', hue: 'Warm honey-golden stain' },
    { id: 'ss-cherry', name: 'Cherry', hex: '#8A4830', hue: 'Rich warm reddish-brown cherry' },
    { id: 'ss-espresso', name: 'Espresso', hex: '#3A2518', hue: 'Very dark espresso brown stain' },
    { id: 'ss-driftwood', name: 'Driftwood', hex: '#9A8E80', hue: 'Gray-washed weathered wood' },
    { id: 'ss-walnut', name: 'Walnut', hex: '#5A3E28', hue: 'Medium-dark walnut brown' },
    { id: 'ss-pecan', name: 'Pecan', hex: '#7A5C38', hue: 'Warm medium pecan brown' },
    { id: 'ss-barnwood', name: 'Barnwood', hex: '#7E7268', hue: 'Rustic gray-brown reclaimed look' },
  ]},
  { id: 'cab-flat-panel', brand: 'Cabinets', line: 'Modern Slab', material: 'Flat Panel / Slab Door', category: 'cabinets', profileLabel: 'Full Overlay Flat Slab — Contemporary', description: 'Clean contemporary flat-panel.', colors: [
    { id: 'fp-matte-white', name: 'Matte White', hex: '#EEEAE2', hue: 'Soft matte warm white' },
    { id: 'fp-high-gloss-white', name: 'High Gloss White', hex: '#F5F4F0', hue: 'Bright glossy white' },
    { id: 'fp-charcoal', name: 'Charcoal', hex: '#3A3A3A', hue: 'Dark matte charcoal' },
    { id: 'fp-midnight', name: 'Midnight', hex: '#1E1E1E', hue: 'Near-black matte' },
    { id: 'fp-walnut-veneer', name: 'Walnut Veneer', hex: '#6A4E38', hue: 'Real walnut wood veneer' },
    { id: 'fp-light-oak', name: 'Light Oak', hex: '#C8B08A', hue: 'Natural light oak veneer' },
  ]},
];
export const VANITY_OPTIONS: MaterialLine[] = CABINET_OPTIONS.map(line => ({ ...line, id: line.id.replace('cab-', 'van-'), category: 'vanity' as const }));
