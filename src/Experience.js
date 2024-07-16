import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import fragmentShader from './shaders/fragmentShader.glsl';
import vertexShader from './shaders/vertexShader.glsl';

export default class Experience {
  constructor(container) {
    this.container = container;
    this.width = container.offsetWidth;
    this.height = container.offsetHeight;
    this.mouse = new THREE.Vector2();

    this.resize = () => this.onResize();
    this.mousemove = (e) => this.onMousemove(e);
  }

  init() {
    this.createScene();
    this.createCamera();
    this.createRenderer();
    this.createControls();
    this.createMesh();
    this.createClock();

    this.addListeners();

    this.renderer.setAnimationLoop(() => {
      this.render();
      this.update();
    });
  }

  createScene() {
    this.scene = new THREE.Scene();
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.width / this.height,
      0.1,
      1000
    );
    this.camera.position.z = 2;
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    this.container.appendChild(this.renderer.domElement);

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  createControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
  }

  createMesh() {
    this.geometry = new THREE.BoxGeometry(1, 1, 1);
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
      },
      fragmentShader,
      vertexShader,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  createClock() {
    this.clock = new THREE.Clock();
  }

  addListeners() {
    window.addEventListener('resize', this.resize);
    window.addEventListener('mousemove', this.mousemove);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  update() {
    this.controls.update();
  }

  onResize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  onMousemove(e) {
    const x = (e.clientX / this.width) * 2 - 1;
    const y = -(e.clientY / this.height) * 2 + 1;

    this.mouse.set(x, y);
  }
}
