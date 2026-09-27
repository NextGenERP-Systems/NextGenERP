"use client";

import { MicrofrontendView } from "@/components/layout/MicrofrontendView";
import { Factory } from "lucide-react";

export default function MrpPortalPage() {
  return (
    <MicrofrontendView
      title="Manufacturing & MRP"
      subtitle="BOMs, Work Orders & Quality Inspection"
      badge="Manufacturing 360"
      icon={Factory}
      iconColor="text-rose-600"
      iconBg="bg-rose-100"
      src="http://localhost:3005"
      port={3005}
    />
  );
}
