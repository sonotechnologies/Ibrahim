"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { config } from "@/config";
import { confettiBurst } from "@/lib/motion";
import { sound } from "@/lib/sound";
import Character, { type Pose } from "./Character";
import Magnetic from "./Magnetic";

const N = config.candleCount;
const { gold, text } = config.theme.colors;

type Phase = "lit" | "blowing" | "dim" | "done";

const FLAMES = [
  "M22 6 C 27 16 31 23 31 29 C 31 34.5 27 38 22 38 C 17 38 13 34.5 13 29 C 13 23 17 16 22 6 Z",
  "M23.5 4 C 29 15 31.5 22.5 30.5 29 C 30 34.5 26.5 38 22 38 C 17 38 14 34.5 14 29 C 14 22.5 18.5 15 23.5 4 Z",
  "M20.5 7 C 26 15 30 24 30 29.5 C 30 35 27 38 22 38 C 17 38 13 35 13.5 29.5 C 14 23.5 15.5 16 20.5 7 Z",
];
const INNER = [
  "M22 20 C 24.5 25 26.5 28.5 26.5 31.5 C 26.5 34.5 24.5 36 22 36 C 19.5 36 17.5 34.5 17.5 31.5 C 17.5 28.5 19.5 25 22 20 Z",
  "M22.6 18.5 C 25.5 24.5 26.8 28 26.3 31.5 C 26 34.5 24.4 36 22 36 C 19.6 36 17.8 34.5 17.8 31.5 C 17.8 28 19.6 24.5 22.6 18.5 Z",
  "M21.4 20.5 C 24 25 26.2 29 26.2 31.8 C 26.2 34.6 24.3 36 22 36 C 19.7 36 17.6 34.6 17.8 31.8 C 18 28.8 19 25 21.4 20.5 Z",
];

function Candle({ lit, index, onBlow, disabled }: { lit: boolean; index: number; onBlow: () => void; disabled: boolean }) {
  const id = useId().replace(/:/g, "");
  const speed = 0.7 + (index % 3) * 0.13;
  return (
    <button
      type="button"
      onClick={onBlow}
      disabled={disabled || !lit}
      aria-label={lit ? `Blow out candle ${index + 1}` : `Candle ${index + 1} is out`}
      className="relative flex h-[104px] w-12 shrink-0 cursor-pointer items-end justify-center disabled:cursor-default"
    >
      <svg viewBox="0 0 44 96" width="44" height="96" className="overflow-visible" aria-hidden>
        <defs>
          <radialGradient id={`g${id}`}>
            <stop offset="0%" stopColor={gold} stopOpacity="0.55" />
            <stop offset="100%" stopColor={gold} stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`f${id}`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#E8892A" />
            <stop offset="55%" stopColor="#F7C95A" />
            <stop offset="100%" stopColor="#FFE9A8" />
          </linearGradient>
          <pattern id={`s${id}`} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
            <rect width="10" height="10" fill={text} />
            <rect width="5" height="10" fill={gold} />
          </pattern>
        </defs>

        <AnimatePresence>
          {lit && (
            <motion.g key="flame" exit={{ opacity: 0, scale: 0.2, transition: { duration: 0.25 } }} style={{ originX: "22px", originY: "38px" }}>
              <motion.circle
                cx="22"
                cy="28"
                r="24"
                fill={`url(#g${id})`}
                animate={{ opacity: [0.6, 1, 0.7, 0.95, 0.6], scale: [1, 1.08, 0.97, 1.05, 1] }}
                transition={{ duration: speed * 2.6, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.path
                d={FLAMES[0]}
                fill={`url(#f${id})`}
                animate={{ d: [FLAMES[0], FLAMES[1], FLAMES[2], FLAMES[0]] }}
                transition={{ duration: speed, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.path
                d={INNER[0]}
                fill="#FFF8E0"
                animate={{ d: [INNER[0], INNER[1], INNER[2], INNER[0]] }}
                transition={{ duration: speed, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.g>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!lit && (
            <motion.g key="smoke" initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {[0, 1, 2].map((k) => (
                <motion.path
                  key={k}
                  d={`M${20 + k * 2} 36 c -7 -7 7 -12 0 -20 s 7 -13 0 -20`}
                  fill="none"
                  stroke="rgba(245,242,234,.5)"
                  strokeWidth={2.2 - k * 0.5}
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0.9, y: 0 }}
                  animate={{ pathLength: 1, opacity: 0, y: -26 - k * 8, x: (k - 1) * 4 }}
                  transition={{ duration: 1.6 + k * 0.25, ease: "easeOut", delay: k * 0.08 }}
                />
              ))}
            </motion.g>
          )}
        </AnimatePresence>

        <line x1="22" y1="36" x2="22" y2="44" stroke={lit ? "#2a2a2a" : "#111"} strokeWidth="2" strokeLinecap="round" />
        {!lit && <circle cx="22" cy="36.5" r="1.4" fill="#E8892A" opacity="0.8" />}
        <rect x="16" y="43" width="12" height="53" rx="3" fill={`url(#s${id})`} stroke="rgba(0,0,0,.35)" strokeWidth="1" />
      </svg>
    </button>
  );
}

function CakeBody() {
  return (
    <svg viewBox="0 0 300 200" className="block w-full overflow-visible" aria-hidden>
      <ellipse cx="150" cy="190" rx="148" ry="10" fill={gold} opacity="0.9" />
      <ellipse cx="150" cy="187" rx="140" ry="7" fill="#B98A2E" />
      <path d="M26 30 h248 v148 q -124 14 -248 0 Z" fill="var(--c-surface)" stroke="rgba(232,184,74,.35)" strokeWidth="1.5" />
      <path d="M26 112 h248" stroke={gold} strokeOpacity="0.35" strokeWidth="1.2" strokeDasharray="2 6" />
      <path
        d="M20 22 q 0 -6 8 -6 h244 q 8 0 8 6 v18 c -8 0 -10 14 -18 14 s -9 -22 -20 -22 s -10 34 -22 34 s -10 -26 -22 -26 s -8 16 -20 16 s -10 -20 -22 -20 s -10 30 -22 30 s -9 -24 -22 -24 s -9 14 -20 14 s -10 -26 -22 -26 s -10 22 -22 22 s -8 -14 -18 -14 Z"
        fill={text}
      />
      <g fill={gold}>
        {[44, 82, 118, 160, 204, 238, 262].map((x, i) => (
          <rect key={x} x={x} y={10 + (i % 2) * 6} width="7" height="2.4" rx="1.2" transform={`rotate(${(i * 47) % 180} ${x} ${12 + (i % 2) * 6})`} />
        ))}
      </g>
      <text x="150" y="132" textAnchor="middle" fontFamily="var(--f-display)" fontStyle="italic" fontWeight={500} fontSize="44" fill={gold}>
        {config.nickname}
      </text>
    </svg>
  );
}

function CakeStand() {
  return (
    <svg viewBox="0 0 300 48" className="-mt-[1px] block w-full" aria-hidden>
      <path d="M118 4 h64 l-10 30 h-44 z" fill="#B98A2E" />
      <path d="M128 4 h12 l-6 30 h-6 z" fill="#fff" opacity="0.18" />
      <ellipse cx="150" cy="38" rx="62" ry="8" fill={gold} />
      <ellipse cx="150" cy="44" rx="90" ry="4" fill="#000" opacity="0.45" />
    </svg>
  );
}

export default function Cake() {
  const [out, setOut] = useState<boolean[]>(() => Array(N).fill(false));
  const [phase, setPhase] = useState<Phase>("lit");
  const timers = useRef<number[]>([]);

  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const reset = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setOut(Array(N).fill(false));
    setPhase("lit");
  };

  const blow = (i: number) => {
    if (out[i] || phase !== "lit") return;
    const remaining = out.filter((o) => !o).length;
    if (remaining > 1) {
      sound.puff(0.8);
      setOut((o) => o.map((v, k) => (k === i ? true : v)));
      return;
    }
    // The last one: he leans in and blows, the room goes dark for a beat, then the wish lands.
    setPhase("blowing");
    later(() => {
      sound.puff(1.4);
      setOut((o) => o.map((v, k) => (k === i ? true : v)));
    }, 750);
    later(() => setPhase("dim"), 1250);
    later(() => {
      setPhase("done");
      sound.chime();
      sound.pop();
      confettiBurst("wish");
    }, 2900);
  };

  const done = phase === "done";
  const pose: Pose = phase === "blowing" ? "blow" : done ? "celebrate" : "idle";
  const litCount = out.filter((o) => !o).length;

  return (
    <section data-screen-label="Candles" className="relative flex flex-col items-center px-4 py-28 text-center sm:py-36">
      <div className="flex min-h-[132px] flex-col items-center gap-3">
        <AnimatePresence mode="wait">
          <motion.h2
            key={done ? "done" : "wish"}
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.6 }}
            className="font-display text-[clamp(40px,10vw,72px)] font-bold leading-[1.02] text-balance"
          >
            {done ? (
              <>
                Wish <span className="italic text-gold">made.</span>
              </>
            ) : (
              <>
                Make a wish, <span className="italic text-gold">{config.nickname}</span>
              </>
            )}
          </motion.h2>
        </AnimatePresence>
        <p className="max-w-[30ch] text-[16px] text-cream/70" aria-live="polite">
          {done
            ? "Keep it to yourself. It works better that way."
            : phase === "lit" && litCount === N
              ? "Tap each candle to blow it out."
              : phase === "lit"
                ? litCount === 1
                  ? "Last one. Close your eyes first."
                  : `${litCount} to go.`
                : "Shh…"}
        </p>
      </div>

      {/*
        The cake is wide enough for five 48px candles. He stands just behind it, sized so
        his mouth sits a little above the cake top (cake top = 0.69 × cake width, mouth = 83% up).
        On narrow phones he tucks further behind it so both fit.
      */}
      <div
        className="relative mt-10 flex w-full items-end justify-center [--ch:calc((var(--cw)*0.69+55px)/0.83)] [--cw:min(300px,72vw)]"
      >
        <div
          className="relative z-0 h-[var(--ch)] aspect-[1/2] shrink-0"
          style={{ marginRight: "calc(-1 * max(24px, var(--cw) + var(--ch) / 2 - 100vw + 32px))" }}
        >
          <Character pose={pose} mood={done ? "joy" : "smile"} className="h-full w-full" />
        </div>
        <div className="relative z-10 w-[var(--cw)]">
          <div className="absolute inset-x-[3.5%] bottom-[80%] flex items-end justify-between">
            {out.map((o, i) => (
              <Magnetic key={i} strength={0.15}>
                <Candle lit={!o} index={i} onBlow={() => blow(i)} disabled={phase !== "lit"} />
              </Magnetic>
            ))}
          </div>
          <CakeBody />
          <CakeStand />
        </div>
      </div>

      <div className="mt-12 h-14">
        <AnimatePresence>
          {done && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 1.2 }}>
              <Magnetic>
                <button type="button" onClick={reset} className="min-h-12 rounded-full border border-gold/70 px-7 text-[15px] text-gold">
                  Light them again
                </button>
              </Magnetic>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {phase === "dim" && (
          <motion.div
            className="fixed inset-0 z-40 grid place-items-center bg-black/85"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.7 } }}
            transition={{ duration: 0.5 }}
          >
            <motion.p
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35, duration: 0.8 }}
              className="max-w-[18ch] px-6 text-center font-display text-[clamp(26px,7vw,40px)] italic leading-snug text-cream/80 text-balance"
            >
              Close your eyes. Make a wish.
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
