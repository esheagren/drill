/** Timed-session log, grouped by local calendar day. */
import { scopedKey } from "./user";
import type { SkillId } from "./skills";

export const SESSION_MS = 8 * 60 * 1000;

export interface SessionRecord {
  ts: number;          // start epoch ms
  durationMs: number;  // actual elapsed (may be < SESSION_MS if abandoned)
  answered: number;
  correct: number;
  bySkill: Partial<Record<SkillId, { n: number; c: number }>>;
}

export type DayLog = Record<string, SessionRecord[]>; // "YYYY-MM-DD" → sessions

const KEY = () => scopedKey("days");

export function dayKey(ts: number = Date.now()): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function loadDays(): DayLog {
  if (typeof window === "undefined") return {};
  try { const raw = localStorage.getItem(KEY()); return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}

export function saveSession(rec: SessionRecord): void {
  if (typeof window === "undefined") return;
  try {
    const days = loadDays();
    const k = dayKey(rec.ts);
    (days[k] ||= []).push(rec);
    localStorage.setItem(KEY(), JSON.stringify(days));
  } catch { /* ignore */ }
}

export function dayTotals(days: DayLog, k: string): { sessions: number; answered: number; correct: number } {
  const list = days[k] ?? [];
  return {
    sessions: list.length,
    answered: list.reduce((a, s) => a + s.answered, 0),
    correct: list.reduce((a, s) => a + s.correct, 0),
  };
}
