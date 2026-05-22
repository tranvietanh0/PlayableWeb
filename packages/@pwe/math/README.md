# @pwe/math

Lightweight linear algebra library for PlayableWeb Engine.

## Installation

```bash
npm install @pwe/math
```

## API

### Vec2

```typescript
import { Vec2 } from '@pwe/math';

const a = new Vec2(1, 2);
const b = new Vec2(3, 4);
const c = a.add(b);        // Vec2(4, 6)
const d = a.mul(2);        // Vec2(2, 4)
const dot = a.dot(b);      // 11
const len = a.length;      // 2.236...
const n = a.normalize();   // unit vector
```

### Vec3

```typescript
import { Vec3 } from '@pwe/math';

const v = new Vec3(1, 2, 3);
const cross = v.cross(Vec3.UP);
const lerp = v.lerp(Vec3.ZERO, 0.5);
```

### Quat

```typescript
import { Quat, Vec3 } from '@pwe/math';

const q = Quat.fromAxisAngle(Vec3.UP, Math.PI / 2);
const rotated = q.rotateVector(new Vec3(1, 0, 0));
```

### Mat4

```typescript
import { Mat4, Vec3, Quat } from '@pwe/math';

const m = Mat4.fromTRS(
  new Vec3(1, 2, 3),
  Quat.IDENTITY,
  new Vec3(1, 1, 1)
);
const inv = m.inverse();
```

### Color

```typescript
import { Color } from '@pwe/math';

const c = Color.fromHex(0xff0000);
const lerp = Color.lerp(Color.BLACK, Color.WHITE, 0.5);
```

## Features

- Immutable operations (all methods return new instances)
- Tree-shakeable ESM exports
- Full TypeScript strict mode support
- Zero dependencies
