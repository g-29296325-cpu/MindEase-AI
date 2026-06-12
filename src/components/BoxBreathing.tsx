import { useState, useEffect, useRef } from "react";
import { Play, RotateCcw, Pause, Wind, Leaf } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type BreathPhase = "idle" | "inhale" | "holdIn" | "exhale" | "holdOut" | "complete";

export default function BoxBreathing() {
  const [phase, setPhase] = useState<BreathPhase>("idle");
  const [timeLeft, setTimeLeft] = useState(4);
  const [cycle, setCycle] = useState(1);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Transition to next phase
          handlePhaseTransition();
          return 4; // Reset phase duration to 4 seconds
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, phase, cycle]);

  const handlePhaseTransition = () => {
    setPhase((currentPhase) => {
      switch (currentPhase) {
        case "inhale":
          return "holdIn";
        case "holdIn":
          return "exhale";
        case "exhale":
          return "holdOut";
        case "holdOut":
          if (cycle < 4) {
            setCycle((prev) => prev + 1);
            return "inhale";
          } else {
            setIsActive(false);
            return "complete";
          }
        default:
          return "idle";
      }
    });
  };

  const startBreathing = () => {
    setPhase("inhale");
    setTimeLeft(4);
    setCycle(1);
    setIsActive(true);
  };

  const stopBreathing = () => {
    setIsActive(false);
    setPhase("idle");
    setTimeLeft(4);
    setCycle(1);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const getPhaseInstruction = () => {
    switch (phase) {
      case "inhale":
        return {
          title: "Breathe In",
          description: "Slowly fill your lungs with fresh, comforting air.",
          color: "text-[#7D8461]",
          bgClass: "bg-[#7D8461]/10 border-[#7D8461]/35",
        };
      case "holdIn":
        return {
          title: "Hold it",
          description: "Let that stillness and peacefulness settle in.",
          color: "text-[#4A4A3F]",
          bgClass: "bg-[#EBE9E1]/60 border-[#E0DBCF]",
        };
      case "exhale":
        return {
          title: "Breathe Out",
          description: "Gently let go of all stress, tension, and worries.",
          color: "text-[#7D8461]",
          bgClass: "bg-[#7D8461]/5 border-[#7D8461]/20",
        };
      case "holdOut":
        return {
          title: "Hold it",
          description: "Wait patiently, resting in a quiet, cozy moment.",
          color: "text-[#6B6B58]",
          bgClass: "bg-[#EBE9E1]/30 border-[#E0DBCF]/40",
        };
      case "complete":
        return {
          title: "Well Done!",
          description: "You completed the cycle. How do you feel now?",
          color: "text-[#7D8461]",
          bgClass: "bg-[#7D8461]/15 border-[#7D8461]/40",
        };
      default:
        return {
          title: "Ready to Start?",
          description: "This 4-step exercise helps ground you quickly when stressed.",
          color: "text-[#4A4A3F]",
          bgClass: "bg-[#F5F5F0] border-[#E0DBCF]/50",
        };
    }
  };

  const instruction = getPhaseInstruction();

  // Determine size factor for the breath bubble
  const getBubbleScale = () => {
    if (!isActive) return 1;
    if (phase === "inhale") return 1.4 - (timeLeft / 4) * 0.4; // grows from 1 to 1.4
    if (phase === "holdIn") return 1.4; // remains fully expanded
    if (phase === "exhale") return 1 + (timeLeft / 4) * 0.4; // shrinks from 1.4 to 1
    if (phase === "holdOut") return 1; // remains small
    return 1;
  };

  return (
    <div className="bg-white border border-[#E0DBCF] rounded-[28px] p-6 shadow-sm flex flex-col items-center justify-between h-full min-h-[420px]" id="box-breathing-card">
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-[#EBE9E1] rounded-full text-[#7D8461]">
              <Wind className="w-4 h-4" />
            </span>
            <h3 className="font-serif font-semibold text-[#2C2C24] text-base">Box Breathing</h3>
          </div>
          {isActive && (
            <span className="bg-[#EBE9E1] text-[#4A4A3F] px-3 py-0.5 rounded-full text-xs font-mono font-semibold">
              Cycle {cycle} / 4
            </span>
          )}
        </div>
        <p className="text-xs text-[#6B6B58] leading-relaxed">
          Breathe in slowly through your nose, hold, and breathe out to calm the nervous system.
        </p>
      </div>

      {/* Visual Breathing Bubble Area - Stylized after the box design HTML */}
      <div className="relative my-6 flex items-center justify-center w-48 h-48">
        <AnimatePresence>
          {/* Pulsing ring during idle or active phases */}
          <motion.div
            className="absolute rounded-2xl border-4 border-[#E0DBCF] w-full h-full"
            animate={{
              scale: isActive ? [1, 1.03, 1] : 1,
              borderColor: isActive ? ["#E0DBCF", "#7D8461", "#E0DBCF"] : "#E0DBCF"
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </AnimatePresence>

        {/* Breathing Circle with Natural Tones */}
        <motion.div
          className={`rounded-full shadow-inner flex flex-col items-center justify-center ${
            phase === "inhale"
              ? "bg-[#7D8461]/30 border-2 border-[#7D8461]"
              : phase === "holdIn"
              ? "bg-[#EBE9E1] border-2 border-[#A39E8F]"
              : phase === "exhale"
              ? "bg-[#7D8461]/15 border-2 border-[#7D8461]/60"
              : phase === "holdOut"
              ? "bg-[#EBE9E1]/60 border-2 border-[#E0DBCF]"
              : phase === "complete"
              ? "bg-[#7D8461]/25 border-2 border-[#7D8461]"
              : "bg-[#F5F5F0] border border-[#E0DBCF]"
          }`}
          style={{ width: "110px", height: "110px" }}
          animate={{
            scale: getBubbleScale(),
          }}
          transition={{
            duration: 1,
            ease: "easeInOut",
          }}
        >
          {isActive ? (
            <div className="text-center font-mono select-none">
              <div className="text-3xl font-bold text-[#2C2C24]">{timeLeft}</div>
              <div className="text-[10px] text-[#6B6B58] uppercase tracking-widest">sec</div>
            </div>
          ) : (
            <Leaf className={`w-8 h-8 ${phase === "complete" ? "text-[#7D8461] animate-bounce" : "text-[#A39E8F]"}`} />
          )}
        </motion.div>

        {/* Current Stage Indicator */}
        {isActive && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-full h-full relative">
              <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 text-[9px] font-bold uppercase transition-colors px-1.5 py-0.5 rounded ${phase === "inhale" ? "bg-[#7D8461] text-white" : "text-[#A39E8F]"}`}>1. Inhale</div>
              <div className={`absolute right-0 top-1/2 translate-x-2 -translate-y-1/2 text-[9px] font-bold uppercase transition-colors px-1.5 py-0.5 rounded ${phase === "holdIn" ? "bg-[#7D8461] text-white" : "text-[#A39E8F]"}`}>2. Hold</div>
              <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 text-[9px] font-bold uppercase transition-colors px-1.5 py-0.5 rounded ${phase === "exhale" ? "bg-[#7D8461] text-white" : "text-[#A39E8F]"}`}>3. Exhale</div>
              <div className={`absolute left-0 top-1/2 -translate-x-2 -translate-y-1/2 text-[9px] font-bold uppercase transition-colors px-1.5 py-0.5 rounded ${phase === "holdOut" ? "bg-[#7D8461] text-white" : "text-[#A39E8F]"}`}>4. Hold</div>
            </div>
          </div>
        )}
      </div>

      {/* Guide text */}
      <div className={`text-center py-2.5 px-4 rounded-xl border w-full min-h-[76px] transition-all duration-300 ${instruction.bgClass}`}>
        <h4 className={`font-serif font-semibold text-sm ${instruction.color}`}>{instruction.title}</h4>
        <p className="text-xs text-[#4A4A3F] font-sans mt-0.5">{instruction.description}</p>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-2.5 w-full mt-4">
        {!isActive ? (
          <button
            onClick={startBreathing}
            className="w-full flex items-center justify-center gap-2 bg-[#7D8461] hover:bg-[#6B6B58] active:scale-95 text-white font-semibold py-2.5 px-4 rounded-full text-xs uppercase tracking-wider transition-all duration-300 shadow-xs cursor-pointer"
            id="start-breathing-btn"
          >
            <Play className="w-3.5 h-3.5 fill-white" /> Start Calm Breath
          </button>
        ) : (
          <button
            onClick={stopBreathing}
            className="w-full flex items-center justify-center gap-2 bg-[#EBE9E1] hover:bg-[#E0DBCF] active:scale-95 text-[#4A4A3F] font-semibold py-2.5 px-4 rounded-full text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer"
            id="stop-breathing-btn"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Skip / Reset
          </button>
        )}
      </div>
    </div>
  );
}
