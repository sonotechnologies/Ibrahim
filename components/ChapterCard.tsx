"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { resolveColor, type Chapter } from "@/config";

function PitchLines({ color }: { color: string }) {
  return (
    <svg aria-hidden viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" className="pointer-events-none absolute inset-0 h-full w-full" style={{ opacity: 0.12 }}>
      <g fill="none" stroke={color} strokeWidth="1.2">
        <rect x="6" y="6" width="188" height="108" />
        <line x1="100" y1="6" x2="100" y2="114" />
        <circle cx="100" cy="60" r="20" />
        <rect x="6" y="34" width="26" height="52" />
        <rect x="168" y="34" width="26" height="52" />
      </g>
    </svg>
  );
}

type Props = { chapter: Chapter; index: number; active: boolean };

const ChapterCard = forwardRef<HTMLDivElement, Props>(function ChapterCard({ chapter, index, active }, ref) {
  const accent = resolveColor(chapter.accent);
  const special = Boolean(chapter.accent && chapter.accent !== "gold");

  return (
    <div ref={ref} className="relative flex min-h-[78svh] items-center py-[10svh]">
      {/* The dot on the line: a ring, with a glowing fill that fades in when he reaches it */}
      <span
        aria-hidden
        className="absolute top-1/2 grid h-4 w-4 -translate-y-1/2 place-items-center rounded-full border-2 bg-base"
        style={{ left: "calc(-1 * (var(--rail) / 2 + var(--gap)) - 8px)", borderColor: accent }}
      >
        <motion.span
          className="h-4 w-4 rounded-full"
          style={{ background: accent, boxShadow: `0 0 18px ${accent}` }}
          initial={false}
          animate={{ opacity: active ? 1 : 0, scale: active ? 1.25 : 0.4 }}
          transition={{ duration: 0.5 }}
        />
      </span>
      <motion.article
        initial={{ opacity: 0, x: 70, rotate: 2 }}
        whileInView={{ opacity: 1, x: 0, rotate: 0 }}
        viewport={{ once: true, amount: 0.45 }}
        transition={{ type: "spring", stiffness: 70, damping: 16 }}
        className="relative w-full overflow-hidden rounded-[22px] border p-5 sm:p-9"
        style={{
          borderColor: special ? `${accent}66` : "rgba(232,184,74,.14)",
          background: special ? `linear-gradient(160deg, ${accent}22, var(--c-surface) 55%)` : "var(--c-surface)",
        }}
      >
        {special && <PitchLines color={accent} />}
        {special && <div aria-hidden className="absolute inset-x-0 top-0 h-[3px]" style={{ background: accent }} />}
        <p className="relative text-[11px] font-bold uppercase tracking-[0.3em] sm:text-[12px]" style={{ color: accent }}>
          Chapter {String(index + 1).padStart(2, "0")}
        </p>
        <h3 className="relative mt-2 font-display text-[clamp(28px,7.6vw,46px)] font-bold leading-[1.05]">{chapter.title}</h3>
        <p className="relative mt-3 text-[16px] leading-[1.65] text-cream/85 text-pretty sm:text-[18px]">{chapter.text}</p>
        {chapter.note && (
          <p className="relative mt-4 text-[14px] font-medium sm:text-[15px]" style={{ color: special ? "#FF8A9A" : accent }}>
            {chapter.note}
          </p>
        )}
      </motion.article>
    </div>
  );
});

export default ChapterCard;
