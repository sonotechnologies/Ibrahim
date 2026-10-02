"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { config } from "@/config";
import { ambient, particleBudget, prefersReducedMotion, tiltX, tiltY, usePrefersReducedMotion } from "@/lib/motion";

const { gold, text } = config.theme.colors;
const BALLOON_COLORS = [gold, text, "#B98A2E", "#F5D98A", gold, "#2A2A31"];

type Dust = { left: number; top: number; size: number; delay: number; dur: number };
type Balloon = { left: number; size: number; delay: number; dur: number; color: string };

function useLayer(depth: number, scroll: MotionValue<number>) {
  const sx = useSpring(tiltX, { stiffness: 40, damping: 14 });
  const sy = useSpring(tiltY, { stiffness: 40, damping: 14 });
  const x = useTransform(sx, (v) => v * depth * 28);
  const tilt = useTransform(sy, (v) => v * depth * 18);
  const lift = useTransform(scroll, [0, 1], [0, -depth * 260]);
  const y = useTransform([tilt, lift] as MotionValue<number>[], ([a, b]: number[]) => a + b);
  return { x, y };
}

function BalloonShape({ color, size }: { color: string; size: number }) {
  const dark = color === "#2A2A31";
  return (
    <svg width={size} height={size * 2.1} viewBox="0 0 60 126" aria-hidden className="overflow-visible">
      <path d="M30 70 q -6 14 2 26 t -2 30" fill="none" stroke="rgba(245,242,234,.35)" strokeWidth="1.4" />
      <ellipse cx="30" cy="34" rx="26" ry="32" fill={color} stroke={dark ? gold : "rgba(0,0,0,.25)"} strokeWidth={dark ? 1.6 : 1} />
      <ellipse cx="20" cy="22" rx="6" ry="10" fill="#fff" opacity={dark ? 0.12 : 0.35} transform="rotate(-20 20 22)" />
      <path d="M26 66 L34 66 L30 72 Z" fill={color} stroke={dark ? gold : "none"} strokeWidth="1" />
    </svg>
  );
}

/** Floating gold dust and slow balloons, layered at three depths for parallax on scroll and tilt. */
export default function Particles({ active, sectionRef }: { active: boolean; sectionRef: RefObject<HTMLElement | null> }) {
  const [dust, setDust] = useState<Dust[]>([]);
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const far = useLayer(0.35, scrollYProgress);
  const mid = useLayer(0.7, scrollYProgress);
  const near = useLayer(1.15, scrollYProgress);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const r = Math.random;
    // The hero takes about 30% of the particle budget; the ambient layer takes the rest.
    const budget = particleBudget();
    setDust(Array.from({ length: Math.round(budget * 0.3) }, () => ({ left: r() * 100, top: r() * 100, size: 1.5 + r() * 3, delay: -r() * 6, dur: 5 + r() * 5 })));
    setBalloons(
      Array.from({ length: budget > 40 ? 7 : 5 }, (_, i) => ({
        left: 4 + ((i * 14 + r() * 8) % 92),
        size: 26 + r() * 26,
        delay: i * 2.6 + r() * 2,
        dur: 20 + r() * 10,
        color: BALLOON_COLORS[i % BALLOON_COLORS.length],
      })),
    );
  }, []);

  const layers = [far, mid, near];

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {layers.map((layer, li) => (
        <motion.div key={li} className="absolute inset-0" style={reduced ? undefined : layer}>
          {dust
            .filter((_, i) => i % 3 === li)
            .map((d, i) => (
              <span
                key={i}
                className="absolute rounded-full bg-gold"
                style={{
                  left: `${d.left}%`,
                  top: `${d.top}%`,
                  width: d.size * (0.7 + li * 0.3),
                  height: d.size * (0.7 + li * 0.3),
                  boxShadow: "0 0 8px rgba(232,184,74,.8)",
                  animation: `drift ${d.dur}s ease-in-out ${d.delay}s infinite`,
                }}
              />
            ))}
          {active &&
            !reduced &&
            balloons
              .filter((_, i) => i % 3 === li)
              .map((b, i) => (
                <div
                  key={i}
                  className="absolute top-full"
                  style={{
                    left: `${b.left}%`,
                    opacity: 0.55 + li * 0.2,
                    filter: li === 0 ? "blur(1.5px)" : undefined,
                    animation: `float-up ${b.dur}s linear ${b.delay}s infinite`,
                  }}
                >
                  <BalloonShape color={b.color} size={b.size * (0.7 + li * 0.25)} />
                </div>
              ))}
        </motion.div>
      ))}
    </div>
  );
}

/**
 * A few slow motes drifting behind the whole page so no section ever feels still.
 * Speed follows `ambient.target` (the letter slows it). Pauses when the tab is hidden.
 */
export function AmbientParticles() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const reduced = prefersReducedMotion();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let W = 0, H = 0;
    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = W * dpr;
      cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const count = Math.round(particleBudget() * 0.55);
    const motes = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 0.6 + Math.random() * 1.8,
      vy: -(0.12 + Math.random() * 0.35),
      vx: (Math.random() - 0.5) * 0.15,
      a: 0.15 + Math.random() * 0.45,
      phase: Math.random() * Math.PI * 2,
    }));

    let raf = 0;
    let last = performance.now();
    const draw = (t: number) => {
      const dt = Math.min(3, (t - last) / 16.7);
      last = t;
      ambient.speed += (ambient.target - ambient.speed) * 0.04 * dt;
      const sp = ambient.speed * dt;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = gold;
      for (const m of motes) {
        m.y += m.vy * sp;
        m.x += m.vx * sp;
        m.phase += 0.01 * sp;
        if (m.y < -4) { m.y = H + 4; m.x = Math.random() * W; }
        if (m.x < -4) m.x = W + 4;
        if (m.x > W + 4) m.x = -4;
        ctx.globalAlpha = m.a * (0.6 + 0.4 * Math.sin(m.phase));
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (!reduced) raf = requestAnimationFrame(draw);
    };
    const start = () => {
      cancelAnimationFrame(raf);
      last = performance.now();
      raf = requestAnimationFrame(draw);
    };
    const onVisibility = () => (document.hidden ? cancelAnimationFrame(raf) : start());
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={canvas} aria-hidden className="pointer-events-none fixed inset-0 z-0 h-full w-full" />;
}
