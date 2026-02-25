import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.160/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.160/examples/jsm/loaders/GLTFLoader.js";

const container = document.getElementById('canvasWrap');
const showAllBtn = document.getElementById('showAll');
const toggleDoorBtn = document.getElementById("toggleDoor");

/* ================= RENDERER ================= */
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputEncoding = THREE.sRGBEncoding;
container.appendChild(renderer.domElement);

/* ================= SCENE ================= */
const scene = new THREE.Scene();

/* ================= BACKGROUND ================= */
new THREE.TextureLoader().load('./panaroma.jpg', tex => {
  tex.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = tex;
});

/* ================= CAMERA ================= */
const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 2000);
camera.position.set(0, 16, 50);

/* ================= CONTROLS ================= */
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.5, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxDistance = 30;
controls.update();

/* ================= LIGHTS ================= */
scene.add(new THREE.AmbientLight(0xffffff, 1.5));

const pointLight = new THREE.PointLight(0xffffff, 2, 30);
pointLight.position.set(0, 12, 0);
scene.add(pointLight);

scene.add(new THREE.DirectionalLight(0xffffff, 3));

/* ================= GROUND ================= */
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshStandardMaterial({ color: 0x769568 })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

/* ================= LOADER ================= */
const loader = new GLTFLoader();

/* ================= MODELS ================= */
let gerModel = null;
let doorClosed = null;
let doorOpen = null;
let isDoorOpen = false;

/* ================= FADE ANIMATION ================= */
let animProgress = 0;
let animDirection = 0; // 1 = open, -1 = close
const animSpeed = 0.04;

/* ================= HOTSPOT ================= */
const hotspot = new THREE.Mesh(
  new THREE.SphereGeometry(0.3, 12, 12),
  new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0x550000 })
);
hotspot.position.set(1.4, 5.8, 13);
scene.add(hotspot);

/* ================= RAYCASTER ================= */
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

/* ================= LOAD GER (STATIC) ================= 
loader.load(
  "ger.glb",
  (gltf) => {
    console.log("MODEL LOADED");
    scene.add(gltf.scene);
  },
  undefined,
  (err) => {
    console.error("MODEL ERROR", err);
  }
);*/

/* ================= LOAD CLOSED DOOR ================= */
loader.load('haalga1.glb', gltf => {
  doorClosed = gltf.scene;
  scene.add(doorClosed);

  doorClosed.traverse(o => {
    if (o.isMesh) {
      o.material.side = THREE.DoubleSide;
      o.material.transparent = true;
      o.material.opacity = 1;
    }
  });
});




/* ================= CAMERA FIT ================= */
function fitCameraToObject(object) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3()).length();
  const center = box.getCenter(new THREE.Vector3());

  camera.position.copy(center);
  camera.position.z += size * 1.2;
  camera.position.y += size * 0.3;

  controls.target.copy(center);
  controls.update();
}

showAllBtn.addEventListener("click", () => {
  if (gerModel) fitCameraToObject(gerModel);
});

/* ================= RESIZE ================= */
window.addEventListener("resize", () => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});

/* ================= LOOP ================= */
function animate() {
  requestAnimationFrame(animate);

  if (animDirection !== 0 && doorClosed && doorOpen) {
    animProgress += animSpeed * animDirection;
    animProgress = THREE.MathUtils.clamp(animProgress, 0, 1);

    doorClosed.traverse(o => o.isMesh && (o.material.opacity = 1 - animProgress));
    doorOpen.traverse(o => o.isMesh && (o.material.opacity = animProgress));

    if (animProgress === 1 && animDirection === 1) {
      doorClosed.visible = false;
      animDirection = 0;
    }

    if (animProgress === 0 && animDirection === -1) {
      doorOpen.visible = false;
      doorClosed.visible = true;
      animDirection = 0;
    }
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();




