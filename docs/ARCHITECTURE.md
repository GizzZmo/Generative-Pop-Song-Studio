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

## Extensibility

- Model wrappers: keep a consistent loader interface under models/
- Plugin points: add custom pre/postprocessors, instrument banks or vocoders
- Config-driven pipeline: swap components by editing configs/*.yaml
