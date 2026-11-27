/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * VantaCore Quarantine Details View
 * Deep inspection of isolated or withheld tool result payloads, warnings for scan failures, and cross-navigation.
 */

import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  AlertOctagon,
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  FileX,
  FileText,
  Layers,
  Wrench,
  Bot,
  Scale,
  GitBranch,
  Copy,
  Check,
  History,
} from 'lucide-react';
import { useQuarantinedResult } from '../../api';
import {
  ToolResultActionBadge,
  ScanStatusBadge,
  DetectorStatusBadge,
} from '../../components/common/SecurityBadges';
import { maskSensitiveValues } from '../../lib/enforcementLogic';

export const QuarantineDetailsView: React.FC = () => {
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();

  const { data: item, isLoading, isError, error } = useQuarantinedResult(resultId);

  // Preview tab state: 'REDACTED' | 'RAW' | 'METADATA'
  const [activeTab, setActiveTab] = useState<'REDACTED' | 'RAW' | 'METADATA'>('REDACTED');
  const [hasAcknowledgedRawWarning, setHasAcknowledgedRawWarning] = useState(false);
  const [copied, setCopied] = useState(false);

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

  if (isError || !item) {
    return (
      <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/30 text-center max-w-[700px] mx-auto space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-lg font-bold text-white font-mono">Quarantine Record Not Found</h2>
        <p className="text-xs text-[#8B9C8D] font-mono">
          Could not locate quarantine artifact with identifier "{resultId}".
        </p>
        <Link
          to="/console/quarantine"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white font-mono text-xs hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Quarantine Vault
        </Link>
      </div>
    );
  }

  // Warning conditions: UNSCANNABLE, OVER_LIMIT, ERROR
  const hasScannerWarning =
    item.scanStatus === 'UNSCANNABLE' ||
    item.scanStatus === 'OVER_LIMIT' ||
    item.scanStatus === 'ERROR';

  const formatBytes = (bytes: number) => {
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(2)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-[1440px] mx-auto pb-12">
      {/* Back button & Audit link */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/console/quarantine')}
          className="inline-flex items-center gap-2 text-xs font-mono text-[#8B9C8D] hover:text-[#70FF5E] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO QUARANTINE VAULT</span>
        </button>

        <Link
          to={`/console/audit?resourceType=QUARANTINE&resourceId=${item.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white transition-colors"
        >
          <History className="w-3.5 h-3.5 text-[#70FF5E]" />
          <span>Quarantine Audit Trail</span>
        </Link>
      </div>

      {/* Warning Banners for Scan Status failures */}
      {hasScannerWarning && (
        <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs font-mono">
            <div className="font-bold text-white uppercase tracking-wider">
              {item.scanStatus === 'UNSCANNABLE' && 'WARNING: PAYLOAD UNSCANNABLE'}
              {item.scanStatus === 'OVER_LIMIT' && 'WARNING: INSPECTION OVER LIMIT (EXCEEDED 10MB BUFFER)'}
              {item.scanStatus === 'ERROR' && 'WARNING: SCANNER ENGINE FAULT OCCURRED'}
            </div>
            <p className="text-[#EDEDED] font-sans">
              {item.scanStatus === 'UNSCANNABLE' &&
                'The payload structure could not be parsed by automated semantic heuristics. Result permanently quarantined to avoid uninspected code execution.'}
              {item.scanStatus === 'OVER_LIMIT' &&
                'Payload size exceeds inline real-time gateway inspection ceiling. The complete payload was withheld from agent memory and held for out-of-band deep forensic inspection.'}
              {item.scanStatus === 'ERROR' &&
                'The payload inspection scanner encountered an unhandled exception (e.g. decompression bomb or malformed archive format). Zero-Trust failsafe blocked delivery.'}
            </p>
          </div>
        </div>
      )}

      {/* Header Profile */}
      <div className="p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30 shrink-0">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[10px] font-mono text-[#8B9C8D] uppercase tracking-wider">
                  QUARANTINE RECORD:
                </span>
                <span className="text-xs font-mono font-bold text-white select-all">{item.id}</span>
                <span className="text-white/20">•</span>
                <span className="text-[10px] font-mono text-[#8B9C8D]">{item.quarantinedAt}</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {item.quarantineReason}
              </h1>
              <p className="text-xs text-[#8B9C8D] font-mono mt-1">
                Tool: <span className="text-[#70FF5E]">{item.toolName}</span> | Operation:{' '}
                <span className="text-white">{item.operation || 'FETCH'}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ToolResultActionBadge action={item.sanitizedAction} />
            <ScanStatusBadge status={item.scanStatus} />
          </div>
        </div>

        {/* Frontend Authority Rule Note */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-[#8B9C8D]">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-red-400" />
            <span className="text-red-400 font-bold">FRONTEND AUTHORITY RULE:</span> Quarantined payloads cannot be force-delivered from the client.
          </span>
          <span>Size: {formatBytes(item.sizeBytes)}</span>
        </div>
      </div>

      {/* Main Grid: Details & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Secure Payload Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-4">
            {/* Tab navigation */}
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('REDACTED')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                    activeTab === 'REDACTED'
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : 'text-[#8B9C8D] hover:text-white'
                  }`}
                >
                  REDACTED PREVIEW (SAFE)
                </button>
                <button
                  onClick={() => setActiveTab('RAW')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                    activeTab === 'RAW'
                      ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                      : 'text-[#8B9C8D] hover:text-white'
                  }`}
                >
                  RAW ISOLATED SAMPLE
                </button>
                <button
                  onClick={() => setActiveTab('METADATA')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                    activeTab === 'METADATA'
                      ? 'bg-white/10 text-white border border-white/20'
                      : 'text-[#8B9C8D] hover:text-white'
                  }`}
                >
                  STRUCTURED METADATA
                </button>
              </div>

              <button
                onClick={() => handleCopy(maskSensitiveValues(item.redactedSample || item.rawSample))}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#8B9C8D] hover:text-white transition-colors"
                title="Copy sample"
              >
                {copied ? <Check className="w-4 h-4 text-[#70FF5E]" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Redacted View */}
            {activeTab === 'REDACTED' && (
              <div className="space-y-2">
                <div className="text-[10px] font-mono text-amber-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Secrets, adversarial prompts, and sensitive keys scrubbed by VantaCore gateway:</span>
                </div>
                <pre className="p-4 rounded-xl bg-black/60 border border-white/5 text-[11px] font-mono text-[#EDEDED] overflow-x-auto leading-relaxed max-h-[420px]">
                  <code>{maskSensitiveValues(item.redactedSample || item.rawSample)}</code>
                </pre>
              </div>
            )}

            {/* Raw View (With Warning) */}
            {activeTab === 'RAW' && (
              <div className="space-y-3">
                {!hasAcknowledgedRawWarning ? (
                  <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30 text-center space-y-3 font-mono text-xs">
                    <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
                    <div className="font-bold text-white uppercase tracking-wider">
                      Adversarial or Malicious Payload Notice
                    </div>
                    <p className="text-[#8B9C8D] max-w-md mx-auto font-sans">
                      This sample contains unneutralized prompt injection commands intercepted at the perimeter. Real secrets are masked by policy.
                    </p>
                    <button
                      onClick={() => setHasAcknowledgedRawWarning(true)}
                      className="px-4 py-2 rounded-lg bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 transition-colors font-bold"
                    >
                      REVEAL RAW ISOLATED CONTENT
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono text-red-400">
                      <span>RAW UNFILTERED SAMPLE (SECRETS REDACTED IN SANDBOX):</span>
                      <button
                        onClick={() => setHasAcknowledgedRawWarning(false)}
                        className="underline text-[#8B9C8D]"
                      >
                        Hide Raw
                      </button>
                    </div>
                    <pre className="p-4 rounded-xl bg-black/60 border border-red-500/30 text-[11px] font-mono text-red-200 overflow-x-auto leading-relaxed max-h-[420px]">
                      <code>{maskSensitiveValues(item.rawSample)}</code>
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Metadata Tab */}
            {activeTab === 'METADATA' && (
              <div className="space-y-3 font-mono text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
                    <span className="text-[10px] text-[#8B9C8D]">CONTENT TYPE</span>
                    <div className="text-white font-medium">{item.contentType || 'application/json'}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
                    <span className="text-[10px] text-[#8B9C8D]">PAYLOAD SIZE</span>
                    <div className="text-white font-medium">{formatBytes(item.sizeBytes)} ({item.sizeBytes} bytes)</div>
                  </div>
                  <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
                    <span className="text-[10px] text-[#8B9C8D]">SENSITIVITY CLASSIFICATION</span>
                    <div className="text-amber-400 font-medium">{item.sensitivity || 'RESTRICTED'}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
                    <span className="text-[10px] text-[#8B9C8D]">DETECTED TAINT TYPE</span>
                    <div className="text-red-400 font-medium">{item.detectedTaintType || 'UNKNOWN_TAINT'}</div>
                  </div>
                </div>

                {item.reasonCodes && item.reasonCodes.length > 0 && (
                  <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-2">
                    <span className="text-[10px] text-[#8B9C8D]">REASON CODES:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {item.reasonCodes.map((code) => (
                        <span
                          key={code}
                          className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white text-[10px]"
                        >
                          {code}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Signals in this Quarantine event */}
          {item.signals && item.signals.length > 0 && (
            <div className="p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-4">
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider pb-3 border-b border-white/5">
                Triggering Security Signals ({item.signals.length})
              </h3>
              <div className="space-y-2.5 font-mono text-xs">
                {item.signals.map((sig) => (
                  <div key={sig.id} className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-red-400">{sig.detectorName}</span>
                      <DetectorStatusBadge status={sig.status} />
                    </div>
                    <p className="text-[11px] text-[#EDEDED] font-sans">{sig.details}</p>
                    {sig.matchedRule && (
                      <div className="text-[10px] text-[#4D5C50]">Matched Rule: {sig.matchedRule}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Cross-Navigation & Origin Context */}
        <div className="space-y-6">
          {/* Origin Details */}
          <div className="p-5 rounded-2xl bg-[#080B08] border border-white/10 space-y-4 font-mono text-xs">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider pb-3 border-b border-white/5">
              Origin Execution Context
            </h4>

            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] text-[#8B9C8D]">TARGET AGENT</span>
                <div>
                  <Link
                    to={`/console/agents/${item.agentId}`}
                    className="text-white font-bold hover:text-[#70FF5E] transition-colors flex items-center gap-1.5"
                  >
                    <Bot className="w-3.5 h-3.5 text-[#70FF5E]" />
                    <span>{item.agentName || item.agentId}</span>
                  </Link>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-[#8B9C8D]">ORIGINATING TOOL</span>
                <div>
                  <Link
                    to={`/console/tools/${item.toolId || item.toolName}`}
                    className="text-[#70FF5E] hover:underline flex items-center gap-1.5"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>{item.toolName}</span>
                  </Link>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-[#8B9C8D]">SESSION TIMELINE</span>
                <div>
                  <Link
                    to={`/console/sessions/${item.sessionId}`}
                    className="text-white hover:text-[#70FF5E] transition-colors flex items-center gap-1.5"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span className="truncate">{item.sessionId}</span>
                  </Link>
                </div>
              </div>

              {item.relatedRequestId && (
                <div className="space-y-1">
                  <span className="text-[10px] text-[#8B9C8D]">REQUEST ID</span>
                  <div className="text-[#EDEDED]">{item.relatedRequestId}</div>
                </div>
              )}
            </div>
          </div>

          {/* Investigation Links */}
          <div className="p-5 rounded-2xl bg-[#080B08] border border-white/10 space-y-4">
            <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider pb-3 border-b border-white/5">
              Investigation Cross-Links
            </h4>

            <div className="space-y-2.5 font-mono text-xs">
              {/* Decision */}
              {item.relatedDecisionId && (
                <Link
                  to={`/console/decisions/${item.relatedDecisionId}`}
                  className="p-3 rounded-xl bg-black/40 border border-white/5 hover:border-[#70FF5E]/30 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-[#70FF5E]" />
                    <div>
                      <div className="font-bold text-white group-hover:text-[#70FF5E]">Decision Record</div>
                      <div className="text-[10px] text-[#8B9C8D]">{item.relatedDecisionId}</div>
                    </div>
                  </div>
                  <ArrowLeft className="w-3.5 h-3.5 text-[#8B9C8D] group-hover:text-white rotate-180" />
                </Link>
              )}

              {/* Attack Chain */}
              {item.relatedAttackChainId && (
                <Link
                  to={`/console/attack-chains/${item.relatedAttackChainId}`}
                  className="p-3 rounded-xl bg-black/40 border border-white/5 hover:border-red-500/30 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-red-400" />
                    <div>
                      <div className="font-bold text-white group-hover:text-red-400">Attack Chain Graph</div>
                      <div className="text-[10px] text-[#8B9C8D]">{item.relatedAttackChainId}</div>
                    </div>
                  </div>
                  <ArrowLeft className="w-3.5 h-3.5 text-[#8B9C8D] group-hover:text-white rotate-180" />
                </Link>
              )}

              {/* Tool Profile */}
              <Link
                to={`/console/tools/${item.toolId || item.toolName}`}
                className="p-3 rounded-xl bg-black/40 border border-white/5 hover:border-[#70FF5E]/30 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-[#70FF5E]" />
                  <div>
                    <div className="font-bold text-white group-hover:text-[#70FF5E]">Tool Registry</div>
                    <div className="text-[10px] text-[#8B9C8D]">{item.toolName}</div>
                  </div>
                </div>
                <ArrowLeft className="w-3.5 h-3.5 text-[#8B9C8D] group-hover:text-white rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
