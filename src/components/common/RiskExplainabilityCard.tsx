/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * VantaCore Risk Explainability Component
 * Deconstructs multi-factor composite risk scores into weighted confidence drivers,
 * security detector signals, resource sensitivities, and MITRE ATLAS contextual notes.
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  Percent,
  Layers,
  ChevronDown,
  ChevronUp,
  Sliders,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { RiskExplanation, RiskFactor } from '../../types/security';
import { RiskBadge, DestinationTrustBadge } from './SecurityBadges';

interface RiskExplainabilityCardProps {
  explanation: RiskExplanation;
  className?: string;
  compact?: boolean;
}

export const RiskExplainabilityCard: React.FC<RiskExplainabilityCardProps> = ({
  explanation,
  className = '',
  compact = false,
}) => {
  const [expandedFactor, setExpandedFactor] = useState<string | null>(null);

  const toggleFactor = (factorName: string) => {
    setExpandedFactor((prev) => (prev === factorName ? null : factorName));
  };

  return (
    <div className={`p-5 rounded-2xl bg-[#080B08] border border-white/10 space-y-5 font-mono ${className}`}>
      {/* Header Metric Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Risk Explainability & Factor Attribution
            </span>
          </div>
          <p className="text-[11px] text-[#8B9C8D]">
            Decomposition of composite behavioral scoring model across multi-modal telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 flex items-center gap-2">
            <span className="text-[10px] text-[#8B9C8D] uppercase">Confidence</span>
            <span className="text-xs font-bold text-[#70FF5E]">
              {Math.round(explanation.confidence * 100)}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <RiskBadge risk={explanation.level} size="md" />
            <span className="text-sm font-bold text-white px-2.5 py-1 rounded-lg bg-black/80 border border-red-500/30 text-red-400">
              {explanation.score} / 100
            </span>
          </div>
        </div>
      </div>

      {/* Primary Factor Breakdown Bars */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-[11px] text-[#8B9C8D] uppercase tracking-wider">
          <span>Attributed Risk Drivers</span>
          <span>Score Weight Contribution</span>
        </div>

        <div className="space-y-2.5">
          {explanation.primaryFactors.map((factor) => {
            const percentage = Math.min(100, Math.round((factor.scoreContribution / factor.maxContribution) * 100));
            const isExpanded = expandedFactor === factor.factor;

            return (
              <div
                key={factor.factor}
                className="p-3 rounded-xl bg-black/40 border border-white/5 hover:border-white/10 transition-colors"
              >
                <div
                  className="flex items-center justify-between cursor-pointer select-none"
                  onClick={() => toggleFactor(factor.factor)}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{factor.factor}</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-white/5 text-[#8B9C8D] border border-white/10">
                        {factor.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#8B9C8D]">{factor.description}</div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <div className="text-right">
                      <span className="text-xs font-bold text-red-400">
                        +{factor.scoreContribution}
                      </span>
                      <span className="text-[10px] text-[#4D5C50]"> / {factor.maxContribution} max</span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-[#8B9C8D]" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-[#8B9C8D]" />
                    )}
                  </div>
                </div>

                {/* Contribution Progress Bar */}
                <div className="mt-2.5 w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-2 sm:grid-cols-3 gap-3 text-[10px] text-[#8B9C8D]">
                    <div>
                      <span className="text-[#4D5C50] uppercase block">Factor Confidence</span>
                      <span className="text-white font-bold">{Math.round(factor.confidence * 100)}%</span>
                    </div>
                    <div>
                      <span className="text-[#4D5C50] uppercase block">Normalized Weight</span>
                      <span className="text-white font-bold">{percentage}% of category cap</span>
                    </div>
                    <div>
                      <span className="text-[#4D5C50] uppercase block">Telemetry Driver</span>
                      <span className="text-sky-400 font-bold">Semantic Taint Analysis</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Correlated Signals & Context Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="p-3.5 rounded-xl bg-black/60 border border-white/5 space-y-2">
          <span className="text-[10px] text-[#8B9C8D] uppercase tracking-wider block">
            Correlated Detector Signals
          </span>
          <div className="flex flex-wrap gap-1.5">
            {explanation.relatedSignals.map((sig) => (
              <span
                key={sig}
                className="px-2 py-0.5 rounded text-[10px] bg-red-500/10 text-red-300 border border-red-500/20"
              >
                {sig}
              </span>
            ))}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-black/60 border border-white/5 space-y-2">
          <span className="text-[10px] text-[#8B9C8D] uppercase tracking-wider block">
            Security Boundaries
          </span>
          <div className="space-y-1 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-[#4D5C50]">Resource:</span>
              <span className="text-white truncate max-w-[200px]">{explanation.resourceSensitivity}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#4D5C50]">Destination:</span>
              <DestinationTrustBadge trust={explanation.destinationTrust} size="sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Contextual Notes & MITRE ATLAS alignment */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-red-500/5 via-black to-red-500/5 border border-red-500/20 text-[11px] text-[#8B9C8D]">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-white font-bold block">Adversarial Context Assessment</span>
            <p className="leading-relaxed">{explanation.contextNotes}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
