import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import * as DiceGeometry from './utils/dice-geometry';
import { DICE_REST, PHYSICS } from './constants';
import { createDiceMaterials } from './utils/texture-utils';
import { getTopFaceIndex, getD4BottomFaceIndex } from './utils/face-calculator';

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
    
    // Create geometry based on die type
    let geometry: THREE.BufferGeometry;
    let materials: THREE.Material[];
    
    switch (sides) {
      case 4:
        geometry = DiceGeometry.createD4Geometry();
        materials = createDiceMaterials(4);
        break;
      case 6:
        geometry = DiceGeometry.createD6Geometry();
        materials = createDiceMaterials(6);
        break;
      case 8:
        geometry = DiceGeometry.createD8Geometry();
        materials = createDiceMaterials(8);
        break;
      case 10:
        geometry = DiceGeometry.createD10Geometry();
        materials = createDiceMaterials(10);
        break;
      case 12:
        geometry = DiceGeometry.createD12Geometry();
        materials = createDiceMaterials(12);
        break;
      case 20:
        geometry = DiceGeometry.createD20Geometry();
        materials = createDiceMaterials(20);
        break;
      default:
        geometry = DiceGeometry.createD6Geometry();
        materials = createDiceMaterials(6);
    }
    
    this.mesh = new THREE.Mesh(geometry, materials);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    scene.add(this.mesh);

    // Add vertex labels for D4
    if (sides === 4) {
      this.addD4VertexLabels();
    }

    // Create physics body with shape matching the visual geometry
    const shape = this.createPhysicsShape(sides);
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

  private createPhysicsShape(sides: number): CANNON.Shape {
    // Size factors matching visual geometry
    const baseSize = 0.5;
    const sizeFactors: { [key: number]: number } = {
      4: 0.8,
      6: 1.0,
      8: 1.3,
      10: 1.0,
      12: 0.7,
      20: 0.5,
    };
    const size = baseSize * (sizeFactors[sides] || 1.0);
    
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
    const isNearGround = this.body.position.y < DICE_REST.GROUND_LEVEL_THRESHOLD;
    
    // Only record result if die is at rest AND near ground level
    if (velocity < DICE_REST.VELOCITY_THRESHOLD && angularVelocity < DICE_REST.ANGULAR_VELOCITY_THRESHOLD && isNearGround) {
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

  private addD4VertexLabels(): void {
    // D4 vertex positions and their values
    // Vertices: 0=[1,1,1]=4, 1=[-1,-1,1]=3, 2=[-1,1,-1]=2, 3=[1,-1,-1]=1
    const vertexData = [
      { pos: new THREE.Vector3(1, 1, 1).multiplyScalar(0.4), value: 4 },
      { pos: new THREE.Vector3(-1, -1, 1).multiplyScalar(0.4), value: 3 },
      { pos: new THREE.Vector3(-1, 1, -1).multiplyScalar(0.4), value: 2 },
      { pos: new THREE.Vector3(1, -1, -1).multiplyScalar(0.4), value: 1 }
    ];

    vertexData.forEach(({ pos, value }) => {
      // Create canvas texture for sprite
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      
      // Black background circle
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(32, 32, 28, 0, Math.PI * 2);
      ctx.fill();
      
      // White text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 40px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(value.toString(), 32, 32);
      
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true,
        depthWrite: false,
        depthTest: true
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(0.5, 0.5, 1);
      sprite.renderOrder = 1; // Render after ground (which has default renderOrder 0)
      
      // Offset sprite slightly outward from die center so it appears in front
      const offset = pos.clone().normalize().multiplyScalar(0.15);
      sprite.position.copy(pos.clone().add(offset));
      
      this.mesh.add(sprite);
    });
  }

  private getTopFace(): number {
    // Special case for D4 - find the bottom face (touching table)
    if (this.sides === 4) {
      return getD4BottomFaceIndex(this.mesh);
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
