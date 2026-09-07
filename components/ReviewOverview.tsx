"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { QUESTIONS } from "@/content/designspace/navigation";
import { CHANGES } from "@/content/designspace/changes";
import { parseReview, readWall, reviewHref, type ReviewNote } from "@/lib/designReview";

export default function ReviewOverview() {
  const [tasks,setTasks]=useState<string[]>([]),[notes,setNotes]=useState<ReviewNote[]>([]),[error,setError]=useState(false),[loaded,setLoaded]=useState(false);
  useEffect(()=>{let cancelled=false;readWall("").then(rows=>{if(cancelled)return;const todo=rows.find(r=>r.page==="todo list")?.text??"";setTasks(todo.split("\n").filter(l=>/^-\s*\[ \]/.test(l)).map(l=>l.replace(/^-\s*\[ \]\s*/,"")));setNotes(rows.filter(r=>r.page.startsWith("review ")).map(parseReview).filter((n):n is NonNullable<typeof n>=>!!n&&!n.resolved).sort((a,b)=>b.created.localeCompare(a.created)));setLoaded(true);}).catch(()=>{if(!cancelled)setError(true);});return()=>{cancelled=true;};},[]);
  const [showAll,setShowAll]=useState(false);
  const other=tasks.filter(t=>!QUESTIONS.some(q=>q.terms.test(t)));
  return <div>
    <div className="flex flex-wrap items-baseline justify-between gap-3"><h1 className="text-2xl font-light">Review</h1><Link href="/designspace/screens#V2" className="text-sm underline underline-offset-4">Open the product →</Link></div>
    <p className="text-sm text-gray-500 mt-2 mb-8">Pick up a design question, inspect the product, and leave feedback beside it.</p>
    <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-10">
      <section><h2 className="text-xs uppercase tracking-wide text-gray-500 mb-2">Active design questions</h2>
        {QUESTIONS.map(q=>{const matching=tasks.filter(t=>q.terms.test(t));return <article key={q.id} className="py-5 border-b border-gray-200 dark:border-gray-800"><h3 className="text-lg">{q.title}</h3><p className="text-sm text-gray-500 mt-1">{q.detail}</p><div className="flex flex-wrap gap-5 text-sm mt-3"><Link href={q.review} className="underline underline-offset-4">Review current screen</Link><Link href={q.explore} className="text-gray-500">Explore options →</Link></div>{matching.length>0&&<details className="text-xs text-gray-500 mt-3"><summary className="cursor-pointer">{matching.length} open tasks</summary><ul className="list-disc pl-4 mt-2 space-y-2">{matching.map(t=><li key={t}>{t}</li>)}</ul></details>}</article>;})}
        <div className="mt-5 text-xs text-gray-500">{error?"Saved work could not be loaded. Reload to retry.":loaded?`${tasks.length} open tasks · ${notes.length} open feedback items`:"Loading saved work…"}<Link href="/designspace/todo" className="underline ml-3">Manage tasks</Link></div>
        {other.length>0&&<details className="mt-5 text-sm"><summary className="cursor-pointer text-gray-500">Other open work · {other.length}</summary><ul className="list-disc pl-5 mt-3 space-y-2">{other.map(t=><li key={t}>{t}</li>)}</ul></details>}
        {notes.length>0&&<section className="mt-8"><h2 className="text-sm mb-3">Open feedback</h2>{(showAll?notes:notes.slice(0,5)).map((n,i)=><Link key={i} href={reviewHref(n.context.link)} className="block py-3 border-t border-gray-200 dark:border-gray-800"><div className="text-xs text-gray-500">{n.target} · {n.context.example}</div><p className="text-sm mt-1 line-clamp-2">{n.text}</p></Link>)}{notes.length>5&&<button className="text-xs underline mt-3" onClick={()=>setShowAll(v=>!v)}>{showAll?"Show fewer":`Show all ${notes.length} items`}</button>}</section>}
      </section>
      <aside><h2 className="text-xs uppercase tracking-wide text-gray-500 mb-4">Recent changes to inspect</h2><div className="space-y-5">{CHANGES.slice(0,4).map(c=><article key={c.pr}><div className="text-[11px] text-gray-500">{c.date} · <a href={`https://github.com/esheagren/drill/pull/${c.pr}`} className="underline">#{c.pr}</a></div><p className="text-sm mt-1 line-clamp-3">{c.what}</p><Link href={c.screen.startsWith("V")?`/designspace/screens#${c.screen}`:"/designspace/explore"} className="inline-block text-xs underline mt-2">Inspect →</Link></article>)}</div><details className="mt-6 text-xs text-gray-500"><summary className="cursor-pointer">Change history</summary><ul className="space-y-3 mt-4">{CHANGES.slice(4).map(c=><li key={c.pr}><a href={`https://github.com/esheagren/drill/pull/${c.pr}`} className="underline">#{c.pr}</a> · {c.what}</li>)}</ul></details></aside>
    </div>
  </div>;
}
