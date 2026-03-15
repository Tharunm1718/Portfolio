import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const canvas = document.getElementById("experience-canvas")
const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2(-999, -999)
const sizes =
{
    "width": window.innerWidth,
    "height": window.innerHeight
}

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
document.body.appendChild(renderer.domElement);

const loader = new GLTFLoader();

const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.castShadow = true
sun.position.set(75, 80, 0)
sun.shadow.mapSize.width = 4096;
sun.shadow.mapSize.height = 4096;
sun.shadow.camera.left = -100;
sun.shadow.camera.right = 100;
sun.shadow.camera.top = 100;
sun.shadow.camera.bottom = -100;
sun.shadow.normalBias = 0.4
scene.add(sun);

const helper = new THREE.DirectionalLightHelper(sun, 5, 0xff0000);
scene.add(helper)
const shadowHelper = new THREE.CameraHelper(sun.shadow.camera);
scene.add(shadowHelper);


const light = new THREE.AmbientLight(0x404040, 3);
scene.add(light);

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);

camera.position.x = -12.096718471616615;
camera.position.y = 16.596960998487443;
camera.position.z = -43.5403799968879;


const controls = new OrbitControls(camera, canvas);
controls.update();

const mainBannerContent = {
    "Project_1":
    {
        title: "Project_1",
        Content: "Thisis project one, Hello World"
    },
    "Project_2":
    {
        title: "Project_2",
        Content: "Thisis project two, Hello World"
    },
    "Project_3":
    {
        title: "Project_3",
        Content: "Thisis project three, Hello World"
    },
}

const intersectObjectNames = [
    "Project_1",
    "Project_2",
    "Project_3",
    "Bulbasaur",
    "Squirtle",
    "Pikachu",
]

const intersectObjects = []
let intersectObject = ""

loader.load('portfolio.glb', function (glb) {
    glb.scene.traverse(child => {
        if (intersectObjectNames.includes(child.name)) {
            intersectObjects.push(child)
        }
        if (child.isMesh) {
            child.castShadow = true
            child.receiveShadow = true
        }
    })
    scene.add(glb.scene);
}, undefined, function (error) {
    console.error(error);
});

function contentShow(name) {
    const content = mainBannerContent[name]
    if (content) {
        document.querySelector(".title").textContent = content.title
        document.querySelector(".content").textContent = content.Content
        document.querySelector(".mainbanner").classList.toggle("hiddenclass")
    }

}

function handleResize() {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
}

function onPointerMove(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1
}

function animate() {
   //console.log(camera.position)
    raycaster.setFromCamera(pointer, camera)
    const intersects = raycaster.intersectObjects(intersectObjects)

    if (intersects.length > 0) {
        document.body.style.cursor = "pointer"
    }

    else {
        document.body.style.cursor = "default"
        intersectObject = ""

    }
    for (let i = 0; i < intersects.length; i++) {
        intersectObject = intersects[0].object.parent.name
    }

    renderer.render(scene, camera)
}

function handleOnClick() {
    console.log(intersectObject)
    contentShow(intersectObject)
}

function handleExit()
{
    document.querySelector(".mainbanner").classList.toggle("hiddenclass")
}

document.querySelector(".exit").addEventListener("click" , handleExit)
renderer.setAnimationLoop(animate);
window.addEventListener("resize", handleResize)
window.addEventListener("click", handleOnClick)
window.addEventListener("pointermove", onPointerMove)