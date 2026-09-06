"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Handle from "./DsHandle";
import DesignReviewPanel from "./DesignReviewPanel";
import DesignDecision from "./DesignDecision";
import DsPreviewFrame from "./DsPreviewFrame";
import { reviewVersion } from "@/lib/designReview";
import { Star, useStars } from "./DsStar";
import { Out, useReactions } from "./DsReact";
import FeedbackBody from "./FeedbackBody";
import ExplanationDiagram from "./ExplanationDiagram";
import { explanationPlan } from "@/lib/explanationPlan";
import { PROBLEMS, REPRESENTATION_RULES, explanationHandle, problemById, problemHandle, promptFor, validateValues, type ProblemFamily, type Values } from "@/content/designspace/problems";

const button = "rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 text-xs hover:border-gray-500 disabled:opacity-40";
interface Study { version: 1; values: Values; candidate: string }
function readStudy(raw: string, p: ProblemFamily): Study | null {
  try {
    const s = JSON.parse(raw);
    return s.version === 1 && Array.isArray(s.values) && s.values.length === 3 && !validateValues(p,s.values) && p.candidates.some(c=>c.id===s.candidate) ? s : null;
  } catch { return null; }
}

export default function ExplanationWorkbench() {
  const params=useSearchParams();
  const p=problemById(params.get("problem") ?? "") ?? PROBLEMS[0];
  const example=p.examples.find(e=>e.id===params.get("example")) ?? p.examples[0];
  const values = example.values.map((v,i)=>params.has(`v${i}`) ? Number(params.get(`v${i}`)) : v) as Values;
  const invalid=validateValues(p,values);
  const candidate=p.candidates.find(c=>c.id===params.get("candidate")) ?? p.candidates[0];
  return <Bench key={params.toString()} problem={p} initialValues={invalid ? example.values : values} initialCandidate={candidate.id} invalidLink={!!invalid} initialWidth={Number(params.get("width"))} initialStep={params.get("step")} initialCompare={params.get("compare")==="1"}/>;
}

export function Bench({ problem:p, initialValues, initialCandidate, invalidLink, initialWidth=390, initialStep=null, initialCompare=false }: {problem:ProblemFamily; initialValues:Values; initialCandidate:string; invalidLink:boolean; initialWidth?:number; initialStep?:string|null; initialCompare?:boolean}) {
  const [values,setValues]=useState<Values>(initialValues);
  const [draft,setDraft]=useState(initialValues.map(String));
  const [selected,setSelected]=useState(initialCandidate);
  const [step,setStep]=useState<number | "all">(initialStep!==null && /^\d+$/.test(initialStep) && +initialStep < explanationPlan(p,p.candidates.find(c=>c.id===initialCandidate)!,initialValues).steps.length ? +initialStep : "all");
  const [width,setWidth]=useState([320,390,480].includes(initialWidth)?initialWidth:390);
  const [showOut,setShowOut]=useState(false);
  const [compare,setCompare]=useState(initialCompare);
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  const [saved,setSaved]=useState<Study|null>(null);
  const [saving,setSaving]=useState(false);
  const [loaded,setLoaded]=useState(false);
  const [readFailed,setReadFailed]=useState(false);
  const {stars,toggle}=useStars();
  const {reactions,set:react}=useReactions();
  const candidate=p.candidates.find(c=>c.id===selected)!;
  const plan=explanationPlan(p,candidate,values);
  const rules=REPRESENTATION_RULES[candidate.widget];
  const handle=explanationHandle(p,candidate);
  const plans=p.candidates.map(c=>({candidate:c,plan:explanationPlan(p,c,values)}));
  const visible=plans.filter(({candidate:c})=>showOut||reactions[explanationHandle(p,c)]!=="no");
  const example=p.examples.find(e=>e.values.every((v,i)=>v===values[i]));
  const unchanged=!!saved && saved.candidate===selected && saved.values.every((v,i)=>v===values[i]);

  useEffect(()=> {
    const controller=new AbortController();
    fetch(`/api/designspace/notes?page=${encodeURIComponent(`study ${problemHandle(p)}`)}`,{signal:controller.signal})
      .then(r=>{if(!r.ok)throw new Error();return r.json();})
      .then(j=>{setSaved(readStudy(j.text ?? "",p));setLoaded(true);})
      .catch(()=>{if(!controller.signal.aborted){setLoaded(true);setReadFailed(true);}});
    return ()=>controller.abort();
  },[p]);

  const applyValues=(v:Values)=>{setValues(v);setDraft(v.map(String));setStep("all");setError("");setMessage("");};
  const studyUrl=()=> {
    const q=new URLSearchParams({problem:p.id,candidate:selected,width:String(width),step:String(step),compare:compare?"1":"0"});
    values.forEach((v,i)=>q.set(`v${i}`,String(v)));
    return `${window.location.origin}/designspace/workbench?${q}`;
  };
  const copy=async (text:string)=>{try{await navigator.clipboard.writeText(text);setMessage("Copied.");}catch{setMessage("Could not copy. Clipboard access is unavailable.");}};
  const save=async()=> {
    setSaving(true);setMessage("");
    const study:Study={version:1,values,candidate:selected};
    try {
      const r=await fetch("/api/designspace/notes",{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify({page:`study ${problemHandle(p)}`,text:JSON.stringify(study)})});
      if(!r.ok)throw new Error();
      setSaved(study);setReadFailed(false);setMessage("Study saved to the shared wall.");
    } catch {setMessage("Could not save. Your changes are still here; retry when connected.");}
    finally{setSaving(false);}
  };
  const compared=compare ? plans.filter(x=>x.candidate.id!==selected&& (showOut||reactions[explanationHandle(p,x.candidate)]!=="no")) : [];
  const displayed=[{candidate,plan},...compared];
  const query=new URLSearchParams({problem:p.id,candidate:selected,width:String(width),step:String(step),compare:compare?"1":"0"});values.forEach((v,i)=>query.set(`v${i}`,String(v)));
  const context={question:p.check,example:plan.prompt,view:`${candidate.name}${compare?" · comparison":""} · ${width} px · ${step==="all"?"all steps":`step ${step+1}`}`,version:reviewVersion(),link:`/designspace/workbench?${query}`};
  const briefText=[`Problem family: ${problemHandle(p)} · ${p.concept}`,`Intended insight: ${p.insight}`,`Transfer check: ${p.check}`,
    ...displayed.map(({candidate:c,plan:x})=>[`${explanationHandle(p,c)} — ${c.name}`,`Move: ${c.move}`,`Representation: W-${c.widget}`,`Prior familiarity: ${c.prerequisite}`,`Limit: ${c.limitation}`,`Shortlisted: ${stars.has(explanationHandle(p,c))?"yes":"no"}; ruled out: ${reactions[explanationHandle(p,c)]==="no"?"yes":"no"}`,`Rules: ${REPRESENTATION_RULES[c.widget].rules.join(" ")}`,...x.steps.map((s,i)=>`${i+1}. ${s.text} Picture: ${s.diagram.caption}`)].join("\n")),
    ...p.examples.map(e=>`${e.role}: ${promptFor(p.id,e.values)}`)].join("\n\n");

  return <div>
    <div className="flex flex-wrap items-baseline justify-between gap-3 mb-6"><div><h1 className="text-2xl font-light">Help after an answer</h1><p className="text-sm text-gray-500 mt-1">One example, one explanation. Compare when you need an alternative.</p></div><button className="text-xs text-gray-500 underline" onClick={()=>copy(studyUrl())}>Copy study link</button></div>
    <p role="status" aria-live="polite" className="text-xs text-gray-500 mb-3">{message}</p>
    {invalidLink&&<p role="status" className="text-xs text-amber-700 mb-3">Unsupported link values; showing the anchor example.</p>}
    <div className="grid xl:grid-cols-[190px_minmax(0,1fr)_320px] gap-6 items-start">
      <aside className="xl:sticky xl:top-20 space-y-5">
        <div><h2 className="text-xs uppercase tracking-wide text-gray-500 mb-2">Problem</h2><details><summary className="text-sm cursor-pointer">{p.name}</summary><nav aria-label="Problem families" className="text-xs space-y-2 mt-3">{PROBLEMS.map(f=><Link key={f.id} href={`/designspace/workbench?problem=${f.id}`} className="block text-gray-500 hover:underline">{f.name}</Link>)}</nav></details></div>
        <div><h2 className="text-xs uppercase tracking-wide text-gray-500 mb-2">Example</h2><div className="flex xl:block flex-wrap gap-2 space-y-1">{p.examples.map(e=><button key={e.id} onClick={()=>applyValues(e.values)} aria-pressed={example?.id===e.id} className={`block text-left w-full rounded-lg px-2 py-2 text-xs ${example?.id===e.id?"bg-gray-100 dark:bg-gray-900":"text-gray-500"}`}><span className="block text-[10px] uppercase mb-1">{e.role}</span>{promptFor(p.id,e.values)}</button>)}</div></div>
        <details><summary className="text-xs text-gray-500 cursor-pointer">Change the numbers</summary><form className="mt-3 space-y-2" onSubmit={e=>{e.preventDefault();const v=draft.map(Number) as Values;const issue=validateValues(p,v);if(issue)setError(issue);else applyValues(v);}}>{p.fields.map((f,i)=><label key={i} className="block text-xs">{f.label}<input type="number" required min={f.min} max={f.max} step={1} value={draft[i]} onChange={e=>setDraft(v=>v.map((x,j)=>j===i?e.target.value:x))} className="mt-1 w-full bg-transparent rounded-lg border border-gray-300 dark:border-gray-700 p-2"/></label>)}{error&&<p role="alert" className="text-xs text-rose-600">{error}</p>}<button className={button}>Apply numbers</button></form></details>
        <div><h2 className="text-xs uppercase tracking-wide text-gray-500 mb-2">Explanation</h2>{visible.map(({candidate:c})=><button key={c.id} onClick={()=>{setSelected(c.id);setStep("all");setMessage("");}} aria-pressed={selected===c.id} className={`block text-left w-full text-xs px-2 py-2 rounded-lg ${selected===c.id?"bg-gray-100 dark:bg-gray-900":"text-gray-500"}`}>{c.name}</button>)}{!visible.length&&<p className="text-xs text-gray-500">All candidates are ruled out.</p>}<details className="mt-2 text-xs text-gray-500"><summary className="cursor-pointer">Other candidates</summary><label className="block mt-2"><input type="checkbox" checked={showOut} onChange={e=>setShowOut(e.target.checked)} className="mr-1"/>Show ruled-out candidates</label></details></div>
        <details><summary className="text-xs text-gray-500 cursor-pointer">Saved study</summary><div className="mt-2 space-y-2"><button disabled={!loaded||saving||unchanged||readFailed} className={button} onClick={save}>{saving?"Saving…":unchanged?"Study saved":"Save study"}</button>{saved&&<button className={button} onClick={()=>{applyValues(saved.values);setSelected(saved.candidate);}}>Restore saved study</button>}<p className="text-[11px] text-gray-500">Saves the applied numbers and preview selection.</p>{readFailed&&<p className="text-xs text-rose-600">Could not load the saved study. Reload before saving.</p>}</div></details>
        <Link href={`/designspace/problems#${problemHandle(p)}`} className="block text-xs underline text-gray-500">Problem reference →</Link>
      </aside>
      <section className="min-w-0">
        <div className="flex flex-wrap items-center gap-3 mb-3"><h2 className="font-serif text-xl" data-testid="study-prompt">{plan.prompt}</h2><label className="ml-auto text-xs text-gray-500"><input type="checkbox" checked={compare} onChange={e=>setCompare(e.target.checked)} className="mr-1"/>Compare</label><select aria-label="Preview width" value={width} onChange={e=>setWidth(+e.target.value)} className="text-xs border border-gray-300 dark:border-gray-700 rounded-lg p-1 bg-white dark:bg-black"><option value={320}>320 px</option><option value={390}>390 px</option><option value={480}>480 px</option></select></div>
        <div className="flex flex-wrap gap-1 mb-4" aria-label="Preview steps"><button className={button} aria-pressed={step==="all"} onClick={()=>setStep("all")}>All steps</button>{plan.steps.map((_,i)=><button key={i} className={button} aria-pressed={step===i} onClick={()=>setStep(i)}>Step {i+1}</button>)}</div>
        <div className={`grid gap-4 ${displayed.length>1?"md:grid-cols-2":""}`}>{displayed.map(({candidate:c,plan:x})=>{const index=step==="all"?x.steps.length-1:Math.min(step,x.steps.length-1),id=explanationHandle(p,c);return <div key={id} className="min-w-0"><div className="flex flex-wrap items-center gap-2 mb-2 text-xs"><span>{c.name}</span><div className="ml-auto flex gap-2"><Star id={id} stars={stars} toggle={toggle}/><Out id={id} reactions={reactions} set={react}/></div></div><DsPreviewFrame width={width}><div className="relative h-full flex flex-col bg-white dark:bg-black text-gray-900 dark:text-gray-100" data-testid="learner-preview"><div className="h-[3px] w-[62%] bg-amber-400 shrink-0"/><div className="absolute right-6 top-[6px] text-[10px] uppercase tracking-wide text-amber-500">paused</div><header className="px-6 pt-6"><div className="font-serif text-[26px] leading-tight">{x.prompt}</div></header><FeedbackBody lines={step==="all"?x.steps.map(s=>s.text):[x.steps[index].text]} picture={<ExplanationDiagram diagram={x.steps[index].diagram}/>} onNext={()=>{const n=example?p.examples.indexOf(example):-1;applyValues(p.examples[(n+1)%p.examples.length].values);}}/></div></DsPreviewFrame>{displayed.length>1&&c.id!==selected&&<button className="text-xs underline mt-2" onClick={()=>{setSelected(c.id);setStep("all");}}>Select for feedback</button>}</div>;})}</div>
        <p className="text-[11px] text-gray-500 mt-3">The arrow cycles examples; it records no learner attempts.</p>
      </section>
      <aside className="min-w-0 xl:sticky xl:top-20">
        <div className="mb-4"><Handle id={handle}/><p className="text-xs text-gray-500 mt-2">{candidate.move}</p></div>
        <DesignReviewPanel scope={handle} context={context} extraScopes={[problemHandle(p),...compared.map(x=>explanationHandle(p,x.candidate))]} brief={briefText}/>
        <DesignDecision scope={problemHandle(p)} choice={handle} context={context}/>
        <details className="mt-5 border-t border-gray-200 dark:border-gray-800 pt-4"><summary className="text-xs text-gray-500 cursor-pointer">Intent and representation rules</summary><dl className="text-xs space-y-3 mt-3"><div><dt className="text-gray-500">Intended insight</dt><dd>{p.insight}</dd></div><div><dt className="text-gray-500">Possible error · hypothesis</dt><dd>{p.possibleError}</dd></div><div><dt className="text-gray-500">Prior familiarity</dt><dd>{candidate.prerequisite}</dd></div><div><dt className="text-gray-500">Limit</dt><dd>{candidate.limitation}</dd></div><div><dt className="text-gray-500">Transfer check</dt><dd>{p.check}</dd></div></dl><p className="text-xs mt-3">{rules.meaning}</p><ul className="text-xs list-disc pl-4 space-y-1 mt-2">{rules.rules.map(r=><li key={r}>{r}</li>)}</ul><Link className="text-xs text-gray-500 underline mt-3 inline-block" href={`/designspace/widgets#W-${candidate.widget}`}>W-{candidate.widget} →</Link></details>
      </aside>
    </div>
  </div>;
}
