import DsNotes from "@/components/DsNotes";
import Handle from "@/components/DsHandle";

/**
 * Galaxy Brain — pick a view, explore designs that are deliberately nothing like
 * the current one. Divergence only; nothing here is a decision. When a direction
 * has something worth keeping, it moves to Ideas as a concrete mock.
 */
export default function GalaxyBrain() {
  return (
    <div>
      <h1 className="text-2xl font-light tracking-tight">Galaxy Brain</h1>
      <p className="text-sm text-gray-500 mt-1 mb-10 max-w-prose">For each view, a few directions that start from a different feeling rather than a tweak of what exists. Each one names the seed it grew from. Say which has something worth keeping.</p>

      <h2 className="text-lg font-light mb-1 flex items-center gap-2"><Handle id="V2" /> Feedback after a miss</h2>
      <p className="text-sm text-gray-500 mb-4">Today: answer, why, widget, technique card, → bar. Three other places to stand:</p>
      <div className="grid md:grid-cols-3 gap-6">
        <Frame seed="a shop receipt" title="Ledger">
          <div className="font-mono text-[10px] leading-relaxed px-4 pt-5 text-gray-200">
            <div className="text-gray-500">DRILL · 09:41</div>
            <div className="border-b border-dashed border-gray-700 my-2" />
            <Row l="47 × 6" r="?" />
            <Row l="you said" r="242" dim />
            <div className="border-b border-dashed border-gray-700 my-2" />
            <Row l="40 × 6" r="240" />
            <Row l="7 × 6" r="42" />
            <div className="border-b border-gray-500 my-1" />
            <Row l="TOTAL" r="282" bold />
            <div className="border-b border-dashed border-gray-700 my-2" />
            <div className="text-gray-500">technique · split by place</div>
            <div className="text-gray-500">next → any key</div>
          </div>
          <p className="text-[10px] text-gray-500 mt-auto px-4 pb-3">Everything is a line item. No prose, no card. The steps <em>are</em> the receipt.</p>
        </Frame>

        <Frame seed="a chalkboard" title="Chalk">
          <div className="px-5 pt-8 text-gray-100" style={{ fontFamily: "Georgia, serif" }}>
            <div className="text-[11px] text-gray-500 mb-6">47 × 6</div>
            <div className="text-2xl leading-snug">40 sixes is <span className="underline decoration-emerald-500">240</span>.</div>
            <div className="text-2xl leading-snug mt-4 text-gray-400">7 more sixes is 42.</div>
            <div className="text-2xl leading-snug mt-4 text-gray-600">282.</div>
          </div>
          <p className="text-[10px] text-gray-500 mt-auto px-4 pb-3">One sentence at a time, the way a tutor talks. Swipe reveals the next line; the widget is a swipe away.</p>
        </Frame>

        <Frame seed="an instrument panel" title="Console">
          <div className="px-3 pt-4 text-[9px] text-gray-300 font-mono grid grid-cols-2 gap-2">
            <div className="col-span-2 flex justify-between text-gray-500"><span>47×6</span><span>miss · 6.1s</span></div>
            <div className="col-span-2 h-px bg-gray-800" />
            <div><div className="text-gray-500">split</div><div>40 | 7</div></div>
            <div><div className="text-gray-500">partials</div><div>240 + 42</div></div>
            <div className="col-span-2 mt-1"><div className="text-gray-500">area</div><div className="flex h-10 mt-1"><div className="bg-emerald-500/40 border border-emerald-500" style={{ width: "85%" }} /><div className="bg-sky-500/40 border border-sky-500" style={{ width: "15%" }} /></div></div>
            <div><div className="text-gray-500">belief</div><div>0.71 → 0.58</div></div>
            <div><div className="text-gray-500">rating</div><div>+1.2 → +1.1</div></div>
          </div>
          <p className="text-[10px] text-gray-500 mt-auto px-4 pb-3">Dense, honest, shows the engine&apos;s state. For the version of you that wants to see the machine.</p>
        </Frame>
      </div>

      <h2 className="text-lg font-light mt-14 mb-1 flex items-center gap-2"><Handle id="V1" /> Practice</h2>
      <p className="text-sm text-gray-500 mb-4">Today: centered prompt, answer line, keypad. Two other places to stand:</p>
      <div className="grid md:grid-cols-3 gap-6">
        <Frame seed="a teleprompter" title="Stream" screen="V1">
          <div className="px-4 pt-6 text-gray-100 space-y-6">
            <div className="text-[11px] text-gray-600 line-through">36 × 4 = 144</div>
            <div className="text-[11px] text-gray-600 line-through">1/8 → 12.5%</div>
            <div className="text-3xl font-light">47 × 6</div>
            <div className="text-[11px] text-gray-700">15% of 2.4 million</div>
            <div className="text-[11px] text-gray-800">7³</div>
          </div>
          <p className="text-[10px] text-gray-500 mt-auto px-4 pb-3">The queue is visible; answered items scroll up and fade. Rhythm over isolation.</p>
        </Frame>
        <Frame seed="a dial" title="Gauge" screen="V1">
          <div className="px-4 pt-6 text-gray-100">
            <div className="text-3xl font-light text-center">47 × 6</div>
            <div className="mt-8 mx-auto w-28 h-28 rounded-full border-4 border-gray-800 border-t-emerald-500 flex items-center justify-center text-[10px] text-gray-400">4.8s</div>
            <div className="text-center text-[10px] text-gray-500 mt-3">your pace on this skill</div>
          </div>
          <p className="text-[10px] text-gray-500 mt-auto px-4 pb-3">No countdown, no count. Just the one number that matters: are you getting faster on <em>this</em>.</p>
        </Frame>
        <Frame seed="a blank page" title="Nothing" screen="V1">
          <div className="flex-1 flex items-center justify-center text-4xl font-light text-gray-100">47 × 6</div>
          <p className="text-[10px] text-gray-500 mt-auto px-4 pb-3">No timer, no keypad chrome — a numeric keyboard slides up only when you start typing. The question is the whole screen.</p>
        </Frame>
      </div>

      <DsNotes page="galaxybrain" />
    </div>
  );
}

function Frame({ seed, title, children, screen = "V2" }: { seed: string; title: string; children: React.ReactNode; screen?: string }) {
  return (
    <figure>
      <div className="w-full aspect-[9/16] rounded-[20px] border border-gray-300 dark:border-gray-700 bg-black overflow-hidden flex flex-col">{children}</div>
      <figcaption className="mt-2 flex items-baseline gap-2"><Handle id={`G-${screen}-${title}`} /><div className="text-sm">{title}</div><div className="text-[11px] text-gray-500">seed: {seed}</div></figcaption>
    </figure>
  );
}
function Row({ l, r, dim, bold }: { l: string; r: string; dim?: boolean; bold?: boolean }) {
  return <div className={`flex justify-between ${dim ? "text-gray-500" : ""} ${bold ? "font-bold" : ""}`}><span>{l}</span><span className="tabular-nums">{r}</span></div>;
}
