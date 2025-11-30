export interface SongPreset {
  id: string;
  name: string;
  genre: string;
  style: string;
  language: string;
  structure: string;
  key: string;
  bpm: number;
  lyricTheme: string;
  sentimentAnger: number;
  sentimentSadness: number;
  sentimentJoy: number;
  creativity: number;
}

export const songPresets: SongPreset[] = [
  {
    id: 'midnight-drive-synthwave',
    name: 'Midnight Drive Synthwave',
    genre: '80s Synthwave',
    style: 'Kavinsky, The Midnight, Chromatics',
    language: 'English',
    structure: 'ABABCB',
    key: 'A-Minor',
    bpm: 125,
    lyricTheme: 'nostalgic memories of a lost love on a rainy city night',
    sentimentAnger: 10,
    sentimentSadness: 60,
    sentimentJoy: 30,
    creativity: 60,
  },
  {
    id: 'indie-dreamscape',
    name: 'Indie Dreamscape',
    genre: 'Dream Pop',
    style: 'Beach House, Alvvays, Cocteau Twins',
    language: 'English',
    structure: 'Verse-Chorus',
    key: 'F-Major',
    bpm: 95,
    lyricTheme: 'the hazy feeling of a summer afternoon daydream',
    sentimentAnger: 0,
    sentimentSadness: 25,
    sentimentJoy: 75,
    creativity: 80,
  },
  {
    id: 'hyperpop-glitch',
    name: 'Hyperpop Glitch',
    genre: 'Hyperpop',
    style: '100 gecs, Charli XCX, AG Cook',
    language: 'English',
    structure: 'Verse-Chorus-Bridge',
    key: 'C#-Major',
    bpm: 160,
    lyricTheme: 'sensory overload in the digital age, online identity crisis',
    sentimentAnger: 40,
    sentimentSadness: 10,
    sentimentJoy: 50,
    creativity: 100,
  },
  {
    id: 'city-nights-rb',
    name: 'City Nights R&B',
    genre: 'R&B Pop',
    style: 'The Weeknd, SZA, Frank Ocean',
    language: 'English',
    structure: 'ABABCB',
    key: 'G-Minor',
    bpm: 100,
    lyricTheme: 'late-night confessions and temptations in a neon-lit metropolis',
    sentimentAnger: 20,
    sentimentSadness: 50,
    sentimentJoy: 30,
    creativity: 70,
  },
];
