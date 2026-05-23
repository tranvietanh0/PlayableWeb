/**
 * SpriteAnimation drives frame-based sprite sheet animation.
 *
 * Given a set of frame indices and a frame duration,
 * it tracks which frame should be displayed at any moment.
 */

export interface SpriteAnimationConfig {
  frames: number[]; // indices into a sprite sheet
  frameDuration: number; // ms per frame
  loop?: boolean;
}

export class SpriteAnimation {
  readonly frames: readonly number[];
  readonly frameDuration: number;
  readonly loop: boolean;

  private _currentFrame = 0;
  private _elapsed = 0;
  private _finished = false;

  constructor(config: SpriteAnimationConfig) {
    this.frames = config.frames;
    this.frameDuration = config.frameDuration;
    this.loop = config.loop ?? true;
  }

  /** Advance animation by delta time (ms). */
  update(dt: number): void {
    if (this._finished || this.frames.length === 0) return;

    this._elapsed += dt;

    while (this._elapsed >= this.frameDuration) {
      this._elapsed -= this.frameDuration;
      this._currentFrame++;

      if (this._currentFrame >= this.frames.length) {
        if (this.loop) {
          this._currentFrame = 0;
        } else {
          this._currentFrame = this.frames.length - 1;
          this._finished = true;
          break;
        }
      }
    }
  }

  /** Current sprite sheet index. */
  get currentIndex(): number {
    return this.frames[this._currentFrame] ?? 0;
  }

  get finished(): boolean {
    return this._finished;
  }

  reset(): void {
    this._currentFrame = 0;
    this._elapsed = 0;
    this._finished = false;
  }
}
