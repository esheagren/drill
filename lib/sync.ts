/**
 * Outbox sync: every attempt/session is queued in localStorage and flushed to
 * the API in the background. Idempotent via clientId, so retries are safe and
 * the app works fully offline — local state is always the source of truth for
 * the UI; the database is for analytics.
 */
import { getUserToken, scopedKey } from "./user";

const A_KEY = () => scopedKey("outbox:attempts");
const S_KEY = () => scopedKey("outbox:sessions");

const cid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

function read<T>(k: string): T[] { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : []; } catch { return []; } }
function write<T>(k: string, v: T[]) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } }

export function queueAttempt(a: object) { if (typeof window === "undefined") return; write(A_KEY(), [...read<object>(A_KEY()), { ...a, clientId: cid() }]); }
export function queueSession(s: object) { if (typeof window === "undefined") return; write(S_KEY(), [...read<object>(S_KEY()), { ...s, clientId: cid() }]); }

let inflight = false;
export async function flush(): Promise<void> {
  if (typeof window === "undefined" || inflight || !navigator.onLine) return;
  inflight = true;
  try {
    const user = getUserToken();
    const attempts = read<{ clientId: string }>(A_KEY());
    if (attempts.length) {
      const res = await fetch("/api/attempts", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ user, attempts }), keepalive: true });
      if (res.ok) { const sent = new Set(attempts.map((a) => a.clientId)); write(A_KEY(), read<{ clientId: string }>(A_KEY()).filter((a) => !sent.has(a.clientId))); }
    }
    const sessions = read<{ clientId: string }>(S_KEY());
    if (sessions.length) {
      const res = await fetch("/api/sessions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ user, sessions }), keepalive: true });
      if (res.ok) { const sent = new Set(sessions.map((s) => s.clientId)); write(S_KEY(), read<{ clientId: string }>(S_KEY()).filter((s) => !sent.has(s.clientId))); }
    }
  } catch { /* stay queued */ } finally { inflight = false; }
}
