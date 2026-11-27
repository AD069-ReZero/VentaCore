/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * VantaCore Enforcement Logic & Capability Hierarchy Utilities
 * Pure deterministic functions for capability trees, state transitions, and UI sanitization.
 */

import type { ToolCapability, ApprovalState } from '../types/security.ts';

/**
 * Capability implication map.
 * Visual reference demonstrating capability inheritance for auditing.
 */
export const CAPABILITY_IMPLICATIONS: Record<ToolCapability, ToolCapability[]> = {
  DATABASE_ADMIN: ['DATABASE_WRITE', 'DATABASE_READ'],
  DATABASE_WRITE: ['DATABASE_READ'],
  DATABASE_READ: [],
  CLOUD_ADMIN: ['CLOUD_WRITE', 'CLOUD_READ'],
  CLOUD_WRITE: ['CLOUD_READ'],
  CLOUD_READ: [],
  FILE_DELETE: ['FILE_WRITE', 'FILE_READ'],
  FILE_WRITE: ['FILE_READ'],
  FILE_READ: [],
  FILESYSTEM_READ: ['FILE_READ'],
  FINANCIAL_TRANSACTION: ['FINANCIAL_READ'],
  FINANCIAL_READ: [],
  SHELL_EXECUTE: ['CODE_EXECUTE', 'FILE_READ', 'FILE_WRITE'],
  CODE_EXECUTE: ['FILE_READ'],
  IDENTITY_WRITE: ['IDENTITY_READ'],
  IDENTITY_READ: [],
  HTTP_WRITE: ['HTTP_READ'],
  HTTP_READ: [],
  EMAIL_SEND: ['EMAIL_READ'],
  EMAIL_READ: [],
  SECRET_READ: [],
};

/**
 * Returns all implied descendant capabilities for a list of root capabilities.
 */
export function getImpliedCapabilities(capabilities: ToolCapability[]): ToolCapability[] {
  const result = new Set<ToolCapability>();

  function traverse(cap: ToolCapability) {
    const implied = CAPABILITY_IMPLICATIONS[cap] || [];
    for (const child of implied) {
      if (!result.has(child)) {
        result.add(child);
        traverse(child);
      }
    }
  }

  for (const cap of capabilities) {
    traverse(cap);
  }

  return Array.from(result);
}

/**
 * Validates whether an Approval state transition is allowable.
 * Enforces frozen VantaCore HITL state machine rules.
 */
export function canTransitionApprovalState(from: ApprovalState, to: ApprovalState): boolean {
  if (from === to) return true;

  switch (from) {
    case 'PENDING':
      return ['APPROVED', 'REJECTED', 'EXPIRED', 'CANCELLED', 'INVALIDATED'].includes(to);
    case 'APPROVED':
      return ['CONSUMED', 'EXPIRED', 'INVALIDATED'].includes(to);
    case 'REJECTED':
    case 'EXPIRED':
    case 'CONSUMED':
    case 'CANCELLED':
    case 'INVALIDATED':
      // Terminal states cannot transition
      return false;
    default:
      return false;
  }
}

/**
 * Transitions approval state or throws a controlled development error.
 */
export function transitionApprovalState(current: ApprovalState, next: ApprovalState): ApprovalState {
  if (!canTransitionApprovalState(current, next)) {
    throw new Error(
      `[VantaCore Security Contract] Invalid approval transition from ${current} to ${next}. State is terminal or transition violates HITL policy.`
    );
  }
  return next;
}

/**
 * Resolves human-readable status banner under REVIEW safety rules.
 * Uses development-safe simulated authorization wording.
 */
export function getApprovalStatusText(state: ApprovalState): {
  headline: string;
  subtext: string;
  tone: 'warning' | 'success' | 'danger' | 'neutral';
} {
  switch (state) {
    case 'PENDING':
      return {
        headline: 'AWAITING AUTHORIZATION',
        subtext: 'High-risk tool call paused at boundary. Operation has NOT executed.',
        tone: 'warning',
      };
    case 'APPROVED':
      return {
        headline: 'SIMULATED AUTHORIZATION APPROVED',
        subtext: 'Human review recorded. Simulated authorization approved (pending simulated dispatch).',
        tone: 'success',
      };
    case 'CONSUMED':
      return {
        headline: 'SIMULATED AUTHORIZATION CONSUMED',
        subtext: 'Simulated authorization consumed. No real gateway execution occurred (development simulation).',
        tone: 'neutral',
      };
    case 'REJECTED':
      return {
        headline: 'EXECUTION DENIED',
        subtext: 'Manual reviewer rejected request. Operation terminated with hard block.',
        tone: 'danger',
      };
    case 'EXPIRED':
      return {
        headline: 'AUTHORIZATION EXPIRED',
        subtext: 'TTL expired without human consensus. Review decision forfeited.',
        tone: 'neutral',
      };
    case 'CANCELLED':
      return {
        headline: 'REQUEST CANCELLED',
        subtext: 'Session was closed or superseded prior to authorization decision.',
        tone: 'neutral',
      };
    case 'INVALIDATED':
      return {
        headline: 'AUTHORIZATION INVALIDATED',
        subtext: 'Underlying agent context or policy changed before execution.',
        tone: 'danger',
      };
    default:
      return {
        headline: 'UNKNOWN STATE',
        subtext: 'Non-authoritative state received.',
        tone: 'neutral',
      };
  }
}

/**
 * Masks sensitive values in payloads (e.g. bearer tokens, keys, passwords).
 * Ensures secrets are never exposed in UI views.
 * Supports strings, objects, and nested arrays recursively.
 */
export function maskSensitiveValues<T = unknown>(input: T): T {
  if (input === null || input === undefined) return input;

  if (typeof input === 'string') {
    return maskString(input) as unknown as T;
  }

  if (Array.isArray(input)) {
    return input.map((item) => maskSensitiveValues(item)) as unknown as T;
  }

  if (typeof input === 'object') {
    const sensitiveKeyPattern = /^(password|token|api[_-]?key|secret|override_token|private_key|authorization|credentials?|access_token|session_token|auth_token|client_secret|bearer_?token|rsa_?key)$/i;
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(input as Record<string, unknown>)) {
      if (typeof val === 'string') {
        if (sensitiveKeyPattern.test(key)) {
          result[key] = '[REDACTED]';
        } else {
          result[key] = maskString(val);
        }
      } else {
        result[key] = maskSensitiveValues(val);
      }
    }
    return result as T;
  }

  return input;
}

function maskString(input: string): string {
  if (!input) return '';
  if (input.startsWith('-----BEGIN') && input.includes('PRIVATE KEY')) {
    return '[REDACTED]';
  }
  return input
    .replace(/(Bearer\s+)[A-Za-z0-9-_.]+/gi, '$1[REDACTED]')
    .replace(/(X-API-Key\s*:\s*)[^\s]+/gi, '$1[REDACTED]')
    .replace(/(Authorization\s*:\s*(?:Bearer\s+)?)[^\s\r\n]+/gi, '$1[REDACTED]')
    .replace(/eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/g, '[REDACTED]')
    .replace(/sec_tok_[a-zA-Z0-9_-]+/g, '[REDACTED]')
    .replace(/pk_live_[a-zA-Z0-9_-]+/g, '[REDACTED]')
    .replace(/key_live_[a-zA-Z0-9_-]+/g, '[REDACTED]')
    .replace(/sk-[a-zA-Z0-9-_]+/g, '[REDACTED]')
    .replace(/(["']?(?:password|token|api[_-]?key|secret|override_token|private_key|authorization|credentials?|access_token|session_token|auth_token|client_secret)[\w-]*["']?\s*[:=]\s*["'])[^"']+["']/gi, '$1[REDACTED]"')
    .replace(/(PRIVATE KEY-----\n)[^-]+(\n-----END)/g, '$1[REDACTED]$2');
}

