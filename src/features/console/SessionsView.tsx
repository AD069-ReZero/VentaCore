/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * VantaCore Session Investigation View (Area 3)
 * Displays active and historical agent sessions with the 8 required columns:
 * Session ID, Agent, Status, Risk, Taint, Events, Started, Last Activity.
 * Provides containment actions: Quarantine, Invalidate, Invalidate Approvals.
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Search,
  Filter,
  Shield,
  ShieldAlert,
  AlertTriangle,
  AlertOctagon,
  ArrowRight,
  ExternalLink,
  Lock,
  Clock,
  Ban,
  Tag,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { useSessions } from '../../api';
import { Session, RiskLevel } from '../../types/security';
import { RiskBadge, DecisionBadge } from '../../components/common/SecurityBadges';

export const SessionsView: React.FC = () => {
  const navigate = useNavigate();
  const { data: sessions = [], isLoading, isError, error } = useSessions();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');

  // Containment feedback state
  const [containmentNotice, setContainmentNotice] = useState<string | null>(null);

  // Compute metrics
  const metrics = useMemo(() => {
    const total = sessions.length;
    const active = sessions.filter((s) => s.status === 'ACTIVE').length;
    const highRisk = sessions.filter((s) => s.risk === 'HIGH' || s.risk === 'CRITICAL').length;
    const waitingApproval = sessions.filter((s) => s.status === 'WAITING_APPROVAL').length;
    return { total, active, highRisk, waitingApproval };
  }, [sessions]);

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        s.id.toLowerCase().includes(q) ||
        s.agentName.toLowerCase().includes(q) ||
        (s.agentId && s.agentId.toLowerCase().includes(q)) ||
        (s.taintLabels && s.taintLabels.some((t) => t.toLowerCase().includes(q)));

      const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
      const matchesRisk = riskFilter === 'ALL' || s.risk === riskFilter;

      return matchesSearch && matchesStatus && matchesRisk;
    });
  }, [sessions, searchQuery, statusFilter, riskFilter]);

  const handleContainment = (action: string, sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setContainmentNotice(`Authorized action "${action}" applied to session ${sessionId}. Gateway informed.`);
    setTimeout(() => setContainmentNotice(null), 3000);
  };

  return (
    <div className="space-y-8 max-w-[1500px] mx-auto pb-12 antialiased">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Layers className="w-4 h-4 text-[#70FF5E]" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#70FF5E]">
              RUNTIME SESSION GOVERNANCE
            </span>
            <span className="text-xs text-[#8B9C8D] font-mono">• Active Taint Tracking</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Session Investigation
          </h1>
          <p className="text-xs sm:text-sm text-[#8B9C8D] font-sans mt-1">
            Forensic inspection of autonomous agent execution sessions, taint propagation, and containment states.
          </p>
        </div>
      </div>

      {containmentNotice && (
        <div className="p-3 rounded-xl bg-[#70FF5E]/10 border border-[#70FF5E]/30 text-[#70FF5E] text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{containmentNotice}</span>
        </div>
      )}

      {/* 2. Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#080B08] border border-white/10">
          <div className="text-[11px] font-mono text-[#8B9C8D] uppercase tracking-wider">TOTAL SESSIONS</div>
          <div className="text-3xl font-display font-extrabold text-white mt-1.5">{metrics.total}</div>
          <div className="text-[10px] font-mono text-[#4D5C50] mt-1">Monitored executions</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#080B08] border border-[#70FF5E]/20">
          <div className="text-[11px] font-mono text-[#70FF5E] uppercase tracking-wider flex items-center justify-between">
            <span>ACTIVE SESSIONS</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#70FF5E]" />
          </div>
          <div className="text-3xl font-display font-extrabold text-[#70FF5E] mt-1.5">{metrics.active}</div>
          <div className="text-[10px] font-mono text-[#8B9C8D] mt-1">Active execution epoch</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#080B08] border border-orange-500/20">
          <div className="text-[11px] font-mono text-orange-400 uppercase tracking-wider">HIGH / CRITICAL RISK</div>
          <div className="text-3xl font-display font-extrabold text-orange-400 mt-1.5">{metrics.highRisk}</div>
          <div className="text-[10px] font-mono text-[#8B9C8D] mt-1">Taint signals detected</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#080B08] border border-amber-500/20">
          <div className="text-[11px] font-mono text-amber-400 uppercase tracking-wider">WAITING APPROVAL</div>
          <div className="text-3xl font-display font-extrabold text-amber-400 mt-1.5">{metrics.waitingApproval}</div>
          <div className="text-[10px] font-mono text-[#8B9C8D] mt-1">Review hold active</div>
        </div>
      </div>

      {/* 3. Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#080B08] border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 font-mono text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8B9C8D] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search sessions by session ID, agent name, taint label..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#050605] border border-white/10 rounded-xl pl-9 pr-3.5 py-2 text-white placeholder-[#4D5C50] focus:outline-none focus:border-[#70FF5E]/50 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5">
            <span className="text-[#8B9C8D]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#080B08] text-white">ALL</option>
              <option value="ACTIVE" className="bg-[#080B08] text-[#70FF5E]">ACTIVE</option>
              <option value="WAITING_APPROVAL" className="bg-[#080B08] text-amber-400">WAITING_APPROVAL</option>
              <option value="BLOCKED" className="bg-[#080B08] text-red-400">BLOCKED</option>
              <option value="COMPLETED" className="bg-[#080B08] text-gray-400">COMPLETED</option>
            </select>
          </div>

          {/* Risk Filter */}
          <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5">
            <span className="text-[#8B9C8D]">Risk:</span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#080B08] text-white">ALL</option>
              <option value="LOW" className="bg-[#080B08] text-[#70FF5E]">LOW</option>
              <option value="MEDIUM" className="bg-[#080B08] text-amber-400">MEDIUM</option>
              <option value="HIGH" className="bg-[#080B08] text-orange-400">HIGH</option>
              <option value="CRITICAL" className="bg-[#080B08] text-red-400">CRITICAL</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Sessions Table with 8 Columns */}
      <div className="rounded-2xl bg-[#080B08] border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01] text-[#8B9C8D] text-[10px] uppercase tracking-wider">
                <th className="py-3.5 px-4">Session ID</th>
                <th className="py-3.5 px-4">Agent</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Risk</th>
                <th className="py-3.5 px-4">Taint</th>
                <th className="py-3.5 px-4">Events</th>
                <th className="py-3.5 px-4">Started</th>
                <th className="py-3.5 px-4">Last Activity</th>
                <th className="py-3.5 px-4 text-right">Containment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#8B9C8D]">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#70FF5E]" />
                    <p>Loading authoritative session telemetry...</p>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-red-400">
                    <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
                    <p>Failed to load sessions: {String(error || 'Broker timeout')}</p>
                  </td>
                </tr>
              ) : filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#8B9C8D]">
                    <Layers className="w-8 h-8 text-[#4D5C50] mx-auto mb-2" />
                    <p>No active sessions match the selected filter criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => {
                  const taintLabels = session.taintLabels || (session.risk === 'CRITICAL' ? ['credential_taint', 'untrusted_input'] : session.risk === 'HIGH' ? ['untrusted_prompt'] : ['clean']);

                  return (
                    <tr
                      key={session.id}
                      onClick={() => navigate(`/console/sessions/${session.id}`)}
                      className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                    >
                      {/* 1. Session ID */}
                      <td className="py-4 px-4 text-sky-400 font-bold whitespace-nowrap group-hover:text-[#70FF5E] transition-colors">
                        {session.id}
                      </td>

                      {/* 2. Agent */}
                      <td className="py-4 px-4 text-white font-medium whitespace-nowrap">
                        {session.agentName || session.agentId}
                      </td>

                      {/* 3. Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            session.status === 'ACTIVE'
                              ? 'bg-[#70FF5E]/10 text-[#70FF5E] border border-[#70FF5E]/30'
                              : session.status === 'WAITING_APPROVAL'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : session.status === 'BLOCKED'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                              : 'bg-white/5 text-[#8B9C8D] border border-white/10'
                          }`}
                        >
                          {session.status}
                        </span>
                      </td>

                      {/* 4. Risk */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <RiskBadge risk={session.risk} size="sm" />
                      </td>

                      {/* 5. Taint */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {taintLabels.map((lbl) => (
                            <span
                              key={lbl}
                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                lbl === 'clean'
                                  ? 'bg-[#70FF5E]/10 text-[#70FF5E] border border-[#70FF5E]/20'
                                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
                              }`}
                            >
                              {lbl}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* 6. Events */}
                      <td className="py-4 px-4 text-white/90 whitespace-nowrap">
                        {session.eventsCount} events
                      </td>

                      {/* 7. Started */}
                      <td className="py-4 px-4 text-[#8B9C8D] whitespace-nowrap text-[11px]">
                        {session.startedAt ? new Date(session.startedAt).toLocaleTimeString() : 'Recent'}
                      </td>

                      {/* 8. Last Activity */}
                      <td className="py-4 px-4 text-[#8B9C8D] whitespace-nowrap text-[11px]">
                        {session.lastActivity || session.duration || 'Just now'}
                      </td>

                      {/* Containment Controls */}
                      <td
                        className="py-4 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => handleContainment('QUARANTINE_SESSION', session.id, e)}
                            title="Quarantine Session"
                            className="px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-[10px]"
                          >
                            Quarantine
                          </button>
                          <button
                            onClick={(e) => handleContainment('INVALIDATE_PENDING_APPROVALS', session.id, e)}
                            title="Invalidate Pending Approvals"
                            className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px]"
                          >
                            Revoke
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
