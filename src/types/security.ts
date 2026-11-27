/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * VantaCore Security Contracts & Domain Types
 */

export type RiskLevel = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type Decision = 'ALLOW' | 'REVIEW' | 'BLOCK';

export type ApprovalState =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CONSUMED'
  | 'CANCELLED'
  | 'INVALIDATED';

export type AssuranceTier = 'ENFORCED' | 'ADVISORY';

export type DestinationTrust =
  | 'NOT_APPLICABLE'
  | 'INTERNAL_TRUSTED'
  | 'APPROVED_EXTERNAL_OWNED'
  | 'UNKNOWN_EXTERNAL'
  | 'UNTRUSTED_EXTERNAL'
  | 'DENIED';

export type SessionSource = 'MOCK' | 'REAL' | 'REPLAY';

export type DetectorStatus =
  | 'OK'
  | 'ERROR'
  | 'TIMEOUT'
  | 'SKIPPED'
  | 'KILLED_RESOURCE_LIMIT'
  | 'UNAVAILABLE';

export type ToolResultAction =
  | 'DELIVER'
  | 'DELIVER_REDACTED'
  | 'QUARANTINE'
  | 'BLOCK_RESULT';

export type SecurityEngineStatus = 'CONNECTED' | 'NOT_CONNECTED' | 'DEGRADED';

// Real session safety types: REAL sessions must NOT fabricate authoritative evaluation if engine is disconnected
export type EvaluatedRisk = RiskLevel | 'NOT_EVALUATED';
export type EvaluatedDecision = Decision | 'NOT_AVAILABLE';

export type AttackChainNodeType =
  | 'SOURCE'
  | 'PROVENANCE'
  | 'TAINT'
  | 'SECURITY_SIGNAL'
  | 'TOOL_ACTION'
  | 'RESOURCE'
  | 'DESTINATION'
  | 'RISK'
  | 'DECISION';

export type ToolStatus = 'ACTIVE' | 'DISABLED' | 'QUARANTINED' | 'PENDING_REVIEW';

export type ToolCapability =
  | 'FILE_READ'
  | 'FILE_WRITE'
  | 'FILE_DELETE'
  | 'FILESYSTEM_READ'
  | 'DATABASE_READ'
  | 'DATABASE_WRITE'
  | 'DATABASE_ADMIN'
  | 'HTTP_READ'
  | 'HTTP_WRITE'
  | 'EMAIL_READ'
  | 'EMAIL_SEND'
  | 'SECRET_READ'
  | 'SHELL_EXECUTE'
  | 'CODE_EXECUTE'
  | 'CLOUD_READ'
  | 'CLOUD_WRITE'
  | 'CLOUD_ADMIN'
  | 'IDENTITY_READ'
  | 'IDENTITY_WRITE'
  | 'FINANCIAL_READ'
  | 'FINANCIAL_TRANSACTION';

export type ScanStatus =
  | 'SCANNED'
  | 'PARTIALLY_SCANNED'
  | 'UNSCANNABLE'
  | 'OVER_LIMIT'
  | 'ERROR';

export type SessionEventType =
  | 'SESSION_START'
  | 'USER_PROMPT'
  | 'AGENT_THINKING'
  | 'TOOL_REQUESTED'
  | 'TOOL_EXECUTED'
  | 'TOOL_COMPLETED'
  | 'PROMPT_INJECTION'
  | 'INDIRECT_PROMPT_INJECTION'
  | 'SENSITIVE_RESOURCE_ACCESS'
  | 'EXTERNAL_EGRESS'
  | 'UNTRUSTED_INPUT'
  | 'TOOL_METADATA_CHANGED'
  | 'SESSION_QUARANTINED'
  | 'DECISION_CREATED'
  | 'TOOL_RESULT_QUARANTINED'
  | 'TAINT_DETECTED'
  | 'SECRET_ACCESS'
  | 'REVIEW_HOLD'
  | 'APPROVAL_GRANTED'
  | 'APPROVAL_REJECTED'
  | 'APPROVAL_CREATED'
  | 'APPROVAL_APPROVED'
  | 'APPROVAL_EXPIRED'
  | 'APPROVAL_CONSUMED'
  | 'SIMULATED_AUTHORIZATION_CREATED'
  | 'SIMULATED_TOOL_EXECUTION_COMPLETED'
  | 'TOOL_RESULT_SCANNED'
  | 'TOOL_RESULT_ACTION'
  | 'TOOL_RESULT_REDACTED'
  | 'TOOL_RESULT_BLOCKED'
  | 'SECURITY_SIGNAL'
  | 'RISK_CHANGED'
  | 'BLOCK'
  | 'SESSION_END';

export interface Agent {
  id: string;
  name: string;
  description?: string;
  identityKey: string;
  version: string;
  assuranceTier: AssuranceTier;
  riskScore: number;
  riskLevel: RiskLevel;
  status: 'ACTIVE' | 'IDLE' | 'QUARANTINED' | 'BLOCKED';
  connectedToolsCount: number;
  totalSessions: number;
  blockedRequestsCount: number;
  lastActive: string;
  environment: 'development' | 'staging' | 'production';
  allowedCapabilities: string[];
  owner?: string;
  tags?: string[];
  organization?: string;
  organizationId?: string;
  createdAt?: string;
  securityRevision?: string;
  activeSessionsCount?: number;
}

export interface SecuritySignal {
  id: string;
  detectorName: string;
  detectorCategory:
    | 'PROMPT_INJECTION'
    | 'SECRET_EXPOSURE'
    | 'SSRF_ATTEMPT'
    | 'TAINT_PROPAGATION'
    | 'TOOL_MISUSE'
    | 'ANOMALOUS_SEQUENCE';
  confidence: number;
  riskLevel: RiskLevel;
  status: DetectorStatus;
  detectedAt: string;
  details: string;
  matchedRule?: string;
  mitreTactic?: string;
  rawPayloadSnippet?: string;
}

export interface RiskAssessment {
  overallScore: number;
  level: EvaluatedRisk;
  engineStatus: SecurityEngineStatus;
  factors: {
    name: string;
    weight: number;
    score: number;
    reason: string;
  }[];
  signals: SecuritySignal[];
  evaluatedAt: string;
  isAuthoritative: boolean;
}

export interface SecurityDecision {
  id: string;
  sessionId: string;
  agentId: string;
  agentName?: string;
  decision: EvaluatedDecision;
  assuranceTier: AssuranceTier;
  actionTaken: 'PASSED' | 'REDACTED' | 'BLOCKED' | 'FLAGGED_FOR_HUMAN' | 'PENDING_APPROVAL';
  reason: string;
  reasons?: string[];
  reasonCodes?: string[];
  tool?: string;
  operation?: string;
  resource?: string;
  destination?: string;
  destinationTrust?: DestinationTrust;
  riskScore?: number;
  riskLevel?: RiskLevel;
  matchedPolicyId?: string;
  matchedPolicyName?: string;
  policyName?: string;
  policyVersion?: string;
  attackChainId?: string;
  triggeringEventId?: string;
  signals?: SecuritySignal[];
  canonicalRequestHash?: string;
  requestArguments?: Record<string, unknown>;
  timestamp: string;
  evaluatedBy: string;
  enforcedAtBoundary: boolean;
}

export interface SessionEvent {
  id: string;
  sessionId: string;
  timestamp: string;
  type: SessionEventType;
  label: string;
  risk: RiskLevel;
  severity?: RiskLevel;
  decision?: Decision;
  details: string;
  confidence?: number;
  agent?: string;
  agentName?: string;
  tool?: string;
  toolName?: string;
  operation?: string;
  resource?: string;
  destination?: string;
  destinationTrust?: DestinationTrust;
  detector?: string;
  signal?: string;
  attackChainId?: string;
  decisionId?: string;
  executionMs?: number;
  ruleMatched?: string;
  mitreTactic?: string;
  rawPayload?: Record<string, unknown> | string;
}

export interface Session {
  id: string;
  agentId: string;
  agentName: string;
  source: SessionSource;
  status: 'ACTIVE' | 'COMPLETED' | 'BLOCKED' | 'ANALYZING' | 'WAITING_APPROVAL';
  risk: EvaluatedRisk;
  decision: EvaluatedDecision;
  riskScore?: number;
  startedAt: string;
  duration: string;
  eventsCount: number;
  toolCallsCount: number;
  signalsCount: number;
  activeAttackChain?: boolean;
  engineStatus: SecurityEngineStatus;
  attackChainId?: string;
  decisionId?: string;
  destinationTrust?: DestinationTrust;
  taintLabels?: string[];
  lastActivity?: string;
  sessionEpoch?: number;
  isQuarantined?: boolean;
}

export interface AttackChainNode {
  id: string;
  stepNumber: number;
  stepLabel: string;
  title: string;
  subtitle: string;
  risk: RiskLevel;
  nodeType?: AttackChainNodeType;
  mitreTactic: string;
  confidence: number;
  timestamp: string;
  eventPayload?: string;
  ruleMatched?: string;
  actionTaken?: 'OBSERVED' | 'INTERCEPTED' | 'SEVERED' | 'BLOCKED';
  agent?: string;
  sessionId?: string;
  tool?: string;
  operation?: string;
  resource?: string;
  destination?: string;
  destinationTrust?: DestinationTrust;
  detector?: string;
  signal?: string;
  decision?: Decision;
  relatedEventIds?: string[];
  position?: { x: number; y: number };
}

export interface AttackChain {
  id: string;
  sessionId: string;
  agentId?: string;
  agentName?: string;
  title: string;
  status: 'ACTIVE' | 'SEVERED' | 'MITIGATED' | 'BLOCKED';
  severity: RiskLevel;
  riskScore?: number;
  detectionTime: string;
  tactics: string[];
  nodes: AttackChainNode[];
  summary: string;
  decisionId?: string;
  triggeringEventId?: string;
}

export interface Tool {
  id: string;
  name: string;
  displayName: string;
  namespace?: string;
  version?: string;
  definitionVersion?: string;
  metadataHash?: string;
  owner?: string;
  executorIdentity?: string;
  status: ToolStatus;
  category: 'DATABASE' | 'FILESYSTEM' | 'NETWORK_HTTP' | 'SYSTEM_EXEC' | 'API_EXTERNAL' | 'COMMUNICATION';
  riskRating: RiskLevel;
  description: string;
  assuranceLevel: AssuranceTier;
  requiresApproval: boolean;
  defaultSensitivity?: string;
  destinationTrust?: DestinationTrust;
  allowedOperations: string[];
  capabilities: ToolCapability[];
  invocationCount: number;
  blockedCount: number;
  activeAgents: number;
  schemaSnippet?: string;
  createdAt?: string;
  updatedAt: string;
  sideEffectClass?: SideEffectClass;
  securityRevision?: string;
  fingerprint?: string;
  // Phase M2 SQL Mutation Safety Controls
  databaseName?: string;
  allowedTables?: string[];
  allowedMutationTypes?: string[];
  allowedInsertColumns?: string[];
  allowedUpdateColumns?: string[];
  protectedColumns?: string[];
  requiredWhere?: boolean;
  requiredTargetColumns?: string[];
  maxAffectedRows?: number;
  cascadeRisk?: string;
  triggerRisk?: string;
}

export interface Approval {
  id: string;
  sessionId: string;
  sessionTitle?: string;
  agentId: string;
  agentName: string;
  user?: string;
  toolId?: string;
  toolName: string;
  toolAction: string;
  operation: string;
  resource?: string;
  destination?: string;
  destinationTrust?: DestinationTrust;
  argumentsPreview: Record<string, unknown> | string;
  riskLevel: RiskLevel;
  riskScore?: number;
  riskFactors?: {
    name: string;
    score: number;
    reason: string;
  }[];
  signals?: SecuritySignal[];
  policyName?: string;
  policyId?: string;
  matchedRules?: string[];
  provenance?: string;
  taintLabels?: string[];
  relatedEventIds?: string[];
  attackChainId?: string;
  decisionId?: string;
  state: ApprovalState;
  status: ApprovalState;
  requestedAt: string;
  expiresAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  consumedAt?: string;
  executionId?: string;
  justification?: string;
  notes?: string;
}

export interface QuarantinedResult {
  id: string;
  sessionId: string;
  sessionTitle?: string;
  agentId: string;
  agentName?: string;
  toolId?: string;
  toolName: string;
  operation?: string;
  destination?: string;
  destinationTrust?: DestinationTrust;
  sanitizedAction: ToolResultAction;
  scanStatus: ScanStatus;
  contentType?: string;
  sizeBytes: number;
  sensitivity?: string;
  quarantineReason: string;
  detectedTaintType?: string;
  taintLabels?: string[];
  signals?: SecuritySignal[];
  reasonCodes?: string[];
  quarantinedAt: string;
  createdAt?: string;
  rawSample: string;
  redactedSample?: string;
  isRedacted: boolean;
  relatedRequestId?: string;
  relatedDecisionId?: string;
  relatedAttackChainId?: string;
}

export interface PolicyRuleCondition {
  field: string;
  operator: string;
  value: string;
}

export interface PolicyRule {
  id: string;
  name: string;
  description: string;
  conditions: PolicyRuleCondition[];
  action: Decision;
}

export interface PolicyVersion {
  version: string;
  created: string;
  activated: string;
  status: 'ACTIVE' | 'SUPERSEDED' | 'ARCHIVED';
  author: string;
  hash: string;
  changes: string;
}

export interface Policy {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'ACTIVE' | 'DRAFT' | 'DEPRECATED';
  enabled: boolean;
  tier: AssuranceTier;
  actionOnMatch: Decision;
  category: 'TOOL_ACCESS' | 'INJECTION_PREVENTION' | 'DATA_LEAKAGE' | 'EGRESS_CONTROL' | 'RATE_LIMIT';
  severity: RiskLevel;
  scope: 'GLOBAL' | 'AGENT' | 'TOOL_CLASS' | 'PII';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  createdAt?: string;
  updatedAt: string;
  activatedAt?: string;
  author: string;
  signedBy?: string;
  signatureStatus?: 'SIGNED' | 'UNSIGNED' | 'EXPIRED' | 'REVOKED' | string;
  bundleHash?: string;
  rulesCount: number;
  enforcedHits: number;
  evaluationCount?: number;
  rules?: PolicyRule[];
  versions?: PolicyVersion[];
  relatedDecisionIds?: string[];
}

export interface PolicySimulationInput {
  agent: string;
  tool: string;
  operation: string;
  resourceSensitivity: 'PUBLIC' | 'INTERNAL' | 'RESTRICTED' | 'CONFIDENTIAL' | 'CRITICAL';
  destinationTrust: DestinationTrust;
  riskLevel: RiskLevel;
  signals: string[];
}

export interface PolicySimulationResult {
  decision: Decision;
  matchedPolicyId: string;
  matchedPolicyName: string;
  matchedRule: string;
  simulatedAt: string;
  reason: string;
  disclaimer: string;
}

export type AuditActionType =
  | 'LOGIN'
  | 'LOGOUT'
  | 'AGENT_REGISTERED'
  | 'TOOL_REGISTERED'
  | 'TOOL_UPDATED'
  | 'POLICY_CREATED'
  | 'POLICY_UPDATED'
  | 'POLICY_ACTIVATED'
  | 'SECURITY_SIGNAL_CREATED'
  | 'RISK_ASSESSED'
  | 'DECISION_CREATED'
  | 'APPROVAL_CREATED'
  | 'APPROVAL_APPROVED'
  | 'APPROVAL_REJECTED'
  | 'APPROVAL_CONSUMED'
  | 'SIMULATED_AUTHORIZATION_CREATED'
  | 'SIMULATED_EXECUTION_COMPLETED'
  | 'RESULT_QUARANTINED'
  | 'SESSION_QUARANTINED';

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  actorType: 'USER' | 'SYSTEM' | 'GATEWAY_AGENT' | 'POLICY_ENGINE';
  action: AuditActionType | string;
  resourceType: 'POLICY' | 'AGENT' | 'SESSION' | 'TOOL' | 'APPROVAL' | 'DECISION' | 'QUARANTINE' | 'ATTACK_CHAIN' | 'SYSTEM' | 'CONNECTOR';
  resourceId: string;
  requestId: string;
  sessionId: string;
  severity: RiskLevel;
  source: string;
  summary: string;
  ipAddress?: string;
  status: 'SUCCESS' | 'FAILURE' | 'DENIED' | 'SIMULATED';
  beforeHash?: string;
  afterHash?: string;
  metadata?: Record<string, unknown>;
  orgId?: string;
  relatedAgentId?: string;
  relatedSessionId?: string;
  relatedToolId?: string;
  relatedExecutionId?: string;
  relatedDecisionId?: string;
  relatedApprovalId?: string;
  relatedConnectorId?: string;
  relatedUserId?: string;
  relatedAttackChainId?: string;
  decision?: 'ALLOW' | 'REVIEW' | 'BLOCK' | 'QUARANTINE' | 'OUTCOME_UNKNOWN' | string;
  traceId?: string;
}

export interface LabInputs {
  scenarioName?: string;
  prompt: string;
  externalContent?: string;
  agent: string;
  tool: string;
  operation: string;
  toolArguments: string;
  resource: string;
  resourceSensitivity: 'PUBLIC' | 'INTERNAL' | 'RESTRICTED' | 'CONFIDENTIAL' | 'CRITICAL';
  destination: string;
  destinationTrust: DestinationTrust;
  sessionHistory?: string;
  taintSource?: string;
}

export interface LabExecutionStage {
  name: string;
  label: string;
  status: 'OBSERVED' | 'INTERCEPTED' | 'SEVERED' | 'BLOCKED' | 'PASSED' | 'EVALUATED';
  detail: string;
}

export interface LabExecutionResult {
  id: string;
  scenarioName: string;
  timestamp: string;
  inputs: LabInputs;
  detectedSignals: string[];
  promptInjectionResult: { detected: boolean; confidence: number; detail: string };
  obfuscationResult: { detected: boolean; confidence: number; detail: string };
  sensitiveDataResult: { detected: boolean; classifications: string[] };
  taintLabels: string[];
  toolRisk: string;
  riskScore: number;
  riskLevel: RiskLevel;
  policyResult: { policyId: string; policyName: string; ruleMatched: string };
  finalDecision: Decision;
  attackChainId?: string;
  decisionId?: string;
  explanation: string;
  stages: LabExecutionStage[];
}

export interface LabPreset {
  id: string;
  title: string;
  category: string;
  description: string;
  defaultInputs: LabInputs;
  expectedDecision: Decision;
}

export type SystemComponentStatus =
  | 'FRONTEND ACTIVE'
  | 'SIMULATED'
  | 'NOT CONNECTED'
  | 'NOT CONFIGURED'
  | 'BACKEND NOT AVAILABLE';

export interface SystemComponent {
  id: string;
  name: string;
  purpose: string;
  type: 'FRONTEND' | 'GATEWAY' | 'POLICY_ENGINE' | 'OPA' | 'DATABASE' | 'CACHE' | 'DETECTOR' | 'EVENT_BROKER' | 'WEBSOCKET' | 'AUDIT_STORAGE';
  status: SystemComponentStatus;
  mode: string;
  version: string;
  lastCheck: string;
  endpoint: string;
  latencyMs?: number;
  throughputRps?: number;
  uptimePercent?: number;
  lastHeartbeat?: string;
}

// ==========================================
// Phase D+ Advanced Security Analyst Types
// ==========================================

export type IncidentStatus = 'OPEN' | 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED' | 'FALSE_POSITIVE';

export interface IncidentNote {
  id: string;
  incidentId: string;
  author: string;
  timestamp: string;
  content: string;
  relatedEntity?: string;
}

export interface IncidentTimelineItem {
  id: string;
  step: number;
  label: string;
  type: 'INGRESS' | 'TAINT' | 'SIGNAL' | 'TOOL_INVOCATION' | 'RESOURCE' | 'EGRESS' | 'RISK' | 'DECISION';
  timestamp: string;
  description: string;
  entityType?: 'EVENT' | 'SESSION' | 'TOOL' | 'DECISION' | 'ATTACK_CHAIN' | 'QUARANTINE' | 'POLICY' | 'APPROVAL';
  entityId?: string;
  targetRoute?: string;
}

export interface Incident {
  id: string;
  title: string;
  severity: RiskLevel;
  status: IncidentStatus;
  agentId: string;
  agentName: string;
  sessionId: string;
  sessionTitle?: string;
  attackChainId?: string;
  decisionId?: string;
  finalDecision: Decision;
  assignedAnalyst: string;
  createdAt: string;
  updatedAt: string;
  primaryTool: string;
  primaryResource: string;
  destination: string;
  destinationTrust: DestinationTrust;
  riskScore: number;
  tags: string[];
  summary: string;
  bookmarkedEvidenceIds?: string[];
  relatedApprovalId?: string;
  relatedQuarantineId?: string;
  relatedPolicyId?: string;
  timeline?: IncidentTimelineItem[];
  notes?: IncidentNote[];
}

export type ProvenanceNodeType =
  | 'USER'
  | 'SYSTEM'
  | 'MODEL'
  | 'WEB'
  | 'EMAIL'
  | 'FILE'
  | 'DATABASE'
  | 'API'
  | 'TOOL'
  | 'MCP_SERVER'
  | 'RAG_SOURCE'
  | 'UNKNOWN';

export interface ProvenanceNode {
  id: string;
  label: string;
  type: ProvenanceNodeType;
  trustClassification: string;
  timestamp: string;
  taintLabels: string[];
  details: string;
  metadata?: Record<string, unknown>;
}

export interface ProvenanceEdge {
  from: string;
  to: string;
  label: string;
}

export interface ProvenanceGraph {
  nodes: ProvenanceNode[];
  edges: ProvenanceEdge[];
  rootSourceId: string;
}

export interface TaintFlowNode {
  id: string;
  step: number;
  timestamp: string;
  label: string;
  source: string;
  propagationEvent: string;
  parent?: string;
  relatedRequest: string;
  status: 'ACTIVE' | 'PROPAGATED' | 'CONTAINED' | 'SEVERED';
}

export interface TaintFlowTrace {
  id: string;
  sessionId: string;
  requestId: string;
  taints: TaintFlowNode[];
}

export interface RiskFactor {
  factor: string;
  scoreContribution: number;
  maxContribution: number;
  description: string;
  confidence: number;
  category: string;
}

export interface RiskExplanation {
  score: number;
  level: RiskLevel;
  confidence: number;
  primaryFactors: RiskFactor[];
  relatedSignals: string[];
  toolRisk: string;
  resourceSensitivity: string;
  destinationTrust: DestinationTrust;
  contextNotes: string;
}

export interface PolicyDiffCondition {
  field: string;
  operator: string;
  fromValue?: string;
  toValue?: string;
  changeType: 'ADDED' | 'REMOVED' | 'MODIFIED' | 'UNCHANGED';
}

export interface PolicyRuleDiff {
  ruleId: string;
  ruleName: string;
  changeType: 'ADDED' | 'REMOVED' | 'MODIFIED' | 'UNCHANGED';
  conditionDiffs: PolicyDiffCondition[];
  fromAction?: Decision;
  toAction?: Decision;
}

export interface PolicyVersionDiff {
  policyId: string;
  fromVersion: string;
  toVersion: string;
  rulesAdded: number;
  rulesRemoved: number;
  rulesModified: number;
  summaryNotes: string[];
  ruleDiffs: PolicyRuleDiff[];
}

export interface PolicyBacktestInput {
  policyId: string;
  candidateVersion: string;
  periodDays: number;
  agentFilter?: string;
  toolFilter?: string;
  decisionFilter?: string;
}

export interface PolicyBacktestResult {
  totalHistoricalEvaluations: number;
  previousCounts: { allow: number; review: number; block: number };
  candidateCounts: { allow: number; review: number; block: number };
  additionalBlocks: number;
  additionalReviews: number;
  simulatedTimestamp: string;
  disclaimer: string;
}

export type SearchItemType =
  | 'AGENT'
  | 'SESSION'
  | 'EVENT'
  | 'DECISION'
  | 'ATTACK_CHAIN'
  | 'TOOL'
  | 'CONNECTOR'
  | 'APPROVAL'
  | 'QUARANTINE'
  | 'POLICY'
  | 'AUDIT'
  | 'INVESTIGATION'
  | 'LAB_RUN'
  | 'COMMAND';

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  type: SearchItemType;
  route: string;
  badge?: string;
  severity?: RiskLevel;
}

// ==========================================
// Milestone R: MCP & Connector Management
// ==========================================

export type ConnectorType =
  | 'MCP_STDIO'
  | 'MCP_HTTP'
  | 'GENERIC_HTTP_TOOL_CONNECTOR';

export type ConnectorTrustLevel =
  | 'INTERNAL_MANAGED'
  | 'APPROVED_EXTERNAL'
  | 'UNVERIFIED_EXTERNAL'
  | 'DENIED';

export type ConnectorStatus =
  | 'ACTIVE'
  | 'REGISTERED'
  | 'TESTING'
  | 'DISCOVERING'
  | 'PENDING_REVIEW'
  | 'DRAINING'
  | 'DISABLED'
  | 'ERROR';

export type ToolDiscoveryStatus =
  | 'DISCOVERED'
  | 'PENDING_REVIEW'
  | 'ACTIVE'
  | 'REJECTED'
  | 'STALE';

export type SideEffectClass =
  | 'READ_ONLY'
  | 'IDEMPOTENT_WRITE'
  | 'STATEFUL_MUTATION'
  | 'DESTRUCTIVE'
  | 'EXTERNAL_TRANSACTION';

export interface DiscoveredToolReview {
  id: string;
  connectorId: string;
  remoteName: string;
  description: string;
  schema: Record<string, unknown> | string;
  schemaHash: string;
  effectiveSchemaHash: string;
  capabilityMapping: ToolCapability[];
  sideEffectClass: SideEffectClass;
  approvalRequirement: boolean;
  trustLevel: ConnectorTrustLevel;
  metadataInjectionSignal?: boolean;
  metadataInjectionDetails?: string;
  schemaDriftDetected?: boolean;
  schemaDriftDetails?: string;
  unclassifiedTool?: boolean;
  unknownCapability?: boolean;
  status: ToolDiscoveryStatus;
  lastScannedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface ConnectorDriftRecord {
  id: string;
  timestamp: string;
  driftSummary: string;
  previousHash: string;
  currentHash: string;
  toolName?: string;
  severity: RiskLevel;
}

export interface Connector {
  id: string;
  name: string;
  type: ConnectorType;
  trustLevel: ConnectorTrustLevel;
  status: ConnectorStatus;
  endpointIdentity: string;
  toolCount: number;
  schemaDrift: boolean;
  credentialState: 'HEALTHY' | 'ROTATING' | 'EXPIRED' | 'MISSING';
  lastDiscovery: string;
  createdAt: string;
  updatedAt: string;
  organizationId?: string;
  discoveredTools: DiscoveredToolReview[];
  driftHistory?: ConnectorDriftRecord[];
  driftRecords?: ConnectorDriftRecord[];
  securityEventsCount?: number;
  healthLatencyMs?: number;
}

// ==========================================
// Milestone R: Developer Integration Center
// ==========================================

export type IntegrationStatus = 'SUPPORTED' | 'COMING_LATER';

export interface IntegrationCard {
  id: string;
  name: string;
  category: 'PROTOCOL' | 'SDK' | 'FRAMEWORK' | 'GATEWAY';
  status: IntegrationStatus;
  description: string;
  docsUrl?: string;
  quickstartSnippet?: string;
  language?: string;
  version?: string;
}

// ==========================================
// Milestone R: SOC System Health Components
// ==========================================

export type SocComponentStatus = 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE' | 'UNKNOWN';

export interface SocSystemComponent {
  id: string;
  name: string;
  componentKey: 'GATEWAY' | 'SECURITY_ENGINE' | 'OPA' | 'POSTGRESQL' | 'REDIS' | 'POLICY_BUNDLE' | 'SIGNING_KEY' | 'AUDIT_INTEGRITY';
  status: SocComponentStatus;
  latencyMs: number;
  lastHeartbeat: string;
  version: string;
  dependencyStatus: string;
  details?: string;
}

export interface SocSystemMetadata {
  environment: string;
  buildVersion: string;
  gitCommit: string;
  policyVersion: string;
  policyHash: string;
  signingKeyVersion: string;
  migrationVersion: string;
}


