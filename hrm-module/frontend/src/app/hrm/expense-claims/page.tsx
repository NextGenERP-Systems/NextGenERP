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
} from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { ExpenseClaim, Employee } from "@/types/hrm";

export default function ExpenseClaimsPage() {
  const [claims, setClaims] = useState<ExpenseClaim[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [newClaim, setNewClaim] = useState({
    employeeId: "",
    expenseType: "Travel & Client Visit",
    totalAmount: 4500,
    claimDate: new Date().toISOString().split("T")[0],
    description: "Client on-site technical architecture workshop and local commute",
  });

  useEffect(() => {
    async function load() {
      const [claimData, empData] = await Promise.all([
        getExpenseClaims(),
        getEmployees(),
      ]);
      setClaims(claimData);
      setEmployees(empData);
      if (empData.length > 0) {
        setNewClaim((prev) => ({
          ...prev,
          employeeId: empData[0].id,
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
          className="liquid-btn-primary flex items-center gap-2 px-5 py-2.5 text-xs self-start shadow-xs"
        >
          <Receipt className="w-4 h-4 text-slate-800" />
          Submit Expense Claim
        </button>
      </div>

      {/* Expense Claims Table */}
      <div className="liquid-glass-card rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/60 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Reimbursement Claims
          </h2>
          <span className="text-xs text-slate-500 font-medium">{claims.length} Total Claims</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/60 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Claim #</th>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Claim Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40">
              {claims.map((claim) => (
                <tr key={claim.id} className="hover:bg-white/40 transition-colors">
                  <td className="px-6 py-4 font-mono text-slate-800 font-bold">{claim.claimNumber}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">
                    {claim.employee?.firstName} {claim.employee?.lastName}
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-medium">{claim.expenseType}</td>
                  <td className="px-6 py-4 text-slate-600 font-mono text-[11px]">{claim.claimDate}</td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-800">{formatCurrency(claim.totalAmount)}</td>
                  <td className="px-6 py-4 text-slate-600 max-w-[200px] truncate">{claim.description}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider liquid-glass text-slate-800">
                      {claim.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {claim.status === "SUBMITTED" && (
                      <>
                        <button
                          onClick={() => handleApprove(claim.id)}
                          className="liquid-btn-primary px-3 py-1 text-[11px]"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(claim.id)}
                          className="liquid-btn-glass px-3 py-1 text-[11px] text-slate-600 hover:text-rose-600"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Submit Claim */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-white/60">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Submit Expense Claim</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Employee</label>
                <select
                  value={newClaim.employeeId}
                  onChange={(e) => setNewClaim({ ...newClaim, employeeId: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-500 font-medium"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.firstName} {e.lastName} ({e.employeeCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Expense Category</label>
                <select
                  value={newClaim.expenseType}
                  onChange={(e) => setNewClaim({ ...newClaim, expenseType: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-500 font-medium"
                >
                  <option value="Travel & Client Visit">Travel & Client Visit</option>
                  <option value="Meals & Team Entertainment">Meals & Team Entertainment</option>
                  <option value="Technical Certification & Books">Technical Certification & Books</option>
                  <option value="Office Equipment & Hardware">Office Equipment & Hardware</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Amount (INR)</label>
                  <input
                    type="number"
                    step="100"
                    value={newClaim.totalAmount}
                    onChange={(e) => setNewClaim({ ...newClaim, totalAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-500 font-mono font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Claim Date</label>
                  <input
                    type="date"
                    value={newClaim.claimDate}
                    onChange={(e) => setNewClaim({ ...newClaim, claimDate: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Description & Business Purpose</label>
                <textarea
                  rows={3}
                  value={newClaim.description}
                  onChange={(e) => setNewClaim({ ...newClaim, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-500 font-medium"
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
                  className="liquid-btn-primary px-5 py-2.5 text-xs shadow-xs"
                >
                  Submit Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
