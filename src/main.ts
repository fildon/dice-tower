import './style.css';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';

// Scene setup
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const scene = new THREE.Scene();
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
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);
world.broadphase = new CANNON.NaiveBroadphase();

// Materials
const groundMaterial = new CANNON.Material('ground');
const diceMaterial = new CANNON.Material('dice');
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
    new THREE.MeshStandardMaterial({ color: 0x8b4513 })
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
}

// Build the dice tower
// Back wall
createTowerWall(0, 3, -2, 3, 6, 0.2);
// Left wall (upper)
createTowerWall(-1.5, 5, 0, 0.2, 2, 3);
// Right wall (upper)
createTowerWall(1.5, 5, 0, 0.2, 2, 3);
// Left wall (lower)
createTowerWall(-1.5, 2, 1.5, 0.2, 4, 1);
// Right wall (lower)
createTowerWall(1.5, 2, 1.5, 0.2, 4, 1);
// Ramp 1
createTowerWall(0.5, 4.5, 0, 2, 0.1, 2);
scene.children[scene.children.length - 1].rotation.z = -0.3;
// Ramp 2
createTowerWall(-0.5, 2.5, 1, 2, 0.1, 2);
scene.children[scene.children.length - 1].rotation.z = 0.3;

// Dice class
class Dice {
  mesh: THREE.Mesh;
  body: CANNON.Body;

  constructor(x: number, y: number, z: number) {
    const size = 0.5;
    const geometry = new THREE.BoxGeometry(size, size, size);
    const materials = [
      new THREE.MeshStandardMaterial({ color: 0xff0000 }),
      new THREE.MeshStandardMaterial({ color: 0x00ff00 }),
      new THREE.MeshStandardMaterial({ color: 0x0000ff }),
      new THREE.MeshStandardMaterial({ color: 0xffff00 }),
      new THREE.MeshStandardMaterial({ color: 0xff00ff }),
      new THREE.MeshStandardMaterial({ color: 0x00ffff }),
    ];
    this.mesh = new THREE.Mesh(geometry, materials);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    scene.add(this.mesh);

    const shape = new CANNON.Box(new CANNON.Vec3(size / 2, size / 2, size / 2));
    this.body = new CANNON.Body({
      mass: 1,
      material: diceMaterial,
      linearDamping: 0.3,
      angularDamping: 0.3,
    });
    this.body.addShape(shape);
    this.body.position.set(x, y, z);
    this.body.velocity.set(
      (Math.random() - 0.5) * 2,
      -2,
      (Math.random() - 0.5) * 2
    );
    this.body.angularVelocity.set(
      Math.random() * 10,
      Math.random() * 10,
      Math.random() * 10
    );
    world.addBody(this.body);
  }

  update() {
    this.mesh.position.copy(this.body.position as any);
    this.mesh.quaternion.copy(this.body.quaternion as any);
  }
}

const diceList: Dice[] = [];

// Roll button
const rollButton = document.getElementById('rollButton') as HTMLButtonElement;
rollButton.addEventListener('click', () => {
  // Clear old dice
  diceList.forEach((dice) => {
    scene.remove(dice.mesh);
    world.removeBody(dice.body);
  });
  diceList.length = 0;

  // Add new dice at the top of the tower
  const dice = new Dice(0, 8, -1.5);
  diceList.push(dice);
});

// Animation loop
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);

  const deltaTime = Math.min(clock.getDelta(), 0.1);
  world.step(1 / 60, deltaTime, 3);

  diceList.forEach((dice) => dice.update());

  renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

