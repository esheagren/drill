"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
export default function DsPreviewFrame({width,height=760,children}:{width:number;height?:number;children:ReactNode}) {
  const ref=useRef<HTMLDivElement>(null),[scale,setScale]=useState(1);
  useEffect(()=>{const el=ref.current;if(!el||typeof ResizeObserver==="undefined")return;const measure=()=>setScale(Math.min(1,el.clientWidth/width));const observer=new ResizeObserver(measure);observer.observe(el);measure();return()=>observer.disconnect();},[width]);
  return <div ref={ref} className="w-full max-w-full overflow-hidden rounded-2xl border border-gray-300 dark:border-gray-700" style={{maxWidth:width,height:height*scale}}><div style={{width,height,transform:`scale(${scale})`,transformOrigin:"top left"}}>{children}</div></div>;
}
