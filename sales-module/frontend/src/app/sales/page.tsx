"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
    <div className="space-y-6">
      {/* Top Header — ERPNext style: plain icon inline, no box */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <TrendingUp className="h-5 w-5 text-slate-500" />
            <h1 className="text-xl font-semibold text-slate-800">
              Sales
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-0.5 ml-7">
            End-to-end sales lifecycle management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsCreateQtnOpen(true);
              if (quotationItems.length === 0 && items.length > 0) {
                setQuotationItems([{ itemId: items[0].id, qty: 1, rate: items[0].standardRate, discountPercentage: 0 }]);
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>New Quotation</span>
          </button>
        </div>
      </div>

      {/* Sub-tab Navigation — ERPNext style: underline active tab, flat grey pill bar */}
      <div className="flex items-center border-b border-slate-200 overflow-x-auto">
        {[
          { key: "overview",    label: "Overview",              icon: Layers },
          { key: "quotations", label: "Quotations",              icon: FileText, count: quotations.length },
          { key: "orders",     label: "Sales Orders",           icon: ShoppingCart, count: orders.length },
          { key: "customers",  label: "Customer 360",           icon: Users, count: customers.length },
          { key: "analytics",  label: "Commissions",            icon: Award },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-px ${
                isActive
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-full ${
                  isActive ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {actionError && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-red-500 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: EXECUTIVE OVERVIEW */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* KPI Cards — ERPNext style: small soft-pastel icon top-right, label above, value bold */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-slate-200 bg-white hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
                <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Confirmed Revenue
                </CardTitle>
                <div className="h-8 w-8 rounded-lg bg-green-50 flex items-center justify-center">
                  <IndianRupee className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-2xl font-semibold text-slate-800 tracking-tight">
                  {formatCurrency(analytics?.totalConfirmedRevenue || 52501.25)}
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-green-600 font-medium">+18.4%</span>
                  <span>vs last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
                <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Active Orders
                </CardTitle>
                <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <ShoppingCart className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-2xl font-semibold text-slate-800 tracking-tight">
                  {orders.length} Orders
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <span className="text-blue-600 font-medium">
                    {orders.filter((o) => o.status !== "COMPLETED" && o.status !== "CANCELLED").length} Active
                  </span>
                  <span>in fulfillment</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
                <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Open Pipeline
                </CardTitle>
                <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-orange-500" />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-2xl font-semibold text-slate-800 tracking-tight">
                  {formatCurrency(analytics?.totalPipelineValue || 32475.0)}
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <span className="text-orange-500 font-medium">
                    {quotations.filter((q) => q.status === "OPEN").length} Open Quotes
                  </span>
                  <span>under review</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
                <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Avg Deal Size
                </CardTitle>
                <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-2xl font-semibold text-slate-800 tracking-tight">
                  {formatCurrency(analytics?.averageOrderValue || 26250.62)}
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <span className="text-purple-600 font-medium">Enterprise Tier</span>
                  <span>avg deal size</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle className="text-sm font-semibold">Recent Sales Orders</CardTitle>
                    <CardDescription>Directly inspect fulfillment and revenue progress</CardDescription>
                  </div>
                  <button
                    onClick={() => handleTabChange("orders")}
                    className="text-xs text-slate-400 hover:text-slate-700"
                  >
                    View All →
                  </button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-y border-slate-200">
                        <tr>
                          <th className="py-3 px-4">Order #</th>
                          <th className="py-3 px-4">Customer</th>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Grand Total</th>
                          <th className="py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {orders.slice(0, 4).map((o) => (
                          <tr key={o.id} className="hover:bg-slate-50">
                            <td className="py-3 px-4 font-mono font-semibold text-slate-900">{o.orderNumber}</td>
                            <td className="py-3 px-4 truncate max-w-[180px]">{o.customerName}</td>
                            <td className="py-3 px-4 font-mono text-slate-400">{formatDate(o.transactionDate)}</td>
                            <td className="py-3 px-4 font-mono font-bold text-slate-900">{formatCurrency(o.grandTotal)}</td>
                            <td className="py-3 px-4">
                              <StatusBadge status={o.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Monthly Revenue Velocity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analytics?.monthlyTrends?.map((trend, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-500">{trend.month}</span>
                        <span className="text-slate-900 font-bold">{formatCurrency(trend.revenue)}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-300 rounded-full"
                          style={{ width: `${Math.min(100, (Number(trend.revenue) / 60000) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center justify-between">
                    <span>Active Quotations</span>
                    <button
                      onClick={() => handleTabChange("quotations")}
                      className="text-xs text-slate-400 hover:text-slate-700"
                    >
                      View All →
                    </button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {quotations.slice(0, 3).map((q) => (
                    <div key={q.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-semibold text-slate-700">{q.quotationNumber}</span>
                        <StatusBadge status={q.status} />
                      </div>
                      <div className="text-xs text-slate-500 truncate">{q.customerName}</div>
                      <div className="flex justify-between text-[11px] font-mono text-slate-400">
                        <span>Valid: {formatDate(q.validTill)}</span>
                        <span className="font-bold text-slate-900">{formatCurrency(q.grandTotal)}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Top Enterprise Accounts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analytics?.topCustomers?.map((c, idx) => (
                    <div key={idx} className="flex justify-between p-2.5 rounded bg-slate-50 border border-slate-200 text-xs">
                      <div>
                        <div className="font-medium text-slate-700">{c.customerName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{c.ordersCount} orders</div>
                      </div>
                      <div className="font-mono font-bold text-slate-900">{formatCurrency(c.totalRevenue)}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
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
  );
}

export default function UnifiedSalesPageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-400">Loading Sales Module...</div>}>
      <SalesContent />
    </Suspense>
  );
}
