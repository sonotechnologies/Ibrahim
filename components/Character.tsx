"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { config, type Outfit } from "@/config";
import { prefersReducedMotion } from "@/lib/motion";

export type Pose = "idle" | "wave" | "blow" | "celebrate" | "walk" | "read";
export type Mood = "smile" | "joy" | "calm";

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

const c = config.theme.character;
const OUT = 4; // outline width
const MOUTH_DARK = "#2A0F0C";

/* Joint positions in the 240 × 480 viewBox. Every animated group pivots on one of these. */
const J = {
  ground: "120 470",
  waist: "120 232",
  neck: "120 98",
  shoulderL: "86 120",
  shoulderR: "154 120",
  elbowL: "86 176",
  elbowR: "154 176",
  hipL: "107 228",
  hipR: "133 228",
  kneeL: "107 340",
  kneeR: "133 340",
  eyeL: "107 60",
  eyeR: "133 60",
  cheeks: "120 74",
};

const REST = { armL: 5, foreL: -8, armR: -5, foreR: 8 };

/** A bold-outlined capsule: an ink stroke with a narrower coloured stroke on top. */
function Limb({ x1, y1, x2, y2, w, fill }: { x1: number; y1: number; x2: number; y2: number; w: number; fill: string }) {
  return (
    <>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c.outline} strokeWidth={w + OUT * 1.6} strokeLinecap="round" />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={fill} strokeWidth={w} strokeLinecap="round" />
    </>
  );
}

function Leg({ side, outfit, legRef, shinRef }: { side: "L" | "R"; outfit: Outfit; legRef: React.Ref<SVGGElement>; shinRef: React.Ref<SVGGElement> }) {
  const x = side === "L" ? 107 : 133;
  const dir = side === "L" ? -1 : 1;
  const kit = outfit === "kit";
  const shoe = `M ${x - dir * 9} 442 L ${x - dir * 9} 467 L ${x + dir * 22} 467 Q ${x + dir * 25} 455 ${x + dir * 9} 449 L ${x + dir * 9} 442 Z`;
  return (
    <g ref={legRef} data-part={`leg${side}`}>
      {kit ? (
        <>
          <Limb x1={x} y1={232} x2={x} y2={340} w={17} fill={c.skin} />
          <Limb x1={x} y1={228} x2={x} y2={290} w={25} fill={c.kit} />
          <line x1={x + dir * 10} y1={240} x2={x + dir * 10} y2={292} stroke={c.kitTrim} strokeWidth={3} strokeLinecap="round" />
        </>
      ) : (
        <Limb x1={x} y1={228} x2={x} y2={340} w={21} fill={c.trousers} />
      )}
      <g ref={shinRef} data-part={`shin${side}`}>
        {kit ? (
          <>
            <Limb x1={x} y1={340} x2={x} y2={444} w={16} fill={c.skin} />
            <Limb x1={x} y1={386} x2={x} y2={446} w={18} fill={c.kit} />
            <line x1={x - 9} y1={394} x2={x + 9} y2={394} stroke={c.kitTrim} strokeWidth={4} />
          </>
        ) : (
          <Limb x1={x} y1={338} x2={x} y2={442} w={19} fill={c.trousers} />
        )}
        <path d={shoe} fill={c.shoe} stroke={c.outline} strokeWidth={OUT} strokeLinejoin="round" />
        <line x1={x - dir * 8} y1={462} x2={x + dir * 21} y2={462} stroke={c.kitTrim} strokeWidth={3} strokeLinecap="round" />
        {kit && (
          <g fill={c.outline}>
            <circle cx={x - dir * 3} cy={469} r={1.8} />
            <circle cx={x + dir * 6} cy={469} r={1.8} />
            <circle cx={x + dir * 15} cy={469} r={1.8} />
          </g>
        )}
      </g>
    </g>
  );
}

function Arm({ side, outfit, armRef, foreRef }: { side: "L" | "R"; outfit: Outfit; armRef: React.Ref<SVGGElement>; foreRef: React.Ref<SVGGElement> }) {
  const x = side === "L" ? 86 : 154;
  const kit = outfit === "kit";
  return (
    <g ref={armRef} data-part={`arm${side}`}>
      <Limb x1={x} y1={122} x2={x} y2={176} w={16} fill={c.skin} />
      <Limb x1={x} y1={120} x2={x} y2={146} w={27} fill={kit ? c.kit : c.tee} />
      {kit && <line x1={x - 12.5} y1={151} x2={x + 12.5} y2={151} stroke={c.kitTrim} strokeWidth={3.5} strokeLinecap="round" />}
      <g ref={foreRef} data-part={`fore${side}`}>
        <Limb x1={x} y1={176} x2={x} y2={224} w={14.5} fill={c.skin} />
        <g data-part={`hand${side}`}>
          <circle cx={x} cy={232} r={9.5} fill={c.skin} stroke={c.outline} strokeWidth={OUT * 0.85} />
          <path d={side === "L" ? `M ${x + 6} 226 q 5 2 4 8` : `M ${x - 6} 226 q -5 2 -4 8`} fill="none" stroke={c.outline} strokeWidth={2.5} strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
}

function Mouth({ shape }: { shape: Mood | "puff" }) {
  if (shape === "puff") return <ellipse cx={122} cy={81} rx={4.2} ry={4.8} fill={MOUTH_DARK} stroke={c.outline} strokeWidth={3} />;
  if (shape === "joy")
    return (
      <g>
        <path d="M 107 76 Q 120 97 133 76 Z" fill={MOUTH_DARK} stroke={c.outline} strokeWidth={3} strokeLinejoin="round" />
        <path d="M 109.5 77.5 Q 120 81 130.5 77.5 L 129 81 Q 120 84.5 111 81 Z" fill="#FFFFFF" />
      </g>
    );
  if (shape === "calm") return <path d="M 112 80 Q 120 85.5 128 80" fill="none" stroke={c.outline} strokeWidth={3.4} strokeLinecap="round" />;
  return <path d="M 109 78 Q 120 89 131 78" fill="none" stroke={c.outline} strokeWidth={3.6} strokeLinecap="round" />;
}

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

  const kit = outfit === "kit";
  const mouth: Mood | "puff" = pose === "blow" ? "puff" : pose === "celebrate" ? "joy" : pose === "read" ? "calm" : mood;

  return (
    <svg
      ref={svg}
      viewBox="0 0 240 480"
      className={className}
      role="img"
      aria-label={label ?? `${config.nickname}, illustrated`}
      overflow="visible"
    >
      <ellipse ref={r.shadow} cx={120} cy={470} rx={48} ry={6} fill="#000" opacity={0.5} />

      <g ref={r.sparkle} opacity={0} stroke={c.kitTrim} strokeWidth={4} strokeLinecap="round">
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2;
          const p = (v: number) => Math.round(v * 10) / 10;
          return <line key={i} x1={p(120 + Math.cos(a) * 130)} y1={p(240 + Math.sin(a) * 210)} x2={p(120 + Math.cos(a) * 150)} y2={p(240 + Math.sin(a) * 236)} />;
        })}
      </g>

      <g ref={r.body} data-part="body" strokeLinejoin="round">
        <Leg side="L" outfit={outfit} legRef={r.legL} shinRef={r.shinL} />
        <Leg side="R" outfit={outfit} legRef={r.legR} shinRef={r.shinR} />
        <path d="M 92 218 L 148 218 L 151 254 Q 120 262 89 254 Z" fill={kit ? c.kit : c.trousers} stroke={c.outline} strokeWidth={OUT} />
        {!kit && <line x1={120} y1={232} x2={120} y2={258} stroke={c.outline} strokeWidth={2.5} strokeLinecap="round" opacity={0.6} />}

        <g ref={r.upper} data-part="upper">
          <g data-part="neck">
            <rect x={111} y={86} width={18} height={30} fill={c.skin} stroke={c.outline} strokeWidth={OUT} />
            <rect x={113} y={100} width={14} height={8} fill={c.skinShade} />
          </g>

          <g data-part="torso">
            <path d="M 86 112 Q 120 101 154 112 L 160 130 L 150 238 Q 120 244 90 238 L 80 130 Z" fill={kit ? c.kit : c.tee} stroke={c.outline} strokeWidth={OUT} />
            <path d="M 140 112 L 156 120 L 148 236 Q 141 238.5 135 239 Z" fill={kit ? "#FFFFFF" : c.outline} opacity={kit ? 0.05 : 0.08} />
            {kit ? (
              <>
                <path d="M 108 107 L 120 124 L 132 107" fill="none" stroke={c.kitTrim} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 91 115 Q 100 110 108 108 M 149 115 Q 140 110 132 108" fill="none" stroke={c.kitTrim} strokeWidth={3.5} strokeLinecap="round" />
                <path d="M 134 136 h 12 v 7 q 0 7 -6 10 q -6 -3 -6 -10 z" fill="none" stroke={c.kitTrim} strokeWidth={2.5} strokeLinejoin="round" />
                <line x1={100} y1={168} x2={140} y2={168} stroke={c.kitTrim} strokeWidth={3} strokeLinecap="round" opacity={0.85} />
              </>
            ) : (
              <>
                <path d="M 109 106 Q 120 117 131 106" fill="none" stroke={c.outline} strokeWidth={3.5} strokeLinecap="round" />
                <path d="M 96 200 q 4 10 2 30" fill="none" stroke={c.outline} strokeWidth={2} strokeLinecap="round" opacity={0.25} />
              </>
            )}
          </g>

          <g ref={r.paper} data-part="paper" opacity={0}>
            <rect x={104} y={132} width={32} height={38} rx={2} fill={config.theme.colors.paper} stroke={c.outline} strokeWidth={3} transform="rotate(-4 120 151)" />
            <g stroke={c.outline} strokeWidth={1.6} strokeLinecap="round" opacity={0.45} transform="rotate(-4 120 151)">
              <line x1={110} y1={142} x2={130} y2={142} />
              <line x1={110} y1={149} x2={128} y2={149} />
              <line x1={110} y1={156} x2={130} y2={156} />
            </g>
          </g>

          <Arm side="L" outfit={outfit} armRef={r.armL} foreRef={r.foreL} />
          <Arm side="R" outfit={outfit} armRef={r.armR} foreRef={r.foreR} />

          <g ref={r.head} data-part="head">
            <ellipse cx={89} cy={64} rx={6} ry={9} fill={c.skin} stroke={c.outline} strokeWidth={OUT} />
            <ellipse cx={151} cy={64} rx={6} ry={9} fill={c.skin} stroke={c.outline} strokeWidth={OUT} />
            <ellipse cx={120} cy={60} rx={31} ry={36} fill={c.skin} stroke={c.outline} strokeWidth={OUT} />
            <path
              data-part="hair"
              d="M 89.5 56 C 87 29 103 19 120 19 C 137 19 153 29 150.5 56 C 147 44 137 37.5 120 37.5 C 103 37.5 93 44 89.5 56 Z"
              fill={c.hair}
              stroke={c.outline}
              strokeWidth={OUT}
            />
            <path d="M 104 26 Q 120 21 136 26" fill="none" stroke="#FFFFFF" strokeOpacity={0.12} strokeWidth={2} strokeLinecap="round" />

            <g ref={r.cheeks} data-part="cheeks">
              <ellipse cx={100} cy={74} rx={6.5} ry={3.6} fill={c.blush} opacity={0.55} />
              <ellipse cx={140} cy={74} rx={6.5} ry={3.6} fill={c.blush} opacity={0.55} />
            </g>

            <g ref={r.brows} data-part="brows" fill="none" stroke={c.outline} strokeWidth={3.4} strokeLinecap="round">
              <path d="M 100 49 Q 107 44.5 114 48" />
              <path d="M 126 48 Q 133 44.5 140 49" />
            </g>

            <g ref={r.eyes} data-part="eyes">
              <g ref={r.eyeL} data-part="eyeL">
                <ellipse cx={107} cy={60} rx={3.9} ry={5} fill={c.outline} />
                <circle cx={108.4} cy={58.2} r={1.3} fill="#FFFFFF" />
              </g>
              <g ref={r.eyeR} data-part="eyeR">
                <ellipse cx={133} cy={60} rx={3.9} ry={5} fill={c.outline} />
                <circle cx={134.4} cy={58.2} r={1.3} fill="#FFFFFF" />
              </g>
            </g>

            <path d="M 119 65 Q 116 72.5 121.5 72.5" fill="none" stroke={c.outline} strokeWidth={2.6} strokeLinecap="round" opacity={0.7} />

            <g data-part="mouth">
              <Mouth shape={mouth} />
            </g>

            <g ref={r.puff} data-part="puff" opacity={0} stroke={config.theme.colors.text} strokeWidth={2.6} strokeLinecap="round" fill="none">
              <path d="M 134 77 q 6 -2 12 0" />
              <path d="M 136 82 q 8 0 16 0" />
              <path d="M 134 87 q 6 2 12 0" />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
