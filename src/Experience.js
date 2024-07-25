import * as THREE from 'three';
import {
  GLTFLoader,
  OrbitControls,
  DRACOLoader,
} from 'three/examples/jsm/Addons.js';
import * as dat from 'lil-gui';

export default class Experience {
  constructor(container) {
    this.container = container;
    this.width = container.offsetWidth;
    this.height = container.offsetHeight;
    this.mouse = new THREE.Vector2();

    this.root = null;

    this.resize = () => this.onResize();
    this.mousemove = (e) => this.onMousemove(e);
  }

  init() {
    this.createScene();
    this.createCamera();
    this.createRenderer();
    this.createLights();
    this.createControls();
    this.createClock();
    this.createMesh();
    this.addGUI();

    this.addListeners();

    this.loadModel().then(() => {
      this.renderer.setAnimationLoop(() => {
        this.render();
        this.update();
      });
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
    this.camera.position.set(2, 1.5, 2);
  }

  createLights() {
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 4);
    this.directionalLight.position.set(0.99, 7.05, 10);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.camera.far = 25;
    this.directionalLight.shadow.camera.near = 1;
    this.directionalLight.shadow.mapSize.set(1024, 1024);
    this.directionalLight.shadow.normalBias = 0.05;
    this.directionalLight.shadow.intensity = 0.3;

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.84);
    this.ambientLight.position.set(-1, 1, 1);

    this.spotLight = new THREE.SpotLight(0xffffff);
    this.spotLight.position.set(1, 0.2, 2);

    this.spotLight.castShadow = true;

    this.spotLight.shadow.mapSize.width = 1024;
    this.spotLight.shadow.mapSize.height = 1024;

    this.spotLight.shadow.camera.near = 500;
    this.spotLight.shadow.camera.far = 4000;
    this.spotLight.shadow.camera.fov = 30;

    this.scene.add(this.directionalLight, this.ambientLight, this.spotLight);
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    this.container.appendChild(this.renderer.domElement);

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor('#E8EDFF');

    this.renderer.shadowMap.enabled = true;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.useLegacyLights = true;
  }

  createControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
  }

  createMesh() {
    this.geometry = new THREE.PlaneGeometry(this.width, this.height, 100, 100);

    this.material = new THREE.MeshStandardMaterial({
      color: '#E8EDFF',
      emissive: '#8c8fff',
      transparent: true,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.rotation.x = -1.86;
    this.mesh.rotation.y = -0.204;
    this.mesh.position.y = -0.44;
    this.mesh.position.z = -0.4;
    this.mesh.receiveShadow = true;

    this.scene.add(this.mesh);
  }

  createClock() {
    this.clock = new THREE.Clock();
  }

  updateAllMaterials() {
    this.scene.traverse((child) => {
      if (
        child instanceof THREE.Mesh &&
        child.material instanceof THREE.MeshStandardMaterial
      ) {
        child.castShadow = true;
        child.receiveShadow = true;

        child.material.needsUpdate = true;
      }
    });
  }

  loadModel() {
    const gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('./draco');

    gltfLoader.setDRACOLoader(dracoLoader);

    return new Promise((resolve) => {
      gltfLoader.load('/src/models/model.glb', (gltf) => {
        gltf.scene.scale.set(0.125, 0.125, 0.125);
        gltf.scene.position.set(0.438, -0.225, 0);
        gltf.scene.rotation.set(-0.334, 0.207, 0.207);
        gltf.scene.castShadow = true;
        gltf.scene.receiveShadow = true;

        this.root = gltf.scene;

        this.scene.add(gltf.scene);

        const childrenArrayForChangeMetalness = [
          gltf.scene.children[0],
          gltf.scene.children[1],
          gltf.scene.children[2],
          gltf.scene.children[17],
          gltf.scene.children[18],
          gltf.scene.children[19],
          gltf.scene.children[20],
        ];

        const childrenArrayForChangeColor = [
          gltf.scene.children[3],
          gltf.scene.children[4],
          gltf.scene.children[9],
          gltf.scene.children[10],
          gltf.scene.children[15],
          gltf.scene.children[16],
          gltf.scene.children[19],
          gltf.scene.children[20],
        ];

        childrenArrayForChangeMetalness.forEach(
          (child) => (child.material.metalness = 0.2)
        );

        childrenArrayForChangeColor.forEach((child) =>
          child.material.color.set(0.2, 0.3, 1)
        );

        gltf.scene.children[17].position.z = 3.69;

        this.gui
          .add(gltf.scene.children[17].material, 'metalness')
          .min(0)
          .max(1)
          .step(0.001)
          .name('metalness');

        this.gui
          .add(gltf.scene.children[17].material, 'roughness')
          .min(0)
          .max(1)
          .step(0.001)
          .name('roughness');

        this.gui
          .add(gltf.scene.rotation, 'x')
          .min(-Math.PI)
          .max(Math.PI)
          .step(0.001)
          .name('rotationX');

        this.gui
          .add(gltf.scene.rotation, 'y')
          .min(-Math.PI)
          .max(Math.PI)
          .step(0.001)
          .name('rotationY');

        this.gui
          .add(gltf.scene.rotation, 'z')
          .min(-Math.PI)
          .max(Math.PI)
          .step(0.001)
          .name('rotationZ');

        this.gui
          .add(gltf.scene.position, 'y')
          .min(-5)
          .max(5)
          .step(0.001)
          .name('meshPositionY');

        this.updateAllMaterials();
      });

      resolve();
    });
  }

  addListeners() {
    window.addEventListener('resize', this.resize);
    window.addEventListener('mousemove', this.mousemove);
  }

  render() {
    const elapsedTime = this.clock.getElapsedTime();
    this.renderer.render(this.scene, this.camera);

    if (this.root) {
      this.root.children[4].rotation.z = elapsedTime * 0.5;
      this.root.children[6].rotation.z = -elapsedTime * 0.5;
      this.root.children[7].rotation.z = -elapsedTime * 0.5;
    }
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

  addGUI() {
    this.gui = new dat.GUI();
    this.gui.open(false);
    this.gui.hide();

    this.gui
      .add(this.mesh.position, 'y')
      .min(-15)
      .max(15)
      .step(0.01)
      .name('positionY');

    this.gui
      .add(this.mesh.position, 'z')
      .min(-15)
      .max(15)
      .step(0.01)
      .name('positionZ');

    this.gui
      .add(this.mesh.rotation, 'x')
      .min(-Math.PI)
      .max(Math.PI)
      .step(0.01)
      .name('rotationPlaneX');

    this.gui
      .add(this.mesh.rotation, 'y')
      .min(-Math.PI)
      .max(Math.PI)
      .step(0.01)
      .name('rotationPlaneY');

    this.gui
      .add(this.directionalLight.position, 'x')
      .min(-45)
      .max(45)
      .step(0.01)
      .name('lightX');

    this.gui
      .add(this.directionalLight.position, 'y')
      .min(-40)
      .max(40)
      .step(0.01)
      .name('lightY');

    this.gui
      .add(this.directionalLight.position, 'z')
      .min(-40)
      .max(40)
      .step(0.01)
      .name('lightZ');

    this.gui
      .addColor(this.material, 'color')
      .name('color')
      .onChange(() => {
        this.material.needsUpdate = true;
      });

    this.gui
      .addColor(this.material, 'emissive')
      .name('colorEm')
      .onChange(() => {
        this.material.needsUpdate = true;
      });
  }
}
