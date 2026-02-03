import './style.css';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Dice } from './Dice';

// Scene setup
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);

// Camera setup
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(5, 8, 10);
camera.lookAt(0, 0, 0);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Camera controls
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 3, 0); // Center on the tower
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 5;
controls.maxDistance = 30;
controls.maxPolarAngle = Math.PI / 2; // Prevent camera from going below ground

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;
scene.add(directionalLight);

// Physics world
export const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);
world.broadphase = new CANNON.NaiveBroadphase();

// Materials
const groundMaterial = new CANNON.Material('ground');
export const diceMaterial = new CANNON.Material('dice');
const contactMaterial = new CANNON.ContactMaterial(groundMaterial, diceMaterial, {
  friction: 0.3,
  restitution: 0.3,
});
world.addContactMaterial(contactMaterial);

// Ground
const groundGeometry = new THREE.PlaneGeometry(20, 20);
const groundMesh = new THREE.Mesh(
  groundGeometry,
  new THREE.MeshStandardMaterial({ color: 0x333333 })
);
groundMesh.rotation.x = -Math.PI / 2;
groundMesh.receiveShadow = true;
scene.add(groundMesh);

const groundShape = new CANNON.Plane();
const groundBody = new CANNON.Body({ mass: 0, material: groundMaterial });
groundBody.addShape(groundShape);
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(groundBody);

// Dice tower structure
function createTowerWall(
  x: number,
  y: number,
  z: number,
  width: number,
  height: number,
  depth: number
) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({ 
      color: 0x8b4513,
      transparent: true,
      opacity: 0.6
    })
  );
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);

  const shape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
  const body = new CANNON.Body({ mass: 0, material: groundMaterial });
  body.addShape(shape);
  body.position.set(x, y, z);
  world.addBody(body);

  return { mesh, body };
}

// Build the dice tower
const towerWidth = 3;
const towerDepth = 3;
const towerHeight = 8;
const wallThickness = 0.15;

// Back wall (full height)
createTowerWall(0, towerHeight / 2, -towerDepth / 2, towerWidth, towerHeight, wallThickness);

// Left wall (full height)
createTowerWall(-towerWidth / 2, towerHeight / 2, 0, wallThickness, towerHeight, towerDepth);

// Right wall (full height)
createTowerWall(towerWidth / 2, towerHeight / 2, 0, wallThickness, towerHeight, towerDepth);

// Front wall with gap at bottom (upper portion only)
const frontWallHeight = towerHeight - 2; // Leave 2 units gap at bottom
const frontWallYPos = 2 + frontWallHeight / 2; // Start 2 units up from ground
createTowerWall(0, frontWallYPos, towerDepth / 2, towerWidth, frontWallHeight, wallThickness);

// Internal obstacle walls (rotating to jostle the dice)
const rotatingObstacles: Array<{ mesh: THREE.Mesh; body: CANNON.Body; speed: number; axis: 'x' | 'y' | 'z' }> = [];

// Upper obstacle - rotates around Y axis
const obstacle1 = createTowerWall(0.3, 6, -0.3, 1, wallThickness, 1.5);
obstacle1.mesh.rotation.z = -0.3;
obstacle1.body.quaternion.setFromEuler(0, 0, -0.3);
rotatingObstacles.push({ ...obstacle1, speed: 0.5, axis: 'y' });

// Middle obstacle - rotates around Y axis (opposite direction)
const obstacle2 = createTowerWall(-0.3, 4, 0.3, 1, wallThickness, 1.5);
obstacle2.mesh.rotation.z = 0.3;
obstacle2.body.quaternion.setFromEuler(0, 0, 0.3);
rotatingObstacles.push({ ...obstacle2, speed: -0.7, axis: 'y' });

// Lower obstacle - rotates around Y axis
const obstacle3 = createTowerWall(0.2, 2, -0.2, 1, wallThickness, 1.2);
obstacle3.mesh.rotation.z = -0.3;
obstacle3.body.quaternion.setFromEuler(0, 0, -0.3);
rotatingObstacles.push({ ...obstacle3, speed: 0.6, axis: 'y' });

const diceList: Dice[] = [];

// Result display
const resultDisplay = document.getElementById('result') as HTMLDivElement;

// Roll button
const rollButton = document.getElementById('rollButton') as HTMLButtonElement;
rollButton.addEventListener('click', () => {
  // Clear result display
  resultDisplay.textContent = '';
  
  // Clear old dice
  diceList.forEach((dice) => {
    scene.remove(dice.mesh);
    world.removeBody(dice.body);
  });
  diceList.length = 0;

  // Add new dice at the top of the tower (centered, near the back)
  const dice = new Dice(0, 7.5, -0.5, scene, world, diceMaterial);
  diceList.push(dice);
});

// Animation loop
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);

  const deltaTime = Math.min(clock.getDelta(), 0.1);
  world.step(1 / 60, deltaTime, 3);

  // Update rotating obstacles
  rotatingObstacles.forEach((obstacle) => {
    obstacle.mesh.rotation[obstacle.axis] += obstacle.speed * deltaTime;
    obstacle.body.quaternion.copy(obstacle.mesh.quaternion as any);
  });

  diceList.forEach((dice) => {
    const result = dice.update();
    if (result !== null) {
      resultDisplay.textContent = `You rolled: ${result}`;
    }
  });

  controls.update();
  renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

