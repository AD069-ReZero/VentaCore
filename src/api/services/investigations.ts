/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { mockFetch, ApiResponse } from '../client';
import { MOCK_INCIDENTS } from '../../mock/investigations';
import { Incident, IncidentStatus, RiskLevel, IncidentNote, IncidentTimelineItem } from '../../types/security';

// In-memory state for case management actions
let incidentsState: Incident[] = [...MOCK_INCIDENTS];

export const investigationService = {
  async list(): Promise<ApiResponse<Incident[]>> {
    return mockFetch([...incidentsState]);
  },

  async getById(id: string): Promise<ApiResponse<Incident | null>> {
    const inc = incidentsState.find((i) => i.id === id || (id === 'INC-0042' && i.id === 'inc-exfil-001')) || null;
    return mockFetch(inc);
  },

  async updateStatus(id: string, status: IncidentStatus): Promise<ApiResponse<Incident | null>> {
    const index = incidentsState.findIndex((i) => i.id === id || (id === 'INC-0042' && i.id === 'inc-exfil-001'));
    if (index === -1) return mockFetch(null);

    incidentsState[index] = {
      ...incidentsState[index],
      status,
      updatedAt: new Date().toISOString(),
    };
    return mockFetch(incidentsState[index]);
  },

  async updateSeverity(id: string, severity: RiskLevel): Promise<ApiResponse<Incident | null>> {
    const index = incidentsState.findIndex((i) => i.id === id || (id === 'INC-0042' && i.id === 'inc-exfil-001'));
    if (index === -1) return mockFetch(null);

    incidentsState[index] = {
      ...incidentsState[index],
      severity,
      updatedAt: new Date().toISOString(),
    };
    return mockFetch(incidentsState[index]);
  },

  async assignAnalyst(id: string, assignedAnalyst: string): Promise<ApiResponse<Incident | null>> {
    const index = incidentsState.findIndex((i) => i.id === id || (id === 'INC-0042' && i.id === 'inc-exfil-001'));
    if (index === -1) return mockFetch(null);

    incidentsState[index] = {
      ...incidentsState[index],
      assignedAnalyst,
      updatedAt: new Date().toISOString(),
    };
    return mockFetch(incidentsState[index]);
  },

  async addNote(
    incidentId: string,
    data: { author: string; content: string; relatedEntity?: string }
  ): Promise<ApiResponse<IncidentNote | null>> {
    const index = incidentsState.findIndex((i) => i.id === incidentId || (incidentId === 'INC-0042' && i.id === 'inc-exfil-001'));
    if (index === -1) return mockFetch(null);

    const newNote: IncidentNote = {
      id: `note-${Date.now().toString(36)}`,
      incidentId: incidentsState[index].id,
      author: data.author || 'Analyst (Current User)',
      timestamp: new Date().toISOString(),
      content: data.content,
      relatedEntity: data.relatedEntity,
    };

    incidentsState[index] = {
      ...incidentsState[index],
      notes: [...(incidentsState[index].notes || []), newNote],
      updatedAt: new Date().toISOString(),
    };

    return mockFetch(newNote);
  },

  async addTag(incidentId: string, tag: string): Promise<ApiResponse<Incident | null>> {
    const index = incidentsState.findIndex((i) => i.id === incidentId || (incidentId === 'INC-0042' && i.id === 'inc-exfil-001'));
    if (index === -1) return mockFetch(null);

    if (!incidentsState[index].tags.includes(tag)) {
      incidentsState[index] = {
        ...incidentsState[index],
        tags: [...incidentsState[index].tags, tag],
        updatedAt: new Date().toISOString(),
      };
    }
    return mockFetch(incidentsState[index]);
  },

  async removeTag(incidentId: string, tag: string): Promise<ApiResponse<Incident | null>> {
    const index = incidentsState.findIndex((i) => i.id === incidentId || (incidentId === 'INC-0042' && i.id === 'inc-exfil-001'));
    if (index === -1) return mockFetch(null);

    incidentsState[index] = {
      ...incidentsState[index],
      tags: incidentsState[index].tags.filter((t) => t !== tag),
      updatedAt: new Date().toISOString(),
    };
    return mockFetch(incidentsState[index]);
  },

  async toggleBookmarkEvidence(incidentId: string, evidenceId: string): Promise<ApiResponse<Incident | null>> {
    const index = incidentsState.findIndex((i) => i.id === incidentId || (incidentId === 'INC-0042' && i.id === 'inc-exfil-001'));
    if (index === -1) return mockFetch(null);

    const currentBookmarks = incidentsState[index].bookmarkedEvidenceIds || [];
    const newBookmarks = currentBookmarks.includes(evidenceId)
      ? currentBookmarks.filter((id) => id !== evidenceId)
      : [...currentBookmarks, evidenceId];

    incidentsState[index] = {
      ...incidentsState[index],
      bookmarkedEvidenceIds: newBookmarks,
      updatedAt: new Date().toISOString(),
    };
    return mockFetch(incidentsState[index]);
  },

  async getTimeline(incidentId: string): Promise<ApiResponse<IncidentTimelineItem[]>> {
    const inc = incidentsState.find((i) => i.id === incidentId || (incidentId === 'INC-0042' && i.id === 'inc-exfil-001'));
    return mockFetch(inc?.timeline || []);
  },

  async getProvenance(incidentId: string): Promise<ApiResponse<import('../../types/security').ProvenanceGraph>> {
    const { getIncidentProvenance } = await import('../../mock/investigations');
    return mockFetch(getIncidentProvenance(incidentId));
  },

  async getTaintFlow(incidentId: string): Promise<ApiResponse<import('../../types/security').TaintFlowTrace>> {
    const { getIncidentTaintFlow } = await import('../../mock/investigations');
    return mockFetch(getIncidentTaintFlow(incidentId));
  },

  async getRiskExplanation(incidentId: string): Promise<ApiResponse<import('../../types/security').RiskExplanation>> {
    const { getIncidentRiskExplanation } = await import('../../mock/investigations');
    return mockFetch(getIncidentRiskExplanation(incidentId));
  },
};
