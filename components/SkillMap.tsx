"use client";

import { isUnlocked, mastery, type EngineState } from "@/lib/engine";
import { FAMILIES, FAMILY_LABEL, SKILLS } from "@/lib/skills";
import { dayKey, dayTotals, loadDays } from "@/lib/sessions";
import type { Profile } from "@/lib/user";
import Account from "./Account";

export default function SkillMap({ state, profile, onProfile, onClose }: { state: EngineState; profile: Profile; onProfile: (p: Profile) => void; onClose: () => void }) {
  const days = loadDays();
  const last14 = Array.from({ length: 14 }, (_, i) => dayKey(Date.now() - i * 86400e3));
  return (
    <div className="fixed inset-0 z-20 bg-white dark:bg-black text-gray-900 dark:text-gray-100 overflow-y-auto">
      <div className="max-w-md mx-auto px-5 pt-[max(env(safe-area-inset-top),20px)] pb-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-light tracking-tight">{profile.username ? `${profile.username} · days & skills` : "Days & skills"}</h1>
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">close</button>
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

        <Account profile={profile} onChange={onProfile} />
      </div>
    </div>
  );
}
