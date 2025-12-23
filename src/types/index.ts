// Core game types

export interface Command {
  name: string;
  aliases?: string[];
  description: string;
  usage: string;
  execute: (args: string[], context?: GameContext) => CommandResult | Promise<CommandResult>;
  validate?: (args: string[]) => ValidationResult;
  requiresUnlock?: boolean;
  educationalNote?: string;
}

export interface CommandResult {
  output: string | string[];
  success: boolean;
  error?: string;
  educationalContent?: EducationalContent;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface GameContext {
  currentDirectory: string;
  fileSystem: FileSystem;
  mission: Mission | null;
  player: Player;
  commandRegistry?: Map<string, Command>;
}

export interface FileSystem {
  [path: string]: File | Directory;
}

export interface File {
  type: 'file';
  name: string;
  content: string;
  permissions?: string;
  isEncrypted?: boolean; // If true, content is encrypted and should be displayed as gibberish
  encryptionKey?: string; // Key identifier for decryption (references email attachment password)
}

export interface Directory {
  type: 'directory';
  name: string;
  children: FileSystem;
}

export type MissionCategory = 
  | 'training'      // Training missions - learn basic commands
  | 'script-kiddie' // n00b level - basic hacking with tools
  | 'cyber-warrior' // h4x0r level - intermediate hacking
  | 'digital-ninja'; // l33t level - advanced hacking

export interface Mission {
  id: string;
  title: string;
  description: string;
  category: MissionCategory;
  learningObjectives: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tasks: Task[];
  prerequisites: string[];
  unlocks?: string[]; // Optional: Dynamic ordering system handles next missions automatically
  reward?: number;
}

export interface Task {
  id: string;
  description: string;
  type: 'command' | 'explore' | 'solve' | 'learn';
  objective: string;
  hints: string[];
  solution?: string;
  reward?: number;
}

export interface Player {
  level: number;
  xp: number;
  unlockedCommands: string[];
  badges: Badge[];
  completedMissions: string[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon?: string;
  unlockedAt: Date;
}

export interface EducationalContent {
  id: string;
  title: string;
  content: string;
  type: 'concept' | 'example' | 'diagram' | 'interactive';
  relatedCommands: string[];
  relatedMissions: string[];
  difficulty: number;
}

