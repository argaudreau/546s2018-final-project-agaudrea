var isMouseDown = false, hasMouseMoved = false, isObjectTargeted = false, isInOptions = false;

document.addEventListener('mousedown', onDocumentMouseDown, false);
document.addEventListener('mouseup', onDocumentMouseUp, false);
document.addEventListener('mousemove', onDocumentMouseMove, false);
var dg = document.getElementsByClassName('dg main a')[0];
dg.addEventListener('mouseover', function() { isInOptions = true; });
dg.addEventListener('mouseout', function() { isInOptions = false; });

// When mouse is clicked on an object, we will want to highlight it
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
function onDocumentMouseDown(event) {
  isMouseDown = true;
  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = - (event.clientY / renderer.domElement.clientHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  var intersects = raycaster.intersectObjects(options.spawnedObjects); 

  if (intersects.length > 0) {
    intersects[0].object.callback();
  }
}

function onDocumentMouseUp(event) {
  if (!hasMouseMoved && !isObjectTargeted && !isInOptions) {
    selectedObjectUUID = "";
    scene.remove(meshOutline);
  }
  isObjectTargeted = false;
  isMouseDown = false;
  // Reset translate things
  options.transform.translateX = 0;
  options.transform.translateY = 0;
  options.transform.translateZ = 0;
  options.transform.rotateX = 0;
  options.transform.rotateY = 0;
  options.transform.rotateZ = 0;
  options.transform.scaleX = 0;
  options.transform.scaleY = 0;
  options.transform.scaleZ = 0;
}

function onDocumentMouseMove(event) {
  if (isMouseDown) {
    hasMouseMoved = true;
  } else {
    hasMouseMoved = false;
  }
}