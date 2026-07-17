/**
 * Browser WebP Conversion Example
 * -------------------------------------
 * Converts images to WebP format locally
 * using the HTML5 Canvas API.
 *
 * Features:
 * - No uploads
 * - Privacy-first
 * - Adjustable quality
 * - Supports JPG, PNG, WebP input
 */

async function convertToWebP(
  file,
  quality = 0.85
) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;

      const ctx = canvas.getContext("2d");

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      ctx.drawImage(
        image,
        0,
        0
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(
              new Error(
                "Failed to convert image to WebP."
              )
            );
            return;
          }

          resolve({
            blob,
            width: image.width,
            height: image.height,
            originalSize: file.size,
            convertedSize: blob.size,
            savings:
              (
                (
                  file.size - blob.size
                ) /
                file.size
              ) * 100
          });
        },
        "image/webp",
        quality
      );
    };

    image.onerror = () => {
      reject(
        new Error(
          "Failed to load image."
        )
      );
    };

    image.src = URL.createObjectURL(file);
  });
}

/*
Example Usage
---------------------------------------
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
        await convertToWebP(
          file,
          0.85
        );

      console.log(
        `Original Size: ${(
          result.originalSize /
          1024
        ).toFixed(2)} KB`
      );

      console.log(
        `WebP Size: ${(
          result.convertedSize /
          1024
        ).toFixed(2)} KB`
      );

      console.log(
        `Savings: ${result.savings.toFixed(
          2
        )}%`
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
        "converted-image.webp";

      link.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  }
);
