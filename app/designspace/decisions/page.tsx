"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Handle from "@/components/DsHandle";
import DsNotes from "@/components/DsNotes";
import DsPreviewFrame from "@/components/DsPreviewFrame";
import DesignReviewPanel from "@/components/DesignReviewPanel";
import DesignDecision from "@/components/DesignDecision";
import { Star, useStars } from "@/components/DsStar";
import { Out, useReactions } from "@/components/DsReact";
import { DECISIONS, NO_PICTURE, composeStep, decisionById, type Option } from "@/content/designspace/decisions";
import { axisKey, initialSelections } from "@/lib/decisionSelection";
import { designHash, putWall, readWall, reviewVersion } from "@/lib/designReview";

export default function Decisions() {
  const [active,setActive]=useState("miss"),[selections,setSelections]=useState<Record<string,string>>({});
  const [wall,setWall]=useState<Record<string,string>>({}),[loaded,setLoaded]=useState(false),[message,setMessage]=useState("");
  const [compareAxis,setCompareAxis]=useState("");
  const [compare,setCompare]=useState(false),[showOut,setShowOut]=useState(false),[other,setOther]=useState("");
  const {stars,toggle}=useStars(),{reactions,set:react}=useReactions();
  useEffect(()=> {
    let cancelled=false;
    const params=new URLSearchParams(window.location.search);setCompare(params.get("compare")==="1");setCompareAxis(params.get("axis")||"");setOther(params.get("other")||"");
    readWall("").then(rows=>{if(cancelled)return;const data=Object.fromEntries(rows.map(r=>[r.page,r.text]));setWall(data);const linked=new URLSearchParams(window.location.search).get("preview");setSelections(initialSelections(DECISIONS,linked?{...data,"preview screen-options":linked}:data));setLoaded(true);}).catch(()=>{if(!cancelled)setMessage("Could not load saved choices. Reload to retry.");});
    const sync=()=>{const key=designHash(window.location.hash).split("/")[0].replace(/^D-/,"");if(DECISIONS.some(d=>d.id===key)){setActive(key);}};
    sync();window.addEventListener("hashchange",sync);return()=>{cancelled=true;window.removeEventListener("hashchange",sync);};
  },[]);
  const d=decisionById(active), primary=d.axes[0];
  const pick=(id:string,axis?:string):Option=>{const decision=decisionById(id),a=decision.axes.find(x=>x.id===(axis??decision.axes[0].id))!;return a.options.find(o=>o.id===selections[axisKey(decision,a.id)]) ?? a.options.find(o=>o.current) ?? a.options[0];};
  const selected=pick(d.id,primary.id);
  const comparisonAxis=d.axes.find(a=>a.id===compareAxis)??primary, comparisonSelected=pick(d.id,comparisonAxis.id);
  const alternative=comparisonAxis.options.find(o=>o.id===other) ?? comparisonAxis.options.find(o=>o.id!==comparisonSelected.id&&(showOut||reactions[`D-${d.id}/${o.id}`]!=="no")) ?? comparisonAxis.options[0];
  const options=comparisonAxis.options.filter(o=>showOut||o.id===comparisonSelected.id||reactions[`D-${d.id}/${o.id}`]!=="no");
  const handle=`D-${d.id}`, scope=d.kind==="set"?`${handle}/${selected.id}`:handle;
  const choice=d.axes.map(a=>`${a.name}: ${pick(d.id,a.id).name}`).join(" · ");
  const context={question:d.question,example:d.kind==="set"?selected.sample?.item??d.name:d.step==="Miss"?"47 × 6":d.step==="Answering"?"47 × 6":"Session summary · 61 answers",view:choice+(compare?` · comparing ${alternative.name}`:""),version:reviewVersion(),link:`/designspace/decisions?${new URLSearchParams({preview:JSON.stringify(selections),compare:compare?"1":"0",axis:comparisonAxis.id,other:alternative.id})}#${handle}`};
  const persist=async()=>{await putWall("preview screen-options",JSON.stringify(selections));setWall(w=>({...w,"preview screen-options":JSON.stringify(selections)}));};
  const star=async(id:string)=>{if(!loaded)return;try{if(!wall["preview screen-options"])await persist();await toggle(id);}catch{setMessage("Could not save the shortlist. Please retry.");}};
  const chosen=async()=> {
    await persist();
    await Promise.all(d.axes.map(a=>putWall(`pick ${axisKey(d,a.id)}`,pick(d.id,a.id).id)));
    await putWall(`status ${handle}`,"decided");setWall(w=>({...w,[`status ${handle}`]:"decided"}));
  };
  const rendered=(option?:Option)=>composeStep(d.step,(id,axis)=>id===d.id && (axis??primary.id)===comparisonAxis.id && option ? option : pick(id,axis),d.kind==="set"?(option??selected).sample:undefined);
  const brief=[d.question,`Selected: ${choice}`,`Requirements: ${wall[`req ${handle}`]||d.requirements.join("; ")}`,compare?`Compare: ${alternative.name}`:"",`Shortlisted: ${d.axes.flatMap(a=>a.options.filter(o=>stars.has(`${handle}/${o.id}`)).map(o=>o.name)).join(", ")||"none"}`].filter(Boolean).join("\n");
  return <div>
    <div className="flex flex-wrap items-baseline gap-4 justify-between mb-6"><h1 className="text-2xl font-light">Explore screen options</h1><Link href={`/designspace/screens#${d.step==="Miss"?"V2":d.step==="Summary"?"V4":"V1"}`} className="text-xs underline text-gray-500">Review current product →</Link></div>
    <p role="status" className="text-xs text-gray-500 mb-3">{message}</p>
    <div className="grid xl:grid-cols-[190px_minmax(0,1fr)_320px] gap-6 items-start">
      <aside className="xl:sticky xl:top-20 space-y-6">
        <nav aria-label="Screen decisions">{DECISIONS.map(x=><a key={x.id} href={`#D-${x.id}`} onClick={()=>{setActive(x.id);setOther("");}} aria-current={active===x.id?"page":undefined} className={`block px-2 py-2 rounded-lg text-xs ${active===x.id?"bg-gray-100 dark:bg-gray-900":"text-gray-500"}`}>{x.name}{wall[`status D-${x.id}`]==="decided"&&<span className="float-right text-[10px]">chosen</span>}</a>)}</nav>
        {d.axes.map(a=><div key={a.id}><label className="block text-xs text-gray-500">{a.name}<select disabled={!loaded} aria-label={`Select ${a.name}`} value={pick(d.id,a.id).id} onChange={e=>{setSelections(s=>({...s,[axisKey(d,a.id)]:e.target.value}));setOther("");}} className="block w-full bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg p-2 mt-2">{a.options.filter(o=>showOut||o.id===pick(d.id,a.id).id||reactions[`${handle}/${o.id}`]!=="no").map(o=><option key={o.id} value={o.id}>{o.name}{stars.has(`${handle}/${o.id}`)?" ★":""}</option>)}</select></label><div className="flex items-center gap-2 mt-2"><Star id={`${handle}/${pick(d.id,a.id).id}`} stars={stars} toggle={star}/><span className="text-[11px] text-gray-500">Shortlist</span><Out id={`${handle}/${pick(d.id,a.id).id}`} reactions={reactions} set={react}/></div></div>)}
        <details className="text-xs text-gray-500"><summary className="cursor-pointer">More controls</summary><label className="block mt-3"><input type="checkbox" checked={showOut} onChange={e=>setShowOut(e.target.checked)} className="mr-1"/>Show ruled-out options</label><button disabled={!loaded} className="mt-3 underline" onClick={async()=>{try{await persist();setMessage("Preview saved.");}catch{setMessage("Could not save preview. Retry.");}}}>Save preview</button><p className="mt-2">Preview selection and stars are separate from an implementation decision.</p></details>
      </aside>
      <section className="min-w-0"><div className="flex items-center flex-wrap gap-3 mb-4"><h2 className="text-lg">{d.question}</h2><label className="text-xs text-gray-500 ml-auto"><input type="checkbox" checked={compare} onChange={e=>setCompare(e.target.checked)} className="mr-1"/>Compare</label></div>
        {!loaded?<p className="text-sm text-gray-500 py-12">Loading saved choices…</p>:<div className={`grid gap-4 ${compare?"md:grid-cols-2":""}`}><div className="min-w-0"><p className="text-xs text-gray-500 mb-2">Selected · {choice}</p><DsPreviewFrame width={390} height={844}>{rendered()}</DsPreviewFrame></div>{compare&&<div className="min-w-0">{d.axes.length>1&&<label className="block text-xs text-gray-500 mb-2">Compare <select aria-label="Comparison axis" value={comparisonAxis.id} onChange={e=>{setCompareAxis(e.target.value);setOther("");}} className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg p-1 ml-1">{d.axes.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></label>}<select aria-label="Comparison option" value={alternative.id} onChange={e=>setOther(e.target.value)} className="text-xs mb-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg p-1 max-w-full">{options.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select><DsPreviewFrame width={390} height={844}>{rendered(alternative)}</DsPreviewFrame><button onClick={()=>{setSelections(s=>({...s,[axisKey(d,comparisonAxis.id)]:alternative.id}));setOther(comparisonSelected.id);}} className="text-xs underline mt-2">Select this option</button></div>}</div>}
        <p className="text-[11px] text-gray-500 mt-3">{d.kind==="set"?"Each widget has its own worked example. Use the explanation workbench to hold the numbers constant.":"Compare changes one axis; the other selections stay fixed."}</p>
        {d.kind==="set"&&<Link href="/designspace/workbench" className="text-xs underline mt-3 inline-block">Compare explanations for one problem →</Link>}
      </section>
      <aside className="xl:sticky xl:top-20 min-w-0"><div className="mb-4"><Handle id={handle}/><details className="mt-3 text-xs"><summary className="text-gray-500 cursor-pointer">About the selected options</summary>{d.axes.map(a=>{const o=pick(d.id,a.id);return <div key={a.id} className="mt-3"><Handle id={`${handle}/${o.id}`}/><p className="mt-1 text-gray-500">{o.note}</p>{o.serves&&<p className="mt-2 text-gray-500">Serves: {o.serves}</p>}</div>;})}{d.kind==="set"&&<p className="mt-3 text-gray-500">Still without a picture: {NO_PICTURE}</p>}</details></div><DesignReviewPanel key={`review-${scope}`} scope={scope} context={context} brief={brief}/><DesignDecision key={`decision-${handle}`} scope={handle} choice={choice} context={context} onChoose={chosen} onReopen={async()=>{await putWall(`status ${handle}`,"working");setWall(w=>({...w,[`status ${handle}`]:"working"}));}}/><details className="mt-5 border-t border-gray-200 dark:border-gray-800 pt-4"><summary className="text-xs text-gray-500 cursor-pointer">Requirements and earlier page notes</summary><ul className="text-xs list-disc pl-4 space-y-1 mt-3">{(wall[`req ${handle}`]||d.requirements.join("\n")).split("\n").map((r,i)=><li key={i}>{r}</li>)}</ul><DsNotes page={`req ${handle}`}/><DsNotes page="decisions"/></details></aside>
    </div>
  </div>;
}
