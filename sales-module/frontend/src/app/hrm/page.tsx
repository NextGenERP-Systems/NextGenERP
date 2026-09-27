"use client";

import { MicrofrontendView } from "@/components/layout/MicrofrontendView";
import { Users } from "lucide-react";

export default function HrmPortalPage() {
  return (
    <MicrofrontendView
      title="HRM & People Ops"
      subtitle="Employee 360, Payroll & Attendance"
      badge="Enterprise HR"
      icon={Users}
      iconColor="text-indigo-600"
      iconBg="bg-indigo-100"
      src="http://localhost:3001/hrm"
      port={3001}
    />
  );
}
