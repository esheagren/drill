/**
 * Decisions — the design, decomposed. Each decision is one or two axes of
 * options; a *version* is one option per axis. Options are layers on a 390×844
 * frame, so any set of choices composes into whole screens: the version at the
 * top of the page, and every thumbnail is that version with one option swapped.
 */
import type { ReactNode } from "react";

export const W = 390, H = 844;

export type Step = "Answering" | "Miss" | "Summary";
export const STEPS: { id: Step; name: string; what: string; live: string }[] = [
  { id: "Answering", name: "Answering", what: "the item, the time, the keys", live: "/?demo=default" },
  { id: "Miss", name: "Miss", what: "what a wrong answer gets", live: "/?demo=wrong&skill=ar.split" },
  { id: "Summary", name: "Summary", what: "how a session ends", live: "/?demo=summary" },
];

export interface Option {
  id: string; name: string; note: string; current?: boolean;
  /** positioned content for the step's frame (Answering, Summary) */
  layer?: ReactNode;
  /** Miss · voice: the words, at a size */
  lines?: (size: number) => ReactNode;
  /** Miss · placement: the whole screen composed around a voice */
  compose?: (voice: Option) => ReactNode;
}
export interface Axis { id: string; name: string; options: Option[] }
export interface Decision { id: string; name: string; step: Step; question: string; requirements: string[]; axes: Axis[] }

// ── frame + primitives ──────────────────────────────────────────────────────
export const Frame = ({ children, bg = "bg-black", className = "" }: { children: ReactNode; bg?: string; className?: string }) => <div className={`w-[390px] h-[844px] ${bg} text-gray-100 relative overflow-hidden ${className}`}>{children}</div>;
const Serif = { fontFamily: "Georgia, 'Times New Roman', serif" } as const;
const Mono = { fontFamily: "ui-monospace, Menlo, monospace" } as const;
const Key = ({ k, span = 1, rows = 1, dark = false, wide = false }: { k: string; span?: number; rows?: number; dark?: boolean; wide?: boolean }) => (
  <div className={`rounded-2xl flex items-center justify-center font-light ${dark ? "bg-gray-100 text-black" : "bg-[#141826] text-gray-100"} ${wide ? "text-[18px]" : "text-[24px]"}`} style={{ gridColumn: `span ${span}`, gridRow: `span ${rows}`, minHeight: 56 }}>{k}</div>
);
const Cursor = () => <span className="text-gray-600">|</span>;

// ── Question: how the item is presented (Answering) ─────────────────────────
const QUESTION: Option[] = [
  { id: "current", name: "Centred, with a sub-line", note: "36px light, the skill's ask beneath, the answer on a rule below — what is live", current: true, layer: <><div className="absolute inset-x-6 top-[232px] text-center"><div className="text-[36px] font-light tracking-tight leading-tight">47 × 6</div><div className="text-[14px] text-gray-500 mt-2">multiply</div></div><div className="absolute inset-x-6 top-[326px] text-center text-[30px] font-light tabular-nums border-b-2 border-gray-800 pb-3">28</div></> },
  { id: "top-left", name: "Top left, small", note: "the question as a caption, like the feedback state — no reflow between states", layer: <><div className="absolute left-8 top-[60px] text-[26px]" style={Serif}>47 × 6</div><div className="absolute inset-x-0 top-[300px] text-center text-[44px] font-light text-gray-300 tabular-nums">28<Cursor /></div></> },
  { id: "center-light", name: "Centred, nothing else", note: "44px light, dead centre of the space above the keys; the answer takes its place as you type", layer: <div className="absolute inset-x-0 top-[200px] text-center"><div className="text-[44px] font-light">47 × 6</div><div className="text-[44px] font-light text-gray-300 mt-10 tabular-nums">28<Cursor /></div></div> },
  { id: "center-serif", name: "Centred, serif", note: "the same, in the tutor's serif — one voice throughout", layer: <div className="absolute inset-x-0 top-[200px] text-center" style={Serif}><div className="text-[46px]">47 × 6</div><div className="text-[44px] text-gray-300 mt-10 tabular-nums">28<Cursor /></div></div> },
  { id: "huge", name: "Huge", note: "the number fills the width; readable from across the room", layer: <div className="absolute inset-x-0 top-[180px] text-center"><div className="text-[96px] font-light tracking-tight leading-none">47×6</div><div className="text-[44px] font-light text-gray-300 mt-8 tabular-nums">28<Cursor /></div></div> },
  { id: "answer-rule", name: "With an answer rule", note: "a hairline under the question says 'type here' without a placeholder", layer: <div className="absolute inset-x-0 top-[210px] text-center"><div className="text-[44px] font-light">47 × 6</div><div className="mt-10 mx-auto w-[160px] border-b border-gray-700 text-[36px] font-light text-gray-300 pb-1 tabular-nums">28</div></div> },
];

// ── Timer: where time lives (Answering) ─────────────────────────────────────
const TIMER: Option[] = [
  { id: "current", name: "Top centre clock", note: "m:ss in the header, tap to change length; freezes on submit — what is live", current: true, layer: <><div className="absolute top-[44px] inset-x-0 text-center text-[16px] tabular-nums text-gray-100">6:25</div><div className="absolute top-[42px] right-5 text-[14px] text-gray-500">▦</div></> },
  { id: "faint-corner", name: "Faint corner", note: "6:25 top-right at 30% — present if you look", layer: <div className="absolute top-12 right-8 text-[13px] text-gray-700 tabular-nums">6:25</div> },
  { id: "progress-line", name: "A line across the top", note: "the session as a thin bar draining left to right; no digits", layer: <div className="absolute top-0 left-0 h-[3px] bg-emerald-500" style={{ width: "62%" }} /> },
  { id: "pace-dot", name: "Pace dot per item", note: "one dot that fills at your target pace for this item; the session length is not shown at all", layer: <div className="absolute top-[470px] inset-x-0 flex justify-center"><div className="w-[10px] h-[10px] rounded-full border border-gray-600" style={{ background: "conic-gradient(#10b981 0 140deg, transparent 140deg)" }} /></div> },
  { id: "none", name: "None", note: "nothing on screen; the session simply ends when it ends", layer: null },
  { id: "summary-only", name: "Only at the summary", note: "no live time; the summary reports the minutes", layer: null },
];

// ── Keypad: how input is organized (Answering) ──────────────────────────────
const KEYPAD: Option[] = [
  { id: "current", name: "4 columns + / row", note: "digits · . 0 e · a full-width / on a fifth row · ⌫ and ↵ on the right — what is live", current: true, layer: <div className="absolute bottom-0 inset-x-0 px-3 pb-3 pt-2 grid grid-cols-4 gap-2"><Key k="1" /><Key k="2" /><Key k="3" /><Key k="⌫" wide /><Key k="4" /><Key k="5" /><Key k="6" /><Key k="↵" rows={4} dark /><Key k="7" /><Key k="8" /><Key k="9" /><Key k="." /><Key k="0" /><Key k="e" /><Key k="/" span={3} /></div> },
  { id: "e-slash-column", name: "e and / beside the digits", note: "a fourth column holds ⌫, e and / ; ↵ full width below — everything one thumb away", layer: <div className="absolute bottom-[24px] inset-x-4 grid grid-cols-4 gap-2"><Key k="1" /><Key k="2" /><Key k="3" /><Key k="⌫" wide /><Key k="4" /><Key k="5" /><Key k="6" /><Key k="e" /><Key k="7" /><Key k="8" /><Key k="9" /><Key k="/" /><Key k="." /><Key k="0" /><Key k="↵" span={2} dark /></div> },
  { id: "flat-grid", name: "Flat grid, no chrome", note: "keys as plain text on a hairline grid — the Quiet language's keypad", layer: <div className="absolute bottom-0 inset-x-0 h-[300px] border-t border-[#1c1c1c] grid grid-cols-4 grid-rows-4 text-[26px] text-gray-300">{["1","2","3","⌫","4","5","6","e","7","8","9","/",".","0","↵",""].map((k, i) => <div key={i} className={`flex items-center justify-center border-[#161616] ${i % 4 < 3 ? "border-r" : ""} ${i < 12 ? "border-b" : ""}`}>{k}</div>)}</div> },
  { id: "operators-strip", name: "Digits + a strip for e / .", note: "a 3-column digit block; e, . and / live in a thin strip above it with ↵ at the right", layer: <div className="absolute bottom-[24px] inset-x-4"><div className="grid grid-cols-4 gap-2 mb-2"><Key k="e" wide /><Key k="." wide /><Key k="/" wide /><Key k="⌫" wide /></div><div className="grid grid-cols-4 gap-2"><Key k="1" /><Key k="2" /><Key k="3" /><Key k="↵" dark /><Key k="4" /><Key k="5" /><Key k="6" /><div /><Key k="7" /><Key k="8" /><Key k="9" /><div /><div /><Key k="0" /><div /><div /></div></div> },
  { id: "calculator", name: "Calculator layout", note: "the familiar 789 / 456 / 123 order with e and / in an operator column", layer: <div className="absolute bottom-[24px] inset-x-4 grid grid-cols-4 gap-2"><Key k="7" /><Key k="8" /><Key k="9" /><Key k="⌫" wide /><Key k="4" /><Key k="5" /><Key k="6" /><Key k="e" /><Key k="1" /><Key k="2" /><Key k="3" /><Key k="/" /><Key k="0" span={2} /><Key k="." /><Key k="↵" dark /></div> },
  { id: "phone-keyboard", name: "The phone's own keyboard", note: "no custom keypad at all; the numeric keyboard slides up when you tap. e and / from a tap-hold", layer: <div className="absolute bottom-0 inset-x-0 h-[260px] bg-[#2a2a2c] grid grid-cols-3 grid-rows-4 gap-[6px] p-[6px] text-[24px]">{["1","2","3","4","5","6","7","8","9","e / ⁄","0","⌫"].map((k, i) => <div key={i} className={`rounded-md flex items-center justify-center ${i === 9 || i === 11 ? "bg-[#4b4b4d] text-[14px]" : "bg-[#6b6b6e]"}`}>{k}</div>)}</div> },
  { id: "two-rows", name: "Two rows, huge keys", note: "digits 0–9 in two rows of five, e · / · . · ⌫ · ↵ on a third — biggest targets", layer: <div className="absolute bottom-[24px] inset-x-4 grid grid-cols-5 gap-2"><Key k="1" /><Key k="2" /><Key k="3" /><Key k="4" /><Key k="5" /><Key k="6" /><Key k="7" /><Key k="8" /><Key k="9" /><Key k="0" /><Key k="e" /><Key k="/" /><Key k="." /><Key k="⌫" wide /><Key k="↵" dark /></div> },
];

// ── Miss: voice × placement (Feedback) ──────────────────────────────────────
const AreaPic = ({ h = 60, w = 280 }: { h?: number; w?: number }) => <div className="flex" style={{ height: h, width: w }}><div className="bg-emerald-500/30 border border-emerald-500" style={{ width: "85%" }} /><div className="bg-sky-500/30 border border-sky-500" style={{ width: "15%" }} /></div>;
const WidgetCard = ({ h = 200 }: { h?: number }) => <div className="rounded-xl border border-gray-700 p-3 w-full" style={{ height: h }}><div className="text-[10px] uppercase tracking-wide text-gray-500">play with it</div><div className="mt-2"><AreaPic h={Math.max(40, h - 90)} w={300} /></div><div className="text-[12px] text-gray-400 mt-2 tabular-nums">240 + 42 = 282</div></div>;
const Head = () => <div className="px-8 pt-14 text-[13px] text-gray-500">47 × 6</div>;
const NextBar = () => <div className="absolute inset-x-6 bottom-6 h-12 rounded-2xl bg-gray-100 text-black flex items-center justify-center text-2xl">→</div>;

export const VOICES: Option[] = [
  { id: "card", name: "Current card", note: "the answer, the sum, and a technique card — what is live", current: true, lines: () => <div><div className="text-[28px] font-light text-center">282</div><div className="text-[13px] text-gray-500 text-center mt-1">40×6 + 7×6 = 240 + 42</div><div className="mt-4 rounded-xl border border-gray-800 p-3 text-[12px]"><div className="text-[10px] uppercase tracking-wide text-gray-500">split by place</div><div className="mt-1">Multiply the tens, multiply the ones, add.</div></div></div> },
  { id: "three", name: "Three sentences", note: "split, second part, total — a tutor's three lines", lines: (z) => <div className="space-y-5" style={Serif}><div style={{ fontSize: z }} className="leading-tight">40 sixes is <span className="underline decoration-emerald-500 decoration-2">240</span>.</div><div style={{ fontSize: z }} className="leading-tight text-gray-400">7 more sixes is 42.</div><div style={{ fontSize: z }} className="leading-tight text-gray-600">282.</div></div> },
  { id: "one", name: "One sentence", note: "just the move; the arithmetic is yours", lines: (z) => <div style={{ ...Serif, fontSize: z }} className="leading-tight">Forty sixes, then seven more.</div> },
  { id: "your-answer", name: "Your answer, then sentences", note: "what you said, struck, before the sentences — so the miss is named", lines: (z) => <div className="space-y-5" style={Serif}><div className="text-[20px] text-gray-600 line-through">242</div><div style={{ fontSize: z }} className="leading-tight">40 sixes is 240.</div><div style={{ fontSize: z }} className="leading-tight text-gray-400">7 more sixes is 42.</div><div style={{ fontSize: z }} className="leading-tight text-gray-600">282.</div></div> },
  { id: "column", name: "Sentences + column", note: "the sentences with the digit-aligned sum beneath", lines: (z) => <div style={Serif}><div style={{ fontSize: z * 0.9 }} className="leading-tight">40 sixes is 240.</div><div style={{ fontSize: z * 0.9 }} className="leading-tight text-gray-400 mt-3">7 more sixes is 42.</div><div className="mt-5 text-[22px] leading-relaxed tabular-nums" style={Mono}><div className="text-gray-300">  240</div><div className="text-gray-300">+  42</div><div className="border-t border-gray-700 w-[100px]" /><div>  282</div></div></div> },
];

export const PLACEMENTS: Option[] = [
  { id: "below", name: "Below the words", note: "words, then the widget card, then → — what is live", current: true, compose: (v) => <Frame><Head /><div className="px-8 mt-6">{v.lines!(28)}</div><div className="absolute inset-x-6 bottom-[110px]"><WidgetCard h={190} /></div><NextBar /></Frame> },
  { id: "keypad-area", name: "In the keypad's place", note: "the top half stays exactly as it was; the widget takes the keypad's rectangle", compose: (v) => <Frame><Head /><div className="px-8 mt-6">{v.lines!(28)}</div><div className="absolute inset-x-0 bottom-0 h-[320px] border-t border-[#1c1c1c] px-6 pt-4"><AreaPic h={110} w={340} /><div className="text-[13px] text-gray-400 mt-3 tabular-nums">240 + 42 = 282 · drag the cut</div><NextBar /></div></Frame> },
  { id: "swipe", name: "A swipe away", note: "feedback is text only; swiping left brings the widget in as a full panel", compose: (v) => <Frame><Head /><div className="px-8 mt-6">{v.lines!(32)}</div><div className="absolute right-0 top-[300px] bottom-[300px] w-[14px] rounded-l-xl bg-gray-800" /><div className="absolute bottom-10 inset-x-0 text-center text-[12px] text-gray-600">← the picture · tap to go on</div></Frame> },
  { id: "inline", name: "Inline, under the step", note: "the area model sits directly beneath '40 sixes is 240', sized to that sentence", compose: (v) => <Frame><Head /><div className="px-8 mt-6"><div style={Serif}><div className="text-[28px] leading-tight">40 sixes is 240.</div><div className="mt-3"><AreaPic h={44} w={280} /></div><div className="text-[28px] leading-tight text-gray-400 mt-5">7 more sixes is 42.</div>{v.id === "one" ? null : <div className="text-[28px] leading-tight text-gray-600 mt-5">282.</div>}</div></div><div className="absolute bottom-10 inset-x-0 text-center text-[12px] text-gray-600">tap to go on</div></Frame> },
  { id: "hidden", name: "Hidden until asked", note: "a single word — 'show me' — opens the widget; most misses never need it", compose: (v) => <Frame><Head /><div className="px-8 mt-6">{v.lines!(32)}</div><div className="absolute bottom-16 inset-x-0 text-center text-[14px] text-gray-500 underline decoration-gray-700">show me</div></Frame> },
];

// ── Summary: how a session ends ─────────────────────────────────────────────
const Center = ({ children }: { children: ReactNode }) => <div className="absolute inset-0 flex items-center justify-center">{children}</div>;
const SUMMARY: Option[] = [
  { id: "current", name: "Count, tally, Again", note: "answered, correct %, per-skill tally, Again with a length picker — what is live", current: true, layer: <div className="absolute inset-0 flex flex-col"><div className="flex-1 flex flex-col items-center justify-center px-6 text-center"><div className="text-[72px] font-light tabular-nums leading-none">61</div><div className="text-[14px] text-gray-500 mt-2">answered · mixed · 8 min</div><div className="text-[24px] font-light mt-6 tabular-nums">55 correct · 90%</div><ul className="mt-8 w-full max-w-[320px] text-[14px] space-y-1 text-gray-500">{[["Times tables 13–20", "12/14"], ["Percent of a number", "9/10"], ["Squares to 25", "8/8"], ["Scientific notation", "7/9"]].map(([k, v]) => <li key={k} className="flex justify-between"><span>{k}</span><span className="tabular-nums">{v}</span></li>)}</ul></div><div className="px-6 pb-6 space-y-2"><div className="flex gap-2"><div className="flex-1 h-14 rounded-2xl bg-gray-100 text-black text-[18px] flex items-center justify-center">Again</div>{["2m", "4m", "8m", "12m"].map((m) => <div key={m} className={`w-12 h-14 rounded-2xl border text-[14px] tabular-nums flex items-center justify-center ${m === "8m" ? "border-gray-100 text-gray-100" : "border-gray-800 text-gray-500"}`}>{m}</div>)}</div><div className="flex justify-between text-[14px] text-gray-500 px-1 h-12 items-center"><span>skills</span><span>history</span></div></div></div> },
  { id: "sentence", name: "A sentence", note: "Sixty-one. Fifty-five right. Seven minutes.", layer: <Center><div className="text-center" style={Serif}><div className="text-[34px]">Sixty-one.</div><div className="text-[22px] text-gray-400 mt-3">Fifty-five right. Seven minutes.</div></div></Center> },
  { id: "number", name: "Just the number", note: "61, and nothing else until you tap", layer: <Center><div className="text-[120px] font-light">61</div></Center> },
  { id: "compare", name: "Against yesterday", note: "one line of comparison — the only stat that motivates", layer: <Center><div className="text-center" style={Serif}><div className="text-[34px]">Sixty-one.</div><div className="text-[22px] text-gray-400 mt-3">Four more than yesterday.</div></div></Center> },
];

// ── the decisions, in default priority order ────────────────────────────────
export const DECISIONS: Decision[] = [
  { id: "question", name: "Question", step: "Answering", question: "How is the item presented?", requirements: ["readable at arm's length", "nothing on screen that isn't the item"], axes: [{ id: "style", name: "style", options: QUESTION }] },
  { id: "keypad", name: "Keypad", step: "Answering", question: "How is input organized?", requirements: ["digits 0–9, decimal point, backspace, submit", "an e key (scientific notation) and a fraction line / — both reachable without a mode switch", "one-handed on a phone; no native keyboard"], axes: [{ id: "layout", name: "layout", options: KEYPAD }] },
  { id: "timer", name: "Timer", step: "Answering", question: "Where does time live?", requirements: ["freezes from submit to the next item", "never punishes reading"], axes: [{ id: "place", name: "place", options: TIMER }] },
  { id: "miss", name: "Miss screen", step: "Miss", question: "How does a miss speak, and where does the picture go?", requirements: ["says what was asked, what's right, and the move — in that order", "specific to these numbers, never a canned example", "the picture is seeded with this item's numbers; touching it never advances", "the keypad is gone while feedback is up; → goes on"], axes: [{ id: "voice", name: "voice", options: VOICES }, { id: "placement", name: "placement", options: PLACEMENTS }] },
  { id: "summary", name: "Summary", step: "Summary", question: "How does a session end?", requirements: ["one number you'd remember", "a way to go again without a menu"], axes: [{ id: "shape", name: "shape", options: SUMMARY }] },
];

export const decisionById = (id: string) => DECISIONS.find((d) => d.id === id)!;
export const firstAxis = (d: Decision) => d.axes[0].id;

/** One option per axis → the whole screen for a step. `pick(decisionId, axisId?)` answers with the chosen option. */
export function composeStep(step: Step, pick: (decisionId: string, axisId?: string) => Option): ReactNode {
  if (step === "Answering") return <Frame>{pick("timer").layer}{pick("question").layer}{pick("keypad").layer}</Frame>;
  if (step === "Miss") return pick("miss", "placement").compose!(pick("miss", "voice"));
  return <Frame>{pick("summary").layer}</Frame>;
}
