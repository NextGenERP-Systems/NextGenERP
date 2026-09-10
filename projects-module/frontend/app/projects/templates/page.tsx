"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, FileText, Edit, Trash2, X, PlusCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function ProjectTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [projectTypes, setProjectTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  
  const [formData, setFormData] = useState({ 
    name: "", 
    description: "", 
    projectTypeId: "",
    tasks: [] as any[]
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tempRes, typeRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083/api/v1"}/project-templates`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083/api/v1"}/project-types`)
      ]);
      
      if (tempRes.ok && typeRes.ok) {
        setTemplates(await tempRes.json());
        setProjectTypes(await typeRes.json());
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

  const openModal = async (template: any = null) => {
    if (template) {
      // Fetch full details including tasks
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083/api/v1"}/project-templates/${template.id}`);
        if (res.ok) {
          const fullData = await res.json();
          setEditingTemplate(fullData);
          setFormData({ 
            name: fullData.name, 
            description: fullData.description || "", 
            projectTypeId: fullData.projectTypeId || "",
            tasks: fullData.tasks || []
          });
        }
      } catch (e) {
        toast.error("Failed to fetch template details");
        return;
      }
    } else {
      setEditingTemplate(null);
      setFormData({ name: "", description: "", projectTypeId: "", tasks: [] });
    }
    setIsModalOpen(true);
  };

  const handleAddTask = () => {
    setFormData({
      ...formData,
      tasks: [...formData.tasks, { subject: "", description: "", durationDays: 1, startDay: 0, taskWeight: 1, parentTaskSubject: "" }]
    });
  };

  const handleRemoveTask = (index: number) => {
    const newTasks = [...formData.tasks];
    newTasks.splice(index, 1);
    setFormData({ ...formData, tasks: newTasks });
  };

  const handleTaskChange = (index: number, field: string, value: any) => {
    const newTasks = [...formData.tasks];
    newTasks[index][field] = value;
    setFormData({ ...formData, tasks: newTasks });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Template name is required");
      return;
    }
    
    // Validate tasks
    for (let t of formData.tasks) {
      if (!t.subject) {
        toast.error("All tasks must have a subject");
        return;
      }
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      projectTypeId: formData.projectTypeId || null,
      tasks: formData.tasks
    };

    try {
      const url = editingTemplate 
        ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083/api/v1"}/project-templates/${editingTemplate.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083/api/v1"}/project-templates`;
      
      const res = await fetch(url, {
        method: editingTemplate ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to save");
      
      toast.success(editingTemplate ? "Updated successfully" : "Created successfully");
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error("Failed to save template");
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083/api/v1"}/project-templates/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Failed to delete");
      
      toast.success("Deleted successfully");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Project Templates</h1>
          <p className="text-sm text-gray-500 mt-1">Predefine tasks, durations, and weights to rapidly instantiate projects.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-all">
            <Plus size={16} /> New Template
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center bg-white rounded-md px-3 py-1.5 w-64 border border-gray-300 focus-within:border-blue-500 transition-all">
            <Search size={16} className="text-gray-400 mr-2" />
            <input type="text" placeholder="Search templates..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-transparent border-none outline-none text-sm w-full text-gray-800" />
          </div>
        </div>
        
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Template Name</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Project Type</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Tasks</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr><td colSpan={4} className="p-8 text-center text-gray-500">Loading...</td></tr>
            ) : filteredTemplates.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-gray-500">No templates found.</td></tr>
            ) : (
              filteredTemplates.map(t => (
                <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-medium text-gray-900 flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded"><FileText size={16} /></div>
                    {t.name}
                  </td>
                  <td className="p-4 text-gray-600">
                    {projectTypes.find(pt => pt.id === t.projectTypeId)?.name || "-"}
                  </td>
                  <td className="p-4 text-gray-600">{t.tasks?.length || 0} tasks</td>
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
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">{editingTemplate ? "Edit Template" : "New Template"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="space-y-6">
                {/* Basic Details */}
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900">Basic Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Name <span className="text-red-500">*</span></label>
                      <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Project Type</label>
                      <select value={formData.projectTypeId} onChange={e => setFormData({...formData, projectTypeId: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                        <option value="">Select a project type</option>
                        {projectTypes.filter(t => t.isActive).map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]" />
                  </div>
                </div>

                {/* Tasks Builder */}
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-gray-900">Template Tasks</h3>
                    <button type="button" onClick={handleAddTask} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium">
                      <PlusCircle size={16} /> Add Task
                    </button>
                  </div>
                  
                  {formData.tasks.length === 0 ? (
                    <div className="text-center p-6 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-gray-500 text-sm">
                      No tasks defined. Add tasks to automatically populate them when a project is created from this template.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.tasks.map((task, idx) => (
                        <div key={idx} className="flex gap-3 items-start border border-gray-100 p-3 rounded-md bg-gray-50 relative group">
                          <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <input type="text" placeholder="Task Subject *" value={task.subject} onChange={e => handleTaskChange(idx, 'subject', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" required />
                              <input type="text" placeholder="Depends On (Parent Subject)" value={task.parentTaskSubject} onChange={e => handleTaskChange(idx, 'parentTaskSubject', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
                            </div>
                            <div className="grid grid-cols-4 gap-3">
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Start Day (Offset)</label>
                                <input type="number" value={task.startDay} onChange={e => handleTaskChange(idx, 'startDay', parseInt(e.target.value)||0)} className="w-full border border-gray-300 rounded px-2 py-1 text-sm" />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Duration (Days)</label>
                                <input type="number" min="1" value={task.durationDays} onChange={e => handleTaskChange(idx, 'durationDays', parseInt(e.target.value)||1)} className="w-full border border-gray-300 rounded px-2 py-1 text-sm" />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Weight</label>
                                <input type="number" min="0" value={task.taskWeight} onChange={e => handleTaskChange(idx, 'taskWeight', parseInt(e.target.value)||0)} className="w-full border border-gray-300 rounded px-2 py-1 text-sm" />
                              </div>
                              <div className="flex items-end justify-end pb-1">
                                <button type="button" onClick={() => handleRemoveTask(idx)} className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1">
                                  <Trash2 size={14} /> Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-white">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
              <button type="button" onClick={handleSubmit} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Save Template</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
