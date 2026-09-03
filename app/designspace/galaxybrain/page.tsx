"use client";

/**
 * Galaxy Brain — a board. Columns: the flow. Rows: directions (whole design
 * languages, each from a named seed). Star cells; play a direction end to end;
 * your stars compose a flow at the top. Divergence lives here; convergence
 * (specific changes to the current design) lives in Ideas.
 */
import { useEffect, useState, type ReactNode } from "react";
import DsNotes from "@/components/DsNotes";
import Handle from "@/components/DsHandle";
import PhoneFrame from "@/components/PhoneFrame";
import { Star, useStars } from "@/components/DsStar";
import { DIRECTIONS, STEPS, type Direction, type Step } from "@/content/designspace/galaxy";

const cellId = (d: Direction, s: Step) => `G-${d.id}/${s}`;

export default function GalaxyBrain() {
  const { stars, toggle } = useStars();
  const [play, setPlay] = useState<{ d: Direction; i: number } | null>(null);
  const composed = STEPS.map((s) => DIRECTIONS.find((d) => stars.has(cellId(d, s)) && d.cells[s]) ?? null);
  const anyStars = composed.some(Boolean);

  useEffect(() => {
    if (!play) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setPlay(null); if (e.key === "ArrowRight") setPlay((p) => p && { ...p, i: Math.min(STEPS.length - 1, p.i + 1) }); if (e.key === "ArrowLeft") setPlay((p) => p && { ...p, i: Math.max(0, p.i - 1) }); };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, [play]);

  return (
    <div>
      <h1 className="text-2xl font-light tracking-tight">Galaxy Brain</h1>
      <p className="text-sm text-gray-500 mt-1 mb-2 max-w-prose">Across: the flow. Down: directions — whole languages, not screens, each grown from a named seed. Star what has something in it. Play a row to walk its flow. Your stars compose a flow at the top.</p>
      <p className="text-[12px] text-gray-400 mb-8 max-w-prose">Screens = what exists · Galaxy Brain = whole languages · Ideas = specific changes to the current design. A direction moves to Ideas when it&apos;s worth dialing in.</p>

      {/* composed flow from stars */}
      <section className="mb-10">
        <div className="flex items-baseline gap-3 mb-2"><h2 className="text-base">Your flow</h2><span className="text-[12px] text-gray-500">{anyStars ? "composed from your stars — one cell per step" : "star cells below and they appear here, in order"}</span></div>
        <div className="grid grid-cols-5 gap-3">
          {STEPS.map((s, i) => (
            <div key={s}>
              <div className="text-[11px] text-gray-400 mb-1">{s}</div>
              {composed[i]
                ? <div><PhoneFrame title={`${s} · ${composed[i]!.name}`}>{composed[i]!.cells[s]}</PhoneFrame><div className="text-[11px] text-gray-500 mt-1">{composed[i]!.name}</div></div>
                : <div className="w-full rounded-[22px] border border-dashed border-gray-200 dark:border-gray-800" style={{ aspectRatio: "390/844" }} />}
            </div>
          ))}
        </div>
      </section>

      {/* the board */}
      <div className="overflow-x-auto">
        <table className="border-separate border-spacing-0 min-w-[980px] w-full">
          <thead>
            <tr>
              <th className="text-left align-bottom pb-2 pr-4 w-56"><span className="text-[11px] uppercase tracking-wide text-gray-400">direction</span></th>
              {STEPS.map((s) => <th key={s} className="text-left align-bottom pb-2 px-2"><span className="text-[11px] uppercase tracking-wide text-gray-400">{s}</span></th>)}
            </tr>
          </thead>
          <tbody>
            {DIRECTIONS.map((d) => (
              <tr key={d.id} className="align-top">
                <td className="pr-4 pt-4 border-t border-gray-100 dark:border-gray-900">
                  <div className="flex items-center gap-2"><Handle id={`G-${d.id}`} /><span className="text-base">{d.name}</span></div>
                  <div className="text-[11px] text-gray-400 mt-1">seed: {d.seed}</div>
                  <p className="text-[12px] text-gray-500 mt-2">{d.voice}</p>
                  <button onClick={() => setPlay({ d, i: 0 })} className="mt-3 text-[11px] px-2 py-1 rounded-md border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-400">▶ play the flow</button>
                </td>
                {STEPS.map((s) => {
                  const id = cellId(d, s); const cell = d.cells[s];
                  return (
                    <td key={s} className="px-2 pt-4 border-t border-gray-100 dark:border-gray-900">
                      <div className="relative group">
                        {cell
                          ? <PhoneFrame title={`${d.name} · ${s}`}>{cell as ReactNode}</PhoneFrame>
                          : <div className="w-full rounded-[22px] border border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-center text-[11px] text-gray-400" style={{ aspectRatio: "390/844" }}>not drawn yet<br />star to ask for it</div>}
                        <div className="absolute top-2 right-2"><Star id={id} stars={stars} toggle={toggle} /></div>
                      </div>
                      <div className="mt-1"><Handle id={id} className="text-[10px]" /></div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[12px] text-gray-400 mt-4">To add a direction: name a seed in the terminal (“galaxy: a wristwatch”) and it becomes a row. To dial one in: “promote G-blank to Ideas”.</p>

      {play && (
        <div className="fixed inset-0 z-30 bg-black/70 flex items-center justify-center" onClick={() => setPlay(null)}>
          <div className="w-[300px]" onClick={(e) => e.stopPropagation()}>
            <div className="text-white text-sm mb-2 flex items-baseline justify-between"><span>{play.d.name} · {STEPS[play.i]}</span><span className="text-[11px] text-gray-400">← → · esc</span></div>
            <PhoneFrame title={`${play.d.name} · ${STEPS[play.i]}`}>{play.d.cells[STEPS[play.i]] ?? <div className="w-[390px] h-[844px] bg-black flex items-center justify-center text-gray-500">not drawn yet</div>}</PhoneFrame>
            <div className="flex justify-between mt-2">
              <button onClick={() => setPlay({ ...play, i: Math.max(0, play.i - 1) })} className="text-white/80 px-3 py-1">←</button>
              <button onClick={() => setPlay({ ...play, i: Math.min(STEPS.length - 1, play.i + 1) })} className="text-white/80 px-3 py-1">→</button>
            </div>
          </div>
        </div>
      )}

      <DsNotes page="galaxybrain" />
    </div>
  );
}
