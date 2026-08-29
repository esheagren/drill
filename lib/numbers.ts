/** Number ↔ words and scientific-notation helpers shared by item generators. */

const ONES = [
  "", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
  "seventeen", "eighteen", "nineteen",
];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

export const SCALES: { word: string; exp: number }[] = [
  { word: "thousand", exp: 3 },
  { word: "million", exp: 6 },
  { word: "billion", exp: 9 },
  { word: "trillion", exp: 12 },
];

function under1000(n: number): string {
  if (n === 0) return "";
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? "-" + ONES[n % 10] : "");
  return ONES[Math.floor(n / 100)] + " hundred" + (n % 100 ? " " + under1000(n % 100) : "");
}

/** 68_000_000 → "sixty-eight million"; 2_500 → "two thousand five hundred". */
export function numberToWords(n: number): string {
  if (n === 0) return "zero";
  if (n < 1000) return under1000(n);
  for (const { word, exp } of [...SCALES].reverse()) {
    const unit = 10 ** exp;
    if (n >= unit) {
      const head = Math.floor(n / unit);
      const rest = n % unit;
      // Allow decimal heads like 2.5 million for tidy prompts.
      const headWords = head < 1000 ? under1000(head) : numberToWords(head);
      return headWords + " " + word + (rest ? " " + numberToWords(rest) : "");
    }
  }
  return String(n);
}

/** "sixty-eight million" style with a decimal coefficient: 6.8 million → "6.8 million". */
export function shortWords(coef: number, exp: number): string {
  // exp is a multiple of 3 here.
  const scale = SCALES.find((s) => s.exp === exp);
  const c = Number.isInteger(coef) ? String(coef) : coef.toFixed(1);
  return scale ? `${c} ${scale.word}` : `${c} × 10^${exp}`;
}

export function toSci(n: number): { c: number; e: number } {
  if (n === 0) return { c: 0, e: 0 };
  const e = Math.floor(Math.log10(Math.abs(n)));
  let c = n / 10 ** e;
  // Guard float drift like 9.999999 → 10.
  if (c >= 10) { c /= 10; return { c, e: e + 1 }; }
  return { c, e };
}

export function fmtSci(c: number, e: number): string {
  const cs = Number.isInteger(c) ? String(c) : c.toFixed(1).replace(/\.0$/, "");
  return `${cs} × 10^${e}`;
}

export function fmtDigits(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

/** Express a value in the largest whole scale word: 2e11 → "200 billion". */
export function toScaleWords(n: number): string {
  for (const { word, exp } of [...SCALES].reverse()) {
    const unit = 10 ** exp;
    if (n >= unit) {
      const head = n / unit;
      const hs = Number.isInteger(head) ? String(head) : head.toFixed(1).replace(/\.0$/, "");
      return `${hs} ${word}`;
    }
  }
  return fmtDigits(n);
}

export const ri = (lo: number, hi: number) => Math.floor(Math.random() * (hi - lo + 1)) + lo;
export const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/**
 * Parse anything a learner might type for a value:
 *  "6.8e7", "6.8 x 10^7", "6.8×10^7", "6.8 7", "68,000,000", "68 million", "68m", "200b".
 * Returns null if unparseable.
 */
export function parseValue(raw: string): number | null {
  let s = raw.trim().toLowerCase().replace(/,/g, "").replace(/×|·|\*/g, "x");
  if (!s) return null;

  // a x 10^b  |  a x 10 ^ b  |  a e b
  let m = s.match(/^(-?[\d.]+)\s*x\s*10\s*\^?\s*(-?\d+)$/);
  if (m) return parseFloat(m[1]) * 10 ** parseInt(m[2], 10);
  m = s.match(/^(-?[\d.]+)\s*e\s*(-?\d+)$/);
  if (m) return parseFloat(m[1]) * 10 ** parseInt(m[2], 10);
  // bare "10^b"
  m = s.match(/^10\s*\^\s*(-?\d+)$/);
  if (m) return 10 ** parseInt(m[1], 10);
  // "a b" — two numbers separated by space = coefficient and exponent
  m = s.match(/^(-?[\d.]+)\s+(-?\d+)$/);
  if (m) return parseFloat(m[1]) * 10 ** parseInt(m[2], 10);

  // scale words / suffix letters
  const scaleMap: Record<string, number> = {
    thousand: 3, k: 3, million: 6, m: 6, mil: 6, billion: 9, b: 9, bil: 9, trillion: 12, t: 12, tril: 12,
  };
  m = s.match(/^(-?[\d.]+)\s*([a-z]+)$/);
  if (m && scaleMap[m[2]] !== undefined) return parseFloat(m[1]) * 10 ** scaleMap[m[2]];

  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

/** Parse strictly as scientific notation → {c, e}. Also accepts a plain number and normalizes it. */
export function parseSci(raw: string): { c: number; e: number } | null {
  const v = parseValue(raw);
  if (v === null || v <= 0) return null;
  return toSci(v);
}

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
/** Parse "a/b" (or a plain number as a/1). Returns reduced [n, d] or null. */
export function parseFrac(raw: string): [number, number] | null {
  const s = raw.trim().replace(/\s+/g, "");
  const m = s.match(/^(-?\d+)\/(\d+)$/);
  if (m) { const n = +m[1], d = +m[2]; if (!d) return null; const g = gcd(n, d) || 1; return [n / g, d / g]; }
  const v = parseValue(s); if (v === null || !Number.isInteger(v)) return null; return [v, 1];
}
export const reduce = (n: number, d: number): [number, number] => { const g = gcd(n, d) || 1; return [n / g, d / g]; };
export const fmtFrac = (n: number, d: number) => (d === 1 ? String(n) : `${n}/${d}`);
