/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * VantaCore Integration Center Catalog & Quickstart Code
 * Provides authentic code examples for REST, Python, TypeScript, and MCP integrations.
 * Shows OpenAI, LangChain, LangGraph, AutoGen, CrewAI honestly marked as "COMING LATER".
 */

import { IntegrationCard } from '../types/security';

export const MOCK_INTEGRATION_CARDS: IntegrationCard[] = [
  {
    id: 'int-generic-rest',
    name: 'Generic REST API',
    category: 'GATEWAY',
    status: 'SUPPORTED',
    description: 'Direct zero-trust HTTP gateway interception for any programming language or autonomous runtime.',
    version: 'v1.4',
    language: 'HTTP / JSON',
    docsUrl: '#quickstart-rest',
  },
  {
    id: 'int-python-sdk',
    name: 'Python Client SDK',
    category: 'SDK',
    status: 'SUPPORTED',
    description: 'Typed Python library with sync & async evaluation clients, request binding, and result verification.',
    version: '0.8.2',
    language: 'Python >= 3.10',
    docsUrl: '#quickstart-python',
  },
  {
    id: 'int-typescript-sdk',
    name: 'TypeScript / Node.js SDK',
    category: 'SDK',
    status: 'SUPPORTED',
    description: 'First-class Node.js, Bun, and browser-safe client for schema evaluation and token claim exchange.',
    version: '1.2.0',
    language: 'TypeScript / ES2022',
    docsUrl: '#quickstart-typescript',
  },
  {
    id: 'int-mcp-protocol',
    name: 'Model Context Protocol (MCP)',
    category: 'PROTOCOL',
    status: 'SUPPORTED',
    description: 'Native MCP StdIO and HTTP transport bridge with automated schema discovery and prompt injection scan.',
    version: '2024-11-05',
    language: 'MCP JSON-RPC 2.0',
    docsUrl: '#quickstart-mcp',
  },
  {
    id: 'int-openai-assistants',
    name: 'OpenAI Assistants API',
    category: 'FRAMEWORK',
    status: 'COMING_LATER',
    description: 'Native function-calling wrapper intercepting OpenAI tool calls before execution.',
  },
  {
    id: 'int-langchain',
    name: 'LangChain & LangGraph',
    category: 'FRAMEWORK',
    status: 'COMING_LATER',
    description: 'Graph middleware callback handler for checkpointed agent decision gates and state taint flows.',
  },
  {
    id: 'int-autogen',
    name: 'Microsoft AutoGen',
    category: 'FRAMEWORK',
    status: 'COMING_LATER',
    description: 'Multi-agent conversation filter and group chat capability arbiter.',
  },
  {
    id: 'int-crewai',
    name: 'CrewAI Framework',
    category: 'FRAMEWORK',
    status: 'COMING_LATER',
    description: 'Role-based agent tool interception and human-in-the-loop escalation webhook.',
  },
];

export interface DeveloperStepExample {
  step: number;
  title: string;
  description: string;
  endpoint: string;
  method: 'POST' | 'GET' | 'PUT';
  code: Record<string, string>; // language -> code
}

export const DEVELOPER_QUICKSTART_STEPS: DeveloperStepExample[] = [
  {
    step: 1,
    title: '1. Register Agent Identity',
    description: 'Register the autonomous agent identity and receive cryptographic tenant binding.',
    endpoint: '/api/v1/agents',
    method: 'POST',
    code: {
      curl: `curl -X POST https://gateway.vantacore.internal/api/v1/agents \\
  -H "Authorization: Bearer \${VANTA_ORG_API_KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "data-analyst-agent-01",
    "assuranceTier": "ENFORCED",
    "environment": "production",
    "allowedCapabilities": ["DATABASE_READ", "HTTP_READ"]
  }'`,
      python: `from vantacore import VantaClient

client = VantaClient(api_key=os.environ["VANTA_ORG_API_KEY"])

agent = client.agents.register(
    name="data-analyst-agent-01",
    assurance_tier="ENFORCED",
    environment="production",
    allowed_capabilities=["DATABASE_READ", "HTTP_READ"]
)
print("Registered Agent ID:", agent.id)`,
      typescript: `import { VantaClient } from '@vantacore/sdk';

const client = new VantaClient({ apiKey: process.env.VANTA_ORG_API_KEY! });

const agent = await client.agents.register({
  name: 'data-analyst-agent-01',
  assuranceTier: 'ENFORCED',
  environment: 'production',
  allowedCapabilities: ['DATABASE_READ', 'HTTP_READ']
});
console.log('Registered Agent ID:', agent.id);`,
    },
  },
  {
    step: 2,
    title: '2. Register Tool in Registry',
    description: 'Declare tool capabilities, schemas, side effects, and human approval constraints.',
    endpoint: '/api/v1/tools',
    method: 'POST',
    code: {
      curl: `curl -X POST https://gateway.vantacore.internal/api/v1/tools \\
  -H "Authorization: Bearer \${VANTA_ORG_API_KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "sql_query_executor",
    "displayName": "SQL Query Executor",
    "category": "DATABASE",
    "assuranceLevel": "ENFORCED",
    "capabilities": ["DATABASE_READ"],
    "requiresApproval": false,
    "destinationTrust": "INTERNAL_TRUSTED",
    "allowedOperations": ["SELECT"]
  }'`,
      python: `tool = client.tools.register(
    name="sql_query_executor",
    display_name="SQL Query Executor",
    category="DATABASE",
    assurance_level="ENFORCED",
    capabilities=["DATABASE_READ"],
    requires_approval=False,
    destination_trust="INTERNAL_TRUSTED",
    allowed_operations=["SELECT"]
)`,
      typescript: `const tool = await client.tools.register({
  name: 'sql_query_executor',
  displayName: 'SQL Query Executor',
  category: 'DATABASE',
  assuranceLevel: 'ENFORCED',
  capabilities: ['DATABASE_READ'],
  requiresApproval: false,
  destinationTrust: 'INTERNAL_TRUSTED',
  allowedOperations: ['SELECT']
});`,
    },
  },
  {
    step: 3,
    title: '3. Evaluate Request Before Execution',
    description: 'Submit candidate tool action to VantaCore Security Engine and OPA policy engine.',
    endpoint: '/api/v1/evaluate',
    method: 'POST',
    code: {
      curl: `curl -X POST https://gateway.vantacore.internal/api/v1/evaluate \\
  -H "Authorization: Bearer \${VANTA_ORG_API_KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agentId": "agent-sec-research-01",
    "sessionId": "sess-live-9042",
    "toolName": "sql_query_executor",
    "operation": "SELECT",
    "arguments": {
      "query": "SELECT id, name, role FROM team_members WHERE active = true"
    },
    "destination": "internal-postgres-cluster.local",
    "taintLabels": []
  }'`,
      python: `evaluation = client.evaluate(
    agent_id=agent.id,
    session_id="sess-live-9042",
    tool_name="sql_query_executor",
    operation="SELECT",
    arguments={"query": "SELECT id, name, role FROM team_members WHERE active = true"},
    destination="internal-postgres-cluster.local"
)
print("Decision:", evaluation.decision)  # ALLOW | REVIEW | BLOCK`,
      typescript: `const evaluation = await client.evaluate({
  agentId: agent.id,
  sessionId: 'sess-live-9042',
  toolName: 'sql_query_executor',
  operation: 'SELECT',
  arguments: { query: 'SELECT id, name, role FROM team_members WHERE active = true' },
  destination: 'internal-postgres-cluster.local'
});
console.log('Decision:', evaluation.decision); // ALLOW | REVIEW | BLOCK`,
    },
  },
  {
    step: 4,
    title: '4. Handle Decision (ALLOW / REVIEW / BLOCK)',
    description: 'If REVIEW, hold task until approved in Human Approval Center. If BLOCK, reject action.',
    endpoint: '/api/v1/approvals/:id',
    method: 'GET',
    code: {
      curl: `# When evaluation.decision == "REVIEW", poll or subscribe to SSE for approval:
curl -X GET https://gateway.vantacore.internal/api/v1/approvals/\${APPROVAL_ID} \\
  -H "Authorization: Bearer \${VANTA_ORG_API_KEY}"`,
      python: `if evaluation.decision == "BLOCK":
    raise SecurityPolicyViolation(f"Blocked by VantaCore: {evaluation.reason}")
elif evaluation.decision == "REVIEW":
    print(f"Holding for Human Approval ID: {evaluation.approval_id}")
    approval = client.approvals.wait_for_decision(evaluation.approval_id, timeout_sec=300)
    if approval.state != "APPROVED":
        raise HumanApprovalRejected("SOC Analyst rejected this operation.")`,
      typescript: `if (evaluation.decision === 'BLOCK') {
  throw new Error(\`Blocked by VantaCore: \${evaluation.reason}\`);
} else if (evaluation.decision === 'REVIEW') {
  console.log(\`Holding for Human Approval ID: \${evaluation.approvalId}\`);
  const approval = await client.approvals.waitForApproval(evaluation.approvalId, { timeoutMs: 300_000 });
  if (approval.state !== 'APPROVED') {
    throw new Error('SOC Analyst rejected execution.');
  }
}`,
    },
  },
  {
    step: 5,
    title: '5. Claim Execution Authorization Token',
    description: 'Exchange the valid decision or approval token for a single-use bound execution claim.',
    endpoint: '/api/v1/executions/claim',
    method: 'POST',
    code: {
      curl: `curl -X POST https://gateway.vantacore.internal/api/v1/executions/claim \\
  -H "Authorization: Bearer \${VANTA_ORG_API_KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "decisionId": "dec-7019-allow",
    "requestBindingHash": "sha256:7f83b1657ff1fc53b92dc18148a1d65d..."
  }'`,
      python: `claim = client.executions.claim(
    decision_id=evaluation.decision_id,
    request_binding_hash=evaluation.canonical_request_hash
)
# claim.auth_token is valid for a single invocation within 60 seconds`,
      typescript: `const claim = await client.executions.claim({
  decisionId: evaluation.decisionId,
  requestBindingHash: evaluation.canonicalRequestHash
});
// claim.authToken is valid for a single execution within 60s`,
    },
  },
  {
    step: 6,
    title: '6. Execute Protected Tool Safely',
    description: 'Dispatch the tool call providing the single-use authorization token.',
    endpoint: 'internal://protected-tool',
    method: 'POST',
    code: {
      curl: `# Dispatched via internal proxy or directly to tool executor with claim token:
# Executed by your runtime using the validated arguments`,
      python: `raw_result = database.execute_query(
    query=evaluation.arguments["query"],
    auth_claim_token=claim.auth_token
)`,
      typescript: `const rawResult = await database.executeQuery({
  query: evaluation.arguments.query,
  authClaimToken: claim.authToken
});`,
    },
  },
  {
    step: 7,
    title: '7. Scan & Process Result Taint',
    description: 'Submit raw output to VantaCore result scanner for redaction, taint marking, or quarantine.',
    endpoint: '/api/v1/results/scan',
    method: 'POST',
    code: {
      curl: `curl -X POST https://gateway.vantacore.internal/api/v1/results/scan \\
  -H "Authorization: Bearer \${VANTA_ORG_API_KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "sessionId": "sess-live-9042",
    "toolName": "sql_query_executor",
    "rawOutput": "..."
  }'`,
      python: `scan_result = client.results.scan(
    session_id="sess-live-9042",
    tool_name="sql_query_executor",
    raw_output=raw_result
)
if scan_result.action == "QUARANTINE":
    print("Warning: Tool result quarantined due to detected canary token / secret.")
    safe_data = scan_result.redacted_output
else:
    safe_data = scan_result.output`,
      typescript: `const scanResult = await client.results.scan({
  sessionId: 'sess-live-9042',
  toolName: 'sql_query_executor',
  rawOutput: rawResult
});
if (scanResult.action === 'QUARANTINE') {
  console.warn('Tool result quarantined due to secret / canary token.');
  return scanResult.redactedOutput;
}
return scanResult.output;`,
    },
  },
];
