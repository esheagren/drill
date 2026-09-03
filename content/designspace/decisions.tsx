/**
 * Decisions — the design, decomposed. Each decision has requirements (the
 * constraints, editable on the wall), the current choice, and options to react
 * to. Options are phone-size mocks (390×844) or crops of the live app.
 */
import type { ReactNode } from "react";
import { DIRECTIONS } from "./galaxy";

export interface Option { id: string; name: string; note: string; cell?: ReactNode; live?: string; current?: boolean }
export interface Decision { id: string; name: string; question: string; requirements: string[]; options: Option[]; step?: string }

const S = ({ children, bg = "bg-black", className = "" }: { children: ReactNode; bg?: string; className?: string }) => <div className={`w-[390px] h-[844px] ${bg} text-gray-100 relative overflow-hidden ${className}`}>{children}</div>;
const Q = ({ y = 220, size = 44 }: { y?: number; size?: number }) => <div className="absolute inset-x-0 text-center font-light" style={{ top: y, fontSize: size }}>47 × 6</div>;
const Ans = ({ y = 330 }: { y?: number }) => <div className="absolute inset-x-0 text-center text-[36px] font-light text-gray-300 tabular-nums" style={{ top: y }}>28</div>;
const Key = ({ k, span = 1, dark = false, wide = false }: { k: string; span?: number; dark?: boolean; wide?: boolean }) => (
  <div className={`h-[56px] rounded-2xl flex items-center justify-center text-[24px] font-light ${dark ? "bg-gray-100 text-black" : "bg-[#141826] text-gray-100"} ${wide ? "text-[18px]" : ""}`} style={{ gridColumn: `span ${span}` }}>{k}</div>
);

// ── keypad options ────────────────────────────────────────────────────────
const KEYPAD: Option[] = [
  { id: "current", name: "4 columns + / row", note: "digits · . 0 e · a full-width / on a fifth row · ⌫ and ↵ on the right", current: true, live: "/" },
  { id: "e-slash-column", name: "e and / beside the digits", note: "a fourth column holds e and / (and ⌫); ↵ full width below — everything one thumb away", cell: <S><Q /><Ans /><div className="absolute bottom-[24px] inset-x-4 grid grid-cols-4 gap-2"><Key k="1" /><Key k="2" /><Key k="3" /><Key k="⌫" /><Key k="4" /><Key k="5" /><Key k="6" /><Key k="e" /><Key k="7" /><Key k="8" /><Key k="9" /><Key k="/" /><Key k="." /><Key k="0" /><Key k="↵" span={2} dark /></div></S> },
  { id: "flat-grid", name: "Flat grid, no chrome", note: "keys as plain text on a hairline grid — the Quiet language's keypad", cell: <S><Q /><Ans /><div className="absolute bottom-0 inset-x-0 h-[300px] border-t border-[#1c1c1c] grid grid-cols-4 grid-rows-4 text-[26px] text-gray-300">{["1","2","3","⌫","4","5","6","e","7","8","9","/",".","0","↵",""].map((k,i)=><div key={i} className={`flex items-center justify-center border-[#161616] ${i%4<3?"border-r":""} ${i<12?"border-b":""}`}>{k}</div>)}</div></S> },
  { id: "operators-strip", name: "Digits + a strip for e / .", note: "a 3-column digit block; e, . and / live in a thin strip above it with ↵ at the right", cell: <S><Q /><Ans /><div className="absolute bottom-[24px] inset-x-4"><div className="grid grid-cols-4 gap-2 mb-2"><Key k="e" wide /><Key k="." wide /><Key k="/" wide /><Key k="⌫" wide /></div><div className="grid grid-cols-4 gap-2"><Key k="1" /><Key k="2" /><Key k="3" /><Key k="↵" dark /><Key k="4" /><Key k="5" /><Key k="6" /><div /><Key k="7" /><Key k="8" /><Key k="9" /><div /><div /><Key k="0" /><div /><div /></div></div></S> },
  { id: "calculator", name: "Calculator layout", note: "the familiar 789 / 456 / 123 order with e and / in an operator column", cell: <S><Q /><Ans /><div className="absolute bottom-[24px] inset-x-4 grid grid-cols-4 gap-2"><Key k="7" /><Key k="8" /><Key k="9" /><Key k="⌫" /><Key k="4" /><Key k="5" /><Key k="6" /><Key k="e" /><Key k="1" /><Key k="2" /><Key k="3" /><Key k="/" /><Key k="0" span={2} /><Key k="." /><Key k="↵" dark /></div></S> },
  { id: "phone-keyboard", name: "The phone's own keyboard", note: "no custom keypad at all; the numeric keyboard slides up when you tap. e and / from a tap-hold", cell: <S><Q y={180} /><Ans y={290} /><div className="absolute bottom-0 inset-x-0 h-[260px] bg-[#2a2a2c] grid grid-cols-3 grid-rows-4 gap-[6px] p-[6px] text-[24px]">{["1","2","3","4","5","6","7","8","9","e / ⁄","0","⌫"].map((k,i)=><div key={i} className={`rounded-md flex items-center justify-center ${i===9||i===11?"bg-[#4b4b4d] text-[14px]":"bg-[#6b6b6e]"}`}>{k}</div>)}</div></S> },
  { id: "two-rows", name: "Two rows, huge keys", note: "digits 0–9 in two rows of five, e · / · ⌫ · ↵ on a third — biggest targets", cell: <S><Q y={200} /><Ans y={310} /><div className="absolute bottom-[24px] inset-x-4 grid grid-cols-5 gap-2"><Key k="1" /><Key k="2" /><Key k="3" /><Key k="4" /><Key k="5" /><Key k="6" /><Key k="7" /><Key k="8" /><Key k="9" /><Key k="0" /><Key k="e" /><Key k="/" /><Key k="." /><Key k="⌫" /><Key k="↵" dark /></div></S> },
];

// ── timer options ─────────────────────────────────────────────────────────
const TIMER: Option[] = [
  { id: "current", name: "Top centre clock", note: "m:ss in the header, tap to change length; freezes on submit", current: true, live: "/" },
  { id: "faint-corner", name: "Faint corner", note: "6:25 top-right at 30% — present if you look", cell: <S><div className="absolute top-12 right-8 text-[13px] text-gray-700 tabular-nums">6:25</div><Q /></S> },
  { id: "progress-line", name: "A line across the top", note: "the session as a thin bar draining left to right; no digits", cell: <S><div className="absolute top-0 left-0 h-[3px] bg-emerald-500" style={{ width: "62%" }} /><Q /></S> },
  { id: "pace-dot", name: "Pace dot per item", note: "one dot that fills at your target pace for this item; the session length is not shown at all", cell: <S><Q /><div className="absolute bottom-10 inset-x-0 flex justify-center"><div className="w-[10px] h-[10px] rounded-full border border-gray-600" style={{ background: "conic-gradient(#10b981 0 140deg, transparent 140deg)" }} /></div></S> },
  { id: "none", name: "None", note: "nothing on screen; the session simply ends when it ends", cell: <S><Q /></S> },
  { id: "summary-only", name: "Only at the summary", note: "no live time; the summary reports the minutes", cell: <S><div className="absolute inset-0 flex items-center justify-center"><div className="text-center"><div className="text-[34px]" style={{ fontFamily: "Georgia, serif" }}>Sixty-one.</div><div className="text-[22px] text-gray-400 mt-3" style={{ fontFamily: "Georgia, serif" }}>Seven minutes.</div></div></div></S> },
];

// ── widget placement ──────────────────────────────────────────────────────
const Widget = ({ y, h = 190 }: { y: number; h?: number }) => <div className="absolute inset-x-6 rounded-xl border border-gray-700 p-3" style={{ top: y, height: h }}><div className="text-[10px] uppercase tracking-wide text-gray-500">play with it</div><div className="mt-2 flex h-[80px]"><div className="bg-emerald-500/30 border border-emerald-500" style={{ width: "85%" }} /><div className="bg-sky-500/30 border border-sky-500" style={{ width: "15%" }} /></div><div className="text-[12px] text-gray-400 mt-2 tabular-nums">240 + 42 = 282</div></div>;
const Tip = ({ y }: { y: number }) => <div className="absolute inset-x-6 rounded-xl border border-gray-800 p-3 text-[12px]" style={{ top: y }}><div className="text-[10px] uppercase tracking-wide text-gray-500">split by place</div><div className="mt-1">Multiply the tens, multiply the ones, add.</div></div>;
const PLACEMENT: Option[] = [
  { id: "current", name: "Below the answer, in a card", note: "answer, why, then the widget card, then the technique card; → bar at the bottom", current: true, live: "/?demo=wrong&skill=ar.split" },
  { id: "in-keypad-area", name: "In the keypad's place", note: "the top half stays exactly as it was; the widget takes the keypad's rectangle", cell: <S><Q y={120} size={30} /><div className="absolute inset-x-0 top-[190px] text-center text-[30px] text-rose-400 line-through">242</div><div className="absolute inset-x-0 top-[250px] text-center text-[30px]">282</div><Widget y={520} h={280} /></S> },
  { id: "swipe-panel", name: "A swipe away", note: "feedback is text only; swiping left brings the widget in as a full panel", cell: <S><div className="px-8 pt-16 text-[13px] text-gray-500">47 × 6</div><div className="px-8 mt-10 space-y-8" style={{ fontFamily: "Georgia, serif" }}><div className="text-[34px] leading-tight">40 sixes is 240.</div><div className="text-[34px] leading-tight text-gray-400">7 more sixes is 42.</div></div><div className="absolute right-0 top-[300px] bottom-[300px] w-[14px] rounded-l-xl bg-gray-800" /><div className="absolute bottom-10 inset-x-0 text-center text-[12px] text-gray-600">← the picture</div></S> },
  { id: "inline-step", name: "Inline, under the step it explains", note: "the area model sits directly beneath '40 sixes is 240', sized to that sentence", cell: <S><div className="px-8 pt-16 text-[13px] text-gray-500">47 × 6</div><div className="px-8 mt-10" style={{ fontFamily: "Georgia, serif" }}><div className="text-[30px] leading-tight">40 sixes is 240.</div><div className="mt-3 flex h-[44px] w-[280px]"><div className="bg-emerald-500/30 border border-emerald-500" style={{ width: "85%" }} /><div className="bg-sky-500/30 border border-sky-500" style={{ width: "15%" }} /></div><div className="text-[30px] leading-tight text-gray-400 mt-6">7 more sixes is 42.</div><div className="text-[30px] leading-tight text-gray-600 mt-6">282.</div></div></S> },
  { id: "tap-to-reveal", name: "Hidden until asked", note: "a single word — 'show me' — opens the widget; most misses never need it", cell: <S><div className="px-8 pt-16 text-[13px] text-gray-500">47 × 6</div><div className="px-8 mt-10 space-y-8" style={{ fontFamily: "Georgia, serif" }}><div className="text-[34px] leading-tight">40 sixes is 240.</div><div className="text-[34px] leading-tight text-gray-400">7 more sixes is 42.</div><div className="text-[34px] leading-tight text-gray-600">282.</div></div><div className="absolute bottom-16 inset-x-0 text-center text-[14px] text-gray-500 underline decoration-gray-700">show me</div></S> },
];

// ── question presentation / feedback voice / summary: reuse the Quiet variants + current ──
const quiet = DIRECTIONS.find((d) => d.id === "quiet")!;
const fromVariants = (step: "Practice" | "Feedback" | "Summary", live: string) => [
  { id: "current", name: "Current", note: "what is live", current: true, live } as Option,
  ...(quiet.variants?.[step] ?? []).map((v) => ({ id: v.id, name: v.name, note: v.note, cell: v.cell })),
];

// ── Miss screen: feedback voice × widget placement, composed ─────────────
const Serif = { fontFamily: "Georgia, 'Times New Roman', serif" } as const;
const AreaPic = ({ h = 60, w = 280 }: { h?: number; w?: number }) => <div className="flex" style={{ height: h, width: w }}><div className="bg-emerald-500/30 border border-emerald-500" style={{ width: "85%" }} /><div className="bg-sky-500/30 border border-sky-500" style={{ width: "15%" }} /></div>;
const WidgetCard = ({ h = 200 }: { h?: number }) => <div className="rounded-xl border border-gray-700 p-3 w-full" style={{ height: h }}><div className="text-[10px] uppercase tracking-wide text-gray-500">play with it</div><div className="mt-2"><AreaPic h={Math.max(40, h - 90)} w={300} /></div><div className="text-[12px] text-gray-400 mt-2 tabular-nums">240 + 42 = 282</div></div>;

export interface Voice { id: string; name: string; lines: (size: number) => ReactNode }
export const VOICES: Voice[] = [
  { id: "three", name: "Three sentences", lines: (z) => <div className="space-y-5" style={Serif}><div style={{ fontSize: z }} className="leading-tight">40 sixes is <span className="underline decoration-emerald-500 decoration-2">240</span>.</div><div style={{ fontSize: z }} className="leading-tight text-gray-400">7 more sixes is 42.</div><div style={{ fontSize: z }} className="leading-tight text-gray-600">282.</div></div> },
  { id: "one", name: "One sentence", lines: (z) => <div style={{ ...Serif, fontSize: z }} className="leading-tight">Forty sixes, then seven more.</div> },
  { id: "your-answer", name: "Your answer, then sentences", lines: (z) => <div className="space-y-5" style={Serif}><div className="text-[20px] text-gray-600 line-through">242</div><div style={{ fontSize: z }} className="leading-tight">40 sixes is 240.</div><div style={{ fontSize: z }} className="leading-tight text-gray-400">7 more sixes is 42.</div><div style={{ fontSize: z }} className="leading-tight text-gray-600">282.</div></div> },
  { id: "column", name: "Sentences + column", lines: (z) => <div style={Serif}><div style={{ fontSize: z * 0.9 }} className="leading-tight">40 sixes is 240.</div><div style={{ fontSize: z * 0.9 }} className="leading-tight text-gray-400 mt-3">7 more sixes is 42.</div><div className="mt-5 text-[22px] leading-relaxed tabular-nums" style={{ fontFamily: "ui-monospace, Menlo, monospace" }}><div className="text-gray-300">  240</div><div className="text-gray-300">+  42</div><div className="border-t border-gray-700 w-[100px]" /><div>  282</div></div></div> },
  { id: "card", name: "Current card", lines: () => <div><div className="text-[28px] font-light text-center">282</div><div className="text-[13px] text-gray-500 text-center mt-1">40×6 + 7×6 = 240 + 42</div><div className="mt-4 rounded-xl border border-gray-800 p-3 text-[12px]"><div className="text-[10px] uppercase tracking-wide text-gray-500">split by place</div><div className="mt-1">Multiply the tens, multiply the ones, add.</div></div></div> },
];

export interface Placement { id: string; name: string; compose: (voice: Voice) => ReactNode }
const Head = () => <div className="px-8 pt-14 text-[13px] text-gray-500">47 × 6</div>;
export const PLACEMENTS: Placement[] = [
  { id: "below", name: "Below the words", compose: (v) => <S><Head /><div className="px-8 mt-6">{v.lines(28)}</div><div className="absolute inset-x-6 bottom-[110px]"><WidgetCard h={190} /></div><div className="absolute inset-x-6 bottom-6 h-12 rounded-2xl bg-gray-100 text-black flex items-center justify-center text-2xl">→</div></S> },
  { id: "keypad-area", name: "In the keypad's place", compose: (v) => <S><Head /><div className="px-8 mt-6">{v.lines(28)}</div><div className="absolute inset-x-0 bottom-0 h-[320px] border-t border-[#1c1c1c] px-6 pt-4"><AreaPic h={110} w={340} /><div className="text-[13px] text-gray-400 mt-3 tabular-nums">240 + 42 = 282 · drag the cut</div><div className="absolute inset-x-6 bottom-6 h-12 rounded-2xl bg-gray-100 text-black flex items-center justify-center text-2xl">→</div></div></S> },
  { id: "swipe", name: "A swipe away", compose: (v) => <S><Head /><div className="px-8 mt-6">{v.lines(32)}</div><div className="absolute right-0 top-[300px] bottom-[300px] w-[14px] rounded-l-xl bg-gray-800" /><div className="absolute bottom-10 inset-x-0 text-center text-[12px] text-gray-600">← the picture · tap to go on</div></S> },
  { id: "inline", name: "Inline, under the step", compose: (v) => <S><Head /><div className="px-8 mt-6"><div style={Serif}><div className="text-[28px] leading-tight">40 sixes is 240.</div><div className="mt-3"><AreaPic h={44} w={280} /></div><div className="text-[28px] leading-tight text-gray-400 mt-5">7 more sixes is 42.</div>{v.id === "one" ? null : <div className="text-[28px] leading-tight text-gray-600 mt-5">282.</div>}</div></div><div className="absolute bottom-10 inset-x-0 text-center text-[12px] text-gray-600">tap to go on</div></S> },
  { id: "hidden", name: "Hidden until asked", compose: (v) => <S><Head /><div className="px-8 mt-6">{v.lines(32)}</div><div className="absolute bottom-16 inset-x-0 text-center text-[14px] text-gray-500 underline decoration-gray-700">show me</div></S> },
];

export const DECISIONS: Decision[] = [
  { id: "keypad", name: "Keypad", step: "Answering", question: "How is input organized?", requirements: ["digits 0–9, decimal point, backspace, submit", "an e key (scientific notation) and a fraction line / — both reachable without a mode switch", "one-handed on a phone; no native keyboard"], options: KEYPAD },
  { id: "question", name: "Question", step: "Practice", question: "How is the item presented?", requirements: ["readable at arm's length", "nothing on screen that isn't the item"], options: fromVariants("Practice", "/") },
  { id: "timer", name: "Timer", step: "Practice", question: "Where does time live?", requirements: ["freezes from submit to the next item", "never punishes reading"], options: TIMER },
  { id: "feedback", name: "Feedback", step: "Feedback", question: "How does a miss speak?", requirements: ["says what was asked, what's right, and the move — in that order", "specific to these numbers, never a canned example"], options: fromVariants("Feedback", "/?demo=wrong&skill=ar.split") },
  { id: "widget", name: "Widget placement", step: "Feedback", question: "Where does the picture go?", requirements: ["seeded with this item's numbers", "touching it never advances the question"], options: PLACEMENT },
  { id: "summary", name: "Summary", step: "Summary", question: "How does a session end?", requirements: ["one number you'd remember", "a way to go again without a menu"], options: fromVariants("Summary", "/?demo=summary") },
];
