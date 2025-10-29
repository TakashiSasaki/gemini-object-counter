import { PresetImage, ModelOption } from './types';

export const PRESET_IMAGES: PresetImage[] = [
  { id: 'animals', src: 'https://picsum.photos/seed/animalssafari/800/600', alt: 'Many animals on a safari' },
  { id: 'tableware', src: 'https://picsum.photos/seed/dinnertable/800/600', alt: 'A dinner table set with food and tableware' },
  { id: 'cars', src: 'https://picsum.photos/seed/parkinglot/800/600', alt: 'A parking lot full of cars' },
  { id: 'stationery', src: 'https://picsum.photos/seed/officedesk/800/600', alt: 'An office desk with stationery and furniture' },
];

export const MODELS: ModelOption[] = [
  { id: 'gemini-robotics-er-1.5-preview', name: 'gemini-robotics-er-1.5-preview'},
  { id: 'gemini-2.5-pro', name: 'gemini-2.5-pro' },
  { id: 'gemini-2.5-flash', name: 'gemini-2.5-flash' },
  { id: 'gemini-2.5-flash-lite', name: 'gemini-2.5-flash-lite'}
];