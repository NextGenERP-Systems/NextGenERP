"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Layers,
  Search,
  Filter,
  RefreshCw,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  Boxes,
  ArrowRight,
  ShieldCheck,
  Scale,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getGeneralLedgerEntries, getAccounts, postPerpetualStockGl } from "@/lib/api";
import { GeneralLedgerEntry, Account, PerpetualStockGlRequest } from "@/types/accounting";

export default function GeneralLedgerPage() {
  const [entries, setEntries] = useState<GeneralLedgerEntry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [selectedVoucherType, setSelectedVoucherType] = useState("");

  // Perpetual Stock Posting Modal State
  const [isPerpetualModalOpen, setIsPerpetualModalOpen] = useState(false);
  const [nature, setNature] = useState<"RECEIPT" | "DELIVERY" | "LANDED_COST" | "VARIANCE_SURPLUS" | "VARIANCE_SHORTAGE">("RECEIPT");
  const [voucherType, setVoucherType] = useState<"STOCK_ENTRY" | "DELIVERY_NOTE" | "PURCHASE_RECEIPT" | "LANDED_COST_VOUCHER">("PURCHASE_RECEIPT");
  const [voucherNumber, setVoucherNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [itemSummary, setItemSummary] = useState("");
  const [remarks, setRemarks] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [glData, accData] = await Promise.all([
        getGeneralLedgerEntries(),
        getAccounts(),
      ]);
      setEntries(glData);
      setAccounts(accData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesSearch =
        !searchTerm ||
        entry.voucherNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.partyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.account?.accountName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.againstAccount?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.remarks?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesAccount =
        !selectedAccountId || entry.account?.id === selectedAccountId;

      const matchesVoucherType =
        !selectedVoucherType || entry.voucherType === selectedVoucherType;

      return matchesSearch && matchesAccount && matchesVoucherType;
    });
  }, [entries, searchTerm, selectedAccountId, selectedVoucherType]);

  // Aggregate Metrics
  const { totalDebit, totalCredit, isBalanced } = useMemo(() => {
    let d = 0;
    let c = 0;
    filteredEntries.forEach((entry) => {
      d += entry.debit || 0;
      c += entry.credit || 0;
    });
    return {
      totalDebit: d,
      totalCredit: c,
      isBalanced: Math.abs(d - c) < 0.01,
    };
  }, [filteredEntries]);

  // Handle Perpetual Stock Posting
  async function handlePostPerpetualStock(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      alert("Please specify a valid positive amount.");
      return;
    }

    setIsPosting(true);
    try {
      const autoVch =
        voucherNumber.trim() ||
        `${voucherType === "PURCHASE_RECEIPT" ? "PREC" : voucherType === "DELIVERY_NOTE" ? "DN" : "STE"}-${Date.now().toString().slice(-6)}`;

      const req: PerpetualStockGlRequest = {
        voucherType,
        voucherNumber: autoVch,
        transactionNature: nature,
        amount: parsedAmount,
        itemSummary: itemSummary || "Finished Goods / Raw Materials",
        remarks: remarks || `Automated Perpetual Inventory GL Entry (${nature})`,
        postingDate: new Date().toISOString().split("T")[0],
      };

      await postPerpetualStockGl(req);
      setIsPerpetualModalOpen(false);
      setVoucherNumber("");
      setAmount("");
      setItemSummary("");
      setRemarks("");
      setSuccessBanner(`Posted double-entry GL transactions for ${autoVch} (₹${parsedAmount.toLocaleString()})`);
      setTimeout(() => setSuccessBanner(null), 6000);
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to post perpetual stock GL entry.");
    } finally {
      setIsPosting(false);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              General Ledger (GL)
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white shadow-2xs">
              Double-Entry Core
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Immutable double-entry ledger audit book, real-time perpetual stock synchronization &amp; clearance
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={loadData} className="liquid-btn-glass text-xs" title="Refresh">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
          <button
            onClick={() => setIsPerpetualModalOpen(true)}
            className="liquid-btn-primary text-xs flex items-center gap-1.5"
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Post Perpetual Inventory GL</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successBanner && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="liquid-glass-card p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Debit Volume
          </span>
          <div className="text-xl font-black font-mono text-emerald-600">
            {formatCurrency(totalDebit)}
          </div>
          <p className="text-[10px] text-slate-400">Across {filteredEntries.length} line items</p>
        </div>

        <div className="liquid-glass-card p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Credit Volume
          </span>
          <div className="text-xl font-black font-mono text-blue-600">
            {formatCurrency(totalCredit)}
          </div>
          <p className="text-[10px] text-slate-400">Across {filteredEntries.length} line items</p>
        </div>

        <div className="liquid-glass-card p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Double-Entry Invariant
          </span>
          <div className="flex items-center gap-2 mt-1">
            {isBalanced ? (
              <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                BALANCED (₹0.00)
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                OUT OF BALANCE: {formatCurrency(Math.abs(totalDebit - totalCredit))}
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-400">Debits == Credits Enforcement</p>
        </div>

        <div className="liquid-glass-card p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Ledger Entries
          </span>
          <div className="text-xl font-black font-mono text-slate-900">
            {filteredEntries.length}
          </div>
          <p className="text-[10px] text-slate-400">From all transactional vouchers</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by voucher #, account, party, remarks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={selectedVoucherType}
            onChange={(e) => setSelectedVoucherType(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <option value="">All Voucher Types</option>
            <option value="SALES_INVOICE">Sales Invoice</option>
            <option value="PURCHASE_INVOICE">Purchase Invoice</option>
            <option value="PAYMENT_ENTRY">Payment Entry</option>
            <option value="JOURNAL_ENTRY">Journal Entry</option>
            <option value="PURCHASE_RECEIPT">Purchase Receipt (Stock In)</option>
            <option value="DELIVERY_NOTE">Delivery Note (COGS)</option>
            <option value="STOCK_ENTRY">Stock Entry</option>
            <option value="LANDED_COST_VOUCHER">Landed Cost Voucher</option>
          </select>

          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 max-w-[220px]"
          >
            <option value="">All Accounts</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.accountCode} - {a.accountName}
              </option>
            ))}
          </select>

          {(searchTerm || selectedAccountId || selectedVoucherType) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedAccountId("");
                setSelectedVoucherType("");
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* General Ledger Table */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs bg-white">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
            <tr>
              <th className="py-3 px-4">Posting Date</th>
              <th className="py-3 px-4">Voucher Type &amp; Number</th>
              <th className="py-3 px-4">Account (CoA)</th>
              <th className="py-3 px-4">Against Account</th>
              <th className="py-3 px-4">Party / Cost Center</th>
              <th className="py-3 px-4 text-right">Debit (₹)</th>
              <th className="py-3 px-4 text-right">Credit (₹)</th>
              <th className="py-3 px-4">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Loading immutable ledger entries...</span>
                  </div>
                </td>
              </tr>
            ) : filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  No General Ledger entries match your active criteria.
                </td>
              </tr>
            ) : (
              filteredEntries.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-700 whitespace-nowrap">
                    {row.postingDate}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-bold font-mono text-slate-900">{row.voucherNumber}</div>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                      {row.voucherType}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">
                      {row.account?.accountName || "Account"}
                    </div>
                    <div className="font-mono text-[10px] text-slate-400">
                      Code: {row.account?.accountCode || "—"} ({row.account?.rootType})
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {row.againstAccount || "—"}
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    {row.partyName ? (
                      <div>
                        <span className="font-bold text-slate-800">{row.partyName}</span>
                        {row.partyType && (
                          <span className="text-[9px] text-slate-400 block uppercase">
                            {row.partyType}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 whitespace-nowrap">
                    {row.debit > 0 ? formatCurrency(row.debit) : "—"}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-blue-600 whitespace-nowrap">
                    {row.credit > 0 ? formatCurrency(row.credit) : "—"}
                  </td>
                  <td className="py-3 px-4 text-slate-500 max-w-[200px] truncate" title={row.remarks || ""}>
                    {row.remarks || "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {filteredEntries.length > 0 && (
            <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-800">
              <tr>
                <td colSpan={5} className="py-3 px-4 text-right uppercase text-[10px] tracking-wider text-slate-500">
                  Total Ledger Sum
                </td>
                <td className="py-3 px-4 text-right font-mono text-emerald-700 text-sm">
                  {formatCurrency(totalDebit)}
                </td>
                <td className="py-3 px-4 text-right font-mono text-blue-700 text-sm">
                  {formatCurrency(totalCredit)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* PERPETUAL STOCK GL POSTING MODAL */}
      {isPerpetualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="liquid-glass-card bg-white/95 max-w-xl w-full p-6 space-y-5 shadow-2xl border border-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-extrabold text-slate-900">
                  Post Perpetual Inventory GL Entry
                </h2>
              </div>
              <button
                onClick={() => setIsPerpetualModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePostPerpetualStock} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Transaction Nature *</label>
                <select
                  value={nature}
                  onChange={(e) => {
                    const n = e.target.value as any;
                    setNature(n);
                    if (n === "RECEIPT") setVoucherType("PURCHASE_RECEIPT");
                    else if (n === "DELIVERY") setVoucherType("DELIVERY_NOTE");
                    else if (n === "LANDED_COST") setVoucherType("LANDED_COST_VOUCHER");
                    else setVoucherType("STOCK_ENTRY");
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                >
                  <option value="RECEIPT">Purchase Receipt (Debit: Stock In Hand | Credit: Stock Received Not Billed)</option>
                  <option value="DELIVERY">Delivery Note / Shipment (Debit: COGS | Credit: Stock In Hand)</option>
                  <option value="LANDED_COST">Landed Cost Voucher (Debit: Stock In Hand | Credit: Expenses in Valuation)</option>
                  <option value="VARIANCE_SURPLUS">Stock Reconciliation Surplus (Debit: Stock In Hand | Credit: Surplus Income)</option>
                  <option value="VARIANCE_SHORTAGE">Stock Reconciliation Shortage (Debit: Stock Loss | Credit: Stock In Hand)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Voucher Type</label>
                  <select
                    value={voucherType}
                    onChange={(e) => setVoucherType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    <option value="PURCHASE_RECEIPT">Purchase Receipt</option>
                    <option value="DELIVERY_NOTE">Delivery Note</option>
                    <option value="STOCK_ENTRY">Stock Entry</option>
                    <option value="LANDED_COST_VOUCHER">Landed Cost Voucher</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Voucher Number</label>
                  <input
                    type="text"
                    placeholder="e.g. PREC-2026-0042 (Optional)"
                    value={voucherNumber}
                    onChange={(e) => setVoucherNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Inventory Valuation Amount (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 150000.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 text-right text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Item Summary / Reference</label>
                <input
                  type="text"
                  placeholder="e.g. 50x Industrial Server Units, 20x Memory Modules"
                  value={itemSummary}
                  onChange={(e) => setItemSummary(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ledger Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Inward consignment inspection verified"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-[11px] text-slate-600">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-blue-600" />
                  ERPNext Double-Entry Preview:
                </div>
                {nature === "RECEIPT" && (
                  <p>• Dr. Stock In Hand (₹{amount || "0.00"}) &nbsp;|&nbsp; Cr. Stock Received But Not Billed (₹{amount || "0.00"})</p>
                )}
                {nature === "DELIVERY" && (
                  <p>• Dr. Cost of Goods Sold (₹{amount || "0.00"}) &nbsp;|&nbsp; Cr. Stock In Hand (₹{amount || "0.00"})</p>
                )}
                {nature === "LANDED_COST" && (
                  <p>• Dr. Stock In Hand (₹{amount || "0.00"}) &nbsp;|&nbsp; Cr. Expenses Included In Valuation (₹{amount || "0.00"})</p>
                )}
                {nature === "VARIANCE_SURPLUS" && (
                  <p>• Dr. Stock In Hand (₹{amount || "0.00"}) &nbsp;|&nbsp; Cr. Stock Adjustment Surplus (₹{amount || "0.00"})</p>
                )}
                {nature === "VARIANCE_SHORTAGE" && (
                  <p>• Dr. Stock Adjustment Loss (₹{amount || "0.00"}) &nbsp;|&nbsp; Cr. Stock In Hand (₹{amount || "0.00"})</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsPerpetualModalOpen(false)}
                  className="liquid-btn-glass text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPosting}
                  className="liquid-btn-primary text-xs"
                >
                  {isPosting ? "Posting to Ledger..." : "Post Double Entries"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
