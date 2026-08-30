"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import { fetchProjects, createTask, updateTask } from "@/lib/api";
import { X, Save } from "lucide-react";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editTask?: any;
}

export function NewTaskModal({ isOpen, onClose, onSuccess, editTask }: NewTaskModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchProjects().then(setProjects).catch(console.error);
    }
  }, [isOpen]);

  const [formData, setFormData] = useState({
    subject: "",
    project: "",
    issue: "",
    type: "",
    color: "#3b82f6",
    isGroup: false,
    isTemplate: false,
    status: "Open",
    priority: "Low",
    weight: "1",
    parentTask: "",
    assigneeName: "",
    description: ""
  });

  useEffect(() => {
    if (isOpen) {
      if (editTask) {
        let status = "Open";
        if (editTask.kanbanState === 'IN_PROGRESS') status = "Working";
        if (editTask.kanbanState === 'IN_REVIEW') status = "Pending Review";
        if (editTask.kanbanState === 'COMPLETED') status = "Completed";

        setFormData({
          subject: editTask.name || "",
          project: editTask.projectId || "",
          issue: "",
          type: editTask.type || "",
          color: "#3b82f6",
          isGroup: editTask.isGroup || false,
          isTemplate: false,
          status,
          priority: editTask.priority ? editTask.priority.charAt(0) + editTask.priority.slice(1).toLowerCase() : "Low",
          weight: editTask.weight ? editTask.weight.toString() : "1",
          parentTask: "",
          assigneeName: editTask.assigneeName || "",
          description: editTask.description || ""
        });
      } else {
        setFormData({
          subject: "",
          project: "",
          issue: "",
          type: "",
          color: "#3b82f6",
          isGroup: false,
          isTemplate: false,
          status: "Open",
          priority: "Low",
          weight: "1",
          parentTask: "",
          assigneeName: "",
          description: ""
        });
      }
    }
  }, [isOpen, editTask]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.project) {
      toast.error("Please fill in the mandatory Subject and Project fields (*)");
      return;
    }

    setIsSubmitting(true);
    try {
      const statusMap: Record<string, string> = {
        'Open': 'TODO',
        'Working': 'IN_PROGRESS',
        'Pending Review': 'IN_REVIEW',
        'Completed': 'COMPLETED'
      };

      const payload = {
        name: formData.subject,
        projectId: formData.project,
        status: statusMap[formData.status] || 'TODO',
        kanbanState: formData.status === 'Open' ? 'BACKLOG' : statusMap[formData.status],
        priority: formData.priority.toUpperCase(),
        description: formData.description,
        isGroup: formData.isGroup,
        type: formData.type,
        assigneeName: formData.assigneeName,
        weight: parseInt(formData.weight) || 1
      };
      
      if (editTask) {
        await updateTask(editTask.id, payload);
        toast.success("Task updated successfully!");
      } else {
        await createTask(formData.project, payload);
        toast.success("Task created successfully!");
      }
      
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(editTask ? "Failed to update task" : "Failed to create task");
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
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{editTask ? "Edit Task" : "New Task"}</h2>
            <p className="text-slate-500 text-sm">{editTask ? "Update the details of this task." : "Create a work item linked to a project."}</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow-sm transition-all disabled:opacity-70 text-sm"
            >
              {isSubmitting ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div> : <Save size={16} />}
              Save Task
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          <style>{`
            .quill-custom .ql-container {
              min-height: 200px;
              font-size: 14px;
              background-color: white;
            }
            .quill-custom .ql-editor {
              min-height: 200px;
              color: #0f172a;
            }
            .quill-custom .ql-toolbar {
              background-color: #f8fafc;
            }
          `}</style>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Primary Details */}
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-slate-800 border-b border-slate-100 pb-2">Primary Details</h3>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Subject <span className="text-red-500">*</span></label>
                  <input type="text" name="subject" value={formData.subject} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white" placeholder="e.g. Design Database Schema" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Project <span className="text-red-500">*</span></label>
                  <select name="project" value={formData.project} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white">
                    <option value="">Select Project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Issue</label>
                  <input type="text" name="issue" value={formData.issue} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white" placeholder="Lookup Issue" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Type</label>
                  <select name="type" value={formData.type} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white">
                    <option value="">Select Type</option>
                    <option value="Feature">Feature</option>
                    <option value="Bug">Bug</option>
                    <option value="Feedback">Feedback</option>
                    <option value="Accounts">Accounts</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" name="color" value={formData.color} onChange={handleInputChange} className="w-10 h-10 rounded cursor-pointer border-none p-0" />
                    <span className="text-sm text-slate-500 font-mono">{formData.color}</span>
                  </div>
                </div>
                <div className="flex gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="isGroup" checked={formData.isGroup} onChange={handleInputChange} className="w-4 h-4 text-blue-600 rounded" />
                    <span className="text-sm font-bold text-slate-700">Is Group</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="isTemplate" checked={formData.isTemplate} onChange={handleInputChange} className="w-4 h-4 text-blue-600 rounded" />
                    <span className="text-sm font-bold text-slate-700">Is Template</span>
                  </label>
                </div>
              </div>

              {/* Status & Priority */}
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-slate-800 border-b border-slate-100 pb-2">Status & Priority</h3>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white">
                    <option value="Open">Open</option>
                    <option value="Working">Working</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Priority</label>
                  <select name="priority" value={formData.priority} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Task Weight</label>
                  <input type="number" name="weight" value={formData.weight} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white" min="1" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Parent Task</label>
                  <input type="text" name="parentTask" value={formData.parentTask} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white" placeholder="Lookup Parent Task" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Assignee</label>
                  <input type="text" name="assigneeName" value={formData.assigneeName} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white" placeholder="e.g. John Doe, IT Dept" />
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <h3 className="font-bold text-lg text-slate-800 pb-2">Description</h3>
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                <ReactQuill 
                  theme="snow" 
                  value={formData.description} 
                  onChange={(val: string) => setFormData(prev => ({ ...prev, description: val }))}
                  className="quill-custom"
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
