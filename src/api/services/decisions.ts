/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { mockFetch, ApiResponse } from '../client';
import { MOCK_DECISIONS } from '../../mock/decisions';
import { SecurityDecision } from '../../types/security';

let decisionsStore: SecurityDecision[] = [...MOCK_DECISIONS];

export const decisionService = {
  async list(): Promise<ApiResponse<SecurityDecision[]>> {
    return mockFetch([...decisionsStore]);
  },

  async getById(id: string): Promise<ApiResponse<SecurityDecision | null>> {
    const decision = decisionsStore.find((d) => d.id === id) || null;
    return mockFetch(decision);
  },

  async getBySessionId(sessionId: string): Promise<ApiResponse<SecurityDecision[]>> {
    const decisions = decisionsStore.filter(
      (d) => d.sessionId === sessionId || (sessionId.startsWith('9c72d1') && d.sessionId === 'sess-exfil-001')
    );
    return mockFetch(decisions);
  },

  addOrUpdateDecision(decision: SecurityDecision): void {
    const idx = decisionsStore.findIndex((d) => d.id === decision.id);
    if (idx >= 0) {
      decisionsStore[idx] = decision;
    } else {
      decisionsStore.unshift(decision);
    }
  },

  reset(): void {
    decisionsStore = [...MOCK_DECISIONS];
  },
};
