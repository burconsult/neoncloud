/**
 * Challenge Module Interface
 * 
 * Modular system for educational puzzles and challenges.
 * Challenges can be used for:
 * - Root access (su command)
 * - Mission puzzles
 * - Educational hints
 */

export interface Challenge {
  id: string;
  type: 'math' | 'logic' | 'pattern';
  question: string;
  answer: string;
  hint: string;
  explanation: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

/**
 * Challenge Generator Interface
 * Each challenge type can have its own generator
 */
export interface ChallengeGenerator {
  /**
   * Generate a new challenge of this type
   */
  generate(): Challenge;
  
  /**
   * Type of challenges this generator creates
   */
  type: Challenge['type'];
  
  /**
   * Difficulty level (optional)
   */
  difficulty?: Challenge['difficulty'];
}

/**
 * Challenge Registry
 * Centralized registry for challenge generators
 */
class ChallengeRegistry {
  private generators: Map<string, ChallengeGenerator> = new Map();
  
  /**
   * Register a challenge generator
   */
  register(generator: ChallengeGenerator): void {
    this.generators.set(generator.type, generator);
  }
  
  /**
   * Get a challenge generator by type
   */
  get(type: string): ChallengeGenerator | undefined {
    return this.generators.get(type);
  }
  
  /**
   * Get all registered generators
   */
  getAll(): ChallengeGenerator[] {
    return Array.from(this.generators.values());
  }
  
  /**
   * Generate a random challenge from available generators
   */
  generateRandom(): Challenge | null {
    const generators = this.getAll();
    if (generators.length === 0) return null;
    
    const generator = generators[Math.floor(Math.random() * generators.length)];
    return generator.generate();
  }
  
  /**
   * Generate a challenge of a specific type
   */
  generateByType(type: string): Challenge | null {
    const generator = this.get(type);
    if (!generator) return null;
    return generator.generate();
  }
  
  /**
   * Clear all generators (useful for testing)
   */
  clear(): void {
    this.generators.clear();
  }
}

// Export singleton instance
export const challengeRegistry = new ChallengeRegistry();

