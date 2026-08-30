"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchProjects, fetchTasks, fetchTimesheets } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { 
  Clock, CheckCircle2, Plus, 
  Search, Layout, CalendarDays, BarChart3, AlertCircle
} from "lucide-react";
import { KanbanBoard } from "@/components/ui/KanbanBoard";
import { GanttChart } from "@/components/ui/GanttChart";
import { OnboardingWidget } from "@/components/ui/OnboardingWidget";
import { ProjectModal } from "@/components/ui/ProjectModal";
import { LogTimeModal } from "@/components/ui/LogTimeModal";
import { NewTaskModal } from "@/components/ui/NewTaskModal";
import { updateTaskStatus } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';

  const [projects, setProjects] = useState<any[]>([]);
  const [timesheets, setTimesheets] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isLogTimeModalOpen, setIsLogTimeModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  
  // Edit & Context Menu State
  const [projectToEdit, setProjectToEdit] = useState<any>(null);
  const [taskToEdit, setTaskToEdit] = useState<any>(null);
  const [menuState, setMenuState] = useState<{ x: number, y: number, project: any | null }>({ x: 0, y: 0, project: null });

  useEffect(() => {
    const closeMenu = () => setMenuState(prev => prev.project ? { x: 0, y: 0, project: null } : prev);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  const handleRowClick = (e: React.MouseEvent, proj: any) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuState({ x: e.clientX, y: e.clientY, project: proj });
  };

  const handleTaskMove = async (taskId: string, newState: string) => {
    try {
      // Optimistic update
      const tempStatus = newState === 'BACKLOG' ? 'TODO' : newState;
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, kanbanState: newState, status: tempStatus } : t));
      
      const updatedTask = await updateTaskStatus(taskId, newState);
      // Sync with true backend state
      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
    } catch (err) {
      console.error("Failed to update task status", err);
      // Revert on error
      loadData();
    }
  };

  const handleTaskEdit = (task: any) => {
    setTaskToEdit(task);
    setIsNewTaskModalOpen(true);
  };

  // Filters State
  const [filterProject, setFilterProject] = useState("");
  const [filterActive, setFilterActive] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [timelineProjectFilter, setTimelineProjectFilter] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [projRes, tsRes] = await Promise.all([
        fetchProjects(),
        fetchTimesheets()
      ]);
      setProjects(projRes);
      setTimesheets(tsRes);
      
      // Fetch all tasks for all projects
      if (projRes && projRes.length > 0) {
        const allTasksPromises = projRes.map((p: any) => fetchTasks(p.id).catch(() => []));
        const tasksArrays = await Promise.all(allTasksPromises);
        setTasks(tasksArrays.flat());
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Calculate KPIs
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.kanbanState === 'COMPLETED').length;
  const overdueTasks = tasks.filter(t => {
    if (t.kanbanState === 'COMPLETED') return false;
    return new Date(t.expectedEndDate) < new Date();
  }).length;
  
  const avgCompletion = totalTasks > 0 
    ? Math.round(tasks.reduce((acc, t) => acc + (t.percentComplete || 0), 0) / totalTasks) 
    : 0;

  // Dynamic Chart Data based on tasks
  // For simplicity, grouping by "name" or just simple categories
  // Or we can group by Project
  const groupedByProject: Record<string, any> = {};
  tasks.forEach(t => {
    const pName = projects.find(p => p.id === t.projectId)?.name || 'Unassigned';
    if (!groupedByProject[pName]) {
      groupedByProject[pName] = { name: pName.substring(0, 15), completed: 0, overdue: 0, total: 0 };
    }
    const isCompleted = t.kanbanState === 'COMPLETED';
    const isOverdue = !isCompleted && new Date(t.expectedEndDate) < new Date();
    
    if (isCompleted) groupedByProject[pName].completed += 1;
    else if (isOverdue) groupedByProject[pName].overdue += 1;
    else groupedByProject[pName].total += 1;
  });

  let chartData = Object.values(groupedByProject);
  if (chartData.length === 0) {
    chartData = [{ name: 'No Data', completed: 0, overdue: 0, total: 0 }];
  }

  const filteredProjects = projects.filter(p => {
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterProject && p.name !== filterProject) return false;
    if (filterActive === "Yes" && p.status !== "IN_PROGRESS") return false;
    if (filterActive === "No" && p.status === "IN_PROGRESS") return false;
    if (filterStatus && p.status !== filterStatus) return false;
    return true;
  });

  return (
    <>
      <ProjectModal 
        isOpen={isProjectModalOpen} 
        onClose={() => { setIsProjectModalOpen(false); setProjectToEdit(null); }} 
        onSuccess={loadData} 
        editProject={projectToEdit}
      />
      <LogTimeModal 
        isOpen={isLogTimeModalOpen}
        onClose={() => setIsLogTimeModalOpen(false)}
        onSuccess={loadData}
      />
      <NewTaskModal 
        isOpen={isNewTaskModalOpen}
        onClose={() => { setIsNewTaskModalOpen(false); setTaskToEdit(null); }}
        onSuccess={loadData}
        editTask={taskToEdit}
      />
      
      {/* Custom Context Menu */}
      {menuState.project && (
        <div 
          className="fixed z-50 bg-white border border-gray-200 rounded-md shadow-lg p-1 min-w-[150px] animate-in fade-in zoom-in-95 duration-100"
          style={{ top: menuState.y, left: menuState.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-sm"
            onClick={() => {
              setProjectToEdit(menuState.project);
              setIsProjectModalOpen(true);
              setMenuState({ x: 0, y: 0, project: null });
            }}
          >
            Edit Project
          </button>
        </div>
      )}

      <OnboardingWidget 
        hasProjects={projects.length > 0} 
        hasTasks={tasks.length > 0} 
        hasTimesheets={timesheets.length > 0} 
      />
      
      {/* Top Header */}
      <header className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center bg-gray-100 rounded-md px-3 py-1.5 w-96 border border-transparent focus-within:border-blue-500 focus-within:bg-white transition-all">
          <Search size={16} className="text-gray-400 mr-2" />
          <input type="text" placeholder="Search projects..." className="bg-transparent border-none outline-none text-sm w-full text-gray-800 placeholder-gray-400" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div className="flex items-center gap-4">
          {/* Action Header Buttons merged here for cleaner look, or keep them below */}
        </div>
      </header>

      {/* Scrollable Body */}
      <div className="p-8 max-w-7xl mx-auto w-full">
        
        {/* Action Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Projects Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Manage enterprise projects, tasks, and team timesheets.</p>
          </div>
          <div className="flex items-center gap-3">
            {activeTab === 'gantt' && (
              <button onClick={() => setIsLogTimeModalOpen(true)} className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-all">
                <Clock size={16} className="text-orange-500"/> Log Time
              </button>
            )}
            {activeTab === 'tasks' && (
              <button onClick={() => { setTaskToEdit(null); setIsNewTaskModalOpen(true); }} className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-all">
                <CheckCircle2 size={16} className="text-green-500"/> New Task
              </button>
            )}
            {activeTab === 'dashboard' && (
              <button onClick={() => { setProjectToEdit(null); setIsProjectModalOpen(true); }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-all">
                <Plus size={16} /> New Project
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20 text-blue-500">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-current"></div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-500">
            
            {activeTab === 'dashboard' && (
              <>
                {/* Filters Bar */}
                <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex flex-wrap gap-3 items-center">
                  <span className="font-semibold text-xs text-gray-500 uppercase px-2">Filters:</span>
                  <select className="border border-gray-200 rounded-md px-2.5 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50 text-gray-900" value={filterProject} onChange={(e) => setFilterProject(e.target.value)}>
                    <option value="">All Projects</option>
                    {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                  <select className="border border-gray-200 rounded-md px-2.5 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50 text-gray-900" value={filterActive} onChange={(e) => setFilterActive(e.target.value)}>
                    <option value="">Is Active (Any)</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  <select className="border border-gray-200 rounded-md px-2.5 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50 text-gray-900" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="">Status (Any)</option>
                    <option value="PLANNED">Planned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="ON_HOLD">On hold</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="border border-gray-200 shadow-sm bg-white">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Avg Completion</p>
                        <div className={`text-2xl font-bold ${avgCompletion >= 50 ? 'text-green-600' : 'text-red-500'}`}>{avgCompletion}%</div>
                      </div>
                      <div className="bg-gray-100 p-2.5 rounded-full text-gray-400"><BarChart3 size={20}/></div>
                    </CardContent>
                  </Card>
                  <Card className="border border-gray-200 shadow-sm bg-white">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Tasks</p>
                        <div className="text-2xl font-bold text-gray-900">{totalTasks}</div>
                      </div>
                      <div className="bg-blue-50 p-2.5 rounded-full text-blue-600"><Layout size={20}/></div>
                    </CardContent>
                  </Card>
                  <Card className="border border-gray-200 shadow-sm bg-white">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Completed Tasks</p>
                        <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
                      </div>
                      <div className="bg-green-50 p-2.5 rounded-full text-green-600"><CheckCircle2 size={20}/></div>
                    </CardContent>
                  </Card>
                  <Card className="border border-gray-200 shadow-sm bg-white">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Overdue Tasks</p>
                        <div className="text-2xl font-bold text-red-500">{overdueTasks}</div>
                      </div>
                      <div className="bg-red-50 p-2.5 rounded-full text-red-600"><AlertCircle size={20}/></div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts and Tables */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {/* Stacked Bar Chart */}
                  <div className="xl:col-span-1 bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col h-[350px]">
                    <h3 className="font-semibold text-sm text-gray-900 mb-4">Task Distribution</h3>
                    <div className="flex-1 min-h-0 w-full relative">
                      <div className="absolute inset-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                            <Bar dataKey="completed" name="Completed" stackId="a" fill="#16a34a" radius={[0, 0, 4, 4]} />
                            <Bar dataKey="overdue" name="Overdue" stackId="a" fill="#ef4444" />
                            <Bar dataKey="total" name="Pending" stackId="a" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Summary Data Table */}
                  <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-[350px] flex flex-col">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-semibold text-sm text-gray-900">Project Summary</h3>
                    </div>
                    <div className="flex-1 overflow-auto">
                      <table className="w-full text-left">
                        <thead className="bg-gray-50 sticky top-0 border-b border-gray-200 z-10">
                          <tr>
                            <th className="p-3 text-[11px] font-semibold text-gray-500 uppercase">Project</th>
                            <th className="p-3 text-[11px] font-semibold text-gray-500 uppercase">Type</th>
                            <th className="p-3 text-[11px] font-semibold text-gray-500 uppercase">Status</th>
                            <th className="p-3 text-[11px] font-semibold text-gray-500 uppercase text-center">Tasks</th>
                            <th className="p-3 text-[11px] font-semibold text-gray-500 uppercase">Completion</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                          {filteredProjects.length > 0 ? (
                            filteredProjects.map((proj) => (
                              <tr 
                                key={proj.id} 
                                className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                                onClick={(e) => handleRowClick(e, proj)}
                                onContextMenu={(e) => handleRowClick(e, proj)}
                              >
                                <td className="p-3 font-medium text-gray-900">{proj.name}</td>
                                <td className="p-3 text-gray-600">{proj.projectType || 'Internal'}</td>
                                <td className="p-3">
                                  <Badge className={proj.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}>
                                    {proj.status?.replace('_', ' ')}
                                  </Badge>
                                </td>
                                <td className="p-3 text-gray-600 text-center">
                                  {tasks.filter(t => t.projectId === proj.id).length}
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 min-w-[60px]">
                                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${proj.percentComplete || 0}%` }}></div>
                                    </div>
                                    <span className="text-xs font-medium text-gray-600">{proj.percentComplete || 0}%</span>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-gray-400 text-sm">
                                No projects available. Create a new project to populate the summary table.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'tasks' && (
              <div className="h-[600px]"><KanbanBoard tasks={tasks} onTaskMove={handleTaskMove} onTaskEdit={handleTaskEdit} /></div>
            )}

            {activeTab === 'gantt' && (
              <div className="w-full overflow-hidden bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <GanttChart tasks={tasks} />
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col h-[550px]">
                <div className="flex justify-between items-center mb-6 shrink-0">
                  <h3 className="font-semibold text-lg text-gray-900">Project Timeline</h3>
                  <div className="flex">
                    <select className="border border-gray-200 rounded-md px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50 text-gray-900" value={timelineProjectFilter} onChange={(e) => setTimelineProjectFilter(e.target.value)}>
                      <option value="">All Projects</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="overflow-y-auto flex-1 pr-4">
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                    {(timelineProjectFilter ? tasks.filter(t => t.projectId === timelineProjectFilter) : tasks).slice(0, 15).map((task) => (
                    <div key={task.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-100 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <CheckCircle2 size={18} />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between space-x-2 mb-1">
                          <div className="font-bold text-gray-900 text-sm">Task Activity</div>
                          <time className="text-xs text-gray-500">{new Date(task.createdAt || task.expectedStartDate || Date.now()).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</time>
                        </div>
                        <div className="text-sm text-gray-600">Task <span className="font-medium text-gray-900">{task.name}</span> was updated.</div>
                      </div>
                    </div>
                    ))}
                    {(timelineProjectFilter ? tasks.filter(t => t.projectId === timelineProjectFilter) : tasks).length === 0 && <p className="text-sm text-gray-500 pl-12 md:pl-0 md:text-center pt-8">No timeline activity.</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default function ProjectsDashboard() {
  return (
    <Suspense fallback={<div className="p-8">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  )
}
