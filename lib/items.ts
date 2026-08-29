import type { SkillId } from "./skills";
import * as P from "./priors";
import { SCALES, fmtDigits, fmtSci, numberToWords, parseSci, parseValue, pick, ri, shortWords, toSci, toScaleWords } from "./numbers";

/** Sampling tier used only to draw candidates across the whole range; difficulty itself is the item's `prior`. */
export type Level = 1 | 2 | 3;

/** One practice item. `check` returns whether the typed answer is acceptable. */
export interface Item {
  skillId: SkillId;
  level: Level;
  /** Canonical identity of the fact/template instance, e.g. "mul:7x8", "fr:3/11". */
  key: string;
  /** Structural difficulty prior (logit). See lib/priors.ts. */
  prior: number;
  prompt: string;
  /** Small text under the prompt (e.g. "= 10^?"). */
  sub?: string;
  /** Shown after a miss. */
  answerText: string;
  /** One-line reasoning shown after a miss. */
  why: string;
  /** Keyboard hint for the input. */
  inputMode: "numeric" | "decimal" | "text";
  placeholder: string;
  check: (input: string) => boolean;
}

// ── checkers ───────────────────────────────────────────────────────────────

/** Integer answer. Accepts "12", "10^12", "^12", "e12", "1e12". */
const intEq = (input: string, target: number) => {
  const s = input.trim().toLowerCase().replace(/\s+/g, "");
  const m = s.match(/^(?:10\^|\^|1?e)?(-?\d+)$/);
  return !!m && parseInt(m[1], 10) === target;
};

/** Coefficient to 1dp and exact exponent. */
const sciEq = (input: string, c: number, e: number) => {
  const p = parseSci(input);
  if (!p) return false;
  return p.e === e && Math.abs(p.c - c) < 0.06;
};

/** Within `tol` orders of magnitude (log10). */
const magEq = (input: string, target: number, tol: number) => {
  const v = parseValue(input);
  if (v === null || v <= 0) return false;
  return Math.abs(Math.log10(v) - Math.log10(target)) <= tol;
};

/** Percent answer within ±0.5 point (so 1/12 accepts 8, 8.3, 8.33). */
const PCT_TOL = 0.5;
const pctEq = (input: string, target: number) => {
  const v = parseValue(input.replace(/%/g, ""));
  return v !== null && Math.abs(v - target) <= PCT_TOL;
};
const fmtPct = (p: number) => (Number.isInteger(p) ? String(p) : p.toFixed(1).replace(/\.0$/, ""));
const r1 = (x: number) => Math.round(x * 10) / 10;

const by = <T,>(level: Level, l1: T, l2: T, l3: T): T => (level === 1 ? l1 : level === 2 ? l2 : l3);

type Gen = (level: Level) => Omit<Item, "level">;

const GENERATORS: Record<SkillId, Gen> = {
  // ── Arithmetic ─────────────────────────────────────────────────────────
  // 7 × 8 → 56   (both factors ≤ 12; never ×1 / ×10)
  "ar.mul12": (L) => {
    let x: number, y: number;
    do { x = by(L, ri(2, 6), ri(2, 9), ri(3, 12)); y = by(L, ri(2, 9), ri(2, 12), ri(6, 12)); } while (x === 10 || y === 10);
    return {
      skillId: "ar.mul12", key: `mul:${Math.min(x, y)}x${Math.max(x, y)}`, prior: P.mulPrior(x, y), prompt: `${x} × ${y}`, answerText: String(x * y),
      why: `${x} × ${y} = ${x * y}`, inputMode: "numeric", placeholder: "product", check: (s) => intEq(s, x * y),
    };
  },
  // 13 × 17 → 221   (at least one factor 13–20)
  "ar.mul20": (L) => {
    let a: number, b: number;
    do { a = by(L, ri(13, 15), ri(13, 20), ri(13, 20)); b = by(L, ri(2, 9), ri(2, 12), ri(13, 20)); } while (b === 10 || a === 20 && b === 10);
    const [x, y] = Math.random() < 0.5 ? [a, b] : [b, a];
    return {
      skillId: "ar.mul20", key: `mul:${Math.min(x, y)}x${Math.max(x, y)}`, prior: P.mulPrior(x, y), prompt: `${x} × ${y}`, answerText: String(x * y),
      why: x > 10 && y > 10 ? `${x}×${y} = ${x}×10 + ${x}×${y - 10} = ${x * 10} + ${x * (y - 10)}` : `${x} × ${y} = ${x * y}`,
      inputMode: "numeric", placeholder: "product", check: (s) => intEq(s, x * y),
    };
  },
  // 23 × 7 → 161   (at least one factor 21–25)
  "ar.mul25": (L) => {
    let a: number, b: number;
    do { a = ri(21, 25); b = by(L, ri(2, 9), ri(2, 15), ri(11, 25)); } while (b === 10 || b === 20);
    const [x, y] = Math.random() < 0.5 ? [a, b] : [b, a];
    const big = Math.max(x, y), small = Math.min(x, y);
    return {
      skillId: "ar.mul25", key: `mul:${small}x${big}`, prior: P.mulPrior(x, y) + 0.4, prompt: `${x} × ${y}`, answerText: String(x * y),
      why: `${big}×${small} = 20×${small} + ${big - 20}×${small} = ${20 * small} + ${(big - 20) * small}`,
      inputMode: "numeric", placeholder: "product", check: (s) => intEq(s, x * y),
    };
  },
  // 9² → 81
  "ar.sq12": (L) => {
    const n = by(L, ri(2, 6), ri(2, 9), ri(6, 12));
    return {
      skillId: "ar.sq12", key: `sq:${n}`, prior: P.squarePrior(n), prompt: `${n}²`, answerText: String(n * n),
      why: `${n} × ${n}`, inputMode: "numeric", placeholder: "value", check: (s) => intEq(s, n * n),
    };
  },
  // 17² → 289
  "ar.sq25": (L) => {
    const n = by(L, ri(13, 16), ri(13, 20), ri(16, 25));
    return {
      skillId: "ar.sq25", key: `sq:${n}`, prior: P.squarePrior(n), prompt: `${n}²`, answerText: String(n * n),
      why: `(${n - 10}+10)² = ${(n - 10) ** 2} + ${20 * (n - 10)} + 100`, inputMode: "numeric", placeholder: "value", check: (s) => intEq(s, n * n),
    };
  },
  // 7³ → 343
  "ar.cube10": (L) => {
    const n = by(L, ri(2, 5), ri(2, 8), ri(5, 10));
    return {
      skillId: "ar.cube10", key: `cube:${n}`, prior: P.cubePrior(n), prompt: `${n}³`, answerText: String(n ** 3),
      why: `${n}² = ${n * n}, × ${n} = ${n ** 3}`, inputMode: "numeric", placeholder: "value", check: (s) => intEq(s, n ** 3),
    };
  },
  // 13³ → 2197
  "ar.cube15": (L) => {
    const n = by(L, ri(11, 12), ri(11, 14), ri(12, 15));
    return {
      skillId: "ar.cube15", key: `cube:${n}`, prior: P.cubePrior(n), prompt: `${n}³`, answerText: String(n ** 3),
      why: `${n}² = ${n * n}, × ${n} = ${n ** 3}`, inputMode: "numeric", placeholder: "value", check: (s) => intEq(s, n ** 3),
    };
  },

  // ── Fractions → percents ───────────────────────────────────────────────
  // 1/12 → 8.3
  "fr.unit": (L) => {
    const d = pick(by(L, [2, 3, 4, 5, 10], [2, 3, 4, 5, 6, 8, 10, 12, 20], [6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]));
    const p = 100 / d;
    return {
      skillId: "fr.unit", key: `fr:1/${d}`, prior: P.unitFractionPrior(d), prompt: `1/${d}`, sub: `as a percent · within ${PCT_TOL}`,
      answerText: `${fmtPct(r1(p))}%`, why: `100 ÷ ${d}`,
      inputMode: "decimal", placeholder: "%", check: (s) => pctEq(s, p),
    };
  },
  // 5/12 → 41.7
  "fr.common": (L) => {
    const d = pick(by(L, [4, 5, 8, 10], [3, 4, 5, 6, 8, 10, 12], [7, 8, 9, 12, 15, 16, 20]));
    const n = ri(2, d - 1); // d ≥ 3 guarantees 2 ≤ n < d
    const p = (100 * n) / d;
    return {
      skillId: "fr.common", key: `fr:${n}/${d}`, prior: P.fractionPrior(n, d), prompt: `${n}/${d}`, sub: `as a percent · within ${PCT_TOL}`,
      answerText: `${fmtPct(r1(p))}%`, why: `1/${d} = ${fmtPct(r1(100 / d))}%, × ${n}`,
      inputMode: "decimal", placeholder: "%", check: (s) => pctEq(s, p),
    };
  },

  // ── Powers of ten ──────────────────────────────────────────────────────
  // 1,000,000 → 6
  "pv.zeros": (L) => {
    const e = by(L, ri(2, 6), ri(3, 9), ri(6, 12));
    return {
      skillId: "pv.zeros", key: `zeros:${e}`, prior: P.zerosPrior(e), prompt: fmtDigits(10 ** e), sub: "= 10 ^ ?", answerText: `10^${e}`,
      why: `${e} zeros → 10^${e}`, inputMode: "numeric", placeholder: "exponent", check: (s) => intEq(s, e),
    };
  },
  // "billion" → 9
  "pv.word-exp": (L) => {
    const sc = pick(SCALES);
    const variants = [{ p: `one ${sc.word}`, e: sc.exp }, { p: `ten ${sc.word}`, e: sc.exp + 1 }, { p: `a hundred ${sc.word}`, e: sc.exp + 2 }];
    const v = pick(by(L, variants.slice(0, 1), variants.slice(0, 2), variants));
    return {
      skillId: "pv.word-exp", key: `wexp:${v.p}`, prior: P.wordExpPrior(SCALES.indexOf(sc), variants.indexOf(v) as 0 | 1 | 2), prompt: v.p, sub: "= 10 ^ ?", answerText: `10^${v.e}`,
      why: `${sc.word} = 10^${sc.exp}${v.e !== sc.exp ? `, times 10^${v.e - sc.exp}` : ""}`,
      inputMode: "numeric", placeholder: "exponent", check: (s) => intEq(s, v.e),
    };
  },

  // ── Exponent arithmetic ────────────────────────────────────────────────
  "exp.add": (L) => {
    const [lo, hi] = by(L, [1, 5], [1, 9], [3, 12]);
    const a = ri(lo, hi), b = ri(lo, hi);
    return {
      skillId: "exp.add", key: `eadd:${Math.min(a, b)}+${Math.max(a, b)}`, prior: P.expAddPrior(a, b), prompt: `10^${a} × 10^${b}`, sub: "= 10 ^ ?", answerText: `10^${a + b}`,
      why: `${a} + ${b} = ${a + b}`, inputMode: "numeric", placeholder: "exponent", check: (s) => intEq(s, a + b),
    };
  },
  "exp.sub": (L) => {
    const b = by(L, ri(1, 4), ri(1, 9), ri(3, 9));
    const a = b + by(L, ri(1, 4), ri(1, 6), ri(1, 9));
    return {
      skillId: "exp.sub", key: `esub:${a}-${b}`, prior: P.expSubPrior(a, b), prompt: `10^${a} ÷ 10^${b}`, sub: "= 10 ^ ?", answerText: `10^${a - b}`,
      why: `${a} − ${b} = ${a - b}`, inputMode: "numeric", placeholder: "exponent", check: (s) => intEq(s, a - b),
    };
  },
  // 7 × 8 → 56
  "coef.mul": (L) => {
    const [lo, hi] = by(L, [2, 5], [2, 9], [3, 9]);
    const a = ri(lo, hi), b = ri(lo, hi);
    return {
      skillId: "coef.mul", key: `mul:${Math.min(a, b)}x${Math.max(a, b)}`, prior: P.mulPrior(a, b), prompt: `${a} × ${b}`, answerText: String(a * b), why: `${a} × ${b} = ${a * b}`,
      inputMode: "numeric", placeholder: "product", check: (s) => intEq(s, a * b),
    };
  },

  // ── Scientific notation ────────────────────────────────────────────────
  // 68,000,000 → 6.8 × 10^7
  "sn.digits": (L) => {
    const e = by(L, ri(3, 6), ri(3, 9), ri(6, 12));
    const c = by(L, ri(1, 9), pick([ri(1, 9), ri(10, 99) / 10]), ri(10, 99) / 10);
    return {
      skillId: "sn.digits", key: `snd:${c}e${e}`, prior: P.snDigitsPrior(c, e), prompt: fmtDigits(c * 10 ** e), answerText: fmtSci(c, e),
      why: `leading digit ${Math.floor(c)}, then ${e} more places`,
      inputMode: "text", placeholder: "6.8e7", check: (s) => sciEq(s, c, e),
    };
  },
  // "sixty-eight million" → 6.8 × 10^7
  "sn.words": (L) => {
    const sc = pick(by(L, SCALES.slice(0, 2), SCALES, SCALES));
    const head = by(L, ri(2, 9), pick([ri(2, 9), ri(11, 99)]), pick([ri(11, 99), ri(101, 999), ri(11, 99) / 10]));
    const n = head * 10 ** sc.exp;
    const { c, e } = toSci(n);
    const cRound = r1(c);
    const prompt = Number.isInteger(head) ? numberToWords(n) : shortWords(head, sc.exp);
    return {
      skillId: "sn.words", key: `snw:${head}e${sc.exp}`, prior: P.snWordsPrior(head, SCALES.indexOf(sc)), prompt, answerText: fmtSci(cRound, e),
      why: `${sc.word} = 10^${sc.exp}; ${head} = ${fmtSci(cRound, e - sc.exp)}`,
      inputMode: "text", placeholder: "6.8e7", check: (s) => sciEq(s, cRound, e),
    };
  },
  // 48 × 10^7 → 4.8 × 10^8
  "sn.norm": (L) => {
    const e = by(L, ri(2, 6), ri(2, 9), ri(4, 11));
    let c: number, t: { c: number; e: number }, tc: number;
    do {
      c = by(L, ri(10, 99), pick([ri(10, 99), ri(100, 999)]), pick([ri(100, 999), ri(1, 9) / 10]));
      t = toSci(c * 10 ** e);
      tc = r1(t.c);
    } while (tc >= 10);
    return {
      skillId: "sn.norm", key: `snn:${c}e${e}`, prior: P.snNormPrior(c, e), prompt: fmtSci(c, e), answerText: fmtSci(tc, t.e),
      why: `move the point ${t.e - e > 0 ? "left" : "right"} ${Math.abs(t.e - e)} → exponent ${e} ${t.e - e >= 0 ? "+" : "−"} ${Math.abs(t.e - e)}`,
      inputMode: "text", placeholder: "4.8e8", check: (s) => sciEq(s, tc, t.e),
    };
  },

  // ── Operating in scientific notation ───────────────────────────────────
  // (6 × 10^7)(3 × 10^3) → 1.8 × 10^11
  "sn.mul": (L) => {
    const [lo, hi] = by(L, [2, 3], [2, 9], [3, 9]);
    const a = ri(lo, hi), b = ri(lo, hi);
    const [elo, ehi] = by(L, [2, 5], [2, 9], [5, 12]);
    const ea = ri(elo, ehi), eb = ri(elo, ehi);
    const t = toSci(a * b * 10 ** (ea + eb));
    const tc = r1(t.c);
    return {
      skillId: "sn.mul", key: `snm:${a}e${ea}*${b}e${eb}`, prior: P.snMulPrior(a, b, ea, eb), prompt: `(${a} × 10^${ea}) × (${b} × 10^${eb})`, answerText: fmtSci(tc, t.e),
      why: `${a}×${b} = ${a * b}; ${ea}+${eb} = ${ea + eb}${a * b >= 10 ? ` → renormalize, +1` : ""}`,
      inputMode: "text", placeholder: "1.8e11", check: (s) => sciEq(s, tc, t.e),
    };
  },
  // (8 × 10^9) ÷ (2 × 10^4) → 4 × 10^5
  "sn.div": (L) => {
    const b = by(L, ri(2, 5), ri(2, 9), ri(2, 9));
    const q = by(L, ri(1, 5), ri(1, 9), ri(2, 9));
    const a = b * q;
    const eb = by(L, ri(1, 3), ri(1, 6), ri(3, 8));
    const ea = eb + by(L, ri(1, 4), ri(1, 8), ri(2, 9));
    const t = toSci((a * 10 ** ea) / (b * 10 ** eb));
    const tc = r1(t.c);
    return {
      skillId: "sn.div", key: `snv:${a}e${ea}/${b}e${eb}`, prior: P.snDivPrior(a, q, ea), prompt: `(${a} × 10^${ea}) ÷ (${b} × 10^${eb})`, answerText: fmtSci(tc, t.e),
      why: `${a}÷${b} = ${q}; ${ea}−${eb} = ${ea - eb}${a >= 10 && q < 10 ? ` → renormalize` : ""}`,
      inputMode: "text", placeholder: "4e5", check: (s) => sciEq(s, tc, t.e),
    };
  },

  // ── Magnitude estimation ───────────────────────────────────────────────
  // 68 million × 3 thousand → ~2e11   (within 0.3 orders)
  "mag.mul": (L) => {
    const s1 = pick(by(L, SCALES.slice(0, 2), SCALES, SCALES));
    const s2 = pick(by(L, SCALES.slice(0, 1), SCALES.slice(0, 2), SCALES.slice(0, 3)));
    const h1 = by(L, ri(2, 9), pick([ri(2, 9), ri(11, 99)]), ri(11, 99));
    const h2 = by(L, ri(2, 9), pick([ri(2, 9), ri(11, 99)]), ri(11, 99));
    const n = h1 * 10 ** s1.exp * h2 * 10 ** s2.exp;
    const t = toSci(n);
    return {
      skillId: "mag.mul", key: `magm:${h1}e${s1.exp}*${h2}e${s2.exp}`, prior: P.magMulPrior(h1, h2, SCALES.indexOf(s1), SCALES.indexOf(s2)), prompt: `${h1} ${s1.word} × ${h2} ${s2.word}`, sub: "roughly · within ½ an order of magnitude",
      answerText: `≈ ${toScaleWords(n)}  (${fmtSci(r1(t.c), t.e)})`,
      why: `${h1}×${h2} ≈ ${h1 * h2}; 10^${s1.exp}×10^${s2.exp} = 10^${s1.exp + s2.exp}`,
      inputMode: "text", placeholder: "2e11", check: (s) => magEq(s, n, 0.3),
    };
  },
  // 8 billion ÷ 40 thousand → ~2e5
  "mag.div": (L) => {
    const s1 = pick(by(L, SCALES.slice(1, 3), SCALES.slice(1), SCALES.slice(1)));
    const s2 = pick(SCALES.filter((s) => s.exp < s1.exp));
    const h2 = by(L, ri(2, 9), pick([ri(2, 9), ri(2, 9) * 10]), pick([ri(2, 9), ri(2, 9) * 10]));
    const q = by(L, ri(1, 5), pick([ri(1, 9), ri(1, 9) * 10]), pick([ri(2, 9), ri(2, 9) * 10]));
    const h1 = h2 * q;
    const n = (h1 * 10 ** s1.exp) / (h2 * 10 ** s2.exp);
    const t = toSci(n);
    return {
      skillId: "mag.div", key: `magd:${h1}e${s1.exp}/${h2}e${s2.exp}`, prior: P.magDivPrior(h2, q, SCALES.indexOf(s1)), prompt: `${h1} ${s1.word} ÷ ${h2} ${s2.word}`, sub: "roughly · within ½ an order of magnitude",
      answerText: `≈ ${toScaleWords(n)}  (${fmtSci(r1(t.c), t.e)})`,
      why: `${h1}÷${h2} = ${q}; 10^${s1.exp}÷10^${s2.exp} = 10^${s1.exp - s2.exp}`,
      inputMode: "text", placeholder: "2e5", check: (s) => magEq(s, n, 0.3),
    };
  },

  // ── Percents ───────────────────────────────────────────────────────────
  // 10% of 3,400 → 340
  "pct.anchor": (L) => {
    const p = pick(by(L, [10, 50], [10, 1, 50, 5], [1, 5, 50, 10]));
    const base = pick(by(L, [ri(2, 99) * 10, ri(2, 9) * 100], [ri(2, 99) * 10, ri(2, 99) * 100, ri(2, 9) * 1000], [ri(11, 99) * 100, ri(11, 99) * 1000, ri(101, 999) * 10]));
    const ans = (p / 100) * base;
    return {
      skillId: "pct.anchor", key: `pcta:${p}%${base}`, prior: P.pctAnchorPrior(p, base), prompt: `${p}% of ${fmtDigits(base)}`, answerText: String(Math.round(ans * 100) / 100),
      why: p === 10 ? "shift one place left" : p === 1 ? "shift two places left" : p === 50 ? "halve it" : "half of 10%",
      inputMode: "decimal", placeholder: "value", check: (s) => { const v = parseValue(s); return v !== null && Math.abs(v - ans) < 0.011; },
    };
  },
  // 15% of 80 → 12
  "pct.compose": (L) => {
    const p = pick(by(L, [20, 25, 30, 15], [15, 20, 25, 30, 40, 60, 70, 75, 80, 90], [12, 18, 22, 35, 45, 65, 85, 95]));
    const base = pick(by(L, [ri(2, 20) * 10], [ri(2, 20) * 10, ri(2, 9) * 100], [ri(11, 99) * 10, ri(2, 9) * 100, ri(11, 49) * 100]));
    const ans = (p / 100) * base;
    const tens = Math.floor(p / 10) * 10, ones = p - tens;
    return {
      skillId: "pct.compose", key: `pctc:${p}%${base}`, prior: P.pctComposePrior(p, base), prompt: `${p}% of ${fmtDigits(base)}`, answerText: String(Math.round(ans * 100) / 100),
      why: ones ? `${tens}% + ${ones}% → ${(tens / 100) * base} + ${(ones / 100) * base}` : `${p / 10} × (10% = ${base / 10})`,
      inputMode: "decimal", placeholder: "value", check: (s) => { const v = parseValue(s); return v !== null && Math.abs(v - ans) / ans < 0.005; },
    };
  },
  // ── Percents: change, reverse, chains ──────────────────────────────────
  // 250,000 up 40% → 350,000
  "pct.apply": (L) => {
    const p = pick(by(L, [10, 20, 25, 50], [5, 10, 15, 20, 25, 30, 40, 50, 75], [5, 12, 15, 18, 30, 35, 40, 60, 70, 80, 90]));
    const base = pick(by(L, [ri(2, 9) * 100, ri(2, 9) * 1000], [ri(11, 99) * 100, ri(2, 9) * 10000, ri(12, 99) * 1000], [ri(11, 99) * 10000, ri(12, 98) * 100000, ri(2, 9) * 1000000]));
    const down = Math.random() < 0.45;
    const ans = base * (1 + (down ? -p : p) / 100);
    return {
      skillId: "pct.apply", key: `pctap:${down ? "down" : "up"}${p}%${base}`, prior: P.pctApplyPrior(p, base),
      prompt: `${fmtDigits(base)} ${down ? "down" : "up"} ${p}%`, sub: "new amount · within ½%",
      answerText: fmtDigits(ans), why: `${p}% of ${fmtDigits(base)} = ${fmtDigits((p / 100) * base)}; ${down ? "subtract" : "add"}`,
      inputMode: "text", placeholder: "3.5e5 or 350000", check: (s) => { const v = parseValue(s); return v !== null && Math.abs(v - ans) / ans <= 0.005; },
    };
  },
  // 80 → 100: up what %? → 25
  "pct.find": (L) => {
    const p = pick(by(L, [10, 20, 25, 50, 100], [5, 10, 15, 20, 25, 30, 40, 50, 75, 100], [5, 12, 15, 30, 35, 40, 60, 80, 90, 150, 200]));
    const down = Math.random() < 0.45 && p < 100;
    const base = pick(by(L, [20, 40, 50, 80, 100, 200, 400, 500], [60, 80, 120, 150, 200, 250, 300, 400, 800, 1200], [120, 160, 240, 250, 350, 640, 750, 1500, 2400, 3500]));
    const next = Math.round(base * (1 + (down ? -p : p) / 100) * 100) / 100;
    return {
      skillId: "pct.find", key: `pctf:${down ? "down" : "up"}${p}%${base}`, prior: P.pctFindPrior(p, down),
      prompt: `${fmtDigits(base)} → ${fmtDigits(next)}`, sub: `${down ? "down" : "up"} what percent? · within ½ point`,
      answerText: `${p}%`, why: `change ${fmtDigits(Math.abs(next - base))} ÷ original ${fmtDigits(base)}`,
      inputMode: "decimal", placeholder: "%", check: (s) => { const v = parseValue(s.replace(/%/g, "")); return v !== null && Math.abs(v - p) <= 0.5; },
    };
  },
  // 30 of 50 → 60%
  "pct.what": (L) => {
    const whole = pick(by(L, [20, 25, 40, 50, 100, 200], [25, 40, 50, 80, 200, 250, 400, 500], [60, 75, 120, 150, 250, 300, 400, 600, 750, 1200, 2500]));
    let p: number;
    do { p = pick(by(L, [10, 20, 25, 50, 75], [4, 5, 8, 10, 15, 20, 25, 30, 40, 60, 75, 80], [2, 4, 6, 8, 12, 15, 18, 30, 35, 45, 55, 65, 85, 95])); } while ((whole * p) % 100 !== 0);
    const part = (whole * p) / 100;
    return {
      skillId: "pct.what", key: `pctw:${part}of${whole}`, prior: P.pctWhatPrior(p, whole),
      prompt: `${fmtDigits(part)} of ${fmtDigits(whole)}`, sub: "as a percent · within ½ point",
      answerText: `${p}%`, why: `${fmtDigits(part)} ÷ ${fmtDigits(whole)}; 1% of ${fmtDigits(whole)} is ${whole / 100}`,
      inputMode: "decimal", placeholder: "%", check: (s) => { const v = parseValue(s.replace(/%/g, "")); return v !== null && Math.abs(v - p) <= 0.5; },
    };
  },
  // After 20% off, 160. Original? → 200   ·   30 is 15% of what? → 200
  "pct.reverse": (L) => {
    const off = Math.random() < 0.5;
    const p = pick(by(L, [10, 20, 25, 50], [5, 10, 15, 20, 25, 30, 40, 50, 75], [5, 12, 15, 30, 35, 40, 60, 70, 80, 90]));
    const whole = pick(by(L, [20, 40, 50, 80, 100, 200, 400, 500], [60, 80, 120, 150, 200, 250, 300, 400, 800, 1200, 2000], [160, 240, 250, 350, 640, 750, 1500, 2400, 3500, 12000]));
    const given = off ? whole * (1 - p / 100) : (whole * p) / 100;
    return {
      skillId: "pct.reverse", key: `pctr:${off ? "off" : "is"}${p}%${whole}`, prior: P.pctReversePrior(p, off),
      prompt: off ? `after ${p}% off: ${fmtDigits(given)}` : `${fmtDigits(given)} is ${p}% of…`, sub: off ? "original price · within ½%" : "the whole · within ½%",
      answerText: fmtDigits(whole), why: off ? `${fmtDigits(given)} is ${100 - p}% → ÷ ${(100 - p) / 100}` : `${fmtDigits(given)} ÷ ${p / 100}`,
      inputMode: "text", placeholder: "value", check: (s) => { const v = parseValue(s); return v !== null && Math.abs(v - whole) / whole <= 0.005; },
    };
  },
  // 250 up 40%, then down 25% → 262.5   ·   40% off, then 8% tax on 250 → 162
  "pct.chain": (L) => {
    const base = pick(by(L, [100, 200, 400, 500, 1000], [80, 120, 150, 200, 250, 300, 400, 600, 800], [240, 350, 450, 640, 750, 1200, 1500, 2500, 12000]));
    const ps = by(L, [10, 20, 25, 50], [5, 10, 15, 20, 25, 30, 40, 50], [5, 8, 12, 15, 20, 30, 35, 40, 60]);
    const tax = Math.random() < 0.35;
    const p1 = pick(ps), p2 = tax ? pick([5, 8, 10]) : pick(ps);
    const d1 = tax ? true : Math.random() < 0.5, d2 = tax ? false : Math.random() < 0.5;
    const ans = base * (1 + (d1 ? -p1 : p1) / 100) * (1 + (d2 ? -p2 : p2) / 100);
    const step = (d: boolean, p: number) => (tax && !d ? `${p}% tax` : `${d ? "down" : "up"} ${p}%`);
    const prompt = tax ? `${fmtDigits(base)}: ${p1}% off, then ${p2}% tax` : `${fmtDigits(base)} ${step(d1, p1)}, then ${step(d2, p2)}`;
    return {
      skillId: "pct.chain", key: `pctch:${d1 ? "down" : "up"}${p1},${d2 ? "down" : "up"}${p2}%${base}`, prior: P.pctChainPrior(p1, p2, base),
      prompt, sub: "final amount · within ½%",
      answerText: (Math.round(ans * 100) / 100).toLocaleString("en-US", { maximumFractionDigits: 2 }), why: `× ${(1 + (d1 ? -p1 : p1) / 100).toFixed(2)} × ${(1 + (d2 ? -p2 : p2) / 100).toFixed(2)} = × ${((1 + (d1 ? -p1 : p1) / 100) * (1 + (d2 ? -p2 : p2) / 100)).toFixed(3)}`,
      inputMode: "text", placeholder: "value", check: (s) => { const v = parseValue(s); return v !== null && Math.abs(v - ans) / ans <= 0.005; },
    };
  },
};

/** Characters the learner has to type for the canonical answer (drives the typing-time budget). */
export function typedLength(item: Item): number {
  const primary = item.answerText.replace(/^≈\s*/, "").split("  (")[0].trim();
  return primary.replace(/\s*×\s*10\^/g, "e").replace(/^10\^/, "").replace(/[%,\s]/g, "").length;
}

export function generateItem(skillId: SkillId, level: Level = 1): Item {
  return { ...GENERATORS[skillId](level), level };
}
