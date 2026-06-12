import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Play, Pause, RefreshCw, Layers, Gamepad2, Sparkles, Smile, Info, Plus, ChevronRight, Wind } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Bubble {
  id: string;
  x: number; // percentage width 10-90
  y: number; // percentage height (floating upwards)
  size: number; // px
  speed: number;
  label: string;
  color: string;
  opacity: number;
}

interface GridBubble {
  id: number;
  popped: boolean;
  color: string;
  sizeMultiplier: number;
}

export default function BubblePopper() {
  const [activeMode, setActiveMode] = useState<"grid" | "floating">("grid");
  const [poppedCount, setPoppedCount] = useState<number>(0);
  
  // Custom stress label input for floating worries
  const [worryInput, setWorryInput] = useState<string>("");

  // Soundscape / Background music variables
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);
  const [musicType, setMusicType] = useState<"chimes" | "harmonic">("chimes");
  const [musicVolume, setMusicVolume] = useState<number>(0.25);
  const [chimeTempo, setChimeTempo] = useState<number>(2.0); // seconds between wind chimes

  // Grid bubbles state (6x6 bubble wrap grid)
  const [gridBubbles, setGridBubbles] = useState<GridBubble[]>([]);
  
  // Floating bubbles state
  const [floatingBubbles, setFloatingBubbles] = useState<Bubble[]>([]);
  const [burstParticles, setBurstParticles] = useState<Array<{ id: string; x: number; y: number; label: string; color: string }>>([]);

  // Web Audio Context reference for synthesizers
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  // Background music nodes refs
  const bgMusicIntervalRef = useRef<any>(null);
  const bgMusicMasterGainRef = useRef<GainNode | null>(null);
  const bgChordOscillatorsRef = useRef<OscillatorNode[]>([]);
  const bgChordGainsRef = useRef<GainNode[]>([]);

  // Initialize the grid bubbles with beautiful calming pastel hues
  const resetGrid = () => {
    const colors = [
      "rgba(125, 132, 97, 0.4)",  // Sage forest
      "rgba(163, 171, 143, 0.4)", // Light olive
      "rgba(182, 169, 139, 0.4)", // Desert sand
      "rgba(129, 140, 153, 0.35)", // Cool slate
      "rgba(147, 129, 153, 0.35)", // Cosmic lilac
      "rgba(153, 129, 132, 0.35)"  // Warm rouge
    ];
    
    const initialGrid = Array.from({ length: 36 }, (_, i) => ({
      id: i,
      popped: false,
      color: colors[i % colors.length],
      sizeMultiplier: 0.9 + Math.random() * 0.2 // subtle size variety for high tactile feel
    }));
    setGridBubbles(initialGrid);
  };

  useEffect(() => {
    resetGrid();
    // Pre-populate some floating worries
    const initialWorries = [
      "Test nerves", "Anxiety", "Comparison", "Staying perfect", "Being tired"
    ];
    const initialFloaters = initialWorries.map((worry, idx) => ({
      id: `init-${idx}-${Date.now()}`,
      x: 15 + idx * 16 + Math.random() * 5,
      y: 60 + Math.random() * 30,
      size: 60 + Math.random() * 20,
      speed: 0.25 + Math.random() * 0.2,
      label: worry,
      color: idx % 2 === 0 ? "#7D8461" : "#A39E8F",
      opacity: 0.8
    }));
    setFloatingBubbles(initialFloaters);
  }, []);

  // Soft Burst Synthesizer Sound
  const triggerBubbleBurstAudio = (pitchModifier = 1.0) => {
    try {
      if (!audioCtxRef.current) {
        // @ts-ignore
        const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioCtxClass();
      }
      
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const tNow = ctx.currentTime;
      
      // 1. Pop resonance tone (ascending pitch block sweep)
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = "sine";
      const startFreq = (310 + Math.random() * 90) * pitchModifier;
      const endFreq = (1100 + Math.random() * 150) * pitchModifier;
      
      osc.frequency.setValueAtTime(startFreq, tNow);
      osc.frequency.exponentialRampToValueAtTime(endFreq, tNow + 0.05);
      
      gainNode.gain.setValueAtTime(0, tNow);
      gainNode.gain.linearRampToValueAtTime(0.38, tNow + 0.004); // nice sharp attack
      gainNode.gain.exponentialRampToValueAtTime(0.001, tNow + 0.055); // fast decay pop
      
      // 2. Rupture skin friction snap (transient high frequency crackle)
      const highOsc = ctx.createOscillator();
      const highGain = ctx.createGain();
      
      highOsc.type = "triangle";
      highOsc.frequency.setValueAtTime(3200 + Math.random() * 400, tNow);
      
      highGain.gain.setValueAtTime(0, tNow);
      highGain.gain.linearRampToValueAtTime(0.09, tNow + 0.002);
      highGain.gain.exponentialRampToValueAtTime(0.001, tNow + 0.012);
      
      // Connect and fire
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      highOsc.connect(highGain);
      highGain.connect(ctx.destination);
      
      osc.start(tNow);
      highOsc.start(tNow);
      
      osc.stop(tNow + 0.1);
      highOsc.stop(tNow + 0.1);
    } catch (e) {
      console.warn("Failed to generate real-time bubble audio:", e);
    }
  };

  // Background ambiance synthesizers (Wind Chimes vs Harmonic evolve pad)
  const stopBgMusic = () => {
    if (bgMusicIntervalRef.current) {
      clearInterval(bgMusicMusicLoop);
      clearInterval(bgMusicIntervalRef.current);
      bgMusicIntervalRef.current = null;
    }

    // fade out previous cords safely
    bgChordGainsRef.current.forEach(g => {
      try {
        g.gain.linearRampToValueAtTime(0, audioCtxRef.current!.currentTime + 1.2);
      } catch (err) {}
    });

    setTimeout(() => {
      bgChordOscillatorsRef.current.forEach(o => { try { o.stop(); o.disconnect(); } catch (e) {} });
      bgChordGainsRef.current.forEach(g => { try { g.disconnect(); } catch (e) {} });
      bgChordOscillatorsRef.current = [];
      bgChordGainsRef.current = [];
    }, 1300);
  };

  const startBgMusic = () => {
    stopBgMusic();
    
    try {
      if (!audioCtxRef.current) {
        // @ts-ignore
        const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioCtxClass();
      }
      
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      if (musicType === "chimes") {
        // Pentatonic bells chime logic
        const notes = [293.66, 329.63, 392.00, 440.00, 587.33, 659.25, 783.99]; // D4, E4, G4, A4, D5, E5, G5
        
        const triggerChime = () => {
          if (!audioCtxRef.current) return;
          const t = ctx.currentTime;
          
          const pitch = notes[Math.floor(Math.random() * notes.length)];
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = "sine";
          osc.frequency.setValueAtTime(pitch, t);
          // detune a smidge for physical analog feel
          osc.detune.setValueAtTime((Math.random() - 0.5) * 5, t);

          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(musicVolume * 0.65, t + 0.35); // swell
          gain.gain.exponentialRampToValueAtTime(0.001, t + 4.5 + Math.random() * 2); // long tail

          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start(t);
          osc.stop(t + 7.0);

          setTimeout(() => {
            try {
              osc.disconnect();
              gain.disconnect();
            } catch (err) {}
          }, 7500);
        };

        // play first immediately
        triggerChime();
        bgMusicIntervalRef.current = setInterval(triggerChime, chimeTempo * 1000);

      } else {
        // Harmonic Pad synthesiser
        // Plays warm evolving major/sus chords slowly mapping cozy comfort
        const chords = [
          [130.81, 164.81, 196.00, 246.94], // C3, E3, G3, B3
          [146.83, 174.61, 220.00, 261.63], // D3, F3, A3, C4
          [164.81, 196.00, 246.94, 293.66], // E3, G3, B3, D4
          [174.61, 220.00, 261.63, 329.63]  // F3, A3, C4, E4
        ];
        
        let chordIdx = 0;
        
        const playChord = () => {
          if (!audioCtxRef.current) return;
          const t = ctx.currentTime;
          const chosenChord = chords[chordIdx];

          // Fade out existing oscillators
          const oldGains = [...bgChordGainsRef.current];
          const oldOscs = [...bgChordOscillatorsRef.current];

          oldGains.forEach(g => {
            try {
              g.gain.setValueAtTime(g.gain.value, t);
              g.gain.linearRampToValueAtTime(0, t + 2.5);
            } catch (err) {}
          });

          setTimeout(() => {
            oldOscs.forEach(o => { try { o.stop(); o.disconnect(); } catch (e) {} });
            oldGains.forEach(g => { try { g.disconnect(); } catch (e) {} });
          }, 2800);

          const newOscs: OscillatorNode[] = [];
          const newGains: GainNode[] = [];

          chosenChord.forEach((freq, index) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, t);
            osc.detune.setValueAtTime((Math.random() - 0.5) * 8, t); // thick analog vibe

            gain.gain.setValueAtTime(0, t);
            // quieter high notes, deep warm bass
            const individualVol = (musicVolume * 0.35) * (index === 0 ? 1.4 : 0.82);
            gain.gain.linearRampToValueAtTime(individualVol, t + 3.0); // very slow warm swell

            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start(t);
            
            newOscs.push(osc);
            newGains.push(gain);
          });

          bgChordOscillatorsRef.current = newOscs;
          bgChordGainsRef.current = newGains;
          
          chordIdx = (chordIdx + 1) % chords.length;
        };

        playChord();
        // swap chord every 7.5 seconds
        bgMusicIntervalRef.current = setInterval(playChord, 7500);
      }
    } catch (e) {
      console.warn("Failed to start background synth music:", e);
    }
  };

  // Re-sync background music when toggles shift
  useEffect(() => {
    if (isMusicPlaying) {
      startBgMusic();
    } else {
      stopBgMusic();
    }
    return () => stopBgMusic();
  }, [isMusicPlaying, musicType, chimeTempo, musicVolume]);

  // Adjust master gain nodes in real-time when sliders slide
  useEffect(() => {
    if (bgMusicMasterGainRef.current && audioCtxRef.current) {
      bgMusicMasterGainRef.current.gain.setValueAtTime(musicVolume, audioCtxRef.current.currentTime);
    }
  }, [musicVolume]);

  // Floating bubbles scheduler update loop
  useEffect(() => {
    if (activeMode !== "floating") return;

    const interval = setInterval(() => {
      setFloatingBubbles((prev) => {
        return prev
          .map((b) => {
            // Drift upward
            let nextY = b.y - b.speed;
            // slight horizontal sway
            let nextX = b.x + Math.sin(nextY * 0.05) * 0.18;

            return {
              ...b,
              y: nextY,
              x: Math.max(8, Math.min(92, nextX))
            };
          })
          // keep bubbles on screen, if float past container top, despawn
          .filter((b) => b.y > -15);
      });
    }, 28);

    return () => clearInterval(interval);
  }, [activeMode]);

  // Handle Wrap grid bubble click
  const handleGridPop = (id: number) => {
    setGridBubbles((prev) => {
      return prev.map((b) => {
        if (b.id === id && !b.popped) {
          // Play pop sound!
          // Pitch scale rises based on placement to make scaling sounds!
          const rowMultiplier = 0.83 + (Math.floor(id / 6) * 0.08);
          triggerBubbleBurstAudio(rowMultiplier);
          setPoppedCount((cnt) => cnt + 1);
          return { ...b, popped: true };
        }
        return b;
      });
    });
  };

  // Handle Floating bubble click and shatter
  const handleFloatingPop = (b: Bubble) => {
    triggerBubbleBurstAudio(0.95 + Math.random() * 0.2);
    setPoppedCount((cnt) => cnt + 1);

    // Create burst particles for beautiful feedback
    const particleId = `particle-${Date.now()}-${Math.random()}`;
    setBurstParticles(prev => [
      ...prev,
      {
        id: particleId,
        x: b.x,
        y: b.y,
        label: b.label || "Released ✨",
        color: b.color
      }
    ]);

    // Cleanup particle shortly after
    setTimeout(() => {
      setBurstParticles(prev => prev.filter(p => p.id !== particleId));
    }, 1200);

    // Remove popped bubble
    setFloatingBubbles(prev => prev.filter(curr => curr.id !== b.id));
  };

  // Append new custom worry floating bubble
  const handleAddWorryBubble = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanLabel = worryInput.trim();
    if (!cleanLabel) return;

    // Spawn a brand new bubble carrying the tag
    const newBubble: Bubble = {
      id: `worry-${Date.now()}-${Math.random()}`,
      x: 10 + Math.random() * 80,
      y: 108, // right below container edge
      size: Math.max(56, Math.min(105, 55 + cleanLabel.length * 5)),
      speed: 0.18 + Math.random() * 0.15,
      label: cleanLabel,
      color: "#7D8461",
      opacity: 0.9
    };

    setFloatingBubbles(prev => [...prev, newBubble]);
    setWorryInput("");
  };

  // Helper milestones message for calming secondary schoolers
  const getEncouragingMilestone = () => {
    if (poppedCount === 0) return "Click bubbles to start venting stress. Breathing deeply is your superpower. 🍃";
    if (poppedCount < 5) return "Feeling those pops? Now, drop your shoulders. Let them rest. 🌸";
    if (poppedCount < 12) return "Unclench your jaw. Exhale all that heavy air inside. You are doing beautiful. ✨";
    if (poppedCount < 25) return "Letting go of thoughts makes space for quiet moments. Breathe with the rhythm. 🌀";
    return `Awesome! You have popped and released ${poppedCount} stress items. Feel free to clear the grid or spawn more. 🌻`;
  };

  const handleInteractiveDemoPop = () => {
    triggerBubbleBurstAudio(1.0);
    setPoppedCount(prev => prev + 1);
  };

  const bgMusicMusicLoop = 0; // fallback ID reference

  return (
    <div className="bg-white border border-[#E0DBCF] rounded-[28px] p-6 shadow-sm flex flex-col justify-between h-full min-h-[420px]" id="bubble-popper-card">
      <div className="flex-1 flex flex-col">
        {/* Header title */}
        <div className="flex items-center justify-between mb-3 border-b border-[#E0DBCF]/40 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-[#EBE9E1] rounded-full text-[#7D8461]">
              <Layers className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-serif font-semibold text-[#2C2C24] text-base">Satisfying Bubble Space</h3>
              <p className="text-[10px] text-[#A39E8F] uppercase tracking-wider font-semibold">Tension popping & relaxation</p>
            </div>
          </div>
          <div className="bg-[#7D8461]/15 text-[#7D8461] border border-[#7D8461]/30 rounded-xl px-3 py-1 text-center font-mono text-xs font-bold shrink-0">
            Popped Count: {poppedCount}
          </div>
        </div>

        {/* Milestone Advice Box */}
        <div className="bg-[#FAF9F5] border border-[#E0DBCF]/60 p-3 rounded-2xl mb-4 text-xs text-[#6B6B58] flex gap-2.5 items-center">
          <Smile className="w-5 h-5 text-[#7D8461] shrink-0 animate-pulse" />
          <p className="leading-snug font-medium italic">
            "{getEncouragingMilestone()}"
          </p>
        </div>

        {/* Mode Toggles */}
        <div className="flex bg-[#EBE9E1]/50 p-1 rounded-xl mb-4 select-none">
          <button
            onClick={() => setActiveMode("grid")}
            className={`flex-1 py-1.5 px-3 flex items-center justify-center gap-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeMode === "grid"
                ? "bg-white text-[#2C2C24] shadow-3xs"
                : "text-[#6B6B58] hover:text-[#2C2C24]"
            }`}
            id="bubble-mode-grid"
          >
            <Gamepad2 className="w-3.5 h-3.5" /> Bubble Wrap Sheet
          </button>
          <button
            onClick={() => setActiveMode("floating")}
            className={`flex-1 py-1.5 px-3 flex items-center justify-center gap-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeMode === "floating"
                ? "bg-white text-[#2C2C24] shadow-3xs"
                : "text-[#6B6B58] hover:text-[#2C2C24]"
            }`}
            id="bubble-mode-floating"
          >
            <Sparkles className="w-3.5 h-3.5" /> Worry Sanctuary Jar
          </button>
        </div>

        {/* MAIN GAME DISPLAY CONTAINER */}
        <div className="relative border border-[#E0DBCF]/80 rounded-2xl min-h-[200px] h-[220px] bg-[#FAF9F5] overflow-hidden flex items-center justify-center mb-4">
          
          {/* 1. BUBBLE WRAP GRID MODE */}
          {activeMode === "grid" && (
            <div className="w-full h-full p-4 flex flex-col justify-between">
              <div className="grid grid-cols-6 gap-3 max-w-[280px] mx-auto flex-1 items-center justify-center">
                {gridBubbles.map((bubble) => (
                  <button
                    key={bubble.id}
                    onClick={() => handleGridPop(bubble.id)}
                    style={{
                      transform: `scale(${bubble.popped ? 0.8 : 1.0})`,
                      opacity: bubble.popped ? 0.35 : 1.0,
                    }}
                    className={`w-7.5 h-7.5 rounded-full border shadow-3xs transition-all duration-300 relative focus:outline-none cursor-pointer flex items-center justify-center overflow-hidden ${
                      bubble.popped
                        ? "bg-[#EBE9E1]/30 border-[#E0DBCF]"
                        : "bg-radial from-white to-[#EBE9E1]/80 hover:to-[#7D8461]/20 border-[#7D8461]/40 active:scale-95"
                    }`}
                    id={`wrap-bubble-${bubble.id}`}
                  >
                    {/* Glossy shine bubble layer */}
                    {!bubble.popped && (
                      <>
                        <span className="absolute top-1 left-1.5 w-1.5 h-1 bg-white rounded-full opacity-70" />
                        <span className="absolute bottom-1 right-1 w-1 h-1 bg-[#7D8461]/20 rounded-full" />
                      </>
                    )}
                    {bubble.popped && (
                      <span className="text-[10px] text-[#A39E8F] font-bold">o</span>
                    )}
                  </button>
                ))}
              </div>
              
              <div className="flex justify-center mt-2">
                <button
                  onClick={resetGrid}
                  className="px-4 py-1.5 bg-white border border-[#E0DBCF] hover:bg-[#EBE9E1]/30 rounded-xl text-[10px] font-bold text-[#6B6B58] hover:text-[#2C2C24] flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all active:scale-95"
                  id="reset-bubble-grid-btn"
                >
                  <RefreshCw className="w-3 h-3" /> Re-fill Bubble Wrap Sheet
                </button>
              </div>
            </div>
          )}

          {/* 2. FLOATING WORRY SANCTUARY JAR MODE */}
          {activeMode === "floating" && (
            <div className="w-full h-full premium-floating-boundary relative">
              {/* Backing decorative glass reflection */}
              <div className="absolute inset-x-4 inset-y-1.5 border-x border-[#E0DBCF]/30 bg-radial from-transparent to-white/5 rounded-3xl pointer-events-none" />
              
              {floatingBubbles.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-[#A39E8F] pointer-events-none">
                  <Wind className="w-7 h-7 text-[#7D8461]/40 mb-1.5 animate-spin-slow" />
                  <p className="text-[11px] font-serif font-medium text-[#6B6B58]">The jar is peaceful and empty.</p>
                  <p className="text-[9px]">Write down some school stress words below to float them up and release them.</p>
                </div>
              )}

              {/* Floating Bubbles list */}
              <AnimatePresence>
                {floatingBubbles.map((b) => (
                  <motion.button
                    key={b.id}
                    onClick={() => handleFloatingPop(b)}
                    style={{
                      left: `${b.x}%`,
                      top: `${b.y}%`,
                      width: b.size,
                      height: b.size,
                    }}
                    className="absolute rounded-full border border-[#7D8461]/40 bg-white/70 backdrop-blur-3xs hover:bg-[#7D8461]/10 flex flex-col items-center justify-center p-1 text-center shadow-3xs cursor-pointer -translate-x-1/2 -translate-y-1/2 focus:outline-none select-none hover:border-[#7D8461] transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.9 }}
                    id={`floating-bubble-${b.id}`}
                  >
                    {/* Gloss shine reflection */}
                    <span className="absolute top-[12%] left-[15%] w-[20%] h-[12%] bg-white rounded-full opacity-80" />
                    <span className="absolute bottom-[10%] right-[10%] w-[15%] h-[15%] bg-[#7D8461]/10 rounded-full" />
                    
                    <span className="text-[9px] font-bold text-[#4A4A3F] leading-tight break-all truncate max-w-[85%] px-0.5">
                      {b.label}
                    </span>
                    <span className="text-[7px] text-[#A39E8F] font-semibold uppercase tracking-wider scale-90 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      Release
                    </span>
                  </motion.button>
                ))}
              </AnimatePresence>

              {/* Poppin' Burst particles & word release text anchors */}
              {burstParticles.map((p) => (
                <div
                  key={p.id}
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center"
                >
                  <span className="text-[10px] font-bold bg-[#7D8461] text-white px-2 py-0.5 rounded-full shadow-3xs mb-1.5 tracking-wider animate-bounce">
                    Released! ✨
                  </span>
                  <div className="relative w-8 h-8 flex items-center justify-center">
                    <span className="absolute inset-0 rounded-full border-2 border-[#7D8461] animate-ping" />
                    <span className="absolute w-2 h-2 rounded-full bg-[#EBE9E1] animate-ping [animation-delay:0.15s]" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input Worry spawn panel for Floating Mode */}
        {activeMode === "floating" && (
          <form onSubmit={handleAddWorryBubble} className="flex gap-2 mb-4 justify-between select-none">
            <input
              type="text"
              maxLength={20}
              value={worryInput}
              onChange={(e) => setWorryInput(e.target.value)}
              placeholder="What is stressful today? (e.g. Exams)"
              className="flex-1 bg-white border border-[#E0DBCF] rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#7D8461] placeholder-[#A39E8F] text-[#2C2C24]"
              id="worry-bubble-input"
            />
            <button
              type="submit"
              disabled={!worryInput.trim()}
              className={`px-3.5 rounded-xl transition-all font-semibold text-xs flex items-center gap-1 ${
                worryInput.trim()
                  ? "bg-[#7D8461] text-white hover:bg-[#6B6B58] cursor-pointer"
                  : "bg-[#EBE9E1] text-[#A39E8F] cursor-not-allowed"
              }`}
              id="spawn-worry-bubble-btn"
            >
              <Plus className="w-3.5 h-3.5" /> Float Worry
            </button>
          </form>
        )}

        {/* SOFTEST BACKGROUND MUSIC PANEL CONTROLLER */}
        <div className="bg-[#FAF9F5] border border-[#E0DBCF]/80 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#7D8461] flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5" /> Background Music
              </span>
              <span className="text-[9px] text-[#A39E8F] font-semibold bg-[#EBE9E1] px-1.5 py-0.5 rounded-md">
                Synthesized live
              </span>
            </div>
            
            {/* Play toggle with standard parameters */}
            <div className="flex gap-1.5 items-center">
              <button
                onClick={() => setMusicType("chimes")}
                className={`text-[9px] font-bold px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                  musicType === "chimes"
                    ? "bg-[#7D8461] text-white"
                    : "bg-[#EBE9E1]/60 text-[#6B6B58] hover:bg-[#EBE9E1]"
                }`}
                id="music-type-chimes"
              >
                Wind Chimes
              </button>
              <button
                onClick={() => setMusicType("harmonic")}
                className={`text-[9px] font-bold px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                  musicType === "harmonic"
                    ? "bg-[#7D8461] text-white"
                    : "bg-[#EBE9E1]/60 text-[#6B6B58] hover:bg-[#EBE9E1]"
                }`}
                id="music-type-harmonic"
              >
                Harmony Pad
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
            {/* Main Toggle Switch */}
            <div className="md:col-span-4 flex items-center gap-2">
              <button
                onClick={() => setIsMusicPlaying(!isMusicPlaying)}
                className={`w-full py-1.5 px-3 flex items-center justify-center gap-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  isMusicPlaying
                    ? "bg-[#6B6B58] text-white hover:bg-[#4A4A3F]"
                    : "bg-[#7D8461] text-white hover:bg-[#6B6B58]"
                }`}
                id="toggle-ambient-music-btn"
              >
                {isMusicPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5" /> Mute Music
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" /> Play Ambient
                  </>
                )}
              </button>
            </div>

            {/* Volume control */}
            <div className="md:col-span-4 flex items-center gap-2">
              <span className="text-[10px] text-[#6B6B58] whitespace-nowrap shrink-0">Music Vol</span>
              <input
                type="range"
                min="0"
                max="0.6"
                step="0.05"
                value={musicVolume}
                onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                className="w-full accent-[#7D8461] h-1 bg-[#EBE9E1] rounded-lg cursor-pointer"
                id="music-volume-ambient"
              />
            </div>

            {/* Speed Tempo control (Only applies to wind chimes) */}
            <div className="md:col-span-4 flex items-center gap-2">
              <span className="text-[10px] text-[#6B6B58] whitespace-nowrap shrink-0">
                {musicType === "chimes" ? "Chime Freq" : "Pad Depth"}
              </span>
              <input
                type="range"
                min={musicType === "chimes" ? "0.8" : "4.0"}
                max={musicType === "chimes" ? "4.5" : "12.0"}
                step="0.2"
                disabled={musicType !== "chimes"}
                value={chimeTempo}
                onChange={(e) => setChimeTempo(parseFloat(e.target.value))}
                className="w-full accent-[#7D8461] h-1 bg-[#EBE9E1] rounded-lg cursor-pointer disabled:opacity-30"
                id="music-tempo-ambient"
              />
            </div>
          </div>
        </div>

        {/* Info panel */}
        <div className="bg-[#FAF9F5]/85 border border-[#E0DBCF]/40 p-2.5 rounded-xl mt-3 flex gap-2 items-center text-[10px] text-[#A39E8F] leading-snug">
          <Info className="w-4 h-4 text-[#7D8461] shrink-0" />
          <span>Tap anywhere inside to test pop. High volume and pitch variety supports focus. Background music layers on top of other system tools.</span>
        </div>
      </div>
    </div>
  );
}
