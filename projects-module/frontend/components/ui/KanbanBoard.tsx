"use client";

import React from "react";
import { Badge } from "@/components/ui/Badge";
import { MoreVertical, CheckCircle2, Clock, Circle } from "lucide-react";

interface Task {
  id: string;
  name: string;
  kanbanState: 'BACKLOG' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED';
  priority: string;
  type?: string;
  assigneeName?: string;
  description?: string;
}

const COLUMNS = [
  { id: 'BACKLOG', title: 'Backlog', icon: Circle, color: 'text-slate-400' },
  { id: 'IN_PROGRESS', title: 'In Progress', icon: Clock, color: 'text-blue-500' },
  { id: 'IN_REVIEW', title: 'In Review', icon: MoreVertical, color: 'text-orange-500' },
  { id: 'COMPLETED', title: 'Completed', icon: CheckCircle2, color: 'text-green-500' }
];

interface KanbanBoardProps {
  tasks: Task[];
  onTaskMove?: (taskId: string, newState: string) => void;
  onTaskEdit?: (task: Task) => void;
}

export function KanbanBoard({ tasks, onTaskMove, onTaskEdit }: KanbanBoardProps) {
  const [activeTaskMenu, setActiveTaskMenu] = React.useState<string | null>(null);
  const [expandedTaskIds, setExpandedTaskIds] = React.useState<Set<string>>(new Set());

  if (!tasks) return null;

  const toggleTaskExpansion = (taskId: string) => {
    const newSet = new Set(expandedTaskIds);
    if (newSet.has(taskId)) {
      newSet.delete(taskId);
    } else {
      newSet.add(taskId);
    }
    setExpandedTaskIds(newSet);
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('taskId', taskId);
    setActiveTaskMenu(null); // close menu if dragging
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId && onTaskMove) {
      onTaskMove(taskId, colId);
    }
  };

  return (
    <div className="flex gap-6 overflow-x-auto pb-4 h-full">
      {COLUMNS.map(col => {
        const columnTasks = tasks.filter(t => (t.kanbanState || 'BACKLOG') === col.id);
        const Icon = col.icon;
        
        return (
          <div 
            key={col.id} 
            className="flex-1 min-w-[280px] bg-slate-100 rounded-xl p-4 flex flex-col h-full border border-slate-200"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <Icon size={18} className={col.color} />
                {col.title}
              </h3>
              <Badge className="bg-slate-200 text-slate-600 border-none font-bold">
                {columnTasks.length}
              </Badge>
            </div>
            
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto min-h-[400px]">
              {columnTasks.map(task => (
                <div 
                  key={task.id} 
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onClick={() => toggleTaskExpansion(task.id)}
                  className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={
                      task.priority === 'HIGH' ? 'bg-red-100 text-red-700 border-none' : 
                      task.priority === 'MEDIUM' ? 'bg-orange-100 text-orange-700 border-none' : 
                      'bg-green-100 text-green-700 border-none'
                    }>
                      {task.priority || 'LOW'}
                    </Badge>
                    <div className="relative">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveTaskMenu(activeTaskMenu === task.id ? null : task.id); }}
                        className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100 p-1 rounded"
                      >
                        <MoreVertical size={16} />
                      </button>
                      
                      {activeTaskMenu === task.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setActiveTaskMenu(null); }}></div>
                          <div className="absolute right-0 top-6 z-50 bg-white border border-gray-200 rounded-md shadow-lg p-1 min-w-[150px] animate-in fade-in zoom-in-95 duration-100">
                            <button 
                              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-sm"
                              onClick={(e) => { e.stopPropagation(); setActiveTaskMenu(null); onTaskEdit && onTaskEdit(task); }}
                            >
                              Edit Task
                            </button>
                            <button 
                              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-sm"
                              onClick={(e) => { e.stopPropagation(); setActiveTaskMenu(null); onTaskMove && onTaskMove(task.id, 'IN_PROGRESS'); }}
                            >
                              Mark as In Progress
                            </button>
                            <button 
                              className="w-full text-left px-3 py-2 text-sm text-green-700 hover:bg-green-50 rounded-sm font-medium border-t border-gray-100 mt-1 pt-1"
                              onClick={(e) => { e.stopPropagation(); setActiveTaskMenu(null); onTaskMove && onTaskMove(task.id, 'COMPLETED'); }}
                            >
                              Mark as Completed
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <h4 className="font-semibold text-slate-800 leading-tight mb-1">{task.name}</h4>
                  {task.type && (
                    <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">{task.type}</div>
                  )}

                  {task.description && expandedTaskIds.has(task.id) && (
                    <div 
                      className="mt-3 text-sm text-slate-700 bg-slate-50/80 p-3 rounded-md border border-slate-100 max-h-[200px] overflow-y-auto prose prose-sm prose-slate max-w-none shadow-inner"
                      dangerouslySetInnerHTML={{ __html: task.description }}
                      onClick={(e) => e.stopPropagation()} // Prevent toggling when interacting with the description (like clicking links)
                    />
                  )}
                  
                  {task.assigneeName && (
                    <div className="text-right mt-3 pt-2 border-t border-slate-50">
                      <span className="text-[11px] text-slate-400 font-medium italic">to {task.assigneeName}</span>
                    </div>
                  )}
                </div>
              ))}
              
              {columnTasks.length === 0 && (
                <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-300 rounded-lg text-slate-400 text-sm font-medium">
                  Drop tasks here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
