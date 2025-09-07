import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import {
	DRACOLoader,
	GLTFLoader,
	HDRLoader,
} from "three/examples/jsm/Addons.js";

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("./draco/");
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

const cubeTextureLoader = new THREE.CubeTextureLoader(); // for cube textures
const hdrLoader = new HDRLoader(); // for HDR equirectangular textures
const textureLoader = new THREE.TextureLoader(); // for LDR equirectangular textures

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// on vient permettre à tous les mesh de la scène de caster et recevoir des ombres
const updateAllMaterials = () => {
	scene.traverse((child) => {
		if (child.isMesh) {
			child.castShadow = true;
			child.receiveShadow = true;
		}
	});
};

/**
 * Environment map
 */

// HDR (RGBE) equirectangular texture (very good lighting, but heavier to load)
const environmentMap = hdrLoader.load(
	"./environmentMaps/0/2k.hdr",
	(environmentMap) => {
		// on indique comment projeter la texture
		environmentMap.mapping = THREE.EquirectangularReflectionMapping;
	}
);

scene.background = environmentMap;
scene.environment = environmentMap;
scene.environmentIntensity = 1;

gui.add(scene, "environmentIntensity").min(0).max(10).step(0.001);

// Light
const directionalLight = new THREE.DirectionalLight("#ffffff", 3);
directionalLight.position.set(-4, 6.5, 6.5);

gui.add(directionalLight, "intensity").min(0).max(10).step(0.001);
gui.add(directionalLight.position, "x").min(-10).max(10).step(0.001);
gui.add(directionalLight.position, "y").min(-10).max(10).step(0.001);
gui.add(directionalLight.position, "z").min(-10).max(10).step(0.001);

gui.add(directionalLight.shadow, "normalBias").min(0).max(0.1).step(0.001);
gui.add(directionalLight.shadow, "bias").min(-0.1).max(0.1).step(0.001);

scene.add(directionalLight);

// Shadows
directionalLight.castShadow = true;
directionalLight.shadow.camera.far = 25;
directionalLight.shadow.mapSize.set(1024, 1024); // résolution des ombres
directionalLight.shadow.normalBias = 0.06; // réduire les artefacts sur les ombres sur les surfaces inclinées
directionalLight.shadow.bias = 0.002; // réduire les artefacts sur les surfaces planes
gui.add(directionalLight, "castShadow");

// Target
directionalLight.target.position.set(0, 4, 0); // par défaut la cible est à (0,0,0)
directionalLight.target.updateMatrixWorld(); // on doit appeler cette méthode pour que la cible soit bien positionnée

// const directionalLightCameraHelper = new THREE.CameraHelper(
// 	directionalLight.shadow.camera
// );
// directionalLightCameraHelper.update();
// scene.add(directionalLightCameraHelper);

/**
 * Models
 */

gltfLoader.load("./models/FlightHelmet/glTF/FlightHelmet.gltf", (gltf) => {
	const model = gltf.scene;
	model.scale.setScalar(10);
	scene.add(model);
	updateAllMaterials();
});

// gltfLoader.load("./models/big-burger.glb", (gltf) => {
// 	const model = gltf.scene;
// 	model.scale.setScalar(1.5);
// 	model.position.y = 2;
// 	scene.add(model);

// 	updateAllMaterials();
// });

/**
 * Floor
 */
const floorColorTexture = textureLoader.load(
	"/textures/wood_cabinet_worn_long/wood_cabinet_worn_long_diff_1k.jpg"
);
const floorNormalTexture = textureLoader.load(
	"/textures/wood_cabinet_worn_long/wood_cabinet_worn_long_nor_gl_1k.png"
);
const floorAORoughnessMetalnessTexture = textureLoader.load(
	"/textures/wood_cabinet_worn_long/wood_cabinet_worn_long_arm_1k.jpg"
);

floorColorTexture.colorSpace = THREE.SRGBColorSpace;

const floor = new THREE.Mesh(
	new THREE.PlaneGeometry(12, 12),
	new THREE.MeshStandardMaterial({
		map: floorColorTexture,
		normalMap: floorNormalTexture,
		aoMap: floorAORoughnessMetalnessTexture,
		roughnessMap: floorAORoughnessMetalnessTexture,
		metalnessMap: floorAORoughnessMetalnessTexture,
	})
);
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor);

/**
 * Wall
 */
const wallColorTexture = textureLoader.load(
	"/textures/castle_brick_broken_06/castle_brick_broken_06_diff_1k.jpg"
);
const wallNormalTexture = textureLoader.load(
	"/textures/castle_brick_broken_06/castle_brick_broken_06_nor_gl_1k.png"
);
const wallAORoughnessMetalnessTexture = textureLoader.load(
	"/textures/castle_brick_broken_06/castle_brick_broken_06_arm_1k.jpg"
);

wallColorTexture.colorSpace = THREE.SRGBColorSpace;

const wall = new THREE.Mesh(
	new THREE.PlaneGeometry(12, 12),
	new THREE.MeshStandardMaterial({
		map: wallColorTexture,
		normalMap: wallNormalTexture,
		aoMap: wallAORoughnessMetalnessTexture,
		roughnessMap: wallAORoughnessMetalnessTexture,
		metalnessMap: wallAORoughnessMetalnessTexture,
	})
);
wall.position.y = 6;
wall.position.z = -6;
scene.add(wall);

/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

window.addEventListener("resize", () => {
	// Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
	75,
	sizes.width / sizes.height,
	0.1,
	100
);
camera.position.set(3, 5, 7);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.target.y = 3.5;
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
	antialias: true,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Tone mapping (to handle HDR)
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 2;

gui.add(renderer, "toneMapping", {
	No: THREE.NoToneMapping,
	Linear: THREE.LinearToneMapping,
	Reinhard: THREE.ReinhardToneMapping,
	Cineon: THREE.CineonToneMapping,
	ACESFilmic: THREE.ACESFilmicToneMapping,
});
gui.add(renderer, "toneMappingExposure").min(0).max(10).step(0.001);

/**
 * Animate
 */
const clock = new THREE.Clock();
const tick = () => {
	// Time
	const elapsedTime = clock.getElapsedTime();

	// Update controls
	controls.update();

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();
