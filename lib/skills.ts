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
  | "ar.mul20"
  | "ar.sq"
  | "ar.cube"
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

export interface Skill {
  id: SkillId;
  family: Family;
  name: string;
  /** One line shown under the prompt so the learner knows what is being asked. */
  ask: string;
  prereqs: SkillId[];
  ccss: string[];
  targetMs: number;
}

export const SKILLS: Skill[] = [
  // ── Arithmetic fluency ────────────────────────────────────────────────
  {
    id: "ar.mul20",
    family: "arithmetic",
    name: "Times tables to 20",
    ask: "product",
    prereqs: [],
    ccss: ["3.OA.C.7+"],
    targetMs: 3000,
  },
  {
    id: "ar.sq",
    family: "arithmetic",
    name: "Squares to 25",
    ask: "value",
    prereqs: [],
    ccss: ["8.EE.A.2"],
    targetMs: 2500,
  },
  {
    id: "ar.cube",
    family: "arithmetic",
    name: "Cubes to 15",
    ask: "value",
    prereqs: ["ar.sq"],
    ccss: ["8.EE.A.2"],
    targetMs: 3500,
  },

  // ── Fractions → percents ──────────────────────────────────────────────
  {
    id: "fr.unit",
    family: "fractions",
    name: "Unit fraction → %",
    ask: "as a percent",
    prereqs: [],
    ccss: ["7.NS.A.2d", "6.RP.A.3c"],
    targetMs: 3000,
  },
  {
    id: "fr.common",
    family: "fractions",
    name: "Fraction → %",
    ask: "as a percent",
    prereqs: ["fr.unit"],
    ccss: ["7.NS.A.2d", "6.RP.A.3c"],
    targetMs: 5000,
  },

  // ── Place value & powers of ten ────────────────────────────────────────
  {
    id: "pv.zeros",
    family: "place-value",
    name: "Count the zeros",
    ask: "power of ten",
    prereqs: [],
    ccss: ["5.NBT.A.2"],
    targetMs: 2500,
  },
  {
    id: "pv.word-exp",
    family: "place-value",
    name: "Word → power of ten",
    ask: "exponent",
    prereqs: [],
    ccss: ["4.NBT.A.2", "5.NBT.A.2"],
    targetMs: 2000,
  },

  // ── Integer exponents ──────────────────────────────────────────────────
  {
    id: "exp.add",
    family: "exponents",
    name: "Add exponents",
    ask: "exponent of the product",
    prereqs: [],
    ccss: ["8.EE.A.1"],
    targetMs: 2500,
  },
  {
    id: "exp.sub",
    family: "exponents",
    name: "Subtract exponents",
    ask: "exponent of the quotient",
    prereqs: [],
    ccss: ["8.EE.A.1"],
    targetMs: 2500,
  },
  {
    id: "coef.mul",
    family: "exponents",
    name: "Coefficient facts",
    ask: "product",
    prereqs: [],
    ccss: ["3.OA.C.7"],
    targetMs: 2000,
  },

  // ── Scientific notation ───────────────────────────────────────────────
  {
    id: "sn.digits",
    family: "scientific",
    name: "Digits → scientific",
    ask: "as a × 10^b",
    prereqs: ["pv.zeros"],
    ccss: ["8.EE.A.3"],
    targetMs: 4000,
  },
  {
    id: "sn.words",
    family: "scientific",
    name: "Words → scientific",
    ask: "as a × 10^b",
    prereqs: ["pv.word-exp", "sn.digits"],
    ccss: ["8.EE.A.3"],
    targetMs: 4000,
  },
  {
    id: "sn.norm",
    family: "scientific",
    name: "Renormalize",
    ask: "as a × 10^b with 1 ≤ a < 10",
    prereqs: ["sn.digits", "exp.add"],
    ccss: ["8.EE.A.4"],
    targetMs: 4000,
  },
  {
    id: "sn.mul",
    family: "operations",
    name: "Multiply in scientific",
    ask: "as a × 10^b",
    prereqs: ["coef.mul", "exp.add", "sn.norm"],
    ccss: ["8.EE.A.4"],
    targetMs: 6000,
  },
  {
    id: "sn.div",
    family: "operations",
    name: "Divide in scientific",
    ask: "as a × 10^b",
    prereqs: ["exp.sub", "sn.norm"],
    ccss: ["8.EE.A.4"],
    targetMs: 6000,
  },

  // ── Magnitude estimation (the payoff) ─────────────────────────────────
  {
    id: "mag.mul",
    family: "magnitude",
    name: "Magnitude of a product",
    ask: "roughly, e-notation",
    prereqs: ["sn.words", "sn.mul"],
    ccss: ["8.EE.A.3", "8.EE.A.4"],
    targetMs: 8000,
  },
  {
    id: "mag.div",
    family: "magnitude",
    name: "Magnitude of a quotient",
    ask: "roughly, e-notation",
    prereqs: ["sn.div"],
    ccss: ["8.EE.A.3", "8.EE.A.4"],
    targetMs: 8000,
  },

  // ── Percents ──────────────────────────────────────────────────────────
  {
    id: "pct.anchor",
    family: "percents",
    name: "10% and 1% anchors",
    ask: "value",
    prereqs: [],
    ccss: ["6.RP.A.3c"],
    targetMs: 3000,
  },
  {
    id: "pct.compose",
    family: "percents",
    name: "Compose percents",
    ask: "value",
    prereqs: ["pct.anchor"],
    ccss: ["6.RP.A.3c", "7.EE.B.3"],
    targetMs: 5000,
  },
];

export const SKILL_BY_ID: Record<SkillId, Skill> = Object.fromEntries(
  SKILLS.map((s) => [s.id, s]),
) as Record<SkillId, Skill>;

export const FAMILY_LABEL: Record<Family, string> = {
  arithmetic: "Arithmetic",
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
  arithmetic: "tables to 20×20, squares, cubes — the raw facts everything else leans on",
  "place-value": "10ⁿ and its name, both directions, instantly",
  exponents: "the two moves inside every product: add exponents, multiply leading digits",
  scientific: "see any number as a × 10ⁿ",
  operations: "combine two numbers in a × 10ⁿ form",
  magnitude: "the payoff — rough size of a real-world product or quotient",
  fractions: "1/12 is 8.3% — fractions as percents, on sight",
  percents: "anchors and composition",
};

export const FAMILIES: Family[] = ["arithmetic", "place-value", "exponents", "scientific", "operations", "magnitude", "fractions", "percents"];
export const skillsIn = (f: Family) => SKILLS.filter((s) => s.family === f);
