/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * VantaCore Console Placeholder & Shell Views
 * Connected to TanStack Query API hooks for contracts & data verification.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Scale,
  GitBranch,
  Wrench,
  CheckCircle2,
  AlertOctagon,
  FileCheck,
  History,
  FlaskConical,
  Activity,
  Settings,
  Shield,
  ArrowRight,
  Lock,
} from 'lucide-react';
import {
  useDecisions,
  useEvents,
  useTools,
  useApprovals,
  useQuarantine,
  usePolicies,
  useAuditLogs,
  useSystemHealth,
} from '../../api';
import {
  RiskBadge,
  DecisionBadge,
  ApprovalStatusBadge,
  AssuranceTierBadge,
} from '../../components/common/SecurityBadges';
import { maskSensitiveValues } from '../../lib/enforcementLogic';

interface PlaceholderShellProps {
  icon: React.ReactNode;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  children?: React.ReactNode;
}

const PlaceholderShell: React.FC<PlaceholderShellProps> = ({
  icon,
  badge,
  title,
  subtitle,
  description,
  children,
}) => {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-[#8B9C8D] font-sans mt-1">
            {subtitle}
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[#70FF5E] font-mono text-xs font-semibold self-start sm:self-auto">
          {badge}
        </span>
      </div>

      <div className="p-8 rounded-2xl bg-[#080B08] border border-white/10 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/5">
          <div className="p-2.5 rounded-xl bg-white/5 text-[#70FF5E] border border-white/10">
            {icon}
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
              {title} Subsystem
            </h3>
            <p className="text-xs text-[#8B9C8D] font-mono">{description}</p>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
};

export const EventsViewPlaceholder: React.FC = () => {
  const { data: events = [] } = useEvents();

  return (
    <PlaceholderShell
      icon={<AlertTriangle className="w-5 h-5" />}
      badge="INGESTION ACTIVE"
      title="Security Events"
      subtitle="Raw and correlated event telemetry captured by VantaCore agents & interception gateways."
      description="Live streaming event queue with AST-level rule matches and taint indicators."
    >
      <div className="space-y-3 font-mono text-xs">
        <div className="text-[#8B9C8D] text-[11px] uppercase tracking-wider">
          Recent Ingested Events ({events.length})
        </div>
        <div className="divide-y divide-white/5 border border-white/5 rounded-xl overflow-hidden bg-black/40">
          {events.slice(0, 4).map((evt) => (
            <div key={evt.id} className="p-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-[#4D5C50] text-[11px]">{evt.timestamp}</span>
                <span className="text-white font-medium">{evt.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <RiskBadge risk={evt.risk} size="sm" />
                {evt.decision && <DecisionBadge decision={evt.decision} size="sm" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PlaceholderShell>
  );
};

export const DecisionsViewPlaceholder: React.FC = () => {
  const { data: decisions = [] } = useDecisions();

  return (
    <PlaceholderShell
      icon={<Scale className="w-5 h-5" />}
      badge="BOUNDARY ARBITRATION"
      title="Decisions"
      subtitle="Deterministic policy evaluations and runtime authorization logs."
      description="Zero-trust enforcement engine arbitration audit trail."
    >
      <div className="space-y-3 font-mono text-xs">
        <div className="text-[#8B9C8D] text-[11px] uppercase tracking-wider">
          Enforced Policy Decisions ({decisions.length})
        </div>
        <div className="divide-y divide-white/5 border border-white/5 rounded-xl overflow-hidden bg-black/40">
          {decisions.map((dec) => (
            <div key={dec.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-white font-medium flex items-center gap-2">
                  <span>{dec.matchedPolicyName || 'Inline Gateway Rule'}</span>
                  <span className="text-[10px] text-[#4D5C50] font-normal">{dec.id}</span>
                </div>
                <div className="text-[11px] text-[#8B9C8D] mt-0.5">{dec.reason}</div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <AssuranceTierBadge tier={dec.assuranceTier} size="sm" />
                <DecisionBadge decision={dec.decision} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </PlaceholderShell>
  );
};

export const AttackChainsViewPlaceholder: React.FC = () => {
  return (
    <PlaceholderShell
      icon={<GitBranch className="w-5 h-5" />}
      badge="CORRELATION ENGINE"
      title="Attack Chains"
      subtitle="Multi-stage agent exploitation graphs mapped to MITRE ATLAS & ATT&CK tactics."
      description="Inspect multi-hop prompt injection and lateral resource movement chains."
    >
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs font-mono text-[#8B9C8D]">
        See the high-fidelity interactive React Flow Attack Chain on the Security Overview and Session Details pages.
      </div>
    </PlaceholderShell>
  );
};

export const ToolsViewPlaceholder: React.FC = () => {
  const { data: tools = [] } = useTools();

  return (
    <PlaceholderShell
      icon={<Wrench className="w-5 h-5" />}
      badge="TOOL REGISTRY"
      title="Tool Registry"
      subtitle="Authorized agent capabilities, schemas, risk ratings, and boundary interception rules."
      description="Governed MCP tools, API clients, and execution endpoints."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs">
        {tools.map((t) => (
          <div key={t.id} className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#70FF5E] font-medium">{t.name}</span>
              <RiskBadge risk={t.riskRating} size="sm" />
            </div>
            <p className="text-[11px] text-[#8B9C8D] font-sans line-clamp-2">{t.description}</p>
            <div className="text-[10px] text-[#4D5C50]">Invocations: {t.invocationCount} • Blocked: {t.blockedCount}</div>
          </div>
        ))}
      </div>
    </PlaceholderShell>
  );
};

export const ApprovalsViewPlaceholder: React.FC = () => {
  const { data: approvals = [] } = useApprovals();

  return (
    <PlaceholderShell
      icon={<CheckCircle2 className="w-5 h-5" />}
      badge="HITL WORKFLOWS"
      title="Approvals"
      subtitle="Human-in-the-loop escalation queue for high-assurance and sensitive operations."
      description="Quarantined actions awaiting manual or dual-party authorization."
    >
      <div className="space-y-3 font-mono text-xs">
        {approvals.map((appr) => (
          <div key={appr.id} className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">{appr.toolAction}</span>
                <span className="text-[#4D5C50] text-[10px]">({appr.agentName})</span>
              </div>
              <div className="text-[11px] text-[#8B9C8D] mt-1">{appr.justification}</div>
            </div>
            <div className="flex items-center gap-2">
              <RiskBadge risk={appr.riskLevel} size="sm" />
              <ApprovalStatusBadge state={appr.state} size="sm" />
            </div>
          </div>
        ))}
      </div>
    </PlaceholderShell>
  );
};

export const QuarantineViewPlaceholder: React.FC = () => {
  const { data: quarantined = [] } = useQuarantine();

  return (
    <PlaceholderShell
      icon={<AlertOctagon className="w-5 h-5" />}
      badge="ISOLATION VAULT"
      title="Quarantine"
      subtitle="Suspended tool outputs, poisoned payloads, and quarantined agent identities."
      description="Containment boundary holding tainted content and credentials."
    >
      <div className="space-y-3 font-mono text-xs">
        {quarantined.map((item) => (
          <div key={item.id} className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-red-400 font-medium">{item.detectedTaintType}</span>
              <span className="text-[10px] text-[#4D5C50]">{item.quarantinedAt}</span>
            </div>
            <p className="text-[11px] text-[#8B9C8D]">{item.quarantineReason}</p>
            <div className="p-2.5 rounded bg-black/60 border border-white/5 text-[10px] text-white/80 font-mono overflow-x-auto">
              {item.rawSample}
            </div>
          </div>
        ))}
      </div>
    </PlaceholderShell>
  );
};

export const PoliciesViewPlaceholder: React.FC = () => {
  const { data: policies = [] } = usePolicies();

  return (
    <PlaceholderShell
      icon={<FileCheck className="w-5 h-5" />}
      badge="RULE ENGINE"
      title="Policies"
      subtitle="Zero-trust policies governing agent authorization, taint propagation, and data boundaries."
      description="Declarative security policy sets evaluated by the runtime gateway."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
        {policies.map((p) => (
          <div key={p.id} className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">{p.name}</span>
              <DecisionBadge decision={p.actionOnMatch} size="sm" />
            </div>
            <p className="text-[11px] text-[#8B9C8D] font-sans">{p.description}</p>
            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] text-[#4D5C50]">
              <span>Category: {p.category}</span>
              <span>Hits: {p.enforcedHits}</span>
            </div>
          </div>
        ))}
      </div>
    </PlaceholderShell>
  );
};

export const AuditViewPlaceholder: React.FC = () => {
  const { data: logs = [] } = useAuditLogs();

  return (
    <PlaceholderShell
      icon={<History className="w-5 h-5" />}
      badge="IMMUTABLE LEDGER"
      title="Audit"
      subtitle="Audit trail recording policy changes, simulated gateway actions, and human decisions."
      description="Compliance and forensic audit log stream (development simulation)."
    >
      <div className="divide-y divide-white/5 border border-white/5 rounded-xl overflow-hidden bg-black/40 font-mono text-xs">
        {logs.map((log) => (
          <div key={log.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[#70FF5E] font-medium">{log.action}</span>
                <span className="text-[10px] text-[#4D5C50]">{log.actor}</span>
              </div>
              <div className="text-[11px] text-[#8B9C8D] mt-0.5">{maskSensitiveValues(log.summary)}</div>
            </div>
            <span className="text-[10px] text-[#4D5C50] shrink-0">{log.timestamp}</span>
          </div>
        ))}
      </div>
    </PlaceholderShell>
  );
};

export const AiSecurityLabViewPlaceholder: React.FC = () => {
  const labHistory = [
    {
      id: 'lab-sim-001',
      scenario: 'Indirect Prompt Injection Probe',
      agent: 'research-agent-01',
      destinationTrust: 'UNKNOWN_EXTERNAL',
      status: 'SEVERED',
      simulatedPayload: JSON.stringify(
        {
          command: 'extract_credentials',
          override_token: '[REDACTED]',
          target: '/etc/vault/private_key.pem',
          authorization: '[REDACTED]',
        },
        null,
        2
      ),
      timestamp: '2026-10-16 14:10:02',
    },
    {
      id: 'lab-sim-002',
      scenario: 'High-Value Financial Transaction Delta',
      agent: 'finance-agent-01',
      destinationTrust: 'INTERNAL_TRUSTED',
      status: 'REVIEW_INTERCEPTED',
      simulatedPayload: JSON.stringify(
        {
          operation: 'UPDATE_BALANCE_CREDIT',
          target_uid: 'cust_8829104',
          delta: '+50000.00',
          api_key: '[REDACTED]',
          password: '[REDACTED]',
        },
        null,
        2
      ),
      timestamp: '2026-10-16 13:45:18',
    },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            AI Security Lab
          </h1>
          <p className="text-xs sm:text-sm text-[#8B9C8D] font-sans mt-1">
            Adversarial scenario simulation & synthetic taint propagation workbench.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 font-mono text-xs font-semibold self-start sm:self-auto">
          FRONTEND SIMULATION
        </span>
      </div>

      <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between text-xs font-mono text-purple-300">
        <span className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-purple-400 shrink-0" />
          <span>SENSITIVE ARGUMENT PROTECTION: All tokens and credentials in lab history are redacted ([REDACTED]) by default.</span>
        </span>
        <span className="text-[10px] text-[#8B9C8D] uppercase">NO REAL TOKENS ISSUED</span>
      </div>

      {/* Lab History & Evaluation Sandbox */}
      <div className="p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-4">
        <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
          Simulated Adversarial Scenarios
        </h3>
        <div className="space-y-4">
          {labHistory.map((item) => (
            <div key={item.id} className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3 font-mono text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                  <FlaskConical className="w-4 h-4 text-[#70FF5E]" />
                  <span className="text-white font-bold">{item.scenario}</span>
                  <span className="text-[#8B9C8D] text-[10px]">({item.agent})</span>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-red-500/15 border border-red-500/30 text-red-400 font-bold">
                    {item.status}
                  </span>
                  <span className="text-[#4D5C50]">{item.timestamp}</span>
                </div>
              </div>

              <div>
                <div className="text-[10px] text-[#8B9C8D] uppercase mb-1">Simulated Invocation Payload (Redacted):</div>
                <pre className="p-3 rounded-lg bg-black/80 border border-white/5 text-[11px] text-[#38BDF8] overflow-x-auto">
                  <code>{maskSensitiveValues(item.simulatedPayload)}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const SystemHealthViewPlaceholder: React.FC = () => {
  const { data: components = [] } = useSystemHealth();

  return (
    <PlaceholderShell
      icon={<Activity className="w-5 h-5" />}
      badge="FRONTEND SIMULATION"
      title="System Health"
      subtitle="Gateway latencies, cluster health, detector status, and telemetry broker throughput."
      description="Control plane subsystem performance and availability telemetry (development simulation)."
    >
      <div className="space-y-4">
        {/* Accurate development connection status banner */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 font-mono text-xs space-y-1">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>BACKEND NOT CONNECTED — FRONTEND SIMULATION MODE</span>
          </div>
          <p className="text-[11px] text-[#8B9C8D]">
            VantaCore is running in frontend development mode with mock datasets. No live Gateway, Security Engine, OPA, Redis, PostgreSQL, or WebSocket connections exist in this build.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
          {components.map((c) => (
            <div key={c.id} className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">{c.name}</span>
                <span className="text-amber-400 text-[10px] font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  BACKEND NOT CONNECTED
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-[10px]">
                <div>
                  <span className="text-[#4D5C50] uppercase">Sim. Latency</span>
                  <div className="text-white">{c.latencyMs}ms</div>
                </div>
                <div>
                  <span className="text-[#4D5C50] uppercase">Sim. RPS</span>
                  <div className="text-white">{c.throughputRps}</div>
                </div>
                <div>
                  <span className="text-[#4D5C50] uppercase">Mode</span>
                  <div className="text-amber-400">MOCK DATA</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PlaceholderShell>
  );
};

export const SettingsViewPlaceholder: React.FC = () => {
  return (
    <PlaceholderShell
      icon={<Settings className="w-5 h-5" />}
      badge="NOT CONFIGURED"
      title="Settings"
      subtitle="Workspace policies, SSO identity providers, notification webhooks, and telemetry egress."
      description="Enterprise organization and runtime integration configurations."
    >
      <div className="space-y-3 font-mono text-xs">
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
          BACKEND NOT CONNECTED • Security Engine not configured in development simulation
        </div>
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-[#8B9C8D]">
          VantaCore Enterprise Edition • Frontend Simulation Mode • Mock Identity: secops-admin
        </div>
      </div>
    </PlaceholderShell>
  );
};
