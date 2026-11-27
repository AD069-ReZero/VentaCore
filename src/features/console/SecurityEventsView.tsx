/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * VantaCore Security Events Module
 * Route: /console/events
 * Real-time event stream, Live Security Pulse pipeline, filtering, and animated investigation drawer.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  Search,
  Filter,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Activity,
  ArrowRight,
  Shield,
  Layers,
  Bot,
  ExternalLink,
  X,
  Code,
  Copy,
  Check,
  ChevronRight,
  Radio,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useSecurityEvents, useLiveSimulation } from '../../api';
import {
  RiskBadge,
  DecisionBadge,
} from '../../components/common/SecurityBadges';
import { maskSensitiveValues } from '../../lib/enforcementLogic';
import { SessionEvent, RiskLevel, Decision, SessionEventType } from '../../types/security';

export const SecurityEventsView: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { eventId } = useParams<{ eventId?: string }>();
  const { data: events = [], isLoading, isError, error } = useSecurityEvents();
  const {
    isRunning,
    currentStage,
    stepIncident,
    resetIncident,
    toggleRunning,
    runReviewLifecycle,
    runQuarantineLifecycle,
  } = useLiveSimulation(false);

  // Drawer state
  const [selectedEvent, setSelectedEvent] = useState<SessionEvent | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Deep-link auto open event from URL param
  useEffect(() => {
    if (eventId && events.length > 0) {
      const found = events.find((e) => e.id === eventId);
      if (found) {
        setSelectedEvent(found);
      }
    }
  }, [eventId, events]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [agentFilter, setAgentFilter] = useState<string>('ALL');
  const [decisionFilter, setDecisionFilter] = useState<string>('ALL');

  // Computed metrics
  const stats = useMemo(() => {
    const total = events.length;
    const critical = events.filter((e) => (e.severity || e.risk) === 'CRITICAL').length;
    const high = events.filter((e) => (e.severity || e.risk) === 'HIGH').length;
    const blocked = events.filter((e) => e.decision === 'BLOCK' || e.type === 'BLOCK').length;
    const activeChains = new Set(events.map((e) => e.attackChainId).filter(Boolean)).size;
    return { total, critical, high, blocked, activeChains };
  }, [events]);

  // Filtered event list
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const risk = evt.severity || evt.risk;
      if (severityFilter !== 'ALL' && risk !== severityFilter) return false;
      if (typeFilter !== 'ALL' && evt.type !== typeFilter) return false;
      if (agentFilter !== 'ALL' && (evt.agent || evt.agentName) !== agentFilter) return false;
      if (decisionFilter !== 'ALL' && evt.decision !== decisionFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          evt.id.toLowerCase().includes(q) ||
          evt.label.toLowerCase().includes(q) ||
          (evt.agent || '').toLowerCase().includes(q) ||
          (evt.tool || evt.toolName || '').toLowerCase().includes(q) ||
          (evt.resource || '').toLowerCase().includes(q) ||
          (evt.details || '').toLowerCase().includes(q) ||
          (evt.detector || '').toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [events, severityFilter, typeFilter, agentFilter, decisionFilter, searchQuery]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  // Top active event for the Live Pulse pipeline
  const latestEvent = events[0];

  return (
    <div className="space-y-8 max-w-[1500px] mx-auto pb-12 antialiased">
      {/* 1. Header Section with Editorial Stats */}
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-2 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#70FF5E] shadow-[0_0_10px_#70FF5E]" />
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-[#70FF5E]">
                TELEMETRY & INGESTION BROKER
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              SECURITY EVENTS
            </h1>
            <p className="text-xs sm:text-sm text-[#8B9C8D] font-sans mt-1 max-w-2xl">
              Observe suspicious activity, security signals, and enforcement events across AI-agent sessions in real time.
            </p>
          </div>

          {/* Quick simulator status indicator */}
          <div className="flex items-center gap-3 self-start lg:self-auto font-mono text-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-white">
              <Radio className={`w-3.5 h-3.5 ${isRunning ? 'text-[#70FF5E] animate-pulse' : 'text-[#8B9C8D]'}`} />
              <span>Sim: {isRunning ? 'ACTIVE' : 'IDLE'}</span>
              <span className="text-[10px] text-[#70FF5E] bg-[#70FF5E]/10 px-1.5 py-0.5 rounded border border-[#70FF5E]/20">
                {currentStage.stageName}
              </span>
            </div>
          </div>
        </div>

        {/* Large Editorial Statistics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="p-5 rounded-2xl bg-[#080B08] border border-white/10 hover:border-white/20 transition-all">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#8B9C8D]">
              EVENTS TODAY
            </div>
            <div className="font-display text-3xl sm:text-4xl font-bold text-white mt-1">
              {stats.total.toLocaleString()}
            </div>
            <div className="text-[10px] font-mono text-[#70FF5E] mt-1 flex items-center gap-1">
              <span>● Ingestion Healthy</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#080B08] border border-white/10 hover:border-red-500/30 transition-all">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#8B9C8D]">
              CRITICAL
            </div>
            <div className="font-display text-3xl sm:text-4xl font-bold text-red-500 mt-1">
              {stats.critical}
            </div>
            <div className="text-[10px] font-mono text-red-400 mt-1">Immediate Isolation</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#080B08] border border-white/10 hover:border-amber-500/30 transition-all">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#8B9C8D]">
              HIGH
            </div>
            <div className="font-display text-3xl sm:text-4xl font-bold text-[#F59E0B] mt-1">
              {stats.high}
            </div>
            <div className="text-[10px] font-mono text-amber-400 mt-1">Review Holds Active</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#080B08] border border-white/10 hover:border-red-500/30 transition-all">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#8B9C8D]">
              BLOCKED
            </div>
            <div className="font-display text-3xl sm:text-4xl font-bold text-red-400 mt-1">
              {stats.blocked}
            </div>
            <div className="text-[10px] font-mono text-[#70FF5E] mt-1">Perimeter Severed</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#080B08] border border-white/10 hover:border-[#70FF5E]/30 transition-all col-span-2 sm:col-span-1">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#8B9C8D]">
              ACTIVE CHAINS
            </div>
            <div className="font-display text-3xl sm:text-4xl font-bold text-[#70FF5E] mt-1">
              {stats.activeChains}
            </div>
            <div className="text-[10px] font-mono text-[#8B9C8D] mt-1">Correlated Vectors</div>
          </div>
        </div>
      </div>

      {/* 2. SIMULATED SECURITY PULSE Visual Pipeline Section */}
      <div className="p-6 rounded-2xl bg-[#080B08] border border-white/10 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <Activity className="w-4 h-4 text-[#70FF5E] animate-pulse" />
            <h2 className="font-mono text-sm font-bold tracking-wider text-white uppercase">
              SIMULATED SECURITY PULSE
            </h2>
            <span className="text-[10px] font-mono text-[#8B9C8D] bg-white/5 px-2 py-0.5 rounded">
              FRONTEND SIMULATION
            </span>
          </div>

          {/* Interactive Simulator Controls */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <button
              onClick={() => runReviewLifecycle('approval-review-001')}
              title="Simulate canonical REVIEW lifecycle (finance-agent-01 / db-admin)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[11px] transition-colors"
            >
              <span>Simulate Review</span>
            </button>

            <button
              onClick={() => runQuarantineLifecycle('result-unsafe-001')}
              title="Simulate canonical QUARANTINE lifecycle (research-agent-01 / web-fetch)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-[11px] transition-colors"
            >
              <span>Simulate Quarantine</span>
            </button>

            <button
              onClick={toggleRunning}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                isRunning
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : 'bg-[#0E1710] border-[#70FF5E]/40 text-[#70FF5E] hover:bg-[#70FF5E]/10 shadow-[0_0_12px_rgba(112,255,94,0.15)]'
              }`}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isRunning ? 'Pause Sim' : 'Play Sim'}</span>
            </button>

            <button
              onClick={stepIncident}
              title="Trigger next incident progression stage"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#EDEDED] transition-colors"
            >
              <FastForward className="w-3.5 h-3.5 text-[#70FF5E]" />
              <span>Step Stage</span>
            </button>

            <button
              onClick={resetIncident}
              title="Reset incident stages"
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#8B9C8D] hover:text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Visual Pipeline Track: Agent → Tool → Signal → Risk → Decision */}
        <div className="mt-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
            {/* Step 1: Agent */}
            <div className="p-4 rounded-xl bg-black/50 border border-white/10 flex flex-col justify-between min-h-[92px]">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#8B9C8D] uppercase">
                <span>01. AGENT</span>
                <Bot className="w-3.5 h-3.5 text-[#70FF5E]" />
              </div>
              <div className="font-mono text-xs font-bold text-white truncate mt-1">
                {latestEvent?.agent || latestEvent?.agentName || 'research-agent-01'}
              </div>
              <div className="text-[10px] font-mono text-[#4D5C50] truncate">
                Identity Verified
              </div>
            </div>

            {/* Step 2: Tool */}
            <div className="p-4 rounded-xl bg-black/50 border border-white/10 flex flex-col justify-between min-h-[92px]">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#8B9C8D] uppercase">
                <span>02. TOOL ACTION</span>
                <span className="text-[#38BDF8] text-xs">∇</span>
              </div>
              <div className="font-mono text-xs font-bold text-[#38BDF8] truncate mt-1">
                {latestEvent?.tool || latestEvent?.toolName || 'file.read'}
              </div>
              <div className="text-[10px] font-mono text-[#4D5C50] truncate">
                {latestEvent?.operation || 'fs.read_restricted'}
              </div>
            </div>

            {/* Step 3: Signal */}
            <div className="p-4 rounded-xl bg-black/50 border border-white/10 flex flex-col justify-between min-h-[92px]">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#8B9C8D] uppercase">
                <span>03. DETECTOR SIGNAL</span>
                <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />
              </div>
              <div className="font-mono text-xs font-bold text-[#F59E0B] truncate mt-1">
                {latestEvent?.signal || latestEvent?.type || 'PROMPT_INJECTION'}
              </div>
              <div className="text-[10px] font-mono text-[#4D5C50] truncate">
                {latestEvent?.detector || 'SemanticTaintEngine'}
              </div>
            </div>

            {/* Step 4: Risk */}
            <div className="p-4 rounded-xl bg-black/50 border border-white/10 flex flex-col justify-between min-h-[92px]">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#8B9C8D] uppercase">
                <span>04. RISK EVALUATION</span>
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              </div>
              <div className="font-mono text-xs font-bold text-red-400 mt-1 flex items-center gap-1.5">
                <RiskBadge risk={latestEvent?.severity || latestEvent?.risk || 'CRITICAL'} size="sm" />
              </div>
              <div className="text-[10px] font-mono text-[#4D5C50] truncate">
                Score: 96 / 100
              </div>
            </div>

            {/* Step 5: Decision */}
            <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/40 flex flex-col justify-between min-h-[92px] shadow-[0_0_15px_rgba(239,68,68,0.15)]">
              <div className="flex items-center justify-between text-[10px] font-mono text-red-300 uppercase">
                <span>05. FINAL DECISION</span>
                <Shield className="w-3.5 h-3.5 text-red-400" />
              </div>
              <div className="font-mono text-sm font-extrabold text-red-400 mt-1">
                {latestEvent?.decision || 'BLOCK'}
              </div>
              <div className="text-[10px] font-mono text-red-400/80 truncate">
                Hard Boundary Intercept
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filter Controls Bar */}
      <div className="p-4 rounded-2xl bg-[#080B08] border border-white/10 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-[#4D5C50] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by ID, agent, tool, resource, detector, or rule..."
              className="w-full bg-[#050605] border border-white/10 rounded-xl pl-9 pr-3.5 py-2 text-xs font-mono text-white placeholder-[#4D5C50] focus:outline-none focus:border-[#70FF5E]/50 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4D5C50] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Select Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            {/* Severity Filter */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-[#050605] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-[#EDEDED] focus:outline-none focus:border-[#70FF5E]/50"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
              <option value="INFO">Info</option>
            </select>

            {/* Event Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-[#050605] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-[#EDEDED] focus:outline-none focus:border-[#70FF5E]/50"
            >
              <option value="ALL">All Event Types</option>
              <option value="PROMPT_INJECTION">Prompt Injection</option>
              <option value="UNTRUSTED_INPUT">Untrusted Input</option>
              <option value="SENSITIVE_RESOURCE_ACCESS">Sensitive Resource</option>
              <option value="EXTERNAL_EGRESS">External Egress</option>
              <option value="TOOL_REQUESTED">Tool Requested</option>
              <option value="DECISION_CREATED">Decision Created</option>
              <option value="SESSION_QUARANTINED">Session Quarantined</option>
            </select>

            {/* Agent Filter */}
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="bg-[#050605] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-[#EDEDED] focus:outline-none focus:border-[#70FF5E]/50"
            >
              <option value="ALL">All Agents</option>
              <option value="research-agent-01">research-agent-01</option>
              <option value="finance-agent-01">finance-agent-01</option>
              <option value="web-agent-01">web-agent-01</option>
              <option value="mcp-agent-01">mcp-agent-01</option>
            </select>

            {/* Decision Filter */}
            <select
              value={decisionFilter}
              onChange={(e) => setDecisionFilter(e.target.value)}
              className="bg-[#050605] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-[#EDEDED] focus:outline-none focus:border-[#70FF5E]/50"
            >
              <option value="ALL">All Decisions</option>
              <option value="BLOCK">BLOCK</option>
              <option value="REVIEW">REVIEW</option>
              <option value="ALLOW">ALLOW</option>
            </select>

            {(severityFilter !== 'ALL' ||
              typeFilter !== 'ALL' ||
              agentFilter !== 'ALL' ||
              decisionFilter !== 'ALL' ||
              searchQuery) && (
              <button
                onClick={() => {
                  setSeverityFilter('ALL');
                  setTypeFilter('ALL');
                  setAgentFilter('ALL');
                  setDecisionFilter('ALL');
                  setSearchQuery('');
                }}
                className="px-2.5 py-2 rounded-xl text-[11px] text-[#8B9C8D] hover:text-white hover:bg-white/5 transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Event Stream Table with Loading / Error / Empty States */}
      <div className="rounded-2xl bg-[#080B08] border border-white/10 overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h3 className="font-mono text-sm font-semibold text-white">
              Ingested Event Stream
            </h3>
            <span className="text-[11px] font-mono text-[#8B9C8D] bg-white/5 px-2 py-0.5 rounded">
              {filteredEvents.length} records matching
            </span>
          </div>

          <div className="text-[11px] font-mono text-[#4D5C50]">
            Click any row to open forensic inspection drawer
          </div>
        </div>

        {isLoading ? (
          /* Skeletons */
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 rounded-xl bg-white/[0.02] border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          /* Error State */
          <div className="p-12 text-center font-mono">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <div className="text-white text-sm font-bold">Failed to load event telemetry</div>
            <div className="text-xs text-[#8B9C8D] mt-1">{String(error || 'Broker timeout')}</div>
          </div>
        ) : filteredEvents.length === 0 ? (
          /* Empty State */
          <div className="p-16 text-center font-mono space-y-3">
            <Filter className="w-8 h-8 text-[#4D5C50] mx-auto" />
            <div className="text-sm font-semibold text-white">No security events match criteria</div>
            <p className="text-xs text-[#8B9C8D] max-w-sm mx-auto">
              Try adjusting your severity, event type, or keyword query, or trigger the simulation pulse above.
            </p>
          </div>
        ) : (
          /* Event Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01] text-[#8B9C8D] text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Agent</th>
                  <th className="py-3 px-4">Tool</th>
                  <th className="py-3 px-4">Resource / Destination</th>
                  <th className="py-3 px-4">Detector</th>
                  <th className="py-3 px-4">Decision</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredEvents.map((evt) => {
                  const risk = evt.severity || evt.risk;
                  const isSelected = selectedEvent?.id === evt.id;

                  return (
                    <tr
                      key={evt.id}
                      onClick={() => setSelectedEvent(evt)}
                      className={`cursor-pointer transition-colors group ${
                        isSelected
                          ? 'bg-[#0E1710] border-l-2 border-l-[#70FF5E]'
                          : 'hover:bg-white/[0.03]'
                      }`}
                    >
                      <td className="py-3.5 px-4 text-[#8B9C8D] text-[11px] whitespace-nowrap">
                        {evt.timestamp}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <RiskBadge risk={risk} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-white font-medium whitespace-nowrap">
                        <span className="group-hover:text-[#70FF5E] transition-colors">
                          {evt.type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#8B9C8D] whitespace-nowrap">
                        <span className="text-[#EDEDED] font-medium">
                          {evt.agent || evt.agentName || 'research-agent-01'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#38BDF8] whitespace-nowrap">
                        {evt.tool || evt.toolName || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-[#8B9C8D] max-w-[200px] truncate">
                        {evt.resource || evt.destination || 'internal'}
                      </td>
                      <td className="py-3.5 px-4 text-[#8B9C8D] text-[11px] whitespace-nowrap">
                        {evt.detector || 'HeuristicGateway'}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {evt.decision ? (
                          <DecisionBadge decision={evt.decision} size="sm" />
                        ) : (
                          <span className="text-[10px] text-[#4D5C50]">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className="inline-flex items-center text-xs text-[#70FF5E] group-hover:translate-x-1 transition-transform">
                          Inspect →
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Animated Investigation Drawer */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-2xl bg-[#080B08] border-l border-white/10 h-full overflow-y-auto flex flex-col justify-between p-6 sm:p-8 shadow-2xl">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-start justify-between pb-4 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-[#70FF5E] tracking-widest uppercase">
                      EVENT INVESTIGATION
                    </span>
                    <span className="text-[#4D5C50]">•</span>
                    <span className="font-mono text-[11px] text-[#8B9C8D]">
                      {selectedEvent.id}
                    </span>
                  </div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {selectedEvent.label}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#8B9C8D] hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status Badges Row */}
              <div className="flex flex-wrap items-center gap-2.5">
                <RiskBadge risk={selectedEvent.severity || selectedEvent.risk} />
                {selectedEvent.decision && (
                  <DecisionBadge decision={selectedEvent.decision} />
                )}
                <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#8B9C8D]">
                  Time: {selectedEvent.timestamp}
                </span>
                {selectedEvent.confidence && (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-[#70FF5E]">
                    Confidence: {(selectedEvent.confidence * 100).toFixed(0)}%
                  </span>
                )}
              </div>

              {/* Details Paragraph */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 font-sans text-xs text-[#EDEDED] leading-relaxed">
                {selectedEvent.details}
              </div>

              {/* Metadata Fields Grid */}
              <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                  <div className="text-[10px] text-[#4D5C50] uppercase tracking-wider">Agent</div>
                  <div className="text-white font-medium mt-1">
                    {selectedEvent.agent || selectedEvent.agentName || 'research-agent-01'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                  <div className="text-[10px] text-[#4D5C50] uppercase tracking-wider">Session ID</div>
                  <div className="text-white font-medium mt-1 truncate">
                    {selectedEvent.sessionId}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                  <div className="text-[10px] text-[#4D5C50] uppercase tracking-wider">Tool</div>
                  <div className="text-[#38BDF8] font-medium mt-1">
                    {selectedEvent.tool || selectedEvent.toolName || 'system.runtime'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                  <div className="text-[10px] text-[#4D5C50] uppercase tracking-wider">Operation</div>
                  <div className="text-white font-medium mt-1">
                    {selectedEvent.operation || 'execute'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                  <div className="text-[10px] text-[#4D5C50] uppercase tracking-wider">Resource</div>
                  <div className="text-[#8B9C8D] font-medium mt-1 truncate">
                    {selectedEvent.resource || 'None'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                  <div className="text-[10px] text-[#4D5C50] uppercase tracking-wider">Destination</div>
                  <div className="text-[#8B9C8D] font-medium mt-1 truncate">
                    {selectedEvent.destination || 'internal'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                  <div className="text-[10px] text-[#4D5C50] uppercase tracking-wider">Detector</div>
                  <div className="text-amber-400 font-medium mt-1">
                    {selectedEvent.detector || 'GatewayValidator'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                  <div className="text-[10px] text-[#4D5C50] uppercase tracking-wider">Signal</div>
                  <div className="text-[#70FF5E] font-medium mt-1 truncate">
                    {selectedEvent.signal || 'TELEMETRY_RECORDED'}
                  </div>
                </div>
              </div>

              {/* Matched Rule if present */}
              {selectedEvent.ruleMatched && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 font-mono text-xs text-amber-300">
                  <div className="text-[10px] uppercase tracking-wider text-amber-400 font-bold mb-1">
                    Matched Security Policy
                  </div>
                  <div>{selectedEvent.ruleMatched}</div>
                </div>
              )}

              {/* Raw JSON Payload */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-[#8B9C8D]">
                  <span className="flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-[#70FF5E]" />
                    <span>Raw Telemetry Metadata</span>
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        maskSensitiveValues(
                          JSON.stringify(selectedEvent.rawPayload || selectedEvent, null, 2)
                        )
                      )
                    }
                    className="flex items-center gap-1 text-[11px] text-[#70FF5E] hover:underline"
                  >
                    {copiedPayload ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedPayload ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-black/80 border border-white/10 text-[11px] font-mono text-[#70FF5E] overflow-x-auto max-h-48 leading-relaxed">
                  {maskSensitiveValues(
                    JSON.stringify(selectedEvent.rawPayload || selectedEvent, null, 2)
                  )}
                </pre>
              </div>
            </div>

            {/* Navigation Actions Footer */}
            <div className="pt-6 border-t border-white/10 space-y-3 font-mono text-xs">
              <div className="text-[10px] uppercase tracking-wider text-[#4D5C50]">
                Cross-Investigation Pathways
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  onClick={() => navigate(`/console/sessions/${selectedEvent.sessionId}`)}
                  className="py-2.5 px-3 rounded-xl bg-[#0E1710] border border-[#70FF5E]/30 text-[#70FF5E] hover:bg-[#70FF5E]/10 transition-colors text-center font-medium"
                >
                  VIEW SESSION →
                </button>

                <button
                  onClick={() =>
                    navigate(
                      `/console/decisions/${selectedEvent.decisionId || 'dec-exfil-001'}`
                    )
                  }
                  className="py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors text-center font-medium"
                >
                  VIEW DECISION →
                </button>

                <button
                  onClick={() =>
                    navigate(
                      `/console/attack-chains/${selectedEvent.attackChainId || 'chain-exfil-001'}`
                    )
                  }
                  className="py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-[#38BDF8] hover:bg-[#38BDF8]/10 transition-colors text-center font-medium"
                >
                  VIEW ATTACK CHAIN →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
