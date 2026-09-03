"use client";

/**
 * Widgets — the inventory and the argument. A prioritized list of the
 * conceptual ideas K-12 mathematics builds, each with the representations the
 * literature uses and what an interactive version would do; then the minimal
 * set of pictures that carries the list. ★ prioritizes, ✕ excludes, notes per
 * row; handles W-<id>. Say "design W-bar" to start on one.
 */
import { useEffect, useRef, useState } from "react";
import DsNotes from "@/components/DsNotes";
import Handle from "@/components/DsHandle";
import { Star, useStars } from "@/components/DsStar";
import { Out, useReactions } from "@/components/DsReact";
import { IDEAS, LIBRARIES, OUT_OF_SCOPE, PICTURES, type Idea, type WidgetKey } from "@/content/designspace/widgets";

const STATUS: Record<Idea["status"] | "proposed" | "built", string> = { built: "text-emerald-500", partly: "text-sky-500", proposed: "text-amber-500", later: "text-gray-400" };
const pictureName = (k: WidgetKey) => PICTURES.find((p) => p.key === k)!.name;

/** One note per row, saved on the wall under its handle. */
function Note({ id }: { id: string }) {
  const [text, setText] = useState<string | null>(null);
  const [state, setState] = useState("");
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => { fetch(`/api/designspace/notes?page=${encodeURIComponent(id)}`).then((r) => r.json()).then((j) => setText(j.text ?? "")).catch(() => setText("")); }, [id]);
  const onChange = (v: string) => { setText(v); setState("saving…"); if (t.current) clearTimeout(t.current); t.current = setTimeout(async () => { const r = await fetch("/api/designspace/notes", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ page: id, text: v }) }); setState(r.ok ? "saved" : "couldn't save"); }, 700); };
  return (
    <div className="mt-3">
      <div className="flex items-baseline justify-between"><div className="text-[10px] uppercase tracking-wide text-gray-400">notes</div><span className="text-[10px] text-gray-400">{state}</span></div>
      <textarea value={text ?? ""} onChange={(e) => onChange(e.target.value)} rows={2} disabled={text === null} placeholder="what you'd want this to do, or why not" className="mt-1 w-full text-[12px] leading-snug bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg p-2 outline-none focus:border-gray-900 dark:focus:border-gray-100 text-gray-700 dark:text-gray-300" />
    </div>
  );
}

export default function Widgets() {
  const { stars, toggle } = useStars();
  const { reactions, set: react } = useReactions();
  const [openId, setOpenId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const wid = (id: string) => `W-${id}`;

  const listText = () => [
    `Drill · widgets · ${new Date().toISOString().slice(0, 10)}`,
    "## the set",
    ...PICTURES.map((p) => `${stars.has(wid(p.key)) ? "★ " : reactions[wid(p.key)] === "no" ? "✕ " : "  "}${wid(p.key)} — ${p.name} (${p.status}): ${p.carries}`),
    "## the list, by priority",
    ...IDEAS.map((i) => `${stars.has(wid(i.id)) ? "★ " : reactions[wid(i.id)] === "no" ? "✕ " : "  "}${i.rank}. ${wid(i.id)} — ${i.name} (${i.status}; ${i.widget.map(pictureName).join(" + ")})`),
  ].join("\n");

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-4 mb-2">
        <h1 className="text-lg font-light tracking-tight">Widgets</h1>
        <span className="text-[12px] text-gray-500">the ideas, the pictures that carry them, and the order to build them in</span>
        <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(listText()); setCopied(true); setTimeout(() => setCopied(false), 900); } catch {} }} className="text-[11px] px-1.5 py-0.5 rounded-md border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 ml-auto">{copied ? "copied ✓" : "copy the list"}</button>
      </div>
      <p className="text-[13px] text-gray-600 dark:text-gray-300 max-w-3xl leading-snug">
        As few pictures as possible, each as good as we can make it. The test for a picture is whether the idea is really the same underneath — a fraction, a percent and a ratio are one length read three ways, so they get one bar, not three widgets. Below: the ten conceptual ideas K-12 mathematics develops that matter for adult arithmetic, ranked for Drill, each with the representations teachers and researchers use for it and what an interactive version would do. Then the four pictures that carry the list, and the libraries worth mining before drawing anything. ★ to prioritize, ✕ to exclude, a note on any row; “design W-bar” starts the design process for one.
      </p>

      {/* ── the set ─────────────────────────────────────────────────── */}
      <section id="set" className="scroll-mt-24 mt-10">
        <div className="flex items-baseline gap-3 mb-3"><h2 className="text-sm">The set</h2><span className="text-[11px] text-gray-500">four pictures; two exist. Sharing array and place-value slider from the Decisions row fold into the Array and the Line.</span></div>
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {PICTURES.map((p) => {
            const id = wid(p.key); const out = reactions[id] === "no";
            return (
              <div key={p.key} className={`rounded-xl border p-3 ${stars.has(id) ? "border-amber-400" : "border-gray-200 dark:border-gray-800"} ${out ? "opacity-40" : ""}`}>
                {p.sketch}
                <div className="flex items-start justify-between gap-2 mt-2">
                  <div className="min-w-0"><div className="flex items-center gap-2"><Handle id={id} /><span className="text-sm">{p.name}</span><span className={`text-[10px] uppercase tracking-wide ${STATUS[p.status]}`}>{p.status}</span></div><div className="text-[12px] text-gray-500 mt-1">{p.what}</div></div>
                  <div className="flex items-center gap-1 shrink-0"><Star id={id} stars={stars} toggle={toggle} size={16} /><Out id={id} reactions={reactions} set={react} size="xs" /></div>
                </div>
                <div className="text-[11px] text-gray-600 dark:text-gray-300 mt-2 leading-snug"><span className="uppercase tracking-wide text-[9px] text-gray-400">carries</span> {p.carries}</div>
                <div className="text-[11px] text-gray-400 mt-1">ideas: {IDEAS.filter((i) => i.widget.includes(p.key)).map((i) => i.rank).join(", ")}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── the list ────────────────────────────────────────────────── */}
      <section id="list" className="scroll-mt-24 mt-12">
        <div className="flex items-baseline gap-3 mb-3"><h2 className="text-sm">The list</h2><span className="text-[11px] text-gray-500">ranked for Drill — click a row for the idea, its representations, and the interactive sketch</span></div>
        <div className="border-t border-gray-200 dark:border-gray-800">
          {IDEAS.map((i) => {
            const id = wid(i.id); const open = openId === i.id; const out = reactions[id] === "no";
            return (
              <div key={i.id} id={id} className={`scroll-mt-24 border-b border-gray-100 dark:border-gray-900 ${out ? "opacity-40" : ""}`}>
                <div className="flex items-center gap-3 py-2.5 cursor-pointer" onClick={() => setOpenId(open ? null : i.id)}>
                  <span className="w-6 text-right text-[12px] text-gray-400 tabular-nums shrink-0">{i.rank}</span>
                  <span className="text-sm min-w-0 truncate">{i.name}</span>
                  <span className={`text-[10px] uppercase tracking-wide shrink-0 ${STATUS[i.status]}`}>{i.status}</span>
                  <span className="text-[11px] text-gray-400 shrink-0 hidden sm:inline">{i.widget.map(pictureName).join(" + ")}</span>
                  <span className="ml-auto flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}><Handle id={id} /><Star id={id} stars={stars} toggle={toggle} size={16} /><Out id={id} reactions={reactions} set={react} size="xs" /></span>
                </div>
                {open && (
                  <div className="pb-5 pl-9 grid gap-5 lg:grid-cols-[1.2fr_1fr] text-[13px] leading-snug">
                    <div className="space-y-3">
                      <p className="text-gray-800 dark:text-gray-200">{i.idea}</p>
                      <p className="text-gray-500"><span className="uppercase tracking-wide text-[10px] text-gray-400 mr-1">where</span>{i.where}</p>
                      <div><div className="uppercase tracking-wide text-[10px] text-gray-400">representations</div><ul className="mt-1 list-disc pl-4 text-gray-600 dark:text-gray-300 space-y-0.5">{i.reps.map((r) => <li key={r}>{r}</li>)}</ul></div>
                      {i.notes && <p className="text-gray-500 text-[12px]">{i.notes}</p>}
                    </div>
                    <div className="space-y-3">
                      <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-3"><div className="uppercase tracking-wide text-[10px] text-gray-400">interactive</div><p className="mt-1 text-gray-800 dark:text-gray-200">{i.interactive}</p><div className="mt-2 text-[11px] text-gray-500">picture: {i.widget.map(pictureName).join(" + ")}</div></div>
                      <div className="text-[12px] text-gray-500"><span className="uppercase tracking-wide text-[10px] text-gray-400 mr-1">serves</span>{i.serves}</div>
                      <Note id={id} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-gray-400 mt-3"><span className="uppercase tracking-wide text-[10px]">out of Drill&apos;s scope</span> {OUT_OF_SCOPE}</p>
      </section>

      {/* ── libraries ───────────────────────────────────────────────── */}
      <section id="libraries" className="scroll-mt-24 mt-12">
        <div className="flex items-baseline gap-3 mb-3"><h2 className="text-sm">Worth mining first</h2><span className="text-[11px] text-gray-500">existing libraries and the literature behind the representations — look before drawing</span></div>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 max-w-5xl">
          {LIBRARIES.map((l) => (
            <div key={l.name} className="text-[12px] leading-snug"><span className="text-gray-900 dark:text-gray-100">{l.url ? <a href={l.url} target="_blank" rel="noreferrer" className="underline decoration-gray-300 dark:decoration-gray-700 hover:decoration-gray-900">{l.name}</a> : l.name}</span> <span className="text-gray-500">— {l.what}</span></div>
          ))}
        </div>
      </section>

      <DsNotes page="widgets" />
    </div>
  );
}
