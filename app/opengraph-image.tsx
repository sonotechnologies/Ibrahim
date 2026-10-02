import { ImageResponse } from "next/og";
import { config } from "@/config";

export const alt = `Happy Birthday, ${config.nickname}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const { base, gold, text, surface } = config.theme.colors;

/** The card WhatsApp shows when the link is shared. */
export default function Image() {
  const candles = Array.from({ length: config.candleCount });
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: `radial-gradient(circle at 50% 40%, #2a2214 0%, ${base} 65%)`,
          color: text,
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", gap: 34, alignItems: "flex-end", marginBottom: 18 }}>
          {candles.map((_, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 18, height: 28, borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", background: "#F7C95A", boxShadow: "0 0 30px #F7C95A" }} />
              <div style={{ width: 12, height: 54, marginTop: 6, borderRadius: 3, background: `linear-gradient(${text}, ${gold})` }} />
            </div>
          ))}
        </div>
        <div style={{ width: 420, height: 14, borderRadius: 7, background: surface, border: `2px solid ${gold}` }} />
        <div style={{ marginTop: 40, fontSize: 44, fontStyle: "italic" }}>Happy Birthday,</div>
        <div style={{ fontSize: 190, fontWeight: 800, color: gold, lineHeight: 1, letterSpacing: -4 }}>{config.nickname}</div>
        <div style={{ marginTop: 22, fontSize: 30, opacity: 0.8, fontFamily: "sans-serif" }}>Today is about you.</div>
      </div>
    ),
    size,
  );
}
