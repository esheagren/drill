"use client";

import { useState } from "react";

/** A stable name you can point at from the terminal. Click copies it. */
export default function Handle({ id, children, className = "" }: { id: string; children?: React.ReactNode; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => { navigator.clipboard?.writeText(id); setDone(true); setTimeout(() => setDone(false), 900); }}
      title={`copy “${id}”`}
      className={`inline-flex items-center gap-1 font-mono text-[11px] px-1.5 py-0.5 rounded-md border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-400 ${className}`}
    >
      {children ?? id}{done && <span className="text-emerald-500">✓</span>}
    </button>
  );
}
