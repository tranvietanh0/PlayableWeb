export declare class Color {
    readonly r: number;
    readonly g: number;
    readonly b: number;
    readonly a: number;
    constructor(r: number, g: number, b: number, a?: number);
    static readonly WHITE: Color;
    static readonly BLACK: Color;
    static readonly RED: Color;
    static readonly GREEN: Color;
    static readonly BLUE: Color;
    static readonly TRANSPARENT: Color;
    static fromHex(hex: number, alpha?: number): Color;
    static fromHexString(hex: string): Color;
    static lerp(a: Color, b: Color, t: number): Color;
    static multiply(a: Color, b: Color): Color;
    static fromArray(arr: readonly number[]): Color;
    lerp(other: Color, t: number): Color;
    multiply(other: Color): Color;
    toHex(): number;
    toHexString(includeAlpha?: boolean): string;
    toRGBA(): [number, number, number, number];
    toArray(): [number, number, number, number];
    equals(other: Color, epsilon?: number): boolean;
    clone(): Color;
}
//# sourceMappingURL=Color.d.ts.map