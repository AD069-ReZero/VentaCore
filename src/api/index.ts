/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * VantaCore API & TanStack Query Integration Layer
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import { agentService } from './services/agents';
import { sessionService } from './services/sessions';
import { eventService } from './services/events';
import { decisionService } from './services/decisions';
import { attackChainService } from './services/attackChains';
import { toolService } from './services/tools';
import { approvalService } from './services/approvals';
import { quarantineService } from './services/quarantine';
import { policyService } from './services/policies';
import { auditService, AuditFilters } from './services/audit';
import { systemService } from './services/system';
import { connectorService } from './services/connectors';
import { integrationService } from './services/integrations';
import { labService } from './services/lab';
import { investigationService } from './services/investigations';
import { searchService } from './services/search';
import { liveEventSimulator, INCIDENT_STAGES, IncidentStageDefinition } from './simulator';
import { SessionEvent, PolicySimulationInput, LabInputs, IncidentStatus, RiskLevel, ToolDiscoveryStatus } from '../types/security';

export * from './client';
export * from './services/agents';
export * from './services/sessions';
export * from './services/events';
export * from './services/decisions';
export * from './services/attackChains';
export * from './services/tools';
export * from './services/connectors';
export * from './services/integrations';
export * from './services/approvals';
export * from './services/quarantine';
export * from './services/policies';
export * from './services/audit';
export * from './services/system';
export * from './services/lab';
export * from './services/investigations';
export * from './services/search';
export * from './simulator';

// TanStack Query Hooks

export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const res = await agentService.list();
      return res.data;
    },
  });
}

export function useAgent(id: string | undefined) {
  return useQuery({
    queryKey: ['agents', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await agentService.getById(id);
      return res.data;
    },
    enabled: Boolean(id),
  });
}

export function useSessions() {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const res = await sessionService.list();
      return res.data;
    },
  });
}

export function useSession(id: string | undefined) {
  return useQuery({
    queryKey: ['sessions', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await sessionService.getById(id);
      return res.data;
    },
    enabled: Boolean(id),
  });
}

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const res = await eventService.list();
      return res.data;
    },
  });
}

export const useSecurityEvents = useEvents;

export function useSecurityEvent(id: string | undefined) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await eventService.getById(id);
      return res.data;
    },
    enabled: Boolean(id),
  });
}

export function useSessionEvents(sessionId: string | undefined) {
  return useQuery({
    queryKey: ['session-events', sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      const res = await eventService.getBySessionId(sessionId);
      return res.data;
    },
    enabled: Boolean(sessionId),
  });
}

export function useDecisions() {
  return useQuery({
    queryKey: ['decisions'],
    queryFn: async () => {
      const res = await decisionService.list();
      return res.data;
    },
  });
}

export function useDecision(id: string | undefined) {
  return useQuery({
    queryKey: ['decisions', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await decisionService.getById(id);
      return res.data;
    },
    enabled: Boolean(id),
  });
}

export function useAttackChains() {
  return useQuery({
    queryKey: ['attack-chains'],
    queryFn: async () => {
      const res = await attackChainService.list();
      return res.data;
    },
  });
}

export function useAttackChain(idOrSessionId: string | undefined) {
  return useQuery({
    queryKey: ['attack-chains', idOrSessionId],
    queryFn: async () => {
      if (!idOrSessionId) return null;
      // First try by ID
      const byId = await attackChainService.getById(idOrSessionId);
      if (byId.data) return byId.data;
      // Then try by session ID
      const bySession = await attackChainService.getBySessionId(idOrSessionId);
      return bySession.data;
    },
    enabled: Boolean(idOrSessionId),
  });
}

export function useTools() {
  return useQuery({
    queryKey: ['tools'],
    queryFn: async () => {
      const res = await toolService.list();
      return res.data;
    },
  });
}

export function useTool(id: string | undefined) {
  return useQuery({
    queryKey: ['tools', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await toolService.getById(id);
      return res.data;
    },
    enabled: Boolean(id),
  });
}

export function useApprovals() {
  return useQuery({
    queryKey: ['approvals'],
    queryFn: async () => {
      const res = await approvalService.list();
      return res.data;
    },
  });
}

export function useApproval(id: string | undefined) {
  return useQuery({
    queryKey: ['approvals', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await approvalService.getById(id);
      return res.data;
    },
    enabled: Boolean(id),
  });
}

export function useApproveRequest() {
  const queryClient = useQueryClient();
  return {
    mutateAsync: async ({ id, justification, approver }: { id: string; justification?: string; approver?: string }) => {
      const res = await approvalService.approve(id, { justification, approver });
      if (res.data) {
        liveEventSimulator.emitApprovalApproved(id, res.data.toolName);
        queryClient.invalidateQueries({ queryKey: ['approvals'] });
        queryClient.setQueryData(['approvals', id], res.data);
      }
      return res.data;
    },
  };
}

export function useRejectRequest() {
  const queryClient = useQueryClient();
  return {
    mutateAsync: async ({ id, justification, rejector }: { id: string; justification?: string; rejector?: string }) => {
      const res = await approvalService.reject(id, { justification, rejector });
      if (res.data) {
        liveEventSimulator.emitApprovalRejected(id, res.data.toolName);
        queryClient.invalidateQueries({ queryKey: ['approvals'] });
        queryClient.setQueryData(['approvals', id], res.data);
      }
      return res.data;
    },
  };
}

export function useConsumeApproval() {
  const queryClient = useQueryClient();
  return {
    mutateAsync: async (id: string) => {
      const res = await approvalService.consume(id);
      if (res.data) {
        liveEventSimulator.emitApprovalConsumed(id, res.data.toolName);
        queryClient.invalidateQueries({ queryKey: ['approvals'] });
        queryClient.setQueryData(['approvals', id], res.data);
      }
      return res.data;
    },
  };
}

export function useExpireApproval() {
  const queryClient = useQueryClient();
  return {
    mutateAsync: async (id: string) => {
      const res = await approvalService.expire(id);
      if (res.data) {
        liveEventSimulator.emitApprovalExpired(id);
        queryClient.invalidateQueries({ queryKey: ['approvals'] });
        queryClient.setQueryData(['approvals', id], res.data);
      }
      return res.data;
    },
  };
}

export function useInvalidateApproval() {
  const queryClient = useQueryClient();
  return {
    mutateAsync: async ({ id, reason }: { id: string; reason?: string }) => {
      const res = await approvalService.invalidate(id, reason);
      if (res.data) {
        queryClient.invalidateQueries({ queryKey: ['approvals'] });
        queryClient.setQueryData(['approvals', id], res.data);
      }
      return res.data;
    },
  };
}

export function useQuarantine() {
  return useQuery({
    queryKey: ['quarantine'],
    queryFn: async () => {
      const res = await quarantineService.list();
      return res.data;
    },
  });
}

export const useQuarantinedResults = useQuarantine;

export function useQuarantinedResult(id: string | undefined) {
  return useQuery({
    queryKey: ['quarantine', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await quarantineService.getById(id);
      return res.data;
    },
    enabled: Boolean(id),
  });
}

export function usePolicies() {
  return useQuery({
    queryKey: ['policies'],
    queryFn: async () => {
      const res = await policyService.list();
      return res.data;
    },
  });
}

export function usePolicy(id: string | undefined) {
  return useQuery({
    queryKey: ['policies', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await policyService.getById(id);
      return res.data;
    },
    enabled: Boolean(id),
  });
}

export function useSimulatePolicy() {
  return {
    mutateAsync: async (input: PolicySimulationInput) => {
      const res = await policyService.simulate(input);
      return res.data;
    },
  };
}

export function useAuditLogs(filters?: AuditFilters) {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: async () => {
      const res = await auditService.list(filters);
      return res.data;
    },
  });
}

export function useAuditLog(id: string | undefined) {
  return useQuery({
    queryKey: ['audit-logs', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await auditService.getById(id);
      return res.data;
    },
    enabled: Boolean(id),
  });
}

export function useLabPresets() {
  return useQuery({
    queryKey: ['lab-presets'],
    queryFn: async () => {
      const res = await labService.getPresets();
      return res.data;
    },
  });
}

export function useLabHistory() {
  return useQuery({
    queryKey: ['lab-history'],
    queryFn: async () => {
      const res = await labService.getHistory();
      return res.data;
    },
  });
}

export function useRunLabSimulation() {
  const queryClient = useQueryClient();
  return {
    mutateAsync: async (inputs: LabInputs) => {
      const res = await labService.runSimulation(inputs);
      queryClient.invalidateQueries({ queryKey: ['lab-history'] });
      return res.data;
    },
  };
}

export function useSystemHealth() {
  return useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      const res = await systemService.getHealth();
      return res.data;
    },
  });
}

export function useSocSystemHealth() {
  return useQuery({
    queryKey: ['soc-system-health'],
    queryFn: async () => {
      const res = await systemService.getSocHealth();
      return res.data;
    },
  });
}

export function useSocMetadata() {
  return useQuery({
    queryKey: ['soc-metadata'],
    queryFn: async () => {
      const res = await systemService.getSocMetadata();
      return res.data;
    },
  });
}

export function useConnectors() {
  return useQuery({
    queryKey: ['connectors'],
    queryFn: async () => {
      const res = await connectorService.list();
      return res.data;
    },
  });
}

export function useConnector(id: string | undefined) {
  return useQuery({
    queryKey: ['connectors', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await connectorService.getById(id);
      return res.data;
    },
    enabled: Boolean(id),
  });
}

export function useUpdateConnector() {
  const queryClient = useQueryClient();
  return {
    mutateAsync: async ({ id, updates }: { id: string; updates: any }) => {
      const res = await connectorService.update(id, updates);
      queryClient.invalidateQueries({ queryKey: ['connectors'] });
      queryClient.invalidateQueries({ queryKey: ['connectors', id] });
      return res.data;
    },
  };
}

export function useDiscoverTools() {
  const queryClient = useQueryClient();
  return {
    mutateAsync: async (connectorId: string) => {
      const res = await connectorService.discoverTools(connectorId);
      queryClient.invalidateQueries({ queryKey: ['connectors'] });
      queryClient.invalidateQueries({ queryKey: ['connectors', connectorId] });
      return res.data;
    },
  };
}

export function useReviewDiscoveredTool() {
  const queryClient = useQueryClient();
  return {
    mutateAsync: async ({
      connectorId,
      toolId,
      decision,
    }: {
      connectorId: string;
      toolId: string;
      decision: { status: ToolDiscoveryStatus; reviewedBy: string };
    }) => {
      const res = await connectorService.reviewTool(connectorId, toolId, decision);
      queryClient.invalidateQueries({ queryKey: ['connectors'] });
      queryClient.invalidateQueries({ queryKey: ['connectors', connectorId] });
      return res.data;
    },
  };
}

export function useIntegrations() {
  return useQuery({
    queryKey: ['integrations'],
    queryFn: async () => {
      const res = await integrationService.list();
      return res.data;
    },
  });
}

export function useDeveloperQuickstart() {
  return useQuery({
    queryKey: ['developer-quickstart'],
    queryFn: async () => {
      const res = await integrationService.getQuickstartSteps();
      return res.data;
    },
  });
}


export function useInvestigations() {
  return useQuery({
    queryKey: ['investigations'],
    queryFn: async () => {
      const res = await investigationService.list();
      return res.data;
    },
  });
}

export function useInvestigation(id: string | undefined) {
  return useQuery({
    queryKey: ['investigations', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await investigationService.getById(id);
      return res.data;
    },
    enabled: Boolean(id),
  });
}

export function useInvestigationTimeline(id: string | undefined) {
  return useQuery({
    queryKey: ['investigations', id, 'timeline'],
    queryFn: async () => {
      if (!id) return [];
      const res = await investigationService.getTimeline(id);
      return res.data;
    },
    enabled: Boolean(id),
  });
}

export function useUpdateIncidentStatus() {
  const queryClient = useQueryClient();
  return {
    mutateAsync: async ({ id, status }: { id: string; status: IncidentStatus }) => {
      const res = await investigationService.updateStatus(id, status);
      queryClient.invalidateQueries({ queryKey: ['investigations'] });
      queryClient.setQueryData(['investigations', id], res.data);
      return res.data;
    },
  };
}

export function useUpdateIncidentSeverity() {
  const queryClient = useQueryClient();
  return {
    mutateAsync: async ({ id, severity }: { id: string; severity: RiskLevel }) => {
      const res = await investigationService.updateSeverity(id, severity);
      queryClient.invalidateQueries({ queryKey: ['investigations'] });
      queryClient.setQueryData(['investigations', id], res.data);
      return res.data;
    },
  };
}

export function useAssignIncidentAnalyst() {
  const queryClient = useQueryClient();
  return {
    mutateAsync: async ({ id, analyst }: { id: string; analyst: string }) => {
      const res = await investigationService.assignAnalyst(id, analyst);
      queryClient.invalidateQueries({ queryKey: ['investigations'] });
      queryClient.setQueryData(['investigations', id], res.data);
      return res.data;
    },
  };
}

export function useAddIncidentNote() {
  const queryClient = useQueryClient();
  return {
    mutateAsync: async ({
      incidentId,
      author,
      content,
      relatedEntity,
    }: {
      incidentId: string;
      author: string;
      content: string;
      relatedEntity?: string;
    }) => {
      const res = await investigationService.addNote(incidentId, { author, content, relatedEntity });
      queryClient.invalidateQueries({ queryKey: ['investigations'] });
      queryClient.invalidateQueries({ queryKey: ['investigations', incidentId] });
      return res.data;
    },
  };
}

export function useAddIncidentTag() {
  const queryClient = useQueryClient();
  return {
    mutateAsync: async ({ incidentId, tag }: { incidentId: string; tag: string }) => {
      const res = await investigationService.addTag(incidentId, tag);
      queryClient.invalidateQueries({ queryKey: ['investigations'] });
      queryClient.setQueryData(['investigations', incidentId], res.data);
      return res.data;
    },
  };
}

export function useToggleBookmarkEvidence() {
  const queryClient = useQueryClient();
  return {
    mutateAsync: async ({ incidentId, evidenceId }: { incidentId: string; evidenceId: string }) => {
      const res = await investigationService.toggleBookmarkEvidence(incidentId, evidenceId);
      queryClient.invalidateQueries({ queryKey: ['investigations'] });
      queryClient.setQueryData(['investigations', incidentId], res.data);
      return res.data;
    },
  };
}

export function useRemoveIncidentTag() {
  const queryClient = useQueryClient();
  return {
    mutateAsync: async ({ incidentId, tag }: { incidentId: string; tag: string }) => {
      const res = await investigationService.removeTag(incidentId, tag);
      queryClient.invalidateQueries({ queryKey: ['investigations'] });
      queryClient.setQueryData(['investigations', incidentId], res.data);
      return res.data;
    },
  };
}

export function useIncidentProvenance(incidentId: string | undefined) {
  return useQuery({
    queryKey: ['investigations', incidentId, 'provenance'],
    queryFn: async () => {
      if (!incidentId) return null;
      const res = await investigationService.getProvenance(incidentId);
      return res.data;
    },
    enabled: Boolean(incidentId),
  });
}

export function useIncidentTaintFlow(incidentId: string | undefined) {
  return useQuery({
    queryKey: ['investigations', incidentId, 'taint-flow'],
    queryFn: async () => {
      if (!incidentId) return null;
      const res = await investigationService.getTaintFlow(incidentId);
      return res.data;
    },
    enabled: Boolean(incidentId),
  });
}

export function useIncidentRiskExplanation(incidentId: string | undefined) {
  return useQuery({
    queryKey: ['investigations', incidentId, 'risk-explanation'],
    queryFn: async () => {
      if (!incidentId) return null;
      const res = await investigationService.getRiskExplanation(incidentId);
      return res.data;
    },
    enabled: Boolean(incidentId),
  });
}

export function usePolicyDiff(
  policyId: string | undefined,
  fromVersion?: string,
  toVersion?: string
) {
  return useQuery({
    queryKey: ['policies', policyId, 'diff', fromVersion, toVersion],
    queryFn: async () => {
      if (!policyId) return null;
      const res = await policyService.getDiff(policyId, fromVersion, toVersion);
      return res.data;
    },
    enabled: Boolean(policyId),
  });
}

export function usePolicyBacktest() {
  return {
    mutateAsync: async (input: import('../types/security').PolicyBacktestInput) => {
      const res = await policyService.backtest(input);
      return res.data;
    },
  };
}

export function useGlobalSearch(query: string) {
  return useQuery({
    queryKey: ['global-search', query],
    queryFn: async () => {
      const res = await searchService.search(query);
      return res.data;
    },
  });
}

/**
 * Hook to subscribe to real-time events from the simulator and progress through incident stages.
 */
export function useLiveSimulation(autoStart: boolean = false) {
  const queryClient = useQueryClient();
  const [liveEvents, setLiveEvents] = useState<SessionEvent[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(liveEventSimulator.getIsRunning());
  const [currentStage, setCurrentStage] = useState<IncidentStageDefinition>(
    liveEventSimulator.getCurrentStage()
  );

  useEffect(() => {
    if (autoStart) {
      liveEventSimulator.start(3500);
      setIsRunning(true);
    }

    const unsubscribeEvents = liveEventSimulator.subscribe((newEvent) => {
      setLiveEvents((prev) => [newEvent, ...prev].slice(0, 50));
      // Invalidate query cache so all components update seamlessly without reload
      queryClient.setQueryData<SessionEvent[]>(['events'], (old = []) => {
        if (old.some((e) => e.id === newEvent.id)) return old;
        return [newEvent, ...old];
      });
      if (newEvent.sessionId) {
        queryClient.invalidateQueries({ queryKey: ['session-events', newEvent.sessionId] });
      }
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['decisions'] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      queryClient.invalidateQueries({ queryKey: ['quarantine'] });
    });

    const unsubscribeStage = liveEventSimulator.subscribeStage((_, stageName) => {
      setCurrentStage(liveEventSimulator.getCurrentStage());
    });

    return () => {
      unsubscribeEvents();
      unsubscribeStage();
      if (autoStart) {
        liveEventSimulator.stop();
      }
    };
  }, [autoStart, queryClient]);

  const toggleRunning = useCallback(() => {
    if (liveEventSimulator.getIsRunning()) {
      liveEventSimulator.stop();
      setIsRunning(false);
    } else {
      liveEventSimulator.start(3500);
      setIsRunning(true);
    }
  }, []);

  const stepIncident = useCallback(() => {
    const evt = liveEventSimulator.stepIncident();
    setCurrentStage(liveEventSimulator.getCurrentStage());
    return evt;
  }, []);

  const resetIncident = useCallback(() => {
    liveEventSimulator.resetIncident();
    setCurrentStage(liveEventSimulator.getCurrentStage());
  }, []);

  const runReviewLifecycle = useCallback(
    (approvalId: string = 'approval-review-001') => {
      const evts = liveEventSimulator.runReviewLifecycle(approvalId);
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['session-events', 'sess-review-001'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['decisions'] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      return evts;
    },
    [queryClient]
  );

  const runQuarantineLifecycle = useCallback(
    (resultId: string = 'result-unsafe-001') => {
      const evts = liveEventSimulator.runQuarantineLifecycle(resultId);
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['session-events', 'sess-quarantine-001'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['decisions'] });
      queryClient.invalidateQueries({ queryKey: ['quarantine'] });
      return evts;
    },
    [queryClient]
  );

  return {
    liveEvents,
    isRunning,
    currentStage,
    stages: INCIDENT_STAGES,
    stepIncident,
    resetIncident,
    toggleRunning,
    runReviewLifecycle,
    runQuarantineLifecycle,
    triggerEvent: (partial: Partial<SessionEvent>) => liveEventSimulator.emitCustomEvent(partial),
  };
}
