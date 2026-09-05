"use client";

import { useEffect, useState } from "react";
import { getMasterStates, createMasterState, MasterState } from "@/lib/api";
import { Clock, Plus, Tag } from "lucide-react";

export default function MasterStatesPage() {
  const [states, setStates] = useState<MasterState[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStateName, setNewStateName] = useState("");
  const [newColorCode, setNewColorCode] = useState("#3b82f6");
  const [newDescription, setNewDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await getMasterStates();
        setStates(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await createMasterState({
        stateName: newStateName,
        colorCode: newColorCode,
        description: newDescription
      });
      setStates([...states, res]);
      setIsModalOpen(false);
      setNewStateName("");
      setNewColorCode("#3b82f6");
      setNewDescription("");
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Workflow States</h1>
          <p className="text-sm text-slate-500">Manage the master list of available states across all workflows.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add State
        </button>
      </div>

      <div className="premium-card bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center py-20"><Clock className="animate-spin text-slate-400 w-8 h-8" /></div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <th className="px-6 py-4">State Name</th>
                <th className="px-6 py-4">Color</th>
                <th className="px-6 py-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {states.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-slate-500">No states found.</td>
                </tr>
              ) : (
                states.map(state => (
                  <tr key={state.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{state.stateName}</td>
                    <td className="px-6 py-4">
                      <span 
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border"
                        style={{
                          backgroundColor: `${state.colorCode}15`,
                          color: state.colorCode,
                          borderColor: `${state.colorCode}30`
                        }}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: state.colorCode }}></span>
                        {state.colorCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{state.description || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-blue-600" />
                Add Master State
              </h3>
              
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">State Name</label>
                  <input required type="text" value={newStateName} onChange={e => setNewStateName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" placeholder="e.g. Draft, Pending Approval" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Color Code</label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={newColorCode} onChange={e => setNewColorCode(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0 p-0" />
                    <span className="text-sm text-slate-500 font-mono uppercase">{newColorCode}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
                  <input type="text" value={newDescription} onChange={e => setNewDescription(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" placeholder="Short description" />
                </div>
                
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                  >
                    {isSubmitting ? <Clock className="w-4 h-4 animate-spin" /> : 'Save State'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
