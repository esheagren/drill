"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Handle from "./DsHandle";
import DsNotes from "./DsNotes";
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
  return <Bench key={params.toString()} problem={p} initialValues={invalid ? example.values : values} initialCandidate={candidate.id} invalidLink={!!invalid}/>;
}

export function Bench({ problem:p, initialValues, initialCandidate, invalidLink }: {problem:ProblemFamily; initialValues:Values; initialCandidate:string; invalidLink:boolean}) {
  const [values,setValues]=useState<Values>(initialValues);
  const [draft,setDraft]=useState(initialValues.map(String));
  const [selected,setSelected]=useState(initialCandidate);
  const [step,setStep]=useState<number | "all">("all");
  const [width,setWidth]=useState(390);
  const [showOut,setShowOut]=useState(false);
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
    const q=new URLSearchParams({problem:p.id,candidate:selected});
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
  const brief=async()=> {
    try {
      const responses=await Promise.all([
        fetch(`/api/designspace/notes?prefix=${encodeURIComponent(`E-${p.id}/`)}`),
        fetch(`/api/designspace/notes?page=${encodeURIComponent(problemHandle(p))}`),
      ]);
      if(responses.some(r=>!r.ok))throw new Error();
      const [notes,familyNote]=await Promise.all(responses.map(r=>r.json()));
      await copy([
        `Drill · explanation study · ${problemHandle(p)}`,studyUrl(),
        `Problem: ${plan.prompt}`,`Concept: ${p.concept}`,`Structure: ${p.structure}`,`Skills: ${p.skills.join(", ")}`,
        `Intended insight: ${p.insight}`,`Possible error (hypothesis only): ${p.possibleError}`,`Transfer check: ${p.check}`,
        `Selected preview: ${handle}. This is a DesignSpace candidate, not a production selection.`,
        ...plans.map(({candidate:c,plan:x})=>[
          `\n${explanationHandle(p,c)} — ${c.name}${stars.has(explanationHandle(p,c)) ? " ★ shortlisted" : ""}${reactions[explanationHandle(p,c)]==="no" ? " ✕ ruled out" : ""}`,
          `Move: ${c.move}`,`Representation: W-${c.widget}`,`Prerequisite: ${c.prerequisite}`,`Limit: ${c.limitation}`,
          `Rules: ${REPRESENTATION_RULES[c.widget].rules.join(" ")}`,
          ...x.steps.map((s,i)=>`${i+1}. ${s.text}\n   Picture: ${s.diagram.caption}`),
          `Answer: ${x.answer}`,
        ].join("\n")),
        "\nOther examples:",...p.examples.map(e=>`${e.role}: ${promptFor(p.id,e.values)}`),
        "\nSaved feedback:",familyNote.text || "(No family note)",
        ...(notes.notes ?? []).map((n:{page:string;text:string})=>`${n.page}\n${n.text}`),
        "\nDesign task: keep the numbers and mathematical move aligned in words and picture. Compare in the shared feedback layout and check the transfer and boundary examples before proposing promotion.",
      ].join("\n"));
    } catch {setMessage("Could not read saved feedback. Reconnect and retry to copy a complete brief.");}
  };

  return <div>
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><h1 className="text-2xl font-light tracking-tight">Explanation workbench</h1><p className="text-sm text-gray-500 mt-2 max-w-2xl">Hold a problem still. Compare the mathematical moves, refine the picture, and inspect what a learner would see.</p></div>
      <div className="flex flex-wrap gap-2"><button className={button} onClick={()=>copy(studyUrl())}>Copy study link</button><button className={button} onClick={brief}>Copy AI brief + feedback</button></div>
    </div>
    <p role="status" aria-live="polite" className="text-xs mt-3 min-h-4">{message}</p>
    <div className="flex flex-wrap gap-2 mt-6 pb-5 border-b border-gray-200 dark:border-gray-800" aria-label="Problem families">{PROBLEMS.map(f=><Link key={f.id} href={`/designspace/workbench?problem=${f.id}`} aria-current={f.id===p.id?"page":undefined} className={`px-3 py-2 rounded-lg text-xs ${f.id===p.id?"bg-gray-900 text-white dark:bg-gray-100 dark:text-black":"bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400"}`}>{f.name}</Link>)}</div>
    {invalidLink && <p role="status" className="mt-3 text-sm text-amber-700 dark:text-amber-400">The link contained unsupported values. Showing this family&apos;s anchor example.</p>}
    <div className="grid lg:grid-cols-[1fr_330px] gap-6 py-6">
      <div><div className="flex gap-2 items-center"><Handle id={problemHandle(p)}/><span className="text-xs text-gray-500">{p.concept}</span><Link href={`/designspace/problems#${problemHandle(p)}`} className="text-xs underline ml-auto">Problem details</Link></div>
        <h2 className="text-2xl font-serif mt-4" data-testid="study-prompt">{plan.prompt}</h2><p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{p.insight}</p>
        <div className="flex flex-wrap gap-2 mt-4">{p.examples.map(e=><button key={e.id} onClick={()=>applyValues(e.values)} aria-pressed={example?.id===e.id} className={`${button} text-left ${example?.id===e.id ? "border-gray-900 dark:border-gray-100 bg-gray-50 dark:bg-gray-900" : ""}`}><span className="block text-[10px] text-gray-500 uppercase mb-1">{e.role}</span>{promptFor(p.id,e.values)}</button>)}</div>
      </div>
      <form onSubmit={e=>{e.preventDefault();const v=draft.map(Number) as Values;const issue=validateValues(p,v);if(issue)setError(issue);else applyValues(v);}} className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <div className="text-xs text-gray-500 mb-3">Developer controls · change the example</div>
        <div className="grid grid-cols-2 gap-3">{p.fields.map((f,i)=><label key={i} className="text-xs">{f.label}<input type="number" required min={f.min} max={f.max} step={1} value={draft[i]} onChange={e=>setDraft(v=>v.map((x,j)=>j===i?e.target.value:x))} className="mt-1 w-full bg-transparent rounded-lg border border-gray-300 dark:border-gray-700 px-2 py-2 text-sm"/></label>)}</div>
        {error && <p role="alert" className="text-xs text-rose-600 dark:text-rose-400 mt-2">{error}</p>}
        <button type="submit" className={`${button} mt-3 w-full`}>Apply numbers to both candidates</button>
      </form>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4"><p className="text-sm">Compare explanations <span className="text-gray-500">· same problem, different moves</span></p><label className="text-xs text-gray-500 flex items-center gap-2"><input type="checkbox" checked={showOut} onChange={e=>setShowOut(e.target.checked)}/>Show ruled-out candidates</label></div>
    <div className="grid md:grid-cols-2 gap-4">
      {visible.map(({candidate:c,plan:x})=> {
        const id=explanationHandle(p,c),active=selected===c.id;
        return <article key={id} className={`rounded-xl border p-5 ${active?"border-gray-900 dark:border-gray-100":"border-gray-200 dark:border-gray-800"} ${reactions[id]==="no"?"opacity-60":""}`}>
          <div className="flex items-center gap-2"><Handle id={id}/><div className="ml-auto flex gap-2 items-center"><Star id={id} stars={stars} toggle={toggle}/><Out id={id} reactions={reactions} set={react}/></div></div>
          <h3 className="text-lg mt-3">{c.name}</h3><p className="text-sm text-gray-500 mt-1">{c.move}</p>
          <div className="mt-5 max-w-md"><ExplanationDiagram diagram={x.steps[x.steps.length-1].diagram}/></div>
          <ol className="mt-4 text-sm space-y-2 list-decimal pl-5">{x.steps.map((s,i)=><li key={i}>{s.text}</li>)}</ol>
          <div className="flex flex-wrap gap-3 items-center mt-5"><Link className="text-xs underline text-gray-500" href={`/designspace/widgets#W-${c.widget}`}>W-{c.widget}</Link><button className={`${button} ml-auto`} onClick={()=>{setSelected(c.id);setStep("all");setMessage("");}} aria-pressed={active}>{active?"Selected for preview":"Preview this explanation"}</button></div>
        </article>;
      })}
    </div>
    {!visible.length && <p className="text-sm text-gray-500 py-8">Both candidates are ruled out. Enable “Show ruled-out candidates” to revisit them.</p>}
    <section className="mt-10 grid xl:grid-cols-[minmax(320px,480px)_1fr] gap-8">
      <div>
        <div className="flex items-center flex-wrap gap-3 mb-3"><h2 className="text-sm">Learner preview</h2><label className="text-xs text-gray-500 ml-auto">Width <select aria-label="Preview width" value={width} onChange={e=>setWidth(+e.target.value)} className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded p-1"><option value={320}>320 px</option><option value={390}>390 px</option><option value={480}>480 px</option></select></label></div>
        <div className="flex flex-wrap gap-2 mb-3" aria-label="Preview steps"><button className={button} aria-pressed={step==="all"} onClick={()=>setStep("all")}>All steps</button>{plan.steps.map((_,i)=><button key={i} className={button} aria-pressed={step===i} onClick={()=>setStep(i)}>Step {i+1}</button>)}</div>
        <div className="relative h-[760px] max-w-full flex flex-col overflow-hidden rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-gray-100" style={{width}} data-testid="learner-preview">
          <div className="h-[3px] w-[62%] bg-amber-400 shrink-0"/><div className="absolute right-6 top-[6px] text-[10px] uppercase tracking-wide text-amber-500">paused</div>
          <header className="px-6 pt-6"><div className="font-serif text-[26px] leading-tight">{plan.prompt}</div></header>
          <FeedbackBody lines={step==="all" ? plan.steps.map(s=>s.text) : [plan.steps[step].text]} picture={<ExplanationDiagram diagram={plan.steps[step==="all" ? plan.steps.length-1 : step].diagram}/>} onNext={()=>{const n=example ? p.examples.indexOf(example) : -1;applyValues(p.examples[(n+1)%p.examples.length].values);}}/>
        </div>
        <p className="text-xs text-gray-500 mt-3">Shared trainer feedback layout. The arrow cycles the study examples; it records no attempts. Step controls belong to this workbench.</p>
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap gap-2 items-center"><Handle id={handle}/><span className="text-sm">{candidate.name}</span></div>
        {reactions[handle]==="no" && <p className="text-xs text-rose-600 mt-2">This candidate is ruled out; its preview is retained for inspection.</p>}
        <dl className="text-sm mt-5 space-y-4">
          <div><dt className="text-xs text-gray-500 mb-1">Intended insight</dt><dd>{p.insight}</dd></div>
          <div><dt className="text-xs text-gray-500 mb-1">Possible error · hypothesis, not diagnosis</dt><dd>{p.possibleError}</dd></div>
          <div><dt className="text-xs text-gray-500 mb-1">Prior familiarity</dt><dd>{candidate.prerequisite}</dd></div>
          <div><dt className="text-xs text-gray-500 mb-1">Where this candidate is limited</dt><dd>{candidate.limitation}</dd></div>
          <div><dt className="text-xs text-gray-500 mb-1">Transfer check</dt><dd>{p.check}</dd></div>
        </dl>
        <details className="mt-6 border-y border-gray-200 dark:border-gray-800 py-4" open><summary className="text-sm cursor-pointer">Representation rules · W-{candidate.widget}</summary><p className="text-sm text-gray-500 mt-3">{rules.meaning}</p><ul className="list-disc pl-5 space-y-1 text-sm mt-3">{rules.rules.map(r=><li key={r}>{r}</li>)}</ul><p className="text-xs text-gray-500 mt-3">{rules.avoid}</p></details>
        <div className="mt-5 flex flex-wrap gap-2"><button disabled={!loaded||saving||unchanged||readFailed} className={button} onClick={save}>{saving?"Saving…":unchanged?"Study saved":"Save study"}</button>{saved && <button className={button} onClick={()=>{applyValues(saved.values);setSelected(saved.candidate);}}>Restore saved study</button>}</div>
        <p className="text-xs text-gray-500 mt-2">Saves the applied numbers and selected candidate to the shared wall. Stars shortlist strategies across examples. Production routing is a separate decision.</p>
        {readFailed && <p className="text-xs text-rose-600 mt-2">Could not load the saved study. Reload before saving so an existing study is not overwritten unknowingly.</p>}
        <DsNotes key={handle} page={handle}/>
        <details className="mt-6"><summary className="cursor-pointer text-sm text-gray-500">Notes about the problem family</summary><DsNotes key={problemHandle(p)} page={problemHandle(p)}/></details>
      </div>
    </section>
  </div>;
}
