"use client";

import { useState } from "react";

export default function DsLogin() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const go = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(false);
    const r = await fetch("/api/designspace/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password: pw }) });
    if (r.ok) window.location.href = new URLSearchParams(window.location.search).get("next") || "/designspace";
    else setErr(true);
  };
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <form onSubmit={go} className="w-full max-w-xs space-y-3">
        <div className="text-lg font-light">designspace</div>
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="password" autoFocus className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent outline-none focus:border-gray-900 dark:focus:border-gray-100" />
        <button className="w-full h-11 rounded-xl bg-gray-900 text-white dark:bg-gray-100 dark:text-black">Enter</button>
        {err && <p className="text-xs text-rose-500">That isn&apos;t it.</p>}
      </form>
    </div>
  );
}
