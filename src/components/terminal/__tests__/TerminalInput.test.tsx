import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TerminalInput } from '../TerminalInput';

describe('TerminalInput', () => {
  it('renders terminal input', () => {
    const onExecute = vi.fn();
    render(<TerminalInput onExecute={onExecute} />);
    
    const input = screen.getByLabelText('Terminal command input');
    expect(input).toBeInTheDocument();
  });

  it('calls onExecute when Enter is pressed', async () => {
    const user = userEvent.setup();
    const onExecute = vi.fn();
    render(<TerminalInput onExecute={onExecute} />);
    
    const input = screen.getByLabelText('Terminal command input');
    await user.type(input, 'test command');
    await user.keyboard('{Enter}');
    
    expect(onExecute).toHaveBeenCalledWith('test command');
  });
});

