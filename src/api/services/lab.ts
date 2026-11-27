/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { mockFetch, ApiResponse } from '../client';
import { LAB_PRESETS, INITIAL_LAB_HISTORY, simulateLabRun } from '../../mock/lab';
import { LabInputs, LabExecutionResult, LabPreset } from '../../types/security';

let labHistoryState: LabExecutionResult[] = [...INITIAL_LAB_HISTORY];

export const labService = {
  async getPresets(): Promise<ApiResponse<LabPreset[]>> {
    return mockFetch(LAB_PRESETS);
  },

  async getHistory(): Promise<ApiResponse<LabExecutionResult[]>> {
    return mockFetch([...labHistoryState]);
  },

  async runSimulation(inputs: LabInputs): Promise<ApiResponse<LabExecutionResult>> {
    const result = simulateLabRun(inputs);
    labHistoryState = [result, ...labHistoryState].slice(0, 20);
    return mockFetch(result);
  },

  async getRunById(id: string): Promise<ApiResponse<LabExecutionResult | null>> {
    const found = labHistoryState.find((r) => r.id === id) || null;
    return mockFetch(found);
  },
};
