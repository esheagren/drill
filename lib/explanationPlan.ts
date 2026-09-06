/** Sandbox explanations: one mathematical plan supplies both words and geometry.
 * No trainer routing or learner state depends on this module.
 */
import { fmt, quantity, promptFor, validateValues, type Candidate, type ProblemFamily, type Values } from "../content/designspace/problems";

export type Tone = "focus" | "context" | "remove";
export interface Part { value: number; label?: string; tone: Tone }
export type Diagram =
  | { kind: "bar"; caption: string; rows: { label: string; parts: Part[] }[] }
  | { kind: "area"; caption: string; height: number; parts: Part[] }
  | { kind: "line"; caption: string; max: number; ticks: { value: number; label: string }[]; from?: number; to?: number };
export interface ExplanationStep { text: string; diagram: Diagram }
export interface ExplanationPlan { prompt: string; answer: string; result: number; steps: ExplanationStep[] }
const part = (value: number, label = "", tone: Tone = "focus"): Part => ({ value, label, tone });
const bar = (caption: string, rows: { label: string; parts: Part[] }[]): Diagram => ({ kind: "bar", caption, rows });
const partition = (n: number, selected: number, unit: number) => Array.from({ length: n }, (_, i) => part(unit, "", i < selected ? "focus" : "context"));
const line = (caption: string, max: number, ticks: {value:number;label:string}[], from?: number, to?: number): Diagram => ({ kind: "line", caption, max, ticks, from, to });
const tick = (value: number, label = quantity(value)) => ({ value, label });

export function explanationPlan(p: ProblemFamily, candidate: Candidate, values: Values): ExplanationPlan {
  const error = validateValues(p, values);
  if (error) throw new Error(error);
  if (!p.candidates.some((c) => c.id === candidate.id)) throw new Error("Candidate does not belong to this problem family.");
  const [a,b,c] = values;
  const mode = candidate.id;
  let result = 0, answer = "";
  const steps: ExplanationStep[] = [];
  const step = (text: string, diagram: Diagram) => steps.push({ text, diagram });
  switch (p.id) {
    case "split": {
      result = a*b;
      if (mode === "tens") {
        const tens = Math.floor(a/10)*10, ones = a-tens;
        const d: Diagram = { kind: "area", caption: `${a} wide × ${b} high; split ${tens}${ones ? ` + ${ones}` : ""}.`, height: b, parts: [part(tens, `${tens} × ${b} = ${tens*b}`), ...(ones ? [part(ones, `${ones} × ${b} = ${ones*b}`, "context")] : [])] };
        step(`${tens} × ${b} is ${fmt(tens*b)}.`, d);
        if (ones) step(`${ones} more ${b}s is ${ones*b}.`, d);
        step(`${fmt(tens*b)}${ones ? ` + ${ones*b}` : ""} = ${fmt(result)}.`, d);
      } else {
        const first = Math.floor(b/2), rest = b-first;
        const d = bar(`${b} equal groups; each group is ${a}.`, [{ label: `${b} groups of ${a}`, parts: Array.from({length:b}, (_,i) => part(a, "", i < first ? "focus" : "context")) }]);
        step(`${first} groups of ${a} is ${fmt(first*a)}.`, d);
        step(`${rest} more groups is ${fmt(rest*a)}. Together: ${fmt(result)}.`, d);
      }
      break;
    }
    case "compensate": {
      result = a*b; const delta = a-100, correction = Math.abs(delta*b), benchmark = 100*b;
      const d: Diagram = mode === "area" ? { kind: "area", height:b, caption: `${a < 100 ? "Remove" : a > 100 ? "Add" : "Keep"} ${Math.abs(delta)} × ${b}${delta ? ` = ${correction}` : ""}.`, parts: delta < 0 ? [part(a, `${a} × ${b}`), part(-delta, `−${-delta} × ${b} = −${correction}`, "remove")] : [part(100, `100 × ${b} = ${benchmark}`), ...(delta ? [part(delta, `+${delta} × ${b} = +${correction}`, "context")] : [])] } : line(`Start at ${benchmark}${delta ? `; ${delta < 0 ? "subtract" : "add"} ${correction}` : "; no correction needed"}.`, Math.max(result,benchmark)*1.05, [tick(0), tick(benchmark), ...(delta ? [tick(result)] : [])], benchmark, result);
      step(`100 × ${b} is ${fmt(benchmark)}.`, d);
      step(delta ? `${delta < 0 ? "Take away" : "Add"} ${Math.abs(delta)} × ${b}: ${fmt(benchmark)} ${delta < 0 ? "−" : "+"} ${correction} = ${fmt(result)}.` : `No correction: ${fmt(result)}.`, d);
      break;
    }
    case "division": {
      const q = Math.floor(a/b), r=a%b; result=q; answer = `${q}${r ? ` remainder ${r}` : ""}`;
      const d = mode === "groups" ? bar(`${q} full groups of ${b}${r ? `; ${r} left over` : "; nothing left over"}.`, [{ label: `Total ${a}`, parts:[...partition(q,q,b), ...(r ? [part(r,"", "context")] : [])] }]) : line(`The last full multiple is ${q*b}; remainder ${r}.`, a, [tick(0), tick(q*b), ...(r ? [tick(a)] : [])], q*b, a);
      step(`${q} groups of ${b} use ${q*b}.`, d);
      step(r ? `${a} − ${q*b} = ${r} left. ${answer}.` : `All ${a} fit: ${q} groups.`, d);
      break;
    }
    case "fraction-of": {
      const unit=c/b; result=unit*a;
      const d = mode === "parts" ? bar(`Whole ${c}; ${b} equal parts; each is ${quantity(unit)}.`, [{ label:`${a} of ${b} parts`, parts:partition(b,a,unit) }]) : line(`Whole ${c}; each step is ${quantity(unit)}.`, c, Array.from({length:b+1},(_,i)=>tick(i*unit, i===0 || i===a || i===b ? quantity(i*unit) : "")), 0, result);
      step(`One of ${b} equal parts is ${c} ÷ ${b}: ${quantity(unit)}.`, d);
      step(`Take ${a} parts: ${a} × (${c} ÷ ${b}) = ${quantity(result)}.`, d);
      break;
    }
    case "equivalence": {
      result=a/b; answer=`${a*c}/${b*c}`;
      const d = mode === "bar" ? bar("Both bars represent the same whole: 1.", [{label:`${a}/${b}`,parts:partition(b,a,1/b)}, {label:answer,parts:partition(b*c,a*c,1/(b*c))}]) : line("Two fraction names; the same position. Whole = 1.", 1, [tick(0), tick(a/b, a===b ? `${a}/${b} = ${answer} = 1` : `${a}/${b} = ${answer}`), ...(a===b ? [] : [tick(1)])]);
      step(`Split every part into ${c} equal pieces.`, d);
      step(`${a} selected parts become ${a*c}; ${b} total parts become ${b*c}. ${a}/${b} = ${answer}.`, d);
      break;
    }
    case "percent-of": {
      result=a/100*b; const anchor=mode==="ten" ? 10 : 1, unit=anchor/100*b;
      const d = bar(`Whole ${b} = 100%. Both rows use the same scale.`, [{label:`${anchor}% = ${quantity(unit)}`,parts:[part(unit),part(b-unit,"","context")]},{label:`${a}% = ${quantity(result)}`,parts:[part(result), ...(a<100 ? [part(b-result,"","context")] : [])]}]);
      step(`${anchor}% of ${b} is ${quantity(unit)}.`, d);
      step(`${a}% is ${quantity(a/anchor)} ${anchor===10 ? "tenths" : "hundredths"}: ${quantity(result)}.`, d);
      break;
    }
    case "reverse-percent": {
      const remain=100-a; result=b/(remain/100);
      const d = bar(`Original whole = ${quantity(result)} = 100%. Hatched part: ${a}% discount.`, [{label:`${remain}% is ${b}`,parts:[part(b),part(result-b,"","remove")]}]);
      step(`${b} is ${remain}% of the original.`, d);
      if (mode==="unit") step(`1% is ${b} ÷ ${remain}: ${quantity(b/remain)}.`, d);
      step(mode==="unit" ? `100 of those: ${quantity(result)}.` : `${b} ÷ ${fmt(remain/100)} = ${quantity(result)}.`, d);
      break;
    }
    case "successive-percent": {
      const added=c*a/100, next=c+added, removed=next*b/100; result=next-removed;
      const d = bar("Same amount scale in every row. The decrease uses the increased whole.", [{label:`Start ${c}`,parts:[part(c,"","context")]}, {label:`After increase ${quantity(next)}`,parts:[part(c,"","context"),part(added)]},{label:`Keep ${quantity(result)}; remove ${quantity(removed)}`,parts:[part(result),part(removed,"","remove")]}]);
      step(mode==="amounts" ? `${a}% of ${c} is ${quantity(added)}. Add it: ${quantity(next)}.` : `${c} × ${fmt(1+a/100)} = ${quantity(next)}.`, d);
      step(mode==="amounts" ? `${b}% of ${quantity(next)} is ${quantity(removed)}. Take it off: ${quantity(result)}.` : `Use the new whole: ${quantity(next)} × ${fmt(1-b/100)} = ${quantity(result)}.`, d);
      break;
    }
  }
  return { prompt:promptFor(p.id,values), result, answer:answer || quantity(result), steps };
}
