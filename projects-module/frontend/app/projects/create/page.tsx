"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import { ArrowLeft, Save } from "lucide-react";
import "react-quill/dist/quill.snow.css";

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function CreateProjectPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("details");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    series: "",
    projectName: "",
    status: "Open",
    projectType: "",
    percentCompleteMethod: "Task Completion",
    fromTemplate: "",
    priority: "Medium",
    department: "",
    isActive: "Yes",
    estimatedCost: "",
    defaultCostCenter: "",
    company: "",
    collectProgress: false,
    customer: "",
    salesOrder: "",
    notes: ""
  });

  const [users, setUsers] = useState([{ id: Date.now(), user: "", fullName: "" }]);

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
        status: formData.status === 'On Hold' ? 'IN_PROGRESS' : formData.status.toUpperCase(),
        priority: formData.priority.toUpperCase(),
        company: formData.company,
        department: formData.department,
        description: formData.notes
      };

      const res = await fetch("http://localhost:8083/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to create project");
      
      toast.success("Project created successfully!");
      router.push("/projects");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 min-h-screen overflow-y-auto p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => router.push("/projects")} className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-100 transition-colors">
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">New Project</h1>
              <p className="text-slate-500">Create a new workspace for your team.</p>
            </div>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm transition-all disabled:opacity-70"
          >
            {isSubmitting ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div> : <Save size={20} />}
            Save Project
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex border-b border-slate-200 bg-slate-50 px-2 pt-2">
            {['details', 'costing', 'progress', 'more info'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-semibold text-sm capitalize transition-all border-b-2 ${activeTab === tab ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'} rounded-t-lg`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6">
            <form id="project-form" onSubmit={handleSubmit}>
              
              {/* Details Tab */}
              {activeTab === 'details' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Series <span className="text-red-500">*</span></label>
                    <select name="series" value={formData.series} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white">
                      <option value="">Select Series</option>
                      <option value="PROJ-.YYYY.-">PROJ-.YYYY.-</option>
                      <option value="PROJ-.####">PROJ-.####</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Project Name <span className="text-red-500">*</span></label>
                    <input type="text" name="projectName" value={formData.projectName} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white" placeholder="e.g. ERP Migration" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Status</label>
                    <select name="status" value={formData.status} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white">
                      <option value="Open">Open</option>
                      <option value="Completed">Completed</option>
                      <option value="On Hold">On Hold</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Project Type</label>
                    <select name="projectType" value={formData.projectType} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white">
                      <option value="">Select Type</option>
                      <option value="Internal">Internal</option>
                      <option value="External">External</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">% Complete Method</label>
                    <select name="percentCompleteMethod" value={formData.percentCompleteMethod} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white">
                      <option value="Task Completion">Task Completion</option>
                      <option value="Manual">Manual</option>
                      <option value="Task Weight">Task Weight</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Priority</label>
                    <select name="priority" value={formData.priority} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white">
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Is Active</label>
                    <select name="isActive" value={formData.isActive} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white">
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
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

              {/* More Info Tab */}
              {activeTab === 'more info' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-slate-200 pb-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Customer</label>
                      <input type="text" name="customer" value={formData.customer} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white" placeholder="Lookup Customer" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Sales Order</label>
                      <input type="text" name="salesOrder" value={formData.salesOrder} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white" placeholder="Lookup Sales Order" />
                    </div>
                  </div>

                  {/* Dynamic Users Table */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg text-slate-800">Users</h3>
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="p-3 text-xs font-bold text-slate-500 uppercase">User <span className="text-red-500">*</span></th>
                            <th className="p-3 text-xs font-bold text-slate-500 uppercase">Full Name</th>
                            <th className="p-3 text-xs font-bold text-slate-500 uppercase">View Attachments</th>
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

                  {/* Rich Text Editor */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Notes</label>
                    <div className="border border-slate-200 rounded-lg overflow-hidden h-64">
                      <ReactQuill 
                        theme="snow" 
                        value={formData.notes} 
                        onChange={(val: string) => setFormData(prev => ({ ...prev, notes: val }))}
                        className="h-52"
                      />
                    </div>
                  </div>
                </div>
              )}

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
