/**
 * Strength/weakness map specs — one per subsection.
 *
 * A map is a grid (rows × cols) or a strip (rows only). Each cell aggregates
 * every answered item whose key parses into it. For fact-type subsections a
 * cell is one fact (7×8); for generated ones a cell is a structural bucket
 * ("coefficient product needs a carry" × "exponent sum 9–13").
 */
import { SCALES } from "./numbers";

export interface MapSpec {
  /** item_key prefix to fetch, e.g. "mul:" */
  prefix: string;
  rows: string[];
  /** null → strip (one cell per row, laid out horizontally) */
  cols: string[] | null;
  /** key → [rowIndex, colIndex] (colIndex 0 for strips), or null if it doesn't belong on this map */
  parse: (key: string) => [number, number] | null;
  /** text for a cell, e.g. "7 × 8 = 56" */
  label: (r: number, c: number) => string;
  /** whether a cell exists (e.g. lower triangle); default all */
  valid?: (r: number, c: number) => boolean;
  /** typical characters typed for an answer (drives the fluency budget) */
  typed: number;
  rowTitle?: string;
  colTitle?: string;
}

const range = (lo: number, hi: number) => Array.from({ length: hi - lo + 1 }, (_, i) => String(lo + i));
const idx = (arr: string[], v: string | number) => arr.indexOf(String(v));
const band = (v: number, edges: number[]) => edges.findIndex((e) => v <= e);
const scaleName = (exp: number) => SCALES.find((s) => s.exp === exp)?.word ?? `10^${exp}`;
const headClass = (h: number) => (!Number.isInteger(h) ? 3 : h < 10 ? 0 : h < 100 ? 1 : 2);
const HEAD_CLASSES = ["1 digit", "2 digits", "3 digits", "decimal"];
const SCALE_WORDS = SCALES.map((s) => s.word);
const scalePairs = (() => { const out: string[] = []; for (const a of SCALE_WORDS) for (const b of SCALE_WORDS) out.push(`${a} × ${b}`); return out; })();
const scaleDivPairs = (() => { const out: string[] = []; for (const a of SCALE_WORDS) for (const b of SCALE_WORDS) if (SCALES.find(s=>s.word===a)!.exp > SCALES.find(s=>s.word===b)!.exp) out.push(`${a} ÷ ${b}`); return out; })();

const PCT_CLASSES = ["10 / 50 %", "20 / 25 / 75 %", "other …5 %", "odd %"];
const pctClass = (p: number) => (p === 10 || p === 50 ? 0 : p === 20 || p === 25 || p === 75 ? 1 : p % 5 === 0 ? 2 : 3);
const sizeCol = (n: string, lo = 2, hi = 7) => Math.min(hi - lo, Math.max(0, n.length - lo));
const SIZE_COLS = ["2-digit", "3-digit", "4-digit", "5-digit", "6-digit", "7-digit"];

const mulKey = (k: string) => { const m = k.match(/^mul:(\d+)x(\d+)$/); return m ? [+m[1], +m[2]] as [number, number] : null; };
const TENS = ["10s", "20s", "30s", "40s", "50s", "60s", "70s", "80s", "90s"];

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
const SIZE3 = ["2–3 digits", "4 digits", "5+ digits"];
const size3 = (n: string) => Math.min(2, Math.max(0, n.length - 3));

export const MAPS: Record<string, MapSpec> = {
  "Simplest form": {
    prefix: "simp:", rows: ["÷2", "÷3", "÷4", "÷5", "÷6+"], cols: ["halves–quarters", "fifths–sixths", "eighths–twelfths", "16ths+"], typed: 3, rowTitle: "common factor", colTitle: "result",
    parse: (k) => { const m = k.match(/^simp:(\d+)\/(\d+)$/); if (!m) return null; const n = +m[1], d = +m[2]; const g = gcd(n, d); const rd = d / g; return [Math.min(4, g - 2), rd <= 4 ? 0 : rd <= 6 ? 1 : rd <= 12 ? 2 : 3]; },
    label: (r, c) => `${["÷2", "÷3", "÷4", "÷5", "÷6+"][r]} → ${["halves–quarters", "fifths–sixths", "eighths–twelfths", "16ths+"][c]}`,
  },
  Compare: {
    prefix: "cmp:", rows: ["same denominator", "same numerator", "unit fractions", "general"], cols: ["far apart", "close (< 0.08)"], typed: 3,
    parse: (k) => { const m = k.match(/^cmp:(\d+)\/(\d+)v(\d+)\/(\d+)$/); if (!m) return null; const [a, b, c, d] = m.slice(1).map(Number); const kind = b === d ? 0 : a === c && a !== 1 ? 1 : a === 1 && c === 1 ? 2 : 3; return [kind, Math.abs(a / b - c / d) < 0.08 ? 1 : 0]; },
    label: (r, c) => `${["same denominator", "same numerator", "unit fractions", "general"][r]}, ${c ? "close" : "far apart"}`,
  },
  "Fraction of a quantity": {
    prefix: "frof:", rows: range(2, 16), cols: ["2–3 digits", "4 digits", "5 digits", "6+ digits"], typed: 4, rowTitle: "denominator", colTitle: "quantity",
    parse: (k) => { const m = k.match(/^frof:(\d+)\/(\d+)x(\d+)$/); if (!m) return null; const r = idx(range(2, 16), m[2]); return r < 0 ? null : [r, Math.min(3, Math.max(0, m[3].length - 3))]; },
    label: (r, c) => `n/${r + 2} of a ${["2–3", "4", "5", "6+"][c]}-digit quantity`,
  },
  "Add & subtract": {
    prefix: "fradd:", rows: ["like denominators", "related (one divides the other)", "unlike"], cols: ["add", "subtract"], typed: 4,
    parse: (k) => { const m = k.match(/^fradd:(\d+)\/(\d+)([+-])(\d+)\/(\d+)$/); if (!m) return null; const b = +m[2], d = +m[5]; const kind = b === d ? 0 : b % d === 0 || d % b === 0 ? 1 : 2; return [kind, m[3] === "-" ? 1 : 0]; },
    label: (r, c) => `${["like", "related", "unlike"][r]} denominators, ${c ? "subtract" : "add"}`,
  },
  "Fraction ↔ decimal": {
    prefix: "", rows: range(2, 25), cols: ["fraction → decimal", "decimal → fraction"], typed: 4, rowTitle: "denominator",
    parse: (k) => { const m = k.match(/^(f2d|d2f):(\d+)\/(\d+)$/); if (!m) return null; const r = idx(range(2, 25), m[3]); return r < 0 ? null : [r, m[1] === "d2f" ? 1 : 0]; },
    label: (r, c) => `denominator ${r + 2}, ${c ? "decimal → fraction" : "fraction → decimal"}`,
  },
  "×÷ by powers of ten": {
    prefix: "scale:", rows: ["× 10", "× 100", "× 1000", "× 10 000", "÷ 10", "÷ 100", "÷ 1000", "÷ 10 000"], cols: ["whole number", "decimal"], typed: 5,
    parse: (k) => { const m = k.match(/^scale:([\d.]+)([x/])(\d+)$/); if (!m) return null; const n = Math.round(Math.log10(+m[3])) - 1; if (n < 0 || n > 3) return null; return [(m[2] === "/" ? 4 : 0) + n, m[1].includes(".") ? 1 : 0]; },
    label: (r, c) => `${["× 10", "× 100", "× 1000", "× 10 000", "÷ 10", "÷ 100", "÷ 1000", "÷ 10 000"][r]}, ${c ? "decimal" : "whole number"}`,
  },
  "Decimal ↔ percent": {
    prefix: "", rows: ["decimal → percent", "percent → decimal"], cols: ["whole percent", "one decimal", "two+ decimals"], typed: 4,
    parse: (k) => { const m = k.match(/^(d2p|p2d):([\d.]+)$/); if (!m) return null; const pct = m[1] === "d2p" ? +m[2] * 100 : +m[2]; const dp = (String(Math.round(pct * 1000) / 1000).split(".")[1] ?? "").length; return [m[1] === "d2p" ? 0 : 1, Math.min(2, dp)]; },
    label: (r, c) => `${r ? "percent → decimal" : "decimal → percent"}, ${["whole percent", "one decimal", "two+ decimals"][c]}`,
  },
  Rounding: {
    prefix: "round:", rows: ["nearest 10", "nearest 100", "nearest 1000", "1 decimal place", "2 decimal places"], cols: SIZE3, typed: 4, rowTitle: "to", colTitle: "number size",
    parse: (k) => { const m = k.match(/^round:([\d.]+)@(\d)$/); if (!m) return null; return [+m[2], size3(m[1].split(".")[0])]; },
    label: (r, c) => `${["nearest 10", "nearest 100", "nearest 1000", "1 dp", "2 dp"][r]}, ${SIZE3[c]}`,
  },
  "Decimal arithmetic": {
    prefix: "dop:", rows: ["add", "subtract", "× one digit"], cols: ["1 decimal place", "2 decimal places"], typed: 4,
    parse: (k) => { const m = k.match(/^dop:([\d.]+)([+x-])([\d.]+)$/); if (!m) return null; const places = Math.max((m[1].split(".")[1] ?? "").length, (m[3].split(".")[1] ?? "").length); return [m[2] === "+" ? 0 : m[2] === "-" ? 1 : 2, Math.min(1, Math.max(0, places - 1))]; },
    label: (r, c) => `${["add", "subtract", "× one digit"][r]}, ${c ? "2" : "1"} decimal place${c ? "s" : ""}`,
  },
  "Two-digit × one-digit": {
    prefix: "mul:", rows: TENS, cols: range(2, 9), typed: 3, rowTitle: "two-digit factor", colTitle: "one-digit factor",
    parse: (k) => { const ab = mulKey(k); if (!ab) return null; const [a, b] = ab; if (a < 2 || a > 9 || b < 12 || b > 99) return null; return [Math.floor(b / 10) - 1, a - 2]; },
    label: (r, c) => `${TENS[r]} × ${c + 2}`,
  },
  Shortcuts: {
    prefix: "mul:", rows: ["×5", "×25", "×50", "×11", "×101"], cols: ["even / easy", "odd / awkward"], typed: 4, rowTitle: "multiplier",
    parse: (k) => { const ab = mulKey(k); if (!ab) return null; const [a, b] = ab; const ms = [5, 25, 50, 11, 101]; const r = ms.indexOf(b) >= 0 && a !== b ? ms.indexOf(b) : ms.indexOf(a); if (r < 0) return null; const x = ms.indexOf(b) >= 0 && a !== b ? a : b; const awkward = b === 25 || a === 25 ? x % 4 !== 0 : b === 11 || a === 11 ? Math.floor(x / 10) + (x % 10) >= 10 : x % 2 !== 0; return [r, awkward ? 1 : 0]; },
    label: (r, c) => `${["×5", "×25", "×50", "×11", "×101"][r]}, ${c ? "awkward" : "easy"} partner`,
  },
  "Doubling & halving": {
    prefix: "mul:", rows: ["one halving", "two halvings"], cols: ["partner ≤ 45", "partner > 45"], typed: 4,
    parse: (k) => { const ab = mulKey(k); if (!ab) return null; const [a, b] = ab; const even = a % 2 === 0 ? a : b % 2 === 0 ? b : null; if (even === null || (even !== a && even !== b)) return null; const odd = even === a ? b : a; if (odd % 5 !== 0 || odd < 15 || odd > 95) return null; return [even % 4 === 0 ? 1 : 0, odd > 45 ? 1 : 0]; },
    label: (r, c) => `${r ? "two halvings" : "one halving"}, partner ${c ? "> 45" : "≤ 45"}`,
  },
  "Near 100": {
    prefix: "mul:", rows: ["96–97", "98–99", "101–102", "103–104"], cols: ["×2–5", "×6–9", "×10–25"], typed: 4, rowTitle: "near-100 factor",
    parse: (k) => { const ab = mulKey(k); if (!ab) return null; const [a, b] = ab; const big = Math.max(a, b), small = Math.min(a, b); if (big < 96 || big > 104 || big === 100) return null; const r = big <= 97 ? 0 : big <= 99 ? 1 : big <= 102 ? 2 : 3; return [r, small <= 5 ? 0 : small <= 9 ? 1 : 2]; },
    label: (r, c) => `${["96–97", "98–99", "101–102", "103–104"][r]} × ${["2–5", "6–9", "10–25"][c]}`,
  },
  Division: {
    prefix: "div:", rows: range(2, 12), cols: ["quotient ≤ 12", "13–49", "50–99"], typed: 2, rowTitle: "divisor", colTitle: "quotient",
    parse: (k) => { const m = k.match(/^div:(\d+)\/(\d+)$/); if (!m) return null; const d = +m[2], q = +m[1] / d; const r = idx(range(2, 12), d); if (r < 0) return null; return [r, q <= 12 ? 0 : q < 50 ? 1 : 2]; },
    label: (r, c) => `÷ ${r + 2}, quotient ${["≤ 12", "13–49", "50–99"][c]}`,
  },
  "Apply a change": {
    prefix: "pctap:", rows: PCT_CLASSES, cols: SIZE_COLS, typed: 6, rowTitle: "percent", colTitle: "base size",
    parse: (k) => { const m = k.match(/^pctap:(up|down)(\d+)%(\d+)$/); if (!m) return null; return [pctClass(+m[2]), sizeCol(m[3])]; },
    label: (r, c) => `${PCT_CLASSES[r]} change on a ${SIZE_COLS[c]} base`,
  },
  "Find the change": {
    prefix: "pctf:", rows: PCT_CLASSES, cols: ["up", "down"], typed: 2, rowTitle: "percent",
    parse: (k) => { const m = k.match(/^pctf:(up|down)(\d+)%/); if (!m) return null; return [pctClass(+m[2]), m[1] === "down" ? 1 : 0]; },
    label: (r, c) => `${PCT_CLASSES[r]}, ${c ? "decrease" : "increase"}`,
  },
  "What percent": {
    prefix: "pctw:", rows: PCT_CLASSES, cols: SIZE_COLS.slice(0, 3), typed: 2, rowTitle: "percent", colTitle: "whole size",
    parse: (k) => { const m = k.match(/^pctw:([\d.]+)of(\d+)$/); if (!m) return null; const p = Math.round((100 * +m[1]) / +m[2]); return [pctClass(p), Math.min(2, sizeCol(m[2]))]; },
    label: (r, c) => `${PCT_CLASSES[r]} of a ${SIZE_COLS[c]} whole`,
  },
  "Reverse percent": {
    prefix: "pctr:", rows: PCT_CLASSES, cols: ["x is p% of what", "after p% off"], typed: 4, rowTitle: "percent",
    parse: (k) => { const m = k.match(/^pctr:(off|is)(\d+)%/); if (!m) return null; return [pctClass(+m[2]), m[1] === "off" ? 1 : 0]; },
    label: (r, c) => `${PCT_CLASSES[r]}, ${c ? "after p% off" : "x is p% of what"}`,
  },
  "Chained changes": {
    prefix: "pctch:", rows: PCT_CLASSES, cols: PCT_CLASSES, typed: 5, rowTitle: "first change", colTitle: "second change",
    parse: (k) => { const m = k.match(/^pctch:(?:up|down)(\d+),(?:up|down)(\d+)%/); if (!m) return null; return [pctClass(+m[1]), pctClass(+m[2])]; },
    label: (r, c) => `${PCT_CLASSES[r]} then ${PCT_CLASSES[c]}`,
  },
  // ── Multiplicative arithmetic ──
  Remainders: {
    prefix: "rem:", rows: ["÷2, 5, 10", "÷3, 9", "÷4", "÷6", "÷7, 8"], cols: ["2–3 digits", "4 digits", "5 digits"], typed: 1, rowTitle: "divisor",
    parse: (k) => { const m = k.match(/^rem:(\d+)%(\d+)$/); if (!m) return null; const d = +m[2]; const r = [2, 5, 10].includes(d) ? 0 : [3, 9].includes(d) ? 1 : d === 4 ? 2 : d === 6 ? 3 : 4; return [r, Math.min(2, Math.max(0, m[1].length - 3))]; },
    label: (r, c) => `${["÷2, 5, 10", "÷3, 9", "÷4", "÷6", "÷7, 8"][r]}, ${["2–3", "4", "5"][c]}-digit number`,
  },
  "Times tables": {
    prefix: "mul:", rows: range(2, 25), cols: range(2, 25), typed: 3,
    parse: (k) => { const m = k.match(/^mul:(\d+)x(\d+)$/); if (!m) return null; const a = +m[1], b = +m[2]; const r = idx(range(2, 25), a), c = idx(range(2, 25), b); return r < 0 || c < 0 ? null : [r, c]; },
    label: (r, c) => `${r + 2} × ${c + 2} = ${(r + 2) * (c + 2)}`, valid: (r, c) => c >= r,
  },
  Squares: { prefix: "sq:", rows: range(2, 25), cols: null, typed: 3, parse: (k) => { const m = k.match(/^sq:(\d+)$/); const r = m ? idx(range(2, 25), m[1]) : -1; return r < 0 ? null : [r, 0]; }, label: (r) => `${r + 2}² = ${(r + 2) ** 2}` },
  Cubes: { prefix: "cube:", rows: range(2, 15), cols: null, typed: 4, parse: (k) => { const m = k.match(/^cube:(\d+)$/); const r = m ? idx(range(2, 15), m[1]) : -1; return r < 0 ? null : [r, 0]; }, label: (r) => `${r + 2}³ = ${(r + 2) ** 3}` },

  // ── Fractions → percents ──
  "Unit fraction → %": { prefix: "fr:1/", rows: range(2, 20), cols: null, typed: 3, parse: (k) => { const m = k.match(/^fr:1\/(\d+)$/); const r = m ? idx(range(2, 20), m[1]) : -1; return r < 0 ? null : [r, 0]; }, label: (r) => `1/${r + 2} = ${(100 / (r + 2)).toFixed(1).replace(/\.0$/, "")}%` },
  "Fraction → %": {
    prefix: "fr:", rows: range(3, 20), cols: range(2, 19), typed: 4, rowTitle: "denominator", colTitle: "numerator",
    parse: (k) => { const m = k.match(/^fr:(\d+)\/(\d+)$/); if (!m || m[1] === "1") return null; const n = +m[1], d = +m[2]; const r = idx(range(3, 20), d), c = idx(range(2, 19), n); return r < 0 || c < 0 ? null : [r, c]; },
    label: (r, c) => `${c + 2}/${r + 3} = ${((100 * (c + 2)) / (r + 3)).toFixed(1).replace(/\.0$/, "")}%`, valid: (r, c) => c + 2 < r + 3,
  },

  // ── Powers of ten ──
  "Count the zeros": { prefix: "zeros:", rows: range(2, 12), cols: null, typed: 2, parse: (k) => { const m = k.match(/^zeros:(\d+)$/); const r = m ? idx(range(2, 12), m[1]) : -1; return r < 0 ? null : [r, 0]; }, label: (r) => `1${"0".repeat(r + 2)} = 10^${r + 2}` },
  "Word → power of ten": {
    prefix: "wexp:", rows: SCALE_WORDS, cols: ["one", "ten", "a hundred"], typed: 2,
    parse: (k) => { const m = k.match(/^wexp:(one|ten|a hundred) (\w+)$/); if (!m) return null; const r = idx(SCALE_WORDS, m[2]), c = idx(["one", "ten", "a hundred"], m[1]); return r < 0 || c < 0 ? null : [r, c]; },
    label: (r, c) => `${["one", "ten", "a hundred"][c]} ${SCALE_WORDS[r]} = 10^${SCALES[r].exp + c}`,
  },

  // ── Exponent arithmetic ──
  "Add exponents": {
    prefix: "eadd:", rows: range(1, 12), cols: range(1, 12), typed: 2,
    parse: (k) => { const m = k.match(/^eadd:(\d+)\+(\d+)$/); if (!m) return null; const r = idx(range(1, 12), m[1]), c = idx(range(1, 12), m[2]); return r < 0 || c < 0 ? null : [r, c]; },
    label: (r, c) => `10^${r + 1} × 10^${c + 1} = 10^${r + c + 2}`, valid: (r, c) => c >= r,
  },
  "Subtract exponents": {
    prefix: "esub:", rows: range(2, 18), cols: range(1, 9), typed: 2, rowTitle: "a", colTitle: "b",
    parse: (k) => { const m = k.match(/^esub:(\d+)-(\d+)$/); if (!m) return null; const r = idx(range(2, 18), m[1]), c = idx(range(1, 9), m[2]); return r < 0 || c < 0 ? null : [r, c]; },
    label: (r, c) => `10^${r + 2} ÷ 10^${c + 1} = 10^${r + 2 - (c + 1)}`, valid: (r, c) => r + 2 > c + 1,
  },
  "Coefficient facts": {
    prefix: "mul:", rows: range(2, 9), cols: range(2, 9), typed: 2,
    parse: (k) => { const m = k.match(/^mul:(\d+)x(\d+)$/); if (!m) return null; const r = idx(range(2, 9), m[1]), c = idx(range(2, 9), m[2]); return r < 0 || c < 0 ? null : [r, c]; },
    label: (r, c) => `${r + 2} × ${c + 2} = ${(r + 2) * (c + 2)}`, valid: (r, c) => c >= r,
  },

  // ── Scientific notation (structural buckets) ──
  "Digits → scientific": {
    prefix: "snd:", rows: range(3, 12), cols: ["whole coefficient", "decimal coefficient"], typed: 5, rowTitle: "exponent",
    parse: (k) => { const m = k.match(/^snd:([\d.]+)e(\d+)$/); if (!m) return null; const r = idx(range(3, 12), m[2]); return r < 0 ? null : [r, m[1].includes(".") ? 1 : 0]; },
    label: (r, c) => `${c ? "d.d" : "d"} × 10^${r + 3}`,
  },
  "Words → scientific": {
    prefix: "snw:", rows: SCALE_WORDS, cols: HEAD_CLASSES, typed: 5, rowTitle: "scale word", colTitle: "leading number",
    parse: (k) => { const m = k.match(/^snw:([\d.]+)e(\d+)$/); if (!m) return null; const r = SCALES.findIndex((s) => s.exp === +m[2]); return r < 0 ? null : [r, headClass(+m[1])]; },
    label: (r, c) => `${HEAD_CLASSES[c]} ${SCALE_WORDS[r]}`,
  },
  Renormalize: {
    prefix: "snn:", rows: range(2, 11), cols: ["10–99", "100–999", "less than 1"], typed: 5, rowTitle: "exponent", colTitle: "coefficient",
    parse: (k) => { const m = k.match(/^snn:([\d.]+)e(\d+)$/); if (!m) return null; const c = +m[1]; const r = idx(range(2, 11), m[2]); return r < 0 ? null : [r, c < 1 ? 2 : c < 100 ? 0 : 1]; },
    label: (r, c) => `${["10–99", "100–999", "0.x"][c]} × 10^${r + 2}`,
  },

  // ── Operating in scientific notation ──
  "Multiply in scientific": {
    prefix: "snm:", rows: ["sum 4–8", "sum 9–13", "sum 14–21"], cols: ["no carry (a·b < 10)", "carry (a·b ≥ 10)"], typed: 6, rowTitle: "exponent sum",
    parse: (k) => { const m = k.match(/^snm:(\d+)e(\d+)\*(\d+)e(\d+)$/); if (!m) return null; const a = +m[1], b = +m[3], e = +m[2] + +m[4]; return [band(e, [8, 13, 99]), a * b >= 10 ? 1 : 0]; },
    label: (r, c) => `${["sum 4–8", "sum 9–13", "sum 14–21"][r]}, ${c ? "carry" : "no carry"}`,
  },
  "Divide in scientific": {
    prefix: "snv:", rows: ["diff 1–3", "diff 4–6", "diff 7–9"], cols: ["a < 10", "a ≥ 10 (renormalize)"], typed: 4, rowTitle: "exponent difference",
    parse: (k) => { const m = k.match(/^snv:(\d+)e(\d+)\/(\d+)e(\d+)$/); if (!m) return null; const a = +m[1], d = +m[2] - +m[4]; return [band(d, [3, 6, 99]), a >= 10 ? 1 : 0]; },
    label: (r, c) => `${["diff 1–3", "diff 4–6", "diff 7–9"][r]}, ${c ? "a ≥ 10" : "a < 10"}`,
  },

  // ── Magnitude estimation ──
  "Magnitude of a product": {
    prefix: "magm:", rows: scalePairs, cols: ["both 1-digit", "one 2-digit", "both 2-digit"], typed: 4, rowTitle: "scales", colTitle: "leading numbers",
    parse: (k) => { const m = k.match(/^magm:(\d+)e(\d+)\*(\d+)e(\d+)$/); if (!m) return null; const r = idx(scalePairs, `${scaleName(+m[2])} × ${scaleName(+m[4])}`); const big = (+m[1] >= 10 ? 1 : 0) + (+m[3] >= 10 ? 1 : 0); return r < 0 ? null : [r, big]; },
    label: (r, c) => `${scalePairs[r]}, ${["both 1-digit", "one 2-digit", "both 2-digit"][c]}`,
  },
  "Magnitude of a quotient": {
    prefix: "magd:", rows: scaleDivPairs, cols: ["quotient < 10", "quotient ≥ 10"], typed: 3, rowTitle: "scales",
    parse: (k) => { const m = k.match(/^magd:(\d+)e(\d+)\/(\d+)e(\d+)$/); if (!m) return null; const r = idx(scaleDivPairs, `${scaleName(+m[2])} ÷ ${scaleName(+m[4])}`); const q = +m[1] / +m[3]; return r < 0 ? null : [r, q >= 10 ? 1 : 0]; },
    label: (r, c) => `${scaleDivPairs[r]}, ${c ? "quotient ≥ 10" : "quotient < 10"}`,
  },

  // ── Percents ──
  "10% and 1% anchors": {
    prefix: "pcta:", rows: ["1%", "5%", "10%", "50%"], cols: ["2-digit base", "3-digit base", "4-digit base", "5-digit base"], typed: 3,
    parse: (k) => { const m = k.match(/^pcta:(\d+)%(\d+)$/); if (!m) return null; const r = idx(["1%", "5%", "10%", "50%"], `${m[1]}%`); const c = Math.min(3, Math.max(0, m[2].length - 2)); return r < 0 ? null : [r, c]; },
    label: (r, c) => `${["1%", "5%", "10%", "50%"][r]} of a ${c + 2}-digit number`,
  },
  "Compose percents": {
    prefix: "pctc:", rows: ["tens only (20, 30…)", "quarters (25, 75)", "with fives (15, 35…)", "odd (12, 18, 22…)"], cols: ["2-digit base", "3-digit base", "4-digit base"], typed: 3,
    parse: (k) => { const m = k.match(/^pctc:(\d+)%(\d+)$/); if (!m) return null; const p = +m[1]; const r = p % 10 === 0 ? 0 : p === 25 || p === 75 ? 1 : p % 5 === 0 ? 2 : 3; const c = Math.min(2, Math.max(0, m[2].length - 2)); return [r, c]; },
    label: (r, c) => `${["tens-only %", "25 / 75 %", "…5 %", "odd %"][r]} of a ${c + 2}-digit number`,
  },
};
