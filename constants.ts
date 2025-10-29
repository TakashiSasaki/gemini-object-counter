import { PresetImage, ModelOption } from './types';

export const PRESET_IMAGES: PresetImage[] = [
  { id: 'animals', src: 'https://loremflickr.com/800/600/safari,animals', alt: 'Many animals on a safari' },
  { id: 'tableware', src: 'https://loremflickr.com/800/600/tableware,dinner', alt: 'A dinner table set with food and tableware' },
  { id: 'cars', src: 'https://loremflickr.com/800/600/car,parking', alt: 'A parking lot full of cars' },
  { id: 'stationery', src: 'https://loremflickr.com/800/600/stationery,desk', alt: 'An office desk with stationery and furniture' },
];

export const MODELS: ModelOption[] = [
  { id: 'gemini-robotics-er-1.5-preview', name: 'gemini-robotics-er-1.5-preview'},
  { id: 'gemini-2.5-flash-lite', name: 'gemini-2.5-flash-lite'},
  { id: 'gemini-2.5-flash', name: 'gemini-2.5-flash' }
];