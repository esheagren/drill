import Link from "next/link";
import Handle from "@/components/DsHandle";
import { CHANGES } from "@/content/designspace/changes";

export default function DsRoom() {
  return (
    <div className="grid lg:grid-cols-[1fr_300px] gap-12">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-light tracking-tight">The room</h1>
        <p className="text-sm text-gray-500 mt-1 mb-8">Drill&apos;s design, on a wall you and Claude can both point at. You work in the terminal; this is where the pictures are.</p>

        <h2 className="text-sm font-medium mb-2">How it works</h2>
        <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-2 list-decimal pl-5 mb-8">
          <li><b>Everything has a handle.</b> Screens are <Handle id="V2" />, components are <Handle id="V2 › TechniqueCard" />, options are <Handle id="D-keypad/e-slash-column" />, ideas are <Handle id="I-3" />. Click any handle to copy it, paste it into the terminal.</li>
          <li><b>★ shortlists, ✕ rules out, status files it.</b> Star as many options as you like — a star means “I like this one”. ✕ hides an option (tick “show the ✕” to see it again). The version at the top of Decisions uses the starred option; when several are starred, a small picker there says which one goes in. Set a decision to <i>decided</i> when the pick is final; set it back to reopen.</li>
          <li><b>Write on the wall, then hand it over.</b> Every screen has notes pinned to it — or to one of its components. When you&apos;re done, hit <b>copy all feedback</b> (top right, or per screen / per note) and paste the block into the terminal. Each note arrives under its handle, so Claude knows exactly what you meant.</li>
          <li><b>Ships come back to the wall.</b> The Changes feed lists what landed, keyed to screens, so you can see the state of things without re-reading the terminal.</li>
        </ol>

        <h2 className="text-sm font-medium mb-2">Things you can say</h2>
        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1.5 mb-8 font-mono text-[13px]">
          <li>“D-keypad: options for a left-handed layout, and one with e and / as long-press”</li>
          <li>“read my notes on the Screens wall and do the ones marked !”</li>
          <li>“build the version” — implement what the Decisions page shows at the top</li>
          <li>“D-timer: redesign” with the brief pasted — work on one decision</li>
          <li>“design W-bar” — start the design process for one picture from the Widgets list</li>
          <li>“promote I-3 to the app”</li>
          <li>“what changed on V1 since Tuesday?”</li>
        </ul>

        <h2 className="text-sm font-medium mb-2">Places</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            ["/designspace/screens", "Screens", "The wall. Every view, live, with components called out and notes pinned."],
            ["/designspace/decisions", "Decisions", "The version at the top, composed from what's starred. Below it the decisions by status: working on, later, decided."],
            ["/designspace/widgets", "Widgets", "The K-12 ideas ranked for Drill, the representations for each, and the four pictures that carry them."],
            ["/designspace/ideas", "Ideas", "Dated mockups of specific interactions, on their way to the app."],
            ["/designspace/principles", "Principles", "What we hold the work to."],
          ].map(([href, t, d]) => (
            <Link key={href} href={href} className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-950">
              <div className="text-base">{t}</div><div className="text-[13px] text-gray-500 mt-1">{d}</div>
            </Link>
          ))}
        </div>
      </div>

      <aside className="lg:sticky lg:top-16 self-start">
        <div className="text-[11px] uppercase tracking-wide text-gray-400 mb-2">Changes</div>
        <ul className="space-y-2.5 text-[12px]">
          {CHANGES.map((c, i) => (
            <li key={i} className="grid grid-cols-[52px_1fr] gap-2">
              <span className="text-gray-400 tabular-nums">{c.date.slice(5)}</span>
              <span><Handle id={c.screen} className="mr-1" />{c.what} <a className="text-gray-400" href={`https://github.com/esheagren/drill/pull/${c.pr}`}>#{c.pr}</a></span>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
