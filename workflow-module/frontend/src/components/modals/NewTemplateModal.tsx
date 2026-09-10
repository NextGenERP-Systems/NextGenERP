import React, { useState, useEffect } from "react";
import { useModal } from "@/components/ModalContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createTemplate, updateTemplate } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export function NewTemplateModal() {
  const { closeModal, modalData } = useModal();
  const { currentUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    documentType: "",
    category: "General",
    htmlContent: "<!-- Enter your template HTML here -->\n<div>\n  <h1>{{title}}</h1>\n  <p>Amount: {{amount}}</p>\n</div>"
  });

  useEffect(() => {
    if (modalData) {
      setFormData({
        name: modalData.name || "",
        documentType: modalData.documentType || "",
        category: modalData.category || "General",
        htmlContent: modalData.htmlContent || ""
      });
    }
  }, [modalData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.documentType || !formData.htmlContent) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        category: formData.category || "General",
        createdBy: currentUser?.username || "admin_user"
      };

      if (modalData?.id) {
        await updateTemplate(modalData.id, payload);
        toast.success("Template updated successfully!");
      } else {
        await createTemplate(payload);
        toast.success("Template created successfully!");
      }
      closeModal();
      router.refresh();
      window.dispatchEvent(new Event("template-created"));
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to save template. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Template Name <span className="text-red-500">*</span>
        </label>
        <input 
          type="text" 
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Leave Application Print"
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

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          HTML Content <span className="text-red-500">*</span>
        </label>
        <textarea 
          name="htmlContent"
          value={formData.htmlContent}
          onChange={handleChange}
          rows={6}
          className="w-full px-3 py-2 font-mono text-sm bg-slate-900 text-slate-100 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-y"
          required
        />
        <p className="text-xs text-slate-500 mt-1">Use Jinja-style variables like {'{{title}}'} for dynamic data.</p>
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
          {loading ? 'Creating...' : 'Save Template'}
        </button>
      </div>
    </form>
  );
}
