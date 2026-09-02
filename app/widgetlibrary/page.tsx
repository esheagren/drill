"use client";

/**
 * /widgetlibrary — the vetted bench of interactive widgets. A widget earns a
 * place in the trainer only after it feels right here. Deliberately small:
 * three pictures that each explain a whole family of techniques.
 */
import { useState } from "react";

export default function WidgetLibrary() {
  return (
    <div className="min-h-dvh bg-white dark:bg-black text-gray-900 dark:text-gray-100">
      <div className="max-w-2xl mx-auto px-5 py-10">
        <h1 className="text-2xl font-light tracking-tight">Widget library</h1>
        <p className="text-sm text-gray-500 mt-1 mb-10">
          Three pictures, each carrying a whole family of techniques. A widget ships into practice only once it&apos;s
          good here. (Bench candidate for later: a fraction bar.)
        </p>

        <Shelf
          title="Area model"
          serves="two-digit × one-digit · ×11 · ×5/×25 · squares — anything that splits a product"
          note="Multiplication is a rectangle; a split is a cut. Every 'distributive' trick is just choosing where to cut."
        >
          <AreaModel />
        </Shelf>

        <Shelf
          title="Multiplier chain"
          serves="percent change · reverse percent · successive changes · compound growth"
          note="Every percent change is one multiplication. Chains multiply — which is why up 20 / down 20 doesn't cancel, and why 'undo' means divide."
        >
          <MultiplierChain />
        </Shelf>

        <Shelf
          title="Log number line"
          serves="scale words · scientific notation · magnitude · why multiplying adds exponents"
          note="On a log line, ×10 is one step and multiplication is laying lengths end to end. This is the picture under the whole top of the app."
        >
          <LogLine />
        </Shelf>
      </div>
    </div>
  );
}

function Shelf({ title, serves, note, children }: { title: string; serves: string; note: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="text-lg font-light">{title}</h2>
      <div className="text-[11px] uppercase tracking-wide text-gray-400 mt-0.5">{serves}</div>
      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 mb-4 max-w-prose">{note}</p>
      {children}
    </section>
  );
}

// ── 1 · Area model ────────────────────────────────────────────────────────

function AreaModel() {
  const [a, setA] = useState(47);
  const [b, setB] = useState(6);
  const [cut, setCut] = useState(-1); // -1 = cut at the tens place
  const split = cut === -1 ? Math.floor(a / 10) * 10 : cut;
  const left = Math.min(split, a - 1), right = a - left;
  const W = 320, H = 110;
  const presets: [number, number][] = [[47, 6], [98, 7], [34, 11], [16, 35]];
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <div className="flex flex-wrap items-baseline gap-3 mb-3">
        <div className="text-xl font-light tabular-nums">{a} × {b} = {a * b}</div>
        <div className="flex gap-1.5">
          {presets.map(([pa, pb]) => (
            <button key={`${pa}x${pb}`} onClick={() => { setA(pa); setB(pb); setCut(-1); }}
              className={`px-2 py-0.5 rounded-lg text-[11px] tabular-nums border ${a === pa && b === pb ? "border-gray-900 dark:border-gray-100" : "border-gray-200 dark:border-gray-800 text-gray-500"}`}>
              {pa}×{pb}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-[11px] text-gray-400 mb-1">
        <label>left factor: <b className="text-gray-700 dark:text-gray-200 tabular-nums">{a}</b>
          <input type="range" min={12} max={99} value={a} onChange={(e) => { setA(+e.target.value); setCut(-1); }} className="w-full accent-emerald-500" /></label>
        <label>where to cut: <b className="text-gray-700 dark:text-gray-200 tabular-nums">{left} + {right}</b>
          <input type="range" min={1} max={a - 1} value={left} onChange={(e) => setCut(+e.target.value)} className="w-full accent-sky-500" /></label>
      </div>
      <svg viewBox={`0 0 ${W + 40} ${H + 40}`} className="w-full select-none">
        <rect x={0} y={18} width={(left / a) * W} height={H} className="fill-emerald-500/25 stroke-emerald-500" />
        <rect x={(left / a) * W} y={18} width={(right / a) * W} height={H} className="fill-sky-500/25 stroke-sky-500" />
        <text x={((left / a) * W) / 2} y={18 + H / 2 + 4} textAnchor="middle" fontSize={14} fill="currentColor" className="tabular-nums">{left}×{b}={left * b}</text>
        <text x={(left / a) * W + ((right / a) * W) / 2} y={18 + H / 2 + (right / a < 0.14 ? -16 : 4)} textAnchor="middle" fontSize={12} fill="currentColor" className="tabular-nums">{right}×{b}={right * b}</text>
        <text x={W / 2} y={11} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.5} className="tabular-nums">{a}</text>
        <text x={W + 20} y={18 + H / 2 + 4} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.5} className="tabular-nums">{b}</text>
        <text x={W / 2} y={H + 36} textAnchor="middle" fontSize={14} fill="currentColor" className="tabular-nums">{left * b} + {right * b} = {a * b}</text>
      </svg>
      <p className="text-[11px] text-gray-400 mt-1">Cut at the tens and the pieces are easy. Cut anywhere else and the total never changes — that&apos;s the whole trick.</p>
    </div>
  );
}

// ── 2 · Multiplier chain ──────────────────────────────────────────────────

function MultiplierChain() {
  const [base, setBase] = useState(200);
  const [ps, setPs] = useState<number[]>([20, -20]);
  const ms = ps.map((p) => 1 + p / 100);
  const net = ms.reduce((a, m) => a * m, 1);
  const running = ms.reduce<number[]>((acc, m) => [...acc, (acc[acc.length - 1] ?? base) * m], [base]);
  const bar = (v: number) => Math.min(100, Math.max(2, (v / (base * 2)) * 100));
  const set = (i: number, v: number) => setPs(ps.map((p, j) => (j === i ? v : p)));
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <div className="flex flex-wrap items-baseline gap-3 mb-3">
        <div className="text-xl font-light tabular-nums">{base} → {Math.round(running[running.length - 1] * 100) / 100}</div>
        <div className="text-[11px] text-gray-400">net ×{net.toFixed(3)} &nbsp;({net >= 1 ? "+" : ""}{((net - 1) * 100).toFixed(1)}%)</div>
        <div className="ml-auto flex gap-1.5">
          <button onClick={() => setPs([...ps, 10])} disabled={ps.length >= 3} className="px-2 py-0.5 rounded-lg text-[11px] border border-gray-200 dark:border-gray-800 text-gray-500 disabled:opacity-30">+ step</button>
          <button onClick={() => setPs(ps.slice(0, -1))} disabled={ps.length <= 1} className="px-2 py-0.5 rounded-lg text-[11px] border border-gray-200 dark:border-gray-800 text-gray-500 disabled:opacity-30">− step</button>
        </div>
      </div>
      <label className="block text-[11px] text-gray-400">start: <b className="text-gray-700 dark:text-gray-200 tabular-nums">{base}</b>
        <input type="range" min={50} max={500} step={25} value={base} onChange={(e) => setBase(+e.target.value)} className="w-full accent-gray-500" /></label>
      {ps.map((p, i) => (
        <label key={i} className="block text-[11px] text-gray-400 mt-1">change {i + 1}: <b className="text-gray-700 dark:text-gray-200 tabular-nums">{p >= 0 ? `up ${p}` : `down ${-p}`}% &nbsp;(×{(1 + p / 100).toFixed(2)})</b>
          <input type="range" min={-60} max={60} step={5} value={p} onChange={(e) => set(i, +e.target.value)} className="w-full accent-emerald-500" /></label>
      ))}
      <div className="mt-3 space-y-1.5 text-[12px] tabular-nums">
        {running.map((v, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-16 text-gray-400 text-right">{i === 0 ? "start" : `×${ms[i - 1].toFixed(2)}`}</span>
            <div className={`h-3.5 rounded-sm ${i === 0 ? "bg-gray-400/60" : i === running.length - 1 ? "bg-gray-900 dark:bg-gray-100" : "bg-emerald-500/60"}`} style={{ width: `${bar(v)}%` }} />
            <span className="text-gray-500">{Math.round(v * 100) / 100}</span>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-gray-400 mt-2">To undo a step, divide by its multiplier — sliding a change back to 0 shows why the opposite percent doesn&apos;t do it.</p>
    </div>
  );
}

// ── 3 · Log number line ───────────────────────────────────────────────────

const WORDS: [number, string][] = [[3, "thousand"], [6, "million"], [9, "billion"], [12, "trillion"]];
function say(v: number): string {
  const e = Math.floor(Math.log10(v));
  const w = [...WORDS].reverse().find(([we]) => e >= we);
  if (!w) return Math.round(v).toLocaleString();
  const head = v / 10 ** w[0];
  return `${head >= 100 ? Math.round(head) : Math.round(head * 10) / 10} ${w[1]}`;
}
const sci = (v: number) => { const e = Math.floor(Math.log10(v)); const c = Math.round((v / 10 ** e) * 10) / 10; return `${c} × 10^${e}`; };

function LogLine() {
  const [x, setX] = useState(7.83);  // log10 of A ≈ 6.8e7
  const [y, setY] = useState(3.48);  // log10 of B ≈ 3e3
  const A = 10 ** x, B = 10 ** y, P = A * B;
  const MAX = 12, W = 640;
  const px = (lg: number) => (lg / MAX) * W;
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <div className="text-xl font-light tabular-nums mb-1">{say(A)} × {say(B)} = {say(P)}</div>
      <div className="text-[11px] text-gray-400 mb-3 tabular-nums">{sci(A)} · {sci(B)} → {sci(P)} — the green and blue lengths, laid end to end</div>
      <label className="block text-[11px] text-gray-400">A: <b className="text-gray-700 dark:text-gray-200 tabular-nums">{say(A)}</b>
        <input type="range" min={0} max={9} step={0.01} value={x} onChange={(e) => setX(+e.target.value)} className="w-full accent-emerald-500" /></label>
      <label className="block text-[11px] text-gray-400 mt-1">B: <b className="text-gray-700 dark:text-gray-200 tabular-nums">{say(B)}</b>
        <input type="range" min={0} max={6} step={0.01} value={y} onChange={(e) => setY(+e.target.value)} className="w-full accent-sky-500" /></label>
      <div className="overflow-x-auto mt-3">
        <svg viewBox={`0 0 ${W + 20} 96`} className="w-full min-w-[480px] select-none">
          <line x1={0} x2={W} y1={64} y2={64} stroke="currentColor" strokeOpacity={0.25} />
          {Array.from({ length: MAX + 1 }, (_, e) => (
            <g key={e}>
              <line x1={px(e)} x2={px(e)} y1={60} y2={68} stroke="currentColor" strokeOpacity={0.4} />
              <text x={px(e)} y={80} textAnchor="middle" fontSize={8} fill="currentColor" opacity={0.5}>10^{e}</text>
              {WORDS.find(([we]) => we === e) && <text x={px(e)} y={92} textAnchor="middle" fontSize={8} fill="currentColor" opacity={0.7}>{WORDS.find(([we]) => we === e)![1]}</text>}
            </g>
          ))}
          <rect x={0} y={40} width={px(x)} height={7} rx={2} className="fill-emerald-500/70" />
          <rect x={px(x)} y={40} width={px(y)} height={7} rx={2} className="fill-sky-500/70" />
          <circle cx={px(x + y)} cy={43.5} r={5} className="fill-gray-900 dark:fill-gray-100" />
          <text x={Math.min(px(x + y), W - 30)} y={30} textAnchor="middle" fontSize={10} fill="currentColor" className="tabular-nums">{say(P)}</text>
          <circle cx={px(x)} cy={64} r={4} className="fill-emerald-500" />
          <circle cx={px(y)} cy={64} r={4} className="fill-sky-500" />
        </svg>
      </div>
      <p className="text-[11px] text-gray-400 mt-1">Each tick is ×10. Multiplying lays the two lengths end to end — that&apos;s why the exponents add.</p>
    </div>
  );
}
