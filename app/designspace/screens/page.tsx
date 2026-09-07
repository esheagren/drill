"use client";

/**
 * Screens — the wall. Every view state of the app, live at a phone viewport,
 * with its components called out (left rail, sticky) and feedback pinned to
 * the screen or a component (right rail). Every name is a handle: click to copy,
 * paste into the terminal.
 */
import { useEffect, useRef, useState } from "react";
import Handle from "@/components/DsHandle";
import DesignReviewPanel from "@/components/DesignReviewPanel";
import { designHash, reviewVersion } from "@/lib/designReview";

const FILES: Record<string, string> = {
  Timer: "Trainer.tsx", MenuButton: "Trainer.tsx", Prompt: "Trainer.tsx", AnswerLine: "Trainer.tsx", Keypad: "Keypad.tsx",
  AnswerReveal: "Trainer.tsx", PlayWithIt: "Trainer.tsx · lib/widgetSeed.ts", AreaModel: "widgets.tsx", MultiplierChain: "widgets.tsx", LogLine: "widgets.tsx",
  NextBar: "Trainer.tsx", SummaryCount: "Trainer.tsx", SkillTally: "Trainer.tsx", AgainRow: "Trainer.tsx", Sheet: "Trainer.tsx",
  OverlayNav: "Stats.tsx", StackedBars: "Stats.tsx", UnitTree: "Stats.tsx", MasteryDots: "Stats.tsx", ItemMap: "Stats.tsx · lib/maps.ts", AccountForm: "Account.tsx", OnboardingForm: "Onboarding.tsx",
};

interface Screen { id: string; title: string; src: string; scroll?: number; wait?: number; note?: string }
const SCREENS: Screen[] = [
  { id: "V1", title: "Practice", src: "/?demo=answer", note: "Practice preview; attempts are not recorded." },
  { id: "V2", title: "Feedback · miss", src: "/?demo=wrong&skill=ar.split", wait: 1500, note: "The explanation and its picture, with the session paused." },
  { id: "V2b", title: "Feedback · miss · percent", src: "/?demo=wrong&skill=pct.apply", scroll: 260, wait: 1500, note: "Percent explanation with step-by-step bars." },
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

const DEVICES = { phone: { w: 390, h: 844, label: "Phone" }, laptop: { w: 1440, h: 900, label: "Laptop" } } as const;
type Device = keyof typeof DEVICES;

export default function Screens() {
  const [active, setActive] = useState("V2");
  const [device, setDevice] = useState<Device>("phone");
  const [outlines, setOutlines] = useState(false);
  useEffect(() => {
    const sync = () => { const id=designHash(window.location.hash); if(SCREENS.some(s=>s.id===id))setActive(id); };
    sync(); window.addEventListener("hashchange",sync);
    try { const d=(new URLSearchParams(window.location.search).get("device") || localStorage.getItem("ds:device")) as Device; if(DEVICES[d])setDevice(d); }catch{}
    return ()=>window.removeEventListener("hashchange",sync);
  },[]);
  const screen=SCREENS.find(s=>s.id===active)!;
  return <div>
    <div className="flex flex-wrap items-center gap-4 mb-6"><h1 className="text-2xl font-light">Review the product</h1><label className="ml-auto text-xs text-gray-500">Device <select value={device} onChange={e=>{const d=e.target.value as Device;setDevice(d);try{localStorage.setItem("ds:device",d);}catch{}}} className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg p-2 ml-2"><option value="phone">Phone</option><option value="laptop">Laptop</option></select></label><label className="text-xs text-gray-500"><input type="checkbox" checked={outlines} onChange={e=>setOutlines(e.target.checked)} className="mr-2"/>Component outlines</label></div>
    <div className="grid lg:grid-cols-[180px_minmax(0,1fr)] gap-6">
      <nav aria-label="Product screens" className="lg:sticky lg:top-20 self-start flex lg:block flex-wrap gap-1 text-xs">{SCREENS.map(s=><a key={s.id} href={`#${s.id}`} onClick={()=>setActive(s.id)} aria-current={active===s.id?"page":undefined} className={`block rounded-lg px-3 py-2 ${active===s.id?"bg-gray-100 dark:bg-gray-900":"text-gray-500"}`}>{s.title}</a>)}</nav>
      <ScreenBlock key={`${active}-${device}`} {...screen} W={DEVICES[device].w} H={DEVICES[device].h} outlines={outlines}/>
    </div>
  </div>;
}

interface Box { name: string; x: number; y: number; w: number; h: number }

function ComponentRail({ boxes, id, hover, setHover, vertical = false }: { boxes: Box[]; id: string; hover: string | null; setHover: (v: string | null) => void; vertical?: boolean }) {
  return (
    <ol className={vertical ? "lg:sticky lg:top-16 space-y-1 text-[12px]" : "flex flex-wrap gap-x-4 gap-y-1.5 text-[12px] sticky top-11 z-[5] py-2 bg-white/90 dark:bg-black/90 backdrop-blur"}>
      {boxes.length === 0 && <li className="text-gray-400">measuring…</li>}
      {boxes.map((b, i) => (
        <li key={b.name} onMouseEnter={() => setHover(b.name)} onMouseLeave={() => setHover(null)} className={`flex items-start gap-2 rounded-md px-1 py-0.5 -mx-1 ${hover === b.name ? "bg-amber-500/10" : ""}`}>
          <span className="w-5 h-5 rounded-full bg-amber-500 text-black text-[11px] font-semibold flex items-center justify-center shrink-0">{i + 1}</span>
          <div className="min-w-0">
            <Handle id={`${id} › ${b.name}`}>{b.name}</Handle>
            {vertical && <div className="text-[10px] text-gray-400 font-mono truncate">{FILES[b.name] ?? ""}</div>}
          </div>
        </li>
      ))}
    </ol>
  );
}

function ScreenBlock({ id, title, src, scroll = 0, wait = 900, note, W, H, outlines }: Screen & { W: number; H: number; outlines: boolean }) {
  const phone = W < 600;
  const wrap = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [k, setK] = useState(0.8);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [hover, setHover] = useState<string | null>(null);
  const [example, setExample] = useState(title);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const observer = useRef<MutationObserver | null>(null);
  useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);observer.current?.disconnect();},[]);

  useEffect(() => {
    const el = wrap.current; if (!el) return;
    const ro = new ResizeObserver(() => setK(Math.min(1, el.clientWidth / W))); ro.observe(el); setK(Math.min(1, el.clientWidth / W));
    return () => ro.disconnect();
  }, [W]);

  const measure = () => {
    const f = frame.current; const doc = f?.contentDocument; const win = f?.contentWindow; if (!doc || !win) return;
    if (scroll) { const m = doc.querySelector("main"); (m && m.scrollHeight > m.clientHeight ? m : win).scrollTo(0, scroll); }
    if(timer.current)clearTimeout(timer.current);
    timer.current=setTimeout(() => {
      setExample(doc.querySelector('[data-c="Prompt"]')?.textContent || title);
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

  const frameEl = (
    <div ref={wrap} className={`w-full ${phone ? "rounded-[22px]" : "rounded-lg"} border border-gray-300 dark:border-gray-700 overflow-hidden bg-black relative`} style={{ height: H * k, maxWidth: W }}>
      <div style={{ width: W, height: H, transform: `scale(${k})`, transformOrigin: "top left" }}>
        <iframe ref={frame} src={src} title={`${id} ${title}`} width={W} height={H} style={{ border: 0, display: "block", background: "black" }} onLoad={() => {
          if(timer.current)clearTimeout(timer.current);
          timer.current=setTimeout(measure,wait);
          observer.current?.disconnect();
          if(frame.current?.contentDocument){observer.current=new MutationObserver(()=>{const prompt=frame.current?.contentDocument?.querySelector('[data-c="Prompt"]')?.textContent;if(prompt)setExample(prompt);});observer.current.observe(frame.current.contentDocument.body,{subtree:true,childList:true,characterData:true});}
        }} />
        <div className="absolute inset-0 pointer-events-none">
          {(outlines ? boxes : []).map((b, i) => (
            <div key={b.name} style={{ opacity: hover && hover !== b.name ? 0.25 : 1 }}>
              <div className="absolute rounded-md" style={{ left: b.x, top: b.y, width: b.w, height: b.h, outline: `${hover === b.name ? 3 : 2}px solid #f59e0b`, outlineOffset: 2 }} />
              <div className="absolute w-6 h-6 rounded-full bg-amber-500 text-black text-[13px] font-semibold flex items-center justify-center" style={{ left: b.x + b.w - 12, top: b.y - 12 }}>{i + 1}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <section id={id} data-screen className="scroll-mt-20">
      <div className="flex flex-wrap items-baseline gap-3 mb-3">
        <Handle id={id} className="text-[13px]" />
        <h2 className="text-lg font-light">{title}</h2>
        {note && <span className="text-[12px] text-gray-500">{note}</span>}
      </div>
      <div className="grid xl:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
        <div className="min-w-0">{frameEl}{outlines && <div className="mt-4"><ComponentRail boxes={boxes} id={id} hover={hover} setHover={setHover}/></div>}</div>
        <aside className="xl:sticky xl:top-20"><DesignReviewPanel scope={id} targets={boxes.map(b=>`${id} › ${b.name}`)} context={{question:"What should improve in this part of the product?",example,view:`${title} · ${W} × ${H}`,version:reviewVersion(),link:`/designspace/screens?device=${phone?"phone":"laptop"}#${id}`}} brief={`Current product screen: ${id}. ${note??""}`}/></aside>
      </div>
    </section>
  );
}
