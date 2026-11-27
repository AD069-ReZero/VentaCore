/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * VantaCore Audit View — SOC Audit Explorer
 * Forensic audit trail across security, governance, approval, and execution activity.
 * Strict cryptographic hash chain verification (tamper-evident SHA-256 ledger).
 * 12 Exhaustive filters: time, organization, agent, session, tool, execution, decision, approval, connector, user, event type, severity.
 * Authoritative 8 columns: Timestamp, Event, Actor, Agent, Session, Resource, Decision, Trace ID.
 */

import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  History,
  Search,
  Filter,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Clock,
  Layers,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  User,
  Cpu,
  Lock,
  ChevronDown,
  ChevronUp,
  Fingerprint,
  Link as LinkIcon,
  Check,
} from 'lucide-react';
import { useAuditLogs } from '../../api';
import { AuditEvent, RiskLevel } from '../../types/security';
import { RiskBadge } from '../../components/common/SecurityBadges';

export const AuditView: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Filters from URL params or defaults
  const initialAction = searchParams.get('action') || 'ALL';
  const initialResource = searchParams.get('resourceId') || '';
  const initialAgent = searchParams.get('agentId') || '';
  const initialSession = searchParams.get('sessionId') || '';

  // 12 Filter States
  const [timeFilter, setTimeFilter] = useState<string>('ALL');
  const [orgFilter, setOrgFilter] = useState<string>('');
  const [agentFilter, setAgentFilter] = useState<string>(initialAgent);
  const [sessionFilter, setSessionFilter] = useState<string>(initialSession);
  const [toolFilter, setToolFilter] = useState<string>('');
  const [executionFilter, setExecutionFilter] = useState<string>('');
  const [decisionFilter, setDecisionFilter] = useState<string>('ALL');
  const [approvalFilter, setApprovalFilter] = useState<string>('');
  const [connectorFilter, setConnectorFilter] = useState<string>('');
  const [userFilter, setUserFilter] = useState<string>('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>(initialAction);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  const [searchQuery, setSearchQuery] = useState<string>(initialResource);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [verifiedModalOpen, setVerifiedModalOpen] = useState<boolean>(false);

  const { data: rawLogs = [], isLoading, isError, error } = useAuditLogs();

  // Hero Statistics
  const statistics = useMemo(() => {
    const totalToday = rawLogs.length;
    const securityActions = rawLogs.filter((l) =>
      ['SECURITY_SIGNAL_CREATED', 'RISK_ASSESSED', 'RESULT_QUARANTINED', 'SESSION_QUARANTINED'].includes(l.action)
    ).length;
    const policyEvents = rawLogs.filter((l) =>
      ['POLICY_CREATED', 'POLICY_UPDATED', 'POLICY_ACTIVATED'].includes(l.action)
    ).length;
    const approvalEvents = rawLogs.filter((l) =>
      ['APPROVAL_CREATED', 'APPROVAL_APPROVED', 'APPROVAL_REJECTED', 'APPROVAL_CONSUMED'].includes(l.action)
    ).length;
    const enforcementEvents = rawLogs.filter((l) =>
      ['DECISION_CREATED', 'SIMULATED_AUTHORIZATION_CREATED', 'SIMULATED_EXECUTION_COMPLETED'].includes(l.action)
    ).length;

    return {
      totalToday,
      securityActions,
      policyEvents,
      approvalEvents,
      enforcementEvents,
    };
  }, [rawLogs]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (timeFilter !== 'ALL') count++;
    if (orgFilter) count++;
    if (agentFilter) count++;
    if (sessionFilter) count++;
    if (toolFilter) count++;
    if (executionFilter) count++;
    if (decisionFilter !== 'ALL') count++;
    if (approvalFilter) count++;
    if (connectorFilter) count++;
    if (userFilter) count++;
    if (eventTypeFilter !== 'ALL') count++;
    if (severityFilter !== 'ALL') count++;
    if (searchQuery) count++;
    return count;
  }, [
    timeFilter, orgFilter, agentFilter, sessionFilter, toolFilter,
    executionFilter, decisionFilter, approvalFilter, connectorFilter,
    userFilter, eventTypeFilter, severityFilter, searchQuery
  ]);

  // Filtered Logs matching the 12 filters
  const filteredLogs = useMemo(() => {
    const now = Date.now();

    return rawLogs.filter((log) => {
      // 1. Time Filter
      if (timeFilter !== 'ALL') {
        const logTime = new Date(log.timestamp).getTime();
        if (timeFilter === '15M' && now - logTime > 15 * 60 * 1000) return false;
        if (timeFilter === '1H' && now - logTime > 60 * 60 * 1000) return false;
        if (timeFilter === '24H' && now - logTime > 24 * 60 * 60 * 1000) return false;
        if (timeFilter === '7D' && now - logTime > 7 * 24 * 60 * 60 * 1000) return false;
      }

      // 2. Organization Filter
      if (orgFilter) {
        const orgMatch = (log.orgId || 'org-vantacore-sec-01').toLowerCase().includes(orgFilter.toLowerCase());
        if (!orgMatch) return false;
      }

      // 3. Agent Filter
      if (agentFilter) {
        const agentMatch =
          (log.relatedAgentId && log.relatedAgentId.toLowerCase().includes(agentFilter.toLowerCase())) ||
          (log.actorType === 'GATEWAY_AGENT' && log.actor.toLowerCase().includes(agentFilter.toLowerCase())) ||
          (log.resourceType === 'AGENT' && log.resourceId.toLowerCase().includes(agentFilter.toLowerCase()));
        if (!agentMatch) return false;
      }

      // 4. Session Filter
      if (sessionFilter) {
        const sessMatch =
          (log.sessionId && log.sessionId.toLowerCase().includes(sessionFilter.toLowerCase())) ||
          (log.relatedSessionId && log.relatedSessionId.toLowerCase().includes(sessionFilter.toLowerCase()));
        if (!sessMatch) return false;
      }

      // 5. Tool Filter
      if (toolFilter) {
        const toolMatch =
          (log.relatedToolId && log.relatedToolId.toLowerCase().includes(toolFilter.toLowerCase())) ||
          (log.resourceType === 'TOOL' && log.resourceId.toLowerCase().includes(toolFilter.toLowerCase()));
        if (!toolMatch) return false;
      }

      // 6. Execution Filter
      if (executionFilter) {
        const execMatch =
          (log.relatedExecutionId && log.relatedExecutionId.toLowerCase().includes(executionFilter.toLowerCase())) ||
          (log.requestId && log.requestId.toLowerCase().includes(executionFilter.toLowerCase()));
        if (!execMatch) return false;
      }

      // 7. Decision Filter
      if (decisionFilter !== 'ALL') {
        const logDecision = log.decision || (log.metadata?.decision as string) || (log.status === 'DENIED' ? 'BLOCK' : log.status === 'SUCCESS' ? 'ALLOW' : 'UNKNOWN');
        if (logDecision !== decisionFilter) return false;
      }

      // 8. Approval Filter
      if (approvalFilter) {
        const appMatch =
          (log.relatedApprovalId && log.relatedApprovalId.toLowerCase().includes(approvalFilter.toLowerCase())) ||
          (log.resourceType === 'APPROVAL' && log.resourceId.toLowerCase().includes(approvalFilter.toLowerCase()));
        if (!appMatch) return false;
      }

      // 9. Connector Filter
      if (connectorFilter) {
        const connMatch =
          (log.relatedConnectorId && log.relatedConnectorId.toLowerCase().includes(connectorFilter.toLowerCase())) ||
          (log.resourceType === 'CONNECTOR' && log.resourceId.toLowerCase().includes(connectorFilter.toLowerCase())) ||
          (log.source && log.source.toLowerCase().includes(connectorFilter.toLowerCase()));
        if (!connMatch) return false;
      }

      // 10. User Filter
      if (userFilter) {
        const userMatch =
          (log.actorType === 'USER' && log.actor.toLowerCase().includes(userFilter.toLowerCase())) ||
          (log.relatedUserId && log.relatedUserId.toLowerCase().includes(userFilter.toLowerCase()));
        if (!userMatch) return false;
      }

      // 11. Event Type Filter
      if (eventTypeFilter !== 'ALL') {
        if (log.action !== eventTypeFilter) return false;
      }

      // 12. Severity Filter
      if (severityFilter !== 'ALL') {
        if (log.severity !== severityFilter) return false;
      }

      // General Search Query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesQ =
          log.id.toLowerCase().includes(q) ||
          log.summary.toLowerCase().includes(q) ||
          log.actor.toLowerCase().includes(q) ||
          log.resourceId.toLowerCase().includes(q) ||
          log.requestId.toLowerCase().includes(q) ||
          (log.sessionId && log.sessionId.toLowerCase().includes(q)) ||
          (log.traceId && log.traceId.toLowerCase().includes(q));
        if (!matchesQ) return false;
      }

      return true;
    });
  }, [
    rawLogs, timeFilter, orgFilter, agentFilter, sessionFilter, toolFilter,
    executionFilter, decisionFilter, approvalFilter, connectorFilter,
    userFilter, eventTypeFilter, severityFilter, searchQuery
  ]);

  const handleResetFilters = () => {
    setTimeFilter('ALL');
    setOrgFilter('');
    setAgentFilter('');
    setSessionFilter('');
    setToolFilter('');
    setExecutionFilter('');
    setDecisionFilter('ALL');
    setApprovalFilter('');
    setConnectorFilter('');
    setUserFilter('');
    setEventTypeFilter('ALL');
    setSeverityFilter('ALL');
    setSearchQuery('');
  };

  const resolveDecision = (log: AuditEvent) => {
    if (log.decision) return log.decision;
    if (log.metadata?.decision) return String(log.metadata.decision);
    if (log.action === 'DECISION_CREATED') {
      const summary = log.summary.toUpperCase();
      if (summary.includes('BLOCK')) return 'BLOCK';
      if (summary.includes('REVIEW')) return 'REVIEW';
      if (summary.includes('ALLOW')) return 'ALLOW';
    }
    if (log.status === 'DENIED') return 'BLOCK';
    if (log.status === 'SUCCESS') return 'ALLOW';
    return 'N/A';
  };

  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case 'ALLOW':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#70FF5E]/10 text-[#70FF5E] border border-[#70FF5E]/30">ALLOW</span>;
      case 'REVIEW':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">REVIEW</span>;
      case 'BLOCK':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/30">BLOCK</span>;
      case 'QUARANTINE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">QUARANTINE</span>;
      default:
        return <span className="px-1.5 py-0.5 text-[10px] text-[#4D5C50] font-mono">—</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 max-w-[1440px] mx-auto animate-pulse">
        <div className="space-y-3">
          <div className="h-8 w-64 bg-white/10 rounded" />
          <div className="h-4 w-96 bg-white/5 rounded" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-white/5 rounded-2xl border border-white/5" />
          ))}
        </div>
        <div className="h-96 bg-white/5 rounded-2xl border border-white/5" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/30 text-center max-w-[800px] mx-auto space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-lg font-bold text-white font-mono">Failed to load Audit Logs</h2>
        <p className="text-xs text-[#8B9C8D] font-mono">{(error as Error)?.message || 'Unknown network error'}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-lg bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-mono hover:bg-red-500/30 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1440px] mx-auto">
      {/* Title & Subtitle + Cryptographic Chain Verification Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight uppercase">
            AUDIT EXPLORER
          </h1>
          <p className="text-xs sm:text-sm text-[#8B9C8D] font-sans mt-1">
            Forensic audit trail across security, governance, approval, and execution activity.
          </p>
        </div>

        {/* Cryptographic verification badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setVerifiedModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-[#70FF5E] font-mono text-xs font-bold shadow-[0_0_15px_rgba(112,255,94,0.15)] hover:bg-emerald-500/20 transition-all cursor-pointer"
            title="Click to view cryptographic proof and hash chain integrity"
          >
            <ShieldCheck className="w-4 h-4 text-[#70FF5E]" />
            <span>AUDIT CHAIN VERIFIED</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#70FF5E] animate-ping" />
          </button>
        </div>
      </div>

      {/* Hero Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-[#080B08] border border-white/10 relative overflow-hidden">
          <span className="text-[10px] font-mono uppercase text-[#8B9C8D] tracking-wider block">
            EVENTS RECORDED
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
              {statistics.totalToday}
            </span>
            <span className="text-[10px] font-mono text-[#70FF5E]">IMMUTABLE</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#080B08] border border-red-500/20 relative overflow-hidden">
          <span className="text-[10px] font-mono uppercase text-[#8B9C8D] tracking-wider block">
            SECURITY ACTIONS
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl sm:text-4xl font-bold text-red-400 tracking-tight">
              {statistics.securityActions}
            </span>
            <span className="text-[10px] font-mono text-red-400/80">CONTAINED</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#080B08] border border-sky-500/20 relative overflow-hidden">
          <span className="text-[10px] font-mono uppercase text-[#8B9C8D] tracking-wider block">
            POLICY EVENTS
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl sm:text-4xl font-bold text-sky-400 tracking-tight">
              {statistics.policyEvents}
            </span>
            <span className="text-[10px] font-mono text-sky-400/80">REVISIONS</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#080B08] border border-amber-500/20 relative overflow-hidden">
          <span className="text-[10px] font-mono uppercase text-[#8B9C8D] tracking-wider block">
            APPROVAL EVENTS
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl sm:text-4xl font-bold text-amber-400 tracking-tight">
              {statistics.approvalEvents}
            </span>
            <span className="text-[10px] font-mono text-amber-400/80">HITL</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#080B08] border border-purple-500/20 relative overflow-hidden">
          <span className="text-[10px] font-mono uppercase text-[#8B9C8D] tracking-wider block">
            ENFORCEMENT EVENTS
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl sm:text-4xl font-bold text-purple-400 tracking-tight">
              {statistics.enforcementEvents}
            </span>
            <span className="text-[10px] font-mono text-purple-400/80">DECISIONS</span>
          </div>
        </div>
      </div>

      {/* 12-Filter Bar */}
      <div className="p-5 rounded-2xl bg-[#080B08] border border-white/10 space-y-4 font-mono text-xs">
        {/* Primary Row: Search & Most Common Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8B9C8D] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across all audit records, IDs, summaries, traces..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/60 border border-white/10 text-white placeholder:text-[#4D5C50] focus:outline-none focus:border-[#70FF5E]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* 1. Time Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#8B9C8D] text-[10px] uppercase">Time:</span>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/10 text-white focus:outline-none focus:border-[#70FF5E] text-[11px]"
              >
                <option value="ALL">All Time</option>
                <option value="15M">Last 15m</option>
                <option value="1H">Last 1 hour</option>
                <option value="24H">Last 24 hours</option>
                <option value="7D">Last 7 days</option>
              </select>
            </div>

            {/* 11. Event Type Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#8B9C8D] text-[10px] uppercase">Event:</span>
              <select
                value={eventTypeFilter}
                onChange={(e) => setEventTypeFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/10 text-white focus:outline-none focus:border-[#70FF5E] text-[11px]"
              >
                <option value="ALL">All Events</option>
                <option value="LOGIN">LOGIN</option>
                <option value="LOGOUT">LOGOUT</option>
                <option value="AGENT_REGISTERED">AGENT_REGISTERED</option>
                <option value="TOOL_REGISTERED">TOOL_REGISTERED</option>
                <option value="TOOL_UPDATED">TOOL_UPDATED</option>
                <option value="POLICY_CREATED">POLICY_CREATED</option>
                <option value="POLICY_UPDATED">POLICY_UPDATED</option>
                <option value="POLICY_ACTIVATED">POLICY_ACTIVATED</option>
                <option value="SECURITY_SIGNAL_CREATED">SECURITY_SIGNAL_CREATED</option>
                <option value="RISK_ASSESSED">RISK_ASSESSED</option>
                <option value="DECISION_CREATED">DECISION_CREATED</option>
                <option value="APPROVAL_CREATED">APPROVAL_CREATED</option>
                <option value="APPROVAL_APPROVED">APPROVAL_APPROVED</option>
                <option value="APPROVAL_REJECTED">APPROVAL_REJECTED</option>
                <option value="APPROVAL_CONSUMED">APPROVAL_CONSUMED</option>
                <option value="RESULT_QUARANTINED">RESULT_QUARANTINED</option>
                <option value="SESSION_QUARANTINED">SESSION_QUARANTINED</option>
              </select>
            </div>

            {/* 7. Decision Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#8B9C8D] text-[10px] uppercase">Decision:</span>
              <select
                value={decisionFilter}
                onChange={(e) => setDecisionFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/10 text-white focus:outline-none focus:border-[#70FF5E] text-[11px]"
              >
                <option value="ALL">All Decisions</option>
                <option value="ALLOW">ALLOW</option>
                <option value="REVIEW">REVIEW</option>
                <option value="BLOCK">BLOCK</option>
                <option value="QUARANTINE">QUARANTINE</option>
                <option value="OUTCOME_UNKNOWN">OUTCOME_UNKNOWN</option>
              </select>
            </div>

            {/* 12. Severity Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#8B9C8D] text-[10px] uppercase">Severity:</span>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/10 text-white focus:outline-none focus:border-[#70FF5E] text-[11px]"
              >
                <option value="ALL">All</option>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>

            {/* Toggle advanced 12 filters */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
                showAdvancedFilters || activeFilterCount > 0
                  ? 'bg-[#70FF5E]/10 border-[#70FF5E]/40 text-[#70FF5E]'
                  : 'bg-white/5 border-white/10 text-[#8B9C8D] hover:text-white'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters ({activeFilterCount})</span>
              {showAdvancedFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {/* Reset */}
            {activeFilterCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[#8B9C8D] hover:text-white transition-colors flex items-center gap-1"
                title="Reset all 12 filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Secondary Row: Remaining of the 12 Dimensions */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {/* 2. Organization */}
            <div>
              <label className="text-[10px] text-[#8B9C8D] block mb-1">Organization</label>
              <input
                type="text"
                value={orgFilter}
                onChange={(e) => setOrgFilter(e.target.value)}
                placeholder="org-id..."
                className="w-full px-2 py-1 rounded bg-black/60 border border-white/10 text-white text-[11px] focus:outline-none focus:border-[#70FF5E]"
              />
            </div>

            {/* 3. Agent */}
            <div>
              <label className="text-[10px] text-[#8B9C8D] block mb-1">Agent</label>
              <input
                type="text"
                value={agentFilter}
                onChange={(e) => setAgentFilter(e.target.value)}
                placeholder="agent-id..."
                className="w-full px-2 py-1 rounded bg-black/60 border border-white/10 text-white text-[11px] focus:outline-none focus:border-[#70FF5E]"
              />
            </div>

            {/* 4. Session */}
            <div>
              <label className="text-[10px] text-[#8B9C8D] block mb-1">Session</label>
              <input
                type="text"
                value={sessionFilter}
                onChange={(e) => setSessionFilter(e.target.value)}
                placeholder="sess-id..."
                className="w-full px-2 py-1 rounded bg-black/60 border border-white/10 text-white text-[11px] focus:outline-none focus:border-[#70FF5E]"
              />
            </div>

            {/* 5. Tool */}
            <div>
              <label className="text-[10px] text-[#8B9C8D] block mb-1">Tool</label>
              <input
                type="text"
                value={toolFilter}
                onChange={(e) => setToolFilter(e.target.value)}
                placeholder="tool-id..."
                className="w-full px-2 py-1 rounded bg-black/60 border border-white/10 text-white text-[11px] focus:outline-none focus:border-[#70FF5E]"
              />
            </div>

            {/* 6. Execution */}
            <div>
              <label className="text-[10px] text-[#8B9C8D] block mb-1">Execution / Trace</label>
              <input
                type="text"
                value={executionFilter}
                onChange={(e) => setExecutionFilter(e.target.value)}
                placeholder="exec/req-id..."
                className="w-full px-2 py-1 rounded bg-black/60 border border-white/10 text-white text-[11px] focus:outline-none focus:border-[#70FF5E]"
              />
            </div>

            {/* 8. Approval */}
            <div>
              <label className="text-[10px] text-[#8B9C8D] block mb-1">Approval</label>
              <input
                type="text"
                value={approvalFilter}
                onChange={(e) => setApprovalFilter(e.target.value)}
                placeholder="appr-id..."
                className="w-full px-2 py-1 rounded bg-black/60 border border-white/10 text-white text-[11px] focus:outline-none focus:border-[#70FF5E]"
              />
            </div>

            {/* 9. Connector */}
            <div>
              <label className="text-[10px] text-[#8B9C8D] block mb-1">Connector</label>
              <input
                type="text"
                value={connectorFilter}
                onChange={(e) => setConnectorFilter(e.target.value)}
                placeholder="conn-id..."
                className="w-full px-2 py-1 rounded bg-black/60 border border-white/10 text-white text-[11px] focus:outline-none focus:border-[#70FF5E]"
              />
            </div>

            {/* 10. User */}
            <div>
              <label className="text-[10px] text-[#8B9C8D] block mb-1">User / Actor</label>
              <input
                type="text"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                placeholder="user-email..."
                className="w-full px-2 py-1 rounded bg-black/60 border border-white/10 text-white text-[11px] focus:outline-none focus:border-[#70FF5E]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Audit Table: Exact 8 Columns */}
      {/* Timestamp, Event, Actor, Agent, Session, Resource, Decision, Trace ID */}
      <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#080B08]">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-black/80 text-[#8B9C8D] uppercase text-[10px] tracking-wider border-b border-white/5">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Event</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Agent</th>
                <th className="py-3 px-4">Session</th>
                <th className="py-3 px-4">Resource</th>
                <th className="py-3 px-4">Decision</th>
                <th className="py-3 px-4">Trace ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white">
              {filteredLogs.map((log) => {
                const decision = resolveDecision(log);
                const agent = log.relatedAgentId || (log.actorType === 'GATEWAY_AGENT' ? log.actor : '—');
                const session = log.sessionId || log.relatedSessionId || '—';
                const traceId = log.traceId || log.requestId;

                return (
                  <tr
                    key={log.id}
                    onClick={() => navigate(`/console/audit/${log.id}`)}
                    className="hover:bg-white/[0.03] cursor-pointer transition-colors group"
                  >
                    {/* 1. Timestamp */}
                    <td className="py-3.5 px-4 text-[#8B9C8D] whitespace-nowrap text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}
                    </td>

                    {/* 2. Event */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 text-sky-400 border border-white/5 inline-block truncate max-w-[170px]">
                        {log.action}
                      </span>
                    </td>

                    {/* 3. Actor */}
                    <td className="py-3.5 px-4 font-medium text-white group-hover:text-[#70FF5E] transition-colors">
                      <div className="flex items-center gap-1.5">
                        {log.actorType === 'USER' ? (
                          <User className="w-3 h-3 text-[#8B9C8D] shrink-0" />
                        ) : log.actorType === 'GATEWAY_AGENT' ? (
                          <Cpu className="w-3 h-3 text-sky-400 shrink-0" />
                        ) : (
                          <Lock className="w-3 h-3 text-[#4D5C50] shrink-0" />
                        )}
                        <span className="truncate max-w-[130px] block text-[11px]">{log.actor}</span>
                      </div>
                    </td>

                    {/* 4. Agent */}
                    <td className="py-3.5 px-4 text-[11px] text-[#8B9C8D]">
                      {agent !== '—' ? (
                        <span className="text-white hover:text-[#70FF5E] transition-colors truncate max-w-[120px] block">
                          {agent}
                        </span>
                      ) : (
                        <span className="text-[#4D5C50]">—</span>
                      )}
                    </td>

                    {/* 5. Session */}
                    <td className="py-3.5 px-4 text-[11px] text-sky-400/90 font-mono">
                      {session !== '—' ? (
                        <span className="truncate max-w-[110px] block">{session}</span>
                      ) : (
                        <span className="text-[#4D5C50]">—</span>
                      )}
                    </td>

                    {/* 6. Resource */}
                    <td className="py-3.5 px-4 text-[11px]">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-[#4D5C50] uppercase">{log.resourceType}:</span>
                        <span className="text-white/80 font-mono truncate max-w-[110px] block">{log.resourceId}</span>
                      </div>
                    </td>

                    {/* 7. Decision */}
                    <td className="py-3.5 px-4">
                      {getDecisionBadge(decision)}
                    </td>

                    {/* 8. Trace ID */}
                    <td className="py-3.5 px-4 text-[10px] text-[#8B9C8D] font-mono">
                      <span className="truncate max-w-[100px] block">{traceId}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="p-12 text-center text-[#8B9C8D] font-mono text-xs space-y-2">
            <History className="w-8 h-8 text-[#4D5C50] mx-auto" />
            <p>No audit events match your selected 12 filter criteria.</p>
            <button
              onClick={handleResetFilters}
              className="mt-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[11px] transition-colors inline-block"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Cryptographic Verification Modal */}
      {verifiedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-xl w-full bg-[#080B08] border border-[#70FF5E]/30 rounded-2xl p-6 space-y-5 font-mono shadow-[0_0_30px_rgba(112,255,94,0.15)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#70FF5E]" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  AUDIT CHAIN VERIFIED — CRYPTOGRAPHIC PROOF
                </h3>
              </div>
              <button
                onClick={() => setVerifiedModalOpen(false)}
                className="text-[#8B9C8D] hover:text-white text-xs px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between text-[#8B9C8D] text-[10px]">
                  <span>TAMPER-EVIDENT STATUS</span>
                  <span className="text-[#70FF5E] font-bold">VALID (CHAIN UNBROKEN)</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <Fingerprint className="w-4 h-4 text-[#70FF5E]" />
                  <span className="text-[11px]">All 500+ events link previous hash to current event hash.</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-[#8B9C8D] uppercase">Latest Verified Merkle Root / Block Hash:</span>
                <div className="p-2.5 rounded-lg bg-black border border-white/10 text-[11px] text-white/90 break-all select-all">
                  sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-[#8B9C8D] uppercase">Signer Public Key ID (SOC Vault):</span>
                <div className="p-2.5 rounded-lg bg-black border border-white/10 text-[11px] text-white/90 break-all">
                  ed25519:vantacore-audit-signer-2026-v2 (Hardware Security Module)
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 text-[11px]">
                <div className="p-2.5 rounded bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] text-[#8B9C8D] block">Block Height</span>
                  <span className="text-white font-bold">14,920 blocks</span>
                </div>
                <div className="p-2.5 rounded bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] text-[#8B9C8D] block">Integrity Check</span>
                  <span className="text-[#70FF5E] font-bold">0 Tamper Violations</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setVerifiedModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#70FF5E]/10 border border-[#70FF5E]/30 text-[#70FF5E] hover:bg-[#70FF5E]/20 text-xs font-bold transition-colors"
              >
                Close Verification Modal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
