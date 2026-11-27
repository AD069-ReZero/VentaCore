/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * VantaCore API Client Foundation
 * Provides controlled network latency simulation, error handling, and type-safe response wrappers.
 */

export interface ApiResponse<T> {
  data: T;
  timestamp: string;
  source: 'mock' | 'live';
}

const DEFAULT_DELAY_MS = 150;

/**
 * Simulates an asynchronous API network hop with optional synthetic latency.
 */
export async function mockFetch<T>(data: T, delayMs: number = DEFAULT_DELAY_MS): Promise<ApiResponse<T>> {
  if (delayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return {
    data,
    timestamp: new Date().toISOString(),
    source: 'mock',
  };
}
