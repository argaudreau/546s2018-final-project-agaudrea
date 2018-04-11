var scene, renderer, camera, controls, gui;
var light, ambientLight;
var floor = {}, skyboxXp = {}, skyboxXn = {}, skyboxYp = {}, skyboxYn = {}, skyboxZp = {}, skyboxZn = {}, sun = {};
const FLOOR_OFFSET = 0.2;
var options = {
  spawn: {
    object: 'Rectangle',
    details: {
      rectangle: {
        width: 1,
        height: 1,
        depth: 1
      }, 
      circle: {
        radius: 1,
        widthSegments: 32,
        heightSegments: 32
      },
      cone: {
        radius: 1,
        height: 2,
        segments: 32
      },
      cylinder: {
        radius: 1,
        height: 2,
        radialSegments: 32
      },
      tetrahedron: {
        radius: 1
      },
      octahedron: {
        radius: 1
      },
      dodecahedron: {
        radius: 1
      },
      torus: {
        outerRadius: 1,
        innerRadius: 0.5,
        radialSegments: 16,
        tubularSegments: 100,
      },
      torusKnot: {
        outerRadius: 1,
        innerRadius: 0.5,
        tubularSegments: 100,
        radialSegments: 16
      }
    },
    posx: 0,
    posy: 1,
    posz: 0,
    spawn: spawnObject,
    delete: deleteObject
  },
  light: {
    ambientOn: false,
    ambientColor: 0xffffff,
    ambientIntensity: 1
  },
  transform: {
    translateX: 0,
    translateY: 0,
    translateZ: 0,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0
  },
  spawnedObjects: []
};
var selectedObjectUUID = "", meshOutline;

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
  initGUI();
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
  window.addEventListener('resize', onWindowResize, false);
  // TODO: REMOVE WHEN DONE
  var axesHelper = new THREE.AxesHelper( 5 );
  scene.add( axesHelper );
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
  // Ambient light
  ambientLight = new THREE.AmbientLight(0xffffff, 1);
}

function initGUI() {
  gui = new dat.GUI();
  var spawn = gui.addFolder('Spawn');
  var objectChoice = spawn.add(options.spawn, 'object', ['Rectangle', 'Circle', 'Cone', 'Cylinder', 'Tetrahedron', 'Octahedron', 'Dodecahedron', 'Torus', 'Torus Knot']).name('Object');
  var optionsFolder = spawn.addFolder('Spawn Options');
  optionsFolder.add(options.spawn, 'posx', -50, 50).name('X');
  optionsFolder.add(options.spawn, 'posy', -50, 50).name('Y');
  optionsFolder.add(options.spawn, 'posx', -50, 50).name('Z');
  var objectSettings = [
    optionsFolder.add(options.spawn.details.rectangle, 'width', 1, 50).name('Width'),
    optionsFolder.add(options.spawn.details.rectangle, 'height', 1, 50).name('Height'),
    optionsFolder.add(options.spawn.details.rectangle, 'depth', 1, 50).name('Depth')
  ];
  objectChoice.onFinishChange(function() {
    // Delete everything in options folder
    for (var i = 0; i < objectSettings.length; i++) {
      optionsFolder.remove(objectSettings[i]);
    }
    objectSettings = [];
    // Add shape specific controls
    switch (options.spawn.object) {
      case 'Rectangle':
        objectSettings = [
          optionsFolder.add(options.spawn.details.rectangle, 'width', 1, 50).name('Width'),
          optionsFolder.add(options.spawn.details.rectangle, 'height', 1, 50).name('Height'),
          optionsFolder.add(options.spawn.details.rectangle, 'depth', 1, 50).name('Depth')
        ];
        break;
      case 'Circle':
        objectSettings = [
          optionsFolder.add(options.spawn.details.circle, 'radius', 1, 50).name('Radius'),
          optionsFolder.add(options.spawn.details.circle, 'widthSegments', 3, 32).name('Width Segments'),
          optionsFolder.add(options.spawn.details.circle, 'heightSegments', 3, 32).name('Height Segments')
        ];
        break;
      case 'Cone':
        objectSettings = [
          optionsFolder.add(options.spawn.details.cone, 'radius', 1, 50).name('Radius'),
          optionsFolder.add(options.spawn.details.cone, 'height', 1, 50).name('Height'),
          optionsFolder.add(options.spawn.details.cone, 'segments', 3, 32).name('Segments')
        ];
        break;
      case 'Cylinder':
        objectSettings = [
          optionsFolder.add(options.spawn.details.cylinder, 'radius', 1, 50).name('Radius'),
          optionsFolder.add(options.spawn.details.cylinder, 'height', 1, 50).name('Height'),
          optionsFolder.add(options.spawn.details.cylinder, 'radialSegments', 3, 32).name('Radial Segments')
        ];
        break;
      case 'Tetrahedron':
        objectSettings = [optionsFolder.add(options.spawn.details.tetrahedron, 'radius', 1, 50).name('Radius')];
        break;
      case 'Octahedron':
        objectSettings = [
          optionsFolder.add(options.spawn.details.octahedron, 'radius', 1, 50).name('Radius')
        ];
        break;
      case 'Dodecahedron':
        objectSettings = [optionsFolder.add(options.spawn.details.dodecahedron, 'radius', 1, 50).name('Radius')];
        break;
      case 'Torus':
        objectSettings = [
          optionsFolder.add(options.spawn.details.torus, 'outerRadius', 1, 50).name('Outer Radius'),
          optionsFolder.add(options.spawn.details.torus, 'innerRadius', 1, 50).name('Inner Radius'),
          optionsFolder.add(options.spawn.details.torus, 'radialSegments', 1, 32).name('Radial Segments'),
          optionsFolder.add(options.spawn.details.torus, 'tubularSegments', 1, 32).name('Tubular Segments')
        ];
        break;
      case 'Torus Knot':
        objectSettings = [
          optionsFolder.add(options.spawn.details.torusKnot, 'outerRadius', 1, 50).name('Outer Radius'),
          optionsFolder.add(options.spawn.details.torusKnot, 'innerRadius', 1, 50).name('Inner Radius'),
          optionsFolder.add(options.spawn.details.torusKnot, 'radialSegments', 1, 32).name('Radial Segments'),
          optionsFolder.add(options.spawn.details.torusKnot, 'tubularSegments', 1, 32).name('Tubular Segments'),
        ]
    };
  });
  spawn.add(options.spawn, 'spawn').name('Spawn Object');
  spawn.add(options.spawn, 'delete').name('Delete Object');
  spawn.open();
  var transform = gui.addFolder('Transform Object');
  transform.add(options.transform, 'translateX', -0.2, 0.2).name('Translate X').listen();
  transform.add(options.transform, 'translateY', -0.2, 0.2).name('Translate Y').listen();
  transform.add(options.transform, 'translateZ', -0.2, 0.2).name('Translate Z').listen();
  transform.add(options.transform, 'rotateX', -0.2, 0.2).name('Rotate X').listen();
  transform.add(options.transform, 'rotateY', -0.2, 0.2).name('Rotate Y').listen();
  transform.add(options.transform, 'rotateZ', -0.2, 0.2).name('Rotate Z').listen();
  var lighting = gui.addFolder('Lighting');
  lighting.add(options.light, 'ambientOn', false).name('Ambient').onChange(function(value) {
    if (value) {
      scene.add(ambientLight);
    } else {
      scene.remove(ambientLight);
    }
  });
  lighting.addColor(options.light, 'ambientColor').name('Ambient Color').onChange(function(value) {
    ambientLight.color = new THREE.Color(value);
  });
  lighting.add(options.light, 'ambientIntensity', 0, 10).name('Ambient Intensity').onChange(function(value) {
    ambientLight.intensity = value;
  });
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
  translate();
  rotate();
  renderer.render(scene, camera);
}

function spawnObject() {
  var geo, mat, newMesh;
  // See what to spawn
  switch (options.spawn.object) {
    case 'Rectangle':
      geo = new THREE.BoxGeometry(options.spawn.details.rectangle.width, options.spawn.details.rectangle.height, options.spawn.details.rectangle.depth);
      break;
    case 'Circle':
      geo = new THREE.SphereGeometry(options.spawn.details.circle.radius, options.spawn.details.circle.heightSegments, options.spawn.details.circle.widthSegments);
      break;
    case 'Cone':
      geo = new THREE.ConeGeometry(options.spawn.details.cone.radius, options.spawn.details.cone.height, options.spawn.details.cone.segments);
      break;
    case 'Cylinder':
      geo = new THREE.CylinderGeometry(options.spawn.details.cylinder.radius, options.spawn.details.cylinder.radius, options.spawn.details.cylinder.height, options.spawn.details.cylinder.radialSegments);
      break;
    case 'Tetrahedron':
      geo = new THREE.TetrahedronGeometry(options.spawn.details.tetrahedron.radius, 0);
      break;
    case 'Octahedron':
      geo = new THREE.OctahedronGeometry(options.spawn.details.octahedron.radius, 0);
      break;
    case 'Dodecahedron':
      geo = new THREE.DodecahedronGeometry(options.spawn.details.dodecahedron.radius, 0);
      break;
    case 'Torus':
      geo = new THREE.TorusGeometry(options.spawn.details.torus.outerRadius, options.spawn.details.torus.innerRadius, options.spawn.details.torus.radialSegments, options.spawn.details.torus.tubularSegments);
      break;
    case 'Torus Knot':
      geo = new THREE.TorusKnotGeometry(options.spawn.details.torusKnot.outerRadius, options.spawn.details.torusKnot.innerRadius, options.spawn.details.torusKnot.tubularSegments, options.spawn.details.torusKnot.radialSegments);
      break;
  }
  mat = new THREE.MeshNormalMaterial();
  newMesh = new THREE.Mesh(geo, mat);
  newMesh.position.set(options.spawn.posx, options.spawn.posy, options.spawn.posz);
  newMesh.castShadow = true;
  newMesh.callback = function() { 
    isObjectTargeted = true;
    selectedObjectUUID = this.uuid;
    scene.remove(meshOutline);
    console.log("selected ", selectedObjectUUID);
    // Add highlight to object 
    var matOutline = new THREE.MeshBasicMaterial( { color: 0xff9d00, side: THREE.BackSide } );
    meshOutline = new THREE.Mesh(this.geometry, matOutline);
    meshOutline.position.set(this.position.x, this.position.y, this.position.z);
    meshOutline.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
    meshOutline.scale.multiplyScalar(1.1);
    scene.add(meshOutline);
  };
  options.spawnedObjects.push(newMesh);
  scene.add(newMesh);
}

function deleteObject() {
  if (selectedObjectUUID !== "") {
    // Remove outline
    scene.remove(meshOutline);
    // Get the object that's selected
    var objectToRemove = options.spawnedObjects.find(function(element) { return element.uuid === selectedObjectUUID; });
    // Remove it from the scene
    scene.remove(objectToRemove);
    // Remove it from spawned objects
    options.spawnedObjects.splice(options.spawnedObjects.indexOf(objectToRemove), 1);
    console.log("deleted " + selectedObjectUUID);
    selectedObjectUUID = "";
  } else {
    alert("No object selected. Please click an object first to delete it.");
  }
}

function translate() {
  if (selectedObjectUUID == "") return;
  var object = options.spawnedObjects.find(function(element) { return element.uuid === selectedObjectUUID; });
  if (options.transform.translateX != 0) {
    object.position.x += options.transform.translateX;
    meshOutline.position.x += options.transform.translateX;
  }
  if (options.transform.translateY != 0) {
    object.position.y += options.transform.translateY;
    meshOutline.position.y += options.transform.translateY;
  }
  if (options.transform.translateZ != 0) {
    object.position.z += options.transform.translateZ;
    meshOutline.position.z += options.transform.translateZ;
  }
}

function rotate() {
  if (selectedObjectUUID == "") return;
  var object = options.spawnedObjects.find(function(element) { return element.uuid === selectedObjectUUID; });
  if (options.transform.rotateX != 0) {
    object.rotation.x += options.transform.rotateX;
    meshOutline.rotation.x += options.transform.rotateX;
  }
  if (options.transform.rotateY != 0) {
    object.rotation.y += options.transform.rotateY;
    meshOutline.rotation.y += options.transform.rotateY;
  }
  if (options.transform.rotateZ != 0) {
    object.rotation.z += options.transform.rotateZ;
    meshOutline.rotation.z += options.transform.rotateZ;
  }
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

