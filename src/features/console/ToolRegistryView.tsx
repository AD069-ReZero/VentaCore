/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * VantaCore Tool Registry View
 * Displays authorized agent tools, capabilities, assurance tiers, risk levels, and status.
 */

import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wrench,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Lock,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useTools } from '../../api';
import { Tool, ToolStatus, AssuranceTier } from '../../types/security';
import {
  RiskBadge,
  AssuranceBadge,
  ToolStatusBadge,
  CapabilityBadge,
} from '../../components/common/SecurityBadges';

export const ToolRegistryView: React.FC = () => {
  const navigate = useNavigate();
  const { data: tools = [], isLoading, isError, error } = useTools();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [assuranceFilter, setAssuranceFilter] = useState<string>('ALL');
  const [approvalFilter, setApprovalFilter] = useState<string>('ALL');

  // Metrics computation
  const metrics = useMemo(() => {
    const total = tools.length;
    const enforced = tools.filter((t) => t.assuranceLevel === 'ENFORCED').length;
    const advisory = tools.filter((t) => t.assuranceLevel === 'ADVISORY').length;
    const highRisk = tools.filter((t) => t.riskRating === 'HIGH' || t.riskRating === 'CRITICAL').length;
    const approvalReq = tools.filter((t) => t.requiresApproval).length;

    return { total, enforced, advisory, highRisk, approvalReq };
  }, [tools]);

  // Filtered tools
  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesSearch =
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tool.namespace && tool.namespace.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (tool.executorIdentity && tool.executorIdentity.toLowerCase().includes(searchQuery.toLowerCase())) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || tool.status === statusFilter;
      const matchesAssurance = assuranceFilter === 'ALL' || tool.assuranceLevel === assuranceFilter;
      const matchesApproval =
        approvalFilter === 'ALL' ||
        (approvalFilter === 'REQUIRED' && tool.requiresApproval) ||
        (approvalFilter === 'AUTONOMOUS' && !tool.requiresApproval);

      return matchesSearch && matchesStatus && matchesAssurance && matchesApproval;
    });
  }, [tools, searchQuery, statusFilter, assuranceFilter, approvalFilter]);

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
        <h2 className="text-lg font-bold text-white font-mono">Failed to load Tool Registry</h2>
        <p className="text-xs text-[#8B9C8D] font-mono">{(error as Error)?.message || 'Unknown network error'}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-lg bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-mono hover:bg-red-500/30 transition-colors"
        >
          RETRY REGISTRY CONNECTION
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1440px] mx-auto">
      {/* Tool Registry Hero */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#70FF5E]/10 border border-[#70FF5E]/30 text-[#70FF5E] text-[10px] font-mono font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#70FF5E] animate-pulse" />
              CAPABILITY CONTROL PLANE
            </span>
            <span className="text-xs text-[#8B9C8D] font-mono">v3.4-enforce</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            TOOL REGISTRY
          </h1>
          <p className="text-sm text-[#8B9C8D] mt-1 max-w-2xl font-sans">
            Control which capabilities AI agents can access and how each tool is protected across execution boundaries.
          </p>
        </div>

        {/* Development Simulation Disclaimer */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 flex items-center gap-3">
          <Lock className="w-4 h-4 text-[#70FF5E]" />
          <div className="text-[11px] font-mono text-[#8B9C8D]">
            <span className="text-white font-bold">FRONTEND AUTHORITY RULE:</span> Policy enforcement is evaluated at the gateway. Tool catalog displays authorized contracts.
          </div>
        </div>
      </div>

      {/* Large Editorial Numbers (Not identical cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Tools */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10 relative overflow-hidden group hover:border-[#70FF5E]/30 transition-all">
          <div className="text-[11px] font-mono text-[#8B9C8D] uppercase tracking-wider">TOTAL TOOLS</div>
          <div className="text-3xl sm:text-4xl font-display font-extrabold text-white mt-2 tracking-tight">
            {metrics.total}
          </div>
          <div className="text-[10px] font-mono text-[#4D5C50] mt-1">Authorized endpoints</div>
          <div className="absolute top-4 right-4 text-white/5 group-hover:text-[#70FF5E]/20 transition-colors">
            <Wrench className="w-8 h-8" />
          </div>
        </div>

        {/* Enforced */}
        <div className="p-5 rounded-2xl bg-[#080B08] border border-[#70FF5E]/20 relative overflow-hidden group hover:border-[#70FF5E]/50 transition-all">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-mono text-[#70FF5E] uppercase tracking-wider">ENFORCED</div>
            <span className="w-2 h-2 rounded-full bg-[#70FF5E] animate-pulse" />
          </div>
          <div className="text-3xl sm:text-4xl font-display font-extrabold text-[#70FF5E] mt-2 tracking-tight">
            {metrics.enforced}
          </div>
          <div className="text-[10px] font-mono text-[#8B9C8D] mt-1">Strict boundary interception</div>
        </div>

        {/* Advisory */}
        <div className="p-5 rounded-2xl bg-[#080B08] border border-white/10 relative overflow-hidden group hover:border-white/20 transition-all">
          <div className="text-[11px] font-mono text-[#8B9C8D] uppercase tracking-wider">ADVISORY</div>
          <div className="text-3xl sm:text-4xl font-display font-extrabold text-white/80 mt-2 tracking-tight">
            {metrics.advisory}
          </div>
          <div className="text-[10px] font-mono text-[#4D5C50] mt-1">Telemetry tap only</div>
        </div>

        {/* High Risk */}
        <div className="p-5 rounded-2xl bg-[#0C0808] border border-red-500/20 relative overflow-hidden group hover:border-red-500/40 transition-all">
          <div className="text-[11px] font-mono text-red-400 uppercase tracking-wider">HIGH RISK</div>
          <div className="text-3xl sm:text-4xl font-display font-extrabold text-red-400 mt-2 tracking-tight">
            {metrics.highRisk}
          </div>
          <div className="text-[10px] font-mono text-red-400/60 mt-1">Elevated privilege & data reach</div>
        </div>

        {/* Approval Required */}
        <div className="p-5 rounded-2xl bg-[#0D0B06] border border-amber-500/20 relative overflow-hidden group hover:border-amber-500/40 transition-all col-span-2 sm:col-span-1">
          <div className="text-[11px] font-mono text-amber-400 uppercase tracking-wider">APPROVAL REQUIRED</div>
          <div className="text-3xl sm:text-4xl font-display font-extrabold text-amber-400 mt-2 tracking-tight">
            {metrics.approvalReq}
          </div>
          <div className="text-[10px] font-mono text-amber-400/60 mt-1">Mandatory Human-in-the-Loop</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#080B08] border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8B9C8D] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by tool name, namespace, capability, or executor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-black/50 border border-white/10 rounded-xl text-xs font-mono text-white placeholder-[#4D5C50] focus:outline-none focus:border-[#70FF5E] transition-colors"
          />
        </div>

        {/* Filter Selectors */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono">
            <span className="text-[#8B9C8D]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#080B08] text-white">ALL</option>
              <option value="ACTIVE" className="bg-[#080B08] text-[#70FF5E]">ACTIVE</option>
              <option value="DISABLED" className="bg-[#080B08] text-gray-400">DISABLED</option>
              <option value="QUARANTINED" className="bg-[#080B08] text-red-400">QUARANTINED</option>
              <option value="PENDING_REVIEW" className="bg-[#080B08] text-amber-400">PENDING_REVIEW</option>
            </select>
          </div>

          {/* Assurance Filter */}
          <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono">
            <span className="text-[#8B9C8D]">Assurance:</span>
            <select
              value={assuranceFilter}
              onChange={(e) => setAssuranceFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#080B08] text-white">ALL</option>
              <option value="ENFORCED" className="bg-[#080B08] text-[#70FF5E]">ENFORCED</option>
              <option value="ADVISORY" className="bg-[#080B08] text-gray-400">ADVISORY</option>
            </select>
          </div>

          {/* Approval Filter */}
          <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono">
            <span className="text-[#8B9C8D]">Approval:</span>
            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#080B08] text-white">ALL</option>
              <option value="REQUIRED" className="bg-[#080B08] text-amber-400">REQUIRED</option>
              <option value="AUTONOMOUS" className="bg-[#080B08] text-[#70FF5E]">AUTONOMOUS</option>
            </select>
          </div>

          {(searchQuery || statusFilter !== 'ALL' || assuranceFilter !== 'ALL' || approvalFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setAssuranceFilter('ALL');
                setApprovalFilter('ALL');
              }}
              className="text-[11px] font-mono text-[#8B9C8D] hover:text-white px-2 py-1 underline transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Tools Table */}
      <div className="rounded-2xl bg-[#080B08] border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-[10px] font-mono text-[#8B9C8D] uppercase tracking-wider">
                <th className="py-3.5 px-4">Tool</th>
                <th className="py-3.5 px-4">Internal Tool ID</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Capabilities</th>
                <th className="py-3.5 px-4">Executor</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Side Effect</th>
                <th className="py-3.5 px-4">Sensitivity</th>
                <th className="py-3.5 px-4">Destination Trust</th>
                <th className="py-3.5 px-4">Definition Version</th>
                <th className="py-3.5 px-4 text-right">Security Revision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-xs">
              {filteredTools.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-[#8B9C8D]">
                    <div className="space-y-2">
                      <Wrench className="w-8 h-8 text-[#4D5C50] mx-auto" />
                      <p className="font-mono text-sm">No tools matched your filter criteria.</p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setStatusFilter('ALL');
                          setAssuranceFilter('ALL');
                          setApprovalFilter('ALL');
                        }}
                        className="text-xs text-[#70FF5E] underline font-mono"
                      >
                        Clear all filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTools.map((tool) => (
                  <tr
                    key={tool.id}
                    onClick={() => navigate(`/console/tools/${tool.id}`)}
                    className="hover:bg-white/[0.02] cursor-pointer transition-colors group"
                  >
                    {/* 1. Tool */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-white/5 text-[#70FF5E] border border-white/10 group-hover:border-[#70FF5E]/30 transition-colors">
                          <Wrench className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-[#70FF5E] transition-colors">
                            {tool.name}
                          </div>
                          <div className="text-[11px] text-[#8B9C8D] font-sans line-clamp-1">
                            {tool.displayName}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Internal Tool ID */}
                    <td className="py-4 px-4 text-[#8B9C8D] text-[11px] whitespace-nowrap">
                      {tool.id}
                    </td>

                    {/* 3. Type */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-sky-400">
                        {tool.category || 'DATABASE'}
                      </span>
                    </td>

                    {/* 4. Capabilities */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {tool.capabilities && tool.capabilities.length > 0 ? (
                          tool.capabilities.slice(0, 2).map((cap) => (
                            <CapabilityBadge key={cap} capability={cap} size="sm" />
                          ))
                        ) : (
                          <span className="text-[10px] text-[#4D5C50]">None declared</span>
                        )}
                        {tool.capabilities && tool.capabilities.length > 2 && (
                          <span className="text-[10px] text-[#8B9C8D] self-center">
                            +{tool.capabilities.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 5. Executor */}
                    <td className="py-4 px-4 text-[#8B9C8D] text-[11px] truncate max-w-[140px]">
                      {tool.executorIdentity || 'internal:worker'}
                    </td>

                    {/* 6. Status */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <ToolStatusBadge status={tool.status} size="sm" />
                    </td>

                    {/* 7. Side Effect */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 border border-white/10 text-white">
                        {tool.sideEffectClass || (tool.allowedOperations?.some((op) => ['UPDATE', 'INSERT', 'DELETE'].includes(op)) ? 'STATEFUL_MUTATION' : 'READ_ONLY')}
                      </span>
                    </td>

                    {/* 8. Sensitivity */}
                    <td className="py-4 px-4 text-[11px] text-amber-400/90 whitespace-nowrap">
                      {tool.defaultSensitivity || 'RESTRICTED'}
                    </td>

                    {/* 9. Destination Trust */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="text-[11px] text-white">
                        {tool.destinationTrust || 'INTERNAL_TRUSTED'}
                      </span>
                    </td>

                    {/* 10. Definition Version */}
                    <td className="py-4 px-4 text-[#8B9C8D] text-[11px] whitespace-nowrap">
                      {tool.definitionVersion || tool.version || 'v2.4.1'}
                    </td>

                    {/* 11. Security Revision */}
                    <td className="py-4 px-4 text-right text-[#70FF5E] text-[11px] whitespace-nowrap font-bold">
                      {tool.securityRevision || 'sec-rev-2026.10-q'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>

        {/* Table Footer */}
        <div className="p-3.5 bg-black/40 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-[#8B9C8D]">
          <div>
            Showing <span className="text-white font-bold">{filteredTools.length}</span> of{' '}
            <span className="text-white font-bold">{tools.length}</span> registered tools
          </div>
          <div className="flex items-center gap-4 mt-2 sm:mt-0 text-[10px]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#70FF5E]" /> Enforced Interception
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Human Approval Gate
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
