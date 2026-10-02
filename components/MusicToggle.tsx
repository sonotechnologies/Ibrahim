"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useExperience } from "@/lib/experience";
import Magnetic from "./Magnetic";

export default function MusicToggle() {
  const { stage, musicOn, toggleMusic } = useExperience();
  return (
    <AnimatePresence>
      {stage === "live" && (
        <motion.div
          className="fixed right-[max(12px,env(safe-area-inset-right))] top-[max(12px,env(safe-area-inset-top))] z-30"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.6, type: "spring", stiffness: 260, damping: 18 }}
        >
          <Magnetic>
            <button
              type="button"
              onClick={toggleMusic}
              aria-label={musicOn ? "Mute music" : "Play music"}
              aria-pressed={musicOn}
              className={`grid h-12 w-12 place-items-center rounded-full border backdrop-blur-md ${
                musicOn ? "border-gold bg-gold text-base" : "border-gold/40 bg-base/70 text-gold"
              }`}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M9 18V6l10-2v12" />
                <circle cx="6.5" cy="18" r="2.5" fill="currentColor" />
                <circle cx="16.5" cy="16" r="2.5" fill="currentColor" />
                {!musicOn && <path d="M3 3l18 18" />}
              </svg>
              {musicOn && (
                <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full border border-gold" style={{ animation: "pulse-glow 2.4s ease-in-out infinite" }} />
              )}
            </button>
          </Magnetic>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
