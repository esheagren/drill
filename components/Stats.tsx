"use client";

import { useMemo, useState } from "react";
import { isUnlocked, mastery, ratingOf, type EngineState } from "@/lib/engine";
import { FAMILIES, FAMILY_BLURB, FAMILY_LABEL, SKILL_BY_ID, skillsIn, type Family, type SkillId } from "@/lib/skills";
import { dayKey, loadDays, type SessionRecord } from "@/lib/sessions";
import type { Profile } from "@/lib/user";
import Account from "./Account";

type View = { kind: "history" } | { kind: "skills"; unit: Family } | { kind: "profile" };

export default function Stats({ state, profile, onProfile, onClose }: { state: EngineState; profile: Profile; onProfile: (p: Profile) => void; onClose: () => void }) {
  const [view, setView] = useState<View>({ kind: "history" });
  const days = useMemo(() => loadDays(), []);

  const navItem = (active: boolean, extra = "") =>
    `text-left whitespace-nowrap px-3 py-2 rounded-xl text-sm transition ${active ? "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100" : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"} ${extra}`;

  return (
    <div className="fixed inset-0 z-20 bg-white dark:bg-black text-gray-900 dark:text-gray-100 flex flex-col sm:flex-row">
      {/* Nav: sidebar on wide screens, scrolling tab row on phones */}
      <nav className="sm:w-56 shrink-0 border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-gray-900 pt-[max(env(safe-area-inset-top),16px)] px-3 pb-2 sm:pb-6 flex sm:flex-col gap-1 overflow-x-auto sm:overflow-visible">
        <button onClick={onClose} className={navItem(false, "sm:mb-4")}>← close</button>
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
        {view.kind === "history" && <History days={days} />}
        {view.kind === "skills" && <UnitDetail unit={view.unit} state={state} days={days} />}
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

function UnitDetail({ unit, state, days }: { unit: Family; state: EngineState; days: Record<string, SessionRecord[]> }) {
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
      <h1 className="text-lg font-light">{FAMILY_LABEL[unit]}</h1>
      <p className="text-sm text-gray-500 mb-1">{FAMILY_BLURB[unit]}</p>
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
        {skills.map((s) => <SkillRow key={s.id} id={s.id} state={state} />)}
      </ul>
    </div>
  );
}

function SkillRow({ id, state }: { id: SkillId; state: EngineState }) {
  const s = SKILL_BY_ID[id];
  const st = state.skills[id];
  const m = mastery(id, st);
  const unlocked = isUnlocked(id, state);
  return (
    <li className={unlocked ? "" : "opacity-40"}>
      <div className="flex items-baseline justify-between text-sm">
        <span>{s.name}</span>
        <span className="text-xs text-gray-400 tabular-nums">
          {st.attempts ? `${st.correct}/${st.attempts}` : unlocked ? "new" : "locked in mixed"}
          {st.speed ? ` · ${(st.speed / 1000).toFixed(1)}s` : ""}
        </span>
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
