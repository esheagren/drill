import Link from "next/link";
export default function Reference() {
  return <div className="max-w-4xl"><h1 className="text-2xl font-light">Reference</h1><p className="text-sm text-gray-500 mt-2 mb-8">The product intent and shared design language behind the work.</p>
    <div className="grid sm:grid-cols-2 gap-8">{[
      {title:"Product", links:[["/designspace/framing","Product brief","Who Drill serves, what it promises, and the session program."],["/designspace/principles","Design principles","The feeling and standards used to judge a direction."]]},
      {title:"Mathematical explanations",links:[["/designspace/problems","Problem families","Concepts, skill IDs, and anchor, transfer, and boundary examples."],["/designspace/widgets","Representation families","Bars, arrays, lines, their rules, and the source material."]]},
    ].map(g=><section key={g.title}><h2 className="text-xs uppercase tracking-wide text-gray-500 mb-4">{g.title}</h2>{g.links.map(([href,title,description])=><Link key={href} href={href} className="block py-4 border-t border-gray-200 dark:border-gray-800"><div className="text-lg">{title} →</div><p className="text-sm text-gray-500 mt-1">{description}</p></Link>)}</section>)}</div>
  </div>;
}
