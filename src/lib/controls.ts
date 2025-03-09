import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { PickHelper } from "./pick";
import { Terrain } from "./terrain";

// Help from: https://github.com/vyse12138/minecraft-threejs/blob/main/src/control/index.ts#L279
// and: https://threejs.org/docs/#examples/en/controls/PointerLockControls

export class Controls {
  // General state
  scene: THREE.Scene;
  terrain: Terrain;
  pointerLockControls: PointerLockControls;
  camera: THREE.Camera;
  topdownCamera: THREE.Camera;
  renderer: THREE.WebGLRenderer;

  // Timing varables
  p1: number;
  p2: number;

  // Controls state
  isMouseHolding = false;
  velocity = new THREE.Vector3(0, 0, 0);
  speed = 8;
  isTopdown = false;
  topdownSpeedMultiplier = 5;

  // Picking
  pickPosition = { x: 0, y: 0 };
  pickHelper: PickHelper;

  // Event handlers
  boundMouseDown: (e: MouseEvent) => void;
  boundMouseUp: (e: MouseEvent) => void;
  boundKeyDown: (e: KeyboardEvent) => void;
  boundKeyUp: (e: KeyboardEvent) => void;
  boundPointerLockChange: (e: Event) => void;
  boundMouseMove: (e: MouseEvent) => void;
  boundMouseOut: (e: MouseEvent) => void;
  boundMouseLeave: (e: MouseEvent) => void;

  constructor(
    scene: THREE.Scene,
    camera: THREE.Camera,
    topdownCamera: THREE.Camera,
    renderer: THREE.WebGLRenderer,
    terrain: Terrain
  ) {
    this.scene = scene;
    this.camera = camera;
    this.topdownCamera = topdownCamera;
    this.renderer = renderer;
    this.terrain = terrain;

    this.pointerLockControls = new PointerLockControls(
      camera,
      renderer.domElement
    );

    this.pickHelper = new PickHelper();

    // Init time for delta
    this.p1 = performance.now();
    this.p2 = performance.now();

    // Event handlers
    // Need to bind these here or else they will be recreated each click
    this.boundMouseDown = this.onMouseDown.bind(this);
    this.boundMouseUp = this.onMouseUp.bind(this);
    this.boundKeyDown = this.onKeyDown.bind(this);
    this.boundKeyUp = this.onKeyUp.bind(this);
    this.boundPointerLockChange = this.onPointerLockChange.bind(this);
    this.boundMouseMove = this.setPickPosition.bind(this);
    this.boundMouseOut = this.clearPickPosition.bind(this);
    this.boundMouseLeave = this.clearPickPosition.bind(this);

    // The binding of all the event listeners happens inside here
    document.addEventListener("pointerlockchange", this.boundPointerLockChange);
  }

  update() {
    this.p1 = performance.now();
    const delta = (this.p1 - this.p2) / 1000;

    // Main updates body
    this.pointerLockControls.update(delta);

    // Movement
    if (!this.isTopdown) {
      this.pointerLockControls.moveForward(this.velocity.z * delta);
      this.pointerLockControls.moveRight(this.velocity.x * delta);
      this.camera.position.y += this.velocity.y * delta;
    } else {
      this.topdownCamera.position.x +=
        this.velocity.x * delta * this.topdownSpeedMultiplier;
      this.topdownCamera.position.y +=
        this.velocity.y * delta * this.topdownSpeedMultiplier;
      this.topdownCamera.position.z +=
        -this.velocity.z * delta * this.topdownSpeedMultiplier;
    }

    // Picking
    this.pickHelper.pick(this.scene, this.terrain, this.camera);

    this.p2 = this.p1;
  }

  // Utility functions
  lock() {
    this.pointerLockControls.lock();
  }

  unlock() {
    this.pointerLockControls.unlock();
  }

  // Event handlers
  onPointerLockChange() {
    if (document.pointerLockElement) {
      document.body.addEventListener("mousedown", this.boundMouseDown);
      document.body.addEventListener("mouseup", this.boundMouseUp);
      document.body.addEventListener("keydown", this.boundKeyDown);
      document.body.addEventListener("keyup", this.boundKeyUp);
      document.body.addEventListener("mousemove", this.boundMouseMove);
      document.body.addEventListener("mouseout", this.boundMouseOut);
      document.body.addEventListener("mouseleave", this.boundMouseLeave);
    } else {
      document.body.removeEventListener("mousedown", this.boundMouseDown);
      document.body.removeEventListener("mouseup", this.boundMouseUp);
      document.body.removeEventListener("keydown", this.boundKeyDown);
      document.body.removeEventListener("keyup", this.boundKeyUp);
      document.body.removeEventListener("mousemove", this.boundMouseMove);
      document.body.removeEventListener("mouseout", this.boundMouseOut);
      document.body.removeEventListener("mouseleave", this.boundMouseLeave);
    }
  }

  onMouseDown(e: MouseEvent) {
    e.preventDefault();
    this.isMouseHolding = true;
  }

  onMouseUp(e: MouseEvent) {
    e.preventDefault();
    this.isMouseHolding = false;
  }

  onKeyDown(e: KeyboardEvent) {
    if (e.repeat) return;

    switch (e.key) {
      case "w":
      case "W":
        this.velocity.z = this.speed;
        break;
      case "s":
      case "S":
        this.velocity.z = -this.speed;
        break;
      case "a":
      case "A":
        this.velocity.x = -this.speed;
        break;
      case "d":
      case "D":
        this.velocity.x = this.speed;
        break;
      case " ":
        this.velocity.y = this.speed;
        break;
      case "Shift":
        this.velocity.y = -this.speed;
        break;
      case "t":
      case "T":
        this.toggleTopdown();
        break;
    }
  }

  onKeyUp(e: KeyboardEvent) {
    if (e.repeat) return;

    switch (e.key) {
      case "w":
      case "W":
        this.velocity.z = 0;
        break;
      case "s":
      case "S":
        this.velocity.z = 0;
        break;
      case "a":
      case "A":
        this.velocity.x = 0;
        break;
      case "d":
      case "D":
        this.velocity.x = 0;
        break;
      case " ":
        this.velocity.y = 0;
        break;
      case "Shift":
        this.velocity.y = 0;
        break;
    }
  }

  toggleTopdown() {
    this.setTopdown(!this.isTopdown);
  }

  setTopdown(isTopdown: boolean) {
    this.isTopdown = isTopdown;
    if (isTopdown) {
      this.unbindPointerLockChange();
    } else {
      this.bindPointerLockChange();
    }
  }

  // Picking
  getCanvasRelativePosition(event: MouseEvent) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    return {
      x:
        ((event.clientX - rect.left) * this.renderer.domElement.width) /
        rect.width,
      y:
        ((event.clientY - rect.top) * this.renderer.domElement.height) /
        rect.height,
    };
  }

  setPickPosition(event: MouseEvent) {
    const pos = this.getCanvasRelativePosition(event);
    this.pickPosition.x = (pos.x / this.renderer.domElement.width) * 2 - 1;
    this.pickPosition.y = (pos.y / this.renderer.domElement.height) * -2 + 1; // note we flip Y
  }

  clearPickPosition() {
    // unlike the mouse which always has a position
    // if the user stops touching the screen we want
    // to stop picking. For now we just pick a value
    // unlikely to pick something
    this.pickPosition.x = -100000;
    this.pickPosition.y = -100000;
  }

  // Pointer lock change event
  unbindPointerLockChange() {
    document.removeEventListener(
      "pointerlockchange",
      this.boundPointerLockChange
    );
  }

  bindPointerLockChange() {
    document.addEventListener("pointerlockchange", this.boundPointerLockChange);
  }

  // Cleanup
  destroy() {
    // Event listeners
    this.unbindPointerLockChange();
    document.body.removeEventListener("mousedown", this.boundMouseDown);
    document.body.removeEventListener("mouseup", this.boundMouseUp);
    document.body.removeEventListener("keydown", this.boundKeyDown);
    document.body.removeEventListener("keyup", this.boundKeyUp);

    // Other
    this.pointerLockControls.dispose();
  }
}
