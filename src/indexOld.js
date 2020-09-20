import * as THREE from "./node_modules/three/build/three.module.js";
import { OrbitControls } from "./node_modules/three/examples/jsm/controls/OrbitControls.js";

var camera, canvas, scene, renderer, mesh, controls;
var numberOfVerticies = 100;
var coinWidth = 5;
var coinThikness = 0.2;
var color = new THREE.Color("#A9A9ff");
var resized = false;
var marginLeft = document.getElementById("container").offsetLeft;
var marginTop = document.getElementById("container").offsetTop;

function init() {
  canvas = document.querySelector("#container canvas");
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
  });

  camera = new THREE.PerspectiveCamera(40, 2, 1, 1000);

  camera.position.z = 9;
  camera.position.set(15, 0, 10);

  scene = new THREE.Scene();

  var ambientLight = new THREE.AmbientLight(0xcccccc, 1);
  scene.add(ambientLight);

  var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  scene.add(directionalLight);

  scene.add(camera);

  var coin = new THREE.CylinderGeometry(
    coinWidth,
    coinWidth,
    coinThikness,
    numberOfVerticies
  );

  var textureLoader = new THREE.TextureLoader();

  var textureFront = textureLoader.load("textures/omo_base.jpg");
  var textureBack = textureLoader.load("textures/projects_base.jpg");
  textureBack.wrapS = THREE.RepeatWrapping;
  textureBack.repeat.x = -1;
  textureBack.flipY = false;

  var bumpFront = textureLoader.load("textures/omo_bump.jpg");
  var bumpBack = textureLoader.load("textures/projects_bump.jpg");
  bumpBack.wrapS = THREE.RepeatWrapping;
  bumpBack.repeat.x = -1;
  bumpBack.flipY = false;

  var displacementFont = textureLoader.load("textures/omo_displacement.jpg");
  var displacementBack = textureLoader.load(
    "textures/projects_displacement.jpg"
  );

  var coinMaterials = [
    new THREE.MeshPhongMaterial({ color: 0xcccccc }),
    new THREE.MeshPhongMaterial({
      map: textureBack,
      bumpMap: bumpBack,
      bumpScale: 0.2,
      displacementMap: displacementBack,
      displacementScale: 0.01,
      displacementBias: 0.01,
    }),
    new THREE.MeshPhongMaterial({
      map: textureFront,
      bumpMap: bumpFront,
      bumpScale: 0.2,
      displacementMap: displacementFont,
      displacementScale: 0.01,
      displacementBias: 0,
    }),
  ];

  mesh = new THREE.Mesh(coin, coinMaterials);

  scene.add(mesh);

  mesh.scale.set(-1, -1, 1);

  mesh.rotation.y = 1.57;
  mesh.rotation.z = 1.57;

  resizeCanvasToDisplaySize();

  window.addEventListener("resize", () => {
    resized = true;
  });
}

function resizeCanvasToDisplaySize() {
  console.log("resizeCanvasToDisplaySize");
  resized = false;
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (canvas.width !== width || canvas.height !== height) {
    // you must pass false here or three.js sadly fights the browser
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
}

function animate() {
  requestAnimationFrame(animate);
  mesh.rotation.y += 0.008;
  renderer.render(scene, camera);
  if (resized) {
    resizeCanvasToDisplaySize();
  }
}

window.onload = function () {
  init();
  animate();

  var raycaster = new THREE.Raycaster();
  var mouse = new THREE.Vector2();
  var intersects = [];
  var faceIdx1 = -1;

  var start;
  var end;
  var delta;
  var clickDuration = 0.25;

  controls = new OrbitControls(camera, renderer.domElement);
  console.log("controls", controls);

  /* controls.touches = {
    ONE: THREE.TOUCH.ROTATE,
  }; */
  controls.enabled = true;
  controls.enableZoom = false;
  controls.enableRotate = true;

  controls.minPolarAngle = Math.PI / 2;
  controls.maxPolarAngle = Math.PI / 2;

  function onDocumentMouseDown(event) {
    console.log("mouse down");
    event.preventDefault();
    controls.enabled = true;
    controls.enableRotate = true;

    // controls.enabled = !controls.enabled;
    start = new Date();
  }

  function onDocumentMouseUp(event) {
    console.log("mouse up");
    event.preventDefault();
    controls.enabled = false;
    end = new Date();
    delta = (end - start) / 1000.0;
    if (delta < clickDuration) {
      handleClick();
    } else {
      console.log("press");
    }
  }

  function onDocumentMouseMove(event) {
    // console.log("mouse move");
    event.preventDefault();
    raycaster.setFromCamera(mouse, camera);
    intersects = raycaster.intersectObjects([mesh]);
    var canvas = document.getElementById("canvas");
    /*  if (intersects.length > 0) {
      canvas.style.cursor = "pointer";
    } else {
      canvas.style.cursor = "default";
    } */

    if (
      event.clientX >= marginLeft &&
      event.clientX <= canvas.clientWidth + marginLeft &&
      event.clientY >= marginTop &&
      event.clientY <= canvas.clientHeight + marginTop
    ) {
      mouse.x = ((event.clientX - marginLeft) / canvas.clientWidth) * 2 - 1;
      mouse.y = -((event.clientY - marginTop) / canvas.clientHeight) * 2 + 1;
    } else {
      mouse.x = 1;
      mouse.y = 1;
    }
  }

  function onDocumentTouchStart(event) {
    start = new Date();
  }

  function onDocumentTouchEnd(event) {
    console.log("onDocumentTouchEnd");
    end = new Date();
    delta = (end - start) / 1000.0;

    if (
      event.changedTouches[0].clientX >= marginLeft &&
      event.changedTouches[0].clientX <= canvas.clientWidth + marginLeft &&
      event.changedTouches[0].clientY >= marginTop &&
      event.changedTouches[0].clientY <= canvas.clientHeight + marginTop
    ) {
      mouse.x =
        ((event.changedTouches[0].clientX - marginLeft) / canvas.clientWidth) *
          2 -
        1;
      mouse.y =
        -((event.changedTouches[0].clientY - marginTop) / canvas.clientHeight) *
          2 +
        1;

      if (delta < clickDuration) {
        handleClick();
      }
    } else {
      mouse.x = 1;
      mouse.y = 1;
    }
  }

  function handleClick() {
    console.log("click function");
    raycaster.setFromCamera(mouse, camera);
    intersects = raycaster.intersectObjects([mesh]);
    //controls.enabled = false;

    if (intersects.length === 0) {
      console.log("return");
      return;
    }
    // find the new indices of faces
    faceIdx1 = intersects[0].faceIndex;
    if (faceIdx1 > numberOfVerticies * 2 && faceIdx1 <= numberOfVerticies * 3) {
      //controls.enabled = false;
      location.href = "contact.html";
    } else if (
      faceIdx1 > numberOfVerticies * 3 &&
      faceIdx1 <= numberOfVerticies * 4
    ) {
      location.href = "about.html";
    }
  }

  document.addEventListener("mousedown", onDocumentMouseDown, false);
  document.addEventListener("mouseup", onDocumentMouseUp, false);
  document.addEventListener("mousemove", onDocumentMouseMove, false);
  /* document.addEventListener("touchstart", onDocumentTouchStart, false);
  document.addEventListener("touchend", onDocumentTouchEnd, false); */
  // document.addEventListener("click", handleClick, false);
};
