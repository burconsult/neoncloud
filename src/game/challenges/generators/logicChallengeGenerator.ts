/**
 * Logic Challenge Generator
 * Generates educational logic puzzles
 */

import { ChallengeGenerator, Challenge } from '../ChallengeModule';

export class LogicChallengeGenerator implements ChallengeGenerator {
  type: 'logic' = 'logic';
  difficulty: 'easy' | 'medium' = 'easy';
  
  generate(): Challenge {
    const challenges: Array<{
      question: string;
      answer: string;
      hint: string;
      explanation: string;
    }> = [
      {
        question: 'What is the next number in the sequence: 2, 4, 6, 8, ?',
        answer: '10',
        hint: 'The pattern increases by 2 each time',
        explanation: 'Each number increases by 2: 2→4→6→8→10',
      },
      {
        question: 'What is the next number in the sequence: 1, 4, 9, 16, ?',
        answer: '25',
        hint: 'These are perfect squares',
        explanation: '1²=1, 2²=4, 3²=9, 4²=16, 5²=25',
      },
      {
        question: 'What is the next number in the sequence: 1, 1, 2, 3, 5, ?',
        answer: '8',
        hint: 'Each number is the sum of the previous two',
        explanation: 'Fibonacci sequence: 1+1=2, 1+2=3, 2+3=5, 3+5=8',
      },
      {
        question: 'If A=1, B=2, C=3, what is D?',
        answer: '4',
        hint: 'Each letter corresponds to its position in the alphabet',
        explanation: 'D is the 4th letter of the alphabet',
      },
      {
        question: 'What is 2 to the power of 3? (2³)',
        answer: '8',
        hint: 'Multiply 2 by itself 3 times',
        explanation: '2³ = 2 × 2 × 2 = 8',
      },
    ];

    const challenge = challenges[Math.floor(Math.random() * challenges.length)];

    return {
      id: `logic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'logic',
      difficulty: 'easy',
      ...challenge,
    };
  }
}

