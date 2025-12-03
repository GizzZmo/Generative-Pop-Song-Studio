# Architecture & Components

This document explains the main components and data flow.

## High-level flow

1. Prompt -> Lyric generator (language model)
2. Lyrics -> Symbolic composer (melody & chords) -> MIDI
3. MIDI -> Synthesizers / vocoders -> Stems (audio)
4. Arrangement & mixdown -> final audio export

## Components

- Lyric model: text generation with configurable prompts and sampling
- Composer: symbolic model producing melodies/chords/time signatures and exporting MIDI
- Synthesis: instruments and vocal vocoders / TTS models for vocal lines
- Arranger/mixer: automated arrangement rules + mixing presets
- Exporter: renders to WAV/MP3 and bundles stems + metadata

## Web Application Architecture

The web application is built with Angular 20 and uses the following structure:

### Services (`src/services/`)

- **GeminiService**: Core service for interacting with Google's Gemini AI for lyrics, MIDI, and image generation
- **ModelRegistryService**: Manages plugin registration and activation

### Plugin System (`src/services/plugins/`)

The application uses a plugin-based architecture for model providers:

- **model-plugin.interface.ts**: Defines contracts for:
  - `LyricsModelPlugin`: Generate song lyrics
  - `MidiModelPlugin`: Generate MIDI data
  - `ImageModelPlugin`: Generate cover art
  - `AnalysisModelPlugin`: Analyze lyrics for hit potential
  - `EvaluationModelPlugin`: Evaluate song quality with detailed metrics

- **model-registry.service.ts**: Central registry for:
  - Plugin registration and lifecycle management
  - Plugin activation/deactivation
  - Plugin configuration and initialization

- **gemini-model.plugin.ts**: Default implementation using Google Gemini

### Components (`src/components/`)

- **SongGeneratorComponent**: Main UI for song generation
- **EvaluationMetricsComponent**: Displays song quality metrics
- **ModelRegistryComponent**: UI for managing model plugins
- Visual effects components (MatrixRain, GridPattern, KaleidoscopeCursor)

## Extensibility

- Model wrappers: keep a consistent loader interface under models/
- Plugin points: add custom pre/postprocessors, instrument banks or vocoders
- Config-driven pipeline: swap components by editing configs/*.yaml
- **Plugin Interface**: Implement `ModelPlugin` interfaces to add new AI backends
- **Model Registry**: Use `ModelRegistryService` to register and manage plugins
