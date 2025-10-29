import React, { useState } from 'react';
import { PRESET_IMAGES, MODELS } from './constants';
import { countObjectsInImage } from './services/geminiService';
import { GeminiModel, ObjectCounts, PresetImage } from './types';
import ImageSelector from './components/ImageSelector';
import LabelInput from './components/LabelInput';
import ModelSelector from './components/ModelSelector';
import ResultDisplay from './components/ResultDisplay';
import { SparklesIcon } from './components/icons';

const App: React.FC = () => {
  const [presetImages, setPresetImages] = useState<PresetImage[]>(PRESET_IMAGES);
  const [selectedImage, setSelectedImage] = useState<string | null>(presetImages[0].src);
  const [labels, setLabels] = useState<string>('zebra, elephant, tree');
  const [selectedModel, setSelectedModel] = useState<GeminiModel>(MODELS[0].id);
  const [results, setResults] = useState<ObjectCounts | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [isRefreshingPresets, setIsRefreshingPresets] = useState<boolean>(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setResults(null);
        setError(null);
        setHasSubmitted(false);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handlePresetSelect = (src: string) => {
    setSelectedImage(src);
    setResults(null);
    setError(null);
    setHasSubmitted(false);
  };

  const handleRefreshPresets = async () => {
    setIsRefreshingPresets(true);

    const imageLoadPromises = presetImages.map(img => 
      new Promise<PresetImage>((resolve, reject) => {
        const newSrc = `https://picsum.photos/seed/${img.id}${Math.random()}/800/600`;
        const image = new Image();
        image.src = newSrc;
        image.onload = () => resolve({ ...img, src: newSrc });
        image.onerror = () => reject(`Failed to load ${newSrc}`);
      })
    );

    try {
      const newPresets = await Promise.all(imageLoadPromises);
      setPresetImages(newPresets);
      handlePresetSelect(newPresets[0].src);
    } catch (error) {
      console.error("Error loading new preset images:", error);
      setError("Failed to load new images. Please try again.");
    } finally {
      setIsRefreshingPresets(false);
    }
  };

  const imageUrlToDataUrl = async (url: string): Promise<string> => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch image from ${url}: ${response.statusText}`);
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
  };

  const handleSubmit = async () => {
    if (!selectedImage) {
      setError('Please select or upload an image.');
      return;
    }
    const labelList = labels.split(',').map(l => l.trim()).filter(l => l);

    setIsLoading(true);
    setError(null);
    setResults(null);
    setHasSubmitted(true);

    try {
      let imageForApi = selectedImage;
      if (!selectedImage.startsWith('data:image')) {
        imageForApi = await imageUrlToDataUrl(selectedImage);
      }

      const apiResults = await countObjectsInImage(imageForApi, labelList, selectedModel);
      const resultsObject = apiResults.reduce((acc: ObjectCounts, item) => {
        acc[item.label] = item.count;
        return acc;
      }, {});
      setResults(resultsObject);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled = isLoading || !selectedImage;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
            Gemini Object Counter
          </h1>
          <p className="mt-2 text-lg text-gray-400 max-w-2xl mx-auto">
            Upload an image, provide labels, and let Gemini count the objects for you.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-800 p-6 rounded-xl shadow-2xl space-y-6">
            <ImageSelector 
              presetImages={presetImages}
              selectedImage={selectedImage}
              onSelect={handlePresetSelect}
              onFileUpload={handleFileUpload}
              onRefresh={handleRefreshPresets}
              isRefreshing={isRefreshingPresets}
            />
            <LabelInput 
              value={labels}
              onChange={(e) => setLabels(e.target.value)}
              placeholder="e.g., car, person, tree (or leave blank for auto-detect)"
              disabled={isLoading}
            />
            <ModelSelector 
              models={MODELS}
              selectedValue={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as GeminiModel)}
              disabled={isLoading}
            />
            <button
              onClick={handleSubmit}
              disabled={isButtonDisabled}
              className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-4 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg"
            >
              <SparklesIcon className="w-6 h-6 mr-2"/>
              {isLoading ? 'Analyzing...' : 'Count Objects'}
            </button>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl shadow-2xl flex flex-col items-center justify-center min-h-[400px]">
            {selectedImage ? (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-gray-700">
                <img src={selectedImage} alt="Selected for analysis" className="w-full h-full object-contain" />
                <div className="absolute inset-0 flex items-end justify-center p-4">
                    <ResultDisplay
                      isLoading={isLoading}
                      error={error}
                      results={results}
                      hasSubmitted={hasSubmitted}
                    />
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <p>Please select or upload an image to begin.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
