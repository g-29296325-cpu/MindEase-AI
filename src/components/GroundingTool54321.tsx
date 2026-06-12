import { useState } from "react";
import { Eye, Hand, Volume2, Sparkles, Smile, RefreshCw, ChevronRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface StepDetails {
  num: number;
  label: string;
  placeholder: string;
  icon: any;
  colorClass: string;
  bgClass: string;
}

const STEPS: StepDetails[] = [
  {
    num: 5,
    label: "Things you can SEE",
    placeholder: "e.g., A green tree outside, a wooden desk, a photo...",
    icon: Eye,
    colorClass: "text-[#7D8461] border-[#7D8461]",
    bgClass: "bg-[#7D8461]/10",
  },
  {
    num: 4,
    label: "Things you can TOUCH/FEEL",
    placeholder: "e.g., The warm desk, cold keys, texture of my clothes...",
    icon: Hand,
    colorClass: "text-[#4A4A3F] border-[#4A4A3F]",
    bgClass: "bg-[#EBE9E1]",
  },
  {
    num: 3,
    label: "Things you can HEAR",
    placeholder: "e.g., Clock ticking, birds chirping, gentle breathing...",
    icon: Volume2,
    colorClass: "text-[#6B6B58] border-[#6B6B58]",
    bgClass: "bg-[#EBE9E1]/60",
  },
  {
    num: 2,
    label: "Things you can SMELL",
    placeholder: "e.g., Rain air, fresh paper, comforting tea...",
    icon: Sparkles,
    colorClass: "text-[#2C2C24] border-[#2C2C24]",
    bgClass: "bg-[#7D8461]/15",
  },
  {
    num: 1,
    label: "Thing you can TASTE",
    placeholder: "e.g., Warm honey, fresh water, cool air on my tongue...",
    icon: Smile,
    colorClass: "text-[#7D8461] border-[#7D8461]",
    bgClass: "bg-[#7D8461]/20",
  },
];

export default function GroundingTool54321() {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [inputs, setInputs] = useState<string[][]>(STEPS.map((step) => Array(step.num).fill("")));
  const [completed, setCompleted] = useState(false);

  const currentStep = STEPS[currentStepIdx];

  const handleInputChange = (subIdx: number, val: string) => {
    setInputs((prev) => {
      const copy = prev.map((arr) => [...arr]);
      copy[currentStepIdx][subIdx] = val;
      return copy;
    });
  };

  const nextStep = () => {
    if (currentStepIdx < STEPS.length - 1) {
      setCurrentStepIdx((prev) => prev + 1);
    } else {
      setCompleted(true);
    }
  };

  const prevStep = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx((prev) => prev - 1);
    }
  };

  const resetAll = () => {
    setCurrentStepIdx(0);
    setInputs(STEPS.map((step) => Array(step.num).fill("")));
    setCompleted(false);
  };

  const isCurrentStepFilled = () => {
    return inputs[currentStepIdx].every((str) => str.trim().length > 0);
  };

  // Icon of current step
  const IconComponent = currentStep?.icon;

  return (
    <div className="bg-white border border-[#E0DBCF] rounded-[28px] p-6 shadow-sm flex flex-col justify-between h-full min-h-[420px]" id="sensory-grounding-card">
      <div className="w-full">
        <div className="flex items-center gap-2 mb-3">
          <span className="p-2 bg-[#EBE9E1] rounded-full text-[#7D8461]">
            <Eye className="w-4 h-4" />
          </span>
          <h3 className="font-serif font-semibold text-[#2C2C24] text-base">5-4-3-2-1 Grounding Space</h3>
        </div>
        <p className="text-xs text-[#6B6B58] leading-relaxed mb-4">
          Check in with your 5 physical senses. This helps anchor your brain in the cozy stability of the physical moment.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!completed ? (
          <motion.div
            key={currentStepIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col justify-center my-2"
          >
            {/* Step Header */}
            <div className="flex items-center gap-3 mb-4">
              <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border-2 ${currentStep.colorClass} ${currentStep.bgClass}`}>
                {currentStep.num}
              </span>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-widest text-[#A39E8F]">Step {currentStepIdx + 1} of 5</h4>
                <p className="font-serif font-semibold text-[#2C2C24] text-sm">{currentStep.label}</p>
              </div>
            </div>

            {/* Step Inputs */}
            <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
              {inputs[currentStepIdx].map((val, subIdx) => (
                <div key={subIdx} className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-bold text-[#A39E8F] font-mono">
                    #{subIdx + 1}
                  </span>
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => handleInputChange(subIdx, e.target.value)}
                    placeholder={subIdx === 0 ? currentStep.placeholder : `Another simple thing...`}
                    className="w-full text-xs bg-white border border-[#E0DBCF] rounded-xl pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#7D8461] text-[#4A4A3F] placeholder-[#A39E8F]"
                    id={`grounding-input-${currentStepIdx}-${subIdx}`}
                  />
                  {val.trim().length > 0 && (
                    <Check className="absolute right-3 w-4 h-4 text-[#7D8461]" />
                  )}
                </div>
              ))}
            </div>

            {/* Nav Indicators */}
            <div className="flex items-center justify-between mt-5 pt-3 border-t border-[#E0DBCF]/60">
              <button
                disabled={currentStepIdx === 0}
                onClick={prevStep}
                className="text-[#A39E8F] hover:text-[#7D8461] disabled:opacity-40 text-xs font-semibold uppercase tracking-wider cursor-pointer"
                id="grounding-back-btn"
              >
                Back
              </button>

              <div className="flex gap-1">
                {STEPS.map((_, idx) => (
                  <span
                    key={idx}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      idx === currentStepIdx ? "w-6 bg-[#7D8461]" : "w-2 bg-[#EBE9E1]"
                    }`}
                  />
                ))}
              </div>

              <button
                disabled={!isCurrentStepFilled()}
                onClick={nextStep}
                className={`flex items-center gap-1 py-1.5 px-3.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                  isCurrentStepFilled()
                    ? "bg-[#7D8461] hover:bg-[#6B6B58] text-white cursor-pointer shadow-3xs"
                    : "bg-[#EBE9E1] text-[#A39E8F] cursor-not-allowed"
                }`}
                id="grounding-next-btn"
              >
                {currentStepIdx === STEPS.length - 1 ? "Finish" : "Next"} <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col justify-center items-center text-center p-4 bg-[#EBE9E1]/30 border border-[#E0DBCF]/60 rounded-2xl"
            key="sandbox-grounding-completed"
          >
            <div className="bg-[#EBE9E1] p-3 rounded-full text-[#7D8461] mb-3">
              <Smile className="w-6 h-6 animate-bounce" />
            </div>
            <h4 className="font-serif font-semibold text-[#2C2C24] text-sm">Nicely done!</h4>
            <p className="text-xs text-[#6B6B58] mt-2 leading-relaxed max-w-sm">
              By listing these sensory observations, you successfully returned your conscious energy to the quiet stability of the physical world. Let's take one steady breath.
            </p>

            {/* Condensed Summary View of what they typed */}
            <div className="w-full bg-white border border-[#E0DBCF]/80 rounded-xl p-3 text-left mt-4 text-[10px] space-y-1 text-[#6B6B58] max-h-[100px] overflow-y-auto">
              {STEPS.map((step, idx) => (
                <div key={idx} className="border-b border-dashed border-[#E0DBCF]/50 pb-1 last:border-0 last:pb-0">
                  <strong className="text-[#2C2C24] font-serif">{step.num} {step.label.slice(11)}: </strong>
                  <span>{inputs[idx].filter(Boolean).join(", ") || "(empty)"}</span>
                </div>
              ))}
            </div>

            <button
              onClick={resetAll}
              className="mt-4 flex items-center gap-1.5 text-xs text-[#4A4A3F] hover:text-[#2C2C24] font-semibold bg-white hover:bg-[#EBE9E1] border border-[#E0DBCF] px-4 py-2 rounded-full transition-all cursor-pointer"
              id="grounding-restart-btn"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
