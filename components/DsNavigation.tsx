"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SECTIONS, sectionFor } from "@/content/designspace/navigation";
import CopyFeedback from "./DsCopy";

export default function DsNavigation() {
  const path=usePathname(), current=sectionFor(path);
  return <>
    <header className="sticky top-0 z-20 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-black/95 backdrop-blur">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-5 min-h-14 flex flex-wrap items-center gap-4 py-2">
        <Link href="/designspace" className="text-sm text-gray-500 hidden sm:block">Drill · designspace</Link>
        <nav aria-label="DesignSpace" className="flex gap-1">{SECTIONS.map(s=><Link key={s.name} href={s.href} aria-current={s===current?"page":undefined} className={`px-3 py-1.5 rounded-lg text-sm ${s===current?"bg-gray-900 text-white dark:bg-gray-100 dark:text-black":"text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900"}`}>{s.name}</Link>)}</nav>
        <div className="ml-auto flex gap-3 items-center text-xs"><Link href="/designspace/help" className="text-gray-500">Help</Link><Link href="/" className="text-gray-500">← app</Link></div>
      </div>
    </header>
    <div className="max-w-[1680px] mx-auto px-5 pt-4 flex flex-wrap gap-x-5 gap-y-2 items-center">
      <nav aria-label={`${current.name} pages`} className="flex flex-wrap gap-x-5 gap-y-2">{current.links.map(([href,label])=><Link key={href} href={href} aria-current={path===href?"page":undefined} className={`text-xs py-1 border-b ${path===href?"border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100":"border-transparent text-gray-500"}`}>{label}</Link>)}</nav>
      <details className="ml-auto text-xs text-gray-500 relative"><summary className="cursor-pointer">Utilities</summary><div className="absolute right-0 z-20 mt-2 p-3 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm w-52"><CopyFeedback prefix="" scope="everything" label="Copy all saved feedback"/><p className="text-[11px] mt-2">For a complete archive. Use “Copy this review” inside a working view for a focused handoff.</p></div></details>
    </div>
  </>;
}
