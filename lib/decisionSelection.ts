import type { Decision } from "../content/designspace/decisions";
export const axisKey=(d:Decision,axis:string)=>d.axes.length>1?`D-${d.id}/${axis}`:`D-${d.id}`;
/** Explicit picks win. Legacy stars are used only to recover the existing version. */
export function initialSelections(decisions:Decision[], wall:Record<string,string>):Record<string,string> {
  let preview:Record<string,string>={};
  try {preview=JSON.parse(wall["preview screen-options"]||"{}");}catch{}
  return Object.fromEntries(decisions.flatMap(d=>d.axes.map(a=> {
    const key=axisKey(d,a.id), explicit=preview?.[key] ?? wall[`pick ${key}`];
    const option=a.options.find(o=>o.id===explicit) ?? a.options.find(o=>!!wall[`★ D-${d.id}/${o.id}`]) ?? a.options.find(o=>o.current) ?? a.options[0];
    return [key,option.id];
  })));
}
