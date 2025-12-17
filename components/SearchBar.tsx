import React from 'react';
import { Search, Loader2, Sparkles, ArrowRightToLine, ArrowLeftToLine } from 'lucide-react';
import { SearchMode } from '../types';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onSearch: () => void;
  isLoading: boolean;
  mode: SearchMode;
  onModeChange: (mode: SearchMode) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  value, 
  onChange, 
  onSearch, 
  isLoading,
  mode,
  onModeChange
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-3">
      <div className="relative group w-full">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="w-6 h-6 text-pink-400 group-focus-within:text-pink-500 transition-colors" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={mode === 'starts_with' ? "Type starting letters (e.g., 'fr')..." : "Type ending letters (e.g., 'ch')..."}
          className="
            w-full pl-12 pr-14 py-4
            text-lg font-medium text-gray-700
            placeholder-pink-300
            bg-white/80 backdrop-blur-sm
            border-2 border-pink-200
            rounded-full
            shadow-[0_4px_20px_-2px_rgba(236,72,153,0.2)]
            focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100
            transition-all duration-300
          "
        />
        <div className="absolute inset-y-0 right-2 flex items-center">
          <button
            onClick={onSearch}
            disabled={isLoading || !value.trim()}
            className="
              p-2 rounded-full
              bg-gradient-to-tr from-pink-400 to-rose-400
              text-white shadow-md
              hover:shadow-lg hover:from-pink-500 hover:to-rose-500
              active:scale-95
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-300
            "
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Sparkles className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mode Toggles */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => onModeChange('starts_with')}
          className={`
            flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all
            ${mode === 'starts_with' 
              ? 'bg-pink-100 text-pink-600 ring-2 ring-pink-200' 
              : 'bg-white/50 text-pink-300 hover:bg-pink-50'}
          `}
        >
          <ArrowRightToLine className="w-4 h-4" />
          Starts with...
        </button>
        <button
          onClick={() => onModeChange('ends_with')}
          className={`
            flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all
            ${mode === 'ends_with' 
              ? 'bg-pink-100 text-pink-600 ring-2 ring-pink-200' 
              : 'bg-white/50 text-pink-300 hover:bg-pink-50'}
          `}
        >
          <ArrowLeftToLine className="w-4 h-4" />
          Ends with...
        </button>
      </div>
    </div>
  );
};
