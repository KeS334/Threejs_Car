import { GLTFLoader } from './lib/GLTFLoader.js';


const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(0x000000);
document.body.appendChild( renderer.domElement );

const scene = new THREE.Scene();
const loaderTexture = new THREE.TextureLoader();
const bgTexture = loaderTexture.load('../../img/sky.png');
scene.background = bgTexture;


const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 5000 );
camera.position.set(0, 0, 1000);

const light = new THREE.AmbientLight(0xffffff)
scene.add(light)


camera.position.x = 0;
camera.position.y = 400;
camera.lookAt(scene.position);


const geometryPlane = new THREE.PlaneGeometry(1600, 800, 10, 10);
const materialPlane = new THREE.MeshBasicMaterial({ color: 0x777777, });
const Plane = new THREE.Mesh( geometryPlane, materialPlane );
Plane.position.set(10, 10, 0);
Plane.rotation.x = -Math.PI / 2
scene.add( Plane );


const geometryBoxA = new THREE.BoxGeometry( 1000, 20, 20 );
const materialBoxA = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const BoxA = new THREE.Mesh( geometryBoxA, materialBoxA );
BoxA.position.set(0, 10, -300);
scene.add( BoxA );


const geometryBoxB = new THREE.BoxGeometry( 1000, 20, 20 );
const materialBoxB = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
const BoxB = new THREE.Mesh( geometryBoxB, materialBoxB );
BoxB.position.set(0, 10, 300);
scene.add( BoxB );



const loader = new GLTFLoader();
const loadedData = await loader.loadAsync('../../models/low-poly_truck_car_drifter.glb');
scene.add(loadedData.scene);
loadedData.scene.position.set(0, 50, 0);
// loadedData.scene.scale.set(0.7, 0.7, 0.7)
console.log(loadedData)
const mixer = new THREE.AnimationMixer(loadedData);
const action = mixer.clipAction(loadedData.animations[0])
// debugger
// action.play()

const materialCar =  new THREE.MeshBasicMaterial( { color: 0xCC397B } );
setMaterial(loadedData.scene, 'Frame_Orange_0', materialCar);

function setMaterial(parent, type, mtl) {
    parent.traverse((o) => {
        if (o.isMesh && o.name != null) {
            if (o.name === type) {
                o.material = mtl;
            }
        }
    });
}

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
document.addEventListener('keydown', function(event) {
    switch (event.code){
        case 'KeyW' :
        case 'ArrowUp':
            if(carX<500) carX+= 10
            break;
        case 'KeyS' :
        case 'ArrowDown':
            if(carX>-500) carX-= 10
            break;
        case 'KeyP':
            action.play()
            break;
    }
});

const cameraRotating = (speed = 0.05) => {
    camera.position.x += ( mouseX - camera.position.x ) * speed;
    camera.position.y += ( - mouseY - camera.position.y ) * speed;
    camera.lookAt( scene.position );
}


function animate() {
    // cameraRotating()
    if(autoRun && carX < 500){
        carX++
    }
    loadedData.scene.position.x = carX;
    camera.lookAt(carX, 0, 0);
    renderer.render( scene, camera );

    requestAnimationFrame( animate );
}
animate();
