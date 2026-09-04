/**
 * Decisions — the design, decomposed. Each decision is one or two axes of
 * options; a *version* is one option per axis (a "set" decision keeps several).
 * Options are layers on a 390×844 frame, so any set of choices composes into
 * whole screens: the version at the top of the page, and every thumbnail is
 * that version with one option swapped.
 */
import type { ReactNode } from "react";
import { AreaModel, LogLine, PercentBar } from "@/components/widgets";
import { percentRowsFor } from "@/lib/percentSteps";

export const W = 390, H = 844;

export type Step = "Answering" | "Miss" | "Summary";
export const STEPS: { id: Step; name: string; what: string; live: string }[] = [
  { id: "Answering", name: "Answering", what: "the item, the time, the keys", live: "/?demo=default" },
  { id: "Miss", name: "Miss", what: "what a wrong answer gets", live: "/?demo=wrong&skill=ar.split" },
  { id: "Summary", name: "Summary", what: "how a session ends", live: "/?demo=summary" },
];

/** One worked miss, in every voice a screen might use — so a widget can be shown inside the real Miss screen. */
export interface Sample {
  item: string; wrong: string; answer: string;
  sum: string; technique: string; tip: string;
  l1: ReactNode; l2: string; l3: string; one: string; col: [string, string, string];
  caption: string;
  /** the picture as a mock, at a size */
  pic: (h: number, w: number) => ReactNode;
  /** the real, playable widget — only for the built ones */
  live?: () => ReactNode;
}

export interface Option {
  id: string; name: string; note: string; current?: boolean;
  /** positioned content for the step's frame (Answering, Summary) */
  layer?: ReactNode;
  /** Miss · voice: the words, at a size, for a sample */
  lines?: (size: number, s: Sample) => ReactNode;
  /** Miss · placement: the whole screen composed around a voice and a sample */
  compose?: (voice: Option, s: Sample) => ReactNode;
  /** Widgets: the worked miss this picture explains, and the skills it serves */
  sample?: Sample; serves?: string;
}
export interface Axis { id: string; name: string; options: Option[] }
export interface Decision { id: string; name: string; step: Step; question: string; requirements: string[]; axes: Axis[]; kind?: "one" | "set" }

// ── frame + primitives ──────────────────────────────────────────────────────
export const Frame = ({ children, bg = "bg-black", className = "" }: { children: ReactNode; bg?: string; className?: string }) => <div className={`w-[390px] h-[844px] ${bg} text-gray-100 relative overflow-hidden ${className}`}>{children}</div>;
const Serif = { fontFamily: "Georgia, 'Times New Roman', serif" } as const;
const Mono = { fontFamily: "ui-monospace, Menlo, monospace" } as const;
const Key = ({ k, span = 1, rows = 1, dark = false, wide = false }: { k: string; span?: number; rows?: number; dark?: boolean; wide?: boolean }) => (
  <div className={`rounded-2xl flex items-center justify-center font-light ${dark ? "bg-gray-100 text-black" : "bg-[#141826] text-gray-100"} ${wide ? "text-[18px]" : "text-[24px]"}`} style={{ gridColumn: `span ${span}`, gridRow: `span ${rows}`, minHeight: 56 }}>{k}</div>
);
const Cursor = () => <span className="text-gray-600">|</span>;
/** the real widgets are styled for the app's light/dark; inside a black frame, force the dark look */
const Live = ({ children }: { children: ReactNode }) => <div className="text-gray-100 [&_b]:!text-gray-200 [&_.bg-gray-900]:!bg-gray-100 [&_.fill-gray-900]:!fill-gray-100">{children}</div>;

// ── Question: how the item is presented (Answering) ─────────────────────────
const QUESTION: Option[] = [
  { id: "centred-sub", name: "Centred, with a sub-line", note: "36px light, the skill's ask beneath, the answer on a rule below — live until 9/3", layer: <><div className="absolute inset-x-6 top-[232px] text-center"><div className="text-[36px] font-light tracking-tight leading-tight">47 × 6</div><div className="text-[14px] text-gray-500 mt-2">multiply</div></div><div className="absolute inset-x-6 top-[326px] text-center text-[30px] font-light tabular-nums border-b-2 border-gray-800 pb-3">28</div></> },
  { id: "top-left", name: "Top left, small", note: "the question as a caption with the answer box right under it — its label (product, value) clears as you type; no reflow between states — what is live", current: true, layer: <><div className="absolute left-8 top-[60px] text-[26px]" style={Serif}>47 × 6</div><div className="absolute left-8 top-[100px] h-11 min-w-[70px] px-3 rounded-xl border-2 border-gray-700 flex items-center text-[24px] font-light text-gray-100 tabular-nums">28<Cursor /></div></> },
  { id: "top-left-centre", name: "Caption, answer centred", note: "the caption top-left and the typed answer large in the middle of the space — live 9/3, for a few hours", layer: <><div className="absolute left-8 top-[60px] text-[26px]" style={Serif}>47 × 6</div><div className="absolute inset-x-0 top-[300px] text-center text-[44px] font-light text-gray-300 tabular-nums">28<Cursor /></div></> },
  { id: "center-light", name: "Centred, nothing else", note: "44px light, dead centre of the space above the keys; the answer takes its place as you type", layer: <div className="absolute inset-x-0 top-[200px] text-center"><div className="text-[44px] font-light">47 × 6</div><div className="text-[44px] font-light text-gray-300 mt-10 tabular-nums">28<Cursor /></div></div> },
  { id: "center-serif", name: "Centred, serif", note: "the same, in the tutor's serif — one voice throughout", layer: <div className="absolute inset-x-0 top-[200px] text-center" style={Serif}><div className="text-[46px]">47 × 6</div><div className="text-[44px] text-gray-300 mt-10 tabular-nums">28<Cursor /></div></div> },
  { id: "huge", name: "Huge", note: "the number fills the width; readable from across the room", layer: <div className="absolute inset-x-0 top-[180px] text-center"><div className="text-[96px] font-light tracking-tight leading-none">47×6</div><div className="text-[44px] font-light text-gray-300 mt-8 tabular-nums">28<Cursor /></div></div> },
  { id: "answer-rule", name: "With an answer rule", note: "a hairline under the question says 'type here' without a placeholder", layer: <div className="absolute inset-x-0 top-[210px] text-center"><div className="text-[44px] font-light">47 × 6</div><div className="mt-10 mx-auto w-[160px] border-b border-gray-700 text-[36px] font-light text-gray-300 pb-1 tabular-nums">28</div></div> },
];

// ── Timer: where time lives (Answering) ─────────────────────────────────────
const TIMER: Option[] = [
  { id: "clock", name: "Top centre clock", note: "m:ss in the header, tap to change length; freezes on submit — live until 9/3", layer: <><div className="absolute top-[44px] inset-x-0 text-center text-[16px] tabular-nums text-gray-100">6:25</div><div className="absolute top-[42px] right-5 text-[14px] text-gray-500">▦</div></> },
  { id: "faint-corner", name: "Faint corner", note: "6:25 top-right at 30% — present if you look", layer: <div className="absolute top-12 right-8 text-[13px] text-gray-700 tabular-nums">6:25</div> },
  { id: "progress-line", name: "A line across the top", note: "the session as a thin bar draining left to right; no digits; tap it to change the length — what is live", current: true, layer: <div className="absolute top-0 left-0 h-[3px] bg-emerald-500" style={{ width: "62%" }} /> },
  { id: "pace-dot", name: "Pace dot per item", note: "one dot that fills at your target pace for this item; the session length is not shown at all", layer: <div className="absolute top-[470px] inset-x-0 flex justify-center"><div className="w-[10px] h-[10px] rounded-full border border-gray-600" style={{ background: "conic-gradient(#10b981 0 140deg, transparent 140deg)" }} /></div> },
  { id: "none", name: "None", note: "nothing on screen; the session simply ends when it ends", layer: null },
  { id: "summary-only", name: "Only at the summary", note: "no live time; the summary reports the minutes", layer: null },
];

// ── Keypad: how input is organized (Answering) ──────────────────────────────
const KEYPAD: Option[] = [
  { id: "four-col-slash", name: "4 columns + / row", note: "digits · . 0 e · a full-width / on a fifth row · ⌫ and ↵ on the right — live until 9/3", layer: <div className="absolute bottom-0 inset-x-0 px-3 pb-3 pt-2 grid grid-cols-4 gap-2"><Key k="1" /><Key k="2" /><Key k="3" /><Key k="⌫" wide /><Key k="4" /><Key k="5" /><Key k="6" /><Key k="↵" rows={4} dark /><Key k="7" /><Key k="8" /><Key k="9" /><Key k="." /><Key k="0" /><Key k="e" /><Key k="/" span={3} /></div> },
  { id: "e-slash-column", name: "e and / beside the digits", note: "a fourth column holds ⌫, e and / ; ↵ full width below — everything one thumb away", layer: <div className="absolute bottom-[24px] inset-x-4 grid grid-cols-4 gap-2"><Key k="1" /><Key k="2" /><Key k="3" /><Key k="⌫" wide /><Key k="4" /><Key k="5" /><Key k="6" /><Key k="e" /><Key k="7" /><Key k="8" /><Key k="9" /><Key k="/" /><Key k="." /><Key k="0" /><Key k="↵" span={2} dark /></div> },
  { id: "flat-grid", name: "Flat grid, no chrome", note: "keys as plain text on a hairline grid — the Quiet language's keypad", layer: <div className="absolute bottom-0 inset-x-0 h-[300px] border-t border-[#1c1c1c] grid grid-cols-4 grid-rows-4 text-[26px] text-gray-300">{["1","2","3","⌫","4","5","6","e","7","8","9","/",".","0","↵",""].map((k, i) => <div key={i} className={`flex items-center justify-center border-[#161616] ${i % 4 < 3 ? "border-r" : ""} ${i < 12 ? "border-b" : ""}`}>{k}</div>)}</div> },
  { id: "operators-strip", name: "Digits + a strip for e / .", note: "a 3-column digit block; e, . and / live in a thin strip above it with ↵ at the right", layer: <div className="absolute bottom-[24px] inset-x-4"><div className="grid grid-cols-4 gap-2 mb-2"><Key k="e" wide /><Key k="." wide /><Key k="/" wide /><Key k="⌫" wide /></div><div className="grid grid-cols-4 gap-2"><Key k="1" /><Key k="2" /><Key k="3" /><Key k="↵" dark /><Key k="4" /><Key k="5" /><Key k="6" /><div /><Key k="7" /><Key k="8" /><Key k="9" /><div /><div /><Key k="0" /><div /><div /></div></div> },
  { id: "calculator", name: "Calculator layout", note: "the familiar 789 / 456 / 123 order with e and / in an operator column — what is live", current: true, layer: <div className="absolute bottom-[24px] inset-x-4 grid grid-cols-4 gap-2"><Key k="7" /><Key k="8" /><Key k="9" /><Key k="⌫" wide /><Key k="4" /><Key k="5" /><Key k="6" /><Key k="e" /><Key k="1" /><Key k="2" /><Key k="3" /><Key k="/" /><Key k="0" span={2} /><Key k="." /><Key k="↵" dark /></div> },
  { id: "phone-keyboard", name: "The phone's own keyboard", note: "no custom keypad at all; the numeric keyboard slides up when you tap. e and / from a tap-hold", layer: <div className="absolute bottom-0 inset-x-0 h-[260px] bg-[#2a2a2c] grid grid-cols-3 grid-rows-4 gap-[6px] p-[6px] text-[24px]">{["1","2","3","4","5","6","7","8","9","e / ⁄","0","⌫"].map((k, i) => <div key={i} className={`rounded-md flex items-center justify-center ${i === 9 || i === 11 ? "bg-[#4b4b4d] text-[14px]" : "bg-[#6b6b6e]"}`}>{k}</div>)}</div> },
  { id: "two-rows", name: "Two rows, huge keys", note: "digits 0–9 in two rows of five, e · / · . · ⌫ · ↵ on a third — biggest targets", layer: <div className="absolute bottom-[24px] inset-x-4 grid grid-cols-5 gap-2"><Key k="1" /><Key k="2" /><Key k="3" /><Key k="4" /><Key k="5" /><Key k="6" /><Key k="7" /><Key k="8" /><Key k="9" /><Key k="0" /><Key k="e" /><Key k="/" /><Key k="." /><Key k="⌫" wide /><Key k="↵" dark /></div> },
];

// ── Samples: one worked miss per widget type ────────────────────────────────
const U = ({ children }: { children: ReactNode }) => <span className="underline decoration-emerald-500 decoration-2">{children}</span>;
const Bars = ({ rows, w }: { rows: [string, number, string][]; w: number }) => <div className="space-y-1.5 text-[11px] tabular-nums" style={{ width: w }}>{rows.map(([k, pct, v], i) => <div key={k} className="flex items-center gap-2"><span className="w-12 text-right text-gray-400 shrink-0">{k}</span><div className={`h-3 rounded-sm ${i === rows.length - 1 ? "bg-gray-100" : "bg-emerald-500/60"}`} style={{ width: `${pct}%` }} /><span className="text-gray-500 shrink-0">{v}</span></div>)}</div>;

export const SAMPLE_AREA: Sample = {
  item: "47 × 6", wrong: "242", answer: "282", sum: "40×6 + 7×6 = 240 + 42", technique: "split by place", tip: "Multiply the tens, multiply the ones, add.",
  l1: <>40 sixes is <U>240</U>.</>, l2: "7 more sixes is 42.", l3: "282.", one: "Forty sixes, then seven more.", col: ["  240", "+  42", "  282"], caption: "240 + 42 = 282",
  pic: (h, w) => <div className="flex" style={{ height: h, width: w }}><div className="bg-emerald-500/30 border border-emerald-500" style={{ width: "85%" }} /><div className="bg-sky-500/30 border border-sky-500" style={{ width: "15%" }} /></div>,
  live: () => <AreaModel initialA={47} initialB={6} compact />,
};
const SAMPLE_CHAIN: Sample = {
  item: "15% of 2.4 million", wrong: "36,000", answer: "360,000", sum: "10% = 240,000 · 5% = 120,000", technique: "ten percent, then half", tip: "Take 10%, then half of that, and add.",
  l1: <>10% of 2.4 million is <U>240,000</U>.</>, l2: "5% is half of that: 120,000.", l3: "360,000.", one: "Ten percent, then half of it.", col: ["  240,000", "+ 120,000", "  360,000"], caption: "2,400,000 × 0.15 = 360,000",
  pic: (_h, w) => <Bars w={w} rows={[["start", 100, "2,400,000"], ["×0.10", 10, "240,000"], ["+ half", 15, "360,000"]]} />,
  live: () => <PercentBar rows={percentRowsFor("cpb:15%2.4e6")!} compact allAtOnce />,
};
const SAMPLE_LOG: Sample = {
  item: "60 million × 3 thousand", wrong: "18 million", answer: "180 billion", sum: "6×3 = 18 · 10⁷ × 10³ = 10¹⁰", technique: "digits, then zeros", tip: "Multiply the leading digits, then add the zeros.",
  l1: <>6 × 3 is <U>18</U>.</>, l2: "7 zeros and 3 zeros make 10 zeros.", l3: "180 billion.", one: "Eighteen, then ten zeros.", col: ["  6 × 3 = 18", "  10⁷ × 10³ = 10¹⁰", "  1.8 × 10¹¹"], caption: "1.8 × 10¹¹ = 180 billion",
  pic: (_h, w) => <div style={{ width: w }} className="pt-3"><div className="relative h-[6px] rounded bg-gray-800"><div className="absolute left-0 top-0 h-full rounded-l bg-emerald-500/70" style={{ width: "62%" }} /><div className="absolute top-0 h-full bg-sky-500/70" style={{ left: "62%", width: "26%" }} /><div className="absolute -top-[4px] w-[14px] h-[14px] rounded-full bg-gray-100" style={{ left: "88%" }} /></div><div className="flex justify-between text-[9px] text-gray-500 mt-1.5 tabular-nums"><span>1</span><span>thousand</span><span>million</span><span>billion</span><span>10¹²</span></div></div>,
  live: () => <LogLine initialX={Math.log10(6e7)} initialY={Math.log10(3e3)} compact />,
};
const SAMPLE_STRIP: Sample = {
  item: "3/8 as a percent", wrong: "30%", answer: "37.5%", sum: "1/8 = 12.5% · ×3", technique: "build from the unit fraction", tip: "Know the eighth; count three of them.",
  l1: <>One eighth is <U>12.5%</U>.</>, l2: "Three of them: 37.5%.", l3: "37.5%.", one: "An eighth is twelve and a half.", col: ["  12.5", "×    3", "  37.5"], caption: "3 of 8 parts · 0.375 · 37.5%",
  pic: (h, w) => <div className="grid grid-cols-8 gap-[2px]" style={{ height: h, width: w }}>{Array.from({ length: 8 }, (_, i) => <div key={i} className={`border ${i < 3 ? "bg-emerald-500/40 border-emerald-500" : "border-gray-700"}`} />)}</div>,
};
const SAMPLE_POINT: Sample = {
  item: "0.0034 × 1000", wrong: "0.34", answer: "3.4", sum: "three places right", technique: "move the point", tip: "×1000 is three hops of the point to the right.",
  l1: <>×1000 moves the point <U>three</U> places right.</>, l2: "0.0034 → 0.034 → 0.34 → 3.4.", l3: "3.4.", one: "Three hops to the right.", col: ["  0.0034", "× 1000", "  3.4"], caption: "0.0034 → 3.4",
  pic: (_h, w) => <div style={{ width: w }} className="text-[26px] tabular-nums font-light"><div className="flex gap-1 items-end"><span>0</span><span className="text-emerald-400">.</span><span>0</span><span>0</span><span>3</span><span>4</span></div><div className="flex gap-1 items-end text-gray-500 mt-1"><span>0</span><span>0</span><span>0</span><span className="text-gray-100">3</span><span className="text-emerald-400">.</span><span className="text-gray-100">4</span></div><div className="text-[10px] text-emerald-400 mt-1 tracking-[0.3em]">→→→</div></div>,
};
const SAMPLE_GROUPS: Sample = {
  item: "95 ÷ 7", wrong: "13", answer: "13 r 4", sum: "7 × 13 = 91 · 4 left", technique: "nearest multiple", tip: "Find the nearest multiple below, then count what's left.",
  l1: <>7 × 13 is <U>91</U>.</>, l2: "4 are left over.", l3: "13 remainder 4.", one: "Ninety-one, then four left.", col: ["  91", "+  4", "  95"], caption: "13 groups of 7, and 4 left",
  pic: (_h, w) => <div style={{ width: w }}><div className="grid gap-[3px]" style={{ gridTemplateColumns: "repeat(14, 1fr)" }}>{Array.from({ length: 98 }, (_, i) => { const col = i % 14; const isLeft = col === 13; const row = Math.floor(i / 14); if (isLeft && row >= 4) return <div key={i} />; return <div key={i} className={`aspect-square rounded-full ${isLeft ? "bg-sky-400" : "bg-emerald-500/70"}`} />; })}</div></div>,
};

// ── Miss: voice × placement (Feedback) ──────────────────────────────────────
const Head = ({ s }: { s: Sample }) => <div className="px-8 pt-14 text-[13px] text-gray-500">{s.item}</div>;
const NextBar = () => <div className="absolute inset-x-6 bottom-6 h-12 rounded-2xl bg-gray-100 text-black flex items-center justify-center text-2xl">→</div>;
const Picture = ({ s, h, w, note }: { s: Sample; h: number; w: number; note?: string }) => s.live ? <Live>{s.live()}</Live> : <>{s.pic(h, w)}<div className="text-[12px] text-gray-400 mt-2 tabular-nums">{s.caption}{note ? ` · ${note}` : ""}</div></>;
const WidgetCard = ({ s, h }: { s: Sample; h: number }) => <div className="rounded-xl border border-gray-700 p-3 w-full overflow-hidden" style={{ height: h }}><div className="text-[10px] uppercase tracking-wide text-gray-500 mb-2">play with it</div><Picture s={s} h={Math.max(40, h - 90)} w={300} /></div>;

export const VOICES: Option[] = [
  { id: "card", name: "Answer + technique card", note: "the answer, the sum, and a technique card — live until 9/3", lines: (_z, s) => <div><div className="text-[28px] font-light text-center">{s.answer}</div><div className="text-[13px] text-gray-500 text-center mt-1">{s.sum}</div><div className="mt-4 rounded-xl border border-gray-800 p-3 text-[12px]"><div className="text-[10px] uppercase tracking-wide text-gray-500">{s.technique}</div><div className="mt-1">{s.tip}</div></div></div> },
  { id: "three", name: "Three sentences", note: "split, second part, total — a tutor's three lines — what is live", current: true, lines: (z, s) => <div className="space-y-5" style={Serif}><div style={{ fontSize: z }} className="leading-tight">{s.l1}</div><div style={{ fontSize: z }} className="leading-tight text-gray-400">{s.l2}</div><div style={{ fontSize: z }} className="leading-tight text-gray-600">{s.l3}</div></div> },
  { id: "one", name: "One sentence", note: "just the move; the arithmetic is yours", lines: (z, s) => <div style={{ ...Serif, fontSize: z }} className="leading-tight">{s.one}</div> },
  { id: "your-answer", name: "Your answer, then sentences", note: "what you said, struck, before the sentences — so the miss is named", lines: (z, s) => <div className="space-y-5" style={Serif}><div className="text-[20px] text-gray-600 line-through">{s.wrong}</div><div style={{ fontSize: z }} className="leading-tight">{s.l1}</div><div style={{ fontSize: z }} className="leading-tight text-gray-400">{s.l2}</div><div style={{ fontSize: z }} className="leading-tight text-gray-600">{s.l3}</div></div> },
  { id: "column", name: "Sentences + column", note: "the sentences with the digit-aligned sum beneath", lines: (z, s) => <div style={Serif}><div style={{ fontSize: z * 0.9 }} className="leading-tight">{s.l1}</div><div style={{ fontSize: z * 0.9 }} className="leading-tight text-gray-400 mt-3">{s.l2}</div><div className="mt-5 text-[22px] leading-relaxed tabular-nums whitespace-pre" style={Mono}><div className="text-gray-300">{s.col[0]}</div><div className="text-gray-300">{s.col[1]}</div><div className="border-t border-gray-700 w-[150px]" /><div>{s.col[2]}</div></div></div> },
];

export const PLACEMENTS: Option[] = [
  { id: "below", name: "Below the words", note: "words, then the widget card, then → — live until 9/3", compose: (v, s) => <Frame><Head s={s} /><div className="px-8 mt-6">{v.lines!(28, s)}</div><div className="absolute inset-x-6 bottom-[100px]"><WidgetCard s={s} h={236} /></div><NextBar /></Frame> },
  { id: "keypad-area", name: "In the keypad's place", note: "the top half stays exactly as it was; the widget takes the keypad's rectangle — what is live", current: true, compose: (v, s) => <Frame><Head s={s} /><div className="px-8 mt-6">{v.lines!(28, s)}</div><div className="absolute inset-x-0 bottom-0 h-[330px] border-t border-[#1c1c1c] px-6 pt-4 overflow-hidden"><Picture s={s} h={110} w={340} note="drag the cut" /><NextBar /></div></Frame> },
  { id: "swipe", name: "A swipe away", note: "feedback is text only; swiping left brings the widget in as a full panel", compose: (v, s) => <Frame><Head s={s} /><div className="px-8 mt-6">{v.lines!(32, s)}</div><div className="absolute right-0 top-[300px] bottom-[300px] w-[14px] rounded-l-xl bg-gray-800" /><div className="absolute bottom-10 inset-x-0 text-center text-[12px] text-gray-600">← the picture · tap to go on</div></Frame> },
  { id: "inline", name: "Inline, under the step", note: "the picture sits directly beneath the first sentence, sized to it", compose: (v, s) => <Frame><Head s={s} /><div className="px-8 mt-6"><div style={Serif}><div className="text-[28px] leading-tight">{s.l1}</div><div className="mt-3">{s.pic(44, 280)}</div><div className="text-[28px] leading-tight text-gray-400 mt-5">{s.l2}</div>{v.id === "one" ? null : <div className="text-[28px] leading-tight text-gray-600 mt-5">{s.l3}</div>}</div></div><div className="absolute bottom-10 inset-x-0 text-center text-[12px] text-gray-600">tap to go on</div></Frame> },
  { id: "hidden", name: "Hidden until asked", note: "a single word — 'show me' — opens the widget; most misses never need it", compose: (v, s) => <Frame><Head s={s} /><div className="px-8 mt-6">{v.lines!(32, s)}</div><div className="absolute bottom-16 inset-x-0 text-center text-[14px] text-gray-500 underline decoration-gray-700">show me</div></Frame> },
];

// ── Widgets: the pictures we build with (a set, not a choice) ───────────────
const WIDGETS: Option[] = [
  { id: "area", name: "Area model", current: true, note: "a rectangle cut at the tens — drag the cut and the two products re-count. Built.", serves: "times tables past 12 · squares from 12² · split-by-place multiplication (ar.split)", sample: SAMPLE_AREA },
  { id: "steps", name: "Percent steps", current: true, note: "find 10%, build the percent from tenths and halves, add it on or take it off — one row per step, tap for the next. Built 9/3, replacing the multiplier-chain sliders.", serves: "percent of / up / down / find / reverse (pct.*) · percent of big numbers (co.pctbig) · chained changes (co.chainbig) · growth (co.growth)", sample: SAMPLE_CHAIN },
  { id: "log", name: "Log number line", current: true, note: "a log-scale line from 1 to 10¹²; multiplying is laying two lengths end to end. Built.", serves: "magnitude multiplication (mag.mul) only — should also carry sn.* reading and mag.div", sample: SAMPLE_LOG },
  { id: "strip", name: "Fraction strip", note: "one bar in n parts, k shaded; the same bar read as a fraction, a decimal, a percent. Proposed.", serves: "all of fractions (fr.unit … fr.fromdec) · decimal ↔ percent (dec.pct) · percent anchors (pct.anchor, pct.what)", sample: SAMPLE_STRIP },
  { id: "point", name: "Place-value slider", note: "the digits stay put; the point hops. ×10 and ÷10 as motion, not rules. Proposed.", serves: "zeros and powers of ten (pv.zeros, exp.add, exp.sub) · decimal scaling (dec.scale, dec.ops) · normalizing sci-notation (sn.norm)", sample: SAMPLE_POINT },
  { id: "groups", name: "Sharing array", note: "dots in columns of the divisor; what doesn't fill a column is the remainder. Proposed.", serves: "division facts and remainders (ar.divfacts, ar.rem) · per-capita and unit price (co.percap, co.unitprice)", sample: SAMPLE_GROUPS },
];
/** skills with no picture today, by family — the reason the proposed widgets exist */
export const NO_PICTURE = "fractions (fr.*) · decimals (dec.*) · place value & exponents (pv.zeros, exp.*, coef.mul) · scientific notation (sn.*) · division & remainders (ar.divfacts, ar.rem) · doubling (ar.double, co.double) · percent anchors (pct.anchor, pct.compose, pct.what) · mag.div · co.fracsci, co.compare";

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
  { id: "widgets", name: "Widgets", step: "Miss", kind: "set", question: "Which pictures do we build with, and for which skills?", requirements: ["one picture per miss, seeded with the item's own numbers (lib/widgetSeed.ts maps item → widget)", "the picture is the working, not decoration: dragging it re-counts the numbers", "every skill family has a picture, or we say it doesn't need one"], axes: [{ id: "types", name: "types", options: WIDGETS }] },
  { id: "summary", name: "Summary", step: "Summary", question: "How does a session end?", requirements: ["one number you'd remember", "a way to go again without a menu"], axes: [{ id: "shape", name: "shape", options: SUMMARY }] },
];

export const decisionById = (id: string) => DECISIONS.find((d) => d.id === id)!;
export const firstAxis = (d: Decision) => d.axes[0].id;

/** One option per axis → the whole screen for a step. `pick(decisionId, axisId?)` answers with the chosen option. */
export function composeStep(step: Step, pick: (decisionId: string, axisId?: string) => Option, sample: Sample = SAMPLE_AREA): ReactNode {
  if (step === "Answering") return <Frame>{pick("timer").layer}{pick("question").layer}{pick("keypad").layer}</Frame>;
  if (step === "Miss") return pick("miss", "placement").compose!(pick("miss", "voice"), sample);
  return <Frame>{pick("summary").layer}</Frame>;
}
