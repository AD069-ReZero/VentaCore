/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * VantaCore System Health & Component Architecture View — Area 13: System Health
 * Real-time operational telemetry and architectural status across all 8 core SOC components:
 * - Gateway
 * - Security Engine
 * - OPA
 * - PostgreSQL
 * - Redis
 * - Policy Bundle
 * - Signing Key
 * - Audit Integrity
 * 
 * States: HEALTHY, DEGRADED, UNAVAILABLE, UNKNOWN.
 * Detailed latency, heartbeat, version, dependency status, and system metadata.
 */

import React, { useMemo } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Server,
  Database,
  Cpu,
  Layers,
  Network,
  Radio,
  FileCheck,
  Lock,
  Clock,
  Sparkles,
  GitCommit,
  Tag,
  Hash,
  Key,
  ShieldCheck,
  Fingerprint,
  RefreshCw,
} from 'lucide-react';
import { useSocSystemHealth, useSocMetadata } from '../../api';
import { SocComponentStatus, SocSystemComponent } from '../../types/security';

export const SystemHealthView: React.FC = () => {
  const { data: components = [], isLoading: compLoading, refetch } = useSocSystemHealth();
  const { data: metadata, isLoading: metaLoading } = useSocMetadata();

  // Status breakdown metrics
  const statusCounts = useMemo(() => {
    let healthy = 0;
    let degraded = 0;
    let unavailable = 0;
    let unknown = 0;

    components.forEach((c) => {
      if (c.status === 'HEALTHY') healthy++;
      else if (c.status === 'DEGRADED') degraded++;
      else if (c.status === 'UNAVAILABLE') unavailable++;
      else unknown++;
    });

    return { healthy, degraded, unavailable, unknown, total: components.length };
  }, [components]);

  const getStatusBadge = (status: SocComponentStatus) => {
    switch (status) {
      case 'HEALTHY':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-[#70FF5E] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#70FF5E] animate-pulse" />
            <span>HEALTHY</span>
          </span>
        );
      case 'DEGRADED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>DEGRADED</span>
          </span>
        );
      case 'UNAVAILABLE':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span>UNAVAILABLE</span>
          </span>
        );
      case 'UNKNOWN':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-white/5 border border-white/10 text-[#8B9C8D] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4D5C50]" />
            <span>UNKNOWN</span>
          </span>
        );
    }
  };

  const getComponentIcon = (key: string) => {
    switch (key) {
      case 'GATEWAY':
        return <Network className="w-5 h-5 text-[#70FF5E]" />;
      case 'SECURITY_ENGINE':
        return <Cpu className="w-5 h-5 text-purple-400" />;
      case 'OPA':
        return <ShieldCheck className="w-5 h-5 text-sky-400" />;
      case 'POSTGRESQL':
        return <Database className="w-5 h-5 text-amber-400" />;
      case 'REDIS':
        return <Server className="w-5 h-5 text-rose-400" />;
      case 'POLICY_BUNDLE':
        return <FileCheck className="w-5 h-5 text-emerald-400" />;
      case 'SIGNING_KEY':
        return <Key className="w-5 h-5 text-teal-400" />;
      case 'AUDIT_INTEGRITY':
        return <Fingerprint className="w-5 h-5 text-indigo-400" />;
      default:
        return <Layers className="w-5 h-5 text-white" />;
    }
  };

  if (compLoading || metaLoading) {
    return (
      <div className="space-y-8 max-w-[1440px] mx-auto animate-pulse">
        <div className="space-y-3">
          <div className="h-8 w-64 bg-white/10 rounded" />
          <div className="h-4 w-96 bg-white/5 rounded" />
        </div>
        <div className="h-32 bg-white/5 rounded-2xl border border-white/5" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-44 bg-white/5 rounded-2xl border border-white/5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1440px] mx-auto">
      {/* Title & Top Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight uppercase">
            SYSTEM HEALTH & TELEMETRY
          </h1>
          <p className="text-xs sm:text-sm text-[#8B9C8D] font-sans mt-1">
            Authoritative status and cryptographic health across all 8 core SOC architectural components.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-xs flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#70FF5E]" />
            <span>Poll Telemetry</span>
          </button>
        </div>
      </div>

      {/* System Metadata Card */}
      {metadata && (
        <div className="p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#70FF5E] animate-pulse" />
              <h2 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                SYSTEM METADATA & REVISION STATE
              </h2>
            </div>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#70FF5E]/10 text-[#70FF5E] border border-[#70FF5E]/30 uppercase">
              {metadata.environment}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 font-mono text-xs">
            <div className="space-y-1">
              <span className="text-[10px] text-[#8B9C8D] uppercase tracking-wider block">BUILD VERSION</span>
              <div className="flex items-center gap-1.5 text-white font-semibold">
                <Tag className="w-3.5 h-3.5 text-sky-400" />
                <span>{metadata.buildVersion}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-[#8B9C8D] uppercase tracking-wider block">GIT COMMIT</span>
              <div className="flex items-center gap-1.5 text-white font-semibold">
                <GitCommit className="w-3.5 h-3.5 text-purple-400" />
                <code className="text-[#38BDF8]">{metadata.gitCommit.slice(0, 10)}</code>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-[#8B9C8D] uppercase tracking-wider block">POLICY VERSION</span>
              <div className="flex items-center gap-1.5 text-white font-semibold">
                <FileCheck className="w-3.5 h-3.5 text-[#70FF5E]" />
                <span>{metadata.policyVersion}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-[#8B9C8D] uppercase tracking-wider block">POLICY HASH</span>
              <div className="flex items-center gap-1.5 text-white font-semibold">
                <Hash className="w-3.5 h-3.5 text-amber-400" />
                <span className="truncate max-w-[110px]" title={metadata.policyHash}>
                  {metadata.policyHash.slice(0, 14)}...
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-[#8B9C8D] uppercase tracking-wider block">SIGNING KEY</span>
              <div className="flex items-center gap-1.5 text-white font-semibold">
                <Key className="w-3.5 h-3.5 text-teal-400" />
                <span className="truncate max-w-[120px]">{metadata.signingKeyVersion}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-[#8B9C8D] uppercase tracking-wider block">MIGRATION VER</span>
              <div className="flex items-center gap-1.5 text-white font-semibold">
                <Database className="w-3.5 h-3.5 text-rose-400" />
                <span className="truncate max-w-[120px]" title={metadata.migrationVersion}>
                  {metadata.migrationVersion.slice(0, 16)}...
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Metrics — 4 States: HEALTHY, DEGRADED, UNAVAILABLE, UNKNOWN */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0C120D] to-[#060806] border border-[#70FF5E]/20 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#70FF5E]/60 to-transparent" />
          <div className="flex items-center justify-between text-[#8B9C8D] text-xs font-mono tracking-wider uppercase">
            <span>HEALTHY</span>
            <CheckCircle2 className="w-4 h-4 text-[#70FF5E]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-4xl font-bold text-white tracking-tight">
              {statusCounts.healthy}
            </span>
            <span className="text-xs font-mono text-[#70FF5E]">/ {statusCounts.total}</span>
          </div>
          <p className="mt-1 text-[11px] text-[#4D5C50] font-mono">
            Passing continuous health assertions
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#120F08] to-[#080604] border border-amber-500/20 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
          <div className="flex items-center justify-between text-[#8B9C8D] text-xs font-mono tracking-wider uppercase">
            <span>DEGRADED</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-4xl font-bold text-amber-300 tracking-tight">
              {statusCounts.degraded}
            </span>
            <span className="text-xs font-mono text-amber-400">LATENCY WARN</span>
          </div>
          <p className="mt-1 text-[11px] text-[#4D5C50] font-mono">
            Elevated response times or retry pressure
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#120808] to-[#080404] border border-red-500/20 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />
          <div className="flex items-center justify-between text-[#8B9C8D] text-xs font-mono tracking-wider uppercase">
            <span>UNAVAILABLE</span>
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-4xl font-bold text-red-400 tracking-tight">
              {statusCounts.unavailable}
            </span>
            <span className="text-xs font-mono text-red-400">OFFLINE</span>
          </div>
          <p className="mt-1 text-[11px] text-[#4D5C50] font-mono">
            Failing heartbeat checks or partitioned
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0B0D12] to-[#050608] border border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="flex items-center justify-between text-[#8B9C8D] text-xs font-mono tracking-wider uppercase">
            <span>UNKNOWN</span>
            <HelpCircle className="w-4 h-4 text-[#8B9C8D]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-4xl font-bold text-white/70 tracking-tight">
              {statusCounts.unknown}
            </span>
            <span className="text-xs font-mono text-[#8B9C8D]">UNPROVISIONED</span>
          </div>
          <p className="mt-1 text-[11px] text-[#4D5C50] font-mono">
            No telemetry stream detected
          </p>
        </div>
      </div>

      {/* Component Grid: 8 Components */}
      {/* Gateway, Security Engine, OPA, PostgreSQL, Redis, Policy Bundle, Signing Key, Audit Integrity */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <h2 className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Server className="w-4 h-4 text-[#70FF5E]" />
            <span>ARCHITECTURAL COMPONENTS (8 CORE SUBSYSTEMS)</span>
          </h2>
          <span className="font-mono text-xs text-[#8B9C8D]">
            All 8 subsystems monitored via sub-second heartbeats
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {components.map((comp) => {
            return (
              <div
                key={comp.id}
                className="p-5 rounded-2xl bg-[#080B08] border border-white/10 hover:border-white/20 transition-all space-y-4 font-mono text-xs"
              >
                {/* Header: Icon, Name, Key, Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                      {getComponentIcon(comp.componentKey)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{comp.name}</h3>
                      <div className="text-[10px] text-[#8B9C8D] uppercase tracking-wider">
                        KEY: <code className="text-[#70FF5E]">{comp.componentKey}</code>
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(comp.status)}
                </div>

                {/* Details / Purpose */}
                <p className="text-[11px] text-[#8B9C8D] font-sans">
                  {comp.details}
                </p>

                {/* Latency & Heartbeat & Version Row */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-black/60 border border-white/5 text-[11px]">
                  <div>
                    <span className="text-[9px] text-[#4D5C50] uppercase block">LATENCY</span>
                    <span className="text-[#70FF5E] font-bold">
                      {comp.latencyMs !== undefined ? `${comp.latencyMs.toFixed(1)} ms` : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#4D5C50] uppercase block">HEARTBEAT</span>
                    <span className="text-white">
                      {comp.lastHeartbeat ? new Date(comp.lastHeartbeat).toLocaleTimeString() : 'Active'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#4D5C50] uppercase block">VERSION</span>
                    <span className="text-sky-400 truncate block" title={comp.version}>
                      {comp.version}
                    </span>
                  </div>
                </div>

                {/* Dependency Status */}
                <div className="pt-1 border-t border-white/5 text-[11px] text-[#8B9C8D] flex items-center justify-between gap-2">
                  <span className="text-[10px] text-[#4D5C50] uppercase shrink-0">DEPENDENCIES:</span>
                  <span className="text-white/90 truncate text-right" title={comp.dependencyStatus}>
                    {comp.dependencyStatus}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
