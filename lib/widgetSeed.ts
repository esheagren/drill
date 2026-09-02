/**
 * Map an answered item to a widget seeded with that item's own numbers, so a
 * miss can be explored, not just read about.
 */
export type WidgetSeed =
  | { kind: "area"; a: number; b: number }
  | { kind: "chain"; base: number; changes: number[] }
  | { kind: "log"; x: number; y: number };

export function widgetSeedFor(key: string): WidgetSeed | null {
  let m = key.match(/^mul:(\d+)x(\d+)$/);
  if (m) {
    const p = +m[1], q = +m[2];
    const [b, a] = p <= q ? [p, q] : [q, p];        // bigger factor is the sliced one
    if (a >= 12 && a <= 125 && b >= 2) return { kind: "area", a, b };
    return null;
  }
  m = key.match(/^sq:(\d+)$/);
  if (m && +m[1] >= 12) return { kind: "area", a: +m[1], b: +m[1] };
  m = key.match(/^pct(?:ap|f):(up|down)(\d+)%(\d+)/);
  if (m) return { kind: "chain", base: +m[3], changes: [m[1] === "down" ? -+m[2] : +m[2]] };
  m = key.match(/^pctr:off(\d+)%(\d+)$/);
  if (m) return { kind: "chain", base: +m[2], changes: [-+m[1]] };   // start from the answer; the bar ends at the given price
  m = key.match(/^(?:pctch|ccb):(up|down)(\d+),(up|down)(\d+)%([\d.]+)(?:e(\d+))?$/);
  if (m) { const base = +m[5] * 10 ** (+(m[6] ?? 0)); return { kind: "chain", base, changes: [(m[1] === "down" ? -1 : 1) * +m[2], (m[3] === "down" ? -1 : 1) * +m[4]] }; }
  m = key.match(/^cgr:(\d+)%x(\d+)y(\d+)$/);
  if (m) return { kind: "chain", base: +m[3], changes: Array(Math.min(3, +m[2])).fill(+m[1]) };
  m = key.match(/^magm:([\d.]+)e(\d+)\*([\d.]+)e(\d+)$/);
  if (m) return { kind: "log", x: Math.log10(+m[1] * 10 ** +m[2]), y: Math.log10(+m[3] * 10 ** +m[4]) };
  m = key.match(/^cpb:(\d+)%([\d.]+)e(\d+)$/);
  if (m) return { kind: "chain", base: +m[2] * 10 ** +m[3], changes: [-(100 - +m[1])] };   // p% of X = X down (100−p)%
  return null;
}
