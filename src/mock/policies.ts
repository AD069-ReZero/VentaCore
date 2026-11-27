/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * VantaCore Policy Catalog & Simulation Mock Layer
 * Note: All policy evaluation is SIMULATED. No real OPA/Rego daemon is connected in this frontend build.
 */

import { Policy, PolicySimulationInput, PolicySimulationResult } from '../types/security';

export const MOCK_POLICIES: Policy[] = [
  {
    id: 'pol-001',
    name: 'Cloud Metadata Egress Interception',
    description: 'Strictly blocks AI agents from requesting AWS/GCP/Azure link-local metadata IP 169.254.169.254 or unapproved external endpoints.',
    version: 'v2.4.1',
    status: 'ACTIVE',
    enabled: true,
    tier: 'ENFORCED',
    actionOnMatch: 'BLOCK',
    category: 'EGRESS_CONTROL',
    severity: 'CRITICAL',
    scope: 'GLOBAL',
    priority: 'CRITICAL',
    createdAt: '2026-08-10T14:00:00Z',
    updatedAt: '2026-10-15T12:00:00Z',
    activatedAt: '2026-10-15T12:05:00Z',
    author: 'secops@vantacore.internal',
    signedBy: 'cosign-key:vantacore-secops-root#49a',
    bundleHash: 'sha256:8f41da09b119a7ee4c4456e3bd6e4a2bc194a2f8b50201dd9201a41a4592d193',
    rulesCount: 3,
    enforcedHits: 42,
    evaluationCount: 1420,
    rules: [
      {
        id: 'rule-001-1',
        name: 'Block Link-Local Cloud Metadata',
        description: 'Blocks network egress to 169.254.169.254 or metadata service endpoints.',
        conditions: [
          { field: 'Destination', operator: 'MATCHES', value: '169.254.169.254' },
          { field: 'Destination Trust', operator: 'EQUALS', value: 'DENIED' },
        ],
        action: 'BLOCK',
      },
      {
        id: 'rule-001-2',
        name: 'Prevent Restricted Egress to Unknown External',
        description: 'Blocks tool invocations sending restricted resource data to untrusted external destinations.',
        conditions: [
          { field: 'Resource Sensitivity', operator: '>=', value: 'RESTRICTED' },
          { field: 'Destination Trust', operator: 'EQUALS', value: 'UNKNOWN_EXTERNAL' },
        ],
        action: 'BLOCK',
      },
      {
        id: 'rule-001-3',
        name: 'Flag Untrusted Input Network Egress',
        description: 'Suspends egress calls initiated with untrusted input taint for human authorization.',
        conditions: [
          { field: 'Taint Labels', operator: 'CONTAINS', value: 'UNTRUSTED_INPUT' },
          { field: 'Tool Capability', operator: 'EQUALS', value: 'NETWORK_EGRESS' },
        ],
        action: 'REVIEW',
      },
    ],
    versions: [
      {
        version: 'v2.4.1',
        created: '2026-10-15T12:00:00Z',
        activated: '2026-10-15T12:05:00Z',
        status: 'ACTIVE',
        author: 'secops@vantacore.internal',
        hash: 'sha256:8f41da09...d193',
        changes: 'Hardened link-local blocklist with AWS IMDSv2 token bypass signatures.',
      },
      {
        version: 'v2.4.0',
        created: '2026-10-01T08:30:00Z',
        activated: '2026-10-01T09:00:00Z',
        status: 'SUPERSEDED',
        author: 'secops@vantacore.internal',
        hash: 'sha256:1a82bc04...92f1',
        changes: 'Added support for containerized sidecar proxy bypass detection.',
      },
      {
        version: 'v2.3.2',
        created: '2026-09-12T11:15:00Z',
        activated: '2026-09-12T11:30:00Z',
        status: 'ARCHIVED',
        author: 'sre-lead@vantacore.internal',
        hash: 'sha256:6e409fa1...b004',
        changes: 'Initial egress rule bundle definition for autonomous agent network gateways.',
      },
    ],
    relatedDecisionIds: ['dec-001', 'dec-004'],
  },
  {
    id: 'pol-002',
    name: 'Indirect Prompt Injection Heuristic Guardrail',
    description: 'Evaluates scraped web content, document chunks, and tool payloads against adversarial jailbreak and prompt injection signatures.',
    version: 'v3.1.0',
    status: 'ACTIVE',
    enabled: true,
    tier: 'ENFORCED',
    actionOnMatch: 'REVIEW',
    category: 'INJECTION_PREVENTION',
    severity: 'HIGH',
    scope: 'GLOBAL',
    priority: 'HIGH',
    createdAt: '2026-07-22T09:00:00Z',
    updatedAt: '2026-10-14T09:30:00Z',
    activatedAt: '2026-10-14T09:45:00Z',
    author: 'ai-security@vantacore.internal',
    signedBy: 'cosign-key:vantacore-ai-safety#11c',
    bundleHash: 'sha256:4a38cc1100bfae929a7414bc9102ef713914a22b9f8745cda1918a09bc1990e4',
    rulesCount: 4,
    enforcedHits: 128,
    evaluationCount: 3892,
    rules: [
      {
        id: 'rule-002-1',
        name: 'Block Confirmed Prompt Injection with High Risk',
        description: 'Blocks tool invocations where injection classifiers trigger with risk level HIGH or CRITICAL.',
        conditions: [
          { field: 'Taint Labels', operator: 'CONTAINS', value: 'PROMPT_INJECTION' },
          { field: 'Risk Level', operator: '>=', value: 'HIGH' },
        ],
        action: 'BLOCK',
      },
      {
        id: 'rule-002-2',
        name: 'Intercept Adversarial Jailbreak Suffixes',
        description: 'Blocks prompts containing known adversarial token optimization suffixes.',
        conditions: [
          { field: 'Signals', operator: 'CONTAINS', value: 'ADVERSARIAL_SUFFIX_DETECTED' },
        ],
        action: 'BLOCK',
      },
      {
        id: 'rule-002-3',
        name: 'Human Review on Untrusted Web Content Ingestion',
        description: 'Flags execution for manual approval if external web content attempts database modification.',
        conditions: [
          { field: 'External Content', operator: 'EQUALS', value: 'DETECTED' },
          { field: 'Tool Capability', operator: 'EQUALS', value: 'DATABASE_WRITE' },
        ],
        action: 'REVIEW',
      },
      {
        id: 'rule-002-4',
        name: 'Permit Benign Structured Extraction',
        description: 'Permits internal data processing when prompt injection confidence is below threshold.',
        conditions: [
          { field: 'Injection Confidence', operator: '<', value: '0.15' },
          { field: 'Destination Trust', operator: 'EQUALS', value: 'INTERNAL_TRUSTED' },
        ],
        action: 'ALLOW',
      },
    ],
    versions: [
      {
        version: 'v3.1.0',
        created: '2026-10-14T09:30:00Z',
        activated: '2026-10-14T09:45:00Z',
        status: 'ACTIVE',
        author: 'ai-security@vantacore.internal',
        hash: 'sha256:4a38cc11...90e4',
        changes: 'Added zero-day jailbreak pattern classifier for multi-modal SVG steganography.',
      },
      {
        version: 'v3.0.0',
        created: '2026-09-18T14:10:00Z',
        activated: '2026-09-18T14:30:00Z',
        status: 'SUPERSEDED',
        author: 'ai-security@vantacore.internal',
        hash: 'sha256:7b1980ee...4112',
        changes: 'Overhauled heuristic regex scanner to support unicode normalization and leetspeak.',
      },
    ],
    relatedDecisionIds: ['dec-002'],
  },
  {
    id: 'pol-003',
    name: 'PII & Payment Card Data Redaction',
    description: 'Performs streaming redaction and access control on agent operations containing SSNs, payment card data, or sensitive keys.',
    version: 'v1.8.2',
    status: 'ACTIVE',
    enabled: true,
    tier: 'ENFORCED',
    actionOnMatch: 'ALLOW',
    category: 'DATA_LEAKAGE',
    severity: 'MEDIUM',
    scope: 'PII',
    priority: 'MEDIUM',
    createdAt: '2026-06-15T10:00:00Z',
    updatedAt: '2026-10-12T16:45:00Z',
    activatedAt: '2026-10-12T17:00:00Z',
    author: 'privacy-officer@vantacore.internal',
    signedBy: 'cosign-key:vantacore-compliance#88b',
    bundleHash: 'sha256:77bc910245a4de0914856a2bb8912ef0934177651a2e45bbd0912fa89100fa23',
    rulesCount: 3,
    enforcedHits: 593,
    evaluationCount: 12480,
    rules: [
      {
        id: 'rule-003-1',
        name: 'Block Unsanitized Payment Card Egress',
        description: 'Blocks tool outputs transmitting raw credit card PAN strings.',
        conditions: [
          { field: 'Sensitive Data Result', operator: 'CONTAINS', value: 'PAYMENT_CARD' },
          { field: 'Destination Trust', operator: '!=', value: 'INTERNAL_TRUSTED' },
        ],
        action: 'BLOCK',
      },
      {
        id: 'rule-003-2',
        name: 'Block Raw Credential Transmission',
        description: 'Blocks transmission of API keys, private keys, or passwords across non-internal trust boundaries.',
        conditions: [
          { field: 'Sensitive Data Result', operator: 'CONTAINS', value: 'CREDENTIAL' },
          { field: 'Destination Trust', operator: '!=', value: 'INTERNAL_TRUSTED' },
        ],
        action: 'BLOCK',
      },
      {
        id: 'rule-003-3',
        name: 'Review PII Aggregation in Low-Trust Zones',
        description: 'Demands human authorization if high volumes of customer PII are exported to external partners.',
        conditions: [
          { field: 'Sensitive Data Result', operator: 'CONTAINS', value: 'PII' },
          { field: 'Destination Trust', operator: 'EQUALS', value: 'APPROVED_EXTERNAL_OWNED' },
        ],
        action: 'REVIEW',
      },
    ],
    versions: [
      {
        version: 'v1.8.2',
        created: '2026-10-12T16:45:00Z',
        activated: '2026-10-12T17:00:00Z',
        status: 'ACTIVE',
        author: 'privacy-officer@vantacore.internal',
        hash: 'sha256:77bc9102...fa23',
        changes: 'Updated Luhn algorithm validator to detect international payment token patterns.',
      },
    ],
    relatedDecisionIds: [],
  },
  {
    id: 'pol-004',
    name: 'Kubernetes Destructive Operations Hold',
    description: 'Suspends any tool request attempting pod deletion, secret modification, or namespace reconfiguration for human approval.',
    version: 'v2.0.4',
    status: 'ACTIVE',
    enabled: true,
    tier: 'ENFORCED',
    actionOnMatch: 'REVIEW',
    category: 'TOOL_ACCESS',
    severity: 'CRITICAL',
    scope: 'TOOL_CLASS',
    priority: 'CRITICAL',
    createdAt: '2026-05-18T14:20:00Z',
    updatedAt: '2026-10-10T11:20:00Z',
    activatedAt: '2026-10-10T11:30:00Z',
    author: 'sre-lead@vantacore.internal',
    signedBy: 'cosign-key:vantacore-sre-lead#90d',
    bundleHash: 'sha256:3910ffea89104bce902847c1b5091aefc301490218bca419820f1883902128c1',
    rulesCount: 2,
    enforcedHits: 17,
    evaluationCount: 412,
    rules: [
      {
        id: 'rule-004-1',
        name: 'Hold Critical Database & Cluster Writes',
        description: 'Requires human security authorization when tool capability involves destructive database writes or cluster deletions.',
        conditions: [
          { field: 'Risk Level', operator: 'EQUALS', value: 'CRITICAL' },
          { field: 'Tool Capability', operator: 'EQUALS', value: 'DATABASE_WRITE' },
        ],
        action: 'REVIEW',
      },
      {
        id: 'rule-004-2',
        name: 'Intercept Pod & Deployment Deletion',
        description: 'Intercepts Kubernetes pod kill and deployment rollout restarts.',
        conditions: [
          { field: 'Tool', operator: 'EQUALS', value: 'k8s-pod-operator' },
          { field: 'Operation', operator: 'EQUALS', value: 'DELETE' },
        ],
        action: 'REVIEW',
      },
    ],
    versions: [
      {
        version: 'v2.0.4',
        created: '2026-10-10T11:20:00Z',
        activated: '2026-10-10T11:30:00Z',
        status: 'ACTIVE',
        author: 'sre-lead@vantacore.internal',
        hash: 'sha256:3910ffea...28c1',
        changes: 'Added dry-run preflight validation and dual-authorization requirement for production namespaces.',
      },
    ],
    relatedDecisionIds: ['dec-003'],
  },
  {
    id: 'pol-005',
    name: 'MCP Tool Poisoning & Dynamic Schema Guard',
    description: 'Validates Model Context Protocol (MCP) tool registrations, runtime schemas, and prompt directives against malicious alterations.',
    version: 'v0.9.0-draft',
    status: 'DRAFT',
    enabled: false,
    tier: 'ENFORCED',
    actionOnMatch: 'BLOCK',
    category: 'TOOL_ACCESS',
    severity: 'HIGH',
    scope: 'AGENT',
    priority: 'HIGH',
    createdAt: '2026-10-16T18:00:00Z',
    updatedAt: '2026-10-16T18:30:00Z',
    author: 'ai-security@vantacore.internal',
    signedBy: 'UNSIGNED (DRAFT BUNDLE)',
    bundleHash: 'sha256:draft-912ab0...Pending',
    rulesCount: 2,
    enforcedHits: 0,
    evaluationCount: 15,
    rules: [
      {
        id: 'rule-005-1',
        name: 'Block Untrusted Tool Dynamic Registration',
        description: 'Blocks agents from invoking MCP tools whose schema has not been approved in Tool Registry.',
        conditions: [
          { field: 'Signals', operator: 'CONTAINS', value: 'TOOL_POISONING_ATTEMPT' },
        ],
        action: 'BLOCK',
      },
      {
        id: 'rule-005-2',
        name: 'Block Code Execution to Unknown External Dest',
        description: 'Blocks tool execution invoking remote code evaluation when destination trust is unknown.',
        conditions: [
          { field: 'Tool Capability', operator: 'EQUALS', value: 'CODE_EXECUTION' },
          { field: 'Destination Trust', operator: 'EQUALS', value: 'UNKNOWN_EXTERNAL' },
        ],
        action: 'BLOCK',
      },
    ],
    versions: [
      {
        version: 'v0.9.0-draft',
        created: '2026-10-16T18:00:00Z',
        activated: 'NOT_ACTIVATED',
        status: 'ACTIVE',
        author: 'ai-security@vantacore.internal',
        hash: 'sha256:draft-912a...Pending',
        changes: 'Initial draft specification for MCP server validation and runtime JSON schema enforcement.',
      },
    ],
    relatedDecisionIds: [],
  },
  {
    id: 'pol-006',
    name: 'High-Entropy Secret Exfiltration Blocker',
    description: 'Enforces strict egress boundaries when agents manipulate sensitive keys, credentials, or private certificates.',
    version: 'v2.2.0',
    status: 'ACTIVE',
    enabled: true,
    tier: 'ENFORCED',
    actionOnMatch: 'BLOCK',
    category: 'EGRESS_CONTROL',
    severity: 'CRITICAL',
    scope: 'GLOBAL',
    priority: 'CRITICAL',
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-10-11T15:20:00Z',
    activatedAt: '2026-10-11T15:30:00Z',
    author: 'secops@vantacore.internal',
    signedBy: 'cosign-key:vantacore-secops-root#49a',
    bundleHash: 'sha256:5b20da188912efc4091244ab98012efa48194488192a014299bca99104faee41',
    rulesCount: 3,
    enforcedHits: 88,
    evaluationCount: 5210,
    rules: [
      {
        id: 'rule-006-1',
        name: 'Block Restricted Data to Unknown External',
        description: 'Blocks egress of restricted or confidential data to any unverified external destination.',
        conditions: [
          { field: 'Resource Sensitivity', operator: '>=', value: 'RESTRICTED' },
          { field: 'Destination Trust', operator: 'EQUALS', value: 'UNKNOWN_EXTERNAL' },
        ],
        action: 'BLOCK',
      },
      {
        id: 'rule-006-2',
        name: 'Block Confirmed Secret Exfiltration Probe',
        description: 'Blocks tool execution when security telemetry classifies the request as a secret exfiltration attempt.',
        conditions: [
          { field: 'Signals', operator: 'CONTAINS', value: 'SECRET_EXFILTRATION_PROBE' },
        ],
        action: 'BLOCK',
      },
      {
        id: 'rule-006-3',
        name: 'Hold High Risk Sensitive Egress for Review',
        description: 'Demands human authorization if high risk data is sent to approved external owned destinations.',
        conditions: [
          { field: 'Risk Level', operator: 'EQUALS', value: 'HIGH' },
          { field: 'Destination Trust', operator: 'EQUALS', value: 'APPROVED_EXTERNAL_OWNED' },
        ],
        action: 'REVIEW',
      },
    ],
    versions: [
      {
        version: 'v2.2.0',
        created: '2026-10-11T15:20:00Z',
        activated: '2026-10-11T15:30:00Z',
        status: 'ACTIVE',
        author: 'secops@vantacore.internal',
        hash: 'sha256:5b20da18...ee41',
        changes: 'Unified entropy threshold analyzer with V2.2 destination trust matrix.',
      },
    ],
    relatedDecisionIds: ['dec-001'],
  },
];

/**
 * Simulated policy evaluation function.
 * Note: Purely synthetic mock simulation for developer workbench. Not executed by real OPA daemon.
 */
export function simulatePolicyEvaluation(input: PolicySimulationInput): PolicySimulationResult {
  // Rule 1: Destination Trust is DENIED or UNTRUSTED_EXTERNAL with RESTRICTED/CRITICAL sensitivity -> BLOCK
  if (
    input.destinationTrust === 'DENIED' ||
    (input.destinationTrust === 'UNTRUSTED_EXTERNAL' &&
      ['RESTRICTED', 'CONFIDENTIAL', 'CRITICAL'].includes(input.resourceSensitivity))
  ) {
    return {
      decision: 'BLOCK',
      matchedPolicyId: 'pol-001',
      matchedPolicyName: 'Cloud Metadata Egress Interception',
      matchedRule: 'IF Resource Sensitivity >= RESTRICTED AND Destination Trust = UNTRUSTED_EXTERNAL/DENIED THEN BLOCK',
      simulatedAt: new Date().toISOString(),
      reason: `Blocked egress: Destination trust level "${input.destinationTrust}" prohibits access to ${input.resourceSensitivity} resources.`,
      disclaimer: 'SIMULATED POLICY EVALUATION — NO REAL OPA ENGINE EXECUTION',
    };
  }

  // Rule 2: Signals contain PROMPT_INJECTION or SECRET_EXFILTRATION_PROBE -> BLOCK
  if (
    input.signals.some((s) =>
      ['PROMPT_INJECTION', 'SECRET_EXFILTRATION_PROBE', 'ADVERSARIAL_SUFFIX_DETECTED'].includes(s)
    )
  ) {
    return {
      decision: 'BLOCK',
      matchedPolicyId: 'pol-002',
      matchedPolicyName: 'Indirect Prompt Injection Heuristic Guardrail',
      matchedRule: 'IF Signals CONTAINS [PROMPT_INJECTION | SECRET_EXFILTRATION_PROBE] THEN BLOCK',
      simulatedAt: new Date().toISOString(),
      reason: 'Adversarial jailbreak or secret exfiltration signature detected in agent invocation payload.',
      disclaimer: 'SIMULATED POLICY EVALUATION — NO REAL OPA ENGINE EXECUTION',
    };
  }

  // Rule 3: Destination Trust = UNKNOWN_EXTERNAL and Resource Sensitivity >= RESTRICTED -> BLOCK
  if (
    input.destinationTrust === 'UNKNOWN_EXTERNAL' &&
    ['RESTRICTED', 'CONFIDENTIAL', 'CRITICAL'].includes(input.resourceSensitivity)
  ) {
    return {
      decision: 'BLOCK',
      matchedPolicyId: 'pol-006',
      matchedPolicyName: 'High-Entropy Secret Exfiltration Blocker',
      matchedRule: 'IF Resource Sensitivity >= RESTRICTED AND Destination Trust = UNKNOWN_EXTERNAL THEN BLOCK',
      simulatedAt: new Date().toISOString(),
      reason: 'Egress to unknown external destination blocked due to high resource sensitivity.',
      disclaimer: 'SIMULATED POLICY EVALUATION — NO REAL OPA ENGINE EXECUTION',
    };
  }

  // Rule 4: Risk Level is HIGH or CRITICAL with database or sensitive tool -> REVIEW
  if (
    (input.riskLevel === 'HIGH' || input.riskLevel === 'CRITICAL') ||
    input.signals.includes('PRIVILEGED_DATABASE_ACCESS') ||
    input.tool.toLowerCase().includes('database') ||
    input.operation.toLowerCase().includes('delete') ||
    input.operation.toLowerCase().includes('drop')
  ) {
    return {
      decision: 'REVIEW',
      matchedPolicyId: 'pol-004',
      matchedPolicyName: 'Kubernetes Destructive Operations Hold',
      matchedRule: 'IF Risk Level >= HIGH AND Tool Capability = DATABASE_WRITE THEN REVIEW',
      simulatedAt: new Date().toISOString(),
      reason: 'High-risk destructive capability detected. Operation held for two-person human authorization.',
      disclaimer: 'SIMULATED POLICY EVALUATION — NO REAL OPA ENGINE EXECUTION',
    };
  }

  // Default: ALLOW
  return {
    decision: 'ALLOW',
    matchedPolicyId: 'pol-003',
    matchedPolicyName: 'PII & Payment Card Data Redaction',
    matchedRule: 'IF Destination Trust in [INTERNAL_TRUSTED, APPROVED_EXTERNAL_OWNED] AND Risk <= MEDIUM THEN ALLOW',
    simulatedAt: new Date().toISOString(),
    reason: 'Compliant invocation. Parameter payloads fall within accepted risk thresholds.',
    disclaimer: 'SIMULATED POLICY EVALUATION — NO REAL OPA ENGINE EXECUTION',
  };
}

export function computePolicyDiff(
  policyId: string,
  fromVersion: string = 'v2.3.0',
  toVersion: string = 'v2.4.1'
): import('../types/security').PolicyVersionDiff {
  return {
    policyId,
    fromVersion,
    toVersion,
    rulesAdded: 1,
    rulesRemoved: 0,
    rulesModified: 1,
    summaryNotes: [
      'Added strict UNTRUSTED_INPUT taint propagation condition to rule-001-3.',
      'Promoted action from REVIEW to BLOCK for unapproved link-local cloud metadata addresses.',
      'Updated cryptographic cosign root bundle verification key #49a.',
    ],
    ruleDiffs: [
      {
        ruleId: 'rule-001-2',
        ruleName: 'Prevent Restricted Egress to Unknown External',
        changeType: 'MODIFIED',
        fromAction: 'REVIEW',
        toAction: 'BLOCK',
        conditionDiffs: [
          {
            field: 'Destination Trust',
            operator: 'EQUALS',
            fromValue: 'UNTRUSTED_EXTERNAL',
            toValue: 'UNKNOWN_EXTERNAL',
            changeType: 'MODIFIED',
          },
          {
            field: 'Resource Sensitivity',
            operator: '>=',
            fromValue: 'RESTRICTED',
            toValue: 'RESTRICTED',
            changeType: 'UNCHANGED',
          },
        ],
      },
      {
        ruleId: 'rule-001-3',
        ruleName: 'Flag Untrusted Input Network Egress',
        changeType: 'ADDED',
        toAction: 'REVIEW',
        conditionDiffs: [
          {
            field: 'Taint Labels',
            operator: 'CONTAINS',
            toValue: 'UNTRUSTED_INPUT',
            changeType: 'ADDED',
          },
          {
            field: 'Tool Capability',
            operator: 'EQUALS',
            toValue: 'NETWORK_EGRESS',
            changeType: 'ADDED',
          },
        ],
      },
    ],
  };
}

export function backtestPolicy(
  input: import('../types/security').PolicyBacktestInput
): import('../types/security').PolicyBacktestResult {
  const multiplier = input.periodDays === 30 ? 4.2 : input.periodDays === 7 ? 1.0 : 0.15;
  const baseEvaluations = Math.round(1420 * multiplier);
  const allowCount = Math.round(baseEvaluations * 0.82);
  const reviewCount = Math.round(baseEvaluations * 0.12);
  const blockCount = baseEvaluations - allowCount - reviewCount;

  const additionalBlocks = Math.round(blockCount * 0.08) + 3;
  const additionalReviews = Math.round(reviewCount * 0.05) + 2;

  return {
    totalHistoricalEvaluations: baseEvaluations,
    previousCounts: {
      allow: allowCount,
      review: reviewCount,
      block: blockCount,
    },
    candidateCounts: {
      allow: Math.max(0, allowCount - additionalBlocks - additionalReviews),
      review: reviewCount + additionalReviews,
      block: blockCount + additionalBlocks,
    },
    additionalBlocks,
    additionalReviews,
    simulatedTimestamp: new Date().toISOString(),
    disclaimer: 'POLICY DRY-RUN / BACKTEST SIMULATION (NO REAL OPA EVALUATION)',
  };
}
