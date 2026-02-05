import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CAMERA, LIGHTING, SCENE } from './constants';

export class SceneSetup {
  static setupCamera(aspectRatio: number): THREE.PerspectiveCamera {
    const camera = new THREE.PerspectiveCamera(
      CAMERA.FOV,
      aspectRatio,
      CAMERA.NEAR,
      CAMERA.FAR
    );
    camera.position.set(CAMERA.POSITION.x, CAMERA.POSITION.y, CAMERA.POSITION.z);
    camera.lookAt(0, 0, 0);
    return camera;
  }

  static setupControls(camera: THREE.Camera, canvas: HTMLCanvasElement): OrbitControls {
    const controls = new OrbitControls(camera, canvas);
    controls.target.set(CAMERA.TARGET.x, CAMERA.TARGET.y, CAMERA.TARGET.z);
    controls.enableDamping = true;
    controls.dampingFactor = CAMERA.DAMPING_FACTOR;
    controls.minDistance = CAMERA.MIN_DISTANCE;
    controls.maxDistance = CAMERA.MAX_DISTANCE;
    controls.maxPolarAngle = Math.PI / 2;
    return controls;
  }

  static setupLighting(scene: THREE.Scene): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, LIGHTING.AMBIENT_INTENSITY);
    scene.add(ambientLight);

    // Directional light with shadows
    const directionalLight = new THREE.DirectionalLight(0xffffff, LIGHTING.DIRECTIONAL_INTENSITY);
    directionalLight.position.set(
      LIGHTING.DIRECTIONAL_POSITION.x,
      LIGHTING.DIRECTIONAL_POSITION.y,
      LIGHTING.DIRECTIONAL_POSITION.z
    );
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -LIGHTING.SHADOW_CAMERA_SIZE;
    directionalLight.shadow.camera.right = LIGHTING.SHADOW_CAMERA_SIZE;
    directionalLight.shadow.camera.top = LIGHTING.SHADOW_CAMERA_SIZE;
    directionalLight.shadow.camera.bottom = -LIGHTING.SHADOW_CAMERA_SIZE;
    scene.add(directionalLight);
  }

  static setupRenderer(canvas: HTMLCanvasElement): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    return renderer;
  }

  static setupGround(scene: THREE.Scene): THREE.Mesh {
    const groundGeometry = new THREE.PlaneGeometry(SCENE.GROUND_SIZE, SCENE.GROUND_SIZE);
    const groundMesh = new THREE.Mesh(
      groundGeometry,
      new THREE.MeshStandardMaterial({ color: SCENE.GROUND_COLOR })
    );
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);
    return groundMesh;
  }
}
