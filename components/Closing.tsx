"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { config } from "@/config";
import { useExperience } from "@/lib/experience";
import { scrollToTop } from "@/lib/motion";
import Character from "./Character";
import Fireworks from "./Fireworks";

export default function Closing() {
  const { bumpReplay } = useExperience();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.5 });
  const words = config.closingWish.split(" ");

  const replay = () => scrollToTop(() => bumpReplay());

  return (
    <section
      ref={ref}
      data-screen-label="Closing"
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 pb-[max(64px,env(safe-area-inset-bottom))] pt-24 text-center"
    >
      <Fireworks active={inView} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(60% 45% at 50% 60%, rgba(232,184,74,.12), transparent 70%)" }}
      />

      <motion.p
        className="relative text-[12px] uppercase tracking-[0.38em] text-gold"
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.8 }}
      >
        One wish for the year ahead
      </motion.p>

      <p
        aria-label={config.closingWish}
        className="relative mt-6 max-w-[16ch] font-display text-[clamp(36px,10vw,72px)] font-medium leading-[1.1] text-balance sm:max-w-[20ch]"
      >
        {words.map((w, i) => (
          <motion.span
            key={i}
            aria-hidden
            className="inline-block whitespace-pre"
            initial={{ opacity: 0, y: "0.5em", filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: 0.7, delay: 0.25 + i * 0.09, ease: "easeOut" }}
          >
            {w + (i < words.length - 1 ? " " : "")}
          </motion.span>
        ))}
      </p>

      <motion.div
        className="relative mt-10 h-[clamp(150px,34vw,220px)] aspect-[1/2]"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.6 }}
      >
        <Character pose={inView ? "celebrate" : "idle"} mood="joy" className="h-full w-full" />
      </motion.div>

      <motion.p
        className="relative mt-6 font-display text-[28px] italic text-gold"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 1, delay: 1.2 }}
      >
        {config.signOff}
      </motion.p>

      <motion.button
        type="button"
        onClick={replay}
        className="relative mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-gold px-7 text-[15px] font-medium text-base shadow-[0_10px_40px_-10px_rgba(232,184,74,.7)]"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.6, delay: 1.5 }}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <path d="M3 4v5h5" />
        </svg>
        Replay from the start
      </motion.button>
    </section>
  );
}
