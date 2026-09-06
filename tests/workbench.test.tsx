import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { act } from "react";
import { problemById } from "../content/designspace/problems";

test("workbench applies numbers, switches strategies, saves and restores, exports context, and never records attempts",async()=> {
  const dom=new JSDOM('<!doctype html><div id="root"></div>',{url:"http://localhost/designspace/workbench?problem=compensate"});
  Object.assign(globalThis,{window:dom.window,self:dom.window,document:dom.window.document,sessionStorage:dom.window.sessionStorage,HTMLElement:dom.window.HTMLElement,IS_REACT_ACT_ENVIRONMENT:true});
  let clipboard="";
  Object.defineProperty(globalThis,"navigator",{configurable:true,value:dom.window.navigator});
  Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText:async(s:string)=>{clipboard=s;}}});
  const wall:Record<string,string>={"E-compensate/area":"Keep the correction strip visible."};
  const writes:string[]=[];
  const oldFetch=globalThis.fetch;
  let failSave=false;
  globalThis.fetch=(async(input: string|URL|Request,init?:RequestInit)=> {
    const url=new URL(String(input),"http://localhost");
    assert.equal(url.pathname,"/api/designspace/notes");
    if(init?.method==="PUT") {
      const body=JSON.parse(String(init.body));writes.push(body.page);
      if(failSave)return new Response("{}",{status:500});
      wall[body.page]=body.text;return Response.json({ok:true});
    }
    const prefix=url.searchParams.get("prefix");
    return Response.json(prefix!==null ? {notes:Object.entries(wall).filter(([page])=>page.startsWith(prefix)).map(([page,text])=>({page,text}))} : {text:wall[url.searchParams.get("page")!]??""});
  }) as typeof fetch;
  const {createRoot}=await import("react-dom/client");
  const {Bench}=await import("../components/ExplanationWorkbench");
  const root=createRoot(document.getElementById("root")!);
  const p=problemById("compensate")!;
  const click=async(label:string)=> {
    const b=Array.from(document.querySelectorAll("button")).find(b=>b.textContent===label);
    assert.ok(b,`Missing button: ${label}`);assert.ok(!b.disabled,`Disabled button: ${label}`);
    await act(async()=>b.click());
  };
  try {
    await act(async()=>root.render(<Bench problem={p} initialValues={[98,7,0]} initialCandidate="area" invalidLink={false}/>));
    assert.equal(document.querySelectorAll('[data-testid="learner-preview"]').length,1);
    assert.match(document.querySelector('[data-testid="learner-preview"]')!.textContent!,/686/);
    assert.doesNotMatch(document.querySelector('[data-testid="learner-preview"]')!.textContent!,/Developer|Prerequisite|Save study/);
    await act(async()=> {
      const inputs=document.querySelectorAll<HTMLInputElement>('input[type="number"]');
      for(const [i,value] of ["102","8"].entries()) {
        Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype,"value")!.set!.call(inputs[i],value);
        inputs[i].dispatchEvent(new dom.window.Event("input",{bubbles:true}));
        inputs[i].dispatchEvent(new dom.window.Event("change",{bubbles:true}));
      }
    });
    await click("Apply numbers");
    assert.match(document.querySelector('[data-testid="study-prompt"]')!.textContent!,/102 × 8/);
    await click(p.candidates.find(c=>c.id==="line")!.name);
    await click("Save study");
    assert.deepEqual(JSON.parse(wall["study P-compensate"]),{version:1,values:[102,8,0],candidate:"line"});
    await click("Copy this review");
    assert.doesNotMatch(clipboard,/Keep the correction strip visible/);
    const compare=Array.from(document.querySelectorAll("label")).find(l=>l.textContent==="Compare")!.querySelector("input")!;
    await act(async()=>compare.click());
    assert.equal(document.querySelectorAll('[data-testid="learner-preview"]').length,2);
    await click("Copy this review");
    assert.match(clipboard,/102 × 8/);assert.match(clipboard,/E-compensate\/line/);assert.match(clipboard,/Keep the correction strip visible/);assert.match(clipboard,/boundary: 102 × 8/);
    await click("Copy study link");assert.match(clipboard,/candidate=line/);assert.match(clipboard,/v0=102/);
    const anchor=Array.from(document.querySelectorAll("button")).find(b=>b.textContent?.includes("98 × 7"))!;
    await act(async()=>anchor.click());
    await click("Restore saved study");assert.match(document.querySelector('[data-testid="study-prompt"]')!.textContent!,/102 × 8/);
    await act(async()=>anchor.click());failSave=true;
    await click("Save study");assert.match(document.querySelector('[role="status"]')!.textContent!,/Could not save/);
    assert.deepEqual(JSON.parse(wall["study P-compensate"]).values,[102,8,0]);
    assert.ok(writes.every(x=>x.startsWith("study ")));
  } catch (error) {
    if (error instanceof AggregateError) console.error(error.errors);
    throw error;
  } finally {
    await act(async()=>root.unmount());globalThis.fetch=oldFetch;dom.window.close();
  }
});
