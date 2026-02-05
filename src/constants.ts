// Physics constants
export const PHYSICS = {
  GRAVITY: -9.82,
  FRICTION: 0.2,
  RESTITUTION: 0.4,
  TIME_STEP: 1 / 60,
  DICE_MASS: 1,
  LINEAR_DAMPING: 0.4,
  ANGULAR_DAMPING: 0.4,
} as const;

// Dice rest detection
export const DICE_REST = {
  VELOCITY_THRESHOLD: 0.1,
  ANGULAR_VELOCITY_THRESHOLD: 0.1,
  FRAME_DELAY: 30,
  GROUND_LEVEL_THRESHOLD: 1.5, // Die must be below this Y position to record result
} as const;

// Tower dimensions
export const TOWER = {
  WIDTH: 3,
  DEPTH: 3,
  HEIGHT: 8,
  WALL_THICKNESS: 0.15,
  FRONT_GAP: 2,
  WALL_COLOR: 0x8b4513,
  WALL_OPACITY: 0.2,
} as const;

// Obstacles
export const OBSTACLES = {
  UPPER: {
    X: 0.3,
    Y: 6,
    Z: -0.3,
    WIDTH: 0.4,
    DEPTH: 0.7,
    COLOR: 0x00ff00,
    OPACITY: 0.9,
    ROTATION: -0.5,
    SPEED: -1.5,
  },
  MIDDLE: {
    X: -0.3,
    Y: 4,
    Z: 0.3,
    WIDTH: 0.5,
    DEPTH: 0.9,
    COLOR: 0xff6600,
    OPACITY: 0.9,
    ROTATION: 0.4,
    SPEED: 0.9,
  },
  LOWER: {
    X: 0.2,
    Y: 2,
    Z: -0.2,
    WIDTH: 0.6,
    DEPTH: 1.0,
    COLOR: 0xff0000,
    OPACITY: 0.9,
    ROTATION: -0.4,
    SPEED: -0.8,
  },
} as const;

// Scene constants
export const SCENE = {
  BACKGROUND_COLOR: 0x1a1a1a,
  GROUND_SIZE: 20,
  GROUND_COLOR: 0x333333,
} as const;

// Camera constants
export const CAMERA = {
  FOV: 75,
  NEAR: 0.1,
  FAR: 1000,
  POSITION: { x: 5, y: 8, z: 10 },
  TARGET: { x: 0, y: 3, z: 0 },
  MIN_DISTANCE: 5,
  MAX_DISTANCE: 30,
  DAMPING_FACTOR: 0.05,
} as const;

// Lighting constants
export const LIGHTING = {
  AMBIENT_INTENSITY: 0.5,
  DIRECTIONAL_INTENSITY: 0.8,
  DIRECTIONAL_POSITION: { x: 5, y: 10, z: 5 },
  SHADOW_CAMERA_SIZE: 10,
} as const;

// Dice spawn position
export const DICE_SPAWN = {
  X: 0,
  Y: 7.5,
  Z: -0.5,
} as const;

// History constants
export const HISTORY = {
  MAX_ITEMS: 20,
} as const;

// Texture constants
export const TEXTURE = {
  CANVAS_SIZE: 128,
  FONT_SIZE: 64,
  FONT: 'bold 64px Arial',
  BACKGROUND_COLOR: 'white',
  TEXT_COLOR: 'black',
  ROUGHNESS: 0.5,
  METALNESS: 0.1,
} as const;

// Animation constants
export const ANIMATION = {
  MAX_DELTA_TIME: 0.1,
} as const;
