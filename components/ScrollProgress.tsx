"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useExperience } from "@/lib/experience";

export default function ScrollProgress() {
  const { stage } = useExperience();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  if (stage !== "live") return null;
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-30 h-[3px] origin-left bg-gold"
      style={{ scaleX, boxShadow: "0 0 12px var(--c-gold)" }}
    />
  );
}
