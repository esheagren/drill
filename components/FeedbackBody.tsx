import type { ReactNode } from "react";

/** Shared layout for the trainer and DesignSpace's explanation previews. */
export default function FeedbackBody({ lines, alt, slow = false, picture, onNext }: {
  lines: string[]; alt?: string; slow?: boolean; picture?: ReactNode; onNext: () => void;
}) {
  return <>
    <main className="flex-1 min-h-0 overflow-y-auto px-6 pt-5 pb-3">
      <div className="space-y-3 font-serif">
        {lines.map((l,i)=> {
          const last=i===lines.length-1;
          return <div key={i} data-c={last ? "AnswerReveal" : undefined} className={`text-[26px] leading-tight ${last ? (slow ? "text-emerald-600 dark:text-emerald-400" : "text-gray-900 dark:text-gray-100") : i===0 ? "text-gray-700 dark:text-gray-300" : "text-gray-500"}`}>
            {l}{last && alt && <span className="block text-[18px] text-gray-400 dark:text-gray-500 mt-1">{alt}</span>}
          </div>;
        })}
      </div>
    </main>
    <div className="shrink-0 border-t border-gray-100 dark:border-gray-900 px-4 pt-3 pb-[max(env(safe-area-inset-bottom),12px)] max-w-md mx-auto w-full">
      {picture && <div data-c="PlayWithIt" className="rounded-xl border border-gray-200 dark:border-gray-800 px-4 py-3 max-h-[46dvh] overflow-y-auto" onClick={(e)=>e.stopPropagation()} onPointerDown={(e)=>e.stopPropagation()}>{picture}</div>}
      <button type="button" onClick={onNext} aria-label="Next question" data-c="NextBar" className="mt-3 h-14 w-full rounded-2xl bg-gray-900 text-white dark:bg-gray-100 dark:text-black text-2xl active:scale-[0.98] transition">→</button>
    </div>
  </>;
}
