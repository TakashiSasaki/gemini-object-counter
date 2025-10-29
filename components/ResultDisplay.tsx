
import React from 'react';
import Spinner from './Spinner';
import { ObjectCounts } from '../types';

interface ResultDisplayProps {
  results: ObjectCounts | null;
  isLoading: boolean;
  error: string | null;
  hasSubmitted: boolean;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ results, isLoading, error, hasSubmitted }) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center">
            <Spinner />
            <p className="mt-4 text-lg text-indigo-300 animate-pulse">Analyzing image...</p>
        </div>
      );
    }

    if (error) {
      return <p className="text-center text-red-400 text-lg bg-red-900/50 p-4 rounded-lg">{error}</p>;
    }

    if (results) {
      const entries = Object.entries(results);
      if (entries.length === 0) {
        return <p className="text-center text-gray-400 text-lg">No results found for the given labels.</p>;
      }
      return (
        <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold text-indigo-300 mb-4 text-center">Analysis Complete</h3>
          <ul className="flex flex-wrap justify-center gap-x-4 gap-y-3">
            {entries.map(([label, count]) => (
              <li key={label} className="flex items-center gap-3 bg-gray-700/50 px-4 py-1.5 rounded-full text-lg">
                <span className="font-medium capitalize text-gray-200">{label}</span>
                <span className="font-bold text-indigo-400 bg-gray-900/50 w-9 h-9 flex items-center justify-center rounded-full ring-1 ring-gray-600">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    if (hasSubmitted) {
        return null;
    }

    return <p className="text-center text-gray-500 text-lg">Results will be displayed here.</p>;
  };

  return (
    <div className="w-full">
      {renderContent()}
    </div>
  );
};

export default ResultDisplay;