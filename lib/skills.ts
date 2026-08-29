/**
 * Atomic skill taxonomy.
 *
 * Each skill is one thing a learner either can or cannot do quickly. The
 * decomposition follows the Common Core progression for place value, powers
 * of ten, integer exponents and scientific notation, then applies it to the
 * estimation moves Magnitude is actually for. `prereqs` gate when a skill
 * enters the interleaved rotation; `targetMs` is the latency at which the
 * skill counts as automatic.
 */
export type SkillId =
  | "co.pctbig"
  | "co.fracsci"
  | "co.chainbig"
  | "co.percap"
  | "co.compare"
  | "co.double"
  | "co.growth"
  | "co.unitprice"
  | "fr.simplify"
  | "fr.compare"
  | "fr.of"
  | "fr.add"
  | "fr.todec"
  | "fr.fromdec"
  | "dec.scale"
  | "dec.pct"
  | "dec.round"
  | "dec.ops"
  | "ar.split"
  | "ar.short5"
  | "ar.short11"
  | "ar.double"
  | "ar.near100"
  | "ar.divfacts"
  | "ar.div1"
  | "ar.rem"
  | "pct.apply"
  | "pct.find"
  | "pct.what"
  | "pct.reverse"
  | "pct.chain"
  | "ar.mul12"
  | "ar.mul20"
  | "ar.mul25"
  | "ar.sq12"
  | "ar.sq25"
  | "ar.cube10"
  | "ar.cube15"
  | "fr.unit"
  | "fr.common"
  | "pv.zeros"
  | "pv.word-exp"
  | "sn.digits"
  | "sn.words"
  | "exp.add"
  | "exp.sub"
  | "coef.mul"
  | "sn.norm"
  | "sn.mul"
  | "sn.div"
  | "mag.mul"
  | "mag.div"
  | "pct.anchor"
  | "pct.compose";

export type Family = "arithmetic" | "fractions" | "decimals" | "percents" | "place-value" | "exponents" | "scientific" | "operations" | "magnitude" | "combo";

/** Where a skill sits in the product: on-ramp (checked, not drilled), core, or combinations. */
export type Tier = "onramp" | "core" | "combo";

export interface Skill {
  id: SkillId;
  family: Family;
  /** Trajectory level L0–L7 (see docs/learning-trajectory.md). */
  level: number;
  tier: Tier;
  /** Knowledge components exercised — the tags the maps and the belief model share. */
  kc: string[];
  /** Subsection within the unit (e.g. "Times tables"); skills in the same group are bands of one thing. */
  group?: string;
  name: string;
  /**
   * Think-time budget in ms, before typing. The full per-item budget adds
   * typing time for the answer's length (see engine.budgetFor). Bases were
   * re-derived 2026-08-29 from observed response times (~2× the originals).
   */
  ask: string;
  prereqs: SkillId[];
  ccss: string[];
  targetMs: number;
}

type Meta = { level: number; tier: Tier; kc: string[] };
const META: Record<SkillId, Meta> = {
  "ar.mul12":   { level: 2, tier: "onramp", kc: ["mul-facts"] },
  "ar.split":   { level: 4, tier: "core",   kc: ["mul-facts", "distributive-split", "add-partials"] },
  "ar.short5":  { level: 4, tier: "core",   kc: ["halving", "powers-of-ten"] },
  "ar.short11": { level: 4, tier: "core",   kc: ["distributive-split", "add-partials"] },
  "ar.double":  { level: 4, tier: "core",   kc: ["halving", "doubling", "mul-facts"] },
  "ar.near100": { level: 4, tier: "core",   kc: ["near-multiple-of-ten", "compensation"] },
  "ar.divfacts":{ level: 2, tier: "onramp", kc: ["div-facts"] },
  "ar.div1":    { level: 4, tier: "core",   kc: ["div-facts", "distributive-split"] },
  "ar.rem":     { level: 4, tier: "core",   kc: ["div-facts", "divisibility"] },
  "ar.mul20":   { level: 4, tier: "core",   kc: ["mul-facts", "distributive-split"] },
  "ar.mul25":   { level: 4, tier: "core",   kc: ["distributive-split", "near-multiple-of-ten"] },
  "ar.sq12":    { level: 2, tier: "onramp", kc: ["squares"] },
  "ar.sq25":    { level: 4, tier: "core",   kc: ["squares", "distributive-split"] },
  "ar.cube10":  { level: 4, tier: "core",   kc: ["cubes", "mul-facts"] },
  "ar.cube15":  { level: 4, tier: "core",   kc: ["cubes", "distributive-split"] },
  "fr.unit":    { level: 5, tier: "core",   kc: ["unit-fraction-percent", "division-by-small"] },
  "fr.simplify":{ level: 5, tier: "core",   kc: ["common-factor", "div-facts"] },
  "fr.compare": { level: 5, tier: "core",   kc: ["fraction-magnitude", "common-denominator"] },
  "fr.of":      { level: 5, tier: "core",   kc: ["division-by-small", "scale-by-numerator"] },
  "fr.add":     { level: 5, tier: "core",   kc: ["common-denominator", "add-partials", "common-factor"] },
  "fr.todec":   { level: 5, tier: "core",   kc: ["fraction-decimal", "unit-fraction-percent"] },
  "fr.fromdec": { level: 5, tier: "core",   kc: ["fraction-decimal", "common-factor"] },
  "dec.scale":  { level: 5, tier: "core",   kc: ["powers-of-ten", "decimal-shift"] },
  "dec.pct":    { level: 5, tier: "core",   kc: ["decimal-shift", "percent-anchor"] },
  "dec.round":  { level: 5, tier: "core",   kc: ["rounding"] },
  "dec.ops":    { level: 5, tier: "core",   kc: ["add-partials", "mul-facts", "decimal-shift"] },
  "fr.common":  { level: 5, tier: "core",   kc: ["unit-fraction-percent", "scale-by-numerator"] },
  "pv.zeros":   { level: 3, tier: "onramp", kc: ["powers-of-ten"] },
  "pv.word-exp":{ level: 3, tier: "onramp", kc: ["powers-of-ten", "scale-words"] },
  "exp.add":    { level: 7, tier: "core",   kc: ["exponent-add"] },
  "exp.sub":    { level: 7, tier: "core",   kc: ["exponent-subtract"] },
  "coef.mul":   { level: 2, tier: "onramp", kc: ["mul-facts"] },
  "sn.digits":  { level: 7, tier: "core",   kc: ["powers-of-ten", "normalize"] },
  "sn.words":   { level: 7, tier: "core",   kc: ["scale-words", "normalize"] },
  "sn.norm":    { level: 7, tier: "core",   kc: ["normalize", "exponent-add"] },
  "sn.mul":     { level: 7, tier: "core",   kc: ["mul-facts", "exponent-add", "normalize"] },
  "sn.div":     { level: 7, tier: "core",   kc: ["division-by-small", "exponent-subtract", "normalize"] },
  "mag.mul":    { level: 7, tier: "core",   kc: ["scale-words", "mul-facts", "exponent-add", "normalize"] },
  "mag.div":    { level: 7, tier: "core",   kc: ["scale-words", "division-by-small", "exponent-subtract"] },
  "pct.anchor": { level: 5, tier: "core",   kc: ["percent-anchor", "powers-of-ten"] },
  "pct.compose":{ level: 5, tier: "core",   kc: ["percent-anchor", "percent-compose"] },
  "pct.apply":  { level: 6, tier: "core",   kc: ["percent-compose", "percent-change"] },
  "co.pctbig":  { level: 7, tier: "combo",  kc: ["percent-anchor", "percent-compose", "scale-words", "normalize"] },
  "co.fracsci": { level: 7, tier: "combo",  kc: ["unit-fraction-percent", "division-by-small", "scale-words", "normalize"] },
  "co.chainbig":{ level: 7, tier: "combo",  kc: ["percent-change", "successive-change", "scale-words"] },
  "co.percap":  { level: 7, tier: "combo",  kc: ["division-by-small", "exponent-subtract", "normalize", "scale-words"] },
  "co.compare": { level: 7, tier: "combo",  kc: ["scale-words", "normalize", "fraction-magnitude"] },
  "co.double":  { level: 7, tier: "combo",  kc: ["rule-of-72", "division-by-small"] },
  "co.growth":  { level: 7, tier: "combo",  kc: ["percent-change", "successive-change", "rule-of-72"] },
  "co.unitprice":{ level: 6, tier: "combo", kc: ["division-by-small", "decimal-shift", "rounding"] },
  "pct.find":   { level: 6, tier: "core",   kc: ["percent-change", "ratio-to-percent"] },
  "pct.what":   { level: 6, tier: "core",   kc: ["ratio-to-percent", "unit-fraction-percent"] },
  "pct.reverse":{ level: 6, tier: "core",   kc: ["percent-reverse", "division-by-small"] },
  "pct.chain":  { level: 6, tier: "core",   kc: ["percent-change", "successive-change"] },
};

const withMeta = (skills: Omit<Skill, "level" | "tier" | "kc">[]): Skill[] => skills.map((s) => ({ ...s, ...META[s.id] }));

export const SKILLS: Skill[] = withMeta([
  // ── Arithmetic fluency ────────────────────────────────────────────────
  {
    id: "ar.mul12", family: "arithmetic", group: "Times tables", name: "0–12",
    ask: "product", prereqs: [], ccss: ["3.OA.C.7"], targetMs: 3000,
  },
  {
    id: "ar.mul20", family: "arithmetic", group: "Times tables", name: "13–20",
    ask: "product", prereqs: ["ar.mul12"], ccss: ["3.OA.C.7+"], targetMs: 5000,
  },
  {
    id: "ar.mul25", family: "arithmetic", group: "Times tables", name: "21–25",
    ask: "product", prereqs: ["ar.mul20"], ccss: ["3.OA.C.7+"], targetMs: 6000,
  },
  {
    id: "ar.sq12", family: "arithmetic", group: "Squares", name: "0–12",
    ask: "value", prereqs: [], ccss: ["8.EE.A.2"], targetMs: 3000,
  },
  {
    id: "ar.sq25", family: "arithmetic", group: "Squares", name: "13–25",
    ask: "value", prereqs: ["ar.sq12"], ccss: ["8.EE.A.2"], targetMs: 4500,
  },
  {
    id: "ar.cube10", family: "arithmetic", group: "Cubes", name: "0–10",
    ask: "value", prereqs: ["ar.sq12"], ccss: ["8.EE.A.2"], targetMs: 4000,
  },
  {
    id: "ar.cube15", family: "arithmetic", group: "Cubes", name: "11–15",
    ask: "value", prereqs: ["ar.cube10", "ar.sq25"], ccss: ["8.EE.A.2"], targetMs: 6000,
  },

  {
    id: "ar.split", family: "arithmetic", group: "Two-digit × one-digit", name: "Two-digit × one-digit",
    ask: "product", prereqs: ["ar.mul12"], ccss: ["4.NBT.B.5"], targetMs: 6000,
  },
  {
    id: "ar.short5", family: "arithmetic", group: "Shortcuts", name: "×5, ×25, ×50",
    ask: "product", prereqs: ["ar.mul12"], ccss: ["4.NBT.B.5"], targetMs: 5000,
  },
  {
    id: "ar.short11", family: "arithmetic", group: "Shortcuts", name: "×11, ×101",
    ask: "product", prereqs: ["ar.mul12"], ccss: ["4.NBT.B.5"], targetMs: 5000,
  },
  {
    id: "ar.double", family: "arithmetic", group: "Doubling & halving", name: "Doubling & halving",
    ask: "product", prereqs: ["ar.mul12"], ccss: ["4.NBT.B.5"], targetMs: 6000,
  },
  {
    id: "ar.near100", family: "arithmetic", group: "Near 100", name: "Near 100",
    ask: "product", prereqs: ["ar.mul12"], ccss: ["4.NBT.B.5"], targetMs: 6000,
  },
  {
    id: "ar.divfacts", family: "arithmetic", group: "Division", name: "Facts within tables",
    ask: "quotient", prereqs: ["ar.mul12"], ccss: ["3.OA.C.7"], targetMs: 3000,
  },
  {
    id: "ar.div1", family: "arithmetic", group: "Division", name: "By one digit",
    ask: "quotient", prereqs: ["ar.divfacts"], ccss: ["4.NBT.B.6"], targetMs: 6000,
  },
  {
    id: "ar.rem", family: "arithmetic", group: "Remainders", name: "Remainders",
    ask: "remainder", prereqs: ["ar.divfacts"], ccss: ["4.OA.B.4"], targetMs: 6000,
  },

  // ── Fractions → percents ──────────────────────────────────────────────
  {
    id: "fr.unit",
    family: "fractions",
    name: "Unit fraction → %",
    ask: "as a percent",
    prereqs: [],
    ccss: ["7.NS.A.2d", "6.RP.A.3c"],
    targetMs: 5000,
  },
  {
    id: "fr.common",
    family: "fractions",
    name: "Fraction → %",
    ask: "as a percent",
    prereqs: ["fr.unit"],
    ccss: ["7.NS.A.2d", "6.RP.A.3c"],
    targetMs: 8000,
  },

  {
    id: "fr.simplify", family: "fractions", group: "Simplest form", name: "Simplest form",
    ask: "in simplest form", prereqs: ["ar.divfacts"], ccss: ["4.NF.A.1"], targetMs: 6000,
  },
  {
    id: "fr.compare", family: "fractions", group: "Compare", name: "Compare",
    ask: "the larger one", prereqs: ["fr.unit"], ccss: ["4.NF.A.2"], targetMs: 6000,
  },
  {
    id: "fr.of", family: "fractions", group: "Fraction of a quantity", name: "Fraction of a quantity",
    ask: "value", prereqs: ["ar.divfacts", "fr.unit"], ccss: ["4.NF.B.4", "5.NF.B.4"], targetMs: 7000,
  },
  {
    id: "fr.add", family: "fractions", group: "Add & subtract", name: "Add & subtract",
    ask: "in simplest form", prereqs: ["fr.simplify"], ccss: ["4.NF.B.3", "5.NF.A.1"], targetMs: 9000,
  },
  {
    id: "fr.todec", family: "fractions", group: "Fraction ↔ decimal", name: "Fraction → decimal",
    ask: "as a decimal", prereqs: ["fr.unit"], ccss: ["4.NF.C.6", "7.NS.A.2d"], targetMs: 6000,
  },
  {
    id: "fr.fromdec", family: "fractions", group: "Fraction ↔ decimal", name: "Decimal → fraction",
    ask: "in simplest form", prereqs: ["fr.simplify", "fr.todec"], ccss: ["4.NF.C.6"], targetMs: 6000,
  },

  // ── Decimals & scaling ─────────────────────────────────────────────────
  {
    id: "dec.scale", family: "decimals", group: "×÷ by powers of ten", name: "×÷ by powers of ten",
    ask: "value", prereqs: ["pv.zeros"], ccss: ["5.NBT.A.2"], targetMs: 5000,
  },
  {
    id: "dec.pct", family: "decimals", group: "Decimal ↔ percent", name: "Decimal ↔ percent",
    ask: "convert", prereqs: ["dec.scale"], ccss: ["6.RP.A.3c"], targetMs: 4500,
  },
  {
    id: "dec.round", family: "decimals", group: "Rounding", name: "Rounding",
    ask: "rounded", prereqs: ["pv.zeros"], ccss: ["4.NBT.A.3", "5.NBT.A.4"], targetMs: 5000,
  },
  {
    id: "dec.ops", family: "decimals", group: "Decimal arithmetic", name: "Decimal arithmetic",
    ask: "value", prereqs: ["dec.scale", "ar.mul12"], ccss: ["5.NBT.B.7"], targetMs: 7000,
  },

  // ── Combinations ───────────────────────────────────────────────────────
  {
    id: "co.pctbig", family: "combo", group: "Percent of a big number", name: "Percent of a big number",
    ask: "value · within ½%", prereqs: ["pct.compose", "sn.words"], ccss: ["7.RP.A.3", "8.EE.A.3"], targetMs: 10000,
  },
  {
    id: "co.fracsci", family: "combo", group: "Fraction of a big number", name: "Fraction of a big number",
    ask: "in e-notation · within ½%", prereqs: ["fr.of", "sn.words"], ccss: ["5.NF.B.4", "8.EE.A.3"], targetMs: 10000,
  },
  {
    id: "co.chainbig", family: "combo", group: "Successive changes", name: "Successive changes",
    ask: "final amount · within ½%", prereqs: ["pct.chain", "sn.words"], ccss: ["7.RP.A.3"], targetMs: 14000,
  },
  {
    id: "co.percap", family: "combo", group: "Per capita", name: "Per capita",
    ask: "roughly · within ½ an order", prereqs: ["sn.div", "mag.div"], ccss: ["8.EE.A.4"], targetMs: 12000,
  },
  {
    id: "co.compare", family: "combo", group: "Which is bigger", name: "Which is bigger",
    ask: "type the larger, any form", prereqs: ["sn.words", "sn.digits"], ccss: ["8.EE.A.3"], targetMs: 8000,
  },
  {
    id: "co.double", family: "combo", group: "Growth", name: "Years to double",
    ask: "years · within 1", prereqs: ["ar.divfacts"], ccss: ["F-LE"], targetMs: 7000,
  },
  {
    id: "co.growth", family: "combo", group: "Growth", name: "Compound growth",
    ask: "within 2%", prereqs: ["pct.chain", "co.double"], ccss: ["7.RP.A.3", "F-LE"], targetMs: 14000,
  },
  {
    id: "co.unitprice", family: "combo", group: "Unit price", name: "Unit price",
    ask: "per unit · within ½%", prereqs: ["ar.div1", "dec.ops"], ccss: ["6.RP.A.3b"], targetMs: 9000,
  },

  // ── Place value & powers of ten ────────────────────────────────────────
  {
    id: "pv.zeros",
    family: "place-value",
    name: "Count the zeros",
    ask: "power of ten",
    prereqs: [],
    ccss: ["5.NBT.A.2"],
    targetMs: 4000,
  },
  {
    id: "pv.word-exp",
    family: "place-value",
    name: "Word → power of ten",
    ask: "exponent",
    prereqs: [],
    ccss: ["4.NBT.A.2", "5.NBT.A.2"],
    targetMs: 3500,
  },

  // ── Integer exponents ──────────────────────────────────────────────────
  {
    id: "exp.add",
    family: "exponents",
    name: "Add exponents",
    ask: "exponent of the product",
    prereqs: [],
    ccss: ["8.EE.A.1"],
    targetMs: 4000,
  },
  {
    id: "exp.sub",
    family: "exponents",
    name: "Subtract exponents",
    ask: "exponent of the quotient",
    prereqs: [],
    ccss: ["8.EE.A.1"],
    targetMs: 4000,
  },
  {
    id: "coef.mul",
    family: "exponents",
    name: "Coefficient facts",
    ask: "product",
    prereqs: [],
    ccss: ["3.OA.C.7"],
    targetMs: 3000,
  },

  // ── Scientific notation ───────────────────────────────────────────────
  {
    id: "sn.digits",
    family: "scientific",
    name: "Digits → scientific",
    ask: "as a × 10^b",
    prereqs: ["pv.zeros"],
    ccss: ["8.EE.A.3"],
    targetMs: 6000,
  },
  {
    id: "sn.words",
    family: "scientific",
    name: "Words → scientific",
    ask: "as a × 10^b",
    prereqs: ["pv.word-exp", "sn.digits"],
    ccss: ["8.EE.A.3"],
    targetMs: 6000,
  },
  {
    id: "sn.norm",
    family: "scientific",
    name: "Renormalize",
    ask: "as a × 10^b with 1 ≤ a < 10",
    prereqs: ["sn.digits", "exp.add"],
    ccss: ["8.EE.A.4"],
    targetMs: 7000,
  },
  {
    id: "sn.mul",
    family: "operations",
    name: "Multiply in scientific",
    ask: "as a × 10^b",
    prereqs: ["coef.mul", "exp.add", "sn.norm"],
    ccss: ["8.EE.A.4"],
    targetMs: 10000,
  },
  {
    id: "sn.div",
    family: "operations",
    name: "Divide in scientific",
    ask: "as a × 10^b",
    prereqs: ["exp.sub", "sn.norm"],
    ccss: ["8.EE.A.4"],
    targetMs: 10000,
  },

  // ── Magnitude estimation (the payoff) ─────────────────────────────────
  {
    id: "mag.mul",
    family: "magnitude",
    name: "Magnitude of a product",
    ask: "roughly, e-notation",
    prereqs: ["sn.words", "sn.mul"],
    ccss: ["8.EE.A.3", "8.EE.A.4"],
    targetMs: 14000,
  },
  {
    id: "mag.div",
    family: "magnitude",
    name: "Magnitude of a quotient",
    ask: "roughly, e-notation",
    prereqs: ["sn.div"],
    ccss: ["8.EE.A.3", "8.EE.A.4"],
    targetMs: 14000,
  },

  // ── Percents ──────────────────────────────────────────────────────────
  {
    id: "pct.anchor",
    family: "percents",
    name: "10% and 1% anchors",
    ask: "value",
    prereqs: [],
    ccss: ["6.RP.A.3c"],
    targetMs: 6000,
  },
  {
    id: "pct.compose",
    family: "percents",
    name: "Compose percents",
    ask: "value",
    prereqs: ["pct.anchor"],
    ccss: ["6.RP.A.3c", "7.EE.B.3"],
    targetMs: 10000,
  },
  {
    id: "pct.apply", family: "percents", group: "Apply a change", name: "Apply a change",
    ask: "new amount", prereqs: ["pct.compose"], ccss: ["7.RP.A.3"], targetMs: 9000,
  },
  {
    id: "pct.find", family: "percents", group: "Find the change", name: "Find the change",
    ask: "% change", prereqs: ["pct.compose", "fr.common"], ccss: ["7.RP.A.3"], targetMs: 9000,
  },
  {
    id: "pct.what", family: "percents", group: "What percent", name: "What percent",
    ask: "as a percent", prereqs: ["fr.common"], ccss: ["6.RP.A.3c"], targetMs: 7000,
  },
  {
    id: "pct.reverse", family: "percents", group: "Reverse percent", name: "Reverse percent",
    ask: "the whole", prereqs: ["pct.anchor", "pct.what"], ccss: ["7.RP.A.3"], targetMs: 10000,
  },
  {
    id: "pct.chain", family: "percents", group: "Chained changes", name: "Chained changes",
    ask: "final amount", prereqs: ["pct.apply"], ccss: ["7.RP.A.3"], targetMs: 14000,
  },
]);

export const SKILL_BY_ID: Record<SkillId, Skill> = Object.fromEntries(
  SKILLS.map((s) => [s.id, s]),
) as Record<SkillId, Skill>;

export const FAMILY_LABEL: Record<Family, string> = {
  arithmetic: "Multiplicative arithmetic",
  "place-value": "Powers of ten",
  exponents: "Exponent arithmetic",
  scientific: "Scientific notation",
  operations: "Operating in scientific notation",
  magnitude: "Magnitude estimation",
  combo: "Combinations",
  fractions: "Fractions",
  decimals: "Decimals & scaling",
  percents: "Percents",
};

/** One line per unit: the capability it builds. */
export const FAMILY_BLURB: Record<Family, string> = {
  arithmetic: "tables, squares, cubes, the mental shortcuts, division — the moves everything else leans on",
  "place-value": "10ⁿ and its name, both directions, instantly",
  exponents: "the two moves inside every product: add exponents, multiply leading digits",
  scientific: "see any number as a × 10ⁿ",
  operations: "combine two numbers in a × 10ⁿ form",
  magnitude: "the payoff — rough size of a real-world product or quotient",
  fractions: "fractions as percents and decimals, simplest form, comparing, a fraction of a quantity",
  decimals: "sliding the decimal point — powers of ten, percent conversions, rounding",
  combo: "the point of it all — two or three skills chained the way numbers arrive in real life",
  percents: "anchors, composition, change, reverse — the percents adults actually meet",
};

export const FAMILIES: Family[] = ["arithmetic", "fractions", "decimals", "percents", "place-value", "exponents", "scientific", "operations", "magnitude", "combo"];
export const skillsIn = (f: Family) => SKILLS.filter((s) => s.family === f);
/** Subsections of a unit, in order, each with its band skills. */
export const groupsIn = (f: Family): { group: string; skills: Skill[] }[] => {
  const out: { group: string; skills: Skill[] }[] = [];
  for (const s of skillsIn(f)) {
    const g = s.group ?? s.name;
    const e = out.find((x) => x.group === g);
    if (e) e.skills.push(s); else out.push({ group: g, skills: [s] });
  }
  return out;
};
/** Old skill ids → new (state migration). */
export const LEGACY_SKILL: Record<string, SkillId> = { "ar.sq": "ar.sq12", "ar.cube": "ar.cube10" };
