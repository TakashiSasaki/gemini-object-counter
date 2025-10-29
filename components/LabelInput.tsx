
import React from 'react';

interface LabelInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  disabled: boolean;
}

const LabelInput: React.FC<LabelInputProps> = ({ value, onChange, placeholder, disabled }) => {
  return (
    <div>
        <label htmlFor="labels" className="block text-lg font-semibold text-indigo-300 mb-2">
            Objects to Count
        </label>
        <input
            id="labels"
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 disabled:opacity-50"
        />
        <p className="text-sm text-gray-400 mt-1">Enter comma-separated labels, or leave blank to auto-detect.</p>
    </div>
  );
};

export default LabelInput;