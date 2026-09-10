"use client";

import { useEffect, useState } from "react";
import { getAllUsers, getAllRoles, createRole, assignRoleToUser, AppUserData, AppRoleData } from "@/lib/api";
import { Users, Shield, Plus, UserCheck, Clock, Check } from "lucide-react";
import { toast } from "sonner";

export default function RolesAndPermissionsPage() {
  const [users, setUsers] = useState<AppUserData[]>([]);
  const [roles, setRoles] = useState<AppRoleData[]>([]);
  const [loading, setLoading] = useState(true);

  // New Role Modal
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");

  // Assign Role Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRoleName, setSelectedRoleName] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [uList, rList] = await Promise.all([getAllUsers(), getAllRoles()]);
      setUsers(uList);
      setRoles(rList);
    } catch (e) {
      console.error("Failed to load roles and permissions data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName) return;
    setIsSubmitting(true);
    try {
      await createRole(newRoleName);
      toast.success(`Role '${newRoleName.toUpperCase()}' created successfully`);
      setIsRoleModalOpen(false);
      setNewRoleName("");
      loadData();
    } catch (e: any) {
      toast.error(e.message || "Failed to create role");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !selectedRoleName) return;
    setIsSubmitting(true);
    try {
      await assignRoleToUser(selectedUserId, selectedRoleName);
      toast.success(`Role assigned successfully`);
      setIsAssignModalOpen(false);
      loadData();
    } catch (e: any) {
      toast.error(e.message || "Failed to assign role");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            Roles & Permissions
          </h1>
          <p className="text-sm text-slate-500">Manage user roles and assign workflow approval permissions.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsRoleModalOpen(true)}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium shadow-2xs transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-slate-500" />
            Create Role
          </button>

          <button 
            onClick={() => setIsAssignModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            Assign Role to User
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Clock className="animate-spin text-slate-400 w-8 h-8" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Roles List Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              Defined Roles ({roles.length})
            </h2>

            <div className="space-y-2">
              {roles.map(r => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-semibold text-xs text-slate-800 tracking-wide font-mono">
                    {r.roleName}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    System Role
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* User Role Matrix */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900">
                User Access Matrix
              </h2>
            </div>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">Username</th>
                  <th className="px-6 py-4">Assigned Roles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      {u.username}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {u.roles && u.roles.length > 0 ? (
                          u.roles.map(r => (
                            <span key={r.id} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                              <Check className="w-3 h-3 text-indigo-500" />
                              {r.roleName}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">No roles assigned</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Role Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Create New System Role</h3>
            <form onSubmit={handleCreateRole} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Role Name</label>
                <input 
                  required
                  type="text" 
                  value={newRoleName}
                  onChange={e => setNewRoleName(e.target.value)}
                  placeholder="e.g. AUDITOR, COMPLIANCE_OFFICER"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm uppercase focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
                >
                  Save Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Role Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Assign Role to User</h3>
            <form onSubmit={handleAssignRole} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Select User</label>
                <select 
                  required 
                  value={selectedUserId} 
                  onChange={e => setSelectedUserId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="">Select User...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.username}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Select Role</label>
                <select 
                  required 
                  value={selectedRoleName} 
                  onChange={e => setSelectedRoleName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="">Select Role...</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.roleName}>{r.roleName}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
                >
                  Assign Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
