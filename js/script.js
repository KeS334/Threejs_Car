import { GLTFLoader } from './lib/GLTFLoader.js';
import { ARButton } from './lib/ARButton.js';
import { OrbitControls } from './lib/OrbitControls.js';


let camera;
let light;
let controller;
let controls;

let objects = {
    floor: { geometry: null, material: null, mesh: null},
    box: { geometry: null, material: null},
    boxA: null,
    boxB: null,
    car: {data: null, mixer: null, action: null, wheel: [], direction: 'forward', positionStart: -25, positionEnd: 25}
};
let wheels = {
    namesRight: ['Front_wheel001', 'Rear_wheel001'],
    objectsRight:[],
    namesLeft: ['Front_wheel', 'Rear_wheel'],
    objectsLeft:[],
};

const renderer = new THREE.WebGLRenderer();
const loader = new GLTFLoader();
const scene = new THREE.Scene();
const MODEL_LINK = 'https://kes334.github.io/Threejs_Car/models/low-poly_truck_car_drifter.glb';

init()

async function init() {

    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor(0x000000, 0);

    window.addEventListener('resize', resize );

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 5000 );
    camera.position.set(0, 1, 1);

    light = new THREE.HemisphereLight( 0xffffff, 0x000000, 1 );

    objects.floor.geometry = new THREE.BoxGeometry( 80, 2, 40 );
    objects.floor.material = new THREE.MeshBasicMaterial({ color: 0x777777 });
    objects.floor.mash = new THREE.Mesh( objects.floor.geometry, objects.floor.material );
    objects.floor.mash.position.set(0, -40, -100);

    objects.box.geometry = new THREE.BoxGeometry( 50, 4, 4);
    objects.box.material = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
    objects.boxA = new THREE.Mesh( objects.box.geometry, objects.box.material );
    objects.boxB = new THREE.Mesh( objects.box.geometry, objects.box.material );
    objects.boxA.position.set(0, -38, -115);
    objects.boxB.position.set(0, -38, -85);

    objects.car.data = await loader.loadAsync(MODEL_LINK);
    objects.car.data.scene.position.set(objects.car.positionStart, -36, -100);
    objects.car.data.scene.scale.set(.05, .05, .05)
    objects.car.mixer = new THREE.AnimationMixer(objects.car.data.scene);
    objects.car.action = objects.car.mixer.clipAction(objects.car.data.animations[0])
    objects.car.action.play()
    createWheelArray(objects.car.data.scene, wheels);

    setupAR()
    addToScene(false, light, controller)
    addToScene(true, objects.floor.mash,objects.boxA, objects.boxB, objects.car.data.scene);
}

function animate() {

    camera.lookAt(0, 1, 0);

    if (objects.car.direction === 'forward') { changeCarX(0.5) }
    if (objects.car.direction === 'back') { changeCarX(-0.2) }

    if( objects.car.data.scene.position.x > objects.car.positionEnd){
        objects.car.direction = 'back';
        changeColor(objects.car.data.scene, 'Frame_Orange_0', 0xffffff)
    }
    if( objects.car.data.scene.position.x < objects.car.positionStart){
        objects.car.direction = 'forward'
        changeColor(objects.car.data.scene, 'Frame_Orange_0', 0xfa3f1d)
    }

    renderer.render( scene, camera );
}

function setupAR() {

    controls = new OrbitControls( camera, renderer.domElement );
    controls.update();
    controller = renderer.xr.getController( 0 );

    renderer.xr.enabled = true;
    document.body.appendChild( ARButton.createButton( renderer, { requiredFeatures: [ 'hit-test' ] } ) );
    document.body.appendChild( renderer.domElement );

    renderer.setAnimationLoop( animate );
}
const addToScene = (matrixMode, ...entities) => {
    entities.forEach(item =>{
        if(matrixMode){
            item.position.applyMatrix4( controller.matrixWorld )
            item.quaternion.setFromRotationMatrix( controller.matrixWorld );
        }
        scene.add(item)
    })
}
const setMaterial = (parent, type, mtl) => {
    parent.traverse((o) => {
        if (o.isMesh && o.name != null) {
            if (o.name === type) { o.material = mtl }
        }
    });
}
const changeColor = (object, obj_name, color) => {
    const materialCar = new THREE.MeshBasicMaterial({color: color});
    setMaterial(object, obj_name, materialCar);
}
const changeCarX = (delta) => {
    objects.car.data.scene.position.x += delta
    wheels.objectsRight.forEach(item => item.rotation.z += 0.1 * delta)
    wheels.objectsLeft.forEach(item => item.rotation.z -= 0.1 * delta)
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
