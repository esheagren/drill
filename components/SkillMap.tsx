"use client";

import { useState } from "react";

import { isUnlocked, mastery, type EngineState } from "@/lib/engine";
import { FAMILIES, FAMILY_LABEL, SKILLS } from "@/lib/skills";
import { getUserToken, setUserToken } from "@/lib/user";
import { dayKey, dayTotals, loadDays } from "@/lib/sessions";


export default function SkillMap({ state, onClose }: { state: EngineState; onClose: () => void }) {
  const days = loadDays();
  const [code, setCode] = useState<string | null>(null);
  const [entry, setEntry] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const mint = async () => {
    setMsg(null);
    try {
      const r = await fetch("/api/pair", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ user: getUserToken() }) });
      const j = await r.json();
      setCode(j.ok ? j.code : null);
      if (!j.ok) setMsg("couldn't get a code — offline?");
    } catch { setMsg("couldn't get a code — offline?"); }
  };
  const redeem = async () => {
    setMsg(null);
    try {
      const r = await fetch("/api/pair", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ code: entry, from: getUserToken() }) });
      const j = await r.json();
      if (!j.ok) { setMsg(j.error ?? "that code didn't work"); return; }
      // Adopt the paired identity; wipe this device's provisional local state so the server copy hydrates cleanly.
      const old = getUserToken();
      for (const k of Object.keys(localStorage)) if (k.startsWith(`magnitude:${old}:`)) localStorage.removeItem(k);
      setUserToken(j.user);
      location.reload();
    } catch { setMsg("couldn't reach the server"); }
  };
  const last14 = Array.from({ length: 14 }, (_, i) => dayKey(Date.now() - i * 86400e3));
  return (
    <div className="fixed inset-0 z-20 bg-white dark:bg-black text-gray-900 dark:text-gray-100 overflow-y-auto">
      <div className="max-w-md mx-auto px-5 py-5">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-light tracking-tight">Days & skills</h1>
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
            close
          </button>
        </div>

        <section className="mb-8">
          <h2 className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">Days</h2>
          <ul className="space-y-1 text-sm tabular-nums">
            {last14.map((k) => {
              const t = dayTotals(days, k);
              return (
                <li key={k} className={`flex justify-between ${t.sessions ? "" : "text-gray-300 dark:text-gray-700"}`}>
                  <span>{k.slice(5)}</span>
                  <span>{t.sessions ? `${t.correct}/${t.answered} · ${t.sessions} session${t.sessions > 1 ? "s" : ""}` : "—"}</span>
                </li>
              );
            })}
          </ul>
        </section>

        {FAMILIES.map((fam) => (
          <section key={fam} className="mb-6">
            <h2 className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">{FAMILY_LABEL[fam]}</h2>
            <ul className="space-y-2">
              {SKILLS.filter((s) => s.family === fam).map((s) => {
                const st = state.skills[s.id];
                const m = mastery(s.id, st);
                const unlocked = isUnlocked(s.id, state);
                return (
                  <li key={s.id} className={unlocked ? "" : "opacity-40"}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span>{s.name}</span>
                      <span className="text-xs text-gray-400 tabular-nums">
                        {st.attempts ? `${st.correct}/${st.attempts}` : unlocked ? "new" : "locked"}
                        {st.speed ? ` · ${(st.speed / 1000).toFixed(1)}s` : ""}
                      </span>
                    </div>
                    <div className="h-1 mt-1 rounded bg-gray-100 dark:bg-gray-900 overflow-hidden">
                      <div className="h-full bg-gray-900 dark:bg-gray-100 transition-all" style={{ width: `${m * 100}%` }} />
                    </div>
                    <div className="text-[10px] text-gray-400 dark:text-gray-600 mt-0.5">
                      {s.ccss.join(" · ")}
                      {s.prereqs.length ? ` · after ${s.prereqs.join(", ")}` : ""}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        <section className="mt-8 text-sm text-gray-500 space-y-4">
          <h2 className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">Devices</h2>

          <div className="space-y-2">
            <p className="text-xs">Continue this history on another device: get a code here, type it there.</p>
            {code ? (
              <div className="text-3xl font-light tracking-[0.3em] text-gray-900 dark:text-gray-100 tabular-nums">{code}</div>
            ) : (
              <button onClick={mint} className="h-10 px-4 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100">get a code</button>
            )}
            {code && <p className="text-xs text-gray-400">valid 10 minutes</p>}
          </div>

          <div className="space-y-2">
            <p className="text-xs">Have a code from another device? Enter it to bring that history here (anything done on this device is merged in).</p>
            <div className="flex gap-2">
              <input
                value={entry}
                onChange={(e) => setEntry(e.target.value.toUpperCase())}
                placeholder="CODE"
                maxLength={6}
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                className="flex-1 h-10 px-3 rounded-xl bg-transparent border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 tracking-[0.2em] uppercase outline-none focus:border-gray-900 dark:focus:border-gray-100"
              />
              <button onClick={redeem} disabled={entry.length !== 6} className="h-10 px-4 rounded-xl bg-gray-900 text-white dark:bg-gray-100 dark:text-black disabled:opacity-20">link</button>
            </div>
            {msg && <p className="text-xs text-rose-500">{msg}</p>}
          </div>

          <p className="text-[10px] text-gray-300 dark:text-gray-700 break-all">id {getUserToken()}</p>
        </section>
      </div>
    </div>
  );
}
