"use client";

import { useState, useEffect } from "react";
import { PracticeSession } from "./PracticeSession";
import { parseNumberInput, formatScientific, toScientific } from "@/lib/utils";

interface Question {
  num1: number;
  num2: number;
  operation: "×" | "÷";
  answer: number;
  display: string;
}

export default function BigNumbers({ onBack }: { onBack: () => void }) {
  const [difficulty, setDifficulty] = useState(1);
  const [showHint, setShowHint] = useState(true);

  const generateQuestion = (): Question => {
    const magnitudes = [1e3, 1e6, 1e9, 1e12];
    const maxMag = Math.min(difficulty, magnitudes.length - 1);
    
    const mag1 = magnitudes[Math.floor(Math.random() * (maxMag + 1))];
    const mag2 = magnitudes[Math.floor(Math.random() * (maxMag + 1))];
    
    const num1 = Math.floor(Math.random() * 9 + 1) * mag1;
    const num2 = Math.floor(Math.random() * 90 + 10);
    
    const operation = Math.random() > 0.5 ? "×" : "÷";
    const answer = operation === "×" ? num1 * num2 : num1 / num2;
    
    const formats = [
      (n: number) => n.toLocaleString(),
      (n: number) => {
        if (n >= 1e12) return `${n / 1e12} trillion`;
        if (n >= 1e9) return `${n / 1e9} billion`;
        if (n >= 1e6) return `${n / 1e6} million`;
        if (n >= 1e3) return `${n / 1e3} thousand`;
        return n.toString();
      },
    ];
    
    const format = formats[Math.floor(Math.random() * formats.length)];
    const display = `${format(num1)} ${operation} ${num2}`;
    
    return { num1, num2, operation, answer, display };
  };

  const [question, setQuestion] = useState<Question>(generateQuestion);

  const checkAnswer = (userInput: string): { correct: boolean; userValue: number } => {
    const userValue = parseNumberInput(userInput);
    if (userValue === null) return { correct: false, userValue: 0 };
    
    const tolerance = question.answer * 0.05;
    const correct = Math.abs(userValue - question.answer) <= tolerance;
    
    return { correct, userValue };
  };

  const getHint = (): string | null => {
    if (!showHint) return null;
    
    const sci1 = toScientific(question.num1);
    const sci2 = toScientific(question.num2);
    
    if (question.operation === "×") {
      const coeff = sci1.coefficient * sci2.coefficient;
      const exp = sci1.exponent + sci2.exponent;
      return `${formatScientific(question.num1)} × ${formatScientific(question.num2)}\n≈ ${coeff.toFixed(1)} × 10^${exp}`;
    } else {
      const coeff = sci1.coefficient / sci2.coefficient;
      const exp = sci1.exponent - sci2.exponent;
      return `${formatScientific(question.num1)} ÷ ${formatScientific(question.num2)}\n≈ ${coeff.toFixed(1)} × 10^${exp}`;
    }
  };

  const handleComplete = (avgAccuracy: number) => {
    if (avgAccuracy > 0.8 && difficulty < 3) {
      setDifficulty(d => d + 1);
    }
  };

  return (
    <PracticeSession
      mode="big-numbers"
      title="Big Numbers"
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
      hintEnabled={showHint}
      onToggleHint={() => setShowHint(!showHint)}
    />
  );
}
