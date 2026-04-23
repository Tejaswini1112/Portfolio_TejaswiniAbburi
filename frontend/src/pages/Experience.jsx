import { useEffect, useState } from "react";
import { Film } from "lucide-react";
import ChatButton from "@/components/ChatButton";
import IntroVideo from "@/components/IntroVideo";
import S10_NextChapter from "@/components/scenes/S10_NextChapter";
import { setMode } from "@/lib/memory";

export default function Experience() {
  const [introDone, setIntroDone] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      const skip = new URL(window.location.href).searchParams.get("skipIntro") === "1";
      return skip || localStorage.getItem("uf_intro_seen") === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    let theme = "dark";
    try {
      const t = localStorage.getItem("uf_theme");
      if (t === "light" || t === "dark") theme = t;
      localStorage.setItem("uf_theme", theme);
    } catch {}
    document.documentElement.setAttribute("data-uf-theme", theme);
    setMode(theme);
  }, []);

  const replayIntro = () => {
    try { localStorage.removeItem("uf_intro_seen"); } catch {}
    setIntroDone(false);
  };

  return (
    <div
      className="relative w-full min-h-screen bg-black uf-themed"
      data-testid="cinematic-player"
    >
      {!introDone && <IntroVideo onFinish={() => setIntroDone(true)} />}

      {introDone && (
        <>
          <S10_NextChapter />
          <button
            data-testid="replay-intro"
            onClick={replayIntro}
            title="Replay opening sequence"
            className="fixed bottom-5 left-5 z-40 inline-flex items-center gap-2 px-3 py-2 bg-black/70 backdrop-blur-md border border-white/10 hover:border-amber-400/60 transition font-mono text-[10px] tracking-[0.3em] text-white/70 hover:text-amber-300"
          >
            <Film className="w-3.5 h-3.5" />
            REPLAY INTRO
          </button>
          <ChatButton />
        </>
      )}
    </div>
  );
}
