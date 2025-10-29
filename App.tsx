import React, { useState, useEffect } from 'react';
import { PRESET_IMAGES, MODELS } from './constants';
import { countObjectsInImage } from './services/geminiService';
import { GeminiModel, ObjectCounts, PresetImage } from './types';
import ImageSelector from './components/ImageSelector';
import LabelInput from './components/LabelInput';
import ModelSelector from './components/ModelSelector';
import ResultDisplay from './components/ResultDisplay';
import { SparklesIcon } from './components/icons';

const App: React.FC = () => {
  const [presetImages, setPresetImages] = useState<PresetImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [labels, setLabels] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<GeminiModel>('gemini-robotics-er-1.5-preview');
  const [results, setResults] = useState<ObjectCounts | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [isRefreshingPresets, setIsRefreshingPresets] = useState<boolean>(true);

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

  /**
   * Fetches an image from a dynamic URL, converts it to a stable data URL via canvas,
   * and returns an updated PresetImage object. This prevents inconsistencies where
   * the same URL could resolve to different images.
   * @param preset The original preset image object.
   * @returns A promise that resolves to a new PresetImage with a stable data URL src.
   */
  const stabilizePresetImage = (preset: PresetImage): Promise<PresetImage> => {
    return new Promise((resolve, reject) => {
        const keywordsMap: { [key: string]: string } = {
            'animals': 'safari,animals',
            'tableware': 'tableware,dinner',
            'cars': 'car,parking',
            'stationery': 'stationery,desk',
        };
        const keywords = keywordsMap[preset.id] || preset.id;
        const randomSrc = `https://loremflickr.com/800/600/${keywords}?random=${Math.random()}`;

        const image = new Image();
        image.crossOrigin = 'Anonymous';
        image.src = randomSrc;

        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error('Could not get canvas context'));
            }
            ctx.drawImage(image, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg');
            resolve({ ...preset, src: dataUrl });
        };
        image.onerror = () => reject(new Error(`Failed to load preset image for: ${keywords}`));
    });
  };

  /**
   * Loads a new set of preset images by fetching them and converting them to stable data URLs.
   */
  const loadPresets = async () => {
    setIsRefreshingPresets(true);
    setError(null);
    try {
        const stabilizedPresets = await Promise.all(PRESET_IMAGES.map(stabilizePresetImage));
        setPresetImages(stabilizedPresets);
        if (stabilizedPresets.length > 0) {
            handlePresetSelect(stabilizedPresets[0].src);
        }
    } catch (err) {
        console.error("Error loading preset images:", err);
        setError(err instanceof Error ? err.message : "Failed to load images. Please try again.");
    } finally {
        setIsRefreshingPresets(false);
    }
  };

  // Load initial presets when the component mounts.
  useEffect(() => {
    loadPresets();
  }, []);


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
      // The selectedImage is now always a data URL, so no conversion is needed.
      const apiResults = await countObjectsInImage(selectedImage, labelList, selectedModel);
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
            WIMC Object Counter
          </h1>
          <p className="mt-2 text-lg text-gray-400 max-w-2xl mx-auto">
            Upload an image, provide labels, and let the AI count the objects for you.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-800 p-6 rounded-xl shadow-2xl space-y-6">
            <ImageSelector 
              presetImages={presetImages}
              selectedImage={selectedImage}
              onSelect={handlePresetSelect}
              onFileUpload={handleFileUpload}
              onRefresh={loadPresets}
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
                <img src={selectedImage} alt="Selected for analysis" className={`w-full h-full object-contain transition-opacity duration-300 ${isLoading ? 'opacity-30' : 'opacity-100'}`} />
                <div className="absolute inset-0 flex items-center justify-center p-4">
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
                <p>Loading preset images...</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;