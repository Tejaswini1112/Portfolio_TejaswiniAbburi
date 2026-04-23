import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, Sparkles, Mail, ArrowLeft } from "lucide-react";
import { TEJASWINI } from "@/lib/tejaswini";

export default function Founder() {
  return (
    <div className="min-h-screen w-full bg-black text-white relative overflow-hidden" data-testid="founder-page">
      {/* gold particle field */}
      {[...Array(40)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: Math.random() * 2 + 1,
            height: Math.random() * 2 + 1,
            background: "#fbbf24",
            boxShadow: "0 0 8px #fbbf24",
          }}
          animate={{ opacity: [0.1, 1, 0.1] }}
          transition={{ duration: Math.random() * 4 + 3, repeat: Infinity, delay: Math.random() * 3 }}
        />
      ))}

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-24">
        <Link
          to="/"
          data-testid="founder-back"
          className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.3em] text-white/60 hover:text-amber-300 mb-10"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> RETURN TO MISSION
        </Link>

        <div className="flex items-center gap-3 text-amber-300 mb-5">
          <Crown className="w-6 h-6" />
          <span className="font-mono text-[10px] tracking-[0.55em]">FOUNDING SUPPORTER · CLASSIFIED</span>
        </div>

        <motion.h1
          initial={{ opacity: 0, letterSpacing: "0.25em" }}
          animate={{ opacity: 1, letterSpacing: "0.02em" }}
          transition={{ duration: 1.6 }}
          className="font-display text-5xl sm:text-6xl lg:text-7xl text-white font-light leading-[1.02]"
        >
          Welcome, <span className="italic text-amber-300 text-glow-gold">founding believer.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="mt-8 text-white/70 text-lg leading-relaxed"
        >
          Most people will find Tejaswini after the systems ship and the news cycles catch up.
          <br /><br />
          You found her first.
          <br /><br />
          This page is a quiet handshake — proof that the builder knows her earliest believers by name.
          The things below are not on the résumé. They are the spark.
        </motion.p>

        <div className="mt-12 border border-amber-400/30 bg-black/60 p-6 backdrop-blur-sm">
          <div className="font-mono text-[10px] tracking-[0.4em] text-amber-300 mb-3 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" /> WHAT'S BREWING · CLASSIFIED
          </div>
          <ul className="space-y-3 text-white/85">
            <li className="flex gap-3">
              <span className="text-amber-300 font-mono text-xs mt-1">001</span>
              <span><span className="text-amber-200 font-display italic">Blind Game</span> — a short-form book about the movers you never see. Manuscript in progress.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-amber-300 font-mono text-xs mt-1">002</span>
              <span>A healthcare-IoT product line extending the Vitality Monitor patent into post-op home-care.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-amber-300 font-mono text-xs mt-1">003</span>
              <span>A passive mental-health index (thesis-derived) — bringing 0.985 AUROC signals to primary care.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-amber-300 font-mono text-xs mt-1">004</span>
              <span>A Carnatic-inflected audio meditation layer for clinical anxiety — because the builder also plays violin.</span>
            </li>
          </ul>
        </div>

        <div className="mt-10 p-6 border border-cyan-400/30 bg-cyan-950/20">
          <div className="font-mono text-[10px] tracking-[0.4em] text-cyan-300 mb-2">DIRECT LINE</div>
          <p className="text-white/80">
            Reply to your Stripe receipt, or write directly. Founding supporters get a personal response within 48 hours.
          </p>
          <a
            href={`mailto:${TEJASWINI.email}?subject=Founding%20Supporter%20-%20The%20Unseen%20Force`}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-amber-400 text-black font-mono text-xs tracking-[0.3em] hover:bg-amber-300"
            data-testid="founder-reply"
          >
            <Mail className="w-4 h-4" /> REPLY TO THE BUILDER
          </a>
        </div>

        <div className="mt-14 font-display italic text-2xl text-white/60 text-center">
          "Some things need believers before they become real."
        </div>
        <div className="mt-10 text-center font-mono text-[10px] tracking-[0.5em] text-white/25">
          THIS PAGE IS NOT LINKED · YOU EARNED IT · NOT DISCOVERED. BUILT. · 2026
        </div>
      </div>
    </div>
  );
}
