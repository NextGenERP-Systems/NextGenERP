"use client";

import { useEffect, useState } from "react";
import { getTemplates, DocumentTemplate } from "@/lib/api";
import { FileText, Clock, Plus, Search, Edit } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useModal } from "@/components/ModalContext";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { openModal } = useModal();

  const loadData = async () => {
    try {
      const res = await getTemplates();
      setTemplates(res);
    } catch (err) {
      console.error("Failed to load templates", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleCreated = () => {
      loadData();
    };

    window.addEventListener("template-created", handleCreated);
    return () => {
      window.removeEventListener("template-created", handleCreated);
    };
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Document Templates</h1>
          <p className="text-sm text-slate-500">Manage the HTML templates for your document types.</p>
        </div>
        <button 
          onClick={() => openModal("NEW_TEMPLATE")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-blue-200 flex items-center gap-2 hover-lift"
        >
          <Plus className="w-4 h-4" />
          New Template
        </button>
      </div>

      <div className="premium-card rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm">
        {loading ? (
          <div className="flex justify-center py-20"><Clock className="animate-spin text-slate-400 w-8 h-8" /></div>
        ) : (
          <div className="divide-y divide-slate-100">
            {templates.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <FileText className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-medium text-slate-700 mb-1">No templates found</h3>
                <p className="text-sm text-slate-500">Create a template to generate documents.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {templates.map(t => (
                  <div key={t.id} className="border border-slate-200 rounded-xl p-5 hover:shadow-premium hover:border-blue-200 transition-all bg-white group flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <FileText className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded-full">
                          {t.documentType}
                        </span>
                      </div>
                      <h3 className="font-semibold text-slate-800 text-lg mb-1">{t.name}</h3>
                      <p className="text-xs text-slate-500 mb-4 line-clamp-2">{t.htmlContent.substring(0, 100)}...</p>
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
                      <span>Created {formatDate(t.createdAt)}</span>
                      <button
                        onClick={() => openModal("NEW_TEMPLATE", t)}
                        className="px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" /> Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
