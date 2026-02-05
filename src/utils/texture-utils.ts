import * as THREE from 'three';
import { TEXTURE } from '../constants';

export function createDiceTexture(number: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = TEXTURE.CANVAS_SIZE;
  canvas.height = TEXTURE.CANVAS_SIZE;
  const ctx = canvas.getContext('2d')!;
  
  // Background
  ctx.fillStyle = TEXTURE.BACKGROUND_COLOR;
  ctx.fillRect(0, 0, TEXTURE.CANVAS_SIZE, TEXTURE.CANVAS_SIZE);
  
  // Number
  ctx.fillStyle = TEXTURE.TEXT_COLOR;
  ctx.font = TEXTURE.FONT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  ctx.fillText(number.toString(), TEXTURE.CANVAS_SIZE / 2, TEXTURE.CANVAS_SIZE / 2);
  
  return new THREE.CanvasTexture(canvas);
}

export function createDiceMaterials(numFaces: number): THREE.MeshStandardMaterial[] {
  const materials: THREE.MeshStandardMaterial[] = [];
  
  // Blank material for -1 indices (always first)
  materials.push(new THREE.MeshStandardMaterial({ color: 0xffffff }));
  
  if (numFaces === 10) {
    // For D10: create materials 1-10
    for (let i = 1; i <= 10; i++) {
      const texture = createDiceTexture(i);
      materials.push(new THREE.MeshStandardMaterial({
        map: texture,
        roughness: TEXTURE.ROUGHNESS,
        metalness: TEXTURE.METALNESS,
      }));
    }
  } else {
    // For other dice: create materials for each face
    for (let i = 0; i < numFaces; i++) {
      const texture = createDiceTexture(i + 1);
      materials.push(new THREE.MeshStandardMaterial({
        map: texture,
        roughness: TEXTURE.ROUGHNESS,
        metalness: TEXTURE.METALNESS,
      }));
    }
  }
  
  return materials;
}
