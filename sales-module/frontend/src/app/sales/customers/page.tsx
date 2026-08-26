"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  ShieldCheck,
  AlertCircle,
  CreditCard,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import { getCustomers } from "@/lib/api";
import { Customer } from "@/types/sales";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCustomers() {
      setLoading(true);
      try {
        const data = await getCustomers();
        setCustomers(data);
        if (data.length > 0) setSelectedCustomer(data[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCustomers();
  }, []);

  const filteredCustomers = customers.filter(
    (c) =>
      c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customerCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Customer 360 & Credit Master
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise customer relationship profiles, credit limits, addresses, and contacts.
          </p>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-100 border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
          />
        </div>
      </div>

      {/* Main Grid: Customer List on Left, Customer 360 View on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Customer Directory (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {filteredCustomers.map((cust) => {
            const isSelected = selectedCustomer?.id === cust.id;
            const utilization = (cust.outstandingBalance / (cust.creditLimit || 1)) * 100;
            return (
              <div
                key={cust.id}
                onClick={() => setSelectedCustomer(cust)}
                className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                  isSelected
                    ? "bg-slate-100 border-blue-300 shadow-md"
                    : "glass-card hover:border-blue-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-sm text-slate-900">{cust.customerName}</div>
                    <div className="font-mono text-[11px] text-slate-400">{cust.customerCode}</div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-slate-400" />{cust.customerType}</span>
                </div>

                {/* Credit Limit Usage Bar */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-slate-400">Credit Used:</span>
                    <span className="font-bold text-slate-700">
                      {formatCurrency(cust.outstandingBalance)} / {formatCurrency(cust.creditLimit)}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        utilization > 80 ? "bg-red-500" : utilization > 50 ? "bg-amber-400" : "bg-emerald-400"
                      }`}
                      style={{ width: `${Math.min(100, utilization)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Customer 360 Detail Card (7 cols) */}
        <div className="lg:col-span-7">
          {selectedCustomer ? (
            <Card className="border-slate-200 space-y-6 p-6">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900">{selectedCustomer.customerName}</h2>
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                    <span>Code: {selectedCustomer.customerCode}</span>
                    <span>•</span>
                    <span>Group: {selectedCustomer.customerGroupName || "Commercial"}</span>
                    <span>•</span>
                    <span>Territory: {selectedCustomer.territoryName || "North America"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedCustomer.bypassCreditLimitCheck ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-700"><span className="h-1.5 w-1.5 rounded-full bg-orange-400" />Bypass Credit Check</span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700"><span className="h-1.5 w-1.5 rounded-full bg-green-500" />Credit Guard Active</span>
                  )}
                </div>
              </div>

              {/* Financial & Credit Snapshot */}
              <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-slate-400 text-[10px] uppercase">Credit Limit</div>
                  <div className="text-sm font-bold text-slate-900">{formatCurrency(selectedCustomer.creditLimit)}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-slate-400 text-[10px] uppercase">Outstanding Balance</div>
                  <div className="text-sm font-bold text-amber-400">{formatCurrency(selectedCustomer.outstandingBalance)}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-slate-400 text-[10px] uppercase">Available Credit</div>
                  <div className="text-sm font-bold text-emerald-400">{formatCurrency(selectedCustomer.availableCredit)}</div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Contact Coordinates
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {selectedCustomer.email && (
                    <div className="flex items-center gap-2 p-2.5 rounded bg-slate-50 border border-slate-200 truncate">
                      <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="truncate text-slate-500">{selectedCustomer.email}</span>
                    </div>
                  )}
                  {selectedCustomer.phone && (
                    <div className="flex items-center gap-2 p-2.5 rounded bg-slate-50 border border-slate-200">
                      <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="text-slate-500">{selectedCustomer.phone}</span>
                    </div>
                  )}
                  {selectedCustomer.website && (
                    <div className="flex items-center gap-2 p-2.5 rounded bg-slate-50 border border-slate-200 truncate">
                      <Globe className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="truncate text-slate-500">{selectedCustomer.website}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Primary Address & Contacts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-200 pt-4">
                {/* Addresses */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Registered Addresses
                  </div>
                  {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 ? (
                    selectedCustomer.addresses.map((addr, idx) => (
                      <div key={idx} className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs text-slate-500 space-y-1">
                        <div className="font-semibold text-slate-700">{addr.addressTitle} ({addr.addressType})</div>
                        <div>{addr.addressLine1}</div>
                        <div>{addr.city}, {addr.state} {addr.pincode}, {addr.country}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-blue-7000 italic">No addresses registered.</div>
                  )}
                </div>

                {/* Primary Contacts */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" /> Key Stakeholders
                  </div>
                  {selectedCustomer.contacts && selectedCustomer.contacts.length > 0 ? (
                    selectedCustomer.contacts.map((cnt, idx) => (
                      <div key={idx} className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs text-slate-500 space-y-1">
                        <div className="font-semibold text-slate-700">{cnt.firstName} {cnt.lastName}</div>
                        <div className="text-slate-400">{cnt.designation}</div>
                        <div className="font-mono text-[11px] text-slate-400">{cnt.emailId}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-blue-7000 italic">No contact persons registered.</div>
                  )}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="border-slate-200 p-8 text-center text-xs text-slate-400">
              Select a customer to view 360 profile and credit parameters.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
