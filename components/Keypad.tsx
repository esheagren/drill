"use client";

/**
 * Single on-screen keypad used for every item, so the input surface never
 * changes: digits, decimal point, `e` for exponents (6.8e7), backspace, submit.
 */
interface Props {
  onKey: (k: string) => void;
  onBackspace: () => void;
  onSubmit: () => void;
  submitDisabled?: boolean;
}

const ROWS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  [".", "0", "e"],
  ["/"],
];

export default function Keypad({ onKey, onBackspace, onSubmit, submitDisabled }: Props) {
  const base =
    "h-14 rounded-2xl text-2xl font-light select-none active:scale-95 transition-transform touch-manipulation";
  const key = `${base} bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100`;
  return (
    <div data-c="Keypad" className="grid grid-cols-4 gap-2 px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-2 max-w-md mx-auto w-full">
      {ROWS.map((row, i) => (
        <div key={i} className="contents">
          {row.map((k) => (
            <button key={k} type="button" className={`${key} ${row.length === 1 ? "col-span-3" : ""}`} onPointerDown={(e) => { e.preventDefault(); onKey(k); }}>
              {k}
            </button>
          ))}
          {i === 0 && (
            <button type="button" aria-label="backspace" className={`${key} text-xl`} onPointerDown={(e) => { e.preventDefault(); onBackspace(); }}>
              ⌫
            </button>
          )}
          {i === 1 && (
            <button
              type="button"
              aria-label="submit"
              disabled={submitDisabled}
              className={`${base} row-span-4 bg-gray-900 text-white dark:bg-gray-100 dark:text-black disabled:opacity-20 h-auto`}
              onPointerDown={(e) => { e.preventDefault(); onSubmit(); }}
            >
              ↵
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
