"use client";
import { useEffect, useState } from "react";
import DsNotes from "./DsNotes";
import { belongsTo, copyReview, parseReview, putWall, readWall, reviewPrefix, type ReviewContext, type ReviewNote } from "@/lib/designReview";

export default function DesignReviewPanel({ scope, context, targets=[], brief="", extraScopes=[] }: {scope:string;context:ReviewContext;targets?:string[];brief?:string;extraScopes?:string[]}) {
  return <Panel key={`${scope}:${context.example}:${context.view}`} scope={scope} context={context} targets={targets} brief={brief} extraScopes={extraScopes}/>;
}
function Panel({scope,context,targets,brief,extraScopes}:{scope:string;context:ReviewContext;targets:string[];brief:string;extraScopes:string[]}) {
  const [target,setTarget]=useState(scope),[text,setText]=useState("");
  const [notes,setNotes]=useState<(ReviewNote&{page:string})[]>([]);
  const [loaded,setLoaded]=useState(false),[error,setError]=useState("");
  const [busy,setBusy]=useState(false),[showResolved,setShowResolved]=useState(false),[message,setMessage]=useState("");
  const draftKey=`ds:feedback:${scope}:${context.example}:${context.view}`;
  useEffect(()=> {
    let cancelled=false;
    try { const draft=JSON.parse(sessionStorage.getItem(draftKey)||"null");if(draft){setText(draft.text||"");if(draft.target===scope||targets.includes(draft.target))setTarget(draft.target);} }catch{}
    readWall(reviewPrefix(scope)).then(rows=>{if(!cancelled){setNotes(rows.map(parseReview).filter((n):n is NonNullable<typeof n>=>!!n));setLoaded(true);}}).catch(()=>{if(!cancelled)setError("Could not load feedback. Reload to retry.");});
    return ()=>{cancelled=true;};
  // The parent remounts this panel when the example or view changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[scope,draftKey]);
  const draft=(value:string,to=target)=>{setText(value);setTarget(to);try{sessionStorage.setItem(draftKey,JSON.stringify({text:value,target:to}));}catch{}};
  const add=async()=> {
    if(!text.trim())return;setBusy(true);setError("");
    const page=`${reviewPrefix(scope)}${crypto.randomUUID().replaceAll("-","").slice(0,12)}`;
    const n:ReviewNote={schema:1,target,text:text.trim(),resolved:false,created:new Date().toISOString(),context:{...context,link:context.link.startsWith("/")?window.location.origin+context.link:context.link}};
    try{await putWall(page,JSON.stringify(n));setNotes(a=>[...a,{...n,page}]);draft("");setMessage("Feedback saved.");}catch{setError("Could not save. Your draft is still here; retry.");}finally{setBusy(false);}
  };
  const resolve=async(n:ReviewNote&{page:string})=> {
    setBusy(true);setError("");const changed={...n,resolved:!n.resolved};
    try{await putWall(n.page,JSON.stringify(changed));setNotes(a=>a.map(x=>x.page===n.page?changed:x));}catch{setError("Could not update feedback. Please retry.");}finally{setBusy(false);}
  };
  const copy=async()=>{setBusy(true);setError("");try{await copyReview([scope,...extraScopes],{...context,link:context.link.startsWith("/")?window.location.origin+context.link:context.link},brief);setMessage("Review copied.");}catch{setError("Could not copy the complete review. Check the connection and clipboard access.");}finally{setBusy(false);}};
  return <section aria-label="Design feedback" className="min-w-0">
    <div className="flex flex-wrap items-center gap-3"><h2 className="text-sm font-medium">Your feedback</h2><button onClick={copy} disabled={busy||!loaded} className="ml-auto text-xs underline underline-offset-4 disabled:opacity-40">Copy this review</button></div>
    <p className="text-xs text-gray-500 mt-2">{context.example} · {context.view}</p>
    <form onSubmit={e=>{e.preventDefault();void add();}} className="mt-4">
      {targets.length>0 && <label className="block text-xs text-gray-500 mb-2">Attach to <select aria-label="Feedback target" value={target} onChange={e=>draft(text,e.target.value)} className="block w-full bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg p-2 mt-1"><option value={scope}>Whole screen · {scope}</option>{targets.map(t=><option key={t} value={t}>{t}</option>)}</select></label>}
      <label className="sr-only" htmlFor={`feedback-${scope}`}>What should improve?</label><textarea id={`feedback-${scope}`} value={text} onChange={e=>draft(e.target.value)} rows={4} maxLength={8000} placeholder="What is unclear? What should the learner notice?" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent p-3 text-sm"/>
      <div className="flex flex-wrap items-center gap-2 mt-2"><button disabled={!loaded||busy||!text.trim()} className="text-xs rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-black px-3 py-2 disabled:opacity-40">Add feedback</button><span className="text-[11px] text-gray-500">Example, view, and version are attached.</span></div>
    </form>
    <p role="status" aria-live="polite" className="text-xs text-gray-500 mt-2">{message}</p>{error&&<p role="alert" className="text-xs text-rose-600 mt-2">{error}</p>}
    <div className="mt-6 flex items-center justify-between text-xs text-gray-500"><span>{loaded?`${notes.filter(n=>!n.resolved).length} open` : "Loading feedback…"}</span><label><input type="checkbox" checked={showResolved} onChange={e=>setShowResolved(e.target.checked)} className="mr-1"/>Resolved</label></div>
    <ul className="mt-2 divide-y divide-gray-200 dark:divide-gray-800">{notes.filter(n=>showResolved||!n.resolved).map(n=><li key={n.page} className={`py-4 ${n.resolved?"opacity-60":""}`}><div className="text-[11px] text-gray-500">{n.target} · {n.context.example} · {n.context.view}</div><p className="text-sm whitespace-pre-wrap mt-1">{n.text}</p><div className="flex items-center justify-between mt-2"><span className="text-[10px] text-gray-500" title={n.context.version}>Version {n.context.version.slice(0,12)}</span><button disabled={busy} onClick={()=>resolve(n)} className="text-xs underline underline-offset-4">{n.resolved?"Reopen":"Resolve"}</button></div></li>)}</ul>
    <details className="mt-5 border-t border-gray-200 dark:border-gray-800 pt-4"><summary className="text-xs text-gray-500 cursor-pointer">Earlier notes</summary><EarlierNotes scopes={[scope,...extraScopes]}/></details>
    {text.trim()&&<p className="text-[11px] text-gray-500 mt-3">Add your draft before copying; exports include saved feedback.</p>}
  </section>;
}

function EarlierNotes({scopes}:{scopes:string[]}) {
  const [pages,setPages]=useState<string[]>([]),[failed,setFailed]=useState(false);
  const signature=JSON.stringify(scopes);
  useEffect(()=>{
    let cancelled=false;
    const current:string[]=JSON.parse(signature);
    setFailed(false);
    Promise.all(current.map(readWall)).then(groups=>{
      if(!cancelled)setPages([...new Set([...current,...groups.flat().filter(r=>r.text.trim()&&current.some(s=>belongsTo(r.page,s))).map(r=>r.page)])]);
    }).catch(()=>{if(!cancelled)setFailed(true);});
    return()=>{cancelled=true;};
  },[signature]);
  return <div className="mt-3 space-y-3">{failed&&<p className="text-xs text-rose-600">Could not load earlier notes. Reload to retry.</p>}{pages.map(page=><details key={page} className="text-xs [&_section]:mt-3 [&_section]:pt-2"><summary className="cursor-pointer text-gray-500">{page}</summary><DsNotes page={page}/></details>)}</div>;
}
