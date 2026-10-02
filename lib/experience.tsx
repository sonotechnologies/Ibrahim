"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { sound } from "./sound";

export type Stage = "loading" | "gate" | "live";

type Experience = {
  stage: Stage;
  setStage: (s: Stage) => void;
  /** Music is off by default; the toggle turns it on. */
  musicOn: boolean;
  toggleMusic: () => void;
  /** Bumps on Replay so sections can restart their intro animations. */
  replayToken: number;
  bumpReplay: () => void;
};

const Ctx = createContext<Experience | null>(null);

export function ExperienceProvider({ children }: { children: React.ReactNode }) {
  const [stage, setStage] = useState<Stage>("loading");
  const [musicOn, setMusicOn] = useState(false);
  const [replayToken, setReplayToken] = useState(0);

  const toggleMusic = useCallback(() => {
    setMusicOn((on) => {
      sound.setMusic(!on);
      return !on;
    });
  }, []);

  const bumpReplay = useCallback(() => setReplayToken((n) => n + 1), []);

  const value = useMemo(
    () => ({ stage, setStage, musicOn, toggleMusic, replayToken, bumpReplay }),
    [stage, musicOn, toggleMusic, replayToken, bumpReplay],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useExperience() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useExperience must be used inside ExperienceProvider");
  return v;
}
