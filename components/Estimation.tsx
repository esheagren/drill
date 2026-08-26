"use client";

import { useState } from "react";
import { PracticeSession } from "./PracticeSession";
import { parseNumberInput, calculateMagnitudeError, formatScientific, toScientific } from "@/lib/utils";

interface Question {
  num1: number;
  num2: number;
  operation: "×" | "÷";
  answer: number;
  display: string;
}

export default function Estimation({ onBack }: { onBack: () => void }) {
  const [difficulty, setDifficulty] = useState(1);
  const [showSteps, setShowSteps] = useState(true);

  const generateQuestion = (): Question => {
    const range = difficulty === 1 ? [10, 100] : difficulty === 2 ? [10, 1000] : [10, 10000];
    
    const num1 = Math.floor(Math.random() * (range[1] - range[0]) + range[0]);
    const num2 = Math.floor(Math.random() * (range[1] - range[0]) + range[0]);
    const operation = Math.random() > 0.5 ? "×" : "÷";
    const answer = operation === "×" ? num1 * num2 : num1 / num2;
    
    const display = `${num1} ${operation} ${num2}`;
    
    return { num1, num2, operation, answer, display };
  };

  const [question, setQuestion] = useState<Question>(generateQuestion);

  const checkAnswer = (userInput: string): { correct: boolean; userValue: number; magnitudeError?: number } => {
    const userValue = parseNumberInput(userInput);
    if (userValue === null) return { correct: false, userValue: 0 };
    
    const magError = calculateMagnitudeError(userValue, question.answer);
    const correct = magError < 0.5;
    
    return { correct, userValue, magnitudeError: magError };
  };

  const getHint = (): string | null => {
    if (!showSteps) return null;
    
    const sci1 = toScientific(question.num1);
    const sci2 = toScientific(question.num2);
    
    if (question.operation === "×") {
      const coeff = sci1.coefficient * sci2.coefficient;
      const exp = sci1.exponent + sci2.exponent;
      
      let adjustedCoeff = coeff;
      let adjustedExp = exp;
      
      if (coeff >= 10) {
        const adjustment = Math.floor(Math.log10(coeff));
        adjustedCoeff = coeff / Math.pow(10, adjustment);
        adjustedExp = exp + adjustment;
      }
      
      return `Step 1: Convert to scientific notation
${question.num1} → ${sci1.coefficient.toFixed(1)} × 10^${sci1.exponent}
${question.num2} → ${sci2.coefficient.toFixed(1)} × 10^${sci2.exponent}

Step 2: Multiply coefficients and add exponents
${sci1.coefficient.toFixed(1)} × ${sci2.coefficient.toFixed(1)} ≈ ${coeff.toFixed(1)}
10^${sci1.exponent} × 10^${sci2.exponent} = 10^${exp}

Step 3: Result
≈ ${adjustedCoeff.toFixed(1)} × 10^${adjustedExp}`;
    } else {
      const coeff = sci1.coefficient / sci2.coefficient;
      const exp = sci1.exponent - sci2.exponent;
      
      return `Step 1: Convert to scientific notation
${question.num1} → ${sci1.coefficient.toFixed(1)} × 10^${sci1.exponent}
${question.num2} → ${sci2.coefficient.toFixed(1)} × 10^${sci2.exponent}

Step 2: Divide coefficients and subtract exponents
${sci1.coefficient.toFixed(1)} ÷ ${sci2.coefficient.toFixed(1)} ≈ ${coeff.toFixed(1)}
10^${sci1.exponent} ÷ 10^${sci2.exponent} = 10^${exp}

Step 3: Result
≈ ${coeff.toFixed(1)} × 10^${exp}`;
    }
  };

  const handleComplete = (avgAccuracy: number) => {
    if (avgAccuracy > 0.8 && difficulty < 3) {
      setDifficulty(d => d + 1);
    }
  };

  return (
    <PracticeSession
      mode="estimation"
      title="Estimation"
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
      hintEnabled={showSteps}
      onToggleHint={() => setShowSteps(!showSteps)}
      hintToggleLabel={showSteps ? "Hide steps" : "Show steps"}
    />
  );
}
