/**
 * Learning engine: per-skill mastery state + interleaved scheduler.
 *
 * Mastery model (deliberately simple, inspectable):
 *   acc      exponential moving average of correctness (α = 0.25)
 *   speed    EMA of latency in ms
 *   streak   consecutive correct
 *   mastery  0..1 — acc weighted by whether latency is at target
 *
 * Unlocking: a skill enters rotation when every prerequisite has mastery ≥ UNLOCK
 * with at least MIN_ATTEMPTS. Nothing is ever removed from rotation; mastered
 * skills just get sampled less (retention) rather than never (forgetting).
 *
 * Selection is interleaved: weighted random over unlocked skills, weight rising
 * with weakness and with time-since-seen, and never the same skill twice in a row.
 */
import { SKILLS, SKILL_BY_ID, type SkillId } from "./skills";
import { scopedKey } from "./user";

export interface SkillState {
  attempts: number;
  correct: number;
  acc: number;      // EMA accuracy, starts at 0.5 (uninformed)
  speed: number;    // EMA latency ms, starts at 0 (unknown)
  streak: number;
  lastSeen: number; // epoch ms
}

export interface AttemptLog {
  skillId: SkillId;
  prompt: string;
  answer: string;
  correct: boolean;
  latencyMs: number;
  ts: number;
}

export type EngineState = Record<SkillId, SkillState>;

const ALPHA = 0.25;
const UNLOCK = 0.7;
const MIN_ATTEMPTS = 5;
const STATE_KEY = () => scopedKey("skills");
const LOG_KEY = () => scopedKey("log");
const LOG_CAP = 2000;

const fresh = (): SkillState => ({ attempts: 0, correct: 0, acc: 0.5, speed: 0, streak: 0, lastSeen: 0 });

export function loadState(): EngineState {
  const base = Object.fromEntries(SKILLS.map((s) => [s.id, fresh()])) as EngineState;
  if (typeof window === "undefined") return base;
  try {
    const raw = localStorage.getItem(STATE_KEY());
    if (raw) Object.assign(base, JSON.parse(raw));
  } catch { /* ignore */ }
  return base;
}

export function saveState(state: EngineState): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(STATE_KEY(), JSON.stringify(state)); } catch { /* ignore */ }
}

export function appendLog(entry: AttemptLog): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(LOG_KEY());
    const log: AttemptLog[] = raw ? JSON.parse(raw) : [];
    log.push(entry);
    if (log.length > LOG_CAP) log.splice(0, log.length - LOG_CAP);
    localStorage.setItem(LOG_KEY(), JSON.stringify(log));
  } catch { /* ignore */ }
}

export function loadLog(): AttemptLog[] {
  if (typeof window === "undefined") return [];
  try { const raw = localStorage.getItem(LOG_KEY()); return raw ? JSON.parse(raw) : []; } catch { return []; }
}

/** 0..1. Accuracy, discounted when the learner is still slower than target. */
export function mastery(id: SkillId, s: SkillState): number {
  if (s.attempts === 0) return 0;
  const target = SKILL_BY_ID[id].targetMs;
  const speedFactor = s.speed === 0 ? 1 : Math.min(1, target / s.speed) ** 0.5; // gentle
  return Math.max(0, Math.min(1, s.acc * (0.6 + 0.4 * speedFactor)));
}

export function isUnlocked(id: SkillId, state: EngineState): boolean {
  return SKILL_BY_ID[id].prereqs.every((p) => {
    const ps = state[p];
    return ps.attempts >= MIN_ATTEMPTS && mastery(p, ps) >= UNLOCK;
  });
}

export function record(state: EngineState, id: SkillId, correct: boolean, latencyMs: number): EngineState {
  const s = { ...state[id] };
  s.attempts += 1;
  if (correct) s.correct += 1;
  s.acc = s.acc + ALPHA * ((correct ? 1 : 0) - s.acc);
  s.speed = s.speed === 0 ? latencyMs : s.speed + ALPHA * (latencyMs - s.speed);
  s.streak = correct ? s.streak + 1 : 0;
  s.lastSeen = Date.now();
  return { ...state, [id]: s };
}

/** Pick the next skill. Interleaved weighted-random, avoiding `lastId`. */
export function nextSkill(state: EngineState, lastId: SkillId | null): SkillId {
  const now = Date.now();
  const unlocked = SKILLS.filter((s) => isUnlocked(s.id, state));
  const pool = unlocked.length > 1 ? unlocked.filter((s) => s.id !== lastId) : unlocked;

  const weighted = pool.map((s) => {
    const st = state[s.id];
    const m = mastery(s.id, st);
    const weakness = 1 - m;                                   // 0 (mastered) .. 1 (unseen/failing)
    const novelty = st.attempts === 0 ? 0.6 : 0;              // nudge new unlocks in
    const staleness = st.lastSeen === 0 ? 0 : Math.min(1, (now - st.lastSeen) / (6 * 3600e3)); // 0..1 over 6h
    const retention = 0.15;                                   // floor so mastered skills still recur
    return { id: s.id, w: retention + 1.6 * weakness + novelty + 0.5 * staleness };
  });

  const total = weighted.reduce((a, b) => a + b.w, 0);
  let r = Math.random() * total;
  for (const { id, w } of weighted) { r -= w; if (r <= 0) return id; }
  return weighted[weighted.length - 1].id;
}
