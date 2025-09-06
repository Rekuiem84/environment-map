import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import {
	GLTFLoader,
	GroundedSkybox,
	HDRLoader,
} from "three/examples/jsm/Addons.js";

const gltfLoader = new GLTFLoader();
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

/**
 * Environment map
 */
// LDR Cube texture (6 images)
// On vient projeter les 6 faces d'un cube autour de la scène
// const environmentMap = cubeTextureLoader.load([
// 	"./environmentMaps/2/px.png",
// 	"./environmentMaps/2/nx.png",
// 	"./environmentMaps/2/py.png",
// 	"./environmentMaps/2/ny.png",
// 	"./environmentMaps/2/pz.png",
// 	"./environmentMaps/2/nz.png",
// ]);

// HDR (RGBE) equirectangular texture (very good lighting, but heavier to load)
// const environmentMap = hdrLoader.load(
// 	"./environmentMaps/blender-lights-2k.hdr",
// 	(environmentMap) => {
// 		// on indique comment projeter la texture
// 		environmentMap.mapping = THREE.EquirectangularReflectionMapping;
// 	}
// );

// LDR equirectangular texture (medium quality, fast to load)
// const environmentMap = textureLoader.load("./environmentMaps/custom/japan.jpg"); //images format jpg, png, ... (LDR)
// environmentMap.mapping = THREE.EquirectangularReflectionMapping;
// environmentMap.colorSpace = THREE.SRGBColorSpace; // corrige les couleurs

// Grounded HDR
// Créé un sol avec la environment map (skybox)
// hdrLoader.load("./environmentMaps/2/2k.hdr", (environmentMap) => {
// 	environmentMap.mapping = THREE.EquirectangularReflectionMapping;
// 	// environmentMap.colorSpace = THREE.SRGBColorSpace;
// 	scene.environment = environmentMap;

// 	// Skybox
// 	const skybox = new GroundedSkybox(environmentMap, 15, 60);
// 	skybox.position.y = 15;
// 	scene.add(skybox);
// });

/**
 * Real time envmap
 */
// Permet d'avoir un environnement dynamique en temps réel (reflets)
const environmentMap = textureLoader.load("./environmentMaps/custom/cabin.jpg");
environmentMap.mapping = THREE.EquirectangularReflectionMapping;
environmentMap.colorSpace = THREE.SRGBColorSpace;

// scene.environmentIntensity = 1;
// scene.environment = environmentMap;
scene.background = environmentMap;

// Donut light
const donut = new THREE.Mesh(
	new THREE.TorusGeometry(8, 0.4),
	new THREE.MeshBasicMaterial({ color: new THREE.Color(10, 10, 10) }) // couleur non accessible en rgb mais très lumineuse (HDR)
);
donut.position.set(0, 5, 0);
donut.layers.enable(1); // on autorise à être filmé par la caméra couche 1 (cube camera)
scene.add(donut);

// Cube render target
const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
	type: THREE.HalfFloatType,
});
scene.environment = cubeRenderTarget.texture;

const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRenderTarget);
cubeCamera.layers.set(1); // display only the layer 1

gui.add(scene, "environmentIntensity").min(0).max(10).step(0.001);
gui.add(scene, "backgroundBlurriness").min(0).max(1).step(0.001);
gui.add(scene, "backgroundIntensity").min(0).max(10).step(0.001);
gui
	.add(scene.backgroundRotation, "y")
	.min(0)
	.max(Math.PI * 2)
	.step(0.001)
	.name("backgroundRotationY");
gui
	.add(scene.environmentRotation, "y")
	.min(0)
	.max(Math.PI * 2)
	.step(0.001)
	.name("environmentRotationY");

/**
 * Torus Knot
 */
const torusKnot = new THREE.Mesh(
	new THREE.TorusKnotGeometry(1, 0.4, 100, 16),
	new THREE.MeshStandardMaterial({
		roughness: 0.1,
		metalness: 0.9,
		color: 0xaaaaaa,
	})
);
torusKnot.position.x = 4;
torusKnot.position.y = 4;
scene.add(torusKnot);

/**
 * Sphere
 */
const sphere = new THREE.Mesh(
	new THREE.SphereGeometry(1.5, 32, 32),
	new THREE.MeshStandardMaterial({
		roughness: 0,
		metalness: 1,
		color: 0xaaaaaa,
	})
);
sphere.position.x = -4;
sphere.position.y = 4;
scene.add(sphere);

/**
 * Model
 */
gltfLoader.load("./models/FlightHelmet/glTF/FlightHelmet.gltf", (gltf) => {
	const model = gltf.scene;
	model.scale.setScalar(10);
	scene.add(model);
});

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
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();
const tick = () => {
	// Time
	const elapsedTime = clock.getElapsedTime();

	// Real time envmap
	if (donut) {
		donut.rotation.x = elapsedTime * 1.2;
		cubeCamera.update(renderer, scene);
	}

	// Update controls
	controls.update();

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();
