"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { config, resolveColor, type Chapter } from "@/config";
import Character from "./Character";
import ChapterCard from "./ChapterCard";

gsap.registerPlugin(ScrollTrigger);

const ink = config.theme.character.outline;
const gold = config.theme.colors.gold;
const chapterAccent = (c: Chapter) => resolveColor(c.accent);
/** Every distinct accent gets its own layer; switching chapters crossfades opacity only. */
const ACCENTS = [...new Set(config.chapters.map(chapterAccent))];

function AccentLayers({ current, className, style }: { current: string; className: string; style: (accent: string) => React.CSSProperties }) {
  return (
    <>
      {ACCENTS.map((a) => (
        <motion.div
          key={a}
          aria-hidden
          className={className}
          style={style(a)}
          initial={false}
          animate={{ opacity: a === current ? 1 : 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      ))}
    </>
  );
}

function Ball() {
  return (
    <svg viewBox="0 0 40 40" className="h-full w-full" aria-hidden>
      <circle cx="20" cy="20" r="17" fill="#F5F2EA" stroke={ink} strokeWidth="3" />
      <path d="M20 13 l6.6 4.8 -2.5 7.8 h-8.2 l-2.5 -7.8 z" fill={ink} />
      <path d="M20 13 v-9.5 M26.6 17.8 l9 -2.9 M24.1 25.6 l5.6 7.6 M15.9 25.6 l-5.6 7.6 M13.4 17.8 l-9 -2.9" stroke={ink} strokeWidth="2" />
    </svg>
  );
}

export default function Journey() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [walking, setWalking] = useState(false);
  const chapters = config.chapters;

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // The line draws itself; its tip stays level with the character at the middle of the screen.
      gsap.fromTo(
        line.current,
        { scaleY: 0 },
        { scaleY: 1, ease: "none", scrollTrigger: { trigger: track.current, start: "top center", end: "bottom center", scrub: true } },
      );

      // He walks while the page moves and stops when it stops.
      let stop: ReturnType<typeof setTimeout> | undefined;
      ScrollTrigger.create({
        trigger: track.current,
        start: "top center",
        end: "bottom center",
        onUpdate: (self) => {
          if (Math.abs(self.getVelocity()) < 20) return;
          setWalking(true);
          clearTimeout(stop);
          stop = setTimeout(() => setWalking(false), 220);
        },
        onLeave: () => setWalking(false),
        onLeaveBack: () => setWalking(false),
      });

      cards.current.forEach((card, i) => {
        if (!card) return;
        ScrollTrigger.create({
          trigger: card.querySelector("article") ?? card,
          start: "top 62%",
          end: "bottom 38%",
          onToggle: (self) => self.isActive && setActive(i),
        });
      });
    }, section);
    return () => ctx.revert();
  }, []);

  const chapter = chapters[active];
  const accent = chapterAccent(chapter);
  const special = accent !== gold;
  const outfit = chapter.outfit ?? "everyday";

  return (
    <section
      ref={section}
      data-screen-label="Journey"
      data-chapter={active}
      className="relative py-28 sm:py-36"
    >
      {/* Room tint in the chapter's accent; stronger for a special chapter. Fades at both ends of the section. */}
      <div
        aria-hidden
        className="pointer-events-none sticky top-0 -mb-[100svh] h-[100svh] w-full"
        style={{ maskImage: "linear-gradient(transparent, #000 20%, #000 80%, transparent)" }}
      >
        <motion.div className="absolute inset-0" initial={false} animate={{ opacity: special ? 0.3 : 0.1 }} transition={{ duration: 0.9 }}>
          <AccentLayers
            current={accent}
            className="absolute inset-0"
            style={(a) => ({ background: `radial-gradient(55% 45% at 22% 50%, ${a}, transparent 72%)` })}
          />
        </motion.div>
      </div>

      <motion.div
        className="relative px-4 text-center"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.8 }}
      >
        <p className="text-[12px] uppercase tracking-[0.38em] text-gold">The journey</p>
        <h2 className="mt-3 font-display text-[clamp(40px,10vw,72px)] font-bold leading-[1.02]">The story so far</h2>
      </motion.div>

      <div
        ref={track}
        className="relative mx-auto mt-6 grid max-w-[920px] grid-cols-[var(--rail)_1fr] gap-x-[var(--gap)] px-4 [--char-h:168px] [--gap:14px] [--rail:84px] sm:[--char-h:300px] sm:[--gap:36px] sm:[--rail:170px]"
      >
        <div className="relative">
          <div aria-hidden className="absolute bottom-0 left-1/2 top-0 w-[2px] -translate-x-1/2 bg-gold/15" />
          <div ref={line} aria-hidden className="absolute bottom-0 left-1/2 top-0 w-[3px] origin-top -translate-x-1/2 rounded-full bg-gold">
            <AccentLayers
              current={accent}
              className="absolute inset-0 rounded-full"
              style={(a) => ({ background: `linear-gradient(${gold}, ${a})`, boxShadow: `0 0 14px ${a}` })}
            />
          </div>
          <div className="sticky top-[calc(50svh-var(--char-h)*0.82)] mx-auto h-[var(--char-h)] w-[calc(var(--char-h)/2)]">
            <AccentLayers
              current={accent}
              className="absolute -inset-x-6 bottom-0 top-[20%] rounded-full"
              style={(a) => ({ background: `radial-gradient(closest-side, ${a}59, transparent)` })}
            />
            <Character pose={walking ? "walk" : "idle"} outfit={outfit} className="relative h-full w-full" />
            <AnimatePresence>
              {outfit === "kit" && (
                <motion.div
                  key="ball"
                  className="absolute bottom-[-1%] right-[-22%] h-[15%] aspect-square"
                  initial={{ x: 160, rotate: 540, opacity: 0 }}
                  animate={{ x: 0, rotate: 0, opacity: 1, y: [0, 0, -10, 0, -3, 0] }}
                  exit={{ x: 180, rotate: 540, opacity: 0, transition: { duration: 0.7, ease: "easeIn" } }}
                  transition={{ duration: 1.1, ease: [0.2, 0.8, 0.3, 1], y: { duration: 1.4, times: [0, 0.6, 0.72, 0.84, 0.92, 1] } }}
                >
                  <Ball />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="relative">
          {chapters.map((c, i) => (
            <ChapterCard key={c.title} ref={(el) => { cards.current[i] = el; }} chapter={c} index={i} active={i === active} />
          ))}
        </div>
      </div>
    </section>
  );
}
