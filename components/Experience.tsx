"use client";

import { AnimatePresence, MotionConfig } from "framer-motion";
import { ExperienceProvider, useExperience } from "@/lib/experience";
import Cake from "./Cake";
import Closing from "./Closing";
import Gate from "./Gate";
import Hero from "./Hero";
import Journey from "./Journey";
import Letter from "./Letter";
import Loader from "./Loader";
import MusicToggle from "./MusicToggle";
import ScrollProgress from "./ScrollProgress";
import SmoothScroll from "./SmoothScroll";
import TraitCards from "./TraitCards";

function Page() {
  const { stage } = useExperience();
  return (
    <>
      <SmoothScroll />
      <ScrollProgress />
      <MusicToggle />
      <main aria-hidden={stage !== "live"}>
        <Hero />
        <Cake />
        <TraitCards />
        <Journey />
        <Letter />
        <Closing />
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
