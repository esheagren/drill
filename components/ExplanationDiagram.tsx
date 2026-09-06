import type { Diagram, Part } from "@/lib/explanationPlan";

const tone = (p: Part) => p.tone === "remove"
  ? "bg-rose-200 dark:bg-rose-900/70 border-rose-500"
  : p.tone === "focus" ? "bg-emerald-200 dark:bg-emerald-900/70 border-emerald-600" : "bg-sky-100 dark:bg-sky-900/60 border-sky-500";
const hatch = { backgroundImage: "repeating-linear-gradient(135deg, transparent 0 4px, rgba(127,127,127,.45) 4px 6px)" };

/** Geometry has no independent arithmetic strategy; the plan supplies its meaning. */
export default function ExplanationDiagram({ diagram: d }: { diagram: Diagram }) {
  return <figure className="text-gray-900 dark:text-gray-100" aria-label={d.caption}>
    {d.kind === "bar" && (() => {
      const max = Math.max(...d.rows.map((r) => r.parts.reduce((n,p) => n+p.value,0)));
      return <div className="space-y-3">{d.rows.map((r,i) => <div key={i}>
        <div className="text-xs mb-1 tabular-nums">{r.label}</div>
        <div className="flex h-7" aria-hidden="true">{r.parts.filter((p)=>p.value>0).map((p,j) => <div key={j} className={`border-y border-l last:border-r ${tone(p)}`} style={{width:`${p.value/max*100}%`, ...(p.tone==="remove" ? hatch : {})}} />)}</div>
      </div>)}</div>;
    })()}
    {d.kind === "area" && (() => {
      const sum=d.parts.reduce((n,p)=>n+p.value,0);
      return <div>
        <div className="flex h-24" aria-hidden="true">{d.parts.filter((p)=>p.value>0).map((p,i)=><div key={i} className={`border-y border-l last:border-r ${tone(p)}`} style={{width:`${p.value/sum*100}%`,...(p.tone==="remove"?hatch:{})}} />)}</div>
        <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 mt-2 text-xs tabular-nums">{d.parts.map((p,i)=><span key={i}>{p.label}</span>)}</div>
      </div>;
    })()}
    {d.kind === "line" && (() => {
      const x=(n:number)=>20+n/d.max*280;
      const sorted=[...d.ticks].sort((a,b)=>a.value-b.value);
      return <svg viewBox="0 0 320 106" className="w-full" role="img" aria-label={d.caption}>
        <line x1="20" x2="300" y1="58" y2="58" stroke="currentColor" opacity=".4" />
        {d.from!==undefined && d.to!==undefined && d.from!==d.to && <g stroke="currentColor" fill="none" strokeWidth="2">
          <path d={`M ${x(d.from)} 49 Q ${(x(d.from)+x(d.to))/2} 4 ${x(d.to)} 49`} />
          <path d={`M ${x(d.to)-4} 42 L ${x(d.to)} 49 L ${x(d.to)+4} 42`} />
        </g>}
        {sorted.map((t,i)=> {
          const crowded=i>0 && (t.value-sorted[i-1].value)/d.max < .2;
          return <g key={i}><line x1={x(t.value)} x2={x(t.value)} y1="53" y2="63" stroke="currentColor" />
            {t.label && <text x={x(t.value)} y={crowded?96:78} textAnchor={i===0?"start":i===sorted.length-1?"end":"middle"} fontSize="11" fill="currentColor">{t.label}</text>}
          </g>;
        })}
      </svg>;
    })()}
    <figcaption className="text-xs text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">{d.caption}</figcaption>
  </figure>;
}
