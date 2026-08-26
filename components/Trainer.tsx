"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { generateItem, type Item } from "@/lib/items";
import { appendLog, loadState, mastery, nextSkill, record, saveState, type EngineState } from "@/lib/engine";
import { SKILL_BY_ID, type SkillId } from "@/lib/skills";
import SkillMap from "./SkillMap";

type Phase = "answer" | "correct" | "wrong";

const ADVANCE_MS = 550;

export default function Trainer() {
  const [state, setState] = useState<EngineState | null>(null);
  const [item, setItem] = useState<Item | null>(null);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<Phase>("answer");
  const [showMap, setShowMap] = useState(false);
  const [count, setCount] = useState(0);
  const startRef = useRef(0);
  const lastSkillRef = useRef<SkillId | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const advance = useCallback((st: EngineState) => {
    const id = nextSkill(st, lastSkillRef.current);
    lastSkillRef.current = id;
    setItem(generateItem(id));
    setInput("");
    setPhase("answer");
    startRef.current = performance.now();
  }, []);

  // Boot: load state from the user's token namespace and go straight in.
  useEffect(() => {
    const st = loadState();
    setState(st);
    advance(st);
  }, [advance]);

  useEffect(() => {
    if (phase === "answer") inputRef.current?.focus();
  }, [phase, item]);

  const submit = () => {
    if (!item || !state || phase !== "answer" || !input.trim()) return;
    const latency = Math.round(performance.now() - startRef.current);
    const ok = item.check(input);
    const next = record(state, item.skillId, ok, latency);
    saveState(next);
    appendLog({ skillId: item.skillId, prompt: item.prompt, answer: input, correct: ok, latencyMs: latency, ts: Date.now() });
    setState(next);
    setCount((c) => c + 1);
    if (ok) {
      setPhase("correct");
      setTimeout(() => advance(next), ADVANCE_MS);
    } else {
      setPhase("wrong");
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (phase === "answer") submit();
    else if (phase === "wrong" && state) advance(state);
  };

  if (!state || !item) return <div className="min-h-dvh bg-white dark:bg-black" />;

  const skill = SKILL_BY_ID[item.skillId];
  const m = mastery(item.skillId, state[item.skillId]);

  return (
    <div className="min-h-dvh flex flex-col bg-white dark:bg-black text-gray-900 dark:text-gray-100 select-none">
      {/* Top bar: skill label + mastery, and the map toggle */}
      <header className="flex items-center justify-between px-5 pt-5 pb-2 text-xs text-gray-400 dark:text-gray-500">
        <div className="flex items-center gap-2">
          <MasteryDots value={m} />
          <span className="tracking-wide uppercase">{skill.name}</span>
        </div>
        <button
          onClick={() => setShowMap(true)}
          aria-label="Skill map"
          className="tabular-nums hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          {count} ·  ▦
        </button>
      </header>

      {/* Prompt */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 -mt-10">
        <div className="text-center space-y-2">
          <div className="text-4xl sm:text-5xl font-light tracking-tight leading-tight break-words" style={{ overflowWrap: "anywhere" }}>
            {item.prompt}
          </div>
          <div className="text-sm text-gray-400 dark:text-gray-500">{item.sub ?? skill.ask}</div>
        </div>

        <div className="w-full max-w-sm mt-10">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            inputMode={item.inputMode}
            enterKeyHint="go"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            disabled={phase !== "answer"}
            placeholder={item.placeholder}
            className={[
              "w-full bg-transparent text-center text-3xl font-light py-3 outline-none border-b-2 transition-colors",
              "placeholder:text-gray-300 dark:placeholder:text-gray-700",
              phase === "correct" ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
              : phase === "wrong" ? "border-rose-400 text-rose-500 line-through decoration-2"
              : "border-gray-200 dark:border-gray-800 focus:border-gray-900 dark:focus:border-gray-100",
            ].join(" ")}
          />

          <div className="h-24 mt-5 text-center">
            {phase === "wrong" && (
              <button
                onClick={() => advance(state)}
                className="w-full text-left sm:text-center space-y-1 active:opacity-70"
              >
                <div className="text-2xl font-light text-gray-900 dark:text-gray-100">{item.answerText}</div>
                <div className="text-sm text-gray-500">{item.why}</div>
                <div className="text-xs text-gray-400 dark:text-gray-600 pt-2">tap or Enter to continue</div>
              </button>
            )}
          </div>
        </div>
      </main>

      {showMap && <SkillMap state={state} onClose={() => setShowMap(false)} />}
    </div>
  );
}

function MasteryDots({ value }: { value: number }) {
  const filled = Math.round(value * 5);
  return (
    <span className="flex gap-0.5" aria-label={`mastery ${Math.round(value * 100)}%`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${i < filled ? "bg-gray-900 dark:bg-gray-100" : "bg-gray-200 dark:bg-gray-800"}`}
        />
      ))}
    </span>
  );
}
