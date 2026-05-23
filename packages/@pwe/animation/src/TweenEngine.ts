/**
 * TweenEngine provides interpolation between values over time.
 *
 * Supports:
 * - Linear, ease-in, ease-out, ease-in-out easing functions
 * - Chaining tweens
 * - Yoyo (ping-pong) behavior
 */

export type EasingFn = (t: number) => number;

export const Easing = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => 1 - (1 - t) * (1 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  easeInOutCubic: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
} as const;

export interface TweenOptions {
  duration: number; // ms
  easing?: EasingFn;
  delay?: number; // ms
  yoyo?: boolean;
  repeat?: number;
  onUpdate?: (value: number) => void;
  onComplete?: () => void;
}

export interface ActiveTween {
  id: number;
  from: number;
  to: number;
  startTime: number;
  duration: number;
  easing: EasingFn;
  yoyo: boolean;
  repeat: number;
  repeatCount: number;
  direction: 1 | -1;
  onUpdate?: (value: number) => void;
  onComplete?: () => void;
}

let _nextId = 0;

export class TweenEngine {
  private _tweens = new Map<number, ActiveTween>();

  tween(from: number, to: number, options: TweenOptions): number {
    const id = ++_nextId;
    const now = performance.now();
    const tween: ActiveTween = {
      id,
      from,
      to,
      startTime: now + (options.delay ?? 0),
      duration: options.duration,
      easing: options.easing ?? Easing.linear,
      yoyo: options.yoyo ?? false,
      repeat: options.repeat ?? 0,
      repeatCount: 0,
      direction: 1,
      onUpdate: options.onUpdate,
      onComplete: options.onComplete,
    };
    this._tweens.set(id, tween);
    return id;
  }

  update(dt: number): void {
    const now = performance.now();
    for (const tween of this._tweens.values()) {
      if (now < tween.startTime) continue;

      let elapsed = now - tween.startTime;
      let progress = Math.min(1, elapsed / tween.duration);
      progress = tween.easing(progress);

      let value: number;
      if (tween.direction === 1) {
        value = tween.from + (tween.to - tween.from) * progress;
      } else {
        value = tween.to + (tween.from - tween.to) * progress;
      }

      tween.onUpdate?.(value);

      if (progress >= 1) {
        if (tween.yoyo && tween.repeatCount < tween.repeat) {
          tween.direction = tween.direction === 1 ? -1 : 1;
          tween.startTime = now;
          tween.repeatCount++;
        } else if (tween.repeatCount < tween.repeat) {
          tween.startTime = now;
          tween.repeatCount++;
        } else {
          tween.onComplete?.();
          this._tweens.delete(tween.id);
        }
      }
    }
  }

  stop(id: number): void {
    this._tweens.delete(id);
  }

  stopAll(): void {
    this._tweens.clear();
  }

  get activeCount(): number {
    return this._tweens.size;
  }
}
