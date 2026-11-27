/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * VantaCore Taint Flow Explorer Component
 * Renders step-by-step synthetic taint propagation tracks through memory buffers,
 * privilege domains, and gatekeeper interception barriers.
 */

import React, { useState } from 'react';
import {
  Activity,
  ShieldCheck,
  ShieldAlert,
  Clock,
  ArrowRight,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
} from 'lucide-react';
import { TaintFlowTrace, TaintFlowNode } from '../../types/security';

interface TaintFlowExplorerProps {
  trace: TaintFlowTrace;
  className?: string;
}

export const TaintFlowExplorer: React.FC<TaintFlowExplorerProps> = ({ trace, className = '' }) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filteredNodes = trace.taints.filter((node) => {
    if (filterStatus === 'ALL') return true;
    return node.status === filterStatus;
  });

  const getStatusBadge = (status: TaintFlowNode['status']) => {
    switch (status) {
      case 'SEVERED':
      case 'CONTAINED':
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>{status}</span>
          </span>
        );
      case 'PROPAGATED':
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>{status}</span>
          </span>
        );
      case 'ACTIVE':
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" />
            <span>{status}</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-6 font-mono ${className}`}>
      {/* Header & Status Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Semantic Taint Propagation Trace
            </h3>
          </div>
          <p className="text-[11px] text-[#8B9C8D] mt-0.5">
            Tracing untrusted instruction taint contamination across execution contexts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#8B9C8D]" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1 rounded-lg bg-black/60 border border-white/10 text-white text-[11px] focus:outline-none focus:border-[#70FF5E]"
          >
            <option value="ALL">All Statuses ({trace.taints.length})</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="PROPAGATED">PROPAGATED</option>
            <option value="CONTAINED">CONTAINED</option>
            <option value="SEVERED">SEVERED</option>
          </select>
        </div>
      </div>

      {/* Taint Pipeline Steps */}
      <div className="space-y-4">
        {filteredNodes.map((node, idx) => (
          <div
            key={node.id}
            className="p-4 rounded-xl bg-black/40 border border-white/5 hover:border-white/15 transition-all space-y-2 relative"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-[#70FF5E]">
                  {node.step}
                </span>
                <span className="text-xs font-bold text-white">{node.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-[#4D5C50]">
                  {new Date(node.timestamp).toLocaleTimeString()}
                </span>
                {getStatusBadge(node.status)}
              </div>
            </div>

            <p className="text-[11px] text-[#8B9C8D] pl-8">
              {node.propagationEvent}
            </p>

            <div className="pl-8 pt-2 flex flex-wrap items-center gap-4 text-[10px] text-[#4D5C50]">
              <div>
                <span>Source Domain: </span>
                <span className="text-white font-bold">{node.source}</span>
              </div>
              {node.relatedRequest && (
                <div>
                  <span>Binding Request: </span>
                  <span className="text-sky-400">{node.relatedRequest}</span>
                </div>
              )}
              {node.parent && (
                <div>
                  <span>Upstream Taint: </span>
                  <span className="text-amber-400">{node.parent}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredNodes.length === 0 && (
          <div className="p-8 text-center text-xs text-[#8B9C8D]">
            No taint events match filter "{filterStatus}".
          </div>
        )}
      </div>

      {/* Summary Termination Banner */}
      <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-[#8B9C8D] flex items-center gap-3">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <div>
          <span className="text-white font-bold">Taint Propagation Severance Verified:</span>
          <span className="ml-1.5">
            Kernel gateway successfully severed execution before untrusted payload reached destination socket.
          </span>
        </div>
      </div>
    </div>
  );
};
