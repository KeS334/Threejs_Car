import { GLTFLoader } from './lib/GLTFLoader.js';
import { ARButton } from './lib/ARButton.js';


let delta;
let camera;
let light;

let objects = {
    plane: { geometry: null, material: null, mesh: null},
    boxA: { geometry: null, material: null, mesh: null},
    boxB: { geometry: null, material: null, mesh: null},
    car: {data: null, mixer: null, action: null, autoRun: false, wheel: []}
};
let wheels = {
    names: ['Front_wheel001', 'Front_wheel', 'Rear_wheel','Rear_wheel001'],
    objects:[]
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
    camera.position.set(0, 500, 1000);

    light = new THREE.HemisphereLight( 0xffffff, 0x000000, 1 );

    objects.plane.geometry = new THREE.PlaneGeometry(1600, 800, 10, 10);
    objects.plane.material = new THREE.MeshBasicMaterial({ color: 0x777777, });
    objects.plane.mash = new THREE.Mesh( objects.plane.geometry, objects.plane.material );
    objects.plane.mash.position.set(10, 10, 0);
    objects.plane.mash.rotation.x = -Math.PI / 2

    objects.boxA.geometry = new THREE.BoxGeometry( 1000, 40, 40 );
    objects.boxA.material = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
    objects.boxA.mesh = new THREE.Mesh( objects.boxA.geometry, objects.boxA.material );
    objects.boxA.mesh.position.set(0, 20, -300);

    objects.boxB.geometry = new THREE.BoxGeometry( 1000, 40, 40 );
    objects.boxB.material = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
    objects.boxB.mesh = new THREE.Mesh( objects.boxB.geometry, objects.boxB.material );
    objects.boxB.mesh.position.set(0, 20, 300);

    objects.car.data = await loader.loadAsync(MODEL_LINK);
    objects.car.data.scene.position.set(-500, 50, 0);
    objects.car.mixer = new THREE.AnimationMixer(objects.car.data.scene);
    objects.car.action = objects.car.mixer.clipAction(objects.car.data.animations[0])
    objects.car.action.play()
    createWheelArray(objects.car.data.scene, wheels);

    addToScene(light, objects.plane.mash,objects.boxA.mesh, objects.boxB.mesh, objects.car.data.scene);
}

function animate() {

    delta = clock.getDelta();
    if (objects.car.mixer) { objects.car.mixer.update(delta) }

    if(objects.car.autoRun && objects.car.data.scene.position.x < 500){
        changeCarX(2)
    }
    camera.lookAt(objects.car.data.scene.position.x, 200, 0);

    if(objects.car.data.scene.position.x >= 500){
        changeCarMode('stop')
        changeColor(objects.car.data.scene, 'Frame_Orange_0', 0xffffff)
    }

    renderer.render( scene, camera );
    requestAnimationFrame(animate);
}


document.addEventListener('keydown', function(event) {
    switch (event.code){
        case 'KeyW' :
        case 'ArrowUp':
            if(objects.car.data.scene.position.x < 500)
                changeCarX(10)
            break;
        case 'KeyS' :
        case 'ArrowDown':
            if(objects.car.data.scene.position.x > -500)
                changeCarX(-10)
            break;
        case 'Space':
            changeCarMode()
            break;
    }
});
document.querySelector('button').onclick = () => {
    changeCarMode();
}

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
    wheels.objects.forEach(item => item.rotation.z += 0.01 * delta)
}
const changeCarMode = (mode) => {
    switch (mode){
        case 'run':
            objects.car.autoRun = true
            break
        case 'stop':
            objects.car.autoRun = false
            break
        default:
            objects.car.autoRun = !objects.car.autoRun
    }
}
const createWheelArray = (object, wheels) => {
    object.traverse((item) => {
        if(wheels.names.includes(item.name)){
            wheels.objects.push(item)
        }
    })
}