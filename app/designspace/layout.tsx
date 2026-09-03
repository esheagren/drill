import Link from "next/link";
import CopyFeedback from "@/components/DsCopy";

const NAV = [
  ["/designspace", "Room"],
  ["/designspace/screens", "Screens"],
  ["/designspace/decisions", "Decisions"],
  ["/designspace/widgets", "Widgets"],
  ["/designspace/ideas", "Ideas"],
  ["/designspace/principles", "Principles"],
] as const;

export default function DesignspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-white dark:bg-black text-gray-900 dark:text-gray-100">
      <nav className="sticky top-0 z-10 backdrop-blur bg-white/80 dark:bg-black/80 border-b border-gray-100 dark:border-gray-900">
        <div className="max-w-[1680px] mx-auto px-5 h-11 flex items-center gap-1 overflow-x-auto text-sm">
          <span className="text-gray-400 mr-3 shrink-0">Drill · designspace</span>
          {NAV.map(([href, label]) => (
            <Link key={href} href={href} className="px-2.5 py-1 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 whitespace-nowrap">{label}</Link>
          ))}
          <CopyFeedback prefix="" scope="everything" label="copy all feedback" className="ml-auto shrink-0" />
          <Link href="/" className="text-gray-400 shrink-0">← app</Link>
        </div>
      </nav>
      <div className="max-w-[1680px] mx-auto px-5 py-8">{children}</div>
    </div>
  );
}
