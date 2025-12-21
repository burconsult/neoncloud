export interface ParsedCommand {
  command: string;
  args: string[];
  raw: string;
}

export function parseCommand(input: string): ParsedCommand {
  const trimmed = input.trim();
  
  if (!trimmed) {
    return {
      command: '',
      args: [],
      raw: trimmed,
    };
  }

  // Simple parser - handles quoted strings
  const parts: string[] = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';

  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i];
    const nextChar = trimmed[i + 1];

    if ((char === '"' || char === "'") && !inQuotes) {
      inQuotes = true;
      quoteChar = char;
      continue;
    }

    if (char === quoteChar && inQuotes) {
      inQuotes = false;
      quoteChar = '';
      continue;
    }

    if (char === ' ' && !inQuotes) {
      if (current) {
        parts.push(current);
        current = '';
      }
      continue;
    }

    current += char;
  }

  if (current) {
    parts.push(current);
  }

  const [command, ...args] = parts;

  return {
    command: command?.toLowerCase() || '',
    args: args || [],
    raw: trimmed,
  };
}

