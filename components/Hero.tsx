"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { config } from "@/config";
import { useExperience } from "@/lib/experience";
import { confettiBurst } from "@/lib/motion";
import { sound } from "@/lib/sound";
import Character, { type Pose } from "./Character";
import Particles from "./Particles";

function Letters({ text, start, delay, className, stiffness = 320 }: { text: string; start: boolean; delay: number; className?: string; stiffness?: number }) {
  const words = text.split(" ");
  let index = 0;
  return (
    <span className={className} aria-label={text} role="text">
      {words.map((word, wi) => (
        <span key={wi} className="inline-block whitespace-nowrap" aria-hidden>
          {[...word].map((ch) => {
            const i = index++;
            return (
              <motion.span
                key={i}
                className="inline-block"
                initial={{ opacity: 0, y: "0.6em", rotate: 10, scale: 0.6 }}
                animate={start ? { opacity: 1, y: 0, rotate: 0, scale: 1 } : undefined}
                transition={{ type: "spring", stiffness, damping: 11, mass: 0.9, delay: delay + i * 0.045 }}
              >
                {ch}
              </motion.span>
            );
          })}
          {wi < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </span>
  );
}

export default function Hero() {
  const { stage, replayToken } = useExperience();
  const live = stage === "live";
  const ref = useRef<HTMLElement>(null);
  const [pose, setPose] = useState<Pose>("idle");
  const [landed, setLanded] = useState(false);
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }));
  }, []);

  // Replay resets the intro.
  useEffect(() => {
    if (replayToken === 0) return;
    setLanded(false);
    setPose("idle");
  }, [replayToken]);

  const onLand = () => {
    if (landed) return;
    setLanded(true);
    setPose("wave");
    sound.pop();
    confettiBurst("hero");
  };

  return (
    <section
      ref={ref}
      data-screen-label="Hero"
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 pb-20 pt-[max(56px,env(safe-area-inset-top))] text-center"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(70% 55% at 50% 38%, rgba(232,184,74,.13), rgba(232,184,74,0) 70%)" }}
      />
      <Particles active={live} sectionRef={ref} />

      <motion.p
        className="relative text-[12px] uppercase tracking-[0.38em] text-gold"
        initial={{ opacity: 0, y: 10 }}
        animate={live ? { opacity: 1, y: 0 } : undefined}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        {today || " "}
      </motion.p>

      <div className="relative mt-4 grid place-items-center">
        <div
          aria-hidden
          className="absolute bottom-[4%] h-[38%] w-[150%] rounded-[50%]"
          style={{ background: "radial-gradient(closest-side, rgba(232,184,74,.32), rgba(232,184,74,0))" }}
        />
        <motion.div
          key={replayToken}
          className="relative h-[min(42svh,400px)] aspect-[1/2]"
          initial={{ y: "-115svh" }}
          animate={live ? { y: 0 } : undefined}
          transition={{ type: "spring", stiffness: 90, damping: 10, mass: 1.1, delay: 0.55 }}
          onAnimationComplete={() => live && onLand()}
        >
          <Character pose={pose} mood="joy" onPoseComplete={() => setPose("idle")} className="h-full w-full" />
        </motion.div>
      </div>

      <h1 key={`h-${replayToken}`} className="relative mt-3 flex flex-col items-center font-display">
        <Letters
          text="Happy Birthday,"
          start={live}
          delay={1.3}
          className="text-[clamp(26px,7vw,44px)] font-medium italic leading-tight text-cream"
        />
        <Letters
          text={config.nickname}
          start={live}
          delay={1.95}
          stiffness={240}
          className="-mt-1 text-[clamp(104px,31vw,300px)] font-extrabold leading-[0.86] tracking-[-0.02em] text-gold [text-shadow:0_10px_60px_rgba(232,184,74,.28)]"
        />
      </h1>

      <motion.p
        className="relative mt-5 text-[clamp(18px,4.6vw,22px)] text-cream/85"
        initial={{ opacity: 0, y: 14 }}
        animate={live ? { opacity: 1, y: 0 } : undefined}
        transition={{ delay: 2.6, duration: 0.9 }}
      >
        Today is about you.
      </motion.p>

      <motion.div
        aria-hidden
        className="absolute bottom-[max(18px,env(safe-area-inset-bottom))] left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-[11px] uppercase tracking-[0.3em] text-cream/45"
        initial={{ opacity: 0 }}
        animate={live ? { opacity: 1 } : undefined}
        transition={{ delay: 3.6, duration: 1 }}
      >
        Scroll
        <svg width="16" height="16" viewBox="0 0 16 16" style={{ animation: "nudge 1.8s ease-in-out infinite" }}>
          <path d="M3 6l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </motion.div>
    </section>
  );
}
