import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import {
  Mail, Phone, Linkedin, Github, MapPin, Briefcase,
  Coffee, Crown, Rocket, ArrowUpRight, Send, HeartHandshake, Compass, Sparkles, Brain,
} from "lucide-react";
import { TEJASWINI, JOURNEY, PROJECTS } from "@/lib/tejaswini";
import { getMemory, getRecollection, getMood, computeMode, remember, bump } from "@/lib/memory";

const API_BASE = import.meta.env.VITE_BACKEND_URL;
const API = API_BASE ? `${API_BASE.replace(/\/$/, "")}/api` : "";

/** Shown immediately; replaced when GET /payments/packages succeeds (matches backend/server.py). */
const DEFAULT_PACKAGES = [
  { id: "tip", amount: 1, currency: "usd", name: "Tip" },
  { id: "create", amount: 25, currency: "usd", name: "Fund something new" },
  { id: "founder", amount: 100, currency: "usd", name: "Founding Supporter" },
];

const TIER_ICONS = { tip: Coffee, create: Rocket, founder: Crown };
const TIER_TITLES = {
  tip: "Tip",
  create: "Fund something new",
  founder: "Founding supporter",
};
const TIER_HINTS = {
  tip: "A small thank-you — buys coffee for late-night builds.",
  create: "Goes toward a prototype, write-up, or scoped experiment. I'll email after checkout to align.",
  founder: "Unlocks the hidden founder page plus a direct line.",
};

function formatUsd(amount) {
  const n = Number(amount);
  if (Number.isNaN(n)) return "—";
  return n % 1 === 0 ? `${n}` : n.toFixed(2);
}

export default function S10_NextChapter() {
  const [email, setEmail] = useState("");
  const [packages, setPackages] = useState(() => [...DEFAULT_PACKAGES]);
  const [loading, setLoading] = useState(null);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (!API) {
      toast.warning("Set VITE_BACKEND_URL in frontend/.env so Stripe checkout can reach your API.", {
        duration: 8000,
      });
      return;
    }
    axios
      .get(`${API}/payments/packages`)
      .then((r) => {
        const list = r.data?.packages;
        if (Array.isArray(list) && list.length) setPackages(list);
      })
      .catch(() => {
        toast.warning(
          "Could not reach the payment API — showing default tiers. Start the backend (e.g. port 8000) for live checkout.",
          { duration: 8000 },
        );
      });
  }, []);

  const donate = async (pkg) => {
    if (!API) {
      toast.error("Backend URL missing. Add VITE_BACKEND_URL to frontend/.env and restart the dev server.");
      return;
    }
    setLoading(pkg);
    try {
      remember({ supported: pkg });
      bump("investor_intent", 3);
      const { data } = await axios.post(`${API}/payments/checkout`, {
        package_id: pkg,
        origin_url: window.location.origin,
      });
      window.location.href = data.url;
    } catch {
      toast.error("Payment session failed. Is the API running and Stripe configured?");
      setLoading(null);
    }
  };

  const subscribe = async (e) => {
    e.preventDefault();
    if (!email.includes("@")) return toast.error("Enter a valid email.");
    if (!API) {
      toast.error("Set VITE_BACKEND_URL and start the API to subscribe.");
      return;
    }
    try {
      await axios.post(`${API}/subscribe`, { email });
      setSubscribed(true);
      toast.success("You're on the mission log.");
    } catch {
      toast.error("Signal lost. Try again.");
    }
  };

  // Easter-egg deep-scroll message
  const eggRef = useRef(null);
  const eggSeen = useInView(eggRef, { margin: "-20%" });
  useEffect(() => {
    if (eggSeen) {
      try {
        if (!localStorage.getItem("uf_felt")) {
          localStorage.setItem("uf_felt", "1");
          remember({ foundEasterEgg: true });
          toast("You didn't just view this. You felt it.", {
            description: "— The Narrator",
            duration: 6000,
          });
        }
      } catch {}
    }
  }, [eggSeen]);

  // ====== MEMORY STATE ======
  const [memory, setMemory] = useState(() => getMemory());
  useEffect(() => {
    const h = (e) => setMemory(e.detail);
    window.addEventListener("uf:memory", h);
    return () => window.removeEventListener("uf:memory", h);
  }, []);
  const recollection = getRecollection(memory);
  const mood = getMood(memory);
  const viewerMode = computeMode(memory);
  const modeCopy = {
    OBSERVER:     { tag: "observer · watching from the edge",    line: "You are observing a system you have not yet entered. Make a move — it's beginning to remember you." },
    INVESTIGATOR: { tag: "investigator · mapping the signal",    line: "You are not outside the system anymore. You are mapping it." },
    BUILDER:      { tag: "builder · reconstruction layer",       line: "Your decisions already altered the architecture. You belong to the rebuild." },
    ALLY:         { tag: "ally · system stabilization layer",    line: "The system recognizes your contribution. Stability increases with your participation." },
  }[viewerMode];
  const moodCopy = modeCopy;

  return (
    <section className="uf-themed relative w-full min-h-screen overflow-visible bg-black text-white" data-testid="scene-next-chapter">
      {/* gold sparkle field */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
              width: Math.random() * 2 + 1, height: Math.random() * 2 + 1,
              background: "#fbbf24", boxShadow: "0 0 8px #fbbf24",
            }}
            animate={{ opacity: [0.1, 1, 0.1] }}
            transition={{ duration: Math.random() * 4 + 3, repeat: Infinity, delay: Math.random() * 3 }}
          />
        ))}
      </div>

      {/* ===== HERO REVEAL ===== */}
      <div className="relative pt-28 pb-16 px-6 flex flex-col items-center text-center">
        <motion.h1
          initial={{ opacity: 0, letterSpacing: "0.35em", y: 20 }}
          animate={{ opacity: 1, letterSpacing: "0.02em", y: 0 }}
          transition={{ duration: 2 }}
          className="font-display text-5xl sm:text-7xl lg:text-[7.5rem] leading-[0.95] text-white text-glow-gold font-light"
        >
          {TEJASWINI.name}
        </motion.h1>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          className="mt-5 font-mono text-xs md:text-sm tracking-[0.3em] text-cyan-300/90"
        >
          {TEJASWINI.roles.join(" · ")}
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}
          className="mt-8 font-display italic text-3xl md:text-5xl text-amber-300 text-glow-gold"
        >
          NOT DISCOVERED. BUILT.
        </motion.div>

        {/* Primary CTAs */}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <a
            data-testid="hire-me-btn"
            href="#schedule-call"
            className="uf-btn-gold group inline-flex items-center gap-2 px-7 py-4 font-mono text-xs tracking-[0.3em] bg-amber-400 text-black hover:bg-amber-300 transition"
            style={{ clipPath: "polygon(6% 0, 100% 0, 94% 100%, 0 100%)" }}
          >
            <Briefcase className="w-4 h-4" /> SCHEDULE · HIRE ME
            <ArrowUpRight className="w-4 h-4 opacity-60 group-hover:translate-x-1 transition" />
          </a>
          <a
            data-testid="connect-btn"
            href={TEJASWINI.linkedin} target="_blank" rel="noreferrer"
            className="uf-btn-cyan inline-flex items-center gap-2 px-7 py-4 font-mono text-xs tracking-[0.3em] text-cyan-200 border border-cyan-400/50 hover:bg-cyan-400/10 transition"
          >
            <Linkedin className="w-4 h-4" /> COLLABORATE
          </a>
          <a
            data-testid="funding-jump"
            href="#funding-stripe"
            className="uf-btn-outline-gold inline-flex items-center gap-2 px-7 py-4 font-mono text-xs tracking-[0.3em] text-amber-300 border border-amber-400/50 hover:bg-amber-400/10 transition"
          >
            <HeartHandshake className="w-4 h-4" /> TIP OR FUND A BUILD
          </a>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-14 max-w-3xl mx-auto text-center space-y-5"
        >
          <p className="text-white/70 text-sm sm:text-base leading-relaxed font-display italic">
            The story ends not with discovery, but realization: stability that felt like luck was design — research, patents, AI models, healthcare intelligence, and startup innovation, once scattered like noise, now read as one system.
          </p>
        </motion.div>
      </div>

      {/* ===== CONTACT STRIP ===== */}
      <div className="px-6 py-8 border-y border-white/10 bg-black/60">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-5 text-sm">
          <a data-testid="contact-email" href={`mailto:${TEJASWINI.email}`} className="inline-flex items-center gap-2 hover:text-amber-300">
            <Mail className="w-4 h-4 text-amber-400" /> {TEJASWINI.email}
          </a>
          <a data-testid="contact-phone" href={`tel:${TEJASWINI.phone}`} className="inline-flex items-center gap-2 hover:text-amber-300">
            <Phone className="w-4 h-4 text-amber-400" /> {TEJASWINI.phone}
          </a>
          <a data-testid="contact-linkedin" href={TEJASWINI.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-amber-300">
            <Linkedin className="w-4 h-4 text-amber-400" /> LinkedIn
          </a>
          <a data-testid="contact-github" href={TEJASWINI.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-amber-300">
            <Github className="w-4 h-4 text-amber-400" /> GitHub
          </a>
          <span className="inline-flex items-center gap-2 text-white/60">
            <MapPin className="w-4 h-4" /> {TEJASWINI.location}
          </span>
        </div>
      </div>

      {/* ===== JOURNEY TIMELINE ===== */}
      <div className="px-6 py-20 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="font-mono text-[10px] tracking-[0.5em] text-cyan-300/80 mb-2">TIMELINE</div>
          <h3 className="font-display text-4xl sm:text-5xl text-white font-light">The Builder's <span className="italic text-amber-300">journey</span></h3>
        </div>
        <div className="relative border-l border-amber-400/30 pl-7 space-y-7">
          {JOURNEY.map((j, i) => (
            <motion.div
              key={j.year}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.08 }}
              data-testid={`journey-${j.year}`}
              className="relative"
            >
              <span className="absolute -left-[34px] top-1.5 w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_14px_#fbbf24]" />
              <div className="font-mono text-xs text-amber-300 tracking-[0.3em]">{j.year}</div>
              <div className="font-display text-2xl text-white">{j.title}</div>
              <div className="text-sm text-white/60 mt-0.5">{j.detail}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ===== PROJECTS GRID ===== */}
      <div className="px-6 py-14 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <div className="font-mono text-[10px] tracking-[0.5em] text-cyan-300/80 mb-2">SIGNATURE WORK</div>
          <h3 className="font-display text-4xl sm:text-5xl text-white font-light">Nine systems, <span className="italic text-amber-300">one builder.</span></h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROJECTS.map((p, i) => (
            <motion.div
              key={p.title}
              data-testid={`project-${p.title.replace(/\s+/g, "-").toLowerCase()}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4, borderColor: "rgba(251,191,36,0.6)" }}
              onHoverStart={() => bump("builder_energy", 1)}
              className="relative border border-amber-400/15 bg-black/60 backdrop-blur-sm p-5"
            >
              <div className="font-mono text-[10px] tracking-[0.3em] text-amber-300/80 mb-2">NODE {String(i + 1).padStart(2, "0")}</div>
              <div className="font-display text-xl text-white mb-0.5">{p.title}</div>
              <div className="font-mono text-[11px] text-cyan-300 mb-2">{p.subtitle}</div>
              <div className="text-sm text-white/70 mb-3 leading-relaxed">{p.desc}</div>
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-amber-300">{p.metric}</span>
                <span className="text-white/40">{p.tag}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ===== PATENTS / PUBS ===== */}
      <div className="px-6 py-12 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "Patent · India", body: "Vitality Monitor — IoT Smart Textile Patient Monitoring" },
            { title: "Patent · India", body: "Parkinson's Disease Detection using XGBoost" },
            { title: "IEEE · USA", body: "Healthcare IoT Innovations — Secure Patient Monitoring" },
          ].map((p, i) => (
            <div key={i} className="uf-card border border-cyan-400/20 bg-black/60 p-5">
              <div className="font-mono text-[10px] tracking-[0.3em] text-cyan-300 mb-2">{p.title.toUpperCase()}</div>
              <div className="font-display text-lg text-white">{p.body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== THE SYSTEM REMEMBERS (state-aware) ===== */}
      {(recollection.length > 0 || (memory.narrative_path && memory.narrative_path.length >= 2)) && (
        <div className="px-6 py-12 max-w-3xl mx-auto" data-testid="memory-panel">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className="uf-card relative border border-amber-400/40 bg-gradient-to-br from-amber-950/40 to-black/70 backdrop-blur-sm p-6 sm:p-7 overflow-hidden"
          >
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
            <div className="flex items-center gap-3 mb-3">
              <Brain className="w-4 h-4 text-amber-300" />
              <span className="font-mono text-[10px] tracking-[0.5em] text-amber-300">
                THE SYSTEM REMEMBERS · {moodCopy.tag.toUpperCase()}
              </span>
            </div>
            <div className="font-display italic text-xl sm:text-2xl text-amber-100 mb-4">
              {moodCopy.line}
            </div>
            <ul className="space-y-1.5 font-mono text-xs text-white/75">
              {recollection.length > 0 ? recollection.map((r, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-amber-400">▸</span>
                  <span>{r}</span>
                </li>
              )) : (
                <li className="flex gap-2">
                  <span className="text-amber-400">▸</span>
                  <span className="italic text-white/50">you have passed through {memory.narrative_path?.length || 0} scenes · the signal is still weak</span>
                </li>
              )}
            </ul>
            <div className="mt-4 text-[10px] font-mono tracking-[0.3em] text-white/40">
              MOOD STATE · {mood.toUpperCase()} · stored locally, yours alone
            </div>
          </motion.div>
        </div>
      )}

      {/* ===== SCHEDULE · CALENDLY EMBED ===== */}
      <div
        id="schedule-call"
        className="relative px-6 py-20 overflow-hidden"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(34,211,238,0.1) 0%, #050505 65%)",
        }}
      >
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="font-mono text-[10px] tracking-[0.55em] text-cyan-300 mb-3">
              30 MIN · FREE · VIDEO CALL
            </div>
            <h3 className="font-display text-4xl sm:text-5xl text-white font-light">
              Book a seat at the <span className="italic text-amber-300">builder's table.</span>
            </h3>
            <p className="mt-3 text-white/60 max-w-xl mx-auto text-sm">
              Hiring, collaborating, or just curious?
              Pick a time below — it goes straight onto Tejaswini's calendar.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
            className="relative rounded-md overflow-hidden border border-amber-400/30 bg-black"
            style={{
              boxShadow: "0 20px 80px rgba(0,0,0,0.7), 0 0 40px rgba(251,191,36,0.15)",
            }}
            data-testid="calendly-embed"
          >
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent z-10" />
            <iframe
              src={`${TEJASWINI.calendly}?hide_event_type_details=1&hide_gdpr_banner=1&primary_color=fbbf24&text_color=f8fafc&background_color=0a0a0a`}
              title="Schedule a 30 min call with Tejaswini Abburi"
              width="100%"
              height="700"
              frameBorder="0"
              className="block"
            />
          </motion.div>

          <div className="mt-5 text-center">
            <a
              href={TEJASWINI.calendly}
              target="_blank"
              rel="noreferrer"
              data-testid="calendly-external"
              className="inline-flex items-center gap-2 px-5 py-2.5 font-mono text-[11px] tracking-[0.3em] text-amber-300 border border-amber-400/40 hover:bg-amber-400/10"
            >
              <Briefcase className="w-3.5 h-3.5" /> OPEN IN CALENDLY
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* ===== STRIPE: TIP + FUND A BUILD ===== */}
      <div
        id="funding-stripe"
        className="relative px-6 py-24 overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(251,191,36,0.15) 0%, #0a0707 60%, #050505 100%)",
        }}
      >
        {/* rising particles for hope effect */}
        {[...Array(25)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-amber-300"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: "-20px",
              width: Math.random() * 2 + 1,
              height: Math.random() * 2 + 1,
              boxShadow: "0 0 8px #fbbf24",
            }}
            animate={{ y: [-20, -900], opacity: [0, 0.9, 0] }}
            transition={{ duration: 10 + Math.random() * 6, repeat: Infinity, delay: Math.random() * 8 }}
          />
        ))}

        <div className="relative max-w-5xl mx-auto">
          <div className="text-center">
            <div className="font-mono text-[10px] tracking-[0.5em] text-amber-300/90 mb-4">
              SUPPORT THE WORK · STRIPE
            </div>
            <h3 className="font-display text-4xl sm:text-6xl text-white font-light leading-tight">
              Leave a <span className="italic text-cyan-300">tip</span>
              {" "}or <span className="italic text-amber-300 text-glow-gold">fund the next build</span>.
            </h3>
            <p className="mt-6 max-w-xl mx-auto text-white/70 leading-relaxed">
              Choose an amount below. Each tier is a <span className="text-white/90">one-time USD</span> payment;
              after checkout, you'll get a receipt from Stripe — for the middle tier I'll reach out by email to
              decide what to ship first.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
            {packages.map((p) => {
              const Icon = TIER_ICONS[p.id] || Rocket;
              const accent = p.id === "founder" ? "amber" : p.id === "tip" ? "cyan" : "amber";
              return (
                <motion.div
                  key={p.id}
                  whileHover={{ y: -8 }}
                  className={`relative border ${p.id === "founder" ? "border-amber-400/50" : "border-amber-400/20"} bg-black/70 backdrop-blur-md p-6 overflow-hidden`}
                >
                  <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                  {p.id === "founder" && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 text-[9px] font-mono tracking-[0.3em] text-amber-300">
                      <Sparkles className="w-3 h-3" /> UNLOCKS HIDDEN PAGE
                    </div>
                  )}
                  <Icon className={`w-7 h-7 ${accent === "cyan" ? "text-cyan-300" : "text-amber-300"} mb-3`} />
                  <div className="font-display text-2xl text-white mb-3">
                    {TIER_TITLES[p.id] || p.name}
                  </div>
                  <div className="flex items-baseline justify-center gap-1.5 mb-1">
                    <span className="font-display text-5xl text-amber-300 text-glow-gold tabular-nums">
                      ${formatUsd(p.amount)}
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.2em] text-white/45">USD</span>
                  </div>
                  <div className="font-mono text-[9px] tracking-[0.25em] text-white/35 mb-4">ONE-TIME</div>
                  <div className="text-xs text-white/60 mb-5 leading-relaxed">{TIER_HINTS[p.id] || ""}</div>
                  <button
                    data-testid={`donate-${p.id}`}
                    disabled={loading === p.id}
                    onClick={() => donate(p.id)}
                    className="w-full py-3 font-mono text-[11px] tracking-[0.3em] bg-amber-400 text-black hover:bg-amber-300 disabled:opacity-40"
                  >
                    {loading === p.id
                      ? "REDIRECTING..."
                      : p.id === "founder"
                        ? "BECOME FOUNDER →"
                        : p.id === "tip"
                          ? "LEAVE A TIP →"
                          : "FUND SOMETHING NEW →"}
                  </button>
                </motion.div>
              );
            })}
          </div>

          <p className="mt-8 text-center font-mono text-[10px] tracking-[0.25em] text-white/40 max-w-lg mx-auto leading-relaxed">
            Secure card checkout powered by Stripe. In test mode, no real charge runs until you use test cards
            in the Stripe dashboard.
          </p>
        </div>
      </div>

      {/* ===== MISSION UPDATES ===== */}
      <div className="px-6 py-16 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <div className="font-mono text-[10px] tracking-[0.5em] text-cyan-300/80 mb-3">MISSION UPDATES</div>
          <h3 className="font-display text-3xl text-white font-light">Stay on the <span className="italic text-amber-300">signal.</span></h3>
          <form onSubmit={subscribe} className="mt-5 flex flex-col sm:flex-row items-center gap-3">
            <input
              data-testid="subscribe-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.signal@email.com"
              className="flex-1 w-full bg-black/60 border border-white/10 rounded px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-400/60 font-mono"
            />
            <button
              data-testid="subscribe-btn"
              type="submit"
              className="px-6 py-3 font-mono text-xs tracking-[0.3em] bg-amber-400 text-black hover:bg-amber-300 inline-flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              {subscribed ? "SUBSCRIBED" : "UPDATES"}
            </button>
          </form>
        </div>
      </div>

      {/* ===== EASTER EGG (triggers on deep scroll) ===== */}
      <div ref={eggRef} className="px-6 py-24 text-center" data-testid="easter-egg">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 2 }}
          className="font-display italic text-2xl sm:text-4xl text-amber-200/80"
        >
          You didn't just view this.
          <br />
          <span className="text-amber-300 text-glow-gold">You felt it.</span>
        </motion.div>
      </div>

      <div className="pb-10 text-center font-mono text-[10px] tracking-[0.5em] text-white/25">
        END OF TRANSMISSION · 2026
      </div>
    </section>
  );
}
