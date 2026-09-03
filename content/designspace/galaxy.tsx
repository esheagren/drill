/**
 * Galaxy Brain data: directions (whole design languages) × the flow.
 * Every mock is authored at a real phone size (390×844) and scaled by the board.
 * Add a direction by adding an entry; leave a step undefined to show "not drawn yet".
 */
import type { ReactNode } from "react";

export const STEPS = ["Practice", "Answering", "Feedback", "Next", "Summary"] as const;
export type Step = (typeof STEPS)[number];

export interface Direction { id: string; name: string; seed: string; voice: string; cells: Partial<Record<Step, ReactNode>> }

// ── helpers ──────────────────────────────────────────────────────────────
const S = ({ children, className = "", bg = "bg-black" }: { children: ReactNode; className?: string; bg?: string }) => (
  <div className={`w-[390px] h-[844px] ${bg} text-gray-100 relative overflow-hidden ${className}`}>{children}</div>
);
const serif = { fontFamily: "Georgia, 'Times New Roman', serif" } as const;
const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" } as const;
const Center = ({ children }: { children: ReactNode }) => <div className="absolute inset-0 flex items-center justify-center">{children}</div>;
const Pad = ({ k = "1234567890.⌫", cls = "" }: { k?: string; cls?: string }) => (
  <div className={`absolute bottom-0 inset-x-0 h-[280px] grid grid-cols-3 grid-rows-4 text-[26px] text-gray-300 ${cls}`}>{[...k].map((c, i) => <div key={i} className="flex items-center justify-center">{c}</div>)}</div>
);

export const DIRECTIONS: Direction[] = [
  {
    id: "blank", name: "Blank page", seed: "a blank page · a chalkboard",
    voice: "Nothing on screen but the number in front of you. When you miss, a tutor speaks in short sentences, one at a time.",
    cells: {
      Practice: <S><Center><div className="text-[44px] font-light">47 × 6</div></Center></S>,
      Answering: <S><div className="absolute inset-x-0 top-[240px] text-center"><div className="text-[44px] font-light">47 × 6</div><div className="text-[44px] font-light text-gray-300 mt-10 tabular-nums">28<span className="text-gray-600">|</span></div></div><Pad cls="bg-[#111] border-t border-[#222]" /></S>,
      Feedback: <S><div className="px-8 pt-16 text-[13px] text-gray-500">47 × 6</div><div className="px-8 mt-10 space-y-8" style={serif}><div className="text-[34px] leading-tight">40 sixes is <span className="underline decoration-emerald-500 decoration-2">240</span>.</div><div className="text-[34px] leading-tight text-gray-400">7 more sixes is 42.</div><div className="text-[34px] leading-tight text-gray-600">282.</div></div></S>,
      Next: <S><Center><div className="text-[44px] font-light text-gray-500">15% of 2.4 million</div></Center></S>,
      Summary: <S><Center><div className="text-center" style={serif}><div className="text-[34px]">Sixty-one.</div><div className="text-[22px] text-gray-400 mt-3">Fifty-five right. Seven minutes.</div></div></Center></S>,
    },
  },
  {
    id: "ledger", name: "Ledger", seed: "a shop receipt",
    voice: "Numbers in columns. No prose. The steps are the receipt; the session is the tape.",
    cells: {
      Practice: <S><div className="px-8 pt-16 text-[13px] text-gray-500" style={mono}>DRILL · 6:25 LEFT</div><div className="px-8 mt-6 text-[36px]" style={mono}>47 × 6</div><div className="px-8 text-[14px] text-gray-500" style={mono}>_______</div></S>,
      Feedback: <S><div className="px-8 pt-16 text-[14px]" style={mono}><div className="text-gray-500">DRILL · 09:41</div><div className="border-b border-dashed border-gray-700 my-4" /><div className="flex justify-between text-[20px]"><span>47 × 6</span><span>?</span></div><div className="flex justify-between text-gray-500"><span>you said</span><span>242</span></div><div className="border-b border-dashed border-gray-700 my-4" /><div className="flex justify-between text-[18px]"><span>40 × 6</span><span>240</span></div><div className="flex justify-between text-[18px]"><span>7 × 6</span><span>42</span></div><div className="border-b border-gray-500 my-2" /><div className="flex justify-between text-[22px] font-bold"><span>TOTAL</span><span>282</span></div></div></S>,
      Summary: <S><div className="px-8 pt-16 text-[14px]" style={mono}><div className="text-gray-500">SESSION · 8 MIN</div><div className="border-b border-dashed border-gray-700 my-4" />{[["answered","61"],["right","55"],["accuracy","90%"],["median","4.1s"]].map(([k,v]) => <div key={k} className="flex justify-between text-[18px] py-1"><span>{k}</span><span>{v}</span></div>)}</div></S>,
    },
  },
  {
    id: "console", name: "Console", seed: "an instrument panel",
    voice: "Dense and exact. Shows the engine's state — belief, rating, budget — for the version of you that wants to see the machine.",
    cells: {
      Practice: <S><div className="px-6 pt-14 text-[12px] text-gray-400 grid grid-cols-3" style={mono}><div>6:25</div><div className="text-center">mixed</div><div className="text-right">θ +1.2</div></div><div className="px-6 mt-40 text-[40px]" style={mono}>47 × 6</div><div className="px-6 mt-2 text-[12px] text-gray-500" style={mono}>budget 5.9s · expected 0.84</div></S>,
      Feedback: <S><div className="px-6 pt-14 text-[13px] text-gray-300 grid grid-cols-2 gap-4" style={mono}><div className="col-span-2 flex justify-between text-gray-500"><span>47×6</span><span>miss · 6.1s</span></div><div className="col-span-2 h-px bg-gray-800" /><div><div className="text-gray-500">split</div><div className="text-[18px]">40 | 7</div></div><div><div className="text-gray-500">partials</div><div className="text-[18px]">240 + 42</div></div><div className="col-span-2"><div className="text-gray-500">area</div><div className="flex h-16 mt-2"><div className="bg-emerald-500/40 border border-emerald-500" style={{ width: "85%" }} /><div className="bg-sky-500/40 border border-sky-500" style={{ width: "15%" }} /></div></div><div><div className="text-gray-500">belief</div><div>0.71 → 0.58</div></div><div><div className="text-gray-500">rating</div><div>+1.2 → +1.1</div></div></div></S>,
    },
  },
  {
    id: "typewriter", name: "Typewriter", seed: "a typewriter",
    voice: "Monospace, one line at a time, a cursor that waits. The question types itself; your answer types after it.",
    cells: {
      Practice: <S><div className="px-8 pt-[300px] text-[30px]" style={mono}>47 × 6 = <span className="animate-pulse">▌</span></div></S>,
      Answering: <S><div className="px-8 pt-[300px] text-[30px]" style={mono}>47 × 6 = 28<span className="animate-pulse">▌</span></div><Pad k="1234567890.⏎" cls="text-gray-500" /></S>,
      Feedback: <S><div className="px-8 pt-[220px] text-[22px] leading-relaxed" style={mono}><div>47 × 6 = <span className="line-through text-gray-500">242</span></div><div className="mt-6">40 × 6 = 240</div><div> 7 × 6 =  42</div><div className="mt-2">        282</div><div className="mt-8 text-gray-500">↵ next</div></div></S>,
      Summary: <S><div className="px-8 pt-[300px] text-[22px] leading-relaxed" style={mono}><div>61 answered</div><div>55 right</div><div>7 min</div><div className="mt-6 text-gray-500">again? y/n ▌</div></div></S>,
    },
  },
  {
    id: "flashcard", name: "Flashcard", seed: "an index card",
    voice: "A white card on a dark table. The question on the front; the answer, and how, on the back. Flip, don't scroll.",
    cells: {
      Practice: <S><Center><div className="w-[330px] h-[210px] bg-white text-black rounded-md shadow-2xl flex items-center justify-center text-[40px]">47 × 6</div></Center></S>,
      Feedback: <S><Center><div className="w-[330px] h-[210px] bg-white text-black rounded-md shadow-2xl p-6 rotate-1"><div className="text-[12px] text-gray-500">back</div><div className="text-[30px] mt-2">282</div><div className="text-[15px] mt-3 text-gray-700">40 × 6 = 240, plus 7 × 6 = 42.</div></div></Center></S>,
      Summary: <S><Center><div className="relative w-[330px] h-[210px]"><div className="absolute inset-0 bg-white rounded-md rotate-3 opacity-40" /><div className="absolute inset-0 bg-white rounded-md -rotate-2 opacity-70" /><div className="absolute inset-0 bg-white text-black rounded-md shadow-2xl flex flex-col items-center justify-center"><div className="text-[40px]">61</div><div className="text-[14px] text-gray-500">cards · 55 right</div></div></div></Center></S>,
    },
  },
  {
    id: "tempo", name: "Tempo", seed: "a metronome",
    voice: "A single thin line sweeps across the top at your target pace. Beat it and it never becomes a clock.",
    cells: {
      Practice: <S><div className="absolute top-0 left-0 h-[3px] bg-emerald-500" style={{ width: "38%" }} /><Center><div className="text-[44px] font-light">47 × 6</div></Center></S>,
      Answering: <S><div className="absolute top-0 left-0 h-[3px] bg-emerald-500" style={{ width: "62%" }} /><Center><div className="text-center"><div className="text-[44px] font-light">47 × 6</div><div className="text-[44px] font-light text-gray-400 mt-8">28</div></div></Center><Pad cls="text-gray-600" /></S>,
      Feedback: <S><div className="absolute top-0 left-0 h-[3px] bg-rose-500 w-full" /><Center><div className="text-center"><div className="text-[44px] font-light">282</div><div className="text-[18px] text-gray-400 mt-6">240 + 42</div><div className="text-[13px] text-gray-600 mt-10">over by 1.4s</div></div></Center></S>,
      Summary: <S><Center><div className="w-[300px]"><div className="text-[13px] text-gray-500 mb-2">pace, this session</div><div className="flex items-end gap-[3px] h-[120px]">{[5,4,6,3,4,3,5,2,3,3,4,2,3,2,2,3,2,2,3,2].map((v,i)=><div key={i} className="flex-1 bg-emerald-500/70" style={{height: v*20}}/>)}</div><div className="text-[13px] text-gray-500 mt-2">61 · faster by 0.8s</div></div></Center></S>,
    },
  },
  {
    id: "headline", name: "Headline", seed: "a newspaper front page",
    voice: "The question is the headline. The explanation is the lede — two sentences a copy editor would let through.",
    cells: {
      Practice: <S bg="bg-[#f4f1ea]" className="text-black"><div className="px-8 pt-24 border-b border-black mx-8 mb-4 text-[11px] tracking-widest" style={serif}>DRILL · EVENING EDITION</div><div className="px-8 text-[52px] leading-none font-bold" style={serif}>47 × 6</div></S>,
      Feedback: <S bg="bg-[#f4f1ea]" className="text-black"><div className="px-8 pt-24 text-[52px] leading-none font-bold" style={serif}>282</div><div className="px-8 mt-6 text-[17px] leading-snug" style={serif}>Forty sixes make 240. Seven more make 42, and the two together make 282 — the split-by-place method, which works for any two-digit number.</div></S>,
    },
  },
  {
    id: "constellation", name: "Constellation", seed: "a night sky",
    voice: "The session is a sky. Each answered question is a star; misses are dim. The question sits small in the middle of it.",
    cells: {
      Practice: <S>{[[40,120],[90,200],[300,90],[330,260],[60,600],[250,700],[140,520],[320,640],[200,300]].map(([x,y],i)=><div key={i} className="absolute w-[4px] h-[4px] rounded-full bg-white" style={{left:x,top:y,opacity:i%3?0.9:0.3}}/>)}<Center><div className="text-[30px] font-light">47 × 6</div></Center></S>,
      Feedback: <S>{[[40,120],[90,200],[300,90],[330,260],[60,600],[250,700],[140,520],[320,640]].map(([x,y],i)=><div key={i} className="absolute w-[4px] h-[4px] rounded-full bg-white opacity-70" style={{left:x,top:y}}/>)}<div className="absolute w-[10px] h-[10px] rounded-full bg-rose-400 left-[190px] top-[410px]" /><Center><div className="text-center mt-24"><div className="text-[30px] font-light">282</div><div className="text-[14px] text-gray-500 mt-3">240 + 42</div></div></Center></S>,
      Summary: <S>{Array.from({length:61},(_,i)=><div key={i} className="absolute w-[5px] h-[5px] rounded-full bg-white" style={{left:20+((i*97)%350),top:80+((i*173)%700),opacity:i%9===0?0.25:0.9}}/>)}<div className="absolute bottom-16 inset-x-0 text-center text-[14px] text-gray-400">61 stars · 6 faint</div></S>,
    },
  },
  {
    id: "spreadsheet", name: "Spreadsheet", seed: "a spreadsheet cell",
    voice: "Every question is a cell; the answer goes in the formula bar. Feedback shows the formula that was really there.",
    cells: {
      Practice: <S bg="bg-white" className="text-black"><div className="h-12 mt-14 border-y border-gray-300 flex items-center px-3 gap-3 text-[14px]" style={mono}><span className="text-gray-400">B2</span><span className="text-gray-300">|</span><span>=47*6</span></div><div className="grid grid-cols-3 text-[13px]" style={mono}>{["","A","B","1","","","2","","▮","3","",""].map((c,i)=><div key={i} className={`h-14 border-b border-r border-gray-200 flex items-center justify-center ${i===8?"bg-blue-50 border-2 border-blue-500":""} ${i%3===0||i<3?"text-gray-400 bg-gray-50":""}`}>{c}</div>)}</div></S>,
      Feedback: <S bg="bg-white" className="text-black"><div className="h-12 mt-14 border-y border-gray-300 flex items-center px-3 gap-3 text-[14px]" style={mono}><span className="text-gray-400">B2</span><span className="text-gray-300">|</span><span>=40*6+7*6</span></div><div className="grid grid-cols-3 text-[13px]" style={mono}>{["","A","B","1","40*6","240","2","7*6","42","3","","282"].map((c,i)=><div key={i} className={`h-14 border-b border-r border-gray-200 flex items-center justify-center ${i===11?"bg-emerald-50 font-bold":""} ${i%3===0||i<3?"text-gray-400 bg-gray-50":""}`}>{c}</div>)}</div></S>,
    },
  },
  {
    id: "dial", name: "Dial", seed: "a wristwatch",
    voice: "One round face. Time is the bezel, the question is the dial, your pace is the second hand.",
    cells: {
      Practice: <S><Center><div className="relative w-[300px] h-[300px] rounded-full border-[6px] border-gray-800" style={{ borderTopColor: "#10b981", borderRightColor: "#10b981" }}><div className="absolute inset-0 flex items-center justify-center text-[36px] font-light">47 × 6</div></div></Center></S>,
      Feedback: <S><Center><div className="relative w-[300px] h-[300px] rounded-full border-[6px] border-rose-500/70"><div className="absolute inset-0 flex flex-col items-center justify-center"><div className="text-[36px] font-light">282</div><div className="text-[13px] text-gray-400">240 + 42</div></div></div></Center></S>,
      Summary: <S><Center><div className="relative w-[300px] h-[300px] rounded-full border-[6px] border-emerald-500"><div className="absolute inset-0 flex flex-col items-center justify-center"><div className="text-[48px] font-light">61</div><div className="text-[13px] text-gray-400">90% · 4.1s</div></div></div></Center></S>,
    },
  },
  {
    id: "deck", name: "Deck", seed: "a stack of cards",
    voice: "The next question is already peeking from underneath. You can feel the stack getting shorter.",
    cells: {
      Practice: <S><Center><div className="relative w-[330px] h-[420px]"><div className="absolute inset-x-6 -bottom-4 h-full rounded-2xl bg-[#1a1a1a]" /><div className="absolute inset-x-3 -bottom-2 h-full rounded-2xl bg-[#222]" /><div className="absolute inset-0 rounded-2xl bg-[#2a2a2a] flex items-center justify-center text-[40px] font-light">47 × 6</div></div></Center></S>,
      Next: <S><Center><div className="relative w-[330px] h-[420px]"><div className="absolute inset-x-3 -bottom-2 h-full rounded-2xl bg-[#222]" /><div className="absolute inset-0 rounded-2xl bg-[#2a2a2a] flex items-center justify-center text-[36px] font-light">15% of 2.4M</div><div className="absolute -top-24 inset-x-8 h-[420px] rounded-2xl bg-[#2a2a2a] opacity-30 -rotate-6" /></div></Center></S>,
      Summary: <S><Center><div className="text-center"><div className="text-[13px] text-gray-500 mb-6">stack</div><div className="mx-auto w-[200px] h-[6px] bg-gray-700 rounded" /><div className="mx-auto w-[200px] h-[6px] bg-gray-700 rounded mt-1" /><div className="text-[40px] font-light mt-8">61</div><div className="text-[13px] text-gray-500">cards turned</div></div></Center></S>,
    },
  },
  {
    id: "hundred", name: "Hundred square", seed: "a hundred square",
    voice: "A faint 10×10 grid behind everything — math's own paper. Answers light cells; splits show as rectangles.",
    cells: {
      Practice: <S><div className="absolute inset-x-[35px] top-[200px] grid grid-cols-10 gap-[3px]">{Array.from({length:100},(_,i)=><div key={i} className="aspect-square rounded-[2px] bg-[#151515]"/>)}</div><Center><div className="text-[44px] font-light bg-black/60 px-4 rounded">47 × 6</div></Center></S>,
      Feedback: <S><div className="absolute inset-x-[35px] top-[200px] grid grid-cols-10 gap-[3px]">{Array.from({length:100},(_,i)=>{const r=Math.floor(i/10),c=i%10;const on=r<6&&c<4;const on2=r<6&&c>=4&&c<5;return <div key={i} className={`aspect-square rounded-[2px] ${on?"bg-emerald-500/60":on2?"bg-sky-500/60":"bg-[#151515]"}`}/>;})}</div><div className="absolute bottom-24 inset-x-0 text-center"><div className="text-[30px] font-light">282</div><div className="text-[13px] text-gray-500">4 tens-columns and one 7 — × 6 rows</div></div></S>,
    },
  },
  {
    id: "lcd", name: "LCD", seed: "a calculator display",
    voice: "Seven-segment digits on a dark panel. Nothing warm, nothing soft — pure readout.",
    cells: {
      Practice: <S bg="bg-[#0b0f0c]"><div className="mx-8 mt-40 h-[120px] bg-[#c7d3c4] rounded flex items-center justify-end px-6 text-[56px] text-[#111]" style={mono}>47×6</div><Pad k="789÷456×123−0.=+" cls="text-[#c7d3c4]/70 grid-cols-4" /></S>,
      Feedback: <S bg="bg-[#0b0f0c]"><div className="mx-8 mt-40 h-[120px] bg-[#c7d3c4] rounded flex items-center justify-end px-6 text-[56px] text-[#111]" style={mono}>282</div><div className="mx-8 mt-4 text-[14px] text-[#c7d3c4]/70 text-right" style={mono}>240+42 · you: 242</div></S>,
    },
  },
  {
    id: "poster", name: "Poster", seed: "a concert poster",
    voice: "Edge-to-edge type, one accent, nothing else. The number should hit you from across the room.",
    cells: {
      Practice: <S bg="bg-[#e8ff47]" className="text-black"><div className="absolute left-4 top-24 text-[150px] leading-[0.85] font-black tracking-tighter">47<br/>×6</div></S>,
      Feedback: <S bg="bg-black"><div className="absolute left-4 top-24 text-[150px] leading-[0.85] font-black tracking-tighter text-[#e8ff47]">282</div><div className="absolute left-5 bottom-24 text-[22px] font-bold">240 + 42</div></S>,
      Summary: <S bg="bg-[#e8ff47]" className="text-black"><div className="absolute left-4 top-24 text-[150px] leading-[0.85] font-black tracking-tighter">61</div><div className="absolute left-5 bottom-24 text-[22px] font-bold">55 RIGHT · 7 MIN</div></S>,
    },
  },
  {
    id: "chat", name: "Conversation", seed: "a chat thread",
    voice: "The trainer asks, you reply, it replies. Feedback is just the next message. Familiar to anyone with a phone.",
    cells: {
      Practice: <S><div className="px-5 pt-20 space-y-3"><div className="max-w-[70%] bg-[#222] rounded-2xl rounded-bl-sm px-4 py-3 text-[20px]">47 × 6?</div></div><div className="absolute bottom-6 inset-x-5 h-12 rounded-full border border-gray-700 flex items-center px-5 text-gray-500">…</div></S>,
      Answering: <S><div className="px-5 pt-20 space-y-3"><div className="max-w-[70%] bg-[#222] rounded-2xl rounded-bl-sm px-4 py-3 text-[20px]">47 × 6?</div><div className="ml-auto max-w-[70%] bg-emerald-600 rounded-2xl rounded-br-sm px-4 py-3 text-[20px] w-fit">28</div></div><div className="absolute bottom-6 inset-x-5 h-12 rounded-full border border-gray-700 flex items-center px-5">28</div></S>,
      Feedback: <S><div className="px-5 pt-20 space-y-3"><div className="max-w-[70%] bg-[#222] rounded-2xl rounded-bl-sm px-4 py-3 text-[20px]">47 × 6?</div><div className="ml-auto bg-emerald-600 rounded-2xl rounded-br-sm px-4 py-3 text-[20px] w-fit line-through opacity-70">242</div><div className="max-w-[80%] bg-[#222] rounded-2xl rounded-bl-sm px-4 py-3 text-[17px] leading-snug">282. Forty sixes are 240, seven more are 42.</div></div></S>,
      Summary: <S><div className="px-5 pt-20 space-y-3"><div className="max-w-[80%] bg-[#222] rounded-2xl rounded-bl-sm px-4 py-3 text-[17px]">That&apos;s eight minutes. 61 answered, 55 right — quicker than yesterday. Again?</div></div></S>,
    },
  },
  {
    id: "notebook", name: "Notebook", seed: "a ruled notebook",
    voice: "Faint rules, a margin, working shown the way you'd write it by hand. Unhurried.",
    cells: {
      Practice: <S bg="bg-[#fbfaf5]" className="text-[#222]"><div className="absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(transparent 0 31px, #d9e3f0 31px 32px)", backgroundPosition: "0 40px" }} /><div className="absolute left-[56px] top-0 bottom-0 w-px bg-rose-300/60" /><div className="absolute left-[72px] top-[168px] text-[30px]" style={serif}>47 × 6 =</div></S>,
      Feedback: <S bg="bg-[#fbfaf5]" className="text-[#222]"><div className="absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(transparent 0 31px, #d9e3f0 31px 32px)", backgroundPosition: "0 40px" }} /><div className="absolute left-[56px] top-0 bottom-0 w-px bg-rose-300/60" /><div className="absolute left-[72px] top-[168px] text-[26px] leading-[32px]" style={serif}><div>47 × 6 =</div><div className="pl-8">40 × 6 = 240</div><div className="pl-8">7 × 6 = 42</div><div className="pl-8 border-t border-[#222] w-fit pr-4">282</div></div></S>,
    },
  },
];
