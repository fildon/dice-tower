import * as CANNON from 'cannon-es';
import * as THREE from 'three';

// Dice class
export class Dice {
  mesh: THREE.Mesh;
  body: CANNON.Body;
  isAtRest: boolean = false;
  private restCheckDelay: number = 0;

  constructor(
    x: number,
    y: number,
    z: number,
    scene: THREE.Scene,
    world: CANNON.World,
    diceMaterial: CANNON.Material
  ) {
    const size = 0.5;
    const geometry = new THREE.BoxGeometry(size, size, size);
    
    // Create materials with numbers for each face
    const materials = this.createNumberedMaterials();
    
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

  private createNumberedMaterials(): THREE.MeshStandardMaterial[] {
    const materials: THREE.MeshStandardMaterial[] = [];
    const numbers = [1, 2, 3, 4, 5, 6];
    
    for (let i = 0; i < 6; i++) {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d')!;
      
      // Background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 128, 128);
      
      // Number
      ctx.fillStyle = 'black';
      ctx.font = 'bold 80px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(numbers[i].toString(), 64, 64);
      
      const texture = new THREE.CanvasTexture(canvas);
      materials.push(new THREE.MeshStandardMaterial({ map: texture }));
    }
    
    return materials;
  }

  update(): number | null {
    this.mesh.position.copy(this.body.position as any);
    this.mesh.quaternion.copy(this.body.quaternion as any);
    
    // Check if dice is at rest
    const velocity = this.body.velocity.length();
    const angularVelocity = this.body.angularVelocity.length();
    
    if (velocity < 0.1 && angularVelocity < 0.1) {
      this.restCheckDelay++;
      if (this.restCheckDelay > 30 && !this.isAtRest) { // Wait 30 frames to be sure
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
    // Get the up vector in world space
    const up = new THREE.Vector3(0, 1, 0);
    
    // Define face normals in local space (matching BoxGeometry face order)
    const faceNormals = [
      new THREE.Vector3(1, 0, 0),   // Right face - 1
      new THREE.Vector3(-1, 0, 0),  // Left face - 2
      new THREE.Vector3(0, 1, 0),   // Top face - 3
      new THREE.Vector3(0, -1, 0),  // Bottom face - 4
      new THREE.Vector3(0, 0, 1),   // Front face - 5
      new THREE.Vector3(0, 0, -1),  // Back face - 6
    ];
    
    // Transform normals to world space and find which is most aligned with up
    let maxDot = -Infinity;
    let topFaceIndex = 0;
    
    faceNormals.forEach((normal, index) => {
      const worldNormal = normal.clone().applyQuaternion(this.mesh.quaternion);
      const dot = worldNormal.dot(up);
      if (dot > maxDot) {
        maxDot = dot;
        topFaceIndex = index;
      }
    });
    
    return topFaceIndex + 1; // Return 1-6
  }
}
