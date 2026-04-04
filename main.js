(function () {
    const bar = document.getElementById('loading-bar');
    const percent = document.getElementById('loading-percent');
    const startBtn = document.getElementById('start-btn');
    const screen = document.getElementById('loading-screen');

    let progress = 0;
    let loaded = false;

    const fakeLoad = setInterval(() => {
        if (progress < 85) {
            progress += Math.random() * 8;
            if (progress > 85) progress = 85;
            bar.style.width = progress + '%';
            percent.textContent = Math.floor(progress) + '%';
        } else {
            clearInterval(fakeLoad);
            if (loaded) finishLoad();
        }
    }, 120);

    window.addEventListener('portfolioLoaded', () => {
        loaded = true;
        if (progress >= 85) finishLoad();
        else {
            const finish = setInterval(() => {
                progress += 4;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(finish);
                    bar.style.width = '100%';
                    percent.textContent = '100%';
                    finishLoad();
                } else {
                    bar.style.width = progress + '%';
                    percent.textContent = Math.floor(progress) + '%';
                }
            }, 60);
        }
    });

    function finishLoad() {
        bar.style.width = '100%';
        percent.textContent = '100%';
        document.querySelector('.loading-bar-label').textContent = 'READY!';
        document.querySelector('.loading-bar-label').style.animation = 'none';
        document.querySelector('.loading-bar-label').style.color = '#6dffb3';
        startBtn.classList.remove('hidden-start');
        startBtn.addEventListener('click', dismissScreen);
        window.addEventListener('keydown', e => {
            if (['Enter', ' '].includes(e.key)) dismissScreen();
        }, { once: true });
    }

    function dismissScreen() {
        screen.classList.add('fade-out');
        setTimeout(() => screen.remove(), 800);
    }
})();

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Octree } from 'three/addons/math/Octree.js';
import { Capsule } from 'three/addons/math/Capsule.js';

const scene = new THREE.Scene();
const canvas = document.getElementById("experience-canvas");
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2(-999, -999);

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;

const loader = new GLTFLoader();

const GRAVITY = 30;
const CAPSULE_RADIUS = 0.35;
const CAPSULE_HEIGHT = 1;
const JUMP_HEIGHT = 11;
const MOVE_SPEED = 7;

let targetRotation = 0;

const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.castShadow = true;
sun.position.set(75, 80, 0);
sun.shadow.mapSize.width = 4096;
sun.shadow.mapSize.height = 4096;
sun.shadow.camera.left = -100;
sun.shadow.camera.right = 100;
sun.shadow.camera.top = 100;
sun.shadow.camera.bottom = -100;
sun.shadow.normalBias = 0.4;
scene.add(sun);

const light = new THREE.AmbientLight(0x404040, 3);
scene.add(light);

const aspectRatio = sizes.width / sizes.height;
const camera = new THREE.OrthographicCamera(-aspectRatio * 50, aspectRatio * 50, 50, -50, 1, 1000);

let cameraPosition = {
    x: -10,
    y: 40,
    z: -50
};

const cameraOFFSET = new THREE.Vector3(-10, 40, -50);
camera.zoom = 1.2;
camera.updateProjectionMatrix();

camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);

const mainBannerContent = {
    Project_1: {
        title: "PESCollab (Full-stack Web App)",
        Content: "Developed a full-stack college-based open-source contribution platform inspired by GitHub concepts that enables students to share projects, collaborate on code, and participate in technical discussions within a campus community. Built using React, Node.js, Express, and Supabase with secure authentication and scalable backend APIs. Features include project uploads, code contributions, discussion forums, subject-based Q&A, and a reputation-driven leaderboard to encourage collaborative learning and peer-driven development  ",
        GitHub: "https://github.com/Tharunm1718/PESCollab",
        Visit: "https://pes-collab.vercel.app/"
    },
    Project_2: {
        title: "Howizit Fashion World",
        Content: " A clothing e-commerce platform developed as a client project. Built with Node.js, Express, Supabase, and EJS. Features include authentication, cart management, admin dashboard, responsive UI, and secure deployment.",
        Visit: "https://howizit.vercel.app/"
    },
    Project_3: {
        title: "AgriConnect",
        Content: "A platform that connects farmers with nearby agricultural workers for tasks such as harvesting, planting, and maintenance. Built using Node.js, Express, MongoDB, EJS, and deployed to Render. Integrated features include booking, recommendations, dashboards, OTP verification, and Cloudinary for image uploads. ",
        GitHub: "https://github.com/Tharunm1718/Agriconnect",
        Visit: "https://agriconnect-eight-pearl.vercel.app/"
    }
};

const intersectObjectNames = [
    "Project_1",
    "Project_2",
    "Project_3",
    "Bulbasaur",
    "Squirtle",
    "Pikachu",
    "Charmander",
    "Chicken"
];

const character = {
    instance: null,
    isMoving: false
};

const colliderOctree = new Octree();
const playerCollider = new Capsule(
    new THREE.Vector3(0, CAPSULE_RADIUS, 0),
    new THREE.Vector3(0, CAPSULE_HEIGHT, 0),
    CAPSULE_RADIUS
);

let playerVelocity = new THREE.Vector3();
let playerOnFloor = false;

const intersectObjects = [];
let intersectObject = "";

loader.load('portfolio.glb', function (glb) {
    glb.scene.traverse(child => {
        if (intersectObjectNames.includes(child.name)) {
            intersectObjects.push(child);
        }
        if (child.isMesh && child.name !== "Nameboard") {
            child.castShadow = true;
            child.receiveShadow = true;
        }

        if (child.name === "Character") {
            character.instance = child;
            playerCollider.start.copy(child.position).add(new THREE.Vector3(0, CAPSULE_RADIUS, 0));
            playerCollider.end.copy(child.position).add(new THREE.Vector3(0, CAPSULE_HEIGHT, 0));
        }

        if (child.name === "Hole_colloid") {
            colliderOctree.fromGraphNode(child);
            child.visible = false;
        }
    });

    scene.add(glb.scene);
    window.dispatchEvent(new Event('portfolioLoaded'));
}, undefined, function (error) {
    console.error(error);
});

function contentShow(name) {
    const content = mainBannerContent[name];
    if (content) {
        document.querySelector(".title").textContent = content.title;
        document.querySelector(".content").textContent = content.Content;
        document.querySelector(".mainbanner").classList.toggle("hiddenclass");
        document.querySelector(".visit").href = content.Visit;

        if (content.GitHub) {
            document.querySelector(".github").href = content.GitHub;
            document.querySelector(".github").style.display = "inline-block";
        } else {
            document.querySelector(".github").style.display = "none";
        }
    }
}

function handleResize() {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
}

function onPointerMove(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function playerCollisions() {
    const result = colliderOctree.capsuleIntersect(playerCollider);
    playerOnFloor = false;

    if (result) {
        playerOnFloor = result.normal.y > 0;
        playerCollider.translate(result.normal.multiplyScalar(result.depth));

        if (playerOnFloor) {
            character.isMoving = false;
            playerVelocity.x = 0;
            playerVelocity.z = 0;
        }
    }
}

function updatePlayer() {
    if (!character.instance) return;

    if (!playerOnFloor) {
        playerVelocity.y -= GRAVITY * 0.035;
    }

    playerCollider.translate(playerVelocity.clone().multiplyScalar(0.035));
    playerCollisions();

    character.instance.position.copy(playerCollider.start);
    character.instance.position.y -= CAPSULE_RADIUS;

    let rotationDiff =
        ((((targetRotation - character.instance.rotation.y) % (2 * Math.PI)) +
            3 * Math.PI) %
            (2 * Math.PI)) -
        Math.PI;

    let finalRotation = character.instance.rotation.y + rotationDiff;

    character.instance.rotation.y = THREE.MathUtils.lerp(
        character.instance.rotation.y,
        finalRotation,
        0.4
    );
}

function onKeyDown(event) {
    if (character.isMoving) return;

    switch (event.key.toLowerCase()) {
        case "w":
        case "arrowup":
            playerVelocity.z += MOVE_SPEED;
            targetRotation = THREE.MathUtils.degToRad(-90);
            break;
        case "s":
        case "arrowdown":
            playerVelocity.z -= MOVE_SPEED;
            targetRotation = THREE.MathUtils.degToRad(90);
            break;
        case "a":
        case "arrowleft":
            playerVelocity.x += MOVE_SPEED;
            targetRotation = THREE.MathUtils.degToRad(0);
            break;
        case "d":
        case "arrowright":
            playerVelocity.x -= MOVE_SPEED;
            targetRotation = THREE.MathUtils.degToRad(180);
            break;
    }

    playerVelocity.y = JUMP_HEIGHT;
    character.isMoving = true;
}

function animate() {
    updatePlayer();

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(intersectObjects);

    if (character.instance) {
        const targetCameraPosition = new THREE.Vector3(
            character.instance.position.x + cameraOFFSET.x,
            cameraOFFSET.y,
            character.instance.position.z + cameraOFFSET.z
        );

        camera.position.lerp(targetCameraPosition, 0.1);
        camera.lookAt(
            character.instance.position.x,
            character.instance.position.y - cameraOFFSET.y,
            character.instance.position.z
        );
    }

    if (intersects.length > 0) {
        document.body.style.cursor = "pointer";
        intersectObject = intersects[0].object.parent.name;
    } else {
        document.body.style.cursor = "default";
        intersectObject = "";
    }

    renderer.render(scene, camera);
}

function jumpCharacter(meshId) {
    const mesh = scene.getObjectByName(meshId);

    gsap.timeline()
        .to(mesh.scale, { x: 1.2, y: 0.8, z: 1.2, duration: 0.5, yoyo: true, repeat: 1 })
        .to(mesh.position, { y: mesh.position.y + 2, duration: 0.25, yoyo: true, repeat: 1 }, 0);
}

function handleOnClick() {
    if (intersectObject !== "") {
        if (["Bulbasaur", "Squirtle", "Pikachu", "Charmander", "Chicken"].includes(intersectObject)) {
            jumpCharacter(intersectObject);
        }
    }
    contentShow(intersectObject);
}

function handleExit() {
    document.querySelector(".mainbanner").classList.toggle("hiddenclass");
}

document.querySelector(".exit").addEventListener("click", handleExit);
renderer.setAnimationLoop(animate);
window.addEventListener("resize", handleResize);
window.addEventListener("click", handleOnClick);
window.addEventListener("pointermove", onPointerMove);
window.addEventListener("keydown", onKeyDown);