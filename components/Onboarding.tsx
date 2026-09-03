"use client";

import { useState } from "react";
import { setUsername, signIn } from "@/lib/account";

/** First entry: pick a name, or sign in to an account made on another device. */
export default function Onboarding({ onDone, initialMode = "name" }: { onDone: (username: string) => void; initialMode?: "name" | "signin" }) {
  const [mode, setMode] = useState<"name" | "signin">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const field = "w-full h-12 px-4 rounded-xl bg-transparent border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:border-gray-900 dark:focus:border-gray-100";
  const primary = "w-full h-12 rounded-xl bg-gray-900 text-white dark:bg-gray-100 dark:text-black disabled:opacity-20 active:scale-[0.98] transition";

  const submitName = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(null); setBusy(true);
    const j = await setUsername(name);
    setBusy(false);
    if (j.ok) onDone(j.username as string); else setErr(j.error ?? "try again");
  };
  const submitSignIn = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(null); setBusy(true);
    const j = await signIn(email, password);
    setBusy(false);
    if (!j.ok) setErr(j.error ?? "try again");
  };

  return (
    <div className="fixed inset-0 z-30 bg-white dark:bg-black text-gray-900 dark:text-gray-100 flex items-center justify-center px-6">
      <div data-c="OnboardingForm" className="w-full max-w-xs space-y-6">
        <div className="text-center">
          <div className="text-3xl font-light tracking-tight">Drill</div>
          <div className="text-sm text-gray-400 mt-1">{mode === "name" ? "What should we call you?" : "Sign in to your account"}</div>
        </div>

        {mode === "name" ? (
          <form onSubmit={submitName} className="space-y-3">
            <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="your name" maxLength={32} autoComplete="nickname" className={field} />
            <button type="submit" disabled={!name.trim() || busy} className={primary}>Start</button>
            {err && <p className="text-xs text-rose-500 text-center">{err}</p>}
            <button type="button" onClick={() => { setMode("signin"); setErr(null); }} className="w-full text-xs text-gray-400 pt-2">
              Already have an account on another device? Sign in
            </button>
          </form>
        ) : (
          <form onSubmit={submitSignIn} className="space-y-3">
            <input autoFocus type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" autoComplete="email" className={field} />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" autoComplete="current-password" className={field} />
            <button type="submit" disabled={!email || !password || busy} className={primary}>Sign in</button>
            {err && <p className="text-xs text-rose-500 text-center">{err}</p>}
            <button type="button" onClick={() => { setMode("name"); setErr(null); }} className="w-full text-xs text-gray-400 pt-2">New here? Pick a name instead</button>
          </form>
        )}
      </div>
    </div>
  );
}
