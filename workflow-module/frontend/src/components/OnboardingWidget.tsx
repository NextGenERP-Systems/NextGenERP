"use client";
import { useState } from 'react';
import { HelpCircle, X, ChevronUp, ChevronDown } from 'lucide-react';

export function OnboardingWidget() {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 w-80 bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden transition-all duration-300 ease-in-out">
      <div 
        className="bg-blue-600 p-3 flex justify-between items-center text-white cursor-pointer hover:bg-blue-700 transition-colors" 
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-2 font-semibold text-sm">
          <HelpCircle className="w-4 h-4" /> Quick Start Guide
        </div>
        <div className="flex items-center gap-1">
          {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          <button 
            className="hover:bg-blue-800 p-1 rounded transition-colors"
            onClick={(e) => { e.stopPropagation(); setIsVisible(false); }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden bg-slate-50 ${isMinimized ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100 p-4 border-t border-slate-200'}`}
      >
        <h4 className="text-sm font-bold mb-2 text-slate-800">Welcome to Workflows</h4>
        <ol className="list-decimal pl-4 text-xs text-slate-600 space-y-2">
          <li>
            <a href="/workflows/definitions" className="text-blue-600 hover:underline cursor-pointer"><strong>Create a Workflow</strong></a>: Define your document type (e.g., "Contract").
          </li>
          <li>
            <a href="/workflows/setup/states" className="text-blue-600 hover:underline cursor-pointer"><strong>Define States</strong></a>: Add Draft, Pending, and Approved states.
          </li>
          <li>
            <a href="/workflows/setup/transitions" className="text-blue-600 hover:underline cursor-pointer"><strong>Set up Transitions</strong></a>: Link states with actions and assign them to specific roles.
          </li>
          <li>
            <a href="/workflows/documents" className="text-blue-600 hover:underline cursor-pointer"><strong>Create Documents</strong></a>: See your documents flow through the states seamlessly!
          </li>
        </ol>
      </div>
    </div>
  );
}
