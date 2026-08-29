/** Client-side account calls. All return { ok, error? } and never throw. */
import { adoptIdentity, getUserToken, loadProfile, saveProfile, type Profile } from "./user";

const post = async (url: string, body: object) => {
  try {
    const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    return (await r.json()) as { ok: boolean; error?: string; [k: string]: unknown };
  } catch { return { ok: false, error: "couldn't reach the server" }; }
};

/** Local first; falls back to the server (fresh install with a known token). */
export async function getProfile(): Promise<Profile> {
  const local = loadProfile();
  if (local?.username) return local;
  try {
    const r = await fetch(`/api/account?user=${encodeURIComponent(getUserToken())}`);
    const j = await r.json();
    const p: Profile = { username: j.username ?? null, email: j.email ?? null };
    if (p.username) saveProfile(p);
    return p;
  } catch { return local ?? { username: null, email: null }; }
}

export async function setUsername(username: string) {
  const j = await post("/api/account", { user: getUserToken(), username });
  if (j.ok) saveProfile({ ...(loadProfile() ?? { username: null, email: null }), username: j.username as string });
  return j;
}

export async function connectEmail(email: string, password: string) {
  const j = await post("/api/account", { user: getUserToken(), email, password });
  if (j.ok) saveProfile({ ...(loadProfile() ?? { username: null, email: null }), email: j.email as string });
  return j;
}

/** Sign in on this device; on success the page reloads under the account's identity. */
export async function signIn(email: string, password: string) {
  const j = await post("/api/login", { email, password, from: getUserToken() });
  if (j.ok) {
    adoptIdentity(j.user as string);
    saveProfile({ username: (j.username as string) ?? null, email });
    location.reload();
  }
  return j;
}
