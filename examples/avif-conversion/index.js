/**
 * Browser AVIF Conversion Example
 * -----------------------------------
 * Converts images to AVIF format locally
 * using browser APIs and Canvas.
 *
 * Features:
 * - No uploads
 * - Privacy-first processing
 * - Adjustable quality
 * - Browser support detection
 * - Local download
 */

function supportsAVIF() {
  const canvas = document.createElement("canvas");

  try {
    return (
      canvas.toDataURL("image/avif")
        .indexOf("image/avif") === 5
    );
  } catch {
    return false;
  }
}

async function convertToAVIF(
  file,
  quality = 0.8
) {
  return new Promise((resolve, reject) => {
    if (!supportsAVIF()) {
      reject(
        new Error(
          "AVIF export is not supported in this browser."
        )
      );
      return;
    }

    const image = new Image();

    image.onload = () => {
      const canvas =
        document.createElement(
          "canvas"
        );

      canvas.width = image.width;
      canvas.height = image.height;

      const ctx =
        canvas.getContext("2d");

      ctx.imageSmoothingEnabled =
        true;

      ctx.imageSmoothingQuality =
        "high";

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
                "Failed to convert image to AVIF."
              )
            );
            return;
          }

          const savings =
            (
              (
                file.size -
                blob.size
              ) /
              file.size
            ) * 100;

          resolve({
            blob,
            width: image.width,
            height: image.height,
            originalSize:
              file.size,
            convertedSize:
              blob.size,
            savings
          });
        },
        "image/avif",
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
-----------------------------------
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
        await convertToAVIF(
          file,
          0.8
        );

      console.log(
        `Original Size: ${(
          result.originalSize /
          1024
        ).toFixed(2)} KB`
      );

      console.log(
        `AVIF Size: ${(
          result.convertedSize /
          1024
        ).toFixed(2)} KB`
      );

      console.log(
        `Space Saved: ${result.savings.toFixed(
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
        "converted-image.avif";

      link.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  }
);
