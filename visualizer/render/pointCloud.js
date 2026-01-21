import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

let scene, camera, renderer, geometry, points;
const width = 160;
const height = 120;
const depthFactor = 100;

// Canvas oculto para extraer datos de píxeles
const offscreenCanvas = document.createElement('canvas');
offscreenCanvas.width = width;
offscreenCanvas.height = height;
const ctx = offscreenCanvas.getContext('2d', { willReadFrequently: true });

export function createPointCloud() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 450;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    geometry = new THREE.BufferGeometry();
    const numPoints = width * height;
    const positions = new Float32Array(numPoints * 3);
    const colors = new Float32Array(numPoints * 3);

    // Inicializar posiciones base
    for (let i = 0; i < numPoints; i++) {
        const x = i % width;
        const y = Math.floor(i / width);
        positions[i * 3] = x - width / 2;
        positions[i * 3 + 1] = -(y - height / 2);
        positions[i * 3 + 2] = 0;

        // Color matrix inicial (verde fijo)
        colors[i * 3] = 0;
        colors[i * 3 + 1] = 1;
        colors[i * 3 + 2] = 0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 1.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
    });

    points = new THREE.Points(geometry, material);
    scene.add(points);

    window.addEventListener('resize', onWindowResize, false);

    return { scene, camera, renderer, geometry };
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

export function updatePointCloud(video, cloud, audioData, config) {
    // Dibujar video en el canvas oculto
    ctx.drawImage(video, 0, 0, width, height);
    const imgData = ctx.getImageData(0, 0, width, height).data;

    const positions = cloud.geometry.attributes.position.array;
    const colors = cloud.geometry.attributes.color.array;

    // Extraer datos de audio si existen
    let bands = new Array(10).fill(0);
    let bass = 0;

    if (audioData && audioData.analyser && audioData.dataArray) {
        audioData.analyser.getByteFrequencyData(audioData.dataArray);
        const chunkSize = Math.floor(audioData.dataArray.length / 10);
        for (let b = 0; b < 10; b++) {
            let sum = 0;
            for (let j = 0; j < chunkSize; j++) sum += audioData.dataArray[b * chunkSize + j];
            bands[b] = (sum / chunkSize) / 255;
        }
        bass = bands[0];
    }

    // Config defaults si no existen
    const cfg = config || {};
    const baseDepth = cfg.baseDepth !== undefined ? cfg.baseDepth : 50; // Valor original aprox 100/2
    const audioDepth = cfg.audioDepth !== undefined ? cfg.audioDepth : 50;
    const depthFactor = 100; // Factor global interno

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = y * width + x;
            const idx = i * 4;

            // Calcular brillo (promedio simple o luminosidad)
            const r = imgData[idx];
            const g = imgData[idx + 1];
            const b = imgData[idx + 2];
            const brightness = (r + g + b) / 3 / 255;

            // --- LÓGICA DE REACTIVIDAD Z (Portado de final_test.html) ---

            // 1. Estructura base (lo que define la forma 3D de la imagen)
            // (bright - 0.5) centra el relieve, valores oscuros van atrás, claros adelante
            let zStructure = (brightness - 0.5) * baseDepth;

            // 2. Reactividad al Audio
            const groupIdx = Math.floor(brightness * 9.99); // Usar banda de audio correspondiente al brillo
            const groupAudio = bands[groupIdx] || 0;

            // Si el pixel es gris (brightness ~0.5), igual debe saltar con la música.
            let direction = (brightness - 0.5);
            if (Math.abs(direction) < 0.05) direction = 0.5;

            // audioDepth controla qué tanto "salta" con el volumen de su banda
            let zAudio = direction * (groupAudio * audioDepth);

            // Factor de salto global (para que todo baile un poco con los bajos)
            let globalJump = (bass * audioDepth * 0.3);

            // Z Final
            positions[i * 3 + 2] = zStructure + zAudio + globalJump;

            // Ajustar intensidad del verde basado en brillo para estilo Matrix
            colors[i * 3 + 1] = 0.5 + brightness * 0.5 + (groupAudio * 0.5); // Brillar más con audio
        }
    }

    cloud.geometry.attributes.position.needsUpdate = true;
    cloud.geometry.attributes.color.needsUpdate = true;

    // Rotación suave para efecto 3D
    points.rotation.y += 0.002;

    cloud.renderer.render(cloud.scene, cloud.camera);
}
