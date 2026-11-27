/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * VantaCore Approval Details View
 * Full investigative context for human reviewers with REVIEW Safety Rules and redaction controls.
 */

import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  GitBranch,
  Layers,
  Wrench,
  Bot,
  Scale,
  Sparkles,
  Zap,
  ArrowRight,
  Workflow,
  History,
} from 'lucide-react';
import {
  useApproval,
  useApproveRequest,
  useRejectRequest,
  useConsumeApproval,
} from '../../api';
import {
  RiskBadge,
  ApprovalStateBadge,
  DetectorStatusBadge,
  DestinationTrustBadge,
} from '../../components/common/SecurityBadges';
import { getApprovalStatusText, maskSensitiveValues } from '../../lib/enforcementLogic';

export const ApprovalDetailsView: React.FC = () => {
  const { approvalId } = useParams<{ approvalId: string }>();
  const navigate = useNavigate();

  const { data: approval, isLoading, isError, error } = useApproval(approvalId);
  const approveMutation = useApproveRequest();
  const rejectMutation = useRejectRequest();
  const consumeMutation = useConsumeApproval();

  // Redaction toggle
  const [showRedacted, setShowRedacted] = useState(false);

  // Modal state
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [justification, setJustification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-[1440px] mx-auto animate-pulse">
        <div className="h-6 w-32 bg-white/10 rounded" />
        <div className="h-24 bg-white/5 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 bg-white/5 rounded-2xl lg:col-span-2" />
          <div className="h-96 bg-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !approval) {
    return (
      <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/30 text-center max-w-[700px] mx-auto space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-lg font-bold text-white font-mono">Approval Request Not Found</h2>
        <p className="text-xs text-[#8B9C8D] font-mono">
          Could not locate approval with identifier "{approvalId}".
        </p>
        <Link
          to="/console/approvals"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white font-mono text-xs hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Approval Center
        </Link>
      </div>
    );
  }

  const reviewStatus = getApprovalStatusText(approval.state);

  const handleConfirmApprove = async () => {
    setIsSubmitting(true);
    try {
      await approveMutation.mutateAsync({
        id: approval.id,
        justification: justification || 'Authorized via VantaCore Human-in-the-Loop review gate.',
        approver: 'security-reviewer@vantacore.internal (Simulation)',
      });
      setIsApproveModalOpen(false);
    } catch (err) {
      console.error('Approve failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmReject = async () => {
    setIsSubmitting(true);
    try {
      await rejectMutation.mutateAsync({
        id: approval.id,
        justification: justification || 'Rejected by reviewer: Operation violates security policy.',
        rejector: 'security-reviewer@vantacore.internal (Simulation)',
      });
      setIsRejectModalOpen(false);
    } catch (err) {
      console.error('Reject failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConsumeToken = async () => {
    setIsSubmitting(true);
    try {
      await consumeMutation.mutateAsync(approval.id);
    } catch (err) {
      console.error('Consume failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redacted preview calculation
  const rawArgumentsString =
    typeof approval.argumentsPreview === 'string'
      ? approval.argumentsPreview
      : JSON.stringify(approval.argumentsPreview, null, 2);

  const displayedArguments = showRedacted
    ? rawArgumentsString
    : maskSensitiveValues(rawArgumentsString);

  return (
    <div className="space-y-8 max-w-[1440px] mx-auto pb-12">
      {/* Back to Approvals & Audit Link */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/console/approvals')}
          className="inline-flex items-center gap-2 text-xs font-mono text-[#8B9C8D] hover:text-[#70FF5E] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO APPROVAL CENTER</span>
        </button>

        <Link
          to={`/console/audit?resourceType=APPROVAL&resourceId=${approval.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white transition-colors"
        >
          <History className="w-3.5 h-3.5 text-[#70FF5E]" />
          <span>Approval Audit Trail</span>
        </Link>
      </div>

      {/* REVIEW Safety Rule Banner */}
      <div
        className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          reviewStatus.tone === 'warning'
            ? 'bg-amber-500/10 border-amber-500/30'
            : reviewStatus.tone === 'success'
            ? 'bg-[#70FF5E]/10 border-[#70FF5E]/30'
            : reviewStatus.tone === 'danger'
            ? 'bg-red-500/10 border-red-500/30'
            : 'bg-white/5 border-white/10'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl border ${
              reviewStatus.tone === 'warning'
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : reviewStatus.tone === 'success'
                ? 'bg-[#70FF5E]/20 border-[#70FF5E]/40 text-[#70FF5E]'
                : reviewStatus.tone === 'danger'
                ? 'bg-red-500/20 border-red-500/40 text-red-400'
                : 'bg-white/10 border-white/20 text-[#8B9C8D]'
            }`}
          >
            {reviewStatus.tone === 'danger' ? (
              <XCircle className="w-5 h-5" />
            ) : reviewStatus.tone === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>{reviewStatus.headline}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-black/40 border border-white/10 text-[#8B9C8D]">
                REVIEW SAFETY ENFORCED
              </span>
            </div>
            <p className="text-xs text-[#8B9C8D] font-sans mt-0.5">{reviewStatus.subtext}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          {approval.state === 'PENDING' && (
            <>
              <button
                onClick={() => {
                  setJustification('Authorized by security reviewer for execution.');
                  setIsApproveModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#70FF5E] text-black font-mono font-bold text-xs hover:bg-[#85FF75] transition-colors shadow-[0_0_15px_rgba(112,255,94,0.2)]"
              >
                APPROVE ACTION
              </button>
              <button
                onClick={() => {
                  setJustification('Categorically rejected: Operation violates production write policy.');
                  setIsRejectModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 font-mono font-bold text-xs hover:bg-red-500/30 transition-colors"
              >
                REJECT REQUEST
              </button>
            </>
          )}

          {approval.state === 'APPROVED' && (
            <button
              onClick={handleConsumeToken}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-mono font-bold text-xs hover:bg-cyan-400 transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              <Zap className="w-4 h-4" />
              <span>SIMULATE EXECUTION DISPATCH (CONSUME SIMULATED AUTHORIZATION)</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Header Card */}
      <div className="p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono text-[#8B9C8D] uppercase tracking-wider">
                APPROVAL IDENTIFIER:
              </span>
              <span className="text-xs font-mono font-bold text-white select-all">{approval.id}</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {approval.toolAction}
            </h1>
            <p className="text-xs text-[#8B9C8D] font-mono mt-1">
              Operation: <span className="text-white font-bold">{approval.operation}</span> on{' '}
              <span className="text-amber-400">{approval.resource || 'unspecified resource'}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ApprovalStateBadge state={approval.state} />
            <RiskBadge risk={approval.riskLevel} />
          </div>
        </div>

        {/* Development Simulation Tag */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-[#8B9C8D]">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-400 font-bold">DEVELOPMENT SIMULATION:</span> Actions simulate backend state transitions. No real execution token created.
          </span>
          <span>Requested: {approval.requestedAt}</span>
        </div>
      </div>

      {/* Intended Authorization Lifecycle Visualization */}
      <div className="p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Workflow className="w-4 h-4 text-[#70FF5E]" />
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              Intended Authorization Lifecycle
            </h3>
          </div>
          <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
            NO REAL EXECUTION TOKEN CREATED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-xs">
          {/* Stage 1: REVIEW */}
          <div
            className={`p-4 rounded-xl border flex flex-col justify-between ${
              approval.state === 'PENDING'
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                : 'bg-black/40 border-white/10 text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold">01. REVIEW</span>
              {approval.state === 'PENDING' ? (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#70FF5E]" />
              )}
            </div>
            <div className="text-xs font-bold mt-2">Human-in-the-Loop</div>
            <div className="text-[10px] text-[#8B9C8D] mt-0.5">Dual-party governance gate</div>
          </div>

          {/* Stage 2: APPROVED */}
          <div
            className={`p-4 rounded-xl border flex flex-col justify-between ${
              approval.state === 'APPROVED'
                ? 'bg-[#70FF5E]/10 border-[#70FF5E]/40 text-[#70FF5E]'
                : approval.state === 'CONSUMED'
                ? 'bg-black/40 border-white/10 text-white'
                : approval.state === 'REJECTED'
                ? 'bg-red-950/20 border-red-500/30 text-red-400'
                : 'bg-black/20 border-white/5 text-[#4D5C50]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold">02. APPROVED</span>
              {approval.state === 'APPROVED' ? (
                <span className="w-2 h-2 rounded-full bg-[#70FF5E] animate-pulse" />
              ) : approval.state === 'CONSUMED' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#70FF5E]" />
              ) : null}
            </div>
            <div className="text-xs font-bold mt-2">
              {approval.state === 'REJECTED' ? 'REJECTED' : 'APPROVED'}
            </div>
            <div className="text-[10px] text-[#8B9C8D] mt-0.5">Operator consensus recorded</div>
          </div>

          {/* Stage 3: SIMULATED AUTHORIZATION */}
          <div
            className={`p-4 rounded-xl border flex flex-col justify-between ${
              approval.state === 'APPROVED'
                ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400'
                : approval.state === 'CONSUMED'
                ? 'bg-black/40 border-white/10 text-white'
                : 'bg-black/20 border-white/5 text-[#4D5C50]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold">03. SIMULATED AUTHORIZATION</span>
              {approval.state === 'APPROVED' && (
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              )}
            </div>
            <div className="text-xs font-bold mt-2">Simulated Authorization</div>
            <div className="text-[10px] text-[#8B9C8D] mt-0.5">Ready for simulated dispatch</div>
          </div>

          {/* Stage 4: CONSUMED */}
          <div
            className={`p-4 rounded-xl border flex flex-col justify-between ${
              approval.state === 'CONSUMED'
                ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300'
                : 'bg-black/20 border-white/5 text-[#4D5C50]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold">04. CONSUMED</span>
              {approval.state === 'CONSUMED' && (
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              )}
            </div>
            <div className="text-xs font-bold mt-2">CONSUMED</div>
            <div className="text-[10px] text-[#8B9C8D] mt-0.5">No real gateway execution occurred</div>
          </div>
        </div>

        <p className="text-[11px] font-mono text-[#8B9C8D]">
          Intended sequence: <span className="text-white font-bold">REVIEW → APPROVED → SIMULATED AUTHORIZATION → CONSUMED</span>. Demonstrates governance lifecycle without claiming cryptographic token issuance or real gateway execution.
        </p>
      </div>

      {/* Grid: Context & Cross-Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Full Investigation Context */}
        <div className="lg:col-span-2 space-y-6">
          {/* Core Parameters Table */}
          <div className="p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-4">
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider pb-3 border-b border-white/5">
              Target & Identity Context
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <div className="text-[10px] text-[#8B9C8D]">INVOKING AGENT</div>
                <Link
                  to={`/console/agents/${approval.agentId}`}
                  className="text-white font-bold hover:text-[#70FF5E] transition-colors flex items-center gap-1.5"
                >
                  <Bot className="w-3.5 h-3.5 text-[#70FF5E]" />
                  <span>{approval.agentName}</span>
                </Link>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <div className="text-[10px] text-[#8B9C8D]">ORIGINATING USER</div>
                <div className="text-white">{approval.user || 'Autonomous / System Service'}</div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <div className="text-[10px] text-[#8B9C8D]">SESSION CONTEXT</div>
                <Link
                  to={`/console/sessions/${approval.sessionId}`}
                  className="text-[#70FF5E] hover:underline flex items-center gap-1.5"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span className="truncate">{approval.sessionId}</span>
                </Link>
                {approval.sessionTitle && (
                  <div className="text-[10px] text-[#8B9C8D] font-sans truncate">{approval.sessionTitle}</div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <div className="text-[10px] text-[#8B9C8D]">TARGET TOOL</div>
                <Link
                  to={`/console/tools/${approval.toolId || approval.toolName}`}
                  className="text-[#70FF5E] hover:underline flex items-center gap-1.5"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>{approval.toolName}</span>
                </Link>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <div className="text-[10px] text-[#8B9C8D]">RESOURCE IDENTIFIER</div>
                <div className="text-amber-400 font-bold truncate">{approval.resource || '—'}</div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <div className="text-[10px] text-[#8B9C8D]">DESTINATION & TRUST</div>
                <div className="text-white truncate flex items-center justify-between gap-2">
                  <span className="truncate">{approval.destination || 'NOT_APPLICABLE'}</span>
                  <DestinationTrustBadge trust={approval.destinationTrust || (approval.destination ? 'INTERNAL_TRUSTED' : 'NOT_APPLICABLE')} size="sm" />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1 sm:col-span-2">
                <div className="text-[10px] text-[#8B9C8D]">PROVENANCE TRACE</div>
                <div className="text-[11px] text-[#EDEDED] font-mono leading-relaxed">
                  {approval.provenance || 'User Instruction -> Agent Reasoning -> Tool Invocation'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1 sm:col-span-2">
                <div className="text-[10px] text-[#8B9C8D]">TAINT LABELS IN SCOPE</div>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {approval.taintLabels && approval.taintLabels.length > 0 ? (
                    approval.taintLabels.map((lbl) => (
                      <span
                        key={lbl}
                        className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono"
                      >
                        {lbl}
                      </span>
                    ))
                  ) : (
                    <span className="text-[#4D5C50]">None declared</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sensitive Arguments Panel */}
          <div className="p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  Invocation Arguments (Redacted by Default)
                </h3>
              </div>

              {/* Reveal toggle */}
              <button
                onClick={() => setShowRedacted(!showRedacted)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white transition-colors"
              >
                {showRedacted ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showRedacted ? 'HIDE CLEAR TEXT' : 'SHOW REDACTED CONTEXT'}</span>
              </button>
            </div>

            <p className="text-[11px] font-mono text-[#8B9C8D]">
              Under VantaCore security rules, secrets and auth tokens are masked by default. Revealing context is permitted solely in development simulation environments.
            </p>

            <pre className="p-4 rounded-xl bg-black/60 border border-white/5 text-[11px] font-mono text-[#EDEDED] overflow-x-auto leading-relaxed">
              <code>{displayedArguments}</code>
            </pre>
          </div>

          {/* Security Signals & Risk Factors */}
          <div className="p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                Risk Factors & Security Signals
              </h3>
              <div className="text-xs font-mono text-amber-400 font-bold">
                Risk Score: {approval.riskScore || 84} / 100
              </div>
            </div>

            {/* Risk factors */}
            {approval.riskFactors && approval.riskFactors.length > 0 && (
              <div className="space-y-2">
                <div className="text-[10px] font-mono text-[#8B9C8D] uppercase">Evaluated Risk Drivers:</div>
                <div className="space-y-2">
                  {approval.riskFactors.map((rf) => (
                    <div
                      key={rf.name}
                      className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-3 text-xs font-mono"
                    >
                      <div>
                        <div className="font-bold text-white">{rf.name}</div>
                        <div className="text-[11px] text-[#8B9C8D] font-sans mt-0.5">{rf.reason}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                        Score {rf.score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Signals */}
            {approval.signals && approval.signals.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="text-[10px] font-mono text-[#8B9C8D] uppercase">Correlated Signals:</div>
                <div className="space-y-2">
                  {approval.signals.map((sig) => (
                    <div
                      key={sig.id}
                      className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs font-mono space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#70FF5E]">{sig.detectorName}</span>
                        <DetectorStatusBadge status={sig.status} />
                      </div>
                      <div className="text-[11px] text-[#EDEDED] font-sans">{sig.details}</div>
                      {sig.matchedRule && (
                        <div className="text-[10px] text-[#4D5C50]">Rule: {sig.matchedRule}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Governance Links & Lifecycle */}
        <div className="space-y-6">
          {/* Policy & Matched Rules */}
          <div className="p-5 rounded-2xl bg-[#080B08] border border-white/10 space-y-4 font-mono text-xs">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider pb-3 border-b border-white/5">
              Matched Governance Policy
            </h4>

            <div className="space-y-2">
              <div className="text-[10px] text-[#8B9C8D]">GOVERNING POLICY</div>
              <div className="text-white font-bold">
                {approval.policyName || 'Production Financial Write Containment Policy'}
              </div>
            </div>

            {approval.matchedRules && approval.matchedRules.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <div className="text-[10px] text-[#8B9C8D]">ENFORCED RULES:</div>
                <div className="space-y-1">
                  {approval.matchedRules.map((rule) => (
                    <div
                      key={rule}
                      className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] text-[#EDEDED]"
                    >
                      {rule}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cross Navigation Cards */}
          <div className="p-5 rounded-2xl bg-[#080B08] border border-white/10 space-y-4">
            <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider pb-3 border-b border-white/5">
              Investigation Cross-Links
            </h4>

            <div className="space-y-2.5 font-mono text-xs">
              {/* Linked Decision */}
              {approval.decisionId && (
                <Link
                  to={`/console/decisions/${approval.decisionId}`}
                  className="p-3 rounded-xl bg-black/40 border border-white/5 hover:border-[#70FF5E]/30 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-[#70FF5E]" />
                    <div>
                      <div className="font-bold text-white group-hover:text-[#70FF5E]">Decision Record</div>
                      <div className="text-[10px] text-[#8B9C8D]">{approval.decisionId}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#8B9C8D] group-hover:text-white" />
                </Link>
              )}

              {/* Linked Attack Chain */}
              {approval.attackChainId ? (
                <Link
                  to={`/console/attack-chains/${approval.attackChainId}`}
                  className="p-3 rounded-xl bg-black/40 border border-white/5 hover:border-amber-500/30 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="font-bold text-white group-hover:text-amber-400">Attack Chain Graph</div>
                      <div className="text-[10px] text-[#8B9C8D]">{approval.attackChainId}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#8B9C8D] group-hover:text-white" />
                </Link>
              ) : null}

              {/* Linked Tool */}
              <Link
                to={`/console/tools/${approval.toolId || approval.toolName}`}
                className="p-3 rounded-xl bg-black/40 border border-white/5 hover:border-[#70FF5E]/30 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-[#70FF5E]" />
                  <div>
                    <div className="font-bold text-white group-hover:text-[#70FF5E]">Tool Registry Profile</div>
                    <div className="text-[10px] text-[#8B9C8D]">{approval.toolName}</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#8B9C8D] group-hover:text-white" />
              </Link>

              {/* Linked Session */}
              <Link
                to={`/console/sessions/${approval.sessionId}`}
                className="p-3 rounded-xl bg-black/40 border border-white/5 hover:border-[#70FF5E]/30 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#70FF5E]" />
                  <div>
                    <div className="font-bold text-white group-hover:text-[#70FF5E]">Session Timeline</div>
                    <div className="text-[10px] text-[#8B9C8D]">{approval.sessionId}</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#8B9C8D] group-hover:text-white" />
              </Link>
            </div>
          </div>

          {/* Timestamps & Lifecycle */}
          <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3 font-mono text-xs">
            <h4 className="text-[10px] text-[#8B9C8D] uppercase tracking-wider">Authorization Lifecycle</h4>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between text-[#8B9C8D]">
                <span>Requested:</span>
                <span className="text-white">{approval.requestedAt}</span>
              </div>
              <div className="flex justify-between text-[#8B9C8D]">
                <span>Expires:</span>
                <span className="text-amber-400">{approval.expiresAt}</span>
              </div>
              {approval.resolvedAt && (
                <div className="flex justify-between text-[#8B9C8D]">
                  <span>Resolved:</span>
                  <span className="text-white">{approval.resolvedAt}</span>
                </div>
              )}
              {approval.resolvedBy && (
                <div className="flex justify-between text-[#8B9C8D]">
                  <span>Resolved By:</span>
                  <span className="text-white truncate max-w-[160px]">{approval.resolvedBy}</span>
                </div>
              )}
              {approval.consumedAt && (
                <div className="flex justify-between text-[#8B9C8D]">
                  <span>Consumed:</span>
                  <span className="text-cyan-400">{approval.consumedAt}</span>
                </div>
              )}
            </div>

            {approval.justification && (
              <div className="pt-2 border-t border-white/5 text-[10px] text-[#8B9C8D] font-sans">
                <span className="font-mono text-[#EDEDED] font-bold">Audit Note: </span>
                {approval.justification}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {(isApproveModalOpen || isRejectModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#080B08] border border-white/10 rounded-2xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                {isApproveModalOpen ? (
                  <CheckCircle2 className="w-5 h-5 text-[#70FF5E]" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                  {isApproveModalOpen ? 'Confirm Human Authorization' : 'Confirm Action Rejection'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsApproveModalOpen(false);
                  setIsRejectModalOpen(false);
                }}
                className="text-[#8B9C8D] hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Summary Required by PRD */}
            <div className="p-4 rounded-xl bg-black/50 border border-white/5 space-y-2 text-xs font-mono">
              <div className="text-[10px] text-[#70FF5E] uppercase tracking-wider font-bold">
                AUDIT SUMMARY
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-[#8B9C8D]">Agent:</span>
                <span className="text-white font-bold">{approval.agentName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-[#8B9C8D]">Tool:</span>
                <span className="text-[#70FF5E]">{approval.toolName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-[#8B9C8D]">Operation:</span>
                <span className="text-white">{approval.operation}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-[#8B9C8D]">Resource:</span>
                <span className="text-amber-400 truncate max-w-[240px]">{approval.resource || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-[#8B9C8D]">Destination:</span>
                <span className="text-white truncate max-w-[240px]">{approval.destination || 'internal'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-[#8B9C8D]">Risk Level:</span>
                <RiskBadge risk={approval.riskLevel} size="sm" />
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#8B9C8D]">Expiry:</span>
                <span className="text-[#8B9C8D]">{approval.expiresAt}</span>
              </div>
            </div>

            {/* Justification Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#8B9C8D]">Reviewer Justification / Audit Reason:</label>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                rows={2}
                className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#70FF5E]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setIsApproveModalOpen(false);
                  setIsRejectModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-white/5 text-[#8B9C8D] hover:text-white text-xs font-mono transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={isApproveModalOpen ? handleConfirmApprove : handleConfirmReject}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-colors ${
                  isApproveModalOpen
                    ? 'bg-[#70FF5E] text-black hover:bg-[#85FF75]'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {isSubmitting
                  ? 'Saving...'
                  : isApproveModalOpen
                  ? 'CONFIRM & AUTHORIZE'
                  : 'CONFIRM & REJECT'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
