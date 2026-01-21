export async function initWebcam() {
  console.log("Llamando a initWebcam...");
  const video = document.createElement('video');
  video.autoplay = true;
  video.playsInline = true;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 }
    });
    video.srcObject = stream;
    await video.play();
    return video;
  } catch (error) {
    console.error("Error accediendo a la webcam:", error);
    alert("No se pudo acceder a la webcam. Por favor, asegúrate de dar permisos.");
    throw error;
  }
}
