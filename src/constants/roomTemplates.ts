import { RoomTemplate } from '../types';
export const ROOM_TEMPLATES: RoomTemplate[] = [
  { type: 'kitchen', label: 'Kitchen', icon: 'ChefHat', defaultZones: ['walls', 'cabinets', 'countertops', 'backsplash', 'flooring'], description: 'Full kitchen remodel.' },
  { type: 'bathroom', label: 'Bathroom', icon: 'Bath', defaultZones: ['walls', 'vanity', 'countertops', 'shower-surround', 'flooring'], description: 'Bathroom refresh.' },
  { type: 'living-room', label: 'Living Room', icon: 'Sofa', defaultZones: ['walls', 'accent-wall', 'trim', 'flooring'], description: 'Living room update.' },
  { type: 'bedroom', label: 'Bedroom', icon: 'Bed', defaultZones: ['walls', 'accent-wall', 'trim', 'flooring'], description: 'Bedroom refresh.' },
];
