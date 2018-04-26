var scene, renderer, camera, controls, gui;
var light, ambientLight;
var axesHelper = new THREE.AxesHelper(4);
var floor = {}, skyboxXp = {}, skyboxXn = {}, skyboxYp = {}, skyboxYn = {}, skyboxZp = {}, skyboxZn = {}, sun = {};
const FLOOR_OFFSET = 0.2;
var options = {
  spawn: {
    object: 'Rectangle',
    texture: 'Brick',
    color: 0x123456,
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
    constantRotate: false,
    translateX: 0,
    translateY: 0,
    translateZ: 0,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    scaleX: 0,
    scaleY: 0,
    scaleZ: 0
  },
  environment: {
    floorTexture: 'Tile',
    floorSize: 'Small',
    skyboxColor: 0xb3ff,
    axesHelper: true,
    sun: {
      distance: 10,
      height: 10,
      intensity: 3,
      orbit: false,
      orbitSpeed: 0.5
    }
  },
  spawnedObjects: []
};
var selectedObjectUUID = "", meshOutline;

init();
run();

function init() {
  // Initialize camera and scene
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000);
  camera.position.set(0, 5, 10);
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
  scene.add(axesHelper);
}

function initFloor() {
  floor.geometry = new THREE.BoxGeometry(10, FLOOR_OFFSET, 10);
  floor.material = new THREE.MeshStandardMaterial({ 
    metalness: 0,
    map: new THREE.TextureLoader().load('textures/tile.jpg') 
  });
  floor.mesh = new THREE.Mesh(floor.geometry, floor.material);
  floor.mesh.position.set(0, -(FLOOR_OFFSET/2), 0);
  floor.mesh.receiveShadow = true;
  scene.add(floor.mesh);
}

function initSkybox() {
  // USE FOR TEXTURES:  matSkybox = getTextureArray('img/beach-');
  var SIZE = 100, COLOR = options.environment.skyboxColor;
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
  skyboxXp.mesh.receiveShadow = true;
  skyboxXn.mesh = new THREE.Mesh(skyboxXn.geometry, skyboxMaterial);
  skyboxXn.mesh.position.set(-(SIZE/2), 0, 0);
  skyboxXn.mesh.receiveShadow = true;
  skyboxYp.mesh = new THREE.Mesh(skyboxYp.geometry, skyboxMaterial);
  skyboxYp.mesh.position.set(0, (SIZE/2), 0);
  skyboxYp.mesh.receiveShadow = true;
  skyboxYn.mesh = new THREE.Mesh(skyboxYn.geometry, skyboxMaterial);
  skyboxYn.mesh.position.set(0, -(SIZE/2), 0);
  skyboxYn.mesh.receiveShadow = true;
  skyboxZp.mesh = new THREE.Mesh(skyboxZp.geometry, skyboxMaterial);
  skyboxZp.mesh.position.set(0, 0, (SIZE/2));
  skyboxZp.mesh.receiveShadow = true;
  skyboxZn.mesh = new THREE.Mesh(skyboxZn.geometry, skyboxMaterial);
  skyboxZn.mesh.position.set(0, 0, -(SIZE/2));
  skyboxXn.mesh.receiveShadow = true;
  // Add meshes to scene
  scene.add(skyboxXp.mesh);
  scene.add(skyboxXn.mesh);
  scene.add(skyboxYp.mesh);
  scene.add(skyboxYn.mesh);
  scene.add(skyboxZp.mesh);
  scene.add(skyboxZn.mesh);
}

function initLighting() {
  var loader = new THREE.TextureLoader();
  // Make the "sun"
  sun.geometry = new THREE.SphereGeometry(2, 32, 32);
  // sun.material = new THREE.MeshBasicMaterial({color: 0xFFF9C4});
  sun.material = new THREE.MeshBasicMaterial({ map: loader.load('textures/sun.jpg') });
  sun.mesh = new THREE.Mesh(sun.geometry, sun.material);
  // Make the lighting come from sun's location
  light = new THREE.PointLight(0xffffff, options.environment.sun.intensity, 100, 2);
  light.position.set(options.environment.sun.distance, options.environment.sun.height, options.environment.sun.distance);
  light.castShadow = true;
  scene.add(light);
  light.add(sun.mesh);
  // Ambient light
  ambientLight = new THREE.AmbientLight(0xffffff, 1);
}

function initGUI() {
  gui = new dat.GUI();
  var spawn = gui.addFolder('Spawn');
  var optionsFolder = spawn.addFolder('Spawn Options');
  optionsFolder.add(options.spawn, 'texture', ['Brick', 'Wood', 'Tile', 'Grass', 'Concrete', 'Color', 'Wireframe']).name('Texture').listen();
  optionsFolder.add(options.spawn, 'posx', -50, 50).name('X');
  optionsFolder.add(options.spawn, 'posy', -50, 50).name('Y');
  optionsFolder.add(options.spawn, 'posx', -50, 50).name('Z');
  var objectChoice = spawn.add(options.spawn, 'object', ['Rectangle', 'Circle', 'Cone', 'Cylinder', 'Tetrahedron', 'Octahedron', 'Dodecahedron', 'Torus', 'Torus Knot']).name('Object');
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
  transform.add(options.transform, 'constantRotate', false).name('Always Rotate').listen();
  transform.add(options.transform, 'translateX', -0.2, 0.2).name('Translate X').listen();
  transform.add(options.transform, 'translateY', -0.2, 0.2).name('Translate Y').listen();
  transform.add(options.transform, 'translateZ', -0.2, 0.2).name('Translate Z').listen();
  transform.add(options.transform, 'rotateX', -0.2, 0.2).name('Rotate X').listen();
  transform.add(options.transform, 'rotateY', -0.2, 0.2).name('Rotate Y').listen();
  transform.add(options.transform, 'rotateZ', -0.2, 0.2).name('Rotate Z').listen();
  transform.add(options.transform, 'scaleX', -0.2, 0.2).name('Scale X').listen();
  transform.add(options.transform, 'scaleY', -0.2, 0.2).name('Scale Y').listen();
  transform.add(options.transform, 'scaleZ', -0.2, 0.2).name('Scale Z').listen();
  var lighting = gui.addFolder('Lighting');
  var sunFolder = lighting.addFolder('Sun');
  sunFolder.add(options.environment.sun, 'intensity', 0, 10).name('Intensity').onChange(function(value) {
    light.intensity = value;
  }).listen();
  sunFolder.add(options.environment.sun, 'distance', 0, 50).name('Distance').onChange(function(value) {
    light.position.x = value;
  });
  sunFolder.add(options.environment.sun, 'height', -50, 50).name('Height').onChange(function(value) {
    light.position.y = value;
  });
  sunFolder.add(options.environment.sun, 'orbit').name('Orbit').listen();
  sunFolder.add(options.environment.sun, 'orbitSpeed', 0, 5).name('Orbit Speed').listen();
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
  var environment = gui.addFolder('Environment');
  environment.add(options.environment, 'floorTexture', ['Wood', 'Concrete', 'Grass', 'Brick', 'Tile']).name('Floor Texture').onChange(function(value) {
    var textureImage = '';
    switch(value) {
      case 'Wood':
        textureImage = 'textures/wood.jpg';
        break;
      case 'Concrete':
        textureImage = 'textures/concrete.jpg';
        break;
      case 'Grass':
        textureImage = 'textures/grass.jpg';
        break;
      case 'Brick':
        textureImage = 'textures/brick.jpg';
        break;
      case 'Tile':
        textureImage = 'textures/tile.jpg';
        break;
    };
    floor.mesh.material = new THREE.MeshStandardMaterial({
      metalness: 0,
      map: new THREE.TextureLoader().load(textureImage)
    });
  });
  environment.add(options.environment, 'floorSize', ['Small', 'Medium', 'Large', 'X-Large', 'Massive']).name('Floor Size').onChange(function(value) {
    switch(value) {
      case 'Small':
        floor.mesh.geometry = new THREE.BoxGeometry(10, FLOOR_OFFSET, 10);
        break;
      case 'Medium':
        floor.mesh.geometry = new THREE.BoxGeometry(25, FLOOR_OFFSET, 25);
        break;
      case 'Large':
        floor.mesh.geometry = new THREE.BoxGeometry(40, FLOOR_OFFSET, 40);
        break;
      case 'X-Large':
        floor.mesh.geometry = new THREE.BoxGeometry(55, FLOOR_OFFSET, 55);
        break;
      case 'Massive':
        floor.mesh.geometry = new THREE.BoxGeometry(70, FLOOR_OFFSET, 70);
        break;
    }
  });
  environment.addColor(options.environment, 'skyboxColor').name('Skybox Color').onChange(function(value) {
    skyboxXn.mesh.material.color = new THREE.Color(value);
    skyboxXp.mesh.material.color = new THREE.Color(value);
    skyboxYn.mesh.material.color = new THREE.Color(value);
    skyboxYp.mesh.material.color = new THREE.Color(value);
    skyboxZn.mesh.material.color = new THREE.Color(value);
    skyboxZp.mesh.material.color = new THREE.Color(value);
  });
  environment.add(options.environment, 'axesHelper').name('Axes Helper').onChange(function(value) {
    value ? scene.add(axesHelper) : scene.remove(axesHelper);
  });
}

function initCameraControls() {
  // Activate mouse camera controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.panningMode = THREE.HorizontalPanning;
  controls.minDistance = 0;
  controls.maxDistance = 50;
  controls.maxPolarAngle = Math.PI;
}

function run() {
  requestAnimationFrame(run);
  translate();
  rotate();
  scale();
  constantRotate();
  orbitSun();
  renderer.render(scene, camera);
}

function spawnObject() {
  var geo, mat, newMesh;
  // See what to spawn and make the geometry
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
  // Make the material
  switch (options.spawn.texture) {
    case 'Brick':
      mat = new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load('textures/brick.jpg') });
      break;
    case 'Wood':
      mat = new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load('textures/wood.jpg') });
      break;
    case 'Tile':
      mat = new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load('textures/tile.jpg') });
      break;
    case 'Grass':
      mat = new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load('textures/grass.jpg') });
      break;
    case 'Concrete':
      mat = new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load('textures/concrete.jpg') });
      break;
    case 'Color':
      mat = new THREE.MeshNormalMaterial({});
      break;
    case 'Wireframe':
      mat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true
      });
      break;
  }
  // Make the mesh
  newMesh = new THREE.Mesh(geo, mat);
  newMesh.position.set(options.spawn.posx, options.spawn.posy, options.spawn.posz);
  newMesh.castShadow = true;
  newMesh.receiveShadow = true;
  // When object is clicked on
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

function scale() {
  if (selectedObjectUUID == "") return;
  var object = options.spawnedObjects.find(function(element) { return element.uuid === selectedObjectUUID; });
  if (options.transform.scaleX != 0) {
    object.scale.x += options.transform.scaleX;
    meshOutline.scale.x += options.transform.scaleX;
  }
  if (options.transform.scaleY != 0) {
    object.scale.y += options.transform.scaleY;
    meshOutline.scale.y += options.transform.scaleY;
  }
  if (options.transform.scaleZ != 0) {
    object.scale.z += options.transform.scaleZ;
    meshOutline.scale.z += options.transform.scaleZ;
  }
}

function constantRotate() {
  if (options.transform.constantRotate) {
    for (var i = 0; i < options.spawnedObjects.length; i++) {
      options.spawnedObjects[i].rotation.x += 0.01;
      options.spawnedObjects[i].rotation.y += 0.02;
      if (options.spawnedObjects[i].uuid === selectedObjectUUID) {
        meshOutline.rotation.x += 0.01;
        meshOutline.rotation.y += 0.02;
      }
    }
  }
}

function orbitSun() {
  if (options.environment.sun.orbit) {
    var angle = Math.atan2(light.position.z, light.position.x); 
    angle += (Math.PI / 180) * options.environment.sun.orbitSpeed;
    light.position.x = (options.environment.sun.distance * Math.cos(angle));
    light.position.z = (options.environment.sun.distance * Math.sin(angle));
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

