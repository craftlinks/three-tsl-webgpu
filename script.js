import * as THREE from 'three'
import { attribute, color } from 'three'
import { GUI } from 'lil-gui'

let camera, scene, renderer

init()

function init() {
    camera = new THREE.OrthographicCamera(-1.0, 1.0, 1.0, -1.0, 0, 1)
    camera.position.z = 1

    scene = new THREE.Scene()

    const particleNode = attribute('particle', 'vec2')

    const pointsGeometry = new THREE.BufferGeometry()
    pointsGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(3), 3)
    ) // single vertex ( not triangle )
    pointsGeometry.drawRange.count = 1

    const pointsMaterial = new THREE.PointsNodeMaterial()
    pointsMaterial.colorNode = particleNode.add(color(0xffffff))
    pointsMaterial.positionNode = particleNode

    const mesh = new THREE.Points(pointsGeometry, pointsMaterial)
    mesh.count = 1
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
    camera.updateProjectionMatrix()

    renderer.setSize(window.innerWidth, window.innerHeight)
}

function onMouseMove(event) {
    const x = event.clientX
    const y = event.clientY

    const width = window.innerWidth
    const height = window.innerHeight

    x
    y
    width
    height
}

function animate() {
    renderer.render(scene, camera)
}
