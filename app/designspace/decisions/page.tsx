"use client";

/**
 * Decisions — one version, decomposed.
 * Top: the version as it stands — every axis at its star, or at the live design.
 * Then the decisions by status: working on · later · decided. Every thumbnail is
 * the version with one option swapped in, so a choice is judged in context.
 * Star = choose. yes / maybe / no = prune. Status files the decision.
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import DsNotes from "@/components/DsNotes";
import Handle from "@/components/DsHandle";
import { Star, useStars } from "@/components/DsStar";
import { React3, useReactions, type Reaction } from "@/components/DsReact";
import { DECISIONS, STEPS, W, H, composeStep, decisionById, firstAxis, type Axis, type Decision, type Option } from "@/content/designspace/decisions";

type Status = "working" | "later" | "decided";
const STATUSES: Status[] = ["working", "later", "decided"];
const SITE = "https://magnitude-umber.vercel.app";
const optId = (d: Decision, o: Option) => `D-${d.id}/${o.id}`;
const bullets = (d: Decision) => d.requirements.map((r) => `• ${r}`).join("\n");

/** Rows on the wall under one prefix, as key → text. Same table Claude reads. */
function useWall(prefix: string) {
  const [rows, setRows] = useState<Record<string, string>>({});
  useEffect(() => {
    fetch(`/api/designspace/notes?prefix=${encodeURIComponent(prefix)}`).then((r) => r.json())
      .then((j) => setRows(Object.fromEntries((j.notes ?? []).map((n: { page: string; text: string }) => [n.page.slice(prefix.length), n.text])))).catch(() => {});
  }, [prefix]);
  const put = async (key: string, text: string) => {
    setRows((c) => { const n = { ...c }; if (text) n[key] = text; else delete n[key]; return n; });
    await fetch("/api/designspace/notes", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ page: prefix + key, text }) }).catch(() => {});
  };
  return { rows, put };
}

function Thumb({ children, src, width, onClick, active, dim }: { children?: ReactNode; src?: string; width: number; onClick?: () => void; active?: boolean; dim?: boolean }) {
  const k = width / W;
  return (
    <div onClick={onClick} className={`overflow-hidden bg-black shrink-0 transition-opacity ${onClick ? "cursor-zoom-in" : ""} ${dim ? "opacity-30" : ""} ${active ? "ring-2 ring-amber-400" : "ring-1 ring-gray-300 dark:ring-gray-800 hover:ring-gray-500"}`} style={{ width, height: H * k, borderRadius: Math.max(5, 22 * k) }}>
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
  useEffect(() => { fetch(`/api/designspace/notes?page=${encodeURIComponent(key)}`).then((r) => r.json()).then((j) => setText(j.text || bullets(d))).catch(() => setText(bullets(d))); }, [key, d]);
  const onChange = (v: string) => { setText(v); setState("saving…"); if (t.current) clearTimeout(t.current); t.current = setTimeout(async () => { const r = await fetch("/api/designspace/notes", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ page: key, text: v }) }); setState(r.ok ? "saved" : "couldn't save"); }, 700); };
  return (
    <div>
      <div className="flex items-baseline justify-between"><div className="text-[10px] uppercase tracking-wide text-gray-400">requirements</div><span className="text-[10px] text-gray-400">{state}</span></div>
      <textarea value={text ?? ""} onChange={(e) => onChange(e.target.value)} rows={4} disabled={text === null} className="mt-1 w-full text-[12px] leading-snug bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg p-2 outline-none focus:border-gray-900 dark:focus:border-gray-100 text-gray-700 dark:text-gray-300" />
    </div>
  );
}

const DOT: Record<Status, string> = { working: "bg-sky-400", later: "bg-gray-300 dark:bg-gray-700", decided: "bg-emerald-500" };
function StatusPicker({ value, onChange }: { value: Status; onChange: (s: Status) => void }) {
  return (
    <div className="inline-flex rounded-md border border-gray-200 dark:border-gray-800 overflow-hidden text-[11px]">
      {STATUSES.map((s) => <button key={s} type="button" onClick={() => onChange(s)} title={s === "decided" ? "file it below — the starred option (or the live design) stands; reopen any time" : s === "later" ? "park it" : "work on it now"} className={`px-2 py-0.5 border-r last:border-r-0 border-gray-200 dark:border-gray-800 ${value === s ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-black" : "text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"}`}>{s === "working" ? "working on" : s}</button>)}
    </div>
  );
}

function CopyButton({ text, label, title }: { text: () => Promise<string> | string; label: string; title?: string }) {
  const [done, setDone] = useState(false);
  return <button type="button" title={title} onClick={async () => { try { await navigator.clipboard.writeText(await text()); setDone(true); setTimeout(() => setDone(false), 900); } catch {} }} className="text-[11px] px-1.5 py-0.5 rounded-md border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-400">{done ? "copied ✓" : label}</button>;
}

export default function Decisions() {
  const { stars, toggle } = useStars();
  const { reactions, set: react } = useReactions();
  const status = useWall("status ");
  const order = useWall("order ");
  const [width, setWidth] = useState(150);
  const [showNo, setShowNo] = useState(false);
  const [compare, setCompare] = useState(false);
  const [open, setOpen] = useState<{ d: Decision; a: Axis; o: Option } | null>(null);
  useEffect(() => { try { const w = +(localStorage.getItem("ds:thumb3") ?? ""); if (w) setWidth(w); } catch {} }, []);
  const setW = (w: number) => { setWidth(w); try { localStorage.setItem("ds:thumb3", String(w)); } catch {} };

  // ── the version: one option per axis ──────────────────────────────────
  const chosen = (d: Decision, a: Axis) => { const s = a.options.filter((o) => stars.has(optId(d, o))); return { o: s[0] ?? a.options.find((o) => o.current) ?? a.options[0], n: s.length }; };
  const pick = (dId: string, aId?: string) => { const d = decisionById(dId); return chosen(d, d.axes.find((a) => a.id === (aId ?? firstAxis(d)))!).o; };
  const withOverride = (d: Decision, a: Axis, o: Option) => (dId: string, aId?: string) => (dId === d.id && (aId ?? firstAxis(decisionById(dId))) === a.id ? o : pick(dId, aId));
  const choose = async (d: Decision, a: Axis, o: Option) => { for (const x of a.options) if (x.id !== o.id && stars.has(optId(d, x))) await toggle(optId(d, x)); if (!stars.has(optId(d, o))) await toggle(optId(d, o)); };

  const statusOf = (d: Decision): Status => (STATUSES.includes(status.rows[`D-${d.id}`] as Status) ? (status.rows[`D-${d.id}`] as Status) : "working");
  const ordered = useMemo(() => { const ids = (order.rows.decisions ?? "").split(",").filter(Boolean); const rank = (d: Decision) => { const i = ids.indexOf(d.id); return i < 0 ? 1000 + DECISIONS.indexOf(d) : i; }; return [...DECISIONS].sort((a, b) => rank(a) - rank(b)); }, [order.rows]);
  const move = (d: Decision, dir: -1 | 1) => { const ids = ordered.filter((x) => statusOf(x) === "working").map((x) => x.id); const i = ids.indexOf(d.id), j = i + dir; if (i < 0 || j < 0 || j >= ids.length) return; [ids[i], ids[j]] = [ids[j], ids[i]]; const rest = ordered.filter((x) => statusOf(x) !== "working").map((x) => x.id); order.put("decisions", [...ids, ...rest].join(",")); };
  const by = (s: Status) => ordered.filter((d) => statusOf(d) === s);

  const describe = (d: Decision) => d.axes.map((a) => { const c = chosen(d, a); return `${d.axes.length > 1 ? a.name + ": " : ""}${c.o.current ? "the live design stands" : c.o.name}${c.n > 1 ? ` (${c.n} starred — first counts)` : ""}`; }).join(" · ");
  const versionText = () => [`Drill · the version · ${new Date().toISOString().slice(0, 10)}`, ...STEPS.map((s) => `${s.name}: ` + DECISIONS.filter((d) => d.step === s.id).map((d) => d.axes.map((a) => { const c = chosen(d, a); return `${d.id}${d.axes.length > 1 ? "/" + a.id : ""}=${c.o.current ? "live" : c.o.id} (${statusOf(d)})`; }).join(" · ")).join(" · "))].join("\n");
  const briefText = async (d: Decision) => {
    const req = await fetch(`/api/designspace/notes?page=${encodeURIComponent(`req D-${d.id}`)}`).then((r) => r.json()).then((j) => j.text || bullets(d)).catch(() => bullets(d));
    const opts = d.axes.map((a) => `${d.axes.length > 1 ? a.name + ": " : ""}` + a.options.map((o) => `${o.id}${o.current ? " (live)" : ""}${stars.has(optId(d, o)) ? " ★" : ""}${reactions[optId(d, o)] ? " " + reactions[optId(d, o)] : ""}`).join(", ")).join("\n");
    return `D-${d.id} — ${d.name} (${d.step}): ${d.question}\nstatus: ${statusOf(d)} · chosen: ${describe(d)}\nrequirements:\n${req}\noptions: ${opts}\n${SITE}/designspace/decisions#D-${d.id}`;
  };

  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "s") toggle(optId(open.d, open.o));
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") { const os = open.a.options; const i = os.findIndex((o) => o.id === open.o.id); setOpen({ ...open, o: os[(i + (e.key === "ArrowRight" ? 1 : -1) + os.length) % os.length] }); }
    };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [open, toggle]);

  const vw = Math.max(200, Math.min(260, width * 1.6));

  // ── pieces ─────────────────────────────────────────────────────────────
  const Head = ({ d }: { d: Decision }) => (
    <div className="flex items-center gap-2 flex-wrap">
      <Handle id={`D-${d.id}`} /><h2 className="text-base">{d.name}</h2>
      <CopyButton label="link" title="copy a link to this decision" text={() => `${SITE}/designspace/decisions#D-${d.id}`} />
      <CopyButton label="brief" title="copy everything about this decision — paste it in the terminal to work on it" text={() => briefText(d)} />
    </div>
  );

  const OptionCard = ({ d, a, o, w = width }: { d: Decision; a: Axis; o: Option; w?: number }) => {
    const id = optId(d, o); const rx = reactions[id];
    return (
      <div style={{ width: w }}>
        <Thumb width={w} active={stars.has(id)} dim={rx === "no"} onClick={() => setOpen({ d, a, o })}>{composeStep(d.step, withOverride(d, a, o))}</Thumb>
        <div className="flex items-start justify-between gap-2 mt-1">
          <div className="min-w-0"><div className="text-[11px] truncate">{o.current && <span className="text-[9px] uppercase tracking-wide text-emerald-500 mr-1">live</span>}{o.name}</div><div className="text-[10px] text-gray-500 leading-snug">{o.note}</div></div>
          <Star id={id} stars={stars} toggle={toggle} size={14} />
        </div>
        <div className="mt-1"><React3 id={id} reactions={reactions} set={react} size="xs" /></div>
      </div>
    );
  };

  const AxisStrip = ({ d, a }: { d: Decision; a: Axis }) => {
    const opts = a.options.filter((o) => showNo || reactions[optId(d, o)] !== "no");
    const hidden = a.options.length - opts.length;
    return (
      <div>
        {d.axes.length > 1 && <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-1.5">{a.name}<span className="normal-case tracking-normal text-gray-400"> · each shown with the other axis at its choice</span></div>}
        <div className="flex flex-wrap gap-4">
          {opts.map((o) => <OptionCard key={o.id} d={d} a={a} o={o} />)}
          <div style={{ width }} className="flex items-center justify-center text-[10px] text-gray-400 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-[8px] min-h-[80px]">more options:<br />“options for {d.name}{d.axes.length > 1 ? ` (${a.name})` : ""}: …”</div>
        </div>
        {hidden > 0 && <div className="text-[11px] text-gray-400 mt-2">{hidden} marked no</div>}
      </div>
    );
  };

  const Pairings = ({ d }: { d: Decision }) => {
    const [va, pa] = d.axes; const cw = Math.max(70, width * 0.5);
    return (
      <details className="mt-6">
        <summary className="text-[11px] text-gray-500 cursor-pointer select-none">every pairing · rows: {va.name} · columns: {pa.name} — click one to choose it</summary>
        <div className="grid gap-2 mt-3" style={{ gridTemplateColumns: `auto repeat(${pa.options.length}, ${cw}px)` }}>
          <div />{pa.options.map((p) => <div key={p.id} className="text-[10px] text-gray-400 truncate">{p.name}</div>)}
          {va.options.map((v) => (
            <div key={v.id} className="contents">
              <div className="text-[10px] text-gray-400 pr-2 self-center truncate" style={{ maxWidth: 110 }}>{v.name}</div>
              {pa.options.map((p) => { const on = stars.has(optId(d, v)) && stars.has(optId(d, p)); const no = reactions[optId(d, v)] === "no" || reactions[optId(d, p)] === "no"; return (
                <div key={p.id} title={`D-miss/${v.id}+${p.id}`} onClick={() => { choose(d, va, v); choose(d, pa, p); }} className={`overflow-hidden bg-black cursor-pointer ${on ? "ring-2 ring-amber-400" : "ring-1 ring-gray-200 dark:ring-gray-800 hover:ring-gray-500"} ${no ? "opacity-30" : ""}`} style={{ width: cw, height: H * (cw / W), borderRadius: Math.max(4, 22 * (cw / W)) }}>
                  <div style={{ width: W, height: H, transform: `scale(${cw / W})`, transformOrigin: "top left", pointerEvents: "none" }}>{p.compose!(v)}</div>
                </div>
              ); })}
            </div>
          ))}
        </div>
      </details>
    );
  };

  const Full = ({ d }: { d: Decision }) => {
    const multi = d.axes.length > 1;
    const wi = by("working"); const i = wi.findIndex((x) => x.id === d.id);
    return (
      <section id={`D-${d.id}`} className="scroll-mt-24 grid gap-6 lg:grid-cols-[240px_1fr]">
        <div>
          <Head d={d} />
          <div className="text-[12px] text-gray-500 mt-0.5">{d.question}<span className="text-gray-400"> · {d.step}</span></div>
          <div className="mt-2 flex items-center gap-2"><StatusPicker value={statusOf(d)} onChange={(s) => status.put(`D-${d.id}`, s === "working" ? "" : s)} />
            <span className="inline-flex text-[11px] text-gray-400"><button type="button" disabled={i <= 0} onClick={() => move(d, -1)} className="px-1 disabled:opacity-30" title="higher priority">↑</button><button type="button" disabled={i >= wi.length - 1} onClick={() => move(d, 1)} className="px-1 disabled:opacity-30" title="lower priority">↓</button></span></div>
          <div className="mt-3"><Requirements d={d} /></div>
          <div className="text-[11px] text-gray-500 mt-3">chosen: {describe(d)}</div>
        </div>
        <div className="space-y-5">
          {multi && (
            <div className="flex gap-5 items-start">
              <Thumb width={Math.max(220, width * 1.5)}>{composeStep(d.step, pick)}</Thumb>
              <div className="text-[12px] text-gray-500 pt-1 max-w-[260px]"><div className="text-gray-900 dark:text-gray-100">As chosen</div><div className="mt-1">{describe(d)}</div><div className="mt-2 flex items-center gap-2"><Handle id={`D-miss/${chosen(d, d.axes[0]).o.id}+${chosen(d, d.axes[1]).o.id}`} /></div><div className="mt-2">Star one per axis; the strips below re-render around the choice.</div></div>
            </div>
          )}
          {d.axes.map((a) => <AxisStrip key={a.id} d={d} a={a} />)}
          {multi && <Pairings d={d} />}
        </div>
      </section>
    );
  };

  const Compact = ({ d }: { d: Decision }) => (
    <div id={`D-${d.id}`} className="scroll-mt-24 flex items-center gap-4 py-2.5 border-b border-gray-100 dark:border-gray-900 last:border-0">
      <Thumb width={44}>{composeStep(d.step, pick)}</Thumb>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap"><Handle id={`D-${d.id}`} /><span className="text-sm">{d.name}</span><span className="text-[12px] text-gray-400">{d.question}</span><CopyButton label="brief" text={() => briefText(d)} /></div>
        <div className="text-[12px] mt-0.5 text-gray-600 dark:text-gray-300">{statusOf(d) === "decided" ? describe(d) : "parked"}</div>
      </div>
      <StatusPicker value={statusOf(d)} onChange={(s) => status.put(`D-${d.id}`, s === "working" ? "" : s)} />
    </div>
  );

  return (
    <div>
      <div className="sticky top-11 z-[5] -mx-5 px-5 py-2 bg-white/90 dark:bg-black/90 backdrop-blur border-b border-gray-100 dark:border-gray-900 flex flex-wrap items-center gap-4 text-[12px]">
        <h1 className="text-lg font-light tracking-tight mr-1">Decisions</h1>
        <nav className="flex gap-1 flex-wrap">
          <a href="#version" className="px-2 py-0.5 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900">the version</a>
          {by("working").map((d) => <a key={d.id} href={`#D-${d.id}`} className="px-2 py-0.5 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900">{d.name}</a>)}
          {by("later").length > 0 && <a href="#later" className="px-2 py-0.5 rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900">later · {by("later").length}</a>}
          {by("decided").length > 0 && <a href="#decided" className="px-2 py-0.5 rounded-md text-emerald-600 hover:bg-gray-100 dark:hover:bg-gray-900">decided · {by("decided").length}</a>}
        </nav>
        <label className="flex items-center gap-2 text-gray-500">size<input type="range" min={100} max={300} step={5} value={width} onChange={(e) => setW(+e.target.value)} className="w-28 accent-gray-500" /></label>
        <label className="flex items-center gap-1.5 text-gray-500"><input type="checkbox" checked={showNo} onChange={(e) => setShowNo(e.target.checked)} className="accent-gray-500" />show the no&apos;s</label>
        <span className="text-gray-400 ml-auto">★ chooses · yes / maybe / no prunes · status files it · click for full size</span>
      </div>

      {/* ── the version ─────────────────────────────────────────────── */}
      <section id="version" className="scroll-mt-24 mt-6 mb-12">
        <div className="flex items-baseline gap-3 mb-3 flex-wrap">
          <h2 className="text-sm">The version</h2>
          <span className="text-[11px] text-gray-500">every axis at its star; where nothing is starred, the live design stands. Say “build the version” when it&apos;s right.</span>
          <CopyButton label="copy the version" text={versionText} />
          <label className="flex items-center gap-1.5 text-[11px] text-gray-500 ml-auto"><input type="checkbox" checked={compare} onChange={(e) => setCompare(e.target.checked)} className="accent-gray-500" />show live for comparison</label>
        </div>
        <div className="flex flex-wrap gap-8">
          {STEPS.map((s) => {
            const feeds = DECISIONS.filter((d) => d.step === s.id);
            const allLive = feeds.every((d) => d.axes.every((a) => chosen(d, a).o.current));
            return (
              <div key={s.id} className="flex gap-3 items-start">
                <div style={{ width: vw }}>
                  <Thumb width={vw} src={allLive ? s.live : undefined}>{composeStep(s.id, pick)}</Thumb>
                  <div className="mt-2 text-[12px]">{s.name}<span className="text-gray-400"> · {s.what}</span>{allLive && <span className="text-[9px] uppercase tracking-wide text-emerald-500 ml-2">live</span>}</div>
                  <ul className="mt-1 space-y-0.5 text-[11px]">
                    {feeds.map((d) => d.axes.map((a) => { const c = chosen(d, a); return (
                      <li key={d.id + a.id} className="flex items-center gap-1.5 min-w-0">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${DOT[statusOf(d)]}`} title={statusOf(d)} />
                        <a href={`#D-${d.id}`} className="text-gray-500 hover:underline shrink-0">{d.axes.length > 1 ? `${d.name} · ${a.name}` : d.name}</a>
                        <span className={`truncate ${c.o.current ? "text-gray-400" : ""}`}>{c.o.current ? "live" : c.o.name}</span>
                        {c.n > 1 && <span className="text-amber-500 shrink-0">{c.n} starred</span>}
                      </li>
                    ); }))}
                  </ul>
                </div>
                {compare && !allLive && <div style={{ width: vw * 0.7 }}><Thumb width={vw * 0.7} src={s.live} /><div className="mt-1 text-[10px] text-gray-400">live now</div></div>}
              </div>
            );
          })}
        </div>
        <div className="flex gap-4 mt-3 text-[10px] text-gray-400">{STATUSES.map((s) => <span key={s} className="flex items-center gap-1"><span className={`w-1.5 h-1.5 rounded-full ${DOT[s]}`} />{s === "working" ? "working on" : s}</span>)}</div>
      </section>

      {/* ── working on ──────────────────────────────────────────────── */}
      <div className="flex items-baseline gap-3 mb-6"><h2 className="text-sm">Working on</h2><span className="text-[11px] text-gray-500">in priority order — ↑↓ to reorder. Each option is shown inside the version above.</span></div>
      <div className="space-y-14">
        {by("working").map((d) => <Full key={d.id} d={d} />)}
        {by("working").length === 0 && <div className="text-[12px] text-gray-400">nothing open — reopen a decision below, or say “D-keypad: options for …”</div>}
      </div>

      {/* ── later ───────────────────────────────────────────────────── */}
      {by("later").length > 0 && (
        <section id="later" className="scroll-mt-24 mt-16">
          <div className="flex items-baseline gap-3 mb-2"><h2 className="text-sm">Later</h2><span className="text-[11px] text-gray-500">parked — the live design stands meanwhile</span></div>
          {by("later").map((d) => <Compact key={d.id} d={d} />)}
        </section>
      )}

      {/* ── decided ─────────────────────────────────────────────────── */}
      {by("decided").length > 0 && (
        <section id="decided" className="scroll-mt-24 mt-16">
          <div className="flex items-baseline gap-3 mb-2"><h2 className="text-sm">Decided</h2><span className="text-[11px] text-gray-500">in the version above; set back to “working on” to reopen</span></div>
          {by("decided").map((d) => <Compact key={d.id} d={d} />)}
        </section>
      )}

      {open && (
        <div className="fixed inset-0 z-30 bg-black/80 flex items-center justify-center p-6" onClick={() => setOpen(null)}>
          <div onClick={(e) => e.stopPropagation()} className="flex items-stretch gap-8">
            <div className="overflow-hidden rounded-[22px] ring-1 ring-gray-700 bg-black" style={{ width: W * 0.85, height: H * 0.85 }}>
              <div style={{ width: W, height: H, transform: "scale(0.85)", transformOrigin: "top left" }}>{composeStep(open.d.step, withOverride(open.d, open.a, open.o))}</div>
            </div>
            <div className="w-64 text-gray-200 flex flex-col">
              <div className="flex items-center gap-2"><Handle id={optId(open.d, open.o)} /><Star id={optId(open.d, open.o)} stars={stars} toggle={toggle} size={22} /></div>
              <div className="text-xl font-light mt-3">{open.o.name}</div>
              <div className="text-[12px] text-gray-400 mt-1">{open.d.name}{open.d.axes.length > 1 ? ` · ${open.a.name}` : ""} · {open.d.question}</div>
              <p className="text-sm text-gray-300 mt-4 leading-snug">{open.o.note}</p>
              <div className="mt-4"><React3 id={optId(open.d, open.o)} reactions={reactions} set={(id: string, v: Reaction | null) => react(id, v)} /></div>
              <div className="mt-auto text-[11px] text-gray-500">← → other options · s to star · esc</div>
            </div>
          </div>
        </div>
      )}

      <DsNotes page="decisions" />
    </div>
  );
}
