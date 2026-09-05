"use client";

import { useMemo, useState, useCallback, useEffect } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Edge, 
  Node, 
  MarkerType, 
  Connection, 
  useNodesState, 
  useEdgesState, 
  addEdge 
} from 'reactflow';
import 'reactflow/dist/style.css';
import { WorkflowState, WorkflowTransition } from '@/lib/api';
import { Sparkles, Trash2, X, Check, Code, Shield, Play } from 'lucide-react';
import { toast } from 'sonner';

interface WorkflowGraphProps {
  states: WorkflowState[];
  transitions: WorkflowTransition[];
  onAddTransition?: (fromStateId: string, toStateId: string, actionName: string, allowedRole: string, conditionExpression?: string) => Promise<void>;
  onDeleteTransition?: (transitionId: string) => Promise<void>;
  onRefresh?: () => void;
}

export default function WorkflowGraph({ 
  states, 
  transitions, 
  onAddTransition, 
  onDeleteTransition,
  onRefresh 
}: WorkflowGraphProps) {
  // Modal states
  const [selectedEdge, setSelectedEdge] = useState<WorkflowTransition | null>(null);
  const [connectModal, setConnectModal] = useState<{ fromId: string; toId: string } | null>(null);
  
  // Transition Form in Connect Modal
  const [actionName, setActionName] = useState("");
  const [allowedRole, setAllowedRole] = useState("Admin");
  const [conditionExpression, setConditionExpression] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate initial ReactFlow nodes
  const initialNodes: Node[] = useMemo(() => {
    return states.map((state, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      return {
        id: state.id,
        position: { x: 100 + col * 260, y: 80 + row * 180 },
        data: { 
          label: (
            <div className="flex flex-col items-center p-2">
              <span className="font-bold text-slate-800 text-sm">{state.stateName}</span>
              <div className="flex items-center gap-1 mt-1">
                {state.isInitialState && (
                  <span className="text-[10px] bg-blue-100 text-blue-700 font-medium px-1.5 py-0.5 rounded">
                    Initial
                  </span>
                )}
                {state.isFinalState && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 font-medium px-1.5 py-0.5 rounded">
                    Final
                  </span>
                )}
              </div>
            </div>
          ) 
        },
        style: {
          background: '#ffffff',
          border: `2.5px solid ${state.colorCode || '#3b82f6'}`,
          borderRadius: '12px',
          width: 170,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        }
      };
    });
  }, [states]);

  // Generate initial ReactFlow edges
  const initialEdges: Edge[] = useMemo(() => {
    return transitions.map((t) => {
      const hasCondition = !!t.conditionExpression && t.conditionExpression.trim() !== "";
      return {
        id: t.id,
        source: t.fromStateId,
        target: t.toStateId,
        label: `${t.actionName} (${t.allowedRole})${hasCondition ? ' ⚡ SpEL' : ''}`,
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: hasCondition ? '#8b5cf6' : '#64748b',
        },
        style: { 
          stroke: hasCondition ? '#8b5cf6' : '#64748b',
          strokeWidth: 2,
          cursor: 'pointer',
        },
        labelStyle: { 
          fill: hasCondition ? '#6d28d9' : '#334155', 
          fontWeight: 600, 
          fontSize: 11 
        },
        labelBgStyle: { 
          fill: hasCondition ? '#f3e8ff' : '#f8fafc', 
          fillOpacity: 0.9,
          rx: 4,
          ry: 4,
        },
        data: { transitionObj: t }
      };
    });
  }, [transitions]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Handle Drag-and-Drop edge creation callback
  const onConnect = useCallback((params: Connection) => {
    if (!params.source || !params.target) return;
    setConnectModal({ fromId: params.source, toId: params.target });
    setActionName("");
    setAllowedRole("Admin");
    setConditionExpression("");
  }, []);

  const handleCreateTransitionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectModal || !onAddTransition) return;
    if (!actionName.trim()) {
      toast.error("Action name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddTransition(
        connectModal.fromId,
        connectModal.toId,
        actionName.trim(),
        allowedRole.trim(),
        conditionExpression.trim() || undefined
      );
      toast.success("Transition created via visual builder!");
      setConnectModal(null);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to create transition");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edge Click Handler -> View SpEL Condition Modal
  const onEdgeClick = (_: React.MouseEvent, edge: Edge) => {
    const foundTransition = transitions.find(t => t.id === edge.id);
    if (foundTransition) {
      setSelectedEdge(foundTransition);
    }
  };

  const handleDeleteSelectedEdge = async () => {
    if (!selectedEdge || !onDeleteTransition) return;
    try {
      await onDeleteTransition(selectedEdge.id);
      toast.success("Transition deleted");
      setSelectedEdge(null);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete transition");
    }
  };

  const fromStateObj = connectModal ? states.find(s => s.id === connectModal.fromId) : null;
  const toStateObj = connectModal ? states.find(s => s.id === connectModal.toId) : null;

  if (states.length === 0) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-400 bg-slate-50 border border-slate-200 rounded-xl">
        <Sparkles className="w-8 h-8 text-slate-300 mb-2" />
        <p className="text-sm font-medium">Add workflow states first to render the interactive graph.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] bg-slate-50/80 border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={onEdgeClick}
        fitView
      >
        <Background color="#cbd5e1" gap={18} size={1} />
        <Controls />
      </ReactFlow>

      {/* Instruction Toast Overlay */}
      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs border border-slate-200 shadow-2xs px-3 py-1.5 rounded-lg text-xs text-slate-600 flex items-center gap-2 pointer-events-none">
        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
        <span>Drag nodes to reposition. Connect nodes to create transitions. Click edges to view/edit SpEL rules.</span>
      </div>

      {/* Connect Modal: Create Transition via Drag & Drop */}
      {connectModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-base">
                <Play className="w-4 h-4 text-indigo-600" />
                Create New Transition
              </h3>
              <button 
                onClick={() => setConnectModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-600 flex items-center justify-between border border-slate-200">
              <span className="font-semibold text-slate-800">{fromStateObj?.stateName || "Source"}</span>
              <span className="text-slate-400">➔</span>
              <span className="font-semibold text-slate-800">{toStateObj?.stateName || "Target"}</span>
            </div>

            <form onSubmit={handleCreateTransitionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Action Name *
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Approve, Reject, Submit"
                  value={actionName}
                  onChange={(e) => setActionName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-slate-500" />
                  Allowed Role *
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Manager, Admin, Auditor"
                  value={allowedRole}
                  onChange={(e) => setAllowedRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Code className="w-3.5 h-3.5 text-purple-600" />
                  SpEL Condition Expression (Optional)
                </label>
                <input 
                  type="text"
                  placeholder="e.g. amount > 500 or doc.amount <= 10000"
                  value={conditionExpression}
                  onChange={(e) => setConditionExpression(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono text-purple-900 bg-purple-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Evaluated at runtime using Spring Expression Language (SpEL).
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setConnectModal(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Save Transition"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edge Inspector Modal: View/Edit SpEL condition */}
      {selectedEdge && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-base">
                <Code className="w-4 h-4 text-purple-600" />
                Transition Details & SpEL Rules
              </h3>
              <button 
                onClick={() => setSelectedEdge(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Action Name:</span>
                <span className="font-bold text-slate-800">{selectedEdge.actionName}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Allowed Role:</span>
                <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{selectedEdge.allowedRole}</span>
              </div>

              <div className="space-y-1.5 pt-2">
                <span className="text-slate-500 font-medium block">SpEL Condition Expression:</span>
                {selectedEdge.conditionExpression ? (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl font-mono text-purple-900 text-xs break-all">
                    {selectedEdge.conditionExpression}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 italic">
                    No condition set. (Transition executes unconditionally)
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              {onDeleteTransition ? (
                <button
                  type="button"
                  onClick={handleDeleteSelectedEdge}
                  className="px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1.5 border border-rose-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Transition
                </button>
              ) : <div />}

              <button
                type="button"
                onClick={() => setSelectedEdge(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
