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

camera.position.x = -12.282480442019207;
camera.position.y = 17.69622997136163;
camera.position.z = -37.46751429853807;




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
    "Charmander",
    "Chicken",

]

const character = {
    instance: null,
    moveDistence: 2,
    jumpHeight: 1,
    isMoving: false,
    moveDuration: 0.2
}

const intersectObjects = []
let intersectObject = ""

loader.load('portfolio.glb', function (glb) {
    glb.scene.traverse(child => {
        if (intersectObjectNames.includes(child.name)) {
            intersectObjects.push(child)
        }
        if (child.isMesh && child.name != "Nameboard") {
            child.castShadow = true
            child.receiveShadow = true
        }

        if (child.name == "Character") {
            character.instance = child
            console.log(child)
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

function moveCharacter(targetPosition, targetRotaion) {
    character.isMoving = true
    const t1 = gsap.timeline({
        onComplete: () => {
            character.isMoving = false
        }
    })
    t1.to(character.instance.position, {
        x: targetPosition.x,
        z: targetPosition.z,
        duration: character.moveDuration
    }, 0)

    t1.to(character.instance.rotation, {
        y: targetRotaion,
        duration: character.moveDuration
    }, 0)

    t1.to(character.instance.position, {
        y: character.instance.position.y + character.jumpHeight,
        duration: character.moveDuration / 2,
        yoyo: true,
        repeat: 1
    }, 0)
}

function onKeyDown(event) {
    const targetPosition = new THREE.Vector3().copy(character.instance.position)
    let targetRotaion = 0

    if (character.isMoving) {
        return
    }

    switch (event.key.toLowerCase()) {
        case "w":
        case "arrowup":
            targetPosition.z += character.moveDistence
            targetRotaion = THREE.MathUtils.degToRad(-90)
            break
        case "s":
        case "arrowdown":
            targetPosition.z -= character.moveDistence
            targetRotaion = THREE.MathUtils.degToRad(90)
            break
        case "a":
        case "arrowleft":
            targetPosition.x += character.moveDistence
            targetRotaion = THREE.MathUtils.degToRad(0)
            break
        case "d":
        case "arrowright":
            targetPosition.x -= character.moveDistence
            targetRotaion = THREE.MathUtils.degToRad(180)
            break
    }

    moveCharacter(targetPosition, targetRotaion)
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

function jumpCharacter(meshId) {
    const mesh = scene.getObjectByName(meshId)
    const jumpHeight = 2
    const jumpDuration = 0.5

    const t2 = gsap.timeline()

    t2.to(mesh.scale, {
        x: 1.2,
        y: 0.8,
        z: 1.2,
        duration: jumpDuration,
        yoyo: true,
        repeat: 1,
        ease: "power2.out"
    }, 0)

    t2.to(mesh.position,
        {
            y: mesh.position.y + jumpHeight,
            duration: jumpDuration / 2,
            yoyo: true,
            repeat: 1
        }, 0
    )
}

function handleOnClick() {
    if (intersectObject != "") {
        if (["Bulbasaur", "Squirtle", "Pikachu", "Charmander", "Chicken"].includes(intersectObject)) {
            jumpCharacter(intersectObject)
        }
    }
    console.log(intersectObject)
    contentShow(intersectObject)
}

function handleExit() {
    document.querySelector(".mainbanner").classList.toggle("hiddenclass")
}

document.querySelector(".exit").addEventListener("click", handleExit)
renderer.setAnimationLoop(animate);
window.addEventListener("resize", handleResize)
window.addEventListener("click", handleOnClick)
window.addEventListener("pointermove", onPointerMove)
window.addEventListener("keydown", onKeyDown)