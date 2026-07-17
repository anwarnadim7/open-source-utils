/**
 * Browser Batch Image Resize Example
 * ----------------------------------
 * Resize multiple images locally using
 * the HTML5 Canvas API.
 *
 * Features:
 * - Multiple file support
 * - Preserves aspect ratio
 * - No uploads
 * - Privacy-first
 * - Supports JPG, PNG, WebP
 * - Local download
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

      const ratio = Math.min(
        maxWidth / width,
        maxHeight / height,
        1
      );

      width = Math.round(width * ratio);
      height = Math.round(height * ratio);

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
                "Failed to resize image."
              )
            );
            return;
          }

          resolve({
            fileName: file.name,
            blob,
            originalWidth: image.width,
            originalHeight: image.height,
            resizedWidth: width,
            resizedHeight: height,
            originalSize: file.size,
            resizedSize: blob.size
          });
        },
        format,
        quality
      );
    };

    image.onerror = () => {
      reject(
        new Error(
          `Failed to load ${file.name}`
        )
      );
    };

    image.src =
      URL.createObjectURL(file);
  });
}

/**
 * Resize all selected files
 */
async function batchResize(
  files,
  options = {}
) {
  const results = [];

  for (const file of files) {
    try {
      const result =
        await resizeImage(
          file,
          options
        );

      results.push(result);

      console.log(
        `✓ ${file.name}`
      );
    } catch (error) {
      console.error(
        `✗ ${file.name}`,
        error
      );
    }
  }

  return results;
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
    const files =
      Array.from(
        event.target.files || []
      );

    if (!files.length) return;

    const results =
      await batchResize(
        files,
        {
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 0.85,
          format: "image/webp"
        }
      );

    for (const result of results) {
      console.log(
        `${result.fileName}`
      );

      console.log(
        `Original: ${result.originalWidth}x${result.originalHeight}`
      );

      console.log(
        `Resized: ${result.resizedWidth}x${result.resizedHeight}`
      );

      console.log(
        `Saved: ${(
          (
            result.originalSize -
            result.resizedSize
          ) /
          1024
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

      const extension =
        result.blob.type.includes(
          "webp"
        )
          ? "webp"
          : "jpg";

      const fileName =
        result.fileName.replace(
          /\.[^/.]+$/,
          ""
        );

      link.href = url;
      link.download =
        `${fileName}-resized.${extension}`;

      link.click();

      URL.revokeObjectURL(url);
    }

    console.log(
      `Completed ${results.length} images`
    );
  }
);
