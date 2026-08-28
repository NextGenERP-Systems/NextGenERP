"use client";

import { useEffect, useState } from "react";
import {
  Receipt,
  PlusCircle,
  CheckCircle2,
  Building,
  CreditCard,
  Check,
  X,
  Plus,
} from "lucide-react";
import {
  getExpenseClaims,
  createExpenseClaim,
  approveExpenseClaim,
  rejectExpenseClaim,
  getEmployees,
  getSalesCustomers,
} from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { ExpenseClaim, Employee, CustomerSummaryOption } from "@/types/hrm";

export default function ExpenseClaimsPage() {
  const [claims, setClaims] = useState<ExpenseClaim[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [customers, setCustomers] = useState<CustomerSummaryOption[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [newClaim, setNewClaim] = useState({
    employeeId: "",
    expenseType: "Travel & Client Visit",
    totalAmount: 4500,
    claimDate: new Date().toISOString().split("T")[0],
    description: "Client on-site technical architecture workshop and local commute",
    customerId: "",
    customerName: "",
    salesOrderId: "SAL-ORD-2026-0001",
    isBillable: true,
  });

  useEffect(() => {
    async function load() {
      const [claimData, empData, custData] = await Promise.all([
        getExpenseClaims(),
        getEmployees(),
        getSalesCustomers(),
      ]);
      setClaims(claimData);
      setEmployees(empData);
      setCustomers(custData || []);
      if (empData.length > 0) {
        setNewClaim((prev) => ({
          ...prev,
          employeeId: empData[0].id,
          customerName: custData && custData.length > 0 ? custData[0].customerName : "Apex Global Technologies LLC",
          customerId: custData && custData.length > 0 ? custData[0].id : "",
        }));
      }
    }
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await createExpenseClaim(newClaim);
    setClaims((prev) => [created, ...prev]);
    setShowModal(false);
  };

  const handleApprove = async (id: string) => {
    const updated = await approveExpenseClaim(id);
    if (updated) {
      setClaims((prev) => prev.map((c) => (c.id === id ? { ...c, status: "APPROVED" } : c)));
    }
  };

  const handleReject = async (id: string) => {
    const updated = await rejectExpenseClaim(id);
    if (updated) {
      setClaims((prev) => prev.map((c) => (c.id === id ? { ...c, status: "REJECTED" } : c)));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            Expense Claims & Reimbursements
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Travel, meals, client entertainment expense validation and payment settlements
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="liquid-btn-primary flex items-center gap-2 px-5 py-2.5 text-xs shadow-md self-start"
        >
          <Receipt className="w-4 h-4 text-white" />
          + Submit Expense Claim
        </button>
      </div>

      {/* Claims Table */}
      {claims.length === 0 ? (
        <div className="liquid-glass-card p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mx-auto shadow-2xs">
            <Receipt className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No Expense Claims Submitted</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 font-medium">
              Submit travel bills, food allowances, or client entertainment receipts for management approval.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="liquid-btn-primary px-6 py-2.5 text-xs inline-flex items-center gap-2 shadow-md"
          >
            <Plus className="w-4 h-4 text-white" />
            Submit Your First Claim
          </button>
        </div>
      ) : (
        <div className="liquid-glass-card rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/60 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Employee Expense Claims
            </h2>
            <span className="text-xs text-slate-500 font-medium">{claims.length} records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/40 border-b border-white/60 text-slate-600 font-bold">
                <tr>
                  <th className="px-5 py-3.5">Claim #</th>
                  <th className="px-5 py-3.5">Employee</th>
                  <th className="px-5 py-3.5">Expense Category</th>
                  <th className="px-5 py-3.5">Client / Sales Account</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Claimed Amount</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/40">
                {claims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-white/40 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-indigo-700">{claim.claimNumber}</td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">
                        {claim.employee?.firstName} {claim.employee?.lastName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono font-medium">{claim.employee?.employeeCode}</div>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-800">{claim.expenseType}</td>
                    <td className="px-5 py-4">
                      {claim.customerName ? (
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-900 flex items-center gap-1">
                            <Building className="w-3 h-3 text-indigo-600" />
                            {claim.customerName}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px]">
                            {claim.salesOrderId && (
                              <span className="font-mono text-slate-500">{claim.salesOrderId}</span>
                            )}
                            <span className={`px-1.5 py-0.2 rounded font-bold ${
                              claim.isBillable ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"
                            }`}>
                              {claim.isBillable ? "Billable" : "Internal"}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">General Internal</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-600 font-medium">{claim.claimDate}</td>
                    <td className="px-5 py-4 font-mono font-bold text-slate-900">
                      {formatCurrency(claim.totalAmount)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          claim.status === "APPROVED" || claim.status === "PAID"
                            ? "bg-emerald-50/90 text-emerald-800 border border-emerald-300/80"
                            : claim.status === "REJECTED"
                            ? "bg-rose-50/90 text-rose-800 border border-rose-300/80"
                            : "bg-amber-50/90 text-amber-800 border border-amber-300/80"
                        }`}
                      >
                        {claim.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {claim.status === "SUBMITTED" && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(claim.id)}
                            className="liquid-btn-emerald px-3 py-1 text-xs shadow-xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(claim.id)}
                            className="liquid-btn-glass px-3 py-1 text-xs text-rose-600 hover:text-rose-800 shadow-xs"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Submit Expense Claim */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Submit New Expense Claim</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Select Employee</label>
                <select
                  value={newClaim.employeeId}
                  onChange={(e) => setNewClaim({ ...newClaim, employeeId: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeCode})
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer Account Tagging (Sales Integration) */}
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-950 flex items-center gap-1.5 text-[11px]">
                    <Building className="w-3.5 h-3.5 text-indigo-600" />
                    Tag to Customer / Client Account (Sales)
                  </span>
                  <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-indigo-200 font-bold text-indigo-600">
                    Sales Link
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 text-[10px] font-semibold mb-1">Customer</label>
                    <select
                      value={newClaim.customerName}
                      onChange={(e) => {
                        const c = customers.find((cust) => cust.customerName === e.target.value);
                        setNewClaim({
                          ...newClaim,
                          customerName: e.target.value,
                          customerId: c ? c.id : "",
                        });
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-indigo-200 rounded-lg text-slate-900 font-medium text-xs focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">-- General / Non-Client --</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.customerName}>
                          {c.customerName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 text-[10px] font-semibold mb-1">Sales Order / Deal Ref</label>
                    <input
                      type="text"
                      placeholder="SAL-ORD-2026-0001"
                      value={newClaim.salesOrderId}
                      onChange={(e) => setNewClaim({ ...newClaim, salesOrderId: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-indigo-200 rounded-lg text-slate-900 font-mono text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newClaim.isBillable}
                    onChange={(e) => setNewClaim({ ...newClaim, isBillable: e.target.checked })}
                    className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-700 font-semibold text-[11px]">
                    Billable to Client (Included in Next Sales Invoice)
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Expense Category</label>
                  <select
                    value={newClaim.expenseType}
                    onChange={(e) => setNewClaim({ ...newClaim, expenseType: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    <option value="Travel & Client Visit">Travel & Client Visit</option>
                    <option value="Client Entertainment & Meals">Client Entertainment & Meals</option>
                    <option value="Hardware & Office Supplies">Hardware & Office Supplies</option>
                    <option value="Conference & Certification">Conference & Certification</option>
                    <option value="Internet & Telephone Allowance">Internet & Telephone Allowance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Claim Amount (INR)</label>
                  <input
                    required
                    type="number"
                    min="100"
                    value={newClaim.totalAmount}
                    onChange={(e) => setNewClaim({ ...newClaim, totalAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Expense Date</label>
                <input
                  type="date"
                  value={newClaim.claimDate}
                  onChange={(e) => setNewClaim({ ...newClaim, claimDate: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Description & Business Justification</label>
                <textarea
                  rows={3}
                  value={newClaim.description}
                  onChange={(e) => setNewClaim({ ...newClaim, description: e.target.value })}
                  placeholder="Explain purpose of expenditure..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="liquid-btn-glass px-5 py-2.5 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="liquid-btn-primary px-5 py-2.5 text-xs shadow-md"
                >
                  Submit Expense Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
