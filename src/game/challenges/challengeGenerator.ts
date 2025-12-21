/**
 * Challenge generator for root password puzzles
 * 
 * DEPRECATED: This file is kept for backward compatibility.
 * New code should use challengeLoader.ts which provides a modular system.
 * 
 * This file re-exports from the new modular system.
 */

import { generateChallenge as generateChallengeNew, generateChallengeByType, verifyChallengeAnswer as verifyChallengeAnswerNew, loadChallengeGenerators } from './challengeLoader';
import { Challenge } from './ChallengeModule';

// Re-export for backward compatibility
export type { Challenge } from './ChallengeModule';

// Re-export functions with backward-compatible signatures
function generateChallengeCompat(): Challenge {
  // Ensure generators are loaded
  loadChallengeGenerators();
  
  const challenge = generateChallengeNew();
  if (!challenge) {
    // Fallback to simple math if no generators loaded
    return {
      id: `math-${Date.now()}`,
      type: 'math',
      question: 'What is 2 + 2?',
      answer: '4',
      hint: 'Simple addition',
      explanation: '2 + 2 = 4',
      difficulty: 'easy',
    };
  }
  return challenge;
}

function verifyChallengeAnswerCompat(challenge: Challenge, answer: string): boolean {
  return verifyChallengeAnswerNew(challenge, answer);
}

export { generateChallengeCompat as generateChallenge, verifyChallengeAnswerCompat as verifyChallengeAnswer };

