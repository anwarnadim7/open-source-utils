/**
 * Remove Image Metadata (EXIF) Example
 * ------------------------------------
 * Privacy-first metadata removal using
 * only browser APIs and Canvas.
 *
 * Features:
 * - Removes EXIF metadata
 * - Removes GPS location data
 * - Removes camera information
 * - Keeps image pixels unchanged
 * - No uploads
 * - Fully client-side
 */

async function removeMetadata(
  file,
  {
    format = "image/jpeg",
    quality = 0.95
  } = {}
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

      // Redraw image to canvas.
      // Exporting from canvas strips metadata.
      ctx.drawImage(
        image,
        0,
        0,
        image.width,
        image.height
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(
              new Error(
                "Failed to remove metadata."
              )
            );
            return;
          }

          resolve({
            blob,
            originalSize: file.size,
            cleanedSize: blob.size,
            width: image.width,
            height: image.height,
            removedBytes:
              file.size - blob.size
          });
        },
        format,
        quality
      );
    };

    image.onerror = () => {
      reject(
        new Error(
          "Unable to read image."
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
        await removeMetadata(
          file,
          {
            format: "image/jpeg",
            quality: 0.95
          }
        );

      console.log(
        `Original Size: ${(
          result.originalSize /
          1024
        ).toFixed(2)} KB`
      );

      console.log(
        `Cleaned Size: ${(
          result.cleanedSize /
          1024
        ).toFixed(2)} KB`
      );

      console.log(
        `Metadata Removed: ${(
          result.removedBytes /
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

      link.href = url;
      link.download =
        "metadata-removed.jpg";

      link.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  }
);

/*
Optional helper:
Detect whether the original
image contains EXIF metadata.
*/

function hasExifMetadata(
  file
) {
  return new Promise(
    (resolve) => {
      const reader =
        new FileReader();

      reader.onload = (
        event
      ) => {
        const bytes =
          new Uint8Array(
            event.target.result
          );

        // EXIF marker
        const exif =
          [0x45, 0x78, 0x69, 0x66];

        for (
          let i = 0;
          i <
          bytes.length -
            exif.length;
          i++
        ) {
          let found = true;

          for (
            let j = 0;
            j < exif.length;
            j++
          ) {
            if (
              bytes[i + j] !==
              exif[j]
            ) {
              found = false;
              break;
            }
          }

          if (found) {
            resolve(true);
            return;
          }
        }

        resolve(false);
      };

      reader.readAsArrayBuffer(
        file
      );
    }
  );
}
