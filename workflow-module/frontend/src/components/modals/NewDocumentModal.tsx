import React, { useState, useEffect } from "react";
import { useModal } from "@/components/ModalContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createDocument, getTemplates, DocumentTemplate } from "@/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

export function NewDocumentModal() {
  const { closeModal } = useModal();
  const { currentUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  
  const [formData, setFormData] = useState({
    title: "",
    documentType: "Contract",
    contentHtml: "",
    amount: 0,
    templateId: "",
    ownerUsername: currentUser?.username || "admin_user"
  });

  useEffect(() => {
    async function loadTemplates() {
      try {
        const tmpls = await getTemplates();
        setTemplates(tmpls);
      } catch (e) {
        console.error("Failed to load templates", e);
      }
    }
    loadTemplates();
  }, []);

  const handleTemplateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tmplId = e.target.value;
    setSelectedTemplateId(tmplId);
    if (!tmplId) {
      setFormData(prev => ({ ...prev, templateId: "" }));
      return;
    }
    const tmpl = templates.find(t => t.id === tmplId);
    if (tmpl) {
      setFormData(prev => ({
        ...prev,
        templateId: tmpl.id,
        documentType: tmpl.documentType || prev.documentType,
        contentHtml: tmpl.htmlContent || prev.contentHtml
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'number' ? parseFloat(value) || 0 : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.documentType) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      await createDocument({
        ...formData,
        ownerUsername: currentUser?.username || formData.ownerUsername || "admin_user"
      });
      
      toast.success("Document created successfully!");
      closeModal();
      router.refresh();
      window.dispatchEvent(new Event("document-created"));
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to create document. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {templates.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Select Document Template (Optional)
          </label>
          <select
            value={selectedTemplateId}
            onChange={handleTemplateSelect}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm"
          >
            <option value="">None (Custom Document)</option>
            {templates.map(t => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.documentType})
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Document Title <span className="text-red-500">*</span>
        </label>
        <input 
          type="text" 
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Q3 Marketing Budget"
          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
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
            Amount / Value
          </label>
          <input 
            type="number" 
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.00"
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Content Details
        </label>
        <textarea 
          name="contentHtml"
          value={formData.contentHtml}
          onChange={handleChange}
          rows={3}
          placeholder="Brief description or context..."
          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-y"
        />
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
          {loading ? 'Creating...' : 'Save Document'}
        </button>
      </div>
    </form>
  );
}
