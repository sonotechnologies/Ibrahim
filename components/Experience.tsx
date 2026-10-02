"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { AnimatePresence, MotionConfig } from "framer-motion";
import { ExperienceProvider, useExperience } from "@/lib/experience";
import CursorTrail from "./CursorTrail";
import Gate from "./Gate";
import Hero from "./Hero";
import Lazy from "./Lazy";
import Loader from "./Loader";
import MusicToggle from "./MusicToggle";
import { AmbientParticles } from "./Particles";
import ScrollProgress from "./ScrollProgress";
import SmoothScroll from "./SmoothScroll";

// Scroll scenes below the fold load on approach (see Lazy).
const importers = {
  cake: () => import("./Cake"),
  traits: () => import("./TraitCards"),
  journey: () => import("./Journey"),
  letter: () => import("./Letter"),
  closing: () => import("./Closing"),
};
const Cake = dynamic(importers.cake, { ssr: false });
const TraitCards = dynamic(importers.traits, { ssr: false });
const Journey = dynamic(importers.journey, { ssr: false });
const Letter = dynamic(importers.letter, { ssr: false });
const Closing = dynamic(importers.closing, { ssr: false });

function Page() {
  const { stage, replayToken } = useExperience();

  // Once the hero is playing, warm the scene code in the background.
  useEffect(() => {
    if (stage !== "live") return;
    const warm = () => Object.values(importers).forEach((load) => void load());
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1500));
    idle(warm);
  }, [stage]);

  return (
    <>
      <SmoothScroll />
      <AmbientParticles />
      <ScrollProgress />
      <MusicToggle />
      <CursorTrail />
      {/* Replay remounts every section, so every animation starts over. */}
      <main key={replayToken} className="relative z-[1]" aria-hidden={stage !== "live"}>
        <Hero />
        <Lazy component={Cake} />
        <Lazy component={TraitCards} />
        <Lazy component={Journey} minHeight="300svh" />
        <Lazy component={Letter} minHeight="150svh" />
        <Lazy component={Closing} />
      </main>
      <Gate />
      <AnimatePresence>{stage === "loading" && <Loader key="loader" />}</AnimatePresence>
    </>
  );
}

export default function Experience() {
  return (
    <MotionConfig reducedMotion="user">
      <ExperienceProvider>
        <Page />
      </ExperienceProvider>
    </MotionConfig>
  );
}
