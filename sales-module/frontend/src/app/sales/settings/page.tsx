"use client";

import { useState } from "react";
import {
  Settings,
  FileText,
  Percent,
  Truck,
  Calendar,
  CheckCircle2,
  Plus,
  ShieldCheck,
  Building,
  Save,
  Home,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export default function SellingSettingsPage() {
  const [activeTab, setActiveTab] = useState<
    "settings" | "terms" | "taxes" | "shipping" | "distribution"
  >("settings");
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-4 text-[#1f272e] font-sans text-xs bg-white min-h-full pb-16">
      {/* Top ERPNext Navbar & Breadcrumbs Header Bar */}
      <div className="h-12 flex items-center justify-between gap-3 px-6 border-b border-gray-200 bg-white sticky top-0 z-20">
        <div className="flex items-center gap-2 overflow-x-auto text-[13px]">
          <Link href="/sales" className="text-gray-500 hover:text-gray-900 flex items-center">
            <Home className="w-4 h-4 text-gray-500" />
          </Link>
          <span className="text-gray-400 font-light">/</span>
          <Link href="/sales" className="text-gray-600 hover:text-gray-900 font-normal">
            Selling
          </Link>
          <span className="text-gray-400 font-light">/</span>
          <span className="font-bold text-gray-900">
            Selling Settings
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="px-3.5 py-1.5 rounded bg-gray-900 hover:bg-gray-800 text-white font-medium text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      <div className="px-6 space-y-4">

      {isSaved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Selling settings and configurations saved successfully!</span>
        </div>
      )}

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 text-xs font-medium overflow-x-auto">
        {[
          { id: "settings", label: "Selling Settings", icon: Settings },
          { id: "terms", label: "Terms & Conditions Templates", icon: FileText },
          { id: "taxes", label: "Sales Taxes & Charges Templates", icon: Percent },
          { id: "shipping", label: "Shipping Rules", icon: Truck },
          { id: "distribution", label: "Monthly Distribution", icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 transition-colors border-b-2 -mb-px whitespace-nowrap ${
                isActive
                  ? "border-blue-600 text-blue-600 font-semibold"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SELLING SETTINGS */}
      {/* ========================================================================= */}
      {activeTab === "settings" && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-5 max-w-3xl">
          <div className="pb-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">General Selling Policy</h3>
            <p className="text-xs text-gray-500">Configure global defaults for orders, credit limits, and stock</p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Customer Naming By</label>
                <select className="w-full bg-white border border-gray-200 rounded p-2 text-gray-800">
                  <option>Customer Name</option>
                  <option>Naming Series (CUST-00001)</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Default Credit Limit (₹)</label>
                <input
                  type="number"
                  defaultValue="100000"
                  className="w-full bg-white border border-gray-200 rounded p-2 text-gray-800 font-mono font-semibold"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
                <span className="font-medium text-gray-800">Enforce Customer Credit Limit Check prior to Order Submission</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
                <span className="font-medium text-gray-800">Auto-create Stock Reservation Entries (SRE) on Sales Order Submission</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
                <span className="font-medium text-gray-800">Allow Multiple Quotations per Customer</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TERMS & CONDITIONS TEMPLATES */}
      {/* ========================================================================= */}
      {activeTab === "terms" && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Terms & Conditions Templates</h3>
              <p className="text-xs text-gray-500">Reusable clause templates for Quotations and Sales Orders</p>
            </div>
            <button className="px-3 py-1.5 rounded bg-blue-600 text-white text-xs font-medium hover:bg-blue-700">
              + New Terms Template
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50 space-y-2 text-xs">
            <div className="font-bold text-gray-900 text-sm">Standard B2B Enterprise Terms Template</div>
            <div className="bg-white p-3 rounded border border-gray-200 font-mono text-gray-700 space-y-1">
              <p>1. Payment terms: 30 days net from invoice date.</p>
              <p>2. Late payments incur 1.5% interest per month.</p>
              <p>3. Goods remain company property until full payment is received.</p>
              <p>4. Delivery SLA: 5-7 business days from order confirmation.</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: TAXES & CHARGES TEMPLATES */}
      {/* ========================================================================= */}
      {activeTab === "taxes" && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Sales Taxes & Charges Templates</h3>
              <p className="text-xs text-gray-500">Multi-tier tax rules and charge calculation schemes</p>
            </div>
            <button className="px-3 py-1.5 rounded bg-blue-600 text-white text-xs font-medium hover:bg-blue-700">
              + New Tax Template
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <span className="font-bold text-gray-900 text-sm">Standard State & Municipal Sales Tax (8.25%)</span>
              <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-mono font-bold">Default</span>
            </div>

            <table className="w-full text-xs text-left bg-white rounded border border-gray-200 overflow-hidden">
              <thead className="bg-gray-50 text-gray-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3">Account Head</th>
                  <th className="py-2 px-3">Rate %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono">
                <tr>
                  <td className="py-2 px-3 text-gray-600">ON_NET_TOTAL</td>
                  <td className="py-2 px-3 font-semibold text-gray-900">State Sales Tax</td>
                  <td className="py-2 px-3 font-bold text-blue-600">6.25%</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-gray-600">ON_NET_TOTAL</td>
                  <td className="py-2 px-3 font-semibold text-gray-900">Municipal Surcharge</td>
                  <td className="py-2 px-3 font-bold text-blue-600">2.00%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SHIPPING RULES */}
      {/* ========================================================================= */}
      {activeTab === "shipping" && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Shipping Rules & Freight Charges</h3>
              <p className="text-xs text-gray-500">Tiered shipping charges based on order weight or total value</p>
            </div>
            <button className="px-3 py-1.5 rounded bg-blue-600 text-white text-xs font-medium hover:bg-blue-700">
              + New Shipping Rule
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: "Standard Ground Express", condition: "Order Amount < ₹ 50,000", charge: "₹ 450.00" },
              { name: "Free Expedited Freight", condition: "Order Amount >= ₹ 50,000", charge: "₹ 0.00 (Free)" },
            ].map((rule, idx) => (
              <div key={idx} className="p-4 border border-gray-200 rounded-lg bg-gray-50/50 space-y-2 text-xs">
                <div className="font-bold text-gray-900 text-sm">{rule.name}</div>
                <div className="text-gray-500 flex justify-between">
                  <span>Condition:</span>
                  <span className="font-mono text-gray-800">{rule.condition}</span>
                </div>
                <div className="text-gray-500 flex justify-between">
                  <span>Charge:</span>
                  <span className="font-mono text-blue-600 font-bold">{rule.charge}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: MONTHLY DISTRIBUTION */}
      {/* ========================================================================= */}
      {activeTab === "distribution" && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Monthly Sales Target Distribution Schedule</h3>
              <p className="text-xs text-gray-500">Define annual sales target percentage allocation across months</p>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 font-mono text-xs">
            {["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"].map((m, idx) => (
              <div key={m} className="p-2.5 bg-gray-50 border border-gray-200 rounded text-center">
                <div className="text-gray-500 text-[10px] uppercase font-sans font-semibold">{m}</div>
                <div className="text-sm font-bold text-gray-900 mt-1">8.33%</div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
