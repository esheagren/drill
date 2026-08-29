"use client";

import { useState } from "react";
import { connectEmail, setUsername, signIn } from "@/lib/account";
import type { Profile } from "@/lib/user";

/** Account section of the Days & skills screen. */
export default function Account({ profile, onChange }: { profile: Profile; onChange: (p: Profile) => void }) {
  const [name, setName] = useState(profile.username ?? "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [mode, setMode] = useState<"connect" | "signin">("connect");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const field = "flex-1 min-w-0 h-10 px-3 rounded-xl bg-transparent border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:border-gray-900 dark:focus:border-gray-100";
  const btn = "h-10 px-4 rounded-xl bg-gray-900 text-white dark:bg-gray-100 dark:text-black disabled:opacity-20 shrink-0";

  const saveName = async () => {
    setBusy(true); const j = await setUsername(name); setBusy(false);
    setMsg(j.ok ? { ok: true, text: "saved" } : { ok: false, text: j.error ?? "try again" });
    if (j.ok) onChange({ ...profile, username: j.username as string });
  };
  const doConnect = async () => {
    setBusy(true); const j = await connectEmail(email, password); setBusy(false);
    setMsg(j.ok ? { ok: true, text: "connected — sign in with this on any device" } : { ok: false, text: j.error ?? "try again" });
    if (j.ok) { onChange({ ...profile, email: j.email as string }); setPassword(""); setConfirm(""); }
  };
  const doSignIn = async () => {
    setBusy(true); const j = await signIn(email, password); setBusy(false);
    if (!j.ok) setMsg({ ok: false, text: j.error ?? "try again" });
  };

  return (
    <section className="mt-8 text-sm text-gray-500 space-y-5">
      <h2 className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">Account</h2>

      <div className="space-y-1">
        <div className="text-xs">Name</div>
        <div className="flex gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={32} className={field} />
          <button onClick={saveName} disabled={busy || !name.trim() || name.trim() === profile.username} className={btn}>save</button>
        </div>
      </div>

      {profile.email ? (
        <div className="space-y-1">
          <div className="text-xs">Email</div>
          <div className="text-gray-900 dark:text-gray-100">{profile.email}</div>
          <p className="text-xs">Sign in with this email on any other device to continue the same history there.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-4 text-xs">
            <button onClick={() => { setMode("connect"); setMsg(null); }} className={mode === "connect" ? "text-gray-900 dark:text-gray-100 underline" : ""}>Connect an email</button>
            <button onClick={() => { setMode("signin"); setMsg(null); }} className={mode === "signin" ? "text-gray-900 dark:text-gray-100 underline" : ""}>Sign in to an existing account</button>
          </div>
          <p className="text-xs">
            {mode === "connect"
              ? "Attach an email and password to this history so you can sign in on other devices."
              : "Made an account on another device? Sign in here — anything done on this device is merged in."}
          </p>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" autoComplete="email" className={`${field} w-full`} />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === "connect" ? "choose a password (8+)" : "password"} autoComplete={mode === "connect" ? "new-password" : "current-password"} className={`${field} w-full`} />
          {mode === "connect" && (
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="confirm password" autoComplete="new-password" className={`${field} w-full ${confirm && confirm !== password ? "border-rose-400" : ""}`} />
          )}
          {mode === "connect" && confirm && confirm !== password && <p className="text-xs text-rose-500">passwords do not match</p>}
          <button
            onClick={mode === "connect" ? doConnect : doSignIn}
            disabled={busy || !email || (mode === "connect" ? password.length < 8 || confirm !== password : password.length < 1)}
            className={`${btn} w-full`}
          >
            {mode === "connect" ? "connect" : "sign in"}
          </button>
        </div>
      )}

      {msg && <p className={`text-xs ${msg.ok ? "text-emerald-600" : "text-rose-500"}`}>{msg.text}</p>}
    </section>
  );
}
