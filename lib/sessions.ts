/** Timed-session log, grouped by local calendar day. */
import { scopedKey } from "./user";
import { FAMILY_LABEL, SKILL_BY_ID, skillsIn, type Family, type SkillId } from "./skills";

export const SESSION_MS = 8 * 60 * 1000;
export const FOCUS_MS = 2 * 60 * 1000;

/** What a session practices and for how long. */
export interface Plan {
  id: string;            // "mixed" | "unit:<family>" | "skill:<id>"
  label: string;
  durationMs: number;
  pool?: SkillId[];      // undefined = engine's unlocked set (mixed)
}

export const MIXED: Plan = { id: "mixed", label: "Mixed practice", durationMs: SESSION_MS };

const DEFAULT_KEY = () => scopedKey("defaultMinutes");
export function loadDefaultMinutes(): number {
  if (typeof window === "undefined") return SESSION_MS / 60000;
  try { const v = Number(localStorage.getItem(DEFAULT_KEY())); return v > 0 ? v : SESSION_MS / 60000; } catch { return SESSION_MS / 60000; }
}
export function saveDefaultMinutes(min: number): void {
  try { localStorage.setItem(DEFAULT_KEY(), String(min)); } catch { /* ignore */ }
}
export const mixedFor = (min: number): Plan => ({ ...MIXED, durationMs: min * 60000 });
export const unitPlan = (f: Family): Plan => ({ id: `unit:${f}`, label: FAMILY_LABEL[f], durationMs: FOCUS_MS, pool: skillsIn(f).map((s) => s.id) });
export const skillPlan = (id: SkillId): Plan => ({ id: `skill:${id}`, label: SKILL_BY_ID[id].name, durationMs: FOCUS_MS, pool: [id] });

export interface SessionRecord {
  plan?: string;       // Plan.id; absent = mixed (older records)
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
