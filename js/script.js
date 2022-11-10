import { GLTFLoader } from './lib/GLTFLoader.js';
import { ARButton } from './lib/ARButton.js';


let delta;
let camera;
let light;

let objects = {
    plane: { geometry: null, material: null, mesh: null},
    box: { geometry: null, material: null},
    boxA: null,
    boxB: null,
    car: {data: null, mixer: null, action: null, wheel: [], direction: 'forward'}
};
let wheels = {
    namesRight: ['Front_wheel001', 'Rear_wheel001'],
    objectsRight:[],
    namesLeft: ['Front_wheel', 'Rear_wheel'],
    objectsLeft:[],
};

const renderer = new THREE.WebGLRenderer();
const clock = new THREE.Clock()
const loader = new GLTFLoader();
const scene = new THREE.Scene();
const loaderTexture = new THREE.TextureLoader();
const BACKGROUND_LINK = 'https://kes334.github.io/Threejs_Car/img/sky.png';
const MODEL_LINK = 'https://kes334.github.io/Threejs_Car/models/low-poly_truck_car_drifter.glb';

init().then(() => animate())

async function init() {

    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor(0x000000);
    renderer.xr.enabled = true;
    document.body.appendChild( ARButton.createButton( renderer, { requiredFeatures: [ 'hit-test' ] } ) );
    document.body.appendChild( renderer.domElement );

    scene.background = loaderTexture.load(BACKGROUND_LINK);

    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 5000 );
    camera.position.set(0, 1000, 1000);

    light = new THREE.HemisphereLight( 0xffffff, 0x000000, 1 );

    objects.plane.geometry = new THREE.PlaneGeometry(1600, 800, 10, 10);
    objects.plane.material = new THREE.MeshBasicMaterial({ color: 0x777777, });
    objects.plane.mash = new THREE.Mesh( objects.plane.geometry, objects.plane.material );
    objects.plane.mash.position.set(10, 10, 0);
    objects.plane.mash.rotation.x = -Math.PI / 2

    objects.box.geometry = new THREE.BoxGeometry( 1000, 40, 40 );
    objects.box.material = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
    objects.boxA = new THREE.Mesh( objects.box.geometry, objects.box.material );
    objects.boxB = new THREE.Mesh( objects.box.geometry, objects.box.material );
    objects.boxA.position.set(0, 20, -300);
    objects.boxB.position.set(0, 20, 300);

    objects.car.data = await loader.loadAsync(MODEL_LINK);
    objects.car.data.scene.position.set(-502, 50, 0);
    objects.car.mixer = new THREE.AnimationMixer(objects.car.data.scene);
    objects.car.action = objects.car.mixer.clipAction(objects.car.data.animations[0])
    objects.car.action.play()
    createWheelArray(objects.car.data.scene, wheels);

    addToScene(light, objects.plane.mash,objects.boxA, objects.boxB, objects.car.data.scene);
}

function animate() {

    delta = clock.getDelta();
    if (objects.car.mixer) { objects.car.mixer.update(delta) }

    if (objects.car.direction === 'forward') { changeCarX(5) }
    if (objects.car.direction === 'back') { changeCarX(-2) }

    if( objects.car.data.scene.position.x > 500){
        objects.car.direction = 'back';
        changeColor(objects.car.data.scene, 'Frame_Orange_0', 0xffffff)
    }
    if( objects.car.data.scene.position.x < - 500){
        objects.car.direction = 'forward'
        changeColor(objects.car.data.scene, 'Frame_Orange_0', 0xfa3f1d)
    }
    camera.lookAt(objects.car.data.scene.position.x, 200, 0);

    renderer.render( scene, camera );
    requestAnimationFrame(animate);
}

window.addEventListener('resize', resize );

const addToScene = (...entities) => {
    entities.forEach(item =>scene.add(item))
}
const setMaterial = (parent, type, mtl) => {
    parent.traverse((o) => {
        if (o.isMesh && o.name != null) {
            if (o.name === type) {
                o.material = mtl;
            }
        }
    });
}
const changeColor = (object, obj_name, color) => {
    const materialCar = new THREE.MeshBasicMaterial({color: color});
    setMaterial(object, obj_name, materialCar);
}
const changeCarX = (delta) => {
    objects.car.data.scene.position.x += delta
    wheels.objectsRight.forEach(item => item.rotation.z += 0.01 * delta)
    wheels.objectsLeft.forEach(item => item.rotation.z -= 0.01 * delta)
}
const createWheelArray = (object, wheels) => {
    object.traverse((item) => {
        if(wheels.namesRight.includes(item.name)){ wheels.objectsRight.push(item) }
        if(wheels.namesLeft.includes(item.name)){ wheels.objectsLeft.push(item) }
    })
}
function resize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}