"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Home,
  ChevronRight,
  ChevronLeft,
  Printer,
  Heart,
  User,
  Plus,
  Paperclip,
  Tag,
  Share2,
  CheckCircle2,
  XCircle,
  Truck,
  Receipt,
  FileText,
  Layers,
  Users,
  ChevronDown,
  MoreHorizontal,
  Download,
  Edit2,
  ShieldAlert,
  Calendar,
  DollarSign,
  Clock,
  ArrowUpRight,
  FilePlus,
  RefreshCw,
  AlertCircle,
  Check,
  X,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  getSalesOrders,
  submitSalesOrder,
  cancelSalesOrder,
  getPaymentSchedulesForVoucher,
  getPaymentTermsTemplates,
  generateOrderPaymentSchedule,
  invoicePaymentMilestone,
  getSalesTeamForVoucher,
  saveSalesTeamForVoucher,
  getSalesPersons,
} from "@/lib/api";
import { SalesOrder, PaymentSchedule, PaymentTermsTemplate, SalesTeamMember, SalesPerson } from "@/types/sales";
import { PrintDocumentModal } from "@/components/ui/PrintDocumentModal";

export default function SalesOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderIdParam = params.id as string;

  const [order, setOrder] = useState<SalesOrder | null>(null);
  const [allOrders, setAllOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Form Tabs state matching ERPNext: Details, Address & Contact, Terms, More Info, Connections
  const [activeTab, setActiveTab] = useState<
    "details" | "address" | "terms" | "info" | "connections"
  >("details");

  // Create Dropdown Open
  const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false);

  // Print Modal
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  // Payment Terms & Milestone Schedules State
  const [schedules, setSchedules] = useState<PaymentSchedule[]>([]);
  const [templates, setTemplates] = useState<PaymentTermsTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [invoicingScheduleId, setInvoicingScheduleId] = useState<string | null>(null);
  const [milestoneSuccess, setMilestoneSuccess] = useState<string | null>(null);

  // Sales Team Multi-Allocation State
  const [salesTeam, setSalesTeam] = useState<SalesTeamMember[]>([]);
  const [availableSalesPersons, setAvailableSalesPersons] = useState<SalesPerson[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamSaving, setTeamSaving] = useState(false);
  const [teamSuccess, setTeamSuccess] = useState<string | null>(null);

  const loadSchedules = async (targetOrderId: string) => {
    setScheduleLoading(true);
    try {
      let list = await getPaymentSchedulesForVoucher("SALES_ORDER", targetOrderId);
      if (!list || list.length === 0) {
        list = await generateOrderPaymentSchedule(targetOrderId);
      }
      setSchedules(list || []);
    } catch (err) {
      console.error("Error loading payment schedules:", err);
    } finally {
      setScheduleLoading(false);
    }
  };

  const loadSalesTeam = async (targetOrderId: string, grandTotal: number) => {
    setTeamLoading(true);
    try {
      const [teamList, persons] = await Promise.all([
        getSalesTeamForVoucher("SALES_ORDER", targetOrderId),
        getSalesPersons(),
      ]);
      setAvailableSalesPersons(persons || []);
      if (teamList && teamList.length > 0) {
        setSalesTeam(teamList);
      } else if (persons && persons.length > 0) {
        const first = persons[0];
        const comm = first.commissionRate || 5.0;
        setSalesTeam([
          {
            voucherType: "SALES_ORDER",
            voucherId: targetOrderId,
            salesPersonId: first.id,
            salesPersonName: first.salesPersonName,
            allocatedPercentage: 100.0,
            allocatedAmount: grandTotal,
            commissionRate: comm,
            incentives: Math.round((grandTotal * comm) / 100 * 100) / 100,
          },
        ]);
      }
    } catch (err) {
      console.error("Failed to load sales team:", err);
    } finally {
      setTeamLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const tmpls = await getPaymentTermsTemplates();
      setTemplates(tmpls || []);
    } catch (err) {
      console.error("Error loading templates:", err);
    }
  };

  const loadOrder = async () => {
    setLoading(true);
    try {
      const orders = await getSalesOrders();
      setAllOrders(orders || []);
      const matched = (orders || []).find(
        (o) =>
          o.id === orderIdParam ||
          o.orderNumber.toLowerCase() === orderIdParam.toLowerCase()
      );
      if (matched) {
        setOrder(matched);
        setSelectedTemplate(matched.paymentTermsTemplate || "30-50-20 Milestone Schedule");
        await loadSchedules(matched.id);
        await loadSalesTeam(matched.id, matched.grandTotal);
      } else if (orders && orders.length > 0) {
        setOrder(orders[0]);
        setSelectedTemplate(orders[0].paymentTermsTemplate || "30-50-20 Milestone Schedule");
        await loadSchedules(orders[0].id);
        await loadSalesTeam(orders[0].id, orders[0].grandTotal);
      }
      await loadTemplates();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeamMember = () => {
    if (availableSalesPersons.length === 0) return;
    const existingIds = new Set(salesTeam.map((m) => m.salesPersonId));
    const nextPerson = availableSalesPersons.find((p) => !existingIds.has(p.id)) || availableSalesPersons[0];
    const comm = nextPerson.commissionRate || 5.0;
    setSalesTeam([
      ...salesTeam,
      {
        voucherType: "SALES_ORDER",
        voucherId: order?.id || "",
        salesPersonId: nextPerson.id,
        salesPersonName: nextPerson.salesPersonName,
        allocatedPercentage: 0,
        allocatedAmount: 0,
        commissionRate: comm,
        incentives: 0,
      },
    ]);
  };

  const handleRemoveTeamMember = (index: number) => {
    if (salesTeam.length <= 1) return;
    setSalesTeam(salesTeam.filter((_, idx) => idx !== index));
  };

  const handleTeamMemberChange = (index: number, field: string, value: any) => {
    const updated = [...salesTeam];
    const item = { ...updated[index], [field]: value };
    if (field === "salesPersonId") {
      const p = availableSalesPersons.find((x) => x.id === value);
      if (p) {
        item.salesPersonName = p.salesPersonName;
        item.commissionRate = p.commissionRate || item.commissionRate;
      }
    }
    const grandTotal = order?.grandTotal || 0;
    item.allocatedAmount = Math.round((grandTotal * (Number(item.allocatedPercentage) || 0)) / 100 * 100) / 100;
    item.incentives = Math.round((item.allocatedAmount * (Number(item.commissionRate) || 0)) / 100 * 100) / 100;
    updated[index] = item;
    setSalesTeam(updated);
  };

  const handleSaveSalesTeam = async () => {
    if (!order) return;
    const totalPercentage = salesTeam.reduce((sum, m) => sum + (Number(m.allocatedPercentage) || 0), 0);
    if (Math.abs(totalPercentage - 100.0) > 0.01) {
      setErrorMessage(`Sum of contribution percentages must equal 100.00%. Current sum: ${totalPercentage.toFixed(1)}%`);
      return;
    }
    setTeamSaving(true);
    setErrorMessage(null);
    try {
      const saved = await saveSalesTeamForVoucher(
        "SALES_ORDER",
        order.id,
        order.grandTotal,
        salesTeam.map((m) => ({
          salesPersonId: m.salesPersonId || "",
          salesPersonName: m.salesPersonName,
          allocatedPercentage: Number(m.allocatedPercentage) || 0,
          commissionRate: Number(m.commissionRate) || 0,
        }))
      );
      setSalesTeam(saved);
      setTeamSuccess("Sales Team contribution and incentive allocations saved successfully!");
      setTimeout(() => setTeamSuccess(null), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save sales team");
    } finally {
      setTeamSaving(false);
    }
  };

  const handleGenerateSchedule = async () => {
    if (!order) return;
    setScheduleLoading(true);
    setMilestoneSuccess(null);
    try {
      const list = await generateOrderPaymentSchedule(order.id);
      setSchedules(list || []);
      setMilestoneSuccess(`Generated ${list.length} milestone payment schedule installments!`);
      setTimeout(() => setMilestoneSuccess(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to generate payment schedule");
    } finally {
      setScheduleLoading(false);
    }
  };

  const handleInvoiceMilestone = async (scheduleId: string, termName: string) => {
    if (!order) return;
    setInvoicingScheduleId(scheduleId);
    setErrorMessage(null);
    setMilestoneSuccess(null);
    try {
      const invoice = await invoicePaymentMilestone(order.id, scheduleId);
      setMilestoneSuccess(`Successfully generated Sales Invoice ${invoice.invoiceNumber} for milestone "${termName}"!`);
      // Reload order and schedules
      const updatedOrders = await getSalesOrders();
      const updatedMatch = updatedOrders.find((o) => o.id === order.id);
      if (updatedMatch) setOrder(updatedMatch);
      await loadSchedules(order.id);
      setTimeout(() => setMilestoneSuccess(null), 6000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to invoice milestone");
    } finally {
      setInvoicingScheduleId(null);
    }
  };

  useEffect(() => {
    if (orderIdParam) loadOrder();
  }, [orderIdParam]);

  const handleSubmit = async () => {
    if (!order) return;
    setActionLoading(true);
    setErrorMessage(null);
    try {
      const updated = await submitSalesOrder(order.id);
      if (updated) {
        setOrder(updated);
        setActionSuccess(`Sales Order ${updated.orderNumber} submitted & stock reserved!`);
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit order.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!order) return;
    if (!confirm("Are you sure you want to cancel this Sales Order?")) return;
    setActionLoading(true);
    setErrorMessage(null);
    try {
      const updated = await cancelSalesOrder(order.id);
      if (updated) {
        setOrder(updated);
        setActionSuccess(`Sales Order ${updated.orderNumber} cancelled.`);
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to cancel order.");
    } finally {
      setActionLoading(false);
    }
  };

  // Next/Prev Order Navigation
  const currentIndex = allOrders.findIndex((o) => o.id === order?.id);
  const handlePrevOrder = () => {
    if (currentIndex > 0) {
      router.push(`/sales/orders/${allOrders[currentIndex - 1].orderNumber}`);
    }
  };
  const handleNextOrder = () => {
    if (currentIndex >= 0 && currentIndex < allOrders.length - 1) {
      router.push(`/sales/orders/${allOrders[currentIndex + 1].orderNumber}`);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-gray-400 font-sans">
        Loading Sales Order document...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-12 text-center text-xs text-gray-500 space-y-3 font-sans">
        <div>Sales Order document not found.</div>
        <Link href="/sales/orders" className="text-blue-600 underline font-semibold">
          ← Back to Sales Orders
        </Link>
      </div>
    );
  }

  const items = order.items && order.items.length > 0 ? order.items : [
    { itemCode: "ACD-1000", itemName: "AC-Drive Motor C", qty: 2, rate: 120000, amount: 240000, deliveredBySupplier: false, supplier: undefined }
  ];

  const totalQty = items.reduce((acc, i) => acc + (i.qty || 1), 0);
  const itemsNetTotal = items.reduce((acc, i) => acc + (i.amount || i.qty * i.rate), 0);

  // Status Pill Styling matching ERPNext exact colors
  const getStatusBadge = (status: string) => {
    if (status === "COMPLETED" || status === "TO_DELIVER_AND_BILL") {
      return (
        <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
          Completed
        </span>
      );
    }
    if (status === "DRAFT") {
      return (
        <span className="bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
          Draft
        </span>
      );
    }
    return (
      <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
        Submitted
      </span>
    );
  };

  return (
    <div className="space-y-4 text-[#1f272e] font-sans text-xs bg-white min-h-full pb-16">
      {/* Top ERPNext Navbar & Breadcrumbs Header Bar */}
      <div className="h-12 flex items-center justify-between gap-3 px-4 border-b border-gray-200 bg-white sticky top-0 z-20">
        {/* Left Breadcrumb Trail: 🏠 / Selling / Sales Order / [Customer Name] [Status] */}
        <div className="flex items-center gap-2 overflow-x-auto text-[13px]">
          <Link href="/sales" className="text-gray-500 hover:text-gray-900 flex items-center">
            <Home className="w-4 h-4 text-gray-500" />
          </Link>
          <span className="text-gray-400 font-light">/</span>
          <Link href="/sales" className="text-gray-600 hover:text-gray-900 font-normal">
            Selling
          </Link>
          <span className="text-gray-400 font-light">/</span>
          <Link href="/sales/orders" className="text-gray-600 hover:text-gray-900 font-normal">
            Sales Order
          </Link>
          <span className="text-gray-400 font-light">/</span>
          <span className="font-bold text-gray-900 truncate max-w-[260px]">
            {order.customerName}
          </span>
          <div className="ml-1">
            {getStatusBadge(order.status)}
          </div>
        </div>

        {/* Right Action Buttons Toolbar matching ERPNext */}
        <div className="flex items-center gap-2">
          {/* Create Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsCreateDropdownOpen(!isCreateDropdownOpen)}
              className="px-3 py-1.5 rounded bg-gray-900 text-white font-medium text-xs flex items-center gap-1.5 hover:bg-gray-800 transition-colors shadow-2xs"
            >
              <span>Create</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-300" />
            </button>
            {isCreateDropdownOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded shadow-lg py-1 z-30 text-xs">
                <Link
                  href={`/sales/delivery-notes?salesOrderId=${order.id}&customerId=${order.customerId}&open=true`}
                  className="block px-3 py-1.5 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <Truck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Delivery Note</span>
                </Link>
                <Link
                  href={`/sales/invoices?salesOrderId=${order.id}&customerId=${order.customerId}&open=true`}
                  className="block px-3 py-1.5 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <Receipt className="w-3.5 h-3.5 text-amber-600" />
                  <span>Sales Invoice</span>
                </Link>
                <Link
                  href="/sales/pos"
                  className="block px-3 py-1.5 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Material Request</span>
                </Link>
              </div>
            )}
          </div>

          {/* Prev / Next Arrows */}
          <button
            onClick={handlePrevOrder}
            disabled={currentIndex <= 0}
            className="p-1.5 rounded border border-gray-200 hover:bg-gray-100 text-gray-600 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextOrder}
            disabled={currentIndex >= allOrders.length - 1}
            className="p-1.5 rounded border border-gray-200 hover:bg-gray-100 text-gray-600 disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* More Options */}
          <button
            onClick={() => setIsPrintOpen(true)}
            className="p-1.5 rounded border border-gray-200 hover:bg-gray-100 text-gray-600"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {/* Cancel or Submit */}
          {order.status === "DRAFT" ? (
            <button
              onClick={handleSubmit}
              disabled={actionLoading}
              className="px-3.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-2xs"
            >
              Submit
            </button>
          ) : (
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="px-3.5 py-1.5 rounded border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium text-xs"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {actionSuccess && (
        <div className="mx-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mx-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Form Body & Right Sidebar Grid (12 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 px-4">
        {/* Left Form Content (9 cols) */}
        <div className="lg:col-span-9 space-y-5">
          {/* Form Tabs Bar: Details | Address & Contact | Terms | More Info | Connections */}
          <div className="flex items-center gap-6 border-b border-gray-200 text-[13px] font-medium pt-1">
            {[
              { id: "details", label: "Details" },
              { id: "address", label: "Address & Contact" },
              { id: "terms", label: "Payment Terms & Milestones" },
              { id: "info", label: "Sales Team & Allocations" },
              { id: "connections", label: "Connections" },
            ].map((t) => {
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`pb-2.5 transition-colors border-b-2 -mb-px ${
                    isActive
                      ? "border-gray-900 text-gray-900 font-semibold"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: DETAILS */}
          {activeTab === "details" && (
            <div className="space-y-6">
              {/* Form Fields Two-Column Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-gray-500 text-xs mb-1">Customer *</label>
                    <div className="p-2.5 bg-gray-100/70 border border-gray-200 rounded font-medium text-gray-900">
                      {order.customerName}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-500 text-xs mb-1">Date *</label>
                    <div className="p-2.5 bg-gray-100/70 border border-gray-200 rounded font-mono text-gray-800">
                      {formatDate(order.transactionDate)}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-gray-500 text-xs mb-1">Order Type *</label>
                      <div className="p-2.5 bg-gray-100/70 border border-gray-200 rounded text-gray-900 font-medium">
                        {order.orderType || "Sales"}
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer pt-4">
                      <input type="checkbox" readOnly className="rounded border-gray-300" />
                      <span>Is Subcontracted</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-gray-500 text-xs mb-1">Delivery Date</label>
                    <div className="p-2.5 bg-gray-100/70 border border-gray-200 rounded font-mono text-gray-800">
                      {formatDate(order.deliveryDate)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Currency and Price List Section */}
              <div className="pt-2 border-t border-gray-200">
                <button type="button" className="text-xs font-semibold text-gray-800 flex items-center gap-1 hover:text-gray-900">
                  <span>Currency and Price List</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </div>

              {/* Items Section */}
              <div className="space-y-3">
                <div className="font-semibold text-gray-800 text-xs">Items</div>
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium text-[11px]">
                      <tr>
                        <th className="py-2 px-3 w-10">No.</th>
                        <th className="py-2 px-3">Item Code *</th>
                        <th className="py-2 px-3">Delivery Date *</th>
                        <th className="py-2 px-3 text-center">Quantity</th>
                        <th className="py-2 px-3 text-right">Rate (INR)</th>
                        <th className="py-2 px-3 text-right">Amount (INR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {items.map((i, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50">
                          <td className="py-2.5 px-3 text-gray-400">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-semibold text-gray-900">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1.5" />
                            {i.itemCode}: {i.itemName}
                            {i.deliveredBySupplier && (
                              <div className="mt-0.5">
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                                  <span>Drop Ship direct {i.supplier ? `via ${i.supplier}` : ""}</span>
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-gray-600">{formatDate(order.deliveryDate)}</td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-gray-800">{i.qty || 1}</td>
                          <td className="py-2.5 px-3 text-right font-mono">₹ {Number(i.rate).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold text-gray-900">₹ {Number(i.amount || (i.qty * i.rate)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end">
                  <button className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              {/* Totals Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-500 text-xs mb-1">Total Quantity</label>
                  <div className="p-2.5 bg-gray-100/70 border border-gray-200 rounded font-mono font-semibold text-gray-800">
                    {totalQty}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-500 text-xs mb-1">Total (INR)</label>
                  <div className="p-2.5 bg-gray-100/70 border border-gray-200 rounded font-mono font-bold text-gray-900">
                    ₹ {Number(itemsNetTotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Sales Taxes and Charges Section */}
              <div className="space-y-3 pt-2">
                <div className="font-semibold text-gray-800 text-xs">Sales Taxes and Charges</div>
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium text-[11px] font-sans">
                      <tr>
                        <th className="py-2 px-3 w-10">No.</th>
                        <th className="py-2 px-3">Type *</th>
                        <th className="py-2 px-3">Account Head *</th>
                        <th className="py-2 px-3 text-right">Tax Rate</th>
                        <th className="py-2 px-3 text-right">Net Amount (INR)</th>
                        <th className="py-2 px-3 text-right">Amount (INR)</th>
                        <th className="py-2 px-3 text-right">Total (INR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="py-2.5 px-3 text-gray-400">1</td>
                        <td className="py-2.5 px-3 font-sans text-gray-700">On Net Total</td>
                        <td className="py-2.5 px-3 font-bold text-gray-900 font-sans">Output Tax CGST (9%)</td>
                        <td className="py-2.5 px-3 text-right">9</td>
                        <td className="py-2.5 px-3 text-right">₹ {Number(itemsNetTotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                        <td className="py-2.5 px-3 text-right">₹ {Number(itemsNetTotal * 0.09).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                        <td className="py-2.5 px-3 text-right font-semibold text-gray-900">₹ {Number(itemsNetTotal * 1.09).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 text-gray-400">2</td>
                        <td className="py-2.5 px-3 font-sans text-gray-700">On Net Total</td>
                        <td className="py-2.5 px-3 font-bold text-gray-900 font-sans">Output Tax SGST (9%)</td>
                        <td className="py-2.5 px-3 text-right">9</td>
                        <td className="py-2.5 px-3 text-right">₹ {Number(itemsNetTotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                        <td className="py-2.5 px-3 text-right">₹ {Number(itemsNetTotal * 0.09).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                        <td className="py-2.5 px-3 text-right font-semibold text-gray-900">₹ {Number(itemsNetTotal * 1.18).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Grand Total Banner */}
              <div className="p-4 bg-gray-50 rounded border border-gray-200 flex justify-between items-center text-sm font-bold">
                <span className="text-gray-700">Grand Total (INR)</span>
                <span className="font-mono text-base text-gray-900">
                  ₹ {Number(order.grandTotal || (itemsNetTotal * 1.18)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: ADDRESS & CONTACT */}
          {activeTab === "address" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded space-y-2">
                <div className="font-bold text-gray-900 text-xs">Billing Address</div>
                <div className="text-gray-800 font-medium">{order.customerName}</div>
                <div className="text-gray-600 font-mono">100 Tech Enterprise Blvd, Suite 400</div>
                <div className="text-gray-600 font-mono">New York, NY 10001, United States</div>
                <div className="text-gray-500 pt-2 border-t border-gray-200">Email: billing@enterprise.com</div>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded space-y-2">
                <div className="font-bold text-gray-900 text-xs">Shipping Address</div>
                <div className="text-gray-800 font-medium">Main Warehouse Distribution Hub</div>
                <div className="text-gray-600 font-mono">500 Logistics Parkway, Gate 4</div>
                <div className="text-gray-600 font-mono">Jersey City, NJ 07302, United States</div>
                <div className="text-gray-500 pt-2 border-t border-gray-200">Phone: +1 (555) 019-2834</div>
              </div>
            </div>
          )}

          {/* TAB 3: PAYMENT TERMS & MILESTONE SCHEDULES */}
          {activeTab === "terms" && (
            <div className="space-y-6">
              {milestoneSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs font-semibold text-emerald-800 animate-in fade-in duration-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{milestoneSuccess}</span>
                </div>
              )}

              {/* Template Header & Actions */}
              <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Payment Terms Template:</span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {order.paymentTermsTemplate || selectedTemplate || "30-50-20 Milestone Schedule"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Milestones automate partial installment billing across the contract lifecycle (Advance, Delivery, Final Settlement).
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleGenerateSchedule}
                    disabled={scheduleLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${scheduleLoading ? "animate-spin" : ""}`} />
                    <span>Regenerate Milestones</span>
                  </button>
                  <Link
                    href="/sales/payment-terms"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded transition-colors shadow-sm"
                  >
                    <span>Manage Templates</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Milestone Summary KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Order Grand Total</div>
                  <div className="text-base font-bold text-gray-900 mt-1">{formatCurrency(order.grandTotal, order.currency)}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">100.00% Total Contract Value</div>
                </div>
                <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Invoiced Milestones</div>
                  <div className="text-base font-bold text-emerald-600 mt-1">
                    {formatCurrency(
                      schedules
                        .filter((s) => s.status === "INVOICED" || s.status === "PAID")
                        .reduce((acc, curr) => acc + curr.paymentAmount, 0),
                      order.currency
                    )}
                  </div>
                  <div className="text-[11px] text-emerald-700 mt-0.5">
                    {schedules
                      .filter((s) => s.status === "INVOICED" || s.status === "PAID")
                      .reduce((acc, curr) => acc + curr.invoicePortion, 0)
                      .toFixed(1)}
                    % Billed ({order.billingStatus})
                  </div>
                </div>
                <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Remaining Unbilled</div>
                  <div className="text-base font-bold text-amber-600 mt-1">
                    {formatCurrency(
                      schedules
                        .filter((s) => s.status === "UNPAID")
                        .reduce((acc, curr) => acc + curr.paymentAmount, 0),
                      order.currency
                    )}
                  </div>
                  <div className="text-[11px] text-amber-700 mt-0.5">
                    {schedules
                      .filter((s) => s.status === "UNPAID")
                      .reduce((acc, curr) => acc + curr.invoicePortion, 0)
                      .toFixed(1)}
                    % Remaining to Invoice
                  </div>
                </div>
              </div>

              {/* Payment Schedule Table */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-gray-900">Milestone Payment Schedule</span>
                  </div>
                  <span className="text-[11px] text-gray-500">
                    {schedules.length} Milestone Installments Defined
                  </span>
                </div>

                {scheduleLoading ? (
                  <div className="p-8 text-center text-xs text-gray-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-blue-600 mb-2" />
                    Calculating payment milestones...
                  </div>
                ) : schedules.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-500 space-y-3">
                    <AlertCircle className="w-6 h-6 mx-auto text-gray-400" />
                    <p>No payment schedule milestones generated for this order yet.</p>
                    <button
                      onClick={handleGenerateSchedule}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded font-semibold text-xs shadow-sm hover:bg-blue-700"
                    >
                      Generate Milestone Schedule
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50/75 text-gray-600 font-semibold border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-2.5">Milestone / Term</th>
                          <th className="px-4 py-2.5">Portion</th>
                          <th className="px-4 py-2.5">Due Date</th>
                          <th className="px-4 py-2.5 text-right">Payment Amount</th>
                          <th className="px-4 py-2.5 text-center">Status</th>
                          <th className="px-4 py-2.5">Linked Invoice</th>
                          <th className="px-4 py-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {schedules.map((milestone, idx) => {
                          const isInvoiced = milestone.status === "INVOICED" || milestone.status === "PAID";
                          const isProcessing = invoicingScheduleId === milestone.id;

                          return (
                            <tr key={milestone.id || idx} className="hover:bg-blue-50/20 transition-colors">
                              <td className="px-4 py-3">
                                <div className="font-bold text-gray-900">{milestone.paymentTerm}</div>
                                <div className="text-[11px] text-gray-500 mt-0.5">{milestone.description}</div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded font-semibold font-mono text-[11px]">
                                  {milestone.invoicePortion.toFixed(1)}%
                                </span>
                              </td>
                              <td className="px-4 py-3 font-mono text-gray-700">
                                {formatDate(milestone.dueDate)}
                              </td>
                              <td className="px-4 py-3 text-right font-bold text-gray-900 font-mono">
                                {formatCurrency(milestone.paymentAmount, order.currency)}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {milestone.status === "PAID" && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3" />
                                    PAID
                                  </span>
                                )}
                                {milestone.status === "INVOICED" && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                    <Receipt className="w-3 h-3" />
                                    INVOICED
                                  </span>
                                )}
                                {milestone.status === "UNPAID" && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                    <Clock className="w-3 h-3" />
                                    UNPAID
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {milestone.salesInvoiceNumber ? (
                                  <Link
                                    href={`/sales/invoices?search=${encodeURIComponent(milestone.salesInvoiceNumber)}`}
                                    className="font-mono text-blue-600 hover:text-blue-800 underline font-medium inline-flex items-center gap-1 text-[11px]"
                                  >
                                    <span>{milestone.salesInvoiceNumber}</span>
                                    <ArrowUpRight className="w-3 h-3" />
                                  </Link>
                                ) : (
                                  <span className="text-gray-400 italic text-[11px]">Not yet invoiced</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {isInvoiced ? (
                                  <Link
                                    href={`/sales/invoices?search=${encodeURIComponent(milestone.salesInvoiceNumber || "")}`}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                                  >
                                    <span>View Invoice</span>
                                  </Link>
                                ) : (
                                  <button
                                    onClick={() => handleInvoiceMilestone(milestone.id || "", milestone.paymentTerm)}
                                    disabled={isProcessing || order.status === "DRAFT"}
                                    title={order.status === "DRAFT" ? "Submit order before invoicing" : "Create partial Sales Invoice for this milestone"}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
                                  >
                                    <FilePlus className={`w-3.5 h-3.5 ${isProcessing ? "animate-spin" : ""}`} />
                                    <span>{isProcessing ? "Invoicing..." : "Invoice Milestone"}</span>
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Standard Commercial & Legal Terms */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-2 text-xs">
                <div className="font-bold text-gray-900">Commercial Terms & Conditions</div>
                <div className="font-mono text-gray-700 space-y-1">
                  <p>1. Payments are due strictly per the milestone schedule specified above.</p>
                  <p>2. Title and ownership of all goods remain with the company until 100% contract value is settled.</p>
                  <p>3. Overdue invoices beyond standard credit days are subject to 1.5% monthly late finance fee.</p>
                  <p>4. Delivery SLA: 5-7 business days from advance milestone settlement confirmation.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SALES TEAM MULTI-ALLOCATIONS */}
          {activeTab === "info" && (
            <div className="space-y-6">
              {teamSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs font-semibold text-emerald-800 animate-in fade-in duration-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{teamSuccess}</span>
                </div>
              )}

              {/* Team Allocation Header */}
              <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Sales Team Multi-Allocation & Split Commissions
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Split contract revenue credit and incentive commissions across multiple Account Executives and Technical Pre-Sales reps.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleAddTeamMember}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Sales Rep</span>
                  </button>
                  <button
                    onClick={handleSaveSalesTeam}
                    disabled={teamSaving}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded transition-colors shadow-sm disabled:opacity-50"
                  >
                    <Check className={`w-3.5 h-3.5 ${teamSaving ? "animate-spin" : ""}`} />
                    <span>{teamSaving ? "Saving..." : "Save Sales Team"}</span>
                  </button>
                </div>
              </div>

              {/* Team Allocation KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Order Value Allocated</div>
                  <div className="text-base font-bold text-gray-900 mt-1">{formatCurrency(order.grandTotal, order.currency)}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    {salesTeam.reduce((sum, m) => sum + (Number(m.allocatedPercentage) || 0), 0).toFixed(1)}% Total Allocation
                  </div>
                </div>
                <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Total Sales Incentives</div>
                  <div className="text-base font-bold text-emerald-600 mt-1">
                    {formatCurrency(
                      salesTeam.reduce((sum, m) => sum + (Number(m.incentives) || 0), 0),
                      order.currency
                    )}
                  </div>
                  <div className="text-[11px] text-emerald-700 mt-0.5">Sum of all rep commissions</div>
                </div>
                <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <div className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Collaborating Reps</div>
                  <div className="text-base font-bold text-indigo-600 mt-1">{salesTeam.length} Members</div>
                  <div className="text-[11px] text-indigo-700 mt-0.5">Cross-functional deal team</div>
                </div>
              </div>

              {/* Sales Team Members Table */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-gray-900">Sales Representatives & Contribution Breakdown</span>
                  </div>
                  {/* Contribution % validation badge */}
                  {(() => {
                    const totalP = salesTeam.reduce((sum, m) => sum + (Number(m.allocatedPercentage) || 0), 0);
                    const isValid = Math.abs(totalP - 100.0) < 0.01;
                    return isValid ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <Check className="w-3.5 h-3.5" />
                        100.00% Balanced
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Total: {totalP.toFixed(1)}% (Must equal 100%)
                      </span>
                    );
                  })()}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-2.5">Sales Person</th>
                        <th className="px-4 py-2.5 w-32">Contribution %</th>
                        <th className="px-4 py-2.5 text-right">Allocated Value</th>
                        <th className="px-4 py-2.5 w-28 text-right">Commission %</th>
                        <th className="px-4 py-2.5 text-right">Incentive Payout</th>
                        <th className="px-4 py-2.5 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {salesTeam.map((member, idx) => (
                        <tr key={idx} className="hover:bg-blue-50/20 transition-colors">
                          <td className="px-4 py-3">
                            <select
                              value={member.salesPersonId}
                              onChange={(e) => handleTeamMemberChange(idx, "salesPersonId", e.target.value)}
                              className="w-full max-w-xs px-2 py-1.5 border border-gray-200 rounded text-xs bg-white font-medium text-gray-900 focus:outline-none focus:border-blue-500"
                            >
                              {availableSalesPersons.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.salesPersonName} {p.employeeId ? `(${p.employeeId})` : ""}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={member.allocatedPercentage}
                                onChange={(e) => handleTeamMemberChange(idx, "allocatedPercentage", parseFloat(e.target.value) || 0)}
                                className="w-20 px-2 py-1.5 border border-gray-200 rounded text-xs text-right font-mono font-bold"
                              />
                              <span className="text-gray-500 font-semibold">%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-gray-900">
                            {formatCurrency(member.allocatedAmount, order.currency)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                value={member.commissionRate}
                                onChange={(e) => handleTeamMemberChange(idx, "commissionRate", parseFloat(e.target.value) || 0)}
                                className="w-16 px-2 py-1.5 border border-gray-200 rounded text-xs text-right font-mono"
                              />
                              <span className="text-gray-500 font-semibold">%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600">
                            {formatCurrency(member.incentives, order.currency)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveTeamMember(idx)}
                              disabled={salesTeam.length <= 1}
                              className="text-gray-400 hover:text-red-600 disabled:opacity-30 p-1"
                              title="Remove representative"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CONNECTIONS */}
          {activeTab === "connections" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {[
                { label: "Sales Invoice", count: order.perBilled > 0 ? 1 : 0, href: `/sales/invoices?salesOrderId=${order.id}` },
                { label: "Delivery Note", count: order.perDelivered > 0 ? 1 : 0, href: `/sales/delivery-notes?salesOrderId=${order.id}` },
                { label: "Drop Ship Requisitions", count: order.items?.some((i) => i.deliveredBySupplier) ? 1 : 0, href: `/sales/drop-ship?salesOrderId=${order.id}` },
                { label: "Stock Reservation Entry", count: order.status !== "DRAFT" ? 1 : 0, href: "#" },
                { label: "Payment Entry", count: 0, href: "/sales/payments" },
                { label: "Material Request", count: 0, href: "#" },
                { label: "Quotation", count: order.quotationId ? 1 : 0, href: `/sales/quotations` },
              ].map((conn, idx) => (
                <Link
                  key={idx}
                  href={conn.href}
                  className="p-3 bg-gray-50 border border-gray-200 rounded flex items-center justify-between hover:border-gray-400 transition-colors"
                >
                  <span className="font-medium text-gray-700 text-[11px] truncate">{conn.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    conn.count > 0 ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-600"
                  }`}>
                    {conn.count}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right ERPNext Sidebar Panel (3 cols matching exact screenshot) */}
        <div className="lg:col-span-3 space-y-4 border-l border-gray-200 pl-4">
          {/* Header Title with Print & Heart Icons */}
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div className="font-bold text-gray-900 text-sm truncate max-w-[170px]" title={order.customerName}>
              {order.customerName}
            </div>
            <div className="flex items-center gap-1.5 text-gray-400">
              <button onClick={() => setIsPrintOpen(true)} className="p-1 rounded hover:bg-gray-100 hover:text-gray-700">
                <Printer className="w-4 h-4" />
              </button>
              <button className="p-1 rounded hover:bg-gray-100 hover:text-red-500">
                <Heart className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="font-mono text-xs font-semibold text-gray-600">
            {order.orderNumber}
          </div>

          {/* Sidebar Action Buttons */}
          <div className="space-y-1.5 text-xs">
            <button className="w-full text-left py-1 text-gray-600 hover:text-gray-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-gray-400" />
                <span>Assign</span>
              </span>
            </button>
            <button className="w-full text-left py-1 text-gray-600 hover:text-gray-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-gray-400" />
                <span>Attachments</span>
              </span>
            </button>
            <button className="w-full text-left py-1 text-gray-600 hover:text-gray-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-gray-400" />
                <span>Tags</span>
              </span>
            </button>
            <button className="w-full text-left py-1 text-gray-600 hover:text-gray-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-gray-400" />
                <span>Share</span>
              </span>
            </button>
          </div>

          {/* Edit / Audit Trail Section */}
          <div className="pt-3 border-t border-gray-200 space-y-2 text-[11px] text-gray-500">
            <div>
              <div className="font-medium text-gray-700">Last Edited By You</div>
              <div className="text-gray-400">57 minutes ago</div>
            </div>
            <div>
              <div className="font-medium text-gray-700">Created By You</div>
              <div className="text-gray-400">57 minutes ago</div>
            </div>
          </div>
        </div>
      </div>

      {isPrintOpen && (
        <PrintDocumentModal
          isOpen={isPrintOpen}
          onClose={() => setIsPrintOpen(false)}
          title="Sales Order Confirmation"
          docNumber={order.orderNumber}
          docDate={formatDate(order.transactionDate)}
          customerName={order.customerName}
          billingAddress="100 Tech Enterprise Blvd, Suite 400, New York, NY 10001"
          currency={order.currency || "INR"}
          items={items.map((i) => ({
            itemCode: i.itemCode,
            itemName: i.itemName,
            qty: i.qty || 1,
            rate: i.rate,
            amount: i.amount || (i.qty * i.rate),
          }))}
          netTotal={itemsNetTotal}
          totalTax={itemsNetTotal * 0.18}
          grandTotal={order.grandTotal || itemsNetTotal * 1.18}
          status={order.status}
        />
      )}
    </div>
  );
}
