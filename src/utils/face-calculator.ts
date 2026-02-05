import * as THREE from 'three';

/**
 * Calculate which face is most aligned with the up vector (world Y+)
 */
export function getTopFaceIndex(mesh: THREE.Mesh): number {
    const up = new THREE.Vector3(0, 1, 0);
    const geometry = mesh.geometry as THREE.BufferGeometry;
    const groups = geometry.groups;
    
    if (groups.length === 0) {
      return 0;
    }
    
    let maxDot = -Infinity;
    let topFaceIndex = 0;
    
    groups.forEach((group) => {
      if (!group.materialIndex || group.materialIndex <= 0) return;
      
      const positions = geometry.attributes.position;
      const startIndex = group.start;
      
      // Get three vertices of the first triangle in the group
      const v0 = new THREE.Vector3(
        positions.getX(startIndex),
        positions.getY(startIndex),
        positions.getZ(startIndex)
      );
      const v1 = new THREE.Vector3(
        positions.getX(startIndex + 1),
        positions.getY(startIndex + 1),
        positions.getZ(startIndex + 1)
      );
      const v2 = new THREE.Vector3(
        positions.getX(startIndex + 2),
        positions.getY(startIndex + 2),
        positions.getZ(startIndex + 2)
      );
      
      // Calculate face normal in local space
      const normal = new THREE.Vector3()
        .crossVectors(
          new THREE.Vector3().subVectors(v1, v0),
          new THREE.Vector3().subVectors(v2, v0)
        )
        .normalize();
      
      // Transform to world space
      const worldNormal = normal.applyQuaternion(mesh.quaternion);
      const dot = worldNormal.dot(up);
      
      if (dot > maxDot && group.materialIndex) {
        maxDot = dot;
        topFaceIndex = group.materialIndex;
      }
    });
    
    return topFaceIndex;
}

/**
 * Special case for D4: find the face most aligned with the down vector
 * The D4 lands with one face flat on the ground.
 * The material index of the bottom face determines the result.
 */
export function getD4BottomFaceIndex(mesh: THREE.Mesh): number {
    const down = new THREE.Vector3(0, -1, 0);
    const geometry = mesh.geometry as THREE.BufferGeometry;
    const groups = geometry.groups;
    
    if (groups.length === 0) {
      return 1;
    }
    
    let maxDot = -Infinity;
    let bottomFaceIndex = 1;
    
    groups.forEach((group) => {
      if (!group.materialIndex || group.materialIndex <= 0) return;
      
      const positions = geometry.attributes.position;
      const startIndex = group.start;
      
      // Get three vertices of the first triangle in the group
      const v0 = new THREE.Vector3(
        positions.getX(startIndex),
        positions.getY(startIndex),
        positions.getZ(startIndex)
      );
      const v1 = new THREE.Vector3(
        positions.getX(startIndex + 1),
        positions.getY(startIndex + 1),
        positions.getZ(startIndex + 1)
      );
      const v2 = new THREE.Vector3(
        positions.getX(startIndex + 2),
        positions.getY(startIndex + 2),
        positions.getZ(startIndex + 2)
      );
      
      // Calculate face normal in local space
      const normal = new THREE.Vector3()
        .crossVectors(
          new THREE.Vector3().subVectors(v1, v0),
          new THREE.Vector3().subVectors(v2, v0)
        )
        .normalize();
      
      // Transform to world space
      const worldNormal = normal.applyQuaternion(mesh.quaternion);
      const dot = worldNormal.dot(down);
      
      if (dot > maxDot && group.materialIndex) {
        maxDot = dot;
        bottomFaceIndex = group.materialIndex;
      }
    });
    
    return bottomFaceIndex;
}
