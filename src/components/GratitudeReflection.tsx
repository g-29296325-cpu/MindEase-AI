import { useState, useEffect } from "react";
import { Heart, Plus, Trash2, Calendar, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface GratitudeItem {
  id: string;
  date: string;
  items: string[];
}

export default function GratitudeReflection() {
  const [gratitude1, setGratitude1] = useState("");
  const [gratitude2, setGratitude2] = useState("");
  const [gratitude3, setGratitude3] = useState("");
  const [journal, setJournal] = useState<GratitudeItem[]>([]);
  const [showSavedNotification, setShowSavedNotification] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("mindease_gratitude_journal");
    if (saved) {
      try {
        setJournal(JSON.parse(saved));
      } catch (e) {
        console.error("Invalid gratitude storage format", e);
      }
    }
  }, []);

  const saveJournal = (updated: GratitudeItem[]) => {
    localStorage.setItem("mindease_gratitude_journal", JSON.stringify(updated));
    setJournal(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gratitude1.trim() || !gratitude2.trim() || !gratitude3.trim()) return;

    const newItem: GratitudeItem = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      items: [gratitude1.trim(), gratitude2.trim(), gratitude3.trim()],
    };

    const updated = [newItem, ...journal];
    saveJournal(updated);

    // Reset inputs
    setGratitude1("");
    setGratitude2("");
    setGratitude3("");

    setShowSavedNotification(true);
    setTimeout(() => {
      setShowSavedNotification(false);
    }, 3000);
  };

  const handleDelete = (id: string) => {
    const updated = journal.filter((item) => item.id !== id);
    saveJournal(updated);
  };

  return (
    <div className="bg-white border border-[#E0DBCF] rounded-[28px] p-6 shadow-sm flex flex-col justify-between h-full min-h-[420px]" id="gratitude-reflection-card">
      <div className="w-full flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <span className="p-2 bg-[#EBE9E1] rounded-full text-[#7D8461]">
            <Heart className="w-4 h-4 fill-[#7D8461]/20" />
          </span>
          <h3 className="font-serif font-semibold text-[#2C2C24] text-base">Gratitude Garden</h3>
        </div>
        <p className="text-xs text-[#6B6B58] leading-relaxed mb-4">
          Finding small spark-points of joy helps direct our attention to goodness. Name three things you appreciate today, big or small!
        </p>

        {/* Input Form */}
        <form onSubmit={handleSave} className="space-y-2.5 mb-5">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#7D8461] bg-[#EBE9E1] px-1.5 py-0.5 rounded-md">1</span>
            <input
              type="text"
              required
              value={gratitude1}
              onChange={(e) => setGratitude1(e.target.value)}
              placeholder="e.g., The warm sun, a funny meme, talking to my friend..."
              className="w-full text-xs bg-[#F5F5F0]/20 border border-[#E0DBCF] rounded-xl pl-9 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#7D8461] text-[#4A4A3F] placeholder-[#A39E8F]"
              id="gratitude-input-1"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#7D8461] bg-[#EBE9E1] px-1.5 py-0.5 rounded-md">2</span>
            <input
              type="text"
              required
              value={gratitude2}
              onChange={(e) => setHydratedValue(e.target.value, setGratitude2)}
              placeholder="e.g., Lunch was tasty, got to class on time..."
              className="w-full text-xs bg-[#F5F5F0]/20 border border-[#E0DBCF] rounded-xl pl-9 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#7D8461] text-[#4A4A3F] placeholder-[#A39E8F]"
              id="gratitude-input-2"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#7D8461] bg-[#EBE9E1] px-1.5 py-0.5 rounded-md">3</span>
            <input
              type="text"
              required
              value={gratitude3}
              onChange={(e) => setHydratedValue(e.target.value, setGratitude3)}
              placeholder="e.g., My cat purring, finish doing my English draft..."
              className="w-full text-xs bg-[#F5F5F0]/20 border border-[#E0DBCF] rounded-xl pl-9 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#7D8461] text-[#4A4A3F] placeholder-[#A39E8F]"
              id="gratitude-input-3"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <AnimatePresence>
              {showSavedNotification ? (
                <motion.span
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-[10px] text-[#7D8461] font-semibold flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-[#7D8461]" /> Planted in your Gratitude Garden!
                </motion.span>
              ) : (
                <span />
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={!gratitude1.trim() || !gratitude2.trim() || !gratitude3.trim()}
              className={`flex items-center gap-1.5 text-xs py-2 px-4 rounded-full font-semibold uppercase tracking-wider transition-all duration-300 ${
                gratitude1.trim() && gratitude2.trim() && gratitude3.trim()
                  ? "bg-[#7D8461] hover:bg-[#6B6B58] text-white shadow-3xs cursor-pointer"
                  : "bg-[#EBE9E1] text-[#A39E8F] cursor-not-allowed"
              }`}
              id="save-gratitude-btn"
            >
              <Plus className="w-3.5 h-3.5" /> Plant Seeds
            </button>
          </div>
        </form>

        {/* History Box */}
        <div className="flex-1 flex flex-col">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#A39E8F] mb-2.5 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-[#7D8461]" /> Your Gratitude History
          </h4>

          {journal.length === 0 ? (
            <div className="flex-1 border border-dashed border-[#E0DBCF] rounded-[18px] flex flex-col items-center justify-center p-4 text-center bg-[#FAF9F5]/40">
              <p className="text-xs text-[#A39E8F] leading-relaxed max-w-[220px]">
                Your gratitude garden is quiet. Write 3 things above to plant your first seeds!
              </p>
            </div>
          ) : (
            <div className="flex-1 max-h-[140px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              <AnimatePresence>
                {journal.map((reflection) => (
                  <motion.div
                    key={reflection.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-[#F5F5F0]/60 border border-[#E0DBCF]/80 rounded-2xl p-3 shadow-2xs relative group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-semibold text-[#A39E8F] flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#7D8461]" /> {reflection.date}
                      </span>
                      <button
                        onClick={() => handleDelete(reflection.id)}
                        className="text-stone-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 cursor-pointer"
                        title="Delete entry"
                        id={`delete-gratitude-${reflection.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <ul className="space-y-1">
                      {reflection.items.map((item, index) => (
                        <li key={index} className="text-[#4A4A3F] text-xs flex items-start gap-1.5 leading-snug">
                          <span className="text-[#7D8461] text-[10px] mt-0.5 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Utility helper to bind the values cleanly
function setHydratedValue(value: string, setter: React.Dispatch<React.SetStateAction<string>>) {
  setter(value);
}
