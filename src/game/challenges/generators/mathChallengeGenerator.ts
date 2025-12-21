/**
 * Math Challenge Generator
 * Generates educational math puzzles
 */

import { ChallengeGenerator, Challenge } from '../ChallengeModule';

export class MathChallengeGenerator implements ChallengeGenerator {
  type: 'math' = 'math';
  difficulty: 'easy' | 'medium' | 'hard' = 'easy';
  
  generate(): Challenge {
    const operations = [
      {
        generate: () => {
          const a = Math.floor(Math.random() * 50) + 1;
          const b = Math.floor(Math.random() * 50) + 1;
          const answer = a + b;
          return {
            question: `What is ${a} + ${b}?`,
            answer: answer.toString(),
            hint: 'Add the two numbers together',
            explanation: `${a} + ${b} = ${answer}`,
          };
        },
      },
      {
        generate: () => {
          const a = Math.floor(Math.random() * 20) + 10;
          const b = Math.floor(Math.random() * 10) + 1;
          const answer = a - b;
          return {
            question: `What is ${a} - ${b}?`,
            answer: answer.toString(),
            hint: 'Subtract the second number from the first',
            explanation: `${a} - ${b} = ${answer}`,
          };
        },
      },
      {
        generate: () => {
          const a = Math.floor(Math.random() * 10) + 2;
          const b = Math.floor(Math.random() * 10) + 2;
          const answer = a * b;
          return {
            question: `What is ${a} × ${b}?`,
            answer: answer.toString(),
            hint: 'Multiply the two numbers',
            explanation: `${a} × ${b} = ${answer}`,
          };
        },
      },
      {
        generate: () => {
          const b = Math.floor(Math.random() * 5) + 2;
          const answer = Math.floor(Math.random() * 10) + 2;
          const a = b * answer;
          return {
            question: `What is ${a} ÷ ${b}?`,
            answer: answer.toString(),
            hint: 'Divide the first number by the second',
            explanation: `${a} ÷ ${b} = ${answer}`,
          };
        },
      },
    ];

    const operation = operations[Math.floor(Math.random() * operations.length)];
    const challenge = operation.generate();

    return {
      id: `math-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'math',
      difficulty: 'easy',
      ...challenge,
    };
  }
}

