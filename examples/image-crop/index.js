/**
 * Browser Image Crop Example
 * ------------------------------------
 * Crop images locally using Canvas API.
 *
 * Features:
 * - No uploads
 * - Privacy-first
 * - Rectangle crop
 * - JPEG, PNG, WebP output
 * - Local download
 */

async function cropImage(
  file,
  {
    x = 0,
    y = 0,
    width = 500,
    height = 500,
    format = "image/jpeg",
    quality = 0.9
  } = {}
) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      ctx.drawImage(
        image,
        x,
        y,
        width,
        height,
        0,
        0,
        width,
        height
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(
              new Error(
                "Failed to crop image."
              )
            );
            return;
          }

          resolve({
            blob,
            cropX: x,
            cropY: y,
            cropWidth: width,
            cropHeight: height,
            originalWidth: image.width,
            originalHeight: image.height,
            size: blob.size
          });
        },
        format,
        quality
      );
    };

    image.onerror = () => {
      reject(
        new Error(
          "Unable to load image."
        )
      );
    };

    image.src =
      URL.createObjectURL(file);
  });
}

/*
Example Usage
-------------------------------------
*/

const input =
  document.querySelector(
    "#imageInput"
  );

input?.addEventListener(
  "change",
  async (event) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    try {
      const result =
        await cropImage(
          file,
          {
            x: 100,
            y: 100,
            width: 500,
            height: 500,
            format: "image/webp",
            quality: 0.9
          }
        );

      console.log(
        `Original: ${result.originalWidth}x${result.originalHeight}`
      );

      console.log(
        `Crop: ${result.cropWidth}x${result.cropHeight}`
      );

      console.log(
        `Output Size: ${(
          result.size / 1024
        ).toFixed(2)} KB`
      );

      const url =
        URL.createObjectURL(
          result.blob
        );

      const link =
        document.createElement(
          "a"
        );

      link.href = url;
      link.download =
        "cropped-image.webp";

      link.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  }
);
