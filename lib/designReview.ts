import type { NoteRow } from "./dsFeedback";

export interface ReviewContext { question: string; example: string; view: string; version: string; link: string }
export interface ReviewNote { schema: 1; target: string; text: string; resolved: boolean; created: string; context: ReviewContext }
export interface ImplementationDecision { schema: 1; choice: string; reason: string; context: ReviewContext; status: "chosen" | "reopened"; at: string }
export const reviewPrefix = (scope: string) => `review ${scope}/`;
export const reviewVersion = () => process.env.NEXT_PUBLIC_DESIGNSPACE_REVISION || "local working tree";
export function parseReview(row: NoteRow): (ReviewNote & { page: string }) | null {
  try {
    const n=JSON.parse(row.text);
    if(n.schema!==1 || typeof n.target!=="string" || typeof n.text!=="string" || typeof n.resolved!=="boolean" || typeof n.created!=="string" || !n.context || !["question","example","view","version","link"].every(k=>typeof n.context[k]==="string"))return null;
    return {...n,page:row.page};
  } catch {return null;}
}
export const belongsTo = (page: string, scope: string) => page===scope || page.startsWith(`${scope} › `) || page.startsWith(`${scope}/`);
export function reviewHref(link: string) {
  try {
    const u = new URL(link, "https://drill.invalid");
    return /^\/designspace(?:\/|$)/.test(u.pathname) ? u.pathname + u.search + u.hash : "/designspace";
  } catch { return "/designspace"; }
}
export function designHash(hash: string) {
  try { return decodeURIComponent(hash.replace(/^#/, "")); } catch { return ""; }
}
export function parseDecision(text: string): ImplementationDecision | null {
  try {
    const d = JSON.parse(text);
    return d?.schema === 1 && typeof d.choice === "string" && typeof d.reason === "string" &&
      (d.status === "chosen" || d.status === "reopened") && typeof d.at === "string" && d.context &&
      ["question", "example", "view", "version", "link"].every(k => typeof d.context[k] === "string") ? d : null;
  } catch { return null; }
}
export function formatDecision(d: ImplementationDecision) {
  return `${d.status}: ${d.choice}\nReason: ${d.reason}\n${d.context.example} · ${d.context.view}\nVersion: ${d.context.version}\n${d.context.link}`;
}
export function formatReviewNote(n: ReviewNote) {
  return `${n.target} · ${n.resolved?"resolved":"open"}\n${n.context.example} · ${n.context.view}\nVersion: ${n.context.version}\nQuestion: ${n.context.question}\n${n.context.link}\n${n.text}`;
}
export async function readWall(prefix: string): Promise<NoteRow[]> {
  const r=await fetch(`/api/designspace/notes?prefix=${encodeURIComponent(prefix)}`);
  if(!r.ok)throw new Error("Could not read saved feedback");
  return (await r.json()).notes ?? [];
}
export async function putWall(page: string, text: string) {
  const r=await fetch("/api/designspace/notes",{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify({page,text})});
  if(!r.ok)throw new Error("Could not save");
}
export function formatScopedReview(rows: NoteRow[], scopes: string[], context: ReviewContext, brief = "") {
  const notes=rows.filter(r=>scopes.some(s=>r.page.startsWith(reviewPrefix(s)))).map(parseReview).filter((n):n is NonNullable<typeof n>=>!!n&&!n.resolved);
  const legacy=rows.filter(r=>r.text.trim()&&scopes.some(s=>belongsTo(r.page,s)));
  const decisions=rows.filter(r=>scopes.some(s=>r.page===`decision ${s}`)).map(r=>parseDecision(r.text)).filter((d):d is ImplementationDecision=>!!d);
  return ["Drill · focused design review",`Question: ${context.question}`,`Example: ${context.example}`,`View: ${context.view}`,`Version: ${context.version}`,context.link,brief,
    "\nOpen feedback",...(notes.length?notes.map(formatReviewNote):["No open feedback."]),
    ...(legacy.length?["\nEarlier notes (retained)",...legacy.map(r=>`${r.page}\n${r.text}`)]:[]),
    ...(decisions.length?["\nImplementation decisions",...decisions.map(formatDecision)]:[]),
  ].filter(Boolean).join("\n\n");
}
export async function copyReview(scopes: string[], context: ReviewContext, brief = "") {
  const groups=await Promise.all(scopes.flatMap(s=>[readWall(s),readWall(reviewPrefix(s)),readWall(`decision ${s}`)]));
  const rows=[...new Map(groups.flat().map(r=>[r.page,r])).values()];
  await navigator.clipboard.writeText(formatScopedReview(rows,scopes,context,brief));
}
