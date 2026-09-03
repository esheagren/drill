import DsNotes from "@/components/DsNotes";
import { PRINCIPLES, SOURCE } from "@/content/designspace/principles";

export default function Principles() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-light tracking-tight">Principles</h1>
      <p className="text-sm text-gray-500 mt-1 mb-2 max-w-prose">Distilled from <a className="underline" href={SOURCE.url}>{SOURCE.title}</a> — {SOURCE.author}, {SOURCE.where} — with a line on how each applies to Drill.</p>
      <p className="text-[12px] text-gray-400 mb-8">Source file: <code>content/designspace/principles.ts</code> — edit there, or leave notes below.</p>
      <ol className="space-y-7">
        {PRINCIPLES.map((p, i) => (
          <li key={p.title} className="grid grid-cols-[28px_1fr] gap-3">
            <div className="text-gray-300 dark:text-gray-700 tabular-nums text-sm pt-0.5">{i + 1}</div>
            <div>
              <div className="text-base">{p.title}</div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{p.idea}</p>
              <p className="text-sm mt-1.5"><span className="text-[10px] uppercase tracking-wide text-gray-400 mr-2">here</span>{p.here}</p>
            </div>
          </li>
        ))}
      </ol>
      <DsNotes page="principles" />
    </div>
  );
}
