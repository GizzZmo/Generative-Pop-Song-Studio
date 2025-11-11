import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from '@google/genai';

export interface SongParameters {
  genre: string;
  style: string;
  structure: string;
  key: string;
  bpm: number;
  lyricTheme: string;
  lyricSentiment: string;
  language: string;
  creativity: number;
  musicalAesthetics?: string;
}

export interface ImageParameters {
    title: string;
    lyricTheme: string;
    musicalAesthetics?: string;
}

export interface LyricsResponse {
  title: string;
  lyrics: string;
  musicalAesthetics: string;
}

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // IMPORTANT: The API key is sourced from environment variables.
    // Do not hardcode or expose it in the frontend.
    // This assumes `process.env.API_KEY` is available in the execution environment.
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set.");
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generateLyrics(params: SongParameters): Promise<LyricsResponse> {
    const model = 'gemini-2.5-flash';

    const prompt = `
      You are the Lyrical and Musical Concept Generation Engine for a sophisticated pop song generator.
      Your task is to generate three things based on the user's specifications:
      1. A creative and fitting song title.
      2. A "Musical Blueprint": a detailed, evocative description of the song's musical arrangement, instrumentation, and overall vibe. This blueprint will be used by another AI to generate the actual music, so be descriptive (e.g., "A driving synth-bassline with a punchy 80s drum machine beat. Hazy, atmospheric pads create a melancholic mood, while a sharp, crystalline synth lead plays the main melody. The chorus should feel bigger with added reverb and subtle harmony layers.").
      3. The complete song lyrics.

      The output format MUST be structured exactly as follows, with each section clearly marked:

      Title: [Your Song Title in the specified language]

      Musical Blueprint: [Your detailed musical description in English]

      [Verse 1]
      (lyrics in the specified language)

      [Chorus]
      (lyrics in the specified language)
      
      ... and so on for the rest of the song structure.

      IMPORTANT: The section labels for the lyrics (e.g., [Verse 1], [Chorus]) MUST be in English. Only the title and the lyrics themselves should be in the specified language. Do not add any other introductory or concluding text.

      ---
      SONG SPECIFICATIONS:
      - Language: ${params.language}
      - Genre: ${params.genre}
      - Style Influences: ${params.style}
      - Desired Song Structure: ${params.structure}
      - Key / Mood: ${params.key}
      - BPM: ${params.bpm}
      - Lyrical Theme: ${params.lyricTheme}
      - Lyrical Sentiment Profile: ${params.lyricSentiment}
      - Creativity / "Oddball" Factor (0=formulaic, 100=highly experimental): ${params.creativity}%
      ---

      Generate the title, musical blueprint, and lyrics now.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: model,
        contents: prompt,
      });

      const text = response.text;
      if (!text) {
        throw new Error('Received an empty response from the API.');
      }
      
      const trimmedText = text.trim();
      const titleMatch = trimmedText.match(/^Title:\s*(.*)$/im);
      const blueprintMatch = trimmedText.match(/^Musical Blueprint:\s*([\s\S]*?)(?=\n\s*\[|$)/im);
      
      const title = titleMatch ? titleMatch[1].trim() : 'Untitled Pop Song';
      const musicalAesthetics = blueprintMatch ? blueprintMatch[1].trim() : 'No musical blueprint generated.';

      const lyricStartIndex = trimmedText.search(/^\s*\[/m);
      let lyrics = "Lyrics not generated.";
      if (lyricStartIndex !== -1) {
          lyrics = trimmedText.substring(lyricStartIndex).trim();
      }

      // Fallback if parsing fails but we have some text
      if (title === 'Untitled Pop Song' && musicalAesthetics === 'No musical blueprint generated.' && lyrics === 'Lyrics not generated.') {
          lyrics = trimmedText; // Assume the whole response is lyrics if we can't parse it
      }

      return { title, lyrics, musicalAesthetics };

    } catch (error) {
      console.error('Error calling Gemini API for lyrics:', error);
      throw new Error('Failed to generate lyrics via Gemini API.');
    }
  }
  
  async generateImage(params: ImageParameters): Promise<string> {
    const model = 'imagen-4.0-generate-001';
    
    const prompt = `
      Create a vibrant, high-contrast, cyberpunk-themed album cover art.
      The central theme is "${params.lyricTheme}".
      The musical style is described as: "${params.musicalAesthetics}".
      The artwork should be visually striking, with neon glows, futuristic cityscapes, or abstract digital patterns.
      Prominently feature the song title "${params.title}" in a stylized, futuristic font that fits the cyberpunk aesthetic.
      The style should be a mix of digital painting and photographic elements.
      Aspect ratio: 1:1.
    `;

    try {
      const response = await this.ai.models.generateImages({
        model,
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: '1:1',
        },
      });

      if (!response.generatedImages || response.generatedImages.length === 0) {
        throw new Error('API did not return any images.');
      }

      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      return `data:image/png;base64,${base64ImageBytes}`;
    } catch(error) {
       console.error('Error calling Gemini API for image generation:', error);
       throw new Error('Failed to generate cover art via Gemini API.');
    }
  }
  
  async generateMidi(params: SongParameters): Promise<string> {
    const model = 'gemini-2.5-flash';

    const prompt = `
      You are an expert Symbolic Music Engine (SME). Your task is to generate a multi-track MIDI file based on the user's song specifications and the provided musical blueprint.

      The generated MIDI file should be a complete song, approximately 60-90 seconds long. It must include distinct, instrument-separated tracks as described in the blueprint (typically drums, bass, chords, and melody). The entire composition must adhere to the specified song structure.

      ---
      SONG SPECIFICATIONS:
      - Genre: ${params.genre}
      - Style Influences: ${params.style}
      - Song Structure to Follow: ${params.structure}
      - Key: ${params.key}
      - BPM: ${params.bpm}
      - Musical Blueprint: ${params.musicalAesthetics}
      ---
      
      Your response MUST BE ONLY the raw base64 encoded string of the MIDI file.
      Do NOT include the word "json", markdown backticks (\`\`\`), or any other text, labels, or explanations.
      The entire response should be a single, valid base64 string.
    `;
    
    try {
      const response = await this.ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "text/plain",
        }
      });
      
      const text = response.text.trim();
      
      if (!text) {
        throw new Error('Received an empty MIDI response from the API.');
      }

      // Clean up potential markdown formatting that might still slip through
      const cleanBase64 = text.replace(/```/g, '').replace(/midi_base64:/, '').trim();

      // The atob function will throw an error if the string is not valid base64.
      try {
        atob(cleanBase64);
      } catch (e) {
        console.error('Failed to decode base64 string:', cleanBase64, e);
        throw new Error('AI returned invalid Base64 data for the MIDI file.');
      }
  
      return cleanBase64;
  
    } catch (error) {
      console.error('Error calling Gemini API for MIDI generation:', error);
      if (error instanceof Error) {
         throw error; // Re-throw the specific error
      }
      throw new Error('Failed to generate MIDI via Gemini API.');
    }
  }
}
