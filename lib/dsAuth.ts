/** Designspace gate: a cookie carrying SHA-256(password + salt). Edge- and Node-safe (Web Crypto). */
export const DS_COOKIE = "ds";
export async function dsToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`${password}:drill-designspace-v1`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
