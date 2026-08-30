"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { X, Save } from "lucide-react";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editProject?: any;
}

export function ProjectModal({ isOpen, onClose, onSuccess, editProject }: ProjectModalProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!editProject;

  // Form State
  const [formData, setFormData] = useState({
    series: "",
    projectName: "",
    status: "Open",
    projectType: "",
    percentCompleteMethod: "Task Completion",
    priority: "Medium",
    isActive: "Yes",
    estimatedCost: "",
    defaultCostCenter: "",
    company: "",
    collectProgress: false,
  });

  const [users, setUsers] = useState([{ id: Date.now(), user: "", fullName: "" }]);

  React.useEffect(() => {
    if (isOpen) {
      if (editProject) {
        setFormData({
          series: editProject.series || "",
          projectName: editProject.name || "",
          status: editProject.status ? (editProject.status === 'IN_PROGRESS' ? 'Working' : editProject.status) : "Open",
          projectType: editProject.projectType || "",
          percentCompleteMethod: editProject.percentCompleteMethod || "Task Completion",
          priority: editProject.priority || "Medium",
          isActive: editProject.isActive ? "Yes" : "No",
          estimatedCost: editProject.estimatedCost || "",
          defaultCostCenter: editProject.defaultCostCenter || "",
          company: editProject.company || "",
          collectProgress: editProject.collectProgress || false,
        });
      } else {
        setFormData({
          series: "",
          projectName: "",
          status: "Open",
          projectType: "",
          percentCompleteMethod: "Task Completion",
          priority: "Medium",
          isActive: "Yes",
          estimatedCost: "",
          defaultCostCenter: "",
          company: "",
          collectProgress: false,
        });
      }
    }
  }, [isOpen, editProject]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const addUserRow = () => {
    setUsers([...users, { id: Date.now(), user: "", fullName: "" }]);
  };

  const removeUserRow = (id: number) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.series || !formData.projectName || !formData.company) {
      toast.error("Please fill in all mandatory fields (*)");
      return;
    }
    
    // Validate users
    const hasEmptyUsers = users.some(u => !u.user);
    if (hasEmptyUsers) {
      toast.error("Please select a user for all user rows.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.projectName,
        status: formData.status === 'On Hold' || formData.status === 'Working' ? 'IN_PROGRESS' : formData.status.toUpperCase(),
        priority: formData.priority.toUpperCase(),
        company: formData.company,
      };

      const url = isEditing 
        ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083/api"}/projects/${editProject.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083/api"}/projects`;

      const actualRes = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!actualRes.ok) throw new Error(isEditing ? "Failed to update project" : "Failed to create project");
      
      toast.success(isEditing ? "Project updated successfully!" : "Project created successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(isEditing ? "Failed to update project" : "Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-50 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-slate-200 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{isEditing ? "Edit Project" : "New Project"}</h2>
            <p className="text-slate-500 text-sm">{isEditing ? "Update project details." : "Create a new workspace for your team."}</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow-sm transition-all disabled:opacity-70 text-sm"
            >
              {isSubmitting ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div> : <Save size={16} />}
              Save Project
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2">
          {['details', 'costing', 'progress'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 font-semibold text-sm capitalize transition-all border-b-2 ${activeTab === tab ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'} rounded-t-lg mr-1`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          <form id="project-form" onSubmit={handleSubmit}>
            
            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Series <span className="text-red-500">*</span></label>
                    <select name="series" value={formData.series} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white text-sm">
                      <option value="">Select Series</option>
                      <option value="PROJ-.YYYY.-">PROJ-.YYYY.-</option>
                      <option value="PROJ-.####">PROJ-.####</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Project Name <span className="text-red-500">*</span></label>
                    <input type="text" name="projectName" value={formData.projectName} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white text-sm" placeholder="e.g. ERP Migration" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Status</label>
                    <select name="status" value={formData.status} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white text-sm">
                      <option value="Open">Open</option>
                      <option value="Completed">Completed</option>
                      <option value="On Hold">On Hold</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Project Type</label>
                    <select name="projectType" value={formData.projectType} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white text-sm">
                      <option value="">Select Type</option>
                      <option value="Internal">Internal</option>
                      <option value="External">External</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">% Complete Method</label>
                    <select name="percentCompleteMethod" value={formData.percentCompleteMethod} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white text-sm">
                      <option value="Task Completion">Task Completion</option>
                      <option value="Manual">Manual</option>
                      <option value="Task Weight">Task Weight</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Priority</label>
                    <select name="priority" value={formData.priority} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white text-sm">
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Is Active</label>
                    <select name="isActive" value={formData.isActive} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white text-sm">
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>
                
                {/* Dynamic Users Table Moved to Details */}
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <h3 className="font-bold text-lg text-slate-800">Users</h3>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="p-3 text-xs font-bold text-slate-500 uppercase">User <span className="text-red-500">*</span></th>
                          <th className="p-3 text-xs font-bold text-slate-500 uppercase">Full Name</th>
                          <th className="p-3 text-xs font-bold text-slate-500 uppercase text-center">View Attachments</th>
                          <th className="p-3 w-16"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {users.map((row, index) => (
                          <tr key={row.id}>
                            <td className="p-2">
                              <input 
                                type="text" 
                                value={row.user} 
                                onChange={(e) => {
                                  const newUsers = [...users];
                                  newUsers[index].user = e.target.value;
                                  setUsers(newUsers);
                                }}
                                className="w-full border-none bg-white text-gray-900 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                placeholder="john@example.com"
                              />
                            </td>
                            <td className="p-2">
                              <input type="text" value={row.fullName} readOnly className="w-full border-none bg-transparent px-3 py-2 text-sm text-gray-700" placeholder="Auto-populated" />
                            </td>
                            <td className="p-2 text-center">
                              <input type="checkbox" className="w-4 h-4 rounded text-blue-600" />
                            </td>
                            <td className="p-2 text-center">
                              <button type="button" onClick={() => removeUserRow(row.id)} className="text-red-500 hover:text-red-700 font-bold px-2 py-1 bg-red-50 rounded">✕</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="bg-slate-50 p-2 border-t border-slate-200">
                      <button type="button" onClick={addUserRow} className="text-sm font-semibold text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors">
                        + Add Row
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Costing Tab */}
            {activeTab === 'costing' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Estimated Cost</label>
                  <input type="number" name="estimatedCost" value={formData.estimatedCost} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Default Cost Center</label>
                  <input type="text" name="defaultCostCenter" value={formData.defaultCostCenter} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white" placeholder="Main - NGE" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Company <span className="text-red-500">*</span></label>
                  <input type="text" name="company" value={formData.company} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white" placeholder="NextGenERP Ltd." />
                </div>
              </div>
            )}

            {/* Progress Tab */}
            {activeTab === 'progress' && (
              <div className="space-y-6">
                <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <input type="checkbox" name="collectProgress" checked={formData.collectProgress} onChange={handleInputChange} className="w-5 h-5 text-blue-600 rounded" />
                  <div>
                    <p className="font-bold text-slate-800">Collect Progress</p>
                    <p className="text-sm text-slate-500">Automatically calculate project progress based on timesheets and tasks.</p>
                  </div>
                </label>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
