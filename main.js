import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader }    from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader }   from 'three/addons/loaders/DRACOLoader.js';

const MODEL_PATH = './model/scene.gltf';

const canvas          = document.getElementById('webgl-canvas');
const loadingOverlay  = document.getElementById('loading-overlay');
const progressBar     = document.getElementById('progress-bar');
const progressText    = document.getElementById('progress-text');
const fpsCounter      = document.getElementById('fps-counter');
const modelInfo       = document.getElementById('model-info');
const controlsToggle  = document.getElementById('controls-toggle');
const controlsPanel   = document.getElementById('controls-panel');

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: 'high-performance',
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0d13);
scene.fog = new THREE.FogExp2(0x0b0d13, 0.015);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(5, 3, 8);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping  = true;
controls.dampingFactor  = 0.06;
controls.minDistance     = 0.5;
controls.maxDistance     = 100;
controls.maxPolarAngle  = Math.PI * 0.95;
controls.target.set(0, 1, 0);
controls.update();

const defaultCameraPos    = camera.position.clone();
const defaultControlTarget = controls.target.clone();

const lightsGroup = new THREE.Group();
scene.add(lightsGroup);

const ambientLight = new THREE.AmbientLight(0xc8d0e8, 0.6);
lightsGroup.add(ambientLight);

const hemiLight = new THREE.HemisphereLight(0x6c8cff, 0x2a1f3d, 0.5);
lightsGroup.add(hemiLight);

const keyLight = new THREE.DirectionalLight(0xfff4e6, 1.8);
keyLight.position.set(6, 10, 8);
keyLight.castShadow = true;
keyLight.shadow.mapSize.width  = 2048;
keyLight.shadow.mapSize.height = 2048;
keyLight.shadow.camera.near = 0.5;
keyLight.shadow.camera.far  = 50;
keyLight.shadow.camera.left   = -10;
keyLight.shadow.camera.right  =  10;
keyLight.shadow.camera.top    =  10;
keyLight.shadow.camera.bottom = -10;
keyLight.shadow.bias = -0.0005;
lightsGroup.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xa8b8ff, 0.6);
fillLight.position.set(-5, 4, -6);
lightsGroup.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xffe0c8, 0.5);
rimLight.position.set(0, 6, -10);
lightsGroup.add(rimLight);

const gridHelper = new THREE.GridHelper(30, 30, 0x1a2040, 0x1a2040);
gridHelper.material.opacity = 0.35;
gridHelper.material.transparent = true;
scene.add(gridHelper);

// Subtle ground plane to receive shadows
const groundGeo = new THREE.PlaneGeometry(60, 60);
const groundMat = new THREE.ShadowMaterial({ opacity: 0.35 });
const groundMesh = new THREE.Mesh(groundGeo, groundMat);
groundMesh.rotation.x = -Math.PI / 2;
groundMesh.receiveShadow = true;
scene.add(groundMesh);

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/libs/draco/');

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

let loadedModel = null;

loader.load(
  MODEL_PATH,

  (gltf) => {
    loadedModel = gltf.scene;

    loadedModel.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    const box = new THREE.Box3().setFromObject(loadedModel);
    const size   = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale  = 5 / maxDim;  // normalise to ~5 units

    loadedModel.scale.setScalar(scale);
    const boxScaled = new THREE.Box3().setFromObject(loadedModel);
    const centerScaled = boxScaled.getCenter(new THREE.Vector3());
    loadedModel.position.sub(centerScaled);
    loadedModel.position.y -= boxScaled.min.y;

    scene.add(loadedModel);

    const targetY = (boxScaled.max.y - boxScaled.min.y) / 2;
    controls.target.set(0, targetY * 0.5, 0);
    camera.position.set(maxDim * scale * 1.2, maxDim * scale * 0.8, maxDim * scale * 1.8);
    controls.update();

    defaultCameraPos.copy(camera.position);
    defaultControlTarget.copy(controls.target);

    let meshCount = 0;
    let triCount  = 0;
    loadedModel.traverse((c) => {
      if (c.isMesh) {
        meshCount++;
        const geo = c.geometry;
        if (geo.index) triCount += geo.index.count / 3;
        else if (geo.attributes.position) triCount += geo.attributes.position.count / 3;
      }
    });
    modelInfo.textContent = `${meshCount} meshes · ${Math.round(triCount).toLocaleString()} tris`;

    loadingOverlay.classList.add('hidden');

    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(loadedModel);
      gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
      animationMixers.push(mixer);
    }
  },

  (xhr) => {
    if (xhr.lengthComputable) {
      const pct = Math.round((xhr.loaded / xhr.total) * 100);
      progressBar.style.width = `${pct}%`;
      progressText.textContent = `${pct} %`;
    }
  },

  (error) => {
    console.error('Erro ao carregar modelo:', error);
    progressText.textContent = 'Erro ao carregar modelo!';
    progressBar.style.background = '#ff4466';
    progressBar.style.width = '100%';
    document.querySelector('.spinner').style.borderTopColor = '#ff4466';
    document.querySelector('.loader-text').textContent = 'Falha no carregamento';
  }
);

const animationMixers = [];

const clock = new THREE.Clock();
let frameCount = 0;
let fpsTime    = 0;

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  const elapsed = clock.getElapsedTime();

  for (const mixer of animationMixers) {
    mixer.update(delta);
  }

  controls.update();

  keyLight.position.x = 6 + Math.sin(elapsed * 0.2) * 2;
  keyLight.position.z = 8 + Math.cos(elapsed * 0.2) * 2;

  renderer.render(scene, camera);

  frameCount++;
  fpsTime += delta;
  if (fpsTime >= 0.5) {
    fpsCounter.textContent = `${Math.round(frameCount / fpsTime)} FPS`;
    frameCount = 0;
    fpsTime = 0;
  }
}

animate();

function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}

window.addEventListener('resize', onResize);

let wireframeOn = false;
let gridVisible = true;
let lightsOn    = true;

window.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();

  if (key === 'r') {
    camera.position.copy(defaultCameraPos);
    controls.target.copy(defaultControlTarget);
    controls.update();
  }

  if (key === 'g') {
    gridVisible = !gridVisible;
    gridHelper.visible = gridVisible;
  }

  if (key === 'w') {
    wireframeOn = !wireframeOn;
    if (loadedModel) {
      loadedModel.traverse((child) => {
        if (child.isMesh && child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((m) => (m.wireframe = wireframeOn));
        }
      });
    }
  }

  if (key === 'l') {
    lightsOn = !lightsOn;
    lightsGroup.visible = lightsOn;
  }
});

controlsToggle.addEventListener('click', () => {
  controlsPanel.classList.toggle('hidden');
});
