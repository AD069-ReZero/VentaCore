/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * VantaCore Policy Version Diff Viewer
 * Side-by-side / unified condition diff analyzer between historical policy revisions.
 */

import React, { useState } from 'react';
import {
  FileCode2,
  GitCompare,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { PolicyVersionDiff, PolicyRuleDiff, PolicyDiffCondition } from '../../types/security';
import { DecisionBadge } from './SecurityBadges';

interface PolicyDiffViewerProps {
  diff: PolicyVersionDiff;
  onClose?: () => void;
  className?: string;
}

export const PolicyDiffViewer: React.FC<PolicyDiffViewerProps> = ({
  diff,
  onClose,
  className = '',
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredRules = diff.ruleDiffs.filter((rule) => {
    if (filterType === 'ALL') return true;
    return rule.changeType === filterType;
  });

  const getChangeBadge = (changeType: PolicyRuleDiff['changeType']) => {
    switch (changeType) {
      case 'ADDED':
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <Plus className="w-3 h-3" />
            <span>RULE ADDED</span>
          </span>
        );
      case 'MODIFIED':
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>MODIFIED</span>
          </span>
        );
      case 'REMOVED':
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1">
            <Minus className="w-3 h-3" />
            <span>REMOVED</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-6 font-mono ${className}`}>
      {/* Diff Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-[#70FF5E]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Policy Version Diff Analysis
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#8B9C8D]">
            <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10 text-white font-bold">
              {diff.fromVersion}
            </span>
            <ArrowRight className="w-3 h-3 text-[#70FF5E]" />
            <span className="px-2 py-0.5 rounded bg-black/60 border border-[#70FF5E]/30 text-[#70FF5E] font-bold">
              {diff.toVersion} (Candidate / Active)
            </span>
          </div>
        </div>

        {/* Change Stats */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
            <Plus className="w-3 h-3" />
            <span>{diff.rulesAdded} Added</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3" />
            <span>{diff.rulesModified} Modified</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-1.5">
            <Minus className="w-3 h-3" />
            <span>{diff.rulesRemoved} Removed</span>
          </div>
        </div>
      </div>

      {/* Summary Notes */}
      {diff.summaryNotes.length > 0 && (
        <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
          <span className="text-[10px] text-[#4D5C50] uppercase tracking-wider block">
            Revision Release Notes
          </span>
          <ul className="space-y-1 text-xs text-[#8B9C8D]">
            {diff.summaryNotes.map((note, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#70FF5E] mt-0.5">•</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Rule Diff Cards */}
      <div className="space-y-4">
        {filteredRules.map((rule) => (
          <div
            key={rule.ruleId}
            className="p-5 rounded-xl bg-black/60 border border-white/10 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-white">{rule.ruleName}</span>
                <span className="text-[10px] text-[#4D5C50]">({rule.ruleId})</span>
              </div>
              <div className="flex items-center gap-3">
                {rule.fromAction && rule.toAction && rule.fromAction !== rule.toAction && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <DecisionBadge decision={rule.fromAction} size="sm" />
                    <ArrowRight className="w-3 h-3 text-[#70FF5E]" />
                    <DecisionBadge decision={rule.toAction} size="sm" />
                  </div>
                )}
                {getChangeBadge(rule.changeType)}
              </div>
            </div>

            {/* Conditions Table */}
            <div className="rounded-lg border border-white/5 overflow-hidden bg-black/40">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/60 text-[10px] text-[#8B9C8D] uppercase tracking-wider border-b border-white/5">
                  <tr>
                    <th className="py-2 px-3">Field</th>
                    <th className="py-2 px-3">Operator</th>
                    <th className="py-2 px-3">Previous Value ({diff.fromVersion})</th>
                    <th className="py-2 px-3">Target Value ({diff.toVersion})</th>
                    <th className="py-2 px-3 text-right">State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[11px]">
                  {rule.conditionDiffs.map((cond, cIdx) => {
                    let rowBg = '';
                    if (cond.changeType === 'ADDED') rowBg = 'bg-emerald-500/5 text-emerald-300';
                    else if (cond.changeType === 'MODIFIED') rowBg = 'bg-amber-500/5 text-amber-300';
                    else if (cond.changeType === 'REMOVED') rowBg = 'bg-red-500/5 text-red-300';

                    return (
                      <tr key={cIdx} className={rowBg}>
                        <td className="py-2.5 px-3 font-bold text-white">{cond.field}</td>
                        <td className="py-2.5 px-3 text-sky-400 font-mono">{cond.operator}</td>
                        <td className="py-2.5 px-3 text-[#8B9C8D] font-mono">
                          {cond.fromValue || '—'}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-white font-mono">
                          {cond.toValue || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                              cond.changeType === 'ADDED'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : cond.changeType === 'MODIFIED'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-white/5 text-[#8B9C8D]'
                            }`}
                          >
                            {cond.changeType}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
