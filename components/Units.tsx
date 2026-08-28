"use client";

import { isUnlocked, mastery, ratingOf, type EngineState } from "@/lib/engine";
import { FAMILIES, FAMILY_BLURB, FAMILY_LABEL, skillsIn } from "@/lib/skills";
import { MIXED, skillPlan, unitPlan, type Plan } from "@/lib/sessions";

/**
 * The curriculum, made visible: units → core skills, each with mastery.
 * Tap a unit for a 2-minute interleaved session across its skills; tap a
 * skill for a 2-minute drill; or go back to the mixed 8-minute session.
 */
export default function Units({ state, onPick, onClose }: { state: EngineState; onPick: (p: Plan) => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-20 bg-white dark:bg-black text-gray-900 dark:text-gray-100 overflow-y-auto">
      <div className="max-w-md mx-auto px-5 pt-[max(env(safe-area-inset-top),20px)] pb-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-light tracking-tight">Practice</h1>
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">close</button>
        </div>

        <button
          onClick={() => onPick(MIXED)}
          className="w-full text-left rounded-2xl border border-gray-200 dark:border-gray-800 p-4 mb-6 active:scale-[0.99] transition"
        >
          <div className="flex items-baseline justify-between">
            <span className="text-base">Mixed practice</span>
            <span className="text-xs text-gray-400 tabular-nums">8 min</span>
          </div>
          <div className="text-xs text-gray-500 mt-0.5">everything unlocked so far, interleaved — the default</div>
        </button>

        <div className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">Units · 2 min each</div>
        <ol className="space-y-3">
          {FAMILIES.map((fam, i) => {
            const skills = skillsIn(fam);
            const unitM = skills.reduce((a, s) => a + mastery(s.id, state.skills[s.id]), 0) / skills.length;
            return (
              <li key={fam} className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <button onClick={() => onPick(unitPlan(fam))} className="w-full text-left p-4 active:bg-gray-50 dark:active:bg-gray-900 transition">
                  <div className="flex items-baseline justify-between">
                    <span className="text-base"><span className="text-gray-400 tabular-nums mr-2">{i + 1}</span>{FAMILY_LABEL[fam]}</span>
                    <span className="text-xs text-gray-400 tabular-nums">{ratingOf(state, fam).n ? `rating ${ratingOf(state, fam).theta.toFixed(1)} · ` : ""}{Math.round(unitM * 100)}%</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{FAMILY_BLURB[fam]}</div>
                  <div className="h-1 mt-2 rounded bg-gray-100 dark:bg-gray-900 overflow-hidden">
                    <div className="h-full bg-gray-900 dark:bg-gray-100" style={{ width: `${unitM * 100}%` }} />
                  </div>
                </button>
                <ul className="border-t border-gray-100 dark:border-gray-900">
                  {skills.map((s) => {
                    const st = state.skills[s.id];
                    const m = mastery(s.id, st);
                    const unlocked = isUnlocked(s.id, state);
                    return (
                      <li key={s.id}>
                        <button
                          onClick={() => onPick(skillPlan(s.id))}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left active:bg-gray-50 dark:active:bg-gray-900 transition"
                        >
                          <Dots value={m} />
                          <span className={`flex-1 ${unlocked ? "" : "text-gray-400"}`}>{s.name}</span>
                          <span className="text-xs text-gray-400 tabular-nums">
                            {st.attempts ? `${st.correct}/${st.attempts}` : unlocked ? "new" : "locked in mixed"}
                            {st.speed ? ` · ${(st.speed / 1000).toFixed(1)}s` : ""}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function Dots({ value }: { value: number }) {
  const filled = Math.round(value * 5);
  return (
    <span className="flex gap-0.5 shrink-0">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={`w-1.5 h-1.5 rounded-full ${i < filled ? "bg-gray-900 dark:bg-gray-100" : "bg-gray-200 dark:bg-gray-800"}`} />
      ))}
    </span>
  );
}
