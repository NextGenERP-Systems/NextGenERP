"use client";

import { MicrofrontendView } from "@/components/layout/MicrofrontendView";
import { Boxes } from "lucide-react";

export default function StockPortalPage() {
  return (
    <MicrofrontendView
      title="Stock & Inventory"
      subtitle="Double-Entry Ledger, Multi-Warehouse & Bins"
      badge="Supply Chain 360"
      icon={Boxes}
      iconColor="text-teal-600"
      iconBg="bg-teal-100"
      src="http://localhost:3006/stock"
      port={3006}
    />
  );
}
