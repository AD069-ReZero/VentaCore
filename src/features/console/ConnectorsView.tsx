/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * VantaCore MCP & Connector Management View (Area 7)
 * Lists external & local tool connectors (MCP StdIO, MCP HTTP, Generic HTTP)
 * with the 10 required columns:
 * Name, Connector ID, Type, Trust, Status, Endpoint Identity, Tool Count, Schema Drift, Credential State, Last Discovery.
 * Includes visual Discovery Workflow and interactive controls.
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Network,
  Search,
  Filter,
  Shield,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Cpu,
  Plug,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useConnectors, useDiscoverTools } from '../../api';
import { Connector, ConnectorStatus, ConnectorTrustLevel } from '../../types/security';

export const ConnectorsView: React.FC = () => {
  const navigate = useNavigate();
  const { data: connectors = [], isLoading, isError, error } = useConnectors();
  const discoverMutation = useDiscoverTools();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [trustFilter, setTrustFilter] = useState<string>('ALL');

  // Discovery feedback
  const [isDiscovering, setIsDiscovering] = useState<string | null>(null);

  // Metrics
  const metrics = useMemo(() => {
    const total = connectors.length;
    const active = connectors.filter((c) => c.status === 'ACTIVE').length;
    const drifted = connectors.filter((c) => c.schemaDrift).length;
    const pendingReview = connectors.filter((c) => c.status === 'PENDING_REVIEW').length;
    return { total, active, drifted, pendingReview };
  }, [connectors]);

  // Filtered Connectors
  const filteredConnectors = useMemo(() => {
    return connectors.filter((conn) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        conn.name.toLowerCase().includes(q) ||
        conn.id.toLowerCase().includes(q) ||
        conn.endpointIdentity.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'ALL' || conn.status === statusFilter;
      const matchesType = typeFilter === 'ALL' || conn.type === typeFilter;
      const matchesTrust = trustFilter === 'ALL' || conn.trustLevel === trustFilter;

      return matchesSearch && matchesStatus && matchesType && matchesTrust;
    });
  }, [connectors, searchQuery, statusFilter, typeFilter, trustFilter]);

  const handleTriggerDiscovery = async (connId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDiscovering(connId);
    try {
      await discoverMutation.mutateAsync(connId);
    } finally {
      setTimeout(() => setIsDiscovering(null), 1200);
    }
  };

  return (
    <div className="space-y-8 max-w-[1500px] mx-auto pb-12 antialiased">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Network className="w-4 h-4 text-[#70FF5E]" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#70FF5E]">
              MCP & CONNECTOR INTEGRATION GATEWAY
            </span>
            <span className="text-xs text-[#8B9C8D] font-mono">• Zero Auto-Activation Enforced</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            MCP & Connector Management
          </h1>
          <p className="text-xs sm:text-sm text-[#8B9C8D] font-sans mt-1">
            Secure lifecycle management for Model Context Protocol (MCP) servers and external API tool connectors.
          </p>
        </div>
      </div>

      {/* 2. Discovery Workflow Visual (Panel Concept) */}
      <div className="p-6 rounded-2xl bg-[#080B08] border border-white/10 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#70FF5E]" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
              MCP Discovery & Boundary Gate Workflow
            </h3>
          </div>
          <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
            RULE: Newly Discovered Tools NEVER Auto-Activate
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-2 text-center font-mono text-[10px]">
          {[
            '1. Register Connector',
            '2. Test Connection',
            '3. Discover Tools',
            '4. Security Scan',
            '5. Review',
            '6. Capability Mapping',
            '7. Side Effect Class',
            '8. Approval Rules',
            '9. Activate',
          ].map((step, idx) => (
            <div
              key={step}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center ${
                idx < 4
                  ? 'bg-[#70FF5E]/10 border-[#70FF5E]/30 text-[#70FF5E] font-bold'
                  : idx === 4
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold'
                  : 'bg-white/[0.02] border-white/5 text-[#8B9C8D]'
              }`}
            >
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#080B08] border border-white/10">
          <div className="text-[11px] font-mono text-[#8B9C8D] uppercase tracking-wider">TOTAL CONNECTORS</div>
          <div className="text-3xl font-display font-extrabold text-white mt-1.5">{metrics.total}</div>
          <div className="text-[10px] font-mono text-[#4D5C50] mt-1">MCP StdIO & HTTP endpoints</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#080B08] border border-[#70FF5E]/20">
          <div className="text-[11px] font-mono text-[#70FF5E] uppercase tracking-wider flex items-center justify-between">
            <span>ACTIVE</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#70FF5E]" />
          </div>
          <div className="text-3xl font-display font-extrabold text-[#70FF5E] mt-1.5">{metrics.active}</div>
          <div className="text-[10px] font-mono text-[#8B9C8D] mt-1">Authorized egress bridge</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#080B08] border border-orange-500/20">
          <div className="text-[11px] font-mono text-orange-400 uppercase tracking-wider">SCHEMA DRIFT</div>
          <div className="text-3xl font-display font-extrabold text-orange-400 mt-1.5">{metrics.drifted}</div>
          <div className="text-[10px] font-mono text-[#8B9C8D] mt-1">Payload schema altered</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#080B08] border border-amber-500/20">
          <div className="text-[11px] font-mono text-amber-400 uppercase tracking-wider">PENDING REVIEW</div>
          <div className="text-3xl font-display font-extrabold text-amber-400 mt-1.5">{metrics.pendingReview}</div>
          <div className="text-[10px] font-mono text-[#8B9C8D] mt-1">Operator audit required</div>
        </div>
      </div>

      {/* 4. Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#080B08] border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 font-mono text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8B9C8D] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search connectors by name, ID, endpoint..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#050605] border border-white/10 rounded-xl pl-9 pr-3.5 py-2 text-white placeholder-[#4D5C50] focus:outline-none focus:border-[#70FF5E]/50 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5">
            <span className="text-[#8B9C8D]">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#080B08]">ALL</option>
              <option value="MCP_STDIO" className="bg-[#080B08]">MCP_STDIO</option>
              <option value="MCP_HTTP" className="bg-[#080B08]">MCP_HTTP</option>
              <option value="GENERIC_HTTP_TOOL_CONNECTOR" className="bg-[#080B08]">GENERIC_HTTP</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5">
            <span className="text-[#8B9C8D]">Trust:</span>
            <select
              value={trustFilter}
              onChange={(e) => setTrustFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#080B08]">ALL</option>
              <option value="INTERNAL_MANAGED" className="bg-[#080B08] text-[#70FF5E]">INTERNAL_MANAGED</option>
              <option value="APPROVED_EXTERNAL" className="bg-[#080B08] text-sky-400">APPROVED_EXTERNAL</option>
              <option value="UNVERIFIED_EXTERNAL" className="bg-[#080B08] text-amber-400">UNVERIFIED_EXTERNAL</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. Connector List (10 Required Columns) */}
      <div className="rounded-2xl bg-[#080B08] border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01] text-[#8B9C8D] text-[10px] uppercase tracking-wider">
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Connector ID</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Trust</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Endpoint Identity</th>
                <th className="py-3.5 px-4">Tool Count</th>
                <th className="py-3.5 px-4">Schema Drift</th>
                <th className="py-3.5 px-4">Credential State</th>
                <th className="py-3.5 px-4 text-right">Last Discovery</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-[#8B9C8D]">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#70FF5E]" />
                    <p>Loading connectors...</p>
                  </td>
                </tr>
              ) : filteredConnectors.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-[#8B9C8D]">
                    <Network className="w-8 h-8 text-[#4D5C50] mx-auto mb-2" />
                    <p>No connectors match filter criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredConnectors.map((conn) => {
                  return (
                    <tr
                      key={conn.id}
                      onClick={() => navigate(`/console/connectors/${conn.id}`)}
                      className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                    >
                      {/* 1. Name */}
                      <td className="py-4 px-4 text-white font-bold group-hover:text-[#70FF5E] transition-colors whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Network className="w-4 h-4 text-[#70FF5E]" />
                          <span>{conn.name}</span>
                        </div>
                      </td>

                      {/* 2. Connector ID */}
                      <td className="py-4 px-4 text-[#8B9C8D] whitespace-nowrap">
                        {conn.id}
                      </td>

                      {/* 3. Type */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-sky-400">
                          {conn.type}
                        </span>
                      </td>

                      {/* 4. Trust */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            conn.trustLevel === 'INTERNAL_MANAGED'
                              ? 'bg-[#70FF5E]/10 text-[#70FF5E] border border-[#70FF5E]/30'
                              : conn.trustLevel === 'APPROVED_EXTERNAL'
                              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {conn.trustLevel}
                        </span>
                      </td>

                      {/* 5. Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            conn.status === 'ACTIVE'
                              ? 'bg-[#70FF5E]/10 text-[#70FF5E] border border-[#70FF5E]/30'
                              : conn.status === 'PENDING_REVIEW'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-red-500/10 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {conn.status}
                        </span>
                      </td>

                      {/* 6. Endpoint Identity */}
                      <td className="py-4 px-4 text-[#8B9C8D] text-[11px] truncate max-w-[180px]">
                        {conn.endpointIdentity}
                      </td>

                      {/* 7. Tool Count */}
                      <td className="py-4 px-4 text-white font-bold whitespace-nowrap">
                        {conn.toolCount} tools
                      </td>

                      {/* 8. Schema Drift */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {conn.schemaDrift ? (
                          <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/40 text-[10px] font-bold flex items-center gap-1 w-max">
                            <AlertTriangle className="w-3 h-3" />
                            <span>DRIFT DETECTED</span>
                          </span>
                        ) : (
                          <span className="text-[#4D5C50] text-[11px]">Synced</span>
                        )}
                      </td>

                      {/* 9. Credential State */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`text-[11px] font-semibold ${
                            conn.credentialState === 'HEALTHY'
                              ? 'text-[#70FF5E]'
                              : conn.credentialState === 'ROTATING'
                              ? 'text-amber-400'
                              : 'text-red-400'
                          }`}
                        >
                          {conn.credentialState}
                        </span>
                      </td>

                      {/* 10. Last Discovery */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-[#8B9C8D] text-[11px]">
                            {new Date(conn.lastDiscovery).toLocaleTimeString()}
                          </span>
                          <button
                            onClick={(e) => handleTriggerDiscovery(conn.id, e)}
                            title="Discover Tools"
                            className="p-1 rounded bg-white/5 hover:bg-white/10 text-[#8B9C8D] hover:text-[#70FF5E]"
                          >
                            <RefreshCw
                              className={`w-3.5 h-3.5 ${isDiscovering === conn.id ? 'animate-spin text-[#70FF5E]' : ''}`}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
