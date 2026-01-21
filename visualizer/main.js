import { initWebcam } from './video/webcam.js';
import { initAudio } from './audio/analyzer.js';
import { createPointCloud, updatePointCloud } from './render/pointCloud.js';
import { startLoop } from './core/loop.js';

console.log("módulos importados en main.js");

// Configuración básica (simulada por ahora)
const config = {
    baseDepth: 50,
    audioDepth: 80 // Alto valor para notar el "salto"
};

async function start() {
    console.log("Iniciando función start()...");
    try {
        const video = await initWebcam();
        console.log("Webcam inicializada correctamente");

        // Inicializar audio (puede fallar si no hay permisos/micro, pero no detiene la app)
        const audioData = await initAudio();
        if (audioData) console.log("Audio inicializado correctamente");
        else console.warn("Audio no disponible");

        const cloud = createPointCloud();
        console.log("Nube de puntos creada");

        startLoop(() => {
            updatePointCloud(video, cloud, audioData, config);
        });
    } catch (error) {
        console.error("Error al iniciar el visualizador:", error);
        const errorLog = document.getElementById('error-log');
        if (errorLog) {
            errorLog.style.display = 'block';
            errorLog.innerHTML += `ERROR AL INICIAR: ${error.message}\n`;
        }
    }
}

start();
