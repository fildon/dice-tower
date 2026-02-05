import './style.css';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Dice } from './Dice';
import { TowerBuilder } from './TowerBuilder';
import { HistoryManager } from './HistoryManager';
import { setupCamera, setupControls, setupLighting, setupRenderer, setupGround } from './utils/scene-setup';
import { type DiceType } from './types';
import { PHYSICS, SCENE, ANIMATION, DICE_SPAWN } from './constants';

// Scene setup
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
export const scene = new THREE.Scene();
scene.background = new THREE.Color(SCENE.BACKGROUND_COLOR);

// Camera setup
const camera = setupCamera(window.innerWidth / window.innerHeight);

// Renderer setup
const renderer = setupRenderer(canvas);

// Camera controls
const controls = setupControls(camera, canvas);

// Lighting
setupLighting(scene);

// Physics world
export const world = new CANNON.World();
world.gravity.set(0, PHYSICS.GRAVITY, 0);
world.broadphase = new CANNON.NaiveBroadphase();

// Materials
const groundMaterial = new CANNON.Material('ground');
export const diceMaterial = new CANNON.Material('dice');
const contactMaterial = new CANNON.ContactMaterial(groundMaterial, diceMaterial, {
  friction: PHYSICS.FRICTION,
  restitution: PHYSICS.RESTITUTION,
});
world.addContactMaterial(contactMaterial);

// Ground
setupGround(scene);

const groundShape = new CANNON.Plane();
const groundBody = new CANNON.Body({ mass: 0, material: groundMaterial });
groundBody.addShape(groundShape);
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(groundBody);

// Build the dice tower
const towerBuilder = new TowerBuilder(scene, world, groundMaterial);
const rotatingObstacles = towerBuilder.buildTower();

const diceList: Dice[] = [];

// Result display
const resultDisplay = document.getElementById('result') as HTMLDivElement;

// History tracking
const historyListElement = document.getElementById('historyList') as HTMLDivElement;
const historyManager = new HistoryManager(historyListElement);

// Die type buttons
const dieButtons = document.querySelectorAll('.dieButton');
dieButtons.forEach(button => {
  button.addEventListener('click', (e) => {
    const sides = parseInt((e.target as HTMLElement).getAttribute('data-sides') || '6') as DiceType;
    
    // Clear result display
    resultDisplay.textContent = '';
    
    // Clear old dice
    diceList.forEach((dice) => {
      scene.remove(dice.mesh);
      world.removeBody(dice.body);
    });
    diceList.length = 0;

    // Add new dice at the top of the tower
    const dice = new Dice(DICE_SPAWN.X, DICE_SPAWN.Y, DICE_SPAWN.Z, scene, world, diceMaterial, sides);
    diceList.push(dice);
  });
});

// Animation loop
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);

  const deltaTime = Math.min(clock.getDelta(), ANIMATION.MAX_DELTA_TIME);
  world.step(PHYSICS.TIME_STEP, deltaTime, 3);

  // Update rotating obstacles
  rotatingObstacles.forEach((obstacle) => {
    obstacle.mesh.rotation[obstacle.axis] += obstacle.speed * deltaTime;
    obstacle.body.quaternion.copy(obstacle.mesh.quaternion as any);
  });

  diceList.forEach((dice) => {
    const result = dice.update();
    if (result !== null) {
      const dieType = `D${dice.sides}`;
      resultDisplay.textContent = `You rolled: ${result}`;
      historyManager.addRoll(result, dieType);
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

