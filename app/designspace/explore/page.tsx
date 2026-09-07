import Link from "next/link";
import { QUESTIONS } from "@/content/designspace/navigation";
export default function Explore() {
  return <div className="max-w-4xl"><h1 className="text-2xl font-light">Explore a design question</h1><p className="text-sm text-gray-500 mt-2 mb-8">Choose the question first. Its screen, examples, and constraints stay close to the work.</p>
    <div className="divide-y divide-gray-200 dark:divide-gray-800">{QUESTIONS.map(q=><section key={q.id} className="py-6"><h2 className="text-lg">{q.title}</h2><p className="text-sm text-gray-500 mt-1">{q.detail}</p><div className="flex flex-wrap gap-5 text-sm mt-4"><Link className="underline underline-offset-4" href={q.explore}>Explore options →</Link><Link className="text-gray-500" href={q.review}>Review current product</Link><Link className="text-gray-500" href={q.reference}>Read the brief</Link></div></section>)}</div>
    <details className="mt-8 text-sm text-gray-500"><summary className="cursor-pointer">Browse all explorations</summary><div className="flex flex-wrap gap-5 mt-4"><Link href="/designspace/decisions">Screen options</Link><Link href="/designspace/workbench">Explanation workbench</Link><Link href="/designspace/ideas">Sketch archive</Link></div></details>
  </div>;
}
