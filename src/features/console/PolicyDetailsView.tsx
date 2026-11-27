/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * VantaCore Policy Details View
 * Detailed inspection of policy rules, condition visualization (IF... AND... THEN),
 * cryptographic bundle signatures, version history, and audit linkages.
 */

import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FileCheck,
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  History,
  Lock,
  FileCode2,
  CheckCircle2,
  ExternalLink,
  Sliders,
  Copy,
  Check,
  Clock,
  Sparkles,
  Scale,
} from 'lucide-react';
import { usePolicy, usePolicyDiff } from '../../api';
import { PolicyVersion, PolicyRule } from '../../types/security';
import {
  DecisionBadge,
  RiskBadge,
  AssuranceTierBadge,
} from '../../components/common/SecurityBadges';
import { PolicyDiffViewer } from '../../components/common/PolicyDiffViewer';
import { PolicyBacktestModal } from '../../components/common/PolicyBacktestModal';
import { GitCompare } from 'lucide-react';

export const PolicyDetailsView: React.FC = () => {
  const { policyId } = useParams<{ policyId: string }>();
  const navigate = useNavigate();
  const { data: policy, isLoading, isError, error } = usePolicy(policyId);

  // Selected version inspection state
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const [viewMode, setViewMode] = useState<'RULES' | 'DIFF'>('RULES');
  const [isBacktestOpen, setIsBacktestOpen] = useState(false);

  const { data: diff } = usePolicyDiff(policyId, 'v2.3.0', policy?.version || 'v2.4.1');

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-[1400px] mx-auto animate-pulse">
        <div className="h-6 w-32 bg-white/10 rounded" />
        <div className="h-48 bg-white/5 rounded-2xl border border-white/5" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-80 bg-white/5 rounded-2xl border border-white/5" />
          <div className="h-80 bg-white/5 rounded-2xl border border-white/5" />
        </div>
      </div>
    );
  }

  if (isError || !policy) {
    return (
      <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/30 text-center max-w-[800px] mx-auto space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-lg font-bold text-white font-mono">Policy Not Found</h2>
        <p className="text-xs text-[#8B9C8D] font-mono">
          {(error as Error)?.message || `Policy ID ${policyId} does not exist.`}
        </p>
        <Link
          to="/console/policies"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white font-mono text-xs hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Policies</span>
        </Link>
      </div>
    );
  }

  const activeVersion = policy.versions?.find(
    (v) => (selectedVersion ? v.version === selectedVersion : v.status === 'ACTIVE')
  ) || policy.versions?.[0];

  const handleCopyHash = () => {
    if (policy.bundleHash) {
      navigator.clipboard.writeText(policy.bundleHash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/console/policies"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#8B9C8D] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs text-[#70FF5E]">{policy.id}</span>
              <span className="text-[#4D5C50]">•</span>
              <span className="font-mono text-xs text-sky-400 font-semibold">{policy.version}</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  policy.status === 'ACTIVE'
                    ? 'bg-emerald-500/10 text-[#70FF5E] border border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}
              >
                {policy.status}
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
              {policy.name}
            </h1>
          </div>
        </div>

        {/* Cross-navigation actions */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setIsBacktestOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 font-mono text-xs flex items-center gap-2 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Dry-Run Backtest</span>
          </button>
          <Link
            to={`/console/decisions?policy=${policy.id}`}
            className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-xs flex items-center gap-2 transition-colors"
          >
            <Scale className="w-3.5 h-3.5 text-[#8B9C8D]" />
            <span>Decisions ({policy.enforcedHits || 0})</span>
          </Link>
          <Link
            to={`/console/audit?resourceType=POLICY&resourceId=${policy.id}`}
            className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-xs flex items-center gap-2 transition-colors"
          >
            <History className="w-3.5 h-3.5 text-[#70FF5E]" />
            <span>Audit Trail</span>
          </Link>
        </div>
      </div>

      {/* Hero Meta Card */}
      <div className="p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-6">
        <div>
          <span className="text-[10px] font-mono uppercase text-[#8B9C8D] tracking-wider">Policy Description</span>
          <p className="text-sm sm:text-base text-white/90 font-sans mt-1 leading-relaxed">
            {policy.description}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-6 border-t border-white/5 font-mono text-xs">
          <div>
            <span className="text-[10px] text-[#4D5C50] uppercase block">Priority</span>
            <RiskBadge risk={policy.priority || policy.severity || 'MEDIUM'} size="sm" className="mt-1" />
          </div>

          <div>
            <span className="text-[10px] text-[#4D5C50] uppercase block">Scope</span>
            <span className="text-white font-semibold mt-1 block">{policy.scope || 'GLOBAL'}</span>
          </div>

          <div>
            <span className="text-[10px] text-[#4D5C50] uppercase block">Default Action</span>
            <DecisionBadge decision={policy.actionOnMatch} size="sm" className="mt-1" />
          </div>

          <div>
            <span className="text-[10px] text-[#4D5C50] uppercase block">Created By</span>
            <span className="text-[#8B9C8D] truncate block mt-1 text-[11px]">{policy.author}</span>
          </div>

          <div>
            <span className="text-[10px] text-[#4D5C50] uppercase block">Updated At</span>
            <span className="text-white mt-1 block text-[11px]">
              {policy.updatedAt ? new Date(policy.updatedAt).toLocaleString() : 'N/A'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-[#4D5C50] uppercase block">Activated At</span>
            <span className="text-[#70FF5E] mt-1 block text-[11px]">
              {policy.activatedAt ? new Date(policy.activatedAt).toLocaleString() : 'Pending'}
            </span>
          </div>
        </div>

        {/* Cryptographic Signature & Bundle Hash */}
        <div className="p-4 rounded-xl bg-black/60 border border-white/5 space-y-2 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[#70FF5E]">
              <Lock className="w-4 h-4" />
              <span className="font-bold uppercase text-[11px] tracking-wider">Signed By:</span>
              <span className="text-white">{policy.signedBy || 'secops@vantacore.internal'}</span>
            </div>
            <button
              onClick={handleCopyHash}
              className="flex items-center gap-1.5 text-[11px] text-[#8B9C8D] hover:text-white transition-colors"
            >
              {copiedHash ? <Check className="w-3.5 h-3.5 text-[#70FF5E]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedHash ? 'Hash Copied' : 'Copy Bundle Hash'}</span>
            </button>
          </div>
          <div className="text-[10px] text-[#4D5C50] break-all">
            BUNDLE HASH: {policy.bundleHash || 'sha256:0000000000000000000000000000000000000000'}
          </div>
        </div>
      </div>

      {/* Tab Navigation between Rules and Diff */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-1 font-mono text-xs font-bold">
        <button
          onClick={() => setViewMode('RULES')}
          className={`px-4 py-2 border-b-2 transition-colors flex items-center gap-2 ${
            viewMode === 'RULES'
              ? 'border-[#70FF5E] text-[#70FF5E]'
              : 'border-transparent text-[#8B9C8D] hover:text-white'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Rules & Version History</span>
        </button>
        <button
          onClick={() => setViewMode('DIFF')}
          className={`px-4 py-2 border-b-2 transition-colors flex items-center gap-2 ${
            viewMode === 'DIFF'
              ? 'border-[#70FF5E] text-[#70FF5E]'
              : 'border-transparent text-[#8B9C8D] hover:text-white'
          }`}
        >
          <GitCompare className="w-4 h-4" />
          <span>Version Diff Analysis (v2.3.0 → {policy.version})</span>
        </button>
      </div>

      {viewMode === 'DIFF' && diff && (
        <PolicyDiffViewer diff={diff} />
      )}

      {viewMode === 'RULES' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Human-Readable Rules (2 Columns) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#70FF5E]" />
                <span>Human-Readable Rules ({policy.rules?.length || policy.rulesCount || 0})</span>
              </h2>
              <span className="text-[10px] font-mono text-[#8B9C8D]">
                CLEAN RULE VISUALIZATION
              </span>
            </div>

          <div className="space-y-4">
            {policy.rules && policy.rules.length > 0 ? (
              policy.rules.map((rule, idx) => (
                <div
                  key={rule.id || idx}
                  className="p-5 rounded-2xl bg-[#080B08] border border-white/10 space-y-3 font-mono text-xs"
                >
                  <div className="flex items-center justify-between gap-3 pb-2 border-b border-white/5">
                    <span className="font-bold text-white text-sm">
                      {idx + 1}. {rule.name}
                    </span>
                    <DecisionBadge decision={rule.action} size="sm" />
                  </div>
                  <p className="text-[11px] text-[#8B9C8D] font-sans">{rule.description}</p>

                  {/* IF ... AND ... THEN Visualization */}
                  <div className="p-4 rounded-xl bg-black/60 border border-white/5 space-y-2">
                    {rule.conditions.map((cond, cIdx) => (
                      <div key={cIdx} className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-sky-400 w-12 text-right">
                          {cIdx === 0 ? 'IF' : 'AND'}
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-white/5 text-white font-medium">
                            {cond.field}
                          </span>
                          <span className="text-amber-400 font-bold">{cond.operator}</span>
                          <span className="px-2 py-0.5 rounded bg-white/10 text-[#70FF5E] font-bold">
                            {cond.value}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 text-xs pt-2 border-t border-white/5">
                      <span className="font-bold text-[#70FF5E] w-12 text-right">THEN</span>
                      <div className="flex items-center gap-2">
                        <DecisionBadge decision={rule.action} size="sm" />
                        <span className="text-[11px] text-[#8B9C8D]">
                          (Simulated Gateway Action)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 rounded-2xl bg-[#080B08] border border-white/10 text-center font-mono text-xs text-[#8B9C8D]">
                Default fallback rule active: Action On Match = {policy.actionOnMatch}.
              </div>
            )}
          </div>
        </div>

        {/* Policy Version History (1 Column) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-sky-400" />
              <span>Version History</span>
            </h2>
            <span className="text-[10px] font-mono text-[#8B9C8D]">
              IMMUTABLE AUDIT
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#080B08] border border-white/10 space-y-4 font-mono text-xs">
            {policy.versions && policy.versions.length > 0 ? (
              <div className="space-y-4">
                {policy.versions.map((ver) => {
                  const isSelected = activeVersion?.version === ver.version;
                  return (
                    <div
                      key={ver.version}
                      onClick={() => setSelectedVersion(ver.version)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-sky-500/10 border-sky-500/40 text-white'
                          : 'bg-black/40 border-white/5 hover:border-white/20 text-[#8B9C8D]'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
                        <span className="font-bold text-sky-400 text-sm">{ver.version}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            ver.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-[#70FF5E] border border-emerald-500/30'
                              : 'bg-white/5 text-[#8B9C8D] border border-white/10'
                          }`}
                        >
                          {ver.status}
                        </span>
                      </div>
                      <div className="mt-2 space-y-1 text-[11px]">
                        <div>
                          <span className="text-[#4D5C50]">Author: </span>
                          <span className="text-white">{ver.author}</span>
                        </div>
                        <div>
                          <span className="text-[#4D5C50]">Created: </span>
                          <span>{new Date(ver.created).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-[#4D5C50]">Hash: </span>
                          <span className="text-sky-400/80">{ver.hash}</span>
                        </div>
                        <div className="pt-2 text-[11px] text-white/90 font-sans border-t border-white/5">
                          {ver.changes}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-[#8B9C8D]">No prior versions recorded.</p>
            )}

            {/* Currently Inspected Version Info */}
            {activeVersion && (
              <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/30 text-[11px] text-sky-300">
                <span className="font-bold">Viewing: {activeVersion.version}</span>
                <p className="mt-0.5 text-[#8B9C8D]">
                  {activeVersion.status === 'ACTIVE'
                    ? 'This is the currently enforced production bundle.'
                    : 'Historical snapshot opened for inspection.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Policy Backtest Dry-Run Modal */}
      <PolicyBacktestModal
        policyId={policy.id}
        policyName={policy.name}
        currentVersion={policy.version}
        isOpen={isBacktestOpen}
        onClose={() => setIsBacktestOpen(false)}
      />
    </div>
  );
};
