/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * VantaCore Tool Details View
 * Detailed technical specification, metadata hash, capability implications, and security cross-links.
 */

import React, { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Wrench,
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  GitBranch,
  Layers,
  Lock,
  Copy,
  ExternalLink,
  Cpu,
  Clock,
  User,
  Hash,
  AlertOctagon,
  CheckCircle2,
  AlertTriangle,
  Database,
} from 'lucide-react';
import { useTool, useApprovals, useQuarantine } from '../../api';
import {
  RiskBadge,
  AssuranceBadge,
  ToolStatusBadge,
  CapabilityBadge,
  ApprovalStateBadge,
  ToolResultActionBadge,
  DestinationTrustBadge,
} from '../../components/common/SecurityBadges';
import { getImpliedCapabilities, CAPABILITY_IMPLICATIONS } from '../../lib/enforcementLogic';
import { ToolCapability } from '../../types/security';

export const ToolDetailsView: React.FC = () => {
  const { toolId } = useParams<{ toolId: string }>();
  const navigate = useNavigate();

  const { data: tool, isLoading, isError, error } = useTool(toolId);
  const { data: allApprovals = [] } = useApprovals();
  const { data: allQuarantine = [] } = useQuarantine();

  // Find related approvals for this tool
  const relatedApprovals = useMemo(() => {
    if (!tool) return [];
    return allApprovals.filter(
      (a) => a.toolId === tool.id || a.toolName === tool.name || a.toolName === tool.id
    );
  }, [tool, allApprovals]);

  // Find related quarantine items for this tool
  const relatedQuarantine = useMemo(() => {
    if (!tool) return [];
    return allQuarantine.filter(
      (q) => q.toolId === tool.id || q.toolName === tool.name || q.toolName === tool.id
    );
  }, [tool, allQuarantine]);

  // Inherited capabilities derivation
  const impliedCapabilities = useMemo(() => {
    if (!tool || !tool.capabilities) return [];
    return getImpliedCapabilities(tool.capabilities as ToolCapability[]);
  }, [tool]);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-[1440px] mx-auto animate-pulse">
        <div className="h-6 w-32 bg-white/10 rounded" />
        <div className="h-20 bg-white/5 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 bg-white/5 rounded-2xl lg:col-span-2" />
          <div className="h-96 bg-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !tool) {
    return (
      <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/30 text-center max-w-[700px] mx-auto space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-lg font-bold text-white font-mono">Tool Not Found</h2>
        <p className="text-xs text-[#8B9C8D] font-mono">
          No registered tool with identifier "{toolId}" was found in the control plane.
        </p>
        <Link
          to="/console/tools"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white font-mono text-xs hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Tool Registry
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1440px] mx-auto pb-12">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/console/tools')}
          className="inline-flex items-center gap-2 text-xs font-mono text-[#8B9C8D] hover:text-[#70FF5E] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO TOOL REGISTRY</span>
        </button>
      </div>

      {/* Header Profile */}
      <div className="p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-white/5 text-[#70FF5E] border border-white/10 shrink-0">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[10px] font-mono text-[#8B9C8D] uppercase tracking-wider">
                  {tool.namespace || 'corp.agent.runtime'}
                </span>
                <span className="text-white/20">•</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white">
                  {tool.version || 'v1.0.0'}
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {tool.name}
              </h1>
              <p className="text-xs text-[#8B9C8D] font-mono mt-0.5">
                {tool.displayName}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <ToolStatusBadge status={tool.status} />
            <AssuranceBadge tier={tool.assuranceLevel} />
            <RiskBadge risk={tool.riskRating} />
          </div>
        </div>

        <p className="text-sm text-[#EDEDED] font-sans leading-relaxed pt-2 border-t border-white/5">
          {tool.description}
        </p>
      </div>

      {/* Editorial Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-black/40 border border-white/5">
          <div className="text-[10px] font-mono text-[#8B9C8D] uppercase">Invocations</div>
          <div className="text-2xl font-display font-bold text-white mt-1">
            {tool.invocationCount?.toLocaleString() || '0'}
          </div>
          <div className="text-[10px] text-[#4D5C50] font-mono">Total historical executions</div>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-white/5">
          <div className="text-[10px] font-mono text-red-400 uppercase">Blocked Requests</div>
          <div className="text-2xl font-display font-bold text-red-400 mt-1">
            {tool.blockedCount?.toLocaleString() || '0'}
          </div>
          <div className="text-[10px] text-red-400/60 font-mono">Severed at policy boundary</div>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-white/5">
          <div className="text-[10px] font-mono text-[#70FF5E] uppercase">Active Agents</div>
          <div className="text-2xl font-display font-bold text-[#70FF5E] mt-1">
            {tool.activeAgents || '0'}
          </div>
          <div className="text-[10px] text-[#8B9C8D] font-mono">Bound agent identities</div>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-white/5">
          <div className="text-[10px] font-mono text-amber-400 uppercase">Human In The Loop</div>
          <div className="text-lg font-display font-bold text-amber-400 mt-1 flex items-center gap-1.5">
            <Lock className="w-4 h-4" />
            <span>{tool.requiresApproval ? 'REQUIRED' : 'AUTONOMOUS'}</span>
          </div>
          <div className="text-[10px] text-amber-400/60 font-mono">Approval center gate</div>
        </div>
      </div>

      {/* Main Grid: Metadata & Capabilities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Full Technical Specification */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metadata Grid */}
          <div className="p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-[#70FF5E]" />
                <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  Technical Specification & Identity
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#8B9C8D]">IMMUTABLE SPEC</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <div className="text-[10px] text-[#8B9C8D]">TOOL ID</div>
                <div className="text-white font-medium select-all">{tool.id}</div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <div className="text-[10px] text-[#8B9C8D]">NAMESPACE</div>
                <div className="text-white font-medium">{tool.namespace || 'corp.agent.runtime'}</div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <div className="text-[10px] text-[#8B9C8D]">DEFINITION VERSION</div>
                <div className="text-white font-medium">{tool.definitionVersion || tool.version || 'v1.0.0'}</div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <div className="text-[10px] text-[#8B9C8D]">OWNER / TEAM</div>
                <div className="text-white font-medium">{tool.owner || 'secops@vantacore.internal'}</div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <div className="text-[10px] text-[#8B9C8D]">EXECUTOR IDENTITY</div>
                <div className="text-white font-medium break-all">{tool.executorIdentity || 'sandbox:runtime-default'}</div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <div className="text-[10px] text-[#8B9C8D]">DESTINATION TRUST</div>
                <div className="pt-0.5">
                  <DestinationTrustBadge trust={tool.destinationTrust || 'NOT_APPLICABLE'} size="sm" />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <div className="text-[10px] text-[#8B9C8D]">DEFAULT RESOURCE SENSITIVITY</div>
                <div className="text-amber-400 font-medium">{tool.defaultSensitivity || 'CONFIDENTIAL'}</div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <div className="text-[10px] text-[#8B9C8D]">REQUIRES HUMAN APPROVAL</div>
                <div className="text-white font-medium">
                  {tool.requiresApproval ? 'Yes (Strict Hold)' : 'No (Autonomous Execution)'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1 sm:col-span-2">
                <div className="text-[10px] text-[#8B9C8D]">METADATA HASH (SHA-256)</div>
                <div className="text-[11px] text-[#70FF5E] font-mono break-all select-all">
                  {tool.metadataHash || 'sha256:7a810b5c98d6f140e942dae6b8109d9c87893a0e998811e9f1a2b3c4d5e6f7a8'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1 sm:col-span-2">
                <div className="text-[10px] text-[#8B9C8D]">ALLOWED OPERATIONS</div>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {tool.allowedOperations && tool.allowedOperations.length > 0 ? (
                    tool.allowedOperations.map((op) => (
                      <span
                        key={op}
                        className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white font-mono text-[10px]"
                      >
                        {op}
                      </span>
                    ))
                  ) : (
                    <span className="text-[#4D5C50]">All standard methods</span>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <div className="text-[10px] text-[#8B9C8D]">CREATED AT</div>
                <div className="text-white">{tool.createdAt || '2026-08-14T00:00:00Z'}</div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <div className="text-[10px] text-[#8B9C8D]">LAST UPDATED</div>
                <div className="text-white">{tool.updatedAt}</div>
              </div>
            </div>
          </div>

          {/* Phase M2: Controlled SQL Write & Mutation Safety Policy */}
          {(tool.category === 'DATABASE' || tool.allowedMutationTypes || tool.databaseName) && (
            <div className="p-6 rounded-2xl bg-[#080B08] border border-emerald-500/20 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#70FF5E]" />
                  <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                    Phase M2: Controlled PostgreSQL Write Safety Controls
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#70FF5E]/10 border border-[#70FF5E]/30 text-[#70FF5E]">
                  ENFORCED BOUNDARY
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <div className="text-[10px] text-[#8B9C8D]">TARGET DATABASE</div>
                  <div className="text-white font-medium">{tool.databaseName || 'vantacore'}</div>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <div className="text-[10px] text-[#8B9C8D]">MAX AFFECTED ROWS CAP</div>
                  <div className="text-amber-400 font-bold">{tool.maxAffectedRows ?? 1} (Rollback on Overflow)</div>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <div className="text-[10px] text-[#8B9C8D]">ALLOWED MUTATIONS</div>
                  <div className="text-emerald-400 font-medium">
                    {tool.allowedMutationTypes?.join(', ') || 'INSERT, UPDATE, DELETE'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <div className="text-[10px] text-[#8B9C8D]">ROW TARGETING REQUIREMENT</div>
                  <div className="text-white font-medium">
                    {tool.requiredWhere !== false ? 'WHERE Mandatory (Exact PK Target)' : 'Broad Predicate Forbidden'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5 sm:col-span-2">
                  <div className="text-[10px] text-[#8B9C8D]">ALLOWED WRITABLE COLUMNS</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(tool.allowedUpdateColumns || tool.allowedInsertColumns || ['name', 'price', 'stock', 'is_active']).map(c => (
                      <span key={c} className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px]">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5 sm:col-span-2">
                  <div className="text-[10px] text-red-400">PROTECTED COLUMNS (BLOCKED FROM WRITE)</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(tool.protectedColumns || ['id', 'is_admin', 'created_at', 'updated_at', 'organization_id', 'security_revision']).map(c => (
                      <span key={c} className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-300 text-[10px]">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <div className="text-[10px] text-[#8B9C8D]">CASCADE RISK CLASSIFICATION</div>
                  <div className="text-white font-medium">{tool.cascadeRisk || 'INSPECTED (FK Review Enforced)'}</div>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <div className="text-[10px] text-[#8B9C8D]">TRIGGER RISK TRACKING</div>
                  <div className="text-white font-medium">{tool.triggerRisk || 'INSPECTED (Audit Triggers Monitored)'}</div>
                </div>
              </div>
            </div>
          )}

          {/* Capabilities & Capability Implications Hierarchy */}
          <div className="p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div>
                <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  Capability Hierarchy & Inherited Implications
                </h3>
                <p className="text-[11px] text-[#8B9C8D] font-mono mt-0.5">
                  Visualization of inherited permissions derived from assigned capabilities.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-1 rounded bg-[#70FF5E]/10 border border-[#70FF5E]/20 text-[#70FF5E]">
                VISUALIZATION ONLY
              </span>
            </div>

            {/* Declared Capabilities */}
            <div className="space-y-3">
              <div className="text-xs font-mono text-[#8B9C8D]">DECLARED ROOT CAPABILITIES:</div>
              <div className="flex flex-wrap gap-2">
                {tool.capabilities && tool.capabilities.length > 0 ? (
                  tool.capabilities.map((cap) => (
                    <CapabilityBadge key={cap} capability={cap} size="md" />
                  ))
                ) : (
                  <span className="text-xs font-mono text-[#4D5C50]">No root capabilities declared.</span>
                )}
              </div>
            </div>

            {/* Implication Tree Visualization */}
            <div className="p-4 rounded-xl bg-black/50 border border-white/5 space-y-4">
              <div className="text-[11px] font-mono text-white font-medium flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-[#70FF5E]" />
                <span>INHERITED CAPABILITY IMPLICATIONS TREE:</span>
              </div>

              {tool.capabilities && tool.capabilities.length > 0 ? (
                <div className="space-y-3 text-xs font-mono">
                  {tool.capabilities.map((cap) => {
                    const implied = CAPABILITY_IMPLICATIONS[cap as ToolCapability] || [];
                    return (
                      <div key={cap} className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[#70FF5E] font-bold">↳</span>
                          <CapabilityBadge capability={cap} size="sm" />
                          <span className="text-[#4D5C50] text-[10px]">implies:</span>
                        </div>
                        {implied.length > 0 ? (
                          <div className="pl-6 flex flex-wrap items-center gap-2">
                            {implied.map((imp) => (
                              <div key={imp} className="flex items-center gap-1.5">
                                <span className="text-[#4D5C50]">→</span>
                                <CapabilityBadge capability={imp} size="sm" />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="pl-6 text-[10px] text-[#4D5C50]">
                            Leaf capability (no lower-level permissions implied)
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : null}

              <div className="p-3 rounded-lg bg-white/[0.02] text-[10px] font-mono text-[#8B9C8D] border border-white/5">
                Note: This capability tree represents semantic authorization models. The frontend does not calculate authoritative access rules.
              </div>
            </div>
          </div>

          {/* JSON Schema Snippet */}
          <div className="p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#70FF5E]" />
                <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  Tool Invocation Schema Definition
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#8B9C8D]">JSON SCHEMA</span>
            </div>

            <pre className="p-4 rounded-xl bg-black/60 border border-white/5 text-[11px] font-mono text-[#EDEDED] overflow-x-auto leading-relaxed">
              <code>{tool.schemaSnippet || '// No explicit schema snippet registered'}</code>
            </pre>
          </div>
        </div>

        {/* Right Column: Security Workflow Cross-Links */}
        <div className="space-y-6">
          {/* Related Approvals */}
          <div className="p-5 rounded-2xl bg-[#080B08] border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  Related Approvals ({relatedApprovals.length})
                </h4>
              </div>
              <Link
                to="/console/approvals"
                className="text-[10px] font-mono text-[#70FF5E] hover:underline"
              >
                VIEW ALL
              </Link>
            </div>

            {relatedApprovals.length === 0 ? (
              <div className="p-4 rounded-xl bg-black/30 border border-white/5 text-center text-xs font-mono text-[#4D5C50]">
                No pending or historical approvals for this tool.
              </div>
            ) : (
              <div className="space-y-2.5">
                {relatedApprovals.map((appr) => (
                  <div
                    key={appr.id}
                    onClick={() => navigate(`/console/approvals/${appr.id}`)}
                    className="p-3 rounded-xl bg-black/40 border border-white/5 hover:border-amber-500/30 cursor-pointer transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-white">{appr.id}</span>
                      <ApprovalStateBadge state={appr.state} size="sm" />
                    </div>
                    <div className="text-[11px] text-[#8B9C8D] font-mono truncate">{appr.toolAction}</div>
                    <div className="text-[10px] text-[#4D5C50] font-mono">Agent: {appr.agentName}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Related Quarantine Items */}
          <div className="p-5 rounded-2xl bg-[#080B08] border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-red-400" />
                <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  Quarantine Events ({relatedQuarantine.length})
                </h4>
              </div>
              <Link
                to="/console/quarantine"
                className="text-[10px] font-mono text-red-400 hover:underline"
              >
                VIEW ALL
              </Link>
            </div>

            {relatedQuarantine.length === 0 ? (
              <div className="p-4 rounded-xl bg-black/30 border border-white/5 text-center text-xs font-mono text-[#4D5C50]">
                No isolated results or quarantined outputs for this tool.
              </div>
            ) : (
              <div className="space-y-2.5">
                {relatedQuarantine.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/console/quarantine/${item.id}`)}
                    className="p-3 rounded-xl bg-black/40 border border-white/5 hover:border-red-500/30 cursor-pointer transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-white">{item.id}</span>
                      <ToolResultActionBadge action={item.sanitizedAction} size="sm" />
                    </div>
                    <div className="text-[11px] text-red-300 font-mono truncate">{item.quarantineReason}</div>
                    <div className="text-[10px] text-[#4D5C50] font-mono">Scan: {item.scanStatus}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Boundary Status */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-white/[0.02] to-transparent border border-white/10 space-y-3 font-mono text-xs">
            <div className="flex items-center gap-2 text-[#70FF5E] font-bold uppercase text-[11px]">
              <ShieldCheck className="w-4 h-4" />
              <span>Boundary Interception Guard</span>
            </div>
            <p className="text-[11px] text-[#8B9C8D] leading-relaxed font-sans">
              In production architecture, invocations of <span className="text-white font-mono">{tool.name}</span> pass through boundary interception before simulated or real execution authorization is granted (frontend simulation mode).
            </p>
            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-[#4D5C50]">
              <span>Assurance Level: {tool.assuranceLevel}</span>
              <span>Enforcement Mode: Simulated</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
