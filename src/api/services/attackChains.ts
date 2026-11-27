/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { mockFetch, ApiResponse } from '../client';
import { MOCK_ATTACK_CHAINS } from '../../mock/attackChains';
import { AttackChain } from '../../types/security';

export const attackChainService = {
  async list(): Promise<ApiResponse<AttackChain[]>> {
    return mockFetch(MOCK_ATTACK_CHAINS);
  },

  async getById(id: string): Promise<ApiResponse<AttackChain | null>> {
    const chain = MOCK_ATTACK_CHAINS.find((c) => c.id === id) || null;
    return mockFetch(chain);
  },

  async getBySessionId(sessionId: string): Promise<ApiResponse<AttackChain | null>> {
    const chain = MOCK_ATTACK_CHAINS.find((c) => c.sessionId === sessionId) || MOCK_ATTACK_CHAINS[0];
    return mockFetch(chain);
  },
};
