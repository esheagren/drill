"use client";

import Link from "next/link";
import { useState } from "react";
import Handle from "@/components/DsHandle";
import DsNotes from "@/components/DsNotes";
import { Star, useStars } from "@/components/DsStar";
import { PROBLEMS, problemHandle, promptFor } from "@/content/designspace/problems";

export default function Problems() {
  const [query,setQuery]=useState("");
  const [family,setFamily]=useState("all");
  const {stars,toggle}=useStars();
  const rows=PROBLEMS.filter(p=>(family==="all"||p.candidates.some(c=>c.widget===family)) && `${p.name} ${p.concept} ${p.skills.join(" ")}`.toLowerCase().includes(query.toLowerCase()));
  return <div>
    <div className="flex flex-wrap items-baseline justify-between gap-3"><h1 className="text-2xl font-light tracking-tight">Problems</h1><Link className="text-sm underline underline-offset-4" href="/designspace/workbench">Open explanation workbench →</Link></div>
    <p className="text-sm text-gray-500 mt-2 max-w-3xl">The mathematical work behind each explanation. Choose a family, compare ways to explain it, then check whether the design holds up with new numbers. This is a development catalog; stars shortlist work to explore.</p>
    <div className="flex flex-wrap gap-3 my-7">
      <label className="flex-1 min-w-48 max-w-md"><span className="sr-only">Search problems</span><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search concepts, problems, or skill IDs" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm" /></label>
      <label className="flex items-center gap-2 text-sm">Picture <select value={family} onChange={e=>setFamily(e.target.value)} className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black px-3 py-2"><option value="all">All families</option><option value="bar">Bar</option><option value="array">Array</option><option value="line">Line</option></select></label>
      <span className="text-xs text-gray-500 self-center">{rows.length} of {PROBLEMS.length} families</span>
    </div>
    <div className="grid xl:grid-cols-2 gap-5">
      {rows.map(p=><article id={problemHandle(p)} key={p.id} className="scroll-mt-20 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
        <div className="flex items-center gap-2"><Handle id={problemHandle(p)}/><span className="ml-auto"><Star id={problemHandle(p)} stars={stars} toggle={toggle}/></span></div>
        <h2 className="text-lg mt-3">{p.name}</h2><p className="text-xs text-gray-500 mt-1">{p.concept}</p>
        <p className="text-sm mt-3 text-gray-600 dark:text-gray-300">{p.structure}</p>
        <div className="flex flex-wrap gap-2 mt-4">{p.examples.map(e=><Link key={e.id} href={`/designspace/workbench?problem=${p.id}&example=${e.id}`} className="rounded-lg bg-gray-50 dark:bg-gray-900 p-2 text-sm hover:ring-1 ring-gray-400"><span className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1">{e.role}</span>{promptFor(p.id,e.values)}</Link>)}</div>
        <p className="mt-4 text-sm"><span className="text-gray-500">Intended insight: </span>{p.insight}</p>
        <details className="text-sm mt-3"><summary className="cursor-pointer text-gray-500">Possible error and transfer check</summary><p className="mt-2">{p.possibleError} A single answer does not establish the cause.</p><p className="mt-2">{p.check}</p><p className="mt-2 text-xs text-gray-500">Skills: {p.skills.join(" · ")}</p></details>
        <div className="flex flex-wrap items-center gap-3 mt-5 text-xs text-gray-500">{[...new Set(p.candidates.map(c=>c.widget))].map(w=><Link key={w} className="underline underline-offset-4" href={`/designspace/widgets#W-${w}`}>W-{w}</Link>)}<Link href={`/designspace/workbench?problem=${p.id}`} className="ml-auto text-gray-900 dark:text-gray-100 underline underline-offset-4">Compare {p.candidates.length} explanations →</Link></div>
      </article>)}
    </div>
    {!rows.length && <p className="py-12 text-gray-500">No matching families. Try another concept or picture.</p>}
    <DsNotes page="problems"/>
  </div>;
}
