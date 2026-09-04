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
const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const dec = (v: number, places = 4) => String(Math.round(v * 10 ** places) / 10 ** places);
const pct = (v: number) => `${dec(v, 1)}%`;
const SCALE: Record<number, string> = { 3: "thousand", 6: "million", 9: "billion", 12: "trillion", 15: "quadrillion" };
const PLACE = ["", "tenths", "hundredths", "thousandths", "ten-thousandths"];
/** 400000 → "400 thousand", 2e6 → "2 million", 67350 → "67.35 thousand", 350 → "350" */
const say = (v: number): string => { if (v < 1000) return dec(v, 2); const e = Math.floor(Math.log10(v)); const sc = Math.min(15, Math.floor(e / 3) * 3); return `${dec(v / 10 ** sc, 2)} ${SCALE[sc]}`; };
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
/** the exponent that "34 e 12" normalizes to: 3.4 × 10^13 */
const norm = (c: number, e: number): [number, number] => { let cc = c, ee = e; while (cc >= 10) { cc /= 10; ee++; } while (cc > 0 && cc < 1) { cc *= 10; ee--; } return [Math.round(cc * 100) / 100, ee]; };
/** "8 elevens" when one factor is small enough to have a word; otherwise "23 × 15". */
const prod = (a: number, b: number) => (b <= 12 ? `${a} ${times(b)}` : a <= 12 ? `${b} ${times(a)}` : `${a} × ${b}`);

export function sentencesFor(item: Item): string[] {
  const k = item.key;
  let m: RegExpMatchArray | null;
  const id = item.skillId;

  if ((m = k.match(/^mul:(\d+)x(\d+)$/))) {
    const lo = +m[1], hi = +m[2];
    switch (id) {
      case "ar.mul12": case "coef.mul": return [`${prod(hi, lo)} is ${f(lo * hi)}.`];
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

  // ── fractions ──
  if ((m = k.match(/^fr:(\d+)\/(\d+)$/))) { const a = +m[1], b = +m[2]; return a === 1 ? [`100 ÷ ${b} is ${dec(100 / b, 1)}.`] : [`1/${b} is ${pct(100 / b)}.`, `${a} of them: ${pct((100 * a) / b)}.`]; }
  if ((m = k.match(/^simp:(\d+)\/(\d+)$/))) { const a = +m[1], b = +m[2], g = gcd(a, b); return [`${a} and ${b} both divide by ${g}.`, `${a / g} over ${b / g}.`]; }
  if ((m = k.match(/^cmp:(\d+)\/(\d+)v(\d+)\/(\d+)$/))) { const [a, b, c, d] = [+m[1], +m[2], +m[3], +m[4]]; return [`${a}/${b} is about ${dec(a / b, 2)}.`, `${c}/${d} is about ${dec(c / d, 2)}.`]; }
  if ((m = k.match(/^frof:(\d+)\/(\d+)x(\d+)$/))) { const a = +m[1], b = +m[2], n = +m[3]; return a === 1 ? [`${f(n)} ÷ ${b} is ${f(n / b)}.`] : [`1/${b} of ${f(n)} is ${f(n / b)}.`, `${a} of them: ${f((a * n) / b)}.`]; }
  if ((m = k.match(/^fradd:(\d+)\/(\d+)([+-])(\d+)\/(\d+)$/))) { const [a, b, c, d] = [+m[1], +m[2], +m[4], +m[5]]; const L = (b * d) / gcd(b, d); const x = (a * L) / b, y = (c * L) / d; return [`In ${L}ths: ${x}/${L} ${m[3] === "-" ? "−" : "+"} ${y}/${L}.`, `${m[3] === "-" ? x - y : x + y}/${L}${gcd(m[3] === "-" ? x - y : x + y, L) > 1 ? ", then simplify" : ""}.`]; }
  if ((m = k.match(/^f2d:(\d+)\/(\d+)$/))) { const a = +m[1], b = +m[2]; return a === 1 ? [`1 ÷ ${b} is ${dec(1 / b)}.`] : [`1/${b} is ${dec(1 / b)}.`, `${a} of them: ${dec(a / b)}.`]; }
  if ((m = k.match(/^d2f:(\d+)\/(\d+)$/))) { const a = +m[1], b = +m[2]; if (b % 3 === 0) return [`A repeating decimal: think ${b}ths.`, `${dec(a / b, 3)}… is ${a}/${b}.`]; const v = a / b, places = (String(v).split(".")[1] ?? "").length; const num = Math.round(v * 10 ** places), den = 10 ** places; return [`${v} is ${num} ${PLACE[places] ?? `parts in ${f(den)}`}.`, `${num}/${f(den)} divides by ${gcd(num, den)}.`]; }
  // ── decimals ──
  if ((m = k.match(/^scale:([\d.]+)([x/])(\d+)$/))) { const n = Math.log10(+m[3]); return [`${m[2] === "x" ? "×" : "÷"} ${f(+m[3])} moves the point ${n} place${n > 1 ? "s" : ""} ${m[2] === "x" ? "right" : "left"}.`]; }
  if ((m = k.match(/^d2p:([\d.]+)$/))) { const v = +m[1]; return [`Percent is hundredths.`, `${v} is ${dec(v * 100, 2)} hundredths.`]; }
  if ((m = k.match(/^p2d:([\d.]+)$/))) { const v = +m[1]; return [`${v}% is ${v} hundredths.`, `${v} ÷ 100 is ${dec(v / 100, 4)}.`]; }
  if ((m = k.match(/^round:([\d.]+)@(\d)$/))) {
    const n = +m[1], kind = +m[2];
    if (kind <= 2) { const unit = [10, 100, 1000][kind]; const d = Math.floor((n % unit) / (unit / 10)); return [`The next digit is ${d}.`, d >= 5 ? `5 or more: round up to ${f(Math.ceil(n / unit) * unit)}.` : `Under 5: round down to ${f(Math.floor(n / unit) * unit)}.`]; }
    const dp = kind === 3 ? 1 : 2; const d = +(String(n).split(".")[1]?.[dp] ?? "0"); const ans = Math.round(n * 10 ** dp) / 10 ** dp; return [`The next digit is ${d}.`, d >= 5 ? `5 or more: round up to ${ans}.` : `Under 5: round down to ${ans}.`];
  }
  if ((m = k.match(/^dop:([\d.]+)([+x-])([\d.]+)$/))) {
    const x = +m[1], y = +m[3];
    if (m[2] === "x") { const p = (String(x).split(".")[1] ?? "").length; return [`${Math.round(x * 10 ** p)} × ${y} is ${Math.round(x * 10 ** p) * y}.`, `Put the point back ${p} place${p > 1 ? "s" : ""}.`]; }
    const p = Math.max((String(x).split(".")[1] ?? "").length, (String(y).split(".")[1] ?? "").length); return [`Line up the points: ${x.toFixed(p)} ${m[2] === "+" ? "+" : "−"} ${y.toFixed(p)}.`];
  }
  // ── place value, exponents, scientific notation ──
  if ((m = k.match(/^zeros:(\d+)$/))) return [`Count the zeros: ${m[1]}.`];
  if ((m = k.match(/^wexp:(.+)$/))) {
    const ws = m[1].split(" "); const scale = ws[ws.length - 1]; const e = ({ thousand: 3, million: 6, billion: 9, trillion: 12 } as Record<string, number>)[scale] ?? 0; const pre = ws.slice(0, -1).join(" "); const pe = ({ one: 0, ten: 1, hundred: 2, "one hundred": 2 } as Record<string, number>)[pre] ?? 0;
    return pe ? [`A ${scale} is 10^${e}.`, `${cap(pre)} of them: 10^${e} × 10^${pe} is 10^${e + pe}.`] : [`A ${scale} is 10^${e}.`];
  }
  if ((m = k.match(/^eadd:(\d+)\+(\d+)$/))) return [`Multiplying powers of ten adds the exponents.`, `${m[1]} + ${m[2]} is ${+m[1] + +m[2]}.`];
  if ((m = k.match(/^esub:(\d+)-(\d+)$/))) return [`Dividing powers of ten subtracts the exponents.`, `${m[1]} − ${m[2]} is ${+m[1] - +m[2]}.`];
  if ((m = k.match(/^snd:([\d.]+)e(\d+)$/))) return [`The point goes after the first digit: ${m[1]}.`, `It moved ${m[2]} places, so × 10^${m[2]}.`];
  if ((m = k.match(/^snw:([\d.]+)e(\d+)$/))) { const c = +m[1], e = +m[2]; const [cc, ee] = norm(c, e); return c >= 10 ? [`${SCALE[e] ? cap(SCALE[e]) : "That scale"} is 10^${e}.`, `${c} is ${cc} × 10^${ee - e}, so ${cc} × 10^${ee}.`] : [`${cap(SCALE[e] ?? "the scale")} is 10^${e}.`, `${c} of them: ${c} × 10^${e}.`]; }
  if ((m = k.match(/^snn:([\d.]+)e(\d+)$/))) { const c = +m[1], e = +m[2]; const [cc, ee] = norm(c, e); const d = ee - e; return [`Move the point ${Math.abs(d)} place${Math.abs(d) > 1 ? "s" : ""} ${d > 0 ? "left" : "right"}: ${c} → ${cc}.`, `Each place ${d > 0 ? "adds" : "takes"} one: 10^${e} → 10^${ee}.`]; }
  if ((m = k.match(/^snm:([\d.]+)e(\d+)\*([\d.]+)e(\d+)$/))) { const [a, n, b, mm] = [+m[1], +m[2], +m[3], +m[4]]; const ab = Math.round(a * b * 100) / 100; const [cc, ee] = norm(ab, n + mm); return [`${a} × ${b} is ${ab}; ${n} + ${mm} is ${n + mm}.`, ...(ab >= 10 ? [`${ab} × 10^${n + mm} is ${cc} × 10^${ee}.`] : [])]; }
  if ((m = k.match(/^snv:([\d.]+)e(\d+)\/([\d.]+)e(\d+)$/))) { const [a, n, b, mm] = [+m[1], +m[2], +m[3], +m[4]]; const q = Math.round((a / b) * 100) / 100; const [cc, ee] = norm(q, n - mm); return [`${a} ÷ ${b} is ${q}; ${n} − ${mm} is ${n - mm}.`, ...(q >= 10 || q < 1 ? [`${q} × 10^${n - mm} is ${cc} × 10^${ee}.`] : [])]; }
  if ((m = k.match(/^magm:([\d.]+)e(\d+)\*([\d.]+)e(\d+)$/))) { const [a, n, b, mm] = [+m[1], +m[2], +m[3], +m[4]]; return [`${a} × ${b} is ${f(a * b)}.`, `${SCALE[n] ?? `10^${n}`} × ${SCALE[mm] ?? `10^${mm}`} is ${SCALE[n + mm] ?? `10^${n + mm}`}.`]; }
  if ((m = k.match(/^magd:([\d.]+)e(\d+)\/([\d.]+)e(\d+)$/))) { const [a, n, b, mm] = [+m[1], +m[2], +m[3], +m[4]]; return [`${a} ÷ ${b} is ${dec(a / b, 2)}.`, n === mm ? `The ${SCALE[n]}s cancel.` : `${SCALE[n] ?? `10^${n}`} ÷ ${SCALE[mm] ?? `10^${mm}`} is ${SCALE[n - mm] ?? `10^${n - mm}`}.`]; }
  // ── combinations ──
  if ((m = k.match(/^cpb:(\d+)%([\d.]+)e(\d+)$/))) {
    const p = +m[1], base = +m[2] * 10 ** +m[3], ten = base / 10, ans = (p / 100) * base;
    if (p === 10) return [`10% of ${say(base)} is ${say(ten)}.`];
    if (p === 5) return [`10% of ${say(base)} is ${say(ten)}.`, `Half of that: ${say(ans)}.`];
    if (p === 50) return [`Half of ${say(base)} is ${say(ans)}.`];
    if (p === 25) return [`A quarter of ${say(base)} is ${say(ans)}.`];
    if (p === 15) return [`10% is ${say(ten)}; 5% is ${say(ten / 2)}.`, `Together: ${say(ans)}.`];
    if (p % 10 === 0) return [`10% of ${say(base)} is ${say(ten)}.`, `${p / 10} of those: ${say(ans)}.`];
    return [`10% of ${say(base)} is ${say(ten)}.`, `${p}% is ${p / 10} of those: ${say(ans)}.`];
  }
  if ((m = k.match(/^cfs:(\d+)\/(\d+)x([\d.]+)e(\d+)$/))) { const a = +m[1], b = +m[2], c = +m[3], e = +m[4]; const unit = c / b; return a === 1 ? [`${c} ÷ ${b} is ${dec(unit, 3)}.`, `Keep the ${SCALE[e] ?? `10^${e}`}s: ${say(unit * 10 ** e)}.`] : [`1/${b} of ${c} ${SCALE[e] ?? `× 10^${e}`} is ${say(unit * 10 ** e)}.`, `${a} of them: ${say(a * unit * 10 ** e)}.`]; }
  if ((m = k.match(/^ccb:(up|down)(\d+),(up|down)(\d+)%([\d.]+)e(\d+)$/))) { const d1 = m[1] === "down", p1 = +m[2], d2 = m[3] === "down", p2 = +m[4], base = +m[5] * 10 ** +m[6]; const f1 = 1 + (d1 ? -p1 : p1) / 100, f2 = 1 + (d2 ? -p2 : p2) / 100; return [`${d1 ? "Down" : "Up"} ${p1}% is × ${f1.toFixed(2)}: ${say(base * f1)}.`, `${d2 ? "Down" : "Up"} ${p2}% is × ${f2.toFixed(2)}: ${say(base * f1 * f2)}.`]; }
  if ((m = k.match(/^cpc:([\d.]+)e(\d+)\/([\d.]+)e(\d+)$/))) { const [a, n, b, mm] = [+m[1], +m[2], +m[3], +m[4]]; return [`${a} ÷ ${b} is about ${dec(a / b, 2)}.`, `10^${n} ÷ 10^${mm} is 10^${n - mm}: × ${f(10 ** (n - mm))}.`]; }
  if ((m = k.match(/^ccp:([\d.]+)e(\d+)v([\d.]+)e(\d+)$/))) { const [a, n, b, mm] = [+m[1], +m[2], +m[3], +m[4]]; const [ca, ea] = norm(a, n); return [`${a} ${SCALE[n] ?? `× 10^${n}`} is ${ca} × 10^${ea}.`, ea === mm ? `Same exponent — compare ${ca} with ${b}.` : `10^${ea} against 10^${mm}: the bigger exponent wins.`]; }
  if ((m = k.match(/^cdb:(\d+)$/))) { const r = +m[1]; return [`Doubling takes about 72 ÷ rate years.`, `72 ÷ ${r} is ${dec(72 / r, 1)}.`]; }
  if ((m = k.match(/^cgr:(\d+)%x(\d+)y(\d+)$/))) { const r = +m[1], y = +m[2], base = +m[3]; const g = 1 + r / 100; return [`Each year is × ${g.toFixed(2)}.`, `${y} years: × ${dec(g ** y, 3)}, so ${f(base)} → ${f(base * g ** y)}.`]; }
  if ((m = k.match(/^cup:([\d.]+)\/([\d.]+)$/))) { const t = +m[1], q = +m[2]; return [`$${t} shared by ${q}: ${dec(t / q, 2)} each.`]; }
  return [cap(item.why.replace(/\.?\s*$/, "."))];
}
