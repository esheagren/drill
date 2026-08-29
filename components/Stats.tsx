"use client";

import { useMemo, useState } from "react";
import { isUnlocked, mastery, ratingOf, type EngineState } from "@/lib/engine";
import { FAMILIES, FAMILY_BLURB, FAMILY_LABEL, SKILL_BY_ID, skillsIn, type Family, type SkillId } from "@/lib/skills";
import { dayKey, loadDays, mixedFor, skillPlan, unitPlan, type Plan, type SessionRecord } from "@/lib/sessions";
import type { Profile } from "@/lib/user";
import Account from "./Account";

export type View = { kind: "practice" } | { kind: "history" } | { kind: "skills"; unit: Family } | { kind: "profile" };

export default function Stats({ state, profile, onProfile, onClose, onPick, initial = { kind: "history" }, mixedMinutes }: {
  state: EngineState; profile: Profile; onProfile: (p: Profile) => void; onClose: () => void; onPick: (p: Plan) => void; initial?: View; mixedMinutes: number;
}) {
  const [view, setView] = useState<View>(initial);
  const days = useMemo(() => loadDays(), []);

  const navItem = (active: boolean, extra = "") =>
    `text-left whitespace-nowrap px-3 py-2 rounded-xl text-sm transition ${active ? "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100" : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"} ${extra}`;

  return (
    <div className="fixed inset-0 z-20 bg-white dark:bg-black text-gray-900 dark:text-gray-100 flex flex-col sm:flex-row">
      {/* Nav: sidebar on wide screens, scrolling tab row on phones */}
      <nav className="sm:w-56 shrink-0 border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-gray-900 pt-[max(env(safe-area-inset-top),16px)] px-3 pb-2 sm:pb-6 flex sm:flex-col gap-1 overflow-x-auto sm:overflow-visible">
        <button onClick={onClose} className={navItem(false, "sm:mb-4")}>← close</button>
        <button onClick={() => setView({ kind: "practice" })} className={navItem(view.kind === "practice")}>Practice</button>
        <button onClick={() => setView({ kind: "history" })} className={navItem(view.kind === "history")}>History</button>
        <button onClick={() => setView({ kind: "skills", unit: FAMILIES[0] })} className={navItem(view.kind === "skills" && false)}>Skills</button>
        <div className="flex sm:flex-col gap-1 sm:pl-3">
          {FAMILIES.map((f) => (
            <button key={f} onClick={() => setView({ kind: "skills", unit: f })} className={navItem(view.kind === "skills" && view.unit === f, "sm:text-[13px]")}>
              {FAMILY_LABEL[f]}
            </button>
          ))}
        </div>
        <button onClick={() => setView({ kind: "profile" })} className={navItem(view.kind === "profile", "sm:mt-4")}>Profile</button>
      </nav>

      <main className="flex-1 overflow-y-auto px-5 sm:px-8 py-6 pb-[max(env(safe-area-inset-bottom),24px)]">
        {view.kind === "practice" && <Launcher onPick={onPick} mixedMinutes={mixedMinutes} onUnit={(u) => setView({ kind: "skills", unit: u })} />}
        {view.kind === "history" && <History days={days} />}
        {view.kind === "skills" && <UnitDetail unit={view.unit} state={state} days={days} onPick={onPick} />}
        {view.kind === "profile" && (
          <div className="max-w-md">
            <h1 className="text-lg font-light mb-2">{profile.username ?? "Profile"}</h1>
            <Account profile={profile} onChange={onProfile} />
          </div>
        )}
      </main>
    </div>
  );
}

// ── Practice: a plain launcher — no stats here, those live under Skills ────

function Launcher({ onPick, onUnit, mixedMinutes }: { onPick: (p: Plan) => void; onUnit: (u: Family) => void; mixedMinutes: number }) {
  const play = "shrink-0 h-9 px-3 rounded-xl bg-gray-900 text-white dark:bg-gray-100 dark:text-black text-sm tabular-nums active:scale-95 transition";
  return (
    <div className="max-w-xl">
      <h1 className="text-lg font-light mb-4">Practice</h1>
      <button onClick={() => onPick(mixedFor(mixedMinutes))} className="w-full flex items-center justify-between rounded-2xl border border-gray-200 dark:border-gray-800 p-4 mb-6 active:scale-[0.99] transition text-left">
        <div>
          <div className="text-base">Mixed practice</div>
          <div className="text-xs text-gray-500 mt-0.5">everything unlocked so far, interleaved — the default</div>
        </div>
        <span className={play}>{mixedMinutes} min ▸</span>
      </button>
      <div className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">Units · 2 min each</div>
      <ol className="divide-y divide-gray-100 dark:divide-gray-900">
        {FAMILIES.map((fam, i) => (
          <li key={fam} className="flex items-center gap-3 py-3">
            <button onClick={() => onUnit(fam)} className="flex-1 text-left min-w-0">
              <div className="text-base"><span className="text-gray-400 tabular-nums mr-2">{i + 1}</span>{FAMILY_LABEL[fam]}</div>
              <div className="text-xs text-gray-500 truncate">{FAMILY_BLURB[fam]}</div>
            </button>
            <button onClick={() => onPick(unitPlan(fam))} className={play} aria-label={`Practice ${FAMILY_LABEL[fam]} for 2 minutes`}>2 min ▸</button>
          </li>
        ))}
      </ol>
      <p className="text-xs text-gray-400 mt-3">Tap a unit name for its detail and per-skill drills.</p>
    </div>
  );
}

// ── History: questions per day, stacked by session ────────────────────────

function History({ days }: { days: Record<string, SessionRecord[]> }) {
  const keys = useMemo(() => {
    const withData = Object.keys(days).filter((k) => days[k]?.length).sort();
    const start = withData.length ? Math.min(Date.parse(withData[0]), Date.now() - 13 * 86400e3) : Date.now() - 13 * 86400e3;
    const n = Math.round((Date.now() - start) / 86400e3) + 1;
    return Array.from({ length: n }, (_, i) => dayKey(start + i * 86400e3));
  }, [days]);
  const totals = keys.map((k) => (days[k] ?? []).reduce((a, s) => a + s.answered, 0));
  const answered = totals.reduce((a, b) => a + b, 0);
  const correct = keys.reduce((a, k) => a + (days[k] ?? []).reduce((x, s) => x + s.correct, 0), 0);
  const sessions = keys.reduce((a, k) => a + (days[k]?.length ?? 0), 0);

  return (
    <div className="max-w-3xl">
      <h1 className="text-lg font-light">History</h1>
      <p className="text-sm text-gray-500 mb-6">
        {answered} questions · {answered ? Math.round((100 * correct) / answered) : 0}% correct · {sessions} sessions · {keys.filter((k) => days[k]?.length).length} days
      </p>
      <StackedBars
        columns={keys.map((k) => ({
          label: k.slice(5),
          segments: (days[k] ?? []).map((s, i) => ({ value: s.answered, tip: `${k} · session ${i + 1} · ${s.answered} answered · ${s.correct} correct · ${Math.round(s.durationMs / 60000)} min` })),
        }))}
        yLabel="questions"
      />
      <p className="text-xs text-gray-400 mt-3">Each bar is a day; segments are sessions. Hover a segment for detail.</p>
    </div>
  );
}

// ── Unit detail: that unit's daily chart stacked by skill, then skill rows ──

function UnitDetail({ unit, state, days, onPick }: { unit: Family; state: EngineState; days: Record<string, SessionRecord[]>; onPick: (p: Plan) => void }) {
  const skills = skillsIn(unit);
  const keys = useMemo(() => Array.from({ length: 14 }, (_, i) => dayKey(Date.now() - (13 - i) * 86400e3)), []);
  const rating = ratingOf(state, unit);
  const columns = keys.map((k) => ({
    label: k.slice(5),
    segments: skills.map((s) => {
      const t = (days[k] ?? []).reduce((acc, sess) => { const b = sess.bySkill[s.id]; return b ? { n: acc.n + b.n, c: acc.c + b.c } : acc; }, { n: 0, c: 0 });
      return { value: t.n, tip: `${k} · ${s.name} · ${t.n} answered · ${t.c} correct` };
    }),
  }));
  const any = columns.some((c) => c.segments.some((s) => s.value));

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-light">{FAMILY_LABEL[unit]}</h1>
          <p className="text-sm text-gray-500 mb-1">{FAMILY_BLURB[unit]}</p>
        </div>
        <button onClick={() => onPick(unitPlan(unit))} className="shrink-0 h-10 px-4 rounded-xl bg-gray-900 text-white dark:bg-gray-100 dark:text-black text-sm active:scale-95 transition">
          Practice this unit · 2 min ▸
        </button>
      </div>
      <p className="text-xs text-gray-400 mb-6">{rating.n ? `rating ${rating.theta.toFixed(2)} after ${rating.n} answers` : "no rating yet"}</p>

      {any ? (
        <>
          <StackedBars columns={columns} yLabel="questions" legend={skills.map((s) => s.name)} />
          <p className="text-xs text-gray-400 mt-3 mb-8">Last 14 days, stacked by skill.</p>
        </>
      ) : (
        <p className="text-sm text-gray-400 mb-8">No practice in this unit in the last 14 days.</p>
      )}

      <ul className="space-y-3">
        {skills.map((s) => <SkillRow key={s.id} id={s.id} state={state} onPick={onPick} />)}
      </ul>
    </div>
  );
}

function SkillRow({ id, state, onPick }: { id: SkillId; state: EngineState; onPick: (p: Plan) => void }) {
  const s = SKILL_BY_ID[id];
  const st = state.skills[id];
  const m = mastery(id, st);
  const unlocked = isUnlocked(id, state);
  return (
    <li className={unlocked ? "" : "opacity-40"}>
      <div className="flex items-center justify-between text-sm gap-3">
        <span className="flex-1">{s.name}</span>
        <span className="text-xs text-gray-400 tabular-nums">
          {st.attempts ? `${st.correct}/${st.attempts}` : unlocked ? "new" : "locked in mixed"}
          {st.speed ? ` · ${(st.speed / 1000).toFixed(1)}s` : ""}
        </span>
        <button onClick={() => onPick(skillPlan(id))} className="shrink-0 h-7 px-2.5 rounded-lg border border-gray-200 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-300 active:scale-95 transition" aria-label={`Drill ${s.name} for 2 minutes`}>2 min ▸</button>
      </div>
      <div className="h-1 mt-1 rounded bg-gray-100 dark:bg-gray-900 overflow-hidden">
        <div className="h-full bg-gray-900 dark:bg-gray-100 transition-all" style={{ width: `${m * 100}%` }} />
      </div>
      <div className="text-[10px] text-gray-400 dark:text-gray-600 mt-0.5">
        {s.ccss.join(" · ")}{s.prereqs.length ? ` · after ${s.prereqs.map((p) => SKILL_BY_ID[p].name).join(", ")}` : ""}
      </div>
    </li>
  );
}

// ── Chart: stacked bars, one hue in lightness steps, 2px gaps, hover tooltip ──

interface Segment { value: number; tip: string }
interface Column { label: string; segments: Segment[] }

const STEPS_LIGHT = ["#111827", "#6b7280", "#d1d5db"]; // gray-900 / 500 / 300
const STEPS_DARK = ["#f3f4f6", "#9ca3af", "#4b5563"];  // gray-100 / 400 / 600

function StackedBars({ columns, yLabel, legend }: { columns: Column[]; yLabel: string; legend?: string[] }) {
  const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(null);
  const W = 640, H = 220, padL = 36, padB = 24, padT = 16;
  const max = Math.max(1, ...columns.map((c) => c.segments.reduce((a, s) => a + s.value, 0)));
  const nice = niceMax(max);
  const plotH = H - padT - padB, plotW = W - padL - 8;
  const gap = 6;
  const bw = Math.max(4, (plotW - gap * (columns.length - 1)) / columns.length);
  const y = (v: number) => padT + plotH - (v / nice) * plotH;
  const ticks = [0, nice / 2, nice].map((t) => Math.round(t));
  const isDark = typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  const steps = isDark ? STEPS_DARK : STEPS_LIGHT;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none" role="img" aria-label={`${yLabel} per day`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={W - 8} y1={y(t)} y2={y(t)} stroke="currentColor" strokeOpacity={0.12} />
            <text x={padL - 6} y={y(t) + 3} textAnchor="end" fontSize={10} fill="currentColor" fillOpacity={0.5}>{t}</text>
          </g>
        ))}
        {columns.map((c, i) => {
          const x = padL + i * (bw + gap);
          let acc = 0;
          const total = c.segments.reduce((a, s) => a + s.value, 0);
          return (
            <g key={c.label}>
              {c.segments.map((s, j) => {
                if (!s.value) return null;
                const y0 = y(acc + s.value), y1 = y(acc);
                acc += s.value;
                const h = Math.max(0, y1 - y0 - 2); // 2px surface gap between segments
                return (
                  <rect
                    key={j} x={x} y={y0} width={bw} height={h} rx={j === c.segments.length - 1 || acc === total ? 3 : 0}
                    fill={steps[j % steps.length]}
                    onMouseEnter={(e) => setTip({ x: e.clientX, y: e.clientY, text: s.tip })}
                    onMouseMove={(e) => setTip({ x: e.clientX, y: e.clientY, text: s.tip })}
                    onMouseLeave={() => setTip(null)}
                    onClick={(e) => setTip({ x: e.clientX, y: e.clientY, text: s.tip })}
                  />
                );
              })}
              {total > 0 && <text x={x + bw / 2} y={y(total) - 4} textAnchor="middle" fontSize={10} fill="currentColor" fillOpacity={0.7}>{total}</text>}
              {(columns.length <= 16 || i % Math.ceil(columns.length / 16) === 0) && (
                <text x={x + bw / 2} y={H - 6} textAnchor="middle" fontSize={10} fill="currentColor" fillOpacity={0.5}>{c.label}</text>
              )}
            </g>
          );
        })}
      </svg>
      {legend && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
          {legend.map((l, j) => (
            <span key={l} className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: steps[j % steps.length] }} />{l}</span>
          ))}
        </div>
      )}
      {tip && (
        <div className="fixed z-40 pointer-events-none px-2 py-1 rounded-lg bg-gray-900 text-white dark:bg-gray-100 dark:text-black text-xs shadow" style={{ left: tip.x + 12, top: tip.y + 12 }}>
          {tip.text}
        </div>
      )}
    </div>
  );
}

function niceMax(v: number): number {
  const p = 10 ** Math.floor(Math.log10(v));
  const m = v / p;
  const n = m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10;
  return n * p;
}
