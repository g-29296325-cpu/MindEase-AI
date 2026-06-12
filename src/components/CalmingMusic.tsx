import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Play, Pause, AlertCircle, Headphones, Sparkles, Flame, TreePine, CloudRain, Waves, Info, Upload, Music, Trash2 } from "lucide-react";
import { motion } from "motion/react";

interface Soundscape {
  id: string;
  name: string;
  description: string;
  icon: any;
  colorClass: string;
  bgActive: string;
  isSynth: boolean;
  type: "ocean" | "rain" | "campfire" | "singingbowl" | "zenchords";
}

const SOUNDSCAPES: Soundscape[] = [
  {
    id: "zenchords",
    name: "Cozy Ambient Pad",
    description: "Flowing warm chords that swell slowly. Realigns racing thoughts.",
    icon: Sparkles,
    colorClass: "text-[#7D8461] border-[#7D8461]",
    bgActive: "bg-[#7D8461]/15",
    isSynth: true,
    type: "zenchords"
  },
  {
    id: "ocean",
    name: "Ocean Whispers",
    description: "Slow breathing wave rhythm synthesized with filtered ambient pink noise.",
    icon: Waves,
    colorClass: "text-blue-600 border-blue-400",
    bgActive: "bg-blue-500/10",
    isSynth: true,
    type: "ocean"
  },
  {
    id: "rain",
    name: "Summer Rain",
    description: "Soothing rustle of steady rain showers with dynamic, crackling water droplets.",
    icon: CloudRain,
    colorClass: "text-emerald-700 border-emerald-400",
    bgActive: "bg-emerald-500/10",
    isSynth: true,
    type: "rain"
  },
  {
    id: "campfire",
    name: "Cozy Campfire",
    description: "Warm, low-frequency fire crackle and occasional glowing charcoal pops.",
    icon: Flame,
    colorClass: "text-amber-700 border-amber-400",
    bgActive: "bg-amber-500/10",
    isSynth: true,
    type: "campfire"
  },
  {
    id: "singingbowl",
    name: "Singing Bowl Ritual",
    description: "Click to strike a deep resonant bell. Promotes quiet, mindful focus.",
    icon: TreePine,
    colorClass: "text-purple-700 border-purple-400",
    bgActive: "bg-purple-500/10",
    isSynth: true,
    type: "singingbowl"
  }
];

export default function CalmingMusic() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedSounds, setSelectedSounds] = useState<string[]>(["zenchords"]);
  const [volume, setVolume] = useState<number>(0.5);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [timerLeft, setTimerLeft] = useState<number | null>(null); // minutes
  const [activeTimerPreset, setActiveTimerPreset] = useState<number | null>(null);

  // Custom user uploaded music state
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string; size: string } | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // References
  const fileInputRef = useRef<HTMLInputElement>(null);
  const customAudioRef = useRef<HTMLAudioElement | null>(null);
  const customMediaElementSourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  // Web Audio Context & Synthesizer State references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const visualizerAnimRef = useRef<number | null>(null);

  // Individual Sound Nodes Tracking
  const activeSourcesRef = useRef<Record<string, {
    gainNode: GainNode;
    nodes: any[];
    timers?: any[];
  }>>({});

  // Chord synthesizer state tracker
  const chordTimerRef = useRef<any>(null);
  const activeChordOscillatorsRef = useRef<OscillatorNode[]>([]);
  const activeChordGainsRef = useRef<GainNode[]>([]);

  // Start sound / Initialize Web Audio Context
  const initAudio = () => {
    if (audioCtxRef.current) return;

    try {
      // @ts-ignore
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContextClass();
      
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(isMuted ? 0 : volume, ctx.currentTime);

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;

      // Connect: Sources -> Individual Gains -> Master Gain -> Analyser -> Destination
      masterGain.connect(analyser);
      analyser.connect(ctx.destination);

      audioCtxRef.current = ctx;
      masterGainRef.current = masterGain;
      analyserRef.current = analyser;

      // Start the visualizer
      startVisualizer();
    } catch (err) {
      console.error("Failed to initialize Web Audio API:", err);
    }
  };

  // Noise generators (Pink and Brown noise buffers for realistic sounds)
  const createPinkNoiseBuffer = (ctx: AudioContext) => {
    const bufferSize = ctx.sampleRate * 2; // 2 seconds of noise loop
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      b6 = white * 0.115926;
      data[i] = pink * 0.11; // normalise volume
    }
    return buffer;
  };

  const createBrownNoiseBuffer = (ctx: AudioContext) => {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // increase volume
    }
    return buffer;
  };

  // Start a specific soundscape synthesis
  const startSoundNode = (id: string) => {
    const ctx = audioCtxRef.current;
    const masterGain = masterGainRef.current;
    if (!ctx || !masterGain) return;

    // Stop if already active
    if (activeSourcesRef.current[id]) {
      stopSoundNode(id);
    }

    const indNodeGain = ctx.createGain();
    // Soft volume mapping per sound type
    let defaultLevel = 0.5;
    if (id === "ocean") defaultLevel = 0.65;
    if (id === "rain") defaultLevel = 0.45;
    if (id === "campfire") defaultLevel = 0.35;
    if (id === "zenchords") defaultLevel = 0.4;
    if (id === "singingbowl") defaultLevel = 0.8;

    indNodeGain.gain.setValueAtTime(0, ctx.currentTime); // fade in from 0
    indNodeGain.connect(masterGain);
    indNodeGain.gain.linearRampToValueAtTime(defaultLevel, ctx.currentTime + 1.5);

    const soundscapeInfo = SOUNDSCAPES.find(s => s.id === id);
    const type = soundscapeInfo?.type;

    const listNodes: any[] = [];
    const listTimers: any[] = [];

    if (type === "ocean") {
      // Pink noise through lowpass sweep
      const pNoise = ctx.createBufferSource();
      pNoise.buffer = createPinkNoiseBuffer(ctx);
      pNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.Q.setValueAtTime(1.2, ctx.currentTime);
      filter.frequency.setValueAtTime(380, ctx.currentTime);

      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.setValueAtTime(0.08, ctx.currentTime); // 12 seconds wave cycle

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(220, ctx.currentTime); // wave sweeping depth

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      pNoise.connect(filter);
      filter.connect(indNodeGain);

      lfo.start();
      pNoise.start();

      listNodes.push(pNoise, filter, lfo, lfoGain);

    } else if (type === "rain") {
      // Pink noise + White noise crackle filtered
      const noise = ctx.createBufferSource();
      noise.buffer = createPinkNoiseBuffer(ctx);
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.Q.setValueAtTime(0.6, ctx.currentTime);
      filter.frequency.setValueAtTime(800, ctx.currentTime);

      noise.connect(filter);
      filter.connect(indNodeGain);
      noise.start();
      listNodes.push(noise, filter);

      // Droplets interval generator
      const dropletInterval = setInterval(() => {
        if (!audioCtxRef.current || isMuted) return;
        const timeNow = ctx.currentTime;
        // Periodic quick high pass static drops
        const dropletGain = ctx.createGain();
        dropletGain.gain.setValueAtTime(0, timeNow);
        dropletGain.gain.linearRampToValueAtTime(0.12 * Math.random(), timeNow + 0.005);
        dropletGain.gain.exponentialRampToValueAtTime(0.001, timeNow + 0.15 + Math.random() * 0.1);

        const dropletOsc = ctx.createOscillator();
        dropletOsc.type = "sine";
        dropletOsc.frequency.setValueAtTime(1200 + Math.random() * 1500, timeNow);

        const dropletFilter = ctx.createBiquadFilter();
        dropletFilter.type = "highpass";
        dropletFilter.frequency.setValueAtTime(2500, timeNow);

        dropletOsc.connect(dropletFilter);
        dropletFilter.connect(dropletGain);
        dropletGain.connect(indNodeGain);

        dropletOsc.start(timeNow);
        dropletOsc.stop(timeNow + 0.5);

        setTimeout(() => {
          try {
            dropletOsc.disconnect();
            dropletFilter.disconnect();
            dropletGain.disconnect();
          } catch (e) {}
        }, 600);
      }, 180);

      listTimers.push(dropletInterval);

    } else if (type === "campfire") {
      // Brown noise for low warmth rumble
      const noise = ctx.createBufferSource();
      noise.buffer = createBrownNoiseBuffer(ctx);
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(180, ctx.currentTime);

      noise.connect(filter);
      filter.connect(indNodeGain);
      noise.start();
      listNodes.push(noise, filter);

      // Random crackle crackling pops
      const crackleInterval = setInterval(() => {
        if (!audioCtxRef.current || isMuted) return;
        if (Math.random() > 0.4) return; // 40% chance per slot

        const timeNow = ctx.currentTime;
        const popGain = ctx.createGain();
        popGain.gain.setValueAtTime(0, timeNow);
        popGain.gain.linearRampToValueAtTime(0.16 * Math.random(), timeNow + 0.002);
        popGain.gain.exponentialRampToValueAtTime(0.001, timeNow + 0.03 + Math.random() * 0.04);

        // High frequency filtered white noise + sharp decay oscillator
        const popOsc = ctx.createOscillator();
        popOsc.type = "triangle";
        popOsc.frequency.setValueAtTime(400 + Math.random() * 1600, timeNow);

        const popFilter = ctx.createBiquadFilter();
        popFilter.type = "bandpass";
        popFilter.Q.setValueAtTime(15, timeNow);
        popFilter.frequency.setValueAtTime(2200, timeNow);

        popOsc.connect(popFilter);
        popFilter.connect(popGain);
        popGain.connect(indNodeGain);

        popOsc.start(timeNow);
        popOsc.stop(timeNow + 0.1);

        setTimeout(() => {
          try {
            popOsc.disconnect();
            popFilter.disconnect();
            popGain.disconnect();
          } catch (e) {}
        }, 300);
      }, 120);

      listTimers.push(crackleInterval);

    } else if (type === "zenchords") {
      // Ambient warm chord synth using slow cyclical envelopes
      // C Maj9, F Maj9, A min9, G sus4
      const chords = [
        [130.81, 164.81, 196.00, 246.94, 293.66], // C3, E3, G3, B3, D4
        [174.61, 220.00, 261.63, 329.63, 392.00], // F3, A3, C4, E4, G4
        [110.00, 164.81, 261.63, 392.00, 493.88], // A2, E3, C4, G4, B4
        [98.00, 146.83, 196.00, 261.63, 293.66],  // G2, D3, G3, C4, D4
      ];

      let chordIndex = 0;

      const playChord = () => {
        if (!audioCtxRef.current || isMuted) return;
        const curCtx = audioCtxRef.current;
        const timeNow = curCtx.currentTime;
        const notes = chords[chordIndex];

        // Fade out previous oscillators if any
        const fadeOscs = [...activeChordOscillatorsRef.current];
        const fadeGains = [...activeChordGainsRef.current];

        fadeGains.forEach((gn) => {
          try {
            gn.gain.linearRampToValueAtTime(0, curCtx.currentTime + 3.0);
          } catch (e) {}
        });

        setTimeout(() => {
          fadeOscs.forEach(o => { try { o.stop(); o.disconnect(); } catch(e) {} });
          fadeGains.forEach(g => { try { g.disconnect(); } catch(e) {} });
        }, 3200);

        // Play new notes
        const newOscs: OscillatorNode[] = [];
        const newGains: GainNode[] = [];

        notes.forEach((freq, idx) => {
          const osc = curCtx.createOscillator();
          const gainNode = curCtx.createGain();

          osc.type = "sine";
          // add subtle detune for cozy warm analog chorus effect!
          const detuneAmount = (idx % 2 === 0 ? 1 : -1) * (Math.random() * 4 + 2);
          osc.frequency.setValueAtTime(freq, curCtx.currentTime);
          osc.detune.setValueAtTime(detuneAmount, curCtx.currentTime);

          gainNode.gain.setValueAtTime(0, curCtx.currentTime);
          // Distribute volume notes across the chord nicely
          const noteVolume = (0.28 / notes.length) * (idx === 0 ? 1.5 : 1);
          gainNode.gain.linearRampToValueAtTime(noteVolume, curCtx.currentTime + 3.5); // 3.5s smooth swell

          osc.connect(gainNode);
          gainNode.connect(indNodeGain);
          osc.start(curCtx.currentTime);

          newOscs.push(osc);
          newGains.push(gainNode);
        });

        activeChordOscillatorsRef.current = newOscs;
        activeChordGainsRef.current = newGains;

        // Next chord index
        chordIndex = (chordIndex + 1) % chords.length;
      };

      // Play immediately
      playChord();

      // Trigger every 8 seconds
      const intervalId = setInterval(playChord, 8000);
      chordTimerRef.current = intervalId;
      listTimers.push(intervalId);
    }

    activeSourcesRef.current[id] = {
      gainNode: indNodeGain,
      nodes: listNodes,
      timers: listTimers
    };
  };

  // Stop a specific soundscape
  const stopSoundNode = (id: string) => {
    const data = activeSourcesRef.current[id];
    if (!data) return;

    const ctx = audioCtxRef.current;
    if (ctx) {
      // Fade out slowly, then disconnect
      const t = ctx.currentTime;
      try {
        data.gainNode.gain.setValueAtTime(data.gainNode.gain.value, t);
        data.gainNode.gain.linearRampToValueAtTime(0, t + 0.82);
      } catch (err) {}
    }

    // Disconnect synthesisers
    setTimeout(() => {
      // Check if it is still inactive
      if (!selectedSounds.includes(id) || !isPlaying) {
        data.nodes.forEach(n => {
          try {
            n.stop();
            n.disconnect();
          } catch (e) {}
        });

        if (data.timers) {
          data.timers.forEach(tm => clearInterval(tm));
        }

        try {
          data.gainNode.disconnect();
        } catch (e) {}

        delete activeSourcesRef.current[id];

        // Special handling for Zen Chords
        if (id === "zenchords") {
          activeChordOscillatorsRef.current.forEach(o => { try { o.stop(); o.disconnect(); } catch (e) {} });
          activeChordGainsRef.current.forEach(g => { try { g.disconnect(); } catch (e) {} });
          activeChordOscillatorsRef.current = [];
          activeChordGainsRef.current = [];
          if (chordTimerRef.current) {
            clearInterval(chordTimerRef.current);
            chordTimerRef.current = null;
          }
        }
      }
    }, 900);
  };

  // Trigger Singing Bowl strike (one-shot strike on click)
  const playSingingBowlStrike = () => {
    initAudio();
    const ctx = audioCtxRef.current;
    const masterGain = masterGainRef.current;
    if (!ctx || !masterGain) return;

    const timeNow = ctx.currentTime;
    const strikeGain = ctx.createGain();
    strikeGain.gain.setValueAtTime(0, timeNow);
    strikeGain.gain.linearRampToValueAtTime(0.75, timeNow + 0.05); // quick strike
    strikeGain.gain.exponentialRampToValueAtTime(0.001, timeNow + 11); // slow 11 seconds melt-away decay

    // Singing bowl harmonics: 146.83 Hz (D3) as fundamental tone + warm pure frequencies on top
    const freqs = [146.83, 293.66, 440.49, 587.32, 734.15]; 
    const oscillators: OscillatorNode[] = [];

    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f, timeNow);

      const amp = ctx.createGain();
      // higher harmonics decays quicker for authentic acoustic resonance!
      const harmonicWeight = 1 / (idx * 1.5 + 1.0);
      amp.gain.setValueAtTime(harmonicWeight, timeNow);
      amp.gain.exponentialRampToValueAtTime(0.001, timeNow + 11 - (idx * 1.4));

      osc.connect(amp);
      amp.connect(strikeGain);
      osc.start(timeNow);
      osc.stop(timeNow + 11.5);

      oscillators.push(osc);
    });

    strikeGain.connect(masterGain);

    setTimeout(() => {
      oscillators.forEach(o => { try { o.disconnect(); } catch (e) {} });
      try {
        strikeGain.disconnect();
      } catch (e) {}
    }, 12000);
  };

  // Upload event handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleAudioFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleAudioFile(files[0]);
    }
  };

  const handleAudioFile = (file: File) => {
    if (!file.type.startsWith("audio/")) {
      alert("Please upload a valid audio file (e.g. MP3, WAV, OGG, M4A, etc.)");
      return;
    }

    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    const sizeStr = `${sizeMB} MB`;
    const url = URL.createObjectURL(file);

    if (customAudioRef.current) {
      customAudioRef.current.pause();
    }

    // Revoke previous URL if any to prevent leaks
    if (uploadedFile) {
      URL.revokeObjectURL(uploadedFile.url);
    }

    setUploadedFile({
      name: file.name,
      url: url,
      size: sizeStr
    });

    // Auto select track
    setSelectedSounds((prev) => {
      if (prev.includes("custom-upload")) return prev;
      return [...prev, "custom-upload"];
    });

    // If currently playing, trigger playback immediately
    if (isPlaying) {
      setTimeout(() => {
        if (customAudioRef.current) {
          initAudio();
          if (!customMediaElementSourceRef.current && audioCtxRef.current && masterGainRef.current) {
            try {
              const source = audioCtxRef.current.createMediaElementSource(customAudioRef.current);
              source.connect(masterGainRef.current);
              customMediaElementSourceRef.current = source;
            } catch (err) {
              console.warn("Failed to connect custom media element source:", err);
            }
          }
          customAudioRef.current.loop = true;
          customAudioRef.current.play().catch(e => console.warn("Failed to play user track", e));
        }
      }, 100);
    }
  };

  const handleRemoveUpload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (customAudioRef.current) {
      customAudioRef.current.pause();
    }
    if (uploadedFile) {
      URL.revokeObjectURL(uploadedFile.url);
    }
    setUploadedFile(null);
    setSelectedSounds(prev => prev.filter(id => id !== "custom-upload"));
  };

  // Revoke object URLs on component cleanup too
  useEffect(() => {
    return () => {
      if (uploadedFile) {
        URL.revokeObjectURL(uploadedFile.url);
      }
    };
  }, [uploadedFile]);

  // Handling play state changes
  const togglePlayAll = () => {
    if (!isPlaying) {
      initAudio();
      setIsPlaying(true);
      // Start all active selections
      setTimeout(() => {
        selectedSounds.forEach(soundId => {
          if (soundId !== "singingbowl" && soundId !== "custom-upload") {
            startSoundNode(soundId);
          } else if (soundId === "custom-upload" && customAudioRef.current) {
            if (!customMediaElementSourceRef.current && audioCtxRef.current && masterGainRef.current) {
              try {
                const source = audioCtxRef.current.createMediaElementSource(customAudioRef.current);
                source.connect(masterGainRef.current);
                customMediaElementSourceRef.current = source;
              } catch (err) {
                console.warn("Failed to connect custom media element source:", err);
              }
            }
            customAudioRef.current.loop = true;
            customAudioRef.current.play().catch(e => console.warn(e));
          }
        });
      }, 50);
    } else {
      setIsPlaying(false);
      // Stop all sound nodes
      Object.keys(activeSourcesRef.current).forEach(id => {
        stopSoundNode(id);
      });
      if (customAudioRef.current) {
        customAudioRef.current.pause();
      }
    }
  };

  // Sound toggles
  const toggleSoundscapeSelection = (soundId: string) => {
    if (soundId === "singingbowl") {
      playSingingBowlStrike();
      return;
    }

    if (soundId === "custom-upload") {
      let nextList = [...selectedSounds];
      if (selectedSounds.includes("custom-upload")) {
        nextList = nextList.filter(id => id !== "custom-upload");
        setSelectedSounds(nextList);
        if (customAudioRef.current) {
          customAudioRef.current.pause();
        }
      } else {
        nextList.push("custom-upload");
        setSelectedSounds(nextList);
        if (isPlaying && customAudioRef.current) {
          initAudio();
          if (!customMediaElementSourceRef.current && audioCtxRef.current && masterGainRef.current) {
            try {
              const source = audioCtxRef.current.createMediaElementSource(customAudioRef.current);
              source.connect(masterGainRef.current);
              customMediaElementSourceRef.current = source;
            } catch (err) {
              console.warn("Failed to connect custom media element source:", err);
            }
          }
          customAudioRef.current.loop = true;
          customAudioRef.current.play().catch(e => console.warn(e));
        }
      }
      return;
    }

    let nextList = [...selectedSounds];
    if (selectedSounds.includes(soundId)) {
      nextList = nextList.filter(id => id !== soundId);
      setSelectedSounds(nextList);
      if (isPlaying) {
        stopSoundNode(soundId);
      }
    } else {
      nextList.push(soundId);
      setSelectedSounds(nextList);
      if (isPlaying) {
        initAudio();
        setTimeout(() => {
          startSoundNode(soundId);
        }, 50);
      }
    }
  };

  // Control modifications
  const handleVolumeChange = (v: number) => {
    setVolume(v);
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(isMuted ? 0 : v, audioCtxRef.current.currentTime);
    }
  };

  const handleMuteToggle = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(nextMuted ? 0 : volume, audioCtxRef.current.currentTime);
    }
  };

  // Sleep Timer logic
  const selectTimerPreset = (minutes: number) => {
    if (activeTimerPreset === minutes) {
      // Clear timer
      setTimerLeft(null);
      setActiveTimerPreset(null);
    } else {
      setTimerLeft(minutes * 60); // store in seconds
      setActiveTimerPreset(minutes);
    }
  };

  useEffect(() => {
    if (timerLeft === null) return;
    if (timerLeft <= 0) {
      // Timer finished! Pause the audio.
      setIsPlaying(false);
      Object.keys(activeSourcesRef.current).forEach(id => {
        stopSoundNode(id);
      });
      setTimerLeft(null);
      setActiveTimerPreset(null);
      return;
    }

    const timerInterval = setInterval(() => {
      setTimerLeft(prev => (prev !== null && prev > 0 ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [timerLeft]);

  // Visualizer Animation
  const startVisualizer = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      visualizerAnimRef.current = requestAnimationFrame(draw);

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (isPlaying) {
        analyser.getByteFrequencyData(dataArray);

        // Draw soft frequency bar columns
        const barWidth = (width / bufferLength) * 2.2;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const percent = dataArray[i] / 255;
          const barHeight = Math.max(4, percent * height * 0.85);

          // Cozy natural garden green gradient coloring
          ctx.fillStyle = `rgba(125, 132, 97, ${0.15 + (percent * 0.7)})`;
          
          // Round bars slightly manually
          ctx.fillRect(x, height - barHeight, barWidth - 2, barHeight);
          ctx.fillStyle = `rgba(125, 132, 97, ${0.4 + (percent * 0.5)})`;
          ctx.fillRect(x, height - barHeight, barWidth - 2, 4);

          x += barWidth;
        }
      } else {
        // Draw slow idle meditative waves when paused
        ctx.beginPath();
        ctx.strokeStyle = "rgba(125, 132, 97, 0.3)";
        ctx.lineWidth = 1.5;

        const time = Date.now() * 0.0035;
        for (let i = 0; i < width; i++) {
          const y = height / 2 + Math.sin(i * 0.05 + time) * 4;
          if (i === 0) {
            ctx.moveTo(i, y);
          } else {
            ctx.lineTo(i, y);
          }
        }
        ctx.stroke();
      }
    };

    draw();
  };

  // Stop visualizer, clean up audio nodes on unmount
  useEffect(() => {
    return () => {
      if (visualizerAnimRef.current) {
        cancelAnimationFrame(visualizerAnimRef.current);
      }
      
      // Stop all sounds
      Object.keys(activeSourcesRef.current).forEach(id => {
        const data = activeSourcesRef.current[id];
        if (data) {
          data.nodes.forEach(n => { try { n.stop(); n.disconnect(); } catch (e) {} });
          if (data.timers) data.timers.forEach(t => clearInterval(t));
          try { data.gainNode.disconnect(); } catch (e) {}
        }
      });

      activeChordOscillatorsRef.current.forEach(o => { try { o.stop(); o.disconnect(); } catch(e) {} });
      activeChordGainsRef.current.forEach(g => { try { g.disconnect(); } catch(e) {} });
      if (chordTimerRef.current) clearInterval(chordTimerRef.current);

      if (customMediaElementSourceRef.current) {
        try {
          customMediaElementSourceRef.current.disconnect();
        } catch (err) {}
        customMediaElementSourceRef.current = null;
      }

      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(console.error);
      }
    };
  }, []);

  // Format time remaining MM:SS
  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="bg-white border border-[#E0DBCF] rounded-[28px] p-6 shadow-sm flex flex-col justify-between h-full min-h-[420px]" id="calming-music-card">
      <div className="w-full flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="p-2 bg-[#EBE9E1] rounded-full text-[#7D8461]">
              <Headphones className="w-4 h-4" />
            </span>
            <h3 className="font-serif font-semibold text-[#2C2C24] text-base">Calming Soundscapes</h3>
          </div>
          <p className="text-xs text-[#6B6B58] leading-relaxed mb-4">
            Soften rapid thoughts. Mix custom synthesized nature streams and warm melodic chords to wrap your mind in cozy comfort. Strike the Singing Bowl for instant centering.
          </p>
        </div>

        {/* Real-time Dynamic Canvas Visualizer */}
        <div className="relative mb-5" id="audio-visualizer-box">
          <canvas
            ref={canvasRef}
            width={400}
            height={46}
            className="w-full h-11 bg-[#FAF9F5]/80 border border-[#E0DBCF]/60 rounded-xl block"
          />
          {timerLeft !== null && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] font-mono bg-[#7D8461] text-white font-bold px-2 py-0.5 rounded-full shadow-3xs flex items-center gap-1">
              Sleep timer: {formatTimer(timerLeft)}
            </span>
          )}
        </div>

        {/* Selection Mix Panel */}
        <div className="space-y-2 flex-grow-0 max-h-[170px] overflow-y-auto pr-1 select-none">
          {SOUNDSCAPES.map((sound) => {
            const isSelected = selectedSounds.includes(sound.id);
            const Icon = sound.icon;

            return (
              <div
                key={sound.id}
                onClick={() => toggleSoundscapeSelection(sound.id)}
                className={`group flex items-center justify-between p-2 rounded-xl border transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? "bg-[#7D8461]/10 border-[#7D8461]"
                    : "bg-white border-[#E0DBCF]/70 hover:border-[#7D8461]/70"
                }`}
                id={`soundscape-item-${sound.id}`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`p-1.5 rounded-full transition-colors ${
                    isSelected ? "bg-[#7D8461] text-white" : "bg-[#FAF9F5] text-[#7D8461]"
                  }`}>
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <h5 className="text-[11px] font-bold text-[#2C2C24]">
                      {sound.name}
                    </h5>
                    <p className="text-[9px] text-[#A39E8F] group-hover:text-[#6B6B58] transition-colors leading-tight">
                      {sound.description}
                    </p>
                  </div>
                </div>
                {sound.id === "singingbowl" ? (
                  <span className="text-[9px] text-[#7D8461] uppercase tracking-widest font-bold font-sans bg-[#EBE9E1]/80 px-2.5 py-0.5 rounded-full shrink-0 group-hover:bg-[#7D8461] group-hover:text-white transition-colors duration-300">
                    Strike Bell
                  </span>
                ) : (
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                    isSelected ? "bg-[#7D8461] border-[#7D8461] text-white text-[10px] font-bold" : "border-[#E0DBCF]"
                  }`}>
                    {isSelected && "✓"}
                  </div>
                )}
              </div>
            );
          })}

          {/* User Custom Audio Upload Option */}
          {uploadedFile && (
            <div
              onClick={() => toggleSoundscapeSelection("custom-upload")}
              className={`group flex items-center justify-between p-2 rounded-xl border transition-all duration-300 cursor-pointer ${
                selectedSounds.includes("custom-upload")
                  ? "bg-[#7D8461]/15 border-[#7D8461]"
                  : "bg-white border-[#E0DBCF]/70 hover:border-[#7D8461]/70"
              }`}
              id="soundscape-item-custom-upload"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className={`p-1.5 rounded-full transition-colors shrink-0 ${
                  selectedSounds.includes("custom-upload") ? "bg-[#7D8461] text-white" : "bg-[#EBE9E1]/80 text-[#7D8461]"
                }`}>
                  <Music className="w-3.5 h-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h5 className="text-[11px] font-bold text-[#2C2C24] truncate">
                    {uploadedFile.name}
                  </h5>
                  <p className="text-[9px] text-[#A39E8F] group-hover:text-[#6B6B58] transition-colors leading-tight truncate">
                    Custom Upload • {uploadedFile.size}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-1.5" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={handleRemoveUpload}
                  className="p-1 rounded-full text-red-500 hover:bg-red-50 hover:text-red-700 transition-all cursor-pointer mr-0.5"
                  title="Remove track"
                  id="remove-custom-upload-btn"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div 
                  onClick={() => toggleSoundscapeSelection("custom-upload")}
                  className={`w-4 h-4 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${
                    selectedSounds.includes("custom-upload") ? "bg-[#7D8461] border-[#7D8461] text-white text-[10px] font-bold" : "border-[#E0DBCF]"
                  }`}
                >
                  {selectedSounds.includes("custom-upload") && "✓"}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Custom Music Upload Zone */}
        <div className="mt-3 select-none">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="audio/*"
            className="hidden"
            id="custom-audio-uploader-input"
          />
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border border-dashed rounded-xl p-3 text-center transition-all cursor-pointer ${
              isDragging
                ? "border-[#7D8461] bg-[#7D8461]/5 scale-[0.99] shadow-inner"
                : "border-[#E0DBCF]/80 bg-[#FAF9F5]/70 hover:bg-[#FAF9F5] hover:border-[#7D8461]/50"
            }`}
            id="custom-audio-dropzone"
          >
            <div className="flex flex-col items-center justify-center gap-1 text-[#6B6B58]">
              <Upload className={`w-4.5 h-4.5 ${isDragging ? "text-[#7D8461] animate-bounce" : "text-[#A39E8F]"}`} />
              <span className="text-[10px] font-bold uppercase tracking-wide">
                {isDragging ? "Drop your song here!" : "Upload Your Own Music File"}
              </span>
              <span className="text-[9px] text-[#A39E8F]">
                Drag & drop or click to load a local audio track (MP3, WAV, etc.)
              </span>
            </div>
          </div>
        </div>

        {/* Master Controls Section */}
        <div className="mt-4 pt-3 border-t border-[#E0DBCF]/50 flex flex-col gap-3">
          {/* Sleep Timer Preset Selector */}
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#A39E8F]">
              Sleep Timer
            </span>
            <div className="flex gap-1.5" id="soundscape-timers">
              {[5, 10, 20, 30].map((mins) => (
                <button
                  key={mins}
                  onClick={() => selectTimerPreset(mins)}
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                    activeTimerPreset === mins
                      ? "bg-[#7D8461] text-white"
                      : "bg-[#EBE9E1]/60 text-[#6B6B58] hover:bg-[#EBE9E1]"
                  }`}
                  id={`timer-btn-${mins}`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            {/* Play/Pause Main Button */}
            <button
              onClick={togglePlayAll}
              className={`flex items-center justify-center gap-1.5 py-2 px-5 rounded-full text-xs font-semibold uppercase tracking-wider shadow-3xs transition-all duration-300 cursor-pointer shrink-0 ${
                isPlaying
                  ? "bg-[#6B6B58] text-white hover:bg-[#4A4A3F]"
                  : "bg-[#7D8461] text-white hover:bg-[#6B6B58]"
              }`}
              id="main-music-play-btn"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" /> Pause Sounds
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 shrink-0 fill-white" /> Start Ambiance
                </>
              )}
            </button>

            {/* Volume control slider */}
            <div className="flex items-center gap-2 flex-grow min-w-0">
              <button
                onClick={handleMuteToggle}
                className="p-1.5 text-[#7D8461] hover:bg-[#EBE9E1]/30 rounded-full transition-colors cursor-pointer shrink-0"
                title={isMuted ? "Unmute" : "Mute"}
                id="volume-mute-btn"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                disabled={isMuted}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-[#7D8461] h-1 bg-[#EBE9E1] rounded-lg cursor-pointer disabled:opacity-50"
                id="volume-slider-soundscape"
              />
            </div>
          </div>
        </div>

        {/* Small warning note */}
        <div className="bg-[#FAF9F5]/80 border border-[#E0DBCF]/40 p-2 rounded-xl mt-3 flex gap-2 items-center text-[10px] text-[#A39E8F] leading-tight">
          <Info className="w-3.5 h-3.5 text-[#7D8461] shrink-0" />
          <span>Real-time synthesized audio operates offline, using low processing power and zero network weight.</span>
        </div>
      </div>
    </div>
  );
}
