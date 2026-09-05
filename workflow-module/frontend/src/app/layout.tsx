import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Toaster } from 'sonner';
import { OnboardingWidget } from "@/components/OnboardingWidget";
import { ModalProvider } from "@/components/ModalContext";
import { AuthProvider } from "@/app/context/AuthContext";

import TopNav from "@/components/layout/TopNav";

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
        <AuthProvider>
          <ModalProvider>
            <div className="flex w-full min-h-screen bg-white">
              <Sidebar />
              <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
                <TopNav />
                <main className="flex-1 overflow-auto bg-slate-50">
                  {children}
                </main>
              </div>
            </div>
            <Toaster position="bottom-right" richColors />
            <OnboardingWidget />
          </ModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
