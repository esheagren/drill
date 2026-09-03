"use client";

import { useEffect, useRef, useState } from "react";

/** A real phone viewport (390×844 CSS px, iPhone 14/15) scaled to fit its container — so proportions are exact. */
export default function PhoneFrame({ src, title, children, w = 390, h = 844 }: { src?: string; title: string; children?: React.ReactNode; w?: number; h?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(0.5);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const ro = new ResizeObserver(() => setK(el.clientWidth / w));
    ro.observe(el); setK(el.clientWidth / w);
    return () => ro.disconnect();
  }, [w]);
  return (
    <div ref={ref} className="w-full rounded-[22px] border border-gray-300 dark:border-gray-700 overflow-hidden bg-black" style={{ height: h * k }}>
      <div style={{ width: w, height: h, transform: `scale(${k})`, transformOrigin: "top left" }}>
        {src ? <iframe src={src} title={title} width={w} height={h} className="block bg-black" loading="lazy" style={{ border: 0 }} /> : children}
      </div>
    </div>
  );
}
