export class Vec2 {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    static ZERO = new Vec2(0, 0);
    static ONE = new Vec2(1, 1);
    static UP = new Vec2(0, 1);
    static RIGHT = new Vec2(1, 0);
    static add(a, b) {
        return new Vec2(a.x + b.x, a.y + b.y);
    }
    static sub(a, b) {
        return new Vec2(a.x - b.x, a.y - b.y);
    }
    static mul(a, s) {
        return new Vec2(a.x * s, a.y * s);
    }
    static div(a, s) {
        return new Vec2(a.x / s, a.y / s);
    }
    static dot(a, b) {
        return a.x * b.x + a.y * b.y;
    }
    static cross(a, b) {
        return a.x * b.y - a.y * b.x;
    }
    static lerp(a, b, t) {
        return new Vec2(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
    }
    static distance(a, b) {
        return Vec2.sub(a, b).length;
    }
    static distanceSquared(a, b) {
        return Vec2.sub(a, b).lengthSquared;
    }
    static fromArray(arr) {
        if (arr.length < 2)
            throw new Error('Array must have at least 2 elements');
        return new Vec2(arr[0], arr[1]);
    }
    add(other) {
        return Vec2.add(this, other);
    }
    sub(other) {
        return Vec2.sub(this, other);
    }
    mul(s) {
        return Vec2.mul(this, s);
    }
    div(s) {
        return Vec2.div(this, s);
    }
    dot(other) {
        return Vec2.dot(this, other);
    }
    cross(other) {
        return Vec2.cross(this, other);
    }
    lerp(other, t) {
        return Vec2.lerp(this, other, t);
    }
    get length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    get lengthSquared() {
        return this.x * this.x + this.y * this.y;
    }
    normalize() {
        const len = this.length;
        if (len === 0)
            return Vec2.ZERO;
        return this.div(len);
    }
    negate() {
        return new Vec2(-this.x, -this.y);
    }
    equals(other, epsilon = 1e-6) {
        return Math.abs(this.x - other.x) < epsilon && Math.abs(this.y - other.y) < epsilon;
    }
    toArray() {
        return [this.x, this.y];
    }
    clone() {
        return new Vec2(this.x, this.y);
    }
}
//# sourceMappingURL=Vec2.js.map