import * as THREE from 'three'
import {
    Fn,
    uniform,
    storage,
    attribute,
    float,
    vec2,
    vec3,
    color,
    instanceIndex,
} from 'three/tsl'

import { GUI } from 'three/addons/libs/lil-gui.module.min.js'

let camera, scene, renderer

init()

function init() {
    camera = new THREE.OrthographicCamera(-1.0, 1.0, 1.0, -1.0, 0, 1)
    camera.position.z = 1

    scene = new THREE.Scene()

    // use a compute shader to animate the point cloud's vertex data.

    const particleNode = attribute('particle', 'vec2')

    const pointsGeometry = new THREE.BufferGeometry()
    pointsGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(3), 3)
    ) // single vertex ( not triangle )
    pointsGeometry.setAttribute('particle', particleBuffer) // dummy the position points as instances
    pointsGeometry.drawRange.count = 1 // force render points as instances ( not triangle )

    const pointsMaterial = new THREE.PointsNodeMaterial()
    pointsMaterial.colorNode = particleNode.add(color(0xffffff))
    pointsMaterial.positionNode = particleNode

    const mesh = new THREE.Points(pointsGeometry, pointsMaterial)
    mesh.count = particleNum
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

    gui.add(scaleVector, 'x', 0, 1, 0.01)
    gui.add(scaleVector, 'y', 0, 1, 0.01)
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

    pointerVector.set((x / width - 0.5) * 2.0, (-y / height + 0.5) * 2.0)
}

function animate() {
    renderer.compute(computeNode)
    renderer.render(scene, camera)
}
