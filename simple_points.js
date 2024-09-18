import * as THREE from 'three'
import { GUI } from 'lil-gui'

let camera, scene, renderer

const canvas = document.querySelector('.webgpu');
const dims = {
    x: canvas.clientWidth,
    y: canvas.clientHeight
}

init()



function init() {
    camera = new THREE.OrthographicCamera(-dims.x*0.5, dims.x*0.5, dims.y*0.5, -dims.y*0.5, 0, 1000)



    scene = new THREE.Scene()
    scene.background = new THREE.Color( 0x000000 );
    scene.add(camera)

    const points_positions = new Float32Array([
        // Top-left corner
        -dims.x*0.5,  dims.y*0.5, 0,
        // Bottom-right corner
        dims.x*0.5, -dims.y*0.5, 0,
        // Bottom-left corner
        -dims.x*0.5, -dims.y*0.5, 0,
        // Top-right corner
        dims.x*0.5,  dims.y*0.5, 0,
        // Center point
        0,0,0,
        // Top center
        0,dims.y*0.5,0,
        // Bottom center
        0,-dims.y*0.5,0,
        // Right center
        dims.x*0.5,0,0,
        // Left center
        -dims.x*0.5,0,0,

    ])

    const item_size = 3

    const pointsGeometry = new THREE.BufferGeometry()
    pointsGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(points_positions, item_size)
    ) 
    pointsGeometry.setDrawRange(0, points_positions.length / item_size)

    const mesh = new THREE.Points(pointsGeometry)
    scene.add(mesh)



    renderer = new THREE.WebGPURenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setAnimationLoop(animate)
    document.body.appendChild(renderer.domElement)


    window.addEventListener('resize', onWindowResize)
    window.addEventListener('mousemove', onMouseMove)

    // gui

    const gui = new GUI()
    gui
}

function onWindowResize() {
    const { innerWidth, innerHeight } = window
    camera.aspect = innerWidth / innerHeight
    camera.updateProjectionMatrix()

    renderer.setSize(window.innerWidth, window.innerHeight)
}

function onMouseMove(event) {
    const x = event.clientX
    const y = event.clientY

    const { innerWidth, innerHeight } = window

    x
    y
    innerWidth
    innerHeight
}

function animate() {
    renderer.render(scene, camera)
}
