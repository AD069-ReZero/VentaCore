/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { mockFetch, ApiResponse } from '../client';
import { MOCK_APPROVALS } from '../../mock/approvals';
import { Approval } from '../../types/security';
import { transitionApprovalState } from '../../lib/enforcementLogic';

// In-memory mutable store for development simulation
let approvalsStore: Approval[] = [...MOCK_APPROVALS];

export const approvalService = {
  async list(): Promise<ApiResponse<Approval[]>> {
    return mockFetch([...approvalsStore]);
  },

  async getById(id: string): Promise<ApiResponse<Approval | null>> {
    const approval = approvalsStore.find((a) => a.id === id) || null;
    return mockFetch(approval);
  },

  async approve(
    id: string,
    options?: { justification?: string; approver?: string }
  ): Promise<ApiResponse<Approval | null>> {
    const index = approvalsStore.findIndex((a) => a.id === id);
    if (index === -1) return mockFetch(null);

    const current = approvalsStore[index];
    const nextState = transitionApprovalState(current.state, 'APPROVED');

    const now = new Date().toISOString();
    const updated: Approval = {
      ...current,
      state: nextState,
      resolvedAt: now,
      resolvedBy: options?.approver || 'security-reviewer@vantacore.internal (Simulation)',
      justification: options?.justification || current.justification,
      notes: 'Simulated authorization approved via Human-in-the-Loop review gate (development simulation).',
    };

    approvalsStore[index] = updated;
    return mockFetch(updated);
  },

  async reject(
    id: string,
    options?: { justification?: string; rejector?: string }
  ): Promise<ApiResponse<Approval | null>> {
    const index = approvalsStore.findIndex((a) => a.id === id);
    if (index === -1) return mockFetch(null);

    const current = approvalsStore[index];
    const nextState = transitionApprovalState(current.state, 'REJECTED');

    const now = new Date().toISOString();
    const updated: Approval = {
      ...current,
      state: nextState,
      resolvedAt: now,
      resolvedBy: options?.rejector || 'security-reviewer@vantacore.internal (Simulation)',
      justification: options?.justification || 'Rejected by operator: Exceeds acceptable risk threshold.',
      notes: 'Execution strictly denied by operator. No real gateway execution occurred.',
    };

    approvalsStore[index] = updated;
    return mockFetch(updated);
  },

  async consume(id: string): Promise<ApiResponse<Approval | null>> {
    const index = approvalsStore.findIndex((a) => a.id === id);
    if (index === -1) return mockFetch(null);

    const current = approvalsStore[index];
    const nextState = transitionApprovalState(current.state, 'CONSUMED');

    const now = new Date().toISOString();
    const updated: Approval = {
      ...current,
      state: nextState,
      consumedAt: now,
      notes: 'Simulated authorization consumed in development sandbox. No real gateway execution occurred.',
    };

    approvalsStore[index] = updated;
    return mockFetch(updated);
  },

  async expire(id: string): Promise<ApiResponse<Approval | null>> {
    const index = approvalsStore.findIndex((a) => a.id === id);
    if (index === -1) return mockFetch(null);

    const current = approvalsStore[index];
    const nextState = transitionApprovalState(current.state, 'EXPIRED');

    const now = new Date().toISOString();
    const updated: Approval = {
      ...current,
      state: nextState,
      resolvedAt: now,
      notes: 'TTL window expired without operator consensus. Simulated authorization revoked.',
    };

    approvalsStore[index] = updated;
    return mockFetch(updated);
  },

  async invalidate(id: string, reason?: string): Promise<ApiResponse<Approval | null>> {
    const index = approvalsStore.findIndex((a) => a.id === id);
    if (index === -1) return mockFetch(null);

    const current = approvalsStore[index];
    const nextState = transitionApprovalState(current.state, 'INVALIDATED');

    const now = new Date().toISOString();
    const updated: Approval = {
      ...current,
      state: nextState,
      resolvedAt: now,
      notes: reason || 'Underlying security context changed. Simulated authorization invalidated.',
    };

    approvalsStore[index] = updated;
    return mockFetch(updated);
  },

  reset(): void {
    approvalsStore = [...MOCK_APPROVALS];
  },
};
