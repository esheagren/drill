"use client";

import { useEffect, useState } from "react";
import { getAttemptsByMode, getSessionsByMode, type PracticeMode } from "@/lib/progress";

export default function Progress({ onBack }: { onBack: () => void }) {
  const [selectedMode, setSelectedMode] = useState<PracticeMode | "all">("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  const modes: Array<{ key: PracticeMode | "all"; label: string }> = [
    { key: "all", label: "All" },
    { key: "big-numbers", label: "Big Numbers" },
    { key: "estimation", label: "Estimation" },
    { key: "percents", label: "Percents" },
  ];

  const getStats = (mode: PracticeMode | "all") => {
    if (mode === "all") {
      const allModes: PracticeMode[] = ["big-numbers", "estimation", "percents"];
      const allAttempts = allModes.flatMap(m => getAttemptsByMode(m));
      const allSessions = allModes.flatMap(m => getSessionsByMode(m));
      
      return {
        totalAttempts: allAttempts.length,
        totalSessions: allSessions.length,
        averageAccuracy:
          allAttempts.length > 0
            ? allAttempts.reduce((sum, a) => sum + a.accuracy, 0) / allAttempts.length
            : 0,
        averageTime:
          allAttempts.length > 0
            ? allAttempts.reduce((sum, a) => sum + a.latencyMs, 0) / allAttempts.length
            : 0,
      };
    }

    const attempts = getAttemptsByMode(mode);
    const sessions = getSessionsByMode(mode);

    return {
      totalAttempts: attempts.length,
      totalSessions: sessions.length,
      averageAccuracy:
        attempts.length > 0
          ? attempts.reduce((sum, a) => sum + a.accuracy, 0) / attempts.length
          : 0,
      averageTime:
        attempts.length > 0
          ? attempts.reduce((sum, a) => sum + a.latencyMs, 0) / attempts.length
          : 0,
    };
  };

  const getRecentSessions = (mode: PracticeMode | "all") => {
    if (mode === "all") {
      const allModes: PracticeMode[] = ["big-numbers", "estimation", "percents"];
      return allModes
        .flatMap(m => getSessionsByMode(m))
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10);
    }
    return getSessionsByMode(mode).sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
  };

  const stats = getStats(selectedMode);
  const recentSessions = getRecentSessions(selectedMode);

  return (
    <div className="min-h-screen flex flex-col p-4 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={onBack}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        >
          ← Back
        </button>
      </div>

      <div className="max-w-md mx-auto w-full space-y-6">
        <h2 className="text-3xl font-light text-center text-gray-900 dark:text-gray-100">
          Progress
        </h2>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {modes.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSelectedMode(key)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                selectedMode === key
                  ? "bg-blue-600 dark:bg-blue-500 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <StatCard
            label="Sessions"
            value={stats.totalSessions.toString()}
          />
          <StatCard
            label="Questions"
            value={stats.totalAttempts.toString()}
          />
          <StatCard
            label="Accuracy"
            value={`${(stats.averageAccuracy * 100).toFixed(0)}%`}
          />
          <StatCard
            label="Avg Time"
            value={`${(stats.averageTime / 1000).toFixed(1)}s`}
          />
        </div>

        {recentSessions.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Recent Sessions
            </h3>
            <div className="space-y-3">
              {recentSessions.map((session, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                >
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {session.mode === "big-numbers"
                        ? "Big Numbers"
                        : session.mode === "estimation"
                        ? "Estimation"
                        : "Percents"}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {new Date(session.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {session.correctCount}/{session.totalCount}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {(session.medianTimeMs / 1000).toFixed(1)}s
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No practice sessions yet. Complete a round to see your progress.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
      <div className="text-2xl font-light text-gray-900 dark:text-gray-100">
        {value}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
    </div>
  );
}
