/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * VantaCore Root Application
 * Configures TanStack Query Provider and React Router nested routing hierarchy.
 */

import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LandingPage } from './features/landing/LandingPage';
import { ConsoleLayout } from './components/console/ConsoleLayout';
import { OverviewView } from './features/console/OverviewView';
import { AgentsView } from './features/console/AgentsView';
import { AgentDetailsView } from './features/console/AgentDetailsView';
import { SessionsView } from './features/console/SessionsView';
import { SessionDetailsView } from './features/console/SessionDetailsView';
import { SecurityEventsView } from './features/console/SecurityEventsView';
import { DecisionCenterView } from './features/console/DecisionCenterView';
import { DecisionDetailsView } from './features/console/DecisionDetailsView';
import { AttackChainsWorkspaceView } from './features/console/AttackChainsWorkspaceView';
import { ToolRegistryView } from './features/console/ToolRegistryView';
import { ToolDetailsView } from './features/console/ToolDetailsView';
import { ApprovalCenterView } from './features/console/ApprovalCenterView';
import { ApprovalDetailsView } from './features/console/ApprovalDetailsView';
import { QuarantineView } from './features/console/QuarantineView';
import { QuarantineDetailsView } from './features/console/QuarantineDetailsView';
import { PoliciesView } from './features/console/PoliciesView';
import { PolicyDetailsView } from './features/console/PolicyDetailsView';
import { AuditView } from './features/console/AuditView';
import { AuditDetailsView } from './features/console/AuditDetailsView';
import { AiSecurityLabView } from './features/console/AiSecurityLabView';
import { SystemHealthView } from './features/console/SystemHealthView';
import { InvestigationsView } from './features/console/InvestigationsView';
import { InvestigationDetailsView } from './features/console/InvestigationDetailsView';
import { ConnectorsView } from './features/console/ConnectorsView';
import { ConnectorDetailsView } from './features/console/ConnectorDetailsView';
import { IntegrationsView } from './features/console/IntegrationsView';
import { SettingsView } from './features/console/SettingsView';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <Routes>
          {/* Public Cinematic Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Console Management Control Plane */}
          <Route path="/console" element={<ConsoleLayout />}>
            <Route index element={<OverviewView />} />
            <Route path="investigations" element={<InvestigationsView />} />
            <Route path="investigations/:incidentId" element={<InvestigationDetailsView />} />
            <Route path="incidents" element={<InvestigationsView />} />
            <Route path="incidents/:incidentId" element={<InvestigationDetailsView />} />
            <Route path="agents" element={<AgentsView />} />
            <Route path="agents/:agentId" element={<AgentDetailsView />} />
            <Route path="sessions" element={<SessionsView />} />
            <Route path="sessions/:sessionId" element={<SessionDetailsView />} />
            
            {/* Phase B: Security Investigation Flow */}
            <Route path="events" element={<SecurityEventsView />} />
            <Route path="events/:eventId" element={<SecurityEventsView />} />
            <Route path="decisions" element={<DecisionCenterView />} />
            <Route path="decisions/:decisionId" element={<DecisionDetailsView />} />
            <Route path="attack-chains" element={<AttackChainsWorkspaceView />} />
            <Route path="attack-chains/:chainId" element={<AttackChainsWorkspaceView />} />
            
            {/* Phase C: Enforcement Operations */}
            <Route path="tools" element={<ToolRegistryView />} />
            <Route path="tools/:toolId" element={<ToolDetailsView />} />
            <Route path="connectors" element={<ConnectorsView />} />
            <Route path="connectors/:connectorId" element={<ConnectorDetailsView />} />
            <Route path="approvals" element={<ApprovalCenterView />} />
            <Route path="approvals/:approvalId" element={<ApprovalDetailsView />} />
            <Route path="quarantine" element={<QuarantineView />} />
            <Route path="quarantine/:resultId" element={<QuarantineDetailsView />} />
            
            {/* Phase D: Policies, Audit, AI Security Lab, System Health, Developers */}
            <Route path="policies" element={<PoliciesView />} />
            <Route path="policies/:policyId" element={<PolicyDetailsView />} />
            <Route path="audit" element={<AuditView />} />
            <Route path="audit/:auditId" element={<AuditDetailsView />} />
            <Route path="lab" element={<AiSecurityLabView />} />
            <Route path="system-health" element={<SystemHealthView />} />
            <Route path="integrations" element={<IntegrationsView />} />
            <Route path="settings" element={<SettingsView />} />
            <Route path="*" element={<Navigate to="/console" replace />} />
          </Route>

          {/* Catch-all global redirect to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </QueryClientProvider>
  );
}
