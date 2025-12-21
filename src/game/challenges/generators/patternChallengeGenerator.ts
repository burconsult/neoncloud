/**
 * Pattern Challenge Generator
 * Generates educational pattern recognition puzzles
 */

import { ChallengeGenerator, Challenge } from '../ChallengeModule';

export class PatternChallengeGenerator implements ChallengeGenerator {
  type: 'pattern' = 'pattern';
  difficulty: 'easy' | 'medium' = 'easy';
  
  generate(): Challenge {
    const challenges: Array<{
      question: string;
      answer: string;
      hint: string;
      explanation: string;
    }> = [
      {
        question: 'Complete the pattern: 5, 10, 15, 20, ?',
        answer: '25',
        hint: 'Add 5 to each number',
        explanation: 'Pattern: +5 each time. 20 + 5 = 25',
      },
      {
        question: 'Complete the pattern: 3, 6, 12, 24, ?',
        answer: '48',
        hint: 'Double each number',
        explanation: 'Pattern: ×2 each time. 24 × 2 = 48',
      },
      {
        question: 'Complete the pattern: 100, 90, 80, 70, ?',
        answer: '60',
        hint: 'Subtract 10 from each number',
        explanation: 'Pattern: -10 each time. 70 - 10 = 60',
      },
    ];

    const challenge = challenges[Math.floor(Math.random() * challenges.length)];

    return {
      id: `pattern-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'pattern',
      difficulty: 'easy',
      ...challenge,
    };
  }
}

