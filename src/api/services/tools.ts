/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { mockFetch, ApiResponse } from '../client';
import { MOCK_TOOLS } from '../../mock/tools';
import { Tool } from '../../types/security';

export const toolService = {
  async list(): Promise<ApiResponse<Tool[]>> {
    return mockFetch(MOCK_TOOLS);
  },

  async getById(id: string): Promise<ApiResponse<Tool | null>> {
    const tool = MOCK_TOOLS.find((t) => t.id === id || t.name === id) || null;
    return mockFetch(tool);
  },
};
