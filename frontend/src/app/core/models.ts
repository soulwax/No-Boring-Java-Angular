/** Mirrors dev.oob.chaos.twist.Genre */
export type Genre = 'CLASSIC' | 'NOIR' | 'SPACE_OPERA' | 'NATURE_DOC' | 'MEDIEVAL' | 'HEIST';

/** Mirrors dev.oob.chaos.board.Tier */
export type Tier = 'BORING' | 'CURIOUS' | 'SPICY' | 'LEGENDARY' | 'MYTHIC';

/** Mirrors dev.oob.chaos.board.ThingView */
export interface Thing {
  id: number;
  original: string;
  twist: string;
  author: string;
  genre: Genre;
  hype: number;
  rerolls: number;
  /** Tier the current hype qualifies for; drops as hype decays */
  tier: Tier;
  /** Highest tier ever reached; never drops */
  peakTier: Tier;
  /** Hype needed for the next tier, null at the top */
  nextTierAt: number | null;
  lore: string[];
  createdAt: string;
}

/** Mirrors dev.oob.chaos.board.ChaosMeter */
export interface ChaosMeter {
  level: number;
  mood: string;
  totalHype: number;
  things: number;
}

/** Mirrors dev.oob.chaos.mutator.MutatorState (SSE "mutator" event) */
export interface MutatorState {
  active: boolean;
  code: 'DOUBLE_HYPE' | 'FROZEN_TIME' | 'GENRE_LOCK' | 'TWIST_TORNADO' | null;
  emoji: string | null;
  title: string | null;
  description: string | null;
  genre: Genre | null;
  endsAt: string | null;
}

/** Mirrors dev.oob.chaos.live.Chronicle.Entry (SSE "activity" / "chronicle") */
export interface ChronicleEntry {
  emoji: string;
  text: string;
  at: string;
}

/** Mirrors dev.oob.chaos.achievements.AchievementView */
export interface Achievement {
  code: string;
  emoji: string;
  title: string;
  description: string;
  unlocked: boolean;
}

/** Mirrors dev.oob.chaos.achievements.AchievementUnlocked (SSE "achievement" event) */
export interface AchievementUnlocked {
  playerTag: string;
  playerName: string;
  code: string;
  emoji: string;
  title: string;
  description: string;
}

/** SSE "wave" event */
export interface ChaosWave {
  by: string;
}

/** RFC 9457 problem details, as produced by ApiExceptionHandler */
export interface Problem {
  title: string;
  status: number;
  detail: string;
  errors?: Record<string, string>;
}
