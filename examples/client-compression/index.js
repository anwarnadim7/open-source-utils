/**
 * Client-Side Image Compression Example
 * -------------------------------------
 * Compresses images directly in the browser
 * without uploading files to any server.
 *
 * Features:
 * - JPEG compression
 * - WebP compression
 * - Adjustable quality
 * - File size comparison
 * - Local download
 * - Privacy-first processing
 */

async function compressImage(
  file,
  {
    quality = 0.8,
    format = "image/jpeg",
    maxWidth = null,
    maxHeight = null
  } = {}
) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      let width = image.width;
      let height = image.height;

      // Optional resize before compression
      if (maxWidth && width > maxWidth) {
        const ratio = maxWidth / width;
        width = maxWidth;
        height = Math.round(height * ratio);
      }

      if (maxHeight && height > maxHeight) {
        const ratio = maxHeight / height;
        height = maxHeight;
        width = Math.round(width * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      ctx.drawImage(
        image,
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
                "Compression failed."
              )
            );
            return;
          }

          const reduction =
            (
              (
                file.size - blob.size
              ) /
              file.size
            ) * 100;

          resolve({
            blob,
            originalSize: file.size,
            compressedSize: blob.size,
            reduction,
            width,
            height,
            mimeType: blob.type
          });
        },
        format,
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

    image.src =
      URL.createObjectURL(file);
  });
}

/*
Example Usage
----------------------------------
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
        await compressImage(
          file,
          {
            quality: 0.75,
            format: "image/webp",
            maxWidth: 1920
          }
        );

      console.log(
        `Original Size: ${(
          result.originalSize /
          1024
        ).toFixed(2)} KB`
      );

      console.log(
        `Compressed Size: ${(
          result.compressedSize /
          1024
        ).toFixed(2)} KB`
      );

      console.log(
        `Reduction: ${result.reduction.toFixed(
          2
        )}%`
      );

      console.log(
        `Output Format: ${result.mimeType}`
      );

      const url =
        URL.createObjectURL(
          result.blob
        );

      const link =
        document.createElement(
          "a"
        );

      const extension =
        result.mimeType.includes(
          "webp"
        )
          ? "webp"
          : "jpg";

      link.href = url;
      link.download =
        `compressed-image.${extension}`;

      link.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  }
);
