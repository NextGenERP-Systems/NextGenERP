import { Suspense } from "react";
import { Sidebar } from "@/components/layout/Sidebar";

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full min-h-screen bg-slate-50 overflow-x-hidden font-sans">
      <Suspense fallback={<div className="w-56 bg-[#f8f8f8] border-r border-gray-200 h-screen sticky top-0" />}>
        <Sidebar />
      </Suspense>
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        <main className="flex-1 overflow-auto bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
