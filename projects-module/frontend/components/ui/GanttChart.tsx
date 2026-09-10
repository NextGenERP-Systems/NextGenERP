"use client";

import React from "react";
import { format, differenceInDays, addDays } from "date-fns";
import { Calendar } from "lucide-react";

interface Task {
  id: string;
  name: string;
  expectedStartDate: string;
  expectedEndDate: string;
  percentComplete: number;
  kanbanState?: string;
  status?: string;
}

export function GanttChart({ tasks }: { tasks: Task[] }) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400 bg-white border border-dashed border-slate-300 rounded-xl">
        <Calendar size={48} className="mb-4 text-slate-300" />
        <h3 className="text-lg font-bold text-slate-700">No timeline data available</h3>
        <p>Add tasks with start and end dates to generate a Gantt chart.</p>
      </div>
    );
  }

  // Find min and max dates
  const sortedByStart = [...tasks].sort((a, b) => new Date(a.expectedStartDate).getTime() - new Date(b.expectedStartDate).getTime());
  const sortedByEnd = [...tasks].sort((a, b) => new Date(b.expectedEndDate).getTime() - new Date(a.expectedEndDate).getTime());

  const minDate = new Date(sortedByStart[0].expectedStartDate);
  const maxDate = new Date(sortedByEnd[0].expectedEndDate);
  
  // Pad the timeline by 5 days on each side
  const startDate = addDays(minDate, -5);
  const endDate = addDays(maxDate, 5);
  const totalDays = differenceInDays(endDate, startDate);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto w-full p-4">
      <div className="min-w-[800px]">
        {/* Header timeline */}
        <div className="flex border-b border-slate-200 pb-2">
          <div className="w-1/4 font-bold text-slate-700 px-4">Task Name</div>
          <div className="w-3/4 relative h-8">
            {/* Generate month/day markers (simplified) */}
            <div className="absolute inset-0 flex justify-between text-xs text-slate-500 font-medium">
              <span>{format(startDate, "MMM dd")}</span>
              <span>{format(addDays(startDate, Math.floor(totalDays/2)), "MMM dd")}</span>
              <span>{format(endDate, "MMM dd")}</span>
            </div>
          </div>
        </div>

        {/* Task rows */}
        <div className="space-y-4 pt-4">
          {tasks.map((task, i) => {
            const taskStart = new Date(task.expectedStartDate);
            const taskEnd = new Date(task.expectedEndDate);
            const daysFromStart = differenceInDays(taskStart, startDate);
            const taskDuration = differenceInDays(taskEnd, taskStart) + 1;
            
            const leftPercent = (daysFromStart / totalDays) * 100;
            const widthPercent = (taskDuration / totalDays) * 100;

            let barColor = "#3b82f6"; // Default blue
            
            if (task.kanbanState === 'COMPLETED') {
              barColor = "#10b981"; // Emerald for completed
            } else if (task.kanbanState === 'BACKLOG' || task.status === 'TODO') {
              barColor = "#64748b"; // Slate for not started
            } else if (task.kanbanState === 'IN_REVIEW') {
              barColor = "#f59e0b"; // Amber for in review
            }

            return (
              <div key={task.id} className="flex items-center group">
                <div className="w-1/4 px-4 text-sm font-medium text-slate-800 truncate pr-4">
                  {task.name}
                </div>
                <div className="w-3/4 relative h-8 bg-slate-50 rounded-full border border-slate-100">
                  <div 
                    className="absolute h-6 top-1 rounded-full shadow-sm cursor-pointer hover:opacity-90 transition-all flex items-center justify-between px-2 text-white overflow-hidden"
                    style={{ 
                      left: `${leftPercent}%`, 
                      width: `${Math.max(widthPercent, 2)}%`, // Ensure minimum width for visibility
                      backgroundColor: barColor
                    }}
                  >
                    <span className="text-[10px] font-bold whitespace-nowrap overflow-hidden">
                      {taskDuration}d
                    </span>
                    {task.kanbanState === 'COMPLETED' && (
                       <svg className="w-3 h-3 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                       </svg>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
