/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * VantaCore Quarantine Vault View
 * Inspect tool results that were blocked, redacted, or isolated before reaching an AI agent.
 */

import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertOctagon,
  ShieldAlert,
  Search,
  Filter,
  ArrowRight,
  Lock,
  Layers,
  Wrench,
  Bot,
  AlertTriangle,
  FileX,
  FileCheck2,
} from 'lucide-react';
import { useQuarantine } from '../../api';
import {
  ToolResultActionBadge,
  ScanStatusBadge,
} from '../../components/common/SecurityBadges';
import { QuarantinedResult, ToolResultAction, ScanStatus } from '../../types/security';

export const QuarantineView: React.FC = () => {
  const navigate = useNavigate();
  const { data: quarantineList = [], isLoading, isError, error } = useQuarantine();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [scanStatusFilter, setScanStatusFilter] = useState<string>('ALL');

  // Metrics computation
  const metrics = useMemo(() => {
    const quarantined = quarantineList.filter((q) => q.sanitizedAction === 'QUARANTINE').length;
    const blocked = quarantineList.filter((q) => q.sanitizedAction === 'BLOCK_RESULT').length;
    const redacted = quarantineList.filter((q) => q.sanitizedAction === 'DELIVER_REDACTED').length;
    const overLimit = quarantineList.filter((q) => q.scanStatus === 'OVER_LIMIT').length;
    const scanErrors = quarantineList.filter(
      (q) => q.scanStatus === 'ERROR' || q.scanStatus === 'UNSCANNABLE'
    ).length;

    return { quarantined, blocked, redacted, overLimit, scanErrors };
  }, [quarantineList]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return quarantineList.filter((item) => {
      const matchesSearch =
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.agentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.agentName && item.agentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.toolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.quarantineReason.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.detectedTaintType && item.detectedTaintType.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesAction = actionFilter === 'ALL' || item.sanitizedAction === actionFilter;
      const matchesScan = scanStatusFilter === 'ALL' || item.scanStatus === scanStatusFilter;

      return matchesSearch && matchesAction && matchesScan;
    });
  }, [quarantineList, searchQuery, actionFilter, scanStatusFilter]);

  if (isLoading) {
    return (
      <div className="space-y-8 max-w-[1440px] mx-auto animate-pulse">
        <div className="space-y-3">
          <div className="h-8 w-64 bg-white/10 rounded" />
          <div className="h-4 w-96 bg-white/5 rounded" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-white/5 rounded-2xl" />
          ))}
        </div>
        <div className="h-96 bg-white/5 rounded-2xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/30 text-center max-w-[800px] mx-auto space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-lg font-bold text-white font-mono">Failed to load Quarantine Vault</h2>
        <p className="text-xs text-[#8B9C8D] font-mono">{(error as Error)?.message || 'Unknown network error'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1440px] mx-auto">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-mono font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              ISOLATION BOUNDARY
            </span>
            <span className="text-xs text-[#8B9C8D] font-mono">Zero-Trust Egress Tap</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            QUARANTINE
          </h1>
          <p className="text-sm text-[#8B9C8D] mt-1 max-w-2xl font-sans">
            Inspect tool results that were blocked, redacted, or isolated before reaching an AI agent.
          </p>
        </div>

        {/* Development Simulation Disclaimer */}
        <div className="p-3.5 rounded-xl bg-red-500/5 border border-red-500/20 flex items-center gap-3">
          <Lock className="w-4 h-4 text-red-400 shrink-0" />
          <div className="text-[11px] font-mono text-[#EDEDED]">
            <span className="text-red-400 font-bold">FRONTEND AUTHORITY RULE:</span> Displays backend-shaped mock quarantine state. The frontend does not alter perimeter isolation state (development simulation).
          </div>
        </div>
      </div>

      {/* Editorial Number Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* QUARANTINED */}
        <div className="p-5 rounded-2xl bg-[#0F0808] border border-rose-500/30 relative overflow-hidden group hover:border-rose-500/60 transition-all">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-mono text-rose-400 uppercase tracking-wider font-bold">
              QUARANTINED
            </div>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </div>
          <div className="text-3xl sm:text-4xl font-display font-extrabold text-rose-400 mt-2 tracking-tight">
            {metrics.quarantined}
          </div>
          <div className="text-[10px] font-mono text-rose-400/60 mt-1">Held in secure vault</div>
        </div>

        {/* BLOCKED RESULTS */}
        <div className="p-5 rounded-2xl bg-[#0D0707] border border-red-500/20 relative overflow-hidden group hover:border-red-500/40 transition-all">
          <div className="text-[11px] font-mono text-red-400 uppercase tracking-wider font-bold">
            BLOCKED RESULTS
          </div>
          <div className="text-3xl sm:text-4xl font-display font-extrabold text-red-400 mt-2 tracking-tight">
            {metrics.blocked}
          </div>
          <div className="text-[10px] font-mono text-red-400/60 mt-1">Completely withheld</div>
        </div>

        {/* REDACTED */}
        <div className="p-5 rounded-2xl bg-[#0D0B06] border border-amber-500/20 relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="text-[11px] font-mono text-amber-400 uppercase tracking-wider font-bold">
            REDACTED
          </div>
          <div className="text-3xl sm:text-4xl font-display font-extrabold text-amber-400 mt-2 tracking-tight">
            {metrics.redacted}
          </div>
          <div className="text-[10px] font-mono text-amber-400/60 mt-1">Secrets scrubbed</div>
        </div>

        {/* OVER LIMIT */}
        <div className="p-5 rounded-2xl bg-[#0A070D] border border-purple-500/20 relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="text-[11px] font-mono text-purple-400 uppercase tracking-wider font-bold">
            OVER LIMIT
          </div>
          <div className="text-3xl sm:text-4xl font-display font-extrabold text-purple-400 mt-2 tracking-tight">
            {metrics.overLimit}
          </div>
          <div className="text-[10px] font-mono text-purple-400/60 mt-1">Buffer exceeded (10MB+)</div>
        </div>

        {/* SCAN ERRORS */}
        <div className="p-5 rounded-2xl bg-[#080B08] border border-white/10 relative overflow-hidden group hover:border-white/20 transition-all col-span-2 sm:col-span-1">
          <div className="text-[11px] font-mono text-[#8B9C8D] uppercase tracking-wider font-bold">
            SCAN ERRORS
          </div>
          <div className="text-3xl sm:text-4xl font-display font-extrabold text-white/70 mt-2 tracking-tight">
            {metrics.scanErrors}
          </div>
          <div className="text-[10px] font-mono text-[#4D5C50] mt-1">Unscannable / parser fault</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#080B08] border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8B9C8D] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by result ID, agent, tool, taint label, or reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-black/50 border border-white/10 rounded-xl text-xs font-mono text-white placeholder-[#4D5C50] focus:outline-none focus:border-red-400 transition-colors"
          />
        </div>

        {/* Filter Selectors */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Action Filter */}
          <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono">
            <span className="text-[#8B9C8D]">Action:</span>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#080B08] text-white">ALL</option>
              <option value="QUARANTINE" className="bg-[#080B08] text-rose-400">QUARANTINE</option>
              <option value="BLOCK_RESULT" className="bg-[#080B08] text-red-400">BLOCK_RESULT</option>
              <option value="DELIVER_REDACTED" className="bg-[#080B08] text-amber-400">DELIVER_REDACTED</option>
              <option value="DELIVER" className="bg-[#080B08] text-[#70FF5E]">DELIVER</option>
            </select>
          </div>

          {/* Scan Status Filter */}
          <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono">
            <span className="text-[#8B9C8D]">Scan Status:</span>
            <select
              value={scanStatusFilter}
              onChange={(e) => setScanStatusFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#080B08] text-white">ALL</option>
              <option value="SCANNED" className="bg-[#080B08] text-[#70FF5E]">SCANNED</option>
              <option value="PARTIALLY_SCANNED" className="bg-[#080B08] text-amber-400">PARTIALLY_SCANNED</option>
              <option value="UNSCANNABLE" className="bg-[#080B08] text-orange-400">UNSCANNABLE</option>
              <option value="OVER_LIMIT" className="bg-[#080B08] text-purple-400">OVER_LIMIT</option>
              <option value="ERROR" className="bg-[#080B08] text-red-400">ERROR</option>
            </select>
          </div>

          {(searchQuery || actionFilter !== 'ALL' || scanStatusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setActionFilter('ALL');
                setScanStatusFilter('ALL');
              }}
              className="text-[11px] font-mono text-[#8B9C8D] hover:text-white px-2 py-1 underline transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Results Table */}
      <div className="rounded-2xl bg-[#080B08] border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-[10px] font-mono text-[#8B9C8D] uppercase tracking-wider">
                <th className="py-3.5 px-4">Time</th>
                <th className="py-3.5 px-4">Result ID</th>
                <th className="py-3.5 px-4">Agent</th>
                <th className="py-3.5 px-4">Session</th>
                <th className="py-3.5 px-4">Tool</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Scan Status</th>
                <th className="py-3.5 px-4">Sensitivity</th>
                <th className="py-3.5 px-4">Taint</th>
                <th className="py-3.5 px-4">Reason</th>
                <th className="py-3.5 px-4 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-xs">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-[#8B9C8D]">
                    <div className="space-y-2">
                      <AlertOctagon className="w-8 h-8 text-[#4D5C50] mx-auto" />
                      <p className="font-mono text-sm">No quarantined items match your filters.</p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setActionFilter('ALL');
                          setScanStatusFilter('ALL');
                        }}
                        className="text-xs text-[#70FF5E] underline font-mono"
                      >
                        Reset filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => navigate(`/console/quarantine/${item.id}`)}
                    className="hover:bg-white/[0.02] cursor-pointer transition-colors group"
                  >
                    {/* Time */}
                    <td className="py-4 px-4 text-[11px] text-[#EDEDED] whitespace-nowrap">
                      {item.quarantinedAt.slice(11, 19)}
                    </td>

                    {/* Result ID */}
                    <td className="py-4 px-4">
                      <span className="font-bold text-white group-hover:text-red-400 transition-colors">
                        {item.id}
                      </span>
                    </td>

                    {/* Agent */}
                    <td className="py-4 px-4">
                      <Link
                        to={`/console/agents/${item.agentId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[#8B9C8D] hover:text-[#70FF5E] transition-colors"
                      >
                        {item.agentName || item.agentId}
                      </Link>
                    </td>

                    {/* Session */}
                    <td className="py-4 px-4 text-[11px]">
                      <Link
                        to={`/console/sessions/${item.sessionId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[#8B9C8D] hover:text-white transition-colors"
                      >
                        {item.sessionId.length > 14 ? `${item.sessionId.slice(0, 12)}...` : item.sessionId}
                      </Link>
                    </td>

                    {/* Tool */}
                    <td className="py-4 px-4">
                      <Link
                        to={`/console/tools/${item.toolId || item.toolName}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[#70FF5E] hover:underline"
                      >
                        {item.toolName}
                      </Link>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4">
                      <ToolResultActionBadge action={item.sanitizedAction} size="sm" />
                    </td>

                    {/* Scan Status */}
                    <td className="py-4 px-4">
                      <ScanStatusBadge status={item.scanStatus} size="sm" />
                    </td>

                    {/* Sensitivity */}
                    <td className="py-4 px-4 text-[10px] text-amber-300 max-w-[120px] truncate">
                      {item.sensitivity || 'UNSPECIFIED'}
                    </td>

                    {/* Taint */}
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-300 text-[10px] whitespace-nowrap">
                        {item.detectedTaintType || 'UNKNOWN_TAINT'}
                      </span>
                    </td>

                    {/* Reason */}
                    <td className="py-4 px-4 text-[11px] text-[#8B9C8D] max-w-[200px] truncate">
                      {item.quarantineReason}
                    </td>

                    {/* View Action */}
                    <td className="py-4 px-4 text-right">
                      <span className="p-1 rounded bg-white/5 text-[#8B9C8D] group-hover:text-white transition-colors inline-block">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
