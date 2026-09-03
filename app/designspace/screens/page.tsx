"use client";

/**
 * Screens — the wall. Every view state of the app, live at a phone viewport,
 * with its components called out (left rail, sticky) and feedback pinned to
 * the screen or a component (right rail). Every name is a handle: click to copy,
 * paste into the terminal.
 */
import { useEffect, useRef, useState } from "react";
import Handle from "@/components/DsHandle";
import PinnedNotes from "@/components/DsPinnedNotes";

const FILES: Record<string, string> = {
  Timer: "Trainer.tsx", MenuButton: "Trainer.tsx", Prompt: "Trainer.tsx", AnswerLine: "Trainer.tsx", Keypad: "Keypad.tsx",
  AnswerReveal: "Trainer.tsx", PlayWithIt: "Trainer.tsx · lib/widgetSeed.ts", AreaModel: "widgets.tsx", MultiplierChain: "widgets.tsx", LogLine: "widgets.tsx",
  TechniqueCard: "Trainer.tsx · lib/tips.ts", NextBar: "Trainer.tsx", SummaryCount: "Trainer.tsx", SkillTally: "Trainer.tsx", AgainRow: "Trainer.tsx", Sheet: "Trainer.tsx",
  OverlayNav: "Stats.tsx", StackedBars: "Stats.tsx", UnitTree: "Stats.tsx", MasteryDots: "Stats.tsx", ItemMap: "Stats.tsx · lib/maps.ts", AccountForm: "Account.tsx", OnboardingForm: "Onboarding.tsx",
};

interface Screen { id: string; title: string; src: string; scroll?: number; wait?: number; note?: string }
const SCREENS: Screen[] = [
  { id: "V1", title: "Practice", src: "/", note: "The default screen." },
  { id: "V2", title: "Feedback · miss", src: "/?demo=wrong&skill=ar.split", wait: 1500, note: "Keypad gone; answer, why, widget, technique, → bar." },
  { id: "V2b", title: "Feedback · miss · percent", src: "/?demo=wrong&skill=pct.apply", scroll: 260, wait: 1500, note: "Same state, multiplier-chain widget." },
  { id: "V2c", title: "Feedback · miss · magnitude", src: "/?demo=wrong&skill=mag.mul", scroll: 260, wait: 1500, note: "Same state, log-line widget." },
  { id: "V3", title: "Feedback · slow", src: "/?demo=slow", wait: 1500, note: "Correct but over budget." },
  { id: "V4", title: "Session summary", src: "/?demo=summary" },
  { id: "V5", title: "Session length", src: "/?demo=timer" },
  { id: "V6", title: "Make it default?", src: "/?demo=default" },
  { id: "V7", title: "Onboarding · name", src: "/?demo=onboarding" },
  { id: "V8", title: "Onboarding · sign in", src: "/?demo=signin" },
  { id: "V9", title: "Overlay · History", src: "/?demo=history", wait: 1500 },
  { id: "V10", title: "Overlay · Unit", src: "/?demo=unit", wait: 1800 },
  { id: "V10b", title: "Overlay · Unit · map", src: "/?demo=unit", scroll: 700, wait: 2500 },
  { id: "V11", title: "Overlay · Profile", src: "/?demo=profile", scroll: 200, wait: 1500 },
];

const W = 390, H = 844;

export default function Screens() {
  const [active, setActive] = useState("V1");
  useEffect(() => {
    const io = new IntersectionObserver((es) => { for (const e of es) if (e.isIntersecting) setActive((e.target as HTMLElement).id); }, { rootMargin: "-40% 0px -55% 0px" });
    document.querySelectorAll("section[data-screen]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return (
    <div className="grid grid-cols-[120px_1fr] gap-8">
      <nav className="sticky top-16 self-start text-[12px] space-y-0.5 max-h-[80vh] overflow-y-auto">
        {SCREENS.map((s) => (
          <a key={s.id} href={`#${s.id}`} className={`block px-2 py-1 rounded-md ${active === s.id ? "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100" : "text-gray-500"}`}><span className="font-mono">{s.id}</span> <span className="text-gray-400">{s.title}</span></a>
        ))}
      </nav>
      <div className="space-y-20">
        {SCREENS.map((s) => <ScreenBlock key={s.id} {...s} />)}
      </div>
    </div>
  );
}

interface Box { name: string; x: number; y: number; w: number; h: number }

function ScreenBlock({ id, title, src, scroll = 0, wait = 900, note }: Screen) {
  const wrap = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [k, setK] = useState(0.8);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [hover, setHover] = useState<string | null>(null);

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
        const cx = r.left + r.width / 2, cy = Math.max(0, r.top) + Math.min(r.height, H - Math.max(0, r.top)) / 2;
        const top = doc.elementFromPoint(cx, cy);
        if (!top || !(e === top || e.contains(top))) return;
        out.push({ name: e.dataset.c!, x: r.left, y: Math.max(0, r.top), w: r.width, h: Math.min(r.height, H - Math.max(0, r.top)) });
      });
      const seen = new Set<string>();
      setBoxes(out.sort((a, b) => a.y - b.y).filter((b) => (seen.has(b.name) ? false : (seen.add(b.name), true))));
    }, 150);
  };

  return (
    <section id={id} data-screen className="scroll-mt-20">
      <div className="flex items-baseline gap-3 mb-3">
        <Handle id={id} className="text-[13px]" />
        <h2 className="text-lg font-light">{title}</h2>
        {note && <span className="text-[12px] text-gray-500">{note}</span>}
      </div>
      <div className="grid lg:grid-cols-[200px_minmax(240px,340px)_1fr] gap-6 items-start">
        <ol className="lg:sticky lg:top-16 space-y-1 text-[12px]">
          {boxes.length === 0 && <li className="text-gray-400">measuring…</li>}
          {boxes.map((b, i) => (
            <li key={b.name} onMouseEnter={() => setHover(b.name)} onMouseLeave={() => setHover(null)} className={`flex items-start gap-2 rounded-md px-1 py-0.5 -mx-1 ${hover === b.name ? "bg-amber-500/10" : ""}`}>
              <span className="w-5 h-5 rounded-full bg-amber-500 text-black text-[11px] font-semibold flex items-center justify-center shrink-0">{i + 1}</span>
              <div className="min-w-0">
                <Handle id={`${id} › ${b.name}`}>{b.name}</Handle>
                <div className="text-[10px] text-gray-400 font-mono truncate">{FILES[b.name] ?? ""}</div>
              </div>
            </li>
          ))}
        </ol>
        <div ref={wrap} className="w-full rounded-[22px] border border-gray-300 dark:border-gray-700 overflow-hidden bg-black relative" style={{ height: H * k }}>
          <div style={{ width: W, height: H, transform: `scale(${k})`, transformOrigin: "top left" }}>
            <iframe ref={frame} src={src} title={`${id} ${title}`} width={W} height={H} style={{ border: 0, display: "block", background: "black" }} onLoad={() => setTimeout(measure, wait)} />
            <div className="absolute inset-0 pointer-events-none">
              {boxes.map((b, i) => (
                <div key={b.name} style={{ opacity: hover && hover !== b.name ? 0.25 : 1 }}>
                  <div className="absolute rounded-md" style={{ left: b.x, top: b.y, width: b.w, height: b.h, outline: `${hover === b.name ? 3 : 2}px solid #f59e0b`, outlineOffset: 2 }} />
                  <div className="absolute w-6 h-6 rounded-full bg-amber-500 text-black text-[13px] font-semibold flex items-center justify-center" style={{ left: b.x + b.w - 12, top: b.y - 12 }}>{i + 1}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="lg:sticky lg:top-16">
          <div className="text-[11px] uppercase tracking-wide text-gray-400 mb-2">notes on {id}</div>
          <PinnedNotes screen={id} components={boxes.map((b) => b.name)} />
        </div>
      </div>
    </section>
  );
}
