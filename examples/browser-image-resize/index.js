/**
 * Browser Image Resize Example
 * -----------------------------------------
 * Privacy-first image resizing example using
 * the HTML5 Canvas API.
 *
 * Features:
 * - No uploads
 * - Client-side processing
 * - Preserves aspect ratio
 * - Supports JPEG, PNG, WebP
 * - Runs entirely in the browser
 */

async function resizeImage(
  file,
  {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.9,
    format = "image/jpeg"
  } = {}
) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      let width = image.width;
      let height = image.height;

      // Maintain aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(
          maxWidth / width,
          maxHeight / height
        );

        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      // Create canvas
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");

      // Improve resize quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Draw resized image
      ctx.drawImage(
        image,
        0,
        0,
        width,
        height
      );

      // Export resized image
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(
              new Error(
                "Failed to create resized image."
              )
            );
            return;
          }

          resolve({
            blob,
            width,
            height,
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

    image.src = URL.createObjectURL(file);
  });
}

/*
Example Usage
------------------------------------------
*/

const input = document.querySelector("#imageInput");

input?.addEventListener(
  "change",
  async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      const result = await resizeImage(
        file,
        {
          maxWidth: 800,
          maxHeight: 800,
          quality: 0.85,
          format: "image/webp"
        }
      );

      console.log(
        "Original:",
        `${result.originalWidth}x${result.originalHeight}`
      );

      console.log(
        "Resized:",
        `${result.width}x${result.height}`
      );

      console.log(
        "File Size:",
        `${(result.size / 1024).toFixed(2)} KB`
      );

      // Download result
      const url = URL.createObjectURL(
        result.blob
      );

      const link = document.createElement("a");
      link.href = url;
      link.download = "resized-image.webp";
      link.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  }
);
