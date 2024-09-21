// TODO:
// - instead of points, I want to use a plane_geometry
// - replace plane-geometry with a customn geometry
// - add an anchor-trails

import * as THREE from 'three'

let camera, scene, renderer

const canvas = document.querySelector('.webgpu')
const dims = {
    x: canvas.clientWidth,
    y: canvas.clientHeight,
}

const agents = 100000

let last = performance.now()

let state
let particles

function init() {
    camera = new THREE.OrthographicCamera(
        -dims.x * 0.5,
        dims.x * 0.5,
        dims.y * 0.5,
        -dims.y * 0.5,
        -1000,
        1000
    )

    scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)
    scene.add(camera)

    state = {
        positionArray: [],
        velocityArray: [],
    }

    // agent position and velocity
    for (let i = 0; i < agents; i++) {
        const pos_index = i * 3
        const vel_index = i * 3

        state.positionArray[pos_index] = (Math.random() - 0.5) * dims.x
        state.positionArray[pos_index + 1] = (Math.random() - 0.5) * dims.y
        state.positionArray[pos_index + 2] = 0

        state.velocityArray[vel_index] = Math.random() * 10 - 5
        state.velocityArray[vel_index + 1] = Math.random() * 10 - 5
        state.velocityArray[vel_index + 2] = 0
    }

    // create particles

    const particleMaterial = new THREE.PointsMaterial({ color: 0x00ff00 })
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(state.positionArray, 3)
    )

    particles = new THREE.Points(geometry, particleMaterial)
    scene.add(particles)

    renderer = new THREE.WebGPURenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setAnimationLoop(animate)
    document.body.appendChild(renderer.domElement)

    window.addEventListener('resize', onWindowResize)
    window.addEventListener('mousemove', onMouseMove)
}

function compute_velocity(velocityArray) {
    // update velocity with random vaulue between -50  and 50
    for (let i = 0; i < agents; i++) {
        const vel_i = i * 3

        velocityArray[vel_i] = Math.random() * 100 - 50
        velocityArray[vel_i + 1] = Math.random() * 100 - 50
        velocityArray[vel_i + 2] = 0
    }
}

function update_position(positionArray, velocityArray, deltaTime) {
    for (let i = 0; i < agents; i++) {
        const pos_i = i * 3
        positionArray[pos_i] += velocityArray[pos_i] * deltaTime
        positionArray[pos_i + 1] += velocityArray[pos_i + 1] * deltaTime
        positionArray[pos_i + 2] += 0
    }
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
    render()
}

function render() {
    const now = performance.now()
    let deltaTime = (now - last) / 1000

    // if (deltaTime > 1) deltaTime = 1 // safety cap on large deltas
    last = now

    compute_velocity(state.velocityArray)
    update_position(state.positionArray, state.velocityArray, deltaTime)

    const positions = particles.geometry.attributes.position.array

    for (let i = 0; i < agents; i++) {
        const pos_i = i * 3
        positions[pos_i] = state.positionArray[pos_i]
        positions[pos_i + 1] = state.positionArray[pos_i + 1]
        positions[pos_i + 2] = state.positionArray[pos_i + 2]
    }

    particles.geometry.attributes.position.needsUpdate = true
    renderer.render(scene, camera)
}

init()
