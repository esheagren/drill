/** Per-problem stats for the strength/weakness maps. Flushes the outbox first so the server is current. */
import { getUserToken } from "./user";
import { flush } from "./sync";

export interface ItemStat { key: string; n: number; correct: number; p50: number; last: number }

export async function fetchItemStats(prefix: string): Promise<Record<string, ItemStat>> {
  try {
    await flush();
    const r = await fetch(`/api/items?user=${encodeURIComponent(getUserToken())}&prefix=${encodeURIComponent(prefix)}`);
    const j = (await r.json()) as { ok: boolean; items?: ItemStat[] };
    return Object.fromEntries((j.items ?? []).map((i) => [i.key, i]));
  } catch { return {}; }
}

/** 0..1 fluency for one problem: accuracy discounted while slower than budget (same shape as skill mastery). */
export function itemFluency(s: ItemStat, budgetMs: number): number {
  const acc = s.correct / s.n;
  const speed = Math.min(1, budgetMs / Math.max(1, s.p50)) ** 0.5;
  return acc * (0.6 + 0.4 * speed);
}
