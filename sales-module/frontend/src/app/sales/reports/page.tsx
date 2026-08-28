"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Package,
  Calendar,
  DollarSign,
  PieChart,
  RefreshCw,
  Clock,
  Layers,
  ArrowUpRight,
  ShieldAlert,
} from "lucide-react";
import {
  getSalesOrderAnalysisReport,
  getCustomerCreditAgingReport,
  getQuotationWinLossReport,
  getItemSalesHistoryReport,
  getSalesTrendsReport,
  getCustomerAcquisitionReport,
  getQuotationTrendsDetailedReport,
  getInactiveCustomersReport,
  getSalesCommissionSummaryReport,
} from "@/lib/api";
import {
  SalesOrderAnalysisReport,
  CustomerCreditAgingReport,
  QuotationWinLossReport,
  ItemSalesHistoryReport,
  SalesTrendsReport,
  CustomerAcquisitionReport,
  QuotationTrendsReport,
  InactiveCustomerReport,
  SalesCommissionSummary,
} from "@/types/sales";
import { Users, AlertOctagon, Award, UserCheck, Home } from "lucide-react";
import Link from "next/link";

export default function ReportsHubPage() {
  const [activeTab, setActiveTab] = useState<"orderAnalysis" | "aging" | "winLoss" | "itemSales" | "trends" | "cohort" | "quoteTrends" | "inactive" | "commission">("orderAnalysis");
  const [loading, setLoading] = useState(true);

  const [orderAnalysis, setOrderAnalysis] = useState<SalesOrderAnalysisReport[]>([]);
  const [creditAging, setCreditAging] = useState<CustomerCreditAgingReport[]>([]);
  const [winLoss, setWinLoss] = useState<QuotationWinLossReport | null>(null);
  const [itemHistory, setItemHistory] = useState<ItemSalesHistoryReport[]>([]);
  const [trends, setTrends] = useState<SalesTrendsReport[]>([]);
  const [cohort, setCohort] = useState<CustomerAcquisitionReport[]>([]);
  const [quoteTrends, setQuoteTrends] = useState<QuotationTrendsReport[]>([]);
  const [inactiveCustomers, setInactiveCustomers] = useState<InactiveCustomerReport[]>([]);
  const [commissions, setCommissions] = useState<SalesCommissionSummary[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [orderData, agingData, winLossData, itemData, trendsData, cohortData, qTrendsData, inactData, commData] = await Promise.all([
        getSalesOrderAnalysisReport().catch(() => []),
        getCustomerCreditAgingReport().catch(() => []),
        getQuotationWinLossReport().catch(() => null),
        getItemSalesHistoryReport().catch(() => []),
        getSalesTrendsReport().catch(() => []),
        getCustomerAcquisitionReport().catch(() => []),
        getQuotationTrendsDetailedReport().catch(() => []),
        getInactiveCustomersReport().catch(() => []),
        getSalesCommissionSummaryReport().catch(() => []),
      ]);
      setOrderAnalysis(orderData || []);
      setCreditAging(agingData || []);
      setWinLoss(winLossData || null);
      setItemHistory(itemData || []);
      setTrends(trendsData || []);
      setCohort(cohortData || []);
      setQuoteTrends(qTrendsData || []);
      setInactiveCustomers(inactData || []);
      setCommissions(commData || []);
    } catch (err) {
      console.error("Failed to load reports data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
            Reports
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-1.5 rounded border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="px-6 space-y-4">

      {/* Tabs Header */}
      <div className="flex flex-wrap border-b border-slate-200 gap-4 text-sm font-medium">
        <button
          onClick={() => setActiveTab("orderAnalysis")}
          className={`pb-2.5 transition-all flex items-center gap-2 ${
            activeTab === "orderAnalysis"
              ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Sales Order Fulfilment & Billing</span>
        </button>

        <button
          onClick={() => setActiveTab("aging")}
          className={`pb-2.5 transition-all flex items-center gap-2 ${
            activeTab === "aging"
              ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Accounts Receivable (AR) Aging</span>
        </button>

        <button
          onClick={() => setActiveTab("winLoss")}
          className={`pb-2.5 transition-all flex items-center gap-2 ${
            activeTab === "winLoss"
              ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <PieChart className="h-4 w-4" />
          <span>Quotation Win / Loss Funnel</span>
        </button>

        <button
          onClick={() => setActiveTab("itemSales")}
          className={`pb-2.5 transition-all flex items-center gap-2 ${
            activeTab === "itemSales"
              ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Package className="h-4 w-4" />
          <span>Item Sales History</span>
        </button>

        <button
          onClick={() => setActiveTab("trends")}
          className={`pb-2.5 transition-all flex items-center gap-2 ${
            activeTab === "trends"
              ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          <span>Sales & Quote Trends</span>
        </button>

        <button
          onClick={() => setActiveTab("cohort")}
          className={`pb-2.5 transition-all flex items-center gap-2 ${
            activeTab === "cohort"
              ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Customer Cohort & LTV</span>
        </button>

        <button
          onClick={() => setActiveTab("quoteTrends")}
          className={`pb-2.5 transition-all flex items-center gap-2 ${
            activeTab === "quoteTrends"
              ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          <span>Quotation Trends</span>
        </button>

        <button
          onClick={() => setActiveTab("inactive")}
          className={`pb-2.5 transition-all flex items-center gap-2 ${
            activeTab === "inactive"
              ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <AlertOctagon className="h-4 w-4" />
          <span>Inactive Accounts</span>
        </button>

        <button
          onClick={() => setActiveTab("commission")}
          className={`pb-2.5 transition-all flex items-center gap-2 ${
            activeTab === "commission"
              ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Award className="h-4 w-4" />
          <span>Sales Commissions</span>
        </button>
      </div>

      {/* TAB 1: Sales Order Analysis */}
      {activeTab === "orderAnalysis" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-sm">
              Sales Order Fulfilment & Billing Analysis
            </h2>
            <div className="text-xs text-slate-500">{orderAnalysis.length} Tracked Orders</div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4 text-right">Grand Total</th>
                  <th className="py-3 px-4 text-center">Delivered %</th>
                  <th className="py-3 px-4 text-center">Billed %</th>
                  <th className="py-3 px-4 text-right">Pending Delivery</th>
                  <th className="py-3 px-4 text-right">Pending Billing</th>
                  <th className="py-3 px-4 text-center">Order Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orderAnalysis.map((row) => (
                  <tr key={row.orderId} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-blue-600">{row.orderNumber}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{row.customerName}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                      ₹{Number(row.grandTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${Math.min(100, row.deliveredPercentage)}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10px] text-slate-600">{row.deliveredPercentage}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-emerald-600 h-2 rounded-full"
                            style={{ width: `${Math.min(100, row.billedPercentage)}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10px] text-slate-600">{row.billedPercentage}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">
                      ₹{Number(row.pendingDeliveryAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">
                      ₹{Number(row.pendingBillingAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          row.status === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: AR Aging Report */}
      {activeTab === "aging" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-sm">Customer Accounts Receivable (AR) Aging Summary</h2>
            <div className="text-xs text-slate-500">Aging buckets calculated by invoice due dates</div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4 text-right">Credit Limit</th>
                  <th className="py-3 px-4 text-right">Outstanding</th>
                  <th className="py-3 px-4 text-right">Available Credit</th>
                  <th className="py-3 px-4 text-right">Current (0-30d)</th>
                  <th className="py-3 px-4 text-right">31 - 60 Days</th>
                  <th className="py-3 px-4 text-right">61 - 90 Days</th>
                  <th className="py-3 px-4 text-right">&gt; 90 Days Overdue</th>
                  <th className="py-3 px-4 text-center">Limit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {creditAging.map((row) => (
                  <tr key={row.customerId} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{row.customerName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{row.customerCode}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-slate-700">
                      ₹{Number(row.creditLimit).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ₹{Number(row.outstandingBalance).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-600 font-medium">
                      ₹{Number(row.availableCredit).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">
                      ₹{Number(row.currentDue).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-amber-600 font-medium">
                      ₹{Number(row.overdue31to60).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-orange-600 font-medium">
                      ₹{Number(row.overdue61to90).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-red-600 font-bold">
                      ₹{Number(row.overdueAbove90).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {row.creditExceeded ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200">
                          <AlertTriangle className="h-3 w-3" /> EXCEEDED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" /> GOOD
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Win / Loss Funnel */}
      {activeTab === "winLoss" && winLoss && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Win Rate %</div>
              <div className="text-3xl font-bold text-emerald-600 font-mono">{winLoss.winRatePercentage}%</div>
              <div className="text-[11px] text-slate-500">Won quotes vs Total closed</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Pipeline</div>
              <div className="text-2xl font-bold text-slate-900 font-mono">
                ₹{Number(winLoss.totalPipelineValue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-500">{winLoss.totalQuotations} Total Proposals</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Won Revenue</div>
              <div className="text-2xl font-bold text-emerald-600 font-mono">
                ₹{Number(winLoss.wonValue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-emerald-600 font-medium">{winLoss.wonQuotations} Quotes Ordered</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Open Pipeline</div>
              <div className="text-2xl font-bold text-blue-600 font-mono">{winLoss.openQuotations} Quotes</div>
              <div className="text-[11px] text-blue-600 font-medium">In negotiation / review</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-slate-900 text-sm">Lost Reason Distribution & Analysis</h2>
            {Object.keys(winLoss.lostReasonsCount).length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs italic">
                No lost quotations recorded yet. All active proposals are winning!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(winLoss.lostReasonsCount).map(([reason, count]) => (
                  <div key={reason} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-800">{reason}</span>
                    <span className="font-mono font-bold text-red-600">{count} lost</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Item Sales Velocity History */}
      {activeTab === "itemSales" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-sm">Item Catalog Sales History & Realized Rates</h2>
            <div className="text-xs text-slate-500">{itemHistory.length} SKUs Ordered</div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Item Code & Name</th>
                  <th className="py-3 px-4">Group</th>
                  <th className="py-3 px-4 text-right">Qty Ordered</th>
                  <th className="py-3 px-4 text-right">Qty Delivered</th>
                  <th className="py-3 px-4 text-right">Qty Billed</th>
                  <th className="py-3 px-4 text-right">Total Revenue</th>
                  <th className="py-3 px-4 text-right">Avg Realized Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {itemHistory.map((row) => (
                  <tr key={row.itemId} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{row.itemName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{row.itemCode}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{row.itemGroup}</td>
                    <td className="py-3 px-4 text-right font-medium text-slate-900 font-mono">
                      {Number(row.totalQtyOrdered).toLocaleString()} Nos
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-blue-600 font-mono">
                      {Number(row.totalQtyDelivered).toLocaleString()} Nos
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-emerald-600 font-mono">
                      {Number(row.totalQtyBilled).toLocaleString()} Nos
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                      ₹{Number(row.totalSalesRevenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700 font-medium">
                      ₹{Number(row.averageSellingRate).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: Monthly Sales & Quote Trends */}
      {activeTab === "trends" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-sm">Monthly Revenue Trends & Conversion Velocity</h2>
            <div className="text-xs text-slate-500">{trends.length} Monthly Periods</div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4 text-center">Confirmed Orders</th>
                  <th className="py-3 px-4 text-right">Confirmed Revenue</th>
                  <th className="py-3 px-4 text-center">Open Quotations</th>
                  <th className="py-3 px-4 text-right">Pipeline Value</th>
                  <th className="py-3 px-4 text-center">Win Conversion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trends.map((row) => (
                  <tr key={row.period} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 font-mono">{row.period}</td>
                    <td className="py-3 px-4 text-center font-medium text-slate-700 font-mono">{row.salesOrdersCount} Orders</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600 font-mono">
                      ₹{Number(row.confirmedRevenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-slate-700 font-mono">{row.quotationsCount} Quotes</td>
                    <td className="py-3 px-4 text-right font-mono text-blue-600 font-medium">
                      ₹{Number(row.quotationValue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-emerald-700 font-mono">
                      {row.winConversionRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: Customer Cohort & Lifetime Value */}
      {activeTab === "cohort" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-sm">Customer Acquisition & Lifetime Value (LTV) Cohorts</h2>
            <div className="text-xs text-slate-500">{cohort.length} Tracked Accounts</div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Group & Territory</th>
                  <th className="py-3 px-4 text-center">First Order</th>
                  <th className="py-3 px-4 text-center">Latest Order</th>
                  <th className="py-3 px-4 text-center">Orders Count</th>
                  <th className="py-3 px-4 text-right">Lifetime Value (LTV)</th>
                  <th className="py-3 px-4 text-center">Loyalty Segment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cohort.map((c) => (
                  <tr key={c.customerId} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{c.customerName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{c.customerCode}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{c.customerGroup}</div>
                      <div className="text-[10px] text-slate-400">{c.territory}</div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-500">{c.firstOrderDate}</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-700 font-medium">{c.lastOrderDate}</td>
                    <td className="py-3 px-4 text-center font-bold font-mono text-slate-900">{c.totalOrdersCount}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                      ₹{Number(c.lifetimeValue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        c.loyaltySegment === "VIP Key Account"
                          ? "bg-purple-100 text-purple-800 border border-purple-200"
                          : c.loyaltySegment === "Regular Client"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}>
                        {c.loyaltySegment}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: Detailed Quotation Conversion Trends */}
      {activeTab === "quoteTrends" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-sm">Quotation Pipeline Velocity & Conversion Trends</h2>
            <div className="text-xs text-slate-500">{quoteTrends.length} Monthly Periods</div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4 text-center">Total Quotes</th>
                  <th className="py-3 px-4 text-center">Converted / Ordered</th>
                  <th className="py-3 px-4 text-center">Lost</th>
                  <th className="py-3 px-4 text-center">Expired</th>
                  <th className="py-3 px-4 text-right">Total Pipeline</th>
                  <th className="py-3 px-4 text-right">Won Revenue</th>
                  <th className="py-3 px-4 text-center">Win Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quoteTrends.map((q) => (
                  <tr key={q.period} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 font-mono">{q.period}</td>
                    <td className="py-3 px-4 text-center font-semibold font-mono text-slate-800">{q.totalQuotations}</td>
                    <td className="py-3 px-4 text-center font-semibold font-mono text-emerald-600">{q.orderedQuotations}</td>
                    <td className="py-3 px-4 text-center font-semibold font-mono text-rose-600">{q.lostQuotations}</td>
                    <td className="py-3 px-4 text-center font-semibold font-mono text-amber-600">{q.expiredQuotations}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">
                      ₹{Number(q.totalQuotationValue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-bold font-mono text-emerald-600">
                      ₹{Number(q.wonQuotationValue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {q.conversionRatePercentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 8: Inactive Accounts & Churn Risk */}
      {activeTab === "inactive" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-sm">Inactive Accounts & Churn Risk Early Warning</h2>
            <div className="text-xs text-slate-500">{inactiveCustomers.length} Monitored Accounts</div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Group & Territory</th>
                  <th className="py-3 px-4 text-center">Last Order Date</th>
                  <th className="py-3 px-4 text-center">Days Inactive</th>
                  <th className="py-3 px-4 text-center">Historical Orders</th>
                  <th className="py-3 px-4 text-right">Lifetime Revenue</th>
                  <th className="py-3 px-4 text-center">Churn Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inactiveCustomers.map((c) => (
                  <tr key={c.customerId} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{c.customerName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{c.customerCode}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{c.customerGroup}</div>
                      <div className="text-[10px] text-slate-400">{c.territory}</div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-600">{c.lastOrderDate}</td>
                    <td className="py-3 px-4 text-center font-bold font-mono text-slate-800">{c.daysSinceLastOrder} Days</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-700">{c.totalHistoricalOrders}</td>
                    <td className="py-3 px-4 text-right font-bold font-mono text-slate-900">
                      ₹{Number(c.lifetimeRevenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        c.churnRiskLevel === "CRITICAL"
                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                          : c.churnRiskLevel === "HIGH"
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-blue-100 text-blue-800 border border-blue-200"
                      }`}>
                        {c.churnRiskLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 9: Sales Commissions & Rep Performance */}
      {activeTab === "commission" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-sm">Sales Representative Commission & Payout Summary</h2>
            <div className="text-xs text-slate-500">{commissions.length} Sales Representatives</div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Sales Representative</th>
                  <th className="py-3 px-4 text-center">Orders Closed</th>
                  <th className="py-3 px-4 text-right">Allocated Sales Volume</th>
                  <th className="py-3 px-4 text-center">Commission %</th>
                  <th className="py-3 px-4 text-right">Base Commission</th>
                  <th className="py-3 px-4 text-right">Bonus / Incentives</th>
                  <th className="py-3 px-4 text-right">Total Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {commissions.map((r) => (
                  <tr key={r.salesPersonName} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">{r.salesPersonName}</td>
                    <td className="py-3 px-4 text-center font-bold font-mono text-slate-800">{r.totalOrdersCount}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                      ₹{Number(r.totalAllocatedAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-medium text-slate-700">{r.avgCommissionRate}%</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-600 font-semibold">
                      ₹{Number(r.totalCommissionEarned).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-purple-600 font-semibold">
                      ₹{Number(r.totalIncentivesEarned).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-bold font-mono text-emerald-700 text-sm">
                      ₹{Number(r.totalPayout).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
