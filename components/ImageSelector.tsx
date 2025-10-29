import React from 'react';
import { PresetImage } from '../types';
import { UploadIcon, RefreshIcon } from './icons';

interface ImageSelectorProps {
  presetImages: PresetImage[];
  selectedImage: string | null;
  onSelect: (src: string) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const ImageSelector: React.FC<ImageSelectorProps> = ({ presetImages, selectedImage, onSelect, onFileUpload, onRefresh, isRefreshing }) => {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-indigo-300">Choose a Preset Image</h3>
            <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="flex items-center text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold py-1 px-3 rounded-lg border border-gray-500 transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-wait disabled:text-gray-400"
                aria-label="Load new preset images"
            >
                <RefreshIcon className={`w-4 h-4 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Loading...' : 'New Images'}
            </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {presetImages.map((image) => (
            <button
              key={image.id}
              onClick={() => onSelect(image.src)}
              className={`rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                selectedImage === image.src ? 'border-indigo-500 scale-105' : 'border-gray-600 hover:border-indigo-400'
              }`}
            >
              <img src={image.src} alt={image.alt} className="w-full h-24 object-cover" />
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-indigo-300 mb-2">Or Upload Your Own</h3>
        <label
          htmlFor="file-upload"
          className="relative cursor-pointer bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold py-3 px-4 rounded-lg border border-gray-500 transition-colors duration-200 flex items-center justify-center w-full"
        >
          <UploadIcon className="w-5 h-5 mr-2" />
          <span>Select an Image</span>
        </label>
        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={onFileUpload} />
      </div>
    </div>
  );
};

export default ImageSelector;
