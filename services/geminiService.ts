import { GoogleGenAI, Type } from "@google/genai";
import { WordResult, SearchMode } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchWords = async (
  text: string, 
  mode: SearchMode, 
  excludeWords: string[] = []
): Promise<WordResult[]> => {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const cleanText = text.trim().toLowerCase();

  try {
    const modelId = "gemini-2.5-flash"; 
    
    // Construct the exclusion part of the prompt
    const excludePrompt = excludeWords.length > 0 
      ? `Do not include any of these words: ${excludeWords.join(', ')}.` 
      : '';

    // Construct mode-specific instructions
    let instruction = "";
    let example = "";
    let critical = "";

    if (mode === 'starts_with') {
      instruction = `strictly start with the letters "${cleanText}"`;
      example = `For example, if the prefix is "tra", return "track", "trace", "train". Do NOT return "tar", "ta", or "t".`;
      critical = `All words MUST begin with the exact characters "${cleanText}".`;
    } else {
      instruction = `strictly end with the letters "${cleanText}"`;
      example = `For example, if the suffix is "ch", return "such", "beach", "peach". Do NOT return "chat" or "cheese".`;
      critical = `All words MUST end with the exact characters "${cleanText}".`;
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: `List 12 to 15 common, distinct English words that ${instruction}. 
      
      CRITICAL INSTRUCTION: ${critical}
      ${example}
      
      ${excludePrompt} 
      
      For each word, provide a short, simple, and cute definition suitable for a general audience. Ensure words are family-friendly.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            words: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  definition: { type: Type.STRING }
                },
                required: ["word", "definition"]
              },
              description: "A list of words and their definitions."
            }
          },
          required: ["words"]
        },
        temperature: 0.6, 
      }
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("No response from Gemini.");
    }

    const data = JSON.parse(jsonText) as { words: WordResult[] };
    
    // STRICT CLIENT-SIDE FILTERING
    const validWords = (data.words || []).filter(item => {
      const w = item.word.toLowerCase();
      if (mode === 'starts_with') {
        return w.startsWith(cleanText);
      } else {
        return w.endsWith(cleanText);
      }
    });

    return validWords;

  } catch (error) {
    console.error("Error fetching words:", error);
    throw new Error("Oops! I couldn't find any words right now. Try again!");
  }
};
