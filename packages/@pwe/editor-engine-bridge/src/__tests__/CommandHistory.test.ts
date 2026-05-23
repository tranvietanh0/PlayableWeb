import { describe, it, expect } from 'vitest';
import { CommandHistory, Command } from '../CommandHistory.js';

class MockCommand implements Command {
  label: string;
  executed = false;
  undone = false;

  constructor(label: string) {
    this.label = label;
  }

  execute(): void {
    this.executed = true;
    this.undone = false;
  }

  undo(): void {
    this.undone = true;
    this.executed = false;
  }
}

describe('CommandHistory', () => {
  it('should execute command on push', () => {
    const history = new CommandHistory();
    const cmd = new MockCommand('test');
    history.push(cmd);
    expect(cmd.executed).toBe(true);
    expect(history.canUndo).toBe(true);
  });

  it('should undo and redo', () => {
    const history = new CommandHistory();
    const cmd = new MockCommand('test');
    history.push(cmd);
    expect(cmd.executed).toBe(true);

    history.undo();
    expect(cmd.undone).toBe(true);
    expect(history.canUndo).toBe(false);
    expect(history.canRedo).toBe(true);

    history.redo();
    expect(cmd.executed).toBe(true);
    expect(history.canRedo).toBe(false);
  });

  it('should truncate redo stack on new push', () => {
    const history = new CommandHistory();
    const a = new MockCommand('a');
    const b = new MockCommand('b');
    history.push(a);
    history.push(b);
    history.undo();

    const c = new MockCommand('c');
    history.push(c);

    expect(history.canRedo).toBe(false);
    expect(b.undone).toBe(true); // still undone
    expect(c.executed).toBe(true);
  });

  it('should clear', () => {
    const history = new CommandHistory();
    history.push(new MockCommand('a'));
    history.clear();
    expect(history.canUndo).toBe(false);
    expect(history.canRedo).toBe(false);
  });
});
