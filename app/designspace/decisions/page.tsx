"use client";

/**
 * Decisions — the design, decomposed into the choices that actually get made.
 * Per decision: requirements (editable), the current choice, and options side by
 * side. Star = choose. yes/maybe/no = prune. The set of stars is the spec.
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import DsNotes from "@/components/DsNotes";
import Handle from "@/components/DsHandle";
import { Star, useStars } from "@/components/DsStar";
import { React3, useReactions } from "@/components/DsReact";
import { DECISIONS, PLACEMENTS, VOICES, type Decision, type Option } from "@/content/designspace/decisions";

const W = 390, H = 844;
const optId = (d: Decision, o: Option) => `D-${d.id}/${o.id}`;

function Thumb({ children, src, width, onClick, active, dim }: { children?: ReactNode; src?: string; width: number; onClick?: () => void; active?: boolean; dim?: boolean }) {
  const k = width / W;
  return (
    <div onClick={onClick} className={`overflow-hidden bg-black cursor-zoom-in transition-opacity ${dim ? "opacity-30" : ""} ${active ? "ring-2 ring-amber-400" : "ring-1 ring-gray-300 dark:ring-gray-800 hover:ring-gray-500"}`} style={{ width, height: H * k, borderRadius: Math.max(6, 22 * k) }}>
      <div style={{ width: W, height: H, transform: `scale(${k})`, transformOrigin: "top left", pointerEvents: "none" }}>
        {src ? <iframe src={src} title="live" width={W} height={H} style={{ border: 0, display: "block", background: "black" }} loading="lazy" /> : children}
      </div>
    </div>
  );
}

/** Requirements are notes under "req D-<id>" — one per line; seeded from the data file. */
function Requirements({ d }: { d: Decision }) {
  const key = `req D-${d.id}`;
  const [text, setText] = useState<string | null>(null);
  const [state, setState] = useState("");
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => { fetch(`/api/designspace/notes?page=${encodeURIComponent(key)}`).then((r) => r.json()).then((j) => setText(j.text || d.requirements.map((r) => `• ${r}`).join("\n"))).catch(() => setText(d.requirements.map((r) => `• ${r}`).join("\n"))); }, [key, d.requirements]);
  const onChange = (v: string) => { setText(v); setState("saving…"); if (t.current) clearTimeout(t.current); t.current = setTimeout(async () => { const r = await fetch("/api/designspace/notes", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ page: key, text: v }) }); setState(r.ok ? "saved" : "couldn't save"); }, 700); };
  return (
    <div>
      <div className="flex items-baseline justify-between"><div className="text-[10px] uppercase tracking-wide text-gray-400">requirements</div><span className="text-[10px] text-gray-400">{state}</span></div>
      <textarea value={text ?? ""} onChange={(e) => onChange(e.target.value)} rows={4} disabled={text === null} className="mt-1 w-full text-[12px] leading-snug bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg p-2 outline-none focus:border-gray-900 dark:focus:border-gray-100 text-gray-700 dark:text-gray-300" />
    </div>
  );
}

/** Feedback voice × widget placement, composed — because neither reads right alone. */
function MissScreen({ width, stars, toggle, reactions, react, showNo }: { width: number; stars: Set<string>; toggle: (id: string) => void; reactions: Record<string, "yes" | "maybe" | "no">; react: (id: string, v: "yes" | "maybe" | "no" | null) => void; showNo: boolean }) {
  const [voice, setVoice] = useState(VOICES[0].id);
  const [place, setPlace] = useState(PLACEMENTS[0].id);
  const v = VOICES.find((x) => x.id === voice)!, p = PLACEMENTS.find((x) => x.id === place)!;
  const id = (vv: string, pp: string) => `D-miss/${vv}+${pp}`;
  const k = Math.min(1, 300 / W);
  return (
    <section id="D-miss" className="scroll-mt-24 grid gap-6 lg:grid-cols-[240px_1fr]">
      <div>
        <div className="flex items-center gap-2"><Handle id="D-miss" /><h2 className="text-base">Miss screen</h2></div>
        <div className="text-[12px] text-gray-500 mt-0.5">Feedback voice × widget placement, together · Feedback</div>
        <p className="text-[12px] text-gray-500 mt-3 leading-snug">Neither decision reads right on its own. Pick a voice and a placement to see the whole screen; the grid below is every pairing, to star or prune.</p>
        <div className="mt-3 space-y-2 text-[12px]">
          <label className="block text-gray-400">voice<select value={voice} onChange={(e) => setVoice(e.target.value)} className="block mt-0.5 w-full bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg px-2 py-1">{VOICES.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
          <label className="block text-gray-400">placement<select value={place} onChange={(e) => setPlace(e.target.value)} className="block mt-0.5 w-full bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg px-2 py-1">{PLACEMENTS.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
          <div className="flex items-center gap-2 pt-1"><Handle id={id(voice, place)} /><Star id={id(voice, place)} stars={stars} toggle={toggle} size={16} /><React3 id={id(voice, place)} reactions={reactions} set={react} size="xs" /></div>
        </div>
      </div>
      <div>
        <div className="flex gap-6 items-start">
          <div className="overflow-hidden rounded-[22px] ring-1 ring-gray-300 dark:ring-gray-800 bg-black shrink-0" style={{ width: W * k, height: H * k }}><div style={{ width: W, height: H, transform: `scale(${k})`, transformOrigin: "top left" }}>{p.compose(v)}</div></div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-2">every pairing · rows: voice · columns: placement</div>
            <div className="grid gap-2" style={{ gridTemplateColumns: `auto repeat(${PLACEMENTS.length}, ${Math.max(70, width * 0.55)}px)` }}>
              <div />{PLACEMENTS.map((pp) => <div key={pp.id} className="text-[10px] text-gray-400 truncate">{pp.name}</div>)}
              {VOICES.map((vv) => (
                <div key={vv.id} className="contents">
                  <div className="text-[10px] text-gray-400 pr-2 self-center truncate" style={{ maxWidth: 110 }}>{vv.name}</div>
                  {PLACEMENTS.map((pp) => {
                    const cid = id(vv.id, pp.id); const rx = reactions[cid]; if (rx === "no" && !showNo) return <div key={pp.id} className="text-[10px] text-gray-300 dark:text-gray-700 self-center">no</div>;
                    const w = Math.max(70, width * 0.55), kk = w / W;
                    return (
                      <div key={pp.id}>
                        <div onClick={() => { setVoice(vv.id); setPlace(pp.id); }} className={`overflow-hidden bg-black cursor-pointer ${stars.has(cid) ? "ring-2 ring-amber-400" : "ring-1 ring-gray-200 dark:ring-gray-800 hover:ring-gray-500"} ${rx === "no" ? "opacity-30" : ""}`} style={{ width: w, height: H * kk, borderRadius: Math.max(4, 22 * kk) }}>
                          <div style={{ width: W, height: H, transform: `scale(${kk})`, transformOrigin: "top left", pointerEvents: "none" }}>{pp.compose(vv)}</div>
                        </div>
                        <div className="flex items-center justify-between mt-0.5"><Star id={cid} stars={stars} toggle={toggle} size={12} /><React3 id={cid} reactions={reactions} set={react} size="xs" /></div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Decisions() {
  const { stars, toggle } = useStars();
  const { reactions, set: react } = useReactions();
  const [width, setWidth] = useState(150);
  const [showNo, setShowNo] = useState(false);
  const [open, setOpen] = useState<{ d: Decision; o: Option } | null>(null);
  useEffect(() => { try { const w = +(localStorage.getItem("ds:thumb3") ?? ""); if (w) setWidth(w); } catch {} }, []);
  const setW = (w: number) => { setWidth(w); try { localStorage.setItem("ds:thumb3", String(w)); } catch {} };
  useEffect(() => { if (!open) return; const k = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); if (e.key === "s") toggle(optId(open.d, open.o)); if (e.key === "ArrowRight" || e.key === "ArrowLeft") { const os = open.d.options; const i = os.findIndex((o) => o.id === open.o.id); setOpen({ d: open.d, o: os[(i + (e.key === "ArrowRight" ? 1 : -1) + os.length) % os.length] }); } }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [open, toggle]);

  const spec = useMemo(() => DECISIONS.map((d) => ({ d, chosen: d.options.filter((o) => stars.has(optId(d, o))) })), [stars]);

  return (
    <div>
      <div className="sticky top-11 z-[5] -mx-5 px-5 py-2 bg-white/90 dark:bg-black/90 backdrop-blur border-b border-gray-100 dark:border-gray-900 flex flex-wrap items-center gap-4 text-[12px]">
        <h1 className="text-lg font-light tracking-tight mr-2">Decisions</h1>
        <nav className="flex gap-1"><a href="#D-miss" className="px-2 py-0.5 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900">Miss screen</a>{DECISIONS.map((d) => <a key={d.id} href={`#D-${d.id}`} className="px-2 py-0.5 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900">{d.name}</a>)}</nav>
        <label className="flex items-center gap-2 text-gray-500">size<input type="range" min={100} max={300} step={5} value={width} onChange={(e) => setW(+e.target.value)} className="w-28 accent-gray-500" /></label>
        <label className="flex items-center gap-1.5 text-gray-500"><input type="checkbox" checked={showNo} onChange={(e) => setShowNo(e.target.checked)} className="accent-gray-500" />show the no&apos;s</label>
        <span className="text-gray-400 ml-auto">★ chooses · yes / maybe / no prunes · click for full size</span>
      </div>

      {/* the spec: what's chosen per decision */}
      <section className="mt-6 mb-10">
        <div className="flex items-baseline gap-3 mb-2"><h2 className="text-sm">The spec</h2><span className="text-[11px] text-gray-500">one starred option per decision is the design; say “build the spec” when it&apos;s right</span></div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[12px]">
          {spec.map(({ d, chosen }) => (
            <div key={d.id} className="flex items-baseline gap-2"><span className="text-gray-400">{d.name}</span>{chosen.length ? chosen.map((o) => <Handle key={o.id} id={optId(d, o)}>{o.name}</Handle>) : <span className="text-gray-300 dark:text-gray-700">— (current stands)</span>}</div>
          ))}
        </div>
      </section>

      <MissScreen width={width} stars={stars} toggle={toggle} reactions={reactions} react={react} showNo={showNo} />

      <div className="space-y-14 mt-14">
        {DECISIONS.map((d) => {
          const opts = d.options.filter((o) => showNo || reactions[optId(d, o)] !== "no");
          const hidden = d.options.length - opts.length;
          return (
            <section key={d.id} id={`D-${d.id}`} className="scroll-mt-24 grid gap-6 lg:grid-cols-[240px_1fr]">
              <div>
                <div className="flex items-center gap-2"><Handle id={`D-${d.id}`} /><h2 className="text-base">{d.name}</h2></div>
                <div className="text-[12px] text-gray-500 mt-0.5">{d.question}{d.step && <span className="text-gray-400"> · {d.step}</span>}</div>
                <div className="mt-3"><Requirements d={d} /></div>
                {hidden > 0 && <div className="text-[11px] text-gray-400 mt-2">{hidden} option{hidden > 1 ? "s" : ""} marked no</div>}
              </div>
              <div className="flex flex-wrap gap-4">
                {opts.map((o) => {
                  const id = optId(d, o); const rx = reactions[id];
                  return (
                    <div key={o.id} style={{ width }}>
                      <Thumb width={width} src={o.live} active={stars.has(id)} dim={rx === "no"} onClick={() => setOpen({ d, o })}>{o.cell}</Thumb>
                      <div className="flex items-start justify-between gap-2 mt-1">
                        <div className="min-w-0"><div className="text-[11px] truncate">{o.current && <span className="text-[9px] uppercase tracking-wide text-emerald-500 mr-1">live</span>}{o.name}</div><div className="text-[10px] text-gray-500 leading-snug">{o.note}</div></div>
                        <Star id={id} stars={stars} toggle={toggle} size={14} />
                      </div>
                      <div className="mt-1"><React3 id={id} reactions={reactions} set={react} size="xs" /></div>
                    </div>
                  );
                })}
                <div style={{ width }} className="flex items-center justify-center text-[10px] text-gray-400 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-[8px]" >more options:<br />“options for {d.name}: …”</div>
              </div>
            </section>
          );
        })}
      </div>

      {open && (
        <div className="fixed inset-0 z-30 bg-black/80 flex items-center justify-center p-6" onClick={() => setOpen(null)}>
          <div onClick={(e) => e.stopPropagation()} className="flex items-stretch gap-8">
            <div className="overflow-hidden rounded-[22px] ring-1 ring-gray-700 bg-black" style={{ width: W * 0.85, height: H * 0.85 }}>
              <div style={{ width: W, height: H, transform: "scale(0.85)", transformOrigin: "top left" }}>{open.o.live ? <iframe src={open.o.live} title="live" width={W} height={H} style={{ border: 0, display: "block" }} /> : open.o.cell}</div>
            </div>
            <div className="w-64 text-gray-200 flex flex-col">
              <div className="flex items-center gap-2"><Handle id={optId(open.d, open.o)} /><Star id={optId(open.d, open.o)} stars={stars} toggle={toggle} size={22} /></div>
              <div className="text-xl font-light mt-3">{open.o.name}</div>
              <div className="text-[12px] text-gray-400 mt-1">{open.d.name} · {open.d.question}</div>
              <p className="text-sm text-gray-300 mt-4 leading-snug">{open.o.note}</p>
              <div className="mt-4"><React3 id={optId(open.d, open.o)} reactions={reactions} set={react} /></div>
              <div className="mt-auto text-[11px] text-gray-500">← → other options · s to star · esc</div>
            </div>
          </div>
        </div>
      )}

      <DsNotes page="decisions" />
    </div>
  );
}
