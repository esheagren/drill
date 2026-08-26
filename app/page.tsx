"use client";

import { useState } from "react";
import BigNumbers from "@/components/BigNumbers";
import Estimation from "@/components/Estimation";
import Percents from "@/components/Percents";
import Progress from "@/components/Progress";

type Mode = "home" | "big-numbers" | "estimation" | "percents" | "progress";

export default function Home() {
  const [mode, setMode] = useState<Mode>("home");

  if (mode === "big-numbers") {
    return <BigNumbers onBack={() => setMode("home")} />;
  }

  if (mode === "estimation") {
    return <Estimation onBack={() => setMode("home")} />;
  }

  if (mode === "percents") {
    return <Percents onBack={() => setMode("home")} />;
  }

  if (mode === "progress") {
    return <Progress onBack={() => setMode("home")} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <main className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-light tracking-tight text-gray-900 dark:text-gray-100">
            Magnitude
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Mental arithmetic practice
          </p>
        </div>

        <div className="space-y-3">
          <ModeButton
            onClick={() => setMode("big-numbers")}
            title="Big Numbers"
            description="Multiply and divide large quantities"
          />
          <ModeButton
            onClick={() => setMode("estimation")}
            title="Estimation"
            description="Order-of-magnitude arithmetic"
          />
          <ModeButton
            onClick={() => setMode("percents")}
            title="Percents"
            description="Fast percentage calculations"
          />
        </div>

        <button
          onClick={() => setMode("progress")}
          className="w-full py-3 px-6 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          View Progress
        </button>
      </main>
    </div>
  );
}

function ModeButton({
  onClick,
  title,
  description,
}: {
  onClick: () => void;
  title: string;
  description: string;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow text-left border border-gray-200 dark:border-gray-700 active:scale-[0.98] transition-transform"
    >
      <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-1">
        {title}
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </button>
  );
}
