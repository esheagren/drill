export const SECTIONS = [
  { name: "Review", href: "/designspace", links: [["/designspace", "Overview"], ["/designspace/screens", "Product screens"], ["/designspace/todo", "Tasks"]] },
  { name: "Explore", href: "/designspace/explore", links: [["/designspace/explore", "Design questions"], ["/designspace/decisions", "Screen options"], ["/designspace/workbench", "Explanations"], ["/designspace/ideas", "Sketches"]] },
  { name: "Reference", href: "/designspace/reference", links: [["/designspace/reference", "Overview"], ["/designspace/framing", "Product brief"], ["/designspace/principles", "Principles"], ["/designspace/problems", "Problems"], ["/designspace/widgets", "Representations"]] },
] as const;
export function sectionFor(path: string) {
  return SECTIONS.find(s=>s.links.some(([href])=>href===path)) ?? SECTIONS[0];
}
export const QUESTIONS = [
  { id: "session", title: "How should a session work?", detail: "The program, the opening problem, and when a miss returns.", review: "/designspace/screens#V1", explore: "/designspace/decisions#D-timer", reference: "/designspace/framing", terms: /program|blocks|split, time|first item|missed question|right gap/i },
  { id: "feedback", title: "What should happen after an answer?", detail: "An explanation that makes the mathematical move clear, with little effort.", review: "/designspace/screens#V2", explore: "/designspace/workbench", reference: "/designspace/widgets", terms: /miss screen|widgets|tutor sentences|fractions|W-bar|W-line/i },
  { id: "progress", title: "How should progress feel?", detail: "A useful training log, a clear summary, and an obvious next action.", review: "/designspace/screens#V4", explore: "/designspace/decisions#D-summary", reference: "/designspace/framing", terms: /summary|progression/i },
];
