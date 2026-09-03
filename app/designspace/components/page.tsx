"use client";

/**
 * Components — real screens, annotated. Each frame is the live app at a phone
 * viewport; after it renders, elements tagged data-c="Name" are measured inside
 * the frame and numbered callouts are drawn over them. Nothing here is a mock,
 * so the annotations follow the design as it changes.
 */
import { useEffect, useRef, useState } from "react";
import DsNotes from "@/components/DsNotes";

const FILES: Record<string, string> = {
  Timer: "Trainer.tsx", MenuButton: "Trainer.tsx", Prompt: "Trainer.tsx", AnswerLine: "Trainer.tsx", Keypad: "Keypad.tsx",
  AnswerReveal: "Trainer.tsx", PlayWithIt: "Trainer.tsx · lib/widgetSeed.ts", AreaModel: "widgets.tsx", MultiplierChain: "widgets.tsx", LogLine: "widgets.tsx",
  TechniqueCard: "Trainer.tsx · lib/tips.ts", NextBar: "Trainer.tsx", SummaryCount: "Trainer.tsx", SkillTally: "Trainer.tsx", AgainRow: "Trainer.tsx", Sheet: "Trainer.tsx",
  OverlayNav: "Stats.tsx", StackedBars: "Stats.tsx", UnitTree: "Stats.tsx", MasteryDots: "Stats.tsx", ItemMap: "Stats.tsx · lib/maps.ts", AccountForm: "Account.tsx", OnboardingForm: "Onboarding.tsx",
};

const SCREENS: { id: string; title: string; src: string; scroll?: number; wait?: number }[] = [
  { id: "V1", title: "Practice", src: "/" },
  { id: "V2", title: "Feedback · miss (area model)", src: "/?demo=wrong&skill=ar.split", wait: 1500 },
  { id: "V2b", title: "Feedback · miss (multiplier chain)", src: "/?demo=wrong&skill=pct.apply", scroll: 260, wait: 1500 },
  { id: "V2c", title: "Feedback · miss (log line)", src: "/?demo=wrong&skill=mag.mul", scroll: 260, wait: 1500 },
  { id: "V4", title: "Session summary", src: "/?demo=summary" },
  { id: "V5", title: "Session length sheet", src: "/?demo=timer" },
  { id: "V7", title: "Onboarding", src: "/?demo=onboarding" },
  { id: "V9", title: "Overlay · History", src: "/?demo=history", wait: 1500 },
  { id: "V10", title: "Overlay · Unit (tree)", src: "/?demo=unit", wait: 1800 },
  { id: "V10b", title: "Overlay · Unit (map)", src: "/?demo=unit", scroll: 700, wait: 2500 },
  { id: "V11", title: "Overlay · Profile", src: "/?demo=profile", scroll: 200, wait: 1500 },
];

const W = 390, H = 844;

export default function Components() {
  return (
    <div>
      <h1 className="text-2xl font-light tracking-tight">Components</h1>
      <p className="text-sm text-gray-500 mt-1 mb-8 max-w-prose">Real screens, annotated. Callouts are measured from the live app, so they stay right as the design moves. The names are the vocabulary.</p>
      <div className="grid md:grid-cols-2 gap-x-10 gap-y-12">
        {SCREENS.map((s) => <Annotated key={s.id} {...s} />)}
      </div>
      <DsNotes page="components" />
    </div>
  );
}

interface Box { name: string; x: number; y: number; w: number; h: number }

function Annotated({ id, title, src, scroll = 0, wait = 900 }: { id: string; title: string; src: string; scroll?: number; wait?: number }) {
  const wrap = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [k, setK] = useState(0.5);
  const [boxes, setBoxes] = useState<Box[]>([]);

  useEffect(() => {
    const el = wrap.current; if (!el) return;
    const ro = new ResizeObserver(() => setK(el.clientWidth / W)); ro.observe(el); setK(el.clientWidth / W);
    return () => ro.disconnect();
  }, []);

  const measure = () => {
    const f = frame.current; const doc = f?.contentDocument; const win = f?.contentWindow; if (!doc || !win) return;
    if (scroll) { const m = doc.querySelector("main"); (m && m.scrollHeight > m.clientHeight ? m : win).scrollTo(0, scroll); }
    setTimeout(() => {
      const out: Box[] = [];
      doc.querySelectorAll<HTMLElement>("[data-c]").forEach((e) => {
        const r = e.getBoundingClientRect();
        if (r.width < 4 || r.height < 4 || r.bottom < 0 || r.top > H) return;
        out.push({ name: e.dataset.c!, x: r.left, y: Math.max(0, r.top), w: r.width, h: Math.min(r.height, H - Math.max(0, r.top)) });
      });
      // de-dupe by name (nested widgets appear once), keep top-most first
      const seen = new Set<string>();
      setBoxes(out.sort((a, b) => a.y - b.y).filter((b) => (seen.has(b.name) ? false : (seen.add(b.name), true))));
    }, 150);
  };

  return (
    <figure>
      <figcaption className="mb-2 text-sm"><span className="text-gray-400 tabular-nums mr-1.5">{id}</span>{title}</figcaption>
      <div ref={wrap} className="w-full rounded-[22px] border border-gray-300 dark:border-gray-700 overflow-hidden bg-black relative" style={{ height: H * k }}>
        <div style={{ width: W, height: H, transform: `scale(${k})`, transformOrigin: "top left" }}>
          <iframe ref={frame} src={src} title={`${id} ${title}`} width={W} height={H} style={{ border: 0, display: "block", background: "black" }} onLoad={() => setTimeout(measure, wait)} />
          <div className="absolute inset-0 pointer-events-none">
            {boxes.map((b, i) => (
              <div key={b.name}>
                <div className="absolute rounded-md" style={{ left: b.x, top: b.y, width: b.w, height: b.h, outline: "2px solid #f59e0b", outlineOffset: 2 }} />
                <div className="absolute w-6 h-6 rounded-full bg-amber-500 text-black text-[13px] font-semibold flex items-center justify-center" style={{ left: b.x + b.w - 12, top: b.y - 12 }}>{i + 1}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <ol className="mt-2 text-[12px] space-y-0.5">
        {boxes.length === 0 && <li className="text-gray-400">measuring…</li>}
        {boxes.map((b, i) => (
          <li key={b.name} className="flex gap-2"><span className="w-5 h-5 rounded-full bg-amber-500 text-black text-[11px] font-semibold flex items-center justify-center shrink-0">{i + 1}</span><span>{b.name}</span><span className="text-gray-400 font-mono text-[11px]">{FILES[b.name] ?? ""}</span></li>
        ))}
      </ol>
    </figure>
  );
}
