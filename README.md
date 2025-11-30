<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# 🎵 Generative Pop Song Studio

**An AI-powered music creation tool that generates complete pop songs—lyrics, music, and cover art—based on your creative direction.**

[![Angular](https://img.shields.io/badge/Angular-20.3-DD0031?style=flat&logo=angular&logoColor=white)](https://angular.io/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-AI-4285F4?style=flat&logo=google&logoColor=white)](https://ai.google.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-latest-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

[View in AI Studio](https://ai.studio/apps/drive/1iZ5WdgZcyCaBXR3MaHIDlSvRTei-5JAG) • [Features](#-features) • [Getting Started](#-getting-started) • [Usage Guide](#-usage-guide)

</div>

---

## 📖 Overview

Generative Pop Song Studio is an interactive interface for creating unique pop music. Using multi-modal generative AI powered by Google Gemini, the application allows you to define song parameters like genre, structure, and lyrical themes to generate:

- **Complete song lyrics** with proper verse/chorus structure
- **Suno AI-optimized prompts** for music generation
- **MIDI compositions** as a musical preview
- **Cyberpunk-themed album cover art** with AI image generation
- **AI-powered lyric analysis** with bias checking and refinement suggestions

## ✨ Features

### 🎤 Lyrics Generation
- Generate complete song lyrics based on customizable parameters
- Support for multiple languages (English, French, German, Japanese, Korean, Norwegian, Portuguese, Spanish)
- Configurable song structures (ABABCB, AABA, Verse-Chorus, Verse-Chorus-Bridge)
- Adjustable emotional sentiment controls (Anger, Sadness, Joy)
- Variable creativity/experimental factor (0-100%)

### 🎹 Music & MIDI
- Automatic MIDI generation based on song parameters
- Downloadable MIDI files for use in DAWs (Digital Audio Workstations)
- Optimized Suno AI prompts for external music generation
- One-click copy of Suno prompts for easy integration

### 🎨 Cover Art Generation
- AI-generated cyberpunk-themed album artwork
- Album art incorporates song title, theme, and lyrics context
- **Live cover art editing** - modify generated artwork with text prompts
- Downloadable PNG images

### 🔍 Lyric Analysis & Refinement
- AI-powered analysis of generated lyrics including:
  - Theme and mood identification
  - Imagery and metaphor analysis
  - Constructive critique
  - **Bias detection** for racial, gender, or cultural stereotypes
- Suggested refinements with one-click application

### 💾 Save & Load
- Save complete songs to local storage
- Export parameters to Markdown files
- Export full song output (lyrics + Suno prompt + parameters) as Markdown
- Load previously saved songs or parameter presets
- Built-in presets for quick starts (Synthwave, Dream Pop, Hyperpop, R&B)

### 🌟 Visual Experience
- Cyberpunk-inspired UI with neon aesthetic
- Animated Matrix rain background effect
- Kaleidoscope cursor trail effects
- Responsive design for all screen sizes

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)
- **Google Gemini API Key** - [Get your API key here](https://aistudio.google.com/apikey)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/GizzZmo/Generative-Pop-Song-Studio.git
   cd Generative-Pop-Song-Studio
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure your API key:**
   
   Create a `.env.local` file in the project root and add your Gemini API key:
   ```env
   API_KEY=your_gemini_api_key_here
   ```
   
   > ⚠️ **Important:** Never commit your API key to version control. The `.env.local` file is included in `.gitignore`.

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000`

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build the production application |
| `npm run preview` | Preview the production build |

## 📚 Usage Guide

### Creating Your First Song

1. **Select a Preset (Optional)**
   - Choose from built-in presets like "Midnight Drive Synthwave" or "Indie Dreamscape" for quick starts
   - Or customize all parameters manually by selecting "Custom"

2. **Configure Song Parameters**
   - **Genre:** Select from 20+ genres (Synthwave, K-Pop, Hyperpop, Dream Pop, etc.)
   - **Style Influences:** Enter artist names for style reference (e.g., "The Weeknd, Dua Lipa")
   - **Language:** Choose the language for your lyrics
   - **Structure:** Select song structure pattern
   - **Key:** Choose musical key (major/minor)
   - **BPM:** Set tempo (60-180)
   - **Lyrical Theme:** Describe what your song is about
   - **Sentiments:** Adjust anger, sadness, and joy levels
   - **Creativity:** Control how experimental the output should be

3. **Generate Your Song**
   - Click "GENERATE SONG" and wait for the AI to create:
     - Song title and complete lyrics
     - Suno AI prompt (copy this to generate music on Suno)
     - MIDI preview file
     - Album cover art

4. **Refine and Export**
   - Use "Analyze & Refine" to get AI feedback on your lyrics
   - Edit the cover art with custom prompts
   - Download MIDI and cover art files
   - Save to your collection or export as Markdown

### Using Generated Content

#### With Suno AI
1. Generate a song in Generative Pop Song Studio
2. Copy the "Suno AI Prompt" using the copy button
3. Go to [Suno AI](https://suno.ai/)
4. Paste the prompt in the "Style of Music" field
5. Use the generated lyrics as input

#### MIDI Files
- Download the MIDI file and import it into your DAW
- Use as a composition starting point or melodic reference
- Compatible with most music production software

## 🏗️ Project Structure

```
Generative-Pop-Song-Studio/
├── src/
│   ├── app.component.ts          # Root application component
│   ├── app.component.html        # Main app template
│   ├── components/
│   │   ├── song-generator/       # Main song generation UI
│   │   ├── matrix-rain/          # Background animation effect
│   │   ├── kaleidoscope-cursor/  # Cursor trail effect
│   │   └── grid-pattern/         # Background grid pattern
│   ├── data/
│   │   └── song-presets.ts       # Built-in parameter presets
│   └── services/
│       └── gemini.service.ts     # Google Gemini API integration
├── index.html                    # HTML entry point
├── index.tsx                     # Angular bootstrap
├── angular.json                  # Angular CLI configuration
├── package.json                  # Dependencies and scripts
└── tsconfig.json                 # TypeScript configuration
```

## 🛠️ Technology Stack

| Technology | Purpose |
|------------|---------|
| **Angular 20** | Frontend framework with zoneless change detection |
| **TypeScript 5.8** | Type-safe JavaScript |
| **TailwindCSS** | Utility-first CSS styling |
| **Google Gemini API** | AI text generation (gemini-2.5-flash) |
| **Google Imagen API** | AI image generation (imagen-4.0) |
| **RxJS** | Reactive programming |
| **html-to-image** | Cover art export functionality |

## 🤖 AI Models Used

- **Gemini 2.5 Flash** - Lyrics generation, analysis, and MIDI composition
- **Imagen 4.0** - Album cover art generation and editing

## 🎨 Supported Genres

The application includes 20+ built-in genre options:

- 80s Synthwave, Alt-Pop, Ambient Pop, Bedroom Pop
- City Pop, Dark Synth-pop, Dream Pop, Electro-Pop
- Future Bass, Hyperpop, Indie Pop, J-Pop, K-Pop
- Lo-fi Hip Hop, Nu-Disco, Pop Punk, Pop Rock
- R&B Pop, Synthwave, Tropical House

Custom genres can also be loaded from parameter files.

## 🌐 Supported Languages

- English, French, German, Japanese
- Korean, Norwegian, Portuguese, Spanish

## 🔐 Security & Privacy

- API keys are stored locally and never exposed in the frontend code
- All generated content is stored in browser local storage
- No data is sent to third-party services other than Google Gemini APIs

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is provided as-is. Please check with the repository owner for licensing details.

## 🙏 Acknowledgments

- [Google Gemini](https://ai.google.dev/) for AI capabilities
- [Angular](https://angular.io/) for the robust framework
- [TailwindCSS](https://tailwindcss.com/) for beautiful styling
- [Suno AI](https://suno.ai/) for music generation integration
