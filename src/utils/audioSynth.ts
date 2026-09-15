// Simple, reliable Web Audio API synthesizer for ambient sound preview and soundboard
class SoundEngine {
  private ctx: AudioContext | null = null;
  private activeNodes: Map<string, { gainNode: GainNode; stop: () => void }> = new Map();
  private masterGainNode: GainNode | null = null;
  private masterVolume: number = 0.7;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (!this.masterGainNode && this.ctx) {
      this.masterGainNode = this.ctx.createGain();
      this.masterGainNode.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
      this.masterGainNode.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  setVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGainNode && this.ctx) {
      this.masterGainNode.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
    }
  }

  getVolume(): number {
    return this.masterVolume;
  }

  // Play a single musical chord / note (e.g. Piano, Chill bell)
  playNote(type: 'piano' | 'chill' | 'firework', freq = 440) {
    const ctx = this.initCtx();
    const dest = this.masterGainNode || ctx.destination;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'piano') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.28, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + 1.8);
    } else if (type === 'chill') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + 2.4);
    } else {
      // Firework / chime sparkle
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * 1.5, now);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + 1.0);
    }
  }

  // Play gentle focus bell / chime for timer completion
  playFocusChime() {
    const ctx = this.initCtx();
    const dest = this.masterGainNode || ctx.destination;
    const now = ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C-E-G-C chime
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.15);
      gain.gain.setValueAtTime(0, now + idx * 0.15);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.15 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 2.2);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(now + idx * 0.15);
      osc.stop(now + idx * 0.15 + 2.4);
    });
  }

  // Play correct action chime with streak pitch scaling
  playCorrectChime(streak = 1) {
    const ctx = this.initCtx();
    const dest = this.masterGainNode || ctx.destination;
    const now = ctx.currentTime;

    // Scale pitch based on streak: C5 base
    const baseFreq = 523.25;
    const semitones = Math.min(16, (streak - 1) * 1.5);
    const freq1 = baseFreq * Math.pow(2, semitones / 12);
    const freq2 = freq1 * 1.25; // major third above

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq1, now);
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq2, now + 0.06);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(dest);

    osc1.start(now);
    osc2.start(now + 0.06);
    osc1.stop(now + 0.6);
    osc2.stop(now + 0.6);
  }

  // Play soft gentle buzzer when picking wrong (friendly, non-punitive)
  playWrongBuzzer() {
    const ctx = this.initCtx();
    const dest = this.masterGainNode || ctx.destination;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(170, now + 0.25);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  // Play triumphant celebration fanfare (chime arpeggio)
  playCelebrationFanfare() {
    const ctx = this.initCtx();
    const dest = this.masterGainNode || ctx.destination;
    const now = ctx.currentTime;

    // C5 - E5 - G5 - C6 - E6
    const chord = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + idx * 0.08;

      osc.type = idx === chord.length - 1 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.25, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + (idx === chord.length - 1 ? 1.8 : 0.8));

      osc.connect(gain);
      gain.connect(dest);

      osc.start(start);
      osc.stop(start + 2.0);
    });
  }

  // Play synthesized realistic applause / clapping sound
  playApplause(durationSeconds = 2.5) {
    const ctx = this.initCtx();
    const dest = this.masterGainNode || ctx.destination;
    const sampleRate = ctx.sampleRate;
    const frameCount = Math.floor(sampleRate * durationSeconds);

    const buffer = ctx.createBuffer(1, frameCount, sampleRate);
    const data = buffer.getChannelData(0);

    // Generate clusters of claps (irregular impulses + noise bursts)
    for (let i = 0; i < frameCount; i++) {
      const t = i / sampleRate;
      // Envelope: gentle rise, sustained, gentle decay
      let env = 1.0;
      if (t < 0.3) {
        env = t / 0.3;
      } else if (t > durationSeconds - 0.7) {
        env = (durationSeconds - t) / 0.7;
      }

      // Random clapping bursts
      const noise = (Math.random() * 2 - 1);
      // Periodic density spikes simulating group claps
      const clapPulse = Math.pow(Math.sin(t * 18 + Math.sin(t * 37)), 4);
      data[i] = noise * env * (0.3 + 0.7 * clapPulse) * 0.28;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    // Filter to sound like acoustic hands clapping (mid-frequencies)
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 1200;
    bandpass.Q.value = 1.2;

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 400;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.masterVolume * 0.8, ctx.currentTime);

    noiseSource.connect(bandpass);
    bandpass.connect(highpass);
    highpass.connect(gain);
    gain.connect(dest);

    noiseSource.start();
  }

  // Play cheerful combo audio sparkle
  playComboChime(comboCount = 2) {
    const ctx = this.initCtx();
    const dest = this.masterGainNode || ctx.destination;
    const now = ctx.currentTime;

    const freqs = [659.25, 783.99, 1046.50];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + idx * 0.05;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * (1 + Math.min(0.4, comboCount * 0.05)), start);

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.18, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.4);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(start);
      osc.stop(start + 0.45);
    });
  }

  // Play frequency test tone (e.g. 432Hz, 440Hz, 528Hz Solfeggio)
  playFrequencyTone(freq: number, durationSeconds = 3.0) {
    const ctx = this.initCtx();
    const dest = this.masterGainNode || ctx.destination;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + durationSeconds);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + durationSeconds + 0.1);
  }

  // Toggle ambient noise loop (rain, ocean, forest, cafe, lofi)
  toggleAmbient(id: string, type: 'rain' | 'ocean' | 'forest' | 'cafe' | 'lofi'): boolean {
    const ctx = this.initCtx();

    if (this.activeNodes.has(id)) {
      // Stop it
      const item = this.activeNodes.get(id);
      item?.stop();
      this.activeNodes.delete(id);
      return false;
    }

    const now = ctx.currentTime;
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.01, now);
    gainNode.gain.linearRampToValueAtTime(0.18, now + 0.5);
    const dest = this.masterGainNode || ctx.destination;
    gainNode.connect(dest);

    let isRunning = true;
    let stopFn = () => {};

    if (type === 'rain' || type === 'ocean') {
      // Pink/White noise generator buffer
      const bufferSize = ctx.sampleRate * 3; // 3 seconds buffer
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter for rain / ocean
      const filter = ctx.createBiquadFilter();
      filter.type = type === 'rain' ? 'lowpass' : 'bandpass';
      filter.frequency.value = type === 'rain' ? 800 : 400;

      whiteNoise.connect(filter);
      filter.connect(gainNode);
      whiteNoise.start();

      stopFn = () => {
        try {
          gainNode.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          setTimeout(() => {
            whiteNoise.stop();
            whiteNoise.disconnect();
          }, 350);
        } catch {
          // ignore
        }
      };
    } else if (type === 'lofi') {
      // Warm chord synth
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = 'triangle';
      osc2.type = 'sine';
      osc1.frequency.value = 220; // A3
      osc2.frequency.value = 277.18; // C#4
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 450; // muffled lofi feel

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);

      osc1.start();
      osc2.start();

      stopFn = () => {
        try {
          gainNode.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          setTimeout(() => {
            osc1.stop();
            osc2.stop();
            osc1.disconnect();
            osc2.disconnect();
          }, 350);
        } catch {}
      };
    } else {
      // Forest / cafe ambient tone
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 520;
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.5;
      lfoGain.gain.value = 20;
      lfo.connect(osc.frequency);
      osc.connect(gainNode);
      lfo.start();
      osc.start();

      stopFn = () => {
        try {
          gainNode.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          setTimeout(() => {
            osc.stop();
            lfo.stop();
          }, 350);
        } catch {}
      };
    }

    this.activeNodes.set(id, { gainNode, stop: stopFn });
    return true;
  }

  private currentSunoId: string | null = null;
  private sunoLoopTimer: number | null = null;

  stopAmbient(id?: string) {
    if (id) {
      const node = this.activeNodes.get(id);
      if (node) {
        try { node.stop(); } catch {}
        this.activeNodes.delete(id);
      }
    } else {
      this.activeNodes.forEach((item) => {
        try { item.stop(); } catch {}
      });
      this.activeNodes.clear();
    }
  }

  stopSunoTrack() {
    if (this.sunoLoopTimer) {
      window.clearInterval(this.sunoLoopTimer);
      this.sunoLoopTimer = null;
    }
    this.currentSunoId = null;
    const existing = this.activeNodes.get('suno-track');
    if (existing) {
      existing.stop();
      this.activeNodes.delete('suno-track');
    }
  }

  getCurrentSunoTrack(): string | null {
    return this.currentSunoId;
  }

  playSunoTrack(trackKey: string, onLoopProgress?: (step: number) => void) {
    this.stopAll();
    this.stopSunoTrack();

    const ctx = this.initCtx();
    const dest = this.masterGainNode || ctx.destination;
    const now = ctx.currentTime;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.01, now);
    masterGain.gain.linearRampToValueAtTime(0.35, now + 0.5);
    masterGain.connect(dest);

    this.currentSunoId = trackKey;
    const oscList: (OscillatorNode | AudioBufferSourceNode)[] = [];

    // Chords definitions for each style
    // Lofi Rain: Am7 (A3, C4, E4, G4) -> Dm7 (D3, F3, A3, C4) -> G7 -> Cmaj7
    const lofiChords = [
      [220.00, 261.63, 329.63, 392.00], // Am7
      [146.83, 174.61, 220.00, 261.63], // Dm7
      [196.00, 246.94, 293.66, 349.23], // G7
      [130.81, 164.81, 196.00, 246.94]  // Cmaj7
    ];

    // Pop Energy: C (261) -> G (196) -> Am (220) -> F (174) with bright arpeggio
    const popChords = [
      [261.63, 329.63, 392.00, 523.25], // C
      [196.00, 246.94, 293.66, 392.00], // G
      [220.00, 261.63, 329.63, 440.00], // Am
      [174.61, 220.00, 261.63, 349.23]  // F
    ];

    // Piano Calm: Fmaj7 -> Em7 -> Dm7 -> C
    const pianoChords = [
      [174.61, 220.00, 261.63, 329.63],
      [164.81, 196.00, 246.94, 293.66],
      [146.83, 174.61, 220.00, 261.63],
      [130.81, 164.81, 196.00, 261.63]
    ];

    // 432 Hz Natural Resonance Chords (Verdi Tuning: A4 = 432Hz, C4 ≈ 256.87Hz)
    const freq432Chords = [
      [216.00, 256.87, 324.00, 432.00], // A432 chord
      [162.00, 216.00, 256.87, 324.00],
      [192.83, 242.97, 288.00, 385.70],
      [144.00, 180.00, 216.00, 288.00]
    ];

    // 528 Hz Solfeggio Miracle Chords (528, 264, 396, 660, 792)
    const freq528Chords = [
      [264.00, 330.00, 396.00, 528.00],
      [220.00, 264.00, 330.00, 528.00],
      [176.00, 220.00, 264.00, 396.00],
      [264.00, 396.00, 528.00, 660.00]
    ];

    // Alpha / Gamma Binaural Beats Waves
    const alphaChords = [
      [200.00, 210.00, 300.00, 310.00], // 10 Hz difference (Alpha)
      [180.00, 190.00, 270.00, 280.00]
    ];
    const gammaChords = [
      [200.00, 240.00, 320.00, 360.00], // 40 Hz difference (Gamma)
      [240.00, 280.00, 360.00, 400.00]
    ];

    // Background rain / noise for lofi-rain or freq-pink
    if (trackKey === 'lofi-rain' || trackKey === 'freq-pink') {
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * (trackKey === 'freq-pink' ? 0.22 : 0.15);
      }
      const noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = noiseBuffer;
      noiseSrc.loop = true;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.value = trackKey === 'freq-pink' ? 500 : 650;
      noiseSrc.connect(noiseFilter);
      noiseFilter.connect(masterGain);
      noiseSrc.start();
      oscList.push(noiseSrc);
    }

    let chordStep = 0;
    const isPop = trackKey.startsWith('pop-');
    const isPiano = trackKey === 'piano-calm';
    const is432 = trackKey === 'freq-432';
    const is528 = trackKey === 'freq-528';
    const isAlpha = trackKey === 'freq-alpha';
    const isGamma = trackKey === 'freq-gamma';

    const chords = isPop ? popChords : 
                   isPiano ? pianoChords : 
                   is432 ? freq432Chords :
                   is528 ? freq528Chords :
                   isAlpha ? alphaChords :
                   isGamma ? gammaChords : lofiChords;
    const intervalMs = isPop ? 1600 : (isAlpha || isGamma ? 3000 : 2400);

    const playChordStep = () => {
      if (this.currentSunoId !== trackKey) return;
      const currentChord = chords[chordStep % chords.length];
      const stepNow = ctx.currentTime;

      currentChord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        if (isPop) {
          osc.type = 'sawtooth';
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(1200, stepNow);
          filter.frequency.exponentialRampToValueAtTime(300, stepNow + 1.2);
          
          noteGain.gain.setValueAtTime(0, stepNow);
          noteGain.gain.linearRampToValueAtTime(0.08, stepNow + 0.05);
          noteGain.gain.exponentialRampToValueAtTime(0.001, stepNow + 1.5);

          osc.connect(filter);
          filter.connect(noteGain);
        } else if (isPiano) {
          osc.type = 'triangle';
          noteGain.gain.setValueAtTime(0, stepNow + idx * 0.08);
          noteGain.gain.linearRampToValueAtTime(0.12, stepNow + idx * 0.08 + 0.04);
          noteGain.gain.exponentialRampToValueAtTime(0.001, stepNow + idx * 0.08 + 2.1);
          osc.connect(noteGain);
        } else if (is432 || is528) {
          // Pure Solfeggio harmonic resonance
          osc.type = 'sine';
          noteGain.gain.setValueAtTime(0, stepNow);
          noteGain.gain.linearRampToValueAtTime(0.12, stepNow + 0.2);
          noteGain.gain.exponentialRampToValueAtTime(0.001, stepNow + 2.6);
          osc.connect(noteGain);
        } else if (isAlpha || isGamma) {
          // Binaural / brainwave pulse
          osc.type = 'sine';
          noteGain.gain.setValueAtTime(0, stepNow);
          noteGain.gain.linearRampToValueAtTime(0.09, stepNow + 0.3);
          noteGain.gain.exponentialRampToValueAtTime(0.001, stepNow + 3.2);
          osc.connect(noteGain);
        } else {
          // Lofi warm rhodes
          osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 550; // muffled vintage lofi warmth

          noteGain.gain.setValueAtTime(0, stepNow);
          noteGain.gain.linearRampToValueAtTime(0.1, stepNow + 0.08);
          noteGain.gain.exponentialRampToValueAtTime(0.001, stepNow + 2.2);

          osc.connect(filter);
          filter.connect(noteGain);
        }

        noteGain.connect(masterGain);
        osc.frequency.setValueAtTime(freq, stepNow);
        osc.start(stepNow);
        osc.stop(stepNow + 2.5);
      });

      if (onLoopProgress) {
        onLoopProgress(chordStep % chords.length);
      }
      chordStep++;
    };

    // Play first chord right away
    playChordStep();
    this.sunoLoopTimer = window.setInterval(playChordStep, intervalMs);

    const stopFn = () => {
      try {
        if (this.sunoLoopTimer) {
          window.clearInterval(this.sunoLoopTimer);
          this.sunoLoopTimer = null;
        }
        masterGain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        setTimeout(() => {
          oscList.forEach(n => {
            try { (n as any).stop?.(); n.disconnect(); } catch {}
          });
          masterGain.disconnect();
        }, 450);
      } catch {}
    };

    this.activeNodes.set('suno-track', { gainNode: masterGain, stop: stopFn });
  }

  stopAll() {
    this.stopSunoTrack();
    this.activeNodes.forEach(node => node.stop());
    this.activeNodes.clear();
  }

  isPadPlaying(id: string): boolean {
    return this.activeNodes.has(id);
  }

  // Play keyboard 7-note scale (A-S-D-F-J-K-L)
  playKeyboardNote(noteMidi: number, duration = 0.35, customVol?: number) {
    const ctx = this.initCtx();
    const dest = this.masterGainNode || ctx.destination;
    const now = ctx.currentTime;
    const freq = 440 * Math.pow(2, (noteMidi - 69) / 12);
    const vol = customVol ?? (this.masterVolume * 0.4);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  // Render recorded note events to a real WAV file using OfflineAudioContext
  async exportMelodyToWav(
    events: { t: number; note: number; duration?: number }[],
    lengthMs: number,
    vol = 0.2
  ): Promise<ArrayBuffer> {
    if (!events.length) {
      throw new Error('Chưa có giai điệu để xuất WAV.');
    }

    const sampleRate = 44100;
    const lastEventTime = events[events.length - 1].t;
    const totalSeconds = Math.max(lengthMs / 1000, (lastEventTime + 500) / 1000);
    const offlineCtx = new OfflineAudioContext(1, Math.ceil(totalSeconds * sampleRate), sampleRate);

    for (const ev of events) {
      const freq = 440 * Math.pow(2, (ev.note - 69) / 12);
      const when = ev.t / 1000;
      const duration = (ev.duration ?? 350) / 1000;

      const osc = offlineCtx.createOscillator();
      const gain = offlineCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0, when);
      gain.gain.linearRampToValueAtTime(vol, when + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);

      osc.connect(gain);
      gain.connect(offlineCtx.destination);
      osc.start(when);
      osc.stop(when + duration + 0.02);
    }

    const renderedBuffer = await offlineCtx.startRendering();
    const samples = renderedBuffer.getChannelData(0);
    const wavBuffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(wavBuffer);

    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // SubChunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
    view.setUint16(22, 1, true); // NumChannels (1 mono)
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); // ByteRate
    view.setUint16(32, 2, true); // BlockAlign
    view.setUint16(34, 16, true); // BitsPerSample
    writeString(36, 'data');
    view.setUint32(40, samples.length * 2, true);

    for (let i = 0; i < samples.length; i++) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(44 + i * 2, s * 32767, true);
    }

    return wavBuffer;
  }
}

export const audioSynth = new SoundEngine();
