"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { config } from "@/config";
import { prefersReducedMotion } from "@/lib/motion";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Letters cycle through random characters, then lock into place left to right. */
function Scramble({ text, start, delay }: { text: string; start: boolean; delay: number }) {
  const [shown, setShown] = useState(text);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!start) return;
    if (prefersReducedMotion()) {
      setReady(true);
      return;
    }
    let frame = 0;
    let id = 0;
    const wait = window.setTimeout(() => {
      setReady(true);
      id = window.setInterval(() => {
        frame++;
        const next = [...text]
          .map((ch, i) => {
            if (frame > 6 + i * 3) return ch;
            const g = GLYPHS[(Math.random() * GLYPHS.length) | 0];
            return ch === ch.toLowerCase() ? g.toLowerCase() : g;
          })
          .join("");
        setShown(next);
        if (next === text) window.clearInterval(id);
      }, 45);
    }, delay * 1000);
    return () => {
      window.clearTimeout(wait);
      window.clearInterval(id);
    };
  }, [start, text, delay]);

  return (
    <span className="relative inline-grid" aria-label={text}>
      <span className="invisible col-start-1 row-start-1" aria-hidden>
        {text}
      </span>
      <span className="col-start-1 row-start-1" aria-hidden style={{ opacity: ready ? 1 : 0 }}>
        {shown}
      </span>
    </span>
  );
}

function TraitCard({ word, line, index, total, dealt }: { word: string; line: string; index: number; total: number; dealt: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const gx = useMotionValue(50);
  const gy = useMotionValue(30);
  const srx = useSpring(rx, { stiffness: 180, damping: 16 });
  const sry = useSpring(ry, { stiffness: 180, damping: 16 });
  const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(232,184,74,.22), rgba(232,184,74,0) 55%)`;

  const aim = (clientX: number, clientY: number) => {
    const b = ref.current?.getBoundingClientRect();
    if (!b) return;
    const px = (clientX - b.left) / b.width;
    const py = (clientY - b.top) / b.height;
    ry.set((px - 0.5) * 22);
    rx.set((0.5 - py) * 22);
    gx.set(px * 100);
    gy.set(py * 100);
  };
  const rest = () => {
    rx.set(0);
    ry.set(0);
    gx.set(50);
    gy.set(30);
  };

  // Dealt from a pile in the middle: every card starts stacked near the centre, slightly turned.
  const fromCenter = index - (total - 1) / 2;
  const delay = 0.15 + index * 0.16;

  return (
    <motion.div
      className="[perspective:900px]"
      initial={{ opacity: 0, y: 220, x: `${-fromCenter * 55}%`, rotate: fromCenter * 9 + (index % 2 ? 6 : -6), scale: 0.8 }}
      animate={dealt ? { opacity: 1, y: 0, x: "0%", rotate: 0, scale: 1 } : undefined}
      transition={{ type: "spring", stiffness: 110, damping: 15, mass: 0.9, delay }}
      style={{ zIndex: total - index }}
    >
      <motion.div
        ref={ref}
        onPointerMove={(e) => aim(e.clientX, e.clientY)}
        onPointerLeave={rest}
        onTouchMove={(e) => aim(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={rest}
        style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d", background: "linear-gradient(160deg, #1d1d22, var(--c-surface) 60%, #131317)" }}
        className="relative flex h-full min-h-[190px] flex-col overflow-hidden rounded-[22px] border border-gold/15 p-5 sm:min-h-[250px] sm:p-7"
      >
        <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glare }} />
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-gold/60" style={{ transform: "translateZ(20px)" }}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
            <path d="M7 0 L8.6 5.4 L14 7 L8.6 8.6 L7 14 L5.4 8.6 L0 7 L5.4 5.4 Z" fill="currentColor" />
          </svg>
        </div>
        <div
          className="mt-auto font-display text-[clamp(30px,8.4vw,46px)] font-bold leading-none text-gold"
          style={{ transform: "translateZ(40px)" }}
        >
          <Scramble text={word} start={dealt} delay={delay + 0.35} />
        </div>
        <p className="mt-3 text-[14px] leading-[1.5] text-cream/80 text-pretty sm:text-[16px]" style={{ transform: "translateZ(25px)" }}>
          {line}
        </p>
      </motion.div>
    </motion.div>
  );
}

export default function TraitCards() {
  const grid = useRef<HTMLDivElement>(null);
  const dealt = useInView(grid, { once: true, amount: 0.25 });
  const traits = config.traits;

  return (
    <section data-screen-label="Traits" className="relative mx-auto max-w-[1120px] px-4 py-28 sm:py-36">
      <motion.div
        className="mb-12 text-center"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.8 }}
      >
        <p className="text-[12px] uppercase tracking-[0.38em] text-gold">In a few words</p>
        <h2 className="mt-3 font-display text-[clamp(40px,10vw,72px)] font-bold leading-[1.02]">
          The {config.nickname} we know
        </h2>
      </motion.div>
      <div ref={grid} className={`grid grid-cols-2 gap-3 sm:gap-5 ${traits.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
        {traits.map((t, i) => (
          <TraitCard key={t.word} {...t} index={i} total={traits.length} dealt={dealt} />
        ))}
      </div>
    </section>
  );
}
