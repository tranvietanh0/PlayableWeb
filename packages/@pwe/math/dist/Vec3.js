export class Vec3 {
    x;
    y;
    z;
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    static ZERO = new Vec3(0, 0, 0);
    static ONE = new Vec3(1, 1, 1);
    static UP = new Vec3(0, 1, 0);
    static RIGHT = new Vec3(1, 0, 0);
    static FORWARD = new Vec3(0, 0, 1);
    static add(a, b) {
        return new Vec3(a.x + b.x, a.y + b.y, a.z + b.z);
    }
    static sub(a, b) {
        return new Vec3(a.x - b.x, a.y - b.y, a.z - b.z);
    }
    static mul(a, s) {
        return new Vec3(a.x * s, a.y * s, a.z * s);
    }
    static div(a, s) {
        return new Vec3(a.x / s, a.y / s, a.z / s);
    }
    static dot(a, b) {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    }
    static cross(a, b) {
        return new Vec3(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
    }
    static lerp(a, b, t) {
        return new Vec3(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, a.z + (b.z - a.z) * t);
    }
    static distance(a, b) {
        return Vec3.sub(a, b).length;
    }
    static distanceSquared(a, b) {
        return Vec3.sub(a, b).lengthSquared;
    }
    static fromArray(arr) {
        if (arr.length < 3)
            throw new Error('Array must have at least 3 elements');
        return new Vec3(arr[0], arr[1], arr[2]);
    }
    add(other) {
        return Vec3.add(this, other);
    }
    sub(other) {
        return Vec3.sub(this, other);
    }
    mul(s) {
        return Vec3.mul(this, s);
    }
    div(s) {
        return Vec3.div(this, s);
    }
    dot(other) {
        return Vec3.dot(this, other);
    }
    cross(other) {
        return Vec3.cross(this, other);
    }
    lerp(other, t) {
        return Vec3.lerp(this, other, t);
    }
    get length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
    get lengthSquared() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }
    normalize() {
        const len = this.length;
        if (len === 0)
            return Vec3.ZERO;
        return this.div(len);
    }
    negate() {
        return new Vec3(-this.x, -this.y, -this.z);
    }
    equals(other, epsilon = 1e-6) {
        return (Math.abs(this.x - other.x) < epsilon &&
            Math.abs(this.y - other.y) < epsilon &&
            Math.abs(this.z - other.z) < epsilon);
    }
    toArray() {
        return [this.x, this.y, this.z];
    }
    clone() {
        return new Vec3(this.x, this.y, this.z);
    }
}
//# sourceMappingURL=Vec3.js.map