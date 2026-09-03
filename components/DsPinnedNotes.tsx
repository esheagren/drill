"use client";

import { useEffect, useRef, useState } from "react";
import CopyFeedback from "./DsCopy";

/**
 * Notes pinned to a screen (V2) or a component on it (V2 › TechniqueCard).
 * Stored under that handle so a terminal request can name it exactly.
 */
export default function PinnedNotes({ screen, components }: { screen: string; components: string[] }) {
  const [target, setTarget] = useState(screen);
  const [text, setText] = useState("");
  const [existing, setExisting] = useState<{ page: string; text: string; updated_at: string }[]>([]);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const load = () => fetch(`/api/designspace/notes?prefix=${encodeURIComponent(screen)}`).then((r) => r.json()).then((j) => setExisting(j.notes ?? [])).catch(() => {});
  useEffect(() => { load(); }, [screen]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { const cur = existing.find((n) => n.page === target); setText(cur?.text ?? ""); }, [target, existing]);
  const onChange = (v: string) => {
    setText(v); setState("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try { const r = await fetch("/api/designspace/notes", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ page: target, text: v }) }); setState(r.ok ? "saved" : "error"); load(); }
      catch { setState("error"); }
    }, 700);
  };
  return (
    <div className="text-sm">
      <div className="flex items-center gap-1.5 mb-2 justify-end">
        <span className="text-[10px] uppercase tracking-wide text-gray-400 mr-auto">copy</span>
        <CopyFeedback prefix={target} scope={target} label="this" rows={text.trim() ? [{ page: target, text }] : []} />
        <CopyFeedback prefix={screen} scope={screen} label="screen" />
      </div>
      <div className="flex items-center gap-2 mb-2">
        <select value={target} onChange={(e) => setTarget(e.target.value)} className="bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg px-2 py-1 text-[12px] font-mono max-w-full">
          <option value={screen}>{screen}</option>
          {components.map((c) => <option key={c} value={`${screen} › ${c}`}>{screen} › {c}</option>)}
        </select>
        <span className="text-[11px] text-gray-400">{state === "saving" ? "saving…" : state === "saved" ? "saved" : state === "error" ? "couldn't save" : ""}</span>
      </div>
      <textarea value={text} onChange={(e) => onChange(e.target.value)} rows={4} placeholder={`Note on ${target}…`}
        className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent p-3 text-sm outline-none focus:border-gray-900 dark:focus:border-gray-100" />
      {existing.filter((n) => n.page !== target).length > 0 && (
        <ul className="mt-3 space-y-2">
          {existing.filter((n) => n.page !== target).map((n) => (
            <li key={n.page} className="text-[12px]"><button onClick={() => setTarget(n.page)} className="font-mono text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">{n.page}</button><div className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{n.text}</div></li>
          ))}
        </ul>
      )}
    </div>
  );
}
