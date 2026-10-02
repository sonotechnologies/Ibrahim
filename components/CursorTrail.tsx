"use client";

import { useEffect, useRef } from "react";
import { confettiColors, prefersReducedMotion } from "@/lib/motion";

/** Gold sparkle trail behind the mouse. Desktop only; idle when the mouse is still. */
export default function CursorTrail() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine || prefersReducedMotion()) return;
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      cv.width = window.innerWidth * dpr;
      cv.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    type P = { x: number; y: number; vx: number; vy: number; life: number; r: number; c: string };
    const ps: P[] = [];
    const MAX = 40;
    let raf = 0;
    let running = false;
    let lx = -1, ly = -1;

    const tick = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.life -= 0.035;
        if (p.life <= 0) {
          ps.splice(i, 1);
          continue;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.03;
        ctx.globalAlpha = p.life * 0.85;
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (ps.length) raf = requestAnimationFrame(tick);
      else running = false;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const d = lx < 0 ? 0 : Math.hypot(e.clientX - lx, e.clientY - ly);
      lx = e.clientX;
      ly = e.clientY;
      const n = Math.min(3, 1 + Math.floor(d / 14));
      for (let i = 0; i < n && ps.length < MAX; i++) {
        ps.push({
          x: e.clientX + (Math.random() - 0.5) * 6,
          y: e.clientY + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          life: 1,
          r: 1.5 + Math.random() * 2.2,
          c: confettiColors[(Math.random() * confettiColors.length) | 0],
        });
      }
      if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvas} aria-hidden className="pointer-events-none fixed inset-0 z-[70] h-full w-full" />;
}
