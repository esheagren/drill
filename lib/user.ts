/**
 * Anonymous single-user identity.
 *
 * A UUID is minted on first visit and stored in localStorage. Every piece of
 * learner state is namespaced under it, so a later sync layer can key rows by
 * this token without a login step.
 */
const TOKEN_KEY = "magnitude:user";

export function getUserToken(): string {
  if (typeof window === "undefined") return "server";
  try {
    let token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      token =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(TOKEN_KEY, token);
    }
    return token;
  } catch {
    return "anon";
  }
}

export function scopedKey(suffix: string): string {
  return `magnitude:${getUserToken()}:${suffix}`;
}
