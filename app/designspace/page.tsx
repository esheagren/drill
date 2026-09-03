import Link from "next/link";
import DsNotes from "@/components/DsNotes";

export default function DsOverview() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-light tracking-tight">Designspace</h1>
      <p className="text-sm text-gray-500 mt-1 mb-8">The room where Drill&apos;s design gets worked on. Private; nothing here is user-facing.</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {[
          ["/designspace/catalog", "Catalog", "Every page and view state, live, with its canonical name — so we can say “V3” and mean the same thing."],
          ["/designspace/components", "Components", "The named pieces the views are built from, each shown in isolation."],
          ["/designspace/galaxybrain", "Galaxy Brain", "Pick a view and explore designs that are deliberately nothing like the current one."],
          ["/designspace/principles", "Principles", "The rules we hold ourselves to, distilled from the best writing on doing this well with AI."],
          ["/designspace/ideas", "Ideas", "The dated sketchbook: small mockups of specific interactions, newest first."],
        ].map(([href, t, d]) => (
          <Link key={href} href={href} className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-950">
            <div className="text-base">{t}</div>
            <div className="text-[13px] text-gray-500 mt-1">{d}</div>
          </Link>
        ))}
      </div>
      <h2 className="text-base mt-10 mb-2">How to work in here</h2>
      <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1.5 list-disc pl-5">
        <li>Every page has a <b>Notes</b> box at the bottom. Write reactions or asks there; they save to the database and Claude reads them when you point it at the page (“look at my notes on the catalog”).</li>
        <li>Names in the Catalog and Components pages are the vocabulary. Use them in requests: “V2 should…”, “the TechniqueCard is too…”.</li>
        <li>Galaxy Brain is for divergence, not decisions. Say which direction has something worth keeping and it moves to Ideas as a concrete mock, then to the app.</li>
      </ul>
      <DsNotes page="overview" />
    </div>
  );
}
