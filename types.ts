export interface WordResult {
  word: string;
  definition: string;
}

export interface SearchState {
  query: string;
  results: WordResult[];
  isLoading: boolean;
  error: string | null;
}

export type SearchMode = 'starts_with' | 'ends_with';

export interface HistoryItem {
  text: string;
  mode: SearchMode;
  id: string;
}
