/**
 * Map an answered item to a widget seeded with that item's own numbers, so a
 * miss can be explored, not just read about.
 */
import { percentRowsFor, type Row } from "./percentSteps";

export type WidgetSeed =
  | { kind: "area"; a: number; b: number }
  | { kind: "steps"; rows: Row[] }
  | { kind: "log"; x: number; y: number };

export function widgetSeedFor(key: string): WidgetSeed | null {
  const rows = percentRowsFor(key);
  if (rows) return { kind: "steps", rows };
  let m = key.match(/^mul:(\d+)x(\d+)$/);
  if (m) {
    const p = +m[1], q = +m[2];
    const [b, a] = p <= q ? [p, q] : [q, p];        // bigger factor is the sliced one
    if (a >= 12 && a <= 125 && b >= 2) return { kind: "area", a, b };
    return null;
  }
  m = key.match(/^sq:(\d+)$/);
  if (m && +m[1] >= 12) return { kind: "area", a: +m[1], b: +m[1] };
  m = key.match(/^magm:([\d.]+)e(\d+)\*([\d.]+)e(\d+)$/);
  if (m) return { kind: "log", x: Math.log10(+m[1] * 10 ** +m[2]), y: Math.log10(+m[3] * 10 ** +m[4]) };
  return null;
}
