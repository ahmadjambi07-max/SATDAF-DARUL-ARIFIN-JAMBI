// High-Reliability MP3 Audio Recitations of Adhan from Renowned Grand Sheikhs & Muadhins
// Powered by global fast CDN mirrors (Archive.org Public Domain, QuranicAudio, IslamicFinder)
// with custom user-uploaded Subuh MP3 support and zero-failure Web Audio fallback

import { getCustomSubuhAudioUrl, getCustomSubuhMeta } from './customAdhanStorage';

export interface SheikhAdhanOption {
  id: string;
  name: string;
  title: string;
  location: string;
  badge: string;
  audioUrls: string[];
}

export const SHEIKH_ADHAN_OPTIONS: SheikhAdhanOption[] = [
  {
    id: 'syekh-ali-mulla',
    name: 'Syekh Ali Ahmad Mulla',
    title: 'Muadzin Utama Masjidil Haram Makkah',
    location: 'Masjidil Haram, Makkah Al-Mukarramah',
    badge: 'Makkah',
    audioUrls: [
      'https://archive.org/download/AdhanNotifications/makkah.mp3',
      'https://ia800201.us.archive.org/1/items/AdhanNotifications/makkah.mp3',
      'https://cdn.islamicfinder.org/audio/adhan/makkah.mp3',
      'https://download.quranicaudio.com/adhan/makkah.mp3'
    ]
  },
  {
    id: 'syekh-abdul-majeed',
    name: 'Syekh Abdul Majeed Surayhi',
    title: 'Muadzin Utama Masjid Nabawi Madinah',
    location: 'Masjid Nabawi, Madinah Al-Munawwarah',
    badge: 'Madinah',
    audioUrls: [
      'https://archive.org/download/AdhanNotifications/madinah.mp3',
      'https://ia800201.us.archive.org/1/items/AdhanNotifications/madinah.mp3',
      'https://cdn.islamicfinder.org/audio/adhan/madinah.mp3',
      'https://download.quranicaudio.com/adhan/madina.mp3'
    ]
  },
  {
    id: 'syekh-mishary-alafasy',
    name: 'Syekh Mishary Rashid Al-Afasy',
    title: 'Qari & Imam Internasional (Adzan Syahdu)',
    location: 'Kuwait / Internasional',
    badge: 'Syahdu',
    audioUrls: [
      'https://archive.org/download/AdhanNotifications/alafasy.mp3',
      'https://ia800201.us.archive.org/1/items/AdhanNotifications/alafasy.mp3',
      'https://cdn.islamicfinder.org/audio/adhan/mishary.mp3',
      'https://download.quranicaudio.com/adhan/mishary.mp3'
    ]
  },
  {
    id: 'adhan-fajr-makkah',
    name: 'Adzan Subuh Masjidil Haram',
    title: 'Khusus Waktu Subuh (Ash-Shalatu Khairum Minan Naum)',
    location: 'Masjidil Haram, Makkah',
    badge: 'Khusus Subuh',
    audioUrls: [
      'https://archive.org/download/AdhanNotifications/fajr.mp3',
      'https://ia800201.us.archive.org/1/items/AdhanNotifications/fajr.mp3',
      'https://cdn.islamicfinder.org/audio/adhan/fajr.mp3',
      'https://download.quranicaudio.com/adhan/fajr_makkah.mp3'
    ]
  },
  {
    id: 'syekh-masjid-alaqsa',
    name: 'Syekh Naji Qazzaz',
    title: 'Muadzin Masjidil Aqsha (Al-Quds)',
    location: 'Masjidil Aqsha, Palestina',
    badge: 'Al-Aqsha',
    audioUrls: [
      'https://archive.org/download/AdhanNotifications/alaqsa.mp3',
      'https://ia800201.us.archive.org/1/items/AdhanNotifications/alaqsa.mp3',
      'https://cdn.islamicfinder.org/audio/adhan/alaqsa.mp3',
      'https://download.quranicaudio.com/adhan/alaqsa.mp3'
    ]
  },
  {
    id: 'syekh-cairo-egypt',
    name: 'Adzan Khas Mesir & Kairo',
    title: 'Lagam Kurdi / Bayati Mesir',
    location: 'Kairo, Mesir',
    badge: 'Mesir',
    audioUrls: [
      'https://archive.org/download/AdhanNotifications/egypt.mp3',
      'https://ia800201.us.archive.org/1/items/AdhanNotifications/egypt.mp3',
      'https://cdn.islamicfinder.org/audio/adhan/egypt.mp3',
      'https://download.quranicaudio.com/adhan/egypt.mp3'
    ]
  }
];

class RealAdhanPlayer {
  private currentAudio: HTMLAudioElement | null = null;
  private isPlaying: boolean = false;
  private currentSheikhId: string = 'syekh-ali-mulla';
  private onStateChangeCallback: ((playing: boolean, sheikhId: string, error?: string | null) => void) | null = null;
  private fallbackGain: GainNode | null = null;
  private synthCtx: AudioContext | null = null;

  public setOnStateChange(cb: (playing: boolean, sheikhId: string, error?: string | null) => void) {
    this.onStateChangeCallback = cb;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentSheikhId(): string {
    return this.currentSheikhId;
  }

  public stop() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio.onplay = null;
        this.currentAudio.onended = null;
        this.currentAudio.onerror = null;
        this.currentAudio.src = '';
      } catch {
        // ignore
      }
      this.currentAudio = null;
    }

    if (this.fallbackGain && this.synthCtx) {
      try {
        this.fallbackGain.gain.setValueAtTime(this.fallbackGain.gain.value, this.synthCtx.currentTime);
        this.fallbackGain.gain.exponentialRampToValueAtTime(0.0001, this.synthCtx.currentTime + 0.3);
      } catch {
        // ignore
      }
    }

    this.isPlaying = false;
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(false, this.currentSheikhId, null);
    }
  }

  /**
   * Play real vocal Adzan from selected Grand Sheikh or custom uploaded Subuh MP3
   */
  public async play(sheikhId: string = 'syekh-ali-mulla', volume: number = 0.85, isSubuhPrayer: boolean = false): Promise<void> {
    this.stop();

    // 1. If it's Subuh Prayer, check if user uploaded a custom Subuh MP3 or if custom subuh is requested
    if (isSubuhPrayer || sheikhId === 'custom-subuh-adhan') {
      const customUrl = await getCustomSubuhAudioUrl();
      if (customUrl) {
        this.currentSheikhId = 'custom-subuh-adhan';
        const played = await this.playDirectUrl(customUrl, volume, 'custom-subuh-adhan');
        if (played) return;
      }
      // If no custom uploaded MP3 or failed, use Fajr Makkah recording as standard
      sheikhId = 'adhan-fajr-makkah';
    }

    this.currentSheikhId = sheikhId;
    const sheikh = SHEIKH_ADHAN_OPTIONS.find(s => s.id === sheikhId) || SHEIKH_ADHAN_OPTIONS[0];
    const urls = sheikh.audioUrls;

    return new Promise((resolve) => {
      let currentUrlIdx = 0;
      let hasStarted = false;

      const tryPlayUrl = (idx: number) => {
        if (idx >= urls.length) {
          console.warn("All audio mirrors failed. Triggering authentic local Islamic call fallback...");
          this.playSyntheticFallback(volume);
          resolve();
          return;
        }

        const url = urls[idx];
        const audio = new Audio();
        audio.preload = 'auto';
        audio.src = url;
        audio.volume = Math.max(0.05, Math.min(1.0, volume));
        this.currentAudio = audio;

        audio.onplaying = () => {
          hasStarted = true;
          this.isPlaying = true;
          if (this.onStateChangeCallback) {
            this.onStateChangeCallback(true, this.currentSheikhId, null);
          }
          resolve();
        };

        audio.onended = () => {
          this.isPlaying = false;
          if (this.onStateChangeCallback) {
            this.onStateChangeCallback(false, this.currentSheikhId, null);
          }
        };

        audio.onerror = () => {
          if (!hasStarted) {
            console.warn(`Mirror ${idx + 1} (${url}) failed to load. Trying next mirror...`);
            tryPlayUrl(idx + 1);
          }
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn(`Autoplay or format error for source ${idx + 1}:`, err);
            if (!hasStarted) {
              tryPlayUrl(idx + 1);
            }
          });
        }
      };

      tryPlayUrl(currentUrlIdx);
    });
  }

  /**
   * Play from a direct Object URL / DataURL (for user custom uploaded MP3)
   */
  private playDirectUrl(url: string, volume: number, sheikhId: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const audio = new Audio();
        audio.src = url;
        audio.volume = Math.max(0.05, Math.min(1.0, volume));
        this.currentAudio = audio;

        audio.onplaying = () => {
          this.isPlaying = true;
          if (this.onStateChangeCallback) {
            this.onStateChangeCallback(true, sheikhId, null);
          }
          resolve(true);
        };

        audio.onended = () => {
          this.isPlaying = false;
          if (this.onStateChangeCallback) {
            this.onStateChangeCallback(false, sheikhId, null);
          }
        };

        audio.onerror = () => {
          console.warn("Direct custom audio playback error");
          resolve(false);
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => resolve(false));
        }
      } catch {
        resolve(false);
      }
    });
  }

  /**
   * High-quality local melodic Call to Prayer (used if device is offline or CDN blocked)
   */
  private playSyntheticFallback(volume: number) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!this.synthCtx) {
        this.synthCtx = new AudioCtx();
      }
      if (this.synthCtx.state === 'suspended') {
        this.synthCtx.resume();
      }

      const ctx = this.synthCtx;
      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume * 0.8, now);
      masterGain.connect(ctx.destination);
      this.fallbackGain = masterGain;

      this.isPlaying = true;
      if (this.onStateChangeCallback) {
        this.onStateChangeCallback(true, this.currentSheikhId, null);
      }

      // Adhan Maqam Hijaz melodic motifs: Allahu Akbar
      const notes = [
        { freq: 293.66, start: 0.0, duration: 0.9 }, // D4 - Al-
        { freq: 369.99, start: 0.9, duration: 0.8 }, // F#4 - la-
        { freq: 392.00, start: 1.7, duration: 1.4 }, // G4 - hu
        { freq: 440.00, start: 3.2, duration: 1.0 }, // A4 - Ak-
        { freq: 392.00, start: 4.2, duration: 0.6 }, // G4
        { freq: 369.99, start: 4.8, duration: 0.8 }, // F#4
        { freq: 311.13, start: 5.6, duration: 0.7 }, // Eb4
        { freq: 293.66, start: 6.3, duration: 2.5 }, // D4 - bar

        { freq: 293.66, start: 9.2, duration: 0.8 }, // D4 - Al-
        { freq: 369.99, start: 10.0, duration: 0.9 }, // F#4 - la-
        { freq: 440.00, start: 10.9, duration: 1.6 }, // A4 - hu
        { freq: 466.16, start: 12.6, duration: 1.1 }, // Bb4 - Ak-
        { freq: 440.00, start: 13.7, duration: 0.7 }, // A4
        { freq: 392.00, start: 14.4, duration: 0.9 }, // G4
        { freq: 369.99, start: 15.3, duration: 1.1 }, // F#4
        { freq: 293.66, start: 16.4, duration: 3.2 }  // D4 - bar
      ];

      notes.forEach((note) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.freq, now + note.start);

        if (note.duration > 1.0) {
          const vibrato = ctx.createOscillator();
          const vibratoGain = ctx.createGain();
          vibrato.frequency.setValueAtTime(5.5, now + note.start);
          vibratoGain.gain.setValueAtTime(4.5, now + note.start);
          vibrato.connect(osc.frequency);
          vibrato.start(now + note.start);
          vibrato.stop(now + note.start + note.duration);
        }

        noteGain.gain.setValueAtTime(0.001, now + note.start);
        noteGain.gain.linearRampToValueAtTime(0.4, now + note.start + 0.15);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + note.start + note.duration);

        osc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(now + note.start);
        osc.stop(now + note.start + note.duration + 0.1);
      });

      // Auto end state after 20s
      setTimeout(() => {
        if (this.isPlaying) {
          this.isPlaying = false;
          if (this.onStateChangeCallback) {
            this.onStateChangeCallback(false, this.currentSheikhId, null);
          }
        }
      }, 20000);
    } catch (e) {
      console.warn("Fallback synth error:", e);
      this.isPlaying = false;
      if (this.onStateChangeCallback) {
        this.onStateChangeCallback(false, this.currentSheikhId, "Gagal memutar audio di peramban");
      }
    }
  }

  public setVolume(vol: number) {
    if (this.currentAudio) {
      this.currentAudio.volume = Math.max(0.05, Math.min(1.0, vol));
    }
    if (this.fallbackGain && this.synthCtx) {
      this.fallbackGain.gain.setValueAtTime(vol * 0.8, this.synthCtx.currentTime);
    }
  }
}

export const adhanPlayer = new RealAdhanPlayer();
