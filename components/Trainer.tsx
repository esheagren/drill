"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Item } from "@/lib/items";
import { appendLog, expectedScore, mastery, nextSkill, pickItem, record, saveState, type EngineState } from "@/lib/engine";
import { SKILL_BY_ID, type SkillId } from "@/lib/skills";
import { MIXED, saveSession, type Plan, type SessionRecord } from "@/lib/sessions";
import { flush, hydrate, queueAttempt, queueSession } from "@/lib/sync";
import Keypad from "./Keypad";
import Units from "./Units";
import SkillMap from "./SkillMap";

type Phase = "answer" | "correct" | "wrong" | "done";

const ADVANCE_MS = 450;
const REVIEW_GAP = 2;

export default function Trainer() {
  const [state, setState] = useState<EngineState | null>(null);
  const [item, setItem] = useState<Item | null>(null);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<Phase>("answer");
  const [showMap, setShowMap] = useState(false);
  const [showUnits, setShowUnits] = useState(false);
  const [plan, setPlan] = useState<Plan>(MIXED);
  const planRef = useRef<Plan>(MIXED);
  const [remaining, setRemaining] = useState(MIXED.durationMs);
  const [session, setSession] = useState<SessionRecord | null>(null);

  const startRef = useRef(0);          // item start
  const sessionStartRef = useRef(0);   // 0 = not started (waits for first key)
  const lastSkillRef = useRef<SkillId | null>(null);
  const tallyRef = useRef<SessionRecord["bySkill"]>({});
  const countRef = useRef({ n: 0, c: 0 });
  // Spaced review inside the session: a missed item returns after REVIEW_GAP others.
  const reviewRef = useRef<{ item: Item; due: number }[]>([]);
  const isReviewRef = useRef(false);

  const advance = useCallback((st: EngineState) => {
    const due = reviewRef.current.find((r) => r.due <= countRef.current.n);
    if (due) {
      reviewRef.current = reviewRef.current.filter((r) => r !== due);
      isReviewRef.current = true;
      lastSkillRef.current = due.item.skillId;
      setItem(due.item);
      setInput("");
      setPhase("answer");
      startRef.current = performance.now();
      return;
    }
    isReviewRef.current = false;
    const id = nextSkill(st, lastSkillRef.current, planRef.current.pool);
    lastSkillRef.current = id;
    setItem(pickItem(st, id));
    setInput("");
    setPhase("answer");
    startRef.current = performance.now();
  }, []);

  useEffect(() => {
    let alive = true;
    hydrate().then((st) => {
      if (!alive) return;
      setState(st);
      advance(st);
      void flush();
    });
    const onHide = () => { if (document.visibilityState === "hidden") void flush(); };
    document.addEventListener("visibilitychange", onHide);
    return () => { alive = false; document.removeEventListener("visibilitychange", onHide); };
  }, [advance]);

  // ── Timer ────────────────────────────────────────────────────────────────
  const finish = useCallback(() => {
    const rec: SessionRecord = {
      plan: planRef.current.id,
      ts: sessionStartRef.current,
      durationMs: Math.min(planRef.current.durationMs, Date.now() - sessionStartRef.current),
      answered: countRef.current.n,
      correct: countRef.current.c,
      bySkill: tallyRef.current,
    };
    saveSession(rec);
    queueSession(rec);
    void flush();
    delete document.body.dataset.inSession;
    setSession(rec);
    setPhase("done");
  }, []);

  useEffect(() => {
    if (phase === "done") return;
    const id = setInterval(() => {
      if (!sessionStartRef.current) return;
      const left = planRef.current.durationMs - (Date.now() - sessionStartRef.current);
      if (left <= 0) { setRemaining(0); finish(); } else setRemaining(left);
    }, 250);
    return () => clearInterval(id);
  }, [phase, finish]);

  const restart = (next: Plan = planRef.current) => {
    if (!state) return;
    if (document.body.dataset.updateReady === "1") { window.location.reload(); return; } // pick up a deferred deploy
    planRef.current = next;
    setPlan(next);
    sessionStartRef.current = 0;
    delete document.body.dataset.inSession;
    countRef.current = { n: 0, c: 0 };
    tallyRef.current = {};
    reviewRef.current = [];
    setRemaining(next.durationMs);
    setSession(null);
    setShowUnits(false);
    advance(state);
  };

  // Choosing a plan mid-session abandons the current one (recorded if anything was answered).
  const pick = (next: Plan) => {
    if (sessionStartRef.current && countRef.current.n > 0 && phase !== "done") finish();
    restart(next);
  };

  // ── Answering ────────────────────────────────────────────────────────────
  const submit = (value: string = input) => {
    if (!item || !state || phase !== "answer" || !value.trim()) return;
    const latency = Math.round(performance.now() - startRef.current);
    const ok = item.check(value);
    const res = record(state, item, ok, latency);
    const next = res.state;
    saveState(next);
    const entry = { skillId: item.skillId, itemKey: item.key, prompt: item.prompt, answer: value, correct: ok, latencyMs: latency, ts: Date.now(), review: isReviewRef.current, score: res.score, expected: res.expected, theta: res.theta, beta: res.beta };
    if (!ok) reviewRef.current.push({ item, due: countRef.current.n + 1 + REVIEW_GAP }); // comes back after REVIEW_GAP others
    appendLog(entry);
    queueAttempt(entry);
    setState(next);

    countRef.current.n += 1;
    if (ok) countRef.current.c += 1;
    if (countRef.current.n % 10 === 0) void flush();
    const t = (tallyRef.current[item.skillId] ||= { n: 0, c: 0 });
    t.n += 1; if (ok) t.c += 1;

    if (ok) { setPhase("correct"); setTimeout(() => advance(next), ADVANCE_MS); }
    else setPhase("wrong");
  };

  const press = (k: string) => {
    if (phase === "wrong") { if (state) advance(state); return; }
    if (phase !== "answer" || !item) return;
    if (!sessionStartRef.current) { sessionStartRef.current = Date.now(); document.body.dataset.inSession = "1"; } // timer starts on first key
    setInput(input + k);
  };
  const backspace = () => { if (phase === "answer") setInput((s) => s.slice(0, -1)); };
  const enter = () => {
    if (phase === "answer") submit();
    else if (phase === "wrong" && state) advance(state);
  };

  // Hardware keyboard support (desktop).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (showMap || showUnits || phase === "done") return;
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
          <div className="text-sm text-gray-400 mt-1">answered · {plan.label} · {Math.round(plan.durationMs / 60000)} min</div>
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
          <button onClick={() => restart()} className="w-full h-14 rounded-2xl bg-gray-900 text-white dark:bg-gray-100 dark:text-black text-lg active:scale-[0.98] transition">
            Again
          </button>
          <div className="flex justify-between text-sm text-gray-500 px-1">
            <button onClick={() => setShowUnits(true)} className="h-12">practice a unit</button>
            {plan.id !== "mixed" && <button onClick={() => restart(MIXED)} className="h-12">back to mixed</button>}
            <button onClick={() => setShowMap(true)} className="h-12">days</button>
          </div>
        </div>
        {showUnits && <Units state={state} onPick={pick} onClose={() => setShowUnits(false)} />}
        {showMap && <SkillMap state={state} onClose={() => setShowMap(false)} />}
      </div>
    );
  }

  // ── Practice ─────────────────────────────────────────────────────────────
  const skill = SKILL_BY_ID[item.skillId];
  const m = mastery(item.skillId, state.skills[item.skillId]);
  const exp = expectedScore(state, item);
  const mm = Math.floor(remaining / 60000), ss = Math.floor((remaining % 60000) / 1000);
  const started = sessionStartRef.current !== 0;

  return (
    <div className="h-dvh flex flex-col bg-white dark:bg-black text-gray-900 dark:text-gray-100 select-none overflow-hidden">
      <header className="grid grid-cols-3 items-center px-5 pt-[max(env(safe-area-inset-top),16px)] pb-2 text-xs text-gray-400 dark:text-gray-500">
        <button onClick={() => setShowUnits(true)} className="flex items-center gap-2 min-w-0 text-left" aria-label="Choose practice">
          <MasteryDots value={m} />
          <span className="tracking-wide uppercase truncate">{plan.id === "mixed" ? skill.name : `${plan.label} · ${skill.name}`}</span>
          <span className="shrink-0 tabular-nums">{isReviewRef.current ? "↺" : `${Math.round(exp * 100)}%`}</span>
        </button>
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

      {showUnits && <Units state={state} onPick={pick} onClose={() => setShowUnits(false)} />}
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
