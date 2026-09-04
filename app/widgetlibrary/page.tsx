"use client";

/**
 * /widgetlibrary — the vetted bench of interactive widgets. A widget earns a
 * place in the trainer only after it feels right here. Deliberately small:
 * three pictures that each explain a whole family of techniques.
 */
import { useState } from "react";
import { AreaModel, LogLine, PercentBar } from "@/components/widgets";
import { percentRowsFor } from "@/lib/percentSteps";

export default function WidgetLibrary() {
  const [preset, setPreset] = useState<[number, number]>([47, 6]);
  const [pct, setPct] = useState("pctch:up30,down5%500000");
  const PCT: [string, string][] = [["pctch:up30,down5%500000", "500,000 up 30%, then down 5%"], ["pctap:up18%64000", "64,000 up 18%"], ["pcta:5%940", "5% of 940"], ["pctc:75%400", "75% of 400"], ["pctr:off20%200", "after 20% off: 160"], ["pctf:down30%1200", "1,200 → 840"], ["cpb:15%2.4e6", "15% of 2.4 million"], ["cgr:10%x3y1000", "1,000 growing 10% for 3 years"]];
  const presets: [number, number][] = [[47, 6], [98, 7], [34, 11], [16, 35]];
  return (
    <div className="min-h-dvh bg-white dark:bg-black text-gray-900 dark:text-gray-100">
      <div className="max-w-2xl mx-auto px-5 py-10">
        <h1 className="text-2xl font-light tracking-tight">Widget library</h1>
        <p className="text-sm text-gray-500 mt-1 mb-10">
          Three pictures, each carrying a whole family of techniques. A widget ships into practice only once it&apos;s
          good here. In practice they appear after a miss, pre-loaded with that problem&apos;s numbers. (Bench candidate
          for later: a fraction bar.)
        </p>

        <Shelf
          title="Area model"
          serves="two-digit × one-digit · ×11 · ×5/×25 · squares — anything that splits a product"
          note="Multiplication is a rectangle; a split is a cut. Every 'distributive' trick is just choosing where to cut."
        >
          <div className="flex gap-1.5 mb-3">
            {presets.map(([pa, pb]) => (
              <button key={`${pa}x${pb}`} onClick={() => setPreset([pa, pb])}
                className={`px-2 py-0.5 rounded-lg text-[11px] tabular-nums border ${preset[0] === pa && preset[1] === pb ? "border-gray-900 dark:border-gray-100" : "border-gray-200 dark:border-gray-800 text-gray-500"}`}>
                {pa}×{pb}
              </button>
            ))}
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <AreaModel key={`${preset[0]}x${preset[1]}`} initialA={preset[0]} initialB={preset[1]} />
            <p className="text-[11px] text-gray-400 mt-1">Cut at the tens and the pieces are easy. Cut anywhere else and the total never changes — that&apos;s the whole trick.</p>
          </div>
        </Shelf>

        <Shelf
          title="Percent steps"
          serves="percent of · percent change · reverse percent · successive changes · compound growth"
          note="Worked the way you'd do it in your head: find 10%, build the percent from tenths, halves of a tenth and hundredths (or a round number minus a little), then add it on or take it off. Each step is a sentence and a bar; tap for the next."
        >
          <div className="flex flex-wrap gap-1.5 mb-3">
            {PCT.map(([k, label]) => (
              <button key={k} type="button" onClick={() => setPct(k)}
                className={`px-2 py-0.5 rounded-lg text-[11px] tabular-nums border ${pct === k ? "border-gray-900 dark:border-gray-100" : "border-gray-200 dark:border-gray-800 text-gray-500"}`}>{label}</button>
            ))}
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <PercentBar key={pct} rows={percentRowsFor(pct)!} allAtOnce />
          </div>
        </Shelf>

        <Shelf
          title="Log number line"
          serves="scale words · scientific notation · magnitude · why multiplying adds exponents"
          note="On a log line, ×10 is one step and multiplication is laying lengths end to end. This is the picture under the whole top of the app."
        >
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <LogLine />
            <p className="text-[11px] text-gray-400 mt-1">Each tick is ×10. Multiplying lays the two lengths end to end — that&apos;s why the exponents add.</p>
          </div>
        </Shelf>
      </div>
    </div>
  );
}

function Shelf({ title, serves, note, children }: { title: string; serves: string; note: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="text-lg font-light">{title}</h2>
      <div className="text-[11px] uppercase tracking-wide text-gray-400 mt-0.5">{serves}</div>
      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 mb-4 max-w-prose">{note}</p>
      {children}
    </section>
  );
}

