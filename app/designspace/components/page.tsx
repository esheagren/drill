"use client";

import DsNotes from "@/components/DsNotes";
import Keypad from "@/components/Keypad";
import { AreaModel, LogLine, MultiplierChain } from "@/components/widgets";
import { StackedBars } from "@/components/Stats";

/** Named components, each in isolation. The names are the vocabulary for design requests. */
export default function Components() {
  const noop = () => {};
  return (
    <div>
      <h1 className="text-2xl font-light tracking-tight">Components</h1>
      <p className="text-sm text-gray-500 mt-1 mb-8 max-w-prose">The pieces the views are built from. Name → file, shown live where it can be.</p>

      <Comp name="Timer" file="Trainer.tsx (header)" note="Tap to change session length. Frozen while feedback is up.">
        <div className="text-base tabular-nums text-gray-900 dark:text-gray-100">6:48</div>
      </Comp>
      <Comp name="Prompt" file="Trainer.tsx (main)" note="Item text + the one-line ask under it.">
        <div className="text-center"><div className="text-3xl font-light">47 × 6</div><div className="text-sm text-gray-400">product</div></div>
      </Comp>
      <Comp name="AnswerLine" file="Trainer.tsx" note="Three states: answering, correct (green), wrong (red, struck).">
        <div className="space-y-4 w-64">
          <div className="text-center text-2xl font-light border-b-2 border-gray-200 dark:border-gray-800 py-1">28</div>
          <div className="text-center text-2xl font-light border-b-2 border-emerald-500 text-emerald-600 py-1">282</div>
          <div className="text-center text-2xl font-light border-b-2 border-rose-400 text-rose-500 line-through py-1">242</div>
        </div>
      </Comp>
      <Comp name="Keypad" file="Keypad.tsx" note="Digits, ., e, /, ⌫, ↵. The only input surface.">
        <div className="w-72 scale-90 origin-top-left"><Keypad onKey={noop} onBackspace={noop} onSubmit={noop} /></div>
      </Comp>
      <Comp name="TechniqueCard" file="Trainer.tsx · lib/tips.ts" note="Title, rule, example. Green outline on slow-correct, neutral on a miss.">
        <div className="max-w-sm rounded-xl border border-emerald-500 px-4 py-3">
          <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">Split the two-digit number by place</div>
          <div className="text-sm">Multiply the tens part and the ones part by the one-digit number separately, then add.</div>
          <div className="text-xs text-gray-500 mt-1 tabular-nums">47 × 6: 40×6 = 240, 7×6 = 42 → 282</div>
        </div>
      </Comp>
      <Comp name="PlayWithIt" file="Trainer.tsx · lib/widgetSeed.ts · widgets.tsx" note="A widget seeded with the missed item's numbers. Three widgets exist:">
        <div className="grid md:grid-cols-3 gap-4 w-full">
          <Card label="AreaModel"><AreaModel initialA={47} initialB={6} compact /></Card>
          <Card label="MultiplierChain"><MultiplierChain initialBase={250000} initialChanges={[40, -25]} compact /></Card>
          <Card label="LogLine"><LogLine compact /></Card>
        </div>
      </Comp>
      <Comp name="NextBar" file="Trainer.tsx" note="Full-width → in the keypad's place during feedback.">
        <div className="w-72 h-12 rounded-2xl bg-gray-900 text-white dark:bg-gray-100 dark:text-black text-2xl flex items-center justify-center">→</div>
      </Comp>
      <Comp name="MasteryDot" file="Stats.tsx" note="Solid: observed (grey not started · amber weak · blue developing · green fluent). Hollow: inferred.">
        <div className="flex gap-4 items-center text-xs text-gray-500">
          {[["#9ca3af", "not started"], ["#f59e0b", "weak"], ["#38bdf8", "developing"], ["#10b981", "fluent"]].map(([c, l]) => <span key={l} className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />{l}</span>)}
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full border-2 border-sky-400" />inferred</span>
        </div>
      </Comp>
      <Comp name="StackedBars" file="Stats.tsx" note="History chart: one hue in lightness steps, 2px gaps, totals on top, hover tooltip.">
        <div className="w-full max-w-md"><StackedBars yLabel="questions" columns={[{ label: "08-27", segments: [{ value: 84, tip: "1" }] }, { label: "08-28", segments: [{ value: 120, tip: "1" }, { value: 61, tip: "2" }, { value: 56, tip: "3" }] }, { label: "08-29", segments: [{ value: 98, tip: "1" }, { value: 61, tip: "2" }] }]} /></div>
      </Comp>
      <Comp name="ItemMap" file="Stats.tsx · lib/maps.ts" note="Per-problem fluency grid/strip; one spec per subsection.">
        <div className="grid gap-[2px]" style={{ gridTemplateColumns: "repeat(10, 18px)" }}>
          {Array.from({ length: 30 }, (_, i) => <div key={i} className="w-[18px] h-[18px] rounded-[3px] border border-gray-200 dark:border-gray-800" style={{ background: i % 7 === 0 ? "transparent" : i % 5 === 0 ? "#38bdf8" : "#10b981", opacity: 0.5 + ((i % 4) / 6) }} />)}
        </div>
      </Comp>
      <Comp name="UnitTree" file="Stats.tsx (UnitHierarchy)" note="Unit → subsection → band rows with dots and play buttons.">
        <div className="text-sm space-y-1 w-64">
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />Times tables<span className="ml-auto text-[11px] border border-gray-200 dark:border-gray-800 rounded-lg px-2">2 min ▸</span></div>
          <div className="pl-5 text-xs text-gray-500 space-y-1"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500" />0–12</div><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-gray-400" />13–20</div></div>
        </div>
      </Comp>
      <Comp name="Sheet" file="Trainer.tsx" note="Bottom sheet on phones, centered card on desktop. Used for session length and the default prompt.">
        <div className="w-72 rounded-3xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 p-4"><div className="text-sm mb-3">Session length</div><div className="grid grid-cols-4 gap-2">{[2, 4, 8, 12].map((m) => <div key={m} className={`h-10 rounded-2xl text-sm flex items-center justify-center border ${m === 8 ? "border-gray-900 dark:border-gray-100" : "border-gray-200 dark:border-gray-800 text-gray-500"}`}>{m}m</div>)}</div></div>
      </Comp>
      <Comp name="OverlayNav" file="Stats.tsx" note="History · Skills → units · Profile. Sidebar on wide screens, tab row on phones.">
        <div className="text-sm space-y-1 w-48"><div className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-900">History</div><div className="px-3 py-1.5 text-gray-500">Skills</div><div className="pl-6 text-[13px] text-gray-500 space-y-1"><div>Multiplicative arithmetic</div><div>Fractions</div><div>…</div></div><div className="px-3 py-1.5 text-gray-500">Profile</div></div>
      </Comp>
      <Comp name="AccountForm" file="Account.tsx · Onboarding.tsx" note="Name, connect email (+confirm), sign in.">
        <div className="w-64 space-y-2 text-sm"><div className="h-10 rounded-xl border border-gray-200 dark:border-gray-800 px-3 flex items-center text-gray-400">email</div><div className="h-10 rounded-xl border border-gray-200 dark:border-gray-800 px-3 flex items-center text-gray-400">password</div><div className="h-10 rounded-xl bg-gray-900 text-white dark:bg-gray-100 dark:text-black flex items-center justify-center">connect</div></div>
      </Comp>

      <DsNotes page="components" />
    </div>
  );
}

function Comp({ name, file, note, children }: { name: string; file: string; note: string; children: React.ReactNode }) {
  return (
    <section className="mb-10 grid md:grid-cols-[220px_1fr] gap-4 items-start">
      <div>
        <div className="text-base">{name}</div>
        <div className="text-[11px] text-gray-400 font-mono">{file}</div>
        <div className="text-[12px] text-gray-500 mt-1">{note}</div>
      </div>
      <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-800 p-4 overflow-x-auto">{children}</div>
    </section>
  );
}
function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-3"><div className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">{label}</div>{children}</div>;
}
