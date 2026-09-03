"use client";

/**
 * Galaxy Brain — few directions, complete; then dial one in with variants.
 * Directions: whole languages across the flow, judged against the live app.
 * Dial in: small deliberate deltas within one language, per step. Stars narrow.
 */
import { useEffect, useMemo, useState, type ReactNode } from "react";
import DsNotes from "@/components/DsNotes";
import Handle from "@/components/DsHandle";
import { Star, useStars } from "@/components/DsStar";
import { DIRECTIONS, STEPS, type Direction, type Step, type Variant } from "@/content/designspace/galaxy";

const W = 390, H = 844;
const cellId = (d: Direction, s: Step) => `G-${d.id}/${s}`;
const varId = (d: Direction, s: Step, v: Variant) => `G-${d.id}/${s}#${v.id}`;

function Thumb({ children, src, width, onClick, active }: { children?: ReactNode; src?: string; width: number; onClick?: () => void; active?: boolean }) {
  const k = width / W;
  return (
    <div onClick={onClick} className={`overflow-hidden bg-black ${onClick ? "cursor-zoom-in" : ""} ${active ? "ring-2 ring-amber-400" : "ring-1 ring-gray-300 dark:ring-gray-800 hover:ring-gray-500"}`} style={{ width, height: H * k, borderRadius: Math.max(6, 22 * k) }}>
      <div style={{ width: W, height: H, transform: `scale(${k})`, transformOrigin: "top left", pointerEvents: "none" }}>
        {src ? <iframe src={src} title="live" width={W} height={H} style={{ border: 0, display: "block", background: "black" }} loading="lazy" /> : children}
      </div>
    </div>
  );
}
const Ghost = ({ width, children }: { width: number; children?: ReactNode }) => (
  <div className="border border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-center text-[10px] text-gray-400 text-center px-2" style={{ width, height: (H * width) / W, borderRadius: Math.max(6, (22 * width) / W) }}>{children}</div>
);

type Open = { title: string; sub: string; handle: string; cell?: ReactNode; src?: string };

export default function GalaxyBrain() {
  const { stars, toggle } = useStars();
  const [width, setWidth] = useState(150);
  const [dial, setDial] = useState<string>("quiet");
  const [step, setStep] = useState<Step>("Practice");
  const [open, setOpen] = useState<Open | null>(null);
  useEffect(() => { try { const w = +(localStorage.getItem("ds:thumb2") ?? ""); if (w) setWidth(w); } catch {} }, []);
  const setW = (w: number) => { setWidth(w); try { localStorage.setItem("ds:thumb2", String(w)); } catch {} };
  useEffect(() => { if (!open) return; const k = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); if (e.key === "s") toggle(open.handle); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [open, toggle]);

  const d = DIRECTIONS.find((x) => x.id === dial) ?? DIRECTIONS[1];
  const variants = d.variants?.[step] ?? [];
  const stepsWithVariants = STEPS.filter((s) => (d.variants?.[s] ?? []).length);

  // Your flow: a starred variant beats a starred direction cell, per step.
  const composed = useMemo(() => STEPS.map((s) => {
    for (const dd of DIRECTIONS) for (const v of dd.variants?.[s] ?? []) if (stars.has(varId(dd, s, v))) return { label: `${dd.name} · ${v.name}`, cell: v.cell };
    for (const dd of DIRECTIONS) if (stars.has(cellId(dd, s))) return { label: dd.name, cell: dd.cells[s], src: dd.live?.[s] };
    return null;
  }), [stars]);

  return (
    <div>
      <div className="sticky top-11 z-[5] -mx-5 px-5 py-2 bg-white/90 dark:bg-black/90 backdrop-blur border-b border-gray-100 dark:border-gray-900 flex flex-wrap items-center gap-4 text-[12px]">
        <h1 className="text-lg font-light tracking-tight mr-2">Galaxy Brain</h1>
        <label className="flex items-center gap-2 text-gray-500">size<input type="range" min={100} max={300} step={5} value={width} onChange={(e) => setW(+e.target.value)} className="w-28 accent-gray-500" /></label>
        <span className="text-gray-400 ml-auto">{DIRECTIONS.length} directions · {stars.size} starred · click for full size · s to star</span>
      </div>

      {/* 1 · Directions, complete across the flow */}
      <section className="mt-6">
        <div className="flex items-baseline gap-3 mb-3"><h2 className="text-sm">Directions</h2><span className="text-[11px] text-gray-500">whole languages, each across the flow — judged against Current</span></div>
        <div className="grid" style={{ gridTemplateColumns: `220px repeat(5, ${width}px)`, columnGap: 12, rowGap: 20 }}>
          <div />{STEPS.map((s) => <div key={s} className="text-[11px] text-gray-400">{s}</div>)}
          {DIRECTIONS.map((dd) => (
            <div key={dd.id} className="contents">
              <div className="pr-4 pt-1">
                <div className="flex items-center gap-2"><Handle id={`G-${dd.id}`} /><span className="text-sm">{dd.name}</span></div>
                <p className="text-[11px] text-gray-500 mt-1.5 leading-snug">{dd.what}</p>
                {dd.variants && <button onClick={() => { setDial(dd.id); setStep(stepsWithVariants[0] ?? "Practice"); document.getElementById("dial")?.scrollIntoView({ behavior: "smooth" }); }} className="mt-2 text-[11px] px-2 py-1 rounded-md border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-400">dial in ↓</button>}
              </div>
              {STEPS.map((s) => {
                const id = cellId(dd, s); const cell = dd.cells[s]; const src = dd.live?.[s];
                return (
                  <div key={s}>
                    {cell || src
                      ? <Thumb width={width} src={src} active={stars.has(id)} onClick={() => setOpen({ title: dd.name, sub: s, handle: id, cell, src })}>{cell}</Thumb>
                      : <Ghost width={width}>not drawn<br />star to ask</Ghost>}
                    <div className="flex justify-end mt-0.5"><Star id={id} stars={stars} toggle={toggle} size={14} /></div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </section>

      {/* 2 · Dial in */}
      <section id="dial" className="mt-14 scroll-mt-24">
        <div className="flex flex-wrap items-baseline gap-3 mb-3">
          <h2 className="text-sm">Dial in</h2>
          <select value={dial} onChange={(e) => setDial(e.target.value)} className="bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg px-2 py-0.5 text-[12px]">
            {DIRECTIONS.filter((x) => x.variants).map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden text-[11px]">
            {STEPS.map((s) => <button key={s} disabled={!(d.variants?.[s] ?? []).length} onClick={() => setStep(s)} className={`px-2.5 py-1 disabled:opacity-30 ${step === s ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-black" : "text-gray-500"}`}>{s}</button>)}
          </div>
          <span className="text-[11px] text-gray-500">small, deliberate differences inside one language — star the ones that are right</span>
        </div>
        {variants.length ? (
          <div className="flex flex-wrap gap-4">
            {variants.map((v) => {
              const id = varId(d, step, v);
              return (
                <div key={v.id} style={{ width }}>
                  <Thumb width={width} active={stars.has(id)} onClick={() => setOpen({ title: `${d.name} · ${v.name}`, sub: `${step} — ${v.note}`, handle: id, cell: v.cell })}>{v.cell}</Thumb>
                  <div className="flex items-start justify-between gap-2 mt-1"><div className="min-w-0"><div className="text-[11px] truncate">{v.name}</div><div className="text-[10px] text-gray-500 leading-snug">{v.note}</div></div><Star id={id} stars={stars} toggle={toggle} size={14} /></div>
                </div>
              );
            })}
          </div>
        ) : <p className="text-[12px] text-gray-400">No variants for this step yet — say “variants for {d.name} {step}: …” in the terminal.</p>}
      </section>

      {/* 3 · Your flow */}
      <section className="mt-14">
        <div className="flex items-baseline gap-3 mb-2"><h2 className="text-sm">Your flow</h2><span className="text-[11px] text-gray-500">{composed.some(Boolean) ? "one star per step; a starred variant wins over a starred direction" : "star things and they line up here"}</span></div>
        <div className="flex gap-3">
          {STEPS.map((s, i) => (
            <div key={s} style={{ width }}>
              <div className="text-[10px] text-gray-400 mb-1">{s}</div>
              {composed[i] ? <Thumb width={width} src={composed[i]!.src}>{composed[i]!.cell}</Thumb> : <Ghost width={width} />}
              {composed[i] && <div className="text-[10px] text-gray-500 mt-1 truncate">{composed[i]!.label}</div>}
            </div>
          ))}
        </div>
      </section>

      <p className="text-[11px] text-gray-400 mt-10">Add a direction: “galaxy: what it does”. More variants: “variants for Quiet Feedback: …”. Dial one in for real: “promote G-quiet to Ideas”.</p>

      {open && (
        <div className="fixed inset-0 z-30 bg-black/80 flex items-center justify-center p-6" onClick={() => setOpen(null)}>
          <div onClick={(e) => e.stopPropagation()} className="flex items-stretch gap-8">
            <div className="overflow-hidden rounded-[22px] ring-1 ring-gray-700 bg-black" style={{ width: W * 0.85, height: H * 0.85 }}>
              <div style={{ width: W, height: H, transform: "scale(0.85)", transformOrigin: "top left" }}>{open.src ? <iframe src={open.src} title="live" width={W} height={H} style={{ border: 0, display: "block" }} /> : open.cell}</div>
            </div>
            <div className="w-64 text-gray-200 flex flex-col">
              <div className="flex items-center gap-2"><Handle id={open.handle} /><Star id={open.handle} stars={stars} toggle={toggle} size={22} /></div>
              <div className="text-xl font-light mt-3">{open.title}</div>
              <div className="text-[12px] text-gray-400 mt-1 leading-snug">{open.sub}</div>
              <div className="mt-auto text-[11px] text-gray-500">esc to close · s to star</div>
            </div>
          </div>
        </div>
      )}

      <DsNotes page="galaxybrain" />
    </div>
  );
}
