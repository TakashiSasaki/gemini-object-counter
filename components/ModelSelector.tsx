
import React from 'react';
import { ModelOption } from '../types';

interface ModelSelectorProps {
  models: ModelOption[];
  selectedValue: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled: boolean;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ models, selectedValue, onChange, disabled }) => {
  return (
    <div>
      <label htmlFor="model" className="block text-lg font-semibold text-indigo-300 mb-2">
        Choose a Model
      </label>
      <select
        id="model"
        value={selectedValue}
        onChange={onChange}
        disabled={disabled}
        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 disabled:opacity-50"
      >
        {models.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ModelSelector;
