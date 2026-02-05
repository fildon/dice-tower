import * as THREE from 'three';
import * as CANNON from 'cannon-es';

// Dice types as const values
export const DiceType = {
  D4: 4,
  D6: 6,
  D8: 8,
  D10: 10,
  D12: 12,
  D20: 20,
} as const;

export type DiceType = typeof DiceType[keyof typeof DiceType];

// Obstacle structure
export interface RotatingObstacle {
  mesh: THREE.Mesh;
  body: CANNON.Body;
  speed: number;
  axis: 'x' | 'y' | 'z';
}

// Tower wall return type
export interface TowerWall {
  mesh: THREE.Mesh;
  body: CANNON.Body;
}

// Geometry vertex and face data
export interface GeometryData {
  vertices: number[][];
  faces: number[][];
}

// Chamfered geometry data
export interface ChamferedGeometry {
  vectors: THREE.Vector3[];
  faces: number[][];
}
