// TODO:
// - instead of points, I want to use a plane_geometry [ x ]
//    - performance is horrible, How do I improve it without leaving JS?
// - replace plane-geometry with a customn geometry
// - add an anchor-trails

import * as THREE from 'three'

let camera, scene, renderer

const canvas = document.querySelector('.webgpu')
const dims = {
    x: canvas.clientWidth,
    y: canvas.clientHeight,
}

const agents = 800000

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
        positionArray: new Float32Array(agents * 3),
        velocityArray: new Float32Array(agents * 3),
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

    const particleMaterial = new THREE.PointsMaterial({
        size: 100,
        color: 0x00ff00,
        sizeAttenuation: false,
    })
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(state.positionArray, 3)
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

function compute_velocity(velocityArray, positionArray) {
    // update velocity with random vaulue between -50  and 50
    const centerX = 0
    const centerY = 0
    const maxSpeed = 1000
    const swirlingForce = 0.9
    const randomness = 0.02

    for (let i = 0; i < agents; i++) {
        const vel_i = i * 3
        const pos_i = i * 3

        const dx = positionArray[pos_i] - centerX
        const dy = positionArray[pos_i + 1] - centerY
        const distanceFromCenter = Math.sqrt(dx * dx + dy * dy)

        // Calculate swirling velocity
        let vx = (-dy / distanceFromCenter) * swirlingForce
        let vy = (dx / distanceFromCenter) * swirlingForce

        // Add some randomness
        // vx += (Math.random() - 0.5) * randomness * maxSpeed
        // vy += (Math.random() - 0.5) * randomness * maxSpeed

        // Limit speed
        const speed = Math.sqrt(vx * vx + vy * vy)
        if (speed > maxSpeed) {
            const scale = maxSpeed / speed
            vx *= scale
            vy *= scale
        }

        velocityArray[vel_i] = vx
        velocityArray[vel_i + 1] = vy
        velocityArray[vel_i + 2] = 0
    }
}

function update_position(positionArray, velocityArray, deltaTime) {
    for (let i = 0; i < agents; i++) {
        const pos_i = i * 3

        const x = positionArray[pos_i]

        const y = positionArray[pos_i + 1]

        const vx = velocityArray[pos_i]
        const vy = velocityArray[pos_i + 1]

        const x_new = x +  vx * deltaTime * 100
        const y_new = y +  vy * deltaTime * 100







        positionArray[pos_i] = x_new
        positionArray[pos_i + 1] = y_new
        positionArray[pos_i + 2] = 0

        if (x_new > dims.x / 2) {
            positionArray[pos_i] = -dims.x / 2
        }

        if (x_new < -dims.x / 2) {
            positionArray[pos_i] = dims.x / 2
        }

        if (y_new > dims.y / 2) {
            positionArray[pos_i + 1] = -dims.y / 2
        }

        if (y_new < -dims.y / 2) {
            positionArray[pos_i + 1] = dims.y / 2
        }

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

    //if (deltaTime > 1) deltaTime = 1 // safety cap on large deltas
    last = now

    compute_velocity(state.velocityArray, state.positionArray)
    update_position(state.positionArray, state.velocityArray, deltaTime)

    // const positions = particles.geometry.attributes.position.array

    for (let i = 0; i < agents; i++) {
        const pos_i = i * 3
        particles.geometry.attributes.position.array[pos_i] =
            state.positionArray[pos_i]
        particles.geometry.attributes.position.array[pos_i + 1] =
            state.positionArray[pos_i + 1]
        particles.geometry.attributes.position.array[pos_i + 2] =
            state.positionArray[pos_i + 2]
    }

    particles.geometry.attributes.position.needsUpdate = true
    renderer.render(scene, camera)
}

init()
