/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * VantaCore Audit Details View
 * In-depth forensic view of an individual audit ledger event.
 * Displays cryptographic state hashes, redacted metadata, and cross-navigation links.
 */

import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  History,
  ArrowLeft,
  ShieldAlert,
  Lock,
  ExternalLink,
  Copy,
  Check,
  User,
  Cpu,
  Layers,
  ArrowRight,
  Sparkles,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { useAuditLog } from '../../api';
import { RiskBadge } from '../../components/common/SecurityBadges';
import { maskSensitiveValues } from '../../lib/enforcementLogic';

export const AuditDetailsView: React.FC = () => {
  const { auditId } = useParams<{ auditId: string }>();
  const navigate = useNavigate();
  const { data: audit, isLoading, isError, error } = useAuditLog(auditId);

  const [copiedBefore, setCopiedBefore] = useState(false);
  const [copiedAfter, setCopiedAfter] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-[1200px] mx-auto animate-pulse">
        <div className="h-6 w-32 bg-white/10 rounded" />
        <div className="h-64 bg-white/5 rounded-2xl border border-white/5" />
        <div className="h-96 bg-white/5 rounded-2xl border border-white/5" />
      </div>
    );
  }

  if (isError || !audit) {
    return (
      <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/30 text-center max-w-[800px] mx-auto space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-lg font-bold text-white font-mono">Audit Record Not Found</h2>
        <p className="text-xs text-[#8B9C8D] font-mono">
          {(error as Error)?.message || `Record with ID ${auditId} was not located in ledger.`}
        </p>
        <Link
          to="/console/audit"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white font-mono text-xs hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Audit Log</span>
        </Link>
      </div>
    );
  }

  const copyHash = (hash: string | undefined, isBefore: boolean) => {
    if (!hash) return;
    navigator.clipboard.writeText(hash);
    if (isBefore) {
      setCopiedBefore(true);
      setTimeout(() => setCopiedBefore(false), 2000);
    } else {
      setCopiedAfter(true);
      setTimeout(() => setCopiedAfter(false), 2000);
    }
  };

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/console/audit"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#8B9C8D] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5 font-mono text-xs">
              <span className="text-[#70FF5E] font-bold">{audit.id}</span>
              <span className="text-[#4D5C50]">•</span>
              <span className="text-[#8B9C8D]">{new Date(audit.timestamp).toLocaleString()}</span>
              <RiskBadge risk={audit.severity} size="sm" />
            </div>
            <h1 className="font-display text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-3">
              <span>{audit.action}</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-white/5 border border-white/10 text-sky-400">
                {audit.status}
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[#70FF5E] font-mono text-xs font-semibold">
            SEALED FORENSIC RECORD
          </span>
        </div>
      </div>

      {/* Primary Details Card */}
      <div className="p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-6">
        <div>
          <span className="text-[10px] font-mono uppercase text-[#8B9C8D] tracking-wider">Event Summary</span>
          <p className="text-sm sm:text-base text-white/90 font-sans mt-1 leading-relaxed">
            {maskSensitiveValues(audit.summary)}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 pt-6 border-t border-white/5 font-mono text-xs">
          <div>
            <span className="text-[10px] text-[#4D5C50] uppercase block">Actor</span>
            <span className="text-white font-semibold mt-1 block truncate">{audit.actor}</span>
          </div>

          <div>
            <span className="text-[10px] text-[#4D5C50] uppercase block">Actor Type</span>
            <span className="text-sky-400 mt-1 block font-bold">{audit.actorType}</span>
          </div>

          <div>
            <span className="text-[10px] text-[#4D5C50] uppercase block">Resource Type</span>
            <span className="text-[#70FF5E] mt-1 block font-bold">{audit.resourceType}</span>
          </div>

          <div>
            <span className="text-[10px] text-[#4D5C50] uppercase block">Resource ID</span>
            <span className="text-white mt-1 block truncate">{audit.resourceId}</span>
          </div>

          <div>
            <span className="text-[10px] text-[#4D5C50] uppercase block">Request ID</span>
            <span className="text-[#8B9C8D] mt-1 block truncate">{audit.requestId}</span>
          </div>

          <div>
            <span className="text-[10px] text-[#4D5C50] uppercase block">Session ID</span>
            <span className="text-sky-300 mt-1 block truncate">{audit.sessionId}</span>
          </div>

          <div>
            <span className="text-[10px] text-[#4D5C50] uppercase block">Source Subsystem</span>
            <span className="text-white mt-1 block">{audit.source}</span>
          </div>

          <div>
            <span className="text-[10px] text-[#4D5C50] uppercase block">IP Address</span>
            <span className="text-[#8B9C8D] mt-1 block">{audit.ipAddress || 'Internal Bus'}</span>
          </div>
        </div>
      </div>

      {/* Cryptographic Before & After State Hashes */}
      <div className="p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-4 font-mono text-xs">
        <h2 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#70FF5E]" />
          <span>Cryptographic State Signatures (SHA-256)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-black/60 border border-white/5 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#8B9C8D] uppercase">Before State Hash:</span>
              <button
                onClick={() => copyHash(audit.beforeHash, true)}
                className="flex items-center gap-1 text-[10px] text-[#4D5C50] hover:text-white transition-colors"
              >
                {copiedBefore ? <Check className="w-3 h-3 text-[#70FF5E]" /> : <Copy className="w-3 h-3" />}
                <span>{copiedBefore ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="text-[10px] text-sky-400 break-all font-mono">
              {audit.beforeHash || 'sha256:0000000000000000000000000000000000000000000000000000000000000000'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-black/60 border border-white/5 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#8B9C8D] uppercase">After State Hash:</span>
              <button
                onClick={() => copyHash(audit.afterHash, false)}
                className="flex items-center gap-1 text-[10px] text-[#4D5C50] hover:text-white transition-colors"
              >
                {copiedAfter ? <Check className="w-3 h-3 text-[#70FF5E]" /> : <Copy className="w-3 h-3" />}
                <span>{copiedAfter ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="text-[10px] text-[#70FF5E] break-all font-mono">
              {audit.afterHash || 'sha256:0000000000000000000000000000000000000000000000000000000000000000'}
            </div>
          </div>
        </div>
      </div>

      {/* Redacted Metadata Payload */}
      {audit.metadata && (
        <div className="p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <h2 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-400" />
              <span>Event Metadata (Sensitive Fields Redacted)</span>
            </h2>
            <span className="text-[10px] text-amber-400">CREDENTIALS MASKED: [REDACTED]</span>
          </div>
          <pre className="p-4 rounded-xl bg-black/80 border border-white/5 text-[11px] text-sky-300 overflow-x-auto">
            <code>{maskSensitiveValues(JSON.stringify(audit.metadata, null, 2))}</code>
          </pre>
        </div>
      )}

      {/* Cross-Navigation: Related Resources */}
      <div className="p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-4 font-mono text-xs">
        <h2 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#70FF5E]" />
          <span>Related Entity Cross-Navigation</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {audit.relatedAgentId && (
            <Link
              to={`/console/agents/${audit.relatedAgentId}`}
              className="p-3.5 rounded-xl bg-black/40 hover:bg-white/5 border border-white/5 hover:border-white/20 transition-all flex items-center justify-between group"
            >
              <div>
                <span className="text-[10px] text-[#4D5C50] uppercase block">Related Agent</span>
                <span className="text-white font-bold group-hover:text-[#70FF5E] transition-colors">
                  {audit.relatedAgentId}
                </span>
              </div>
              <ExternalLink className="w-4 h-4 text-[#8B9C8D] group-hover:text-white transition-colors" />
            </Link>
          )}

          {audit.sessionId && (
            <Link
              to={`/console/sessions/${audit.sessionId}`}
              className="p-3.5 rounded-xl bg-black/40 hover:bg-white/5 border border-white/5 hover:border-white/20 transition-all flex items-center justify-between group"
            >
              <div>
                <span className="text-[10px] text-[#4D5C50] uppercase block">Related Session</span>
                <span className="text-white font-bold group-hover:text-sky-400 transition-colors">
                  {audit.sessionId}
                </span>
              </div>
              <ExternalLink className="w-4 h-4 text-[#8B9C8D] group-hover:text-white transition-colors" />
            </Link>
          )}

          {audit.relatedToolId && (
            <Link
              to={`/console/tools/${audit.relatedToolId}`}
              className="p-3.5 rounded-xl bg-black/40 hover:bg-white/5 border border-white/5 hover:border-white/20 transition-all flex items-center justify-between group"
            >
              <div>
                <span className="text-[10px] text-[#4D5C50] uppercase block">Related Tool</span>
                <span className="text-white font-bold group-hover:text-[#70FF5E] transition-colors">
                  {audit.relatedToolId}
                </span>
              </div>
              <ExternalLink className="w-4 h-4 text-[#8B9C8D] group-hover:text-white transition-colors" />
            </Link>
          )}

          {audit.relatedDecisionId && (
            <Link
              to={`/console/decisions/${audit.relatedDecisionId}`}
              className="p-3.5 rounded-xl bg-black/40 hover:bg-white/5 border border-white/5 hover:border-white/20 transition-all flex items-center justify-between group"
            >
              <div>
                <span className="text-[10px] text-[#4D5C50] uppercase block">Related Decision</span>
                <span className="text-white font-bold group-hover:text-amber-400 transition-colors">
                  {audit.relatedDecisionId}
                </span>
              </div>
              <ExternalLink className="w-4 h-4 text-[#8B9C8D] group-hover:text-white transition-colors" />
            </Link>
          )}

          {audit.relatedApprovalId && (
            <Link
              to={`/console/approvals/${audit.relatedApprovalId}`}
              className="p-3.5 rounded-xl bg-black/40 hover:bg-white/5 border border-white/5 hover:border-white/20 transition-all flex items-center justify-between group"
            >
              <div>
                <span className="text-[10px] text-[#4D5C50] uppercase block">Related Approval</span>
                <span className="text-white font-bold group-hover:text-amber-400 transition-colors">
                  {audit.relatedApprovalId}
                </span>
              </div>
              <ExternalLink className="w-4 h-4 text-[#8B9C8D] group-hover:text-white transition-colors" />
            </Link>
          )}

          {audit.relatedAttackChainId && (
            <Link
              to={`/console/attack-chains/${audit.relatedAttackChainId}`}
              className="p-3.5 rounded-xl bg-black/40 hover:bg-white/5 border border-white/5 hover:border-white/20 transition-all flex items-center justify-between group"
            >
              <div>
                <span className="text-[10px] text-[#4D5C50] uppercase block">Related Attack Chain</span>
                <span className="text-white font-bold group-hover:text-red-400 transition-colors">
                  {audit.relatedAttackChainId}
                </span>
              </div>
              <ExternalLink className="w-4 h-4 text-[#8B9C8D] group-hover:text-white transition-colors" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
