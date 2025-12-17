import React, { useState } from 'react';
import { Heart, Sparkles, Repeat, Copy, Check } from 'lucide-react';
import { WordResult } from '../types';

interface WordCardProps {
  data: WordResult;
  index: number;
}

export const WordCard: React.FC<WordCardProps> = ({ data, index }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  // Rotate slightly for a playful look when not interacting
  const rotation = index % 2 === 0 ? 'rotate-1' : '-rotate-1';

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card flip
    navigator.clipboard.writeText(data.word);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 1500);
  };

  return (
    <div 
      className={`relative h-40 w-full perspective-1000 cursor-pointer group ${rotation}`}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div 
        className={`
          w-full h-full relative transition-all duration-500 
          [transform-style:preserve-3d] 
          ${isFlipped ? '[transform:rotateY(180deg)]' : ''}
        `}
      >
        {/* Front of Card */}
        <div className="
          absolute inset-0 
          bg-white rounded-2xl p-4 
          shadow-lg shadow-pink-100 
          border-2 border-transparent group-hover:border-pink-200
          flex flex-col items-center justify-center
          [backface-visibility:hidden]
        ">
          {/* Copy Button & Tooltips Container */}
          <div className="absolute top-2 left-2 z-20 flex items-center">
            <button
              onClick={handleCopy}
              className="peer p-2 rounded-full text-pink-300 hover:bg-pink-50 hover:text-pink-500 transition-all"
            >
              {showCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Hover Tooltip (Hidden if Copied state is active) */}
            <div className={`
              absolute left-full ml-1
              bg-pink-400 text-white text-[10px] font-bold px-2 py-1 rounded-full 
              shadow-sm pointer-events-none transition-all duration-200 w-max
              opacity-0 -translate-x-2 peer-hover:opacity-100 peer-hover:translate-x-0
              ${showCopied ? 'hidden' : ''}
            `}>
              Copy this word!
            </div>

            {/* Copied Label */}
            <div className={`
              absolute left-full ml-1
              bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full 
              shadow-sm pointer-events-none transition-all duration-300 w-max
              ${showCopied ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 hidden'}
            `}>
              Copied!
            </div>
          </div>

          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
             <Repeat className="w-4 h-4 text-pink-300" />
          </div>
          
          <span className="text-xl font-bold text-gray-700 group-hover:text-pink-600 transition-colors mb-2">
            {data.word}
          </span>
          
          <div className="flex gap-2 mt-2">
            {index % 3 === 0 ? (
              <Sparkles className="w-5 h-5 text-yellow-400 fill-yellow-200" />
            ) : (
              <Heart className="w-5 h-5 text-pink-400 fill-pink-200" />
            )}
          </div>
          <span className="text-xs text-pink-300 mt-2 font-medium">Tap to define</span>
        </div>

        {/* Back of Card */}
        <div className="
          absolute inset-0 
          bg-pink-50 rounded-2xl p-4 
          shadow-lg shadow-pink-200 
          border-2 border-pink-200
          flex flex-col items-center justify-center text-center
          [backface-visibility:hidden] 
          [transform:rotateY(180deg)]
        ">
          <p className="text-sm font-medium text-gray-600 leading-snug">
            {data.definition}
          </p>
        </div>
      </div>
    </div>
  );
};
