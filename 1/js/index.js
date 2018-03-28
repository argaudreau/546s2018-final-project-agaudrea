var scene, renderer, camera, controls, light;
var floor = {}, skyboxXp = {}, skyboxXn = {}, skyboxYp = {}, skyboxYn = {}, skyboxZp = {}, skyboxZn = {}, sun = {};
var demoBox = {};
const FLOOR_OFFSET = 0.2;

init();
run();

function init() {
  // Initialize camera and scene
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000);
  camera.position.set(0, 1, 10);
  scene = new THREE.Scene();
  // Initialize skybox, floor, and lighting
  initSkybox();
  initFloor();
  initLighting();
  // Set up the renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  // Set up the controls
  initCameraControls();
  // Render!
  renderer.render(scene, camera);
  // If window gets resized
  window.addEventListener( 'resize', onWindowResize, false );

  // TODO: REMOVE WHEN DONE
  makeDemoBox();
  var axesHelper = new THREE.AxesHelper( 5 );
  //scene.add( axesHelper );
}

function initFloor() {
  floor.geometry = new THREE.BoxGeometry(10, FLOOR_OFFSET, 10);
  floor.material = new THREE.MeshStandardMaterial();
  floor.mesh = new THREE.Mesh(floor.geometry, floor.material);
  floor.mesh.position.set(0, -(FLOOR_OFFSET/2), 0);
  floor.mesh.receiveShadow = true;
  scene.add(floor.mesh);
}

function initSkybox() {
  // USE FOR TEXTURES:  matSkybox = getTextureArray('img/beach-');
  var SIZE = 100, COLOR = 0xf44336;
  // Set up geometries
  skyboxXp.geometry = new THREE.BoxGeometry(1, SIZE, SIZE);
  skyboxXn.geometry = new THREE.BoxGeometry(1, SIZE, SIZE);
  skyboxYp.geometry = new THREE.BoxGeometry(SIZE, 1, SIZE);
  skyboxYn.geometry = new THREE.BoxGeometry(SIZE, 1, SIZE);
  skyboxZp.geometry = new THREE.BoxGeometry(SIZE, SIZE, 1);
  skyboxZn.geometry = new THREE.BoxGeometry(SIZE, SIZE, 1);
  // Set up materials
  var skyboxMaterial = new THREE.MeshStandardMaterial({color: COLOR});
  // Make the meshes
  skyboxXp.mesh = new THREE.Mesh(skyboxXp.geometry, skyboxMaterial);
  skyboxXp.mesh.position.set((SIZE/2), 0, 0);
  skyboxXn.mesh = new THREE.Mesh(skyboxXn.geometry, skyboxMaterial);
  skyboxXn.mesh.position.set(-(SIZE/2), 0, 0);
  skyboxYp.mesh = new THREE.Mesh(skyboxYp.geometry, skyboxMaterial);
  skyboxYp.mesh.position.set(0, (SIZE/2), 0);
  skyboxYn.mesh = new THREE.Mesh(skyboxYn.geometry, skyboxMaterial);
  skyboxYn.mesh.position.set(0, -(SIZE/2), 0);
  skyboxZp.mesh = new THREE.Mesh(skyboxZp.geometry, skyboxMaterial);
  skyboxZp.mesh.position.set(0, 0, (SIZE/2));
  skyboxZn.mesh = new THREE.Mesh(skyboxZn.geometry, skyboxMaterial);
  skyboxZn.mesh.position.set(0, 0, -(SIZE/2));
  // Add meshes to scene
  scene.add(skyboxXp.mesh);
  scene.add(skyboxXn.mesh);
  scene.add(skyboxYp.mesh);
  scene.add(skyboxYn.mesh);
  scene.add(skyboxZp.mesh);
  scene.add(skyboxZn.mesh);
}

function initLighting() {
  // Make the "sun"
  sun.geometry = new THREE.SphereGeometry(2, 32, 32);
  sun.material = new THREE.MeshBasicMaterial({color: 0xFFF9C4});
  sun.mesh = new THREE.Mesh(sun.geometry, sun.material);
  // Make the lighting come from sun's location
  light = new THREE.PointLight(0xffffff, 3, 100, 2);
  light.position.set(10, 10, 10);
  light.castShadow = true;
  scene.add(light);
  light.add(sun.mesh);
}

function initCameraControls() {
  // Activate mouse camera controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 1;
  controls.panningMode = THREE.HorizontalPanning;
  controls.minDistance = 0;
  controls.maxDistance = 50;
  controls.maxPolarAngle = Math.PI;
}

function run() {
  requestAnimationFrame(run);
  demoBox.mesh.rotation.x += 0.01;
  demoBox.mesh.rotation.y += 0.02;
  renderer.render(scene, camera);
}

function makeDemoBox() {
  demoBox.geometry = new THREE.BoxGeometry(1,1,1);
  demoBox.material = new THREE.MeshNormalMaterial();
  demoBox.mesh = new THREE.Mesh(demoBox.geometry, demoBox.material);
  demoBox.mesh.position.set(0, 1.5, 0);
  demoBox.mesh.castShadow = true;
  scene.add(demoBox.mesh);
}

// Returns an array that contains the materials for a texture
function getTextureArray(prefix) {
  var materials = [], sides = ['xpos', 'xneg', 'ypos', 'yneg', 'zpos', 'zneg'];
  for (var i = 0; i < 6; i++) {
    materials.push(new THREE.MeshBasicMaterial({ 
      map: new THREE.TextureLoader().load(prefix + sides[i] + ".jpg" ),
      side: THREE.BackSide
    }));
  }
  return materials;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}