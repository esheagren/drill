"use client";

import { useEffect, useRef, useState } from "react";

/** Shared notes box at the bottom of every designspace page. Saved to the database; Claude reads the same rows. */
export default function DsNotes({ page }: { page: string }) {
  const [text, setText] = useState("");
  const [state, setState] = useState<"loading" | "idle" | "saving" | "saved" | "error">("loading");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    fetch(`/api/designspace/notes?page=${page}`).then((r) => r.json()).then((j) => { setText(j.text ?? ""); setState("idle"); }).catch(() => setState("error"));
  }, [page]);
  const onChange = (v: string) => {
    setText(v); setState("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try { const r = await fetch("/api/designspace/notes", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ page, text: v }) }); setState(r.ok ? "saved" : "error"); }
      catch { setState("error"); }
    }, 700);
  };
  return (
    <section className="mt-16 border-t border-gray-200 dark:border-gray-800 pt-6">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-sm font-medium">Notes for this page</h2>
        <span className="text-[11px] text-gray-400">{state === "saving" ? "saving…" : state === "saved" ? "saved" : state === "error" ? "couldn't save" : ""}</span>
      </div>
      <p className="text-[12px] text-gray-500 mb-2">Write anything here — reactions, asks, sketches in words. Claude reads these notes when you point it at this page.</p>
      <textarea value={text} onChange={(e) => onChange(e.target.value)} disabled={state === "loading"} rows={6}
        className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent p-3 text-sm outline-none focus:border-gray-900 dark:focus:border-gray-100" placeholder="…" />
    </section>
  );
}
