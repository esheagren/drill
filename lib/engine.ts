/**
 * Learning engine.
 *
 * Two layers, because math fluency has two kinds of skill:
 *
 *  1. SKILL layer (all 19 skills). EMA accuracy and latency per skill → mastery,
 *     which drives unlocking, the interleaving weights, and the UI bars.
 *
 *  2. RATING layer (Elo, after Klinkenberg, Straatemeier & van der Maas 2011).
 *     One rating θ per unit; one difficulty β per item = structural prior +
 *     a learned delta. Expected score E = logistic(θ − β). Items are chosen so
 *     E ≈ TARGET; both θ and β move by K·(score − E) after each answer.
 *     The score is speed-weighted: wrong → 0; right → 1 − ½·RT/budget, so a
 *     right-but-slow answer is worth ~0.5 and the system only pushes
 *     difficulty up as the learner gets fast.
 *
 *  Retrieval facts (tables, squares, cubes, unit fractions…) also keep a small
 *  per-item record (streak, last RT), so a fact that is demonstrably automatic
 *  is skipped except for maintenance sampling.
 */
import { generateItem, type Item, type Level } from "./items";
import { SKILLS, SKILL_BY_ID, type Family, type SkillId } from "./skills";
import { scopedKey } from "./user";

export interface SkillState {
  attempts: number;
  correct: number;
  acc: number;      // EMA accuracy, starts 0.5
  speed: number;    // EMA latency ms, 0 = unknown
  streak: number;
  lastSeen: number;
}
export interface Rating { theta: number; n: number }
export interface ItemMemory { delta: number; n: number; streak: number; lastRt: number; lastSeen: number }

export interface EngineState {
  v: 2;
  skills: Record<SkillId, SkillState>;
  ratings: Partial<Record<Family, Rating>>;
  items: Record<string, ItemMemory>;
}

export interface AttemptLog {
  skillId: SkillId;
  itemKey: string;
  prompt: string;
  answer: string;
  correct: boolean;
  latencyMs: number;
  ts: number;
  review: boolean;
  score: number;      // speed-weighted 0..1
  expected: number;   // E before the update
  theta: number;      // unit rating before the update
  beta: number;       // item difficulty before the update
}

export const TARGET = 0.85;
const PROBE_TARGET = 0.6;          // provisional phase aims harder to locate the learner fast
const PROVISIONAL_N = 10;
const logit = (p: number) => Math.log(p / (1 - p));
const ALPHA = 0.25;
const UNLOCK = 0.7;
const MIN_ATTEMPTS = 5;
const K_ITEM = 0.05;
const MAINTENANCE = 0.1;           // share of picks drawn from below target
const AUTOMATIC_STREAK = 5;        // per-item: this many fast-correct in a row = automatic
const CANDIDATES_PER_LEVEL = 4;
const ITEM_CAP = 3000;

const STATE_KEY = () => scopedKey("skills");
const LOG_KEY = () => scopedKey("log");
const LOG_CAP = 2000;

const freshSkill = (): SkillState => ({ attempts: 0, correct: 0, acc: 0.5, speed: 0, streak: 0, lastSeen: 0 });
const logistic = (x: number) => 1 / (1 + Math.exp(-x));

export function emptyState(): EngineState {
  return { v: 2, skills: Object.fromEntries(SKILLS.map((s) => [s.id, freshSkill()])) as Record<SkillId, SkillState>, ratings: {}, items: {} };
}

/** Accept v1 (flat per-skill map) or v2 snapshots. */
export function normalize(raw: unknown): EngineState {
  const base = emptyState();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Record<string, unknown>;
  if (r.v === 2 && r.skills) {
    const st = r as unknown as EngineState;
    return { v: 2, skills: { ...base.skills, ...st.skills }, ratings: st.ratings ?? {}, items: st.items ?? {} };
  }
  // v1: keys are skill ids
  for (const s of SKILLS) if (r[s.id] && typeof r[s.id] === "object") base.skills[s.id] = { ...freshSkill(), ...(r[s.id] as SkillState) };
  return base;
}

export const totalAttempts = (st: EngineState) => Object.values(st.skills).reduce((a, s) => a + s.attempts, 0);

export function loadState(): EngineState {
  if (typeof window === "undefined") return emptyState();
  try { const raw = localStorage.getItem(STATE_KEY()); return normalize(raw ? JSON.parse(raw) : null); } catch { return emptyState(); }
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

// ── Skill layer ────────────────────────────────────────────────────────────

/** 0..1. Accuracy, discounted while slower than the skill's target. */
export function mastery(id: SkillId, s: SkillState): number {
  if (s.attempts === 0) return 0;
  const target = SKILL_BY_ID[id].targetMs;
  const speedFactor = s.speed === 0 ? 1 : Math.min(1, target / s.speed) ** 0.5;
  return Math.max(0, Math.min(1, s.acc * (0.6 + 0.4 * speedFactor)));
}

export function isUnlocked(id: SkillId, state: EngineState): boolean {
  return SKILL_BY_ID[id].prereqs.every((p) => {
    const ps = state.skills[p];
    return ps.attempts >= MIN_ATTEMPTS && mastery(p, ps) >= UNLOCK;
  });
}

/** Pick the next skill: interleaved weighted-random over the pool, never `lastId` twice. */
export function nextSkill(state: EngineState, lastId: SkillId | null, pool?: SkillId[]): SkillId {
  const now = Date.now();
  const unlocked = pool ? SKILLS.filter((s) => pool.includes(s.id)) : SKILLS.filter((s) => isUnlocked(s.id, state));
  const candidates = unlocked.length > 1 ? unlocked.filter((s) => s.id !== lastId) : unlocked;
  const weighted = candidates.map((s) => {
    const st = state.skills[s.id];
    const m = mastery(s.id, st);
    const novelty = st.attempts === 0 ? 0.6 : 0;
    const staleness = st.lastSeen === 0 ? 0 : Math.min(1, (now - st.lastSeen) / (6 * 3600e3));
    return { id: s.id, w: 0.15 + 1.6 * (1 - m) + novelty + 0.5 * staleness };
  });
  const total = weighted.reduce((a, b) => a + b.w, 0);
  let r = Math.random() * total;
  for (const { id, w } of weighted) { r -= w; if (r <= 0) return id; }
  return weighted[weighted.length - 1].id;
}

// ── Rating layer ───────────────────────────────────────────────────────────

export const ratingOf = (state: EngineState, fam: Family): Rating => state.ratings[fam] ?? { theta: 0, n: 0 };
export const betaOf = (state: EngineState, item: Item) => item.prior + (state.items[item.key]?.delta ?? 0);
export const expectedScore = (state: EngineState, item: Item) => logistic(ratingOf(state, SKILL_BY_ID[item.skillId].family).theta - betaOf(state, item));

function isAutomatic(state: EngineState, item: Item): boolean {
  const m = state.items[item.key];
  if (!m) return false;
  return m.streak >= AUTOMATIC_STREAK && m.lastRt > 0 && m.lastRt <= 0.5 * SKILL_BY_ID[item.skillId].targetMs;
}

/** Speed-weighted outcome: wrong → 0; right → 1 − ½·RT/budget (floored at 0). */
export function scoreOf(skillId: SkillId, correct: boolean, latencyMs: number): number {
  if (!correct) return 0;
  return Math.max(0, Math.min(1, 1 - 0.5 * (latencyMs / SKILL_BY_ID[skillId].targetMs)));
}

/**
 * Choose an item for `skillId` whose difficulty sits where the learner's expected
 * score ≈ TARGET. Draws candidates across the skill's whole range, skips facts
 * already automatic, and sometimes (MAINTENANCE) samples easier for retention.
 */
export function pickItem(state: EngineState, skillId: SkillId): Item {
  const fam = SKILL_BY_ID[skillId].family;
  const rating = ratingOf(state, fam);
  const target = rating.theta - logit(rating.n < PROVISIONAL_N ? PROBE_TARGET : TARGET);
  const all: Item[] = [];
  for (const L of [1, 2, 3] as Level[]) for (let i = 0; i < CANDIDATES_PER_LEVEL; i++) all.push(generateItem(skillId, L));
  const maintenance = Math.random() < MAINTENANCE;
  let cands = maintenance ? all : all.filter((it) => !isAutomatic(state, it));
  if (cands.length === 0) cands = all;
  if (maintenance) {
    const easier = cands.filter((it) => betaOf(state, it) < target);
    if (easier.length) cands = easier;
  }
  // Softmax on closeness to target (temperature 0.4 logits) keeps variety without drifting.
  const ws = cands.map((it) => Math.exp(-Math.abs(betaOf(state, it) - target) / 0.4));
  const total = ws.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < cands.length; i++) { r -= ws[i]; if (r <= 0) return cands[i]; }
  return cands[cands.length - 1];
}

export interface RecordResult { state: EngineState; score: number; expected: number; theta: number; beta: number }

export function record(state: EngineState, item: Item, correct: boolean, latencyMs: number): RecordResult {
  const id = item.skillId;
  const fam = SKILL_BY_ID[id].family;

  // Skill EMA
  const s = { ...state.skills[id] };
  s.attempts += 1;
  if (correct) s.correct += 1;
  s.acc = s.acc + ALPHA * ((correct ? 1 : 0) - s.acc);
  s.speed = s.speed === 0 ? latencyMs : s.speed + ALPHA * (latencyMs - s.speed);
  s.streak = correct ? s.streak + 1 : 0;
  s.lastSeen = Date.now();

  // Elo
  const rating = ratingOf(state, fam);
  const beta = betaOf(state, item);
  const expected = logistic(rating.theta - beta);
  const score = scoreOf(id, correct, latencyMs);
  const kUser = rating.n < PROVISIONAL_N ? 0.6 : rating.n < 40 ? 0.25 : 0.12;   // provisional → settle
  const theta = rating.theta + kUser * (score - expected);

  const mem = state.items[item.key] ?? { delta: 0, n: 0, streak: 0, lastRt: 0, lastSeen: 0 };
  const fast = correct && latencyMs <= 0.5 * SKILL_BY_ID[id].targetMs;
  const items = {
    ...state.items,
    [item.key]: { delta: mem.delta - K_ITEM * (score - expected), n: mem.n + 1, streak: fast ? mem.streak + 1 : 0, lastRt: latencyMs, lastSeen: Date.now() },
  };
  // Bound the item memory: drop the least-recently-seen.
  const keys = Object.keys(items);
  if (keys.length > ITEM_CAP) for (const k of keys.sort((a, b) => items[a].lastSeen - items[b].lastSeen).slice(0, keys.length - ITEM_CAP)) delete items[k];

  return {
    state: { ...state, skills: { ...state.skills, [id]: s }, ratings: { ...state.ratings, [fam]: { theta, n: rating.n + 1 } }, items },
    score, expected, theta: rating.theta, beta,
  };
}
