"use client";

import { isUnlocked, mastery, type EngineState } from "@/lib/engine";
import { FAMILY_LABEL, SKILLS, type Family } from "@/lib/skills";
import { getUserToken } from "@/lib/user";

const FAMILIES: Family[] = ["place-value", "exponents", "scientific", "magnitude", "percents"];

export default function SkillMap({ state, onClose }: { state: EngineState; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-20 bg-white dark:bg-black text-gray-900 dark:text-gray-100 overflow-y-auto">
      <div className="max-w-md mx-auto px-5 py-5">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-light tracking-tight">Skills</h1>
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
            close
          </button>
        </div>

        {FAMILIES.map((fam) => (
          <section key={fam} className="mb-6">
            <h2 className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">{FAMILY_LABEL[fam]}</h2>
            <ul className="space-y-2">
              {SKILLS.filter((s) => s.family === fam).map((s) => {
                const st = state[s.id];
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

        <div className="text-[10px] text-gray-300 dark:text-gray-700 mt-8 break-all">
          user {getUserToken()}
        </div>
      </div>
    </div>
  );
}
