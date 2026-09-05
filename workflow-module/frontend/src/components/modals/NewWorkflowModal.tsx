import React, { useState } from "react";
import { useModal } from "@/components/ModalContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createWorkflow } from "@/lib/api";
import { useRouter } from "next/navigation";

export function NewWorkflowModal() {
  const { closeModal } = useModal();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    workflowName: "",
    documentType: "",
    isActive: true,
    sendEmailAlerts: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.workflowName || !formData.documentType) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      await createWorkflow(formData);
      toast.success("Workflow created successfully!");
      closeModal();
      router.refresh();
      window.dispatchEvent(new Event("workflow-created"));
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to create workflow. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Workflow Name <span className="text-red-500">*</span>
        </label>
        <input 
          type="text" 
          name="workflowName"
          value={formData.workflowName}
          onChange={handleChange}
          placeholder="e.g., Leave Application Workflow"
          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Document Type <span className="text-red-500">*</span>
        </label>
        <input 
          type="text" 
          name="documentType"
          value={formData.documentType}
          onChange={handleChange}
          placeholder="e.g., Leave Application"
          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          required
        />
      </div>

      <div className="flex items-center gap-6 pt-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
          />
          <span className="text-sm text-slate-700">Is Active</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            name="sendEmailAlerts"
            checked={formData.sendEmailAlerts}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
          />
          <span className="text-sm text-slate-700">Send Email Alerts</span>
        </label>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <button 
          type="button" 
          onClick={closeModal}
          className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center gap-2"
          disabled={loading}
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Creating...' : 'Save Workflow'}
        </button>
      </div>
    </form>
  );
}
