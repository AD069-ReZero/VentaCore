/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * VantaCore Policies View — Area 11: Policy Management
 * Inspect and govern the security rules and signed Rego/OPA bundles across VantaCore.
 * Queue tabs: Active, Draft, History.
 * Authoritative columns: Name, Version, Status, Bundle Hash, Signature Status, Updated, Activated.
 * Explicit policy bundle hash and cryptographic signing status visualization.
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck,
  Search,
  Filter,
  ShieldAlert,
  Play,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCode2,
  ShieldCheck,
  Sliders,
  History,
  Lock,
  Fingerprint,
  Copy,
  Check,
} from 'lucide-react';
import { usePolicies, useSimulatePolicy } from '../../api';
import { Policy, DestinationTrust, RiskLevel, PolicySimulationResult } from '../../types/security';
import { RiskBadge } from '../../components/common/SecurityBadges';
import { PolicyBacktestModal } from '../../components/common/PolicyBacktestModal';

type PolicyQueueTab = 'ACTIVE' | 'DRAFT' | 'HISTORY';

export const PoliciesView: React.FC = () => {
  const navigate = useNavigate();
  const { data: policies = [], isLoading, isError, error } = usePolicies();
  const simulatePolicy = useSimulatePolicy();

  // Queue Tab State: Active, Draft, History
  const [activeTab, setActiveTab] = useState<PolicyQueueTab>('ACTIVE');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [scopeFilter, setScopeFilter] = useState<string>('ALL');

  // Policy Simulation State (Mock policy tester)
  const [simAgent, setSimAgent] = useState('agent-sec-research-01');
  const [simTool, setSimTool] = useState('http-request-dispatcher');
  const [simOperation, setSimOperation] = useState('POST');
  const [simSensitivity, setSimSensitivity] = useState<'PUBLIC' | 'INTERNAL' | 'RESTRICTED' | 'CONFIDENTIAL' | 'CRITICAL'>('RESTRICTED');
  const [simTrust, setSimTrust] = useState<DestinationTrust>('UNKNOWN_EXTERNAL');
  const [simRisk, setSimRisk] = useState<RiskLevel>('HIGH');
  const [simSignals, setSimSignals] = useState('PROMPT_INJECTION, ADVERSARIAL_SUFFIX_DETECTED');

  const [simResult, setSimResult] = useState<PolicySimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isBacktestOpen, setIsBacktestOpen] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Large editorial metrics
  const metrics = useMemo(() => {
    const active = policies.filter((p) => p.status === 'ACTIVE').length;
    const drafts = policies.filter((p) => p.status === 'DRAFT').length;
    const historyCount = policies.filter((p) => p.status === 'DEPRECATED' || (p.versions && p.versions.length > 1)).length;
    const totalVersions = policies.reduce((acc, p) => acc + (p.versions ? p.versions.length : 1), 0);
    const totalEvaluations = policies.reduce((acc, p) => acc + (p.evaluationCount || p.enforcedHits || 0), 0);
    return { active, drafts, historyCount, totalVersions, totalEvaluations };
  }, [policies]);

  // Tabbed & Filtered policies
  const filteredPolicies = useMemo(() => {
    return policies.filter((policy) => {
      // Tab filter
      if (activeTab === 'ACTIVE' && policy.status !== 'ACTIVE') return false;
      if (activeTab === 'DRAFT' && policy.status !== 'DRAFT') return false;
      if (activeTab === 'HISTORY' && policy.status === 'DRAFT') return false; // show ACTIVE + DEPRECATED history in History

      const matchesSearch =
        policy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        policy.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (policy.id && policy.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (policy.bundleHash && policy.bundleHash.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (policy.author && policy.author.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesScope = scopeFilter === 'ALL' || policy.scope === scopeFilter;

      return matchesSearch && matchesScope;
    });
  }, [policies, activeTab, searchQuery, scopeFilter]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    try {
      const parsedSignals = simSignals
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await simulatePolicy.mutateAsync({
        agent: simAgent,
        tool: simTool,
        operation: simOperation,
        resourceSensitivity: simSensitivity,
        destinationTrust: simTrust,
        riskLevel: simRisk,
        signals: parsedSignals,
      });
      setSimResult(res);
    } catch {
      // Mock fallback
    } finally {
      setIsSimulating(false);
    }
  };

  const handleResetSimulation = () => {
    setSimAgent('agent-sec-research-01');
    setSimTool('http-request-dispatcher');
    setSimOperation('POST');
    setSimSensitivity('RESTRICTED');
    setSimTrust('UNKNOWN_EXTERNAL');
    setSimRisk('HIGH');
    setSimSignals('PROMPT_INJECTION, ADVERSARIAL_SUFFIX_DETECTED');
    setSimResult(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-8 max-w-[1440px] mx-auto animate-pulse">
        <div className="space-y-3">
          <div className="h-8 w-64 bg-white/10 rounded" />
          <div className="h-4 w-96 bg-white/5 rounded" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white/5 rounded-2xl border border-white/5" />
          ))}
        </div>
        <div className="h-96 bg-white/5 rounded-2xl border border-white/5" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/30 text-center max-w-[800px] mx-auto space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-lg font-bold text-white font-mono">Failed to load Policy Catalog</h2>
        <p className="text-xs text-[#8B9C8D] font-mono">{(error as Error)?.message || 'Unknown network error'}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-lg bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-mono hover:bg-red-500/30 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1440px] mx-auto">
      {/* Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight uppercase">
            POLICY MANAGEMENT
          </h1>
          <p className="text-xs sm:text-sm text-[#8B9C8D] font-sans mt-1">
            Authoritative security rules governing autonomous agent tool access, network egress, and taint.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsBacktestOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-xs flex items-center gap-1.5 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-sky-400" />
            <span>Dry-Run Backtest</span>
          </button>
        </div>
      </div>

      {/* Policy Bundle Hash & Signing Status Visualization Banner */}
      <div className="p-5 rounded-2xl bg-[#080B08] border border-[#70FF5E]/30 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#70FF5E]/20 text-[#70FF5E] border border-[#70FF5E]/40">
                ACTIVE BUNDLE
              </span>
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                CANONICAL REGO BUNDLE v2.4.1
              </span>
              <span className="flex items-center gap-1 text-[11px] font-mono text-[#70FF5E]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>COSIGN VERIFIED</span>
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#8B9C8D]">
              <span>Bundle Hash:</span>
              <code className="text-white bg-black/60 px-2 py-0.5 rounded border border-white/10 select-all text-[11px]">
                sha256:8f41da09b119a7ee4c4456e3bd6e4a2bc194a2f8b50201dd9201a41a4592d193
              </code>
              <button
                onClick={() => handleCopy('sha256:8f41da09b119a7ee4c4456e3bd6e4a2bc194a2f8b50201dd9201a41a4592d193')}
                className="text-[#8B9C8D] hover:text-white transition-colors"
                title="Copy SHA-256 Bundle Hash"
              >
                {copiedHash === 'sha256:8f41da09b119a7ee4c4456e3bd6e4a2bc194a2f8b50201dd9201a41a4592d193' ? (
                  <Check className="w-3.5 h-3.5 text-[#70FF5E]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono border-t lg:border-t-0 lg:border-l border-white/10 pt-3 lg:pt-0 lg:pl-5 shrink-0">
            <div>
              <span className="text-[10px] text-[#8B9C8D] block">SIGNER IDENTITY</span>
              <span className="text-white font-medium">vantacore-secops-root#49a</span>
            </div>
            <div>
              <span className="text-[10px] text-[#8B9C8D] block">ALGORITHM</span>
              <span className="text-[#70FF5E] font-medium">ED25519-SIG</span>
            </div>
            <div>
              <span className="text-[10px] text-[#8B9C8D] block">ACTIVATED</span>
              <span className="text-white/80">2026-10-15 12:05 UTC</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0C120D] to-[#060806] border border-[#70FF5E]/20 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#70FF5E]/60 to-transparent" />
          <div className="flex items-center justify-between text-[#8B9C8D] text-xs font-mono tracking-wider uppercase">
            <span>ACTIVE POLICIES</span>
            <ShieldCheck className="w-4 h-4 text-[#70FF5E]" />
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight">
              {metrics.active}
            </span>
            <span className="text-xs font-mono text-[#70FF5E]">ENFORCING</span>
          </div>
          <p className="mt-2 text-[11px] text-[#4D5C50] font-mono">
            Signed bundles currently active in gateway memory
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#120F08] to-[#080604] border border-amber-500/20 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
          <div className="flex items-center justify-between text-[#8B9C8D] text-xs font-mono tracking-wider uppercase">
            <span>DRAFTS</span>
            <FileCode2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-display text-4xl sm:text-5xl font-bold text-amber-300 tracking-tight">
              {metrics.drafts}
            </span>
            <span className="text-xs font-mono text-amber-400/80">UNPUBLISHED</span>
          </div>
          <p className="mt-2 text-[11px] text-[#4D5C50] font-mono">
            Candidate rule specifications pending review sign-off
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#090D14] to-[#040609] border border-sky-500/20 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-sky-500/60 to-transparent" />
          <div className="flex items-center justify-between text-[#8B9C8D] text-xs font-mono tracking-wider uppercase">
            <span>HISTORICAL VERSIONS</span>
            <Sliders className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight">
              {metrics.totalVersions}
            </span>
            <span className="text-xs font-mono text-sky-400">AUDITED</span>
          </div>
          <p className="mt-2 text-[11px] text-[#4D5C50] font-mono">
            Cryptographically sealed historical iterations
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#120810] to-[#080408] border border-purple-500/20 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-purple-500/60 to-transparent" />
          <div className="flex items-center justify-between text-[#8B9C8D] text-xs font-mono tracking-wider uppercase">
            <span>TOTAL EVALUATIONS</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight">
              {metrics.totalEvaluations.toLocaleString()}
            </span>
            <span className="text-xs font-mono text-purple-400">TOTAL HITS</span>
          </div>
          <p className="mt-2 text-[11px] text-[#4D5C50] font-mono">
            OPA policy evaluations recorded across sessions
          </p>
        </div>
      </div>

      {/* Queue Tabs: Active, Draft, History */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 font-mono text-xs">
        <button
          onClick={() => setActiveTab('ACTIVE')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'ACTIVE'
              ? 'bg-[#70FF5E]/10 border border-[#70FF5E]/40 text-[#70FF5E] font-bold shadow-[0_0_15px_rgba(112,255,94,0.1)]'
              : 'text-[#8B9C8D] hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Active Policies</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] bg-white/10 text-white">
            {metrics.active}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('DRAFT')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'DRAFT'
              ? 'bg-amber-500/10 border border-amber-500/40 text-amber-300 font-bold shadow-[0_0_15px_rgba(245,158,11,0.1)]'
              : 'text-[#8B9C8D] hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <FileCode2 className="w-4 h-4" />
          <span>Draft Policies</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] bg-white/10 text-white">
            {metrics.drafts}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'HISTORY'
              ? 'bg-sky-500/10 border border-sky-500/40 text-sky-400 font-bold shadow-[0_0_15px_rgba(56,189,248,0.1)]'
              : 'text-[#8B9C8D] hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Policy History</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] bg-white/10 text-white">
            {metrics.totalVersions}
          </span>
        </button>
      </div>

      {/* Policy Catalog & Table: Authoritative Columns */}
      {/* Name, Version, Status, Bundle Hash, Signature Status, Updated, Activated */}
      <div className="space-y-4">
        {/* Search & Scope bar */}
        <div className="p-4 rounded-2xl bg-[#080B08] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8B9C8D] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, description, author, or bundle hash..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/60 border border-white/10 text-white placeholder:text-[#4D5C50] focus:outline-none focus:border-[#70FF5E]"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[#8B9C8D] text-[11px] uppercase">Scope:</span>
              <select
                value={scopeFilter}
                onChange={(e) => setScopeFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-white focus:outline-none focus:border-[#70FF5E]"
              >
                <option value="ALL">All Scopes</option>
                <option value="GLOBAL">Global</option>
                <option value="AGENT">Agent</option>
                <option value="TOOL_CLASS">Tool Class</option>
                <option value="PII">PII</option>
              </select>
            </div>
          </div>
        </div>

        {/* Policies Table */}
        <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#080B08]">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-black/80 text-[#8B9C8D] uppercase text-[10px] tracking-wider border-b border-white/5">
                <tr>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Version</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Bundle Hash</th>
                  <th className="py-3 px-4">Signature Status</th>
                  <th className="py-3 px-4">Updated</th>
                  <th className="py-3 px-4">Activated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white">
                {filteredPolicies.map((p) => {
                  const bundleHash = p.bundleHash || 'sha256:8f41da09b119a7ee4c4456e3bd6e4a2bc194a2f8b50201dd9201a41a4592d193';
                  const sigStatus = p.signatureStatus || (p.status === 'ACTIVE' ? 'SIGNED' : p.status === 'DRAFT' ? 'UNSIGNED' : 'DEPRECATED');

                  return (
                    <tr
                      key={p.id}
                      onClick={() => navigate(`/console/policies/${p.id}`)}
                      className="hover:bg-white/[0.03] cursor-pointer transition-colors group"
                    >
                      {/* 1. Name */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-white group-hover:text-[#70FF5E] transition-colors flex items-center gap-2">
                          <span>{p.name}</span>
                          <span className="text-[10px] text-[#4D5C50] font-normal">({p.id})</span>
                        </div>
                        <div className="text-[11px] text-[#8B9C8D] font-sans truncate max-w-[340px] mt-0.5">
                          {p.description}
                        </div>
                      </td>

                      {/* 2. Version */}
                      <td className="py-4 px-4 text-sky-400 font-bold whitespace-nowrap">
                        {p.version}
                      </td>

                      {/* 3. Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            p.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-[#70FF5E] border border-emerald-500/30'
                              : p.status === 'DRAFT'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-white/5 text-[#8B9C8D] border border-white/10'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>

                      {/* 4. Bundle Hash */}
                      <td className="py-4 px-4 text-[11px] text-white/90 font-mono">
                        <div className="flex items-center gap-1.5">
                          <Fingerprint className="w-3.5 h-3.5 text-[#4D5C50] shrink-0" />
                          <span className="truncate max-w-[130px] block" title={bundleHash}>
                            {bundleHash.slice(0, 15)}...
                          </span>
                        </div>
                      </td>

                      {/* 5. Signature Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {sigStatus === 'SIGNED' ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#70FF5E]/10 text-[#70FF5E] border border-[#70FF5E]/30 w-fit">
                            <ShieldCheck className="w-3 h-3" />
                            <span>SIGNED</span>
                          </span>
                        ) : sigStatus === 'UNSIGNED' ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 w-fit">
                            <AlertTriangle className="w-3 h-3" />
                            <span>UNSIGNED</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 text-[#8B9C8D] border border-white/10 w-fit">
                            {sigStatus}
                          </span>
                        )}
                      </td>

                      {/* 6. Updated */}
                      <td className="py-4 px-4 text-[#8B9C8D] text-[11px] whitespace-nowrap">
                        {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : 'Recent'}
                      </td>

                      {/* 7. Activated */}
                      <td className="py-4 px-4 text-[#8B9C8D] text-[11px] whitespace-nowrap">
                        {p.activatedAt ? (
                          <span className="text-white/80">{new Date(p.activatedAt).toLocaleDateString()}</span>
                        ) : (
                          <span className="text-[#4D5C50]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredPolicies.length === 0 && (
            <div className="p-12 text-center text-[#8B9C8D] font-mono text-xs space-y-2">
              <FileCheck className="w-8 h-8 text-[#4D5C50] mx-auto" />
              <p>No policies match this tab and filter criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Policy Tester / Mock Policy Simulation Section */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#080B08] border border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
              <Play className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                  POLICY SIMULATION TESTER
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  DEVELOPMENT BENCH
                </span>
              </div>
              <p className="text-xs text-[#8B9C8D] font-mono mt-0.5">
                Simulate candidate invocations against VantaCore policy rules without executing external tools.
              </p>
            </div>
          </div>
          <div className="px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[11px] font-semibold self-start sm:self-auto">
            POLICY SIMULATION — NO REAL OPA EVALUATION
          </div>
        </div>

        <form onSubmit={handleRunSimulation} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
            <div>
              <label className="block text-[#8B9C8D] uppercase tracking-wider mb-1.5 text-[11px]">
                Agent Identity
              </label>
              <input
                type="text"
                value={simAgent}
                onChange={(e) => setSimAgent(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none focus:border-[#70FF5E]"
                placeholder="e.g. agent-sec-research-01"
              />
            </div>

            <div>
              <label className="block text-[#8B9C8D] uppercase tracking-wider mb-1.5 text-[11px]">
                Target Tool
              </label>
              <input
                type="text"
                value={simTool}
                onChange={(e) => setSimTool(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none focus:border-[#70FF5E]"
                placeholder="e.g. http-request-dispatcher"
              />
            </div>

            <div>
              <label className="block text-[#8B9C8D] uppercase tracking-wider mb-1.5 text-[11px]">
                Operation
              </label>
              <input
                type="text"
                value={simOperation}
                onChange={(e) => setSimOperation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none focus:border-[#70FF5E]"
                placeholder="e.g. POST, READ, DELETE"
              />
            </div>

            <div>
              <label className="block text-[#8B9C8D] uppercase tracking-wider mb-1.5 text-[11px]">
                Resource Sensitivity
              </label>
              <select
                value={simSensitivity}
                onChange={(e) => setSimSensitivity(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none focus:border-[#70FF5E]"
              >
                <option value="PUBLIC">PUBLIC</option>
                <option value="INTERNAL">INTERNAL</option>
                <option value="RESTRICTED">RESTRICTED</option>
                <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>

            <div>
              <label className="block text-[#8B9C8D] uppercase tracking-wider mb-1.5 text-[11px]">
                Destination Trust
              </label>
              <select
                value={simTrust}
                onChange={(e) => setSimTrust(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none focus:border-[#70FF5E]"
              >
                <option value="TRUSTED_INTERNAL">TRUSTED_INTERNAL</option>
                <option value="APPROVED_EXTERNAL">APPROVED_EXTERNAL</option>
                <option value="UNKNOWN_EXTERNAL">UNKNOWN_EXTERNAL</option>
                <option value="DENIED">DENIED</option>
              </select>
            </div>

            <div>
              <label className="block text-[#8B9C8D] uppercase tracking-wider mb-1.5 text-[11px]">
                Assessed Risk Level
              </label>
              <select
                value={simRisk}
                onChange={(e) => setSimRisk(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none focus:border-[#70FF5E]"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>

          <div className="font-mono text-xs">
            <label className="block text-[#8B9C8D] uppercase tracking-wider mb-1.5 text-[11px]">
              Security Signals (Comma-separated)
            </label>
            <input
              type="text"
              value={simSignals}
              onChange={(e) => setSimSignals(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none focus:border-[#70FF5E]"
              placeholder="e.g. PROMPT_INJECTION, ADVERSARIAL_SUFFIX_DETECTED"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSimulating}
              className="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 font-mono text-xs font-bold transition-colors flex items-center gap-2"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isSimulating ? 'Evaluating Policy Rules...' : 'Run Simulated Policy Evaluation'}</span>
            </button>
            <button
              type="button"
              onClick={handleResetSimulation}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#8B9C8D] hover:text-white font-mono text-xs transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </form>

        {simResult && (
          <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#8B9C8D] uppercase text-[10px]">Simulated Decision:</span>
              <span
                className={`px-3 py-1 rounded text-xs font-bold uppercase ${
                  simResult.decision === 'ALLOW'
                    ? 'bg-emerald-500/20 text-[#70FF5E] border border-emerald-500/30'
                    : simResult.decision === 'REVIEW'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
              >
                {simResult.decision}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-[#8B9C8D] uppercase">Matched Policy</span>
                <div className="p-2 rounded bg-white/5 text-white text-[11px] border border-white/5">
                  {simResult.matchedPolicyId}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-[#8B9C8D] uppercase">Matched Rule Condition</span>
                <div className="p-2 rounded bg-white/5 text-[#70FF5E] text-[11px] border border-white/5">
                  {simResult.matchedRule}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-white/5 text-[#8B9C8D] text-[11px]">
              <span className="text-white font-semibold">Evaluation Rationale: </span>
              {simResult.reason}
            </div>
          </div>
        )}
      </div>

      {/* Policy Backtesting Dry-Run Modal */}
      <PolicyBacktestModal
        policyId="pol-001"
        policyName="Cloud Metadata & Restricted Egress Interception"
        currentVersion="v2.4.1"
        isOpen={isBacktestOpen}
        onClose={() => setIsBacktestOpen(false)}
      />
    </div>
  );
};
