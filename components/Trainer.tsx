"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { generateItem, type Item } from "@/lib/items";
import { appendLog, loadState, mastery, nextSkill, record, saveState, type EngineState } from "@/lib/engine";
import { SKILL_BY_ID, type SkillId } from "@/lib/skills";
import { SESSION_MS, saveSession, type SessionRecord } from "@/lib/sessions";
import Keypad from "./Keypad";
import SkillMap from "./SkillMap";

type Phase = "answer" | "correct" | "wrong" | "done";

const ADVANCE_MS = 450;

export default function Trainer() {
  const [state, setState] = useState<EngineState | null>(null);
  const [item, setItem] = useState<Item | null>(null);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<Phase>("answer");
  const [showMap, setShowMap] = useState(false);
  const [remaining, setRemaining] = useState(SESSION_MS);
  const [session, setSession] = useState<SessionRecord | null>(null);

  const startRef = useRef(0);          // item start
  const sessionStartRef = useRef(0);   // 0 = not started (waits for first key)
  const lastSkillRef = useRef<SkillId | null>(null);
  const tallyRef = useRef<SessionRecord["bySkill"]>({});
  const countRef = useRef({ n: 0, c: 0 });

  const advance = useCallback((st: EngineState) => {
    const id = nextSkill(st, lastSkillRef.current);
    lastSkillRef.current = id;
    setItem(generateItem(id));
    setInput("");
    setPhase("answer");
    startRef.current = performance.now();
  }, []);

  useEffect(() => {
    const st = loadState();
    setState(st);
    advance(st);
  }, [advance]);

  // ── Timer ────────────────────────────────────────────────────────────────
  const finish = useCallback(() => {
    const rec: SessionRecord = {
      ts: sessionStartRef.current,
      durationMs: Math.min(SESSION_MS, Date.now() - sessionStartRef.current),
      answered: countRef.current.n,
      correct: countRef.current.c,
      bySkill: tallyRef.current,
    };
    saveSession(rec);
    setSession(rec);
    setPhase("done");
  }, []);

  useEffect(() => {
    if (phase === "done") return;
    const id = setInterval(() => {
      if (!sessionStartRef.current) return;
      const left = SESSION_MS - (Date.now() - sessionStartRef.current);
      if (left <= 0) { setRemaining(0); finish(); } else setRemaining(left);
    }, 250);
    return () => clearInterval(id);
  }, [phase, finish]);

  const restart = () => {
    if (!state) return;
    sessionStartRef.current = 0;
    countRef.current = { n: 0, c: 0 };
    tallyRef.current = {};
    setRemaining(SESSION_MS);
    setSession(null);
    advance(state);
  };

  // ── Answering ────────────────────────────────────────────────────────────
  const submit = (value: string = input) => {
    if (!item || !state || phase !== "answer" || !value.trim()) return;
    const latency = Math.round(performance.now() - startRef.current);
    const ok = item.check(value);
    const next = record(state, item.skillId, ok, latency);
    saveState(next);
    appendLog({ skillId: item.skillId, prompt: item.prompt, answer: value, correct: ok, latencyMs: latency, ts: Date.now() });
    setState(next);

    countRef.current.n += 1;
    if (ok) countRef.current.c += 1;
    const t = (tallyRef.current[item.skillId] ||= { n: 0, c: 0 });
    t.n += 1; if (ok) t.c += 1;

    if (ok) { setPhase("correct"); setTimeout(() => advance(next), ADVANCE_MS); }
    else setPhase("wrong");
  };

  const press = (k: string) => {
    if (phase === "wrong") { if (state) advance(state); return; }
    if (phase !== "answer" || !item) return;
    if (!sessionStartRef.current) sessionStartRef.current = Date.now(); // timer starts on first key
    const v = input + k;
    setInput(v);
    if (item.autoLen && v.length >= item.autoLen) submit(v);
  };
  const backspace = () => { if (phase === "answer") setInput((s) => s.slice(0, -1)); };
  const enter = () => {
    if (phase === "answer") submit();
    else if (phase === "wrong" && state) advance(state);
  };

  // Hardware keyboard support (desktop).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (showMap || phase === "done") return;
      if (/^[0-9.e]$/.test(e.key)) { e.preventDefault(); press(e.key); }
      else if (e.key === "Backspace") { e.preventDefault(); backspace(); }
      else if (e.key === "Enter") { e.preventDefault(); enter(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!state || !item) return <div className="min-h-dvh bg-white dark:bg-black" />;

  // ── Session summary ──────────────────────────────────────────────────────
  if (phase === "done" && session) {
    const pct = session.answered ? Math.round((100 * session.correct) / session.answered) : 0;
    const rows = Object.entries(session.bySkill).sort((a, b) => b[1]!.n - a[1]!.n);
    return (
      <div className="min-h-dvh flex flex-col bg-white dark:bg-black text-gray-900 dark:text-gray-100">
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="text-7xl font-light tabular-nums">{session.answered}</div>
          <div className="text-sm text-gray-400 mt-1">answered in 8 minutes</div>
          <div className="text-2xl font-light mt-6 tabular-nums">{session.correct} correct · {pct}%</div>
          <ul className="mt-8 w-full max-w-xs text-sm space-y-1">
            {rows.map(([id, t]) => (
              <li key={id} className="flex justify-between text-gray-500">
                <span>{SKILL_BY_ID[id as SkillId].name}</span>
                <span className="tabular-nums">{t!.c}/{t!.n}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="px-6 pb-[max(env(safe-area-inset-bottom),24px)] space-y-2 max-w-md mx-auto w-full">
          <button onClick={restart} className="w-full h-14 rounded-2xl bg-gray-900 text-white dark:bg-gray-100 dark:text-black text-lg active:scale-[0.98] transition">
            Again
          </button>
          <button onClick={() => setShowMap(true)} className="w-full h-12 text-sm text-gray-500">skills & days</button>
        </div>
        {showMap && <SkillMap state={state} onClose={() => setShowMap(false)} />}
      </div>
    );
  }

  // ── Practice ─────────────────────────────────────────────────────────────
  const skill = SKILL_BY_ID[item.skillId];
  const m = mastery(item.skillId, state[item.skillId]);
  const mm = Math.floor(remaining / 60000), ss = Math.floor((remaining % 60000) / 1000);
  const started = sessionStartRef.current !== 0;

  return (
    <div className="h-dvh flex flex-col bg-white dark:bg-black text-gray-900 dark:text-gray-100 select-none overflow-hidden">
      <header className="grid grid-cols-3 items-center px-5 pt-[max(env(safe-area-inset-top),16px)] pb-2 text-xs text-gray-400 dark:text-gray-500">
        <div className="flex items-center gap-2 min-w-0">
          <MasteryDots value={m} />
          <span className="tracking-wide uppercase truncate">{skill.name}</span>
        </div>
        <div className={`text-center text-base tabular-nums ${started ? "text-gray-900 dark:text-gray-100" : ""}`}>
          {mm}:{String(ss).padStart(2, "0")}
        </div>
        <button onClick={() => setShowMap(true)} aria-label="Skill map" className="text-right tabular-nums hover:text-gray-900 dark:hover:text-gray-100">
          {countRef.current.n} · ▦
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 min-h-0">
        <div className="text-center space-y-2">
          <div className="text-4xl sm:text-5xl font-light tracking-tight leading-tight" style={{ overflowWrap: "anywhere" }}>
            {item.prompt}
          </div>
          <div className="text-sm text-gray-400 dark:text-gray-500">{item.sub ?? skill.ask}</div>
        </div>

        <div className="w-full max-w-sm mt-8">
          <div
            className={[
              "w-full text-center text-3xl font-light py-3 border-b-2 min-h-[3.5rem] tabular-nums transition-colors",
              phase === "correct" ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
              : phase === "wrong" ? "border-rose-400 text-rose-500 line-through decoration-2"
              : "border-gray-200 dark:border-gray-800",
            ].join(" ")}
          >
            {input || <span className="text-gray-300 dark:text-gray-700 text-xl">{item.placeholder}</span>}
          </div>

          <div className="min-h-20 mt-4 text-center">
            {phase === "wrong" && (
              <button onClick={() => advance(state)} className="w-full space-y-1 active:opacity-70">
                <div className="text-2xl font-light">{item.answerText}</div>
                <div className="text-sm text-gray-500">{item.why}</div>
                <div className="text-xs text-gray-400 dark:text-gray-600 pt-1">any key to continue</div>
              </button>
            )}
          </div>
        </div>
      </main>

      <Keypad onKey={press} onBackspace={backspace} onSubmit={enter} submitDisabled={phase === "answer" && !input} />

      {showMap && <SkillMap state={state} onClose={() => setShowMap(false)} />}
    </div>
  );
}

function MasteryDots({ value }: { value: number }) {
  const filled = Math.round(value * 5);
  return (
    <span className="flex gap-0.5 shrink-0" aria-label={`mastery ${Math.round(value * 100)}%`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={`w-1.5 h-1.5 rounded-full ${i < filled ? "bg-gray-900 dark:bg-gray-100" : "bg-gray-200 dark:bg-gray-800"}`} />
      ))}
    </span>
  );
}
