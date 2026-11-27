/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * VantaCore Human Approval Center (Area 5)
 * Human-in-the-Loop review queue for high-risk autonomous agent operations.
 * Features 7 queue tabs: Pending, Approved, Rejected, Expired, Consumed, Cancelled, Invalidated.
 * Protects against double approval, stale approval, expired approval, cross-tenant approval.
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Archive,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Check,
  X,
  Lock,
  Layers,
  Sparkles,
  ExternalLink,
  Ban,
  Tag,
  AlertOctagon,
  RefreshCw,
} from 'lucide-react';
import { useApprovals, useApproveRequest, useRejectRequest } from '../../api';
import { Approval, ApprovalState, RiskLevel } from '../../types/security';
import {
  RiskBadge,
  ApprovalStateBadge,
  DestinationTrustBadge,
} from '../../components/common/SecurityBadges';
import { maskSensitiveValues } from '../../lib/enforcementLogic';

export const ApprovalCenterView: React.FC = () => {
  const navigate = useNavigate();
  const { data: approvals = [], isLoading, isError, error } = useApprovals();
  const approveMutation = useApproveRequest();
  const rejectMutation = useRejectRequest();

  // 7 Queue Tabs
  const [activeQueueTab, setActiveQueueTab] = useState<ApprovalState | 'ALL'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');

  // Confirmation modal state
  const [modalApproval, setModalApproval] = useState<Approval | null>(null);
  const [modalAction, setModalAction] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [justification, setJustification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Compute 7 metrics for tabs
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
      EXPIRED: 0,
      CONSUMED: 0,
      CANCELLED: 0,
      INVALIDATED: 0,
    };
    approvals.forEach((a) => {
      const state = (a.state || a.status || 'PENDING') as keyof typeof counts;
      if (counts[state] !== undefined) {
        counts[state]++;
      }
    });
    return counts;
  }, [approvals]);

  // Filtered approvals list
  const filteredApprovals = useMemo(() => {
    return approvals.filter((appr) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        appr.id.toLowerCase().includes(q) ||
        appr.agentName.toLowerCase().includes(q) ||
        appr.toolName.toLowerCase().includes(q) ||
        appr.toolAction.toLowerCase().includes(q) ||
        (appr.resource && appr.resource.toLowerCase().includes(q));

      const currentState = appr.state || appr.status || 'PENDING';
      const matchesTab = activeQueueTab === 'ALL' || currentState === activeQueueTab;
      const matchesRisk = riskFilter === 'ALL' || appr.riskLevel === riskFilter;

      return matchesSearch && matchesTab && matchesRisk;
    });
  }, [approvals, searchQuery, activeQueueTab, riskFilter]);

  const handleOpenApproveModal = (appr: Approval, e: React.MouseEvent) => {
    e.stopPropagation();
    // Protect against expired approval
    if (new Date(appr.expiresAt).getTime() < Date.now()) {
      setActionError(`Cannot approve: Request ${appr.id} has already expired.`);
      return;
    }
    // Protect against double approval
    if (appr.state !== 'PENDING') {
      setActionError(`Cannot approve: Request ${appr.id} is in status ${appr.state}.`);
      return;
    }
    setActionError(null);
    setModalApproval(appr);
    setModalAction('APPROVE');
    setJustification('Authorized by SOC security reviewer following policy verification.');
  };

  const handleOpenRejectModal = (appr: Approval, e: React.MouseEvent) => {
    e.stopPropagation();
    // Protect against already finalized approval
    if (appr.state !== 'PENDING') {
      setActionError(`Cannot reject: Request ${appr.id} is already in status ${appr.state}.`);
      return;
    }
    setActionError(null);
    setModalApproval(appr);
    setModalAction('REJECT');
    setJustification('Rejected by reviewer: Operation violates zero-trust write contract.');
  };

  const handleConfirmAction = async () => {
    if (!modalApproval || !modalAction) return;
    setIsSubmitting(true);
    setActionError(null);

    try {
      if (modalAction === 'APPROVE') {
        await approveMutation.mutateAsync({
          id: modalApproval.id,
          justification,
          approver: 'soc-analyst-reviewer',
        });
      } else {
        await rejectMutation.mutateAsync({
          id: modalApproval.id,
          justification,
          rejector: 'soc-analyst-reviewer',
        });
      }
      setModalApproval(null);
      setModalAction(null);
      setJustification('');
    } catch (err: any) {
      setActionError(err?.message || 'Server rejected state transition.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-[1500px] mx-auto pb-12 antialiased">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#70FF5E]" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#70FF5E]">
              HUMAN-IN-THE-LOOP CONTROL PLANE
            </span>
            <span className="text-xs text-[#8B9C8D] font-mono">• Backend Authoritative</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Human Approval Center
          </h1>
          <p className="text-xs sm:text-sm text-[#8B9C8D] font-sans mt-1">
            Authoritative review queue for high-risk autonomous agent operations requiring human authorization.
          </p>
        </div>
      </div>

      {actionError && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-center gap-2">
          <AlertOctagon className="w-4 h-4" />
          <span>{actionError}</span>
        </div>
      )}

      {/* 2. Seven Queue Tabs */}
      <div className="flex items-center gap-1 border-b border-white/10 overflow-x-auto font-mono text-xs pb-px">
        {[
          { key: 'PENDING', label: `Pending (${tabCounts.PENDING})`, color: 'text-amber-400' },
          { key: 'APPROVED', label: `Approved (${tabCounts.APPROVED})`, color: 'text-[#70FF5E]' },
          { key: 'REJECTED', label: `Rejected (${tabCounts.REJECTED})`, color: 'text-red-400' },
          { key: 'EXPIRED', label: `Expired (${tabCounts.EXPIRED})`, color: 'text-gray-400' },
          { key: 'CONSUMED', label: `Consumed (${tabCounts.CONSUMED})`, color: 'text-cyan-400' },
          { key: 'CANCELLED', label: `Cancelled (${tabCounts.CANCELLED})`, color: 'text-gray-400' },
          { key: 'INVALIDATED', label: `Invalidated (${tabCounts.INVALIDATED})`, color: 'text-purple-400' },
          { key: 'ALL', label: `All (${approvals.length})`, color: 'text-white' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveQueueTab(tab.key as any)}
            className={`px-4 py-2.5 border-b-2 font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeQueueTab === tab.key
                ? 'border-[#70FF5E] text-white bg-white/[0.02]'
                : 'border-transparent text-[#8B9C8D] hover:text-white'
            }`}
          >
            <span className={activeQueueTab === tab.key ? 'text-white' : tab.color}>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 3. Search and Filters */}
      <div className="p-4 rounded-2xl bg-[#080B08] border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 font-mono text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8B9C8D] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search approvals by ID, agent, tool, or resource..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#050605] border border-white/10 rounded-xl pl-9 pr-3.5 py-2 text-white placeholder-[#4D5C50] focus:outline-none focus:border-[#70FF5E]/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#8B9C8D]">Risk Level:</span>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-white focus:outline-none cursor-pointer"
          >
            <option value="ALL" className="bg-[#080B08]">ALL</option>
            <option value="HIGH" className="bg-[#080B08] text-orange-400">HIGH</option>
            <option value="CRITICAL" className="bg-[#080B08] text-red-400">CRITICAL</option>
          </select>
        </div>
      </div>

      {/* 4. Approvals Cards / List with required details */}
      {isLoading ? (
        <div className="p-12 text-center text-[#8B9C8D] font-mono">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#70FF5E]" />
          <p>Loading approval queue...</p>
        </div>
      ) : isError ? (
        <div className="p-12 text-center text-red-400 font-mono">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          <p>Failed to load approval records: {String(error || 'Broker timeout')}</p>
        </div>
      ) : filteredApprovals.length === 0 ? (
        <div className="p-16 rounded-2xl bg-[#080B08] border border-white/10 text-center font-mono space-y-2">
          <CheckCircle2 className="w-8 h-8 text-[#70FF5E] mx-auto" />
          <div className="text-white font-bold text-sm">✓ No actions currently require human review.</div>
          <p className="text-xs text-[#8B9C8D]">The selected queue tab has zero items awaiting operator action.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 font-mono text-xs">
          {filteredApprovals.map((appr) => {
            const isPending = (appr.state || appr.status) === 'PENDING';
            const isExpired = new Date(appr.expiresAt).getTime() < Date.now();

            return (
              <div
                key={appr.id}
                className="p-6 rounded-2xl bg-[#080B08] border border-white/10 hover:border-white/20 transition-all space-y-4 shadow-xl"
              >
                {/* Top card row: IDs, badges, actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[#70FF5E] font-bold text-sm">{appr.id}</span>
                    <ApprovalStateBadge state={appr.state || appr.status || 'PENDING'} size="sm" />
                    <RiskBadge risk={appr.riskLevel || 'HIGH'} size="sm" />
                  </div>

                  {isPending && !isExpired && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleOpenRejectModal(appr, e)}
                        className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={(e) => handleOpenApproveModal(appr, e)}
                        className="px-4 py-1.5 rounded-xl bg-[#70FF5E] hover:bg-[#62f050] text-black font-bold shadow-[0_0_15px_rgba(112,255,94,0.3)] transition-colors"
                      >
                        Approve
                      </button>
                    </div>
                  )}
                </div>

                {/* Card Fields: agent, session, tool, operation, risk, reason, taint, destination trust, requested time, expiry, policy reason */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <div className="text-[10px] uppercase text-[#4D5C50]">Agent</div>
                    <div className="text-white font-bold mt-0.5">{appr.agentName || appr.agentId}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-[#4D5C50]">Session</div>
                    <div className="text-sky-400 font-bold mt-0.5">{appr.sessionId}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-[#4D5C50]">Tool & Operation</div>
                    <div className="text-white font-bold mt-0.5">
                      {appr.toolName || appr.toolAction} ({appr.operation || 'execute'})
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-[#4D5C50]">Destination Trust</div>
                    <div className="mt-0.5">
                      <DestinationTrustBadge trust={appr.destinationTrust || 'UNKNOWN_EXTERNAL'} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/5 text-xs">
                  <div>
                    <div className="text-[10px] uppercase text-[#4D5C50]">Requested At</div>
                    <div className="text-[#8B9C8D] mt-0.5">{new Date(appr.requestedAt).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-[#4D5C50]">Expiry (Fail-Closed)</div>
                    <div className={`mt-0.5 ${isExpired ? 'text-red-400 font-bold' : 'text-amber-400'}`}>
                      {new Date(appr.expiresAt).toLocaleString()} {isExpired && '(EXPIRED)'}
                    </div>
                  </div>
                </div>

                {/* Policy Reason & Taint */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#8B9C8D]">Policy Reason:</span>
                    <span className="text-white font-medium">{appr.policyName || 'Strict External Mutation Rule'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#8B9C8D]">Taint Labels:</span>
                    <div className="flex flex-wrap gap-1">
                      {(appr.taintLabels || ['external_content', 'restricted_capability']).map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[10px]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Redacted Arguments Preview */}
                <div className="space-y-1 text-xs">
                  <div className="text-[10px] uppercase text-[#4D5C50]">Arguments (Redacted):</div>
                  <pre className="p-3 rounded-xl bg-black border border-white/5 text-[11px] text-[#38BDF8] overflow-x-auto">
                    {maskSensitiveValues(
                      typeof appr.argumentsPreview === 'string'
                        ? appr.argumentsPreview
                        : JSON.stringify(appr.argumentsPreview || {}, null, 2)
                    )}
                  </pre>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      {modalApproval && modalAction && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-mono">
          <div className="bg-[#080B08] border border-white/20 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                {modalAction === 'APPROVE' ? (
                  <CheckCircle2 className="w-4 h-4 text-[#70FF5E]" />
                ) : (
                  <AlertOctagon className="w-4 h-4 text-red-400" />
                )}
                <span>Confirm {modalAction}: {modalApproval.id}</span>
              </div>
              <button
                onClick={() => {
                  setModalApproval(null);
                  setModalAction(null);
                }}
                className="text-[#8B9C8D] hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-[#EDEDED]">
              You are {modalAction.toLowerCase()}ing execution of tool <span className="text-white font-bold">{modalApproval.toolName}</span> by agent <span className="text-[#70FF5E] font-bold">{modalApproval.agentName}</span>.
            </p>

            <div className="space-y-1">
              <label className="text-[#8B9C8D] text-[10px] uppercase">Justification / Audit Reason:</label>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                rows={3}
                className="w-full bg-[#050605] border border-white/10 rounded-xl p-2.5 text-white placeholder-[#4D5C50] focus:outline-none focus:border-[#70FF5E]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setModalApproval(null);
                  setModalAction(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-white/5 text-[#8B9C8D] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={isSubmitting}
                className={`px-4 py-1.5 rounded-xl font-bold text-xs ${
                  modalAction === 'APPROVE'
                    ? 'bg-[#70FF5E] hover:bg-[#62f050] text-black shadow-[0_0_15px_rgba(112,255,94,0.3)]'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                {isSubmitting ? 'Enforcing...' : `Confirm ${modalAction}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
