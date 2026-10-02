# Happy Birthday, Ibro

A single-page, mobile-first birthday tribute, built to be opened from a WhatsApp link.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Framer Motion · GSAP + ScrollTrigger · Lenis · canvas-confetti

## Editing the content

Everything personal lives in **`config.ts`**: name, nickname, traits, chapters, the letter, the closing wish, the sign-off, the colours (`theme.colors`, `theme.character`) and the fonts (`theme.fonts`). Change it there and the whole page follows.

- `candleCount` is fixed at 5. His age is never shown.
- A chapter can set `outfit: "kit"` (the character changes into the black and gold kit and a ball rolls in) and `accent: "red"` (any key from `theme.colors`, or a CSS colour).
- `musicSrc`: put an audio file in `public/` and set e.g. `"/music.mp3"`. Without it, the music button plays a soft synthesised music-box "Happy Birthday". Music is **off by default**; the gate tap only unlocks audio. Small sound effects (candle puffs, pops, a chime) play regardless.
- Traits, chapters and the letter render straight from config: add, remove or reorder entries and the page follows. The site reads fine without the football chapter.

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
| `Particles` | Hero: gold dust and balloons in three depth layers, with parallax on scroll and device tilt. `AmbientParticles`: slow motes behind the whole page, which slow almost to a stop while the letter is read |
| `Cake` | Tap candles out (smoke wisps). On the last one he blows, the room dims, then the wish confetti |
| `TraitCards` | Dealt in like cards, tilt in 3D toward the finger, words scramble into place |
| `Journey` / `ChapterCard` | Line draws with scroll, character walks while you scroll, accent colour and outfit follow the chapter |
| `Letter` | Envelope opens, paper slides out, the letter writes itself word by word, he reads |
| `Closing` / `Fireworks` | The wish, fireworks behind it, he celebrates then waves goodbye, Replay remounts every section |
| `Character` | Inline SVG built from named groups (head, eyes, brows, mouth, torso, arms, hands, legs). Props: `pose` (idle, wave, blow, celebrate, walk, read), `outfit`, `mood`. Blinks, breathes, eyes follow the pointer or finger |
| `MusicToggle`, `ScrollProgress`, `SmoothScroll` | Music on/off, gold progress bar, Lenis wired into GSAP's ticker |
| `Magnetic`, `CursorTrail` | Hover lean and press feedback on every button; gold cursor trail (desktop mouse only) |
| `Lazy` | Mounts each scene below the hero only as you approach it |
| `CharacterFigure` | The character drawing itself, with no behaviour; also used for the link-preview image |

## Performance and accessibility

- Animations use transform and opacity. The exceptions are the loader's stroke drawing and the candle flames' path morph, both of which the brief asks for.
- Particles are capped at about 40 on phones and 120 on larger screens. Canvases stop drawing when they're off screen or the tab is hidden.
- Tap targets are at least 48px.
- The site serves about 0.9 MB of JS and CSS before compression, plus Google Fonts.
- `prefers-reduced-motion` turns movement into simple fades. There's no confetti, fireworks, balloons, parallax, tilt or cursor trail, and poses switch without tweening.

No photographs are used anywhere; he only appears as the illustrated character. The original Claude Design handoff (`project/`, `chats/`, `HANDOFF.md`) is kept for reference. Its photos are not served by the site.
