"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Tag, Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ProjectTypesPage() {
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", description: "", isActive: true });

  const fetchTypes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083/api/v1"}/project-types`);
      if (res.ok) {
        const data = await res.json();
        setTypes(data);
      }
    } catch (err) {
      toast.error("Failed to fetch project types");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const openModal = (type: any = null) => {
    if (type) {
      setEditingType(type);
      setFormData({ name: type.name, description: type.description || "", isActive: type.isActive });
    } else {
      setEditingType(null);
      setFormData({ name: "", description: "", isActive: true });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Name is required");
      return;
    }

    try {
      const url = editingType 
        ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083/api/v1"}/project-types/${editingType.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083/api/v1"}/project-types`;
      
      const res = await fetch(url, {
        method: editingType ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Failed to save");
      
      toast.success(editingType ? "Updated successfully" : "Created successfully");
      setIsModalOpen(false);
      fetchTypes();
    } catch (err) {
      toast.error("Failed to save Project Type");
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this project type?")) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083/api/v1"}/project-types/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        if (res.status === 409 || res.status === 400 || res.status === 500) {
           toast.error("Cannot delete. It might be referenced by a project.");
        } else {
           throw new Error("Failed");
        }
      } else {
        toast.success("Deleted successfully");
        fetchTypes();
      }
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const filteredTypes = types.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex-1 p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Project Types</h1>
          <p className="text-sm text-gray-500 mt-1">Classify projects into standard categories like Internal, External, etc.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-all">
            <Plus size={16} /> New Project Type
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center bg-white rounded-md px-3 py-1.5 w-64 border border-gray-300 focus-within:border-blue-500 transition-all">
            <Search size={16} className="text-gray-400 mr-2" />
            <input type="text" placeholder="Search project types..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-transparent border-none outline-none text-sm w-full text-gray-800" />
          </div>
        </div>
        
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Project Type</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Description</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr><td colSpan={4} className="p-8 text-center text-gray-500">Loading...</td></tr>
            ) : filteredTypes.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-gray-500">No project types found.</td></tr>
            ) : (
              filteredTypes.map(t => (
                <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-medium text-gray-900 flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 text-blue-600 rounded"><Tag size={16} /></div>
                    {t.name}
                  </td>
                  <td className="p-4 text-gray-600">{t.description || "-"}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {t.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => openModal(t)} className="text-gray-400 hover:text-blue-600 p-1 rounded-md transition-colors mr-2">
                      <Edit size={16} />
                    </button>
                    <button onClick={(e) => handleDelete(t.id, e)} className="text-gray-400 hover:text-red-600 p-1 rounded-md transition-colors">
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
              <h2 className="text-lg font-bold text-gray-900">{editingType ? "Edit Project Type" : "New Project Type"}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Name <span className="text-red-500">*</span></label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
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
