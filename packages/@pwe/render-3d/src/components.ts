import { Vec3, Color } from '@pwe/math';

export class Transform {
  position = Vec3.ZERO;
  rotation = Vec3.ZERO;
  scale = Vec3.ONE;
}

export class MeshRenderer {
  geometry: 'box' | 'sphere' | 'plane' = 'box';
  color = new Color(1, 1, 1, 1);
}

export class Camera {
  fov = 75;
  near = 0.1;
  far = 1000;
}

export class Light {
  intensity = 1;
  color = new Color(1, 1, 1, 1);
}
