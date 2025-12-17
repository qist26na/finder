import React, { useState, useEffect } from 'react';
import { SearchBar } from './components/SearchBar';
import { WordCard } from './components/WordCard';
import { fetchWords } from './services/geminiService';
import { Heart, Cloud, Music, Star, ArrowDown, Loader2, History, X } from 'lucide-react';
import { WordResult, SearchMode, HistoryItem } from './types';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<SearchMode>('starts_with');
  const [words, setWords] = useState<WordResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history from local storage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('wordFinderHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const saveToHistory = (text: string, searchMode: SearchMode) => {
    const newItem: HistoryItem = { 
      text, 
      mode: searchMode, 
      id: `${text}-${searchMode}-${Date.now()}` 
    };

    setHistory(prev => {
      // Remove duplicates (same text and mode)
      const filtered = prev.filter(item => 
        !(item.text.toLowerCase() === text.toLowerCase() && item.mode === searchMode)
      );
      // Add new item to front, keep max 8 items
      const updated = [newItem, ...filtered].slice(0, 8);
      localStorage.setItem('wordFinderHistory', JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromHistory = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem('wordFinderHistory', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSearch = async (overrideQuery?: string, overrideMode?: SearchMode) => {
    const textToSearch = overrideQuery ?? query;
    const modeToUse = overrideMode ?? mode;

    if (!textToSearch.trim()) return;

    // Update state if we are running from history click
    if (overrideQuery) setQuery(overrideQuery);
    if (overrideMode) setMode(overrideMode);

    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setHasMore(true);
    setWords([]); 

    // Save to history only if not triggered by "load more" (which doesn't call this)
    saveToHistory(textToSearch.trim(), modeToUse);

    try {
      const result = await fetchWords(textToSearch.trim(), modeToUse);
      setWords(result);
      if (result.length < 5) setHasMore(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong! 🌸");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (!query.trim() || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const currentWordList = words.map(w => w.word);
      const newWords = await fetchWords(query.trim(), mode, currentWordList);
      
      if (newWords.length === 0) {
        setHasMore(false);
      } else {
        setWords(prev => [...prev, ...newWords]);
        if (newWords.length < 8) {
            setHasMore(false);
        }
      }
    } catch (err) {
      console.error("Failed to load more:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-pink-100 to-rose-100 selection:bg-pink-200 selection:text-pink-900 overflow-hidden relative">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-10 left-10 text-pink-200 animate-float" style={{ animationDelay: '0s' }}>
        <Cloud className="w-24 h-24" fill="currentColor" />
      </div>
      <div className="absolute top-20 right-20 text-pink-200 animate-float" style={{ animationDelay: '1s' }}>
        <Heart className="w-16 h-16" fill="currentColor" />
      </div>
      <div className="absolute bottom-10 left-20 text-rose-200 animate-float" style={{ animationDelay: '2s' }}>
        <Star className="w-20 h-20" fill="currentColor" />
      </div>
      
      {/* Main Content Container */}
      <div className="relative z-10 container mx-auto px-4 py-12 max-w-4xl flex flex-col items-center min-h-screen">
        
        {/* Header */}
        <header className="text-center mb-10 animate-float">
          <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500 mb-4 drop-shadow-sm">
            Word Finder
          </h1>
          <p className="text-pink-400 font-medium text-lg md:text-xl flex items-center justify-center gap-2">
            Find cute words... <Heart className="w-5 h-5 fill-pink-400 animate-pulse" />
          </p>
        </header>

        {/* Search Section */}
        <section className="w-full mb-8 z-20">
          <SearchBar 
            value={query} 
            onChange={setQuery} 
            onSearch={() => handleSearch()} 
            isLoading={isLoading} 
            mode={mode}
            onModeChange={setMode}
          />
        </section>

        {/* Recent Searches */}
        {!hasSearched && history.length > 0 && (
          <section className="w-full max-w-md mb-12 animate-[fadeIn_0.5s_ease-out]">
            <div className="flex items-center gap-2 mb-3 text-pink-400/80 font-medium px-4">
              <History className="w-4 h-4" />
              <span className="text-sm">Recent Sparkles</span>
            </div>
            <div className="flex flex-wrap gap-2 px-2">
              {history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSearch(item.text, item.mode)}
                  className="
                    group flex items-center gap-2 px-4 py-2 
                    bg-white/60 hover:bg-white 
                    rounded-2xl border border-pink-100 hover:border-pink-300
                    text-gray-600 hover:text-pink-500
                    transition-all duration-300 shadow-sm hover:shadow-md
                    text-sm
                  "
                >
                  <span className="font-bold text-pink-400/70 group-hover:text-pink-400">
                    {item.mode === 'starts_with' ? 'Start:' : 'End:'}
                  </span>
                  <span>{item.text}</span>
                  <div 
                    onClick={(e) => removeFromHistory(e, item.id)}
                    className="ml-1 p-0.5 rounded-full hover:bg-pink-100 text-pink-300 hover:text-pink-500"
                  >
                    <X className="w-3 h-3" />
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Results Section */}
        <section className="w-full flex-grow flex flex-col items-center z-10">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-300 p-4 rounded-r-xl max-w-lg mx-auto mb-8 animate-bounce">
              <p className="text-red-500 font-medium text-center">{error}</p>
            </div>
          )}

          {!isLoading && hasSearched && words.length === 0 && !error && (
             <div className="text-center text-pink-400 mt-10">
               <p className="text-xl">No words found for "{query}" 🥺</p>
               <p className="text-sm mt-2">Try a different combo!</p>
             </div>
          )}

          {!hasSearched && history.length === 0 && (
            <div className="text-center text-pink-300 mt-10 opacity-60">
               <Music className="w-16 h-16 mx-auto mb-4 animate-bounce" />
               <p className="text-xl">Type some letters above to start magic!</p>
            </div>
          )}

          {words.length > 0 && (
            <div className="w-full">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 w-full mb-12">
                {words.map((item, index) => (
                  <div 
                    key={`${item.word}-${index}`} 
                    className="opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]"
                    style={{ animationDelay: `${(index % 12) * 0.05}s` }}
                  >
                    <WordCard data={item} index={index} />
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center pb-20">
                  <button 
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="
                      group relative overflow-hidden
                      px-8 py-3 rounded-full
                      bg-white text-pink-500 font-bold text-lg
                      shadow-lg shadow-pink-200
                      hover:shadow-xl hover:scale-105 hover:bg-pink-50
                      active:scale-95
                      transition-all duration-300
                      disabled:opacity-70 disabled:cursor-not-allowed
                      flex items-center gap-2
                    "
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Finding more...
                      </>
                    ) : (
                      <>
                        Load More Words
                        <ArrowDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              )}
              
              {!hasMore && words.length > 0 && (
                <div className="text-center pb-20 text-pink-400 font-medium opacity-80">
                  ✨ That's all we could find! ✨
                </div>
              )}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="w-full text-center py-6 text-pink-300 text-sm font-medium">
          Made with <span className="inline-block animate-pulse">💖</span> by Gemini
        </footer>
      </div>

      {/* Global styles for keyframes that can't be easily done in tailwind classes alone for dynamic lists */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default App;
