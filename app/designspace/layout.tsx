import DsNavigation from "@/components/DsNavigation";
export default function DesignspaceLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-white dark:bg-black text-gray-900 dark:text-gray-100"><DsNavigation/><div className="max-w-[1680px] mx-auto px-5 py-6">{children}</div></div>;
}
