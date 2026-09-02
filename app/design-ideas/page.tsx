"use client";

/**
 * /design-ideas — a running sketchbook. Each entry is a dated, lightweight
 * mockup exploring an interaction before we build it for real. Newest first.
 * Not linked from the app's navigation; visit the URL directly.
 */
import { useState } from "react";

export default function DesignIdeas() {
  return (
    <div className="min-h-dvh bg-white dark:bg-black text-gray-900 dark:text-gray-100">
      <div className="max-w-2xl mx-auto px-5 py-10">
        <h1 className="text-2xl font-light tracking-tight">Design ideas</h1>
        <p className="text-sm text-gray-500 mt-1 mb-10">A running sketchbook — dated mockups, newest first. Nothing here is shipped behavior.</p>

        <Entry date="02 Sep 2026" title="After you answer, the explanation gets the whole screen">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Once an answer is in, the keypad is dead weight — you can&apos;t type anything useful. So the feedback state
            drops the keypad entirely and uses that room: the problem stays up top, then the answer, then a real
            walk-through of <em>this</em> problem, ending with the technique it illustrates. One tap anywhere brings the
            keypad back with the next question.
          </p>
          <div className="flex flex-wrap gap-6">
            <Phone label="today">
              <div className="text-center pt-6">
                <div className="text-2xl font-light">11³</div>
                <div className="text-emerald-500 text-lg mt-3">1331</div>
                <div className="mx-3 mt-3 rounded-lg border border-emerald-600 p-2 text-left">
                  <div className="text-[7px] uppercase text-gray-400">Cube: square, then multiply once more</div>
                  <div className="text-[8px] leading-tight mt-0.5">Take the square you know and multiply by the number again; for teens, split the last step.</div>
                  <div className="text-[7px] text-gray-400 mt-0.5">13³: 169 × 13 = 2197</div>
                </div>
                <div className="text-[7px] text-gray-400 mt-2">any key to continue</div>
              </div>
              <Keypad3 />
            </Phone>
            <Phone label="proposed">
              <div className="px-4 pt-6">
                <div className="text-center">
                  <div className="text-xl font-light">11³ <span className="text-emerald-500">= 1331</span></div>
                  <div className="text-[8px] text-gray-400">right · 9.2s</div>
                </div>
                <div className="mt-5 space-y-2.5 text-[11px] leading-snug">
                  <Step n={1}>11 × 11 = <b>121</b> — a square you know</Step>
                  <Step n={2}>121 × 11 is 121 × 10 plus 121 once more:</Step>
                </div>
                <div className="mt-2 ml-5 font-mono text-[12px] leading-relaxed tabular-nums">
                  <div className="text-emerald-400">&nbsp;&nbsp;1&nbsp;2&nbsp;1&nbsp;0&nbsp;&nbsp;<span className="text-[8px] text-gray-500 font-sans">×10 — slide left</span></div>
                  <div className="text-sky-400">+&nbsp;&nbsp;&nbsp;1&nbsp;2&nbsp;1&nbsp;&nbsp;<span className="text-[8px] text-gray-500 font-sans">×1 — itself</span></div>
                  <div className="border-t border-gray-700 w-20 my-0.5"></div>
                  <div>&nbsp;&nbsp;1&nbsp;3&nbsp;3&nbsp;1</div>
                </div>
                <div className="mt-4 rounded-lg bg-gray-100 dark:bg-gray-900 p-2.5">
                  <div className="text-[8px] uppercase tracking-wide text-gray-400">the move</div>
                  <div className="text-[10px] mt-0.5 tabular-nums">×11 = ×10 + ×1 &nbsp;·&nbsp; slide the number one place left, add it to itself.</div>
                </div>
                <div className="text-[8px] text-gray-400 text-center mt-6">tap anywhere for the next one</div>
              </div>
            </Phone>
          </div>
        </Entry>

        <Entry date="02 Sep 2026" title="Explain this problem, not a cousin of it">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            The tips library pairs a general rule with a canned example — so 11³ gets a card whose example is 13³.
            The fix isn&apos;t better matching; it&apos;s that each generator should emit <em>worked steps for its own
            numbers</em> (it already knows them), and the library&apos;s job shrinks to naming the technique at the end.
            Three examples of the difference:
          </p>
          <div className="space-y-3">
            <Contrast
              problem="4/5 of 400"
              canned="Know the twelfths: 1/12 = 0.0833… (7/12 of 240 = 140)"
              specific={<>1/5 of 400 = <b>80</b> → 4 parts → <b>320</b>. Or from the top: 400 − 80. <span className="text-gray-400">(one part, then scale)</span></>}
            />
            <Contrast
              problem="after 50% off: 75"
              canned="'x is p% of what' → x ÷ (p/100). 'After p% off it's x' → x ÷ (1 − p/100)."
              specific={<>75 is <b>half</b> of the original — so the original is 75 × 2 = <b>150</b>. <span className="text-gray-400">(divide by what&apos;s left, not by what came off)</span></>}
            />
            <Contrast
              problem="98 × 7"
              canned="When a factor is just below a multiple of ten, multiply by the round number and subtract the small overshoot times the other factor."
              specific={<>100 × 7 = <b>700</b>, then give back the 2 sevens: 700 − 14 = <b>686</b>. <span className="text-gray-400">(borrow from 100)</span></>}
            />
          </div>
        </Entry>

        <Entry date="02 Sep 2026" title="A widget, when a picture is faster than a sentence">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            With the whole lower screen available, some techniques deserve ten seconds of play instead of prose.
            Two early sketches below; the vetted, polished versions live in <a href="/widgetlibrary" className="underline">/widgetlibrary</a>.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            <AreaModel />
            <PercentChain />
          </div>
        </Entry>

        <Entry date="02 Sep 2026" title="Words a person would say">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            The current rules read like compressed documentation. Rewrite them the way you&apos;d say them out loud,
            one idea per sentence, this problem&apos;s numbers doing the talking:
          </p>
          <table className="w-full text-sm">
            <thead><tr className="text-[10px] uppercase tracking-wide text-gray-400 text-left"><th className="pb-1 pr-3 font-normal w-1/2">now</th><th className="pb-1 font-normal">instead</th></tr></thead>
            <tbody className="align-top">
              <tr className="border-t border-gray-100 dark:border-gray-900">
                <td className="py-2 pr-3 text-gray-500">&ldquo;Take the square you know and multiply by the number again; for teens, split the last step.&rdquo;</td>
                <td className="py-2">&ldquo;You know 11² is 121. One more ×11: 1210, plus 121.&rdquo;</td>
              </tr>
              <tr className="border-t border-gray-100 dark:border-gray-900">
                <td className="py-2 pr-3 text-gray-500">&ldquo;Divide by the denominator to get one part, then multiply by the numerator.&rdquo;</td>
                <td className="py-2">&ldquo;A fifth of 400 is 80. You want four of those.&rdquo;</td>
              </tr>
              <tr className="border-t border-gray-100 dark:border-gray-900">
                <td className="py-2 pr-3 text-gray-500">&ldquo;Increase by p% is ×(1 + p/100); decrease is ×(1 − p/100). Compute the multiplier first.&rdquo;</td>
                <td className="py-2">&ldquo;Up 15% means ×1.15. Do the whole change in one multiply.&rdquo;</td>
              </tr>
            </tbody>
          </table>
        </Entry>
      </div>
    </div>
  );
}

// ── scaffolding ────────────────────────────────────────────────────────────

function Entry({ date, title, children }: { date: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-14">
      <div className="text-[11px] uppercase tracking-wide text-gray-400">{date}</div>
      <h2 className="text-lg font-light mt-0.5 mb-3" style={{ textWrap: "balance" }}>{title}</h2>
      {children}
    </section>
  );
}

function Phone({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] text-gray-400 mb-1.5">{label}</div>
      <div className="w-56 h-[420px] rounded-[24px] border border-gray-300 dark:border-gray-700 bg-black text-gray-100 overflow-hidden relative">
        {children}
      </div>
    </div>
  );
}

function Keypad3() {
  return (
    <div className="absolute bottom-2 inset-x-2 grid grid-cols-4 gap-1 opacity-40">
      {["1","2","3","⌫","4","5","6","","7","8","9","",". ","0","e",""].map((k, i) => (
        <div key={i} className={`h-6 rounded ${k ? "bg-gray-800" : ""} text-[9px] flex items-center justify-center`}>{k}</div>
      ))}
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-2 items-baseline">
      <span className="text-[9px] text-gray-500 tabular-nums shrink-0 w-3">{n}</span>
      <span>{children}</span>
    </div>
  );
}

function Contrast({ problem, canned, specific }: { problem: string; canned: string; specific: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
      <div className="text-base font-light mb-2">{problem}</div>
      <div className="grid sm:grid-cols-2 gap-3 text-[13px]">
        <div><div className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">canned tip (today)</div><div className="text-gray-500">{canned}</div></div>
        <div><div className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">worked from these numbers</div><div>{specific}</div></div>
      </div>
    </div>
  );
}

// ── widget 1: area model for the distributive split ────────────────────────

function AreaModel() {
  const [a, setA] = useState(47);
  const b = 6;
  const tens = Math.floor(a / 10) * 10, ones = a % 10;
  const W = 200, H = 90;
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
      <div className="text-sm mb-1">{a} × {b} — the split is a picture</div>
      <div className="text-[11px] text-gray-500 mb-3">drag to change the left factor</div>
      <input type="range" min={12} max={99} value={a} onChange={(e) => setA(+e.target.value)} className="w-full accent-emerald-500" aria-label="left factor" />
      <svg viewBox={`0 0 ${W + 30} ${H + 30}`} className="w-full mt-2 select-none">
        <rect x={0} y={16} width={(tens / a) * W} height={H} className="fill-emerald-500/30 stroke-emerald-500" />
        <rect x={(tens / a) * W} y={16} width={(ones / a) * W} height={H} className="fill-sky-500/30 stroke-sky-500" />
        <text x={((tens / a) * W) / 2} y={16 + H / 2} textAnchor="middle" fontSize={13} fill="currentColor">{tens}×{b}={tens * b}</text>
        {ones > 0 && <text x={(tens / a) * W + ((ones / a) * W) / 2} y={16 + H / 2 + (ones < 3 ? -14 : 0)} textAnchor="middle" fontSize={11} fill="currentColor">{ones}×{b}={ones * b}</text>}
        <text x={W / 2} y={10} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.5}>{a}</text>
        <text x={W + 14} y={16 + H / 2} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.5}>{b}</text>
        <text x={W / 2} y={H + 28} textAnchor="middle" fontSize={12} fill="currentColor">{tens * b} + {ones * b} = <tspan fontWeight={600}>{a * b}</tspan></text>
      </svg>
    </div>
  );
}

// ── widget 2: successive percent changes as one multiplier ─────────────────

function PercentChain() {
  const [p1, setP1] = useState(20);
  const [p2, setP2] = useState(-20);
  const m1 = 1 + p1 / 100, m2 = 1 + p2 / 100, net = m1 * m2;
  const bar = (m: number) => Math.min(100, Math.max(4, m * 55));
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
      <div className="text-sm mb-1">up {p1 >= 0 ? p1 : `−${-p1}`}%, then {p2 >= 0 ? `up ${p2}` : `down ${-p2}`}% — why it isn&apos;t zero</div>
      <div className="text-[11px] text-gray-500 mb-3">drag both changes; the bars are the multipliers</div>
      <label className="block text-[10px] text-gray-400">first change: {p1}%</label>
      <input type="range" min={-50} max={50} step={5} value={p1} onChange={(e) => setP1(+e.target.value)} className="w-full accent-emerald-500" />
      <label className="block text-[10px] text-gray-400 mt-1">second change: {p2}%</label>
      <input type="range" min={-50} max={50} step={5} value={p2} onChange={(e) => setP2(+e.target.value)} className="w-full accent-sky-500" />
      <div className="mt-3 space-y-1.5 text-[11px] tabular-nums">
        <div className="flex items-center gap-2"><span className="w-14 text-gray-400">×{m1.toFixed(2)}</span><div className="h-3 rounded-sm bg-emerald-500/60" style={{ width: `${bar(m1)}%` }} /></div>
        <div className="flex items-center gap-2"><span className="w-14 text-gray-400">×{m2.toFixed(2)}</span><div className="h-3 rounded-sm bg-sky-500/60" style={{ width: `${bar(m2)}%` }} /></div>
        <div className="flex items-center gap-2 pt-1 border-t border-gray-100 dark:border-gray-900"><span className="w-14">×{net.toFixed(3)}</span><div className="h-3 rounded-sm bg-gray-900 dark:bg-gray-100" style={{ width: `${bar(net)}%` }} /><span className="text-gray-500">net {net >= 1 ? "+" : ""}{((net - 1) * 100).toFixed(1)}%</span></div>
      </div>
      <div className="text-[11px] text-gray-500 mt-2">100 → {Math.round(100 * m1)} → <b>{(100 * net).toFixed(1)}</b></div>
    </div>
  );
}
