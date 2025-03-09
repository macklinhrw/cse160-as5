import * as THREE from "three";
import { Terrain } from "./terrain";

// Help from both the picking tutorial on threejs website and
// https://github.com/vyse12138/minecraft-threejs/blob/main/src/terrain/highlight/index.ts

export class PickHelper {
  raycaster: THREE.Raycaster;
  geometry = new THREE.BoxGeometry(1.001, 1.001, 1.001);
  material = new THREE.MeshStandardMaterial({
    transparent: true,
    opacity: 0.25,
  });
  mesh: THREE.Mesh = new THREE.Mesh(new THREE.BoxGeometry(), this.material);

  constructor() {
    this.raycaster = new THREE.Raycaster();
  }

  pick(scene: THREE.Scene, terrain: Terrain, camera: THREE.Camera) {
    scene.remove(this.mesh);

    // cast a ray through the frustum
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    // get the list of objects the ray intersected
    const block = this.raycaster.intersectObjects(terrain.blocks)[0];

    if (
      block &&
      block.object instanceof THREE.InstancedMesh &&
      typeof block.instanceId === "number"
    ) {
      this.mesh = new THREE.Mesh(this.geometry, this.material);
      const matrix = new THREE.Matrix4();
      block.object.getMatrixAt(block.instanceId, matrix);
      const position = new THREE.Vector3().setFromMatrixPosition(matrix);

      this.mesh.position.set(position.x, position.y, position.z);
      scene.add(this.mesh);
    }
  }
}
