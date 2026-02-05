import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import * as DiceGeometry from './DiceGeometry';
import { DICE_BASE_SIZE, DICE_SIZE_FACTORS, DICE_REST, PHYSICS } from './constants';
import { createDiceMaterials } from './TextureGenerator';
import { getTopFaceIndex, getD4LowestVertex } from './FaceNormalCalculator';

// Dice class
export class Dice {
  mesh: THREE.Mesh;
  body: CANNON.Body;
  isAtRest: boolean = false;
  private restCheckDelay: number = 0;
  readonly sides: number;

  constructor(
    x: number,
    y: number,
    z: number,
    scene: THREE.Scene,
    world: CANNON.World,
    diceMaterial: CANNON.Material,
    sides: number = 6
  ) {
    this.sides = sides;
    const size = DICE_BASE_SIZE * (DICE_SIZE_FACTORS[sides] || 1.0);
    
    // Create geometry based on die type
    let geometry: THREE.BufferGeometry;
    let materials: THREE.Material[];
    
    switch (sides) {
      case 4:
        geometry = DiceGeometry.createD4Geometry(size);
        materials = createDiceMaterials(4);
        break;
      case 6:
        geometry = DiceGeometry.createD6Geometry(size);
        materials = createDiceMaterials(6);
        break;
      case 8:
        geometry = DiceGeometry.createD8Geometry(size);
        materials = createDiceMaterials(8);
        break;
      case 10:
        geometry = DiceGeometry.createD10Geometry(size);
        materials = createDiceMaterials(10);
        break;
      case 12:
        geometry = DiceGeometry.createD12Geometry(size);
        materials = createDiceMaterials(12);
        break;
      case 20:
        geometry = DiceGeometry.createD20Geometry(size);
        materials = createDiceMaterials(20);
        break;
      default:
        geometry = DiceGeometry.createD6Geometry(size);
        materials = createDiceMaterials(6);
    }
    
    this.mesh = new THREE.Mesh(geometry, materials);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    scene.add(this.mesh);

    // Create physics body with shape matching the visual geometry
    const shape = this.createPhysicsShape(sides, size);
    this.body = new CANNON.Body({
      mass: PHYSICS.DICE_MASS,
      material: diceMaterial,
      linearDamping: PHYSICS.LINEAR_DAMPING,
      angularDamping: PHYSICS.ANGULAR_DAMPING,
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

  private createPhysicsShape(sides: number, size: number): CANNON.Shape {
    // Create collision shapes that match the visual geometry
    switch (sides) {
      case 4: // Tetrahedron
        return new CANNON.ConvexPolyhedron({
          vertices: [
            new CANNON.Vec3(1, 1, 1).scale(size),
            new CANNON.Vec3(-1, -1, 1).scale(size),
            new CANNON.Vec3(-1, 1, -1).scale(size),
            new CANNON.Vec3(1, -1, -1).scale(size)
          ],
          faces: [[0, 2, 1], [0, 1, 3], [0, 3, 2], [1, 2, 3]]
        });
      
      case 6: // Cube
        return new CANNON.Box(new CANNON.Vec3(size, size, size));
      
      case 8: // Octahedron
        return new CANNON.ConvexPolyhedron({
          vertices: [
            new CANNON.Vec3(1, 0, 0).scale(size),
            new CANNON.Vec3(-1, 0, 0).scale(size),
            new CANNON.Vec3(0, 1, 0).scale(size),
            new CANNON.Vec3(0, -1, 0).scale(size),
            new CANNON.Vec3(0, 0, 1).scale(size),
            new CANNON.Vec3(0, 0, -1).scale(size)
          ],
          faces: [
            [0, 2, 4], [0, 4, 3], [0, 3, 5], [0, 5, 2],
            [1, 3, 4], [1, 4, 2], [1, 2, 5], [1, 5, 3]
          ]
        });
      
      case 10: // Pentagonal trapezohedron
        {
          const vertices: CANNON.Vec3[] = [];
          for (let i = 0, b = 0; i < 10; ++i, b += Math.PI * 2 / 10) {
            vertices.push(new CANNON.Vec3(
              Math.cos(b) * size,
              Math.sin(b) * size,
              0.105 * (i % 2 ? 1 : -1) * size
            ));
          }
          vertices.push(new CANNON.Vec3(0, 0, -size));
          vertices.push(new CANNON.Vec3(0, 0, size));
          
          return new CANNON.ConvexPolyhedron({
            vertices,
            faces: [
              [5, 7, 11], [4, 2, 10], [1, 3, 11], [0, 8, 10], [7, 9, 11],
              [8, 6, 10], [9, 1, 11], [2, 0, 10], [3, 5, 11], [6, 4, 10],
              [1, 0, 2], [1, 2, 3], [3, 2, 4], [3, 4, 5], [5, 4, 6],
              [5, 6, 7], [7, 6, 8], [7, 8, 9], [9, 8, 0], [9, 0, 1]
            ]
          });
        }
      
      case 12: // Dodecahedron
        {
          const p = (1 + Math.sqrt(5)) / 2;
          const q = 1 / p;
          return new CANNON.ConvexPolyhedron({
            vertices: [
              new CANNON.Vec3(0, q, p).scale(size),
              new CANNON.Vec3(0, q, -p).scale(size),
              new CANNON.Vec3(0, -q, p).scale(size),
              new CANNON.Vec3(0, -q, -p).scale(size),
              new CANNON.Vec3(p, 0, q).scale(size),
              new CANNON.Vec3(p, 0, -q).scale(size),
              new CANNON.Vec3(-p, 0, q).scale(size),
              new CANNON.Vec3(-p, 0, -q).scale(size),
              new CANNON.Vec3(q, p, 0).scale(size),
              new CANNON.Vec3(q, -p, 0).scale(size),
              new CANNON.Vec3(-q, p, 0).scale(size),
              new CANNON.Vec3(-q, -p, 0).scale(size),
              new CANNON.Vec3(1, 1, 1).scale(size),
              new CANNON.Vec3(1, 1, -1).scale(size),
              new CANNON.Vec3(1, -1, 1).scale(size),
              new CANNON.Vec3(1, -1, -1).scale(size),
              new CANNON.Vec3(-1, 1, 1).scale(size),
              new CANNON.Vec3(-1, 1, -1).scale(size),
              new CANNON.Vec3(-1, -1, 1).scale(size),
              new CANNON.Vec3(-1, -1, -1).scale(size)
            ],
            faces: [
              [2, 14, 4, 12, 0], [15, 9, 11, 19, 3], [16, 10, 17, 7, 6],
              [6, 7, 19, 11, 18], [6, 18, 2, 0, 16], [18, 11, 9, 14, 2],
              [1, 17, 10, 8, 13], [1, 13, 5, 15, 3], [13, 8, 12, 4, 5],
              [5, 4, 14, 9, 15], [0, 12, 8, 10, 16], [3, 19, 7, 17, 1]
            ]
          });
        }
      
      case 20: // Icosahedron
        {
          const t = (1 + Math.sqrt(5)) / 2;
          return new CANNON.ConvexPolyhedron({
            vertices: [
              new CANNON.Vec3(-1, t, 0).scale(size),
              new CANNON.Vec3(1, t, 0).scale(size),
              new CANNON.Vec3(-1, -t, 0).scale(size),
              new CANNON.Vec3(1, -t, 0).scale(size),
              new CANNON.Vec3(0, -1, t).scale(size),
              new CANNON.Vec3(0, 1, t).scale(size),
              new CANNON.Vec3(0, -1, -t).scale(size),
              new CANNON.Vec3(0, 1, -t).scale(size),
              new CANNON.Vec3(t, 0, -1).scale(size),
              new CANNON.Vec3(t, 0, 1).scale(size),
              new CANNON.Vec3(-t, 0, -1).scale(size),
              new CANNON.Vec3(-t, 0, 1).scale(size)
            ],
            faces: [
              [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
              [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
              [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
              [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
            ]
          });
        }
      
      default:
        return new CANNON.Box(new CANNON.Vec3(size, size, size));
    }
  }

  update(): number | null {
    this.mesh.position.copy(this.body.position as any);
    this.mesh.quaternion.copy(this.body.quaternion as any);
    
    // Check if dice is at rest
    const velocity = this.body.velocity.length();
    const angularVelocity = this.body.angularVelocity.length();
    
    if (velocity < DICE_REST.VELOCITY_THRESHOLD && angularVelocity < DICE_REST.ANGULAR_VELOCITY_THRESHOLD) {
      this.restCheckDelay++;
      if (this.restCheckDelay > DICE_REST.FRAME_DELAY && !this.isAtRest) {
        this.isAtRest = true;
        return this.getTopFace();
      }
    } else {
      this.restCheckDelay = 0;
      this.isAtRest = false;
    }
    
    return null;
  }

  private getTopFace(): number {
    // Special case for D4 - find the lowest vertex (the result is the opposite number)
    if (this.sides === 4) {
      const lowestVertexIndex = getD4LowestVertex(this.mesh);
      return lowestVertexIndex + 1;
    }
    
    // For other dice, find the face most aligned with up vector
    const topFaceIndex = getTopFaceIndex(this.mesh);
    
    if (topFaceIndex === 0) {
      // Fallback to random if no valid face found
      return Math.floor(Math.random() * this.sides) + 1;
    }
    
    // For D10, material index 10 represents "10", indices 1-9 represent "1"-"9"
    // (index 0 is blank for edge faces)
    if (this.sides === 10 && topFaceIndex === 10) {
      return 10;
    }
    
    // For other dice, materialIndex directly represents the die value (1-N)
    return topFaceIndex;
  }
}
