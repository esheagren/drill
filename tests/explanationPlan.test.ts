import { test } from "node:test";
import assert from "node:assert/strict";
import { PROBLEMS, explanationHandle, problemById, validateValues, type Values } from "../content/designspace/problems";
import { explanationPlan, type Diagram } from "../lib/explanationPlan";

function checkGeometry(d: Diagram) {
  if (d.kind === "line") {
    assert.ok(d.max > 0 && Number.isFinite(d.max));
    for (const t of d.ticks) assert.ok(t.value >= 0 && t.value <= d.max+1e-8);
  } else {
    const groups=d.kind==="bar" ? d.rows.map(r=>r.parts) : [d.parts];
    for(const parts of groups) {
      assert.ok(parts.length>0);
      assert.ok(parts.every(p=>Number.isFinite(p.value)&&p.value>=0));
      assert.ok(parts.reduce((s,p)=>s+p.value,0)>0);
    }
  }
}

test("every anchor, transfer, and boundary example agrees across strategies and has valid geometry",()=> {
  const handles=new Set<string>();
  for(const p of PROBLEMS) {
    for(const candidate of p.candidates) {
      const id=explanationHandle(p,candidate);
      assert.ok(!handles.has(id));handles.add(id);
      assert.match(`★ ${id}`,/^[A-Za-z0-9_/ ›★↕+.-]{1,60}$/);
    }
    for(const example of p.examples) {
      assert.equal(validateValues(p,example.values),null);
      const plans=p.candidates.map(c=>explanationPlan(p,c,example.values));
      assert.equal(plans[0].result,plans[1].result);
      assert.equal(plans[0].answer,plans[1].answer);
      for(const plan of plans) {
        assert.ok(plan.steps.length>=2);
        assert.ok(!JSON.stringify(plan).match(/NaN|Infinity|undefined/));
        plan.steps.forEach(s=>checkGeometry(s.diagram));
      }
    }
  }
  assert.equal(handles.size,16);
});

test("compensation removes below 100, adds above 100, and removes nothing at 100",()=> {
  const p=problemById("compensate")!;
  for(const a of [90,97,98,100,102,110]) for(const b of [2,7,12]) {
    const plan=explanationPlan(p,p.candidates[0],[a,b,0]);
    assert.equal(plan.result,a*b);
    const d=plan.steps.at(-1)!.diagram;assert.equal(d.kind,"area");
    if(d.kind!=="area")throw new Error();
    const represented=d.parts.filter(p=>p.tone!=="remove").reduce((s,p)=>s+p.value*d.height,0);
    assert.equal(represented,a*b);
    assert.equal(d.parts.filter(p=>p.tone==="remove").reduce((s,p)=>s+p.value*d.height,0),Math.max(0,100-a)*b);
  }
});

test("division reconstructs the total including exact division and many small groups",()=> {
  const p=problemById("division")!;
  for(let total=12;total<=100;total++) for(let divisor=2;divisor<=12;divisor++) {
    const plan=explanationPlan(p,p.candidates[0],[total,divisor,0]);
    assert.equal(plan.result,Math.floor(total/divisor));
    const d=plan.steps[0].diagram;assert.equal(d.kind,"bar");
    if(d.kind==="bar")assert.equal(d.rows[0].parts.reduce((s,p)=>s+p.value,0),total);
  }
});

test("fraction equivalence preserves whole and selected length",()=> {
  const p=problemById("equivalence")!;
  for(let b=2;b<=12;b++) for(let a=1;a<=b;a++) for(let c=2;c<=4;c++) {
    const plan=explanationPlan(p,p.candidates[0],[a,b,c]);
    const d=plan.steps[0].diagram;if(d.kind!=="bar")throw new Error();
    for(const r of d.rows) {
      assert.ok(Math.abs(r.parts.reduce((s,p)=>s+p.value,0)-1)<1e-8);
      assert.ok(Math.abs(r.parts.filter(p=>p.tone==="focus").reduce((s,p)=>s+p.value,0)-a/b)<1e-8);
    }
  }
});

test("reverse and successive percents use the correct reference whole",()=> {
  const reverse=problemById("reverse-percent")!;
  assert.equal(explanationPlan(reverse,reverse.candidates[0],[20,160,0]).result,200);
  const chain=problemById("successive-percent")!;
  const plan=explanationPlan(chain,chain.candidates[0],[20,20,100]);
  assert.equal(plan.result,96);
  const d=plan.steps[0].diagram;if(d.kind!=="bar")throw new Error();
  assert.equal(d.rows[2].parts.find(p=>p.tone==="remove")!.value,24);
  assert.equal(explanationPlan(chain,chain.candidates[1],[25,20,80]).result,80);
});

test("reject invalid inputs and mark rounded quantities",()=> {
  const p=problemById("fraction-of")!;
  for(const v of [[1,0,24],[9,8,24],[1,3,NaN],[1,3,Infinity],[1.5,3,24]] as Values[]) {
    assert.ok(validateValues(p,v));assert.throws(()=>explanationPlan(p,p.candidates[0],v));
  }
  assert.match(explanationPlan(p,p.candidates[0],[1,3,10]).answer,/≈/);
  assert.throws(()=>explanationPlan(p,problemById("compensate")!.candidates[0],[1,3,10]));
});
