import { ImprovedNoise } from "three/examples/jsm/math/ImprovedNoise.js";

export class Noise {
  noiseObject: ImprovedNoise;

  constructor() {
    this.noiseObject = new ImprovedNoise();
  }

  generateNoise(x: number, y: number, z: number) {
    return this.noiseObject.noise(x, y, z);
  }
}
