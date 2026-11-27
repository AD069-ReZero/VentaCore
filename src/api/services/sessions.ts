/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { mockFetch, ApiResponse } from '../client';
import { MOCK_SESSIONS } from '../../mock/sessions';
import { Session } from '../../types/security';

let sessionsStore: Session[] = [...MOCK_SESSIONS];

export const sessionService = {
  async list(): Promise<ApiResponse<Session[]>> {
    return mockFetch([...sessionsStore]);
  },

  async getById(id: string): Promise<ApiResponse<Session | null>> {
    const session = sessionsStore.find((s) => s.id === id) || null;
    return mockFetch(session);
  },

  addOrUpdateSession(session: Session): void {
    const idx = sessionsStore.findIndex((s) => s.id === session.id);
    if (idx >= 0) {
      sessionsStore[idx] = session;
    } else {
      sessionsStore.unshift(session);
    }
  },

  reset(): void {
    sessionsStore = [...MOCK_SESSIONS];
  },
};
