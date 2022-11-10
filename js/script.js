import { GLTFLoader } from './lib/GLTFLoader.js';


const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(0x000000);
document.body.appendChild( renderer.domElement );

const scene = new THREE.Scene();
const loaderTexture = new THREE.TextureLoader();
const bgTexture = loaderTexture.load('https://kes334.github.io/Threejs_Car/img/sky.png');
scene.background = bgTexture;


const camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 5000 );
camera.position.set(0, 500, 1000);

const light = new THREE.HemisphereLight( 0xffffff, 0x000000, 1 );
scene.add(light)



const geometryPlane = new THREE.PlaneGeometry(1600, 800, 10, 10);
const materialPlane = new THREE.MeshBasicMaterial({ color: 0x777777, });
const Plane = new THREE.Mesh( geometryPlane, materialPlane );
Plane.position.set(10, 10, 0);
Plane.rotation.x = -Math.PI / 2
scene.add( Plane );


const geometryBoxA = new THREE.BoxGeometry( 1000, 20, 20 );
const materialBoxA = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
const BoxA = new THREE.Mesh( geometryBoxA, materialBoxA );
BoxA.position.set(0, 10, -300);
scene.add( BoxA );


const geometryBoxB = new THREE.BoxGeometry( 1000, 20, 20 );
const materialBoxB = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
const BoxB = new THREE.Mesh( geometryBoxB, materialBoxB );
BoxB.position.set(0, 10, 300);
scene.add( BoxB );



const loader = new GLTFLoader();
const loadedData = await loader.loadAsync('https://kes334.github.io/Threejs_Car/models/low-poly_truck_car_drifter.glb');
scene.add(loadedData.scene);
loadedData.scene.position.set(0, 50, 0);
console.log(loadedData)
const mixer = new THREE.AnimationMixer(loadedData.scene);
const action = mixer.clipAction(loadedData.animations[0])
action.play()

function setMaterial(parent, type, mtl) {
    parent.traverse((o) => {
        if (o.isMesh && o.name != null) {
            if (o.name === type) {
                o.material = mtl;
            }
        }
    });
}

let wheel = [];
loadedData.scene.traverse((o) => {
    if (o.name === 'Front_wheel001' ||
        o.name === 'Front_wheel' ||
        o.name === 'Rear_wheel' ||
        o.name === 'Rear_wheel001') {
            wheel.push(o)
    }
})

let mouseX = 0, mouseY = 0;
document.addEventListener( 'mousemove', function ( event ) {
    mouseX = ( event.clientX - window.innerWidth / 2 ) * 10;
    mouseY = ( event.clientY - window.innerHeight / 2 ) * 10;
})


let autoRun = false;
document.querySelector('button').onclick = () => {
    autoRun = !autoRun;
}


let carX = -500;
const changeCarX = (delta) => {
    carX += delta
    wheel.forEach(item => item.rotation.z += 0.01 * delta)
}

document.addEventListener('keydown', function(event) {
    switch (event.code){
        case 'KeyW' :
        case 'ArrowUp':
            if(carX<500) changeCarX(10)
            break;
        case 'KeyS' :
        case 'ArrowDown':
            if(carX>-500) changeCarX(-10)
            break;
        case 'Space':
            autoRun = !autoRun;
            break;
        case 'KeyP':
            action.play()
            break;
        case 'KeyO':
            action.stop()
            break;
    }
});

const cameraRotating = (speed = 0.05) => {
    camera.position.x += ( mouseX - camera.position.x ) * speed;
    camera.position.y += ( - mouseY - camera.position.y ) * speed;
    camera.lookAt( scene.position );
}

const clock = new THREE.Clock()
let delta;
function animate() {
    // cameraRotating()
    if(autoRun && carX < 500){
        changeCarX(2)
    }
    loadedData.scene.position.x = carX;
    camera.lookAt(carX, 200, 0);
    renderer.render( scene, camera );
    if(carX >= 500){
        autoRun = false
        const materialCar =  new THREE.MeshBasicMaterial( { color: 0xffffff } );
        setMaterial(loadedData.scene, 'Frame_Orange_0', materialCar);
    }

    delta = clock.getDelta();
    if (mixer) { mixer.update(delta) }

    requestAnimationFrame(animate);
}
animate();
