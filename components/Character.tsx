"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { config, type Outfit } from "@/config";
import { prefersReducedMotion } from "@/lib/motion";
import { CharacterFigure, J, REST, type Mood, type MouthShape } from "./CharacterFigure";

export type { Mood };

export type Pose = "idle" | "wave" | "blow" | "celebrate" | "walk" | "read";

type Props = {
  pose?: Pose;
  outfit?: Outfit;
  mood?: Mood;
  /** Eyes follow the pointer or finger. */
  lookAtPointer?: boolean;
  /** Fires when a one-shot pose (wave) finishes and he settles into idle. */
  onPoseComplete?: (pose: Pose) => void;
  className?: string;
  label?: string;
};


export default function Character({
  pose = "idle",
  outfit = "everyday",
  mood = "smile",
  lookAtPointer = true,
  onPoseComplete,
  className,
  label,
}: Props) {
  const svg = useRef<SVGSVGElement>(null);
  const r = {
    body: useRef<SVGGElement>(null),
    upper: useRef<SVGGElement>(null),
    head: useRef<SVGGElement>(null),
    eyes: useRef<SVGGElement>(null),
    eyeL: useRef<SVGGElement>(null),
    eyeR: useRef<SVGGElement>(null),
    brows: useRef<SVGGElement>(null),
    cheeks: useRef<SVGGElement>(null),
    puff: useRef<SVGGElement>(null),
    paper: useRef<SVGGElement>(null),
    armL: useRef<SVGGElement>(null),
    foreL: useRef<SVGGElement>(null),
    armR: useRef<SVGGElement>(null),
    foreR: useRef<SVGGElement>(null),
    legL: useRef<SVGGElement>(null),
    shinL: useRef<SVGGElement>(null),
    legR: useRef<SVGGElement>(null),
    shinR: useRef<SVGGElement>(null),
    shadow: useRef<SVGEllipseElement>(null),
    sparkle: useRef<SVGGElement>(null),
  };
  const completeRef = useRef(onPoseComplete);
  completeRef.current = onPoseComplete;
  const poseRef = useRef(pose);
  poseRef.current = pose;

  // Pivot points, set once.
  useLayoutEffect(() => {
    const set = (el: Element | null, origin: string) => el && gsap.set(el, { svgOrigin: origin });
    set(r.body.current, J.ground);
    set(r.shadow.current, J.ground);
    set(r.upper.current, J.waist);
    set(r.head.current, J.neck);
    set(r.armL.current, J.shoulderL);
    set(r.armR.current, J.shoulderR);
    set(r.foreL.current, J.elbowL);
    set(r.foreR.current, J.elbowR);
    set(r.legL.current, J.hipL);
    set(r.legR.current, J.hipR);
    set(r.shinL.current, J.kneeL);
    set(r.shinR.current, J.kneeR);
    set(r.eyeL.current, J.eyeL);
    set(r.eyeR.current, J.eyeR);
    set(r.cheeks.current, J.cheeks);
    gsap.set(r.armL.current, { rotation: REST.armL });
    gsap.set(r.foreL.current, { rotation: REST.foreL });
    gsap.set(r.armR.current, { rotation: REST.armR });
    gsap.set(r.foreR.current, { rotation: REST.foreR });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poses.
  useLayoutEffect(() => {
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      const ease = "power2.out";
      const settle = reduced ? 0 : 0.35;
      const neutral = () => {
        gsap.to([r.body.current, r.upper.current, r.head.current, r.legL.current, r.legR.current, r.shinL.current, r.shinR.current], {
          x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1, duration: settle, ease, overwrite: "auto",
        });
        gsap.to(r.armL.current, { rotation: REST.armL, duration: settle, ease, overwrite: "auto" });
        gsap.to(r.foreL.current, { rotation: REST.foreL, duration: settle, ease, overwrite: "auto" });
        gsap.to(r.armR.current, { rotation: REST.armR, duration: settle, ease, overwrite: "auto" });
        gsap.to(r.foreR.current, { rotation: REST.foreR, duration: settle, ease, overwrite: "auto" });
        gsap.to(r.shadow.current, { scaleX: 1, opacity: 0.5, duration: settle, overwrite: "auto" });
        gsap.to(r.cheeks.current, { scale: 1, duration: settle, overwrite: "auto" });
        gsap.to(r.puff.current, { opacity: 0, duration: 0.2, overwrite: "auto" });
        gsap.to(r.paper.current, { opacity: 0, duration: 0.2, overwrite: "auto" });
        gsap.to(r.brows.current, { y: 0, duration: settle, overwrite: "auto" });
      };

      const breathe = () => {
        if (reduced) return;
        gsap.timeline({ repeat: -1, yoyo: true, delay: settle })
          .to(r.upper.current, { scaleY: 1.014, y: -0.6, duration: 1.8, ease: "sine.inOut" }, 0)
          .to(r.head.current, { rotation: 1.5, duration: 1.8, ease: "sine.inOut" }, 0);
      };

      neutral();

      switch (pose) {
        case "idle":
          breathe();
          break;

        case "wave": {
          const tl = gsap.timeline({
            delay: 0.1,
            onComplete: () => {
              neutral();
              breathe();
              completeRef.current?.("wave");
            },
          });
          tl.to(r.armR.current, { rotation: -148, duration: reduced ? 0 : 0.45, ease: "back.out(1.6)" })
            .to(r.foreR.current, { rotation: 18, duration: reduced ? 0 : 0.3 }, "<")
            .to(r.head.current, { rotation: -5, duration: 0.4 }, "<")
            .to(r.brows.current, { y: -2, duration: 0.3 }, "<");
          if (!reduced) {
            tl.to(r.foreR.current, { rotation: -28, duration: 0.24, ease: "sine.inOut", yoyo: true, repeat: 5 });
          }
          tl.to({}, { duration: reduced ? 1.2 : 0.15 })
            .to(r.armR.current, { rotation: REST.armR, duration: reduced ? 0 : 0.5, ease: "power2.inOut" })
            .to(r.foreR.current, { rotation: REST.foreR, duration: reduced ? 0 : 0.5 }, "<");
          break;
        }

        case "blow": {
          const t = reduced ? 0 : 0.35;
          gsap.to(r.upper.current, { rotation: 10, duration: t, ease });
          gsap.to(r.head.current, { rotation: 8, y: 2, duration: t, ease });
          gsap.to(r.armL.current, { rotation: 16, duration: t, ease });
          gsap.to(r.armR.current, { rotation: -10, duration: t, ease });
          gsap.to(r.foreR.current, { rotation: 35, duration: t, ease });
          if (!reduced) {
            gsap.timeline({ repeat: -1, delay: t })
              .to(r.cheeks.current, { scale: 1.35, duration: 0.25, ease: "power1.out" })
              .fromTo(r.puff.current, { opacity: 0, x: -4 }, { opacity: 1, x: 6, duration: 0.25 }, "<0.1")
              .to(r.puff.current, { opacity: 0, x: 16, duration: 0.35 })
              .to(r.cheeks.current, { scale: 1, duration: 0.3 }, "<");
          } else {
            gsap.set(r.puff.current, { opacity: 1 });
          }
          break;
        }

        case "celebrate": {
          const t = reduced ? 0 : 0.4;
          gsap.to(r.armL.current, { rotation: 158, duration: t, ease: "back.out(1.7)" });
          gsap.to(r.armR.current, { rotation: -158, duration: t, ease: "back.out(1.7)" });
          gsap.to(r.foreL.current, { rotation: -18, duration: t });
          gsap.to(r.foreR.current, { rotation: 18, duration: t });
          gsap.to(r.brows.current, { y: -3, duration: t });
          if (!reduced) {
            gsap.timeline({ repeat: -1, repeatDelay: 0.55, delay: t })
              .to(r.body.current, { y: -30, duration: 0.3, ease: "power2.out" })
              .to(r.shinL.current, { rotation: 14, duration: 0.3 }, "<")
              .to(r.shinR.current, { rotation: -14, duration: 0.3 }, "<")
              .to(r.shadow.current, { scaleX: 0.65, opacity: 0.25, duration: 0.3 }, "<")
              .to(r.body.current, { y: 0, duration: 0.3, ease: "power2.in" })
              .to([r.shinL.current, r.shinR.current], { rotation: 0, duration: 0.3 }, "<")
              .to(r.shadow.current, { scaleX: 1, opacity: 0.5, duration: 0.3 }, "<")
              .to(r.body.current, { scaleY: 0.95, duration: 0.08, yoyo: true, repeat: 1 });
          }
          break;
        }

        case "walk": {
          if (reduced) break;
          const step = 0.26;
          gsap.timeline({ repeat: -1, delay: 0.1 })
            .to(r.legL.current, { y: -14, duration: step, ease: "sine.out", yoyo: true, repeat: 1 }, 0)
            .to(r.shinL.current, { rotation: -8, duration: step, yoyo: true, repeat: 1 }, 0)
            .to(r.legR.current, { y: -14, duration: step, ease: "sine.out", yoyo: true, repeat: 1 }, step * 2)
            .to(r.shinR.current, { rotation: 8, duration: step, yoyo: true, repeat: 1 }, step * 2)
            .to(r.upper.current, { y: -4, rotation: 2, duration: step, yoyo: true, repeat: 1, ease: "sine.inOut" }, 0)
            .to(r.upper.current, { y: -4, rotation: -2, duration: step, yoyo: true, repeat: 1, ease: "sine.inOut" }, step * 2)
            .to(r.armL.current, { rotation: -6, duration: step * 2, yoyo: true, repeat: 1, ease: "sine.inOut" }, 0)
            .to(r.armR.current, { rotation: 6, duration: step * 2, yoyo: true, repeat: 1, ease: "sine.inOut" }, 0)
            .to(r.head.current, { rotation: 2, duration: step * 2, yoyo: true, repeat: 1, ease: "sine.inOut" }, 0);
          break;
        }

        case "read": {
          const t = reduced ? 0 : 0.6;
          gsap.to(r.paper.current, { opacity: 1, duration: t });
          gsap.to(r.armL.current, { rotation: 34.8, duration: t, ease: "power2.inOut" });
          gsap.to(r.foreL.current, { rotation: -122.7, duration: t, ease: "power2.inOut" });
          gsap.to(r.armR.current, { rotation: -34.8, duration: t, ease: "power2.inOut" });
          gsap.to(r.foreR.current, { rotation: 122.7, duration: t, ease: "power2.inOut" });
          gsap.to(r.head.current, { rotation: -4, y: 3, duration: t });
          gsap.to(r.brows.current, { y: 1.5, duration: t });
          gsap.to(r.eyes.current, { x: 0, y: 3.5, duration: t });
          if (!reduced) {
            gsap.timeline({ repeat: -1, yoyo: true, delay: t })
              .to(r.upper.current, { scaleY: 1.01, duration: 2.4, ease: "sine.inOut" }, 0)
              .to(r.head.current, { rotation: -1, duration: 2.4, ease: "sine.inOut" }, 0);
          }
          break;
        }
      }
    }, svg);
    // Kill rather than revert so the next pose blends from wherever he is now.
    return () => ctx.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pose]);

  // Blinking, every few seconds.
  useEffect(() => {
    let timer: gsap.core.Tween | null = null;
    const blink = () => {
      gsap.to([r.eyeL.current, r.eyeR.current], { scaleY: 0.1, duration: 0.07, yoyo: true, repeat: 1, ease: "power1.in" });
      timer = gsap.delayedCall(2.2 + Math.random() * 3.2, blink);
    };
    timer = gsap.delayedCall(1.5 + Math.random() * 2, blink);
    return () => {
      timer?.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Eyes follow pointer or finger.
  useEffect(() => {
    if (!lookAtPointer) return;
    const eyes = r.eyes.current;
    if (!eyes) return;
    const toX = gsap.quickTo(eyes, "x", { duration: 0.35, ease: "power3.out" });
    const toY = gsap.quickTo(eyes, "y", { duration: 0.35, ease: "power3.out" });
    const look = (px: number, py: number) => {
      if (poseRef.current === "read" || !svg.current) return;
      const b = svg.current.getBoundingClientRect();
      if (b.bottom < 0 || b.top > window.innerHeight) return;
      const ex = b.left + b.width * 0.5;
      const ey = b.top + b.height * (60 / 480);
      const dx = px - ex;
      const dy = py - ey;
      const d = Math.hypot(dx, dy) || 1;
      const reach = Math.min(1, d / 260);
      toX((dx / d) * 3.4 * reach);
      toY((dy / d) * 2.6 * reach);
    };
    const onPointer = (e: PointerEvent) => look(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) look(t.clientX, t.clientY);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onPointer, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove", onTouch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lookAtPointer]);

  // A little squash and sparkle when he changes clothes.
  const firstOutfit = useRef(true);
  useEffect(() => {
    if (firstOutfit.current) {
      firstOutfit.current = false;
      return;
    }
    if (prefersReducedMotion()) return;
    gsap.fromTo(r.body.current, { scaleX: 1.1, scaleY: 0.9 }, { scaleX: 1, scaleY: 1, duration: 0.7, ease: "elastic.out(1, 0.4)", overwrite: false });
    gsap.fromTo(r.sparkle.current, { opacity: 1, scale: 0.4, svgOrigin: "120 240" }, { opacity: 0, scale: 1.4, duration: 0.7, ease: "power2.out" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outfit]);

  const mouth: MouthShape = pose === "blow" ? "puff" : pose === "celebrate" ? "joy" : pose === "read" ? "calm" : mood;

  return (
    <svg
      ref={svg}
      viewBox="0 0 240 480"
      className={className}
      role="img"
      aria-label={label ?? `${config.nickname}, illustrated`}
      overflow="visible"
    >
      <CharacterFigure outfit={outfit} mouth={mouth} refs={r} />
    </svg>
  );
}
