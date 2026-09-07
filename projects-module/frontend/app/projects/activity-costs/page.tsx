"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, UserCircle, Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ActivityCostsPage() {
  const [costs, setCosts] = useState<any[]>([]);
  const [activityTypes, setActivityTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<any>(null);
  
  // Note: auth isn't integrated yet so employeeId is free text / UUID
  const [formData, setFormData] = useState({ 
    employeeId: "", 
    activityTypeId: "", 
    costingRate: "", 
    billingRate: "" 
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [costRes, typeRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083/api/v1"}/activity-costs`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083/api/v1"}/activity-types`)
      ]);
      
      if (costRes.ok && typeRes.ok) {
        setCosts(await costRes.json());
        setActivityTypes(await typeRes.json());
      }
    } catch (err) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (cost: any = null) => {
    if (cost) {
      setEditingCost(cost);
      setFormData({ 
        employeeId: cost.employeeId || "", 
        activityTypeId: cost.activityType?.id || "", 
        costingRate: cost.costingRate || "", 
        billingRate: cost.billingRate || "" 
      });
    } else {
      setEditingCost(null);
      setFormData({ employeeId: "", activityTypeId: "", costingRate: "", billingRate: "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeId) {
      toast.error("Employee ID is required");
      return;
    }
    if (!formData.activityTypeId) {
      toast.error("Activity Type is required");
      return;
    }

    const payload = {
      employeeId: formData.employeeId,
      activityType: { id: formData.activityTypeId },
      costingRate: formData.costingRate ? parseFloat(formData.costingRate) : null,
      billingRate: formData.billingRate ? parseFloat(formData.billingRate) : null,
    };

    try {
      const url = editingCost 
        ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083/api/v1"}/activity-costs/${editingCost.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083/api/v1"}/activity-costs`;
      
      const res = await fetch(url, {
        method: editingCost ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        if (res.status === 409 || res.status === 500) {
           toast.error("An Activity Cost might already exist for this employee and type.");
        } else {
           throw new Error("Failed");
        }
        return;
      }
      
      toast.success(editingCost ? "Updated successfully" : "Created successfully");
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error("Failed to save Activity Cost");
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this activity cost?")) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083/api/v1"}/activity-costs/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Failed to delete");
      
      toast.success("Deleted successfully");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const filteredCosts = costs.filter(c => 
    (c.employeeId && c.employeeId.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.activityType?.name && c.activityType.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex-1 p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Activity Costs</h1>
          <p className="text-sm text-gray-500 mt-1">Configure employee-specific rates for different activity types.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-all">
            <Plus size={16} /> New Activity Cost
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center bg-white rounded-md px-3 py-1.5 w-64 border border-gray-300 focus-within:border-blue-500 transition-all">
            <Search size={16} className="text-gray-400 mr-2" />
            <input type="text" placeholder="Search by employee..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-transparent border-none outline-none text-sm w-full text-gray-800" />
          </div>
        </div>
        
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Employee ID</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Activity Type</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Costing Rate</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Billing Rate</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading...</td></tr>
            ) : filteredCosts.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">No activity costs found.</td></tr>
            ) : (
              filteredCosts.map(c => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-medium text-gray-900 flex items-center gap-2">
                    <div className="p-1.5 bg-gray-100 text-gray-600 rounded-full"><UserCircle size={16} /></div>
                    <span className="truncate max-w-[200px]" title={c.employeeId}>{c.employeeId}</span>
                  </td>
                  <td className="p-4 text-gray-900 font-medium">{c.activityType?.name || "-"}</td>
                  <td className="p-4 text-gray-600">{c.costingRate ? `$${c.costingRate.toFixed(2)}` : "-"}</td>
                  <td className="p-4 text-gray-600">{c.billingRate ? `$${c.billingRate.toFixed(2)}` : "-"}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => openModal(c)} className="text-gray-400 hover:text-blue-600 p-1 rounded-md transition-colors mr-2">
                      <Edit size={16} />
                    </button>
                    <button onClick={(e) => handleDelete(c.id, e)} className="text-gray-400 hover:text-red-600 p-1 rounded-md transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editingCost ? "Edit Activity Cost" : "New Activity Cost"}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Employee ID <span className="text-red-500">*</span></label>
                <input type="text" value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" required disabled={!!editingCost} placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000" />
                {!editingCost && <p className="text-xs text-gray-500">Provide the UUID of the employee.</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Activity Type <span className="text-red-500">*</span></label>
                <select value={formData.activityTypeId} onChange={e => setFormData({...formData, activityTypeId: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" required disabled={!!editingCost}>
                  <option value="">Select an activity type</option>
                  {activityTypes.filter(t => t.isActive).map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Costing Rate</label>
                  <input type="number" step="0.01" min="0" value={formData.costingRate} onChange={e => setFormData({...formData, costingRate: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Billing Rate</label>
                  <input type="number" step="0.01" min="0" value={formData.billingRate} onChange={e => setFormData({...formData, billingRate: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0.00" />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
