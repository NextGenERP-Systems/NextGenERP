"use client";

import React from "react";
import { Badge } from "@/components/ui/Badge";
import { MoreVertical, CheckCircle2, Clock, Circle } from "lucide-react";

interface Task {
  id: string;
  name: string;
  kanbanState: 'BACKLOG' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED';
  priority: string;
}

const COLUMNS = [
  { id: 'BACKLOG', title: 'Backlog', icon: Circle, color: 'text-slate-400' },
  { id: 'IN_PROGRESS', title: 'In Progress', icon: Clock, color: 'text-blue-500' },
  { id: 'IN_REVIEW', title: 'In Review', icon: MoreVertical, color: 'text-orange-500' },
  { id: 'COMPLETED', title: 'Completed', icon: CheckCircle2, color: 'text-green-500' }
];

export function KanbanBoard({ tasks }: { tasks: Task[] }) {
  if (!tasks) return null;

  return (
    <div className="flex gap-6 overflow-x-auto pb-4 h-full">
      {COLUMNS.map(col => {
        const columnTasks = tasks.filter(t => (t.kanbanState || 'BACKLOG') === col.id);
        const Icon = col.icon;
        
        return (
          <div key={col.id} className="flex-1 min-w-[280px] bg-slate-100 rounded-xl p-4 flex flex-col h-full border border-slate-200">
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
                    <button className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                  <h4 className="font-semibold text-slate-800 leading-tight">{task.name}</h4>
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
