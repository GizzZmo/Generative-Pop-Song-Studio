/**
 * Plugin Interface for Model Types
 *
 * This module defines the contracts for pluggable model providers.
 * Implementations can be swapped to use different AI backends
 * (e.g., OpenAI, Anthropic, local models, etc.)
 */

/**
 * Configuration for a model plugin
 */
export interface ModelPluginConfig {
  /** Unique identifier for this plugin */
  id: string;
  /** Display name shown in the UI */
  name: string;
  /** Plugin version */
  version: string;
  /** Description of the plugin capabilities */
  description: string;
  /** Required configuration keys (e.g., API_KEY) */
  requiredConfig: string[];
  /** Optional configuration with defaults */
  optionalConfig?: Record<string, unknown>;
}

/**
 * Base interface for all model plugins
 */
export interface ModelPlugin {
  /** Plugin configuration and metadata */
  readonly config: ModelPluginConfig;

  /**
   * Initialize the plugin with configuration values
   * @param config Key-value pairs for plugin configuration
   * @returns Promise that resolves when initialization is complete
   */
  initialize(config: Record<string, unknown>): Promise<void>;

  /**
   * Check if the plugin is properly configured and ready
   * @returns true if the plugin can accept requests
   */
  isReady(): boolean;

  /**
   * Dispose of any resources held by the plugin
   */
  dispose(): void;
}

/**
 * Parameters for lyrics generation
 */
export interface LyricsGenerationParams {
  genre: string;
  style: string;
  structure: string;
  key: string;
  bpm: number;
  lyricTheme: string;
  language: string;
  lyricSentiment: string;
  creativity: number;
}

/**
 * Response from lyrics generation
 */
export interface LyricsGenerationResponse {
  title: string;
  lyrics: string;
  sunoPrompt: string;
}

/**
 * Plugin interface for lyrics generation models
 */
export interface LyricsModelPlugin extends ModelPlugin {
  /**
   * Generate lyrics based on the provided parameters
   * @param params Generation parameters
   * @returns Promise with generated lyrics data
   */
  generateLyrics(params: LyricsGenerationParams): Promise<LyricsGenerationResponse>;
}

/**
 * Parameters for MIDI generation
 */
export interface MidiGenerationParams {
  genre: string;
  style: string;
  key: string;
  bpm: number;
  sunoPrompt?: string;
}

/**
 * Plugin interface for MIDI/melody generation models
 */
export interface MidiModelPlugin extends ModelPlugin {
  /**
   * Generate MIDI data based on the provided parameters
   * @param params Generation parameters
   * @returns Promise with base64-encoded MIDI data
   */
  generateMidi(params: MidiGenerationParams): Promise<string>;
}

/**
 * Parameters for image generation
 */
export interface ImageGenerationParams {
  title: string;
  lyricTheme: string;
  lyrics: string;
  sunoPrompt?: string;
}

/**
 * Plugin interface for image generation models
 */
export interface ImageModelPlugin extends ModelPlugin {
  /**
   * Generate cover art based on the provided parameters
   * @param params Generation parameters
   * @returns Promise with base64-encoded image data URL
   */
  generateImage(params: ImageGenerationParams): Promise<string>;

  /**
   * Edit an existing image based on a text prompt
   * @param originalParams Original image parameters for context
   * @param editPrompt Instructions for how to modify the image
   * @returns Promise with base64-encoded edited image data URL
   */
  editImage(originalParams: ImageGenerationParams, editPrompt: string): Promise<string>;
}

/**
 * Analysis result for lyrics
 */
export interface LyricAnalysisResult {
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

/**
 * Plugin interface for lyrics analysis models
 */
export interface AnalysisModelPlugin extends ModelPlugin {
  /**
   * Analyze lyrics for hit potential and provide suggestions
   * @param lyrics The lyrics to analyze
   * @param title Song title
   * @param theme Lyrical theme
   * @returns Promise with analysis results
   */
  analyzeLyrics(lyrics: string, title: string, theme: string): Promise<LyricAnalysisResult>;
}

/**
 * Evaluation metrics for song quality
 */
export interface SongEvaluationMetrics {
  /** Overall quality score (0-100) */
  overallScore: number;

  /** Lyrical metrics */
  lyrical: {
    /** Rhyme scheme consistency (0-100) */
    rhymeConsistency: number;
    /** Emotional coherence (0-100) */
    emotionalCoherence: number;
    /** Originality of themes and phrases (0-100) */
    originality: number;
    /** Clarity and readability (0-100) */
    clarity: number;
  };

  /** Musical metrics */
  musical: {
    /** Melodic interest and catchiness (0-100) */
    melodicInterest: number;
    /** Harmonic progression quality (0-100) */
    harmonicQuality: number;
    /** Rhythmic consistency (0-100) */
    rhythmicConsistency: number;
    /** Structure and arrangement (0-100) */
    structureQuality: number;
  };

  /** Detailed feedback */
  feedback: string[];

  /** Suggested improvements */
  improvements: string[];
}

/**
 * Plugin interface for evaluation/metrics models
 */
export interface EvaluationModelPlugin extends ModelPlugin {
  /**
   * Evaluate the quality of generated song content
   * @param lyrics The lyrics to evaluate
   * @param title Song title
   * @param params The generation parameters used
   * @returns Promise with evaluation metrics
   */
  evaluateSong(
    lyrics: string,
    title: string,
    params: LyricsGenerationParams
  ): Promise<SongEvaluationMetrics>;
}

/**
 * Type for all supported plugin types
 */
export type SupportedModelPlugin =
  | LyricsModelPlugin
  | MidiModelPlugin
  | ImageModelPlugin
  | AnalysisModelPlugin
  | EvaluationModelPlugin;

/**
 * Plugin type identifiers
 */
export enum PluginType {
  LYRICS = 'lyrics',
  MIDI = 'midi',
  IMAGE = 'image',
  ANALYSIS = 'analysis',
  EVALUATION = 'evaluation',
}
