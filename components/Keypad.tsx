"use client";

/**
 * Single on-screen keypad used for every item, so the input surface never
 * changes. Calculator order (789 / 456 / 123 / 0 . ↵) with ⌫, e and / in a
 * fourth column — e for exponents (6.8e7), / for fractions — decided 9/3.
 */
interface Props {
  onKey: (k: string) => void;
  onBackspace: () => void;
  onSubmit: () => void;
  submitDisabled?: boolean;
}

const KEYS: { k: string; span?: number; kind?: "bs" | "enter" }[] = [
  { k: "7" }, { k: "8" }, { k: "9" }, { k: "⌫", kind: "bs" },
  { k: "4" }, { k: "5" }, { k: "6" }, { k: "e" },
  { k: "1" }, { k: "2" }, { k: "3" }, { k: "/" },
  { k: "0", span: 2 }, { k: "." }, { k: "↵", kind: "enter" },
];

export default function Keypad({ onKey, onBackspace, onSubmit, submitDisabled }: Props) {
  const base = "h-14 rounded-2xl text-2xl font-light select-none active:scale-95 transition-transform touch-manipulation";
  const key = `${base} bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100`;
  return (
    <div data-c="Keypad" className="grid grid-cols-4 gap-2 px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-2 max-w-md mx-auto w-full">
      {KEYS.map(({ k, span, kind }) =>
        kind === "bs" ? (
          <button key={k} type="button" aria-label="backspace" className={`${key} text-xl`} onPointerDown={(e) => { e.preventDefault(); onBackspace(); }}>⌫</button>
        ) : kind === "enter" ? (
          <button key={k} type="button" aria-label="submit" disabled={submitDisabled} className={`${base} bg-gray-900 text-white dark:bg-gray-100 dark:text-black disabled:opacity-20`} onPointerDown={(e) => { e.preventDefault(); onSubmit(); }}>↵</button>
        ) : (
          <button key={k} type="button" className={`${key} ${span === 2 ? "col-span-2" : ""}`} onPointerDown={(e) => { e.preventDefault(); onKey(k); }}>{k}</button>
        ),
      )}
    </div>
  );
}
