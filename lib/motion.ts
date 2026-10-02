"use client";

import { useEffect, useState } from "react";
import { motionValue } from "framer-motion";
import confetti from "canvas-confetti";
import type Lenis from "lenis";
import { config } from "@/config";

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* ---------- smooth scroll handle ---------- */

let lenis: Lenis | null = null;
export const setLenis = (l: Lenis | null) => (lenis = l);
export const getLenis = () => lenis;

export function scrollToTop(onDone?: () => void) {
  if (lenis) {
    lenis.scrollTo(0, { duration: prefersReducedMotion() ? 0 : 2.2, onComplete: () => onDone?.() });
  } else {
    window.scrollTo({ top: 0 });
    onDone?.();
  }
}

/* ---------- device tilt, shared by every parallax layer ---------- */

/** -1..1 on each axis. Fed by the gyroscope on phones and by the pointer on desktop. */
export const tiltX = motionValue(0);
export const tiltY = motionValue(0);

let tiltListening = false;

/** iOS asks permission for motion sensors; this must run inside a tap. */
export async function requestTiltPermission() {
  const DOE = (typeof window !== "undefined" ? window.DeviceOrientationEvent : undefined) as
    | (typeof DeviceOrientationEvent & { requestPermission?: () => Promise<string> })
    | undefined;
  if (DOE?.requestPermission) {
    try {
      await DOE.requestPermission();
    } catch {
      /* declined, pointer fallback still works */
    }
  }
}

export function startTiltListening() {
  if (tiltListening || typeof window === "undefined") return;
  tiltListening = true;
  let base: { beta: number; gamma: number } | null = null;
  window.addEventListener("deviceorientation", (e) => {
    if (e.beta == null || e.gamma == null) return;
    if (!base) base = { beta: e.beta, gamma: e.gamma };
    const clamp = (v: number) => Math.max(-1, Math.min(1, v));
    tiltX.set(clamp((e.gamma - base.gamma) / 25));
    tiltY.set(clamp((e.beta - base.beta) / 25));
  });
  window.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    tiltX.set((e.clientX / window.innerWidth) * 2 - 1);
    tiltY.set((e.clientY / window.innerHeight) * 2 - 1);
  });
}

/* ---------- confetti ---------- */

const { gold, text } = config.theme.colors;
export const confettiColors = [gold, gold, "#F5D98A", "#B98A2E", text];

export function confettiBurst(kind: "hero" | "wish" = "hero") {
  if (prefersReducedMotion()) return;
  const shared = { colors: confettiColors, disableForReducedMotion: true, zIndex: 60, ticks: 260, gravity: 0.9, scalar: 1 };
  if (kind === "hero") {
    confetti({ ...shared, particleCount: 120, spread: 100, startVelocity: 48, origin: { x: 0.5, y: 0.35 } });
    return;
  }
  confetti({ ...shared, particleCount: 90, angle: 60, spread: 70, startVelocity: 60, origin: { x: 0, y: 0.75 } });
  confetti({ ...shared, particleCount: 90, angle: 120, spread: 70, startVelocity: 60, origin: { x: 1, y: 0.75 } });
  window.setTimeout(() => {
    confetti({ ...shared, particleCount: 70, spread: 160, startVelocity: 30, origin: { x: 0.5, y: 0.2 }, shapes: ["circle"] });
  }, 280);
}
