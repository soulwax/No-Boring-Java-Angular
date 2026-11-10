/** Mirrors dev.oob.chaos.board.ThingView */
export interface Thing {
  id: number;
  original: string;
  twist: string;
  author: string;
  hype: number;
  rerolls: number;
  createdAt: string;
}

/** Mirrors dev.oob.chaos.board.ChaosMeter */
export interface ChaosMeter {
  level: number;
  mood: string;
  totalHype: number;
  things: number;
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
