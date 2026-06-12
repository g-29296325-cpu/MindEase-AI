import { useState, useRef, useEffect, useTransition } from "react";
import { Send, Sparkles, MessageCircleCode, Bot, RefreshCw, AlertTriangle, HelpCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CHIPS = [
  "I'm feeling really stressed out right now.",
  "Guide me through a quick grounding breath.",
  "What is the 5-4-3-2-1 technique?",
  "Give me a positive reminder to help me cope.",
  "Can you help me think of something to appreciate?",
];

export default function ChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am **MindEase AI**, your pocket grounding friend. 🌸\n\nI am here to support you when school, exams, friends, or family feel a bit overwhelming. We can practice simple grounding exercises together, write positive assertions, or just focus on breathing.\n\nHow are you feeling right now? Select a prompt below or type your own feeling.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const [errorText, setErrorText] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to lowest point of conversation when messages update
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, isPending]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isPending) return;

    setErrorText(null);
    const updatedMessages = [...messages, { role: "user" as const, content: text }];
    setMessages(updatedMessages);
    setInputValue("");

    startTransition(async () => {
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: updatedMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (!response.ok) {
          const body = await response.json();
          throw new Error(body.error || "Failed to contact the helper assistant.");
        }

        const data = await response.json();
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } catch (err: any) {
        console.error("API error", err);
        setErrorText(
          err.message || "Something went wrong. Please check your internet connection or secrets setup."
        );
      }
    });
  };

  const clearConversation = () => {
    setMessages([
      {
        role: "assistant",
        content: "Resetting our conversation. Let's start fresh. ❤️\n\nI am right here to help you slow down. What's on your mind?",
      },
    ]);
    setErrorText(null);
  };

  return (
    <div className="bg-white border border-[#E0DBCF] rounded-[28px] flex flex-col h-full min-h-[500px]" id="mindease-chat-container">
      {/* Chat Title bar */}
      <div className="p-4 border-b border-[#E0DBCF]/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <span className="p-2 bg-[#EBE9E1] rounded-full text-[#7D8461] block">
              <Bot className="w-5 h-5 animate-pulse" />
            </span>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#7D8461] rounded-full border border-white" title="Virtual counselor online" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-[#2C2C24] text-sm">MindEase AI</h3>
            <p className="text-[10px] text-[#A39E8F] font-semibold tracking-wider">Grounding & Comfort Companion</p>
          </div>
        </div>

        <button
          onClick={clearConversation}
          title="Clear whole chat log"
          className="p-2 text-[#A39E8F] hover:text-[#7D8461] rounded-full hover:bg-[#EBE9E1]/30 transition-all cursor-pointer"
          id="clear-chat-btn"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={containerRef} id="chat-messages-viewport">
        <AnimatePresence initial={false}>
          {messages.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex items-start gap-2.5 ${item.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Profile emblem */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border text-[10px] uppercase font-bold select-none ${
                  item.role === "user"
                    ? "bg-[#EBE9E1] border-[#E0DBCF] text-[#4A4A3F]"
                    : "bg-[#7D8461]/15 border-[#7D8461]/35 text-[#7D8461]"
                }`}
              >
                {item.role === "user" ? "YOU" : "AI"}
              </div>

              {/* Message text bubble */}
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-2xs relative ${
                  item.role === "user"
                    ? "bg-[#7D8461] text-white rounded-tr-xs"
                    : "bg-[#F5F5F0]/60 border border-[#E0DBCF]/80 text-[#2C2C24] rounded-tl-xs"
                }`}
              >
                {item.role === "user" ? (
                  <p className="whitespace-pre-line">{item.content}</p>
                ) : (
                  <div className="markdown-body prose max-w-none text-[#2C2C24] space-y-1.5 leading-relaxed">
                    <ReactMarkdown>{item.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {/* Pending Typing animation */}
          {isPending && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5"
              key="mindease-typing-key"
            >
              <div className="w-7 h-7 rounded-full bg-[#7D8461]/15 border border-[#7D8461]/35 text-[#7D8461] flex items-center justify-center shrink-0 font-bold text-[10px]">
                AI
              </div>
              <div className="bg-[#F5F5F0]/60 border border-[#E0DBCF]/80 rounded-2xl pl-4 pr-5 py-3 relative shadow-2xs rounded-tl-none">
                <div className="flex gap-1.5 items-center justify-center h-4 py-0.5">
                  <span className="w-1.5 h-1.5 bg-[#7D8461] rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-[#7D8461] rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-[#7D8461] rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Error Banner */}
          {errorText && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-rose-50 border border-rose-200 p-3 rounded-xl flex gap-2 items-start"
              key="mindease-error-key"
            >
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-stone-800">Connection Interrupted</h4>
                <p className="text-[10px] text-stone-600 mt-0.5">{errorText}</p>
                <button
                  onClick={() => handleSendMessage(messages[messages.length - 1]?.content || "")}
                  className="text-[10px] text-[#7D8461] hover:underline font-bold mt-1 bg-white border border-[#E0DBCF] p-1 px-2.5 rounded-lg inline-block"
                  id="retry-chat-btn"
                >
                  Retry Message
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick-Tap Prompt Chips */}
      <div className="px-4 py-2.5 bg-[#F5F5F0]/40 border-t border-[#E0DBCF]/50 flex gap-1.5 overflow-x-auto select-none no-scrollbar">
        {CHIPS.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip)}
            disabled={isPending}
            className="shrink-0 bg-white hover:bg-[#EBE9E1] active:scale-95 disabled:opacity-55 text-[10px] font-sans font-semibold text-[#6B6B58] hover:text-[#2C2C24] px-3.5 py-1.5 rounded-full border border-[#E0DBCF]/80 transition-all duration-300 cursor-pointer"
            id={`chip-prompt-${idx}`}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Message panel */}
      <div className="p-4 border-t border-[#E0DBCF]/60 bg-[#F5F5F0]/20">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputValue);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isPending}
            placeholder={isPending ? "Reflecting calmly..." : "How are you feeling right now?"}
            className="flex-1 bg-white border border-[#E0DBCF] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#7D8461] placeholder-[#A39E8F] text-[#2C2C24] disabled:bg-[#FAF9F5]"
            id="chat-text-input"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isPending}
            className={`p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center ${
              inputValue.trim() && !isPending
                ? "bg-[#7D8461] text-white hover:bg-[#6B6B58] shadow-3xs cursor-pointer"
                : "bg-[#EBE9E1]/50 text-[#A39E8F] cursor-not-allowed"
            }`}
            id="send-chat-btn"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-[#A39E8F] text-center mt-2.5 font-medium">
          MindEase offers supportive grounding, not clinical medical care. Always share deep struggles with adults who love you.
        </p>
      </div>
    </div>
  );
}
