/**
 * Galaxy Brain data. Five directions — whole languages, each complete across
 * the flow — and, for the one being dialed in, variants: small deliberate
 * deltas within that language. Mocks are authored at 390×844 and scaled.
 */
import type { ReactNode } from "react";

export const STEPS = ["Practice", "Answering", "Feedback", "Next", "Summary"] as const;
export type Step = (typeof STEPS)[number];

export interface Variant { id: string; name: string; note: string; cell: ReactNode }
export interface Direction {
  id: string; name: string; what: string;
  cells: Partial<Record<Step, ReactNode>>;
  /** live app URLs, rendered in an iframe instead of a mock */
  live?: Partial<Record<Step, string>>;
  variants?: Partial<Record<Step, Variant[]>>;
}

const S = ({ children, className = "", bg = "bg-black" }: { children: ReactNode; className?: string; bg?: string }) => (
  <div className={`w-[390px] h-[844px] ${bg} text-gray-100 relative overflow-hidden ${className}`}>{children}</div>
);
const serif = { fontFamily: "Georgia, 'Times New Roman', serif" } as const;
const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" } as const;
const Center = ({ children }: { children: ReactNode }) => <div className="absolute inset-0 flex items-center justify-center">{children}</div>;
const Pad = ({ k = "1234567890.⌫", cls = "" }: { k?: string; cls?: string }) => (
  <div className={`absolute bottom-0 inset-x-0 h-[280px] grid grid-cols-3 grid-rows-4 text-[26px] text-gray-400 ${cls}`}>{[...k].map((c, i) => <div key={i} className="flex items-center justify-center">{c}</div>)}</div>
);

// ── Quiet: nothing but the question; a tutor's sentences on a miss ───────
const quietFeedback = (lines: ReactNode[], extra?: ReactNode) => (
  <S><div className="px-8 pt-16 text-[13px] text-gray-500">47 × 6</div><div className="px-8 mt-10 space-y-8" style={serif}>{lines}</div>{extra}</S>
);
const quiet: Direction = {
  id: "quiet", name: "Quiet",
  what: "Only the number in front of you. Nothing else on screen until you miss — then a tutor says two or three short sentences.",
  cells: {
    Practice: <S><Center><div className="text-[44px] font-light">47 × 6</div></Center></S>,
    Answering: <S><div className="absolute inset-x-0 top-[240px] text-center"><div className="text-[44px] font-light">47 × 6</div><div className="text-[44px] font-light text-gray-300 mt-10 tabular-nums">28<span className="text-gray-600">|</span></div></div><Pad cls="bg-[#0d0d0d] border-t border-[#1c1c1c]" /></S>,
    Feedback: quietFeedback([
      <div key={1} className="text-[34px] leading-tight">40 sixes is <span className="underline decoration-emerald-500 decoration-2">240</span>.</div>,
      <div key={2} className="text-[34px] leading-tight text-gray-400">7 more sixes is 42.</div>,
      <div key={3} className="text-[34px] leading-tight text-gray-600">282.</div>,
    ]),
    Next: <S><Center><div className="text-[44px] font-light text-gray-500">15% of 2.4 million</div></Center></S>,
    Summary: <S><Center><div className="text-center" style={serif}><div className="text-[34px]">Sixty-one.</div><div className="text-[22px] text-gray-400 mt-3">Fifty-five right. Seven minutes.</div></div></Center></S>,
  },
  variants: {
    Practice: [
      { id: "center-light", name: "Centered, light", note: "the base: 44px light sans, dead centre", cell: <S><Center><div className="text-[44px] font-light">47 × 6</div></Center></S> },
      { id: "center-serif", name: "Centered, serif", note: "same, in the tutor's serif — one voice throughout", cell: <S><Center><div className="text-[46px]" style={serif}>47 × 6</div></Center></S> },
      { id: "top-left", name: "Top left, small", note: "the question as a caption, like the feedback state — no reflow between states", cell: <S><div className="px-8 pt-16 text-[26px]" style={serif}>47 × 6</div></S> },
      { id: "huge", name: "Huge", note: "the number fills the width; readable from across the room", cell: <S><Center><div className="text-[96px] font-light tracking-tight">47×6</div></Center></S> },
      { id: "upper-third", name: "Upper third", note: "centred horizontally, sitting where the eye lands first; room below for the answer", cell: <S><div className="absolute inset-x-0 top-[220px] text-center text-[44px] font-light">47 × 6</div></S> },
      { id: "pace-dot", name: "With a pace dot", note: "one small dot that fills as your budget runs; still no clock", cell: <S><Center><div className="text-[44px] font-light">47 × 6</div></Center><div className="absolute bottom-10 inset-x-0 flex justify-center"><div className="w-[10px] h-[10px] rounded-full border border-gray-600" style={{ background: "conic-gradient(#10b981 0 140deg, transparent 140deg)" }} /></div></S> },
      { id: "faint-timer", name: "With a faint timer", note: "6:25 in the corner at 30% — present if you look, absent if you don't", cell: <S><div className="absolute top-12 right-8 text-[13px] text-gray-700 tabular-nums">6:25</div><Center><div className="text-[44px] font-light">47 × 6</div></Center></S> },
      { id: "answer-rule", name: "With an answer rule", note: "a hairline under the question says 'type here' without a placeholder", cell: <S><Center><div className="text-center"><div className="text-[44px] font-light">47 × 6</div><div className="mt-10 mx-auto w-[160px] border-b border-gray-700" /></div></Center></S> },
    ],
    Feedback: [
      { id: "three", name: "Three sentences", note: "the base: split, second part, total", cell: quietFeedback([<div key={1} className="text-[34px] leading-tight">40 sixes is <span className="underline decoration-emerald-500 decoration-2">240</span>.</div>, <div key={2} className="text-[34px] leading-tight text-gray-400">7 more sixes is 42.</div>, <div key={3} className="text-[34px] leading-tight text-gray-600">282.</div>]) },
      { id: "one", name: "One sentence", note: "just the move; the arithmetic is yours", cell: quietFeedback([<div key={1} className="text-[34px] leading-tight">Forty sixes, then seven more.</div>]) },
      { id: "numbers-bold", name: "Numbers bold", note: "the sentence stays, the numbers carry", cell: quietFeedback([<div key={1} className="text-[34px] leading-tight">40 sixes is <b>240</b>.</div>, <div key={2} className="text-[34px] leading-tight text-gray-400">7 more is <b className="text-gray-200">42</b>.</div>, <div key={3} className="text-[34px] leading-tight text-gray-600"><b className="text-gray-300">282</b>.</div>]) },
      { id: "your-answer", name: "Shows your answer", note: "what you said, struck, before the sentences — so the miss is named", cell: quietFeedback([<div key={0} className="text-[22px] text-gray-600 line-through">242</div>, <div key={1} className="text-[34px] leading-tight">40 sixes is 240.</div>, <div key={2} className="text-[34px] leading-tight text-gray-400">7 more sixes is 42.</div>, <div key={3} className="text-[34px] leading-tight text-gray-600">282.</div>]) },
      { id: "column", name: "Sentences, then the column", note: "the same three sentences with the digit-aligned sum beneath", cell: quietFeedback([<div key={1} className="text-[30px] leading-tight">40 sixes is 240.</div>, <div key={2} className="text-[30px] leading-tight text-gray-400">7 more sixes is 42.</div>], <div className="px-8 mt-10 text-[24px] leading-relaxed tabular-nums" style={mono}><div className="text-gray-300">  240</div><div className="text-gray-300">+  42</div><div className="border-t border-gray-700 w-[110px]" /><div>  282</div></div>) },
      { id: "move-footer", name: "With the move named", note: "sentences, and at the bottom the technique's name in small caps", cell: quietFeedback([<div key={1} className="text-[34px] leading-tight">40 sixes is 240.</div>, <div key={2} className="text-[34px] leading-tight text-gray-400">7 more sixes is 42.</div>, <div key={3} className="text-[34px] leading-tight text-gray-600">282.</div>], <div className="absolute bottom-12 inset-x-8 text-[12px] tracking-[0.2em] uppercase text-gray-600">split by place</div>) },
    ],
    Summary: [
      { id: "sentence", name: "A sentence", note: "the base", cell: <S><Center><div className="text-center" style={serif}><div className="text-[34px]">Sixty-one.</div><div className="text-[22px] text-gray-400 mt-3">Fifty-five right. Seven minutes.</div></div></Center></S> },
      { id: "number", name: "Just the number", note: "61, and nothing else until you tap", cell: <S><Center><div className="text-[120px] font-light">61</div></Center></S> },
      { id: "compare", name: "Against yesterday", note: "one line of comparison — the only stat that motivates", cell: <S><Center><div className="text-center" style={serif}><div className="text-[34px]">Sixty-one.</div><div className="text-[22px] text-gray-400 mt-3">Four more than yesterday.</div></div></Center></S> },
    ],
  },
};

// ── Current: the live app, as a baseline ─────────────────────────────────
const current: Direction = {
  id: "current", name: "Current",
  what: "What is live today — here so every alternative is judged against the real thing.",
  cells: {},
  live: { Practice: "/", Feedback: "/?demo=wrong&skill=ar.split", Summary: "/?demo=summary" },
};

// ── Ledger: numbers only ─────────────────────────────────────────────────
const ledger: Direction = {
  id: "ledger", name: "Ledger",
  what: "Numbers in columns, no prose. The working is a receipt; the session is the tape.",
  cells: {
    Practice: <S><div className="px-8 pt-16 text-[13px] text-gray-500" style={mono}>DRILL · 6:25 LEFT</div><div className="px-8 mt-6 text-[36px]" style={mono}>47 × 6</div><div className="px-8 text-[14px] text-gray-500" style={mono}>_______</div></S>,
    Answering: <S><div className="px-8 pt-16 text-[13px] text-gray-500" style={mono}>DRILL · 6:25 LEFT</div><div className="px-8 mt-6 text-[36px]" style={mono}>47 × 6</div><div className="px-8 text-[36px]" style={mono}>28_</div><Pad k="1234567890.⏎" cls="text-gray-500" /></S>,
    Feedback: <S><div className="px-8 pt-16 text-[14px]" style={mono}><div className="text-gray-500">DRILL · 09:41</div><div className="border-b border-dashed border-gray-700 my-4" /><div className="flex justify-between text-[20px]"><span>47 × 6</span><span>?</span></div><div className="flex justify-between text-gray-500"><span>you said</span><span>242</span></div><div className="border-b border-dashed border-gray-700 my-4" /><div className="flex justify-between text-[18px]"><span>40 × 6</span><span>240</span></div><div className="flex justify-between text-[18px]"><span>7 × 6</span><span>42</span></div><div className="border-b border-gray-500 my-2" /><div className="flex justify-between text-[22px] font-bold"><span>TOTAL</span><span>282</span></div></div></S>,
    Next: <S><div className="px-8 pt-16 text-[13px] text-gray-500" style={mono}>DRILL · 6:19 LEFT</div><div className="px-8 mt-6 text-[36px]" style={mono}>15% × 2.4M</div><div className="px-8 text-[14px] text-gray-500" style={mono}>_______</div></S>,
    Summary: <S><div className="px-8 pt-16 text-[14px]" style={mono}><div className="text-gray-500">SESSION · 8 MIN</div><div className="border-b border-dashed border-gray-700 my-4" />{[["answered","61"],["right","55"],["accuracy","90%"],["median","4.1s"]].map(([k,v]) => <div key={k} className="flex justify-between text-[18px] py-1"><span>{k}</span><span>{v}</span></div>)}<div className="border-b border-gray-500 my-2" /><div className="text-gray-500 mt-6">again? [y]</div></div></S>,
  },
};

// ── Conversation: a thread ───────────────────────────────────────────────
const bubbleQ = (t: string) => <div className="max-w-[75%] bg-[#1e1e1e] rounded-2xl rounded-bl-sm px-4 py-3 text-[20px]">{t}</div>;
const bubbleA = (t: string, cls = "") => <div className={`ml-auto w-fit max-w-[75%] bg-emerald-600 rounded-2xl rounded-br-sm px-4 py-3 text-[20px] ${cls}`}>{t}</div>;
const chat: Direction = {
  id: "chat", name: "Conversation",
  what: "The trainer asks, you reply, it replies. Feedback is just the next message.",
  cells: {
    Practice: <S><div className="px-5 pt-20 space-y-3">{bubbleQ("47 × 6?")}</div><div className="absolute bottom-6 inset-x-5 h-12 rounded-full border border-gray-700 flex items-center px-5 text-gray-500">…</div></S>,
    Answering: <S><div className="px-5 pt-20 space-y-3">{bubbleQ("47 × 6?")}{bubbleA("28")}</div><div className="absolute bottom-6 inset-x-5 h-12 rounded-full border border-gray-700 flex items-center px-5">28</div></S>,
    Feedback: <S><div className="px-5 pt-20 space-y-3">{bubbleQ("47 × 6?")}{bubbleA("242", "line-through opacity-70")}<div className="max-w-[85%] bg-[#1e1e1e] rounded-2xl rounded-bl-sm px-4 py-3 text-[17px] leading-snug">282. Forty sixes are 240, seven more are 42.</div></div></S>,
    Next: <S><div className="px-5 pt-20 space-y-3">{bubbleQ("47 × 6?")}{bubbleA("242", "line-through opacity-50")}<div className="max-w-[85%] bg-[#1e1e1e] rounded-2xl rounded-bl-sm px-4 py-3 text-[17px] leading-snug opacity-60">282. Forty sixes are 240, seven more are 42.</div>{bubbleQ("15% of 2.4 million?")}</div></S>,
    Summary: <S><div className="px-5 pt-20 space-y-3"><div className="max-w-[85%] bg-[#1e1e1e] rounded-2xl rounded-bl-sm px-4 py-3 text-[17px] leading-snug">That&apos;s eight minutes. 61 answered, 55 right — quicker than yesterday. Again?</div></div></S>,
  },
};

// ── Paper: working shown as you'd write it ───────────────────────────────
const rules = { backgroundImage: "repeating-linear-gradient(transparent 0 31px, #d9e3f0 31px 32px)", backgroundPosition: "0 40px" } as const;
const paperFrame = (children: ReactNode) => <S bg="bg-[#fbfaf5]" className="text-[#222]"><div className="absolute inset-0" style={rules} /><div className="absolute left-[56px] top-0 bottom-0 w-px bg-rose-300/60" />{children}</S>;
const paper: Direction = {
  id: "paper", name: "Paper",
  what: "Faint rules, a margin, the working written the way you'd write it by hand. Unhurried.",
  cells: {
    Practice: paperFrame(<div className="absolute left-[72px] top-[168px] text-[30px]" style={serif}>47 × 6 =</div>),
    Answering: paperFrame(<div className="absolute left-[72px] top-[168px] text-[30px]" style={serif}>47 × 6 = 28<span className="text-gray-400">|</span></div>),
    Feedback: paperFrame(<div className="absolute left-[72px] top-[168px] text-[26px] leading-[32px]" style={serif}><div>47 × 6 = <span className="line-through text-gray-400">242</span></div><div className="pl-8">40 × 6 = 240</div><div className="pl-8">7 × 6 = 42</div><div className="pl-8 border-t border-[#222] w-fit pr-4">282</div></div>),
    Next: paperFrame(<><div className="absolute left-[72px] top-[168px] text-[26px] leading-[32px] text-gray-400" style={serif}><div>47 × 6 = 282</div></div><div className="absolute left-[72px] top-[264px] text-[30px]" style={serif}>15% of 2.4 million =</div></>),
    Summary: paperFrame(<div className="absolute left-[72px] top-[168px] text-[26px] leading-[32px]" style={serif}><div>61 answered</div><div>55 right</div><div>7 min</div><div className="mt-8 text-gray-400">— again?</div></div>),
  },
};

export const DIRECTIONS: Direction[] = [current, quiet, ledger, chat, paper];
