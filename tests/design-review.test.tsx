import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { act } from "react";
import { designHash, formatScopedReview, parseReview, reviewHref, type ReviewContext } from "../lib/designReview";
import { formatFeedback } from "../lib/dsFeedback";
import { initialSelections } from "../lib/decisionSelection";
import { DECISIONS } from "../content/designspace/decisions";

const context:ReviewContext={question:"Can the correction be seen?",example:"98 × 7",view:"390 px · all steps",version:"abc123",link:"/designspace/screens#V2"};
const note=(text:string,resolved=false)=>JSON.stringify({schema:1,target:"V2 › Prompt",text,resolved,created:"2026-09-06T00:00:00Z",context});

test("focused exports keep exact scope boundaries, context and decisions, excluding resolved feedback",()=>{
  const rows=[{page:"V2",text:"Legacy screen note"},{page:"V2 › Prompt",text:"Legacy component note"},{page:"V2b",text:"Percent unrelated"},{page:"review V2/a",text:note("Open correction")},{page:"review V2/b",text:note("Finished correction",true)},{page:"review V2b/c",text:note("Unrelated review")},{page:"decision V2",text:JSON.stringify({schema:1,choice:"Compact",reason:"Fits the correction",status:"chosen",at:"today",context})}];
  const out=formatScopedReview(rows,["V2"],context,"Selected plan");
  for(const expected of ["Legacy screen note","Legacy component note","Open correction","98 × 7","abc123","Selected plan","Fits the correction"])assert.ok(out.includes(expected));
  for(const excluded of ["Percent unrelated","Finished correction","Unrelated review"])assert.ok(!out.includes(excluded));
  const archive=formatFeedback(rows,"everything");assert.match(archive,/resolved\n98 × 7/);assert.match(archive,/Reason: Fits the correction/);assert.doesNotMatch(archive,/"schema":1/);
  assert.equal(parseReview({page:"review V2/bad",text:'{"schema":1}'}),null);
  assert.equal(reviewHref("http://["),"/designspace");assert.equal(reviewHref("javascript:alert(1)"),"/designspace");
  assert.equal(reviewHref("https://preview.vercel.app/designspace/screens?device=laptop#V2"),"/designspace/screens?device=laptop#V2");
  assert.equal(designHash("#%ZZ"),"");
});

test("legacy picks and stars restore the version; a saved preview is independent of later stars",()=>{
  const wall={"pick D-keypad":"calculator","★ D-timer/progress-line":"starred"};
  const recovered=initialSelections(DECISIONS,wall);
  assert.equal(recovered["D-keypad"],"calculator");assert.equal(recovered["D-timer"],"progress-line");
  const persisted={...wall,"preview screen-options":JSON.stringify(recovered),"★ D-keypad/calculator":"","★ D-keypad/phone":"starred"};
  assert.deepEqual(initialSelections(DECISIONS,persisted),recovered);
  assert.doesNotThrow(()=>initialSelections(DECISIONS,{"preview screen-options":"null"}));
});

async function harness(url="http://localhost/designspace/screens#V2",initial:Record<string,string>={}) {
  const dom=new JSDOM('<!doctype html><div id="root"></div>',{url});
  Object.assign(globalThis,{window:dom.window,self:dom.window,document:dom.window.document,HTMLElement:dom.window.HTMLElement,sessionStorage:dom.window.sessionStorage,localStorage:dom.window.localStorage,MutationObserver:dom.window.MutationObserver,ResizeObserver:class{observe(){} disconnect(){}},IS_REACT_ACT_ENVIRONMENT:true});
  Object.defineProperty(globalThis,"navigator",{configurable:true,value:dom.window.navigator});
  let clipboard="",fail=false;const wall={...initial},writes:string[]=[];const oldFetch=globalThis.fetch;
  Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText:async(s:string)=>{clipboard=s;}}});
  globalThis.fetch=(async(input,init)=>{
    const u=new URL(String(input),dom.window.location.origin);assert.equal(u.pathname,"/api/designspace/notes");
    if(init?.method==="PUT") {const b=JSON.parse(String(init.body));if(fail)return new Response("{}",{status:500});wall[b.page]=b.text;writes.push(b.page);return Response.json({ok:true});}
    const prefix=u.searchParams.get("prefix");return Response.json(prefix===null?{text:wall[u.searchParams.get("page")!]??""}:{notes:Object.entries(wall).filter(([p,t])=>p.startsWith(prefix)&&t).map(([page,text])=>({page,text}))});
  }) as typeof fetch;
  const {createRoot}=await import("react-dom/client");const root=createRoot(document.getElementById("root")!);
  const click=async(label:string)=>{const b=Array.from(document.querySelectorAll("button")).find(b=>b.textContent===label);assert.ok(b,`Missing button ${label}`);assert.ok(!b.disabled);await act(async()=>b.click());};
  const input=async(el:HTMLTextAreaElement|HTMLSelectElement,value:string)=>{await act(async()=>{const proto=el.tagName==="TEXTAREA"?dom.window.HTMLTextAreaElement.prototype:dom.window.HTMLSelectElement.prototype;Object.getOwnPropertyDescriptor(proto,"value")!.set!.call(el,value);el.dispatchEvent(new dom.window.Event("input",{bubbles:true}));el.dispatchEvent(new dom.window.Event("change",{bubbles:true}));});};
  return {dom,root,wall,writes,click,input,clipboard:()=>clipboard,fail:(v:boolean)=>{fail=v;},close:async()=>{await act(async()=>root.unmount());globalThis.fetch=oldFetch;dom.window.close();}};
}

test("review notes retain exact context and drafts, support resolve/reopen, and report save failure",async()=>{
  const h=await harness();const {default:Panel}=await import("../components/DesignReviewPanel");
  try {
    await act(async()=>h.root.render(<Panel scope="V2" context={context} targets={["V2 › Prompt"]}/>));
    await h.input(document.querySelector('textarea[id]')!,"Keep the correction strip visible");
    await h.input(document.querySelector('select')!,"V2 › Prompt");
    h.fail(true);await h.click("Add feedback");assert.match(document.querySelector('[role="alert"]')!.textContent!,/Could not save/);assert.equal(h.writes.length,0);
    assert.equal(document.querySelector<HTMLTextAreaElement>('textarea[id]')!.value,"Keep the correction strip visible");
    // Changing the example must not attach an old draft to a new case.
    await act(async()=>h.root.render(<Panel scope="V2" context={{...context,example:"102 × 8"}}/>));
    assert.equal(document.querySelector<HTMLTextAreaElement>('textarea[id]')!.value,"");
    await act(async()=>h.root.render(<Panel scope="V2" context={context} targets={["V2 › Prompt"]}/>));
    assert.equal(document.querySelector<HTMLTextAreaElement>('textarea[id]')!.value,"Keep the correction strip visible");
    h.fail(false);await h.click("Add feedback");
    const key=h.writes[0];assert.match(key,/^review V2\//);assert.ok(key.length<=60);
    const saved=JSON.parse(h.wall[key]);assert.equal(saved.target,"V2 › Prompt");assert.equal(saved.context.example,"98 × 7");assert.equal(saved.context.version,"abc123");
    await h.click("Copy this review");assert.match(h.clipboard(),/Keep the correction strip visible/);
    await h.click("Resolve");assert.equal(JSON.parse(h.wall[key]).resolved,true);
    await h.click("Copy this review");assert.doesNotMatch(h.clipboard(),/Keep the correction strip visible/);
    const resolved=Array.from(document.querySelectorAll("label")).find(l=>l.textContent==="Resolved")!.querySelector("input")!;
    await act(async()=>resolved.click());await h.click("Reopen");assert.equal(JSON.parse(h.wall[key]).resolved,false);
  }finally{await h.close();}
});

test("screen deep links render one safe preview with outlines off, and switch without adding frames",async()=>{
  const h=await harness("http://localhost/designspace/screens#V4");const {default:Screens}=await import("../app/designspace/screens/page");
  try {
    await act(async()=>h.root.render(<Screens/>));
    assert.equal(document.querySelectorAll("iframe").length,1);assert.equal(document.querySelector("iframe")!.getAttribute("src"),"/?demo=summary");
    assert.equal(Array.from(document.querySelectorAll("label")).find(l=>l.textContent?.includes("Component outlines"))!.querySelector("input")!.checked,false);
    const link=document.querySelector<HTMLAnchorElement>('a[href="#V1"]')!;await act(async()=>link.click());
    assert.equal(document.querySelectorAll("iframe").length,1);assert.equal(document.querySelector("iframe")!.getAttribute("src"),"/?demo=answer");assert.equal(h.writes.length,0);
  }finally{await h.close();}
});

test("screen options keep stars separate and record an explicit reason with reopenable status",async()=>{
  const h=await harness("http://localhost/designspace/decisions#D-keypad",{"pick D-keypad":"calculator"});const {default:Decisions}=await import("../app/designspace/decisions/page");
  try {
    await act(async()=>h.root.render(<Decisions/>));
    const select=document.querySelector<HTMLSelectElement>('select[aria-label^="Select "]')!;assert.equal(select.value,"calculator");
    const other=Array.from(select.options).find(o=>o.value!=="calculator")!.value;
    await h.input(select,other);const star=document.querySelector<HTMLButtonElement>('button[aria-label="star"]')!;await act(async()=>star.click());
    assert.equal(select.value,other);assert.equal(h.wall["pick D-keypad"],"calculator");assert.ok(!h.wall["decision D-keypad"]);
    await h.input(document.querySelector('textarea[aria-label="Decision reason"]')!,"The thumb can reach the main keys.");
    await h.click("Choose for implementation");assert.equal(h.wall["pick D-keypad"],other);assert.equal(h.wall["status D-keypad"],"decided");assert.match(JSON.parse(h.wall["decision D-keypad"]).reason,/thumb/);
    await h.click("Reopen decision");assert.equal(h.wall["status D-keypad"],"working");assert.equal(JSON.parse(h.wall["decision D-keypad"]).status,"reopened");
  }finally{await h.close();}
});
