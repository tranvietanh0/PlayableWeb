import { Vec2, Color } from '@pwe/math';

export class Transform2D {
  position = Vec2.ZERO;
  rotation = 0;
  scale = Vec2.ONE;
}

export class SpriteRenderer {
  texture: string = '';
  tint = new Color(1, 1, 1, 1);
  opacity = 1;
  flipX = false;
  flipY = false;
}
