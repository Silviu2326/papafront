/**
 * Melody AI Studio - Interactive Web Audio Synthesizer & Audio File Generator
 */

class WebAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private currentGenre = 'pop';
  private timerId: number | null = null;
  private currentStep = 0;
  private bpm = 110;
  private masterGain: GainNode | null = null;
  private onTimeUpdateCallback: ((time: number, isPlaying: boolean) => void) | null = null;
  private currentTime = 0;
  private totalDuration = 180; // default 3 min

  // Modo de reproducción:
  //   'synth' -> melodía sintetizada por género (canciones de muestra)
  //   'file'  -> MP3 real subido para un pedido
  private mode: 'synth' | 'file' = 'synth';
  private mediaEl: HTMLAudioElement | null = null;
  private mediaUrl: string | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    const v = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05);
    }
    // El <audio> tiene su propio volumen, ajeno al grafo de Web Audio
    if (this.mediaEl) {
      this.mediaEl.volume = v;
    }
  }

  public registerTimeCallback(cb: (time: number, isPlaying: boolean) => void) {
    this.onTimeUpdateCallback = cb;
  }

  public onStateChange(cb: (state: { isPlaying: boolean; currentTime: number }) => void): () => void {
    const listener = (time: number, isPlaying: boolean) => {
      cb({ isPlaying, currentTime: time });
    };
    this.onTimeUpdateCallback = listener;
    return () => {
      if (this.onTimeUpdateCallback === listener) {
        this.onTimeUpdateCallback = null;
      }
    };
  }

  private playTone(freq: number, type: OscillatorType, startTime: number, duration: number, gainVal: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(gainVal, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);
  }

  private scheduleBeat(genre: string) {
    if (!this.ctx || !this.isPlaying) return;

    const now = this.ctx.currentTime;
    const stepDuration = 60 / this.bpm / 4; // 16th note

    // Scale frequencies for chords: C major / A minor / F major / G major progression
    const chordProgressions: Record<string, number[][]> = {
      pop: [
        [261.63, 329.63, 392.00, 523.25], // C
        [196.00, 246.94, 293.66, 392.00], // G
        [220.00, 261.63, 329.63, 440.00], // Am
        [174.61, 220.00, 261.63, 349.23], // F
      ],
      rock: [
        [146.83, 220.00, 293.66], // D power
        [174.61, 261.63, 349.23], // F power
        [196.00, 293.66, 392.00], // G power
        [130.81, 196.00, 261.63], // C power
      ],
      lofi: [
        [261.63, 311.13, 392.00, 466.16], // Cm7
        [220.00, 261.63, 329.63, 392.00], // Am7
        [174.61, 207.65, 261.63, 311.13], // Fm7
        [196.00, 233.08, 293.66, 349.23], // Gm7
      ],
      jazz: [
        [220.00, 261.63, 329.63, 392.00, 493.88], // Am9
        [146.83, 174.61, 220.00, 261.63, 329.63], // Dm9
        [196.00, 246.94, 293.66, 349.23, 440.00], // G13
        [261.63, 329.63, 392.00, 493.88, 587.33], // Cmaj9
      ],
      orquestal: [
        [130.81, 196.00, 261.63, 329.63, 392.00], // C maj cinematic
        [110.00, 164.81, 220.00, 261.63, 329.63], // A min
        [87.31, 130.81, 174.61, 220.00, 261.63],  // F maj epic
        [98.00, 146.83, 196.00, 246.94, 293.66],  // G maj
      ],
      acustico: [
        [196.00, 246.94, 293.66, 392.00], // G acoustic
        [164.81, 196.00, 246.94, 329.63], // Em
        [174.61, 220.00, 261.63, 349.23], // Cadd9
        [146.83, 220.00, 293.66, 369.99], // Dsus4
      ],
      hiphop: [
        [130.81, 155.56, 196.00, 233.08], // Cm7 boom bap
        [155.56, 185.00, 233.08, 277.18], // Ebm7
        [174.61, 207.65, 261.63, 311.13], // Fm7
        [146.83, 174.61, 220.00, 261.63], // Dm7
      ],
      rap: [
        [110.00, 130.81, 164.81, 196.00], // Am dark
        [116.54, 146.83, 174.61, 220.00], // Bbmaj
        [130.81, 155.56, 196.00, 233.08], // Cm
        [98.00, 123.47, 146.83, 196.00],  // G
      ],
      punk: [
        [164.81, 246.94, 329.63], // E power
        [220.00, 329.63, 440.00], // A power
        [246.94, 369.99, 493.88], // B power
        [196.00, 293.66, 392.00], // G power
      ],
      metal: [
        [82.41, 123.47, 164.81],  // E low power
        [87.31, 130.81, 174.61],  // F power
        [110.00, 164.81, 220.00], // A power
        [98.00, 146.83, 196.00],  // G power
      ],
      reggaeton: [
        [110.00, 130.81, 164.81, 220.00], // Am dembow
        [174.61, 220.00, 261.63, 349.23], // F
        [196.00, 246.94, 293.66, 392.00], // G
        [130.81, 164.81, 196.00, 261.63], // C
      ],
      electronica: [
        [146.83, 174.61, 220.00, 293.66], // Dm club
        [174.61, 220.00, 261.63, 349.23], // F
        [130.81, 164.81, 196.00, 261.63], // C
        [196.00, 246.94, 293.66, 392.00], // G
      ],
      flamenco: [
        [220.00, 261.63, 329.63, 440.00], // Am
        [196.00, 246.94, 293.66, 392.00], // G
        [174.61, 220.00, 261.63, 349.23], // F
        [164.81, 207.65, 246.94, 329.63], // E (cadencia andaluza)
      ],
      rnb: [
        [233.08, 277.18, 349.23, 415.30], // Bbmaj7 silk
        [207.65, 261.63, 311.13, 392.00], // Abmaj9
        [174.61, 220.00, 261.63, 329.63], // Fm9
        [155.56, 196.00, 233.08, 293.66], // Ebmaj7
      ],
      cinematografico: [
        [110.00, 164.81, 220.00, 329.63], // Am epic
        [130.81, 196.00, 261.63, 392.00], // C
        [87.31, 130.81, 174.61, 261.63],  // F
        [98.00, 146.83, 196.00, 293.66],  // G
      ],
    };

    const chords = chordProgressions[genre] || chordProgressions.pop;
    const chordIndex = Math.floor(this.currentStep / 16) % chords.length;
    const currentChord = chords[chordIndex];
    const stepInBar = this.currentStep % 16;

    // Kick / Bass
    const isUrbanGenre = genre === 'urbano' || genre === 'reggaeton' || genre === 'hiphop' || genre === 'rap';
    if (stepInBar === 0 || stepInBar === 8 || (isUrbanGenre && (stepInBar === 6 || stepInBar === 12))) {
      this.playTone(currentChord[0] / 2, 'triangle', now, 0.25, 0.4);
    }

    // Snare / Clap / High-hat
    if (stepInBar === 4 || stepInBar === 12) {
      this.playTone(genre === 'rock' ? 420 : 680, 'sine', now, 0.1, 0.18);
    }
    if (stepInBar % 2 === 0) {
      this.playTone(1200 + (stepInBar % 4) * 100, 'triangle', now, 0.04, 0.05);
    }

    // Melodic Arpeggios / Leads
    const arpeggioNote = currentChord[stepInBar % currentChord.length];
    const octaveMultiplier = genre === 'lofi' || genre === 'rnb' ? 1 : 1.5;
    const isDistortedGenre = genre === 'rock' || genre === 'punk' || genre === 'metal' || genre === 'electronica';
    this.playTone(arpeggioNote * octaveMultiplier, isDistortedGenre ? 'sawtooth' : 'sine', now, stepDuration * 1.5, 0.12);

    this.currentStep++;
    this.currentTime += stepDuration;

    if (this.onTimeUpdateCallback) {
      this.onTimeUpdateCallback(this.currentTime, this.isPlaying);
    }
  }

  /**
   * Reproduce un MP3 real (el que se sube a un pedido) en lugar de sintetizar.
   * Se apoya en un <audio>, que decodifica cualquier formato que soporte el
   * navegador y da duración y posición reales.
   */
  public playFile(url: string, startOffset = 0) {
    // Corta lo que estuviera sonando, sea sintetizado o de archivo
    this.stopSynth();

    if (!this.mediaEl) {
      this.mediaEl = new Audio();
      this.mediaEl.preload = 'auto';

      this.mediaEl.addEventListener('timeupdate', () => {
        if (this.mode !== 'file' || !this.mediaEl) return;
        this.currentTime = this.mediaEl.currentTime;
        this.emitState();
      });
      this.mediaEl.addEventListener('durationchange', () => {
        if (this.mode !== 'file' || !this.mediaEl) return;
        if (Number.isFinite(this.mediaEl.duration)) {
          this.totalDuration = this.mediaEl.duration;
        }
      });
      this.mediaEl.addEventListener('ended', () => {
        if (this.mode !== 'file') return;
        this.isPlaying = false;
        this.currentTime = 0;
        this.emitState();
      });
      this.mediaEl.addEventListener('error', () => {
        if (this.mode !== 'file') return;
        console.error('[audio] no se pudo reproducir el archivo', this.mediaUrl);
        this.isPlaying = false;
        this.emitState();
      });
    }

    this.mode = 'file';

    if (this.mediaUrl !== url) {
      this.mediaUrl = url;
      this.mediaEl.src = url;
      this.mediaEl.load();
    }
    if (startOffset > 0) {
      try {
        this.mediaEl.currentTime = startOffset;
      } catch {
        /* aún no hay metadatos: se ignora el offset */
      }
    }

    const started = this.mediaEl.play();
    if (started && typeof started.catch === 'function') {
      started.catch((err) => {
        console.error('[audio] reproducción rechazada por el navegador', err);
        this.isPlaying = false;
        this.emitState();
      });
    }

    this.isPlaying = true;
    this.emitState();
  }

  /** ¿Está sonando un MP3 (y no la melodía sintetizada)? */
  public isPlayingFile(): boolean {
    return this.mode === 'file' && this.isPlaying;
  }

  /** URL del archivo cargado ahora mismo, si lo hay. */
  public getCurrentFileUrl(): string | null {
    return this.mode === 'file' ? this.mediaUrl : null;
  }

  private emitState() {
    if (this.onTimeUpdateCallback) {
      this.onTimeUpdateCallback(this.currentTime, this.isPlaying);
    }
  }

  /** Detiene solo el sintetizador, sin tocar el <audio>. */
  private stopSynth() {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.currentStep = 0;
  }

  /** Detiene solo el <audio>, sin tocar el sintetizador. */
  private stopFile() {
    if (this.mediaEl) {
      try {
        this.mediaEl.pause();
      } catch {
        /* elemento ya liberado */
      }
    }
  }

  public play(genre = 'pop', bpm = 110, startOffset = 0, duration = 180) {
    // Cambiar a modo sintetizado corta cualquier MP3 en curso
    this.stopFile();
    this.mode = 'synth';

    this.initContext();
    this.stop();

    this.isPlaying = true;
    this.currentGenre = genre.toLowerCase();
    this.bpm = bpm || 110;
    this.totalDuration = duration || 180;
    this.currentTime = startOffset;
    this.currentStep = Math.floor(startOffset / (60 / this.bpm / 4));

    const stepIntervalMs = (60 / this.bpm / 4) * 1000;
    this.timerId = window.setInterval(() => {
      if (this.currentTime >= this.totalDuration) {
        this.stop();
        this.currentTime = 0;
        if (this.onTimeUpdateCallback) {
          this.onTimeUpdateCallback(0, false);
        }
        return;
      }
      this.scheduleBeat(this.currentGenre);
    }, stepIntervalMs);
  }

  public pause() {
    this.isPlaying = false;
    if (this.mode === 'file') {
      this.stopFile();
    } else {
      this.stopSynth();
    }
    if (this.onTimeUpdateCallback) {
      this.onTimeUpdateCallback(this.currentTime, false);
    }
  }

  /** Reanuda desde donde se pausó, en el modo que estuviera activo. */
  public resume() {
    if (this.mode === 'file' && this.mediaEl && this.mediaUrl) {
      this.playFile(this.mediaUrl, this.mediaEl.currentTime);
      return;
    }
    this.play(this.currentGenre, this.bpm, this.currentTime, this.totalDuration);
  }

  public stop() {
    this.pause();
    this.currentStep = 0;
  }

  public seek(seconds: number) {
    this.currentTime = seconds;
    if (this.mode === 'file') {
      if (this.mediaEl) {
        try {
          this.mediaEl.currentTime = seconds;
        } catch {
          /* metadatos aún no disponibles */
        }
      }
    } else {
      this.currentStep = Math.floor(seconds / (60 / this.bpm / 4));
    }
    if (this.onTimeUpdateCallback) {
      this.onTimeUpdateCallback(this.currentTime, this.isPlaying);
    }
  }

  /** Duración real de lo que suena (la del MP3 cuando hay archivo). */
  public getDuration(): number {
    return this.totalDuration;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentTime(): number {
    return this.currentTime;
  }

  public previewVoiceSample(voiceType: string) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const pitches: Record<string, number[]> = {
      masculino: [164.81, 196.00, 220.00, 246.94, 220.00], // E3, G3, A3, B3, A3
      femenino: [329.63, 392.00, 440.00, 493.88, 440.00], // E4, G4, A4, B4, A4
      duo: [220.00, 261.63, 329.63, 392.00, 440.00]
    };

    const notes = pitches[voiceType] || pitches.masculino;
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'sine', now + idx * 0.35, 0.45, 0.25);
    });
  }

  /**
   * Generates and downloads a real valid WAV audio file with melodic synth chords and vocal harmonies
   */
  public generateAndDownloadWav(songTitle: string, genre = 'pop', bpm = 110) {
    const sampleRate = 44100;
    const durationSeconds = 12; // 12 seconds preview full loop for download
    const numSamples = sampleRate * durationSeconds;
    const buffer = new Float32Array(numSamples);

    // Generate melodic music signal
    const chords = [261.63, 196.00, 220.00, 174.61]; // C, G, Am, F
    const secPerBeat = 60 / bpm;

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const beat = Math.floor(t / secPerBeat);
      const chordIdx = Math.floor(beat / 4) % chords.length;
      const rootFreq = chords[chordIdx];

      // Bassline
      const bass = Math.sin(2 * Math.PI * (rootFreq / 2) * t) * 0.3;
      // Harmony chord
      const harm1 = Math.sin(2 * Math.PI * rootFreq * t) * 0.15;
      const harm2 = Math.sin(2 * Math.PI * (rootFreq * 1.25) * t) * 0.12;
      const harm3 = Math.sin(2 * Math.PI * (rootFreq * 1.5) * t) * 0.12;
      
      // Melody arpeggio
      const arpFreq = rootFreq * (1 + (Math.floor(t * 4) % 4) * 0.25);
      const lead = Math.sin(2 * Math.PI * arpFreq * 2 * t) * 0.15 * Math.exp(-((t * 4) % 1) * 3);

      // Drum impulse
      const drumTick = Math.floor(t / (secPerBeat / 2));
      const drumPhase = (t % (secPerBeat / 2)) / (secPerBeat / 2);
      const drum = drumTick % 2 === 0 ? Math.sin(2 * Math.PI * 60 * drumPhase) * Math.exp(-drumPhase * 10) * 0.4 : 0;

      buffer[i] = Math.max(-1, Math.min(1, bass + harm1 + harm2 + harm3 + lead + drum));
    }

    // Convert Float32Array to 16-bit PCM WAV format
    const wavBuffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(wavBuffer);

    // RIFF identifier
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    this.writeString(view, 8, 'WAVE');
    // fmt sub-chunk
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, 1, true); // Mono channel
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); // Byte rate
    view.setUint16(32, 2, true); // Block align
    view.setUint16(34, 16, true); // Bits per sample
    // data sub-chunk
    this.writeString(view, 36, 'data');
    view.setUint32(40, numSamples * 2, true);

    // Write samples
    let offset = 44;
    for (let i = 0; i < numSamples; i++) {
      const s = Math.max(-1, Math.min(1, buffer[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      offset += 2;
    }

    const blob = new Blob([view], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${songTitle.replace(/\s+/g, '_')}_MelodyAI.wav`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  }

  private writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
}

export const audioEngine = new WebAudioEngine();
