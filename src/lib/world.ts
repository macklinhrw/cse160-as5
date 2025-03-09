import * as THREE from "three";
import { Controls } from "./controls";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";
import { Terrain } from "./terrain";
import { makeTexAtlasBoxMesh } from "./textures";

export const THREE_CANVAS_ID = "three";

export class World {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  topdownCamera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: Controls;
  terrain: Terrain;
  textureLoader: THREE.TextureLoader;
  objLoader: OBJLoader;
  mtlLoader: MTLLoader;
  // Keep track so we can cleanup
  currentAnimationFrame: number;

  // Assignment req
  cube!: THREE.Mesh;
  sphere!: THREE.Mesh;

  constructor() {
    const canvas = document.getElementById(THREE_CANVAS_ID);
    if (!canvas) {
      throw new Error("Canvas not found");
    }

    // Renderer, Scene, Camera initialization
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera();
    this.topdownCamera = new THREE.PerspectiveCamera();
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas,
      alpha: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.textureLoader = new THREE.TextureLoader();
    this.objLoader = new OBJLoader();
    this.mtlLoader = new MTLLoader();

    // World generation
    this.terrain = new Terrain(this.scene, this.camera, this.textureLoader);

    // Controls
    this.controls = new Controls(
      this.scene,
      this.camera,
      this.topdownCamera,
      this.renderer,
      this.terrain
    );

    // Init functions
    this.initCamera();
    this.initScene();
    this.terrain.generateTerrain();

    // Lock handler
    canvas.addEventListener("click", (e: Event) => {
      e.preventDefault();
      this.controls.lock();
    });
    // Resize handler
    window.addEventListener("resize", () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    });

    // this.controls.setTopdown(true)

    this.currentAnimationFrame = requestAnimationFrame(this.animate.bind(this));
  }

  // Animation loop
  animate() {
    // Depending on the controls state, we render a different camera
    this.controls.update();
    if (this.controls.isTopdown) {
      this.renderer.render(this.scene, this.controls.topdownCamera);
    } else {
      this.renderer.render(this.scene, this.camera);
    }

    // animate cube
    this.cube.rotation.x += 0.01;
    this.cube.rotation.y += 0.01;

    this.currentAnimationFrame = requestAnimationFrame(this.animate.bind(this));
  }

  // Initialization functions
  initCamera() {
    this.camera.fov = 75;
    this.camera.near = 0.1;
    this.camera.far = 2000;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.position.set(0, 0, 5);
    this.camera.updateProjectionMatrix();

    this.topdownCamera.fov = 75;
    this.topdownCamera.near = 0.1;
    this.topdownCamera.far = 2000;
    this.topdownCamera.aspect = window.innerWidth / window.innerHeight;
    this.topdownCamera.position.set(0, 30, 0);
    this.topdownCamera.rotation.x = (-Math.PI + 0.5) / 2; // Point camera down and add slight angle
    this.topdownCamera.updateProjectionMatrix();
  }

  initScene() {
    // Lights - Directional, Ambient, and Hemispheral
    const color = 0xffffff;
    const intensity = 3;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    this.scene.add(light);

    const hemisphereLight = new THREE.HemisphereLight(0x000000, 0x080808, 0.9);
    this.scene.add(hemisphereLight);

    const ambientColor = 0xffffff;
    const ambientIntensity = 1;
    const ambientLight = new THREE.AmbientLight(ambientColor, ambientIntensity);
    this.scene.add(ambientLight);

    this.mtlLoader.load("./models/Chicken/Chicken_01.mtl", (materials) => {
      materials.preload();

      // Bug with transparency: help from AI for this (couldn't figure it out on my own)
      Object.values(materials.materials).forEach((material) => {
        if (material.opacity === 0) {
          material.opacity = 1.0;
          material.transparent = false;
        }
      });

      // Set materials to the OBJ loader
      this.objLoader.setMaterials(materials);

      // Now load the model with materials applied
      this.objLoader.load("./models/Chicken/Chicken_01.obj", (object) => {
        object.position.set(0, 4, 6);
        object.scale.set(0.01, 0.01, 0.01);
        this.scene.add(object);
      });
    });

    // Skybox
    // Credit: https://polyhaven.com/a/autumn_field_puresky
    const texture = this.textureLoader.load("./textures/skybox.jpg", () => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      texture.colorSpace = THREE.SRGBColorSpace;
      this.scene.background = texture;
    });

    // Fog
    const fogColor = 0xffffff;
    const fogDensity = 0.01;
    this.scene.fog = new THREE.FogExp2(fogColor, fogDensity);

    // Assignment reqs
    const box = makeTexAtlasBoxMesh(this.textureLoader, 8, 5);
    this.cube = new THREE.Mesh(box.geometry, box.material);
    this.cube.position.set(0, 5, 2);
    this.scene.add(this.cube);

    this.sphere = new THREE.Mesh(
      new THREE.SphereGeometry(1, 20, 20),
      new THREE.MeshPhongMaterial({ color: "red" })
    );
    this.sphere.position.set(0, 5, 4);
    this.scene.add(this.sphere);
  }

  // Cleanup
  destroy() {
    this.renderer.dispose();
    this.controls.destroy();

    // Needed or else lots of WebGL warnings/breakage
    cancelAnimationFrame(this.currentAnimationFrame);
  }
}
