/**
 * Everything personal about the site lives here.
 * Change words, colours or fonts in this file and the whole page follows.
 */

export type Outfit = "everyday" | "kit";

export type Trait = { word: string; line: string };

export type Chapter = {
  title: string;
  text: string;
  /** Which clothes the character wears while this chapter is on screen. Defaults to "everyday". */
  outfit?: Outfit;
  /** A colour key from theme.colors, or any CSS colour. Defaults to "gold". */
  accent?: string;
  /** An optional short line shown under the text in the accent colour. */
  note?: string;
};

const theme = {
  colors: {
    base: "#0B0B0D", // page background
    gold: "#E8B84A", // primary
    surface: "#17171B", // cards
    text: "#F5F2EA", // body text
    red: "#C8102E", // football chapter only
    paper: "#F7F1E3", // letter paper
    ink: "#1C1A17", // letter text
    goldInk: "#8A5A0B", // gold that stays readable on paper
  },
  character: {
    outline: "#0B0B0D",
    skin: "#5C3A24",
    skinShade: "#4A2D1B",
    hair: "#161113",
    tee: "#F5F2EA",
    trousers: "#3A4256",
    shoe: "#F5F2EA",
    kit: "#1D1D22",
    kitTrim: "#E8B84A",
    blush: "#8A4430",
  },
  fonts: {
    display: "'Playfair Display', Georgia, 'Times New Roman', serif",
    body: "'DM Sans', system-ui, -apple-system, 'Segoe UI', sans-serif",
    /** Loaded once in the page head. Keep in step with the families above. */
    googleHref:
      "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;0,800;1,500&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&display=swap",
  },
};

export const config = {
  name: "Ibrahim",
  nickname: "Ibro",
  theme,

  /** Fixed. His age is never shown. */
  candleCount: 5,

  traits: [
    { word: "Loyal", line: "If you call, he comes. He asks what happened afterwards." },
    { word: "Driven", line: "Up early, home late, and still asking for one more go." },
    { word: "Funny", line: "Quiet for ten minutes, then one line and the whole room is gone." },
    { word: "Calm", line: "When everyone else is rushing, he takes a breath and sorts it out." },
  ] satisfies Trait[],

  chapters: [
    {
      title: "The friend",
      text: "Before anything else, Ibro is a good friend. He remembers the small things, checks in without being asked, and makes people feel at ease around him.",
    },
    {
      title: "The player",
      text: "Black and gold on his back, Liverpool red in his heart. On the pitch he plays the way he lives: head up, always available, never hiding from the next pass.",
      note: "Boots laced. Eyes on the ball. Walk on.",
      outfit: "kit",
      accent: "red",
    },
    {
      title: "The grind",
      text: "The early mornings nobody sees. The long days on tired legs. The work he keeps doing when it would be easier to stop.",
    },
    {
      title: "What's next",
      text: "Still being written. Whatever comes, he'll meet it the way he meets everything: ready, and with people in his corner.",
    },
  ] satisfies Chapter[],

  letter: [
    "I wanted to make you something that lasts longer than a message, so here it is.",
    "You make the people around you feel steady. You show up, you listen, and you never make a big deal of it. I don't think you know how much that means.",
    "I'm proud of how hard you work, and prouder of who you are when nobody is watching. I hope this year is kind to you, and that you're kind to yourself in it.",
    "Happy birthday. I'm glad you're here.",
  ],
  letterSignature: "Sono",

  closingWish: "May this year give back everything you put in.",
  signOff: "From Sono",

  /** Optional path to an audio file in /public, e.g. "/music.mp3". Without it a soft music box plays. */
  musicSrc: undefined as string | undefined,
};

export type SiteConfig = typeof config;

/** Resolve a chapter accent to a CSS colour. */
export function resolveColor(value: string | undefined): string {
  if (!value) return theme.colors.gold;
  const key = value as keyof typeof theme.colors;
  return theme.colors[key] ?? value;
}
