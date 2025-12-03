import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from '@google/genai';
import { SongEvaluationMetrics } from './plugins/model-plugin.interface';

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
  sunoPrompt?: string;
}

export interface ImageParameters {
    title: string;
    lyricTheme: string;
    lyrics: string; // Added lyrics for context
    sunoPrompt?: string;
}

export interface LyricsResponse {
  title: string;
  lyrics: string;
  sunoPrompt: string;
}

export interface LyricAnalysis {
  theme: string;
  mood: string;
  imagery: string;
  critique: string;
  bias_check: {
    is_biased: boolean;
    reasoning: string;
  };
  suggestion: {
    section: string;
    revised_lyrics: string;
  };
}

// Re-export SongEvaluationMetrics from the plugin interface for backward compatibility
export type { SongEvaluationMetrics } from './plugins/model-plugin.interface';

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
      You are the Creative Assistant for a pop song generator.
      Your task is to generate three things based on the user's specifications:
      1. A creative and fitting song title.
      2. A "Suno Prompt": A concise, comma-separated string of musical tags describing style, genre, instruments, and mood, optimized for the Suno AI "Style of Music" field (e.g., "Dark Synth-pop, Male Vocals, Driving Bass, Melancholic, 115bpm").
      3. The complete song lyrics.

      The output format MUST be structured exactly as follows, with each section clearly marked:

      Title: [Your Song Title in the specified language]

      Suno Prompt: [Your concise comma-separated tags in English]

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

      Generate the title, Suno prompt, and lyrics now.
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
      // Match "Suno Prompt:" or legacy "Musical Blueprint:" just in case
      const promptMatch = trimmedText.match(/^(?:Suno Prompt|Musical Blueprint):\s*([\s\S]*?)(?=\n\s*\[|$)/im);
      
      const title = titleMatch ? titleMatch[1].trim() : 'Untitled Pop Song';
      const sunoPrompt = promptMatch ? promptMatch[1].trim() : 'Pop, Melodic, 120bpm';

      const lyricStartIndex = trimmedText.search(/^\s*\[/m);
      let lyrics = "Lyrics not generated.";
      if (lyricStartIndex !== -1) {
          lyrics = trimmedText.substring(lyricStartIndex).trim();
      }

      // Fallback if parsing fails but we have some text
      if (title === 'Untitled Pop Song' && sunoPrompt === 'Pop, Melodic, 120bpm' && lyrics === 'Lyrics not generated.') {
          lyrics = trimmedText; // Assume the whole response is lyrics if we can't parse it
      }

      return { title, lyrics, sunoPrompt };

    } catch (error) {
      console.error('Error calling Gemini API for lyrics:', error);
      throw new Error('Failed to generate lyrics via Gemini API.');
    }
  }
  
  async generateImage(params: ImageParameters): Promise<string> {
    const model = 'imagen-4.0-generate-001';
    
    const prompt = `
      Create a vibrant, high-contrast, cyberpunk-themed album cover.
      Art style: a mix of futuristic digital painting and hyper-realism.
      The image MUST visually represent the themes, mood, and key imagery from the provided song lyrics.
      
      Song Title: "${params.title}"
      Lyrical Theme: "${params.lyricTheme}"
      Musical Style: "${params.sunoPrompt}"
      
      Lyrics for Context:
      ---
      ${params.lyrics}
      ---
      
      Incorporate neon glows, chrome reflections, and abstract digital light patterns.
      The image must include the text "${params.title}" written in a stylized, futuristic, neon font. The text should be clearly legible.
      The composition should be visually striking and centered.
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
        throw new Error('API did not return any images. This might be due to a safety policy violation. Try a different theme.');
      }

      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      return `data:image/png;base64,${base64ImageBytes}`;
    } catch(error) {
       console.error('Error calling Gemini API for image generation:', error);
       throw new Error('Failed to generate cover art via Gemini API.');
    }
  }

  async editImage(originalParams: ImageParameters, editPrompt: string): Promise<string> {
    const model = 'imagen-4.0-generate-001';
    
    const prompt = `
      You are an expert at re-imagining album cover art.
      The original concept was a vibrant, high-contrast, cyberpunk-themed album cover for a song titled "${originalParams.title}".
      The original lyrical theme was "${originalParams.lyricTheme}" and the musical style was "${originalParams.sunoPrompt}".
      The original art was meant to visually represent these lyrics:
      ---
      ${originalParams.lyrics}
      ---

      Now, apply the following edit instruction to that original concept: "${editPrompt}".

      Generate a NEW album cover that incorporates this change. 
      The text "${originalParams.title}" must still be present and legible in a stylized, futuristic, neon font.
      Maintain the overall cyberpunk aesthetic but with the requested modification.
      The image must still be visually striking and centered.
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
        throw new Error('API did not return any edited images. This might be due to a safety policy violation. Try a different prompt.');
      }

      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      return `data:image/png;base64,${base64ImageBytes}`;
    } catch(error) {
       console.error('Error calling Gemini API for image editing:', error);
       throw new Error('Failed to edit cover art via Gemini API.');
    }
  }

  async analyzeAndSuggest(lyrics: string, title: string, theme: string): Promise<LyricAnalysis> {
    const model = 'gemini-2.5-flash';

    const prompt = `
      You are a world-class music producer and hit-maker. Analyze the following song lyrics for their hit potential.

      Song Title: "${title}"
      Lyrical Theme: "${theme}"
      Lyrics:
      ---
      ${lyrics}
      ---

      Your task is to provide a structured analysis and one specific, high-impact suggestion to elevate the song.

      1.  **Analysis**:
          -   **Theme & Mood**: Briefly describe the main theme and emotional tone.
          -   **Imagery**: Identify the most powerful imagery or metaphors.
          -   **Critique**: Provide a constructive critique. What works? What is weak? Focus on flow, rhyme scheme, and emotional impact.
          -   **Bias Check**: Analyze the lyrics for any potential racial, gender, or cultural stereotypes.

      2.  **Suggestion**:
          -   Identify the ONE section that needs the most improvement to make the song a hit (e.g., make the Chorus catchier, or the Bridge more emotional).
          -   Rewrite that ENTIRE section to be more impactful.
          -   IMPORTANT: The "section" field must match the exact header used in the provided lyrics (e.g., "[Chorus]" or "[Verse 1]").

      Your response MUST be a valid JSON object. Do not include any other text or markdown formatting. The JSON schema is as follows:
    `;

    const analysisSchema = {
      type: Type.OBJECT,
      properties: {
        theme: { type: Type.STRING, description: "The main theme and message of the lyrics." },
        mood: { type: Type.STRING, description: "The emotional tone or atmosphere of the song." },
        imagery: { type: Type.STRING, description: "Analysis of the song's use of imagery and metaphors." },
        critique: { type: Type.STRING, description: "Constructive critique of the lyrics." },
        bias_check: {
          type: Type.OBJECT,
          properties: {
            is_biased: { type: Type.BOOLEAN, description: "True if potential bias is detected, otherwise false." },
            reasoning: { type: Type.STRING, description: "Explanation if bias is detected, or a confirmation of no bias found." },
          },
          required: ["is_biased", "reasoning"],
        },
        suggestion: {
          type: Type.OBJECT,
          properties: {
            section: { type: Type.STRING, description: "The section header of the revised lyrics (e.g., '[Chorus]')." },
            revised_lyrics: { type: Type.STRING, description: "The full text of the revised lyric section." },
          },
          required: ["section", "revised_lyrics"],
        },
      },
      required: ["theme", "mood", "imagery", "critique", "bias_check", "suggestion"],
    };

    try {
      const response = await this.ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: analysisSchema,
        },
      });
      const text = response.text;
      if (!text) {
        throw new Error('Received an empty analysis from the API.');
      }
      return JSON.parse(text) as LyricAnalysis;
    } catch (error) {
      console.error('Error calling Gemini API for lyric analysis:', error);
      throw new Error('Failed to analyze lyrics via Gemini API.');
    }
  }
  
  async generateMidi(params: SongParameters): Promise<string> {
    const model = 'gemini-2.5-flash';
  
    const prompt = `
      You are an expert Symbolic Music Engine (SME). Your task is to generate a multi-track MIDI file as a base64 encoded string.
      The MIDI file should be a short demo, approximately 30 seconds long, based on the following specifications.
      
      SONG SPECIFICATIONS:
      - Genre: ${params.genre}
      - Style: ${params.style}
      - Key: ${params.key}
      - BPM: ${params.bpm}
      - Suno Prompt/Vibe: ${params.sunoPrompt}
      
      IMPORTANT RESPONSE RULES:
      1. Return ONLY the raw Base64 encoded string of the MIDI file.
      2. The binary data MUST start with the standard MIDI header "MThd" (Base64 starts with TVRoZ).
      3. Do NOT use JSON. 
      4. Do NOT use Markdown code blocks (like \`\`\` or \`\`\`json).
      5. Do NOT add any explanation text.
      6. The output must be one continuous string of Base64 characters.
    `;
  
    try {
      const response = await this.ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'text/plain', // Use text/plain to avoid JSON parsing limits on large base64 strings
        },
      });
  
      const text = response.text;
      if (!text || text.trim() === '') {
        throw new Error('Received an empty MIDI response from the API.');
      }
  
      // Aggressive cleaning to remove any whitespace, newlines, markdown, or non-base64 characters
      let base64Midi = text.replace(/[^A-Za-z0-9+/=]/g, '');
      
      // Fix padding if necessary (Base64 length must be a multiple of 4)
      const padding = (4 - (base64Midi.length % 4)) % 4;
      if (padding > 0) {
        base64Midi += '='.repeat(padding);
      }
      
      if (base64Midi.length === 0) {
        throw new Error('MIDI generation failed: Output contained no valid Base64 data.');
      }

      // Final decoding check to ensure validity before returning
      try {
        atob(base64Midi);
      } catch (e) {
        console.error('AI returned invalid Base64 data:', e, 'Raw cleaned data start:', base64Midi.substring(0, 50));
        throw new Error('AI returned invalid Base64 data for the MIDI file.');
      }
  
      return base64Midi;
  
    } catch (error) {
      console.error('Error calling Gemini API for MIDI generation:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to generate MIDI via Gemini API.');
    }
  }

  /**
   * Evaluate song quality with detailed metrics for musicality and lyric quality
   */
  async evaluateSong(lyrics: string, title: string, params: SongParameters): Promise<SongEvaluationMetrics> {
    const model = 'gemini-2.5-flash';

    const prompt = `
      You are an expert music critic and songwriter. Evaluate the following song for its quality and hit potential.
      Provide detailed metrics and actionable feedback.

      Song Title: "${title}"
      Genre: ${params.genre}
      Style: ${params.style}
      Theme: ${params.lyricTheme}
      
      Lyrics:
      ---
      ${lyrics}
      ---

      Evaluate the song across multiple dimensions and provide scores from 0-100.
      Be critical but constructive. Consider commercial appeal, artistic merit, and technical quality.
    `;

    const evaluationSchema = {
      type: Type.OBJECT,
      properties: {
        overallScore: {
          type: Type.NUMBER,
          description: 'Overall quality score from 0-100',
        },
        lyrical: {
          type: Type.OBJECT,
          properties: {
            rhymeConsistency: {
              type: Type.NUMBER,
              description: 'Rhyme scheme consistency from 0-100',
            },
            emotionalCoherence: {
              type: Type.NUMBER,
              description: 'Emotional coherence from 0-100',
            },
            originality: {
              type: Type.NUMBER,
              description: 'Originality of themes and phrases from 0-100',
            },
            clarity: {
              type: Type.NUMBER,
              description: 'Clarity and readability from 0-100',
            },
          },
          required: ['rhymeConsistency', 'emotionalCoherence', 'originality', 'clarity'],
        },
        musical: {
          type: Type.OBJECT,
          properties: {
            melodicInterest: {
              type: Type.NUMBER,
              description: 'Melodic interest and catchiness from 0-100',
            },
            harmonicQuality: {
              type: Type.NUMBER,
              description: 'Harmonic progression quality from 0-100',
            },
            rhythmicConsistency: {
              type: Type.NUMBER,
              description: 'Rhythmic consistency from 0-100',
            },
            structureQuality: {
              type: Type.NUMBER,
              description: 'Structure and arrangement quality from 0-100',
            },
          },
          required: ['melodicInterest', 'harmonicQuality', 'rhythmicConsistency', 'structureQuality'],
        },
        feedback: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Detailed feedback points',
        },
        improvements: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Suggested improvements',
        },
      },
      required: ['overallScore', 'lyrical', 'musical', 'feedback', 'improvements'],
    };

    try {
      const response = await this.ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: evaluationSchema,
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error('Received an empty evaluation from the API.');
      }

      return JSON.parse(text) as SongEvaluationMetrics;
    } catch (error) {
      console.error('Error calling Gemini API for song evaluation:', error);
      throw new Error('Failed to evaluate song via Gemini API.');
    }
  }
}