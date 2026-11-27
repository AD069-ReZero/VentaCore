/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * VantaCore Full Attack Chains Investigation Workspace
 * Routes: /console/attack-chains and /console/attack-chains/:chainId
 * Large-canvas React Flow workspace supporting multi-type threat nodes, risk escalation, and context panel.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  MarkerType,
  type Node,
  type Edge,
  type NodeProps,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Globe,
  AlertTriangle,
  Key,
  Send,
  AlertOctagon,
  Ban,
  Shield,
  ShieldAlert,
  Terminal,
  Cpu,
  Info,
  X,
  Sparkles,
  ExternalLink,
  Layers,
  ArrowRight,
  Maximize2,
  Workflow,
  Search,
  Filter,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { useAttackChain, useAttackChains } from '../../api';
import { RiskBadge, DecisionBadge } from '../../components/common/SecurityBadges';
import { RiskLevel, AttackChainNodeType, Decision } from '../../types/security';

// Extended Threat Node Payload interface
export interface WorkspaceNodePayload extends Record<string, unknown> {
  step: string;
  stepNumber: number;
  nodeType: AttackChainNodeType;
  title: string;
  subtitle: string;
  risk: RiskLevel;
  mitreTactic: string;
  confidence: number;
  timestamp: string;
  agent?: string;
  sessionId?: string;
  tool?: string;
  operation?: string;
  resource?: string;
  destination?: string;
  detector?: string;
  signal?: string;
  decision?: Decision;
  ruleMatched?: string;
  actionTaken?: string;
  relatedEventIds?: string[];
}

const getNodeIcon = (nodeType: AttackChainNodeType, step: string) => {
  switch (nodeType) {
    case 'SOURCE':
      return <Globe className="w-4 h-4 text-[#70FF5E]" />;
    case 'PROVENANCE':
      return <Terminal className="w-4 h-4 text-[#70FF5E]" />;
    case 'TAINT':
      return <Cpu className="w-4 h-4 text-[#F59E0B]" />;
    case 'SECURITY_SIGNAL':
      return <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />;
    case 'TOOL_ACTION':
      return <Sparkles className="w-4 h-4 text-[#38BDF8]" />;
    case 'RESOURCE':
      return <Key className="w-4 h-4 text-red-400" />;
    case 'DESTINATION':
      return <Send className="w-4 h-4 text-red-400" />;
    case 'RISK':
      return <AlertOctagon className="w-4 h-4 text-red-500 animate-pulse" />;
    case 'DECISION':
      return <Shield className="w-4 h-4 text-red-400" />;
    default:
      return <Info className="w-4 h-4 text-[#8B9C8D]" />;
  }
};

const CustomWorkspaceNode: React.FC<NodeProps<Node<WorkspaceNodePayload>>> = ({
  data,
  selected,
}) => {
  const isCritical = data.risk === 'CRITICAL';
  const isHigh = data.risk === 'HIGH';
  const isMedium = data.risk === 'MEDIUM';

  const borderColor = isCritical
    ? selected
      ? '#EF4444'
      : 'rgba(239, 68, 68, 0.4)'
    : isHigh
    ? selected
      ? '#F59E0B'
      : 'rgba(245, 158, 11, 0.4)'
    : isMedium
    ? selected
      ? '#EAB308'
      : 'rgba(234, 179, 8, 0.3)'
    : selected
    ? '#70FF5E'
    : 'rgba(112, 255, 94, 0.3)';

  const glowClass = selected
    ? isCritical
      ? 'shadow-[0_0_20px_rgba(239,68,68,0.35)]'
      : isHigh
      ? 'shadow-[0_0_20px_rgba(245,158,11,0.35)]'
      : 'shadow-[0_0_20px_rgba(112,255,94,0.35)]'
    : 'hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]';

  return (
    <div
      className={`relative px-4 py-3.5 rounded-xl bg-[#080B08] border min-w-[210px] max-w-[230px] transition-all cursor-pointer ${glowClass}`}
      style={{ borderColor }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-2.5 h-2.5 bg-black border border-white/40 !-left-1.5"
      />

      <div className="flex items-center justify-between text-[9px] font-mono mb-1.5">
        <span className="font-bold text-[#8B9C8D] tracking-wider">{data.step}</span>
        <span
          className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase"
          style={{
            backgroundColor: `${borderColor}20`,
            color: isCritical ? '#EF4444' : isHigh ? '#F59E0B' : '#70FF5E',
          }}
        >
          {data.nodeType || data.risk}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-1">
        <div className="p-1 rounded bg-white/5 shrink-0">
          {getNodeIcon(data.nodeType, data.step)}
        </div>
        <div className="font-mono text-xs font-bold text-white truncate">{data.title}</div>
      </div>

      <p className="text-[10px] text-[#8B9C8D] font-mono line-clamp-2 leading-relaxed">
        {data.subtitle}
      </p>

      <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between text-[8px] font-mono text-[#4D5C50]">
        <span>{(data.confidence * 100).toFixed(0)}% Conf</span>
        <span className="truncate max-w-[100px]">{data.mitreTactic.split(':')[0]}</span>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-2.5 h-2.5 bg-black border border-white/40 !-right-1.5"
      />
    </div>
  );
};

const nodeTypes = {
  threatNode: CustomWorkspaceNode,
};

const AttackChainsCanvas: React.FC<{ chainId?: string }> = ({ chainId = 'chain-exfil-001' }) => {
  const navigate = useNavigate();
  const { data: chain, isLoading } = useAttackChain(chainId);
  const { data: allChains = [] } = useAttackChains();
  const [selectedNodeData, setSelectedNodeData] = useState<WorkspaceNodePayload | null>(null);

  // Generate nodes from chain model
  const initialNodes: Node<WorkspaceNodePayload>[] = useMemo(() => {
    if (!chain || !chain.nodes) return [];

    return chain.nodes.map((node, index) => {
      // 2 rows layout (6 items per row)
      const col = index % 6;
      const row = Math.floor(index / 6);
      const x = 40 + col * 260;
      const y = 80 + row * 220;

      return {
        id: node.id,
        type: 'threatNode',
        position: { x, y },
        data: {
          step: node.stepLabel || `STEP 0${index + 1}`,
          stepNumber: node.stepNumber || index + 1,
          nodeType: (node.nodeType as AttackChainNodeType) || 'SECURITY_SIGNAL',
          title: node.title,
          subtitle: node.subtitle,
          risk: node.risk,
          mitreTactic: node.mitreTactic || 'TA0002: Execution',
          confidence: node.confidence || 0.95,
          timestamp: node.timestamp || '14:22:13',
          agent: node.agent || chain.agentName || 'research-agent-01',
          sessionId: node.sessionId || chain.sessionId,
          tool: node.tool,
          operation: node.operation,
          resource: node.resource,
          destination: node.destination,
          detector: node.detector,
          signal: node.signal,
          decision: node.decision,
          ruleMatched: node.ruleMatched,
          actionTaken: node.actionTaken,
          relatedEventIds: node.relatedEventIds || ['evt-exfil-001'],
        },
      };
    });
  }, [chain]);

  // Generate animated risk conduit edges connecting nodes
  const initialEdges: Edge[] = useMemo(() => {
    if (!initialNodes || initialNodes.length < 2) return [];

    const edges: Edge[] = [];
    for (let i = 0; i < initialNodes.length - 1; i++) {
      const source = initialNodes[i];
      const target = initialNodes[i + 1];
      const isCritical = target.data.risk === 'CRITICAL';
      const isHigh = target.data.risk === 'HIGH';

      const strokeColor = isCritical ? '#EF4444' : isHigh ? '#F59E0B' : '#70FF5E';

      const edgeLabels = ['caused', 'followed-by', 'tainted', 'attempted-exfiltration', 'blocked-by', 'approved-by'];
      const edgeLabel = edgeLabels[i % edgeLabels.length];

      edges.push({
        id: `e-${source.id}-${target.id}`,
        source: source.id,
        target: target.id,
        animated: true,
        label: edgeLabel,
        labelStyle: { fill: strokeColor, fontFamily: 'monospace', fontSize: 10, fontWeight: 700 },
        labelBgStyle: { fill: '#050605', fillOpacity: 0.85 },
        labelBgPadding: [4, 2] as [number, number],
        style: {
          stroke: strokeColor,
          strokeWidth: isCritical ? 2.5 : 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: strokeColor,
          width: 14,
          height: 14,
        },
      });
    }

    return edges;
  }, [initialNodes]);

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNodeData(node.data as unknown as WorkspaceNodePayload);
  }, []);

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto pb-12 antialiased">
      {/* 1. Header with Chain Status and Cross-Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-[#080B08] border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-red-400 font-bold">
              MULTI-STAGE THREAT PATH CORRELATION
            </span>
            <span className="text-[#4D5C50]">•</span>
            <span className="text-xs font-mono text-[#8B9C8D]">
              Chain ID: {chain?.id || chainId}
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {chain?.title || 'Adversarial Prompt Injection to Private Key Exfiltration'}
          </h1>
          <p className="text-xs text-[#8B9C8D] font-sans mt-0.5">
            {chain?.summary ||
              'Correlated kill-chain tracking multi-hop taint propagation, tool invocation, and credential exfiltration.'}
          </p>
        </div>

        {/* Chain Metadata and Quick Jump */}
        <div className="flex flex-wrap items-center gap-3 shrink-0 font-mono text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold">
            STATUS: {chain?.status || 'SEVERED'}
          </div>
          <RiskBadge risk={chain?.severity || 'CRITICAL'} size="md" />

          {/* Quick jump to decision */}
          <button
            onClick={() => navigate(`/console/decisions/${chain?.decisionId || 'dec-exfil-001'}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0E1710] border border-[#70FF5E]/30 text-[#70FF5E] hover:bg-[#70FF5E]/10 transition-colors"
          >
            <span>View Decision</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Large React Flow Graph Investigation Canvas */}
      <div className="relative rounded-2xl bg-[#050605] border border-white/10 h-[calc(100vh-250px)] min-h-[580px] overflow-hidden shadow-2xl">
        <ReactFlow
          nodes={initialNodes}
          edges={initialEdges}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.2}
          maxZoom={1.8}
        >
          <Background color="#161F18" gap={24} size={1} />
          <Controls
            className="!bg-[#080B08] !border-white/10 !rounded-xl !overflow-hidden [&>button]:!bg-[#080B08] [&>button]:!border-white/10 [&>button]:!text-white [&>button:hover]:!bg-white/10"
          />
        </ReactFlow>

        {/* Floating Canvas Legend */}
        <div className="absolute top-4 left-4 p-3 rounded-xl bg-[#080B08]/90 backdrop-blur-md border border-white/10 font-mono text-[10px] space-y-1.5 z-10 hidden sm:block">
          <div className="text-[#8B9C8D] uppercase font-bold text-[9px] mb-1">Risk Conduit Progression</div>
          <div className="flex items-center gap-2 text-[#70FF5E]">
            <span className="w-2 h-2 rounded-full bg-[#70FF5E]" />
            <span>Stages 01-03: Initial Access & Ingestion (Normal)</span>
          </div>
          <div className="flex items-center gap-2 text-[#F59E0B]">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
            <span>Stages 04-06: Prompt Injection & File Read (Suspicious)</span>
          </div>
          <div className="flex items-center gap-2 text-red-400">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>Stages 07-12: Exfiltration & Gateway BLOCK (Critical)</span>
          </div>
        </div>

        {/* Floating Prompt for Node Click */}
        {!selectedNodeData && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-[#080B08]/90 backdrop-blur-md border border-white/10 text-xs font-mono text-[#8B9C8D] z-10 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#70FF5E]" />
            <span>Click any node in the threat path to inspect granular forensic evidence</span>
          </div>
        )}

        {/* 3. Node Details Context Panel (Drawer/Card) */}
        {selectedNodeData && (
          <div className="absolute top-4 right-4 w-96 max-w-[90%] max-h-[calc(100%-32px)] overflow-y-auto p-5 rounded-2xl bg-[#080B08]/95 backdrop-blur-md border border-white/15 shadow-2xl space-y-4 z-20 font-mono text-xs">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-white/10">
              <div>
                <div className="text-[10px] uppercase text-[#70FF5E] font-bold tracking-wider">
                  {selectedNodeData.step} • {selectedNodeData.nodeType}
                </div>
                <h3 className="font-display text-base font-bold text-white mt-0.5">
                  {selectedNodeData.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedNodeData(null)}
                className="p-1 rounded bg-white/5 hover:bg-white/10 text-[#8B9C8D] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2">
              <RiskBadge risk={selectedNodeData.risk} size="sm" />
              {selectedNodeData.decision && (
                <DecisionBadge decision={selectedNodeData.decision} size="sm" />
              )}
              <span className="text-[10px] text-[#8B9C8D] bg-white/5 px-2 py-0.5 rounded">
                {selectedNodeData.timestamp}
              </span>
            </div>

            {/* Description Subtitle */}
            <p className="text-[11px] text-[#EDEDED] font-sans leading-relaxed">
              {selectedNodeData.subtitle}
            </p>

            {/* Granular Context Attributes */}
            <div className="space-y-2 text-[11px] pt-2 border-t border-white/5">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-[#4D5C50]">Agent:</span>
                <span className="text-white font-medium">{selectedNodeData.agent || 'research-agent-01'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-[#4D5C50]">MITRE Tactic:</span>
                <span className="text-amber-400 truncate max-w-[200px]">{selectedNodeData.mitreTactic}</span>
              </div>
              {selectedNodeData.tool && (
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-[#4D5C50]">Tool Invoked:</span>
                  <span className="text-[#38BDF8]">{selectedNodeData.tool}</span>
                </div>
              )}
              {selectedNodeData.resource && (
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-[#4D5C50]">Target Resource:</span>
                  <span className="text-red-400 truncate max-w-[200px]">{selectedNodeData.resource}</span>
                </div>
              )}
              {selectedNodeData.destination && (
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-[#4D5C50]">Destination:</span>
                  <span className="text-[#8B9C8D] truncate max-w-[200px]">{selectedNodeData.destination}</span>
                </div>
              )}
              {selectedNodeData.detector && (
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-[#4D5C50]">Detector:</span>
                  <span className="text-[#70FF5E]">{selectedNodeData.detector}</span>
                </div>
              )}
              {selectedNodeData.ruleMatched && (
                <div className="py-1">
                  <div className="text-[9px] uppercase text-amber-400 font-bold mb-0.5">Rule Matched</div>
                  <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px]">
                    {selectedNodeData.ruleMatched}
                  </div>
                </div>
              )}
            </div>

            {/* Cross-Investigation Action Buttons */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <button
                onClick={() =>
                  navigate(`/console/sessions/${selectedNodeData.sessionId || 'sess-exfil-001'}`)
                }
                className="w-full py-2 px-3 rounded-xl bg-[#0E1710] border border-[#70FF5E]/30 text-[#70FF5E] hover:bg-[#70FF5E]/10 transition-colors text-center font-medium"
              >
                Inspect Session Timeline →
              </button>

              <button
                onClick={() =>
                  navigate(
                    `/console/events?q=${selectedNodeData.relatedEventIds?.[0] || 'evt-exfil-007'}`
                  )
                }
                className="w-full py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors text-center font-medium"
              >
                View Triggering Event →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const AttackChainsWorkspaceView: React.FC = () => {
  const { chainId } = useParams<{ chainId: string }>();

  return (
    <ReactFlowProvider>
      <AttackChainsCanvas chainId={chainId} />
    </ReactFlowProvider>
  );
};
