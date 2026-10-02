"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/motion";

/**
 * Hover and press feedback for any button: it leans toward a mouse pointer
 * and gives under a press (mouse or finger). Transform only.
 */
export default function Magnetic({
  children,
  strength = 0.35,
  className,
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 15, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 15, mass: 0.4 });

  const move = (e: React.PointerEvent) => {
    if (reduced || e.pointerType !== "mouse" || !ref.current) return;
    const b = ref.current.getBoundingClientRect();
    x.set((e.clientX - (b.left + b.width / 2)) * strength);
    y.set((e.clientY - (b.top + b.height / 2)) * strength);
  };
  const leave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span
      ref={ref}
      className={`inline-flex ${className ?? ""}`}
      style={{ x, y }}
      onPointerMove={move}
      onPointerLeave={leave}
      whileHover={reduced ? undefined : { scale: 1.05 }}
      whileTap={reduced ? { opacity: 0.7 } : { scale: 0.92 }}
      transition={{ type: "spring", stiffness: 400, damping: 18 }}
    >
      {children}
    </motion.span>
  );
}
