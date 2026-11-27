/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { mockFetch, ApiResponse } from '../client';
import { MOCK_EVENTS } from '../../mock/events';
import { SessionEvent } from '../../types/security';

// In-memory mutable store for live simulator and runtime events
let eventsStore: SessionEvent[] = [...MOCK_EVENTS];

export const eventService = {
  async list(): Promise<ApiResponse<SessionEvent[]>> {
    return mockFetch([...eventsStore]);
  },

  async getById(id: string): Promise<ApiResponse<SessionEvent | null>> {
    const event = eventsStore.find((e) => e.id === id) || null;
    return mockFetch(event);
  },

  async getBySessionId(sessionId: string): Promise<ApiResponse<SessionEvent[]>> {
    const events = eventsStore.filter(
      (e) => e.sessionId === sessionId || (sessionId.startsWith('9c72d1') && e.sessionId === 'sess-exfil-001')
    );
    return mockFetch(events.length > 0 ? events : eventsStore);
  },

  addEvent(event: SessionEvent): void {
    if (!eventsStore.some((e) => e.id === event.id)) {
      eventsStore.unshift(event);
    }
  },

  reset(): void {
    eventsStore = [...MOCK_EVENTS];
  },
};
