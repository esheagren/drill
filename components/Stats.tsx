"use client";

import { useEffect, useMemo, useState } from "react";
import { isUnlocked, mastery, ratingOf, type EngineState } from "@/lib/engine";
import { FAMILIES, FAMILY_BLURB, FAMILY_LABEL, SKILL_BY_ID, groupsIn, skillsIn, type Family, type Skill, type SkillId } from "@/lib/skills";
import { dayKey, loadDays, groupPlan, skillPlan, unitPlan, type Plan, type SessionRecord } from "@/lib/sessions";
import type { Profile } from "@/lib/user";
import Account from "./Account";
import { fetchItemStats, itemFluency, type ItemStat } from "@/lib/itemstats";

export type View = { kind: "history" } | { kind: "skills"; unit: Family } | { kind: "profile" };

export default function Stats({ state, profile, onProfile, onClose, onPick, initial = { kind: "history" } }: {
  state: EngineState; profile: Profile; onProfile: (p: Profile) => void; onClose: () => void; onPick: (p: Plan) => void; initial?: View;
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
        {view.kind === "skills" && (groupsIn(view.unit).some((g) => g.skills.length > 1)
          ? <UnitHierarchy unit={view.unit} state={state} days={days} onPick={onPick} />
          : <UnitDetail unit={view.unit} state={state} days={days} onPick={onPick} />)}
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

// ── Hierarchical unit: subsections → bands, compact rows, detail panel on the right ──

/** Mastery as a color: none / weak / developing / fluent. Always paired with a title for the value. */
function masteryColor(m: number, attempts: number): string {
  if (!attempts) return "#9ca3af";      // gray-400 — not started
  if (m < 0.5) return "#f59e0b";        // amber-500 — weak
  if (m < 0.85) return "#38bdf8";       // sky-400 — developing
  return "#10b981";                     // emerald-500 — fluent
}
function Dot({ m, attempts, size = 10 }: { m: number; attempts: number; size?: number }) {
  return <span className="inline-block rounded-full shrink-0" style={{ width: size, height: size, background: masteryColor(m, attempts) }} title={attempts ? `${Math.round(m * 100)}% fluent · ${attempts} answers` : "not started"} />;
}
function groupMastery(skills: Skill[], state: EngineState) {
  const attempts = skills.reduce((a, s) => a + state.skills[s.id].attempts, 0);
  const m = attempts ? skills.reduce((a, s) => a + mastery(s.id, state.skills[s.id]) * state.skills[s.id].attempts, 0) / attempts : 0;
  return { m, attempts };
}
function tally(days: Record<string, SessionRecord[]>, k: string, ids: SkillId[]) {
  return (days[k] ?? []).reduce((acc, sess) => { for (const id of ids) { const b = sess.bySkill[id]; if (b) { acc.n += b.n; acc.c += b.c; } } return acc; }, { n: 0, c: 0 });
}

function UnitHierarchy({ unit, state, days, onPick }: { unit: Family; state: EngineState; days: Record<string, SessionRecord[]>; onPick: (p: Plan) => void }) {
  const groups = groupsIn(unit);
  const [sel, setSel] = useState<string>(groups[0].group);
  const g = groups.find((x) => x.group === sel) ?? groups[0];
  const play = "shrink-0 h-8 px-3 rounded-lg text-xs tabular-nums active:scale-95 transition";
  const um = groupMastery(skillsIn(unit), state);

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-5xl">
      {/* Left: the structure */}
      <div className="lg:w-80 shrink-0">
        <div className="flex items-center gap-3">
          <Dot m={um.m} attempts={um.attempts} size={12} />
          <h1 className="text-lg font-light flex-1">{FAMILY_LABEL[unit]}</h1>
          <button onClick={() => onPick(unitPlan(unit))} className={`${play} bg-gray-900 text-white dark:bg-gray-100 dark:text-black`}>2 min ▸</button>
        </div>
        <p className="text-xs text-gray-500 mt-1 mb-5">{FAMILY_BLURB[unit]}</p>

        <ul className="space-y-1">
          {groups.map(({ group, skills }) => {
            const gm = groupMastery(skills, state);
            const active = group === sel;
            return (
              <li key={group} className={`rounded-xl ${active ? "bg-gray-50 dark:bg-gray-950" : ""}`}>
                <div className="flex items-center gap-3 px-3 py-2">
                  <Dot m={gm.m} attempts={gm.attempts} />
                  <button onClick={() => setSel(group)} className={`flex-1 text-left text-sm ${active ? "text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-300"}`}>{group}</button>
                  <button onClick={() => onPick(groupPlan(unit, group))} className={`${play} border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300`}>2 min ▸</button>
                </div>
                <ul className="pl-9 pb-2 space-y-0.5">
                  {skills.map((s) => {
                    const st = state.skills[s.id];
                    const unlocked = isUnlocked(s.id, state);
                    return (
                      <li key={s.id} className="flex items-center gap-3 pr-3 py-1">
                        <Dot m={mastery(s.id, st)} attempts={st.attempts} size={8} />
                        <span className={`flex-1 text-xs ${unlocked ? "text-gray-600 dark:text-gray-300" : "text-gray-400"}`}>{s.name}</span>
                        <button onClick={() => onPick(skillPlan(s.id))} className="text-xs text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 px-1" aria-label={`Drill ${group} ${s.name}`}>▸</button>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
        <div className="flex gap-3 mt-4 text-[10px] text-gray-400">
          {[["#9ca3af", "not started"], ["#f59e0b", "weak"], ["#38bdf8", "developing"], ["#10b981", "fluent"]].map(([c, l]) => (
            <span key={l} className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full" style={{ background: c }} />{l}</span>
          ))}
        </div>
      </div>

      {/* Right: where you're strong and weak, problem by problem */}
      <div className="flex-1 min-w-0 lg:border-l lg:border-gray-100 lg:dark:border-gray-900 lg:pl-8">
        <h2 className="text-base font-light">{g.group}</h2>
        <p className="text-xs text-gray-400 mb-4">each problem, colored by fluency — accuracy discounted while slower than budget. Hover for detail.</p>
        <ItemMap group={g.group} skills={g.skills} />
        <table className="w-full text-sm mt-6">
          <thead className="text-[10px] uppercase tracking-wide text-gray-400">
            <tr><th className="text-left font-normal pb-1">band</th><th className="text-right font-normal pb-1">answered</th><th className="text-right font-normal pb-1">correct</th><th className="text-right font-normal pb-1">speed</th><th className="text-right font-normal pb-1">fluency</th></tr>
          </thead>
          <tbody className="tabular-nums">
            {g.skills.map((s) => {
              const st = state.skills[s.id]; const m = mastery(s.id, st);
              return (
                <tr key={s.id} className="border-t border-gray-100 dark:border-gray-900">
                  <td className="py-1.5 flex items-center gap-2"><Dot m={m} attempts={st.attempts} size={8} />{s.name}</td>
                  <td className="text-right">{st.attempts || "—"}</td>
                  <td className="text-right">{st.attempts ? `${Math.round((100 * st.correct) / st.attempts)}%` : "—"}</td>
                  <td className="text-right">{st.speed ? `${(st.speed / 1000).toFixed(1)}s` : "—"}</td>
                  <td className="text-right">{st.attempts ? `${Math.round(m * 100)}%` : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="text-[10px] text-gray-400 mt-3">{g.skills[0].ccss.join(" · ")}</p>
      </div>
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

// ── Item map: per-problem fluency for a subsection ─────────────────────────

const MAP_SPEC: Record<string, { prefix: string; kind: "grid" | "strip"; lo: number; hi: number; label: (a: number, b?: number) => string; key: (a: number, b?: number) => string; band: (a: number, b?: number) => number }> = {
  "Times tables": { prefix: "mul:", kind: "grid", lo: 2, hi: 25, label: (a, b) => `${a} × ${b}`, key: (a, b) => `mul:${a}x${b}`, band: (a, b) => (Math.max(a, b!) <= 12 ? 0 : Math.max(a, b!) <= 20 ? 1 : 2) },
  Squares: { prefix: "sq:", kind: "strip", lo: 2, hi: 25, label: (a) => `${a}²`, key: (a) => `sq:${a}`, band: (a) => (a <= 12 ? 0 : 1) },
  Cubes: { prefix: "cube:", kind: "strip", lo: 2, hi: 15, label: (a) => `${a}³`, key: (a) => `cube:${a}`, band: (a) => (a <= 10 ? 0 : 1) },
};

function fluencyColor(f: number | null): string {
  if (f === null) return "transparent";
  if (f < 0.5) return "#f59e0b";
  if (f < 0.85) return "#38bdf8";
  return "#10b981";
}

function ItemMap({ group, skills }: { group: string; skills: Skill[] }) {
  const spec = MAP_SPEC[group];
  const [stats, setStats] = useState<Record<string, ItemStat> | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(null);
  useEffect(() => { let alive = true; if (spec) fetchItemStats(spec.prefix).then((s) => { if (alive) setStats(s); }); return () => { alive = false; }; }, [spec]);
  if (!spec) return null;
  if (stats === null) return <p className="text-sm text-gray-400">loading…</p>;

  const budgetFor = (bandIdx: number, answer: number) => (skills[Math.min(bandIdx, skills.length - 1)]?.targetMs ?? 4000) + 350 * String(answer).length;
  const cell = (a: number, b?: number) => {
    const st = stats[spec.key(a, b)];
    const answer = spec.kind === "grid" ? a * b! : group === "Squares" ? a * a : a ** 3;
    const f = st ? itemFluency(st, budgetFor(spec.band(a, b), answer)) : null;
    const text = st ? `${spec.label(a, b)} = ${answer} · ${st.n} answer${st.n > 1 ? "s" : ""} · ${Math.round((100 * st.correct) / st.n)}% · ${(st.p50 / 1000).toFixed(1)}s` : `${spec.label(a, b)} = ${answer} · not seen yet`;
    return (
      <div
        key={spec.key(a, b)}
        className="rounded-[3px] border border-gray-200 dark:border-gray-800"
        style={{ background: fluencyColor(f), opacity: f === null ? 0.5 : 0.5 + 0.5 * Math.min(1, (st?.n ?? 0) / 4) }}
        onMouseEnter={(e) => setTip({ x: e.clientX, y: e.clientY, text })}
        onMouseMove={(e) => setTip({ x: e.clientX, y: e.clientY, text })}
        onMouseLeave={() => setTip(null)}
        onClick={(e) => setTip({ x: e.clientX, y: e.clientY, text })}
        aria-label={text}
      />
    );
  };

  // Weakest / slowest lists
  const seen = Object.values(stats).filter((s) => s.n >= 2);
  const scored = seen.map((s) => { const m = s.key.match(/^mul:(\d+)x(\d+)$|^sq:(\d+)$|^cube:(\d+)$/); const a = Number(m?.[1] ?? m?.[3] ?? m?.[4]); const b = m?.[2] ? Number(m[2]) : undefined; const answer = b ? a * b : group === "Squares" ? a * a : a ** 3; return { s, label: spec.label(a, b), f: itemFluency(s, budgetFor(spec.band(a, b), answer)) }; });
  const weakest = [...scored].sort((x, y) => x.f - y.f).slice(0, 5);
  const slowest = [...scored].sort((x, y) => y.s.p50 - x.s.p50).slice(0, 5);

  const n = spec.hi - spec.lo + 1;
  return (
    <div>
      {spec.kind === "grid" ? (
        <div className="overflow-x-auto">
          <div className="grid gap-[2px]" style={{ gridTemplateColumns: `28px repeat(${n}, 20px)`, gridAutoRows: "20px", width: 28 + n * 22 }}>
            <div />
            {Array.from({ length: n }, (_, j) => <div key={`h${j}`} className="text-[9px] text-gray-400 text-center leading-5 tabular-nums">{spec.lo + j}</div>)}
            {Array.from({ length: n }, (_, i) => {
              const a = spec.lo + i;
              return [
                <div key={`r${a}`} className="text-[9px] text-gray-400 text-right pr-1 leading-5 tabular-nums">{a}</div>,
                ...Array.from({ length: n }, (_, j) => { const b = spec.lo + j; return b < a ? <div key={`${a}-${b}`} /> : cell(a, b); }),
              ];
            })}
          </div>
        </div>
      ) : (
        <div className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${n}, 28px)`, gridAutoRows: "28px" }}>
          {Array.from({ length: n }, (_, i) => <div key={`l${i}`} className="text-[9px] text-gray-400 text-center leading-7 tabular-nums">{spec.lo + i}</div>)}
          {Array.from({ length: n }, (_, i) => cell(spec.lo + i))}
        </div>
      )}
      <div className="flex gap-3 mt-3 text-[10px] text-gray-400">
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm border border-gray-300 dark:border-gray-700" />not seen</span>
        {[["#f59e0b", "weak"], ["#38bdf8", "developing"], ["#10b981", "fluent"]].map(([c, l]) => (
          <span key={l} className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm" style={{ background: c }} />{l}</span>
        ))}
        <span className="text-gray-300 dark:text-gray-700">· fainter = fewer answers</span>
      </div>

      {scored.length > 0 && (
        <div className="grid grid-cols-2 gap-6 mt-6 text-sm">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">weakest</div>
            <ul className="space-y-0.5 tabular-nums">{weakest.map((w) => <li key={w.s.key} className="flex justify-between"><span>{w.label}</span><span className="text-gray-400">{Math.round((100 * w.s.correct) / w.s.n)}% · {(w.s.p50 / 1000).toFixed(1)}s</span></li>)}</ul>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">slowest</div>
            <ul className="space-y-0.5 tabular-nums">{slowest.map((w) => <li key={w.s.key} className="flex justify-between"><span>{w.label}</span><span className="text-gray-400">{(w.s.p50 / 1000).toFixed(1)}s · {Math.round((100 * w.s.correct) / w.s.n)}%</span></li>)}</ul>
          </div>
        </div>
      )}

      {tip && (
        <div className="fixed z-40 pointer-events-none px-2 py-1 rounded-lg bg-gray-900 text-white dark:bg-gray-100 dark:text-black text-xs shadow" style={{ left: tip.x + 12, top: tip.y + 12 }}>{tip.text}</div>
      )}
    </div>
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
