/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * VantaCore Global Search Service
 * Aggregates search index across all security entities and quick action commands.
 */

import { mockFetch, ApiResponse } from '../client';
import { SearchResultItem, RiskLevel } from '../../types/security';
import { MOCK_AGENTS } from '../../mock/agents';
import { MOCK_SESSIONS } from '../../mock/sessions';
import { MOCK_EVENTS } from '../../mock/events';
import { MOCK_DECISIONS } from '../../mock/decisions';
import { MOCK_ATTACK_CHAINS } from '../../mock/attackChains';
import { MOCK_TOOLS } from '../../mock/tools';
import { MOCK_APPROVALS } from '../../mock/approvals';
import { MOCK_QUARANTINED_RESULTS } from '../../mock/quarantine';
import { MOCK_POLICIES } from '../../mock/policies';
import { MOCK_AUDIT_LOGS } from '../../mock/audit';
import { MOCK_INCIDENTS } from '../../mock/investigations';

export const STATIC_COMMANDS: SearchResultItem[] = [
  {
    id: 'cmd-lab',
    title: 'Open Security Lab',
    subtitle: 'Simulate adversarial prompts & taint propagation',
    type: 'COMMAND',
    route: '/console/lab',
    badge: 'PLAYBACK',
  },
  {
    id: 'cmd-investigations',
    title: 'Open Unified Investigations',
    subtitle: 'Incident cases, evidence bookmarks & forensic timelines',
    type: 'COMMAND',
    route: '/console/investigations',
    badge: 'CASES',
  },
  {
    id: 'cmd-critical-events',
    title: 'Open Critical Security Events',
    subtitle: 'View live and ingested critical threat telemetry',
    type: 'COMMAND',
    route: '/console/events',
    badge: 'CRITICAL',
    severity: 'CRITICAL',
  },
  {
    id: 'cmd-approvals',
    title: 'Open Pending Approvals',
    subtitle: 'Review human authorization requests & single-use bindings',
    type: 'COMMAND',
    route: '/console/approvals',
    badge: 'GOVERNANCE',
  },
  {
    id: 'cmd-quarantine',
    title: 'Open Quarantine Vault',
    subtitle: 'Inspect withheld tainted artifacts and payload previews',
    type: 'COMMAND',
    route: '/console/quarantine',
    badge: 'CONTAINED',
    severity: 'HIGH',
  },
  {
    id: 'cmd-policies',
    title: 'Open Policies Catalog',
    subtitle: 'Inspect zero-trust rule specifications and version diffs',
    type: 'COMMAND',
    route: '/console/policies',
    badge: 'RULES',
  },
  {
    id: 'cmd-health',
    title: 'Open System Health',
    subtitle: 'Check component architecture and development status',
    type: 'COMMAND',
    route: '/console/system-health',
    badge: 'STATUS',
  },
];

export const searchService = {
  async search(query: string): Promise<ApiResponse<SearchResultItem[]>> {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Return top commands by default
      return mockFetch(STATIC_COMMANDS);
    }

    const results: SearchResultItem[] = [];

    // 1. Commands
    STATIC_COMMANDS.forEach((cmd) => {
      if (cmd.title.toLowerCase().includes(q) || cmd.subtitle.toLowerCase().includes(q)) {
        results.push(cmd);
      }
    });

    // 2. Investigations
    MOCK_INCIDENTS.forEach((inc) => {
      if (
        inc.id.toLowerCase().includes(q) ||
        inc.title.toLowerCase().includes(q) ||
        inc.summary.toLowerCase().includes(q) ||
        inc.tags.some((t) => t.toLowerCase().includes(q)) ||
        (q === 'exfil' && inc.id.includes('exfil')) ||
        (q === 'inc-0042' && inc.id === 'inc-exfil-001')
      ) {
        results.push({
          id: inc.id,
          title: `Incident: ${inc.title}`,
          subtitle: `${inc.id} • ${inc.status} • Assigned: ${inc.assignedAnalyst}`,
          type: 'INVESTIGATION',
          route: `/console/investigations/${inc.id}`,
          badge: inc.status,
          severity: inc.severity,
        });
      }
    });

    // 3. Agents
    MOCK_AGENTS.forEach((agent) => {
      if (
        agent.id.toLowerCase().includes(q) ||
        agent.name.toLowerCase().includes(q) ||
        (agent.description && agent.description.toLowerCase().includes(q))
      ) {
        results.push({
          id: agent.id,
          title: `Agent: ${agent.name}`,
          subtitle: `${agent.id} • Tier: ${agent.assuranceTier} • ${agent.environment}`,
          type: 'AGENT',
          route: `/console/agents/${agent.id}`,
          badge: agent.status,
          severity: agent.riskLevel,
        });
      }
    });

    // 4. Sessions
    MOCK_SESSIONS.forEach((sess) => {
      if (
        sess.id.toLowerCase().includes(q) ||
        sess.agentName.toLowerCase().includes(q) ||
        sess.status.toLowerCase().includes(q)
      ) {
        results.push({
          id: sess.id,
          title: `Session: ${sess.id}`,
          subtitle: `Agent: ${sess.agentName} • Status: ${sess.status} • Risk: ${sess.risk}`,
          type: 'SESSION',
          route: `/console/sessions/${sess.id}`,
          badge: sess.status,
          severity: sess.risk !== 'NOT_EVALUATED' ? (sess.risk as RiskLevel) : undefined,
        });
      }
    });

    // 5. Decisions
    MOCK_DECISIONS.forEach((dec) => {
      if (
        dec.id.toLowerCase().includes(q) ||
        dec.reason.toLowerCase().includes(q) ||
        dec.matchedPolicyName?.toLowerCase().includes(q) ||
        dec.decision.toLowerCase().includes(q)
      ) {
        results.push({
          id: dec.id,
          title: `Decision: ${dec.id} [${dec.decision}]`,
          subtitle: `${dec.matchedPolicyName || 'Inline Gateway Rule'} • ${dec.reason.slice(0, 60)}...`,
          type: 'DECISION',
          route: `/console/decisions/${dec.id}`,
          badge: dec.decision,
          severity: dec.riskLevel,
        });
      }
    });

    // 6. Attack Chains
    MOCK_ATTACK_CHAINS.forEach((chain) => {
      if (chain.id.toLowerCase().includes(q) || chain.title.toLowerCase().includes(q) || chain.summary.toLowerCase().includes(q)) {
        results.push({
          id: chain.id,
          title: `Attack Chain: ${chain.title}`,
          subtitle: `${chain.id} • ${chain.status} • Nodes: ${chain.nodes?.length || 0}`,
          type: 'ATTACK_CHAIN',
          route: `/console/attack-chains/${chain.id}`,
          badge: chain.status,
          severity: chain.severity,
        });
      }
    });

    // 7. Tools
    MOCK_TOOLS.forEach((t) => {
      if (t.id.toLowerCase().includes(q) || t.name.toLowerCase().includes(q) || t.displayName?.toLowerCase().includes(q)) {
        results.push({
          id: t.id,
          title: `Tool: ${t.displayName || t.name}`,
          subtitle: `${t.id} • Category: ${t.category} • Risk: ${t.riskRating}`,
          type: 'TOOL',
          route: `/console/tools/${t.id}`,
          badge: t.status,
          severity: t.riskRating,
        });
      }
    });

    // 8. Approvals
    MOCK_APPROVALS.forEach((appr) => {
      if (appr.id.toLowerCase().includes(q) || appr.toolName.toLowerCase().includes(q) || appr.justification?.toLowerCase().includes(q)) {
        results.push({
          id: appr.id,
          title: `Approval: ${appr.id} [${appr.state}]`,
          subtitle: `Tool: ${appr.toolName} • Agent: ${appr.agentName}`,
          type: 'APPROVAL',
          route: `/console/approvals/${appr.id}`,
          badge: appr.state,
          severity: appr.riskLevel,
        });
      }
    });

    // 9. Quarantine
    MOCK_QUARANTINED_RESULTS.forEach((quar) => {
      if (quar.id.toLowerCase().includes(q) || quar.quarantineReason.toLowerCase().includes(q) || quar.detectedTaintType?.toLowerCase().includes(q)) {
        results.push({
          id: quar.id,
          title: `Quarantine: ${quar.id}`,
          subtitle: `${quar.detectedTaintType || 'Tainted Payload'} • ${quar.quarantineReason.slice(0, 50)}...`,
          type: 'QUARANTINE',
          route: `/console/quarantine/${quar.id}`,
          badge: quar.sanitizedAction,
        });
      }
    });

    // 10. Policies
    MOCK_POLICIES.forEach((pol) => {
      if (pol.id.toLowerCase().includes(q) || pol.name.toLowerCase().includes(q) || pol.description.toLowerCase().includes(q)) {
        results.push({
          id: pol.id,
          title: `Policy: ${pol.name}`,
          subtitle: `${pol.id} • ${pol.version} • ${pol.actionOnMatch}`,
          type: 'POLICY',
          route: `/console/policies/${pol.id}`,
          badge: pol.status,
          severity: pol.priority as any,
        });
      }
    });

    // Limit to 20 results for performance
    return mockFetch(results.slice(0, 20));
  },
};
