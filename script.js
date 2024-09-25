import * as THREE from 'three'
import { GUI } from 'lil-gui'

let camera, scene, renderer

const canvas = document.querySelector('.webgpu')
const dims = {
    x: canvas.clientWidth,
    y: canvas.clientHeight,
}

// Declare arrays to store points
let allPoints = []
let anchorPoints = []

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

    // Number of agents (anchor points)
    const numAgents = 200

    // Tail length (number of tail points per anchor point)
    const tailLength = 4

    // Define the area over which to spread the anchor points
    const width = dims.x
    const height = dims.y

    for (let i = 0; i < numAgents; i++) {
        // Generate random position for the anchor point
        const anchorX = Math.random() * width - width / 2
        const anchorY = Math.random() * height - height / 2

        // Create the anchor point (a circle)
        const anchorGeometry = new THREE.CircleGeometry(10, 32)
        const anchorMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
        const anchorCircle = new THREE.Mesh(anchorGeometry, anchorMaterial)

        // Position the anchor circle
        anchorCircle.position.set(anchorX, anchorY, 0)

        // Add the anchor circle to the scene
        scene.add(anchorCircle)

        // Modify the anchor point object in your init() function
        const anchorPoint = {
            type: 'anchor',
            mesh: anchorCircle,
            position: { x: anchorX, y: anchorY },
            velocity: {
                x: (Math.random() - 0.5) * 2,
                y: (Math.random() - 0.5) * 2
            },
            acceleration: { x: 0, y: 0 },
            radius: 5,
            maxSpeed: 2,
            maxForce: 0.05,
            tail: []
        }
        anchorPoints.push(anchorPoint)
        allPoints.push(anchorPoint)

        // Create tail points for this anchor
        for (let j = 1; j <= tailLength; j++) {
            // Tail point radius
            const tailRadius = 10 - j * 0.9

            // Get the previous point (anchor or previous tail point)
            const prevPoint = j === 1 ? anchorPoint : anchorPoint.tail[j - 2]

            // Desired distance
            const desiredDist = prevPoint.radius + tailRadius

            // Initial position (offset at a random angle)
            const angle = Math.random() * Math.PI * 2
            const tailX = prevPoint.position.x + Math.cos(angle) * desiredDist
            const tailY = prevPoint.position.y + Math.sin(angle) * desiredDist

            // Create the tail point (a circle)
            const tailGeometry = new THREE.CircleGeometry(tailRadius, 32)
            const tailMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa })
            const tailCircle = new THREE.Mesh(tailGeometry, tailMaterial)

            // Position the tail circle
            tailCircle.position.set(tailX, tailY, 0)

            // Add the tail circle to the scene
            scene.add(tailCircle)

            // Store the tail point
            const tailPoint = {
                type: 'tail',
                mesh: tailCircle,
                position: { x: tailX, y: tailY },
                radius: tailRadius
            }
            anchorPoint.tail.push(tailPoint)
            allPoints.push(tailPoint)
        }
    }

    renderer = new THREE.WebGPURenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)

    // Append renderer to the document
    document.body.appendChild(renderer.domElement)

    // Start the animation loop
    animate()

    window.addEventListener('resize', onWindowResize)
    window.addEventListener('mousemove', onMouseMove)

    // gui

    const gui = new GUI()
    gui
}

function onWindowResize() {
    dims.x = canvas.clientWidth
    dims.y = canvas.clientHeight

    camera.left = -dims.x * 0.5
    camera.right = dims.x * 0.5
    camera.top = dims.y * 0.5
    camera.bottom = -dims.y * 0.5
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

function animate(time) {
    requestAnimationFrame(animate)

    // Update anchor points
    anchorPoints.forEach(anchor => {
        // Reset acceleration
        anchor.acceleration.x = 0
        anchor.acceleration.y = 0

        // Calculate flocking forces
        const separationForce = separate(anchor, anchorPoints)
        const alignmentForce = align(anchor, anchorPoints)
        const cohesionForce = cohesion(anchor, anchorPoints)

        // Apply weights to each force
        const separationWeight = 1.5
        const alignmentWeight = 1.0
        const cohesionWeight = 1.0

        // Apply forces to acceleration
        anchor.acceleration.x += separationForce.x * separationWeight
        anchor.acceleration.y += separationForce.y * separationWeight

        anchor.acceleration.x += alignmentForce.x * alignmentWeight
        anchor.acceleration.y += alignmentForce.y * alignmentWeight

        anchor.acceleration.x += cohesionForce.x * cohesionWeight
        anchor.acceleration.y += cohesionForce.y * cohesionWeight

        // Update velocity
        anchor.velocity.x += anchor.acceleration.x
        anchor.velocity.y += anchor.acceleration.y

        // Limit speed
        limit(anchor.velocity, anchor.maxSpeed)

        // Update position
        anchor.position.x += anchor.velocity.x
        anchor.position.y += anchor.velocity.y

        // Bounce off screen edges instead of wrapping
        if (anchor.position.x < -dims.x / 2 + anchor.radius) {
            anchor.position.x = -dims.x / 2 + anchor.radius
            anchor.velocity.x *= -1
        }
        if (anchor.position.x > dims.x / 2 - anchor.radius) {
            anchor.position.x = dims.x / 2 - anchor.radius
            anchor.velocity.x *= -1
        }
        if (anchor.position.y < -dims.y / 2 + anchor.radius) {
            anchor.position.y = -dims.y / 2 + anchor.radius
            anchor.velocity.y *= -1
        }
        if (anchor.position.y > dims.y / 2 - anchor.radius) {
            anchor.position.y = dims.y / 2 - anchor.radius
            anchor.velocity.y *= -1
        }

        // Update mesh position
        anchor.mesh.position.set(anchor.position.x, anchor.position.y, 0)

        // Update tail points positions
        let prevPoint = anchor // Start with the anchor point
        for (let i = 0; i < anchor.tail.length; i++) {
            const tailPoint = anchor.tail[i]

            // Calculate the direction vector
            let dirX = tailPoint.position.x - prevPoint.position.x
            let dirY = tailPoint.position.y - prevPoint.position.y

            // Calculate the distance
            let dist = Math.sqrt(dirX * dirX + dirY * dirY)
            let desiredDist = prevPoint.radius + tailPoint.radius
            let diff = dist - desiredDist

            // Normalize the direction vector
            if (dist !== 0) {
                dirX /= dist
                dirY /= dist
            } else {
                dirX = 0
                dirY = 0
            }

            // Apply stiffness for smoothing
            const stiffness = 0.2 // Adjust as needed
            tailPoint.position.x -= dirX * diff * stiffness
            tailPoint.position.y -= dirY * diff * stiffness

            // Update the mesh position
            tailPoint.mesh.position.set(tailPoint.position.x, tailPoint.position.y, 0)

            // Update prevPoint
            prevPoint = tailPoint
        }
    })

    // Render the scene
    renderer.render(scene, camera)
}

function separate(current, anchors) {
    const desiredSeparation = 25
    let steer = { x: 0, y: 0 }
    let count = 0

    anchors.forEach(other => {
        if (other !== current) {
            const d = distance(current.position, other.position)
            if (d > 0 && d < desiredSeparation) {
                const diff = subtract(current.position, other.position)
                // Normalize and weight by distance
                diff.x /= d
                diff.y /= d
                steer.x += diff.x
                steer.y += diff.y
                count++
            }
        }
    })

    if (count > 0) {
        steer.x /= count
        steer.y /= count
    }

    if (steer.x !== 0 || steer.y !== 0) {
        // Limit to maxForce
        limit(steer, current.maxForce)
    }
    return steer
}

function align(current, anchors) {
    const neighborDist = 50
    let sum = { x: 0, y: 0 }
    let count = 0

    anchors.forEach(other => {
        if (other !== current) {
            const d = distance(current.position, other.position)
            if (d > 0 && d < neighborDist) {
                sum.x += other.velocity.x
                sum.y += other.velocity.y
                count++
            }
        }
    })

    if (count > 0) {
        sum.x /= count
        sum.y /= count
        // Steer towards the average heading
        const steer = subtract(sum, current.velocity)
        limit(steer, current.maxForce)
        return steer
    } else {
        return { x: 0, y: 0 }
    }
}

function cohesion(current, anchors) {
    const neighborDist = 50
    let sum = { x: 0, y: 0 }
    let count = 0

    anchors.forEach(other => {
        if (other !== current) {
            const d = distance(current.position, other.position)
            if (d > 0 && d < neighborDist) {
                sum.x += other.position.x
                sum.y += other.position.y
                count++
            }
        }
    })

    if (count > 0) {
        sum.x /= count
        sum.y /= count
        // Steer towards the average position
        const desired = subtract(sum, current.position)
        limit(desired, current.maxForce)
        return desired
    } else {
        return { x: 0, y: 0 }
    }
}

function limit(vector, max) {
    const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y)
    if (magnitude > max) {
        vector.x = (vector.x / magnitude) * max
        vector.y = (vector.y / magnitude) * max
    }
}

function distance(a, b) {
    const dx = a.x - b.x
    const dy = a.y - b.y
    return Math.sqrt(dx * dx + dy * dy)
}

function subtract(a, b) {
    return { x: a.x - b.x, y: a.y - b.y }
}

function add(a, b) {
    return { x: a.x + b.x, y: a.y + b.y }
}

function multiply(a, scalar) {
    return { x: a.x * scalar, y: a.y * scalar }
}

function divide(a, scalar) {
    return { x: a.x / scalar, y: a.y / scalar }
}
