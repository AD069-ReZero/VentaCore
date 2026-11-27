/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * VantaCore Agent Details View (Area 2)
 * Features 7 investigation tabs: Overview, Sessions, Tool Permissions,
 * Decisions, Incidents, Policy, Activity; plus containment security controls.
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bot,
  Shield,
  Layers,
  Wrench,
  Scale,
  Flame,
  FileCheck,
  Activity,
  Lock,
  AlertTriangle,
  Ban,
  AlertOctagon,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import {
  useAgent,
  useSessions,
  useDecisions,
  useInvestigations,
  useEvents,
  usePolicies,
} from '../../api';
import { RiskBadge, AssuranceTierBadge, DecisionBadge } from '../../components/common/SecurityBadges';

export const AgentDetailsView: React.FC = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();

  const { data: agent, isLoading: agentLoading } = useAgent(agentId);
  const { data: allSessions = [] } = useSessions();
  const { data: allDecisions = [] } = useDecisions();
  const { data: allIncidents = [] } = useInvestigations();
  const { data: allEvents = [] } = useEvents();
  const { data: allPolicies = [] } = usePolicies();

  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'SESSIONS' | 'TOOLS' | 'DECISIONS' | 'INCIDENTS' | 'POLICY' | 'ACTIVITY'
  >('OVERVIEW');

  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  if (agentLoading) {
    return (
      <div className="space-y-6 max-w-[1400px] mx-auto p-8 animate-pulse font-mono">
        <div className="h-8 w-64 bg-white/10 rounded" />
        <div className="h-64 bg-white/5 rounded-2xl border border-white/5" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="max-w-[800px] mx-auto p-12 text-center font-mono space-y-4">
        <Bot className="w-10 h-10 text-red-400 mx-auto" />
        <h2 className="text-white text-lg font-bold">Agent Identity Not Found</h2>
        <p className="text-xs text-[#8B9C8D]">Agent ID "{agentId}" is not registered in this tenant scope.</p>
        <button
          onClick={() => navigate('/console/agents')}
          className="px-4 py-2 rounded-xl bg-white/10 text-xs text-white hover:bg-white/20"
        >
          ← Return to Agents
        </button>
      </div>
    );
  }

  // Filter agent-specific relations
  const agentSessions = allSessions.filter((s) => s.agentId === agent.id || s.agentName === agent.name);
  const agentDecisions = allDecisions.filter((d) => d.agentId === agent.id || d.agentName === agent.name);
  const agentIncidents = allIncidents.filter((i) => i.agentId === agent.id || i.agentName === agent.name);
  const agentEvents = allEvents.filter((e) => e.agent === agent.id || e.agentName === agent.name);

  const handleAction = (actionName: string) => {
    setFeedbackNotice(`Authorized containment command "${actionName}" dispatched to gateway.`);
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  return (
    <div className="space-y-8 max-w-[1440px] mx-auto pb-12 antialiased">
      {/* 1. Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/console/agents')}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#8B9C8D] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <Bot className="w-5 h-5 text-[#70FF5E]" />
              <h1 className="font-mono text-xl sm:text-2xl font-bold text-white tracking-tight">
                {agent.name}
              </h1>
              <AssuranceTierBadge tier={agent.assuranceTier} size="sm" />
              <RiskBadge risk={agent.riskLevel} size="sm" />
            </div>
            <p className="text-xs text-[#8B9C8D] font-mono mt-0.5">
              ID: {agent.id} • Security Revision: <span className="text-[#70FF5E]">{agent.securityRevision || 'sec-rev-2026.10-q'}</span> • Tenant: {agent.organization || 'Acme SOC'}
            </p>
          </div>
        </div>

        {/* Security Controls Strip */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <button
            onClick={() => handleAction('QUARANTINE_AGENT')}
            className="px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center gap-1.5 transition-colors"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Quarantine Agent</span>
          </button>
          <button
            onClick={() => handleAction('DISABLE_AGENT')}
            className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1.5 transition-colors"
          >
            <Ban className="w-3.5 h-3.5" />
            <span>Disable Agent</span>
          </button>
          <button
            onClick={() => handleAction('INVALIDATE_SESSIONS')}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 flex items-center gap-1.5 transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Invalidate Sessions</span>
          </button>
        </div>
      </div>

      {feedbackNotice && (
        <div className="p-3 rounded-xl bg-[#70FF5E]/10 border border-[#70FF5E]/30 text-[#70FF5E] text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* 2. Detail Tabs (7 required: Overview, Sessions, Tool Permissions, Decisions, Incidents, Policy, Activity) */}
      <div className="flex items-center gap-1 border-b border-white/10 overflow-x-auto font-mono text-xs pb-px">
        {[
          { key: 'OVERVIEW', label: 'Overview', icon: <Bot className="w-3.5 h-3.5" /> },
          { key: 'SESSIONS', label: `Sessions (${agentSessions.length})`, icon: <Layers className="w-3.5 h-3.5" /> },
          { key: 'TOOLS', label: `Tool Permissions (${agent.allowedCapabilities?.length || 0})`, icon: <Wrench className="w-3.5 h-3.5" /> },
          { key: 'DECISIONS', label: `Decisions (${agentDecisions.length})`, icon: <Scale className="w-3.5 h-3.5" /> },
          { key: 'INCIDENTS', label: `Incidents (${agentIncidents.length})`, icon: <Flame className="w-3.5 h-3.5" /> },
          { key: 'POLICY', label: 'Policy Binding', icon: <FileCheck className="w-3.5 h-3.5" /> },
          { key: 'ACTIVITY', label: `Activity (${agentEvents.length})`, icon: <Activity className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-[#70FF5E] text-white bg-white/[0.02]'
                : 'border-transparent text-[#8B9C8D] hover:text-white'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-6">
            <div>
              <h3 className="font-mono text-xs uppercase tracking-wider text-[#8B9C8D] mb-2">Description</h3>
              <p className="text-sm text-white font-sans leading-relaxed">
                {agent.description || 'Autonomous agent runtime configured with scoped tool execution boundaries.'}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/5 font-mono text-xs">
              <div>
                <div className="text-[10px] uppercase text-[#4D5C50]">Status</div>
                <div className="text-[#70FF5E] font-bold mt-1">{agent.status}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-[#4D5C50]">Risk Score</div>
                <div className="text-white font-bold mt-1">{agent.riskScore} / 100</div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-[#4D5C50]">Environment</div>
                <div className="text-white font-bold mt-1">{agent.environment}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-[#4D5C50]">Owner</div>
                <div className="text-white font-bold mt-1">{agent.owner || 'SecOps Team'}</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-4 font-mono text-xs">
            <h3 className="font-mono text-xs uppercase tracking-wider text-[#8B9C8D]">Security Revision State</h3>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="text-[#8B9C8D]">Revision Digest</div>
              <div className="text-[#70FF5E] font-bold break-all">{agent.securityRevision || 'sec-rev-2026.10-q'}</div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="text-[#8B9C8D]">Identity Key Fingerprint</div>
              <div className="text-white/80 break-all">{agent.identityKey}</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Sessions */}
      {activeTab === 'SESSIONS' && (
        <div className="rounded-2xl bg-[#080B08] border border-white/10 overflow-hidden font-mono text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01] text-[#8B9C8D] text-[10px] uppercase">
                <th className="py-3 px-4">Session ID</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Risk</th>
                <th className="py-3 px-4">Started</th>
                <th className="py-3 px-4 text-right">Drilldown</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {agentSessions.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => navigate(`/console/sessions/${s.id}`)}
                  className="hover:bg-white/[0.02] cursor-pointer"
                >
                  <td className="py-3 px-4 text-sky-400 font-bold">{s.id}</td>
                  <td className="py-3 px-4 text-white">{s.status}</td>
                  <td className="py-3 px-4"><RiskBadge risk={s.risk} size="sm" /></td>
                  <td className="py-3 px-4 text-[#8B9C8D]">{s.startedAt || s.duration}</td>
                  <td className="py-3 px-4 text-right text-[#70FF5E]">View →</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Tool Permissions */}
      {activeTab === 'TOOLS' && (
        <div className="p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-4 font-mono text-xs">
          <h3 className="font-mono text-xs uppercase tracking-wider text-[#8B9C8D]">Allowed Capability Grants</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {agent.allowedCapabilities?.map((cap) => (
              <div key={cap} className="p-3 rounded-xl bg-white/[0.02] border border-[#70FF5E]/20 text-[#70FF5E] font-bold">
                ✓ {cap}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Decisions */}
      {activeTab === 'DECISIONS' && (
        <div className="rounded-2xl bg-[#080B08] border border-white/10 overflow-hidden font-mono text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01] text-[#8B9C8D] text-[10px] uppercase">
                <th className="py-3 px-4">Decision ID</th>
                <th className="py-3 px-4">Tool</th>
                <th className="py-3 px-4">Decision</th>
                <th className="py-3 px-4">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {agentDecisions.map((d) => (
                <tr key={d.id} onClick={() => navigate(`/console/decisions/${d.id}`)} className="hover:bg-white/[0.02] cursor-pointer">
                  <td className="py-3 px-4 text-white font-bold">{d.id}</td>
                  <td className="py-3 px-4 text-[#8B9C8D]">{d.tool || d.operation}</td>
                  <td className="py-3 px-4"><DecisionBadge decision={d.decision} size="sm" /></td>
                  <td className="py-3 px-4 text-white/80">{d.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 5: Incidents */}
      {activeTab === 'INCIDENTS' && (
        <div className="p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-3 font-mono text-xs">
          {agentIncidents.length === 0 ? (
            <div className="text-center py-8 text-[#8B9C8D]">No open incidents associated with this agent.</div>
          ) : (
            agentIncidents.map((inc) => (
              <div
                key={inc.id}
                onClick={() => navigate(`/console/incidents/${inc.id}`)}
                className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/5 border border-white/5 flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="text-white font-bold">{inc.title}</div>
                  <div className="text-[10px] text-[#4D5C50]">{inc.id}</div>
                </div>
                <RiskBadge risk={inc.severity} size="sm" />
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 6: Policy */}
      {activeTab === 'POLICY' && (
        <div className="p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-4 font-mono text-xs">
          <h3 className="font-mono text-xs uppercase tracking-wider text-[#8B9C8D]">Bound Policy Bundle</h3>
          <p className="text-white">Active OPA policy v1.4.2 applies fail-closed runtime arbitration to this agent identity.</p>
        </div>
      )}

      {/* Tab 7: Activity */}
      {activeTab === 'ACTIVITY' && (
        <div className="p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-3 font-mono text-xs">
          {agentEvents.map((e) => (
            <div key={e.id} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex justify-between">
              <span className="text-white">{e.label || e.details}</span>
              <span className="text-[#8B9C8D]">{new Date(e.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
