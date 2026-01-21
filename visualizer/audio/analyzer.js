
export async function initAudio() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;

        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        return { analyser, dataArray };
    } catch (e) {
        console.error("Error initializing audio:", e);
        return null; // Return null if audio fails, so visualizer can still work without it
    }
}
