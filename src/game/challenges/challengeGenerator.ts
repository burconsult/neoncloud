/**
 * Challenge generator for root password puzzles
 * Generates educational math/logic puzzles
 */

export interface Challenge {
  id: string;
  type: 'math' | 'logic' | 'pattern';
  question: string;
  answer: string;
  hint: string;
  explanation: string;
}

/**
 * Generate a random math challenge
 */
function generateMathChallenge(): Challenge {
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
    id: `math-${Date.now()}`,
    type: 'math',
    ...challenge,
  };
}

/**
 * Generate a logic challenge
 */
function generateLogicChallenge(): Challenge {
  const challenges = [
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
    id: `logic-${Date.now()}`,
    type: 'logic',
    ...challenge,
  };
}

/**
 * Generate a pattern challenge
 */
function generatePatternChallenge(): Challenge {
  const challenges = [
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
    id: `pattern-${Date.now()}`,
    type: 'pattern',
    ...challenge,
  };
}

/**
 * Generate a random challenge
 */
export function generateChallenge(): Challenge {
  const types: Array<() => Challenge> = [
    generateMathChallenge,
    generateLogicChallenge,
    generatePatternChallenge,
  ];

  const generator = types[Math.floor(Math.random() * types.length)];
  return generator();
}

/**
 * Verify challenge answer
 */
export function verifyChallengeAnswer(challenge: Challenge, answer: string): boolean {
  return challenge.answer.toLowerCase().trim() === answer.toLowerCase().trim();
}

