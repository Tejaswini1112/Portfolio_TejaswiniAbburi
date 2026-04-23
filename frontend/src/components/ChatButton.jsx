import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, MessageSquare } from "lucide-react";
import axios from "axios";
import { bump, getStateSnapshot } from "@/lib/memory";

const API = `${import.meta.env.VITE_BACKEND_URL}/api`;

const sid = () => {
  let s = localStorage.getItem("uf_sid");
  if (!s) {
    s = `uf-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`;
    localStorage.setItem("uf_sid", s);
  }
  return s;
};

const STARTERS = [
  "Who is she?",
  "What has she built?",
  "Why does this matter?",
  "Tell me a secret.",
];

const WELCOME = {
  role: "assistant",
  text: "Signal open. Ask the Narrator anything — about her work, her patents, her music, or the secret she hasn't told anyone yet.",
};

export default function ChatButton() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const loadedRef = useRef(false);

  // Load chat history on mount — keeps conversation across refreshes
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    axios
      .get(`${API}/chat/history/${sid()}`)
      .then((r) => {
        const msgs = (r.data?.messages || []).map((m) => ({
          role: m.role,
          text: m.text,
        }));
        if (msgs.length) setMessages(msgs);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  const send = async (textOverride) => {
    const text = (textOverride ?? input).trim();
    if (!text || loading) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/chat`, {
        session_id: sid(),
        message: text,
        memory: getStateSnapshot(),
      });
      setMessages((m) => [...m, { role: "assistant", text: data.reply }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: "Signal lost. The Narrator is reconstructing…",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Subtle corner button — NOT an orb */}
      <button
        data-testid="chat-open-btn"
        onClick={() => {
          setOpen(true);
          bump("chatOpened");
          window.dispatchEvent(new CustomEvent("uf:chat", { detail: { open: true } }));
        }}
        className="fixed bottom-6 right-6 z-[60] group inline-flex items-center gap-2 px-4 py-2.5 bg-black/70 backdrop-blur-md border border-cyan-400/40 hover:border-amber-400/60 hover:bg-black/85 transition font-mono text-[11px] tracking-[0.25em] text-cyan-200 hover:text-amber-300"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        ASK THE FORCE
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setOpen(false);
                window.dispatchEvent(new CustomEvent("uf:chat", { detail: { open: false } }));
              }}
              className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="fixed z-[80] inset-x-4 bottom-4 sm:inset-auto sm:bottom-10 sm:right-10 sm:w-[440px] h-[70vh] sm:h-[600px] rounded-md overflow-hidden flex flex-col"
              style={{
                background:
                  "linear-gradient(180deg, rgba(5,5,5,0.98), rgba(10,10,10,0.99))",
                border: "1px solid rgba(34,211,238,0.3)",
                boxShadow:
                  "0 20px 80px rgba(0,0,0,0.9), 0 0 60px rgba(34,211,238,0.12)",
              }}
              data-testid="chat-panel"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 font-mono text-xs tracking-[0.25em]">
                <div className="flex items-center gap-2 text-cyan-300">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  NARRATOR // CLAUDE 4.5
                </div>
                <button
                  data-testid="chat-close"
                  onClick={() => {
                    setOpen(false);
                    window.dispatchEvent(new CustomEvent("uf:chat", { detail: { open: false } }));
                  }}
                  className="text-white/50 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
              >
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`max-w-[85%] text-sm leading-relaxed ${
                      m.role === "user"
                        ? "ml-auto bg-amber-400/10 border border-amber-400/30 text-amber-100 px-3 py-2 rounded-lg"
                        : "bg-white/5 border border-white/10 text-white/90 px-3 py-2 rounded-lg"
                    }`}
                  >
                    {m.text}
                  </div>
                ))}
                {loading && (
                  <div className="bg-white/5 border border-white/10 px-3 py-2 rounded-lg text-sm font-mono text-cyan-300/80 w-fit">
                    decoding<span className="animate-pulse">...</span>
                  </div>
                )}
              </div>

              {messages.length <= 1 && (
                <div className="px-4 pb-2 flex flex-wrap gap-2">
                  {STARTERS.map((s) => (
                    <button
                      key={s}
                      data-testid={`starter-${s.replace(/\s+/g, "-").toLowerCase()}`}
                      onClick={() => send(s)}
                      className="text-xs font-mono px-2 py-1 rounded border border-cyan-400/30 text-cyan-200 hover:bg-cyan-400/10 transition"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <div className="border-t border-white/5 p-3 flex gap-2">
                <input
                  data-testid="chat-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Ask the Narrator..."
                  className="flex-1 bg-black/60 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50"
                />
                <button
                  data-testid="chat-send"
                  onClick={() => send()}
                  disabled={loading}
                  className="w-10 h-10 rounded bg-amber-400 text-black flex items-center justify-center hover:bg-amber-300 disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
