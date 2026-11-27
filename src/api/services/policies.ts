/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { mockFetch, ApiResponse } from '../client';
import { MOCK_POLICIES, simulatePolicyEvaluation, computePolicyDiff, backtestPolicy } from '../../mock/policies';
import {
  Policy,
  PolicySimulationInput,
  PolicySimulationResult,
  PolicyVersionDiff,
  PolicyBacktestInput,
  PolicyBacktestResult,
} from '../../types/security';

export const policyService = {
  async list(): Promise<ApiResponse<Policy[]>> {
    return mockFetch(MOCK_POLICIES);
  },

  async getById(id: string): Promise<ApiResponse<Policy | null>> {
    const policy = MOCK_POLICIES.find((p) => p.id === id) || null;
    return mockFetch(policy);
  },

  async simulate(input: PolicySimulationInput): Promise<ApiResponse<PolicySimulationResult>> {
    const result = simulatePolicyEvaluation(input);
    return mockFetch(result);
  },

  async getDiff(
    policyId: string,
    fromVersion?: string,
    toVersion?: string
  ): Promise<ApiResponse<PolicyVersionDiff>> {
    const diff = computePolicyDiff(policyId, fromVersion, toVersion);
    return mockFetch(diff);
  },

  async backtest(input: PolicyBacktestInput): Promise<ApiResponse<PolicyBacktestResult>> {
    const result = backtestPolicy(input);
    return mockFetch(result);
  },
};
