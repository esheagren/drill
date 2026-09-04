"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Item } from "@/lib/items";
import { appendLog, budgetFor, nextSkill, pickItem, record, saveState, type EngineState } from "@/lib/engine";
import { markSeen, tipFor, type Tip } from "@/lib/tips";
import { SKILL_BY_ID, type SkillId } from "@/lib/skills";
import { MIXED, loadDefaultMinutes, mixedFor, saveDefaultMinutes, saveSession, type Plan, type SessionRecord } from "@/lib/sessions";
import { flush, hydrate, queueAttempt, queueSession } from "@/lib/sync";
import Keypad from "./Keypad";
import { AreaModel, LogLine, MultiplierChain } from "./widgets";
import { widgetSeedFor } from "@/lib/widgetSeed";
import { sentencesFor } from "@/lib/sentences";
import { generateItem } from "@/lib/items";
import Onboarding from "./Onboarding";
import { getProfile } from "@/lib/account";
import type { Profile } from "@/lib/user";
import Stats, { type View } from "./Stats";

type Phase = "answer" | "correct" | "slow" | "wrong" | "done";

const ADVANCE_MS = 450;
const REVIEW_GAP = 2;

export default function Trainer() {
  const [state, setState] = useState<EngineState | null>(null);
  const [item, setItem] = useState<Item | null>(null);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<Phase>("answer");
  const [tip, setTip] = useState<Tip | null>(null);
  const [overlay, setOverlay] = useState<View | null>(null);
  const showMap = overlay !== null;
  const showUnits = false; // folded into the single overlay
  const setShowMap = (v: boolean) => setOverlay(v ? { kind: "history" } : null);
  const setShowUnits = (v: boolean) => setOverlay(v ? { kind: "skills", unit: "arithmetic" } : null);
  const [profile, setProfile] = useState<Profile | null>(null);   // null = not loaded yet
  const [plan, setPlan] = useState<Plan>(MIXED);
  const planRef = useRef<Plan>(MIXED);
  const [remaining, setRemaining] = useState(MIXED.durationMs);
  const [timerMenu, setTimerMenu] = useState(false);
  const [askDefault, setAskDefault] = useState<number | null>(null); // minutes just chosen, pending "make default?"
  const [session, setSession] = useState<SessionRecord | null>(null);

  const startRef = useRef(0);          // item start
  const sessionStartRef = useRef(0);   // 0 = not started (waits for first key)
  const pauseStartRef = useRef(0);     // timer freezes from submit until the next item
  const lastSkillRef = useRef<SkillId | null>(null);
  const tallyRef = useRef<SessionRecord["bySkill"]>({});
  const countRef = useRef({ n: 0, c: 0 });
  // Spaced review inside the session: a missed item returns after REVIEW_GAP others.
  const reviewRef = useRef<{ item: Item; due: number }[]>([]);
  const isReviewRef = useRef(false);
  const isProbeRef = useRef(false);

  const advance = useCallback((st: EngineState) => {
    if (pauseStartRef.current && sessionStartRef.current) sessionStartRef.current += Date.now() - pauseStartRef.current;
    pauseStartRef.current = 0;
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
    const { id, probe } = nextSkill(st, lastSkillRef.current, planRef.current.pool);
    isProbeRef.current = probe;
    lastSkillRef.current = id;
    setItem(pickItem(st, id));
    setInput("");
    setPhase("answer");
    setTip(null);
    startRef.current = performance.now();
  }, []);

  /** Catalog demo states: render a view without recording anything. */
  const applyDemo = (demo: string, st: EngineState) => {
    void st;
    const skill = (new URLSearchParams(window.location.search).get("skill") ?? "ar.split") as SkillId;
    const fixed = generateItem(SKILL_BY_ID[skill] ? skill : "ar.split", 2);
    setItem(fixed);
    planRef.current = MIXED; setPlan(MIXED);
    if (demo === "wrong" || demo === "slow") {
      sessionStartRef.current = Date.now() - 95_000; pauseStartRef.current = Date.now();
      setRemaining(MIXED.durationMs - 95_000);
      setInput(demo === "wrong" ? "1" : fixed.answerText);
      setTip(tipFor(fixed)); setPhase(demo);
    } else if (demo === "summary") {
      setSession({ plan: "mixed", ts: Date.now() - 480_000, durationMs: 480_000, answered: 61, correct: 55, bySkill: { "ar.split": { n: 9, c: 8 }, "pct.apply": { n: 8, c: 7 }, "fr.of": { n: 7, c: 7 }, "sn.mul": { n: 6, c: 5 } } });
      setPhase("done");
    } else if (demo === "timer") setTimerMenu(true);
    else if (demo === "default") setAskDefault(4);
    else if (demo === "history") setOverlay({ kind: "history" });
    else if (demo === "unit") setOverlay({ kind: "skills", unit: "arithmetic" });
    else if (demo === "profile") setOverlay({ kind: "profile" });
  };

  useEffect(() => {
    let alive = true;
    const initial = mixedFor(loadDefaultMinutes());
    planRef.current = initial; setPlan(initial); setRemaining(initial.durationMs);
    const demo = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("demo") : null;
    if (demo) document.documentElement.classList.add("demo");
    hydrate().then((st) => {
      if (!alive) return;
      setState(st);
      if (demo) { applyDemo(demo, st); return; }
      advance(st);
      void flush();
    });
    getProfile().then((p) => { if (alive) setProfile(demo === "onboarding" || demo === "signin" ? { username: null, email: null } : p); });
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
      if (!sessionStartRef.current || pauseStartRef.current) return;   // frozen while feedback is on screen
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
    pauseStartRef.current = 0;
    delete document.body.dataset.inSession;
    countRef.current = { n: 0, c: 0 };
    tallyRef.current = {};
    reviewRef.current = [];
    setRemaining(next.durationMs);
    setSession(null);
    setOverlay(null);
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
    const res = record(state, item, ok, latency, isProbeRef.current);
    const next = res.state;
    saveState(next);
    const entry = { skillId: item.skillId, itemKey: item.key, prompt: item.prompt, answer: value, correct: ok, latencyMs: latency, ts: Date.now(), review: isReviewRef.current, probe: isProbeRef.current, ignored: res.ignored, score: res.score, expected: res.expected, theta: res.theta, beta: res.beta };
    if (!ok) reviewRef.current.push({ item, due: countRef.current.n + 1 + REVIEW_GAP }); // comes back after REVIEW_GAP others
    appendLog(entry);
    queueAttempt(entry);
    setState(next);

    countRef.current.n += 1;
    if (ok) countRef.current.c += 1;
    if (countRef.current.n % 10 === 0) void flush();
    const t = (tallyRef.current[item.skillId] ||= { n: 0, c: 0 });
    t.n += 1; if (ok) t.c += 1;

    pauseStartRef.current = Date.now();   // clock stops the moment an answer is in
    const slow = ok && latency > budgetFor(item) && !res.ignored;
    const chosen = !ok || slow ? tipFor(item) : null;
    setTip(chosen);
    if (chosen) markSeen(chosen.id);
    if (ok && !slow) { setPhase("correct"); setTimeout(() => advance(next), ADVANCE_MS); }
    else if (ok) setPhase("slow");   // correct but over budget: pause with the technique; any key continues
    else setPhase("wrong");
  };

  const press = (k: string) => {
    if (phase === "wrong" || phase === "slow") { if (state) advance(state); return; }
    if (phase !== "answer" || !item) return;
    if (!sessionStartRef.current) { sessionStartRef.current = Date.now(); document.body.dataset.inSession = "1"; } // timer starts on first key
    setInput(input + k);
  };
  const backspace = () => { if (phase === "answer") setInput((s) => s.slice(0, -1)); };
  const enter = () => {
    if (phase === "answer") submit();
    else if ((phase === "wrong" || phase === "slow") && state) advance(state);
  };

  // Hardware keyboard support (desktop).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (showMap || showUnits || timerMenu || askDefault !== null || phase === "done" || !profile?.username) return;
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      if (/^[0-9.e/]$/.test(e.key)) { e.preventDefault(); press(e.key); }
      else if (e.key === "Backspace") { e.preventDefault(); backspace(); }
      else if (e.key === "Enter") { e.preventDefault(); enter(); }
      else if (phase === "slow" || phase === "wrong") { e.preventDefault(); if (state) advance(state); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!state || !item || profile === null) return <div className="min-h-dvh bg-white dark:bg-black" />;
  if (!profile.username) return <Onboarding onDone={(username) => setProfile({ ...profile, username })} initialMode={typeof window !== "undefined" && new URLSearchParams(window.location.search).get("demo") === "signin" ? "signin" : "name"} />;

  // ── Session summary ──────────────────────────────────────────────────────
  if (phase === "done" && session) {
    const pct = session.answered ? Math.round((100 * session.correct) / session.answered) : 0;
    const rows = Object.entries(session.bySkill).sort((a, b) => b[1]!.n - a[1]!.n);
    return (
      <div className="min-h-dvh flex flex-col bg-white dark:bg-black text-gray-900 dark:text-gray-100">
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div data-c="SummaryCount" className="text-7xl font-light tabular-nums">{session.answered}</div>
          <div className="text-sm text-gray-400 mt-1">answered · {plan.label} · {Math.round(plan.durationMs / 60000)} min</div>
          <div className="text-2xl font-light mt-6 tabular-nums">{session.correct} correct · {pct}%</div>
          <ul data-c="SkillTally" className="mt-8 w-full max-w-xs text-sm space-y-1">
            {rows.map(([id, t]) => (
              <li key={id} className="flex justify-between text-gray-500">
                <span>{SKILL_BY_ID[id as SkillId].name}</span>
                <span className="tabular-nums">{t!.c}/{t!.n}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="px-6 pb-[max(env(safe-area-inset-bottom),24px)] space-y-2 max-w-md mx-auto w-full">
          <div data-c="AgainRow" className="flex gap-2">
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
            <button onClick={() => setShowUnits(true)} className="h-12">skills</button>
            {plan.id !== "mixed" && <button onClick={() => restart(MIXED)} className="h-12">back to mixed</button>}
            <button onClick={() => setShowMap(true)} className="h-12">history</button>
          </div>
        </div>
        {overlay && <Stats state={state} profile={profile} onProfile={setProfile} onClose={() => setOverlay(null)} onPick={pick} initial={overlay ?? undefined} />}
      </div>
    );
  }

  // ── Practice ─────────────────────────────────────────────────────────────
  const skill = SKILL_BY_ID[item.skillId];
  const feedback = phase === "wrong" || phase === "slow";
  const started = sessionStartRef.current !== 0;
  const frac = Math.max(0, Math.min(1, remaining / plan.durationMs));
  const seed = feedback ? widgetSeedFor(item.key) : null;
  const lines = feedback ? sentencesFor(item) : [];
  const showTip = !!tip && (phase === "slow" || !seed);

  return (
    <div className="h-dvh flex flex-col bg-white dark:bg-black text-gray-900 dark:text-gray-100 select-none overflow-hidden relative">
      {/* the session as a line across the top, draining left to right; tap it to change the length */}
      <button type="button" data-c="Timer" onClick={() => setTimerMenu(true)} aria-label="Change session length" className="absolute inset-x-0 top-0 h-7 z-10">
        <div className={`h-[3px] ${started ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-800"}`} style={{ width: `${frac * 100}%`, transition: "width 1s linear" }} />
      </button>

      <header className="flex items-start justify-between gap-4 px-6 pt-[max(env(safe-area-inset-top),22px)]">
        <div className="min-w-0">
          {(plan.id !== "mixed" || isReviewRef.current) && (
            <div className="text-[11px] uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">{plan.id !== "mixed" && plan.label}{isReviewRef.current && <span className="ml-2">↺</span>}</div>
          )}
          <div data-c="Prompt" className="font-serif text-[26px] leading-tight" style={{ overflowWrap: "anywhere" }}>{item.prompt}</div>
          <div className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">{item.sub ?? skill.ask}</div>
        </div>
        <button data-c="MenuButton" onClick={() => setShowMap(true)} aria-label="Menu" className="shrink-0 -mr-3 -mt-2 px-3 py-2 text-gray-300 dark:text-gray-700 hover:text-gray-900 dark:hover:text-gray-100">▦</button>
      </header>

      {!feedback ? (
        <main className="flex-1 min-h-0 flex items-center justify-center px-6">
          <div data-c="AnswerLine" className={`text-[44px] font-light tabular-nums text-center ${phase === "correct" ? "text-emerald-600 dark:text-emerald-400" : "text-gray-700 dark:text-gray-300"}`} style={{ overflowWrap: "anywhere" }}>
            {input}<span className={`font-thin ${phase === "correct" ? "opacity-0" : "text-gray-300 dark:text-gray-700"}`}>|</span>
          </div>
        </main>
      ) : (
        <>
          <main className="flex-1 min-h-0 overflow-y-auto px-6 pt-4 pb-3">
            <div data-c="AnswerLine" className={`text-[24px] font-light tabular-nums ${phase === "wrong" ? "text-rose-500 line-through decoration-2" : "text-emerald-600 dark:text-emerald-400"}`}>{input}</div>
            <div className="mt-4 space-y-3 font-serif">
              {lines.map((l, i) => <div key={i} className={`text-[26px] leading-tight ${i === 0 ? "" : "text-gray-500"}`}>{l}</div>)}
              {phase === "wrong" && (() => { const mm = item.answerText.match(/^(.*?)\s*\((.*)\)\s*$/); const primary = mm ? mm[1] : item.answerText; return (
                <div data-c="AnswerReveal" className="text-[26px] leading-tight text-gray-900 dark:text-gray-100">{primary}.{mm && <span className="block text-[18px] text-gray-400 dark:text-gray-500 mt-1">{mm[2]}</span>}</div>
              ); })()}
            </div>
          </main>
          {/* the keypad's place: the picture (or the technique), then → */}
          <div className="shrink-0 border-t border-gray-100 dark:border-gray-900 px-4 pt-3 pb-[max(env(safe-area-inset-bottom),12px)] max-w-md mx-auto w-full">
            {seed && !showTip ? (
              <div data-c="PlayWithIt" className="rounded-xl border border-gray-200 dark:border-gray-800 px-4 py-3" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
                {seed.kind === "area" && <AreaModel initialA={seed.a} initialB={seed.b} compact />}
                {seed.kind === "chain" && <MultiplierChain initialBase={seed.base} initialChanges={seed.changes} compact />}
                {seed.kind === "log" && <LogLine initialX={seed.x} initialY={seed.y} compact />}
              </div>
            ) : showTip && tip ? (
              <div data-c="TechniqueCard" className={`rounded-xl border px-4 py-3 ${phase === "slow" ? "border-emerald-500" : "border-gray-200 dark:border-gray-800"}`}>
                <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">{tip.title}</div>
                <div className="text-sm text-gray-800 dark:text-gray-200">{tip.rule}</div>
                <div className="text-xs text-gray-500 mt-1 tabular-nums">{tip.example}</div>
              </div>
            ) : null}
            <button type="button" onClick={() => advance(state)} aria-label="Next question" data-c="NextBar" className="mt-3 h-14 w-full rounded-2xl bg-gray-900 text-white dark:bg-gray-100 dark:text-black text-2xl active:scale-[0.98] transition">→</button>
          </div>
        </>
      )}

      {!feedback && <Keypad onKey={press} onBackspace={backspace} onSubmit={enter} submitDisabled={phase === "answer" && !input} />}

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
      {overlay && <Stats state={state} profile={profile} onProfile={setProfile} onClose={() => setOverlay(null)} onPick={pick} initial={overlay ?? undefined} />}
    </div>
  );
}

function Sheet({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-30 flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
      <div data-c="Sheet" className="w-full max-w-sm bg-white dark:bg-black text-gray-900 dark:text-gray-100 rounded-t-3xl sm:rounded-3xl p-5 pb-[max(env(safe-area-inset-bottom),20px)]" onClick={(e) => e.stopPropagation()}>
        <div className="text-base mb-4">{title}</div>
        {children}
      </div>
    </div>
  );
}

