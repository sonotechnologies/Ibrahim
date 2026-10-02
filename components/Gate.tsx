"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { config } from "@/config";
import { useExperience } from "@/lib/experience";
import { requestTiltPermission, startTiltListening } from "@/lib/motion";
import { sound } from "@/lib/sound";

const CURTAIN_EASE = [0.76, 0, 0.24, 1] as const;

function Curtain({ side, open }: { side: "left" | "right"; open: boolean }) {
  return (
    <motion.div
      aria-hidden
      className="absolute inset-y-0 w-1/2"
      style={{
        [side]: 0,
        background:
          "repeating-linear-gradient(90deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 22px), linear-gradient(90deg, #121216, var(--c-surface) 50%, #121216)",
        boxShadow: side === "left" ? "inset -1px 0 0 rgba(232,184,74,.22), 12px 0 40px rgba(0,0,0,.6)" : "inset 1px 0 0 rgba(232,184,74,.22), -12px 0 40px rgba(0,0,0,.6)",
      }}
      initial={false}
      animate={{ x: open ? (side === "left" ? "-101%" : "101%") : "0%" }}
      transition={{ duration: 1.25, ease: CURTAIN_EASE }}
    />
  );
}

/** "Tap to start" — the tap unlocks audio and motion sensors, then the curtain opens. */
export default function Gate() {
  const { stage, setStage } = useExperience();
  const [opening, setOpening] = useState(false);
  const [gone, setGone] = useState(false);

  if (gone) return null;

  const start = () => {
    if (opening || stage !== "gate") return;
    sound.unlock();
    void requestTiltPermission().then(startTiltListening);
    sound.whoosh();
    setOpening(true);
    window.setTimeout(() => {
      setStage("live");
      sound.startMusic();
    }, 450);
    window.setTimeout(() => setGone(true), 1400);
  };

  return (
    <div className="fixed inset-0 z-40 overflow-hidden" style={{ pointerEvents: opening ? "none" : "auto" }}>
      <Curtain side="left" open={opening} />
      <Curtain side="right" open={opening} />

      <motion.button
        type="button"
        onClick={start}
        className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-10 px-6 text-center"
        animate={{ opacity: opening ? 0 : stage === "gate" ? 1 : 0, scale: opening ? 0.94 : 1 }}
        initial={{ opacity: 0 }}
        transition={{ duration: opening ? 0.35 : 0.8, ease: "easeOut" }}
        aria-label={`Tap to start, ${config.nickname}`}
      >
        <span className="text-[12px] uppercase tracking-[0.38em] text-gold/80">Something for you</span>

        <span className="relative grid place-items-center">
          <span
            aria-hidden
            className="absolute h-56 w-56 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(232,184,74,.42), rgba(232,184,74,0) 68%)",
              animation: "pulse-glow 3.2s ease-in-out infinite",
            }}
          />
          <span
            aria-hidden
            className="absolute h-36 w-36 rounded-full border border-gold/30"
            style={{ animation: "pulse-glow 3.2s ease-in-out infinite 0.6s" }}
          />
          <span className="relative grid h-24 w-24 place-items-center rounded-full bg-gold text-base shadow-[0_0_60px_rgba(232,184,74,.45)]">
            <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden>
              <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />
            </svg>
          </span>
        </span>

        <span className="flex flex-col items-center gap-3">
          <span className="font-display text-[clamp(30px,8vw,52px)] font-medium italic leading-tight text-cream">
            Tap to start, <span className="font-extrabold not-italic text-gold">{config.nickname}</span>
          </span>
          <span className="flex items-center gap-2 text-sm text-cream/55">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4zM15.5 9a4 4 0 0 1 0 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Sound on makes it better
          </span>
        </span>
      </motion.button>
    </div>
  );
}
