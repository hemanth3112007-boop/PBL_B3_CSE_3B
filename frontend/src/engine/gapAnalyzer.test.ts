import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateProfileGap, scanJobDescription, mapSkillToAxis } from './gapAnalyzer';
import { PRIMARY_PROFILE, TARGET_ROLES, INITIAL_BRIDGE_TOPICS } from '../data/mockProfiles';

test('gap analyzer correctly calculates baseline readiness score for target role', () => {
  const role = TARGET_ROLES[0]; // Tier-1 SDE-2
  const result = evaluateProfileGap(PRIMARY_PROFILE, role, new Set(), INITIAL_BRIDGE_TOPICS);

  assert.ok(result.readinessPercentage >= 70 && result.readinessPercentage <= 95, `Expected realistic readiness score, got ${result.readinessPercentage}`);
  assert.equal(result.axes.length, 6, 'Should evaluate 6 capability axes');
  assert.ok(result.solvedVsRequired.userTotal >= 600, 'User should have over 600 solved problems');
});

test('completing sheet tasks boosts readiness score', () => {
  const role = TARGET_ROLES[0];
  const initialResult = evaluateProfileGap(PRIMARY_PROFILE, role, new Set(), INITIAL_BRIDGE_TOPICS);

  const completedIds = new Set(['t-g2', 't-c1']); // Alien Dictionary + Redis Rate Limiter
  const updatedResult = evaluateProfileGap(PRIMARY_PROFILE, role, completedIds, INITIAL_BRIDGE_TOPICS);

  assert.ok(
    updatedResult.readinessPercentage >= initialResult.readinessPercentage,
    `Readiness percentage should increase or stay >= initial. Initial: ${initialResult.readinessPercentage}, Updated: ${updatedResult.readinessPercentage}`
  );
  assert.ok(updatedResult.unlockedBoost > 0, 'Unlocked boost should be greater than 0');
});

test('job description scanner extracts matching and missing skills', () => {
  const sampleJd = `Looking for an SDE with experience in Go, Distributed Systems, Raft consensus, and eBPF.`;
  const matchResult = scanJobDescription(sampleJd, PRIMARY_PROFILE);

  assert.ok(matchResult.matchedSkills.length > 0, 'Should match Distributed Systems and Go');
  assert.ok(matchResult.missingSkills.some(s => s.includes('eBPF')), 'Should flag eBPF as missing');
  assert.ok(matchResult.matchScore >= 50 && matchResult.matchScore <= 100);
});
