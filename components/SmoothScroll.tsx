"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useExperience } from "@/lib/experience";
import { getLenis, prefersReducedMotion, setLenis } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

/** Lenis drives the scroll; GSAP's ticker drives Lenis so ScrollTrigger scenes stay in lockstep. */
export default function SmoothScroll() {
  const { stage } = useExperience();

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    const lenis = new Lenis({
      lerp: prefersReducedMotion() ? 1 : 0.1,
      smoothWheel: true,
      syncTouch: false,
    });
    setLenis(lenis);
    lenis.stop();
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  useEffect(() => {
    if (stage !== "live") return;
    document.documentElement.classList.remove("locked");
    getLenis()?.start();
    const refresh = () => ScrollTrigger.refresh();
    const t = window.setTimeout(refresh, 400);
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("load", refresh);
    };
  }, [stage]);

  return null;
}
