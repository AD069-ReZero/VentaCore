/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * VantaCore Developer Integrations API Service
 */

import { mockFetch, ApiResponse } from '../client';
import { MOCK_INTEGRATION_CARDS, DEVELOPER_QUICKSTART_STEPS, DeveloperStepExample } from '../../mock/integrations';
import { IntegrationCard } from '../../types/security';

export const integrationService = {
  async list(): Promise<ApiResponse<IntegrationCard[]>> {
    return mockFetch(MOCK_INTEGRATION_CARDS);
  },

  async getQuickstartSteps(): Promise<ApiResponse<DeveloperStepExample[]>> {
    return mockFetch(DEVELOPER_QUICKSTART_STEPS);
  },
};
