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

  // Aggregate Metrics - 100% Dynamic derived from live ledger entries
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
    if (!amount || parseFloat(amount) <= 0) return;

    setIsPosting(true);
    try {
      const req: PerpetualStockGlRequest = {
        nature,
        voucherType,
        voucherNumber: voucherNumber || `PERP-${Date.now().toString().slice(-6)}`,
        amount: parseFloat(amount),
        itemSummary: itemSummary || "Inventory stock movement",
        postingDate: new Date().toISOString().split("T")[0],
        remarks: remarks || `Automated perpetual inventory ledger sync (${nature})`,
      };

      const res = await postPerpetualStockGl(req);
      setSuccessBanner(`Successfully posted ${res?.length || 2} double-entry perpetual inventory ledger lines!`);
      setIsPerpetualModalOpen(false);
      setAmount("");
      setItemSummary("");
      setRemarks("");
      setVoucherNumber("");
      await loadData();
      setTimeout(() => setSuccessBanner(null), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPosting(false);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
              General Ledger (GL)
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-800">
              Double-Entry Core
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Immutable double-entry ledger audit book, real-time perpetual inventory synchronization &amp; clearance
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            className="px-3 py-1.5 rounded-lg border border-zinc-300 text-zinc-700 bg-white hover:bg-zinc-50 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
          <button
            onClick={() => setIsPerpetualModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>+ Post Perpetual Inventory GL</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successBanner && (
        <div className="p-3 rounded-lg bg-zinc-100 border border-zinc-300 text-zinc-900 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-zinc-900 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Metric Cards (Monochrome B&W) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200 rounded-lg p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Total Debit Volume
          </span>
          <div className="text-xl font-bold font-mono text-zinc-900">
            {formatCurrency(totalDebit)}
          </div>
          <p className="text-[10px] text-zinc-400">Across {filteredEntries.length} line items</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Total Credit Volume
          </span>
          <div className="text-xl font-bold font-mono text-zinc-900">
            {formatCurrency(totalCredit)}
          </div>
          <p className="text-[10px] text-zinc-400">Across {filteredEntries.length} line items</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Double-Entry Status
          </span>
          <div className="flex items-center gap-2 mt-1">
            {isBalanced ? (
              <span className="px-2 py-0.5 rounded font-mono text-xs font-semibold bg-zinc-100 border border-zinc-200 text-zinc-900 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-900" />
                BALANCED (₹0.00)
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded font-mono text-xs font-semibold bg-zinc-200 border border-zinc-400 text-zinc-900 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-zinc-900" />
                DIFF: {formatCurrency(Math.abs(totalDebit - totalCredit))}
              </span>
            )}
          </div>
          <p className="text-[10px] text-zinc-400">Debits == Credits Enforcement</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Total Ledger Entries
          </span>
          <div className="text-xl font-bold font-mono text-zinc-900">
            {filteredEntries.length}
          </div>
          <p className="text-[10px] text-zinc-400">From all transactional vouchers</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-3 rounded-lg bg-white border border-zinc-200 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by voucher #, account, party, remarks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1 text-xs rounded border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-800 placeholder:text-zinc-400"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <select
            value={selectedVoucherType}
            onChange={(e) => setSelectedVoucherType(e.target.value)}
            className="px-2.5 py-1 rounded border border-zinc-200 text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-800"
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
            className="px-2.5 py-1 rounded border border-zinc-200 text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-800 max-w-[220px]"
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
              className="text-xs font-semibold text-zinc-500 hover:text-zinc-900"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* General Ledger Table */}
      <div className="border border-zinc-200 rounded-lg overflow-hidden bg-white">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase text-[10px]">
            <tr>
              <th className="py-2.5 px-3">Posting Date</th>
              <th className="py-2.5 px-3">Voucher Type &amp; Number</th>
              <th className="py-2.5 px-3">Account (CoA)</th>
              <th className="py-2.5 px-3">Against Account</th>
              <th className="py-2.5 px-3">Party / Cost Center</th>
              <th className="py-2.5 px-3 text-right">Debit (₹)</th>
              <th className="py-2.5 px-3 text-right">Credit (₹)</th>
              <th className="py-2.5 px-3">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 font-medium">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-zinc-400">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Loading immutable ledger entries...</span>
                  </div>
                </td>
              </tr>
            ) : filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-zinc-400">
                  No General Ledger entries match your active criteria.
                </td>
              </tr>
            ) : (
              filteredEntries.map((row) => (
                <tr key={row.id} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-zinc-700 whitespace-nowrap">
                    {row.postingDate}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="font-bold font-mono text-zinc-900">{row.voucherNumber}</div>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                      {row.voucherType}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-zinc-900">
                      {row.account?.accountName || "Account"}
                    </div>
                    <div className="font-mono text-[10px] text-zinc-400">
                      Code: {row.account?.accountCode || "—"} ({row.account?.rootType})
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-zinc-600">
                    {row.againstAccount || "—"}
                  </td>
                  <td className="py-2.5 px-3 text-zinc-700">
                    {row.partyName ? (
                      <div>
                        <span className="font-semibold text-zinc-900">{row.partyName}</span>
                        {row.partyType && (
                          <span className="text-[9px] text-zinc-400 block uppercase">
                            {row.partyType}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-zinc-900 whitespace-nowrap">
                    {row.debit > 0 ? formatCurrency(row.debit) : "—"}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-zinc-900 whitespace-nowrap">
                    {row.credit > 0 ? formatCurrency(row.credit) : "—"}
                  </td>
                  <td className="py-2.5 px-3 text-zinc-500 max-w-[200px] truncate" title={row.remarks || ""}>
                    {row.remarks || "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {filteredEntries.length > 0 && (
            <tfoot className="bg-zinc-50 font-bold border-t border-zinc-200 text-zinc-900">
              <tr>
                <td colSpan={5} className="py-2.5 px-3 text-right uppercase text-[10px] tracking-wider text-zinc-500">
                  Total Ledger Sum
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-zinc-900 text-sm">
                  {formatCurrency(totalDebit)}
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-zinc-900 text-sm">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white max-w-xl w-full p-5 rounded-lg space-y-4 shadow-xl border border-zinc-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-zinc-900" />
                <h2 className="text-sm font-bold text-zinc-900">
                  Post Perpetual Inventory GL Entry
                </h2>
              </div>
              <button
                onClick={() => setIsPerpetualModalOpen(false)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePostPerpetualStock} className="space-y-3 text-xs font-medium">
              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Transaction Nature *</label>
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
                  className="w-full px-2.5 py-1.5 rounded border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                >
                  <option value="RECEIPT">Purchase Receipt (Debit: Stock In Hand | Credit: Stock Received Not Billed)</option>
                  <option value="DELIVERY">Delivery Note / Shipment (Debit: COGS | Credit: Stock In Hand)</option>
                  <option value="LANDED_COST">Landed Cost Voucher (Debit: Stock In Hand | Credit: Expenses in Valuation)</option>
                  <option value="VARIANCE_SURPLUS">Stock Reconciliation Surplus (Debit: Stock In Hand | Credit: Surplus Income)</option>
                  <option value="VARIANCE_SHORTAGE">Stock Reconciliation Shortage (Debit: Stock Loss | Credit: Stock In Hand)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Voucher Type</label>
                  <select
                    value={voucherType}
                    onChange={(e) => setVoucherType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                  >
                    <option value="PURCHASE_RECEIPT">Purchase Receipt</option>
                    <option value="DELIVERY_NOTE">Delivery Note</option>
                    <option value="STOCK_ENTRY">Stock Entry</option>
                    <option value="LANDED_COST_VOUCHER">Landed Cost Voucher</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Voucher Number</label>
                  <input
                    type="text"
                    placeholder="e.g. PREC-2026-0042 (Optional)"
                    value={voucherNumber}
                    onChange={(e) => setVoucherNumber(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-zinc-300 font-mono focus:outline-none focus:ring-1 focus:ring-zinc-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Inventory Valuation Amount (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 150000.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-zinc-300 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-zinc-800 text-right"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Item Summary / Reference</label>
                <input
                  type="text"
                  placeholder="e.g. 50x Industrial Server Units, 20x Memory Modules"
                  value={itemSummary}
                  onChange={(e) => setItemSummary(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Ledger Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Inward consignment inspection verified"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                />
              </div>

              <div className="p-2.5 rounded bg-zinc-50 border border-zinc-200 space-y-1 text-[11px] text-zinc-600">
                <div className="font-semibold text-zinc-800 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-zinc-700" />
                  ERPNext Double-Entry Preview:
                </div>
                {nature === "RECEIPT" && (
                  <p>• Dr. Stock In Hand (₹{amount || "0.00"}) | Cr. Stock Received But Not Billed (₹{amount || "0.00"})</p>
                )}
                {nature === "DELIVERY" && (
                  <p>• Dr. Cost of Goods Sold (₹{amount || "0.00"}) | Cr. Stock In Hand (₹{amount || "0.00"})</p>
                )}
                {nature === "LANDED_COST" && (
                  <p>• Dr. Stock In Hand (₹{amount || "0.00"}) | Cr. Expenses Included In Valuation (₹{amount || "0.00"})</p>
                )}
                {nature === "VARIANCE_SURPLUS" && (
                  <p>• Dr. Stock In Hand (₹{amount || "0.00"}) | Cr. Stock Adjustment Surplus (₹{amount || "0.00"})</p>
                )}
                {nature === "VARIANCE_SHORTAGE" && (
                  <p>• Dr. Stock Adjustment Loss (₹{amount || "0.00"}) | Cr. Stock In Hand (₹{amount || "0.00"})</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setIsPerpetualModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-zinc-300 text-zinc-700 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPosting}
                  className="px-4 py-1.5 rounded bg-zinc-900 hover:bg-black text-white font-medium"
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
