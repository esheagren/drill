"use client";

import { useEffect, useState } from "react";

/** A star saved to the wall (notes table, key "★ <handle>") — Claude reads stars the same way it reads notes. */
export function useStars() {
  const [stars, setStars] = useState<Set<string>>(new Set());
  const load = () => fetch(`/api/designspace/notes?prefix=${encodeURIComponent("★ ")}`).then((r) => r.json()).then((j) => setStars(new Set((j.notes ?? []).map((n: { page: string }) => n.page.slice(2))))).catch(() => {});
  useEffect(() => { load(); }, []);
  const toggle = async (id: string) => {
    const on = !stars.has(id);
    setStars((s) => { const n = new Set(s); if (on) n.add(id); else n.delete(id); return n; });
    await fetch("/api/designspace/notes", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ page: `★ ${id}`, text: on ? "starred" : "" }) }).catch(() => {});
  };
  return { stars, toggle };
}

export function Star({ id, stars, toggle, size = 18 }: { id: string; stars: Set<string>; toggle: (id: string) => void; size?: number }) {
  const on = stars.has(id);
  return (
    <button type="button" onClick={() => toggle(id)} aria-label={on ? "unstar" : "star"} title={on ? "starred — click to remove" : "star this"}
      className={`leading-none ${on ? "text-amber-400" : "text-gray-300 dark:text-gray-700 hover:text-amber-400"}`} style={{ fontSize: size }}>
      {on ? "★" : "☆"}
    </button>
  );
}
