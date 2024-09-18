import * as THREE from 'three';

import { color, cos, float, mix, range, sin, timerLocal, uniform, uv, vec3, vec4, PI2 } from 'three';

import { GUI } from 'lil-gui';
import { OrbitControls } from 'addons/controls/OrbitControls.js';

let camera, scene, renderer, controls;

init();

function init() {

    const canvas = document.querySelector('canvas.webgpu');

    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 100 );
    camera.position.set( 4, 2, 5 );

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x201919 );

    // galaxy

    const material = new THREE.SpriteNodeMaterial( {
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    } );

    const size = uniform( 0.03 );
    material.scaleNode = range( 0.5, 1 ).mul( size );

    const time = timerLocal().mul(0.5);

    const radiusRatio = range( 0, 1 );
    const radius = radiusRatio.pow( 1.5 ).mul( 2 ).toVar();

    const branches = 120;
    const branchAngle = range( 0, branches ).floor().mul( PI2.div( branches ) );
    const angle = branchAngle.add( time.mul( radiusRatio.oneMinus() ) );

    const randomOffset = range( vec3( - 1 ), vec3( 1 ) ).pow( 3 ).mul( radiusRatio ).add( 0.2 );
    
    const position = vec3(
        cos( angle ),
        0,
        sin( angle )
    ).mul( radius );

    

    material.positionNode = position.add( randomOffset );

    const colorInside = uniform( color( '#ff7775' ) );
    const colorOutside = uniform( color( '#331599' ) );
    const colorFinal = mix( colorInside, colorOutside, radiusRatio.oneMinus().pow( 2 ).oneMinus() );
    const alpha = float( 0.1 ).div( uv().sub( 0.5 ).length()).sub( 0.5 );
    material.colorNode = vec4( colorFinal, alpha );

    const mesh = new THREE.InstancedMesh( new THREE.PlaneGeometry( 1, 1 ), material, 200000 );
    scene.add( mesh );

    // debug

    const gui = new GUI();

    gui.add( size, 'value', 0, 1, 0.001 ).name( 'size' );

    gui.addColor( { color: colorInside.value.getHex( THREE.SRGBColorSpace ) }, 'color' )
        .name( 'colorInside' )
        .onChange( function ( value ) {

            colorInside.value.set( value );

        } );

    gui.addColor( { color: colorOutside.value.getHex( THREE.SRGBColorSpace ) }, 'color' )
        .name( 'colorOutside' )
        .onChange( function ( value ) {

            colorOutside.value.set( value );

        } );

    // renderer

    renderer = new THREE.WebGPURenderer( { canvas: canvas, antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setAnimationLoop( animate );
    document.body.appendChild( renderer.domElement );

    controls = new OrbitControls( camera, renderer.domElement );
    controls.enableDamping = true;
    controls.minDistance = 0.1;
    controls.maxDistance = 50;

    window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

async function animate() {

    controls.update();

    renderer.render( scene, camera );

}