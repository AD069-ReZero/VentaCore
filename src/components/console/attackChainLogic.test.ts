import test from 'node:test';
import assert from 'node:assert/strict';
import { getRiskColorClass, calculateChainMaxRisk } from './attackChainLogic.ts';
import type { ThreatNodeData } from './attackChainLogic.ts';

test('getRiskColorClass maps risk levels correctly to CSS and hex codes', () => {
  const crit = getRiskColorClass('critical');
  assert.equal(crit.edgeColor, '#EF4444');
  assert.ok(crit.border.includes('border-[#EF4444]'));

  const susp = getRiskColorClass('suspicious');
  assert.equal(susp.edgeColor, '#F59E0B');

  const norm = getRiskColorClass('normal');
  assert.equal(norm.edgeColor, '#70FF5E');
});

test('calculateChainMaxRisk bubbles critical risks appropriately', () => {
  const nodes: ThreatNodeData[] = [
    { id: '1', step: '01', title: 'Fetch', subtitle: 'Web', risk: 'normal', confidence: 0.99 },
    { id: '2', step: '02', title: 'Injection', subtitle: 'Adversarial', risk: 'suspicious', confidence: 0.94 },
    { id: '3', step: '03', title: 'Egress', subtitle: 'POST', risk: 'critical', confidence: 0.98 },
  ];

  assert.equal(calculateChainMaxRisk(nodes), 'critical');

  const normalOnly: ThreatNodeData[] = [
    { id: '1', step: '01', title: 'Fetch', subtitle: 'Web', risk: 'normal', confidence: 0.99 },
  ];
  assert.equal(calculateChainMaxRisk(normalOnly), 'normal');
});
