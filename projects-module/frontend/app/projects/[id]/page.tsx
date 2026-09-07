"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, Users, Activity, FileText, CheckSquare, DollarSign } from "lucide-react";
import toast from "react-hot-toast";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  const [tasks, setTasks] = useState<any[]>([]);
  const [timesheets, setTimesheets] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);

  useEffect(() => {
    if (!projectId) return;

    const fetchProjectData = async () => {
      try {
        const [projRes, tasksRes, tsRes, updatesRes, teamRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083/api"}/projects/${projectId}`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083/api"}/tasks/project/${projectId}`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083/api"}/timesheets/project/${projectId}`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083/api/v1"}/project-updates/project/${projectId}`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083/api/v1"}/project-users/project/${projectId}`)
        ]);

        if (projRes.ok) setProject(await projRes.json());
        if (tasksRes.ok) setTasks(await tasksRes.json());
        if (tsRes.ok) setTimesheets(await tsRes.json());
        if (updatesRes.ok) setUpdates(await updatesRes.json());
        if (teamRes.ok) setTeam(await teamRes.json());

      } catch (err) {
        toast.error("Failed to load project details");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading project...</div>;
  }

  if (!project) {
    return <div className="p-8 text-center text-gray-500">Project not found.</div>;
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <Activity size={16} /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare size={16} /> },
    { id: 'timesheets', label: 'Timesheets', icon: <Clock size={16} /> },
    { id: 'updates', label: 'Updates', icon: <FileText size={16} /> },
    { id: 'team', label: 'Team', icon: <Users size={16} /> }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <button onClick={() => router.push('/projects')} className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-4 transition-colors">
          <ArrowLeft size={16} className="mr-1" /> Back to Projects
        </button>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{project.name}</h1>
              <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${project.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                {project.status}
              </span>
            </div>
            <p className="text-sm text-gray-500">{project.description || "No description provided."}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">Completion</div>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${project.percentComplete || 0}%` }} />
              </div>
              <span className="font-bold text-gray-900">{project.percentComplete || 0}%</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-6 mt-8 -mb-6 border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
              <div className="col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Project Overview</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="block text-gray-500 mb-1">Company</span>
                      <span className="font-medium text-gray-900">{project.company || "-"}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 mb-1">Methodology</span>
                      <span className="font-medium text-gray-900">{project.percentCompleteMethod || "Manual"}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 mb-1">Expected Start</span>
                      <span className="font-medium text-gray-900">{project.expectedStartDate || "-"}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 mb-1">Expected End</span>
                      <span className="font-medium text-gray-900">{project.expectedEndDate || "-"}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Updates</h3>
                  {updates.length === 0 ? (
                    <p className="text-gray-500 text-sm">No updates posted yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {updates.slice(0, 3).map(u => (
                        <div key={u.id} className="border-l-2 border-blue-500 pl-4 py-1">
                          <div className="text-xs text-gray-500 mb-1">{u.updateDate} • {u.status}</div>
                          <p className="text-sm text-gray-800 line-clamp-2">{u.progress}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Financials</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">Estimated Cost</span>
                        <span className="font-medium text-gray-900">${project.estimatedCost?.toLocaleString() || "0.00"}</span>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">Total Billed</span>
                        <span className="font-medium text-green-600">${project.totalBillableAmount?.toLocaleString() || "0.00"}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">Total Costing</span>
                        <span className="font-medium text-red-500">${project.totalCostingAmount?.toLocaleString() || "0.00"}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold mt-2 pt-2 border-t border-gray-100">
                        <span className="text-gray-900">Gross Margin</span>
                        <span className={project.grossMargin >= 0 ? "text-green-600" : "text-red-600"}>${project.grossMargin?.toLocaleString() || "0.00"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">{tasks.length}</div>
                      <div className="text-xs font-medium text-gray-500 uppercase mt-1">Tasks</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-indigo-600">{team.length}</div>
                      <div className="text-xs font-medium text-gray-500 uppercase mt-1">Team</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg text-center col-span-2">
                      <div className="text-2xl font-bold text-amber-600">{timesheets.length}</div>
                      <div className="text-xs font-medium text-gray-500 uppercase mt-1">Timesheets Logged</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
              {tasks.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No tasks found for this project.</div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Subject</th>
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Priority</th>
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Weight</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {tasks.map(t => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-900">{t.name}</td>
                        <td className="p-4"><span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">{t.status}</span></td>
                        <td className="p-4">{t.priority}</td>
                        <td className="p-4">{t.weight || 1}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Timesheets Tab */}
          {activeTab === 'timesheets' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
              {timesheets.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No timesheets logged for this project.</div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Total Hrs</th>
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Billable Hrs</th>
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Billed Amount</th>
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Costing Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {timesheets.map(ts => (
                      <tr key={ts.id} className="hover:bg-gray-50">
                        <td className="p-4"><span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">{ts.status}</span></td>
                        <td className="p-4">{ts.totalHours}</td>
                        <td className="p-4">{ts.totalBillableHours}</td>
                        <td className="p-4 text-green-600 font-medium">${ts.totalBilledAmount?.toLocaleString() || "0"}</td>
                        <td className="p-4 text-red-500 font-medium">${ts.totalCostingAmount?.toLocaleString() || "0"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Updates Tab */}
          {activeTab === 'updates' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {updates.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500 shadow-sm">No updates found for this project.</div>
              ) : (
                updates.map(u => (
                  <div key={u.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded ${u.status === 'Sent' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>{u.status}</span>
                        <span className="font-semibold text-gray-900">{u.updateDate}</span>
                      </div>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Progress</h4>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{u.progress}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Challenges</h4>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{u.challenges || "-"}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Next Steps</h4>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{u.nextSteps || "-"}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Team Tab */}
          {activeTab === 'team' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
              {team.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No team members assigned to this project yet.</div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase">User ID</th>
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Role</th>
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Can View Attachments</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {team.map(member => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-900">{member.userId}</td>
                        <td className="p-4 text-gray-600">{member.roleName || "-"}</td>
                        <td className="p-4 text-gray-600">{member.canViewAttachments ? "Yes" : "No"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
