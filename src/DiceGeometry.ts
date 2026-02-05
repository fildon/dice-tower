import * as THREE from 'three';
import { type ChamferedGeometry } from './types';

// Adapted from threejs-dice library for modern Three.js
export class DiceGeometry {
  static createD4Geometry(size: number): THREE.BufferGeometry {
    // D4 vertices - each vertex represents one number (1-4)
    // The number at the bottom vertex is the result
    const vertices = [
      [1, 1, 1],    // vertex 0 - bottom when showing 4
      [-1, -1, 1],  // vertex 1 - bottom when showing 3  
      [-1, 1, -1],  // vertex 2 - bottom when showing 2
      [1, -1, -1]   // vertex 3 - bottom when showing 1
    ];
    // Each face connects 3 vertices, and the 4th number is the opposite vertex (the result when that vertex is down)
    // Face format: [v1, v2, v3, material_index]
    // Material index indicates which number appears on this face (which vertex is NOT part of this face)
    const faces = [
      [1, 0, 2, 1], // Face opposite to vertex 3 (value 1) - shows "1" 
      [0, 1, 3, 2], // Face opposite to vertex 2 (value 2) - shows "2"
      [0, 3, 2, 3], // Face opposite to vertex 1 (value 3) - shows "3"
      [1, 2, 3, 4]  // Face opposite to vertex 0 (value 4) - shows "4"
    ];
    return this.createGeometry(vertices, faces, size, 0, -Math.PI / 4 / 2, 0.96);
  }

  static createD6Geometry(size: number): THREE.BufferGeometry {
    const vertices = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
    ];
    const faces = [
      [0, 3, 2, 1, 1], [1, 2, 6, 5, 2], [0, 1, 5, 4, 3],
      [3, 7, 6, 2, 4], [0, 4, 7, 3, 5], [4, 5, 6, 7, 6]
    ];
    return this.createGeometry(vertices, faces, size, 0.1, Math.PI / 4, 0.96);
  }

  static createD8Geometry(size: number): THREE.BufferGeometry {
    const vertices = [
      [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]
    ];
    const faces = [
      [0, 2, 4, 1], [0, 4, 3, 2], [0, 3, 5, 3], [0, 5, 2, 4],
      [1, 3, 4, 5], [1, 4, 2, 6], [1, 2, 5, 7], [1, 5, 3, 8]
    ];
    return this.createGeometry(vertices, faces, size, 0, -Math.PI / 4 / 2, 0.965);
  }

  static createD10Geometry(size: number): THREE.BufferGeometry {
    // Pentagonal trapezohedron - using the proven threejs-dice vertex arrangement
    const vertices: number[][] = [];
    for (let i = 0, b = 0; i < 10; ++i, b += Math.PI * 2 / 10) {
      vertices.push([Math.cos(b), Math.sin(b), 0.105 * (i % 2 ? 1 : -1)]);
    }
    vertices.push([0, 0, -1]);  // Bottom apex (vertex 10)
    vertices.push([0, 0, 1]);   // Top apex (vertex 11)

    // 10 numbered triangular faces + 10 edge faces to close the gap
    const faces = [
      // Numbered faces (alternate between top and bottom apex)
      // Material indices 1-10 (since 0 is blank)
      [5, 7, 11, 10],  // material 10 (shows "10")
      [4, 2, 10, 1],   // material 1 (shows "1")
      [1, 3, 11, 2],   // material 2 (shows "2")
      [0, 8, 10, 3],   // material 3 (shows "3")
      [7, 9, 11, 4],   // material 4 (shows "4")
      [8, 6, 10, 5],   // material 5 (shows "5")
      [9, 1, 11, 6],   // material 6 (shows "6")
      [2, 0, 10, 7],   // material 7 (shows "7")
      [3, 5, 11, 8],   // material 8 (shows "8")
      [6, 4, 10, 9],   // material 9 (shows "9")
      // Edge faces (to close the gap) - use material -1 (blank/white)
      [1, 0, 2, -1],
      [1, 2, 3, -1],
      [3, 2, 4, -1],
      [3, 4, 5, -1],
      [5, 4, 6, -1],
      [5, 6, 7, -1],
      [7, 6, 8, -1],
      [7, 8, 9, -1],
      [9, 8, 0, -1],
      [9, 0, 1, -1]
    ];
    return this.createGeometry(vertices, faces, size, 0, Math.PI * 6 / 5, 0.945);
  }

  static createD12Geometry(size: number): THREE.BufferGeometry {
    const p = (1 + Math.sqrt(5)) / 2;
    const q = 1 / p;

    const vertices = [
      [0, q, p], [0, q, -p], [0, -q, p], [0, -q, -p], [p, 0, q],
      [p, 0, -q], [-p, 0, q], [-p, 0, -q], [q, p, 0], [q, -p, 0], [-q, p, 0],
      [-q, -p, 0], [1, 1, 1], [1, 1, -1], [1, -1, 1], [1, -1, -1], [-1, 1, 1],
      [-1, 1, -1], [-1, -1, 1], [-1, -1, -1]
    ];
    const faces = [
      [2, 14, 4, 12, 0, 1], [15, 9, 11, 19, 3, 2], [16, 10, 17, 7, 6, 3], [6, 7, 19, 11, 18, 4],
      [6, 18, 2, 0, 16, 5], [18, 11, 9, 14, 2, 6], [1, 17, 10, 8, 13, 7], [1, 13, 5, 15, 3, 8],
      [13, 8, 12, 4, 5, 9], [5, 4, 14, 9, 15, 10], [0, 12, 8, 10, 16, 11], [3, 19, 7, 17, 1, 12]
    ];
    return this.createGeometry(vertices, faces, size, 0.2, -Math.PI / 4 / 2, 0.968);
  }

  static createD20Geometry(size: number): THREE.BufferGeometry {
    const t = (1 + Math.sqrt(5)) / 2;

    const vertices = [
      [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
      [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
      [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]
    ];
    const faces = [
      [0, 11, 5, 1], [0, 5, 1, 2], [0, 1, 7, 3], [0, 7, 10, 4], [0, 10, 11, 5],
      [1, 5, 9, 6], [5, 11, 4, 7], [11, 10, 2, 8], [10, 7, 6, 9], [7, 1, 8, 10],
      [3, 9, 4, 11], [3, 4, 2, 12], [3, 2, 6, 13], [3, 6, 8, 14], [3, 8, 9, 15],
      [4, 9, 5, 16], [2, 4, 11, 17], [6, 2, 10, 18], [8, 6, 7, 19], [9, 8, 1, 20]
    ];
    return this.createGeometry(vertices, faces, size, 0, -Math.PI / 4 / 2, 0.955);
  }

  private static createGeometry(
    vertexData: number[][],
    faceData: number[][],
    radius: number,
    tab: number,
    af: number,
    chamfer: number
  ): THREE.BufferGeometry {
    // Convert vertex data to Vector3
    const vertices = vertexData.map(v => new THREE.Vector3(v[0], v[1], v[2]));
    
    // Apply chamfering
    const chamfered = this.applyChamfer(vertices, faceData, chamfer);
    
    // Create geometry
    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const groups: { start: number; count: number; materialIndex: number }[] = [];

    let vertexOffset = 0;

    for (let i = 0; i < chamfered.faces.length; ++i) {
      const face = chamfered.faces[i];
      const faceLength = face.length - 1;
      const materialIndex = face[faceLength];
      const aa = Math.PI * 2 / faceLength;

      const center = new THREE.Vector3();
      const faceVertices: THREE.Vector3[] = [];
      
      for (let j = 0; j < faceLength; ++j) {
        const vertex = chamfered.vectors[face[j]].clone().multiplyScalar(radius);
        faceVertices.push(vertex);
        center.add(vertex);
      }
      center.divideScalar(faceLength);

      // Triangulate face
      for (let j = 0; j < faceLength - 2; ++j) {
        const v0 = faceVertices[0];
        const v1 = faceVertices[j + 1];
        const v2 = faceVertices[j + 2];

        positions.push(v0.x, v0.y, v0.z);
        positions.push(v1.x, v1.y, v1.z);
        positions.push(v2.x, v2.y, v2.z);

        // Calculate normal
        const normal = new THREE.Vector3()
          .crossVectors(
            new THREE.Vector3().subVectors(v1, v0),
            new THREE.Vector3().subVectors(v2, v0)
          )
          .normalize();
        
        normals.push(normal.x, normal.y, normal.z);
        normals.push(normal.x, normal.y, normal.z);
        normals.push(normal.x, normal.y, normal.z);

        // UVs
        uvs.push(
          (Math.cos(af) + 1 + tab) / 2 / (1 + tab),
          (Math.sin(af) + 1 + tab) / 2 / (1 + tab)
        );
        uvs.push(
          (Math.cos(aa * (j + 1) + af) + 1 + tab) / 2 / (1 + tab),
          (Math.sin(aa * (j + 1) + af) + 1 + tab) / 2 / (1 + tab)
        );
        uvs.push(
          (Math.cos(aa * (j + 2) + af) + 1 + tab) / 2 / (1 + tab),
          (Math.sin(aa * (j + 2) + af) + 1 + tab) / 2 / (1 + tab)
        );
      }

      groups.push({
        start: vertexOffset,
        count: (faceLength - 2) * 3,
        materialIndex: materialIndex >= 0 ? materialIndex : 0
      });
      vertexOffset += (faceLength - 2) * 3;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    
    groups.forEach(group => {
      geometry.addGroup(group.start, group.count, group.materialIndex);
    });

    return geometry;
  }

  private static applyChamfer(
    vectors: THREE.Vector3[],
    faces: number[][],
    chamfer: number
  ): ChamferedGeometry {
    const chamferVectors: THREE.Vector3[] = [];
    const chamferFaces: number[][] = [];
    const cornerFaces: number[][] = new Array(vectors.length).fill(null).map(() => []);

    for (let i = 0; i < faces.length; ++i) {
      const face = faces[i];
      const faceLength = face.length - 1;
      const centerPoint = new THREE.Vector3();
      const newFace: number[] = new Array(faceLength);

      for (let j = 0; j < faceLength; ++j) {
        const vertex = vectors[face[j]].clone();
        centerPoint.add(vertex);
        cornerFaces[face[j]].push(newFace[j] = chamferVectors.push(vertex) - 1);
      }

      centerPoint.divideScalar(faceLength);
      
      for (let j = 0; j < faceLength; ++j) {
        const vertex = chamferVectors[newFace[j]];
        vertex.sub(centerPoint).multiplyScalar(chamfer).add(centerPoint);
      }

      newFace.push(face[faceLength]);
      chamferFaces.push(newFace);
    }

    // Add edge faces
    for (let i = 0; i < faces.length - 1; ++i) {
      for (let j = i + 1; j < faces.length; ++j) {
        const pairs: number[][] = [];
        let lastm = -1;
        
        for (let m = 0; m < faces[i].length - 1; ++m) {
          const n = faces[j].indexOf(faces[i][m]);
          if (n >= 0 && n < faces[j].length - 1) {
            if (lastm >= 0 && m !== lastm + 1) {
              pairs.unshift([i, m], [j, n]);
            } else {
              pairs.push([i, m], [j, n]);
            }
            lastm = m;
          }
        }
        
        if (pairs.length === 4) {
          chamferFaces.push([
            chamferFaces[pairs[0][0]][pairs[0][1]],
            chamferFaces[pairs[1][0]][pairs[1][1]],
            chamferFaces[pairs[3][0]][pairs[3][1]],
            chamferFaces[pairs[2][0]][pairs[2][1]],
            -1
          ]);
        }
      }
    }

    // Add corner faces
    for (let i = 0; i < cornerFaces.length; ++i) {
      const cf = cornerFaces[i];
      const face = [cf[0]];
      let count = cf.length - 1;
      
      while (count > 0) {
        for (let m = faces.length; m < chamferFaces.length; ++m) {
          let index = chamferFaces[m].indexOf(face[face.length - 1]);
          if (index >= 0 && index < 4) {
            if (--index === -1) index = 3;
            const nextVertex = chamferFaces[m][index];
            if (cf.indexOf(nextVertex) >= 0) {
              face.push(nextVertex);
              break;
            }
          }
        }
        --count;
      }
      
      face.push(-1);
      chamferFaces.push(face);
    }

    return { vectors: chamferVectors, faces: chamferFaces };
  }
}
