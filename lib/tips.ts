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
  /** Parameter-level relevance: given the item key (e.g. "frof:4/5x400"), is this trick actually the tool for these numbers? Required to pass when present. */
  applies?: (key: string) => boolean;
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
    // Parameter check: a specific trick must fit these numbers; when it does, it beats generic advice.
    let fit = 0;
    if (t.applies) { if (!t.applies(item.key)) return { t, score: 0, rel: 0 }; fit = 4; }
    const recency = s[t.id] ? Math.min(1, (Date.now() - s[t.id]) / (24 * 3600e3)) : 1; // 0 = just seen … 1 = ≥ a day ago
    const rel = t.skills ? pinned : overlap;   // a pinned tip is only for its skills; unpinned tips match by tags
    return { t, score: (rel + fit) * (0.5 + 0.5 * recency), rel };
  }).filter((x) => x.rel > 0);
  if (!scored.length) return null;
  scored.sort((a, b) => b.score - a.score);
  // small randomness among the top few so the same tip doesn't dominate
  const top = scored.slice(0, 3);
  return top[Math.floor(Math.random() * top.length)].t;
}
