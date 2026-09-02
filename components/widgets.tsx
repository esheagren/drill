"use client";

/**
 * Shared interactive widgets. Used by /widgetlibrary (with presets) and by the
 * trainer's feedback state, seeded with the numbers of the item just answered.
 */
import { useState } from "react";

// ── Area model ─────────────────────────────────────────────────────────────

export function AreaModel({ initialA = 47, initialB = 6, compact = false }: { initialA?: number; initialB?: number; compact?: boolean }) {
  const [a, setA] = useState(initialA);
  const [b] = useState(initialB);
  const [cut, setCut] = useState(-1); // -1 = cut at the tens place
  const split = cut === -1 ? Math.max(1, Math.floor(a / 10) * 10) : cut;
  const left = Math.min(split, a - 1), right = a - left;
  const W = 320, H = compact ? 80 : 110;
  const aMax = Math.max(99, initialA);
  return (
    <div>
      <div className={`${compact ? "text-base" : "text-xl"} font-light tabular-nums mb-2`}>{a} × {b} = {a * b}</div>
      <div className="grid grid-cols-2 gap-3 text-[11px] text-gray-400 mb-1">
        <label>left factor: <b className="text-gray-700 dark:text-gray-200 tabular-nums">{a}</b>
          <input type="range" min={12} max={aMax} value={a} onChange={(e) => { setA(+e.target.value); setCut(-1); }} className="w-full accent-emerald-500" /></label>
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
    </div>
  );
}

// ── Multiplier chain ───────────────────────────────────────────────────────

export function MultiplierChain({ initialBase = 200, initialChanges = [20, -20], compact = false }: { initialBase?: number; initialChanges?: number[]; compact?: boolean }) {
  const [base, setBase] = useState(initialBase);
  const [ps, setPs] = useState<number[]>(initialChanges);
  const ms = ps.map((p) => 1 + p / 100);
  const net = ms.reduce((a, m) => a * m, 1);
  const running = ms.reduce<number[]>((acc, m) => [...acc, (acc[acc.length - 1] ?? base) * m], [base]);
  const peak = Math.max(...running, base) * 1.1;
  const bar = (v: number) => Math.min(100, Math.max(2, (v / peak) * 100));
  const set = (i: number, v: number) => setPs(ps.map((p, j) => (j === i ? v : p)));
  const fmt = (v: number) => (Math.round(v * 100) / 100).toLocaleString("en-US");
  return (
    <div>
      <div className={`${compact ? "text-base" : "text-xl"} font-light tabular-nums mb-0.5`}>{fmt(base)} → {fmt(running[running.length - 1])}</div>
      <div className="text-[11px] text-gray-400 mb-2 tabular-nums">net ×{net.toFixed(3)} ({net >= 1 ? "+" : ""}{((net - 1) * 100).toFixed(1)}%)</div>
      {!compact && (
        <label className="block text-[11px] text-gray-400">start: <b className="text-gray-700 dark:text-gray-200 tabular-nums">{fmt(base)}</b>
          <input type="range" min={50} max={500} step={25} value={base} onChange={(e) => setBase(+e.target.value)} className="w-full accent-gray-500" /></label>
      )}
      {ps.map((p, i) => (
        <label key={i} className="block text-[11px] text-gray-400 mt-1">change {i + 1}: <b className="text-gray-700 dark:text-gray-200 tabular-nums">{p >= 0 ? `up ${p}` : `down ${-p}`}% (×{(1 + p / 100).toFixed(2)})</b>
          <input type="range" min={-60} max={60} step={5} value={p} onChange={(e) => set(i, +e.target.value)} className="w-full accent-emerald-500" /></label>
      ))}
      <div className="mt-2.5 space-y-1.5 text-[12px] tabular-nums">
        {running.map((v, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-14 text-gray-400 text-right shrink-0">{i === 0 ? "start" : `×${ms[i - 1].toFixed(2)}`}</span>
            <div className={`h-3.5 rounded-sm ${i === 0 ? "bg-gray-400/60" : i === running.length - 1 ? "bg-gray-900 dark:bg-gray-100" : "bg-emerald-500/60"}`} style={{ width: `${bar(v)}%` }} />
            <span className="text-gray-500 shrink-0">{fmt(v)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Log number line ────────────────────────────────────────────────────────

const WORDS: [number, string][] = [[3, "thousand"], [6, "million"], [9, "billion"], [12, "trillion"]];
function say(v: number): string {
  if (v < 1000) return (Math.round(v * 10) / 10).toLocaleString();
  const e = Math.floor(Math.log10(v));
  const w = [...WORDS].reverse().find(([we]) => e >= we)!;
  const head = v / 10 ** w[0];
  return `${head >= 100 ? Math.round(head) : Math.round(head * 10) / 10} ${w[1]}`;
}
const sciStr = (v: number) => { const e = Math.floor(Math.log10(v)); const c = Math.round((v / 10 ** e) * 10) / 10; return `${c} × 10^${e}`; };

export function LogLine({ initialX = 7.83, initialY = 3.48, compact = false }: { initialX?: number; initialY?: number; compact?: boolean }) {
  const [x, setX] = useState(initialX);
  const [y, setY] = useState(initialY);
  const A = 10 ** x, B = 10 ** y, P = A * B;
  const MAX = 12, W = 640;
  const px = (lg: number) => (Math.min(lg, MAX) / MAX) * W;
  return (
    <div>
      <div className={`${compact ? "text-base" : "text-xl"} font-light tabular-nums mb-0.5`}>{say(A)} × {say(B)} = {say(P)}</div>
      <div className="text-[11px] text-gray-400 mb-2 tabular-nums">{sciStr(A)} · {sciStr(B)} → {sciStr(P)}</div>
      <label className="block text-[11px] text-gray-400">A: <b className="text-gray-700 dark:text-gray-200 tabular-nums">{say(A)}</b>
        <input type="range" min={0} max={9} step={0.01} value={x} onChange={(e) => setX(+e.target.value)} className="w-full accent-emerald-500" /></label>
      <label className="block text-[11px] text-gray-400 mt-1">B: <b className="text-gray-700 dark:text-gray-200 tabular-nums">{say(B)}</b>
        <input type="range" min={0} max={6} step={0.01} value={y} onChange={(e) => setY(+e.target.value)} className="w-full accent-sky-500" /></label>
      <div className="overflow-x-auto mt-2">
        <svg viewBox={`0 0 ${W + 20} 96`} className="w-full min-w-[440px] select-none">
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
    </div>
  );
}
