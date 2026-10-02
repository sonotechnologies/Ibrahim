import type { Ref } from "react";
import { config, type Outfit } from "@/config";

/*
 * The drawing of Ibro, with no behaviour. Character.tsx animates it; the
 * link-preview image renders it as a still. Every part is a named group.
 */

export type Mood = "smile" | "joy" | "calm";
export type MouthShape = Mood | "puff";

export type PartName =
  | "shadow" | "sparkle" | "body" | "upper" | "head" | "eyes" | "eyeL" | "eyeR" | "brows" | "cheeks" | "puff" | "paper"
  | "armL" | "foreL" | "armR" | "foreR" | "legL" | "shinL" | "legR" | "shinR";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PartRefs = Partial<Record<PartName, Ref<any>>>;

/** Static arm angles in degrees, for stills. Animated use leaves these out. */
export type ArmAngles = Partial<Record<"armL" | "foreL" | "armR" | "foreR", number>>;

const c = config.theme.character;
const OUT = 4; // outline width
const MOUTH_DARK = "#2A0F0C";

/* Joint positions in the 240 × 480 viewBox. Every animated group pivots on one of these. */
export const J = {
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

export const REST = { armL: 5, foreL: -8, armR: -5, foreR: 8 };

/** A bold-outlined capsule: an ink stroke with a narrower coloured stroke on top. */
function Limb({ x1, y1, x2, y2, w, fill }: { x1: number; y1: number; x2: number; y2: number; w: number; fill: string }) {
  return (
    <>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c.outline} strokeWidth={w + OUT * 1.6} strokeLinecap="round" />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={fill} strokeWidth={w} strokeLinecap="round" />
    </>
  );
}

function Leg({ side, outfit, legRef, shinRef }: { side: "L" | "R"; outfit: Outfit; legRef?: Ref<SVGGElement>; shinRef?: Ref<SVGGElement> }) {
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

function Arm({ side, outfit, armRef, foreRef, angle, foreAngle }: { side: "L" | "R"; outfit: Outfit; armRef?: Ref<SVGGElement>; foreRef?: Ref<SVGGElement>; angle?: number; foreAngle?: number }) {
  const x = side === "L" ? 86 : 154;
  const rot = (a: number | undefined, y: number) => (a === undefined ? undefined : `rotate(${a} ${x} ${y})`);
  const kit = outfit === "kit";
  return (
    <g ref={armRef} data-part={`arm${side}`} transform={rot(angle, 120)}>
      <Limb x1={x} y1={122} x2={x} y2={176} w={16} fill={c.skin} />
      <Limb x1={x} y1={120} x2={x} y2={146} w={27} fill={kit ? c.kit : c.tee} />
      {kit && <line x1={x - 12.5} y1={151} x2={x + 12.5} y2={151} stroke={c.kitTrim} strokeWidth={3.5} strokeLinecap="round" />}
      <g ref={foreRef} data-part={`fore${side}`} transform={rot(foreAngle, 176)}>
        <Limb x1={x} y1={176} x2={x} y2={224} w={14.5} fill={c.skin} />
        <g data-part={`hand${side}`}>
          <circle cx={x} cy={232} r={9.5} fill={c.skin} stroke={c.outline} strokeWidth={OUT * 0.85} />
          <path d={side === "L" ? `M ${x + 6} 226 q 5 2 4 8` : `M ${x - 6} 226 q -5 2 -4 8`} fill="none" stroke={c.outline} strokeWidth={2.5} strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
}

function Mouth({ shape }: { shape: MouthShape }) {
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

export function CharacterFigure({ outfit = "everyday", mouth = "smile", refs, angles }: { outfit?: Outfit; mouth?: MouthShape; refs?: PartRefs; angles?: ArmAngles }) {
  const kit = outfit === "kit";
  return (
    <>
      <ellipse ref={refs?.shadow} cx={120} cy={470} rx={48} ry={6} fill="#000" opacity={0.5} />

      <g ref={refs?.sparkle} opacity={0} stroke={c.kitTrim} strokeWidth={4} strokeLinecap="round">
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2;
          const p = (v: number) => Math.round(v * 10) / 10;
          return <line key={i} x1={p(120 + Math.cos(a) * 130)} y1={p(240 + Math.sin(a) * 210)} x2={p(120 + Math.cos(a) * 150)} y2={p(240 + Math.sin(a) * 236)} />;
        })}
      </g>

      <g ref={refs?.body} data-part="body" strokeLinejoin="round">
        <Leg side="L" outfit={outfit} legRef={refs?.legL} shinRef={refs?.shinL} />
        <Leg side="R" outfit={outfit} legRef={refs?.legR} shinRef={refs?.shinR} />
        <path d="M 92 218 L 148 218 L 151 254 Q 120 262 89 254 Z" fill={kit ? c.kit : c.trousers} stroke={c.outline} strokeWidth={OUT} />
        {!kit && <line x1={120} y1={232} x2={120} y2={258} stroke={c.outline} strokeWidth={2.5} strokeLinecap="round" opacity={0.6} />}

        <g ref={refs?.upper} data-part="upper">
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
                <line x1={100} y1={168} x2={140} y2={168} stroke={c.kitTrim} strokeWidth={3} strokeLinecap="round" opacity={0.85} />
              </>
            ) : (
              <>
                <path d="M 109 106 Q 120 117 131 106" fill="none" stroke={c.outline} strokeWidth={3.5} strokeLinecap="round" />
                <path d="M 96 200 q 4 10 2 30" fill="none" stroke={c.outline} strokeWidth={2} strokeLinecap="round" opacity={0.25} />
              </>
            )}
          </g>

          <g ref={refs?.paper} data-part="paper" opacity={0}>
            <rect x={104} y={132} width={32} height={38} rx={2} fill={config.theme.colors.paper} stroke={c.outline} strokeWidth={3} transform="rotate(-4 120 151)" />
            <g stroke={c.outline} strokeWidth={1.6} strokeLinecap="round" opacity={0.45} transform="rotate(-4 120 151)">
              <line x1={110} y1={142} x2={130} y2={142} />
              <line x1={110} y1={149} x2={128} y2={149} />
              <line x1={110} y1={156} x2={130} y2={156} />
            </g>
          </g>

          <Arm side="L" outfit={outfit} armRef={refs?.armL} foreRef={refs?.foreL} angle={angles?.armL} foreAngle={angles?.foreL} />
          <Arm side="R" outfit={outfit} armRef={refs?.armR} foreRef={refs?.foreR} angle={angles?.armR} foreAngle={angles?.foreR} />

          <g ref={refs?.head} data-part="head">
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

            <g ref={refs?.cheeks} data-part="cheeks">
              <ellipse cx={100} cy={74} rx={6.5} ry={3.6} fill={c.blush} opacity={0.55} />
              <ellipse cx={140} cy={74} rx={6.5} ry={3.6} fill={c.blush} opacity={0.55} />
            </g>

            <g ref={refs?.brows} data-part="brows" fill="none" stroke={c.outline} strokeWidth={3.4} strokeLinecap="round">
              <path d="M 100 49 Q 107 44.5 114 48" />
              <path d="M 126 48 Q 133 44.5 140 49" />
            </g>

            <g ref={refs?.eyes} data-part="eyes">
              <g ref={refs?.eyeL} data-part="eyeL">
                <ellipse cx={107} cy={60} rx={3.9} ry={5} fill={c.outline} />
                <circle cx={108.4} cy={58.2} r={1.3} fill="#FFFFFF" />
              </g>
              <g ref={refs?.eyeR} data-part="eyeR">
                <ellipse cx={133} cy={60} rx={3.9} ry={5} fill={c.outline} />
                <circle cx={134.4} cy={58.2} r={1.3} fill="#FFFFFF" />
              </g>
            </g>

            <path d="M 119 65 Q 116 72.5 121.5 72.5" fill="none" stroke={c.outline} strokeWidth={2.6} strokeLinecap="round" opacity={0.7} />

            <g data-part="mouth">
              <Mouth shape={mouth} />
            </g>

            <g ref={refs?.puff} data-part="puff" opacity={0} stroke={config.theme.colors.text} strokeWidth={2.6} strokeLinecap="round" fill="none">
              <path d="M 134 77 q 6 -2 12 0" />
              <path d="M 136 82 q 8 0 16 0" />
              <path d="M 134 87 q 6 2 12 0" />
            </g>
          </g>
        </g>
      </g>
    </>
  );
}
