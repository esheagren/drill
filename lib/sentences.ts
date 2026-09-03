/**
 * The tutor's sentences for a miss: one or two lines that say the move in this
 * item's own numbers, followed (on screen) by the answer. Derived from the
 * item's key and skill, the way widgetSeed derives the picture. Skills without
 * a written move fall back to the generator's one-line working.
 */
import type { Item } from "./items";

const WORDS = ["", "", "twos", "threes", "fours", "fives", "sixes", "sevens", "eights", "nines", "tens", "elevens", "twelves"];
const times = (n: number) => WORDS[n] ?? `${n}s`;
const f = (n: number) => (Math.round(n * 100) / 100).toLocaleString("en-US", { maximumFractionDigits: 2 });
/** "8 elevens" when one factor is small enough to have a word; otherwise "23 × 15". */
const prod = (a: number, b: number) => (b <= 12 ? `${a} ${times(b)}` : a <= 12 ? `${b} ${times(a)}` : `${a} × ${b}`);

export function sentencesFor(item: Item): string[] {
  const k = item.key;
  let m: RegExpMatchArray | null;
  const id = item.skillId;

  if ((m = k.match(/^mul:(\d+)x(\d+)$/))) {
    const lo = +m[1], hi = +m[2];
    switch (id) {
      case "ar.mul12": return [`${prod(hi, lo)} is ${f(lo * hi)}.`];
      case "ar.mul20": return lo > 10 ? [`${hi} tens is ${f(hi * 10)}.`, `${hi} ${times(lo - 10)} more is ${f(hi * (lo - 10))}.`] : [`${prod(hi, lo)} is ${f(lo * hi)}.`];
      case "ar.mul25": return [`20 ${lo <= 12 ? times(lo) : `× ${lo}`} is ${f(20 * lo)}.`, `${hi - 20} more ${lo <= 12 ? times(lo) : `× ${lo}`} is ${f((hi - 20) * lo)}.`];
      case "ar.split": { const tens = Math.floor(hi / 10) * 10, ones = hi % 10; return [`${tens} ${times(lo)} is ${f(tens * lo)}.`, ...(ones ? [`${ones} more ${times(lo)} is ${f(ones * lo)}.`] : [])]; }
      case "ar.short5": { const mm = [5, 25, 50].includes(lo) ? lo : hi, a = mm === lo ? hi : lo; return mm === 5 ? [`Half of ${a} is ${f(a / 2)}.`, `Ten times that: ${f(a * 5)}.`] : mm === 50 ? [`Half of ${a} is ${f(a / 2)}.`, `A hundred times that.`] : [`A quarter of ${a} is ${f(a / 4)}.`, `A hundred times that.`]; }
      case "ar.short11": { const mm = lo === 11 || lo === 101 ? lo : hi, a = mm === lo ? hi : lo; return mm === 11 ? [`${a} tens is ${f(a * 10)}.`, `One more ${a} makes ${f(a * 11)}.`] : [`${a} hundreds is ${f(a * 100)}.`, `One more ${a} makes ${f(a * 101)}.`]; }
      case "ar.double": { const a = lo % 2 === 0 ? lo : hi, b = a === lo ? hi : lo; return [`Halve ${a}, double ${b}: ${a / 2} × ${b * 2}.`, (a / 2) % 2 === 0 ? `Again: ${a / 4} × ${b * 4} is ${f(a * b)}.` : `${a / 2} × ${b * 2} is ${f(a * b)}.`]; }
      case "ar.near100": { const d = Math.abs(100 - hi); return [`${lo} hundreds is ${f(100 * lo)}.`, d === 1 ? `${hi < 100 ? "Take away one" : "Add one more"} ${lo}.` : `${hi < 100 ? "Take away" : "Add"} ${lo} ${times(d)}: ${f(lo * d)}.`]; }
    }
  }
  if ((m = k.match(/^sq:(\d+)$/))) { const n = +m[1]; return n <= 12 ? [`${n} ${times(n)} is ${n * n}.`] : [`${n}² is (${n - 10} + 10)².`, `${(n - 10) ** 2} + ${20 * (n - 10)} + 100.`]; }
  if ((m = k.match(/^cube:(\d+)$/))) { const n = +m[1]; return [`${n} squared is ${n * n}.`, `${prod(n * n, n)} is ${f(n ** 3)}.`]; }
  if ((m = k.match(/^div:(\d+)\/(\d+)$/))) {
    const n = +m[1], d = +m[2], q = n / d;
    if (id === "ar.divfacts") return [`${prod(d, q)} is ${n}.`];
    const tens = Math.floor(q / 10) * 10; return [`${d} × ${tens} is ${f(d * tens)}.`, `${f(n - d * tens)} left, which is ${d} × ${q % 10}.`];
  }
  if ((m = k.match(/^rem:(\d+)%(\d+)$/))) {
    const n = +m[1], d = +m[2], r = n % d, sum = String(n).split("").reduce((a, c) => a + +c, 0);
    if (d === 3 || d === 9) return [`The digits add to ${sum}.`, `${sum} ÷ ${d} leaves ${r}.`];
    if (d === 4) return [`Only the last two digits matter: ${n % 100}.`, `${n % 100} ÷ 4 leaves ${r}.`];
    if (d === 2 || d === 5 || d === 10) return [`Only the last digit matters: ${n % 10}.`];
    if (d === 6) return [`Even, and the digits add to ${sum}.`, `${sum} ÷ 3 leaves ${sum % 3}, so ÷ 6 leaves ${r}.`];
    const q = Math.floor(n / d); return [`${d} × ${q} is ${f(d * q)}.`, `${f(n)} − ${f(d * q)} leaves ${r}.`];
  }
  if ((m = k.match(/^pcta:(\d+)%(\d+)$/))) {
    const p = +m[1], base = +m[2];
    if (p === 10) return [`10% of ${f(base)} is ${f(base / 10)}.`];
    if (p === 1) return [`1% of ${f(base)} is ${f(base / 100)}.`];
    if (p === 50) return [`Half of ${f(base)} is ${f(base / 2)}.`];
    return [`10% of ${f(base)} is ${f(base / 10)}.`, `Half of that.`];
  }
  if ((m = k.match(/^pctc:(\d+)%(\d+)$/))) {
    const p = +m[1], base = +m[2], tens = Math.floor(p / 10) * 10, ones = p - tens;
    return ones ? [`${tens}% of ${f(base)} is ${f((tens / 100) * base)}.`, `${ones}% is ${f((ones / 100) * base)} more.`] : [`10% of ${f(base)} is ${f(base / 10)}.`, `${p / 10} of those.`];
  }
  if ((m = k.match(/^pctap:(up|down)(\d+)%(\d+)$/))) { const p = +m[2], base = +m[3]; return [`${p}% of ${f(base)} is ${f((p / 100) * base)}.`, m[1] === "down" ? "Take it off." : "Add it on."]; }
  if ((m = k.match(/^pctf:(up|down)(\d+)%(\d+)$/))) { const p = +m[2], base = +m[3], change = (p / 100) * base; return [`The change is ${f(change)}.`, `${f(change)} ÷ ${f(base)} is ${p}%.`]; }
  if ((m = k.match(/^pctw:(\d+)of(\d+)$/))) { const part = +m[1], whole = +m[2]; return [`1% of ${f(whole)} is ${f(whole / 100)}.`, `${f(part)} ÷ ${f(whole / 100)} is ${f((100 * part) / whole)}%.`]; }
  if ((m = k.match(/^pctr:(off|is)(\d+)%(\d+)$/))) {
    const p = +m[2], whole = +m[3];
    if (m[1] === "off") { const given = whole * (1 - p / 100); return [`${f(given)} is ${100 - p}% of the original.`, `${f(given)} ÷ ${(100 - p) / 100} is ${f(whole)}.`]; }
    const given = (whole * p) / 100; return [`${f(given)} is ${p}%, so 1% is ${f(given / p)}.`, `A hundred of those: ${f(whole)}.`];
  }
  if ((m = k.match(/^pctch:(up|down)(\d+),(up|down)(\d+)%(\d+)$/))) {
    const d1 = m[1] === "down", p1 = +m[2], d2 = m[3] === "down", p2 = +m[4], base = +m[5];
    const f1 = 1 + (d1 ? -p1 : p1) / 100, f2 = 1 + (d2 ? -p2 : p2) / 100;
    return [`${d1 ? "Down" : "Up"} ${p1}% is × ${f1.toFixed(2)}: ${f(base * f1)}.`, `${d2 ? "Down" : "Up"} ${p2}% is × ${f2.toFixed(2)}: ${f(base * f1 * f2)}.`];
  }
  return [item.why.replace(/\.?\s*$/, ".")];
}
