/**
 * Galaxy Brain data: directions (whole design languages) × the flow.
 * Every mock is authored at a real phone size (390×844) and scaled by the board.
 * Add a direction by adding a row; leave a step undefined to show "not drawn yet".
 */
import type { ReactNode } from "react";

export const STEPS = ["Practice", "Answering", "Feedback", "Next", "Summary"] as const;
export type Step = (typeof STEPS)[number];

export interface Direction {
  id: string;            // handle: G-<id>
  name: string;
  seed: string;          // what it grew from
  voice: string;         // one line on how it speaks
  cells: Partial<Record<Step, ReactNode>>;
}

// ── helpers for mocks ────────────────────────────────────────────────────
const S = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`w-[390px] h-[844px] bg-black text-gray-100 relative ${className}`}>{children}</div>
);
const serif = { fontFamily: "Georgia, 'Times New Roman', serif" } as const;
const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" } as const;

// ── 1 · Blank — nothing but the question; a tutor's sentences after ──────
const blank: Direction = {
  id: "blank",
  name: "Blank page",
  seed: "a blank page · a chalkboard",
  voice: "Nothing on screen but the number in front of you. When you miss, a tutor speaks in short sentences, one at a time.",
  cells: {
    Practice: <S><div className="absolute inset-0 flex items-center justify-center text-[44px] font-light">47 × 6</div></S>,
    Answering: <S>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-10">
        <div className="text-[44px] font-light">47 × 6</div>
        <div className="text-[44px] font-light text-gray-300 tabular-nums">28<span className="animate-pulse text-gray-600">|</span></div>
      </div>
      <div className="absolute bottom-0 inset-x-0 h-[300px] bg-[#111] border-t border-[#222] grid grid-cols-3 grid-rows-4 text-[26px] text-gray-300">
        {["1","2","3","4","5","6","7","8","9",".","0","⌫"].map((k) => <div key={k} className="flex items-center justify-center">{k}</div>)}
      </div>
    </S>,
    Feedback: <S>
      <div className="px-8 pt-16 text-[13px] text-gray-500">47 × 6</div>
      <div className="px-8 mt-10 space-y-8" style={serif}>
        <div className="text-[34px] leading-tight">40 sixes is <span className="underline decoration-emerald-500 decoration-2">240</span>.</div>
        <div className="text-[34px] leading-tight text-gray-400">7 more sixes is 42.</div>
        <div className="text-[34px] leading-tight text-gray-600">282.</div>
      </div>
      <div className="absolute bottom-10 inset-x-0 text-center text-[12px] text-gray-600">swipe for the picture · tap to go on</div>
    </S>,
    Next: <S><div className="absolute inset-0 flex items-center justify-center text-[44px] font-light text-gray-500">15% of 2.4 million</div><div className="absolute bottom-10 inset-x-0 text-center text-[12px] text-gray-700">fading in</div></S>,
    Summary: <S><div className="absolute inset-0 flex items-center justify-center"><div className="text-center" style={serif}><div className="text-[34px]">Sixty-one.</div><div className="text-[22px] text-gray-400 mt-3">Fifty-five right. Seven minutes.</div><div className="text-[16px] text-gray-600 mt-10">again?</div></div></div></S>,
  },
};

// ── 2 · Ledger — everything is a line item ───────────────────────────────
const ledger: Direction = {
  id: "ledger",
  name: "Ledger",
  seed: "a shop receipt",
  voice: "Numbers in columns. No prose. The steps are the receipt; the session is the tape.",
  cells: {
    Practice: <S><div className="px-8 pt-16 text-[14px] text-gray-500" style={mono}>DRILL · 09:41 · 6:25 left</div><div className="px-8 mt-6 text-[36px]" style={mono}>47 × 6</div><div className="px-8 mt-1 text-[14px] text-gray-500" style={mono}>_______</div></S>,
    Feedback: <S><div className="px-8 pt-16 text-[14px]" style={mono}>
      <div className="text-gray-500">DRILL · 09:41</div>
      <div className="border-b border-dashed border-gray-700 my-4" />
      <div className="flex justify-between text-[20px]"><span>47 × 6</span><span>?</span></div>
      <div className="flex justify-between text-gray-500"><span>you said</span><span>242</span></div>
      <div className="border-b border-dashed border-gray-700 my-4" />
      <div className="flex justify-between text-[18px]"><span>40 × 6</span><span>240</span></div>
      <div className="flex justify-between text-[18px]"><span>7 × 6</span><span>42</span></div>
      <div className="border-b border-gray-500 my-2" />
      <div className="flex justify-between text-[22px] font-bold"><span>TOTAL</span><span>282</span></div>
      <div className="border-b border-dashed border-gray-700 my-4" />
      <div className="text-gray-500">technique · split by place</div>
    </div></S>,
    Summary: <S><div className="px-8 pt-16 text-[14px]" style={mono}>
      <div className="text-gray-500">SESSION · 8 MIN</div>
      <div className="border-b border-dashed border-gray-700 my-4" />
      {[["answered","61"],["right","55"],["accuracy","90%"],["median","4.1s"]].map(([k,v]) => <div key={k} className="flex justify-between text-[18px] py-1"><span>{k}</span><span>{v}</span></div>)}
      <div className="border-b border-gray-500 my-2" />
      <div className="text-gray-500 mt-6">thank you · again?</div>
    </div></S>,
  },
};

// ── 3 · Console — dense, honest, shows the machine ───────────────────────
const console_: Direction = {
  id: "console",
  name: "Console",
  seed: "an instrument panel",
  voice: "Dense and exact. Shows the engine's state — belief, rating, budget — for the version of you that wants to see the machine.",
  cells: {
    Practice: <S><div className="px-6 pt-14 text-[12px] text-gray-400 grid grid-cols-3 gap-3" style={mono}><div>6:25</div><div className="text-center">mixed</div><div className="text-right">θ +1.2</div></div><div className="px-6 mt-40 text-[40px]" style={mono}>47 × 6</div><div className="px-6 mt-2 text-[12px] text-gray-500" style={mono}>budget 5.9s · expected 0.84</div></S>,
    Feedback: <S><div className="px-6 pt-14 text-[13px] text-gray-300 grid grid-cols-2 gap-4" style={mono}>
      <div className="col-span-2 flex justify-between text-gray-500"><span>47×6</span><span>miss · 6.1s</span></div>
      <div className="col-span-2 h-px bg-gray-800" />
      <div><div className="text-gray-500">split</div><div className="text-[18px]">40 | 7</div></div>
      <div><div className="text-gray-500">partials</div><div className="text-[18px]">240 + 42</div></div>
      <div className="col-span-2"><div className="text-gray-500">area</div><div className="flex h-16 mt-2"><div className="bg-emerald-500/40 border border-emerald-500" style={{ width: "85%" }} /><div className="bg-sky-500/40 border border-sky-500" style={{ width: "15%" }} /></div></div>
      <div><div className="text-gray-500">belief</div><div>0.71 → 0.58</div></div>
      <div><div className="text-gray-500">rating</div><div>+1.2 → +1.1</div></div>
    </div></S>,
  },
};

export const DIRECTIONS: Direction[] = [blank, ledger, console_];
