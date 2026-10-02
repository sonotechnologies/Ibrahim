"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useExperience } from "@/lib/experience";

export default function MusicToggle() {
  const { stage, soundOn, toggleSound } = useExperience();
  return (
    <AnimatePresence>
      {stage === "live" && (
        <motion.button
          type="button"
          onClick={toggleSound}
          aria-label={soundOn ? "Turn sound off" : "Turn sound on"}
          aria-pressed={soundOn}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.6, type: "spring", stiffness: 260, damping: 18 }}
          className="fixed right-[max(12px,env(safe-area-inset-right))] top-[max(12px,env(safe-area-inset-top))] z-30 grid h-11 w-11 place-items-center rounded-full border border-gold/40 bg-base/70 text-gold backdrop-blur-md transition-colors hover:bg-gold hover:text-base"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" fillOpacity="0.15" />
            {soundOn ? (
              <>
                <motion.path d="M15.5 9a4 4 0 0 1 0 6" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.6, repeat: Infinity }} />
                <motion.path d="M18 6.5a7.5 7.5 0 0 1 0 11" animate={{ opacity: [0.3, 0.9, 0.3] }} transition={{ duration: 1.6, repeat: Infinity, delay: 0.3 }} />
              </>
            ) : (
              <path d="M16 9.5l5 5m0-5l-5 5" />
            )}
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
