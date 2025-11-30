# Usage Guide

This page describes typical user flows, CLI options, and configuration notes.

## Running scripts

All example scripts live in scripts/ and typically accept `--help`. Example:

```bash
python scripts/generate_lyrics.py --prompt "Summer night" --length 120 --out outputs/lyrics.txt
```

## Config files

- Located under configs/
- YAML structure:
  - model: path or identifier
  - sampling: temperature, top_k, top_p
  - audio: sample_rate, channels
  - render: bpm, key, tempo_map
  - outputs: out_dir

Use configs/demo.yaml as a reference for the minimum required fields.

## Outputs

- MIDI (.mid) for symbolic data
- WAV or FLAC for stems
- MP3 for final mix (requires ffmpeg)
- Logs and metadata (.json) describing model settings and seeds for reproducibility

## Reproducing a demo

1. Ensure models are downloaded per docs/ethics_and_licenses.md
2. Activate environment
3. Run demo pipeline:
```bash
python scripts/generate_demo.py --config configs/demo.yaml --out outputs/demo
```