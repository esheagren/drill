export type PracticeMode = "big-numbers" | "estimation" | "percents";

export interface Attempt {
  mode: PracticeMode;
  prompt: string;
  userAnswer: string;
  correctValue: number;
  latencyMs: number;
  accuracy: number;
  magnitudeError?: number;
  timestamp: number;
}

export interface SessionSummary {
  mode: PracticeMode;
  correctCount: number;
  totalCount: number;
  medianTimeMs: number;
  averageAccuracy: number;
  timestamp: number;
}

const STORAGE_KEY = "magnitude_attempts";
const SESSIONS_KEY = "magnitude_sessions";

export function saveAttempt(attempt: Attempt): void {
  if (typeof window === "undefined") return;
  
  try {
    const existing = getAttempts();
    existing.push(attempt);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error("Failed to save attempt:", e);
  }
}

export function getAttempts(): Attempt[] {
  if (typeof window === "undefined") return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load attempts:", e);
    return [];
  }
}

export function saveSession(session: SessionSummary): void {
  if (typeof window === "undefined") return;
  
  try {
    const existing = getSessions();
    existing.push(session);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error("Failed to save session:", e);
  }
}

export function getSessions(): SessionSummary[] {
  if (typeof window === "undefined") return [];
  
  try {
    const data = localStorage.getItem(SESSIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load sessions:", e);
    return [];
  }
}

export function getAttemptsByMode(mode: PracticeMode): Attempt[] {
  return getAttempts().filter((a) => a.mode === mode);
}

export function getSessionsByMode(mode: PracticeMode): SessionSummary[] {
  return getSessions().filter((s) => s.mode === mode);
}

export function calculateMedian(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}
