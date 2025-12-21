import { describe, it, expect } from 'vitest';
import { parseCommand } from '../commandParser';

describe('commandParser', () => {
  it('parses simple command', () => {
    const result = parseCommand('help');
    expect(result.command).toBe('help');
    expect(result.args).toEqual([]);
  });

  it('parses command with arguments', () => {
    const result = parseCommand('echo hello world');
    expect(result.command).toBe('echo');
    expect(result.args).toEqual(['hello', 'world']);
  });

  it('handles quoted arguments', () => {
    const result = parseCommand('echo "hello world"');
    expect(result.command).toBe('echo');
    expect(result.args).toEqual(['hello world']);
  });

  it('handles empty input', () => {
    const result = parseCommand('');
    expect(result.command).toBe('');
    expect(result.args).toEqual([]);
  });

  it('handles whitespace', () => {
    const result = parseCommand('  echo   hello   ');
    expect(result.command).toBe('echo');
    expect(result.args).toEqual(['hello']);
  });
});

