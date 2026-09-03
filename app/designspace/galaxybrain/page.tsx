"use client";

/**
 * Galaxy Brain — a contact sheet. By step: every direction's take on one step,
 * side by side, small and honest; click for full size. By direction: one
 * language read across the flow. Stars narrow the funnel; your stars compose
 * a flow. Divergence lives here; convergence lives in Ideas.
 */
import { useEffect, useMemo, useState, type ReactNode } from "react";
import DsNotes from "@/components/DsNotes";
import Handle from "@/components/DsHandle";
import { Star, useStars } from "@/components/DsStar";
import { DIRECTIONS, STEPS, type Direction, type Step } from "@/content/designspace/galaxy";

const W = 390, H = 844;
const cellId = (d: Direction, s: Step) => `G-${d.id}/${s}`;

/** A phone-size mock scaled to a fixed thumbnail width (no ResizeObserver — hundreds of these). */
function Thumb({ children, width, onClick, active }: { children: ReactNode; width: number; onClick?: () => void; active?: boolean }) {
  const k = width / W;
  return (
    <div onClick={onClick} className={`overflow-hidden bg-black cursor-zoom-in ${active ? "ring-2 ring-amber-400" : "ring-1 ring-gray-300 dark:ring-gray-800 hover:ring-gray-500"}`} style={{ width, height: H * k, borderRadius: Math.max(6, 22 * k) }}>
      <div style={{ width: W, height: H, transform: `scale(${k})`, transformOrigin: "top left", pointerEvents: "none" }}>{children}</div>
    </div>
  );
}

const Ghost = ({ width, children }: { width: number; children?: ReactNode }) => (
  <div className="border border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-center text-[10px] text-gray-400 text-center px-2" style={{ width, height: (H * width) / W, borderRadius: Math.max(6, (22 * width) / W) }}>{children}</div>
);

export default function GalaxyBrain() {
  const { stars, toggle } = useStars();
  const [lens, setLens] = useState<"step" | "direction">("step");
  const [width, setWidth] = useState(132);
  const [onlyStars, setOnlyStars] = useState(false);
  const [open, setOpen] = useState<{ d: Direction; s: Step } | null>(null);

  useEffect(() => { try { const w = +(localStorage.getItem("ds:thumb") ?? ""); if (w) setWidth(w); const l = localStorage.getItem("ds:lens"); if (l === "step" || l === "direction") setLens(l); } catch {} }, []);
  const setW = (w: number) => { setWidth(w); try { localStorage.setItem("ds:thumb", String(w)); } catch {} };
  const setL = (l: "step" | "direction") => { setLens(l); try { localStorage.setItem("ds:lens", l); } catch {} };

  const composed = useMemo(() => STEPS.map((s) => DIRECTIONS.find((d) => stars.has(cellId(d, s)) && d.cells[s]) ?? null), [stars]);

  // lightbox navigation: within the same step (by step) or along the flow (by direction)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        const dir = e.key === "ArrowRight" ? 1 : -1;
        setOpen((o) => {
          if (!o) return o;
          if (lens === "step") { const ds = DIRECTIONS.filter((d) => d.cells[o.s]); const i = ds.findIndex((d) => d.id === o.d.id); return { d: ds[(i + dir + ds.length) % ds.length], s: o.s }; }
          const i = STEPS.indexOf(o.s); const s = STEPS[Math.min(STEPS.length - 1, Math.max(0, i + dir))]; return { d: o.d, s };
        });
      }
      if (e.key === "s" && open) toggle(cellId(open.d, open.s));
    };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, [open, lens, toggle]);

  const visible = (d: Direction, s: Step) => !onlyStars || stars.has(cellId(d, s));

  return (
    <div>
      {/* toolbar */}
      <div className="sticky top-11 z-[5] -mx-5 px-5 py-2 bg-white/90 dark:bg-black/90 backdrop-blur border-b border-gray-100 dark:border-gray-900 flex flex-wrap items-center gap-4 text-[12px]">
        <h1 className="text-lg font-light tracking-tight mr-2">Galaxy Brain</h1>
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
          {(["step", "direction"] as const).map((l) => <button key={l} onClick={() => setL(l)} className={`px-3 py-1 ${lens === l ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-black" : "text-gray-500"}`}>by {l}</button>)}
        </div>
        <label className="flex items-center gap-2 text-gray-500">size<input type="range" min={84} max={260} step={4} value={width} onChange={(e) => setW(+e.target.value)} className="w-28 accent-gray-500" /></label>
        <label className="flex items-center gap-1.5 text-gray-500"><input type="checkbox" checked={onlyStars} onChange={(e) => setOnlyStars(e.target.checked)} className="accent-amber-500" />starred only</label>
        <span className="text-gray-400 ml-auto">{DIRECTIONS.length} directions · {stars.size} starred · click a thumbnail for full size · ← → · s to star</span>
      </div>

      {/* composed flow */}
      <section className="mt-6 mb-8">
        <div className="flex items-baseline gap-3 mb-2"><h2 className="text-sm">Your flow</h2><span className="text-[11px] text-gray-500">{composed.some(Boolean) ? "one starred cell per step" : "star cells and they line up here"}</span></div>
        <div className="flex gap-3">
          {STEPS.map((s, i) => (
            <div key={s}>
              <div className="text-[10px] text-gray-400 mb-1">{s}</div>
              {composed[i] ? <Thumb width={width} onClick={() => setOpen({ d: composed[i]!, s })}>{composed[i]!.cells[s]}</Thumb> : <Ghost width={width} />}
              {composed[i] && <div className="text-[10px] text-gray-500 mt-1 truncate" style={{ width }}>{composed[i]!.name}</div>}
            </div>
          ))}
        </div>
      </section>

      {lens === "step" ? (
        <div className="space-y-8">
          {STEPS.map((s) => {
            const ds = DIRECTIONS.filter((d) => visible(d, s));
            return (
              <section key={s}>
                <div className="flex items-baseline gap-3 mb-2"><h2 className="text-sm">{s}</h2><span className="text-[11px] text-gray-400">{DIRECTIONS.filter((d) => d.cells[s]).length} drawn</span></div>
                <div className="flex flex-wrap gap-3">
                  {ds.map((d) => {
                    const id = cellId(d, s);
                    return (
                      <div key={d.id} style={{ width }}>
                        {d.cells[s] ? <Thumb width={width} onClick={() => setOpen({ d, s })} active={stars.has(id)}>{d.cells[s]}</Thumb> : <Ghost width={width}>not drawn<br />star to ask</Ghost>}
                        <div className="flex items-center justify-between mt-1"><span className="text-[10px] text-gray-500 truncate">{d.name}</span><Star id={id} stars={stars} toggle={toggle} size={14} /></div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="space-y-6">
          {DIRECTIONS.filter((d) => !onlyStars || STEPS.some((s) => stars.has(cellId(d, s)))).map((d) => (
            <section key={d.id} className="flex gap-6 items-start">
              <div className="w-52 shrink-0 pt-1">
                <div className="flex items-center gap-2"><Handle id={`G-${d.id}`} /><span className="text-sm">{d.name}</span></div>
                <div className="text-[10px] text-gray-400 mt-1">seed: {d.seed}</div>
                <p className="text-[11px] text-gray-500 mt-2 leading-snug">{d.voice}</p>
              </div>
              <div className="flex gap-3">
                {STEPS.map((s) => {
                  const id = cellId(d, s);
                  return (
                    <div key={s} style={{ width }}>
                      {d.cells[s] ? <Thumb width={width} onClick={() => setOpen({ d, s })} active={stars.has(id)}>{d.cells[s]}</Thumb> : <Ghost width={width}>{s}<br />not drawn</Ghost>}
                      <div className="flex items-center justify-between mt-1"><span className="text-[10px] text-gray-400">{s}</span><Star id={id} stars={stars} toggle={toggle} size={14} /></div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      <p className="text-[11px] text-gray-400 mt-8">Add a direction: “galaxy: a wristwatch”. Draw a missing cell: star it. Dial one in: “promote G-blank to Ideas”.</p>

      {/* lightbox */}
      {open && (
        <div className="fixed inset-0 z-30 bg-black/80 flex items-center justify-center gap-8 p-6" onClick={() => setOpen(null)}>
          <div onClick={(e) => e.stopPropagation()} className="flex items-stretch gap-8">
            <div className="overflow-hidden rounded-[22px] ring-1 ring-gray-700 bg-black" style={{ width: W * 0.85, height: H * 0.85 }}>
              <div style={{ width: W, height: H, transform: "scale(0.85)", transformOrigin: "top left" }}>{open.d.cells[open.s] ?? <div className="w-[390px] h-[844px] flex items-center justify-center text-gray-500">not drawn yet</div>}</div>
            </div>
            <div className="w-64 text-gray-200 flex flex-col">
              <div className="flex items-center gap-2"><Handle id={cellId(open.d, open.s)} /><Star id={cellId(open.d, open.s)} stars={stars} toggle={toggle} size={22} /></div>
              <div className="text-xl font-light mt-3">{open.d.name}</div>
              <div className="text-[11px] text-gray-400">{open.s} · seed: {open.d.seed}</div>
              <p className="text-sm text-gray-300 mt-4 leading-snug">{open.d.voice}</p>
              <div className="mt-6 flex gap-2 text-[11px]">
                <button onClick={() => setLens("step")} className={`px-2 py-1 rounded-md border ${lens === "step" ? "border-gray-300" : "border-gray-700 text-gray-400"}`}>← → other takes on {open.s}</button>
                <button onClick={() => setLens("direction")} className={`px-2 py-1 rounded-md border ${lens === "direction" ? "border-gray-300" : "border-gray-700 text-gray-400"}`}>← → walk the flow</button>
              </div>
              <div className="mt-auto text-[11px] text-gray-500">esc to close · s to star</div>
            </div>
          </div>
        </div>
      )}

      <DsNotes page="galaxybrain" />
    </div>
  );
}
