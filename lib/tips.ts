/**
 * Technique tips — the reusable tricks behind the items, surfaced when an
 * item is missed or answered slowly. Each tip is tagged with knowledge
 * components (same vocabulary as Skill.kc) and optionally pinned to skills.
 * Content lives in ./tips.data.ts; this module chooses which tip to show.
 */
import type { Item } from "./items";
import { SKILL_BY_ID, type SkillId } from "./skills";
import { scopedKey } from "./user";
import { TIPS } from "./tips.data";

export interface Tip {
  id: string;
  title: string;
  rule: string;
  example: string;
  when?: string;
  tags: string[];
  /** Restrict to these skills (optional). */
  skills?: SkillId[];
}

const SEEN_KEY = () => scopedKey("tips:seen");
function seen(): Record<string, number> {
  try { const r = localStorage.getItem(SEEN_KEY()); return r ? JSON.parse(r) : {}; } catch { return {}; }
}
export function markSeen(id: string): void {
  try { const s = seen(); s[id] = Date.now(); localStorage.setItem(SEEN_KEY(), JSON.stringify(s)); } catch { /* ignore */ }
}

/**
 * Best tip for an item: skill-pinned tips first, then tag overlap with the
 * skill's knowledge components; among ties, the one shown least recently.
 */
export function tipFor(item: Item): Tip | null {
  const skill = SKILL_BY_ID[item.skillId];
  const s = seen();
  const scored = TIPS.map((t) => {
    const pinned = t.skills?.includes(item.skillId) ? 3 : 0;
    const overlap = t.tags.filter((g) => skill.kc.includes(g)).length;
    const recency = s[t.id] ? Math.min(1, (Date.now() - s[t.id]) / (24 * 3600e3)) : 1; // 0 = just seen … 1 = ≥ a day ago
    return { t, score: (pinned + overlap) * (0.5 + 0.5 * recency), rel: pinned + overlap };
  }).filter((x) => x.rel > 0);
  if (!scored.length) return null;
  scored.sort((a, b) => b.score - a.score);
  // small randomness among the top few so the same tip doesn't dominate
  const top = scored.slice(0, 3);
  return top[Math.floor(Math.random() * top.length)].t;
}
