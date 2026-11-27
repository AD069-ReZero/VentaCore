/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { mockFetch, ApiResponse } from '../client';
import { MOCK_QUARANTINE } from '../../mock/quarantine';
import { QuarantinedResult, ToolResultAction } from '../../types/security';

// In-memory mutable store for development simulation
let quarantineStore: QuarantinedResult[] = [...MOCK_QUARANTINE];

export const quarantineService = {
  async list(): Promise<ApiResponse<QuarantinedResult[]>> {
    return mockFetch([...quarantineStore]);
  },

  async getById(id: string): Promise<ApiResponse<QuarantinedResult | null>> {
    const item = quarantineStore.find((q) => q.id === id || (id === 'result-unsafe-001' && q.id === 'quar-001') || (id === 'quar-001' && q.id === 'result-unsafe-001')) || null;
    return mockFetch(item);
  },

  async updateAction(id: string, action: ToolResultAction): Promise<ApiResponse<QuarantinedResult | null>> {
    const index = quarantineStore.findIndex((q) => q.id === id);
    if (index === -1) return mockFetch(null);

    const updated: QuarantinedResult = {
      ...quarantineStore[index],
      sanitizedAction: action,
    };
    quarantineStore[index] = updated;
    return mockFetch(updated);
  },

  addOrUpdateResult(result: QuarantinedResult): void {
    const idx = quarantineStore.findIndex((q) => q.id === result.id);
    if (idx >= 0) {
      quarantineStore[idx] = result;
    } else {
      quarantineStore.unshift(result);
    }
  },

  reset(): void {
    quarantineStore = [...MOCK_QUARANTINE];
  },
};
