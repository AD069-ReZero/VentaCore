/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * VantaCore Provenance Explorer Component
 * Visualizes the verifiable lineage and source-to-sink graph of data, prompts,
 * model states, tool invocations, and destinations.
 */

import React, { useState } from 'react';
import {
  GitBranch,
  Globe,
  FileText,
  Bot,
  Wrench,
  Server,
  Database,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Tag,
  Info,
  Clock,
  Layers,
  Code2,
} from 'lucide-react';
import { ProvenanceGraph, ProvenanceNode, ProvenanceNodeType } from '../../types/security';

interface ProvenanceExplorerProps {
  graph: ProvenanceGraph;
  className?: string;
}

export const ProvenanceExplorer: React.FC<ProvenanceExplorerProps> = ({ graph, className = '' }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>(graph.rootSourceId || graph.nodes[0]?.id);

  const selectedNode = graph.nodes.find((n) => n.id === selectedNodeId) || graph.nodes[0];

  const getNodeIcon = (type: ProvenanceNodeType) => {
    switch (type) {
      case 'WEB':
        return <Globe className="w-4 h-4 text-amber-400" />;
      case 'FILE':
        return <FileText className="w-4 h-4 text-sky-400" />;
      case 'MODEL':
        return <Bot className="w-4 h-4 text-purple-400" />;
      case 'TOOL':
        return <Wrench className="w-4 h-4 text-[#70FF5E]" />;
      case 'API':
        return <Server className="w-4 h-4 text-red-400" />;
      case 'DATABASE':
        return <Database className="w-4 h-4 text-emerald-400" />;
      default:
        return <Layers className="w-4 h-4 text-[#8B9C8D]" />;
    }
  };

  const getTrustBadgeColor = (trust: string) => {
    switch (trust) {
      case 'UNTRUSTED_EXTERNAL':
      case 'DENIED':
        return 'bg-red-500/15 text-red-400 border-red-500/30';
      case 'INTERNAL_RESTRICTED':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'MODEL_GENERATED':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'INTERNAL_TRUSTED':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-white/5 text-[#8B9C8D] border-white/10';
    }
  };

  return (
    <div className={`p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-6 font-mono ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-sky-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Data Lineage & Provenance Graph
            </h3>
          </div>
          <p className="text-[11px] text-[#8B9C8D] mt-0.5">
            Cryptographically bounded entity chain from ingestion source to enforcement sink.
          </p>
        </div>
        <span className="px-2.5 py-1 rounded bg-black/60 border border-white/10 text-[10px] text-[#8B9C8D]">
          {graph.nodes.length} Lineage Nodes • {graph.edges.length} Transitions
        </span>
      </div>

      {/* Main Grid: Interactive Graph on Left, Node Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Node Flow Representation (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="text-[10px] text-[#4D5C50] uppercase tracking-wider mb-2">
            Sequential Data Path
          </div>

          <div className="space-y-3">
            {graph.nodes.map((node, idx) => {
              const isSelected = node.id === selectedNode?.id;
              const isRoot = node.id === graph.rootSourceId;
              const outgoingEdge = graph.edges.find((e) => e.from === node.id);

              return (
                <div key={node.id} className="relative">
                  <div
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-black/90 border-[#70FF5E] ring-1 ring-[#70FF5E]/30 shadow-lg shadow-[#70FF5E]/5'
                        : 'bg-black/40 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                          {getNodeIcon(node.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{node.label}</span>
                            {isRoot && (
                              <span className="px-1.5 py-0.2 rounded text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold uppercase">
                                ROOT SOURCE
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-[#8B9C8D] mt-0.5">{node.details}</div>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border shrink-0 ${getTrustBadgeColor(
                          node.trustClassification
                        )}`}
                      >
                        {node.trustClassification}
                      </span>
                    </div>

                    {/* Taint Chips */}
                    {node.taintLabels.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3 pt-2.5 border-t border-white/5">
                        {node.taintLabels.map((taint) => (
                          <span
                            key={taint}
                            className="px-1.5 py-0.2 rounded text-[9px] bg-red-500/10 text-red-300 border border-red-500/20"
                          >
                            {taint}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Transition Edge Label */}
                  {outgoingEdge && idx < graph.nodes.length - 1 && (
                    <div className="py-1.5 px-6 flex items-center gap-2 text-[10px] text-[#8B9C8D]">
                      <div className="w-0.5 h-4 bg-white/10" />
                      <ArrowRight className="w-3 h-3 text-[#70FF5E]" />
                      <span className="italic">{outgoingEdge.label}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Node Inspector (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-black/60 border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[#70FF5E]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Node Inspector
              </span>
            </div>
            <span className="text-[10px] text-[#4D5C50]">{selectedNode.id}</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] text-[#4D5C50] uppercase block">Entity Label</span>
              <span className="text-white font-bold">{selectedNode.label}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-[#4D5C50] uppercase block">Entity Type</span>
                <span className="text-sky-400 font-bold">{selectedNode.type}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#4D5C50] uppercase block">Timestamp</span>
                <span className="text-[#8B9C8D] text-[11px]">
                  {new Date(selectedNode.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-[#4D5C50] uppercase block">Trust Tier</span>
              <span
                className={`inline-block mt-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${getTrustBadgeColor(
                  selectedNode.trustClassification
                )}`}
              >
                {selectedNode.trustClassification}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-[#4D5C50] uppercase block">Description / Context</span>
              <p className="text-[11px] text-[#8B9C8D] leading-relaxed mt-0.5">
                {selectedNode.details}
              </p>
            </div>

            {selectedNode.metadata && Object.keys(selectedNode.metadata).length > 0 && (
              <div>
                <span className="text-[10px] text-[#4D5C50] uppercase block mb-1">
                  Metadata & Attestation Hashes
                </span>
                <pre className="p-3 rounded-lg bg-black/80 border border-white/5 text-[10px] text-emerald-400/90 overflow-x-auto">
                  {JSON.stringify(selectedNode.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
