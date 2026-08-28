"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  TrendingUp,
  FileText,
  ShoppingCart,
  Users,
  Award,
  IndianRupee,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  Trash2,
  Calculator,
  Truck,
  Receipt,
  Mail,
  Phone,
  Globe,
  MapPin,
  X,
  ArrowRight,
  Sparkles,
  Layers,
  Sliders,
  Filter,
  Home,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  getSalesAnalytics,
  getSalesOrders,
  getQuotations,
  getCustomers,
  getItems,
  createQuotation,
  submitSalesOrder,
  cancelSalesOrder,
} from "@/lib/api";
import {
  SalesAnalyticsSummary,
  SalesOrder,
  Quotation,
  Customer,
  CatalogItem,
} from "@/types/sales";

function SalesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTabParam = searchParams.get("tab") || "overview";

  const [activeTab, setActiveTab] = useState(activeTabParam);
  const [analytics, setAnalytics] = useState<SalesAnalyticsSummary | null>(null);
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);

  const [qtnSearch, setQtnSearch] = useState("");
  const [qtnStatusFilter, setQtnStatusFilter] = useState("ALL");

  const [custSearch, setCustSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Quotation Modal State
  const [isCreateQtnOpen, setIsCreateQtnOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [orderType, setOrderType] = useState("SALES");
  const [validTill, setValidTill] = useState("");
  const [additionalDiscount, setAdditionalDiscount] = useState("0");
  const [quotationItems, setQuotationItems] = useState<
    { itemId: string; qty: number; rate: number; discountPercentage: number }[]
  >([]);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTabParam !== activeTab) {
      setActiveTab(activeTabParam);
    }
  }, [activeTabParam, activeTab]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/sales?tab=${tab}`);
  };

  useEffect(() => {
    async function loadAllSalesData() {
      setLoading(true);
      try {
        const [anData, oData, qData, cData, iData] = await Promise.all([
          getSalesAnalytics(),
          getSalesOrders(),
          getQuotations(),
          getCustomers(),
          getItems(),
        ]);
        setAnalytics(anData);
        setOrders(oData);
        setQuotations(qData);
        setCustomers(cData);
        setItems(iData);
        if (oData.length > 0) setSelectedOrder(oData[0]);
        if (cData.length > 0) {
          setSelectedCustomer(cData[0]);
          setSelectedCustomerId(cData[0].id);
        }
      } catch (err) {
        console.error("Failed to load sales data", err);
      } finally {
        setLoading(false);
      }
    }
    loadAllSalesData();
  }, []);

  // --- Quotation Calculation ---
  const handleAddItemRow = () => {
    if (items.length === 0) return;
    setQuotationItems([
      ...quotationItems,
      {
        itemId: items[0].id,
        qty: 1,
        rate: items[0].standardRate,
        discountPercentage: 0,
      },
    ]);
  };

  const handleRemoveItemRow = (idx: number) => {
    setQuotationItems(quotationItems.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx: number, itemId: string) => {
    const selected = items.find((i) => i.id === itemId);
    if (!selected) return;
    const updated = [...quotationItems];
    updated[idx] = {
      ...updated[idx],
      itemId,
      rate: selected.standardRate,
    };
    setQuotationItems(updated);
  };

  const calculatedNetTotal = quotationItems.reduce((acc, row) => {
    const rowRate = row.rate * (1 - row.discountPercentage / 100);
    return acc + row.qty * rowRate;
  }, 0);
  const calculatedTax = calculatedNetTotal * 0.0825;
  const discountVal = (calculatedNetTotal + calculatedTax) * (parseFloat(additionalDiscount || "0") / 100);
  const calculatedGrandTotal = calculatedNetTotal + calculatedTax - discountVal;

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || quotationItems.length === 0) {
      alert("Please select a customer and add at least one item.");
      return;
    }

    const payload = {
      customerId: selectedCustomerId,
      orderType,
      validTill: validTill || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      additionalDiscountPercentage: parseFloat(additionalDiscount || "0"),
      items: quotationItems.map((qi) => ({
        itemId: qi.itemId,
        qty: qi.qty,
        priceListRate: qi.rate,
        discountPercentage: qi.discountPercentage,
      })),
      taxes: [
        { chargeType: "ON_NET_TOTAL", accountHead: "State Sales Tax (6.25%)", rate: 6.25 },
        { chargeType: "ON_NET_TOTAL", accountHead: "Municipal Surcharge (2.0%)", rate: 2.0 },
      ],
    };

    const created = await createQuotation(payload);
    setQuotations([created, ...quotations]);
    setIsCreateQtnOpen(false);
    setQuotationItems([]);
  };

  // --- Order Actions ---
  const handleSubmitOrder = async (orderId: string) => {
    setActionLoading(true);
    setActionError(null);
    try {
      const updated = await submitSalesOrder(orderId);
      if (updated) {
        setOrders(orders.map((o) => (o.id === orderId ? updated : o)));
        setSelectedOrder(updated);
      }
    } catch (err: any) {
      setActionError(err.message || "Credit limit exceeded or submission failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order? Reservations will be freed.")) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const updated = await cancelSalesOrder(orderId);
      if (updated) {
        setOrders(orders.map((o) => (o.id === orderId ? updated : o)));
        setSelectedOrder(updated);
      }
    } catch (err: any) {
      setActionError(err.message || "Failed to cancel order.");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase());
    const matchesStatus =
      orderStatusFilter === "ALL" ||
      o.status === orderStatusFilter ||
      (orderStatusFilter === "ACTIVE" &&
        (o.status === "TO_DELIVER_AND_BILL" || o.status === "TO_DELIVER" || o.status === "TO_BILL"));
    return matchesSearch && matchesStatus;
  });

  const filteredQuotations = quotations.filter((q) => {
    const matchesSearch =
      q.quotationNumber.toLowerCase().includes(qtnSearch.toLowerCase()) ||
      q.customerName.toLowerCase().includes(qtnSearch.toLowerCase());
    const matchesStatus = qtnStatusFilter === "ALL" || qtnStatusFilter === q.status;
    return matchesSearch && matchesStatus;
  });

  const filteredCustomers = customers.filter(
    (c) =>
      c.customerName.toLowerCase().includes(custSearch.toLowerCase()) ||
      c.customerCode.toLowerCase().includes(custSearch.toLowerCase())
  );

  return (
    <div className="space-y-4 text-[#1f272e] font-sans text-xs bg-white min-h-full pb-16">
      {/* Top ERPNext Navbar & Breadcrumbs Header Bar */}
      <div className="h-12 flex items-center justify-between gap-3 px-6 border-b border-gray-200 bg-white sticky top-0 z-20">
        <div className="flex items-center gap-2 overflow-x-auto text-[13px]">
          <Link href="/sales" className="text-gray-500 hover:text-gray-900 flex items-center">
            <Home className="w-4 h-4 text-gray-500" />
          </Link>
          <span className="text-gray-400 font-light">/</span>
          <span className="font-bold text-gray-900">
            Selling Workspace
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsCreateQtnOpen(true);
              if (quotationItems.length === 0 && items.length > 0) {
                setQuotationItems([{ itemId: items[0].id, qty: 1, rate: items[0].standardRate, discountPercentage: 0 }]);
              }
            }}
            className="px-3.5 py-1.5 rounded bg-gray-900 hover:bg-gray-800 text-white font-medium text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Quotation</span>
          </button>
        </div>
      </div>

      <div className="px-6 space-y-4">



      {actionError && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-red-500 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: ERPNEXT SELLING DESK DASHBOARD OVERVIEW */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-6 text-[#1f272e]">
          {/* Sales Order Trends Chart Widget (ERPNext Frappe Chart Style) */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-semibold text-gray-800">Sales Order Trends</h3>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <button title="Filter" className="p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors">
                  <Sliders className="w-3.5 h-3.5" />
                </button>
                <div className="relative group">
                  <button title="Actions" className="p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors">
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* SVG Chart Area */}
            <div className="pt-4 pb-2 px-2">
              <div className="h-56 w-full relative">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 800 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="erpChartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F683AE" stopOpacity="0.25" />
                      <stop offset="50%" stopColor="#F683AE" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="#F683AE" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines & Y-axis labels */}
                  <g className="text-[10px] fill-gray-400 font-sans" stroke="#f1f5f9" strokeWidth="1">
                    <line x1="40" y1="160" x2="790" y2="160" />
                    <text x="32" y="163" textAnchor="end">0</text>

                    <line x1="40" y1="110" x2="790" y2="110" />
                    <text x="32" y="113" textAnchor="end">10 L</text>

                    <line x1="40" y1="60" x2="790" y2="60" />
                    <text x="32" y="63" textAnchor="end">20 L</text>

                    <line x1="40" y1="10" x2="790" y2="10" />
                    <text x="32" y="13" textAnchor="end">30 L</text>
                  </g>

                  {/* Filled Area path under curve */}
                  <path
                    d="M 50 160 L 50 140 Q 115 130, 180 90 T 310 110 T 440 60 T 570 40 T 700 80 L 770 70 L 770 160 Z"
                    fill="url(#erpChartGradient)"
                  />

                  {/* Trend Line */}
                  <path
                    d="M 50 140 Q 115 130, 180 90 T 310 110 T 440 60 T 570 40 T 700 80 L 770 70"
                    fill="none"
                    stroke="#ec4899"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Data points */}
                  {[
                    { x: 50, y: 140 },
                    { x: 115, y: 130 },
                    { x: 180, y: 90 },
                    { x: 245, y: 120 },
                    { x: 310, y: 110 },
                    { x: 375, y: 80 },
                    { x: 440, y: 60 },
                    { x: 505, y: 50 },
                    { x: 570, y: 40 },
                    { x: 635, y: 65 },
                    { x: 700, y: 80 },
                    { x: 770, y: 70 },
                  ].map((pt, i) => (
                    <circle key={i} cx={pt.x} cy={pt.y} r="3.5" fill="#ffffff" stroke="#ec4899" strokeWidth="2" />
                  ))}
                </svg>
              </div>

              {/* X-axis Month Labels */}
              <div className="flex justify-between pl-10 pr-2 pt-2 text-[11px] text-gray-400 font-sans">
                {["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"].map((m) => (
                  <span key={m}>{m}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Number Cards Row (ERPNext 3-Card Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-2xs hover:border-gray-300 transition-colors">
              <div className="text-xs text-gray-500 font-medium mb-1">Sales Orders</div>
              <div className="text-2xl font-semibold text-gray-900 tracking-tight">
                {orders.length > 0 ? orders.length : 12}
              </div>
              <div className="text-[11px] text-gray-400 mt-1">Confirmed orders in pipeline</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-2xs hover:border-gray-300 transition-colors">
              <div className="text-xs text-gray-500 font-medium mb-1">Total Sales Amount</div>
              <div className="text-2xl font-semibold text-gray-900 tracking-tight">
                ₹ 31.18 L
              </div>
              <div className="text-[11px] text-emerald-600 font-medium mt-1">+14.2% vs target</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-2xs hover:border-gray-300 transition-colors">
              <div className="text-xs text-gray-500 font-medium mb-1">Average Order Value</div>
              <div className="text-2xl font-semibold text-gray-900 tracking-tight">
                {formatCurrency(analytics?.averageOrderValue || 0)}
              </div>
              <div className="text-[11px] text-gray-400 mt-1">Based on active customer orders</div>
            </div>
          </div>

          {/* Reports & Masters Workspace Cards Grid (6 Links Widgets matching ERPNext) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 1. Selling Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-2xs">
              <h4 className="text-sm font-semibold text-gray-800 pb-2 border-b border-gray-100 mb-3">
                Selling
              </h4>
              <ul className="space-y-2 text-[13px]">
                {[
                  { label: "Customer", href: "/sales/customers" },
                  { label: "Quotation", href: "/sales/quotations" },
                  { label: "Sales Order", href: "/sales/orders" },
                  { label: "Sales Invoice", href: "/sales/invoices" },
                  { label: "Blanket Order", href: "/sales/blanket-orders" },
                  { label: "Sales Partner", href: "/sales/sales-partners" },
                  { label: "Sales Person", href: "/sales/sales-persons" },
                ].map((item) => (
                  <li key={item.label}>
                    <button
                      onClick={() => {
                        if (item.href === "/sales/quotations") handleTabChange("quotations");
                        else if (item.href === "/sales/orders") handleTabChange("orders");
                        else if (item.href === "/sales/customers") handleTabChange("customers");
                        else router.push(item.href);
                      }}
                      className="text-gray-700 hover:text-blue-600 hover:underline transition-colors flex items-center justify-between w-full text-left"
                    >
                      <span>{item.label}</span>
                      <ArrowRight className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* 2. Point of Sale Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-2xs">
              <h4 className="text-sm font-semibold text-gray-800 pb-2 border-b border-gray-100 mb-3">
                Point of Sale
              </h4>
              <ul className="space-y-2 text-[13px]">
                {[
                  { label: "Point-of-Sale Profile", href: "/sales/pos" },
                  { label: "POS Settings", href: "/sales/pos" },
                  { label: "POS Opening Entry", href: "/sales/pos" },
                  { label: "POS Closing Entry", href: "/sales/pos" },
                  { label: "Loyalty Program", href: "/sales/pos" },
                  { label: "Loyalty Point Entry", href: "/sales/pos" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-gray-700 hover:text-blue-600 hover:underline transition-colors block"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Items and Pricing Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-2xs">
              <h4 className="text-sm font-semibold text-gray-800 pb-2 border-b border-gray-100 mb-3">
                Items and Pricing
              </h4>
              <ul className="space-y-2 text-[13px]">
                {[
                  { label: "Item", href: "/sales/items" },
                  { label: "Item Price", href: "/sales/pricing-rules?tab=item-price" },
                  { label: "Price List", href: "/sales/items" },
                  { label: "Item Group", href: "/sales/items" },
                  { label: "Product Bundle", href: "/sales/items" },
                  { label: "Promotional Scheme", href: "/sales/pricing-rules?tab=promotional" },
                  { label: "Pricing Rule", href: "/sales/pricing-rules" },
                  { label: "Shipping Rule", href: "/sales/settings" },
                  { label: "Coupon Code", href: "/sales/pricing-rules?tab=coupons" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-gray-700 hover:text-blue-600 hover:underline transition-colors block"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* 4. Settings Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-2xs">
              <h4 className="text-sm font-semibold text-gray-800 pb-2 border-b border-gray-100 mb-3">
                Settings
              </h4>
              <ul className="space-y-2 text-[13px]">
                {[
                  { label: "Selling Settings", href: "/sales/settings" },
                  { label: "Terms and Conditions Template", href: "/sales/settings" },
                  { label: "Sales Taxes and Charges Template", href: "/sales/settings" },
                  { label: "UTM Source", href: "/sales/crm?tab=utm" },
                  { label: "Customer Group", href: "/sales/customers?tab=groups" },
                  { label: "Contact", href: "/sales/customers?tab=contacts" },
                  { label: "Address", href: "/sales/customers?tab=address" },
                  { label: "Territory", href: "/sales/crm?tab=territory" },
                  { label: "Campaign", href: "/sales/crm?tab=campaign" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-gray-700 hover:text-blue-600 hover:underline transition-colors block"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* 5. Key Reports Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-2xs">
              <h4 className="text-sm font-semibold text-gray-800 pb-2 border-b border-gray-100 mb-3">
                Key Reports
              </h4>
              <ul className="space-y-2 text-[13px]">
                {[
                  { label: "Sales Analytics", href: "/sales/reports?report=analytics" },
                  { label: "Sales Order Analysis", href: "/sales/reports?report=order-analysis" },
                  { label: "Sales Funnel", href: "/sales/reports?report=funnel" },
                  { label: "Sales Order Trends", href: "/sales/reports?report=order-trends" },
                  { label: "Quotation Trends", href: "/sales/reports?report=quotation-trends" },
                  { label: "Customer Acquisition and Loyalty", href: "/sales/reports?report=acquisition" },
                  { label: "Inactive Customers", href: "/sales/reports?report=inactive" },
                  { label: "Sales Person-wise Transaction Summary", href: "/sales/reports?report=person-summary" },
                  { label: "Item-wise Sales History", href: "/sales/reports?report=item-history" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-gray-700 hover:text-blue-600 hover:underline transition-colors block"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* 6. Other Reports Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-2xs">
              <h4 className="text-sm font-semibold text-gray-800 pb-2 border-b border-gray-100 mb-3">
                Other Reports
              </h4>
              <ul className="space-y-2 text-[13px]">
                {[
                  { label: "Customer Addresses And Contacts", href: "/sales/reports?report=contacts" },
                  { label: "Available Stock for Packing Items", href: "/sales/reports?report=stock" },
                  { label: "Pending SO Items For Purchase Request", href: "/sales/reports?report=pending-so" },
                  { label: "Delivery Note Trends", href: "/sales/reports?report=delivery-trends" },
                  { label: "Sales Invoice Trends", href: "/sales/reports?report=invoice-trends" },
                  { label: "Customer Credit Balance", href: "/sales/reports?report=credit-balance" },
                  { label: "Customers Without Any Sales Transactions", href: "/sales/reports?report=no-sales" },
                  { label: "Sales Partners Commission", href: "/sales/reports?report=commission" },
                  { label: "Territory Target Variance Based On Item Group", href: "/sales/reports?report=territory-variance" },
                  { label: "Sales Person Target Variance Based On Item Group", href: "/sales/reports?report=salesperson-variance" },
                  { label: "Sales Partner Target Variance Based On Item Group", href: "/sales/reports?report=partner-variance" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-gray-700 hover:text-blue-600 hover:underline transition-colors block"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: QUOTATIONS */}
      {/* ========================================================================= */}
      {activeTab === "quotations" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search quotations..."
                value={qtnSearch}
                onChange={(e) => setQtnSearch(e.target.value)}
                className="w-full bg-slate-100 border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
              />
            </div>
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-100 border border-slate-200">
              {["ALL", "OPEN", "ORDERED", "LOST", "CANCELLED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setQtnStatusFilter(st)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    qtnStatusFilter === st
                      ? "bg-slate-100 text-slate-900 shadow-sm border border-blue-200"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <Card className="border-slate-200">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4">Quotation #</th>
                      <th className="py-3.5 px-4">Customer</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Valid Till</th>
                      <th className="py-3.5 px-4">Net Total</th>
                      <th className="py-3.5 px-4">Grand Total</th>
                      <th className="py-3.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredQuotations.map((qtn) => (
                      <tr key={qtn.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-semibold text-slate-900">{qtn.quotationNumber}</td>
                        <td className="py-3 px-4 truncate max-w-[200px]">{qtn.customerName}</td>
                        <td className="py-3 px-4 font-mono text-slate-400">{formatDate(qtn.transactionDate)}</td>
                        <td className="py-3 px-4 font-mono text-slate-400">{formatDate(qtn.validTill)}</td>
                        <td className="py-3 px-4 font-mono text-slate-500">{formatCurrency(qtn.netTotal)}</td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{formatCurrency(qtn.grandTotal)}</td>
                        <td className="py-3 px-4">
                          <StatusBadge status={qtn.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SALES ORDERS */}
      {/* ========================================================================= */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full bg-slate-100 border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
              />
            </div>
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-100 border border-slate-200">
              {["ALL", "DRAFT", "ACTIVE", "COMPLETED", "CANCELLED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderStatusFilter(st)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    orderStatusFilter === st
                      ? "bg-slate-100 text-slate-900 shadow-sm border border-blue-200"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <Card className="border-slate-200">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="py-3.5 px-4">Order #</th>
                          <th className="py-3.5 px-4">Customer</th>
                          <th className="py-3.5 px-4">Date</th>
                          <th className="py-3.5 px-4">Grand Total</th>
                          <th className="py-3.5 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {filteredOrders.map((order) => {
                          const isSelected = selectedOrder?.id === order.id;
                          return (
                            <tr
                              key={order.id}
                              onClick={() => setSelectedOrder(order)}
                              className={`cursor-pointer transition-colors ${
                                isSelected ? "bg-blue-50 text-slate-900" : "hover:bg-slate-50"
                              }`}
                            >
                              <td className="py-3 px-4 font-mono font-semibold">{order.orderNumber}</td>
                              <td className="py-3 px-4 truncate max-w-[150px]">{order.customerName}</td>
                              <td className="py-3 px-4 font-mono text-slate-400">{formatDate(order.transactionDate)}</td>
                              <td className="py-3 px-4 font-mono font-bold text-slate-900">
                                {formatCurrency(order.grandTotal)}
                              </td>
                              <td className="py-3 px-4">
                                <StatusBadge status={order.status} />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-5">
              {selectedOrder ? (
                <Card className="border-slate-200 space-y-5 p-6">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <div>
                      <div className="font-mono text-base font-bold text-slate-900">{selectedOrder.orderNumber}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{selectedOrder.customerName}</div>
                    </div>
                    <StatusBadge status={selectedOrder.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                      <div className="text-slate-400 text-[10px] uppercase">Delivery Target</div>
                      <div className="text-slate-700 font-semibold mt-0.5">{formatDate(selectedOrder.deliveryDate)}</div>
                    </div>
                    <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                      <div className="text-slate-400 text-[10px] uppercase">Grand Total</div>
                      <div className="text-slate-900 font-bold mt-0.5">{formatCurrency(selectedOrder.grandTotal)}</div>
                    </div>
                  </div>

                  <div className="space-y-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Truck className="h-3.5 w-3.5 text-sky-400" /> Delivery Progress
                      </span>
                      <span className="font-mono font-bold text-slate-900">{selectedOrder.perDelivered}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-sky-400 rounded-full" style={{ width: `${selectedOrder.perDelivered}%` }} />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Receipt className="h-3.5 w-3.5 text-emerald-400" /> Billing Progress
                      </span>
                      <span className="font-mono font-bold text-slate-900">{selectedOrder.perBilled}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${selectedOrder.perBilled}%` }} />
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-4 flex items-center gap-2.5">
                    {selectedOrder.status === "DRAFT" && (
                      <button
                        onClick={() => handleSubmitOrder(selectedOrder.id)}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow transition-all active:scale-95 disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Submit & Reserve Stock</span>
                      </button>
                    )}

                    {selectedOrder.status !== "CANCELLED" && selectedOrder.status !== "COMPLETED" && (
                      <button
                        onClick={() => handleCancelOrder(selectedOrder.id)}
                        disabled={actionLoading}
                        className="px-3.5 py-2 rounded-lg bg-slate-100 border border-slate-200 hover:bg-red-50 hover:text-red-300 text-slate-400 text-xs font-medium transition-all"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </Card>
              ) : (
                <Card className="border-slate-200 p-8 text-center text-xs text-slate-400">
                  Select an order to inspect lifecycle.
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CUSTOMER 360 */}
      {/* ========================================================================= */}
      {activeTab === "customers" && (
        <div className="space-y-6">
          <div className="relative w-full sm:w-80">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search customer master..."
              value={custSearch}
              onChange={(e) => setCustSearch(e.target.value)}
              className="w-full bg-slate-100 border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-3">
              {filteredCustomers.map((cust) => {
                const isSelected = selectedCustomer?.id === cust.id;
                const utilization = (cust.outstandingBalance / (cust.creditLimit || 1)) * 100;
                return (
                  <div
                    key={cust.id}
                    onClick={() => setSelectedCustomer(cust)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                      isSelected ? "bg-slate-100 border-blue-300 shadow-md" : "glass-card hover:border-blue-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-sm text-slate-900">{cust.customerName}</div>
                        <div className="font-mono text-[11px] text-slate-400">{cust.customerCode}</div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-slate-400" />{cust.customerType}</span>
                    </div>

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

            <div className="lg:col-span-7">
              {selectedCustomer ? (
                <Card className="border-slate-200 space-y-6 p-6">
                  <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{selectedCustomer.customerName}</h2>
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-1">
                        <span>{selectedCustomer.customerCode}</span>
                        <span>•</span>
                        <span>{selectedCustomer.customerGroupName || "Enterprise"}</span>
                      </div>
                    </div>
                    {selectedCustomer.bypassCreditLimitCheck ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-700"><span className="h-1.5 w-1.5 rounded-full bg-orange-400" />Bypass Credit Check</span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700"><span className="h-1.5 w-1.5 rounded-full bg-green-500" />Credit Guard Active</span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                    <div className="p-3 rounded bg-slate-50 border border-slate-200">
                      <div className="text-slate-400 text-[10px] uppercase">Credit Limit</div>
                      <div className="text-sm font-bold text-slate-900">{formatCurrency(selectedCustomer.creditLimit)}</div>
                    </div>
                    <div className="p-3 rounded bg-slate-50 border border-slate-200">
                      <div className="text-slate-400 text-[10px] uppercase">Outstanding Balance</div>
                      <div className="text-sm font-bold text-amber-400">{formatCurrency(selectedCustomer.outstandingBalance)}</div>
                    </div>
                    <div className="p-3 rounded bg-slate-50 border border-slate-200">
                      <div className="text-slate-400 text-[10px] uppercase">Available Credit</div>
                      <div className="text-sm font-bold text-emerald-400">{formatCurrency(selectedCustomer.availableCredit)}</div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Contact Info</div>
                    <div className="grid grid-cols-2 gap-2 text-slate-500">
                      {selectedCustomer.email && <div>Email: {selectedCustomer.email}</div>}
                      {selectedCustomer.phone && <div>Phone: {selectedCustomer.phone}</div>}
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="border-slate-200 p-8 text-center text-xs text-slate-400">
                  Select a customer to view credit and coordinates.
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: COMMISSIONS & ANALYTICS */}
      {/* ========================================================================= */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-400" />
                Sales Representative Performance & 100% Split Incentives
              </CardTitle>
              <CardDescription>
                Calculated via ERPNext 100% allocation contribution rule across eligible order items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left font-mono">
                  <thead className="bg-slate-100 text-slate-400 uppercase text-[10px] tracking-wider border-y border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Sales Representative</th>
                      <th className="py-3 px-4">Allocated Volume</th>
                      <th className="py-3 px-4">Effective Rate</th>
                      <th className="py-3 px-4">Incentives Earned</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {analytics?.salesTeamPerformance?.map((rep, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-sans font-semibold text-slate-900 flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] text-slate-700">
                            {idx + 1}
                          </div>
                          {rep.salesPersonName}
                        </td>
                        <td className="py-3 px-4 text-slate-700">{formatCurrency(rep.totalSales)}</td>
                        <td className="py-3 px-4 text-slate-400">5.0%</td>
                        <td className="py-3 px-4 font-bold text-amber-400">{formatCurrency(rep.incentivesEarned)}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 text-[10px]">
                            Disbursed
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: INTERACTIVE QUOTATION BUILDER */}
      {/* ========================================================================= */}
      {isCreateQtnOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 p-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-slate-500" />
                  New Quotation Builder
                </h2>
                <p className="text-xs text-slate-400">
                  Dynamic line item discounts, multi-tier tax computations, and price list lookup.
                </p>
              </div>
              <button
                onClick={() => setIsCreateQtnOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuotation} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Customer Account</label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full bg-slate-100 border border-slate-200 rounded-md p-2 text-xs text-slate-700 focus:outline-none"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.customerName} ({c.customerCode})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Order Type</label>
                  <select
                    value={orderType}
                    onChange={(e) => setOrderType(e.target.value)}
                    className="w-full bg-slate-100 border border-slate-200 rounded-md p-2 text-xs text-slate-700 focus:outline-none"
                  >
                    <option value="SALES">Sales Order</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="SHOPPING_CART">Shopping Cart</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Valid Till Date</label>
                  <input
                    type="date"
                    value={validTill}
                    onChange={(e) => setValidTill(e.target.value)}
                    className="w-full bg-slate-100 border border-slate-200 rounded-md p-2 text-xs text-slate-700 focus:outline-none"
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-3 border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Line Items & Discounts</h3>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-white px-2.5 py-1 rounded bg-slate-100 border border-slate-200 hover:bg-slate-100 transition-all"
                  >
                    <Plus className="h-3 w-3" /> Add Item Row
                  </button>
                </div>

                <div className="space-y-2">
                  {quotationItems.map((row, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 items-center p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                    >
                      <div className="col-span-5">
                        <select
                          value={row.itemId}
                          onChange={(e) => handleItemChange(idx, e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs text-slate-700 focus:outline-none"
                        >
                          {items.map((i) => (
                            <option key={i.id} value={i.id}>
                              {i.itemName} ({i.itemCode})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={row.qty}
                          onChange={(e) => {
                            const updated = [...quotationItems];
                            updated[idx].qty = parseFloat(e.target.value) || 1;
                            setQuotationItems(updated);
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs text-slate-700 text-center"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Rate"
                          value={row.rate}
                          onChange={(e) => {
                            const updated = [...quotationItems];
                            updated[idx].rate = parseFloat(e.target.value) || 0;
                            setQuotationItems(updated);
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs text-slate-700 font-mono text-right"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="Disc %"
                          value={row.discountPercentage}
                          onChange={(e) => {
                            const updated = [...quotationItems];
                            updated[idx].discountPercentage = parseFloat(e.target.value) || 0;
                            setQuotationItems(updated);
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs text-slate-700 text-right"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="text-blue-7000 hover:text-red-500 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tax & Discount Summary */}
              <div className="border-t border-slate-200 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 text-xs">
                  <div className="text-slate-400">Additional Overall Discount (%)</div>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={additionalDiscount}
                    onChange={(e) => setAdditionalDiscount(e.target.value)}
                    className="w-32 bg-slate-100 border border-slate-200 rounded p-1.5 text-xs text-slate-700"
                  />
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    Automatically applies 6.25% State Sales Tax and 2.0% Municipal Surcharge.
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-100 border border-slate-200 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Net Total:</span>
                    <span>{formatCurrency(calculatedNetTotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Taxes & Charges (8.25%):</span>
                    <span>{formatCurrency(calculatedTax)}</span>
                  </div>
                  {discountVal > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount ({additionalDiscount}%):</span>
                      <span>-{formatCurrency(discountVal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-1.5">
                    <span>Grand Total:</span>
                    <span>{formatCurrency(calculatedGrandTotal)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateQtnOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 text-xs font-medium hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  Create & Calculate Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default function UnifiedSalesPageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-400">Loading Sales Module...</div>}>
      <SalesContent />
    </Suspense>
  );
}
