export interface InputState {
  keys: Set<string>;
  mouse: { x: number; y: number; dx: number; dy: number; buttons: number };
  touches: Map<number, { x: number; y: number }>;
}

export class InputManager {
  private _keys = new Set<string>();
  private _mouse = { x: 0, y: 0, dx: 0, dy: 0, buttons: 0 };
  private _touches = new Map<number, { x: number; y: number }>();
  private _listeners: (() => void)[] = [];

  get state(): Readonly<InputState> {
    return {
      keys: new Set(this._keys),
      mouse: { ...this._mouse },
      touches: new Map(this._touches),
    };
  }

  isKeyDown(key: string): boolean {
    return this._keys.has(key);
  }

  isMouseDown(button = 0): boolean {
    return (this._mouse.buttons & (1 << button)) !== 0;
  }

  attach(target: Window | HTMLElement = window): void {
    const keyDown = (e: KeyboardEvent) => {
      this._keys.add(e.key);
    };
    const keyUp = (e: KeyboardEvent) => {
      this._keys.delete(e.key);
    };
    const mouseMove = (e: MouseEvent) => {
      this._mouse.dx = e.movementX;
      this._mouse.dy = e.movementY;
      this._mouse.x = e.clientX;
      this._mouse.y = e.clientY;
    };
    const mouseDown = (e: MouseEvent) => {
      this._mouse.buttons |= 1 << e.button;
      this._mouse.x = e.clientX;
      this._mouse.y = e.clientY;
    };
    const mouseUp = (e: MouseEvent) => {
      this._mouse.buttons &= ~(1 << e.button);
      this._mouse.x = e.clientX;
      this._mouse.y = e.clientY;
    };
    const touchStart = (e: TouchEvent) => {
      const list = e.touches.length > 0 ? e.touches : e.changedTouches;
      for (let i = 0; i < list.length; i++) {
        const t = (list as unknown as Touch[])[i];
        this._touches.set(t.identifier, { x: t.clientX, y: t.clientY });
      }
    };
    const touchMove = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = (e.changedTouches as unknown as Touch[])[i];
        this._touches.set(t.identifier, { x: t.clientX, y: t.clientY });
      }
    };
    const touchEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = (e.changedTouches as unknown as Touch[])[i];
        this._touches.delete(t.identifier);
      }
    };

    target.addEventListener('keydown', keyDown as EventListener);
    target.addEventListener('keyup', keyUp as EventListener);
    target.addEventListener('mousemove', mouseMove as EventListener);
    target.addEventListener('mousedown', mouseDown as EventListener);
    target.addEventListener('mouseup', mouseUp as EventListener);
    target.addEventListener('touchstart', touchStart as EventListener, { passive: true });
    target.addEventListener('touchmove', touchMove as EventListener, { passive: true });
    target.addEventListener('touchend', touchEnd as EventListener);
    target.addEventListener('touchcancel', touchEnd as EventListener);

    this._listeners.push(() => {
      target.removeEventListener('keydown', keyDown as EventListener);
      target.removeEventListener('keyup', keyUp as EventListener);
      target.removeEventListener('mousemove', mouseMove as EventListener);
      target.removeEventListener('mousedown', mouseDown as EventListener);
      target.removeEventListener('mouseup', mouseUp as EventListener);
      target.removeEventListener('touchstart', touchStart as EventListener);
      target.removeEventListener('touchmove', touchMove as EventListener);
      target.removeEventListener('touchend', touchEnd as EventListener);
      target.removeEventListener('touchcancel', touchEnd as EventListener);
    });
  }

  detach(): void {
    for (const cleanup of this._listeners) {
      cleanup();
    }
    this._listeners.length = 0;
  }

  /** Reset per-frame deltas */
  resetFrame(): void {
    this._mouse.dx = 0;
    this._mouse.dy = 0;
  }

  clear(): void {
    this._keys.clear();
    this._mouse.buttons = 0;
    this._touches.clear();
    this._mouse.dx = 0;
    this._mouse.dy = 0;
  }
}
