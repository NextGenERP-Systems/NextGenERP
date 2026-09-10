"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, Circle, X, Minus, ChevronUp } from "lucide-react";

export function OnboardingWidget({ hasProjects = false, hasTasks = false, hasTimesheets = false }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const progress = {
    project: hasProjects,
    task: hasTasks,
    timesheet: hasTimesheets,
    dashboard: true
  };

  useEffect(() => {
    // Only show on client-side to avoid hydration mismatch, and check if it was dismissed
    const dismissed = localStorage.getItem("nge_onboarding_dismissed");
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const completedCount = Object.values(progress).filter(Boolean).length;
  const totalCount = Object.keys(progress).length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  const handleDismiss = () => {
    localStorage.setItem("nge_onboarding_dismissed", "true");
    setIsVisible(false);
  };

  if (!isVisible || percentage === 100) return null;

  if (isMinimized) {
    return (
      <div 
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 bg-white p-3 rounded-full shadow-lg border border-blue-200 cursor-pointer hover:shadow-xl transition-all z-50 flex items-center gap-3 animate-in slide-in-from-bottom-5"
      >
        <div className="relative">
          <svg className="w-8 h-8 transform -rotate-90">
            <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-200" />
            <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="88" strokeDashoffset={88 - (88 * percentage) / 100} className="text-blue-600 transition-all duration-1000" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-700">{percentage}%</span>
        </div>
        <ChevronUp size={20} className="text-slate-500" />
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in slide-in-from-bottom-5">
      
      {/* Header */}
      <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
        <h3 className="font-bold">Projects Setup</h3>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsMinimized(true)} className="text-slate-400 hover:text-white transition-colors">
            <Minus size={18} />
          </button>
          <button onClick={handleDismiss} className="text-slate-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Progress Indicator */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-bold text-slate-700">{completedCount}/{totalCount} steps completed</span>
            <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{percentage}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-1000" 
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-3 pt-2">
          
          <div className={`flex items-center gap-3 ${progress.project ? 'opacity-50' : ''}`}>
            {progress.project ? <CheckCircle2 size={20} className="text-green-500" /> : <Circle size={20} className="text-slate-300" />}
            <span className={`text-sm font-medium ${progress.project ? 'text-slate-500 line-through' : 'text-slate-700'}`}>Create Project</span>
          </div>
          
          <div className={`flex items-center gap-3 ${progress.task ? 'opacity-50' : ''}`}>
            {progress.task ? <CheckCircle2 size={20} className="text-green-500" /> : <Circle size={20} className="text-slate-300" />}
            <span className={`text-sm font-medium ${progress.task ? 'text-slate-500 line-through' : 'text-slate-700'}`}>Create Task</span>
          </div>
          
          <div className={`flex items-center gap-3 ${progress.timesheet ? 'opacity-50' : ''}`}>
            {progress.timesheet ? <CheckCircle2 size={20} className="text-green-500" /> : <Circle size={20} className="text-slate-300" />}
            <span className={`text-sm font-medium ${progress.timesheet ? 'text-slate-500 line-through' : 'text-slate-700'}`}>Create Timesheet</span>
          </div>
          
          <div className={`flex items-center gap-3 ${progress.dashboard ? 'opacity-50' : ''}`}>
            {progress.dashboard ? <CheckCircle2 size={20} className="text-green-500" /> : <Circle size={20} className="text-slate-300" />}
            <span className={`text-sm font-medium ${progress.dashboard ? 'text-slate-500 line-through' : 'text-slate-700'}`}>View Project Summary</span>
          </div>

        </div>

        <button 
          onClick={handleDismiss}
          className="w-full mt-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors py-2"
        >
          Skip All
        </button>
      </div>
    </div>
  );
}
