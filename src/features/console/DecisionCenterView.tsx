/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * VantaCore Decision Center Module
 * Route: /console/decisions
 * Explains why VantaCore allowed, reviewed, or blocked an AI-agent action.
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scale,
  Shield,
  ShieldAlert,
  ArrowRight,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Clock,
  Layers,
  Bot,
  ExternalLink,
} from 'lucide-react';
import { useDecisions } from '../../api';
import {
  RiskBadge,
  DecisionBadge,
  AssuranceTierBadge,
} from '../../components/common/SecurityBadges';
import { SecurityDecision } from '../../types/security';

export const DecisionCenterView: React.FC = () => {
  const navigate = useNavigate();
  const { data: decisions = [], isLoading, isError, error } = useDecisions();

  const [searchQuery, setSearchQuery] = useState('');
  const [decisionFilter, setDecisionFilter] = useState<'ALL' | 'ALLOW' | 'REVIEW' | 'BLOCK'>('ALL');

  // Large editorial statistics
  const stats = useMemo(() => {
    const allow = decisions.filter((d) => d.decision === 'ALLOW').length;
    const review = decisions.filter((d) => d.decision === 'REVIEW').length;
    const block = decisions.filter((d) => d.decision === 'BLOCK').length;
    return { allow, review, block, total: decisions.length };
  }, [decisions]);

  // Filtered decisions list
  const filteredDecisions = useMemo(() => {
    return decisions.filter((dec) => {
      if (decisionFilter !== 'ALL' && dec.decision !== decisionFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          dec.id.toLowerCase().includes(q) ||
          (dec.agentName || dec.agentId).toLowerCase().includes(q) ||
          dec.sessionId.toLowerCase().includes(q) ||
          (dec.tool || '').toLowerCase().includes(q) ||
          (dec.operation || '').toLowerCase().includes(q) ||
          (dec.matchedPolicyName || '').toLowerCase().includes(q) ||
          (dec.reason || '').toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [decisions, decisionFilter, searchQuery]);

  return (
    <div className="space-y-8 max-w-[1500px] mx-auto pb-12 antialiased">
      {/* 1. Hero Header */}
      <div className="space-y-6">
        <div className="pb-2 border-b border-white/5">
          <div className="flex items-center gap-2.5 mb-1.5">
            <Scale className="w-4 h-4 text-[#70FF5E]" />
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-[#70FF5E]">
              ZERO-TRUST RUNTIME ARBITRATION
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            DECISION CENTER
          </h1>
          <p className="text-xs sm:text-sm text-[#8B9C8D] font-sans mt-1 max-w-2xl">
            Understand every enforcement decision before an action reaches a protected enterprise resource.
          </p>
        </div>

        {/* Large Editorial Statistics: ALLOW, REVIEW, BLOCK */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* ALLOW Card */}
          <div
            onClick={() => setDecisionFilter(decisionFilter === 'ALLOW' ? 'ALL' : 'ALLOW')}
            className={`p-6 rounded-2xl bg-[#080B08] border transition-all cursor-pointer ${
              decisionFilter === 'ALLOW'
                ? 'border-[#70FF5E] shadow-[0_0_20px_rgba(112,255,94,0.15)]'
                : 'border-white/10 hover:border-[#70FF5E]/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-[#70FF5E] font-bold">
                ALLOW
              </span>
              <CheckCircle2 className="w-4 h-4 text-[#70FF5E]" />
            </div>
            <div className="font-display text-4xl sm:text-5xl font-extrabold text-[#70FF5E] mt-2">
              {stats.allow}
            </div>
            <p className="text-[11px] font-mono text-[#8B9C8D] mt-1">
              Authorized actions passed through sandbox perimeter
            </p>
          </div>

          {/* REVIEW Card */}
          <div
            onClick={() => setDecisionFilter(decisionFilter === 'REVIEW' ? 'ALL' : 'REVIEW')}
            className={`p-6 rounded-2xl bg-[#080B08] border transition-all cursor-pointer ${
              decisionFilter === 'REVIEW'
                ? 'border-[#F59E0B] shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                : 'border-white/10 hover:border-[#F59E0B]/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-[#F59E0B] font-bold">
                REVIEW
              </span>
              <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div className="font-display text-4xl sm:text-5xl font-extrabold text-[#F59E0B] mt-2">
              {stats.review}
            </div>
            <p className="text-[11px] font-mono text-[#8B9C8D] mt-1">
              Held for Human-in-the-Loop review and dual authorization
            </p>
          </div>

          {/* BLOCK Card */}
          <div
            onClick={() => setDecisionFilter(decisionFilter === 'BLOCK' ? 'ALL' : 'BLOCK')}
            className={`p-6 rounded-2xl bg-[#080B08] border transition-all cursor-pointer ${
              decisionFilter === 'BLOCK'
                ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                : 'border-white/10 hover:border-red-500/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-red-500 font-bold">
                BLOCK
              </span>
              <AlertOctagon className="w-4 h-4 text-red-500" />
            </div>
            <div className="font-display text-4xl sm:text-5xl font-extrabold text-red-500 mt-2">
              {stats.block}
            </div>
            <p className="text-[11px] font-mono text-[#8B9C8D] mt-1">
              Violations permanently severed before execution
            </p>
          </div>
        </div>
      </div>

      {/* 2. Filter & Search Row */}
      <div className="p-4 rounded-2xl bg-[#080B08] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-[#4D5C50] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search decisions by ID, agent, session, tool, policy, or reason..."
            className="w-full bg-[#050605] border border-white/10 rounded-xl pl-9 pr-3.5 py-2 text-xs font-mono text-white placeholder-[#4D5C50] focus:outline-none focus:border-[#70FF5E]/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-[#8B9C8D] text-[11px]">Filter:</span>
          {(['ALL', 'BLOCK', 'REVIEW', 'ALLOW'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDecisionFilter(d)}
              className={`px-3 py-1.5 rounded-xl border transition-colors ${
                decisionFilter === d
                  ? 'bg-white/10 text-white border-white/20 font-bold'
                  : 'bg-white/[0.02] border-white/5 text-[#8B9C8D] hover:text-white'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Decision List Table */}
      <div className="rounded-2xl bg-[#080B08] border border-white/10 overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-mono text-sm font-semibold text-white">
            Enforcement Decisions Audit Trail
          </h3>
          <span className="text-[11px] font-mono text-[#4D5C50]">
            Click any decision to inspect explainable arbitration pipeline
          </span>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 rounded-xl bg-white/[0.02] border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-12 text-center font-mono">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <div className="text-white text-sm font-bold">Failed to load decisions</div>
            <div className="text-xs text-[#8B9C8D] mt-1">{String(error || 'Broker timeout')}</div>
          </div>
        ) : filteredDecisions.length === 0 ? (
          <div className="p-16 text-center font-mono space-y-3">
            <Scale className="w-8 h-8 text-[#4D5C50] mx-auto" />
            <div className="text-sm font-semibold text-white">No decisions found matching filter</div>
            <p className="text-xs text-[#8B9C8D] max-w-sm mx-auto">
              Reset your search term or select "ALL" to inspect all gateway decisions.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01] text-[#8B9C8D] text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4">Decision ID</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Agent</th>
                  <th className="py-3 px-4">Session</th>
                  <th className="py-3 px-4">Tool</th>
                  <th className="py-3 px-4">Risk</th>
                  <th className="py-3 px-4">Policy Decision</th>
                  <th className="py-3 px-4">Enforcement Decision</th>
                  <th className="py-3 px-4">Approval</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredDecisions.map((dec) => {
                  return (
                    <tr
                      key={dec.id}
                      onClick={() => navigate(`/console/decisions/${dec.id}`)}
                      className="cursor-pointer hover:bg-white/[0.03] transition-colors group"
                    >
                      <td className="py-4 px-4 text-white font-bold whitespace-nowrap group-hover:text-[#70FF5E] transition-colors">
                        {dec.id}
                      </td>
                      <td className="py-4 px-4 text-[#8B9C8D] text-[11px] whitespace-nowrap">
                        {dec.timestamp ? new Date(dec.timestamp).toLocaleTimeString() : '14:22:13'}
                      </td>
                      <td className="py-4 px-4 text-[#EDEDED] font-medium whitespace-nowrap">
                        {dec.agentName || dec.agentId}
                      </td>
                      <td className="py-4 px-4 text-sky-400 whitespace-nowrap">
                        <span className="text-[11px]">{dec.sessionId}</span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="text-[#38BDF8] font-medium">{dec.tool || 'HTTP POST'}</span>
                        <span className="text-[#4D5C50] text-[10px] ml-1.5">
                          ({dec.operation || 'execute'})
                        </span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <RiskBadge risk={dec.riskLevel || 'CRITICAL'} size="sm" />
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <DecisionBadge decision={dec.decision} size="sm" />
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 border border-white/10 text-white">
                          {dec.actionTaken || (dec.decision === 'BLOCK' ? 'BLOCKED' : dec.decision === 'REVIEW' ? 'HOLD' : 'PASSED')}
                        </span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-[11px]">
                        {dec.decision === 'REVIEW' ? (
                          <span className="text-amber-400 font-semibold">Required</span>
                        ) : (
                          <span className="text-[#4D5C50]">N/A</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            dec.enforcedAtBoundary
                              ? 'bg-[#70FF5E]/10 text-[#70FF5E] border border-[#70FF5E]/30'
                              : 'bg-white/5 text-[#8B9C8D]'
                          }`}
                        >
                          {dec.enforcedAtBoundary ? 'ENFORCED' : 'RECORDED'}
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
    </div>
  );
};
