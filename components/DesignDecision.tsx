"use client";
import { useEffect, useState } from "react";
import { parseDecision, putWall, readWall, type ImplementationDecision, type ReviewContext } from "@/lib/designReview";
type Decision = ImplementationDecision;
export default function DesignDecision({scope,choice,context,onChoose,onReopen}:{scope:string;choice:string;context:ReviewContext;onChoose?:()=>Promise<void>;onReopen?:()=>Promise<void>}) {
  const [saved,setSaved]=useState<Decision|null>(null),[reason,setReason]=useState(""),[loaded,setLoaded]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState("");
  useEffect(()=>{let stop=false;setLoaded(false);setSaved(null);setError("");setReason("");readWall(`decision ${scope}`).then(rows=>{if(stop)return;const row=rows.find(r=>r.page===`decision ${scope}`);if(row)setSaved(parseDecision(row.text));setLoaded(true);}).catch(()=>{if(!stop)setError("Could not load the decision. Reload before choosing.");});return()=>{stop=true;};},[scope]);
  useEffect(()=>{setReason("");},[choice]);
  const write=async(reopen=false)=>{if(!reopen&&!reason.trim())return;setBusy(true);setError("");const d:Decision=reopen&&saved?{...saved,status:"reopened"}:{schema:1,choice,reason:reason.trim(),context,status:"chosen",at:new Date().toISOString()};try{if(!reopen&&onChoose)await onChoose();if(reopen&&onReopen)await onReopen();await putWall(`decision ${scope}`,JSON.stringify(d));setSaved(d);setReason("");}catch{setError("Could not finish saving the decision. Your reason is still here; retry.");}finally{setBusy(false);}};
  return <details className="mt-5 border-t border-gray-200 dark:border-gray-800 pt-4"><summary className="text-xs cursor-pointer text-gray-500">Implementation decision{saved?.status==="chosen"?" · chosen":""}</summary>
    {saved&&<div className="mt-3 text-xs"><div>{saved.status==="chosen"?"Chosen":"Reopened"}: {saved.choice}</div><p className="text-gray-500 mt-1 whitespace-pre-wrap">{saved.reason}</p>{saved.status==="chosen"&&<button disabled={busy} onClick={()=>write(true)} className="underline mt-2">Reopen decision</button>}</div>}
    <form onSubmit={e=>{e.preventDefault();void write();}} className="mt-3"><label className="text-xs text-gray-500">Why choose this version?<textarea aria-label="Decision reason" value={reason} maxLength={4000} onChange={e=>setReason(e.target.value)} rows={2} className="w-full block rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent p-2 mt-1"/></label><button disabled={!loaded||busy||!reason.trim()} className="mt-2 text-xs px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-40">{busy?"Saving…":"Choose for implementation"}</button></form>
    <p className="text-[11px] text-gray-500 mt-2">Records this choice and its reason. Deployment happens separately.</p>{error&&<p role="alert" className="text-xs text-rose-600 mt-2">{error}</p>}
  </details>;
}
