/**
 * Belief layer — knowledge-space inference over the prerequisite graph.
 *
 * Every skill carries p(known). Priors come from the learner's observed
 * frontier; evidence propagates: a fast-correct answer raises the node and its
 * ancestors, a miss lowers the node and its descendants, damped ×DAMP per edge.
 * Silent probes pick the most informative uncertain node. Nothing here is
 * ever shown as a "diagnostic".
 */
import { SKILLS, SKILL_BY_ID, type SkillId } from "./skills";

export const DAMP = 0.6;
const POS = 0.5, SLOW = 0.2, NEG = 0.5;
export const PROBE_SHARE_EARLY = 0.15, PROBE_SHARE_LATE = 0.05, PROBES_EARLY = 60;

const logistic = (x: number) => 1 / (1 + Math.exp(-x));

// ── graph ─────────────────────────────────────────────────────────────────
const parents = new Map<SkillId, SkillId[]>(SKILLS.map((s) => [s.id, s.prereqs]));
const children = new Map<SkillId, SkillId[]>(SKILLS.map((s) => [s.id, []]));
for (const s of SKILLS) for (const p of s.prereqs) children.get(p)!.push(s.id);

/** All ancestors (or descendants) with their edge distance. */
function reach(id: SkillId, dir: "up" | "down"): Map<SkillId, number> {
  const out = new Map<SkillId, number>();
  const q: [SkillId, number][] = [[id, 0]];
  while (q.length) {
    const [cur, d] = q.shift()!;
    for (const n of (dir === "up" ? parents : children).get(cur) ?? []) {
      if (!out.has(n) || out.get(n)! > d + 1) { out.set(n, d + 1); q.push([n, d + 1]); }
    }
  }
  return out;
}
export const ancestors = (id: SkillId) => reach(id, "up");
export const descendants = (id: SkillId) => reach(id, "down");

// ── priors ────────────────────────────────────────────────────────────────
export interface SkillObs { attempts: number; mastery: number }

/** Highest level at which the learner has demonstrated fluency (≥3 answers, mastery ≥ 0.7). Default 3 for a fresh adult. */
export function frontier(obs: (id: SkillId) => SkillObs): number {
  let f = 3;
  for (const s of SKILLS) { const o = obs(s.id); if (o.attempts >= 3 && o.mastery >= 0.7) f = Math.max(f, s.level); }
  return f;
}

export function priorBelief(id: SkillId, obs: (id: SkillId) => SkillObs, front: number): number {
  const o = obs(id);
  if (o.attempts >= 3) return o.mastery >= 0.7 ? 0.9 : o.mastery >= 0.4 ? 0.6 : 0.3;
  if (o.attempts > 0) return 0.5 + 0.3 * (o.mastery - 0.5);
  return logistic(1.2 - 0.7 * (SKILL_BY_ID[id].level - front));
}

// ── evidence ──────────────────────────────────────────────────────────────
export type Evidence = "pos" | "slow" | "neg";

/** Returns the updated belief map (only touched nodes are written). */
export function propagate(beliefs: Record<string, number>, get: (id: SkillId) => number, id: SkillId, ev: Evidence): Record<string, number> {
  const out = { ...beliefs };
  const bump = (n: SkillId, d: number) => {
    const b = out[n] ?? get(n);
    const k = DAMP ** d;
    out[n] = ev === "neg" ? b * (1 - NEG * k) : b + (ev === "pos" ? POS : SLOW) * k * (1 - b);
  };
  bump(id, 0);
  if (ev === "neg") for (const [n, d] of descendants(id)) bump(n, d);
  else for (const [n, d] of ancestors(id)) bump(n, d);
  return out;
}

export const evidenceOf = (correct: boolean, score: number): Evidence => (!correct ? "neg" : score >= 0.6 ? "pos" : "slow");

// ── probes ────────────────────────────────────────────────────────────────
/** The uncertain node whose answer would move the most other nodes; null if nothing is uncertain enough. */
export function pickProbe(get: (id: SkillId) => number, exclude: SkillId | null): SkillId | null {
  const cands = SKILLS.filter((s) => s.id !== exclude).map((s) => {
    const b = get(s.id);
    const u = 1 - 2 * Math.abs(b - 0.5);            // 1 at 0.5, 0 at 0/1
    const r = ancestors(s.id).size + descendants(s.id).size;
    return { id: s.id, w: u > 0.2 ? u * (1 + r / 10) : 0 };
  }).filter((c) => c.w > 0);
  if (!cands.length) return null;
  const total = cands.reduce((a, c) => a + c.w, 0);
  let x = Math.random() * total;
  for (const c of cands) { x -= c.w; if (x <= 0) return c.id; }
  return cands[cands.length - 1].id;
}
