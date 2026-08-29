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

export type Family = "arithmetic" | "place-value" | "exponents" | "scientific" | "operations" | "magnitude" | "fractions" | "percents";

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
  "ar.mul20":   { level: 4, tier: "core",   kc: ["mul-facts", "distributive-split"] },
  "ar.mul25":   { level: 4, tier: "core",   kc: ["distributive-split", "near-multiple-of-ten"] },
  "ar.sq12":    { level: 2, tier: "onramp", kc: ["squares"] },
  "ar.sq25":    { level: 4, tier: "core",   kc: ["squares", "distributive-split"] },
  "ar.cube10":  { level: 4, tier: "core",   kc: ["cubes", "mul-facts"] },
  "ar.cube15":  { level: 4, tier: "core",   kc: ["cubes", "distributive-split"] },
  "fr.unit":    { level: 5, tier: "core",   kc: ["unit-fraction-percent", "division-by-small"] },
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
  fractions: "Fractions → percents",
  percents: "Percents",
};

/** One line per unit: the capability it builds. */
export const FAMILY_BLURB: Record<Family, string> = {
  arithmetic: "times tables, squares, cubes — the raw facts everything else leans on",
  "place-value": "10ⁿ and its name, both directions, instantly",
  exponents: "the two moves inside every product: add exponents, multiply leading digits",
  scientific: "see any number as a × 10ⁿ",
  operations: "combine two numbers in a × 10ⁿ form",
  magnitude: "the payoff — rough size of a real-world product or quotient",
  fractions: "1/12 is 8.3% — fractions as percents, on sight",
  percents: "anchors, composition, change, reverse — the percents adults actually meet",
};

export const FAMILIES: Family[] = ["arithmetic", "fractions", "place-value", "exponents", "scientific", "operations", "magnitude", "percents"];
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
