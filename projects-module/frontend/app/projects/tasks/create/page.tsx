"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import { fetchProjects, createTask } from "@/lib/api";
import { ArrowLeft, Save } from "lucide-react";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function CreateTaskPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);

  React.useEffect(() => {
    fetchProjects().then(setProjects).catch(console.error);
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    subject: "",
    project: "",
    issue: "",
    type: "",
    color: "#3b82f6", // Default Blue
    isGroup: false,
    isTemplate: false,
    status: "Open",
    priority: "Low",
    weight: "1",
    parentTask: "",
    description: ""
  });

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
      // Map form status to TaskStatus enum
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
        kanbanState: formData.status === 'Working' ? 'IN_PROGRESS' : formData.status === 'Completed' ? 'COMPLETED' : 'BACKLOG',
        priority: formData.priority.toUpperCase(),
        description: formData.description,
        isGroup: formData.isGroup,
        weight: parseInt(formData.weight) || 1
      };
      await createTask(formData.project, payload);
      toast.success("Task created successfully!");
      router.push("/projects");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 min-h-screen overflow-y-auto p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => router.push("/projects")} className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-100 transition-colors">
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">New Task</h1>
              <p className="text-slate-500">Create a work item linked to a project.</p>
            </div>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm transition-all disabled:opacity-70"
          >
            {isSubmitting ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div> : <Save size={20} />}
            Save Task
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 space-y-8">
          
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
                <input type="text" name="type" value={formData.type} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white" placeholder="e.g. Feature, Bug" />
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
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <h3 className="font-bold text-lg text-slate-800 pb-2">Description</h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden h-72">
              <ReactQuill 
                theme="snow" 
                value={formData.description} 
                onChange={(val: string) => setFormData(prev => ({ ...prev, description: val }))}
                className="h-60"
              />
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
