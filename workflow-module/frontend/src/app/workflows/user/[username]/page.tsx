"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getUserDocuments, getDocumentApprovals, Document } from "@/lib/api";
import { FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function UserAuditDashboard() {
  const params = useParams();
  const username = params.username as string;
  const [createdDocs, setCreatedDocs] = useState<Document[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUserData() {
      try {
        setLoading(true);
        // Load documents created by user
        const docs = await getUserDocuments(username);
        setCreatedDocs(docs);

        // Fetch documents currently assigned to roles this user might have. 
        // Note: Realistically, you'd fetch the user's role and query based on that.
        // Assuming ADMIN for the sake of the dashboard example:
        const approvals = await getDocumentApprovals(["ADMIN"], username, 0, 50);
        setPendingApprovals(approvals.content);
        
      } catch (err: any) {
        setError(err.message || "Failed to load user data.");
      } finally {
        setLoading(false);
      }
    }
    if (username) loadUserData();
  }, [username]);

  if (loading) return <div className="p-8 text-slate-500 flex items-center gap-2"><Clock className="animate-spin w-5 h-5"/> Loading audit trail...</div>;
  if (error) return <div className="p-8 text-red-500 flex items-center gap-2"><AlertCircle className="w-5 h-5"/> {error}</div>;

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          User Audit Dashboard: <span className="text-blue-600">@{username}</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1">Complete document tracking and pending workflow assignments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Created Documents */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-slate-700">Documents Created</h3>
            <span className="ml-auto bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-full font-medium">
              {createdDocs.length}
            </span>
          </div>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {createdDocs.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">No documents created.</div>
            ) : (
              createdDocs.map(doc => (
                <div key={doc.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-slate-800 text-sm">{doc.title}</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                      doc.status === 'Approved' ? 'bg-green-100 text-green-700' :
                      doc.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                      doc.status === 'Draft' ? 'bg-slate-100 text-slate-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {doc.status || 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{doc.documentNumber} • {doc.documentType}</span>
                    <span>{formatDate(doc.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-amber-50 p-4 border-b border-amber-100 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-amber-900">Pending Actions (Assigned Roles)</h3>
            <span className="ml-auto bg-amber-200 text-amber-800 text-xs px-2 py-0.5 rounded-full font-medium">
              {pendingApprovals.length}
            </span>
          </div>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {pendingApprovals.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">No pending actions.</div>
            ) : (
              pendingApprovals.map(doc => (
                <div key={doc.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-slate-800 text-sm">{doc.title}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700">
                      Requires Approval
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>From: @{doc.ownerUsername}</span>
                    <span>{formatDate(doc.updatedAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
