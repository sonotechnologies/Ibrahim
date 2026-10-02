import type { Metadata, Viewport } from "next";
import type { CSSProperties } from "react";
import { config } from "@/config";
import "./globals.css";

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: `Happy Birthday, ${config.nickname}`,
  description: "Today is about you.",
  openGraph: {
    title: `Happy Birthday, ${config.nickname}`,
    description: "Today is about you. Tap to open.",
    type: "website",
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: config.theme.colors.base,
};

const { colors, fonts } = config.theme;

const tokens = {
  "--c-base": colors.base,
  "--c-gold": colors.gold,
  "--c-surface": colors.surface,
  "--c-text": colors.text,
  "--c-red": colors.red,
  "--c-paper": colors.paper,
  "--c-ink": colors.ink,
  "--c-gold-ink": colors.goldInk,
  "--f-display": fonts.display,
  "--f-body": fonts.body,
} as CSSProperties;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={tokens} className="locked">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href={fonts.googleHref} />
      </head>
      <body>{children}</body>
    </html>
  );
}
