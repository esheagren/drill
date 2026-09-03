/**
 * Widgets — the inventory. The major conceptual ideas K-12 mathematics builds,
 * prioritized for Drill's scope (adult mental arithmetic), each with the
 * representations teachers and researchers actually use for it and what an
 * interactive version would do. Then the minimal set: the few pictures that
 * between them carry the list. Handles: W-<id>.
 */
import type { ReactNode } from "react";

export type WidgetKey = "line" | "bar" | "array" | "chain";
export interface Idea {
  id: string;
  rank: number;
  name: string;
  /** the conceptual development, in one breath */
  idea: string;
  /** where it sits in the K-12 progression */
  where: string;
  /** representations the literature uses, with lineage */
  reps: string[];
  /** what an interactive version does — verbs */
  interactive: string;
  /** Drill skills it serves (ids) */
  serves: string;
  /** which of the minimal set carries it */
  widget: WidgetKey[];
  status: "built" | "partly" | "proposed" | "later";
  /** research or programs worth knowing */
  notes?: string;
}

export const IDEAS: Idea[] = [
  {
    id: "place-value", rank: 1, name: "Place value and powers of ten",
    idea: "Ten of these make one of those. The same digit means ten times more one place to the left; decimals continue the pattern to the right; ×10 and ÷10 slide every digit one column. Scientific notation is place value written as a power.",
    where: "K–5 NBT (the spine of elementary arithmetic) → 5.NBT decimals → 8.EE integer exponents and scientific notation.",
    reps: ["base-ten blocks (Dienes)", "place-value chart and place-value disks (Singapore)", "ten-frames and the hundred chart (K–2)", "‘move the decimal point’ — the shortcut that hides the shift"],
    interactive: "The digits stay put and the point hops; or the whole number slides a column when you press ×10. A number line that zooms by ten at every step, so place value is scale.",
    serves: "pv.zeros · pv.word-exp · exp.add · exp.sub · coef.mul · dec.scale · dec.pct · sn.digits · sn.words · sn.norm",
    widget: ["line"], status: "proposed",
    notes: "The Common Core Progressions (NBT) narrate this as ‘units of units’. Most adult sci-notation errors are place-value errors.",
  },
  {
    id: "magnitude", rank: 2, name: "Magnitude and the number line",
    idea: "A number is a position and a distance. Benchmarks (0, ½, 1, 10, 100, a million) anchor estimates. Untrained intuition is roughly logarithmic — equal ratios feel like equal steps — and schooling makes it linear; both are useful, for different questions.",
    where: "2.MD (the line) → 3.NF (fractions on the line) → 6.NS (rationals) → 8.EE (very large and very small numbers).",
    reps: ["the empty number line (Freudenthal Institute / Dutch RME)", "clothesline math (Chris Shore)", "Estimation180 (Andrew Stadel)", "log-scale lines for orders of magnitude"],
    interactive: "One line you can zoom from linear to log. Drop a value; compare two magnitudes as lengths; multiply by laying lengths end to end (built as the log line). ‘Where does 7 million sit between 1 million and 10 million?’",
    serves: "mag.mul · mag.div · sn.* · co.compare · co.fracsci · dec.round",
    widget: ["line"], status: "partly",
    notes: "Siegler & Booth (2004): children’s number-line estimates move from log-like to linear with age. Dehaene, The Number Sense. Fraction-magnitude knowledge predicts later achievement (Siegler et al., 2011).",
  },
  {
    id: "multiplicative", rank: 3, name: "Multiplicative structure: arrays, area, splitting",
    idea: "Multiplication is equal groups, then an array, then an area. Split a factor and you split the product — the distributive property — and that one fact is the engine behind every multi-digit shortcut: split by place, near-100 compensation, halve-and-double, (a+10)² for squares.",
    where: "2.OA arrays → 3.OA multiplication and properties → 4.NBT area model and partial products → algebra ((a+b)(c+d)).",
    reps: ["dot arrays", "the open array / area model (Fosnot & Dolk; Japanese textbooks)", "the grid method (UK)", "Cuisenaire rods (Cuisenaire, Gattegno) for factor structure", "algebra tiles later"],
    interactive: "A rectangle cut at the tens — drag the cut and the two products re-count (built). Re-shape a rectangle keeping its area for halve-and-double. Read it backwards, one side unknown, for division.",
    serves: "ar.mul12 · ar.mul20 · ar.mul25 · ar.sq12 · ar.sq25 · ar.cube10 · ar.cube15 · ar.split · ar.short5 · ar.short11 · ar.double · ar.near100",
    widget: ["array"], status: "built",
  },
  {
    id: "fractions", rank: 4, name: "Fractions as numbers",
    idea: "1/b is one of b equal parts of a whole; a/b is a copies of 1/b. Equivalence is re-partitioning the same length. A fraction is a point on the number line, so fractions compare, and the same length reads as a decimal and a percent.",
    where: "3.NF (unit fractions, the line) → 4.NF (equivalence, comparison, decimals) → 5.NF (operations).",
    reps: ["fraction strips / fraction tiles", "fraction circles", "Cuisenaire rods", "the number line with fractions", "area models (subdivided rectangles)", "bar models (Singapore) for ‘fraction of’"],
    interactive: "One bar in b parts, a shaded. Double the cuts and the shading stays — equivalence. Snap two bars together to compare. Flip the label and the same bar reads 0.375 and 37.5%.",
    serves: "fr.unit · fr.common · fr.simplify · fr.compare · fr.of · fr.add · fr.todec · fr.fromdec",
    widget: ["bar"], status: "proposed",
    notes: "Unit-fractions-first is the progression the Common Core adopted (Wu). The 3/8-as-a-percent miss is a bar miss.",
  },
  {
    id: "proportion", rank: 5, name: "Proportional reasoning: percent, ratio, rate",
    idea: "Percent is per hundred — a ratio with a fixed second term. Scaling multiplies both quantities by the same factor; a percent change is a multiplier (×1.15, ×0.85), and successive changes multiply. Unit rates make comparison possible.",
    where: "6.RP (ratios, unit rates, percent as rate per 100) → 7.RP (proportional relationships, percent problems, multi-step percent).",
    reps: ["the double number line (Japanese textbooks; 6.RP)", "ratio tables (Dutch RME)", "tape / bar diagrams (Singapore)", "the 10×10 hundredths grid", "percent bars"],
    interactive: "The same bar with two scales — quantity above, percent below — slide the pointer and read both. A chain of multipliers for successive changes (built).",
    serves: "pct.anchor · pct.compose · pct.what · pct.apply · pct.find · pct.reverse · pct.chain · co.pctbig · co.chainbig · co.unitprice · co.percap",
    widget: ["bar", "chain"], status: "partly",
    notes: "Shares the bar with fractions: one picture, two labels. That is the consolidation this page argues for.",
  },
  {
    id: "division", rank: 6, name: "Division, sharing, remainders",
    idea: "Two meanings — sharing (95 shared by 7) and grouping (how many 7s in 95) — and one structure: the missing factor. Remainders are what doesn’t fill the last column. Divisibility rules are place-value facts in disguise.",
    where: "3.OA (division as unknown factor) → 4.NBT / 4.OA (remainders, interpretation) → 6.NS.",
    reps: ["arrays with leftovers", "the area model with an unknown side", "bar models", "partial quotients"],
    interactive: "The array read backwards: given the area and one side, find the other; dots in columns of the divisor with the stragglers in a different colour. This folds into the array — it does not need its own widget.",
    serves: "ar.divfacts · ar.div1 · ar.rem · co.percap · co.unitprice",
    widget: ["array"], status: "proposed",
  },
  {
    id: "growth", rank: 7, name: "Exponential growth and repeated multiplication",
    idea: "Growth compounds: equal factors in equal times. Doubling time, the rule of 72, and the log line where equal steps are equal factors. Multiplying powers of ten is adding exponents.",
    where: "8.EE (exponents) → HS F-LE (exponential vs linear) → financial literacy.",
    reps: ["growth bars / ladders", "tables of repeated multiplication", "semi-log graphs", "the chessboard-and-rice story"],
    interactive: "The chain with n identical steps and a rate slider (built for two steps); the log line where a multiplier is a fixed length you can step along.",
    serves: "co.growth · co.double · co.chainbig · exp.add · exp.sub · sn.mul · sn.div",
    widget: ["chain", "line"], status: "built",
  },
  {
    id: "additive", rank: 8, name: "Additive structure and compensation",
    idea: "Numbers decompose (number bonds); make-ten; compensation (47 + 38 = 50 + 35); subtraction as the distance between two points. The same moves carry to decimals and to fractions with like denominators.",
    where: "K–2 OA and NBT (the make-ten family) → 5.NBT decimals → 5.NF.",
    reps: ["ten-frames", "the rekenrek (Treffers, Freudenthal Institute)", "number bonds (Singapore)", "part-whole bars", "the empty number line with jumps", "the hundred chart"],
    interactive: "The empty number line with draggable jumps; a part-whole bar you split. Both are modes of pictures already on this list.",
    serves: "on-ramp additive fluency (kept minimal on purpose) · dec.ops · fr.add",
    widget: ["line", "bar"], status: "later",
    notes: "Low priority for adults; the on-ramp exists to catch a gap, not to teach it.",
  },
  {
    id: "estimation", rank: 9, name: "Estimation, rounding, and close enough",
    idea: "Which digit matters; the nearest benchmark; a tolerance you can name. Front-end estimation and Fermi reasoning are the adult uses of the whole list above.",
    where: "3.NBT (rounding) → 4–5 (estimation in context) → MP.6 (precision as a choice).",
    reps: ["the number line with benchmark ticks (rounding as ‘which is nearer’)", "too high / too low / just right", "Estimation180"],
    interactive: "The line with a tolerance band: drop your estimate and see whether it lands inside. A mode of the line.",
    serves: "dec.round · every ‘within ½%’ item · mag.*",
    widget: ["line"], status: "proposed",
  },
  {
    id: "units", rank: 10, name: "Units, rates, and dimensional reasoning",
    idea: "Per-unit thinking; converting by multiplying by one in disguise; the orders of magnitude of real quantities (populations, budgets, distances).",
    where: "5.MD (conversions) → 6.RP (unit rates) → HS N-Q (quantities).",
    reps: ["unit ladders", "ratio tables", "factor-label"],
    interactive: "A ratio table you extend. Not planned as a picture; the bar with two scales covers what Drill needs.",
    serves: "co.unitprice · co.percap · estimation of real quantities",
    widget: ["bar"], status: "later",
  },
];

/** K-12 ideas outside Drill's scope, so the list is honest about what it leaves out. */
export const OUT_OF_SCOPE = "integers and negatives (chip models, the line) · algebra (algebra tiles, the balance scale, function machines) · geometry and measurement (geoboard, tangrams, unit squares) · data and probability (dot plots, spinners) · functions and graphs · trigonometry (the unit circle)";

// ── the minimal set: four pictures ─────────────────────────────────────────
export interface Picture { key: WidgetKey; name: string; what: string; carries: string; status: "built" | "proposed"; sketch: ReactNode }

const Sk = ({ children }: { children: ReactNode }) => <div className="relative h-[64px] w-full rounded-lg bg-black text-gray-100 overflow-hidden px-3 py-2">{children}</div>;
export const PICTURES: Picture[] = [
  { key: "array", name: "The Array", what: "a rectangle you cut; the pieces re-count", carries: "multiplication, squares, splitting, near-100, halve-and-double; division as the missing side; remainders as the ragged last column", status: "built",
    sketch: <Sk><div className="flex h-full"><div className="bg-emerald-500/30 border border-emerald-500" style={{ width: "72%" }} /><div className="bg-sky-500/30 border border-sky-500" style={{ width: "28%" }} /></div></Sk> },
  { key: "bar", name: "The Bar", what: "one length in parts, read three ways", carries: "fractions, equivalence, comparison, fraction-of; percent and ratio with a second scale; part-whole for addition", status: "proposed",
    sketch: <Sk><div className="grid grid-cols-8 gap-[2px] h-[28px] mt-1">{Array.from({ length: 8 }, (_, i) => <div key={i} className={`border ${i < 3 ? "bg-emerald-500/40 border-emerald-500" : "border-gray-700"}`} />)}</div><div className="flex justify-between text-[9px] text-gray-500 mt-1"><span>0</span><span>3/8 · 0.375 · 37.5%</span><span>1</span></div></Sk> },
  { key: "line", name: "The Line", what: "a number line that zooms — linear or by tens", carries: "magnitude, place value, scientific notation, rounding and tolerance, additive jumps; the log mode multiplies", status: "proposed",
    sketch: <Sk><div className="relative mt-4 h-[3px] bg-gray-700"><div className="absolute left-0 top-0 h-full bg-emerald-500/70" style={{ width: "58%" }} /><div className="absolute top-0 h-full bg-sky-500/70" style={{ left: "58%", width: "22%" }} /><div className="absolute -top-[5px] w-[13px] h-[13px] rounded-full bg-gray-100" style={{ left: "80%" }} /></div><div className="flex justify-between text-[9px] text-gray-500 mt-2"><span>1</span><span>thousand</span><span>million</span><span>billion</span></div></Sk> },
  { key: "chain", name: "The Chain", what: "bars that multiply, one change at a time", carries: "percent up and down, successive changes, growth and doubling, rates", status: "built",
    sketch: <Sk><div className="space-y-[5px] mt-1">{[["start", 100], ["×1.25", 62], ["×1.10", 68]].map(([k, w], i) => <div key={k} className="flex items-center gap-2 text-[9px] text-gray-500"><span className="w-8 text-right">{k}</span><div className={`h-[9px] rounded-sm ${i === 2 ? "bg-gray-100" : i === 0 ? "bg-gray-500/60" : "bg-emerald-500/60"}`} style={{ width: `${(w as number) * 0.7}%` }} /></div>)}</div></Sk> },
];

// ── libraries and literature worth mining ──────────────────────────────────
export const LIBRARIES: { name: string; what: string; url?: string }[] = [
  { name: "Mathigon Polypad", what: "the richest free set of virtual manipulatives in one canvas — number tiles, fraction bars and circles, number line, algebra tiles, tables. The best reference for interaction feel.", url: "https://polypad.amplify.com" },
  { name: "PhET Interactive Simulations", what: "Area Model Multiplication, Fractions: Intro / Equality, Number Line: Integers / Distance / Operations, Ratio and Proportion, Make a Ten, Number Play, Proportion Playground. Research-tested, deliberately minimal controls.", url: "https://phet.colorado.edu" },
  { name: "Math Learning Center apps", what: "Number Line, Number Pieces (base ten), Number Frames, Fractions, Number Rack (rekenrek), Partial Product Finder, Money Pieces. Free, clean, one idea each — close to Drill's taste.", url: "https://www.mathlearningcenter.org/apps" },
  { name: "NLVM (Utah State)", what: "the classic catalog of virtual manipulatives by grade band and strand. Dated technology, still the most complete taxonomy.", url: "http://nlvm.usu.edu" },
  { name: "Desmos and GeoGebra", what: "anything graph- or slider-shaped; GeoGebra has thousands of community applets of uneven quality — mine for ideas, not code.", url: "https://www.geogebra.org" },
  { name: "Brilliant", what: "interactive explorations as an aesthetic reference: one idea, one manipulation, immediate feedback, no chrome.", url: "https://brilliant.org" },
  { name: "Van de Walle, Elementary and Middle School Mathematics", what: "the standard teacher-education text; a catalog of representations per topic, with the research behind each." },
  { name: "Fosnot & Dolk, Young Mathematicians at Work", what: "the open array, the double number line and the ratio table as models — the argument for models that grow with the learner." },
  { name: "Common Core Progressions (University of Arizona)", what: "per-domain narratives (NBT, NF, RP, EE) that name the representations at each grade. The source for the ‘where’ column above." },
  { name: "Singapore, Japanese and Dutch (RME) traditions", what: "bar models; tape diagrams and the double number line; the empty number line, the rekenrek and ratio tables." },
  { name: "Siegler; Dehaene", what: "number-line estimation (log → linear with schooling), fraction magnitude as the predictor of later math; The Number Sense." },
];
