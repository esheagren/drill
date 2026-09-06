/** Developer-facing problem taxonomy. Handles are stable; examples can evolve. */
import type { WidgetKey } from "./widgets";

export type ProblemId = "split" | "compensate" | "division" | "fraction-of" | "equivalence" | "percent-of" | "reverse-percent" | "successive-percent";
export type Values = [number, number, number];
export interface Candidate { id: string; name: string; move: string; widget: WidgetKey; prerequisite: string; limitation: string }
export interface Example { id: string; values: Values; role: "anchor" | "transfer" | "boundary" }
export interface ProblemFamily {
  id: ProblemId; name: string; concept: string; structure: string; skills: string[];
  possibleError: string; insight: string; check: string;
  fields: { label: string; min: number; max: number }[];
  examples: Example[]; candidates: Candidate[];
}
const ex = (id: string, values: Values, role: Example["role"] = "transfer"): Example => ({ id, values, role });
export const PROBLEMS: ProblemFamily[] = [
  { id: "split", name: "Split a product", concept: "Distributivity", structure: "Two factors are known; find the product by decomposing one factor.", skills: ["ar.split", "ar.mul20"], possibleError: "A partial product may have been omitted or added incorrectly.", insight: "Every piece has the same height; the pieces add to the original area.", check: "Can the learner choose a useful split in a new product?",
    fields: [{ label: "Factor", min: 12, max: 99 }, { label: "Groups", min: 2, max: 12 }], examples: [ex("anchor", [47,6,0], "anchor"), ex("transfer", [34,8,0]), ex("round", [40,7,0], "boundary")],
    candidates: [
      { id: "tens", name: "Split at the tens", move: "Separate the tens and ones, then add the partial products.", widget: "array", prerequisite: "Read each side as a factor.", limitation: "An exact multiple of ten needs no second piece." },
      { id: "groups", name: "Build equal groups", move: "Build the groups in two batches, then combine them.", widget: "bar", prerequisite: "Equal lengths represent equal quantities.", limitation: "Shows repeated groups; does not show two-dimensional area." },
    ] },
  { id: "compensate", name: "Multiply near 100", concept: "Distributivity and compensation", structure: "One factor is close to 100; use 100 as a benchmark.", skills: ["ar.near100"], possibleError: "The correction may be applied once instead of once per group.", insight: "Two fewer in every group means removing two times the number of groups.", check: "Does the learner reverse the correction when the factor is above 100?",
    fields: [{ label: "Near 100", min: 90, max: 110 }, { label: "Groups", min: 2, max: 12 }], examples: [ex("anchor", [98,7,0], "anchor"), ex("transfer", [97,6,0]), ex("above", [102,8,0], "boundary")],
    candidates: [
      { id: "area", name: "Correct the rectangle", move: "Start with a hundred-wide rectangle; remove or add a strip.", widget: "array", prerequisite: "Area represents a product.", limitation: "Small correction strips need labels outside the shape." },
      { id: "line", name: "Correct the total", move: "Locate the benchmark product, then jump by the correction.", widget: "line", prerequisite: "Distance on this linear scale represents an additive difference.", limitation: "The line shows the correction; the sentence must explain its size." },
    ] },
  { id: "division", name: "Divide into groups", concept: "Division as a missing factor", structure: "A total and group size are known; find full groups and any remainder.", skills: ["ar.divfacts", "ar.div1", "ar.rem"], possibleError: "A remainder may be counted as another complete group.", insight: "The full groups plus the leftover reconstruct the starting total.", check: "Can the learner verify divisor × quotient + remainder = total?",
    fields: [{ label: "Total", min: 12, max: 100 }, { label: "Group size", min: 2, max: 12 }], examples: [ex("anchor", [95,7,0], "anchor"), ex("transfer", [38,6,0]), ex("exact", [42,7,0], "boundary")],
    candidates: [
      { id: "groups", name: "Pack equal groups", move: "Partition the total into complete groups and a leftover.", widget: "bar", prerequisite: "A segment represents one group of the labeled size.", limitation: "Explains grouping division, not equal sharing among a known number of people." },
      { id: "line", name: "Find the last full multiple", move: "Locate the greatest multiple that fits, then measure the remainder.", widget: "line", prerequisite: "Multiples of the divisor.", limitation: "Does not unpack how the quotient was found." },
    ] },
  { id: "fraction-of", name: "Take a fraction of a quantity", concept: "Unit fractions and scaling", structure: "A whole and a fraction are known; find the selected quantity.", skills: ["fr.of", "co.fracsci"], possibleError: "The whole may be divided by the numerator instead of the denominator.", insight: "The denominator sets the size of one part; the numerator counts those parts.", check: "Can the learner name one part before calculating the selected total?",
    fields: [{ label: "Numerator", min: 1, max: 12 }, { label: "Denominator", min: 2, max: 12 }, { label: "Whole", min: 1, max: 1000 }], examples: [ex("anchor", [3,8,24], "anchor"), ex("transfer", [2,5,30]), ex("whole", [4,4,20], "boundary")],
    candidates: [
      { id: "parts", name: "Find one part", move: "Partition the whole, label one part, then select the numerator's parts.", widget: "bar", prerequisite: "Equal parts refer to the same whole.", limitation: "This prototype covers proper fractions and one whole." },
      { id: "line", name: "Count unit-fraction steps", move: "Walk from zero in steps of one denominator-sized part.", widget: "line", prerequisite: "Fractions as distances and numbers.", limitation: "Dense tick labels require fewer explicit labels on a phone." },
    ] },
  { id: "equivalence", name: "Rename a fraction", concept: "Equivalence preserves quantity", structure: "A fraction and a refinement factor are known; rename the same amount.", skills: ["fr.simplify", "fr.compare"], possibleError: "Only the numerator or denominator may be multiplied.", insight: "Every part is subdivided equally; the selected length stays the same.", check: "Can the learner explain why more selected pieces need not mean more quantity?",
    fields: [{ label: "Numerator", min: 1, max: 12 }, { label: "Denominator", min: 2, max: 12 }, { label: "Split each part into", min: 2, max: 4 }], examples: [ex("anchor", [3,8,2], "anchor"), ex("transfer", [2,3,3]), ex("whole", [4,4,2], "boundary")],
    candidates: [
      { id: "bar", name: "Repartition the bar", move: "Compare the original and refined partitions of the same whole.", widget: "bar", prerequisite: "The same whole has the same length in both rows.", limitation: "At fine partitions, labels carry the piece counts." },
      { id: "line", name: "Keep the same position", move: "Place both fraction names at one point on a zero-to-one line.", widget: "line", prerequisite: "A fraction has a position on a number line.", limitation: "Shows equal magnitude more directly than the act of subdivision." },
    ] },
  { id: "percent-of", name: "Find a percent of a quantity", concept: "Percent as parts per hundred", structure: "The whole and rate are known; find the part.", skills: ["pct.anchor", "pct.compose", "co.pctbig"], possibleError: "The percent number may be treated as an absolute amount.", insight: "The percent and amount describe the same selected part of an explicit whole.", check: "Can the learner reuse the method when the whole changes?",
    fields: [{ label: "Percent", min: 1, max: 100 }, { label: "Whole", min: 1, max: 1000 }], examples: [ex("anchor", [15,80,0], "anchor"), ex("transfer", [25,60,0]), ex("all", [100,35,0], "boundary")],
    candidates: [
      { id: "ten", name: "Use ten percent", move: "Find one tenth; scale that amount to the requested percent.", widget: "bar", prerequisite: "Ten percent is one tenth; fractional multiples when needed.", limitation: "A fractional number of tenths may be less convenient than another anchor." },
      { id: "one", name: "Use one percent", move: "Find one hundredth; take the requested number of hundredths.", widget: "bar", prerequisite: "One percent is one hundredth.", limitation: "Conceptually general, but not always the fastest mental calculation." },
    ] },
  { id: "reverse-percent", name: "Recover the original whole", concept: "Inverse proportional reasoning", structure: "A discounted amount and discount rate are known; recover the original.", skills: ["pct.reverse"], possibleError: "Adding the discount percent to the reduced amount uses the wrong whole.", insight: "The given amount is the remaining percent of the original, not 100%.", check: "Does the learner identify what 100% refers to before calculating?",
    fields: [{ label: "Discount percent", min: 1, max: 90 }, { label: "After discount", min: 1, max: 1000 }], examples: [ex("anchor", [20,160,0], "anchor"), ex("transfer", [25,90,0]), ex("half", [50,35,0], "boundary")],
    candidates: [
      { id: "unit", name: "Recover one percent", move: "Label the given part, recover one percent, then reconstruct the whole.", widget: "bar", prerequisite: "Percent refers to the original whole.", limitation: "The intermediate one-percent amount can be awkward." },
      { id: "scale", name: "Scale to the whole", move: "Scale the remaining fraction of the bar directly to 100%.", widget: "bar", prerequisite: "Division by a decimal proportion.", limitation: "Compact, but depends on understanding the divisor as the remaining fraction." },
    ] },
  { id: "successive-percent", name: "Apply successive percent changes", concept: "Changing the reference whole", structure: "Apply an increase, then a decrease to the updated amount.", skills: ["pct.chain", "co.chainbig"], possibleError: "The rates may be subtracted as if they had the same reference whole.", insight: "The second percent uses the updated amount as its whole.", check: "Can the learner explain why equal increase and decrease rates do not cancel?",
    fields: [{ label: "Increase percent", min: 1, max: 100 }, { label: "Decrease percent", min: 1, max: 90 }, { label: "Start", min: 1, max: 1000 }], examples: [ex("anchor", [20,20,100], "anchor"), ex("transfer", [30,10,200]), ex("return", [25,20,80], "boundary")],
    candidates: [
      { id: "amounts", name: "Show each change amount", move: "Show the added amount, then the amount removed from the new whole.", widget: "bar", prerequisite: "Percent of a quantity.", limitation: "Requires a consistent absolute scale across rows." },
      { id: "factors", name: "Scale twice", move: "Express each new whole as a multiplier of the preceding whole.", widget: "bar", prerequisite: "Percent changes as multipliers.", limitation: "The factor notation needs an introduction for an unfamiliar learner." },
    ] },
];

export const problemById = (id: string) => PROBLEMS.find((p) => p.id === id);
export const problemHandle = (p: ProblemFamily) => `P-${p.id}`;
export const explanationHandle = (p: ProblemFamily, c: Candidate) => `E-${p.id}/${c.id}`;
export const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 3 });
export const quantity = (n: number) => `${Math.abs(n - Math.round(n * 1000) / 1000) > 1e-8 ? "≈ " : ""}${fmt(n)}`;
export function validateValues(p: ProblemFamily, v: Values): string | null {
  if (v.length !== 3 || !v.every(Number.isFinite)) return "Enter finite numeric values.";
  for (let i = 0; i < p.fields.length; i++) {
    const f = p.fields[i];
    if (!Number.isInteger(v[i]) || v[i] < f.min || v[i] > f.max) return `${f.label}: enter a whole number from ${f.min} to ${f.max}.`;
  }
  if ((p.id === "fraction-of" || p.id === "equivalence") && v[0] > v[1]) return "This prototype covers fractions up to one whole; the numerator must not exceed the denominator.";
  return null;
}
export function promptFor(id: ProblemId, [a,b,c]: Values): string {
  switch (id) {
    case "split": case "compensate": return `${a} × ${b}`;
    case "division": return `${a} ÷ ${b}`;
    case "fraction-of": return `${a}/${b} of ${fmt(c)}`;
    case "equivalence": return `${a}/${b} = ?/${b*c}`;
    case "percent-of": return `${a}% of ${fmt(b)}`;
    case "reverse-percent": return `After ${a}% off: ${fmt(b)}. What was the original?`;
    case "successive-percent": return `${fmt(c)} up ${a}%, then down ${b}%`;
  }
}

export const REPRESENTATION_RULES: Record<WidgetKey, { meaning: string; rules: string[]; avoid: string }> = {
  bar: { meaning: "Length represents quantity relative to an explicitly named whole.", rules: ["Label the reference whole.", "Use a shared scale across compared rows.", "Equal parts of the same whole have equal lengths.", "Use labels or hatching as well as color."], avoid: "Do not make different wholes look equal without explicitly changing the scale." },
  array: { meaning: "Side lengths are factors; area is their product.", rules: ["Keep the height unchanged when splitting a factor.", "Account for every piece exactly once.", "Show removed pieces with hatching and a minus label.", "Keep labels outside narrow pieces."], avoid: "Do not accompany compensation words with an unrelated tens-and-ones split." },
  line: { meaning: "Position represents a value; distance represents an additive difference on these linear lines.", rules: ["State the endpoints and unit.", "Place values proportionally.", "Make the direction of a correction explicit.", "A fraction can share a position with an equivalent fraction."], avoid: "Do not silently switch to a logarithmic scale; equal log distances mean equal ratios." },
};
