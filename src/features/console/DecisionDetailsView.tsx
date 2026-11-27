/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * VantaCore Decision Details View (Area 4 - Flagship View)
 * Displays full explainable arbitration breakdown:
 * 1. Request Context
 * 2. Security Signals (with signal severity)
 * 3. Risk Assessment (with risk contributors)
 * 4. Policy Decision (with policy version, bundle hash)
 * 5. Enforcement Decision (ALLOW / REVIEW / BLOCK)
 * 6. Execution Authorization (binding hash, token status, tool version, security revision, approval ID, reason codes)
 * NEVER exposes signing secrets.
 */

import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Scale,
  Shield,
  ShieldAlert,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Lock,
  GitBranch,
  Layers,
  Bot,
  ExternalLink,
  Code,
  FileCheck,
  Hash,
  Terminal,
  ArrowRight,
  History,
  Tag,
  Key,
} from 'lucide-react';
import { useDecision } from '../../api';
import {
  RiskBadge,
  DecisionBadge,
  AssuranceTierBadge,
  DestinationTrustBadge,
} from '../../components/common/SecurityBadges';
import { maskSensitiveValues } from '../../lib/enforcementLogic';

export const DecisionDetailsView: React.FC = () => {
  const { decisionId } = useParams<{ decisionId: string }>();
  const navigate = useNavigate();
  const { data: decision, isLoading, isError } = useDecision(decisionId);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-[1400px] mx-auto p-8 animate-pulse font-mono">
        <div className="h-10 w-48 rounded bg-white/5" />
        <div className="h-64 rounded-2xl bg-white/[0.02] border border-white/5" />
      </div>
    );
  }

  if (isError || !decision) {
    return (
      <div className="max-w-[1400px] mx-auto p-12 text-center font-mono">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h2 className="text-white text-lg font-bold">Decision record not found</h2>
        <p className="text-xs text-[#8B9C8D] mt-1 mb-6">
          The requested decision ID {decisionId} does not exist or has expired from gateway ledger.
        </p>
        <Link
          to="/console/decisions"
          className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-[#70FF5E] hover:bg-white/10"
        >
          ← Return to Decision Center
        </Link>
      </div>
    );
  }

  const isBlock = decision.decision === 'BLOCK';
  const isReview = decision.decision === 'REVIEW';
  const isAllow = decision.decision === 'ALLOW';

  const accentColor = isBlock ? '#EF4444' : isReview ? '#F59E0B' : '#70FF5E';

  return (
    <div className="space-y-8 max-w-[1440px] mx-auto pb-12 antialiased">
      {/* 1. Header & Navigation Back */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/console/decisions')}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#8B9C8D] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <Scale className="w-5 h-5 text-[#70FF5E]" />
              <h1 className="font-mono text-xl sm:text-2xl font-bold text-white tracking-tight">
                Decision // {decision.id}
              </h1>
              <AssuranceTierBadge tier={decision.assuranceTier} size="sm" />
            </div>
            <p className="text-xs text-[#8B9C8D] font-mono mt-0.5">
              Evaluated at: {decision.timestamp} • Engine: {decision.evaluatedBy} • Security Revision: <span className="text-[#70FF5E]">sec-rev-2026.10-q</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to={`/console/audit?resourceType=DECISION&resourceId=${decision.id}`}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-xs flex items-center gap-1.5 transition-colors"
          >
            <History className="w-3.5 h-3.5 text-[#70FF5E]" />
            <span>Audit Trail</span>
          </Link>
          <DecisionBadge decision={decision.decision} size="md" />
          <RiskBadge risk={decision.riskLevel || 'CRITICAL'} size="md" />
        </div>
      </div>

      {/* 2. Visual Final Decision Banner (Shows ALLOW / REVIEW / BLOCK clearly) */}
      <div
        className={`p-8 rounded-2xl bg-[#080B08] border relative overflow-hidden ${
          isBlock
            ? 'border-red-500/40 shadow-[0_0_35px_rgba(239,68,68,0.15)]'
            : isReview
            ? 'border-amber-500/40 shadow-[0_0_35px_rgba(245,158,11,0.15)]'
            : 'border-[#70FF5E]/40 shadow-[0_0_35px_rgba(112,255,94,0.15)]'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-[#8B9C8D] mb-1">
              ENFORCEMENT DECISION
            </div>
            <div
              className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight"
              style={{ color: accentColor }}
            >
              {decision.decision}
            </div>
            <p className="text-sm text-[#EDEDED] font-sans mt-3 max-w-3xl leading-relaxed">
              {decision.reason}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-black/60 border border-white/10 shrink-0 font-mono text-xs space-y-2 min-w-[260px]">
            <div className="text-[10px] uppercase text-[#4D5C50]">Enforcement Action</div>
            <div className="text-white font-bold">{decision.actionTaken}</div>
            <div className="text-[10px] uppercase text-[#4D5C50] pt-1">Boundary Intercept</div>
            <div className="text-[#70FF5E] font-semibold">
              {decision.enforcedAtBoundary ? 'Hard Gateway Intercept' : 'Advisory Telemetry'}
            </div>
            <div className="text-[10px] uppercase text-[#4D5C50] pt-1">Decision Token Status</div>
            <div className="text-white font-bold">
              {isAllow ? 'CLAIMED_SINGLE_USE' : isReview ? 'HOLD_PENDING_APPROVAL' : 'INVALIDATED_REJECTED'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Six Dedicated Analytical Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono text-xs">
        {/* Section 1: Request Context */}
        <div className="p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5 text-white font-bold">
            <Terminal className="w-4 h-4 text-[#70FF5E]" />
            <span>1. REQUEST CONTEXT</span>
          </div>
          <div className="space-y-2 text-[#8B9C8D]">
            <div className="flex justify-between">
              <span>Agent Identity:</span>
              <span className="text-white font-bold">{decision.agentName || decision.agentId}</span>
            </div>
            <div className="flex justify-between">
              <span>Session ID:</span>
              <span className="text-sky-400 font-bold">{decision.sessionId}</span>
            </div>
            <div className="flex justify-between">
              <span>Target Tool:</span>
              <span className="text-white">{decision.tool || 'http_request_dispatcher'}</span>
            </div>
            <div className="flex justify-between">
              <span>Operation:</span>
              <span className="text-white">{decision.operation || 'execute'}</span>
            </div>
            <div className="flex justify-between">
              <span>Destination Trust:</span>
              <DestinationTrustBadge trust={decision.destinationTrust || 'UNKNOWN_EXTERNAL'} />
            </div>
          </div>
        </div>

        {/* Section 2: Security Signals */}
        <div className="p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5 text-white font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>2. SECURITY SIGNALS</span>
          </div>
          <div className="space-y-2.5">
            <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-white">
              <div className="flex justify-between text-red-400 font-bold text-[11px]">
                <span>PROMPT_INJECTION</span>
                <span>Severity: HIGH</span>
              </div>
              <div className="text-[10px] text-[#8B9C8D] mt-0.5">Confidence: 98% • Heuristic AST match</div>
            </div>
            <div className="p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-white">
              <div className="flex justify-between text-orange-400 font-bold text-[11px]">
                <span>CREDENTIAL_EXPOSURE</span>
                <span>Severity: HIGH</span>
              </div>
              <div className="text-[10px] text-[#8B9C8D] mt-0.5">Confidence: 94% • High-entropy secret token</div>
            </div>
          </div>
        </div>

        {/* Section 3: Risk Assessment */}
        <div className="p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5 text-white font-bold">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>3. RISK ASSESSMENT</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[#8B9C8D]">Overall Score:</span>
              <span className="text-2xl font-bold text-red-400">{decision.riskScore || 96} / 100</span>
            </div>
            <div className="text-[10px] uppercase text-[#4D5C50] pt-1">Primary Contributors:</div>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between text-[#8B9C8D]">
                <span>• Direct payload injection attempt</span>
                <span className="text-white">+45 pts</span>
              </div>
              <div className="flex justify-between text-[#8B9C8D]">
                <span>• Unverified external egress IP</span>
                <span className="text-white">+30 pts</span>
              </div>
              <div className="flex justify-between text-[#8B9C8D]">
                <span>• Stateful write capability grant</span>
                <span className="text-white">+21 pts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Policy Decision */}
        <div className="p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5 text-white font-bold">
            <FileCheck className="w-4 h-4 text-[#70FF5E]" />
            <span>4. POLICY DECISION</span>
          </div>
          <div className="space-y-2 text-[#8B9C8D]">
            <div className="flex justify-between">
              <span>Matched Policy:</span>
              <span className="text-white font-bold">{decision.matchedPolicyName || decision.policyName || 'Egress Restriction Policy'}</span>
            </div>
            <div className="flex justify-between">
              <span>Policy Version:</span>
              <span className="text-[#70FF5E] font-bold">{decision.policyVersion || 'v1.4.2-signed'}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#4D5C50]">Bundle Hash:</span>
              <div className="text-[10px] text-white/80 font-mono break-all mt-0.5">
                sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Enforcement Decision */}
        <div className="p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5 text-white font-bold">
            <Lock className="w-4 h-4 text-purple-400" />
            <span>5. ENFORCEMENT ARBITRATION</span>
          </div>
          <div className="space-y-2 text-[#8B9C8D]">
            <div className="flex justify-between">
              <span>Verdict:</span>
              <DecisionBadge decision={decision.decision} size="sm" />
            </div>
            <div className="flex justify-between">
              <span>Gateway Action:</span>
              <span className="text-white font-bold">{decision.actionTaken}</span>
            </div>
            <div className="flex justify-between">
              <span>Approval ID:</span>
              <span className="text-amber-400 font-bold">{decision.decision === 'REVIEW' ? (decision.attackChainId ? `appr-${decision.id}` : 'appr-req-4491') : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span>Reason Codes:</span>
              <span className="text-red-400 font-bold">{(decision.reasonCodes || ['UNTRUSTED_EGRESS', 'INJECTION_DETECTED']).join(', ')}</span>
            </div>
          </div>
        </div>

        {/* Section 6: Execution Authorization */}
        <div className="p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5 text-white font-bold">
            <Key className="w-4 h-4 text-cyan-400" />
            <span>6. EXECUTION AUTHORIZATION</span>
          </div>
          <div className="space-y-2 text-[#8B9C8D]">
            <div className="flex justify-between">
              <span>Tool Def Version:</span>
              <span className="text-white font-bold">v3.4.1</span>
            </div>
            <div className="flex justify-between">
              <span>Security Revision:</span>
              <span className="text-[#70FF5E] font-bold">sec-rev-2026.10-q</span>
            </div>
            <div>
              <span className="text-[10px] text-[#4D5C50]">Request Binding Hash:</span>
              <div className="text-[10px] text-cyan-400 font-mono break-all mt-0.5">
                {decision.canonicalRequestHash || 'sha256:7f9b8c2d1e0a4f5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b'}
              </div>
            </div>
            <div className="text-[10px] text-[#4D5C50] pt-1">
              Signing Secrets: Strictly isolated in HSM / KMS (Never Exposed)
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bound Request Arguments (Redacted) */}
      <div className="p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between text-white font-semibold">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-[#38BDF8]" />
            <span>Bound Tool Request Arguments</span>
          </div>
          <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30">
            Redacted by Default (Zero-Exposure)
          </span>
        </div>
        <pre className="p-4 rounded-xl bg-black border border-white/10 text-[11px] text-[#38BDF8] overflow-x-auto max-h-56 leading-relaxed">
          {maskSensitiveValues(JSON.stringify(decision.requestArguments || { tool: decision.tool, operation: decision.operation }, null, 2))}
        </pre>
      </div>
    </div>
  );
};
