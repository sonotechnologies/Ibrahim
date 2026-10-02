import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { Children, Fragment, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { config } from "@/config";
import { CharacterFigure } from "@/components/CharacterFigure";

export const alt = `Happy Birthday, ${config.nickname}. An illustration of him waving.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const { base, gold, text } = config.theme.colors;
const font = (pkg: string, file: string) => readFile(join(process.cwd(), "node_modules/@fontsource", pkg, "files", file));

/** Satori only accepts plain SVG elements inside <svg>, so expand function components and fragments first. */
function flatten(node: ReactNode): ReactNode {
  if (Array.isArray(node)) return node.map(flatten);
  if (!isValidElement(node)) return node;
  const el = node as ReactElement<{ children?: ReactNode }>;
  if (typeof el.type === "function") return flatten((el.type as (p: unknown) => ReactNode)(el.props));
  if ((el.type as unknown) === Fragment) return Children.toArray(el.props.children).map(flatten);
  return cloneElement(el, undefined, ...Children.toArray(el.props.children).map(flatten));
}

/** The card WhatsApp shows when the link is shared: him waving, beside his name. */
export default async function Image() {
  const [display, displayItalic, body] = await Promise.all([
    font("playfair-display", "playfair-display-latin-800-normal.woff"),
    font("playfair-display", "playfair-display-latin-500-italic.woff"),
    font("dm-sans", "dm-sans-latin-500-normal.woff"),
  ]);

  const figure = flatten(<CharacterFigure mouth="joy" angles={{ armL: 5, foreL: -8, armR: -148, foreR: 18 }} />);

  const dots = [
    [90, 80, 5], [1110, 120, 4], [1040, 520, 6], [640, 70, 3], [180, 560, 4], [980, 300, 3], [560, 580, 5], [760, 140, 4],
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 56,
          background: `radial-gradient(circle at 30% 55%, #3a2c12 0%, ${base} 60%)`,
          color: text,
          position: "relative",
        }}
      >
        {dots.map(([x, y, r], i) => (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: r * 2, height: r * 2, borderRadius: r, background: gold, opacity: 0.7 }} />
        ))}
        <div style={{ display: "flex", position: "relative", width: 290, height: 560 }}>
          <div style={{ position: "absolute", left: -60, right: -60, bottom: 0, height: 200, borderRadius: 200, background: "radial-gradient(ellipse at center, rgba(232,184,74,.4) 0%, rgba(232,184,74,0) 70%)" }} />
          <svg width="280" height="560" viewBox="0 0 240 480" style={{ position: "relative" }}>
            {figure}
          </svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontFamily: "Playfair Italic", fontSize: 56, color: text }}>Happy Birthday,</div>
          <div style={{ fontFamily: "Playfair", fontSize: 230, color: gold, lineHeight: 0.95, letterSpacing: -6 }}>{config.nickname}</div>
          <div style={{ fontFamily: "DM Sans", fontSize: 32, color: text, opacity: 0.8, marginTop: 18 }}>Today is about you.</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Playfair", data: display, weight: 800, style: "normal" },
        { name: "Playfair Italic", data: displayItalic, weight: 500, style: "italic" },
        { name: "DM Sans", data: body, weight: 500, style: "normal" },
      ],
    },
  );
}
