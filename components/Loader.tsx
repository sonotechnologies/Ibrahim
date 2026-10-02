"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { config } from "@/config";
import { useExperience } from "@/lib/experience";
import { prefersReducedMotion } from "@/lib/motion";

const NAME = config.nickname;
const DISPLAY = config.theme.fonts.display;
const FONT_SIZE = 120;
const STAGGER = 0.32;
const DRAW = 1.1;

/** His name writes itself one letter at a time, then fills with gold. */
export default function Loader() {
  const { setStage } = useExperience();
  const measure = useRef<SVGTextElement>(null);
  const [layout, setLayout] = useState<{ xs: number[]; width: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const family = DISPLAY.split(",")[0].replace(/['"]/g, "").trim();
    const fontLoad = document.fonts?.load(`800 ${FONT_SIZE}px "${family}"`).catch(() => undefined);
    const timeout = new Promise((r) => setTimeout(r, 1800));
    Promise.race([fontLoad, timeout]).then(() => {
      if (cancelled || !measure.current) return;
      const t = measure.current;
      const xs = [...NAME].map((_, i) => (i === 0 ? 0 : t.getSubStringLength(0, i)));
      setLayout({ xs, width: t.getComputedTextLength() });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!layout) return;
    const total = prefersReducedMotion() ? 400 : ((NAME.length - 1) * STAGGER + DRAW + 0.9) * 1000;
    const t = setTimeout(() => setStage("gate"), total);
    return () => clearTimeout(t);
  }, [layout, setStage]);

  const fillDelay = (NAME.length - 1) * STAGGER + DRAW * 0.7;

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-base"
      exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
      aria-label="Loading"
      role="status"
    >
      <div className="flex w-[min(78vw,520px)] flex-col items-center gap-6">
        <svg
          viewBox={layout ? `-8 -${FONT_SIZE * 0.95} ${layout.width + 16} ${FONT_SIZE * 1.25}` : "0 -120 300 150"}
          className="w-full overflow-visible"
          aria-hidden
        >
          <text ref={measure} x={0} y={0} fontFamily={DISPLAY} fontWeight={800} fontSize={FONT_SIZE} opacity={0}>
            {NAME}
          </text>
          {layout &&
            [...NAME].map((ch, i) => (
              <motion.text
                key={i}
                x={layout.xs[i]}
                y={0}
                fontFamily={DISPLAY}
                fontWeight={800}
                fontSize={FONT_SIZE}
                stroke="var(--c-gold)"
                strokeWidth={1.6}
                strokeLinejoin="round"
                fill="var(--c-gold)"
                strokeDasharray={800}
                initial={{ strokeDashoffset: 800, fillOpacity: 0 }}
                animate={{ strokeDashoffset: 0, fillOpacity: 1 }}
                transition={{
                  strokeDashoffset: { duration: DRAW, delay: i * STAGGER, ease: [0.65, 0, 0.35, 1] },
                  fillOpacity: { duration: 0.7, delay: fillDelay + i * 0.06, ease: "easeOut" },
                }}
              >
                {ch}
              </motion.text>
            ))}
        </svg>
        <motion.div
          className="h-px w-24 origin-left bg-gold/60"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: layout ? 1 : 0.2 }}
          transition={{ duration: fillDelay + 0.6, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  );
}
