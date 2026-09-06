"use client";

/**
 * To-do — the running list for Drill. One note on the wall ("todo list"), one
 * item per line: "- [ ] text" / "- [x] text". Tick to close, add at the top,
 * edit the raw text below. Claude adds items when Erik mentions them and
 * reads the same note; "copy the list" gives it to the terminal.
 */
import { useEffect, useRef, useState } from "react";
import Handle from "@/components/DsHandle";

const KEY = "todo list";
interface Item { done: boolean; text: string }
const parse = (t: string): Item[] => t.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => { const m = l.match(/^-\s*\[( |x|X)\]\s*(.*)$/); return m ? { done: m[1] !== " ", text: m[2] } : { done: false, text: l.replace(/^-\s*/, "") }; });
const serialize = (items: Item[]) => items.map((i) => `- [${i.done ? "x" : " "}] ${i.text}`).join("\n");
const today = () => new Date().toISOString().slice(0, 10);

export default function Todo() {
  const [text, setText] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [state, setState] = useState("");
  const [showDone, setShowDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { fetch(`/api/designspace/notes?page=${encodeURIComponent(KEY)}`).then((r) => r.json()).then((j) => setText(j.text ?? "")).catch(() => setText("")); }, []);
  const save = (v: string, now = false) => {
    setText(v); setState("saving…"); if (t.current) clearTimeout(t.current);
    const go = async () => { const r = await fetch("/api/designspace/notes", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ page: KEY, text: v }) }).catch(() => null); setState(r?.ok ? "saved" : "couldn't save"); };
    if (now) void go(); else t.current = setTimeout(go, 600);
  };
  const items = parse(text ?? "");
  const open = items.filter((i) => !i.done), done = items.filter((i) => i.done);
  const toggle = (idx: number) => { const next = items.map((i, j) => (j === idx ? { ...i, done: !i.done } : i)); save(serialize(next), true); };
  const add = () => { const v = draft.trim(); if (!v) return; save(serialize([{ done: false, text: `${v} (${today()})` }, ...items]), true); setDraft(""); };

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-baseline gap-4 mb-1">
        <h1 className="text-lg font-light tracking-tight">To-do</h1>
        <span className="text-[12px] text-gray-500">the running list — yours and Claude&apos;s; the same note is read from the terminal</span>
        <span className="text-[11px] text-gray-400 ml-auto">{state}</span>
        <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(`Drill · to-do · ${today()}\n${serialize(items)}`); setCopied(true); setTimeout(() => setCopied(false), 900); } catch {} }} className="text-[11px] px-1.5 py-0.5 rounded-md border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">{copied ? "copied ✓" : "copy the list"}</button>
      </div>
      <p className="text-[12px] text-gray-500 mb-6">Tick to close. Say “add to the list: …” in the terminal, or type here. Handle <Handle id="todo" /> — “do the first three on the list”.</p>

      <form onSubmit={(e) => { e.preventDefault(); add(); }} className="flex gap-2 mb-6">
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="something to do…" className="flex-1 text-sm bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 outline-none focus:border-gray-900 dark:focus:border-gray-100" />
        <button type="submit" disabled={!draft.trim()} className="text-sm px-3 py-2 rounded-lg bg-gray-900 text-white dark:bg-gray-100 dark:text-black disabled:opacity-30">add</button>
      </form>

      {text === null ? <div className="text-[12px] text-gray-400">loading…</div> : (
        <>
          <ul className="space-y-1.5">
            {open.map((i) => { const idx = items.indexOf(i); return (
              <li key={idx} className="flex items-start gap-3 text-[14px] leading-snug">
                <button type="button" onClick={() => toggle(idx)} aria-label="done" className="mt-[3px] w-4 h-4 shrink-0 rounded border border-gray-300 dark:border-gray-700 hover:border-emerald-500" />
                <span className="text-gray-800 dark:text-gray-200">{i.text}</span>
              </li>
            ); })}
            {open.length === 0 && <li className="text-[12px] text-gray-400">nothing open</li>}
          </ul>
          {done.length > 0 && (
            <div className="mt-8">
              <button type="button" onClick={() => setShowDone((v) => !v)} className="text-[11px] text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">{showDone ? "hide" : "show"} done · {done.length}</button>
              {showDone && <ul className="mt-2 space-y-1.5">{done.map((i) => { const idx = items.indexOf(i); return (
                <li key={idx} className="flex items-start gap-3 text-[14px] leading-snug text-gray-400">
                  <button type="button" onClick={() => toggle(idx)} aria-label="reopen" className="mt-[3px] w-4 h-4 shrink-0 rounded border border-emerald-500 bg-emerald-500/30" />
                  <span className="line-through">{i.text}</span>
                </li>
              ); })}</ul>}
            </div>
          )}
          <details className="mt-10">
            <summary className="text-[11px] text-gray-400 cursor-pointer select-none">edit the raw list</summary>
            <textarea value={text} onChange={(e) => save(e.target.value)} rows={14} className="mt-2 w-full text-[12px] leading-snug font-mono bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg p-2 outline-none focus:border-gray-900 dark:focus:border-gray-100 text-gray-700 dark:text-gray-300" />
          </details>
        </>
      )}
    </div>
  );
}
