# Generative Pop Song Studio

[![CI](https://github.com/GizzZmo/Generative-Pop-Song-Studio/actions/workflows/ci.yml/badge.svg)](https://github.com/GizzZmo/Generative-Pop-Song-Studio/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20-green.svg)](https://nodejs.org/)
[![Angular](https://img.shields.io/badge/Angular-20-red.svg)](https://angular.io/)

### Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1iZ5WdgZcyCaBXR3MaHIDlSvRTei-5JAG

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


### Generative Pop Song Studio (GPSS) is an open-source toolkit for producing pop songs end-to-end with generative models. The repository provides modular pipelines and utilities for lyric generation, melody and harmony composition (symbolic), synthesis of vocal and instrumental stems, arrangement, and rendering to audio.

This README gives a quick orientation. See docs/ for detailed developer and user guides.

## Table of contents

- Project overview
- Quickstart
- Typical workflows & examples
- Repository layout
- Configuration & models
- Development & contribution summary
- Licensing, ethics, and attribution
- Troubleshooting & FAQ
- Roadmap & where to help
- Maintainers & contact

---

## Project overview

Goal: Provide a reproducible, modular, and extensible codebase so contributors can:
- Swap or add models for lyrics, melodies, and synthesis
- Reproduce experiments and demos
- Build UIs or services on top of the pipeline

Design principles:
- Modularity: clear boundaries between lyric, symbolic, and synthesis stages
- Reproducibility: configuration-driven pipelines and example notebooks
- Responsible use: clear licensing and ethical constraints

---

## Quickstart

Requirements
- Python 3.9+ (recommended 3.10 or 3.11)
- Git
- ffmpeg (for render/export)
- Optional: CUDA and GPU drivers for model acceleration

Clone:
```bash
git clone https://github.com/GizzZmo/Generative-Pop-Song-Studio.git
cd Generative-Pop-Song-Studio
```

Create virtual environment and install dependencies:
```bash
python -m venv .venv
source .venv/bin/activate  # macOS / Linux
.venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

Run a demo pipeline:
```bash
python scripts/generate_demo.py --out demo_output --config configs/demo.yaml
```
Outputs are written to the specified directory (MIDI, WAV stems, assembled MP3, logs).

If using GPU, install the appropriate torch/tensorflow builds for your CUDA version. See docs/development.md for environment recommendations.

---

## Typical workflows & examples

1) Generate lyrics:
```bash
python scripts/generate_lyrics.py --prompt "A catchy summer love chorus" --length 120 --out outputs/lyrics.txt
```

2) Convert lyrics to symbolic melody:
```bash
python scripts/lyrics_to_melody.py --lyrics outputs/lyrics.txt --style pop --out outputs/melody.mid
```

3) Synthesize stems and mix:
```bash
python scripts/synthesize.py --midi outputs/melody.mid --preset pop_band --out outputs/stems/
python scripts/mixdown.py --stems outputs/stems/ --out outputs/final_mix.mp3
```

Use `--help` on scripts for full options. Example config files are in configs/.

---

## Repository layout

- scripts/ — high-level orchestration scripts (examples and CLI entrypoints)
- models/ — model loader wrappers and small reference checkpoints (large checkpoints are not committed)
- data/ — dataset downloaders and preprocessors
- notebooks/ — reproducible experiments and demos
- docs/ — user and developer documentation (detailed)
- configs/ — YAML configs used by pipelines and demos
- web/ or ui/ — optional demo UI (if present)
- tests/ — unit and integration tests
- .github/ — templates and CI workflows

---

## Configuration & model management

- Configs are YAML files under configs/ and control model paths, tempo/key defaults, sampling parameters, and output locations.
- Model artifacts (large binaries) must not be committed. Provide a download script or documented external URLs in data/ and docs/models.md.
- API keys and secrets must be stored in environment variables or .env (gitignored). Example .env.example is provided.

---

## Development & contribution summary

See docs/development.md and CONTRIBUTING.md for full guidelines. High-level:
- Branching: main (stable), develop (integration), feature/* and fix/* for work
- Commits: use conventional commit prefixes (feat:, fix:, docs:, chore:, refactor:, test:)
- Tests: add unit tests for critical pipeline components under tests/
- Linting & formatters: black, isort, flake8 (Python), and pre-commit hooks are recommended
- PRs: include descriptive summary, link issues, and run CI checks

---

## Licensing, ethics & attribution

- Choose and include a LICENSE file (MIT recommended for permissive projects, or another license as appropriate).
- Document licenses and attribution for any third-party models or datasets in docs/ethics_and_licenses.md.
- Provide an ethics / acceptable-use statement and a clear list of prohibited uses (e.g., generating content intended to impersonate a real person without consent).

---

## Troubleshooting & FAQ

- Missing model files: run the downloader in data/ and ensure model paths in configs/ are correct
- GPU errors: check CUDA, drivers, and library compatibility
- Audio artifacts: verify sample rates and synthesizer presets

If you hit a reproducible bug, open an issue and include minimal reproduction steps, environment, and logs.

---

## Roadmap

Planned items (examples)
- Plugin interface for model types
- Web-based interactive composer UI
- Model registry + downloader
- Evaluation metrics for musicality & lyric quality

Contributions welcome — open issues to propose or claim items.

---

## Maintainers & contact

Maintainer: GizzZmo (@GizzZmo)
For support: open an issue or start a discussion in the repo.

---
