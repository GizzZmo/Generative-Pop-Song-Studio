import { Component, ChangeDetectionStrategy, signal, inject, computed, OnInit, ElementRef, ViewChild, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GeminiService, SongParameters, LyricAnalysis, ImageParameters } from '../../services/gemini.service';
import * as htmlToImage from 'html-to-image';
import { songPresets } from '../../data/song-presets';

export interface SavedSong extends Omit<SongParameters, 'lyricSentiment'> {
  id: string;
  savedAt: string;
  // Individual sentiments
  sentimentAnger: number;
  sentimentSadness: number;
  sentimentJoy: number;
  // Generated data
  title: string;
  lyrics: string;
  sunoPrompt: string; // Renamed from musicalAesthetics
  midi: string;
  coverArtUrl: string;
}

@Component({
  selector: 'app-song-generator',
  templateUrl: './song-generator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, CommonModule]
})
export class SongGeneratorComponent implements OnInit {
  @ViewChild('coverArtContainer') coverArtContainer!: ElementRef<HTMLDivElement>;

  private readonly geminiService = inject(GeminiService);
  private readonly STORAGE_KEY = 'popSongGenerator_savedSongs';

  // Form state signals
  genre = signal('Dark Synth-pop');
  style = signal('Artemas, The Weeknd');
  language = signal('English');
  structure = signal('ABABCB');
  songKey = signal('C-Minor');
  bpm = signal(115);
  lyricTheme = signal('post-breakup anger');
  sentimentAnger = signal(80);
  sentimentSadness = signal(20);
  sentimentJoy = signal(0);
  creativity = signal(75);

  // UI state signals
  isLoadingLyrics = signal(false);
  isLoadingMidi = signal(false);
  isLoadingImage = signal(false);
  isEditingImage = signal(false);
  isAnalyzing = signal(false);
  generationStarted = signal(false);
  error = signal<string | null>(null);
  generatedTitle = signal<string | null>(null);
  generatedLyrics = signal<string | null>(null);
  generatedSunoPrompt = signal<string | null>(null);
  generatedMidi = signal<string | null>(null);
  generatedCoverArtUrl = signal<string | null>(null);
  analysis = signal<LyricAnalysis | null>(null);
  savedSongs = signal<SavedSong[]>([]);
  showCopySuccess = signal(false);
  imageEditPrompt = signal('');
  lastImageParams = signal<ImageParameters | null>(null);

  // Presets
  presets = songPresets;
  selectedPresetId = signal<string | null>(null);

  isLoading = computed(() => this.isLoadingLyrics() || this.isLoadingMidi() || this.isLoadingImage());
  
  private sanitizeFilename(name: string): string {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // remove special characters
      .replace(/\s+/g, '_') // replace spaces with underscores
      .slice(0, 50);
  }

  private getSentimentLevel(value: number): string {
    if (value >= 70) return 'high';
    if (value >= 30) return 'medium';
    return 'low';
  }

  private buildLyricSentimentString(): string {
    const anger = this.sentimentAnger();
    const sadness = this.sentimentSadness();
    const joy = this.sentimentJoy();
    return `${this.getSentimentLevel(anger)}-anger (${anger}%), ${this.getSentimentLevel(sadness)}-sadness (${sadness}%), ${this.getSentimentLevel(joy)}-joy (${joy}%)`;
  }

  sanitizedMidiFilename = computed(() => {
    return this.sanitizeFilename(this.generatedTitle() || 'song_output') + '.mid';
  });

  sanitizedImageFilename = computed(() => {
    return this.sanitizeFilename(this.generatedTitle() || 'cover_art') + '.png';
  });

  sanitizedParamsFilename = computed(() => {
    return this.sanitizeFilename(this.lyricTheme() || 'untitled') + '_params.md';
  });

  sanitizedSongOutputFilename = computed(() => {
    return this.sanitizeFilename(this.generatedTitle() || 'song_output') + '.md';
  });
  
  canBeSaved = computed(() => {
    return !!this.generatedTitle() && !!this.generatedLyrics() && !!this.generatedMidi() && !!this.generatedCoverArtUrl();
  });

  canSaveOutput = computed(() => {
    return !!this.generatedTitle() && !!this.generatedLyrics();
  });
  
  languages = ['English', 'French', 'German', 'Japanese', 'Korean', 'Norwegian', 'Portuguese', 'Spanish'].sort();
  songStructures = ['ABABCB', 'AABA', 'Verse-Chorus', 'Verse-Chorus-Bridge'];
  songKeys = [
    'C-Major', 'C-Minor', 'G-Major', 'G-Minor', 'D-Major', 'D-Minor',
    'A-Major', 'A-Minor', 'E-Major', 'E-Minor', 'B-Major', 'B-Minor',
    'F#-Major', 'F#-Minor', 'C#-Major', 'C#-Minor', 'F-Major', 'F-Minor',
    'Bb-Major', 'Bb-Minor', 'Eb-Major', 'Eb-Minor', 'Ab-Major', 'Ab-Minor'
  ];

  genreOptions = [
    '80s Synthwave',
    'Alt-Pop',
    'Ambient Pop',
    'Bedroom Pop',
    'City Pop',
    'Dark Synth-pop',
    'Dream Pop',
    'Electro-Pop',
    'Future Bass',
    'Hyperpop',
    'Indie Pop',
    'J-Pop',
    'K-Pop',
    'Lo-fi Hip Hop',
    'Nu-Disco',
    'Pop Punk',
    'Pop Rock',
    'R&B Pop',
    'Synthwave',
    'Tropical House'
  ];

  availableGenres = computed(() => {
    const current = this.genre();
    const list = [...this.genreOptions];
    // If the current genre isn't in the list (e.g. from a loaded file), add it so the dropdown shows it correctly
    if (current && !list.includes(current)) {
       // Check case-insensitive to avoid duplicates
       if (!list.some(g => g.toLowerCase() === current.toLowerCase())) {
         list.unshift(current);
       }
    }
    return list.sort();
  });

  constructor() {
    effect(() => {
      // This effect syncs the preset dropdown to "Custom" if the form values
      // are changed manually to no longer match a known preset.
      const currentValues = {
        genre: this.genre(),
        style: this.style(),
        language: this.language(),
        structure: this.structure(),
        key: this.songKey(),
        bpm: this.bpm(),
        lyricTheme: this.lyricTheme(),
        sentimentAnger: this.sentimentAnger(),
        sentimentSadness: this.sentimentSadness(),
        sentimentJoy: this.sentimentJoy(),
        creativity: this.creativity()
      };

      const matchedPreset = this.presets.find(p => 
        p.genre === currentValues.genre &&
        p.style === currentValues.style &&
        p.language === currentValues.language &&
        p.structure === currentValues.structure &&
        p.key === currentValues.key &&
        p.bpm === currentValues.bpm &&
        p.lyricTheme === currentValues.lyricTheme &&
        p.sentimentAnger === currentValues.sentimentAnger &&
        p.sentimentSadness === currentValues.sentimentSadness &&
        p.sentimentJoy === currentValues.sentimentJoy &&
        p.creativity === currentValues.creativity
      );

      this.selectedPresetId.set(matchedPreset ? matchedPreset.id : null);
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    this.loadSongsFromStorage();
  }

  applyPreset(presetId: string | null): void {
    if (!presetId) {
      // User selected "Custom"
      this.selectedPresetId.set(null);
      return;
    }
    
    const preset = this.presets.find(p => p.id === presetId);
    if (preset) {
      this.genre.set(preset.genre);
      this.style.set(preset.style);
      this.language.set(preset.language);
      this.structure.set(preset.structure);
      this.songKey.set(preset.key);
      this.bpm.set(preset.bpm);
      this.lyricTheme.set(preset.lyricTheme);
      this.sentimentAnger.set(preset.sentimentAnger);
      this.sentimentSadness.set(preset.sentimentSadness);
      this.sentimentJoy.set(preset.sentimentJoy);
      this.creativity.set(preset.creativity);
    }
  }

  generateSong(): void {
    this.generationStarted.set(true);
    this.isLoadingLyrics.set(true);
    this.isLoadingMidi.set(true);
    this.isLoadingImage.set(true);
    this.error.set(null);
    this.generatedTitle.set(null);
    this.generatedLyrics.set(null);
    this.generatedSunoPrompt.set(null);
    this.generatedMidi.set(null);
    this.generatedCoverArtUrl.set(null);
    this.analysis.set(null); // Clear previous analysis
    this.lastImageParams.set(null);

    const params: SongParameters = {
      genre: this.genre(),
      style: this.style(),
      structure: this.structure(),
      key: this.songKey(),
      bpm: this.bpm(),
      lyricTheme: this.lyricTheme(),
      language: this.language(),
      lyricSentiment: this.buildLyricSentimentString(),
      creativity: this.creativity()
    };

    this.geminiService.generateLyrics(params)
      .then(response => {
        this.generatedTitle.set(response.title);
        this.generatedLyrics.set(response.lyrics);
        this.generatedSunoPrompt.set(response.sunoPrompt);
        this.isLoadingLyrics.set(false);

        // Pass the Suno Prompt (which is now concise) to the other services
        const midiPromise = this.geminiService.generateMidi({ ...params, sunoPrompt: response.sunoPrompt })
          .then(midiData => {
            this.generatedMidi.set(midiData);
          }).catch(e => {
            console.error('MIDI generation failed:', e);
            this.error.update(current => (current ? `${current}\n- MIDI Error: ${e.message}` : `- MIDI Error: ${e.message}`));
          }).finally(() => {
            this.isLoadingMidi.set(false);
          });
          
        const imageParams: ImageParameters = {
          title: response.title,
          lyricTheme: params.lyricTheme,
          sunoPrompt: response.sunoPrompt,
          lyrics: response.lyrics
        };
        this.lastImageParams.set(imageParams);
        
        const imagePromise = this.geminiService.generateImage(imageParams).then(imageData => {
            this.generatedCoverArtUrl.set(imageData);
        }).catch(e => {
            console.error('Image generation failed:', e);
            this.error.update(current => (current ? `${current}\n- Image Error: ${e.message}` : `- Image Error: ${e.message}`));
        }).finally(() => {
            this.isLoadingImage.set(false);
        });
        
        return Promise.all([midiPromise, imagePromise]);
      })
      .catch(e => {
        console.error('Song generation failed:', e);
        this.error.update(current => (current ? `${current}\n- ${e.message}` : `- ${e.message}`));
        this.isLoadingLyrics.set(false);
        this.isLoadingMidi.set(false);
        this.isLoadingImage.set(false);
      });
  }

  async editCoverArt(): Promise<void> {
    const originalParams = this.lastImageParams();
    const editPrompt = this.imageEditPrompt().trim();

    if (!originalParams || !editPrompt) {
      this.error.set("Please enter an editing instruction.");
      return;
    }

    this.isEditingImage.set(true);
    this.error.set(null);
    
    try {
      const newImageData = await this.geminiService.editImage(originalParams, editPrompt);
      this.generatedCoverArtUrl.set(newImageData);
      this.imageEditPrompt.set(''); // Clear prompt on success
    } catch (e: unknown) {
      console.error('Image editing failed:', e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      this.error.update(current => (current ? `${current}\n- Image Edit Error: ${errorMessage}` : `- Image Edit Error: ${errorMessage}`));
    } finally {
      this.isEditingImage.set(false);
    }
  }

  async analyzeLyrics(): Promise<void> {
    const lyrics = this.generatedLyrics();
    const title = this.generatedTitle();
    const theme = this.lyricTheme();

    if (!lyrics || !title) return;

    this.isAnalyzing.set(true);
    this.error.set(null);
    this.analysis.set(null);

    try {
      const result = await this.geminiService.analyzeAndSuggest(lyrics, title, theme);
      this.analysis.set(result);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      this.error.update(current => (current ? `${current}\n- Analysis Error: ${errorMessage}` : `- Analysis Error: ${errorMessage}`));
    } finally {
      this.isAnalyzing.set(false);
    }
  }

  applySuggestion(): void {
    const analysis = this.analysis();
    const currentLyrics = this.generatedLyrics();
    if (!analysis || !currentLyrics || !analysis.suggestion) return;

    const { section, revised_lyrics } = analysis.suggestion;
    
    // Normalize section header to ensure it has brackets
    let targetSection = section.trim();
    if (!targetSection.startsWith('[')) targetSection = '[' + targetSection;
    if (!targetSection.endsWith(']')) targetSection = targetSection + ']';
    
    // Create a regex to find the section header and its content
    // We strictly match the header, followed by a newline, then content until the next section start or end of string
    const sectionRegex = new RegExp(`(${targetSection.replace(/\[/g, '\\[').replace(/\]/g, '\\]')}\\s*\\n)([\\s\\S]*?)(?=\\n\\s*\\[|$)`, 'i');
    
    if (sectionRegex.test(currentLyrics)) {
        const newLyrics = currentLyrics.replace(sectionRegex, `$1${revised_lyrics}\n\n`);
        this.generatedLyrics.set(newLyrics.trim());
        this.analysis.set(null); // Hide analysis after applying
    } else {
        // Fallback: Try matching without assuming strict bracket format if the first attempt failed
        // This handles cases where the AI returned "Chorus" but the lyrics have "[Chorus]"
        const looseSectionRegex = new RegExp(`(\\[?${section.replace(/\[|\]/g, '')}\\]?\\s*\\n)([\\s\\S]*?)(?=\\n\\s*\\[|$)`, 'i');
        if (looseSectionRegex.test(currentLyrics)) {
           const newLyrics = currentLyrics.replace(looseSectionRegex, `$1${revised_lyrics}\n\n`);
           this.generatedLyrics.set(newLyrics.trim());
           this.analysis.set(null);
        } else {
           this.error.set(`Could not find section "${section}" to apply suggestion.`);
        }
    }
  }

  downloadMidi(): void {
    const midiBase64 = this.generatedMidi();
    if (!midiBase64) return;

    try {
      const filename = this.sanitizedMidiFilename();
      const byteCharacters = atob(midiBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'audio/midi' });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (e) {
      console.error('Failed to decode or download MIDI file:', e);
      this.error.set('The generated MIDI data was invalid and could not be downloaded.');
    }
  }

  async downloadCoverArt(): Promise<void> {
    const element = this.coverArtContainer.nativeElement;
    if (!element || !this.generatedCoverArtUrl()) return;

    try {
      const dataUrl = await htmlToImage.toPng(element, {
        skipFonts: true, // Prevent attempting to inline external fonts to avoid CORS errors
        filter: (node) => {
          // Explicitly skip external link tags and style tags that might import fonts
          return node.tagName !== 'LINK' && node.tagName !== 'STYLE';
        }
      });
      const link = document.createElement('a');
      link.download = this.sanitizedImageFilename();
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to download cover art:', error);
      this.error.set('Could not download the cover art image due to a browser security restriction. Please try taking a screenshot manually.');
    }
  }

  copySunoPrompt(): void {
    const prompt = this.generatedSunoPrompt();
    if (prompt) {
        navigator.clipboard.writeText(prompt).then(() => {
            this.showCopySuccess.set(true);
            setTimeout(() => this.showCopySuccess.set(false), 2000);
        });
    }
  }
  
  get structuredLyrics() {
    const lyrics = this.generatedLyrics();
    if (!lyrics) return [];
    
    const sections = lyrics.split(/(\[.*?\])/).filter(Boolean);
    const result = [];
    for (let i = 0; i < sections.length; i += 2) {
      if (sections[i] && sections[i+1]) {
        result.push({
          tag: sections[i].trim(),
          lines: sections[i+1].trim().split('\n').filter(line => line.trim() !== '')
        });
      } else if (sections[i]) {
         result.push({
          tag: '',
          lines: sections[i].trim().split('\n').filter(line => line.trim() !== '')
        });
      }
    }
    return result;
  }

  private loadSongsFromStorage(): void {
    try {
      const savedSongsJson = localStorage.getItem(this.STORAGE_KEY);
      if (savedSongsJson) {
        // Define a type for legacy songs that may have musicalAesthetics
        interface LegacySavedSong extends Omit<SavedSong, 'sunoPrompt'> {
          sunoPrompt?: string;
          musicalAesthetics?: string;
        }
        const songs = JSON.parse(savedSongsJson) as LegacySavedSong[];
        // Migration for old saved songs
        this.savedSongs.set(songs.map((s) => ({
            ...s,
            sunoPrompt: s.sunoPrompt || s.musicalAesthetics || 'Pop, Generated' // Backward compatibility
        })));
      }
    } catch (e) {
      console.error('Failed to load songs from local storage:', e);
      this.savedSongs.set([]);
    }
  }

  private saveSongsToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.savedSongs()));
    } catch (e) {
      console.error('Failed to save songs to local storage:', e);
    }
  }

  saveSong(): void {
    if (!this.canBeSaved()) return;

    const newSong: SavedSong = {
      id: new Date().toISOString() + Math.random().toString(36).substring(2, 9),
      savedAt: new Date().toISOString(),
      // Params
      genre: this.genre(),
      style: this.style(),
      structure: this.structure(),
      key: this.songKey(),
      bpm: this.bpm(),
      lyricTheme: this.lyricTheme(),
      language: this.language(),
      creativity: this.creativity(),
      sentimentAnger: this.sentimentAnger(),
      sentimentSadness: this.sentimentSadness(),
      sentimentJoy: this.sentimentJoy(),
      // Generated
      title: this.generatedTitle()!,
      lyrics: this.generatedLyrics()!,
      sunoPrompt: this.generatedSunoPrompt()!,
      midi: this.generatedMidi()!,
      coverArtUrl: this.generatedCoverArtUrl()!,
    };
    
    this.savedSongs.update(songs => [newSong, ...songs]);
    this.saveSongsToStorage();
  }

  loadSong(songId: string): void {
    const songToLoad = this.savedSongs().find(s => s.id === songId);
    if (!songToLoad) return;
    
    // Set form parameters
    this.genre.set(songToLoad.genre);
    this.style.set(songToLoad.style);
    this.structure.set(songToLoad.structure);
    this.language.set(songToLoad.language || 'English');
    this.songKey.set(songToLoad.key);
    this.bpm.set(songToLoad.bpm);
    this.lyricTheme.set(songToLoad.lyricTheme);
    this.creativity.set(songToLoad.creativity);
    this.sentimentAnger.set(songToLoad.sentimentAnger);
    this.sentimentSadness.set(songToLoad.sentimentSadness);
    this.sentimentJoy.set(songToLoad.sentimentJoy);

    // Set generated output
    this.generatedTitle.set(songToLoad.title);
    this.generatedLyrics.set(songToLoad.lyrics);
    this.generatedSunoPrompt.set(songToLoad.sunoPrompt || '');
    this.generatedMidi.set(songToLoad.midi);
    this.generatedCoverArtUrl.set(songToLoad.coverArtUrl || null);
    
    // Update UI state
    this.generationStarted.set(true);
    this.error.set(null);
    this.isLoadingLyrics.set(false);
    this.isLoadingMidi.set(false);
    this.isLoadingImage.set(false);
    this.analysis.set(null);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteSong(songId: string): void {
    this.savedSongs.update(songs => songs.filter(s => s.id !== songId));
    this.saveSongsToStorage();
  }

  private downloadAsFile(content: string, filename: string, contentType: string): void {
    const blob = new Blob([content], { type: contentType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  saveParameters(): void {
    const content = `
# Song Parameters

- **Genre**: ${this.genre()}
- **Style Influences**: ${this.style()}
- **Language**: ${this.language()}
- **Structure**: ${this.structure()}
- **Key**: ${this.songKey()}
- **BPM**: ${this.bpm()}
- **Lyrical Theme**: ${this.lyricTheme()}
- **Sentiment Anger**: ${this.sentimentAnger()}
- **Sentiment Sadness**: ${this.sentimentSadness()}
- **Sentiment Joy**: ${this.sentimentJoy()}
- **Creativity**: ${this.creativity()}
  `.trim().replace(/^ +/gm, '');

    this.downloadAsFile(content, this.sanitizedParamsFilename(), 'text/markdown;charset=utf-8');
  }

  saveSongOutput(): void {
    if (!this.canSaveOutput()) return;

    const params = `
- **Genre**: ${this.genre()}
- **Style Influences**: ${this.style()}
- **Language**: ${this.language()}
- **Structure**: ${this.structure()}
- **Key**: ${this.songKey()}
- **BPM**: ${this.bpm()}
- **Lyrical Theme**: ${this.lyricTheme()}
- **Sentiment Anger**: ${this.sentimentAnger()}
- **Sentiment Sadness**: ${this.sentimentSadness()}
- **Sentiment Joy**: ${this.sentimentJoy()}
- **Creativity**: ${this.creativity()}
    `.trim().replace(/^ +/gm, '');

    const content = `
# ${this.generatedTitle()}

## Suno AI Prompt
${this.generatedSunoPrompt()}

## Lyrics
${this.generatedLyrics()}

---

## Generation Parameters
${params}
    `.trim().replace(/^ +/gm, '');

    this.downloadAsFile(content, this.sanitizedSongOutputFilename(), 'text/markdown;charset=utf-8');
  }

  loadParameters(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    const file = element.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) return;

      try {
        const lines = content.split('\n');
        const params: { [key: string]: string } = {};
        lines.forEach(line => {
          if (line.startsWith('- **')) {
            const parts = line.replace('- **', '').split('**:');
            if (parts.length === 2) {
              const key = parts[0].trim();
              const value = parts[1].trim();
              params[key] = value;
            }
          }
        });
        
        this.genre.set(params['Genre'] || this.genre());
        this.style.set(params['Style Influences'] || this.style());
        this.language.set(params['Language'] || this.language());
        this.structure.set(params['Structure'] || this.structure());
        this.songKey.set(params['Key'] || this.songKey());
        this.bpm.set(Number(params['BPM']) || this.bpm());
        this.lyricTheme.set(params['Lyrical Theme'] || this.lyricTheme());
        this.sentimentAnger.set(Number(params['Sentiment Anger']) || this.sentimentAnger());
        this.sentimentSadness.set(Number(params['Sentiment Sadness']) || this.sentimentSadness());
        this.sentimentJoy.set(Number(params['Sentiment Joy']) || this.sentimentJoy());
        this.creativity.set(Number(params['Creativity']) || this.creativity());
        
        element.value = ''; 
      } catch (err) {
        console.error('Failed to parse parameters file:', err);
        this.error.set('Could not load parameters. The file might be in the wrong format.');
      }
    };
    reader.onerror = () => {
        this.error.set('Failed to read the parameters file.');
        element.value = '';
    };
    reader.readAsText(file);
  }
}