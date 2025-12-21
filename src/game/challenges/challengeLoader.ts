/**
 * Challenge Loader
 * Loads and registers all challenge generators
 */

import { challengeRegistry } from './ChallengeModule';
import { MathChallengeGenerator } from './generators/mathChallengeGenerator';
import { LogicChallengeGenerator } from './generators/logicChallengeGenerator';
import { PatternChallengeGenerator } from './generators/patternChallengeGenerator';

/**
 * Load all challenge generators
 */
export function loadChallengeGenerators(): void {
  if (import.meta.env?.DEV) {
    challengeRegistry.clear();
  }

  // Register all challenge generators
  challengeRegistry.register(new MathChallengeGenerator());
  challengeRegistry.register(new LogicChallengeGenerator());
  challengeRegistry.register(new PatternChallengeGenerator());
}

/**
 * Generate a random challenge
 * @returns A new challenge or null if no generators are available
 */
export function generateChallenge() {
  return challengeRegistry.generateRandom();
}

/**
 * Generate a challenge of a specific type
 */
export function generateChallengeByType(type: 'math' | 'logic' | 'pattern'): ReturnType<typeof challengeRegistry.generateByType> {
  return challengeRegistry.generateByType(type);
}

/**
 * Verify challenge answer
 */
export function verifyChallengeAnswer(challenge: { answer: string }, answer: string): boolean {
  return challenge.answer.toLowerCase().trim() === answer.toLowerCase().trim();
}

