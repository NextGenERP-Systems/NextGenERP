"use client";

import { useState } from "react";
import {
  Monitor,
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  CreditCard,
  Banknote,
  DollarSign,
  User,
  Sliders,
  Award,
  Clock,
  Layers,
  ArrowRight,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Home,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

interface CartItem {
  id: string;
  name: string;
  code: string;
  rate: number;
  qty: number;
  discount: number;
}

export default function POSPage() {
  const [activeSubTab, setActiveSubTab] = useState<
    "terminal" | "profiles" | "opening" | "closing" | "loyalty"
  >("terminal");

  // Terminal State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedCustomer, setSelectedCustomer] = useState("CUST-001");
  const [cart, setCart] = useState<CartItem[]>([
    {
      id: "ITEM-001",
      name: "Enterprise Server Blade X1",
      code: "SKU-SRV-01",
      rate: 45000,
      qty: 1,
      discount: 0,
    },
  ]);

  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"CASH" | "CARD" | "UPI">("CASH");
  const [paidAmount, setPaidAmount] = useState("");
  const [isInvoiceSubmitted, setIsInvoiceSubmitted] = useState(false);

  // Sample Catalog Items
  const catalogItems = [
    { id: "ITEM-001", name: "Enterprise Server Blade X1", code: "SKU-SRV-01", category: "Hardware", rate: 45000, stock: 18 },
    { id: "ITEM-002", name: "Managed Switch 48-Port", code: "SKU-[#NET-02]", category: "Networking", rate: 12500, stock: 24 },
    { id: "ITEM-003", name: "Fiber Optic Patch Cable 10m", code: "SKU-CBL-10M", category: "Accessories", rate: 850, stock: 150 },
    { id: "ITEM-004", name: "SaaS License Annual Enterprise", code: "SKU-SFW-ENT", category: "Software", rate: 95000, stock: 999 },
    { id: "ITEM-005", name: "Rack Cabinet 42U Heavy Duty", code: "SKU-RCK-42U", category: "Hardware", rate: 32000, stock: 7 },
    { id: "ITEM-006", name: "Wireless Access Point Wi-Fi 6E", code: "SKU-AP-6E", category: "Networking", rate: 18500, stock: 32 },
  ];

  const filteredCatalog = catalogItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "ALL" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (item: (typeof catalogItems)[0]) => {
    const existing = cart.find((c) => c.id === item.id);
    if (existing) {
      setCart(
        cart.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c))
      );
    } else {
      setCart([
        ...cart,
        {
          id: item.id,
          name: item.name,
          code: item.code,
          rate: item.rate,
          qty: 1,
          discount: 0,
        },
      ]);
    }
  };

  const updateQty = (id: string, delta: number) => {
    setCart(
      cart
        .map((c) => {
          if (c.id === id) {
            const newQty = c.qty + delta;
            return newQty > 0 ? { ...c, qty: newQty } : null;
          }
          return c;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((c) => c.id !== id));
  };

  // Calculations
  const subtotal = cart.reduce(
    (acc, item) => acc + item.rate * item.qty * (1 - item.discount / 100),
    0
  );
  const taxAmount = subtotal * 0.0825; // 8.25% Sales Tax
  const grandTotal = subtotal + taxAmount;
  const changeTendered = Math.max(0, (parseFloat(paidAmount) || 0) - grandTotal);

  const handleCheckoutSubmit = () => {
    setIsInvoiceSubmitted(true);
    setTimeout(() => {
      setIsInvoiceSubmitted(false);
      setIsCheckoutOpen(false);
      setCart([]);
      setPaidAmount("");
    }, 2000);
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
            Point of Sale
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-medium">
          {[
            { id: "terminal", label: "POS Terminal", icon: Monitor },
            { id: "profiles", label: "POS Profiles", icon: Sliders },
            { id: "opening", label: "Opening Entry", icon: Clock },
            { id: "closing", label: "Closing Entry", icon: ShieldCheck },
            { id: "loyalty", label: "Loyalty Program", icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
                  isActive
                    ? "bg-gray-900 text-white font-medium shadow-2xs"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-6 space-y-4">

      {/* ========================================================================= */}
      {/* SUB-TAB 1: POS TOUCH TERMINAL */}
      {/* ========================================================================= */}
      {activeSubTab === "terminal" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Product Catalog Grid (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Search & Category Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search item by name or barcode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto bg-gray-100 p-1 rounded-lg">
                {["ALL", "Hardware", "Networking", "Accessories", "Software"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 text-[11px] rounded font-medium transition-colors whitespace-nowrap ${
                      selectedCategory === cat
                        ? "bg-white text-gray-900 shadow-2xs"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Item Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredCatalog.map((item) => (
                <div
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-500 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start text-[10px] text-gray-400 font-mono mb-1">
                      <span>{item.code}</span>
                      <span className="bg-blue-50 text-blue-600 px-1 py-0.5 rounded">
                        {item.stock} in stock
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-gray-900 line-clamp-2">
                      {item.name}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-xs font-bold text-gray-900">
                      {formatCurrency(item.rate)}
                    </span>
                    <button className="p-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-600">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Checkout Cart Sidebar (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-gray-200 rounded-lg p-4 flex flex-col justify-between h-[600px] shadow-2xs">
            <div>
              {/* Customer Selector */}
              <div className="pb-3 mb-3 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <User className="w-4 h-4 text-gray-400" />
                  <select
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                    className="bg-transparent font-medium text-gray-800 focus:outline-none"
                  >
                    <option value="CUST-001">Acme Corporation (CUST-001)</option>
                    <option value="CUST-002">Global Tech Logistics (CUST-002)</option>
                    <option value="CUST-003">Walk-in Retail Customer</option>
                  </select>
                </div>
                <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded border border-emerald-100">
                  Active Session
                </span>
              </div>

              {/* Cart Line Items */}
              <div className="overflow-y-auto max-h-[350px] space-y-2 pr-1">
                {cart.length === 0 ? (
                  <div className="text-center py-16 text-gray-400 text-xs">
                    <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    Cart is empty. Click items on the left to add.
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded bg-gray-50 border border-gray-100 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-semibold text-gray-800 truncate">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono">
                          {formatCurrency(item.rate)} each
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-gray-200 rounded bg-white">
                          <button
                            onClick={() => updateQty(item.id, -1)}
                            className="px-1.5 py-0.5 text-gray-500 hover:text-gray-800"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 font-mono font-medium text-gray-800 text-[11px]">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => updateQty(item.id, 1)}
                            className="px-1.5 py-0.5 text-gray-500 hover:text-gray-800"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="font-mono font-bold text-gray-900 w-16 text-right">
                          {formatCurrency(item.rate * item.qty)}
                        </span>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Cart Summary Footer */}
            <div className="pt-3 border-t border-gray-200 space-y-2 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="font-mono font-medium text-gray-800">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Sales Tax (8.25%)</span>
                <span className="font-mono font-medium text-gray-800">
                  {formatCurrency(taxAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold text-gray-900 pt-1 border-t border-gray-100">
                <span>Grand Total</span>
                <span className="text-base font-mono text-blue-600">
                  {formatCurrency(grandTotal)}
                </span>
              </div>

              <button
                disabled={cart.length === 0}
                onClick={() => {
                  setPaidAmount(grandTotal.toFixed(2));
                  setIsCheckoutOpen(true);
                }}
                className="w-full mt-2 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Banknote className="w-4 h-4" />
                <span>Pay Now & Issue POS Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: POS PROFILES */}
      {/* ========================================================================= */}
      {activeSubTab === "profiles" && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">POS Profiles</h3>
              <p className="text-xs text-gray-500">
                Configure store registers, default payment methods, and warehouse mappings
              </p>
            </div>
            <button className="px-3 py-1.5 rounded bg-blue-600 text-white text-xs font-medium hover:bg-blue-700">
              + New POS Profile
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-400 uppercase font-mono text-[10px] tracking-wider border-y border-gray-200">
                <tr>
                  <th className="py-3 px-4">Profile Name</th>
                  <th className="py-3 px-4">Warehouse</th>
                  <th className="py-3 px-4">Default Price List</th>
                  <th className="py-3 px-4">Allowed Cashier Users</th>
                  <th className="py-3 px-4">Payment Methods</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {[
                  {
                    name: "Main Retail Register #01",
                    wh: "Main Finished Goods WH",
                    priceList: "Standard Selling",
                    users: "Administrator, John Doe",
                    methods: "Cash, Card, UPI",
                    status: "ACTIVE",
                  },
                  {
                    name: "Express Checkout Counter #02",
                    wh: "Store Counter WH",
                    priceList: "Retail Promo List",
                    users: "Sarah Jenkins",
                    methods: "Card, UPI",
                    status: "ACTIVE",
                  },
                ].map((p, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold text-gray-900">{p.name}</td>
                    <td className="py-3 px-4 text-gray-600">{p.wh}</td>
                    <td className="py-3 px-4 text-gray-600">{p.priceList}</td>
                    <td className="py-3 px-4 text-gray-600">{p.users}</td>
                    <td className="py-3 px-4 text-gray-600">{p.methods}</td>
                    <td className="py-3 px-4">
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: POS OPENING ENTRY */}
      {/* ========================================================================= */}
      {activeSubTab === "opening" && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4 max-w-3xl">
          <div className="pb-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">POS Opening Entry Register</h3>
            <p className="text-xs text-gray-500">Record cash float balance before starting terminal shift</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Cashier User</label>
              <input
                type="text"
                readOnly
                value="Administrator (admin@example.com)"
                className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-gray-700"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">POS Profile</label>
              <select className="w-full bg-white border border-gray-200 rounded p-2 text-gray-800">
                <option>Main Retail Register #01</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Opening Cash Balance (₹)</label>
              <input
                type="number"
                defaultValue="5000.00"
                className="w-full bg-white border border-gray-200 rounded p-2 text-gray-800 font-mono font-semibold"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Posting Date & Time</label>
              <input
                type="text"
                readOnly
                value="2026-08-27 09:00:00"
                className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-gray-700 font-mono"
              />
            </div>
          </div>

          <button className="px-4 py-2 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700">
            Submit Opening Entry
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: POS CLOSING ENTRY */}
      {/* ========================================================================= */}
      {activeSubTab === "closing" && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4 max-w-3xl">
          <div className="pb-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">POS Shift Closing Reconciliation</h3>
            <p className="text-xs text-gray-500">Reconcile cash drawer totals against system recorded transactions</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-gray-50 border border-gray-200 rounded space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-gray-500">Opening Cash Float</span>
                <span className="font-bold text-gray-900">₹ 5,000.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">System Recorded Cash Sales</span>
                <span className="font-bold text-gray-900">₹ 31,180.00</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200 font-bold">
                <span className="text-gray-800">Expected Cash Balance</span>
                <span className="text-blue-600">₹ 36,180.00</span>
              </div>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Actual Physical Cash Counted (₹)</label>
              <input
                type="number"
                defaultValue="36180.00"
                className="w-full bg-white border border-gray-200 rounded p-2 text-gray-800 font-mono font-bold text-sm"
              />
            </div>

            <button className="px-4 py-2 bg-emerald-600 text-white rounded text-xs font-semibold hover:bg-emerald-700">
              Submit Closing Entry & Reconcile
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 5: LOYALTY PROGRAM */}
      {/* ========================================================================= */}
      {activeSubTab === "loyalty" && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Customer Loyalty Tiers & Rules</h3>
              <p className="text-xs text-gray-500">Configure reward points collection and redemption ratios</p>
            </div>
            <button className="px-3 py-1.5 rounded bg-blue-600 text-white text-xs font-medium hover:bg-blue-700">
              + New Loyalty Program
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "Silver Rewards", minSpend: "₹ 10,000", earnRate: "1 Pt per ₹ 100", redeemValue: "₹ 1.00 per point" },
              { name: "Gold Tier", minSpend: "₹ 50,000", earnRate: "2 Pt per ₹ 100", redeemValue: "₹ 1.50 per point" },
              { name: "Platinum VIP", minSpend: "₹ 200,000", earnRate: "5 Pt per ₹ 100", redeemValue: "₹ 2.00 per point" },
            ].map((tier, idx) => (
              <div key={idx} className="p-4 border border-gray-200 rounded-lg bg-gray-50/50 space-y-2 text-xs">
                <div className="font-bold text-sm text-gray-900">{tier.name}</div>
                <div className="text-gray-500 flex justify-between">
                  <span>Min Spend:</span>
                  <span className="font-mono text-gray-800 font-medium">{tier.minSpend}</span>
                </div>
                <div className="text-gray-500 flex justify-between">
                  <span>Earn Factor:</span>
                  <span className="font-mono text-gray-800 font-medium">{tier.earnRate}</span>
                </div>
                <div className="text-gray-500 flex justify-between">
                  <span>Redemption:</span>
                  <span className="font-mono text-emerald-600 font-bold">{tier.redeemValue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl space-y-4 text-xs">
            <h3 className="text-base font-bold text-gray-900 flex items-center justify-between">
              <span>Checkout POS Payment</span>
              <span className="text-sm font-mono text-blue-600">{formatCurrency(grandTotal)}</span>
            </h3>

            {isInvoiceSubmitted ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                <div className="text-sm font-bold text-gray-900">POS Invoice Generated!</div>
                <div className="text-xs text-gray-500">Receipt printing dispatched.</div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">Payment Mode</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["CASH", "CARD", "UPI"] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => setPaymentMode(m)}
                        className={`py-2 rounded border text-xs font-semibold ${
                          paymentMode === m
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : "border-gray-200 text-gray-600"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">Amount Paid (₹)</label>
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    className="w-full border border-gray-200 rounded p-2 text-sm font-mono font-bold text-gray-900"
                  />
                </div>

                <div className="p-3 bg-gray-50 rounded border border-gray-200 flex justify-between font-mono">
                  <span className="text-gray-500">Change Tendered:</span>
                  <span className="font-bold text-emerald-600">{formatCurrency(changeTendered)}</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setIsCheckoutOpen(false)}
                    className="w-1/2 py-2 border border-gray-200 rounded text-gray-600 hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCheckoutSubmit}
                    className="w-1/2 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded"
                  >
                    Complete Transaction
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
