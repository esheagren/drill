"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Item } from "@/lib/items";
import { appendLog, nextSkill, pickItem, record, saveState, type EngineState } from "@/lib/engine";
import { SKILL_BY_ID, type SkillId } from "@/lib/skills";
import { MIXED, loadDefaultMinutes, mixedFor, saveDefaultMinutes, saveSession, type Plan, type SessionRecord } from "@/lib/sessions";
import { flush, hydrate, queueAttempt, queueSession } from "@/lib/sync";
import Keypad from "./Keypad";
import Onboarding from "./Onboarding";
import { getProfile } from "@/lib/account";
import type { Profile } from "@/lib/user";
import Units from "./Units";
import Stats from "./Stats";

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
  const [profile, setProfile] = useState<Profile | null>(null);   // null = not loaded yet
  const [plan, setPlan] = useState<Plan>(MIXED);
  const planRef = useRef<Plan>(MIXED);
  const [remaining, setRemaining] = useState(MIXED.durationMs);
  const [timerMenu, setTimerMenu] = useState(false);
  const [askDefault, setAskDefault] = useState<number | null>(null); // minutes just chosen, pending "make default?"
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
    const initial = mixedFor(loadDefaultMinutes());
    planRef.current = initial; setPlan(initial); setRemaining(initial.durationMs);
    hydrate().then((st) => {
      if (!alive) return;
      setState(st);
      advance(st);
      void flush();
    });
    getProfile().then((p) => { if (alive) setProfile(p); });
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

  const chooseMinutes = (min: number) => {
    setTimerMenu(false);
    pick(mixedFor(min));
    if (min !== loadDefaultMinutes()) setAskDefault(min);
  };

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
    const entry = { skillId: item.skillId, itemKey: item.key, prompt: item.prompt, answer: value, correct: ok, latencyMs: latency, ts: Date.now(), review: isReviewRef.current, ignored: res.ignored, score: res.score, expected: res.expected, theta: res.theta, beta: res.beta };
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
      if (showMap || showUnits || timerMenu || askDefault !== null || phase === "done" || !profile?.username) return;
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      if (/^[0-9.e]$/.test(e.key)) { e.preventDefault(); press(e.key); }
      else if (e.key === "Backspace") { e.preventDefault(); backspace(); }
      else if (e.key === "Enter") { e.preventDefault(); enter(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!state || !item || profile === null) return <div className="min-h-dvh bg-white dark:bg-black" />;
  if (!profile.username) return <Onboarding onDone={(username) => setProfile({ ...profile, username })} />;

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
          <div className="flex gap-2">
            <button onClick={() => restart()} className="flex-1 h-14 rounded-2xl bg-gray-900 text-white dark:bg-gray-100 dark:text-black text-lg active:scale-[0.98] transition">
              Again
            </button>
            {[2, 4, 8, 12].map((min) => (
              <button
                key={min}
                onClick={() => restart({ ...MIXED, durationMs: min * 60_000 })}
                aria-label={`Mixed practice, ${min} minutes`}
                className={`w-12 h-14 rounded-2xl text-sm tabular-nums border transition active:scale-95 ${
                  plan.id === "mixed" && plan.durationMs === min * 60_000
                    ? "border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100"
                    : "border-gray-200 dark:border-gray-800 text-gray-500"
                }`}
              >
                {min}m
              </button>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-500 px-1">
            <button onClick={() => setShowUnits(true)} className="h-12">practice a unit</button>
            {plan.id !== "mixed" && <button onClick={() => restart(MIXED)} className="h-12">back to mixed</button>}
            <button onClick={() => setShowMap(true)} className="h-12">history</button>
          </div>
        </div>
        {showUnits && <Units state={state} onPick={pick} onClose={() => setShowUnits(false)} />}
        {showMap && <Stats state={state} profile={profile} onProfile={setProfile} onClose={() => setShowMap(false)} />}
      </div>
    );
  }

  // ── Practice ─────────────────────────────────────────────────────────────
  const skill = SKILL_BY_ID[item.skillId];
  const mm = Math.floor(remaining / 60000), ss = Math.floor((remaining % 60000) / 1000);
  const started = sessionStartRef.current !== 0;

  return (
    <div className="h-dvh flex flex-col bg-white dark:bg-black text-gray-900 dark:text-gray-100 select-none overflow-hidden">
      <header className="grid grid-cols-3 items-center px-5 pt-[max(env(safe-area-inset-top),16px)] pb-2 text-xs text-gray-400 dark:text-gray-500">
        <button onClick={() => setShowUnits(true)} className="text-left text-base leading-none" aria-label="Choose practice">
          ≡{plan.id !== "mixed" && <span className="ml-2 text-xs uppercase tracking-wide">{plan.label}</span>}{isReviewRef.current && <span className="ml-2">↺</span>}
        </button>
        <button onClick={() => setTimerMenu(true)} aria-label="Change session length" className={`text-center text-base tabular-nums ${started ? "text-gray-900 dark:text-gray-100" : ""}`}>
          {mm}:{String(ss).padStart(2, "0")}
        </button>
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

      {timerMenu && (
        <Sheet onClose={() => setTimerMenu(false)} title="Session length">
          <div className="grid grid-cols-4 gap-2">
            {[2, 4, 8, 12].map((min) => (
              <button key={min} onClick={() => chooseMinutes(min)} className={`h-14 rounded-2xl text-lg tabular-nums border ${plan.durationMs === min * 60000 ? "border-gray-900 dark:border-gray-100" : "border-gray-200 dark:border-gray-800 text-gray-500"}`}>
                {min}m
              </button>
            ))}
          </div>
          {started && countRef.current.n > 0 && <p className="text-xs text-gray-400 mt-3">Choosing a length ends the current session and starts a new mixed one.</p>}
        </Sheet>
      )}
      {askDefault !== null && (
        <Sheet onClose={() => setAskDefault(null)} title={`Make ${askDefault} min your default?`}>
          <p className="text-sm text-gray-500 mb-4">The app will open into a {askDefault}-minute mixed session from now on.</p>
          <div className="flex gap-2">
            <button onClick={() => { saveDefaultMinutes(askDefault); setAskDefault(null); }} className="flex-1 h-12 rounded-2xl bg-gray-900 text-white dark:bg-gray-100 dark:text-black">Yes</button>
            <button onClick={() => setAskDefault(null)} className="flex-1 h-12 rounded-2xl border border-gray-200 dark:border-gray-800 text-gray-500">No, just this once</button>
          </div>
        </Sheet>
      )}
      {showUnits && <Units state={state} onPick={pick} onClose={() => setShowUnits(false)} />}
      {showMap && <Stats state={state} profile={profile} onProfile={setProfile} onClose={() => setShowMap(false)} />}
    </div>
  );
}

function Sheet({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-30 flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
      <div className="w-full max-w-sm bg-white dark:bg-black text-gray-900 dark:text-gray-100 rounded-t-3xl sm:rounded-3xl p-5 pb-[max(env(safe-area-inset-bottom),20px)]" onClick={(e) => e.stopPropagation()}>
        <div className="text-base mb-4">{title}</div>
        {children}
      </div>
    </div>
  );
}

