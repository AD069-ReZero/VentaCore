/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * VantaCore Policy Backtest & Dry-Run Modal
 * Backtests candidate policy rule modifications against historical audit and decision telemetry.
 * 
 * STRICT COMPLIANCE:
 * Clearly labeled: POLICY DRY-RUN / BACKTEST SIMULATION (NO REAL OPA EVALUATION)
 */

import React, { useState } from 'react';
import {
  X,
  Play,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Layers,
  ArrowRight,
  TrendingUp,
  FileCheck,
} from 'lucide-react';
import { usePolicyBacktest } from '../../api';
import { PolicyBacktestResult, PolicyBacktestInput } from '../../types/security';

interface PolicyBacktestModalProps {
  policyId: string;
  policyName: string;
  currentVersion: string;
  isOpen: boolean;
  onClose: () => void;
}

export const PolicyBacktestModal: React.FC<PolicyBacktestModalProps> = ({
  policyId,
  policyName,
  currentVersion,
  isOpen,
  onClose,
}) => {
  const backtest = usePolicyBacktest();

  const [periodDays, setPeriodDays] = useState<number>(7);
  const [candidateVersion, setCandidateVersion] = useState<string>('v2.5.0-candidate');
  const [agentFilter, setAgentFilter] = useState<string>('ALL');
  const [toolFilter, setToolFilter] = useState<string>('ALL');
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<PolicyBacktestResult | null>(null);

  if (!isOpen) return null;

  const handleRunBacktest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsExecuting(true);
    try {
      const res = await backtest.mutateAsync({
        policyId,
        candidateVersion,
        periodDays,
        agentFilter: agentFilter === 'ALL' ? undefined : agentFilter,
        toolFilter: toolFilter === 'ALL' ? undefined : toolFilter,
      });
      setTimeout(() => {
        setResult(res);
        setIsExecuting(false);
      }, 700);
    } catch {
      setIsExecuting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-[#080B08] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden font-mono">
        {/* Modal Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#70FF5E]/10 border border-[#70FF5E]/20 text-[#70FF5E]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Policy Backtesting & Dry-Run Simulator
              </h3>
              <p className="text-[11px] text-[#8B9C8D]">
                Evaluate counterfactual impact of candidate rules against historical telemetry.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8B9C8D] hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mandatory Disclaimer */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-5 py-2.5 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span className="font-bold uppercase tracking-wider text-[10px]">
              POLICY DRY-RUN / BACKTEST SIMULATION (NO REAL OPA EVALUATION)
            </span>
          </div>
          <span className="text-[10px] text-amber-400/80">Synthetic Telemetry Replay</span>
        </div>

        {/* Form and Configuration */}
        <form onSubmit={handleRunBacktest} className="p-5 space-y-5 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-[10px] text-[#8B9C8D] uppercase tracking-wider block mb-1">
                Target Policy
              </label>
              <div className="p-2 rounded-lg bg-black/60 border border-white/10 text-white font-bold truncate">
                {policyName} ({policyId})
              </div>
            </div>

            <div>
              <label className="text-[10px] text-[#8B9C8D] uppercase tracking-wider block mb-1">
                Candidate Version
              </label>
              <input
                type="text"
                value={candidateVersion}
                onChange={(e) => setCandidateVersion(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-[#70FF5E] font-bold focus:outline-none focus:border-[#70FF5E]"
              />
            </div>

            <div>
              <label className="text-[10px] text-[#8B9C8D] uppercase tracking-wider block mb-1">
                Evaluation Window
              </label>
              <select
                value={periodDays}
                onChange={(e) => setPeriodDays(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-white focus:outline-none focus:border-[#70FF5E]"
              >
                <option value={1}>Last 24 Hours</option>
                <option value={7}>Last 7 Days (Recommended)</option>
                <option value={30}>Last 30 Days</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-[10px] text-[#8B9C8D] uppercase tracking-wider block mb-1">
                Filter by Agent
              </label>
              <select
                value={agentFilter}
                onChange={(e) => setAgentFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-white focus:outline-none focus:border-[#70FF5E]"
              >
                <option value="ALL">All Agents</option>
                <option value="research-agent-01">research-agent-01</option>
                <option value="finance-agent-01">finance-agent-01</option>
                <option value="devops-autopilot">devops-autopilot</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-[#8B9C8D] uppercase tracking-wider block mb-1">
                Filter by Tool
              </label>
              <select
                value={toolFilter}
                onChange={(e) => setToolFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-white focus:outline-none focus:border-[#70FF5E]"
              >
                <option value="ALL">All Tools</option>
                <option value="http-request-dispatcher">http-request-dispatcher</option>
                <option value="web.fetch">web.fetch</option>
                <option value="fs.read_restricted">fs.read_restricted</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isExecuting}
            className="w-full py-2.5 rounded-xl bg-[#70FF5E] text-black font-bold text-xs hover:bg-[#5ce64c] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#70FF5E]/10 disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>{isExecuting ? 'Simulating Historical Replay...' : 'Run Dry-Run Backtest'}</span>
          </button>

          {/* Results Visualization */}
          {result && (
            <div className="mt-4 p-5 rounded-xl bg-black/60 border border-white/10 space-y-5 animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#70FF5E]" />
                  <span>Dry-Run Simulation Output</span>
                </span>
                <span className="text-[10px] text-[#4D5C50]">
                  {result.totalHistoricalEvaluations.toLocaleString()} Events Evaluated
                </span>
              </div>

              {/* Impact Delta Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-red-300 uppercase">Additional Blocks</span>
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="text-2xl font-bold text-red-400">
                    +{result.additionalBlocks}
                  </div>
                  <div className="text-[10px] text-[#8B9C8D]">
                    Actions that were previously ALLOWED or REVIEWED that would now be blocked.
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-amber-300 uppercase">Additional Reviews</span>
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold text-amber-400">
                    +{result.additionalReviews}
                  </div>
                  <div className="text-[10px] text-[#8B9C8D]">
                    Actions that would require human two-person authorization before dispatch.
                  </div>
                </div>
              </div>

              {/* Baseline vs Candidate Table */}
              <div className="rounded-lg border border-white/5 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/80 text-[10px] text-[#8B9C8D] uppercase border-b border-white/5">
                    <tr>
                      <th className="py-2 px-3">Verdict</th>
                      <th className="py-2 px-3">Baseline ({currentVersion})</th>
                      <th className="py-2 px-3">Candidate ({candidateVersion})</th>
                      <th className="py-2 px-3 text-right">Net Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-[11px]">
                    <tr>
                      <td className="py-2.5 px-3 text-emerald-400 font-bold">ALLOW</td>
                      <td className="py-2.5 px-3 text-white">{result.previousCounts.allow}</td>
                      <td className="py-2.5 px-3 text-white">{result.candidateCounts.allow}</td>
                      <td className="py-2.5 px-3 text-right text-red-400">
                        -{result.additionalBlocks + result.additionalReviews}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 text-amber-400 font-bold">REVIEW</td>
                      <td className="py-2.5 px-3 text-white">{result.previousCounts.review}</td>
                      <td className="py-2.5 px-3 text-white">{result.candidateCounts.review}</td>
                      <td className="py-2.5 px-3 text-right text-amber-400">
                        +{result.additionalReviews}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 text-red-400 font-bold">BLOCK</td>
                      <td className="py-2.5 px-3 text-white">{result.previousCounts.block}</td>
                      <td className="py-2.5 px-3 text-white">{result.candidateCounts.block}</td>
                      <td className="py-2.5 px-3 text-right text-red-400 font-bold">
                        +{result.additionalBlocks}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </form>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/5 flex items-center justify-between text-xs text-[#8B9C8D]">
          <span>Audit Engine Simulation v2.4</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
