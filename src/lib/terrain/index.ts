import * as THREE from "three";
import { makeTexAtlasBoxMesh } from "../textures";
import { Noise } from "../noise";

// Guided by: https://github.com/vyse12138/minecraft-threejs/blob/main/src/terrain/index.ts
// i.e., mesh instancing, offloading to Web Workers, and a starting place for noise parameters

export class Terrain {
  scene: THREE.Scene;
  camera: THREE.Camera;
  textureLoader: THREE.TextureLoader;

  // Generation state
  chunk = new THREE.Vector2(0, 0);
  blocks: THREE.InstancedMesh[] = [];
  chunkSize = 16; // x by z
  chunkHeight = 16; // y
  // Positioning matrix
  matrix = new THREE.Matrix4();
  noiseObject = new Noise();

  constructor(
    scene: THREE.Scene,
    camera: THREE.Camera,
    textureLoader: THREE.TextureLoader
  ) {
    this.scene = scene;
    this.camera = camera;
    this.textureLoader = textureLoader;
  }

  generateTerrain() {
    // Dirt: 8,5
    // Stone: 19, 6
    const numChunks = 100;
    const atlasBlock = makeTexAtlasBoxMesh(this.textureLoader, 19, 6);
    const block = new THREE.InstancedMesh(
      atlasBlock.geometry,
      atlasBlock.material,
      this.chunkSize * this.chunkSize * numChunks
    );
    this.blocks.push(block);
    this.scene.add(block);

    const mapHeight = Math.floor(Math.sqrt(numChunks));
    const center = new THREE.Vector3(
      (-this.chunkSize * mapHeight) / 2,
      0,
      (-this.chunkSize * mapHeight) / 2
    );

    let i = 0; // index into the instanced mesh, max at num blocks in all chunks
    for (let chunk = 0; chunk < numChunks; chunk++) {
      for (let xIdx = 0; xIdx < this.chunkSize; xIdx++) {
        for (let zIdx = 0; zIdx < this.chunkSize; zIdx++) {
          const xOffset = (chunk % mapHeight) * this.chunkSize;
          const zOffset = Math.floor(chunk / mapHeight) * this.chunkSize;

          const x = xOffset + xIdx + center.x;
          const z = zOffset + zIdx + center.z;

          const y = 0;
          const yOffset = Math.floor(
            this.noiseObject.generateNoise(x / 22, z / 22, Math.random() / 10) *
              12
          );

          this.matrix.setPosition(x, y + yOffset, z);
          this.blocks[0].setMatrixAt(i++, this.matrix);
        }
      }
    }
  }
}
