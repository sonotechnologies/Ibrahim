"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { sound } from "./sound";

export type Stage = "loading" | "gate" | "live";

type Experience = {
  stage: Stage;
  setStage: (s: Stage) => void;
  soundOn: boolean;
  toggleSound: () => void;
  /** Bumps on Replay so sections can restart their intro animations. */
  replayToken: number;
  bumpReplay: () => void;
};

const Ctx = createContext<Experience | null>(null);

export function ExperienceProvider({ children }: { children: React.ReactNode }) {
  const [stage, setStage] = useState<Stage>("loading");
  const [soundOn, setSoundOn] = useState(true);
  const [replayToken, setReplayToken] = useState(0);

  const toggleSound = useCallback(() => {
    setSoundOn((on) => {
      sound.setEnabled(!on);
      return !on;
    });
  }, []);

  const bumpReplay = useCallback(() => setReplayToken((n) => n + 1), []);

  const value = useMemo(
    () => ({ stage, setStage, soundOn, toggleSound, replayToken, bumpReplay }),
    [stage, soundOn, toggleSound, replayToken, bumpReplay],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useExperience() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useExperience must be used inside ExperienceProvider");
  return v;
}
