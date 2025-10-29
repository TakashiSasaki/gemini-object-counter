export type GeminiModel = 'gemini-2.5-pro' | 'gemini-2.5-flash' | 'gemini-robotics-er-1.5-preview' | 'gemini-2.5-flash-lite';

export interface ModelOption {
  id: GeminiModel;
  name: string;
}

export interface PresetImage {
  id: string;
  src: string;
  alt: string;
}

export interface CountResult {
  label: string;
  count: number;
}

export interface ObjectCounts {
  [key: string]: number;
}