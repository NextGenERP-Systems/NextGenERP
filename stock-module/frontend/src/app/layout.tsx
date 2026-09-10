import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "NextGen ERP — Stock & Inventory Core",
  description: "Next-Generation Enterprise Resource Planning - Stock & Inventory Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 flex overflow-x-hidden antialiased font-sans">
        <div className="flex w-full min-h-screen bg-white">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 bg-white">
            <main className="flex-1 overflow-auto bg-white">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
