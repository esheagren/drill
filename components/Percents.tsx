"use client";

import { useState } from "react";
import { PracticeSession } from "./PracticeSession";
import { parseNumberInput } from "@/lib/utils";

interface Question {
  percent: number;
  base: number;
  answer: number;
  display: string;
}

export default function Percents({ onBack }: { onBack: () => void }) {
  const [difficulty, setDifficulty] = useState(1);

  const generateQuestion = (): Question => {
    const easyPercents = [5, 10, 20, 25, 50, 75];
    const mediumPercents = [8, 12, 15, 30, 40, 60];
    const hardPercents = [2.5, 7.5, 12.5, 17.5, 22.5, 35, 65, 85];
    
    const percentOptions = difficulty === 1 
      ? easyPercents 
      : difficulty === 2 
        ? [...easyPercents, ...mediumPercents]
        : [...easyPercents, ...mediumPercents, ...hardPercents];
    
    const percent = percentOptions[Math.floor(Math.random() * percentOptions.length)];
    
    const baseRange = difficulty === 1 ? [10, 100] : difficulty === 2 ? [50, 1000] : [100, 10000];
    const base = Math.floor(Math.random() * (baseRange[1] - baseRange[0]) / 10) * 10;
    
    const answer = (percent / 100) * base;
    const display = `${percent}% of ${base.toLocaleString()}`;
    
    return { percent, base, answer, display };
  };

  const [question, setQuestion] = useState<Question>(generateQuestion);

  const checkAnswer = (userInput: string): { correct: boolean; userValue: number } => {
    const userValue = parseNumberInput(userInput);
    if (userValue === null) return { correct: false, userValue: 0 };
    
    const tolerance = Math.max(question.answer * 0.02, 0.5);
    const correct = Math.abs(userValue - question.answer) <= tolerance;
    
    return { correct, userValue };
  };

  const getHint = (): string | null => {
    const { percent, base } = question;
    
    if (percent === 10) {
      return `10% = 1/10, so divide by 10\n${base} ÷ 10 = ${base / 10}`;
    }
    if (percent === 25) {
      return `25% = 1/4, so divide by 4\n${base} ÷ 4 = ${base / 4}`;
    }
    if (percent === 50) {
      return `50% = 1/2, so divide by 2\n${base} ÷ 2 = ${base / 2}`;
    }
    if (percent === 5) {
      return `5% = half of 10%\n10% of ${base} = ${base / 10}\nHalf of that = ${base / 20}`;
    }
    
    if (percent % 10 === 0) {
      return `${percent}% = ${percent / 10} × 10%\n10% of ${base} = ${base / 10}\n${base / 10} × ${percent / 10} = ${(base / 10) * (percent / 10)}`;
    }
    
    return `${percent}% = ${percent / 100}\n${base} × ${percent / 100} = ${(percent / 100) * base}`;
  };

  const handleComplete = (avgAccuracy: number) => {
    if (avgAccuracy > 0.85 && difficulty < 3) {
      setDifficulty(d => d + 1);
    }
  };

  return (
    <PracticeSession
      mode="percents"
      title="Percents"
      onBack={onBack}
      generateQuestion={() => {
        const q = generateQuestion();
        setQuestion(q);
        return {
          display: q.display,
          correctValue: q.answer,
          hint: getHint(),
        };
      }}
      checkAnswer={checkAnswer}
      onSessionComplete={handleComplete}
      showHintToggle={true}
      hintEnabled={false}
      onToggleHint={() => {}}
      hintToggleLabel="Show hint"
    />
  );
}
