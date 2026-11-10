import { SkillGapResultRaw, SkillGapResult } from '../types/api';

/**
 * Splits comma-separated skills like "Java, Spring Boot, SQL" into a clean string array.
 * Trims whitespace, eliminates duplicates, and removes empty tokens.
 */
export function parseCommaSeparatedSkills(raw: string | undefined | null): string[] {
  if (!raw || typeof raw !== 'string') return [];
  const items = raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return Array.from(new Set(items));
}

/**
 * Normalizes a raw skill gap response from the Spring Boot API,
 * converting comma-delimited strings to string arrays.
 */
export function normalizeSkillGapResult(raw: SkillGapResultRaw): SkillGapResult {
  return {
    matchPercentage: typeof raw.matchPercentage === 'number' ? raw.matchPercentage : 0,
    matchedSkills: parseCommaSeparatedSkills(raw.matchedSkills),
    missingSkills: parseCommaSeparatedSkills(raw.missingSkills),
    matchLevel: raw.matchLevel || 'MODERATE_MATCH',
    aiExplanation: raw.aiExplanation || '',
    analyzedAt: raw.analyzedAt || new Date().toISOString(),
  };
}
