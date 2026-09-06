import Link from "next/link";
export default function Help() {
  return <div className="max-w-2xl"><h1 className="text-2xl font-light">Working in DesignSpace</h1><p className="text-sm text-gray-500 mt-2">A workspace for you and AI collaborators. Learners see the resulting product.</p>
    <ol className="list-decimal pl-5 space-y-5 text-sm mt-8">
      <li><b>Review the current product.</b> Open one screen, choose the example, and leave feedback beside it. Component outlines are available when you need to point at a particular element.</li>
      <li><b>Explore a question.</b> Select one candidate; turn on Compare when you want two. Examples and device controls apply to the preview.</li>
      <li><b>Use consistent actions.</b> Star shortlists. Select changes the preview. Choose for implementation records a decision and its reason. Resolve closes a feedback item after checking it. None of these deploys code.</li>
      <li><b>Hand over a focused review.</b> Copy this review includes the selected context, open feedback, and relevant saved notes. Version, example, and step are captured with new feedback. Older notes remain available in their original locations.</li>
      <li><b>Keep using the handles.</b> V2 names a screen; D-miss a screen decision; P-compensate a problem; E-compensate/area an explanation; W-bar a representation. Existing links and handles still work.</li>
    </ol>
    <p className="text-sm mt-8">Try: “Review the open feedback on V2” or “Compare E-compensate/area and E-compensate/line on the boundary example.”</p>
    <Link href="/designspace" className="inline-block mt-8 text-sm underline">Return to Review →</Link>
  </div>;
}
