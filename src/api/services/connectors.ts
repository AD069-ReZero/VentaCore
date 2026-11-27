/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * VantaCore Connectors API Service
 */

import { mockFetch, ApiResponse } from '../client';
import { MOCK_CONNECTORS, MOCK_DISCOVERED_TOOLS } from '../../mock/connectors';
import { Connector, DiscoveredToolReview, ToolDiscoveryStatus } from '../../types/security';

// In-memory mutable state to support interactive discovery and review without breaking frozen contracts
let connectorsStore: Connector[] = JSON.parse(JSON.stringify(MOCK_CONNECTORS));

export const connectorService = {
  async list(): Promise<ApiResponse<Connector[]>> {
    return mockFetch(connectorsStore);
  },

  async getById(id: string): Promise<ApiResponse<Connector | null>> {
    const conn = connectorsStore.find((c) => c.id === id) || null;
    return mockFetch(conn);
  },

  async update(id: string, updates: Partial<Connector>): Promise<ApiResponse<Connector | null>> {
    const idx = connectorsStore.findIndex((c) => c.id === id);
    if (idx === -1) return mockFetch(null);
    connectorsStore[idx] = {
      ...connectorsStore[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return mockFetch(connectorsStore[idx]);
  },

  async discoverTools(connectorId: string): Promise<ApiResponse<DiscoveredToolReview[]>> {
    const conn = connectorsStore.find((c) => c.id === connectorId);
    if (!conn) return mockFetch([]);
    
    // Simulate active scan update
    conn.lastDiscovery = new Date().toISOString();
    return mockFetch(conn.discoveredTools);
  },

  async reviewTool(
    connectorId: string,
    toolId: string,
    decision: { status: ToolDiscoveryStatus; reviewedBy: string }
  ): Promise<ApiResponse<DiscoveredToolReview | null>> {
    const conn = connectorsStore.find((c) => c.id === connectorId);
    if (!conn) return mockFetch(null);

    const tool = conn.discoveredTools.find((t) => t.id === toolId);
    if (!tool) return mockFetch(null);

    tool.status = decision.status;
    tool.reviewedBy = decision.reviewedBy;
    tool.reviewedAt = new Date().toISOString();

    return mockFetch(tool);
  },
};
