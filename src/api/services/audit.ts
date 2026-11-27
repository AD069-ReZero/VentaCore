/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { mockFetch, ApiResponse } from '../client';
import { MOCK_AUDIT_LOGS } from '../../mock/audit';
import { AuditEvent } from '../../types/security';

export interface AuditFilters {
  actor?: string;
  action?: string;
  resourceType?: string;
  requestId?: string;
  sessionId?: string;
  severity?: string;
  search?: string;
  timeRange?: string;
}

export const auditService = {
  async list(filters?: AuditFilters): Promise<ApiResponse<AuditEvent[]>> {
    let result = [...MOCK_AUDIT_LOGS];

    if (filters) {
      if (filters.actor) {
        result = result.filter((e) => e.actor.toLowerCase().includes(filters.actor!.toLowerCase()));
      }
      if (filters.action && filters.action !== 'ALL') {
        result = result.filter((e) => e.action === filters.action);
      }
      if (filters.resourceType && filters.resourceType !== 'ALL') {
        result = result.filter((e) => e.resourceType === filters.resourceType);
      }
      if (filters.requestId) {
        result = result.filter((e) => e.requestId.toLowerCase().includes(filters.requestId!.toLowerCase()));
      }
      if (filters.sessionId) {
        result = result.filter((e) => e.sessionId.toLowerCase().includes(filters.sessionId!.toLowerCase()));
      }
      if (filters.severity && filters.severity !== 'ALL') {
        result = result.filter((e) => e.severity === filters.severity);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(
          (e) =>
            e.id.toLowerCase().includes(q) ||
            e.summary.toLowerCase().includes(q) ||
            e.actor.toLowerCase().includes(q) ||
            e.action.toLowerCase().includes(q) ||
            e.resourceId.toLowerCase().includes(q) ||
            e.requestId.toLowerCase().includes(q)
        );
      }
    }

    return mockFetch(result);
  },

  async getById(id: string): Promise<ApiResponse<AuditEvent | null>> {
    const item = MOCK_AUDIT_LOGS.find((e) => e.id === id) || null;
    return mockFetch(item);
  },
};
