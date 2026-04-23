import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Crown } from "lucide-react";

const API = `${import.meta.env.VITE_BACKEND_URL}/api`;
const MAX = 6;
const INTERVAL = 2000;

export default function Success() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [status, setStatus] = useState("checking");
  const [amount, setAmount] = useState(null);
  const [pkg, setPkg] = useState(null);

  useEffect(() => {
    if (!sessionId) { setStatus("no_session"); return; }
    let attempts = 0;
    let timer;
    const poll = async () => {
      try {
        const { data } = await axios.get(`${API}/payments/status/${sessionId}`);
        if (data.payment_status === "paid") {
          setStatus("paid");
          setAmount(data.amount_total);
          setPkg(data.metadata?.package_id);
          if (data.metadata?.package_id === "founder") {
            try { localStorage.setItem("uf_founder", "1"); } catch {}
          }
          return;
        }
        if (data.status === "expired") { setStatus("expired"); return; }
        attempts += 1;
        if (attempts >= MAX) { setStatus("timeout"); return; }
        timer = setTimeout(poll, INTERVAL);
      } catch {
        setStatus("error");
      }
    };
    poll();
    return () => timer && clearTimeout(timer);
  }, [sessionId]);

  const isFounder = pkg === "founder";
  const isCreate = pkg === "create";
  const isTip = pkg === "tip";

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`max-w-lg w-full border ${isFounder ? "border-amber-400/60" : "border-amber-400/30"} bg-black/80 p-8 text-center relative overflow-hidden`}
        data-testid="success-card"
      >
        {isFounder && (
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
        )}
        <div className="font-mono text-[11px] tracking-[0.5em] text-amber-300 mb-4">
          {isFounder
            ? "FOUNDING SUPPORTER CONFIRMED"
            : isCreate
              ? "BUILD FUND CONFIRMED"
              : isTip
                ? "TIP RECEIVED"
                : "MISSION TRANSACTION"}
        </div>
        {status === "checking" && <div className="font-display text-3xl text-white">Decoding your signal<span className="animate-pulse">...</span></div>}
        {status === "paid" && (
          <>
            {isFounder ? (
              <Crown className="w-14 h-14 text-amber-300 mx-auto mb-3 text-glow-gold" />
            ) : null}
            <div className="font-display text-4xl text-amber-300 text-glow-gold">
              {isFounder
                ? "Welcome, founder."
                : isCreate
                  ? "Build fund received."
                  : isTip
                    ? "Thanks for the tip."
                    : "Signal received."}
            </div>
            <p className="text-white/70 mt-3 text-sm font-mono">
              ${(amount / 100).toFixed(2)} · test mode.{" "}
              {isFounder ? "Hidden page unlocked." : isCreate ? "Check your email to line up the work." : "Thank you."}
            </p>
            <p className="font-display italic text-2xl text-white/90 mt-6">
              {isFounder
                ? "You found her before the news cycle did."
                : isCreate
                  ? "We'll shape what to build next together."
                  : isTip
                    ? "Small gestures keep the lights on."
                    : "The mission continues because of you."}
            </p>
            {isFounder && (
              <Link
                to="/founder"
                data-testid="open-founder"
                className="inline-block mt-6 px-6 py-3 font-mono text-xs tracking-[0.3em] bg-amber-400 text-black hover:bg-amber-300"
              >
                OPEN HIDDEN PAGE →
              </Link>
            )}
          </>
        )}
        {status === "expired" && <div className="font-display text-3xl text-red-400">Session expired.</div>}
        {status === "timeout" && <div className="font-display text-2xl text-white/80">Still processing — check your email.</div>}
        {status === "error" && <div className="font-display text-3xl text-red-400">Signal lost. Try again.</div>}
        {status === "no_session" && <div className="font-display text-3xl text-white/80">No session.</div>}
        <Link
          to="/"
          data-testid="back-home"
          className="inline-block mt-6 px-6 py-3 font-mono text-xs tracking-[0.3em] border border-cyan-400 text-cyan-300 hover:bg-cyan-400 hover:text-black"
        >
          ← RETURN TO MISSION
        </Link>
      </motion.div>
    </div>
  );
}
