import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { TOWER, OBSTACLES } from './constants';
import { type RotatingObstacle, type TowerWall } from './types';

export class TowerBuilder {
  private scene: THREE.Scene;
  private world: CANNON.World;
  private groundMaterial: CANNON.Material;

  constructor(scene: THREE.Scene, world: CANNON.World, groundMaterial: CANNON.Material) {
    this.scene = scene;
    this.world = world;
    this.groundMaterial = groundMaterial;
  }

  buildTower(): RotatingObstacle[] {
    // Build main tower walls
    this.buildMainWalls();
    
    // Build and return rotating obstacles
    return this.buildObstacles();
  }

  private buildMainWalls(): void {
    // Back wall (full height)
    this.createWall(
      0,
      TOWER.HEIGHT / 2,
      -TOWER.DEPTH / 2,
      TOWER.WIDTH,
      TOWER.HEIGHT,
      TOWER.WALL_THICKNESS,
      TOWER.WALL_COLOR,
      TOWER.WALL_OPACITY
    );

    // Left wall (full height)
    this.createWall(
      -TOWER.WIDTH / 2,
      TOWER.HEIGHT / 2,
      0,
      TOWER.WALL_THICKNESS,
      TOWER.HEIGHT,
      TOWER.DEPTH,
      TOWER.WALL_COLOR,
      TOWER.WALL_OPACITY
    );

    // Right wall (full height)
    this.createWall(
      TOWER.WIDTH / 2,
      TOWER.HEIGHT / 2,
      0,
      TOWER.WALL_THICKNESS,
      TOWER.HEIGHT,
      TOWER.DEPTH,
      TOWER.WALL_COLOR,
      TOWER.WALL_OPACITY
    );

    // Front wall with gap at bottom
    const frontWallHeight = TOWER.HEIGHT - TOWER.FRONT_GAP;
    const frontWallYPos = TOWER.FRONT_GAP + frontWallHeight / 2;
    this.createWall(
      0,
      frontWallYPos,
      TOWER.DEPTH / 2,
      TOWER.WIDTH,
      frontWallHeight,
      TOWER.WALL_THICKNESS,
      TOWER.WALL_COLOR,
      TOWER.WALL_OPACITY
    );
  }

  private buildObstacles(): RotatingObstacle[] {
    const obstacles: RotatingObstacle[] = [];

    // Upper obstacle
    const obstacle1 = this.createWall(
      OBSTACLES.UPPER.X,
      OBSTACLES.UPPER.Y,
      OBSTACLES.UPPER.Z,
      OBSTACLES.UPPER.WIDTH,
      TOWER.WALL_THICKNESS,
      OBSTACLES.UPPER.DEPTH,
      OBSTACLES.UPPER.COLOR,
      OBSTACLES.UPPER.OPACITY
    );
    obstacle1.mesh.rotation.z = OBSTACLES.UPPER.ROTATION;
    obstacle1.body.quaternion.setFromEuler(0, 0, OBSTACLES.UPPER.ROTATION);
    obstacles.push({ ...obstacle1, speed: OBSTACLES.UPPER.SPEED, axis: 'y' });

    // Middle obstacle
    const obstacle2 = this.createWall(
      OBSTACLES.MIDDLE.X,
      OBSTACLES.MIDDLE.Y,
      OBSTACLES.MIDDLE.Z,
      OBSTACLES.MIDDLE.WIDTH,
      TOWER.WALL_THICKNESS,
      OBSTACLES.MIDDLE.DEPTH,
      OBSTACLES.MIDDLE.COLOR,
      OBSTACLES.MIDDLE.OPACITY
    );
    obstacle2.mesh.rotation.z = OBSTACLES.MIDDLE.ROTATION;
    obstacle2.body.quaternion.setFromEuler(0, 0, OBSTACLES.MIDDLE.ROTATION);
    obstacles.push({ ...obstacle2, speed: OBSTACLES.MIDDLE.SPEED, axis: 'y' });

    // Lower obstacle
    const obstacle3 = this.createWall(
      OBSTACLES.LOWER.X,
      OBSTACLES.LOWER.Y,
      OBSTACLES.LOWER.Z,
      OBSTACLES.LOWER.WIDTH,
      TOWER.WALL_THICKNESS,
      OBSTACLES.LOWER.DEPTH,
      OBSTACLES.LOWER.COLOR,
      OBSTACLES.LOWER.OPACITY
    );
    obstacle3.mesh.rotation.z = OBSTACLES.LOWER.ROTATION;
    obstacle3.body.quaternion.setFromEuler(0, 0, OBSTACLES.LOWER.ROTATION);
    obstacles.push({ ...obstacle3, speed: OBSTACLES.LOWER.SPEED, axis: 'y' });

    return obstacles;
  }

  private createWall(
    x: number,
    y: number,
    z: number,
    width: number,
    height: number,
    depth: number,
    color: number,
    opacity: number
  ): TowerWall {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({
        color: color,
        transparent: true,
        opacity: opacity,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
    );
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    const shape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
    const body = new CANNON.Body({ mass: 0, material: this.groundMaterial });
    body.addShape(shape);
    body.position.set(x, y, z);
    this.world.addBody(body);

    return { mesh, body };
  }
}
