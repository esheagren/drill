import { Suspense } from "react";
import ExplanationWorkbench from "@/components/ExplanationWorkbench";

export default function WorkbenchPage() {
  return <Suspense fallback={<p className="text-sm text-gray-500">Opening explanation workbench…</p>}><ExplanationWorkbench/></Suspense>;
}
