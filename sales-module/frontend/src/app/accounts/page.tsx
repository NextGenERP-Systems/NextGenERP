"use client";

import { MicrofrontendView } from "@/components/layout/MicrofrontendView";
import { Landmark } from "lucide-react";

export default function AccountsPortalPage() {
  return (
    <MicrofrontendView
      title="Finance & Accounts"
      subtitle="Chart of Accounts, General Ledger & Banking"
      badge="Finance 360"
      icon={Landmark}
      iconColor="text-emerald-600"
      iconBg="bg-emerald-100"
      src="http://localhost:3004/accounts"
      port={3004}
    />
  );
}
