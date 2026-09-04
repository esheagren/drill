import type { SkillId } from "./skills";
import * as P from "./priors";
import { fmtFrac, parseFrac, reduce, SCALES, fmtDigits, fmtSci, numberToWords, parseSci, parseValue, pick, ri, shortWords, toSci, toScaleWords } from "./numbers";

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
  const m = s.match(/^(?:10\^|\^|1?e|10e)?(-?\d+)$/);   // "10e12" is how 10^12 is typed on a keypad with e and no ^
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
    let head: number;
    do { head = by(L, ri(2, 9), pick([ri(2, 9), ri(11, 99)]), pick([ri(11, 99), ri(101, 999), ri(11, 99) / 10])); } while (Math.round((head / 10 ** Math.floor(Math.log10(head))) * 10) / 10 >= 10);
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
  // ── Combinations ───────────────────────────────────────────────────────
  // 15% of 2.4 million → 360,000
  "co.pctbig": (L) => {
    const p = pick(by(L, [10, 20, 25, 50], [5, 10, 15, 20, 25, 30, 40, 75], [5, 12, 15, 18, 30, 35, 40, 60, 85]));
    const sc = pick(by(L, SCALES.slice(0, 2), SCALES.slice(0, 3), SCALES));
    const head = pick(by(L, [ri(2, 9), ri(2, 9) * 10], [ri(2, 9), ri(11, 99), ri(12, 98) / 10], [ri(11, 99), ri(11, 99) / 10, ri(101, 999)]));
    const base = head * 10 ** sc.exp; const ans = (p / 100) * base;
    return { skillId: "co.pctbig", key: `cpb:${p}%${head}e${sc.exp}`, prior: P.pctBigPrior(p, SCALES.indexOf(sc), !Number.isInteger(head)), prompt: `${p}% of ${shortWords(head, sc.exp)}`, sub: "value · within ½%",
      answerText: `${fmtDigits(ans)}  (${toScaleWords(ans)})`, why: `10% is ${toScaleWords(base / 10)}; ${p}% = ${p / 10} × that`, inputMode: "text", placeholder: "3.6e5 or 360000", check: (s) => { const v = parseValue(s); return v !== null && Math.abs(v - ans) / ans <= 0.005; } };
  },
  // 1/12 of 3 billion → 2.5e8
  "co.fracsci": (L) => {
    const d = pick(by(L, [2, 4, 5, 10], [3, 4, 5, 6, 8, 10, 12], [6, 7, 8, 9, 12, 15, 16]));
    const sc = pick(by(L, SCALES.slice(1, 3), SCALES.slice(1), SCALES.slice(1)));
    const head = pick(by(L, [ri(2, 9)], [ri(2, 9), ri(11, 99)], [ri(2, 9), ri(11, 99), ri(12, 98) / 10]));
    const base = head * 10 ** sc.exp; const ans = base / d; const t = toSci(ans);
    return { skillId: "co.fracsci", key: `cfs:1/${d}x${head}e${sc.exp}`, prior: P.fracSciPrior(d, head / d < 1), prompt: `1/${d} of ${shortWords(head, sc.exp)}`, sub: "in e-notation · within ½%",
      answerText: `${Number(t.c.toFixed(3))}e${t.e}  (${toScaleWords(ans)})`, why: `${head} ÷ ${d} = ${(head / d).toFixed(2)}, × 10^${sc.exp}${head / d < 1 ? " → renormalize" : ""}`, inputMode: "text", placeholder: "2.5e8", check: (s) => { const v = parseValue(s); return v !== null && Math.abs(v - ans) / ans <= 0.005; } };
  },
  // 250 thousand up 40%, then down 25% → 262,500
  "co.chainbig": (L) => {
    const ps = by(L, [10, 20, 25, 50], [5, 10, 15, 20, 25, 30, 40, 50], [5, 8, 12, 15, 20, 30, 35, 40, 60]);
    const p1 = pick(ps), p2 = pick(ps); const d1 = Math.random() < 0.5, d2 = Math.random() < 0.5;
    const sc = pick(SCALES.slice(0, 3)); const head = pick(by(L, [ri(2, 9), ri(2, 9) * 10], [ri(11, 99), ri(2, 9) * 100], [ri(11, 99), ri(12, 98) / 10, ri(101, 999)]));
    const base = head * 10 ** sc.exp; const ans = base * (1 + (d1 ? -p1 : p1) / 100) * (1 + (d2 ? -p2 : p2) / 100);
    return { skillId: "co.chainbig", key: `ccb:${d1 ? "down" : "up"}${p1},${d2 ? "down" : "up"}${p2}%${head}e${sc.exp}`, prior: P.chainBigPrior(p1, p2), prompt: `${shortWords(head, sc.exp)} ${d1 ? "down" : "up"} ${p1}%, then ${d2 ? "down" : "up"} ${p2}%`, sub: "final amount · within ½%",
      answerText: `${fmtDigits(Math.round(ans))}  (${toScaleWords(ans)})`, why: `× ${(1 + (d1 ? -p1 : p1) / 100).toFixed(2)} × ${(1 + (d2 ? -p2 : p2) / 100).toFixed(2)} = × ${((1 + (d1 ? -p1 : p1) / 100) * (1 + (d2 ? -p2 : p2) / 100)).toFixed(3)}`, inputMode: "text", placeholder: "2.6e5", check: (s) => { const v = parseValue(s); return v !== null && Math.abs(v - ans) / ans <= 0.005; } };
  },
  // 1.4 × 10^7 ÷ 4.2 × 10^5 → ≈ 33
  "co.percap": (L) => {
    const b = pick(by(L, [ri(1, 9)], [ri(1, 9), ri(11, 99) / 10], [ri(11, 99) / 10, ri(11, 99)]));
    const q = pick(by(L, [ri(2, 9), ri(1, 9) * 10], [ri(2, 9), ri(11, 99), ri(2, 9) * 100], [ri(11, 99), ri(12, 98) / 10 * 10, ri(101, 999)]));
    const eb = by(L, ri(2, 5), ri(3, 7), ri(3, 8)); const a = b * q; const ta = toSci(a * 10 ** eb); const ans = q;
    return { skillId: "co.percap", key: `cpc:${Math.round(ta.c * 100) / 100}e${ta.e}/${b}e${eb}`, prior: P.perCapPrior(q, eb), prompt: `${fmtSci(Math.round(ta.c * 100) / 100, ta.e)} ÷ ${fmtSci(b, eb)}`, sub: "roughly",
      answerText: `≈ ${fmtDigits(ans)}`, why: `${Math.round(ta.c * 100) / 100} ÷ ${b} ≈ ${(ta.c / b).toFixed(2)}; 10^${ta.e} ÷ 10^${eb} = 10^${ta.e - eb}`, inputMode: "text", placeholder: "", check: (s) => magEq(s, ans, 0.3) };
  },

  // 3.2 billion or 4.5 × 10^8 → 3.2e9
  "co.compare": (L) => {
    const sc1 = pick(SCALES), h1 = pick([ri(2, 9), ri(11, 99) / 10, ri(11, 99)]); const v1 = h1 * 10 ** sc1.exp;
    const ratio = pick(by(L, [5, 10, 30, 100], [2, 3, 5, 10, 20], [1.2, 1.5, 2, 3])); const bigger2 = Math.random() < 0.5;
    const v2raw = bigger2 ? v1 * ratio : v1 / ratio; const t2 = toSci(v2raw); const c2 = Math.round(t2.c * 10) / 10; const v2 = c2 * 10 ** t2.e;
    const big = Math.max(v1, v2); const closeness = 1 / ratio;
    return { skillId: "co.compare", key: `ccp:${h1}e${sc1.exp}v${c2}e${t2.e}`, prior: P.comparePairPrior(closeness, true), prompt: `${shortWords(h1, sc1.exp)}   or   ${fmtSci(c2, t2.e)}`, sub: "which is bigger? type it, any form",
      answerText: `${toScaleWords(big)}  (${fmtSci(toSci(big).c, toSci(big).e)})`, why: `${shortWords(h1, sc1.exp)} = ${fmtSci(toSci(v1).c, toSci(v1).e)}`, inputMode: "text", placeholder: "3.2e9", check: (s) => magEq(s, big, 0.02) };
  },
  // 7% a year → years to double ≈ 10
  "co.double": (L) => {
    const r = pick(by(L, [6, 8, 9, 12], [3, 4, 6, 7, 8, 9, 10, 12], [2, 3, 5, 7, 11, 14, 15, 18, 24]));
    const ans = 72 / r;
    return { skillId: "co.double", key: `cdb:${r}`, prior: P.doublingTimePrior(r), prompt: `growing ${r}% a year`, sub: "years to double · within 1",
      answerText: `≈ ${Number.isInteger(ans) ? ans : ans.toFixed(1)} years`, why: `rule of 72: 72 ÷ ${r}`, inputMode: "decimal", placeholder: "years", check: (s) => { const v = parseValue(s); return v !== null && Math.abs(v - ans) <= 1; } };
  },
  // 1,000 growing 10% a year for 3 years → 1,331
  "co.growth": (L) => {
    const r = pick(by(L, [10, 20, 50], [5, 10, 20, 25, 50], [5, 8, 10, 15, 20, 30]));
    const y = by(L, 2, pick([2, 3]), pick([3, 4, 5]));
    const base = pick(by(L, [100, 1000, 10000], [200, 500, 1000, 2000, 5000], [400, 800, 1500, 2500, 12000]));
    const ans = base * (1 + r / 100) ** y;
    return { skillId: "co.growth", key: `cgr:${r}%x${y}y${base}`, prior: P.growthPrior(r, y), prompt: `${fmtDigits(base)} growing ${r}% a year, for ${y} years`, sub: "within 2%",
      answerText: `≈ ${fmtDigits(Math.round(ans))}`, why: `× ${(1 + r / 100).toFixed(2)}^${y} ≈ × ${((1 + r / 100) ** y).toFixed(3)}`, inputMode: "text", placeholder: "value", check: (s) => { const v = parseValue(s); return v !== null && Math.abs(v - ans) / ans <= 0.02; } };
  },
  // 2.5 kg for $9 → $3.60 per kg
  "co.unitprice": (L) => {
    const decimalQty = Math.random() < by(L, 0.2, 0.5, 0.7);
    const qty = decimalQty ? pick([1.5, 2.5, 0.5, 0.75, 1.25, 4.5]) : pick(by(L, [2, 4, 5, 10], [3, 4, 6, 8, 12], [6, 7, 8, 9, 12, 16]));
    const per = pick(by(L, [ri(1, 9), ri(1, 9) / 2], [ri(1, 19) / 2, ri(11, 99) / 10], [ri(11, 199) / 10, ri(11, 99) / 4]));
    const total = Math.round(qty * per * 100) / 100; const ans = total / qty; const clean = Number.isInteger(ans * 100 / 5);
    return { skillId: "co.unitprice", key: `cup:${total}/${qty}`, prior: P.unitPricePrior(clean, decimalQty), prompt: `${qty} ${decimalQty ? "kg" : "items"} for $${total}`, sub: `dollars per ${decimalQty ? "kg" : "item"} · within ½%`,
      answerText: String(Math.round(ans * 1000) / 1000), why: `${total} ÷ ${qty}`, inputMode: "decimal", placeholder: "price", check: (s) => { const v = parseValue(s); return v !== null && Math.abs(v - ans) / ans <= 0.005; } };
  },

  // ── Fractions core ─────────────────────────────────────────────────────
  // 12/16 → 3/4
  "fr.simplify": (L) => {
    const [n0, d0] = pick(by(L, [[1, 2], [1, 3], [1, 4], [2, 3], [3, 4], [1, 5], [2, 5]], [[1, 4], [3, 4], [2, 3], [3, 5], [4, 5], [5, 6], [3, 8], [5, 8]], [[3, 8], [5, 8], [7, 8], [5, 12], [7, 12], [4, 9], [7, 10], [9, 16]]));
    const g = pick(by(L, [2, 3, 4, 5], [3, 4, 5, 6, 8], [6, 7, 8, 9, 12]));
    const n = n0 * g, d = d0 * g;
    return { skillId: "fr.simplify", key: `simp:${n}/${d}`, prior: P.simplifyPrior(g, d0), prompt: `${n}/${d}`, sub: "in simplest form", answerText: `${n0}/${d0}`, why: `divide both by ${g}`,
      inputMode: "text", placeholder: "3/4", check: (s) => { const f = parseFrac(s); return !!f && f[0] === n0 && f[1] === d0; } };
  },
  // 3/7 vs 4/9 → 4/9
  "fr.compare": (L) => {
    const kind = pick(by(L, [0, 1, 2], [0, 1, 2, 3], [2, 3, 3]));   // same denom, same numerator, unit fractions, general
    let a: [number, number], b: [number, number];
    if (kind === 0) { const d = ri(3, 12); const x = ri(1, d - 2); a = [x, d]; b = [ri(x + 1, d - 1), d]; }
    else if (kind === 1) { const n = ri(1, 5); const d1 = ri(n + 1, 12); let d2 = ri(n + 1, 12); if (d2 === d1) d2 = d1 + 1; a = [n, d1]; b = [n, d2]; }
    else if (kind === 2) { const d1 = ri(2, 15); let d2 = ri(2, 15); if (d2 === d1) d2 = d1 + 1; a = [1, d1]; b = [1, d2]; }
    else { do { a = [ri(1, 9), ri(2, 12)]; b = [ri(1, 9), ri(2, 12)]; } while (a[0] >= a[1] || b[0] >= b[1] || a[0] * b[1] === b[0] * a[1]); }
    if (Math.random() < 0.5) [a, b] = [b, a];
    const big = a[0] * b[1] > b[0] * a[1] ? a : b;
    const close = Math.abs(a[0] / a[1] - b[0] / b[1]) < 0.08;
    return { skillId: "fr.compare", key: `cmp:${a[0]}/${a[1]}v${b[0]}/${b[1]}`, prior: P.comparePrior(kind, close), prompt: `${a[0]}/${a[1]}   or   ${b[0]}/${b[1]}`, sub: "which is larger?",
      answerText: `${big[0]}/${big[1]}`, why: kind === 0 ? "same denominator: larger numerator" : kind === 1 ? "same numerator: smaller denominator" : `${(a[0] / a[1]).toFixed(3)} vs ${(b[0] / b[1]).toFixed(3)}`,
      inputMode: "text", placeholder: "4/9", check: (s) => { const f = parseFrac(s); const r = reduce(big[0], big[1]); return !!f && f[0] === r[0] && f[1] === r[1]; } };
  },
  // 3/8 of 640 → 240
  "fr.of": (L) => {
    const d = pick(by(L, [2, 4, 5, 10], [3, 4, 5, 6, 8, 10], [6, 7, 8, 9, 12, 16]));
    const n = ri(1, d - 1);
    const unit = pick(by(L, [ri(2, 9) * 10, ri(2, 9) * 100], [ri(2, 9) * 100, ri(11, 99) * 10], [ri(11, 99) * 100, ri(2, 9) * 10000, ri(12, 98) * 1000]));
    const qty = unit * d / (d % 10 === 0 ? 10 : 1) * (d % 10 === 0 ? 10 : 1);
    const q = unit * d;   // guarantees divisibility
    const ans = unit * n;
    return { skillId: "fr.of", key: `frof:${n}/${d}x${q}`, prior: P.fracOfPrior(d, q), prompt: `${n}/${d} of ${fmtDigits(q)}`, sub: "value",
      answerText: fmtDigits(ans), why: `1/${d} of ${fmtDigits(q)} = ${fmtDigits(unit)}, × ${n}`, inputMode: "text", placeholder: "value", check: (s) => { const v = parseValue(s); return v !== null && Math.abs(v - ans) / ans <= 0.005; } };
  },
  // 1/2 + 1/3 → 5/6
  "fr.add": (L) => {
    const kind = pick(by(L, [0, 0, 1], [0, 1, 1, 2], [1, 2, 2]));   // like, related, unlike
    let a: [number, number], b: [number, number];
    if (kind === 0) { const d = pick([3, 4, 5, 6, 8, 10, 12]); a = [ri(1, d - 1), d]; b = [ri(1, d - 1), d]; }
    else if (kind === 1) { const d = pick([4, 6, 8, 9, 10, 12]); const f = pick([2, 3, 4, 6].filter((x) => d % x === 0 && x < d)); a = [ri(1, f - 1), f]; b = [ri(1, d - 1), d]; }
    else { const d1 = pick([2, 3, 4, 5]); let d2 = pick([3, 4, 5, 6, 7, 8]); if (d2 === d1 || d2 % d1 === 0) d2 = d1 === 5 ? 3 : 5; a = [ri(1, d1 - 1), d1]; b = [ri(1, d2 - 1), d2]; }
    const sub = Math.random() < 0.4 && a[0] * b[1] !== b[0] * a[1];
    if (sub && a[0] * b[1] < b[0] * a[1]) [a, b] = [b, a];
    const num = sub ? a[0] * b[1] - b[0] * a[1] : a[0] * b[1] + b[0] * a[1];
    const [rn, rd] = reduce(num, a[1] * b[1]);
    return { skillId: "fr.add", key: `fradd:${a[0]}/${a[1]}${sub ? "-" : "+"}${b[0]}/${b[1]}`, prior: P.fracAddPrior(kind, sub), prompt: `${a[0]}/${a[1]} ${sub ? "−" : "+"} ${b[0]}/${b[1]}`, sub: "in simplest form",
      answerText: fmtFrac(rn, rd), why: `common denominator ${a[1] * b[1] / (kind === 0 ? a[1] : 1)}`, inputMode: "text", placeholder: "5/6", check: (s) => { const f = parseFrac(s); return !!f && f[0] === rn && f[1] === rd; } };
  },
  // 3/8 → 0.375
  "fr.todec": (L) => {
    const d = pick(by(L, [2, 4, 5, 10], [3, 4, 5, 8, 6, 20, 25], [6, 7, 8, 9, 12, 15, 16]));
    const n = ri(1, d - 1);
    const v = n / d;
    return { skillId: "fr.todec", key: `f2d:${n}/${d}`, prior: P.toDecPrior(d), prompt: `${n}/${d}`, sub: "as a decimal · within 0.005",
      answerText: String(Math.round(v * 1000) / 1000), why: `1/${d} = ${(1 / d).toFixed(3)}, × ${n}`, inputMode: "decimal", placeholder: "0.375", check: (s) => { const x = parseValue(s); return x !== null && Math.abs(x - v) <= 0.005; } };
  },
  // 0.375 → 3/8
  "fr.fromdec": (L) => {
    const [n, d] = pick(by(L, [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [4, 5], [1, 10], [3, 10]], [[1, 8], [3, 8], [5, 8], [7, 8], [1, 20], [3, 20], [1, 25], [3, 25], [1, 3], [2, 3]], [[1, 16], [3, 16], [5, 16], [1, 6], [5, 6], [1, 9], [4, 9], [1, 12], [5, 12], [7, 12]]));
    const v = n / d; const repeating = d % 3 === 0;
    const shown = repeating ? v.toFixed(3) + "…" : String(v);
    const places = repeating ? 3 : (String(v).split(".")[1] ?? "").length;
    return { skillId: "fr.fromdec", key: `d2f:${n}/${d}`, prior: P.fromDecPrior(places, repeating), prompt: shown, sub: "as a fraction in simplest form",
      answerText: `${n}/${d}`, why: repeating ? `repeating → ninths / thirds / sixths` : `${shown} = ${Math.round(v * 10 ** places)}/${10 ** places}, simplify`, inputMode: "text", placeholder: "3/8", check: (s) => { const f = parseFrac(s); return !!f && f[0] === n && f[1] === d; } };
  },

  // ── Decimals & scaling ─────────────────────────────────────────────────
  // 3.47 × 1000 → 3,470   ·   52,000 ÷ 100 → 520
  "dec.scale": (L) => {
    const n = pick(by(L, [1, 2], [1, 2, 3], [2, 3, 4])); const div = Math.random() < 0.5; const decimal = Math.random() < by(L, 0.3, 0.6, 0.8);
    const base = decimal ? ri(11, 999) / pick([10, 100]) : ri(2, 99) * (div ? 10 ** ri(1, 3) : 1);
    const ans = div ? base / 10 ** n : base * 10 ** n;
    return { skillId: "dec.scale", key: `scale:${base}${div ? "/" : "x"}${10 ** n}`, prior: P.scalePrior(n, div, decimal), prompt: `${base.toLocaleString("en-US", { maximumFractionDigits: 3 })} ${div ? "÷" : "×"} ${fmtDigits(10 ** n)}`, sub: "value",
      answerText: ans.toLocaleString("en-US", { maximumFractionDigits: 7 }), why: `move the point ${n} place${n > 1 ? "s" : ""} ${div ? "left" : "right"}`, inputMode: "decimal", placeholder: "value", check: (s) => { const v = parseValue(s); return v !== null && Math.abs(v - ans) <= Math.max(1e-6, ans * 1e-6); } };
  },
  // 0.035 → 3.5%   ·   12.5% → 0.125
  "dec.pct": (L) => {
    const toPct = Math.random() < 0.5; const places = pick(by(L, [1, 2], [2, 3], [3, 4]));
    const pct = pick(by(L, [5, 10, 20, 25, 50, 75, 80], [2.5, 7.5, 12.5, 15, 35, 62.5, 4, 8], [0.5, 1.25, 3.75, 0.25, 17.5, 99.5, 0.05]));
    const dec = pct / 100;
    return { skillId: "dec.pct", key: toPct ? `d2p:${dec}` : `p2d:${pct}`, prior: P.decPctPrior(toPct, places), prompt: toPct ? String(dec) : `${pct}%`, sub: toPct ? "as a percent" : "as a decimal",
      answerText: toPct ? `${pct}%` : String(dec), why: toPct ? "× 100 (point right two)" : "÷ 100 (point left two)", inputMode: "decimal", placeholder: toPct ? "%" : "0.125",
      check: (s) => { const v = parseValue(s.replace(/%/g, "")); return v !== null && Math.abs(v - (toPct ? pct : dec)) <= (toPct ? 0.01 : 0.0001); } };
  },
  // 4,371 → nearest 100 → 4,400   ·   3.456 → 1 dp → 3.5
  "dec.round": (L) => {
    const kind = pick(by(L, [0, 1, 3], [0, 1, 2, 3, 4], [1, 2, 3, 4]));
    let n: number, ans: number, label: string;
    if (kind <= 2) { const unit = [10, 100, 1000][kind]; n = ri(unit * 2, unit * 999); ans = Math.round(n / unit) * unit; label = `nearest ${fmtDigits(unit)}`; }
    else { const dp = kind === 3 ? 1 : 2; n = ri(100, 99999) / 10 ** (dp + 1); ans = Math.round(n * 10 ** dp) / 10 ** dp; label = `${dp} decimal place${dp > 1 ? "s" : ""}`; }
    return { skillId: "dec.round", key: `round:${n}@${kind}`, prior: P.roundPrior(kind, String(Math.round(n)).length), prompt: kind <= 2 ? fmtDigits(n) : String(n), sub: `to the ${label}`,
      answerText: kind <= 2 ? fmtDigits(ans) : String(ans), why: `look at the next digit: ${kind <= 2 ? Math.floor((n % [10, 100, 1000][kind]) / [1, 10, 100][kind]) : (String(n).split(".")[1]?.[kind === 3 ? 1 : 2] ?? "0")}`, inputMode: "decimal", placeholder: "value", check: (s) => { const v = parseValue(s); return v !== null && Math.abs(v - ans) < 1e-9; } };
  },
  // 3.4 + 2.75 → 6.15   ·   0.6 × 7 → 4.2
  "dec.ops": (L) => {
    const op = pick(by(L, [0, 0, 2], [0, 1, 2], [1, 2, 2]));   // +, −, ×
    const places = pick(by(L, [1], [1, 2], [2]));
    const a = ri(1, 99 * 10 ** (places - 1)) / 10 ** places * (op === 2 ? 1 : 1);
    const b = op === 2 ? ri(2, 9) : ri(1, 99 * 10 ** (places - 1)) / 10 ** places;
    const [x, y] = op === 1 && a < b ? [b, a] : [a, b];
    const ans = Math.round((op === 0 ? x + y : op === 1 ? x - y : x * y) * 10 ** (places + 1)) / 10 ** (places + 1);
    const sym = ["+", "−", "×"][op];
    return { skillId: "dec.ops", key: `dop:${x}${["+", "-", "x"][op]}${y}`, prior: P.decOpsPrior(op, places), prompt: `${x} ${sym} ${y}`, sub: "value",
      answerText: String(ans), why: op === 2 ? `${x * 10 ** places} × ${y} = ${x * 10 ** places * y}, point back ${places}` : `line up the points`, inputMode: "decimal", placeholder: "value", check: (s) => { const v = parseValue(s); return v !== null && Math.abs(v - ans) < 1e-9; } };
  },

  // ── Multi-digit mental strategies ──────────────────────────────────────
  // 47 × 6 → 282
  "ar.split": (L) => {
    const a = by(L, ri(12, 39), ri(13, 69), ri(23, 99)); const b = by(L, ri(2, 5), ri(3, 8), ri(6, 9));
    return { skillId: "ar.split", key: `mul:${Math.min(a, b)}x${Math.max(a, b)}`, prior: P.splitPrior(a, b), prompt: `${a} × ${b}`, answerText: String(a * b),
      why: `${Math.floor(a / 10) * 10}×${b} + ${a % 10}×${b} = ${Math.floor(a / 10) * 10 * b} + ${(a % 10) * b}`, inputMode: "numeric", placeholder: "product", check: (s) => intEq(s, a * b) };
  },
  // 46 × 5 → 230  (half, then ×10)   ·  36 × 25 → 900 (quarter, ×100)
  "ar.short5": (L) => {
    const m = pick(by(L, [5], [5, 50], [25, 50, 5])); const a = by(L, ri(12, 48) * 2, ri(12, 99), m === 25 ? ri(3, 24) * 4 : ri(12, 199));
    const why = m === 5 ? `half of ${a} = ${a / 2}, × 10` : m === 50 ? `half of ${a} = ${a / 2}, × 100` : `quarter of ${a} = ${a / 4}, × 100`;
    return { skillId: "ar.short5", key: `mul:${Math.min(a, m)}x${Math.max(a, m)}`, prior: P.short5Prior(a, m), prompt: `${a} × ${m}`, answerText: String(a * m), why, inputMode: "numeric", placeholder: "product", check: (s) => intEq(s, a * m) };
  },
  // 34 × 11 → 374   ·   47 × 101 → 4747
  "ar.short11": (L) => {
    const m = pick(by(L, [11], [11, 11, 101], [11, 101])); const a = by(L, ri(12, 45), ri(12, 89), ri(23, 99));
    const why = m === 11 ? `${a}×10 + ${a} = ${a * 10} + ${a}` : `${a}×100 + ${a}`;
    return { skillId: "ar.short11", key: `mul:${Math.min(a, m)}x${Math.max(a, m)}`, prior: P.short11Prior(a, m), prompt: `${a} × ${m}`, answerText: String(a * m), why, inputMode: "numeric", placeholder: "product", check: (s) => intEq(s, a * m) };
  },
  // 16 × 35 → 8 × 70 → 560
  "ar.double": (L) => {
    const a = pick(by(L, [4, 8, 12, 16], [8, 12, 14, 16, 18, 24], [12, 14, 16, 18, 22, 24, 28, 32]));
    const b = pick(by(L, [15, 25, 35, 45], [15, 25, 35, 45, 55, 75], [15, 35, 45, 55, 65, 75, 85, 95]));
    return { skillId: "ar.double", key: `mul:${Math.min(a, b)}x${Math.max(a, b)}`, prior: P.doublePrior(a, b), prompt: `${a} × ${b}`, answerText: String(a * b),
      why: `${a / 2} × ${b * 2}${a % 4 === 0 ? ` = ${a / 4} × ${b * 4}` : ""}`, inputMode: "numeric", placeholder: "product", check: (s) => intEq(s, a * b) };
  },
  // 98 × 7 → 700 − 14 → 686
  "ar.near100": (L) => {
    const a = pick(by(L, [99, 98, 101], [97, 98, 99, 101, 102, 103], [96, 97, 98, 99, 101, 102, 103, 104, 995, 1005].filter((x) => x < 200)));
    const b = by(L, ri(3, 9), ri(4, 12), ri(6, 25));
    return { skillId: "ar.near100", key: `mul:${Math.min(a, b)}x${Math.max(a, b)}`, prior: P.near100Prior(a, b), prompt: `${a} × ${b}`, answerText: String(a * b),
      why: `${b}×100 ${a < 100 ? "−" : "+"} ${b}×${Math.abs(100 - a)} = ${100 * b} ${a < 100 ? "−" : "+"} ${b * Math.abs(100 - a)}`, inputMode: "numeric", placeholder: "product", check: (s) => intEq(s, a * b) };
  },
  // 72 ÷ 8 → 9
  "ar.divfacts": (L) => {
    const d = by(L, pick([2, 3, 4, 5, 10]), ri(2, 9), ri(6, 12)); const q = by(L, ri(2, 9), ri(2, 12), ri(6, 12));
    return { skillId: "ar.divfacts", key: `div:${d * q}/${d}`, prior: P.divFactsPrior(q, d), prompt: `${d * q} ÷ ${d}`, answerText: String(q), why: `${d} × ${q} = ${d * q}`, inputMode: "numeric", placeholder: "quotient", check: (s) => intEq(s, q) };
  },
  // 156 ÷ 6 → 26
  "ar.div1": (L) => {
    const d = by(L, ri(2, 5), ri(3, 8), ri(6, 9)); const q = by(L, ri(11, 24), ri(13, 49), ri(23, 99));
    return { skillId: "ar.div1", key: `div:${d * q}/${d}`, prior: P.div1Prior(q, d), prompt: `${d * q} ÷ ${d}`, answerText: String(q),
      why: `${d}×${Math.floor(q / 10) * 10} = ${d * Math.floor(q / 10) * 10}, leaves ${d * q - d * Math.floor(q / 10) * 10} = ${d}×${q % 10}`, inputMode: "numeric", placeholder: "quotient", check: (s) => intEq(s, q) };
  },
  // 4,371 ÷ 9 → remainder 6  (digit sum)
  "ar.rem": (L) => {
    const d = pick(by(L, [2, 5, 10, 3], [3, 4, 9, 5, 6], [3, 4, 6, 7, 8, 9]));
    const n = by(L, ri(20, 999), ri(100, 9999), ri(1000, 99999));
    const r = n % d;
    const why = d === 3 || d === 9 ? `digit sum ${String(n).split("").reduce((a, c) => a + +c, 0)}` : d === 4 ? `last two digits ${n % 100} ÷ 4` : d === 2 || d === 5 || d === 10 ? "last digit" : d === 6 ? "even and digit sum" : `${n} − ${d}×${Math.floor(n / d)}`;
    return { skillId: "ar.rem", key: `rem:${n}%${d}`, prior: P.remPrior(n, d), prompt: `${fmtDigits(n)} ÷ ${d}`, sub: "remainder", answerText: String(r), why, inputMode: "numeric", placeholder: "remainder", check: (s) => intEq(s, r) };
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
