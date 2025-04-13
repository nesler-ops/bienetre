export const captureImage = async (): Promise<Blob | null> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.width = 320;
    video.height = 240;

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        video.srcObject = stream;
        video.play();

        setTimeout(() => {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");

          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
              resolve(blob);
              stream.getTracks().forEach((track) => track.stop());
            }, "image/jpeg");
          } else {
            reject("❌ Impossible de capturer l'image");
          }
        }, 2000);
      })
      .catch((err) => reject(err));
  });
};
