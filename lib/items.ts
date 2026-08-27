import type { SkillId } from "./skills";
import {
  SCALES, fmtDigits, fmtSci, numberToWords, parseSci, parseValue, pick, ri, shortWords, toSci, toScaleWords,
} from "./numbers";

/** One practice item. `check` returns whether the typed answer is acceptable. */
export interface Item {
  skillId: SkillId;
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

const GENERATORS: Record<SkillId, () => Item> = {
  // 1,000,000 → 6
  "pv.zeros": () => {
    const e = ri(2, 12);
    return {
      skillId: "pv.zeros",
      prompt: fmtDigits(10 ** e),
      sub: "= 10 ^ ?",
      answerText: `10^${e}`,
      why: `${e} zeros → 10^${e}`,
      inputMode: "numeric",
      placeholder: "exponent",
      check: (s) => intEq(s, e),
    };
  },

  // "billion" → 9
  "pv.word-exp": () => {
    const sc = pick(SCALES);
    const variants = [
      { p: `one ${sc.word}`, e: sc.exp },
      { p: `ten ${sc.word}`, e: sc.exp + 1 },
      { p: `a hundred ${sc.word}`, e: sc.exp + 2 },
    ];
    const v = pick(variants);
    return {
      skillId: "pv.word-exp",
      prompt: v.p,
      sub: "= 10 ^ ?",
      answerText: `10^${v.e}`,
      why: `${sc.word} = 10^${sc.exp}${v.e !== sc.exp ? `, times 10^${v.e - sc.exp}` : ""}`,
      inputMode: "numeric",
      placeholder: "exponent",
      check: (s) => intEq(s, v.e),
    };
  },

  // 10^7 × 10^3 → 10
  "exp.add": () => {
    const a = ri(1, 12), b = ri(1, 12);
    return {
      skillId: "exp.add",
      prompt: `10^${a} × 10^${b}`,
      sub: "= 10 ^ ?",
      answerText: `10^${a + b}`,
      why: `${a} + ${b} = ${a + b}`,
      inputMode: "numeric",
      placeholder: "exponent",
      check: (s) => intEq(s, a + b),
    };
  },

  // 10^9 ÷ 10^4 → 5
  "exp.sub": () => {
    const b = ri(1, 9), a = b + ri(0, 6);
    return {
      skillId: "exp.sub",
      prompt: `10^${a} ÷ 10^${b}`,
      sub: "= 10 ^ ?",
      answerText: `10^${a - b}`,
      why: `${a} − ${b} = ${a - b}`,
      inputMode: "numeric",
      placeholder: "exponent",
      check: (s) => intEq(s, a - b),
    };
  },

  // 7 × 8 → 56 (single-digit fact fluency; the coefficient step of sn.mul)
  "coef.mul": () => {
    const a = ri(2, 9), b = ri(2, 9);
    return {
      skillId: "coef.mul",
      prompt: `${a} × ${b}`,
      answerText: String(a * b),
      why: `${a} × ${b} = ${a * b}`,
      inputMode: "numeric",
      placeholder: "product",
      check: (s) => intEq(s, a * b),
    };
  },

  // 68,000,000 → 6.8 × 10^7
  "sn.digits": () => {
    const e = ri(3, 12);
    const c = pick([ri(1, 9), ri(10, 99) / 10]);
    const n = c * 10 ** e;
    return {
      skillId: "sn.digits",
      prompt: fmtDigits(n),
      answerText: fmtSci(c, e),
      why: `leading digit ${Math.floor(c)}, then ${e} more places`,
      inputMode: "text",
      placeholder: "6.8e7",
      check: (s) => sciEq(s, c, e),
    };
  },

  // "sixty-eight million" → 6.8 × 10^7
  "sn.words": () => {
    const sc = pick(SCALES);
    // heads: 4, 40, 400, 6.8, 68, 680 → all map cleanly
    const head = pick([ri(2, 9), ri(11, 99), ri(101, 999), ri(11, 99) / 10]);
    const n = head * 10 ** sc.exp;
    const { c, e } = toSci(n);
    const cRound = Math.round(c * 10) / 10;
    const prompt = Number.isInteger(head) ? numberToWords(n) : shortWords(head, sc.exp);
    return {
      skillId: "sn.words",
      prompt,
      answerText: fmtSci(cRound, e),
      why: `${sc.word} = 10^${sc.exp}; ${head} = ${fmtSci(cRound, e - sc.exp)}`,
      inputMode: "text",
      placeholder: "6.8e7",
      check: (s) => sciEq(s, cRound, e),
    };
  },

  // 2 × 10^11 → 200 billion
  "sn.back": () => {
    const e = ri(3, 13);
    const c = pick([ri(1, 9), ri(11, 99) / 10]);
    const n = c * 10 ** e;
    return {
      skillId: "sn.back",
      prompt: fmtSci(c, e),
      answerText: `${fmtDigits(n)}  (${toScaleWords(n)})`,
      why: `10^${e} → ${toScaleWords(10 ** e)}`,
      inputMode: "text",
      placeholder: "2e11",
      check: (s) => magEq(s, n, 0.02),
    };
  },

  // 48 × 10^7 → 4.8 × 10^8   (also 0.5 × 10^9 → 5 × 10^8)
  "sn.norm": () => {
    const e = ri(2, 11);
    let c: number, t: { c: number; e: number }, tc: number;
    do {
      c = pick([ri(10, 99), ri(100, 999), ri(1, 9) / 10]);
      t = toSci(c * 10 ** e);
      tc = Math.round(t.c * 10) / 10;
    } while (tc >= 10); // e.g. 999 → 9.99 → rounds to 10.0; not a normalized form
    return {
      skillId: "sn.norm",
      prompt: fmtSci(c, e),
      answerText: fmtSci(tc, t.e),
      why: `move the point ${t.e - e > 0 ? "left" : "right"} ${Math.abs(t.e - e)} → exponent ${e} ${t.e - e >= 0 ? "+" : "−"} ${Math.abs(t.e - e)}`,
      inputMode: "text",
      placeholder: "4.8e8",
      check: (s) => sciEq(s, tc, t.e),
    };
  },

  // (6 × 10^7)(3 × 10^3) → 1.8 × 10^11
  "sn.mul": () => {
    const a = ri(2, 9), b = ri(2, 9), ea = ri(2, 9), eb = ri(2, 9);
    const t = toSci(a * b * 10 ** (ea + eb));
    const tc = Math.round(t.c * 10) / 10;
    return {
      skillId: "sn.mul",
      prompt: `(${a} × 10^${ea}) × (${b} × 10^${eb})`,
      answerText: fmtSci(tc, t.e),
      why: `${a}×${b} = ${a * b}; ${ea}+${eb} = ${ea + eb}${a * b >= 10 ? ` → renormalize, +1` : ""}`,
      inputMode: "text",
      placeholder: "1.8e11",
      check: (s) => sciEq(s, tc, t.e),
    };
  },

  // (8 × 10^9) ÷ (2 × 10^4) → 4 × 10^5
  "sn.div": () => {
    const b = ri(2, 9), q = ri(1, 9), a = b * q; // a/b exact
    const eb = ri(1, 6), ea = eb + ri(1, 8);
    const t = toSci(a * 10 ** ea / (b * 10 ** eb));
    const tc = Math.round(t.c * 10) / 10;
    return {
      skillId: "sn.div",
      prompt: `(${a} × 10^${ea}) ÷ (${b} × 10^${eb})`,
      answerText: fmtSci(tc, t.e),
      why: `${a}÷${b} = ${q}; ${ea}−${eb} = ${ea - eb}${a >= 10 && q < 10 ? ` → renormalize` : ""}`,
      inputMode: "text",
      placeholder: "4e5",
      check: (s) => sciEq(s, tc, t.e),
    };
  },

  // 68 million × 3 thousand → ~200 billion   (within 0.3 orders)
  "mag.mul": () => {
    const s1 = pick(SCALES), s2 = pick(SCALES.slice(0, 2));
    const h1 = pick([ri(2, 9), ri(11, 99)]), h2 = pick([ri(2, 9), ri(11, 99)]);
    const n = h1 * 10 ** s1.exp * h2 * 10 ** s2.exp;
    const t = toSci(n);
    return {
      skillId: "mag.mul",
      prompt: `${h1} ${s1.word} × ${h2} ${s2.word}`,
      answerText: `≈ ${toScaleWords(n)}  (${fmtSci(Math.round(t.c * 10) / 10, t.e)})`,
      why: `${h1}×${h2} ≈ ${h1 * h2}; 10^${s1.exp}×10^${s2.exp} = 10^${s1.exp + s2.exp}`,
      inputMode: "text",
      placeholder: "2e11",
      check: (s) => magEq(s, n, 0.3),
    };
  },

  // 8 billion ÷ 40 thousand → ~200 thousand
  "mag.div": () => {
    const s1 = pick(SCALES.slice(1)), s2 = pick(SCALES.filter((s) => s.exp < s1.exp));
    const h2 = pick([ri(2, 9), ri(2, 9) * 10]), q = pick([ri(1, 9), ri(1, 9) * 10]);
    const h1 = h2 * q;
    const n = h1 * 10 ** s1.exp / (h2 * 10 ** s2.exp);
    const t = toSci(n);
    return {
      skillId: "mag.div",
      prompt: `${h1} ${s1.word} ÷ ${h2} ${s2.word}`,
      answerText: `≈ ${toScaleWords(n)}  (${fmtSci(Math.round(t.c * 10) / 10, t.e)})`,
      why: `${h1}÷${h2} = ${q}; 10^${s1.exp}÷10^${s2.exp} = 10^${s1.exp - s2.exp}`,
      inputMode: "text",
      placeholder: "2e5",
      check: (s) => magEq(s, n, 0.3),
    };
  },

  // 10% of 3,400 → 340 ; 1% of 560 → 5.6
  "pct.anchor": () => {
    const p = pick([10, 1, 50, 5]);
    const base = pick([ri(2, 99) * 10, ri(2, 99) * 100, ri(2, 9) * 1000]);
    const ans = (p / 100) * base;
    return {
      skillId: "pct.anchor",
      prompt: `${p}% of ${fmtDigits(base)}`,
      answerText: String(Math.round(ans * 100) / 100),
      why: p === 10 ? "shift one place left" : p === 1 ? "shift two places left" : p === 50 ? "halve it" : "half of 10%",
      inputMode: "decimal",
      placeholder: "value",
      check: (s) => { const v = parseValue(s); return v !== null && Math.abs(v - ans) < 0.011; },
    };
  },

  // 15% of 80 → 12  (compose from 10% + 5%)
  "pct.compose": () => {
    const p = pick([15, 20, 25, 30, 35, 40, 60, 70, 75, 80, 90, 12, 18, 22]);
    const base = pick([ri(2, 20) * 10, ri(2, 9) * 100, ri(11, 99) * 10]);
    const ans = (p / 100) * base;
    const tens = Math.floor(p / 10) * 10, ones = p - tens;
    return {
      skillId: "pct.compose",
      prompt: `${p}% of ${fmtDigits(base)}`,
      answerText: String(Math.round(ans * 100) / 100),
      why: ones ? `${tens}% + ${ones}% → ${(tens / 100) * base} + ${(ones / 100) * base}` : `${p / 10} × (10% = ${base / 10})`,
      inputMode: "decimal",
      placeholder: "value",
      check: (s) => { const v = parseValue(s); return v !== null && Math.abs(v - ans) / ans < 0.005; },
    };
  },
};

export function generateItem(skillId: SkillId): Item {
  return GENERATORS[skillId]();
}
