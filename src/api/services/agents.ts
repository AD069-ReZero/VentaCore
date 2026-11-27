/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { mockFetch, ApiResponse } from '../client';
import { MOCK_AGENTS } from '../../mock/agents';
import { Agent } from '../../types/security';

export const agentService = {
  async list(): Promise<ApiResponse<Agent[]>> {
    return mockFetch(MOCK_AGENTS);
  },

  async getById(id: string): Promise<ApiResponse<Agent | null>> {
    const agent = MOCK_AGENTS.find((a) => a.id === id || a.name === id) || null;
    return mockFetch(agent);
  },
};
