/**
 * Percent problems worked the way you'd do them in your head: find 10% first,
 * build the percent from tenths, halves of a tenth, and hundredths (or a round
 * number minus a little), then add it on or take it off. Each step is a row —
 * a sentence and a bar — so the picture and the words say the same thing.
 * Rows are derived from the item key, like widgetSeed and sentences.
 */

export type Tone = "focus" | "add" | "remove";
export interface Shade { from: number; to: number; tone: Tone }         // in tenths of the row's bar
export interface Row { text: string; bar: number; shade: Shade[]; result?: boolean }

const SCALE: Record<number, string> = { 3: "thousand", 6: "million", 9: "billion", 12: "trillion", 15: "quadrillion" };
const trim = (v: number, places = 2) => String(Math.round(v * 10 ** places) / 10 ** places);
/** 350 → "350" · 67,350 → "67,350" · 2e6 → "2 million" · 617,500,000 → "617.5 million" */
export const say = (v: number): string => {
  if (v < 1e6) return v.toLocaleString("en-US", { maximumFractionDigits: 2 });
  const e = Math.floor(Math.log10(v)); const sc = Math.min(15, Math.floor(e / 3) * 3);
  return `${trim(v / 10 ** sc, 2)} ${SCALE[sc]}`;
};

type Piece = { kind: "tenths" | "five" | "ones" | "half" | "quarter" | "whole"; n: number; sign: 1 | -1 };

/** How to build p% from anchors. 30 → three tenths · 5 → half a tenth · 15 → a tenth and a half · 18 → two tenths less two hundredths · 75 → a half and a quarter. */
export function plan(p: number): Piece[] {
  if (p >= 100) return [{ kind: "whole", n: 1, sign: 1 }, ...(p > 100 ? plan(p - 100) : [])];
  if (p === 50) return [{ kind: "half", n: 5, sign: 1 }];
  if (p === 25) return [{ kind: "quarter", n: 2.5, sign: 1 }];
  if (p === 75) return [{ kind: "half", n: 5, sign: 1 }, { kind: "quarter", n: 2.5, sign: 1 }];
  const tens = Math.floor(p / 10), ones = p % 10;
  const a: Piece[] = [];
  if (tens) a.push({ kind: "tenths", n: tens, sign: 1 });
  if (ones >= 5) a.push({ kind: "five", n: 0.5, sign: 1 });
  if (ones % 5) a.push({ kind: "ones", n: ones % 5, sign: 1 });
  if (ones >= 8) { const b: Piece[] = [{ kind: "tenths", n: tens + 1, sign: 1 }, { kind: "ones", n: 10 - ones, sign: -1 }]; if (b.length <= a.length) return b; }
  return a;
}

/** Rows for "p% of base": the anchor, the pieces, and the total. */
export function percentRows(p: number, base: number): Row[] {
  const ps = plan(p); const T = base / 10; const P = (p / 100) * base;
  const rows: Row[] = []; let pos = 0;
  const simple = ps.every((x) => x.kind === "half" || x.kind === "quarter" || x.kind === "whole") || (ps.length === 1 && ps[0].kind === "ones");
  if (!simple) rows.push({ text: `10% of ${say(base)} is ${say(T)}.`, bar: base, shade: [{ from: 0, to: 1, tone: "focus" }] });
  for (const x of ps) {
    if (x.kind === "whole") { rows.push({ text: `All of ${say(base)}.`, bar: base, shade: [{ from: 0, to: 10, tone: "focus" }] }); pos = 10; }
    else if (x.kind === "half") { rows.push({ text: `Half of ${say(base)} is ${say(base / 2)}.`, bar: base, shade: [{ from: pos, to: pos + 5, tone: "focus" }] }); pos += 5; }
    else if (x.kind === "quarter") { rows.push({ text: `A quarter${pos ? " more" : ` of ${say(base)}`} is ${say(base / 4)} — half of a half.`, bar: base, shade: [{ from: pos, to: pos + 2.5, tone: "focus" }] }); pos += 2.5; }
    else if (x.kind === "tenths") { if (x.n > 1) rows.push({ text: `${x.n * 10}% is ${x.n} of those: ${say(x.n * T)}.`, bar: base, shade: [{ from: 0, to: x.n, tone: "focus" }] }); pos = x.n; }
    else if (x.kind === "five") { rows.push({ text: `5% is half of 10%: ${say(T / 2)}.`, bar: base, shade: [{ from: pos, to: pos + 0.5, tone: "focus" }] }); pos += 0.5; }
    else if (x.kind === "ones" && x.sign === 1) { rows.push({ text: x.n === 1 ? `1% is a hundredth: ${say(base / 100)}.` : `${x.n}% is ${x.n} hundredths: ${say((x.n * base) / 100)}.`, bar: base, shade: [{ from: pos, to: pos + x.n / 10, tone: "focus" }] }); pos += x.n / 10; }
    else if (x.kind === "ones") { rows.push({ text: `Take off ${x.n}% (${say((x.n * base) / 100)}) to get ${p}%.`, bar: base, shade: [{ from: 0, to: pos, tone: "focus" }, { from: pos - x.n / 10, to: pos, tone: "remove" }] }); pos -= x.n / 10; }
  }
  if (ps.length > 1) rows.push({ text: `So ${p}% of ${say(base)} is ${say(P)}.`, bar: base, shade: [{ from: 0, to: p / 10, tone: "focus" }], result: true });
  return rows;
}

/** Rows for "base up/down p%". */
export function applyRows(p: number, base: number, down: boolean): Row[] {
  const P = (p / 100) * base; const rows = percentRows(p, base); const y = down ? base - P : base + P;
  rows.push(down
    ? { text: `Take it off: ${say(base)} − ${say(P)} = ${say(y)}.`, bar: base, shade: [{ from: 10 - p / 10, to: 10, tone: "remove" }], result: true }
    : { text: `Add it on: ${say(base)} + ${say(P)} = ${say(y)}.`, bar: base, shade: [{ from: 10, to: 10 + p / 10, tone: "add" }], result: true });
  return rows;
}

/** Rows for the item, or null if it isn't a percent problem. */
export function percentRowsFor(key: string): Row[] | null {
  let m: RegExpMatchArray | null;
  if ((m = key.match(/^pct[ac]:(\d+)%(\d+)$/))) return percentRows(+m[1], +m[2]);
  if ((m = key.match(/^cpb:(\d+)%([\d.]+)e(\d+)$/))) return percentRows(+m[1], +m[2] * 10 ** +m[3]);
  if ((m = key.match(/^pctap:(up|down)(\d+)%(\d+)$/))) return applyRows(+m[2], +m[3], m[1] === "down");
  if ((m = key.match(/^(?:pctch|ccb):(up|down)(\d+),(up|down)(\d+)%([\d.]+)(?:e(\d+))?$/))) {
    const base = +m[5] * 10 ** +(m[6] ?? 0); const p1 = +m[2], p2 = +m[4], d1 = m[1] === "down", d2 = m[3] === "down";
    const y1 = base * (1 + (d1 ? -p1 : p1) / 100);
    return [...applyRows(p1, base, d1), ...applyRows(p2, y1, d2)];
  }
  if ((m = key.match(/^pctf:(up|down)(\d+)%(\d+)$/))) {
    const p = +m[2], base = +m[3], down = m[1] === "down"; const T = base / 10, D = (p / 100) * base, k = D / T;
    return [
      { text: `10% of ${say(base)} is ${say(T)}.`, bar: base, shade: [{ from: 0, to: 1, tone: "focus" }] },
      { text: `The change is ${say(D)}: ${trim(k, 1)} of those.`, bar: base, shade: [down ? { from: 10 - k, to: 10, tone: "remove" } : { from: 10, to: 10 + k, tone: "add" }] },
      { text: `${trim(k, 1)} tenths is ${p}%, ${down ? "down" : "up"}.`, bar: base, shade: [{ from: 0, to: k, tone: "focus" }], result: true },
    ];
  }
  if ((m = key.match(/^pctw:(\d+)of(\d+)$/))) {
    const part = +m[1], whole = +m[2]; const T = whole / 10, k = part / T;
    return [
      { text: `10% of ${say(whole)} is ${say(T)}.`, bar: whole, shade: [{ from: 0, to: 1, tone: "focus" }] },
      { text: `${say(part)} is ${trim(k, 2)} of those: ${trim((100 * part) / whole, 1)}%.`, bar: whole, shade: [{ from: 0, to: k, tone: "focus" }], result: true },
    ];
  }
  if ((m = key.match(/^pctr:(off|is)(\d+)%(\d+)$/))) {
    const p = +m[2], whole = +m[3];
    if (m[1] === "off") {
      const given = whole * (1 - p / 100), k = (100 - p) / 10;
      const one = Number.isInteger(k) ? { text: `One tenth is ${say(given)} ÷ ${k} = ${say(whole / 10)}.`, to: 1 } : { text: `1% is ${say(given)} ÷ ${100 - p} = ${say(whole / 100)}.`, to: 0.1 };
      return [
        { text: `After ${p}% off, ${say(given)} is ${100 - p}%: ${trim(k, 1)} tenths of the original.`, bar: whole, shade: [{ from: 0, to: k, tone: "focus" }, { from: k, to: 10, tone: "remove" }] },
        { text: one.text, bar: whole, shade: [{ from: 0, to: one.to, tone: "focus" }] },
        { text: `${one.to === 1 ? "Ten tenths" : "A hundred of those"}: ${say(whole)}.`, bar: whole, shade: [{ from: 0, to: 10, tone: "focus" }], result: true },
      ];
    }
    const given = (whole * p) / 100, k = p / 10;
    const one = Number.isInteger(k) ? { text: `One tenth is ${say(given)} ÷ ${k} = ${say(whole / 10)}.`, to: 1 } : { text: `1% is ${say(given)} ÷ ${p} = ${say(whole / 100)}.`, to: 0.1 };
    return [
      { text: `${say(given)} is ${p}%: ${trim(k, 1)} tenths of the whole.`, bar: whole, shade: [{ from: 0, to: k, tone: "focus" }] },
      { text: one.text, bar: whole, shade: [{ from: 0, to: one.to, tone: "focus" }] },
      { text: `${one.to === 1 ? "Ten tenths" : "A hundred of those"}: ${say(whole)}.`, bar: whole, shade: [{ from: 0, to: 10, tone: "focus" }], result: true },
    ];
  }
  if ((m = key.match(/^cgr:(\d+)%x(\d+)y(\d+)$/))) {
    const r = +m[1], y = +m[2]; let a = +m[3]; const rows: Row[] = [];
    for (let i = 1; i <= y; i++) { const P = (r / 100) * a; rows.push({ text: `Year ${i}: ${r}% of ${say(a)} is ${say(P)} → ${say(a + P)}.`, bar: a, shade: [{ from: 10, to: 10 + r / 10, tone: "add" }], result: i === y }); a += P; }
    return rows;
  }
  return null;
}

/** Two lines for the miss screen, in the same voice as the rows. */
export function percentSentences(key: string): string[] | null {
  let m: RegExpMatchArray | null;
  const build = (p: number, base: number): string => {
    const ps = plan(p); const T = base / 10, P = (p / 100) * base;
    if (ps.length === 1 && ps[0].kind === "half") return `Half of ${say(base)} is ${say(P)}.`;
    if (ps.length === 1 && ps[0].kind === "quarter") return `A quarter of ${say(base)} is ${say(P)}.`;
    if (ps.length === 1 && ps[0].kind === "tenths" && ps[0].n === 1) return `10% of ${say(base)} is ${say(T)}.`;
    if (ps.length === 1 && ps[0].kind === "tenths") return `10% of ${say(base)} is ${say(T)}, so ${p}% is ${say(P)}.`;
    if (ps.length === 1 && ps[0].kind === "five") return `10% of ${say(base)} is ${say(T)}; 5% is half: ${say(P)}.`;
    if (ps.length === 1 && ps[0].kind === "ones") return `1% of ${say(base)} is ${say(base / 100)}${ps[0].n > 1 ? `, so ${p}% is ${say(P)}` : ""}.`;
    if (ps.length === 2 && ps[1].kind === "ones" && ps[1].sign === -1) return `${ps[0].n * 10}% of ${say(base)} is ${say(ps[0].n * T)}; take off ${ps[1].n}%: ${say(P)}.`;
    if (ps[0].kind === "half") return `Half is ${say(base / 2)}, a quarter is ${say(base / 4)}: ${say(P)}.`;
    if (ps[0].kind === "whole") return `All of it, then ${p - 100}% more: ${say(P)}.`;
    return `10% of ${say(base)} is ${say(T)}; ${p}% is ${say(P)}.`;
  };
  if ((m = key.match(/^pctap:(up|down)(\d+)%(\d+)$/))) { const p = +m[2], base = +m[3], down = m[1] === "down"; const P = (p / 100) * base; return [build(p, base), down ? `Take it off: ${say(base - P)}.` : `Add it on: ${say(base + P)}.`]; }
  if ((m = key.match(/^(?:pctch|ccb):(up|down)(\d+),(up|down)(\d+)%([\d.]+)(?:e(\d+))?$/))) {
    const base = +m[5] * 10 ** +(m[6] ?? 0); const p1 = +m[2], p2 = +m[4], d1 = m[1] === "down", d2 = m[3] === "down";
    const y1 = base * (1 + (d1 ? -p1 : p1) / 100), y2 = y1 * (1 + (d2 ? -p2 : p2) / 100);
    return [`${build(p1, base).replace(/\.$/, "")}: ${d1 ? "down" : "up"} to ${say(y1)}.`, `${build(p2, y1).replace(/\.$/, "")}: ${d2 ? "down" : "up"} to ${say(y2)}.`];
  }
  if ((m = key.match(/^cpb:(\d+)%([\d.]+)e(\d+)$/))) return [build(+m[1], +m[2] * 10 ** +m[3])];
  if ((m = key.match(/^cgr:(\d+)%x(\d+)y(\d+)$/))) { const r = +m[1], y = +m[2]; let a = +m[3]; const seq = [say(a)]; for (let i = 0; i < y; i++) { a *= 1 + r / 100; seq.push(say(a)); } return [`${r}% of ${seq[0]} is ${say((r / 100) * +m[3])}: ${seq[0]} → ${seq[1]}.`, `Each year again: ${seq.slice(1).join(" → ")}.`]; }
  return null;
}
