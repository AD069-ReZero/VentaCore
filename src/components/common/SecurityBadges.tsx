/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * VantaCore Shared Security Badges
 * Strict visual design matching VantaCore dark cybernetic design language.
 */

import React from 'react';
import {
  RiskLevel,
  Decision,
  ApprovalState,
  AssuranceTier,
  SessionSource,
  DetectorStatus,
  EvaluatedRisk,
  EvaluatedDecision,
  DestinationTrust,
} from '../../types/security';

interface BaseBadgeProps {
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

export const RiskBadge: React.FC<BaseBadgeProps & { risk: EvaluatedRisk | string }> = ({
  risk,
  size = 'md',
  pulse = false,
  className = '',
}) => {
  const normalized = (risk || '').toUpperCase();

  let styles = 'bg-white/5 text-[#8B9C8D] border-white/10';
  let dotColor = 'bg-[#8B9C8D]';

  if (normalized === 'CRITICAL') {
    styles = 'bg-red-500/10 text-red-400 border-red-500/30';
    dotColor = 'bg-red-500';
  } else if (normalized === 'HIGH') {
    styles = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    dotColor = 'bg-amber-500';
  } else if (normalized === 'MEDIUM') {
    styles = 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
    dotColor = 'bg-yellow-500';
  } else if (normalized === 'LOW' || normalized === 'INFO') {
    styles = 'bg-[#70FF5E]/10 text-[#70FF5E] border-[#70FF5E]/30';
    dotColor = 'bg-[#70FF5E]';
  } else if (normalized === 'NOT_EVALUATED' || normalized === 'NOT EVALUATED') {
    styles = 'bg-white/5 text-[#4D5C50] border-white/10';
    dotColor = 'bg-[#4D5C50]';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-mono font-medium tracking-wider border ${styles} ${sizeClasses} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${dotColor} ${pulse ? 'animate-pulse' : ''}`}
      />
      <span>{normalized.replace('_', ' ')}</span>
    </span>
  );
};

export const DecisionBadge: React.FC<BaseBadgeProps & { decision: EvaluatedDecision | string }> = ({
  decision,
  size = 'md',
  className = '',
}) => {
  const normalized = (decision || '').toUpperCase();

  let styles = 'bg-white/5 text-[#8B9C8D] border-white/10';
  let dotColor = 'bg-[#8B9C8D]';

  if (normalized === 'BLOCK' || normalized === 'BLOCKED') {
    styles = 'bg-red-500/15 text-red-400 border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
    dotColor = 'bg-red-500';
  } else if (normalized === 'REVIEW' || normalized === 'HOLD') {
    styles = 'bg-amber-500/15 text-amber-400 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]';
    dotColor = 'bg-amber-500';
  } else if (normalized === 'ALLOW' || normalized === 'ALLOWED') {
    styles = 'bg-[#70FF5E]/15 text-[#70FF5E] border-[#70FF5E]/40 shadow-[0_0_10px_rgba(112,255,94,0.15)]';
    dotColor = 'bg-[#70FF5E]';
  } else if (normalized === 'NOT_AVAILABLE' || normalized === 'NOT EVALUATED') {
    styles = 'bg-white/5 text-[#4D5C50] border-white/10';
    dotColor = 'bg-[#4D5C50]';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-mono font-medium tracking-wider border ${styles} ${sizeClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{normalized.replace('_', ' ')}</span>
    </span>
  );
};

export const SourceBadge: React.FC<BaseBadgeProps & { source: SessionSource | string }> = ({
  source,
  size = 'md',
  className = '',
}) => {
  const normalized = (source || '').toUpperCase();

  let styles = 'bg-white/5 text-white/70 border-white/10';
  if (normalized === 'REAL') {
    styles = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  } else if (normalized === 'MOCK') {
    styles = 'bg-purple-500/10 text-purple-400 border-purple-500/30';
  } else if (normalized === 'REPLAY') {
    styles = 'bg-sky-500/10 text-sky-400 border-sky-500/30';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-mono font-medium tracking-wider border ${styles} ${sizeClasses} ${className}`}
    >
      <span>{normalized}</span>
    </span>
  );
};

export const AssuranceTierBadge: React.FC<BaseBadgeProps & { tier: AssuranceTier | string }> = ({
  tier,
  size = 'md',
  className = '',
}) => {
  const normalized = (tier || '').toUpperCase();
  const isEnforced = normalized === 'ENFORCED';

  const styles = isEnforced
    ? 'bg-[#70FF5E]/10 text-[#70FF5E] border-[#70FF5E]/30'
    : 'bg-white/5 text-[#8B9C8D] border-white/15';

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-mono font-medium tracking-wider border ${styles} ${sizeClasses} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${isEnforced ? 'bg-[#70FF5E]' : 'bg-[#8B9C8D]'}`}
      />
      <span>{normalized}</span>
    </span>
  );
};

export const ApprovalStatusBadge: React.FC<BaseBadgeProps & { state: ApprovalState | string }> = ({
  state,
  size = 'md',
  className = '',
}) => {
  const normalized = (state || '').toUpperCase();

  let styles = 'bg-white/5 text-[#8B9C8D] border-white/10';
  let dot = 'bg-[#8B9C8D]';

  if (normalized === 'PENDING') {
    styles = 'bg-amber-500/15 text-amber-400 border-amber-500/40 animate-pulse';
    dot = 'bg-amber-400';
  } else if (normalized === 'APPROVED') {
    styles = 'bg-[#70FF5E]/15 text-[#70FF5E] border-[#70FF5E]/30';
    dot = 'bg-[#70FF5E]';
  } else if (normalized === 'CONSUMED') {
    styles = 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
    dot = 'bg-cyan-400';
  } else if (normalized === 'REJECTED' || normalized === 'CANCELLED' || normalized === 'INVALIDATED') {
    styles = 'bg-red-500/15 text-red-400 border-red-500/30';
    dot = 'bg-red-400';
  } else if (normalized === 'EXPIRED') {
    styles = 'bg-white/5 text-[#4D5C50] border-white/10';
    dot = 'bg-[#4D5C50]';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-mono font-medium tracking-wider border ${styles} ${sizeClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      <span>{normalized}</span>
    </span>
  );
};

export const ApprovalStateBadge = ApprovalStatusBadge;
export const AssuranceBadge = AssuranceTierBadge;

export const ToolStatusBadge: React.FC<BaseBadgeProps & { status: string }> = ({
  status,
  size = 'md',
  className = '',
}) => {
  const normalized = (status || '').toUpperCase();
  let styles = 'bg-white/5 text-[#8B9C8D] border-white/10';
  let dot = 'bg-[#8B9C8D]';

  if (normalized === 'ACTIVE') {
    styles = 'bg-[#70FF5E]/10 text-[#70FF5E] border-[#70FF5E]/30';
    dot = 'bg-[#70FF5E]';
  } else if (normalized === 'DISABLED') {
    styles = 'bg-white/5 text-[#4D5C50] border-white/10';
    dot = 'bg-[#4D5C50]';
  } else if (normalized === 'QUARANTINED') {
    styles = 'bg-red-500/15 text-red-400 border-red-500/30 animate-pulse';
    dot = 'bg-red-500';
  } else if (normalized === 'PENDING_REVIEW') {
    styles = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    dot = 'bg-amber-400';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-mono font-medium tracking-wider border ${styles} ${sizeClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      <span>{normalized.replace('_', ' ')}</span>
    </span>
  );
};

export const CapabilityBadge: React.FC<BaseBadgeProps & { capability: string }> = ({
  capability,
  size = 'sm',
  className = '',
}) => {
  const cap = (capability || '').toUpperCase();
  let color = 'text-[#8B9C8D] bg-white/5 border-white/10';

  if (cap.startsWith('DATABASE')) {
    color = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/25';
  } else if (cap.startsWith('FILE')) {
    color = 'text-amber-400 bg-amber-500/10 border-amber-500/25';
  } else if (cap.startsWith('SHELL') || cap.startsWith('CODE')) {
    color = 'text-red-400 bg-red-500/10 border-red-500/30';
  } else if (cap.startsWith('HTTP') || cap.startsWith('EMAIL')) {
    color = 'text-purple-400 bg-purple-500/10 border-purple-500/25';
  } else if (cap.startsWith('SECRET') || cap.startsWith('IDENTITY')) {
    color = 'text-pink-400 bg-pink-500/10 border-pink-500/25';
  } else if (cap.startsWith('FINANCIAL')) {
    color = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25';
  } else if (cap.startsWith('CLOUD')) {
    color = 'text-blue-400 bg-blue-500/10 border-blue-500/25';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center rounded font-mono font-medium tracking-wider border ${color} ${sizeClasses} ${className}`}
    >
      {cap}
    </span>
  );
};

export const ToolResultActionBadge: React.FC<BaseBadgeProps & { action: string }> = ({
  action,
  size = 'md',
  className = '',
}) => {
  const act = (action || '').toUpperCase();
  let styles = 'bg-white/5 text-[#8B9C8D] border-white/10';
  let dot = 'bg-[#8B9C8D]';

  if (act === 'DELIVER') {
    styles = 'bg-[#70FF5E]/15 text-[#70FF5E] border-[#70FF5E]/30';
    dot = 'bg-[#70FF5E]';
  } else if (act === 'DELIVER_REDACTED') {
    styles = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    dot = 'bg-amber-400';
  } else if (act === 'QUARANTINE') {
    styles = 'bg-rose-500/15 text-rose-400 border-rose-500/30 animate-pulse';
    dot = 'bg-rose-500';
  } else if (act === 'BLOCK_RESULT') {
    styles = 'bg-red-500/20 text-red-400 border-red-500/40';
    dot = 'bg-red-500';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-mono font-medium tracking-wider border ${styles} ${sizeClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      <span>{act.replace('_', ' ')}</span>
    </span>
  );
};

export const ScanStatusBadge: React.FC<BaseBadgeProps & { status: string }> = ({
  status,
  size = 'md',
  className = '',
}) => {
  const norm = (status || '').toUpperCase();
  let styles = 'bg-white/5 text-[#8B9C8D] border-white/10';
  let dot = 'bg-[#8B9C8D]';

  if (norm === 'SCANNED') {
    styles = 'bg-[#70FF5E]/10 text-[#70FF5E] border-[#70FF5E]/30';
    dot = 'bg-[#70FF5E]';
  } else if (norm === 'PARTIALLY_SCANNED') {
    styles = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    dot = 'bg-amber-400';
  } else if (norm === 'UNSCANNABLE') {
    styles = 'bg-orange-500/15 text-orange-400 border-orange-500/30';
    dot = 'bg-orange-400';
  } else if (norm === 'OVER_LIMIT') {
    styles = 'bg-purple-500/15 text-purple-400 border-purple-500/30';
    dot = 'bg-purple-400';
  } else if (norm === 'ERROR') {
    styles = 'bg-red-500/15 text-red-400 border-red-500/30';
    dot = 'bg-red-500';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-mono font-medium tracking-wider border ${styles} ${sizeClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      <span>{norm.replace('_', ' ')}</span>
    </span>
  );
};

export const DetectorStatusBadge: React.FC<BaseBadgeProps & { status: DetectorStatus | string }> = ({
  status,
  size = 'sm',
  className = '',
}) => {
  const normalized = (status || '').toUpperCase();

  let styles = 'bg-white/5 text-[#8B9C8D] border-white/10';
  if (normalized === 'OK') {
    styles = 'bg-[#70FF5E]/10 text-[#70FF5E] border-[#70FF5E]/30';
  } else if (normalized === 'ERROR' || normalized === 'KILLED_RESOURCE_LIMIT') {
    styles = 'bg-red-500/10 text-red-400 border-red-500/30';
  } else if (normalized === 'TIMEOUT' || normalized === 'SKIPPED') {
    styles = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-mono font-medium tracking-wider border ${styles} ${sizeClasses} ${className}`}
    >
      <span>{normalized.replace('_', ' ')}</span>
    </span>
  );
};

export const DestinationTrustBadge: React.FC<
  BaseBadgeProps & { trust?: DestinationTrust | string }
> = ({
  trust = 'NOT_APPLICABLE',
  size = 'sm',
  className = '',
}) => {
  const norm = (trust || 'NOT_APPLICABLE').toUpperCase();
  let styles = 'bg-white/5 text-[#8B9C8D] border-white/10';
  let dot = 'bg-[#8B9C8D]';

  if (norm === 'INTERNAL_TRUSTED') {
    styles = 'bg-[#70FF5E]/10 text-[#70FF5E] border-[#70FF5E]/30';
    dot = 'bg-[#70FF5E]';
  } else if (norm === 'APPROVED_EXTERNAL_OWNED') {
    styles = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
    dot = 'bg-cyan-400';
  } else if (norm === 'UNKNOWN_EXTERNAL') {
    styles = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    dot = 'bg-amber-400';
  } else if (norm === 'UNTRUSTED_EXTERNAL' || norm === 'DENIED') {
    styles = 'bg-red-500/15 text-red-400 border-red-500/30';
    dot = 'bg-red-500';
  } else if (norm === 'NOT_APPLICABLE') {
    styles = 'bg-white/5 text-[#4D5C50] border-white/10';
    dot = 'bg-[#4D5C50]';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-mono font-medium tracking-wider border ${styles} ${sizeClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      <span>{norm.replace(/_/g, ' ')}</span>
    </span>
  );
};

export const HttpMethodBadge: React.FC<BaseBadgeProps & { method: string }> = ({
  method,
  size = 'md',
  className = '',
}) => {
  const norm = (method || 'GET').toUpperCase();
  let styles = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
  let label = norm;

  if (norm === 'POST') {
    styles = 'bg-[#70FF5E]/10 text-[#70FF5E] border-[#70FF5E]/30';
    label = 'POST';
  } else if (norm === 'PUT') {
    styles = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    label = 'PUT';
  } else if (norm === 'PATCH') {
    styles = 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
    label = 'PATCH';
  } else if (norm === 'DELETE') {
    styles = 'bg-red-500/15 text-red-400 border-red-500/30 font-semibold';
    label = 'DELETE';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-mono font-medium tracking-wider border ${styles} ${sizeClasses} ${className}`}
      title={`HTTP Method: ${norm}`}
    >
      <span>{label}</span>
    </span>
  );
};

export const SideEffectRiskBadge: React.FC<BaseBadgeProps & { risk: string }> = ({
  risk,
  size = 'md',
  className = '',
}) => {
  const norm = (risk || 'NONE').toUpperCase();
  let styles = 'bg-white/5 text-[#8B9C8D] border-white/10';
  let dot = 'bg-[#8B9C8D]';

  if (norm === 'CRITICAL') {
    styles = 'bg-red-500/15 text-red-400 border-red-500/40 font-semibold';
    dot = 'bg-red-500 animate-ping';
  } else if (norm === 'HIGH') {
    styles = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    dot = 'bg-amber-500';
  } else if (norm === 'MEDIUM') {
    styles = 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
    dot = 'bg-yellow-500';
  } else if (norm === 'LOW') {
    styles = 'bg-[#70FF5E]/10 text-[#70FF5E] border-[#70FF5E]/30';
    dot = 'bg-[#70FF5E]';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-mono font-medium tracking-wider border ${styles} ${sizeClasses} ${className}`}
      title={`Side-Effect Risk: ${norm}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      <span>{norm} RISK</span>
    </span>
  );
};

export const OutcomeCertaintyBadge: React.FC<BaseBadgeProps & { certainty: string }> = ({
  certainty,
  size = 'md',
  className = '',
}) => {
  const norm = (certainty || 'CERTAIN').toUpperCase();
  const isCertain = norm === 'CERTAIN';

  const styles = isCertain
    ? 'bg-[#70FF5E]/10 text-[#70FF5E] border-[#70FF5E]/30'
    : 'bg-red-500/15 text-red-400 border-red-500/40 animate-pulse';
  const dot = isCertain ? 'bg-[#70FF5E]' : 'bg-red-500';

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-mono font-medium tracking-wider border ${styles} ${sizeClasses} ${className}`}
      title={`Execution Certainty: ${norm}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      <span>{isCertain ? 'CERTAIN' : 'OUTCOME UNKNOWN'}</span>
    </span>
  );
};

export const ExecutionReceiptBadge: React.FC<BaseBadgeProps & { receiptId: string; hash?: string }> = ({
  receiptId,
  hash,
  size = 'md',
  className = '',
}) => {
  const truncatedId = receiptId.length > 12 ? `${receiptId.slice(0, 8)}...` : receiptId;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded font-mono font-medium tracking-wider border bg-purple-500/10 text-purple-300 border-purple-500/30 ${sizeClasses} ${className}`}
      title={hash ? `Receipt ID: ${receiptId} | Hash: ${hash}` : `Receipt ID: ${receiptId}`}
    >
      <span className="text-[10px] text-purple-400">RECEIPT:</span>
      <span>{truncatedId}</span>
    </span>
  );
};

