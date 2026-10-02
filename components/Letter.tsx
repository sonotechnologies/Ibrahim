"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { config } from "@/config";
import { ambient } from "@/lib/motion";
import Character from "./Character";

const { gold, paper } = config.theme.colors;

/** Words appear one after another, as if the line were being written. */
function Written({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.7 });
  const words = text.split(" ");
  return (
    <p ref={ref} className={className} aria-label={text}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="inline-block whitespace-pre"
          initial={{ opacity: 0, y: 6 }}
          animate={seen ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.45, delay: i * 0.055, ease: "easeOut" }}
        >
          {w + (i < words.length - 1 ? " " : "")}
        </motion.span>
      ))}
    </p>
  );
}

function Envelope({ open }: { open: boolean }) {
  return (
    <div className="relative mx-auto aspect-[3/2] w-full [perspective:900px]">
      {/* back */}
      <div className="absolute inset-0 rounded-[10px]" style={{ background: "#C9962F" }} />
      {/* paper sliding out */}
      <motion.div
        className="absolute inset-x-[7%] top-[8%] h-[84%] rounded-[4px] p-[7%]"
        style={{ zIndex: 1, background: paper, boxShadow: "0 -6px 20px rgba(0,0,0,.25)" }}
        initial={{ y: "0%" }}
        animate={{ y: open ? "-58%" : "0%" }}
        transition={{ delay: open ? 0.75 : 0, duration: 1.1, ease: [0.3, 0.7, 0.2, 1] }}
      >
        <div className="font-display text-[clamp(14px,4vw,20px)] italic" style={{ color: "var(--c-gold-ink)" }}>
          Dear {config.nickname},
        </div>
        <div className="mt-3 space-y-2" aria-hidden>
          {[92, 80, 86, 60].map((w, i) => (
            <div key={i} className="h-[3px] rounded-full bg-ink/15" style={{ width: `${w}%` }} />
          ))}
        </div>
      </motion.div>
      {/* front pocket */}
      <svg viewBox="0 0 300 200" className="absolute inset-0 z-[2] h-full w-full" aria-hidden preserveAspectRatio="none">
        <path d="M0 10 L150 120 L300 10 L300 190 Q300 200 290 200 L10 200 Q0 200 0 190 Z" fill={gold} />
        <path d="M0 200 L130 104 M300 200 L170 104" stroke="rgba(0,0,0,.14)" strokeWidth="2" />
      </svg>
      {/* flap */}
      <motion.div
        className="absolute inset-x-0 top-0 h-[62%] origin-top"
        style={{ transformStyle: "preserve-3d", zIndex: open ? 0 : 3 }}
        initial={{ rotateX: 0 }}
        animate={{ rotateX: open ? 180 : 0 }}
        transition={{ duration: 0.8, ease: [0.5, 0, 0.3, 1] }}
      >
        <svg viewBox="0 0 300 124" className="h-full w-full" preserveAspectRatio="none" aria-hidden>
          <path d="M0 0 H300 L160 118 Q150 126 140 118 Z" fill="#DDA944" stroke="rgba(0,0,0,.12)" strokeWidth="1.5" />
        </svg>
        <div
          className="absolute left-1/2 top-[78%] grid h-[22%] aspect-square -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full font-display text-[clamp(12px,3.4vw,18px)] font-bold italic"
          style={{ background: "#8E1B1B", color: "#F5D98A", boxShadow: "0 2px 6px rgba(0,0,0,.35)", backfaceVisibility: "hidden" }}
        >
          {config.nickname[0]}
        </div>
      </motion.div>
    </div>
  );
}

export default function Letter() {
  const section = useRef<HTMLElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const open = useInView(scene, { once: true, amount: 0.7 });
  // The room dims a little while the letter is read.
  const { scrollYProgress } = useScroll({ target: section, offset: ["start end", "end start"] });
  const dim = useTransform(scrollYProgress, [0.05, 0.25, 0.8, 0.95], [0, 1, 1, 0]);
  // ...and the background particles slow almost to a stop.
  const reading = useInView(section, { amount: 0.25 });
  useEffect(() => {
    ambient.target = reading ? 0.12 : 1;
    return () => {
      ambient.target = 1;
    };
  }, [reading]);

  return (
    <section ref={section} data-screen-label="Letter" className="relative px-4 py-28 sm:py-40">
      <motion.div
        aria-hidden
        className="pointer-events-none sticky top-0 -mb-[100svh] h-[100svh]"
        style={{ opacity: dim, background: "radial-gradient(60% 50% at 50% 45%, rgba(232,184,74,.07), rgba(0,0,0,.55) 85%)" }}
      />

      <div className="relative mx-auto flex max-w-[640px] flex-col items-center">
        <p className="text-[12px] uppercase tracking-[0.38em] text-gold">A letter for you</p>

        <div ref={scene} className="mt-24 flex w-full items-end justify-center gap-3 sm:mt-32 sm:gap-8">
          <div className="h-[clamp(170px,44vw,260px)] aspect-[1/2] shrink-0">
            <Character pose={open ? "read" : "idle"} mood="calm" className="h-full w-full" />
          </div>
          <div className="w-[min(300px,62vw)] pb-2">
            <Envelope open={open} />
          </div>
        </div>

        <motion.article
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative mt-14 w-full rounded-[6px] px-6 py-10 text-ink shadow-[0_40px_90px_-30px_rgba(0,0,0,.9)] sm:px-14 sm:py-16"
          style={{
            background: `radial-gradient(120% 80% at 50% 0%, #FFFBF1, ${paper} 60%, #EFE6D2)`,
          }}
        >
          <Written text={`Dear ${config.nickname},`} className="font-display text-[clamp(26px,7vw,34px)] italic text-gold-ink" />
          <div className="mt-6 space-y-5 text-[17px] leading-[1.8] sm:text-[19px]">
            {config.letter.map((p, i) => (
              <Written key={i} text={p} className="text-pretty" />
            ))}
          </div>
          <Written text={config.letterSignature} className="mt-8 font-display text-[26px] italic" />
        </motion.article>
      </div>
    </section>
  );
}
