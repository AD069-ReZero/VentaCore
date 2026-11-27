import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getImpliedCapabilities,
  canTransitionApprovalState,
  transitionApprovalState,
  getApprovalStatusText,
  maskSensitiveValues,
} from './enforcementLogic.ts';

test('getImpliedCapabilities recursively derives child capabilities', () => {
  const dbImplied = getImpliedCapabilities(['DATABASE_ADMIN']);
  assert.ok(dbImplied.includes('DATABASE_WRITE'));
  assert.ok(dbImplied.includes('DATABASE_READ'));

  const cloudImplied = getImpliedCapabilities(['CLOUD_ADMIN']);
  assert.ok(cloudImplied.includes('CLOUD_WRITE'));
  assert.ok(cloudImplied.includes('CLOUD_READ'));

  const leafImplied = getImpliedCapabilities(['DATABASE_READ']);
  assert.equal(leafImplied.length, 0);
});

test('canTransitionApprovalState enforces state machine rules', () => {
  // Allowed transitions
  assert.equal(canTransitionApprovalState('PENDING', 'APPROVED'), true);
  assert.equal(canTransitionApprovalState('PENDING', 'REJECTED'), true);
  assert.equal(canTransitionApprovalState('PENDING', 'EXPIRED'), true);
  assert.equal(canTransitionApprovalState('PENDING', 'CANCELLED'), true);
  assert.equal(canTransitionApprovalState('PENDING', 'INVALIDATED'), true);
  assert.equal(canTransitionApprovalState('APPROVED', 'CONSUMED'), true);
  assert.equal(canTransitionApprovalState('APPROVED', 'EXPIRED'), true);
  assert.equal(canTransitionApprovalState('APPROVED', 'INVALIDATED'), true);

  // Reject invalid transitions specified in contract
  assert.equal(canTransitionApprovalState('REJECTED', 'APPROVED'), false);
  assert.equal(canTransitionApprovalState('EXPIRED', 'APPROVED'), false);
  assert.equal(canTransitionApprovalState('CONSUMED', 'APPROVED'), false);
  assert.equal(canTransitionApprovalState('PENDING', 'CONSUMED'), false);
  assert.equal(canTransitionApprovalState('CANCELLED', 'APPROVED'), false);
  assert.equal(canTransitionApprovalState('INVALIDATED', 'CONSUMED'), false);

  // Terminal states cannot transition
  assert.equal(canTransitionApprovalState('CONSUMED', 'PENDING'), false);
  assert.equal(canTransitionApprovalState('INVALIDATED', 'APPROVED'), false);

  // Controlled transition helper throws on invalid transition
  assert.equal(transitionApprovalState('PENDING', 'APPROVED'), 'APPROVED');
  assert.throws(
    () => transitionApprovalState('REJECTED', 'APPROVED'),
    /Invalid approval transition/
  );
  assert.throws(
    () => transitionApprovalState('CONSUMED', 'APPROVED'),
    /Invalid approval transition/
  );
});

test('getApprovalStatusText respects REVIEW safety rules', () => {
  assert.equal(getApprovalStatusText('REJECTED').headline, 'EXECUTION DENIED');
  assert.equal(getApprovalStatusText('EXPIRED').headline, 'AUTHORIZATION EXPIRED');
  assert.equal(getApprovalStatusText('CONSUMED').headline, 'SIMULATED AUTHORIZATION CONSUMED');
  assert.equal(getApprovalStatusText('PENDING').headline, 'AWAITING AUTHORIZATION');
});

test('maskSensitiveValues strips credentials safely', () => {
  const sample = JSON.stringify(
    {
      override_token: 'sec_tok_99182310b89cf002',
      api_key: 'my_super_secret_api_key',
      password: 'super_secret_pw',
      authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.t-IDcSemACt8x4iTMCda8Yhe3iZaWbvV5XKSTbuAn0M',
      private_key: 'pk_live_88391024823190',
    },
    null,
    2
  );
  const masked = maskSensitiveValues(sample);

  assert.ok(!masked.includes('sec_tok_99182310b89cf002'));
  assert.ok(!masked.includes('my_super_secret_api_key'));
  assert.ok(!masked.includes('super_secret_pw'));
  assert.ok(!masked.includes('pk_live_88391024823190'));
  assert.ok(masked.includes('"override_token": "[REDACTED]"'));
  assert.ok(masked.includes('"api_key": "[REDACTED]"'));
  assert.ok(masked.includes('"password": "[REDACTED]"'));
  assert.ok(masked.includes('"private_key": "[REDACTED]"'));
});
