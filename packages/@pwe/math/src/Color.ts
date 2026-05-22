export class Color {
  constructor(
    public readonly r: number,
    public readonly g: number,
    public readonly b: number,
    public readonly a: number = 1
  ) {}

  static readonly WHITE = new Color(1, 1, 1, 1);
  static readonly BLACK = new Color(0, 0, 0, 1);
  static readonly RED = new Color(1, 0, 0, 1);
  static readonly GREEN = new Color(0, 1, 0, 1);
  static readonly BLUE = new Color(0, 0, 1, 1);
  static readonly TRANSPARENT = new Color(0, 0, 0, 0);

  static fromHex(hex: number, alpha = 1): Color {
    const r = ((hex >> 16) & 0xff) / 255;
    const g = ((hex >> 8) & 0xff) / 255;
    const b = (hex & 0xff) / 255;
    return new Color(r, g, b, alpha);
  }

  static fromHexString(hex: string): Color {
    const cleaned = hex.replace('#', '');
    if (cleaned.length !== 6 && cleaned.length !== 8) {
      throw new Error('Hex string must be 6 or 8 characters');
    }
    const r = parseInt(cleaned.substring(0, 2), 16) / 255;
    const g = parseInt(cleaned.substring(2, 4), 16) / 255;
    const b = parseInt(cleaned.substring(4, 6), 16) / 255;
    const a = cleaned.length === 8 ? parseInt(cleaned.substring(6, 8), 16) / 255 : 1;
    return new Color(r, g, b, a);
  }

  static lerp(a: Color, b: Color, t: number): Color {
    return new Color(
      a.r + (b.r - a.r) * t,
      a.g + (b.g - a.g) * t,
      a.b + (b.b - a.b) * t,
      a.a + (b.a - a.a) * t
    );
  }

  static multiply(a: Color, b: Color): Color {
    return new Color(a.r * b.r, a.g * b.g, a.b * b.b, a.a * b.a);
  }

  static fromArray(arr: readonly number[]): Color {
    if (arr.length < 3) throw new Error('Array must have at least 3 elements');
    return new Color(arr[0]!, arr[1]!, arr[2]!, arr[3] ?? 1);
  }

  lerp(other: Color, t: number): Color {
    return Color.lerp(this, other, t);
  }

  multiply(other: Color): Color {
    return Color.multiply(this, other);
  }

  toHex(): number {
    return (
      (Math.round(this.r * 255) << 16) |
      (Math.round(this.g * 255) << 8) |
      Math.round(this.b * 255)
    );
  }

  toHexString(includeAlpha = false): string {
    const toHexChannel = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0');
    let str = `#${toHexChannel(this.r)}${toHexChannel(this.g)}${toHexChannel(this.b)}`;
    if (includeAlpha) str += toHexChannel(this.a);
    return str;
  }

  toRGBA(): [number, number, number, number] {
    return [this.r, this.g, this.b, this.a];
  }

  toArray(): [number, number, number, number] {
    return [this.r, this.g, this.b, this.a];
  }

  equals(other: Color, epsilon = 1e-6): boolean {
    return (
      Math.abs(this.r - other.r) < epsilon &&
      Math.abs(this.g - other.g) < epsilon &&
      Math.abs(this.b - other.b) < epsilon &&
      Math.abs(this.a - other.a) < epsilon
    );
  }

  clone(): Color {
    return new Color(this.r, this.g, this.b, this.a);
  }
}
