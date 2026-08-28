"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Mail,
  Phone,
  Building,
  X,
  CreditCard,
  Building2,
  Trash2,
} from "lucide-react";
import { getEmployees, createEmployee, deleteEmployee, MOCK_DEPARTMENTS, MOCK_DESIGNATIONS } from "@/lib/api";
import { Employee } from "@/types/hrm";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmp, setNewEmp] = useState({
    firstName: "",
    lastName: "",
    workEmail: "",
    cellNumber: "",
    departmentId: MOCK_DEPARTMENTS[0].id,
    designationId: MOCK_DESIGNATIONS[0].id,
    panNumber: "",
    bankName: "HDFC Bank",
    bankAccountNumber: "",
    ifscCode: "HDFC0000123",
  });

  useEffect(() => {
    async function load() {
      const data = await getEmployees();
      setEmployees(data);
    }
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createEmployee(newEmp);
    const updated = await getEmployees();
    setEmployees(updated);
    setShowAddModal(false);
    setNewEmp({
      firstName: "",
      lastName: "",
      workEmail: "",
      cellNumber: "",
      departmentId: MOCK_DEPARTMENTS[0].id,
      designationId: MOCK_DESIGNATIONS[0].id,
      panNumber: "",
      bankName: "HDFC Bank",
      bankAccountNumber: "",
      ifscCode: "HDFC0000123",
    });
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await deleteEmployee(id);
    const updated = await getEmployees();
    setEmployees(updated);
    if (selectedEmp?.id === id) {
      setSelectedEmp(null);
    }
  };

  const filtered = employees.filter((emp) => {
    const matchesSearch =
      `${emp.firstName} ${emp.lastName} ${emp.employeeCode} ${emp.workEmail}`
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchesDept =
      selectedDept === "ALL" || emp.department?.id === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            Employee Master (Employee 360)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Comprehensive directory, organizational hierarchy, and statutory details
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="liquid-btn-primary flex items-center gap-2 px-5 py-2.5 text-xs self-start shadow-md"
        >
          <UserPlus className="w-4 h-4 text-white" />
          Onboard New Employee
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, code, email, designation..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="ALL">All Departments</option>
            {MOCK_DEPARTMENTS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.departmentName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Employee Grid */}
      {filtered.length === 0 ? (
        <div className="liquid-glass-card p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No Employees Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Start building your enterprise directory by onboarding yourself or your team members.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="liquid-btn-primary px-6 py-2.5 text-xs inline-flex items-center gap-2 shadow-md"
          >
            <UserPlus className="w-4 h-4 text-white" />
            Onboard Your Profile Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((emp) => (
            <div
              key={emp.id}
              onClick={() => setSelectedEmp(emp)}
              className="p-6 rounded-2xl liquid-glass-card cursor-pointer space-y-4 group relative"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50/80 border border-indigo-100/80 flex items-center justify-center font-black text-sm text-indigo-700 shadow-2xs">
                    {emp.firstName[0]}
                    {emp.lastName ? emp.lastName[0] : ""}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {emp.firstName} {emp.lastName}
                    </div>
                    <div className="text-xs text-slate-500 font-mono font-bold">{emp.employeeCode}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      emp.status === "ACTIVE"
                        ? "bg-emerald-50/90 text-emerald-800 border border-emerald-300/80"
                        : "bg-amber-50/90 text-amber-800 border border-amber-300/80"
                    }`}
                  >
                    {emp.status}
                  </span>
                  <button
                    onClick={(e) => handleDelete(emp.id, e)}
                    title="Delete Employee"
                    className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-xs border-t border-white/40 pt-3">
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>{emp.department?.departmentName || "Engineering"}</span>
                </div>
                <div className="text-slate-500 pl-5.5 text-[11px]">
                  {emp.designation?.designationName || "Software Engineer"}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{emp.workEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{emp.cellNumber}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-white/40">
                <span>Joined: {emp.dateOfJoining}</span>
                <span className="text-indigo-600 font-bold group-hover:underline flex items-center gap-1">Inspect 360 →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add Employee */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Onboard New Employee</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">First Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Hitanshu"
                    value={newEmp.firstName}
                    onChange={(e) => setNewEmp({ ...newEmp, firstName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Last Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Panchal"
                    value={newEmp.lastName}
                    onChange={(e) => setNewEmp({ ...newEmp, lastName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Work Email</label>
                <input
                  required
                  type="email"
                  placeholder="e.g. phitanshu962@gmail.com"
                  value={newEmp.workEmail}
                  onChange={(e) => setNewEmp({ ...newEmp, workEmail: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Phone Number</label>
                  <input
                    required
                    type="text"
                    placeholder="+91 93241 36973"
                    value={newEmp.cellNumber}
                    onChange={(e) => setNewEmp({ ...newEmp, cellNumber: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">PAN Number</label>
                  <input
                    type="text"
                    value={newEmp.panNumber}
                    onChange={(e) => setNewEmp({ ...newEmp, panNumber: e.target.value })}
                    placeholder="ABCDE1234F"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Department</label>
                  <select
                    value={newEmp.departmentId}
                    onChange={(e) => setNewEmp({ ...newEmp, departmentId: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    {MOCK_DEPARTMENTS.map((d) => (
                      <option key={d.id} value={d.id}>{d.departmentName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Designation</label>
                  <select
                    value={newEmp.designationId}
                    onChange={(e) => setNewEmp({ ...newEmp, designationId: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    {MOCK_DESIGNATIONS.map((d) => (
                      <option key={d.id} value={d.id}>{d.designationName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="liquid-btn-glass px-5 py-2.5 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="liquid-btn-primary px-5 py-2.5 text-xs shadow-md"
                >
                  Complete Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drawer / Dialog: Employee 360 Detail View */}
      {selectedEmp && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-lg font-black text-indigo-700">
                  {selectedEmp.firstName[0]}{selectedEmp.lastName ? selectedEmp.lastName[0] : ""}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedEmp.firstName} {selectedEmp.lastName}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono font-bold">{selectedEmp.employeeCode} • {selectedEmp.designation?.designationName}</p>
                </div>
              </div>
              <button onClick={() => setSelectedEmp(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Department</span>
                <p className="text-slate-900 font-bold">{selectedEmp.department?.departmentName}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Employment Status</span>
                <p className="text-emerald-700 font-bold">{selectedEmp.status} ({selectedEmp.employmentType})</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Official Email</span>
                <p className="text-slate-900 font-mono font-semibold">{selectedEmp.workEmail}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Contact Number</span>
                <p className="text-slate-900 font-semibold">{selectedEmp.cellNumber}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Bank Details</span>
                <p className="text-slate-900 font-mono font-semibold">{selectedEmp.bankName || "HDFC Bank"} • A/C: {selectedEmp.bankAccountNumber || "50100234567890"}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">PAN & Statutory</span>
                <p className="text-slate-900 font-mono font-semibold">PAN: {selectedEmp.panNumber || "ABCDE1234F"}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => handleDelete(selectedEmp.id)}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Profile
              </button>
              <button
                onClick={() => setSelectedEmp(null)}
                className="liquid-btn-glass px-6 py-2.5 text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
