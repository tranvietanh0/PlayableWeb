export interface Command {
  execute(): void;
  undo(): void;
  label: string;
}

export class CommandHistory {
  private _stack: Command[] = [];
  private _index = -1;
  private _maxSize = 200;

  get canUndo(): boolean {
    return this._index >= 0;
  }

  get canRedo(): boolean {
    return this._index < this._stack.length - 1;
  }

  get currentLabel(): string | undefined {
    return this._stack[this._index]?.label;
  }

  push(cmd: Command): void {
    // Truncate any redoable commands after current index
    if (this._index < this._stack.length - 1) {
      this._stack = this._stack.slice(0, this._index + 1);
    }

    this._stack.push(cmd);

    if (this._stack.length > this._maxSize) {
      this._stack.shift();
    } else {
      this._index++;
    }

    cmd.execute();
  }

  undo(): void {
    if (!this.canUndo) return;
    const cmd = this._stack[this._index];
    if (cmd) {
      cmd.undo();
    }
    this._index--;
  }

  redo(): void {
    if (!this.canRedo) return;
    const idx = this._index + 1;
    const cmd = this._stack[idx];
    if (cmd) {
      cmd.execute();
    }
    this._index = idx;
  }

  clear(): void {
    this._stack = [];
    this._index = -1;
  }
}
