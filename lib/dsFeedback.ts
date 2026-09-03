/** Turn saved notes into one paste-ready block for the terminal. */
export interface NoteRow { page: string; text: string; updated_at?: string }

export function formatFeedback(rows: NoteRow[], scope: string): string {
  const live = rows.filter((r) => r.text.trim());
  const head = `Drill design feedback · ${scope} · ${new Date().toISOString().slice(0, 10)}`;
  if (!live.length) return `${head}\n(no notes)`;
  // Order: screens first by number, then their components; non-screen pages last.
  const key = (p: string) => { const m = p.match(/^V(\d+)([a-z]?)(?: › (.+))?$/); return m ? [0, +m[1], m[2] || "", m[3] || ""] : [1, 0, "", p]; };
  live.sort((a, b) => { const x = key(a.page), y = key(b.page); for (let i = 0; i < 4; i++) { if (x[i] < y[i]) return -1; if (x[i] > y[i]) return 1; } return 0; });
  return `${head}\n\n` + live.map((r) => `## ${r.page}\n${r.text.trim()}`).join("\n\n");
}

export async function copyText(text: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
}
