# Happy Birthday, Ibro

A single-page, mobile-first birthday tribute, built to be opened from a WhatsApp link.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Framer Motion · GSAP + ScrollTrigger · Lenis · canvas-confetti

## Editing the content

Everything personal lives in **`config.ts`**: name, nickname, traits, chapters, the letter, the closing wish, the sign-off, the colours (`theme.colors`, `theme.character`) and the fonts (`theme.fonts`). Change it there and the whole page follows.

- `candleCount` is fixed at 5. His age is never shown.
- A chapter can set `outfit: "kit"` (the character changes into the black and gold kit and a ball rolls in) and `accent: "red"` (any key from `theme.colors`, or a CSS colour).
- `musicSrc`: put an audio file in `public/` and set e.g. `"/music.mp3"`. Without it, a soft synthesised music-box "Happy Birthday" plays after the first tap. The speaker button turns all sound off and on.

## Running locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build + type check
```

## Deploying on Vercel

Import the repository in Vercel. It detects Next.js and needs no settings. The link-preview image (`app/opengraph-image.tsx`) uses `VERCEL_PROJECT_PRODUCTION_URL` automatically for absolute URLs.

## How it's put together

| Component | Role |
| --- | --- |
| `Loader` | His name writes itself letter by letter |
| `Gate` | "Tap to start". Unlocks audio and motion sensors, then opens the curtain |
| `Hero` | Character drops in and waves, headline springs in letter by letter, one confetti burst |
| `Particles` | Gold dust and balloons in three depth layers, with parallax on scroll and device tilt |
| `Cake` | Tap candles out (smoke wisps). On the last one he blows, the room dims, then the wish confetti |
| `TraitCards` | Dealt in like cards, tilt in 3D toward the finger, words scramble into place |
| `Journey` / `ChapterCard` | Line draws with scroll, character walks while you scroll, accent colour and outfit follow the chapter |
| `Letter` | Envelope opens, paper slides out, the letter writes itself word by word |
| `Closing` / `Fireworks` | The wish, the sign-off, fireworks and Replay |
| `Character` | Inline SVG built from named groups (head, eyes, brows, mouth, torso, arms, hands, legs). Props: `pose` (idle, wave, blow, celebrate, walk, read), `outfit`, `mood`. Blinks, breathes, eyes follow the pointer or finger |
| `MusicToggle`, `ScrollProgress`, `SmoothScroll` | Sound on/off, gold progress bar, Lenis wired into GSAP's ticker |

Motion respects `prefers-reduced-motion`: no confetti, fireworks or parallax, and poses switch without tweening.

No photographs are used anywhere; he only appears as the illustrated character. The original Claude Design handoff (`project/`, `chats/`, `HANDOFF.md`) is kept for reference. Its photos are not served by the site.
