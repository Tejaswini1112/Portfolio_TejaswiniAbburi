import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Volume2, VolumeX, SkipForward } from "lucide-react";

const SRC = "/story-intro.mp4";

export default function IntroVideo({ onFinish }) {
  const videoRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const handleTime = () => {
      if (!v.duration || Number.isNaN(v.duration)) return;
      setProgress(v.currentTime / v.duration);
    };
    v.addEventListener("timeupdate", handleTime);
    return () => v.removeEventListener("timeupdate", handleTime);
  }, []);

  const begin = async () => {
    setStarted(true);
    const v = videoRef.current;
    if (!v) return;
    try {
      await v.play();
    } catch {
      // Browsers may still block with sound on first click — retry muted.
      v.muted = true;
      setMuted(true);
      try { await v.play(); } catch {}
    }
  };

  const beginMuted = async () => {
    setMuted(true);
    setStarted(true);
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    try { await v.play(); } catch {}
  };

  const finish = () => {
    if (exiting) return;
    setExiting(true);
    try { localStorage.setItem("uf_intro_seen", "1"); } catch {}
    setTimeout(() => onFinish?.(), 600);
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    const next = !muted;
    v.muted = next;
    setMuted(next);
  };

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="intro-video"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[120] bg-black flex items-center justify-center"
          data-testid="intro-video"
        >
          <video
            ref={videoRef}
            src={SRC}
            muted={muted}
            playsInline
            preload="auto"
            onEnded={finish}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              started ? "opacity-100" : "opacity-40"
            }`}
          />

          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0.1)_0%,_rgba(0,0,0,0.75)_100%)]" />

          {!started && (
            <div className="relative text-center px-6">
              <div className="font-mono text-[10px] tracking-[0.6em] text-cyan-400/80 mb-5">
                // OPENING SEQUENCE
              </div>
              <h1 className="font-display text-4xl sm:text-6xl text-white font-light leading-[1.05]">
                <span className="block text-white/90">before the portfolio,</span>
                <span className="block italic text-amber-300 text-glow-gold mt-2">
                  the story.
                </span>
              </h1>
              <p className="mt-6 text-white/60 text-sm max-w-md mx-auto">
                Short cinematic reel — about 45 seconds.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  data-testid="intro-play"
                  onClick={begin}
                  className="inline-flex items-center gap-3 px-8 py-4 font-mono text-xs tracking-[0.35em] text-black bg-amber-400 hover:bg-amber-300 transition"
                  style={{ clipPath: "polygon(8% 0, 100% 0, 92% 100%, 0 100%)" }}
                >
                  <Play className="w-4 h-4" />
                  PLAY WITH SOUND
                </button>
                <button
                  data-testid="intro-muted"
                  onClick={beginMuted}
                  className="px-6 py-4 font-mono text-xs tracking-[0.3em] text-white/70 border border-white/15 hover:border-cyan-400/50 hover:text-white transition"
                >
                  PLAY MUTED
                </button>
                <button
                  data-testid="intro-skip"
                  onClick={finish}
                  className="px-6 py-4 font-mono text-xs tracking-[0.3em] text-white/50 hover:text-amber-300 transition inline-flex items-center gap-2"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  SKIP INTRO
                </button>
              </div>
            </div>
          )}

          {started && (
            <>
              <div className="absolute top-0 left-0 right-0 z-10 h-[2px] bg-white/10">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-amber-400 transition-[width] duration-150"
                  style={{ width: `${Math.min(100, progress * 100)}%` }}
                />
              </div>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10">
                <button
                  data-testid="intro-mute"
                  onClick={toggleMute}
                  title={muted ? "Unmute" : "Mute"}
                  className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-full transition"
                >
                  {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <div className="w-px h-4 bg-white/15 mx-1" />
                <button
                  data-testid="intro-skip-in-player"
                  onClick={finish}
                  className="inline-flex items-center gap-2 px-3 h-8 font-mono text-[10px] tracking-[0.3em] text-white/70 hover:text-amber-300 transition"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  SKIP TO PORTFOLIO
                </button>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
