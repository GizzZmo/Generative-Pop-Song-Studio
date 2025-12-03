import { GoogleGenAI, Type } from '@google/genai';
import {
  ModelPluginConfig,
  LyricsModelPlugin,
  MidiModelPlugin,
  ImageModelPlugin,
  AnalysisModelPlugin,
  EvaluationModelPlugin,
  LyricsGenerationParams,
  LyricsGenerationResponse,
  MidiGenerationParams,
  ImageGenerationParams,
  LyricAnalysisResult,
  SongEvaluationMetrics,
} from './model-plugin.interface';

/**
 * Gemini Model Plugin
 *
 * Implementation of all model plugin interfaces using Google's Gemini AI.
 * Provides lyrics generation, MIDI generation, image generation, analysis, and evaluation.
 */
export class GeminiModelPlugin
  implements
    LyricsModelPlugin,
    MidiModelPlugin,
    ImageModelPlugin,
    AnalysisModelPlugin,
    EvaluationModelPlugin
{
  readonly config: ModelPluginConfig = {
    id: 'gemini-default',
    name: 'Google Gemini',
    version: '1.0.0',
    description:
      'Multi-modal AI plugin using Google Gemini for lyrics, MIDI, images, and analysis',
    requiredConfig: ['API_KEY'],
    optionalConfig: {
      textModel: 'gemini-2.5-flash',
      imageModel: 'imagen-4.0-generate-001',
    },
  };

  private ai: GoogleGenAI | null = null;
  private textModel = 'gemini-2.5-flash';
  private imageModel = 'imagen-4.0-generate-001';

  async initialize(config: Record<string, unknown>): Promise<void> {
    const apiKey = config['API_KEY'] as string;
    if (!apiKey) {
      throw new Error('API_KEY is required for Gemini plugin');
    }

    this.ai = new GoogleGenAI({ apiKey });

    if (config['textModel']) {
      this.textModel = config['textModel'] as string;
    }
    if (config['imageModel']) {
      this.imageModel = config['imageModel'] as string;
    }
  }

  isReady(): boolean {
    return this.ai !== null;
  }

  dispose(): void {
    this.ai = null;
  }

  private ensureReady(): void {
    if (!this.ai) {
      throw new Error('Gemini plugin not initialized. Call initialize() first.');
    }
  }

  async generateLyrics(params: LyricsGenerationParams): Promise<LyricsGenerationResponse> {
    this.ensureReady();

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

    const response = await this.ai!.models.generateContent({
      model: this.textModel,
      contents: prompt,
    });

    const text = response.text;
    if (!text) {
      throw new Error('Received an empty response from the API.');
    }

    const trimmedText = text.trim();
    const titleMatch = trimmedText.match(/^Title:\s*(.*)$/im);
    const promptMatch = trimmedText.match(
      /^(?:Suno Prompt|Musical Blueprint):\s*([\s\S]*?)(?=\n\s*\[|$)/im
    );

    const title = titleMatch ? titleMatch[1].trim() : 'Untitled Pop Song';
    const sunoPrompt = promptMatch ? promptMatch[1].trim() : 'Pop, Melodic, 120bpm';

    const lyricStartIndex = trimmedText.search(/^\s*\[/m);
    let lyrics = 'Lyrics not generated.';
    if (lyricStartIndex !== -1) {
      lyrics = trimmedText.substring(lyricStartIndex).trim();
    }

    if (
      title === 'Untitled Pop Song' &&
      sunoPrompt === 'Pop, Melodic, 120bpm' &&
      lyrics === 'Lyrics not generated.'
    ) {
      lyrics = trimmedText;
    }

    return { title, lyrics, sunoPrompt };
  }

  async generateMidi(params: MidiGenerationParams): Promise<string> {
    this.ensureReady();

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

    const response = await this.ai!.models.generateContent({
      model: this.textModel,
      contents: prompt,
      config: {
        responseMimeType: 'text/plain',
      },
    });

    const text = response.text;
    if (!text || text.trim() === '') {
      throw new Error('Received an empty MIDI response from the API.');
    }

    let base64Midi = text.replace(/[^A-Za-z0-9+/=]/g, '');
    const padding = (4 - (base64Midi.length % 4)) % 4;
    if (padding > 0) {
      base64Midi += '='.repeat(padding);
    }

    if (base64Midi.length === 0) {
      throw new Error('MIDI generation failed: Output contained no valid Base64 data.');
    }

    try {
      atob(base64Midi);
    } catch {
      throw new Error('AI returned invalid Base64 data for the MIDI file.');
    }

    return base64Midi;
  }

  async generateImage(params: ImageGenerationParams): Promise<string> {
    this.ensureReady();

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

    const response = await this.ai!.models.generateImages({
      model: this.imageModel,
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: '1:1',
      },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
      throw new Error(
        'API did not return any images. This might be due to a safety policy violation. Try a different theme.'
      );
    }

    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/png;base64,${base64ImageBytes}`;
  }

  async editImage(originalParams: ImageGenerationParams, editPrompt: string): Promise<string> {
    this.ensureReady();

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

    const response = await this.ai!.models.generateImages({
      model: this.imageModel,
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: '1:1',
      },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
      throw new Error(
        'API did not return any edited images. This might be due to a safety policy violation. Try a different prompt.'
      );
    }

    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/png;base64,${base64ImageBytes}`;
  }

  async analyzeLyrics(lyrics: string, title: string, theme: string): Promise<LyricAnalysisResult> {
    this.ensureReady();

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

      Your response MUST be a valid JSON object. Do not include any other text or markdown formatting.
    `;

    const analysisSchema = {
      type: Type.OBJECT,
      properties: {
        theme: { type: Type.STRING, description: 'The main theme and message of the lyrics.' },
        mood: { type: Type.STRING, description: 'The emotional tone or atmosphere of the song.' },
        imagery: {
          type: Type.STRING,
          description: "Analysis of the song's use of imagery and metaphors.",
        },
        critique: { type: Type.STRING, description: 'Constructive critique of the lyrics.' },
        bias_check: {
          type: Type.OBJECT,
          properties: {
            is_biased: {
              type: Type.BOOLEAN,
              description: 'True if potential bias is detected, otherwise false.',
            },
            reasoning: {
              type: Type.STRING,
              description:
                'Explanation if bias is detected, or a confirmation of no bias found.',
            },
          },
          required: ['is_biased', 'reasoning'],
        },
        suggestion: {
          type: Type.OBJECT,
          properties: {
            section: {
              type: Type.STRING,
              description: "The section header of the revised lyrics (e.g., '[Chorus]').",
            },
            revised_lyrics: {
              type: Type.STRING,
              description: 'The full text of the revised lyric section.',
            },
          },
          required: ['section', 'revised_lyrics'],
        },
      },
      required: ['theme', 'mood', 'imagery', 'critique', 'bias_check', 'suggestion'],
    };

    const response = await this.ai!.models.generateContent({
      model: this.textModel,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Received an empty analysis from the API.');
    }

    return JSON.parse(text) as LyricAnalysisResult;
  }

  async evaluateSong(
    lyrics: string,
    title: string,
    params: LyricsGenerationParams
  ): Promise<SongEvaluationMetrics> {
    this.ensureReady();

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

    const response = await this.ai!.models.generateContent({
      model: this.textModel,
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
  }
}
