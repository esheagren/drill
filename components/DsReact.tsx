"use client";

import { useEffect, useState } from "react";

export type Reaction = "yes" | "maybe" | "no";

/** Reactions saved to the wall (notes table, key "↕ <handle>"). Since 9/3 only "no" (ruled out) is used — a like is a star. */
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

/** ✕ — rule this one out. It collapses from the strip (tick "show the ✕" to see it) and stays out until clicked again. */
export function Out({ id, reactions, set, size = "sm" }: { id: string; reactions: Record<string, Reaction>; set: (id: string, v: Reaction | null) => void; size?: "sm" | "xs" }) {
  const on = reactions[id] === "no";
  return (
    <button type="button" onClick={() => set(id, on ? null : "no")} title={on ? "ruled out — click to bring it back" : "rule this one out"}
      className={`${size === "xs" ? "text-[10px]" : "text-[11px]"} px-1.5 py-0.5 rounded-md border leading-none ${on ? "border-rose-500 text-rose-500" : "border-gray-200 dark:border-gray-800 text-gray-400 hover:text-rose-500 hover:border-rose-400"}`}>
      {on ? "out" : "✕"}
    </button>
  );
}

/** Kept for older pages: yes / maybe / no. */
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
