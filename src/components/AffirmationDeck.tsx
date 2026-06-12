import { useState } from "react";
import { Sparkles, ArrowRight, BookOpen, Quote, Smile } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Affirmation {
  text: string;
  author?: string;
  theme: string;
}

const AFFIRMATIONS: Affirmation[] = [
  { text: "I am capable of handling challenges.", theme: "strength" },
  { text: "I believe in my ability to learn and grow.", theme: "growth" },
  { text: "I can take things one gentle step at a time.", theme: "peace" },
  { text: "I have unique strengths that help me succeed.", theme: "strength" },
  { text: "Mistakes are just proof that I am trying and learning.", theme: "growth" },
  { text: "My value doesn't depend on a test grade, school score, or others' opinions.", theme: "worth" },
  { text: "It is okay to rest, breathe, and slow down. I don't have to be perfect.", theme: "peace" },
  { text: "I am worthy of kindness, love, and respect, just as I am.", theme: "worth" },
  { text: "My feelings deserve space, but they will pass. I am safe in this moment.", theme: "peace" },
  { text: "I am strong enough to ask for help when things feel like too much.", theme: "strength" },
];

export default function AffirmationDeck() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [drawnTimes, setDrawnTimes] = useState(1);

  const drawNewCard = () => {
    setIsFlipped(false);
    // Add small delay to swap content while card is faced down
    setTimeout(() => {
      let nextIdx;
      do {
        nextIdx = Math.floor(Math.random() * AFFIRMATIONS.length);
      } while (nextIdx === currentIndex && AFFIRMATIONS.length > 1);
      setCurrentIndex(nextIdx);
      setDrawnTimes((prev) => prev + 1);
    }, 150);
  };

  const activeAffirmation = AFFIRMATIONS[currentIndex];

  const getThemeColors = (theme: string) => {
    switch (theme) {
      case "strength":
        return {
          bg: "bg-[#7D8461]/10",
          border: "border-[#7D8461]/40",
          text: "text-[#2C2C24]",
          accentBg: "bg-[#7D8461]/25",
          label: "Strength & Courage",
        };
      case "growth":
        return {
          bg: "bg-[#EBE9E1]/60",
          border: "border-[#E0DBCF]",
          text: "text-[#4A4A3F]",
          accentBg: "bg-[#EBE9E1]",
          label: "Growth Mindset",
        };
      case "peace":
        return {
          bg: "bg-[#FAF9F5]",
          border: "border-[#E0DBCF]/80",
          text: "text-[#4A4A3F]",
          accentBg: "bg-[#EBE9E1]/50",
          label: "Inner Calm",
        };
      default:
        return {
          bg: "bg-[#7D8461]/15",
          border: "border-[#7D8461]/35",
          text: "text-[#2C2C24]",
          accentBg: "bg-[#7D8461]/25",
          label: "Self Worth",
        };
    }
  };

  const cardTheme = getThemeColors(activeAffirmation.theme);

  return (
    <div className="bg-white border border-[#E0DBCF] rounded-[28px] p-6 shadow-sm flex flex-col justify-between h-full min-h-[420px]" id="affirmations-deck-card">
      <div className="w-full">
        <div className="flex items-center gap-2 mb-3">
          <span className="p-2 bg-[#EBE9E1] rounded-full text-[#7D8461]">
            <Sparkles className="w-4 h-4" />
          </span>
          <h3 className="font-serif font-semibold text-[#2C2C24] text-base">Affirmations</h3>
        </div>
        <p className="text-xs text-[#6B6B58] leading-relaxed mb-5">
          Uplifting, hopeful statements that remind you of your quiet inner strength. Draw a card and read it slowly:
        </p>
      </div>

      {/* Interactive Card */}
      <div className="flex-1 flex items-center justify-center py-2" id="affirmation-card-container">
        <motion.div
          className={`w-full max-w-[270px] h-[190px] rounded-2xl border p-5 flex flex-col justify-between items-center text-center cursor-pointer relative shadow-xs transition-all duration-300 ${
            isFlipped ? "bg-white border-[#E0DBCF]" : cardTheme.bg + " " + cardTheme.border
          }`}
          whileHover={{ y: -3, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsFlipped(!isFlipped)}
          animate={{
            rotateY: isFlipped ? 180 : 0,
          }}
          transition={{ duration: 0.4 }}
          id="affirmation-anim-card"
        >
          {/* Card Back (Default View or Flip) */}
          {!isFlipped ? (
            <div className="flex flex-col items-center justify-between h-full w-full select-none">
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${cardTheme.accentBg} ${cardTheme.text}`}>
                {cardTheme.label}
              </span>

              <div className="flex flex-col items-center flex-1 justify-center my-2 p-2">
                <Quote className="w-4 h-4 text-[#A39E8F]/40 mb-2 rotate-180" />
                <p className={`font-serif font-medium text-xs sm:text-sm px-1 leading-relaxed text-[#2C2C24] italic`}>
                  "{activeAffirmation.text}"
                </p>
              </div>

              <span className="text-[10px] text-[#A39E8F] flex items-center gap-1 font-medium bg-white/70 px-2 py-0.5 rounded-full">
                Tap card to flip <BookOpen className="w-3 h-3 text-[#7D8461]" />
              </span>
            </div>
          ) : (
            // Card Front / Lore View when flipped
            <div className="flex flex-col items-center justify-between h-full w-full select-none [transform:rotateY(180deg)]">
              <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EBE9E1] text-[#4A4A3F]">
                Reflection
              </span>

              <div className="flex-1 flex flex-col items-center justify-center p-2 text-[#4A4A3F]">
                <Smile className="w-6 h-6 text-[#7D8461] mb-2" />
                <p className="text-[11px] font-sans leading-relaxed text-[#6B6B58]">
                  Breathe in and repeat this sentence in your head. Let your shoulders drop, unclench your jaw, and give yourself grace.
                </p>
              </div>

              <span className="text-[10px] text-[#A39E8F] flex items-center gap-1 font-medium bg-white/70 px-2 py-0.5 rounded-full">
                Tap card to go back <BookOpen className="w-3 h-3 text-[#7D8461]" />
              </span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Draw new button */}
      <div className="w-full mt-4 flex items-center justify-between text-xs">
        <span className="text-[#A39E8F] font-mono font-semibold">Drawn: {drawnTimes} cards</span>
        <button
          onClick={drawNewCard}
          className="flex items-center gap-1.5 bg-white hover:bg-[#EBE9E1] text-[#7D8461] hover:text-[#4A4A3F] font-semibold py-2 px-4 rounded-full border border-[#E0DBCF] shadow-3xs transition-all duration-300 cursor-pointer text-xs"
          id="draw-card-btn"
        >
          Draw Another <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
