"use client";

import React, { useRef } from "react";
import { Printer, X, Download, Building2, CheckCircle2 } from "lucide-react";

interface PrintDocumentProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  docNumber: string;
  docDate: string;
  customerName: string;
  billingAddress?: string;
  currency?: string;
  items: Array<{
    itemCode: string;
    itemName: string;
    qty: number;
    rate: number;
    amount: number;
    uom?: string;
  }>;
  netTotal: number;
  totalTax?: number;
  grandTotal: number;
  notes?: string;
  status?: string;
}

function convertAmountToWords(amount: number, currency: string = "INR"): string {
  if (!amount || amount === 0) return `Zero ${currency} Only`;
  const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function numToWords(n: number): string {
    if (n < 20) return units[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + units[n % 10] : "");
    if (n < 1000) return units[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " " + numToWords(n % 100) : "");
    if (n < 100000) return numToWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 !== 0 ? " " + numToWords(n % 1000) : "");
    if (n < 10000000) return numToWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 !== 0 ? " " + numToWords(n % 100000) : "");
    return numToWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 !== 0 ? " " + numToWords(n % 10000000) : "");
  }

  const whole = Math.floor(amount);
  const words = numToWords(whole);
  return `${words} ${currency} Only`;
}

export function PrintDocumentModal({
  isOpen,
  onClose,
  title,
  docNumber,
  docDate,
  customerName,
  billingAddress,
  currency = "INR",
  items,
  netTotal,
  totalTax = 0,
  grandTotal,
  notes,
  status,
}: PrintDocumentProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Printer className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-slate-800 text-sm">
              Print / Preview: {title} ({docNumber})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Document</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="overflow-y-auto p-8 space-y-6 text-slate-800 text-xs" ref={printRef}>
          {/* Company Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  N
                </div>
                <span className="text-lg font-bold text-slate-900 tracking-tight">NextGen ERP Corp</span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Innovation Tech Park, Building 4<br />
                Silicon Valley, CA 94025<br />
                GSTIN / Tax ID: US-98472918-X<br />
                contact@nextgen.erp | +1 (800) 555-0199
              </p>
            </div>

            <div className="text-right space-y-1">
              <div className="inline-block px-2.5 py-1 bg-blue-50 border border-blue-200 rounded text-blue-800 font-bold uppercase text-[11px] tracking-wider mb-1">
                {title}
              </div>
              <div className="font-semibold text-slate-800 text-sm">{docNumber}</div>
              <div className="text-slate-500 text-[11px]">Date: {docDate}</div>
              {status && (
                <div className="text-[10px] font-medium text-emerald-600">Status: {status}</div>
              )}
            </div>
          </div>

          {/* Billed To / Shipping To */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <div className="font-semibold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                Customer / Billed To:
              </div>
              <div className="font-bold text-slate-900 text-sm">{customerName}</div>
              {billingAddress && (
                <p className="text-slate-600 text-xs mt-0.5 whitespace-pre-line">{billingAddress}</p>
              )}
            </div>
            <div>
              <div className="font-semibold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                Payment Terms & Currency:
              </div>
              <div className="text-slate-800 font-medium">Currency: {currency}</div>
              <div className="text-slate-600 text-xs mt-0.5">Due upon receipt (Net 30)</div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/75 border-b border-slate-200 text-slate-700 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">#</th>
                  <th className="py-2.5 px-4">Item Code & Description</th>
                  <th className="py-2.5 px-4 text-right">Qty</th>
                  <th className="py-2.5 px-4 text-right">Unit Rate ({currency})</th>
                  <th className="py-2.5 px-4 text-right">Amount ({currency})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-4 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                    <td className="py-2.5 px-4">
                      <div className="font-semibold text-slate-900">{item.itemName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{item.itemCode}</div>
                    </td>
                    <td className="py-2.5 px-4 text-right font-medium">
                      {Number(item.qty).toLocaleString()} {item.uom || "Nos"}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono">
                      {Number(item.rate).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-900 font-mono">
                      {Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="flex justify-between items-start pt-2">
            <div className="max-w-xs space-y-1">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Notes & Terms:
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                {notes || "Thank you for your business. For support or inquiries, please contact operations@nextgen.erp."}
              </p>
            </div>

            <div className="w-64 space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Net Total:</span>
                <span className="font-mono font-medium">
                  {currency} {Number(netTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              {totalTax > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Taxes (8.25%):</span>
                  <span className="font-mono font-medium">
                    {currency} {Number(totalTax).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-2 text-sm">
                <span>Grand Total:</span>
                <span className="font-mono text-blue-700">
                  {currency} {Number(grandTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Amount in Words */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between">
            <span className="text-slate-500 font-medium">Amount in Words:</span>
            <span className="font-semibold text-slate-800 italic">
              {convertAmountToWords(grandTotal, currency)}
            </span>
          </div>

          {/* Signature Signoff */}
          <div className="pt-8 border-t border-slate-200 flex justify-between items-end text-[11px] text-slate-500">
            <div>
              <div className="font-semibold text-slate-700">Authorized Signatory</div>
              <div className="h-10 border-b border-slate-300 w-48 mt-2" />
              <div className="text-[10px] text-slate-400 mt-1">NextGen ERP Sales Operations</div>
            </div>
            <div className="text-right text-[10px] text-slate-400">
              Generated securely by NextGen ERP System • {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
