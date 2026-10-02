"use client";

import { useEffect, useRef } from "react";
import { confettiColors, particleBudget, prefersReducedMotion } from "@/lib/motion";

type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; size: number };
type Rocket = { x: number; y: number; vy: number; targetY: number; color: string };

/**
 * Soft gold fireworks on a canvas. Runs a short show each time `active` turns on
 * and stops drawing entirely when the section is off screen.
 */
export default function Fireworks({ active, duration = 6000 }: { active: boolean; duration?: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active || prefersReducedMotion()) return;
    const cv = canvas.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let W = 0, H = 0;
    const resize = () => {
      W = cv.clientWidth;
      H = cv.clientHeight;
      cv.width = W * dpr;
      cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const budget = particleBudget();
    const sparks: Spark[] = [];
    const rockets: Rocket[] = [];
    const start = performance.now();
    let lastLaunch = 0;
    let raf = 0;

    const launch = () => {
      rockets.push({
        x: W * (0.15 + Math.random() * 0.7),
        y: H,
        vy: -(H / 70 + Math.random() * 3),
        targetY: H * (0.06 + Math.random() * 0.16),
        color: confettiColors[(Math.random() * confettiColors.length) | 0],
      });
    };

    const explode = (r: Rocket) => {
      // Never more live sparks than the screen's particle budget.
      const n = Math.min(Math.round(budget * 0.45) + ((Math.random() * budget * 0.15) | 0), budget - sparks.length);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const s = 1.6 + Math.random() * 2.8;
        sparks.push({ x: r.x, y: r.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0, max: 60 + Math.random() * 40, color: r.color, size: 1.4 + Math.random() * 1.6 });
      }
    };

    const tick = (t: number) => {
      const elapsed = t - start;
      if (elapsed < duration && t - lastLaunch > 650 && sparks.length < budget * 0.5) {
        launch();
        if (budget > 40 && Math.random() < 0.35) launch();
        lastLaunch = t;
      }
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,.22)";
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";

      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.y += r.vy;
        r.vy *= 0.985;
        ctx.fillStyle = r.color;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2, 0, Math.PI * 2);
        ctx.fill();
        if (r.y <= r.targetY || r.vy > -1) {
          explode(r);
          rockets.splice(i, 1);
        }
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life++;
        s.vx *= 0.975;
        s.vy = s.vy * 0.975 + 0.045;
        s.x += s.vx;
        s.y += s.vy;
        const fade = 1 - s.life / s.max;
        if (fade <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = fade * 0.75;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (elapsed < duration || rockets.length || sparks.length) raf = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, W, H);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      ctx.clearRect(0, 0, W, H);
    };
  }, [active, duration]);

  return <canvas ref={canvas} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />;
}
