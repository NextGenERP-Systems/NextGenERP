"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, FileText, Send, Edit, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";

export default function ProjectUpdatesPage() {
  const [updates, setUpdates] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<any>(null);

  const [formData, setFormData] = useState({
    projectId: "",
    updateDate: new Date().toISOString().split('T')[0],
    progress: "",
    challenges: "",
    nextSteps: "",
    recipients: "",
    status: "Draft"
  });

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083/api"}/projects`);
      if (res.ok) {
        setProjects(await res.json());
      }
    } catch (e) {
      toast.error("Failed to fetch projects");
    }
  };

  const fetchUpdates = async (projectId: string) => {
    setLoading(true);
    try {
      if (projectId) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083/api/v1"}/project-updates/project/${projectId}`);
        if (res.ok) setUpdates(await res.json());
      } else {
        setUpdates([]);
      }
    } catch (err) {
      toast.error("Failed to fetch updates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchUpdates(selectedProjectId);
  }, [selectedProjectId]);

  const openModal = (update: any = null) => {
    if (update) {
      setEditingUpdate(update);
      setFormData({
        projectId: update.projectId || selectedProjectId,
        updateDate: update.updateDate,
        progress: update.progress || "",
        challenges: update.challenges || "",
        nextSteps: update.nextSteps || "",
        recipients: update.recipients || "",
        status: update.status || "Draft"
      });
    } else {
      setEditingUpdate(null);
      setFormData({
        projectId: selectedProjectId,
        updateDate: new Date().toISOString().split('T')[0],
        progress: "",
        challenges: "",
        nextSteps: "",
        recipients: "",
        status: "Draft"
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent, isSend: boolean = false) => {
    e.preventDefault();
    if (!formData.projectId || !formData.updateDate || !formData.progress) {
      toast.error("Project, Date, and Progress are required");
      return;
    }

    const payload = {
      ...formData,
      status: isSend ? "Sent" : "Draft"
    };

    try {
      const url = editingUpdate 
        ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083/api/v1"}/project-updates/${editingUpdate.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083/api/v1"}/project-updates`;

      const res = await fetch(url, {
        method: editingUpdate ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to save update");
      }

      toast.success(isSend ? "Update Sent successfully" : "Draft Saved successfully");
      setIsModalOpen(false);
      fetchUpdates(selectedProjectId);
    } catch (err: any) {
      toast.error(err.message || "Failed to save update");
    }
  };

  const handleDelete = async (id: string, status: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (status === "Sent") {
      toast.error("Cannot delete an update that has already been sent");
      return;
    }
    if (!confirm("Are you sure you want to delete this draft?")) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083/api/v1"}/project-updates/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Deleted successfully");
      fetchUpdates(selectedProjectId);
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="flex-1 p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Project Updates</h1>
          <p className="text-sm text-gray-500 mt-1">Communicate project progress, challenges, and next steps to stakeholders.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-all disabled:opacity-50" disabled={!selectedProjectId}>
            <Plus size={16} /> New Update
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex gap-4 items-center">
          <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Select Project:</label>
          <select 
            value={selectedProjectId} 
            onChange={e => setSelectedProjectId(e.target.value)}
            className="w-full max-w-md border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">-- Choose a Project --</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        
        <div className="flex-1 p-6">
          {!selectedProjectId ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <FileText size={48} className="mb-4 opacity-50" />
              <p>Please select a project to view or create updates.</p>
            </div>
          ) : loading ? (
            <div className="p-8 text-center text-gray-500">Loading updates...</div>
          ) : updates.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <p>No updates logged for this project yet.</p>
              <button onClick={() => openModal()} className="mt-4 text-blue-600 font-medium hover:underline text-sm">
                Create the first update
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {updates.map(u => (
                <div key={u.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm relative group">
                  <div className={`p-4 border-b flex justify-between items-center ${u.status === 'Sent' ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded text-xs font-bold ${u.status === 'Sent' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                        {u.status}
                      </span>
                      <span className="font-semibold text-gray-900">{u.updateDate}</span>
                      {u.sentAt && <span className="text-xs text-gray-500">Sent at: {new Date(u.sentAt).toLocaleString()}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openModal(u)} className="text-gray-400 hover:text-blue-600 p-1.5 rounded-md transition-colors">
                        <Edit size={16} />
                      </button>
                      {u.status !== 'Sent' && (
                        <button onClick={(e) => handleDelete(u.id, u.status, e)} className="text-gray-400 hover:text-red-600 p-1.5 rounded-md transition-colors">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Progress</h4>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{u.progress}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Challenges</h4>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{u.challenges || <span className="text-gray-400 italic">None reported</span>}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Next Steps</h4>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{u.nextSteps || <span className="text-gray-400 italic">None reported</span>}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* UPDATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">
                {editingUpdate ? (editingUpdate.status === 'Sent' ? "View/Resend Update" : "Edit Draft Update") : "New Update"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Update Date <span className="text-red-500">*</span></label>
                    <input type="date" value={formData.updateDate} onChange={e => setFormData({...formData, updateDate: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Recipients (Emails)</label>
                    <input type="text" placeholder="comma separated emails" value={formData.recipients} onChange={e => setFormData({...formData, recipients: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Progress <span className="text-red-500">*</span></label>
                  <textarea placeholder="What was accomplished since the last update?" value={formData.progress} onChange={e => setFormData({...formData, progress: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]" required />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Challenges / Blockers</label>
                  <textarea placeholder="Are there any risks or blockers?" value={formData.challenges} onChange={e => setFormData({...formData, challenges: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Next Steps</label>
                  <textarea placeholder="What are the immediate priorities?" value={formData.nextSteps} onChange={e => setFormData({...formData, nextSteps: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]" />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
              <span className={`text-sm font-bold ${formData.status === 'Sent' ? 'text-green-600' : 'text-amber-500'}`}>
                Current Status: {formData.status}
              </span>
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                  Close
                </button>
                {formData.status !== 'Sent' && (
                  <button type="button" onClick={(e) => handleSubmit(e, false)} className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors">
                    Save as Draft
                  </button>
                )}
                <button type="button" onClick={(e) => handleSubmit(e, true)} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <Send size={16} /> {formData.status === 'Sent' ? 'Resend Update' : 'Send Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
