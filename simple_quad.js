import * as THREE from 'three'
import { GUI } from 'lil-gui'

let camera, scene, renderer

const canvas = document.querySelector('.webgpu')
const dims = {
    x: canvas.clientWidth,
    y: canvas.clientHeight,
}

init()

function init() {
    camera = new THREE.OrthographicCamera(
        -dims.x * 0.5,
        dims.x * 0.5,
        dims.y * 0.5,
        -dims.y * 0.5,
        0,
        1000
    )

    scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)
    scene.add(camera)

    const vertices = new Float32Array([

        // Bottom-left corner
        -dims.x * 0.5 + 10,
        -dims.y * 0.5 + 10,
        0,
        // Bottom-right corner
        dims.x * 0.5 - 10,
        -dims.y * 0.5 + 10,
        0,
        // Top-right corner
        dims.x * 0.5 - 10,
        dims.y * 0.5 - 10,
        0,
        // Top-left corner
        -dims.x * 0.5 + 10,
        dims.y * 0.5 - 10,
        0,
    ])

    

    const indices = [0, 1, 2, 0, 2, 3]

    const geometry = new THREE.BufferGeometry()
    geometry.setIndex(indices)
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))

    const wireframe = new THREE.WireframeGeometry(geometry)

    const line = new THREE.LineSegments(wireframe)

    scene.add(line)

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
