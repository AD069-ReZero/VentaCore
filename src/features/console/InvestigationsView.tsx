/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * VantaCore Investigations View
 * Route: /console/investigations
 * Unified investigation workspace cataloging cross-subsystem incident cases.
 */

import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Flame,
  Search,
  Filter,
  ShieldAlert,
  ArrowRight,
  User,
  Clock,
  Layers,
  GitBranch,
  Scale,
  RotateCcw,
  Sparkles,
  Tag,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { useInvestigations } from '../../api';
import { Incident, IncidentStatus, RiskLevel } from '../../types/security';
import { RiskBadge, DecisionBadge } from '../../components/common/SecurityBadges';

export const InvestigationsView: React.FC = () => {
  const navigate = useNavigate();
  const { data: incidents = [], isLoading, isError, error } = useInvestigations();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [analystFilter, setAnalystFilter] = useState<string>('ALL');

  // Large editorial metrics
  const metrics = useMemo(() => {
    const total = incidents.length;
    const active = incidents.filter((i) => i.status === 'INVESTIGATING' || i.status === 'OPEN').length;
    const critical = incidents.filter((i) => i.severity === 'CRITICAL').length;
    const contained = incidents.filter((i) => i.status === 'CONTAINED').length;
    const resolved = incidents.filter((i) => i.status === 'RESOLVED' || i.status === 'FALSE_POSITIVE').length;

    return { total, active, critical, contained, resolved };
  }, [incidents]);

  // Unique analysts
  const analysts = useMemo(() => {
    const set = new Set(incidents.map((i) => i.assignedAnalyst).filter(Boolean));
    return Array.from(set);
  }, [incidents]);

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        inc.id.toLowerCase().includes(q) ||
        inc.title.toLowerCase().includes(q) ||
        inc.agentName.toLowerCase().includes(q) ||
        inc.sessionId.toLowerCase().includes(q) ||
        inc.summary.toLowerCase().includes(q) ||
        inc.tags.some((t) => t.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'ALL' || inc.status === statusFilter;
      const matchesSeverity = severityFilter === 'ALL' || inc.severity === severityFilter;
      const matchesAnalyst = analystFilter === 'ALL' || inc.assignedAnalyst === analystFilter;

      return matchesSearch && matchesStatus && matchesSeverity && matchesAnalyst;
    });
  }, [incidents, searchQuery, statusFilter, severityFilter, analystFilter]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setSeverityFilter('ALL');
    setAnalystFilter('ALL');
  };

  const getStatusBadge = (status: IncidentStatus) => {
    switch (status) {
      case 'INVESTIGATING':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>INVESTIGATING</span>
          </span>
        );
      case 'CONTAINED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
            CONTAINED
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-[#70FF5E] border border-emerald-500/30">
            RESOLVED
          </span>
        );
      case 'FALSE_POSITIVE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/5 text-[#8B9C8D] border border-white/10">
            FALSE POSITIVE
          </span>
        );
      case 'OPEN':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span>OPEN</span>
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 max-w-[1440px] mx-auto animate-pulse">
        <div className="space-y-3">
          <div className="h-8 w-64 bg-white/10 rounded" />
          <div className="h-4 w-96 bg-white/5 rounded" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white/5 rounded-2xl border border-white/5" />
          ))}
        </div>
        <div className="h-96 bg-white/5 rounded-2xl border border-white/5" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/30 text-center max-w-[800px] mx-auto space-y-4 font-mono">
        <ShieldAlert className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Failed to load Investigations</h2>
        <p className="text-xs text-[#8B9C8D]">{(error as Error)?.message || 'Unknown network error'}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-lg bg-red-500/20 text-red-300 border border-red-500/40 text-xs hover:bg-red-500/30 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1440px] mx-auto">
      {/* Title & Top Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight uppercase flex items-center gap-3">
            <span>INVESTIGATIONS</span>
            <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-xs font-semibold">
              CASE MANAGEMENT
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#8B9C8D] font-sans mt-1">
            Correlate agent identities, execution sessions, attack chains, and zero-trust arbitration into cohesive forensic cases.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/console/investigations/inc-exfil-001"
            className="px-4 py-2 rounded-xl bg-[#70FF5E] text-black font-mono text-xs font-bold hover:bg-[#5ce64c] transition-colors flex items-center gap-2 shadow-lg shadow-[#70FF5E]/10"
          >
            <Flame className="w-4 h-4 fill-black" />
            <span>Open Canonical INC-0042</span>
          </Link>
        </div>
      </div>

      {/* Large Editorial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#140808] to-[#080404] border border-red-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between text-[#8B9C8D] text-xs uppercase tracking-wider">
            <span>ACTIVE INCIDENTS</span>
            <Flame className="w-4 h-4 text-red-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-display text-4xl sm:text-5xl font-bold text-red-400 tracking-tight">
              {metrics.active}
            </span>
            <span className="text-xs text-red-400/80">IN PROGRESS</span>
          </div>
          <p className="mt-2 text-[11px] text-[#4D5C50]">
            Open or actively investigating triage cases
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#120D08] to-[#080604] border border-amber-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between text-[#8B9C8D] text-xs uppercase tracking-wider">
            <span>CRITICAL SEVERITY</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-display text-4xl sm:text-5xl font-bold text-amber-400 tracking-tight">
              {metrics.critical}
            </span>
            <span className="text-xs text-amber-400/80">HIGH PRIORITY</span>
          </div>
          <p className="mt-2 text-[11px] text-[#4D5C50]">
            High-entropy credential & injection threats
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#120814] to-[#060408] border border-purple-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between text-[#8B9C8D] text-xs uppercase tracking-wider">
            <span>CONTAINED</span>
            <ShieldAlert className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-display text-4xl sm:text-5xl font-bold text-purple-400 tracking-tight">
              {metrics.contained}
            </span>
            <span className="text-xs text-purple-400/80">ISOLATED</span>
          </div>
          <p className="mt-2 text-[11px] text-[#4D5C50]">
            Sockets severed and payload held in quarantine
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#08120A] to-[#040805] border border-emerald-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between text-[#8B9C8D] text-xs uppercase tracking-wider">
            <span>RESOLVED CASES</span>
            <CheckCircle2 className="w-4 h-4 text-[#70FF5E]" />
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-display text-4xl sm:text-5xl font-bold text-[#70FF5E] tracking-tight">
              {metrics.resolved}
            </span>
            <span className="text-xs text-[#70FF5E]/80">CLOSED</span>
          </div>
          <p className="mt-2 text-[11px] text-[#4D5C50]">
            Triage concluded with signed audit disposition
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-[#080B08] border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 font-mono text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8B9C8D] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search incidents by ID, title, agent, session, summary, or tag (e.g. EXFILTRATION)..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/60 border border-white/10 text-white placeholder:text-[#4D5C50] focus:outline-none focus:border-[#70FF5E]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[#8B9C8D] text-[11px] uppercase">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-white focus:outline-none focus:border-[#70FF5E]"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="INVESTIGATING">Investigating</option>
              <option value="CONTAINED">Contained</option>
              <option value="RESOLVED">Resolved</option>
              <option value="FALSE_POSITIVE">False Positive</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#8B9C8D] text-[11px] uppercase">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-white focus:outline-none focus:border-[#70FF5E]"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#8B9C8D] text-[11px] uppercase">Analyst:</span>
            <select
              value={analystFilter}
              onChange={(e) => setAnalystFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-white focus:outline-none focus:border-[#70FF5E]"
            >
              <option value="ALL">All Analysts</option>
              {analysts.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleResetFilters}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[#8B9C8D] hover:text-white transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#080B08]">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-black/80 text-[#8B9C8D] uppercase text-[10px] tracking-wider border-b border-white/5">
              <tr>
                <th className="py-3 px-4">Incident ID</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Agent</th>
                <th className="py-3 px-4">Sessions</th>
                <th className="py-3 px-4">Start Time</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4 text-right">Assigned Analyst</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white">
              {filteredIncidents.map((inc) => (
                <tr
                  key={inc.id}
                  onClick={() => navigate(`/console/investigations/${inc.id}`)}
                  className="hover:bg-white/[0.03] cursor-pointer transition-colors group"
                >
                  <td className="py-4 px-4 font-bold text-white group-hover:text-[#70FF5E] transition-colors whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{inc.id}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-bold text-white max-w-[280px] truncate">{inc.title}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {inc.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.2 rounded text-[9px] bg-white/5 border border-white/10 text-[#8B9C8D]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <RiskBadge risk={inc.severity} size="sm" />
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">{getStatusBadge(inc.status)}</td>
                  <td className="py-4 px-4 text-sky-400 whitespace-nowrap">{inc.agentName}</td>
                  <td className="py-4 px-4 text-emerald-400/90 whitespace-nowrap">{inc.sessionId}</td>
                  <td className="py-4 px-4 text-[#8B9C8D] text-[11px] whitespace-nowrap">
                    {new Date(inc.createdAt).toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-[#8B9C8D] text-[11px] whitespace-nowrap">
                    {new Date(inc.updatedAt).toLocaleTimeString()}
                  </td>
                  <td className="py-4 px-4 text-right text-white/90 whitespace-nowrap">
                    {inc.assignedAnalyst || 'Unassigned'}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

        {filteredIncidents.length === 0 && (
          <div className="p-12 text-center text-[#8B9C8D] font-mono text-xs space-y-2">
            <Flame className="w-8 h-8 text-[#4D5C50] mx-auto" />
            <p>No incidents match your selected filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};
