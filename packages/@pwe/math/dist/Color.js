export class Color {
    r;
    g;
    b;
    a;
    constructor(r, g, b, a = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    static WHITE = new Color(1, 1, 1, 1);
    static BLACK = new Color(0, 0, 0, 1);
    static RED = new Color(1, 0, 0, 1);
    static GREEN = new Color(0, 1, 0, 1);
    static BLUE = new Color(0, 0, 1, 1);
    static TRANSPARENT = new Color(0, 0, 0, 0);
    static fromHex(hex, alpha = 1) {
        const r = ((hex >> 16) & 0xff) / 255;
        const g = ((hex >> 8) & 0xff) / 255;
        const b = (hex & 0xff) / 255;
        return new Color(r, g, b, alpha);
    }
    static fromHexString(hex) {
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
    static lerp(a, b, t) {
        return new Color(a.r + (b.r - a.r) * t, a.g + (b.g - a.g) * t, a.b + (b.b - a.b) * t, a.a + (b.a - a.a) * t);
    }
    static multiply(a, b) {
        return new Color(a.r * b.r, a.g * b.g, a.b * b.b, a.a * b.a);
    }
    static fromArray(arr) {
        if (arr.length < 3)
            throw new Error('Array must have at least 3 elements');
        return new Color(arr[0], arr[1], arr[2], arr[3] ?? 1);
    }
    lerp(other, t) {
        return Color.lerp(this, other, t);
    }
    multiply(other) {
        return Color.multiply(this, other);
    }
    toHex() {
        return ((Math.round(this.r * 255) << 16) |
            (Math.round(this.g * 255) << 8) |
            Math.round(this.b * 255));
    }
    toHexString(includeAlpha = false) {
        const toHexChannel = (v) => Math.round(v * 255).toString(16).padStart(2, '0');
        let str = `#${toHexChannel(this.r)}${toHexChannel(this.g)}${toHexChannel(this.b)}`;
        if (includeAlpha)
            str += toHexChannel(this.a);
        return str;
    }
    toRGBA() {
        return [this.r, this.g, this.b, this.a];
    }
    toArray() {
        return [this.r, this.g, this.b, this.a];
    }
    equals(other, epsilon = 1e-6) {
        return (Math.abs(this.r - other.r) < epsilon &&
            Math.abs(this.g - other.g) < epsilon &&
            Math.abs(this.b - other.b) < epsilon &&
            Math.abs(this.a - other.a) < epsilon);
    }
    clone() {
        return new Color(this.r, this.g, this.b, this.a);
    }
}
//# sourceMappingURL=Color.js.map