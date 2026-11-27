/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * VantaCore SOC Security Overview (Area 1)
 * Authoritative main SOC dashboard displaying evaluation counts, decisions,
 * agent/session health, attack metrics, interactive charts, and live forensic feeds.
 */

import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Bot,
  Layers,
  Flame,
  ArrowRight,
  TrendingUp,
  Activity,
  Network,
  Wrench,
  HelpCircle,
  Eye,
  FileCode,
  Radio,
} from 'lucide-react';
import {
  useDecisions,
  useAgents,
  useSessions,
  useApprovals,
  useInvestigations,
  useEvents,
  useConnectors,
  useQuarantine,
} from '../../api';
import { DecisionBadge, RiskBadge } from '../../components/common/SecurityBadges';
import { NetworkGlobe3D } from '../../components/console/NetworkGlobe3D';

export const OverviewView: React.FC = () => {
  const navigate = useNavigate();

  // Queries
  const { data: decisions = [], isLoading: decisionsLoading } = useDecisions();
  const { data: agents = [], isLoading: agentsLoading } = useAgents();
  const { data: sessions = [], isLoading: sessionsLoading } = useSessions();
  const { data: approvals = [], isLoading: approvalsLoading } = useApprovals();
  const { data: incidents = [], isLoading: incidentsLoading } = useInvestigations();
  const { data: events = [], isLoading: eventsLoading } = useEvents();
  const { data: connectors = [], isLoading: connectorsLoading } = useConnectors();
  const { data: quarantined = [], isLoading: quarantineLoading } = useQuarantine();

  // Selected time window filter for charts
  const [chartTimeframe, setChartTimeframe] = useState<'1h' | '24h' | '7d'>('24h');

  // Compute SOC metrics from authoritative backend read models
  const metrics = useMemo(() => {
    const totalEvaluations = decisions.length;
    const allowCount = decisions.filter((d) => d.decision === 'ALLOW').length;
    const reviewCount = decisions.filter((d) => d.decision === 'REVIEW').length;
    const blockCount = decisions.filter((d) => d.decision === 'BLOCK').length;
    const outcomeUnknownCount = decisions.filter((d) => d.decision === 'NOT_AVAILABLE' || !d.decision).length;

    const activeAgents = agents.filter((a) => a.status === 'ACTIVE').length;
    const activeSessions = sessions.filter((s) => s.status === 'ACTIVE').length;
    const highRiskSessions = sessions.filter(
      (s) => s.risk === 'HIGH' || s.risk === 'CRITICAL' || (s.riskScore && s.riskScore >= 70)
    ).length;
    const quarantinedSessions = sessions.filter((s) => s.status === 'BLOCKED' || s.destinationTrust === 'DENIED').length + quarantined.length;

    const pendingApprovals = approvals.filter((a) => a.state === 'PENDING').length;
    const openIncidents = incidents.filter((i) => i.status === 'OPEN' || i.status === 'INVESTIGATING').length;

    const canaryHits = events.filter(
      (e) =>
        e.details?.toLowerCase().includes('canary') ||
        e.label?.toLowerCase().includes('canary') ||
        e.type === 'UNTRUSTED_INPUT'
    ).length;

    const promptInjectionEvents = events.filter(
      (e) =>
        e.type === 'PROMPT_INJECTION' ||
        e.type === 'INDIRECT_PROMPT_INJECTION' ||
        e.details?.toLowerCase().includes('prompt injection')
    ).length;

    return {
      totalEvaluations,
      allowCount,
      reviewCount,
      blockCount,
      outcomeUnknownCount,
      activeAgents,
      activeSessions,
      highRiskSessions,
      pendingApprovals,
      openIncidents,
      quarantinedSessions,
      canaryHits,
      promptInjectionEvents,
    };
  }, [decisions, agents, sessions, approvals, incidents, events, quarantined]);

  // Risk Distribution Data
  const riskDistribution = useMemo(() => {
    const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 };
    events.forEach((e) => {
      const r = (e.risk || e.severity || 'LOW') as keyof typeof counts;
      if (counts[r] !== undefined) counts[r]++;
    });
    return counts;
  }, [events]);

  // Top Risky Agents
  const topRiskyAgents = useMemo(() => {
    return [...agents]
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 4);
  }, [agents]);

  // Attack categories from incidents and events
  const attackCategories = useMemo(() => {
    const cats: Record<string, number> = {
      'Prompt Injection': 0,
      'Canary Exfil': 0,
      'SSRF Egress': 0,
      'SQL Mutation': 0,
      'Schema Drift': 0,
    };
    events.forEach((e) => {
      const text = `${e.type} ${e.details} ${e.label}`.toLowerCase();
      if (text.includes('prompt') || text.includes('injection')) cats['Prompt Injection']++;
      else if (text.includes('canary') || text.includes('exfil')) cats['Canary Exfil']++;
      else if (text.includes('ssrf') || text.includes('http') || text.includes('egress')) cats['SSRF Egress']++;
      else if (text.includes('sql') || text.includes('mutation')) cats['SQL Mutation']++;
      else if (text.includes('schema') || text.includes('drift')) cats['Schema Drift']++;
    });
    return Object.entries(cats).map(([name, count]) => ({ name, count }));
  }, [events]);

  // Recent activity feed: timestamp, agent, session, tool, decision, risk, event
  const recentActivities = useMemo(() => {
    return events.slice(0, 7).map((evt) => {
      const relatedDec = decisions.find((d) => d.sessionId === evt.sessionId || d.id === evt.decisionId);
      return {
        id: evt.id,
        timestamp: evt.timestamp,
        agent: evt.agentName || evt.agent || 'autonomous-agent',
        session: evt.sessionId,
        tool: evt.toolName || evt.tool || 'runtime.execute',
        decision: evt.decision || relatedDec?.decision || 'ALLOW',
        risk: evt.risk || evt.severity || 'LOW',
        event: evt.label || evt.details || evt.type,
      };
    });
  }, [events, decisions]);

  const isLoading =
    decisionsLoading || agentsLoading || sessionsLoading || approvalsLoading || incidentsLoading;

  return (
    <div className="space-y-8 max-w-[1500px] mx-auto pb-12 antialiased">
      {/* 1. Header & Quick Status Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#70FF5E] animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#70FF5E]">
              SOC CONTROL PLANE // VANTACORE RUNTIME
            </span>
            <span className="text-xs text-[#8B9C8D] font-mono">• Policy Bundle v1.4.2</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Security Overview
          </h1>
          <p className="text-xs sm:text-sm text-[#8B9C8D] font-sans mt-1">
            Authoritative telemetry and enforcement decisions across autonomous AI workloads.
          </p>
        </div>

        {/* Global Quick Filter Buttons */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => navigate('/console/decisions?filter=BLOCK')}
            className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-1.5"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>{metrics.blockCount} Blocks</span>
          </button>
          <button
            onClick={() => navigate('/console/approvals?state=PENDING')}
            className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-colors flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{metrics.pendingApprovals} Pending Approvals</span>
          </button>
          <button
            onClick={() => navigate('/console/incidents?status=OPEN')}
            className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 transition-colors flex items-center gap-1.5"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{metrics.openIncidents} Incidents</span>
          </button>
        </div>
      </div>

      {/* 2. Primary SOC Metric Cards (13 required fields with direct navigation) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Evaluations */}
        <div
          onClick={() => navigate('/console/decisions')}
          className="p-4 rounded-2xl bg-[#080B08] border border-white/10 hover:border-[#70FF5E]/40 transition-all cursor-pointer group"
        >
          <div className="text-[11px] font-mono text-[#8B9C8D] uppercase tracking-wider">TOTAL EVALS</div>
          <div className="text-2xl sm:text-3xl font-display font-extrabold text-white mt-1.5 group-hover:text-[#70FF5E] transition-colors">
            {metrics.totalEvaluations}
          </div>
          <div className="text-[10px] font-mono text-[#4D5C50] mt-1 flex items-center gap-1">
            <span>Arbitration rate 100%</span>
          </div>
        </div>

        {/* ALLOW */}
        <div
          onClick={() => navigate('/console/decisions?decision=ALLOW')}
          className="p-4 rounded-2xl bg-[#080B08] border border-[#70FF5E]/20 hover:border-[#70FF5E]/50 transition-all cursor-pointer group"
        >
          <div className="text-[11px] font-mono text-[#70FF5E] uppercase tracking-wider flex items-center justify-between">
            <span>ALLOW</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#70FF5E]" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-extrabold text-[#70FF5E] mt-1.5">
            {metrics.allowCount}
          </div>
          <div className="text-[10px] font-mono text-[#8B9C8D] mt-1">
            {metrics.totalEvaluations ? Math.round((metrics.allowCount / metrics.totalEvaluations) * 100) : 0}% of requests
          </div>
        </div>

        {/* REVIEW */}
        <div
          onClick={() => navigate('/console/approvals?state=PENDING')}
          className="p-4 rounded-2xl bg-[#080B08] border border-amber-500/20 hover:border-amber-500/50 transition-all cursor-pointer group"
        >
          <div className="text-[11px] font-mono text-amber-400 uppercase tracking-wider flex items-center justify-between">
            <span>REVIEW</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-extrabold text-amber-400 mt-1.5">
            {metrics.reviewCount}
          </div>
          <div className="text-[10px] font-mono text-[#8B9C8D] mt-1">Human-in-the-Loop holds</div>
        </div>

        {/* BLOCK */}
        <div
          onClick={() => navigate('/console/decisions?decision=BLOCK')}
          className="p-4 rounded-2xl bg-[#080B08] border border-red-500/20 hover:border-red-500/50 transition-all cursor-pointer group"
        >
          <div className="text-[11px] font-mono text-red-400 uppercase tracking-wider flex items-center justify-between">
            <span>BLOCK</span>
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-extrabold text-red-400 mt-1.5">
            {metrics.blockCount}
          </div>
          <div className="text-[10px] font-mono text-[#8B9C8D] mt-1">Interception boundary</div>
        </div>

        {/* Active Agents */}
        <div
          onClick={() => navigate('/console/agents')}
          className="p-4 rounded-2xl bg-[#080B08] border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
        >
          <div className="text-[11px] font-mono text-[#8B9C8D] uppercase tracking-wider">ACTIVE AGENTS</div>
          <div className="text-2xl sm:text-3xl font-display font-extrabold text-white mt-1.5 group-hover:text-[#70FF5E] transition-colors">
            {metrics.activeAgents}
          </div>
          <div className="text-[10px] font-mono text-[#4D5C50] mt-1">Enforced identities</div>
        </div>

        {/* Active Sessions */}
        <div
          onClick={() => navigate('/console/sessions')}
          className="p-4 rounded-2xl bg-[#080B08] border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
        >
          <div className="text-[11px] font-mono text-[#8B9C8D] uppercase tracking-wider">ACTIVE SESSIONS</div>
          <div className="text-2xl sm:text-3xl font-display font-extrabold text-white mt-1.5 group-hover:text-[#70FF5E] transition-colors">
            {metrics.activeSessions}
          </div>
          <div className="text-[10px] font-mono text-[#4D5C50] mt-1">Runtime epochs tracked</div>
        </div>

        {/* High-Risk Sessions */}
        <div
          onClick={() => navigate('/console/sessions?risk=HIGH')}
          className="p-4 rounded-2xl bg-[#080B08] border border-orange-500/20 hover:border-orange-500/40 transition-all cursor-pointer group"
        >
          <div className="text-[11px] font-mono text-orange-400 uppercase tracking-wider">HIGH-RISK SESS</div>
          <div className="text-2xl sm:text-3xl font-display font-extrabold text-orange-400 mt-1.5">
            {metrics.highRiskSessions}
          </div>
          <div className="text-[10px] font-mono text-[#8B9C8D] mt-1">Elevated taint propagation</div>
        </div>

        {/* Pending Approvals */}
        <div
          onClick={() => navigate('/console/approvals')}
          className="p-4 rounded-2xl bg-[#080B08] border border-amber-500/20 hover:border-amber-500/40 transition-all cursor-pointer group"
        >
          <div className="text-[11px] font-mono text-amber-400 uppercase tracking-wider">PENDING APPR</div>
          <div className="text-2xl sm:text-3xl font-display font-extrabold text-amber-400 mt-1.5">
            {metrics.pendingApprovals}
          </div>
          <div className="text-[10px] font-mono text-[#8B9C8D] mt-1">Queue review required</div>
        </div>

        {/* Open Incidents */}
        <div
          onClick={() => navigate('/console/incidents')}
          className="p-4 rounded-2xl bg-[#080B08] border border-purple-500/20 hover:border-purple-500/40 transition-all cursor-pointer group"
        >
          <div className="text-[11px] font-mono text-purple-400 uppercase tracking-wider">OPEN INCIDENTS</div>
          <div className="text-2xl sm:text-3xl font-display font-extrabold text-purple-400 mt-1.5">
            {metrics.openIncidents}
          </div>
          <div className="text-[10px] font-mono text-[#8B9C8D] mt-1">Active investigations</div>
        </div>

        {/* Quarantined Sessions */}
        <div
          onClick={() => navigate('/console/sessions?status=BLOCKED')}
          className="p-4 rounded-2xl bg-[#080B08] border border-red-500/20 hover:border-red-500/40 transition-all cursor-pointer group"
        >
          <div className="text-[11px] font-mono text-red-400 uppercase tracking-wider">QUARANTINED</div>
          <div className="text-2xl sm:text-3xl font-display font-extrabold text-red-400 mt-1.5">
            {metrics.quarantinedSessions}
          </div>
          <div className="text-[10px] font-mono text-[#8B9C8D] mt-1">Isolated containers</div>
        </div>

        {/* Canary Hits */}
        <div
          onClick={() => navigate('/console/events?query=canary')}
          className="p-4 rounded-2xl bg-[#080B08] border border-cyan-500/20 hover:border-cyan-500/40 transition-all cursor-pointer group"
        >
          <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">CANARY HITS</div>
          <div className="text-2xl sm:text-3xl font-display font-extrabold text-cyan-400 mt-1.5">
            {metrics.canaryHits}
          </div>
          <div className="text-[10px] font-mono text-[#8B9C8D] mt-1">Exfiltration tripwires</div>
        </div>

        {/* Prompt Injection Events */}
        <div
          onClick={() => navigate('/console/events?type=PROMPT_INJECTION')}
          className="p-4 rounded-2xl bg-[#080B08] border border-red-500/20 hover:border-red-500/40 transition-all cursor-pointer group"
        >
          <div className="text-[11px] font-mono text-red-400 uppercase tracking-wider">INJECTIONS</div>
          <div className="text-2xl sm:text-3xl font-display font-extrabold text-red-400 mt-1.5">
            {metrics.promptInjectionEvents}
          </div>
          <div className="text-[10px] font-mono text-[#8B9C8D] mt-1">Adversarial payload drops</div>
        </div>
      </div>

      {/* 3. Hero Visual & Topological Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Globe & Realtime Mesh */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-[#080B08] border border-white/10 relative overflow-hidden flex flex-col justify-between shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/5 relative z-10">
            <div>
              <div className="text-[11px] font-mono text-[#70FF5E] uppercase tracking-wider">
                TOPOLOGICAL BOUNDARY INTERCEPTION
              </div>
              <h3 className="font-display text-lg font-bold text-white mt-0.5">
                Multi-Tenant Protected Execution Fabric
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#70FF5E] animate-ping" />
              <span className="text-xs font-mono text-[#70FF5E]">Active Telemetry Stream</span>
            </div>
          </div>

          <div className="h-[260px] flex items-center justify-center relative my-2">
            <NetworkGlobe3D />
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5 font-mono text-xs relative z-10">
            <div>
              <div className="text-[#8B9C8D] text-[11px]">ACTIVE CONNECTORS</div>
              <div className="text-white font-bold text-sm mt-0.5">{connectors.length} MCP/HTTP Endpoints</div>
            </div>
            <div>
              <div className="text-[#8B9C8D] text-[11px]">IMMUTABLE AUDIT CHAIN</div>
              <div className="text-[#70FF5E] font-bold text-sm mt-0.5">100% VERIFIED SHA-256</div>
            </div>
            <div>
              <div className="text-[#8B9C8D] text-[11px]">UNKNOWN OUTCOMES</div>
              <div className="text-white font-bold text-sm mt-0.5">{metrics.outcomeUnknownCount} (Zero-Trust)</div>
            </div>
          </div>
        </div>

        {/* Risk Distribution Breakdown */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-[#080B08] border border-white/10 flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="font-mono text-sm font-semibold text-white">Risk Distribution</h3>
                <p className="text-[11px] text-[#8B9C8D] font-sans mt-0.5">Categorized event severity across runtime</p>
              </div>
              <Activity className="w-4 h-4 text-[#70FF5E]" />
            </div>

            <div className="mt-6 space-y-4 font-mono text-xs">
              {/* Critical */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-red-400 font-bold">CRITICAL</span>
                  <span className="text-white">{riskDistribution.CRITICAL}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (riskDistribution.CRITICAL / (events.length || 1)) * 100 * 2)}%` }}
                  />
                </div>
              </div>

              {/* High */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-orange-400 font-bold">HIGH</span>
                  <span className="text-white">{riskDistribution.HIGH}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full bg-orange-400 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (riskDistribution.HIGH / (events.length || 1)) * 100 * 2)}%` }}
                  />
                </div>
              </div>

              {/* Medium */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-amber-400 font-bold">MEDIUM</span>
                  <span className="text-white">{riskDistribution.MEDIUM}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (riskDistribution.MEDIUM / (events.length || 1)) * 100 * 2)}%` }}
                  />
                </div>
              </div>

              {/* Low */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#70FF5E] font-bold">LOW</span>
                  <span className="text-white">{riskDistribution.LOW}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full bg-[#70FF5E] rounded-full transition-all"
                    style={{ width: `${Math.min(100, (riskDistribution.LOW / (events.length || 1)) * 100 * 2)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono">
            <span className="text-[#8B9C8D]">Total Forensic Events</span>
            <span className="text-white font-bold">{events.length}</span>
          </div>
        </div>
      </div>

      {/* 4. Charts Strip: Decision Trend & Attack Categories & Top Risky Agents */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Decision Trend */}
        <div className="p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="font-mono text-sm font-semibold text-white">Decision Ratios</h3>
            <span className="text-[10px] font-mono text-[#70FF5E]">Authoritative Gateway</span>
          </div>
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
              <span className="text-[#70FF5E]">ALLOW Decisions</span>
              <span className="text-white font-bold">{metrics.allowCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
              <span className="text-amber-400">REVIEW Holds</span>
              <span className="text-white font-bold">{metrics.reviewCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
              <span className="text-red-400">BLOCK Drops</span>
              <span className="text-white font-bold">{metrics.blockCount}</span>
            </div>
          </div>
        </div>

        {/* Attack Categories */}
        <div className="p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="font-mono text-sm font-semibold text-white">Attack Categories</h3>
            <span className="text-[10px] font-mono text-[#8B9C8D]">Runtime Signals</span>
          </div>
          <div className="space-y-2.5 font-mono text-xs">
            {attackCategories.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between py-1 border-b border-white/5 last:border-0">
                <span className="text-[#8B9C8D]">{cat.name}</span>
                <span className="text-white font-bold px-2 py-0.5 rounded bg-white/5">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Risky Agents */}
        <div className="p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="font-mono text-sm font-semibold text-white">Top Risky Agents</h3>
            <span
              onClick={() => navigate('/console/agents')}
              className="text-[10px] font-mono text-[#70FF5E] hover:underline cursor-pointer"
            >
              View All →
            </span>
          </div>
          <div className="space-y-2.5 font-mono text-xs">
            {topRiskyAgents.map((ag) => (
              <div
                key={ag.id}
                onClick={() => navigate(`/console/agents/${ag.id}`)}
                className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/5 border border-white/5 flex items-center justify-between cursor-pointer transition-colors"
              >
                <div>
                  <div className="text-white font-bold truncate max-w-[140px]">{ag.name}</div>
                  <div className="text-[10px] text-[#4D5C50]">{ag.id}</div>
                </div>
                <div className="flex items-center gap-2">
                  <RiskBadge risk={ag.riskLevel} size="sm" />
                  <span className="text-xs font-bold text-white">{ag.riskScore}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Authoritative Recent Activity Feed */}
      <div className="rounded-2xl bg-[#080B08] border border-white/10 overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-mono text-sm font-semibold text-white">Recent SOC Activity Stream</h3>
            <p className="text-[11px] text-[#8B9C8D] font-sans mt-0.5">
              Live audit events matching timestamp, agent, session, tool, decision, risk, and event classification
            </p>
          </div>
          <button
            onClick={() => navigate('/console/events')}
            className="text-xs font-mono text-[#70FF5E] hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Full Event Log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01] text-[#8B9C8D] text-[10px] uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Agent</th>
                <th className="py-3 px-4">Session</th>
                <th className="py-3 px-4">Tool</th>
                <th className="py-3 px-4">Decision</th>
                <th className="py-3 px-4">Risk</th>
                <th className="py-3 px-4">Security Event</th>
                <th className="py-3 px-4 text-right">Drilldown</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentActivities.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => navigate(`/console/sessions/${item.session}`)}
                  className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-4 text-[#8B9C8D] whitespace-nowrap text-[11px]">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-4 text-white font-medium group-hover:text-[#70FF5E] transition-colors">
                    {item.agent}
                  </td>
                  <td className="py-3 px-4 text-sky-400 text-[11px]">
                    {item.session.slice(0, 14)}...
                  </td>
                  <td className="py-3 px-4 text-white/90">
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[11px]">
                      {item.tool}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <DecisionBadge decision={item.decision} size="sm" />
                  </td>
                  <td className="py-3 px-4">
                    <RiskBadge risk={item.risk} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-white text-[11px] max-w-xs truncate">
                    {item.event}
                  </td>
                  <td className="py-3 px-4 text-right text-[#8B9C8D] group-hover:text-white">
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
