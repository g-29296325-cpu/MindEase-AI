import { useState } from "react";
import { Leaf, Smile, Activity, Sparkles, Heart, HelpCircle, Shield, Wind, Eye, Headphones, Layers } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ChatAssistant from "./components/ChatAssistant";
import BoxBreathing from "./components/BoxBreathing";
import GroundingTool54321 from "./components/GroundingTool54321";
import GratitudeReflection from "./components/GratitudeReflection";
import AffirmationDeck from "./components/AffirmationDeck";
import SupportHub from "./components/SupportHub";
import CalmingMusic from "./components/CalmingMusic";
import BubblePopper from "./components/BubblePopper";

type ActiveTool = "breathing" | "grounding" | "gratitude" | "affirmations" | "music" | "bubbles" | "support";

export default function App() {
  const [moodRating, setMoodRating] = useState<number>(5);
  const [activeTool, setActiveTool] = useState<ActiveTool>("breathing");

  const getMoodResponse = (rating: number) => {
    if (rating <= 3) return "Feeling mostly steady. Keep nurturing your peaceful moments. 🍃";
    if (rating <= 6) return "Things might feel a bit tight. Let's do a quick grounding exercise together. 🌸";
    if (rating <= 8) return "Thoughts are starting to race. We are right here with you. Take one slow breath. 🌊";
    return "Feeling extremely overwhelmed. That is okay. Let's ground ourselves step-by-step. You are safe. ❤️";
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#4A4A3F] font-sans p-3 sm:p-6 md:p-8 flex flex-col justify-between" id="mindease-app-root">
      {/* Top Calming Header container */}
      <header className="max-w-6xl w-full mx-auto mb-6 bg-[#FAF9F5]/90 border border-[#E0DBCF] p-5 rounded-[24px] shadow-xs flex flex-col sm:flex-row justify-between items-center gap-4" id="mindease-header">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#7D8461] rounded-full flex items-center justify-center text-white shadow-2xs">
            <Leaf className="w-6 h-6 animate-pulse text-white" />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="font-serif font-bold text-xl sm:text-2xl text-[#2C2C24] tracking-tight flex items-center justify-center sm:justify-start gap-1">
              MindEase AI
            </h1>
            <p className="text-xs text-[#A39E8F] font-sans tracking-wide">
              A gentle, supportive grounding space for secondary school students
            </p>
          </div>
        </div>

        {/* Action Button & Indicator */}
        <div className="flex items-center gap-4 text-sm font-medium">
          <span className="hidden md:inline px-4 py-2 bg-[#EBE9E1] rounded-full text-xs text-[#4A4A3F]">
            Hi there • Gentle Pace
          </span>
          <button
            onClick={() => setActiveTool("support")}
            className="px-4 py-2 border-2 border-[#7D8461] text-[#7D8461] hover:bg-[#7D8461] hover:text-white rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300"
          >
            Emergency Support
          </button>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="max-w-6xl w-full mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch" id="mindease-main-grid">
        {/* Left Column: Interactive Feelings check-in & Chat Assistant (Lg: 7 spans) */}
        <div className="lg:col-span-7 flex flex-col gap-6 h-full">
          {/* Mood Check-In Slider */}
          <section className="bg-white border border-[#E0DBCF] p-5 rounded-[24px] shadow-xs" id="feelings-check-in">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-serif font-semibold text-[#2C2C24] text-sm flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#7D8461]" /> Current Feeling Check-in
              </h2>
              <span className="text-xs bg-[#EBE9E1] text-[#4A4A3F] px-2.5 py-0.5 rounded-full font-semibold font-mono">
                Stress Rating: {moodRating} / 10
              </span>
            </div>

            <div className="flex items-center gap-4 p-1">
              <span className="text-lg animate-bounce" title="Peaceful">🍃</span>
              <input
                type="range"
                min="1"
                max="10"
                value={moodRating}
                onChange={(e) => setMoodRating(parseInt(e.target.value))}
                className="flex-1 accent-[#7D8461] h-1.5 bg-[#EBE9E1] rounded-lg cursor-pointer"
                id="mood-slider"
              />
              <span className="text-lg" title="Overwhelmed">⚡</span>
            </div>

            <div className="mt-3.5 bg-[#EBE9E1]/30 border border-[#E0DBCF]/40 p-2.5 rounded-xl text-center min-h-[46px] flex items-center justify-center">
              <p className="text-xs font-medium text-[#4A4A3F] leading-relaxed transition-all duration-300">
                {getMoodResponse(moodRating)}
              </p>
            </div>
          </section>

          {/* Chat Container */}
          <div className="flex-1 flex flex-col">
            <ChatAssistant />
          </div>
        </div>

        {/* Right Column: Grounding Tools Dashboard Picker / Active panels (Lg: 5 spans) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Picker Navigation Bar */}
          <section className="bg-[#EBE9E1] border border-[#E0DBCF]/80 p-5 rounded-[24px] shadow-xs" id="toolbox-picker-bar">
            <h3 className="text-xs uppercase tracking-widest font-bold text-[#7D8461] mb-3">
              Techniques
            </h3>
            
            <div className="grid grid-cols-1 gap-2.5" id="tool-tabs-container">
              <button
                onClick={() => setActiveTool("breathing")}
                className={`p-3.5 rounded-xl flex justify-between items-center transition-all ${
                  activeTool === "breathing"
                    ? "bg-[#7D8461] text-white shadow-xs border border-[#7D8461]"
                    : "bg-white/60 hover:bg-white border border-[#E0DBCF]/60 text-[#4A4A3F]"
                } cursor-pointer text-left`}
                title="Guided Box Breathing Bubble"
                id="tab-breathing"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-xs leading-snug">Box Breathing</span>
                  <span className={`text-[10px] ${activeTool === "breathing" ? "opacity-80" : "opacity-60"}`}>Calm the nervous system</span>
                </div>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${activeTool === "breathing" ? "bg-white/20" : "border border-[#7D8461] text-[#7D8461]"}`}>
                  →
                </div>
              </button>

              <button
                onClick={() => setActiveTool("grounding")}
                className={`p-3.5 rounded-xl flex justify-between items-center transition-all ${
                  activeTool === "grounding"
                    ? "bg-[#7D8461] text-white shadow-xs border border-[#7D8461]"
                    : "bg-white/60 hover:bg-white border border-[#E0DBCF]/60 text-[#4A4A3F]"
                } cursor-pointer text-left`}
                title="5-4-3-2-1 Grounding exercise"
                id="tab-grounding"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-xs leading-snug">5-4-3-2-1 Grounding</span>
                  <span className={`text-[10px] ${activeTool === "grounding" ? "opacity-80" : "opacity-60"}`}>Reconnect with your senses</span>
                </div>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${activeTool === "grounding" ? "bg-white/20" : "border border-[#7D8461] text-[#7D8461]"}`}>
                  →
                </div>
              </button>

              <button
                onClick={() => setActiveTool("gratitude")}
                className={`p-3.5 rounded-xl flex justify-between items-center transition-all ${
                  activeTool === "gratitude"
                    ? "bg-[#7D8461] text-white shadow-xs border border-[#7D8461]"
                    : "bg-white/60 hover:bg-white border border-[#E0DBCF]/60 text-[#4A4A3F]"
                } cursor-pointer text-left`}
                title="My Gratitude Journal Garden"
                id="tab-gratitude"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-xs leading-snug">Gratitude Garden</span>
                  <span className={`text-[10px] ${activeTool === "gratitude" ? "opacity-80" : "opacity-60"}`}>Reflect on simple joys</span>
                </div>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${activeTool === "gratitude" ? "bg-white/20" : "border border-[#7D8461] text-[#7D8461]"}`}>
                  →
                </div>
              </button>

              <button
                onClick={() => setActiveTool("affirmations")}
                className={`p-3.5 rounded-xl flex justify-between items-center transition-all ${
                  activeTool === "affirmations"
                    ? "bg-[#7D8461] text-white shadow-xs border border-[#7D8461]"
                    : "bg-white/60 hover:bg-white border border-[#E0DBCF]/60 text-[#4A4A3F]"
                } cursor-pointer text-left`}
                title="Uplifting affirmations card flip"
                id="tab-affirmations"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-xs leading-snug">Positive Affirmations</span>
                  <span className={`text-[10px] ${activeTool === "affirmations" ? "opacity-80" : "opacity-60"}`}>Find daily inner strength</span>
                </div>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${activeTool === "affirmations" ? "bg-white/20" : "border border-[#7D8461] text-[#7D8461]"}`}>
                  →
                </div>
              </button>

              <button
                onClick={() => setActiveTool("music")}
                className={`p-3.5 rounded-xl flex justify-between items-center transition-all ${
                  activeTool === "music"
                    ? "bg-[#7D8461] text-white shadow-xs border border-[#7D8461]"
                    : "bg-white/60 hover:bg-white border border-[#E0DBCF]/60 text-[#4A4A3F]"
                } cursor-pointer text-left`}
                title="Tranquil soundscapes and ambient musical generators"
                id="tab-music"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-xs leading-snug">Calming Soundscapes</span>
                  <span className={`text-[10px] ${activeTool === "music" ? "opacity-80" : "opacity-60"}`}>Mix healing ambient natural loops</span>
                </div>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${activeTool === "music" ? "bg-white/20" : "border border-[#7D8461] text-[#7D8461]"}`}>
                  →
                </div>
              </button>

              <button
                onClick={() => setActiveTool("bubbles")}
                className={`p-3.5 rounded-xl flex justify-between items-center transition-all ${
                  activeTool === "bubbles"
                    ? "bg-[#7D8461] text-white shadow-xs border border-[#7D8461]"
                    : "bg-white/60 hover:bg-white border border-[#E0DBCF]/60 text-[#4A4A3F]"
                } cursor-pointer text-left`}
                title="Satisfying bubble sensory popping game"
                id="tab-bubbles"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-xs leading-snug">Calming Bubbles</span>
                  <span className={`text-[10px] ${activeTool === "bubbles" ? "opacity-80" : "opacity-60"}`}>Pop floating fears or bubble wrap</span>
                </div>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${activeTool === "bubbles" ? "bg-white/20" : "border border-[#7D8461] text-[#7D8461]"}`}>
                  →
                </div>
              </button>

              <button
                onClick={() => setActiveTool("support")}
                className={`p-3.5 rounded-xl flex justify-between items-center transition-all ${
                  activeTool === "support"
                    ? "bg-[#7D8461] text-white shadow-xs border border-[#7D8461]"
                    : "bg-white/60 hover:bg-white border border-[#E0DBCF]/60 text-[#4A4A3F]"
                } cursor-pointer text-left`}
                title="Crisis help support lines"
                id="tab-support"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-xs leading-snug">Support Circles Hub</span>
                  <span className={`text-[10px] ${activeTool === "support" ? "opacity-80" : "opacity-60"}`}>Caring resources & helper networks</span>
                </div>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${activeTool === "support" ? "bg-white/20" : "border border-[#7D8461] text-[#7D8461]"}`}>
                  →
                </div>
              </button>
            </div>
          </section>

          {/* Active Tool Renderer Panel */}
          <div className="flex-1 min-h-[420px]">
            <AnimatePresence mode="wait">
              {activeTool === "breathing" && (
                <motion.div
                  key="breathing-panel"
                  className="h-full"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <BoxBreathing />
                </motion.div>
              )}

              {activeTool === "grounding" && (
                <motion.div
                  key="grounding-panel"
                  className="h-full"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <GroundingTool54321 />
                </motion.div>
              )}

              {activeTool === "gratitude" && (
                <motion.div
                  key="gratitude-panel"
                  className="h-full"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <GratitudeReflection />
                </motion.div>
              )}

              {activeTool === "affirmations" && (
                <motion.div
                  key="affirmations-panel"
                  className="h-full"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <AffirmationDeck />
                </motion.div>
              )}

              {activeTool === "music" && (
                <motion.div
                  key="music-panel"
                  className="h-full"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <CalmingMusic />
                </motion.div>
              )}

              {activeTool === "bubbles" && (
                <motion.div
                  key="bubbles-panel"
                  className="h-full"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <BubblePopper />
                </motion.div>
              )}

              {activeTool === "support" && (
                <motion.div
                  key="support-panel"
                  className="h-full"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <SupportHub />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer copyright and note */}
      <footer className="max-w-6xl w-full mx-auto mt-8 flex flex-col sm:flex-row justify-between items-center border-[#E0DBCF] border-t pt-6 text-xs text-[#A39E8F] gap-4">
        <p>You're doing great. Remember to talk to a teacher, counselor, or parent if you need more help.</p>
        <div className="flex gap-6">
          <span className="hover:text-[#7D8461] transition-colors cursor-pointer">Privacy Policy</span>
          <span className="hover:text-[#7D8461] transition-colors cursor-pointer">Help Center</span>
          <span className="hover:text-[#7D8461] transition-colors cursor-pointer">Crisis Contacts</span>
        </div>
      </footer>
    </div>
  );
}
