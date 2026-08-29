/**
 * Structural difficulty priors, in logit units on a shared scale
 * (≈ −3 trivial … 0 moderate … +2.5 hard). Elo adapts these to the learner;
 * they only decide where an item *starts*.
 *
 * Sources for the shape of these: the problem-size effect in arithmetic
 * (Campbell & Graham 1985), the tie / ×5 / ×10 advantages, and which
 * denominators have terminating or familiar decimal expansions.
 */

const HARD_FACTS = new Set(["6x7", "7x8", "6x8", "6x9", "7x9", "8x9", "4x7", "4x8", "3x8", "3x7"]);

export function mulPrior(a: number, b: number): number {
  const [x, y] = a <= b ? [a, b] : [b, a];
  if (x === 1 || y === 1) return -3;
  if (x === 10 || y === 10 || x === 20 || y === 20) return -2;
  if (y <= 9) {
    let p = -2.2 + 0.12 * (x + y);
    if (x === y) p -= 0.5;
    if (x === 2) p -= 0.5;
    if (x === 5) p -= 0.4;
    if (HARD_FACTS.has(`${x}x${y}`)) p += 0.6;
    return p;
  }
  if (x <= 10 && y >= 21) return 0.6 + 0.1 * (y - 21) + 0.1 * x - (x === 2 || x === 5 ? 0.6 : 0);
  if (x <= 10) {
    // one factor 11–19, other ≤ 10
    let p = -0.6 + 0.15 * (y - 11) + 0.08 * x;
    if (x === 2 || x === 5) p -= 0.6;
    if (y === 11) p -= 0.7;
    if (y === 12 && x <= 6) p -= 0.3;
    return p;
  }
  // both 11–19
  let p = 1.0 + 0.1 * (x + y - 22);
  if (x === y) p -= 0.5;
  if (x === 11 || y === 11) p -= 0.6;
  return p;
}

export function squarePrior(n: number): number {
  if (n <= 10) return -2.2 + 0.1 * n;
  if ([12, 15, 20, 25].includes(n)) return -0.6;
  if (n <= 15) return -0.3 + 0.2 * (n - 11);
  return 0.8 + 0.15 * (n - 16);
}

export function cubePrior(n: number): number {
  if (n === 10) return -2;
  if (n <= 5) return -1.5 + 0.3 * n;
  if (n <= 10) return 0.2 + 0.25 * (n - 6);
  return 1.5 + 0.2 * (n - 11);
}

const UNIT_FRACTION: Record<number, number> = {
  2: -3, 4: -2.5, 5: -2.5, 10: -3, 20: -2, 25: -2,
  3: -1.5, 6: -1, 8: -1, 9: -0.8, 12: -0.3, 15: 0, 16: 0.3,
  7: 0.8, 11: 0.8, 13: 1.5, 14: 1.2, 17: 2, 18: 1.2, 19: 2,
};
export const unitFractionPrior = (d: number) => UNIT_FRACTION[d] ?? 1;

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
export function fractionPrior(n: number, d: number): number {
  let p = unitFractionPrior(d) + 0.8 + 0.08 * (n - 2);
  if (gcd(n, d) > 1) p -= 0.3;           // reducible: 2/4, 6/8
  if (n === d - 1) p -= 0.2;             // complement trick: 7/8 = 1 − 1/8
  return p;
}

export const zerosPrior = (e: number) => -2.5 + 0.25 * e;
export const wordExpPrior = (scaleIdx: number, variant: 0 | 1 | 2) => [-2, -1, -0.3][variant] + 0.2 * scaleIdx;
export const expAddPrior = (a: number, b: number) => -2.5 + 0.12 * (a + b) + (a + b >= 10 ? 0.3 : 0);
export const expSubPrior = (a: number, b: number) => -2.3 + 0.12 * a + (a === b ? -0.3 : 0);
export const snDigitsPrior = (c: number, e: number) => -1.5 + 0.2 * e + (Number.isInteger(c) ? 0 : 0.7);
export const snWordsPrior = (head: number, scaleIdx: number) =>
  -1 + 0.2 * scaleIdx + (head >= 10 ? 0.6 : 0) + (head >= 100 ? 0.5 : 0) + (Number.isInteger(head) ? 0 : 0.5);
export const snNormPrior = (c: number, e: number) => -0.5 + 0.15 * e + (c >= 100 ? 0.6 : 0) + (c < 1 ? 0.8 : 0);
export const snMulPrior = (a: number, b: number, ea: number, eb: number) => (a * b >= 10 ? 0.8 : 0) + 0.1 * (ea + eb) + 0.1 * (a + b) - 0.5;
export const snDivPrior = (a: number, q: number, ea: number) => 0.1 * ea + (a >= 10 ? 0.5 : 0) + 0.1 * q - 0.3;
export const magMulPrior = (h1: number, h2: number, s1: number, s2: number) => 0.5 + 0.3 * ((h1 >= 10 ? 1 : 0) + (h2 >= 10 ? 1 : 0)) + 0.15 * (s1 + s2);
export const magDivPrior = (h2: number, q: number, s1: number) => 0.5 + (h2 >= 10 ? 0.2 : 0) + (q >= 10 ? 0.2 : 0) + 0.15 * s1;
export const pctAnchorPrior = (p: number, base: number) => ({ 10: -2.5, 50: -2, 1: -1.5, 5: -1 } as Record<number, number>)[p] + 0.3 * (String(base).length - 2);
export const pctComposePrior = (p: number, base: number) => -0.5 + (p % 10 ? 0.8 : 0) + 0.15 * (String(base).length - 2) + (p === 25 || p === 75 ? -0.4 : 0);

/** Percent "friendliness" on a shared scale: 10/50 trivial … odd percents hard. */
export const pctClass = (p: number) => (p === 10 || p === 50 ? 0 : p === 20 || p === 25 || p === 75 ? 1 : p % 5 === 0 ? 2 : 3);
const PCT_CLASS_PRIOR = [-1.5, -0.8, 0, 0.8];
const digits = (n: number) => String(Math.round(n)).length;
export const pctApplyPrior = (p: number, base: number) => PCT_CLASS_PRIOR[pctClass(p)] + 0.15 * (digits(base) - 2) + 0.3;
export const pctFindPrior = (p: number, down: boolean) => PCT_CLASS_PRIOR[pctClass(p)] + 0.5 + (down ? 0.4 : 0);
export const pctWhatPrior = (p: number, whole: number) => PCT_CLASS_PRIOR[pctClass(p)] + 0.2 + 0.15 * (digits(whole) - 2);
export const pctReversePrior = (p: number, off: boolean) => PCT_CLASS_PRIOR[pctClass(p)] + 1.0 + (off ? 0.4 : 0);
export const pctChainPrior = (p1: number, p2: number, base: number) => PCT_CLASS_PRIOR[pctClass(p1)] * 0.5 + PCT_CLASS_PRIOR[pctClass(p2)] * 0.5 + 1.3 + 0.1 * (digits(base) - 3);

/** Multi-digit mental strategies. */
export const splitPrior = (a: number, b: number) => -0.6 + 0.04 * a + 0.12 * b + (a % 10 >= 6 && b >= 6 ? 0.5 : 0) + ((a % 10) * b >= 40 ? 0.3 : 0);   // a two-digit, b one-digit
export const short5Prior = (a: number, m: number) => (m === 5 ? -0.8 : m === 50 ? -0.4 : 0.2) + (a % 2 ? 0.4 : 0) + (m === 25 && a % 4 ? 0.5 : 0) + 0.02 * a;
export const short11Prior = (a: number, m: number) => (m === 11 ? -0.6 : 0.2) + ((Math.floor(a / 10) + (a % 10)) >= 10 ? 0.7 : 0) + 0.01 * a;
export const doublePrior = (a: number, b: number) => 0.2 + 0.02 * (a + b) + (a % 4 === 0 || b % 4 === 0 ? -0.3 : 0);
export const near100Prior = (a: number, b: number) => -0.2 + 0.3 * Math.abs(a - 100) + 0.08 * b + (a > 100 ? 0.2 : 0);
export const divFactsPrior = (q: number, d: number) => -2.2 + 0.12 * (q + d) + (d === 2 || d === 5 || d === 10 ? -0.6 : 0) + (q === d ? -0.4 : 0);
export const div1Prior = (q: number, d: number) => -0.4 + 0.1 * d + 0.02 * q + (q >= 30 ? 0.3 : 0) + (q % 10 >= 6 ? 0.2 : 0);
export const remPrior = (n: number, d: number) => (d === 2 || d === 5 || d === 10 ? -1.5 : d === 3 || d === 9 ? -0.2 : d === 4 ? 0 : 0.6) + 0.15 * (String(n).length - 2);
