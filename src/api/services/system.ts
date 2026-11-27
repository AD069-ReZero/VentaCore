/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { mockFetch, ApiResponse } from '../client';
import { MOCK_SYSTEM_COMPONENTS, MOCK_SOC_COMPONENTS, MOCK_SOC_METADATA } from '../../mock/system';
import { SystemComponent, SocSystemComponent, SocSystemMetadata } from '../../types/security';

export const systemService = {
  async getHealth(): Promise<ApiResponse<SystemComponent[]>> {
    return mockFetch(MOCK_SYSTEM_COMPONENTS);
  },

  async getSocHealth(): Promise<ApiResponse<SocSystemComponent[]>> {
    return mockFetch(MOCK_SOC_COMPONENTS);
  },

  async getSocMetadata(): Promise<ApiResponse<SocSystemMetadata>> {
    return mockFetch(MOCK_SOC_METADATA);
  },
};
