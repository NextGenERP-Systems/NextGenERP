import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NextGen ERP | Workflow Automation",
  description: "Enterprise Document & Workflow Automation System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-slate-50 text-slate-900 flex overflow-x-hidden`}>
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
