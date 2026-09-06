/**
 * Framing — who Drill is for, what it promises, and the program: the session
 * sectioned by focus, recommended then adjustable. Written 2026-09-06 from
 * Erik's answers; the open questions at the end are the next conversation.
 */
import Handle from "@/components/DsHandle";

const PROGRAM: { key: string; name: string; share: number; color: string; what: string; skills: string }[] = [
  { key: "foundations", name: "Foundations", share: 20, color: "bg-gray-400", what: "tables past 12, squares, split-by-place, division — the minute that keeps the rest honest", skills: "ar.*" },
  { key: "percents", name: "Percents & fractions", share: 30, color: "bg-emerald-500", what: "percent of, up, down, reverse, chains; fractions and decimals as the same length", skills: "pct.* · fr.* · dec.*" },
  { key: "magnitude", name: "Magnitude", share: 20, color: "bg-sky-500", what: "place value, powers of ten, scientific notation, million × thousand", skills: "pv.* · exp.* · sn.* · mag.*" },
  { key: "world", name: "The world's numbers", share: 30, color: "bg-amber-400", what: "percent of 2.4 million, per capita, doubling time, growth, unit price — the reason to be here, from the first session", skills: "co.*" },
];

export default function Framing() {
  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-baseline gap-4 mb-1">
        <h1 className="text-lg font-light tracking-tight">Framing</h1>
        <span className="text-[12px] text-gray-500">who it&apos;s for, what it promises, and the program · 2026-09-06</span>
        <span className="ml-auto"><Handle id="framing" /></span>
      </div>
      <p className="text-[13px] text-gray-600 dark:text-gray-300 leading-snug mb-8">
        Drill is a short daily block for someone who wants the world&apos;s numbers at their fingertips. It is built to Erik&apos;s taste with the door open. It shows you data; it never makes claims about you. The problem it has to solve is permission: arithmetic reads as something children do, so the app has to make plain from the first minute that this is adult work — percent of 2.4 million, doubling at 8% a year — with the foundations kept honest in the background.
      </p>

      <h2 className="text-sm mb-2">Who it is for</h2>
      <ol className="text-[13px] text-gray-700 dark:text-gray-300 space-y-3 leading-snug list-decimal pl-5 mb-8">
        <li><b>The person who wants it.</b> Erik: a builder who reads numbers and wants fluency for its own sake — number sense as a way of seeing. A stack of short morning tools for learning and thinking; this is one of them. The primary persona, and the taste check for every decision.</li>
        <li><b>The numbers professional.</b> Analysts, founders, product people; anyone who has to say &ldquo;that&apos;s about 12% of revenue&rdquo; before someone opens a spreadsheet. They do not care about 7 × 8; they care about 15% of 2.4 million and 160 billion over 2 million. The front door: the same product, no changes, adult vocabulary throughout (&ldquo;percent of a big number&rdquo;, &ldquo;doubling time&rdquo;, never a grade level).</li>
        <li><b>The brain-gym person.</b> The Wordle / chess-puzzle ritual: eight hard minutes, a number that moves, the pleasure of getting faster. Served by the same program and by a summary that reads like a training log.</li>
        <li><b>The test-taker.</b> GMAT, GRE, case interviews — no calculator, speed on percents and estimation. Welcome, not designed for: they arrive with a deadline and leave in three months.</li>
      </ol>
      <p className="text-[12px] text-gray-500 mb-8">Not for: the parent brushing up to help a child. Real market, but it embraces the school framing that everything here is built to escape.</p>

      <h2 className="text-sm mb-2">Decided</h2>
      <ul className="text-[13px] text-gray-700 dark:text-gray-300 space-y-1.5 leading-snug list-disc pl-5 mb-8">
        <li><b>The moment:</b> a short block at some point in the day, stackable with other tools. So: instant start, a clean end, no streak nagging.</li>
        <li><b>No claims.</b> No badges, no percentiles, no &ldquo;you&apos;re improving!&rdquo;. Data you can look at when you want to — per skill, per family, over time — like the lifts in a training log.</li>
        <li><b>The world&apos;s numbers from the start.</b> Show the value early: a doubling-time or percent-of-a-million question in the first session, not after a ladder of tables.</li>
        <li><b>Don&apos;t show the whole thing at once.</b> Adults get the program, not the curriculum.</li>
      </ul>

      <h2 className="text-sm mb-2">The program</h2>
      <p className="text-[13px] text-gray-700 dark:text-gray-300 leading-snug mb-4">
        A session is sectioned by focus, the way a workout is: a recommended split you can see up front and change. Four blocks — few, distinct, adult-named. Default for eight minutes:
      </p>
      <div className="flex h-7 rounded-lg overflow-hidden mb-2">{PROGRAM.map((b) => <div key={b.key} className={`${b.color} flex items-center justify-center text-[11px] text-black/80`} style={{ width: `${b.share}%` }}>{b.share}%</div>)}</div>
      <ul className="text-[13px] space-y-1.5 leading-snug mb-4">
        {PROGRAM.map((b) => <li key={b.key} className="flex gap-3"><span className={`mt-[5px] w-2.5 h-2.5 rounded-sm shrink-0 ${b.color}`} /><span><b>{b.name}</b> · {b.share}% ≈ {Math.round(b.share * 0.08 * 10) / 10} min — {b.what}. <span className="text-gray-400">{b.skills}</span></span></li>)}
      </ul>
      <ul className="text-[13px] text-gray-700 dark:text-gray-300 space-y-2 leading-snug list-disc pl-5 mb-8">
        <li><b>The line is the program.</b> The timer line across the top is already the session; make it four coloured segments that drain in order. No new screen: you see at a glance that foundations are the first minute and the world is the last two and a half.</li>
        <li><b>Recommended, then yours.</b> Tap the line (where the length picker lives today) and the sheet shows the split with steppers and the minutes. A <i>recommended</i> button restores the app&apos;s suggestion.</li>
        <li><b>The suggestion is metacognitive and comes from the data.</b> Share follows weakness with floors: a family that is slow or shaky gets more; one that is solid gives a little back. Said in one line, as a suggestion, not a verdict: &ldquo;percents are your slowest family — five more percent there?&rdquo;</li>
        <li><b>Inside a block the engine works as it does now</b> — mastery-weighted, probing, spaced review — restricted to that block&apos;s pool. Review of a miss crosses blocks.</li>
        <li><b>The first session opens on the world.</b> The very first item for a new user is a world item — how long to double at 7% — so the value is shown before the foundations are asked for.</li>
        <li><b>The summary reads by block.</b> Foundations 12/12 · percents 9/11 · magnitude 6/8 · world 5/7, and speed against last week for each. Those are the lifts. Again and the length picker at the top, not the bottom.</li>
      </ul>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-8">
        <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-2">sketch · the line as the program</div>
        <div className="w-[300px] rounded-[14px] bg-black p-3 pt-2">
          <div className="flex h-[3px] rounded overflow-hidden">{PROGRAM.map((b, i) => <div key={b.key} className={i < 2 ? "bg-gray-700" : i === 2 ? b.color : b.color + " opacity-40"} style={{ width: `${b.share}%` }} />)}</div>
          <div className="mt-3 text-[13px] text-gray-100" style={{ fontFamily: "Georgia, serif" }}>15% of 2.4 million</div>
          <div className="mt-1 h-7 w-[70px] rounded-lg border border-gray-700 text-[10px] text-gray-500 flex items-center px-2">amount</div>
        </div>
        <p className="text-[11px] text-gray-500 mt-2">Foundations and percents are spent (grey); magnitude is running; the world is still to come.</p>
      </div>

      <h2 className="text-sm mb-2">Open</h2>
      <ol className="text-[13px] text-gray-700 dark:text-gray-300 space-y-1.5 leading-snug list-decimal pl-5">
        <li>Are these the right four blocks and the right default split? (Combinations could sit inside percents and magnitude rather than be a block of their own; then it is three blocks and the &ldquo;world&rdquo; is a flavour of each.)</li>
        <li>Is a share a share of <i>time</i> or of <i>items</i>? Time matches the workout metaphor; items are what the engine counts today.</li>
        <li>Does the first item of every session open on the world, or only the first session ever?</li>
      </ol>
    </div>
  );
}
