"use client";

import { useState, useEffect, useRef } from "react";
import { saveAttempt, saveSession, type PracticeMode, type Attempt, calculateMedian } from "@/lib/progress";
import { formatNumber } from "@/lib/utils";

interface Question {
  display: string;
  correctValue: number;
  hint: string | null;
}

interface CheckResult {
  correct: boolean;
  userValue: number;
  magnitudeError?: number;
}

interface Props {
  mode: PracticeMode;
  title: string;
  onBack: () => void;
  generateQuestion: () => Question;
  checkAnswer: (userInput: string) => CheckResult;
  onSessionComplete?: (avgAccuracy: number) => void;
  showHintToggle?: boolean;
  hintEnabled?: boolean;
  onToggleHint?: () => void;
  hintToggleLabel?: string;
}

const QUESTIONS_PER_ROUND = 10;

export function PracticeSession({
  mode,
  title,
  onBack,
  generateQuestion,
  checkAnswer,
  onSessionComplete,
  showHintToggle = false,
  hintEnabled = false,
  onToggleHint,
  hintToggleLabel = "Show hints",
}: Props) {
  const [questionNum, setQuestionNum] = useState(1);
  const [question, setQuestion] = useState<Question>(generateQuestion);
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [sessionComplete, setSessionComplete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [question]);

  const nextQuestion = () => {
    if (questionNum >= QUESTIONS_PER_ROUND) {
      finishSession();
      return;
    }
    
    setQuestionNum(questionNum + 1);
    setQuestion(generateQuestion());
    setUserInput("");
    setFeedback(null);
    setIsCorrect(null);
    setStartTime(Date.now());
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userInput.trim() || isCorrect !== null) return;
    
    const latencyMs = Date.now() - startTime;
    const result = checkAnswer(userInput);
    
    const accuracy = result.correct ? 1 : 0;
    
    const attempt: Attempt = {
      mode,
      prompt: question.display,
      userAnswer: userInput,
      correctValue: question.correctValue,
      latencyMs,
      accuracy,
      magnitudeError: result.magnitudeError,
      timestamp: Date.now(),
    };
    
    saveAttempt(attempt);
    setAttempts([...attempts, attempt]);
    
    setIsCorrect(result.correct);
    
    if (result.correct) {
      setFeedback("Correct!");
    } else {
      const errorInfo = result.magnitudeError !== undefined
        ? ` (magnitude error: ${result.magnitudeError.toFixed(2)})`
        : "";
      setFeedback(`Answer: ${formatNumber(question.correctValue)}${errorInfo}`);
    }
  };

  const finishSession = () => {
    const correctCount = attempts.filter(a => a.accuracy === 1).length;
    const medianTimeMs = calculateMedian(attempts.map(a => a.latencyMs));
    const averageAccuracy = attempts.reduce((sum, a) => sum + a.accuracy, 0) / attempts.length;
    
    saveSession({
      mode,
      correctCount,
      totalCount: attempts.length,
      medianTimeMs,
      averageAccuracy,
      timestamp: Date.now(),
    });
    
    if (onSessionComplete) {
      onSessionComplete(averageAccuracy);
    }
    
    setSessionComplete(true);
  };

  if (sessionComplete) {
    const correctCount = attempts.filter(a => a.accuracy === 1).length;
    const medianTimeMs = calculateMedian(attempts.map(a => a.latencyMs));
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <div className="w-full max-w-md space-y-6">
          <h2 className="text-3xl font-light text-center text-gray-900 dark:text-gray-100">
            Round Complete
          </h2>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 space-y-4 border border-gray-200 dark:border-gray-700">
            <div className="text-center space-y-2">
              <div className="text-5xl font-light text-gray-900 dark:text-gray-100">
                {correctCount}/{attempts.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">correct</div>
            </div>
            
            <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-light text-gray-900 dark:text-gray-100">
                {(medianTimeMs / 1000).toFixed(1)}s
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">median time</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <button
              onClick={() => {
                setQuestionNum(1);
                setQuestion(generateQuestion());
                setUserInput("");
                setFeedback(null);
                setIsCorrect(null);
                setStartTime(Date.now());
                setAttempts([]);
                setSessionComplete(false);
              }}
              className="w-full py-3 px-6 bg-blue-600 dark:bg-blue-500 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              Practice Again
            </button>
            <button
              onClick={onBack}
              className="w-full py-3 px-6 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={onBack}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        >
          ← Back
        </button>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {questionNum} / {QUESTIONS_PER_ROUND}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full space-y-6">
        <h2 className="text-2xl font-light text-gray-900 dark:text-gray-100">
          {title}
        </h2>

        <div className="w-full bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
          <div className="text-center">
            <div className="text-3xl font-light text-gray-900 dark:text-gray-100 mb-4">
              {question.display}
            </div>
            
            {hintEnabled && question.hint && (
              <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 whitespace-pre-line text-left">
                {question.hint}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              ref={inputRef}
              type="text"
              inputMode="decimal"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={isCorrect !== null}
              placeholder="Your answer"
              className="w-full px-4 py-3 text-lg text-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />

            {feedback && (
              <div
                className={`text-center font-medium ${
                  isCorrect
                    ? "text-green-600 dark:text-green-400"
                    : "text-orange-600 dark:text-orange-400"
                }`}
              >
                {feedback}
              </div>
            )}

            {isCorrect === null ? (
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors active:scale-[0.98] font-medium"
              >
                Submit
              </button>
            ) : (
              <button
                type="button"
                onClick={nextQuestion}
                className="w-full py-3 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors active:scale-[0.98] font-medium"
              >
                Next
              </button>
            )}
          </form>
        </div>

        {showHintToggle && onToggleHint && (
          <button
            onClick={onToggleHint}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            {hintEnabled ? `Hide ${hintToggleLabel.toLowerCase()}` : hintToggleLabel}
          </button>
        )}
      </div>
    </div>
  );
}
