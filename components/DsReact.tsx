"use client";

import { useEffect, useState } from "react";

export type Reaction = "yes" | "maybe" | "no";

/** Reactions saved to the wall (notes table, key "↕ <handle>", text yes|maybe|no). */
export function useReactions() {
  const [r, setR] = useState<Record<string, Reaction>>({});
  useEffect(() => {
    fetch(`/api/designspace/notes?prefix=${encodeURIComponent("↕ ")}`).then((x) => x.json())
      .then((j) => setR(Object.fromEntries((j.notes ?? []).map((n: { page: string; text: string }) => [n.page.slice(2), n.text as Reaction])))).catch(() => {});
  }, []);
  const set = async (id: string, v: Reaction | null) => {
    setR((cur) => { const n = { ...cur }; if (v) n[id] = v; else delete n[id]; return n; });
    await fetch("/api/designspace/notes", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ page: `↕ ${id}`, text: v ?? "" }) }).catch(() => {});
  };
  return { reactions: r, set };
}

export function React3({ id, reactions, set, size = "sm" }: { id: string; reactions: Record<string, Reaction>; set: (id: string, v: Reaction | null) => void; size?: "sm" | "xs" }) {
  const cur = reactions[id];
  const opts: [Reaction, string, string][] = [["yes", "yes", "text-emerald-500 border-emerald-500"], ["maybe", "maybe", "text-amber-500 border-amber-500"], ["no", "no", "text-rose-500 border-rose-500"]];
  return (
    <div className={`inline-flex rounded-md border border-gray-200 dark:border-gray-800 overflow-hidden ${size === "xs" ? "text-[10px]" : "text-[11px]"}`}>
      {opts.map(([v, label, on]) => (
        <button key={v} type="button" onClick={() => set(id, cur === v ? null : v)} className={`px-1.5 py-0.5 border-r last:border-r-0 border-gray-200 dark:border-gray-800 ${cur === v ? on : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}>{label}</button>
      ))}
    </div>
  );
}
