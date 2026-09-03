"use client";

import { useState } from "react";
import { copyText, formatFeedback, type NoteRow } from "@/lib/dsFeedback";

/** "Copy feedback" — this note, this screen, or everything — as one paste-ready block. */
export default function CopyFeedback({ prefix, label, scope, className = "", rows }: { prefix: string; label: string; scope: string; className?: string; rows?: NoteRow[] }) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "empty" | "error">("idle");
  const go = async () => {
    setState("busy");
    try {
      const data = rows ?? ((await (await fetch(`/api/designspace/notes?prefix=${encodeURIComponent(prefix)}`)).json()).notes as NoteRow[]);
      const text = formatFeedback(data ?? [], scope);
      if (!data?.some((r) => r.text.trim())) { setState("empty"); setTimeout(() => setState("idle"), 1200); return; }
      setState((await copyText(text)) ? "done" : "error");
    } catch { setState("error"); }
    setTimeout(() => setState("idle"), 1400);
  };
  return (
    <button type="button" onClick={go} className={`text-[11px] px-2 py-1 rounded-md border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-400 ${className}`}>
      {state === "busy" ? "…" : state === "done" ? "copied ✓" : state === "empty" ? "nothing yet" : state === "error" ? "couldn't copy" : label}
    </button>
  );
}
