import sharp from "sharp";
import { Request, Response, NextFunction } from "express";

export const compressImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.file) {
    return next();
  }

  try {
    // Log original file details
    console.log("Original file size (bytes):", req.file.buffer.length);

    // Get image metadata
    const originalMetadata = await sharp(req.file.buffer).metadata();

    // Check if metadata is valid
    if (!originalMetadata.width || !originalMetadata.height) {
      throw new Error("Unable to read image dimensions.");
    }

    console.log(
      "Original file dimensions:",
      originalMetadata.width,
      "x",
      originalMetadata.height
    );

    // Skip compression if the image is already small
    if (req.file.buffer.length <= 10240) {
      // 10KB threshold
      console.log("Image is already small. Skipping compression.");
      return next();
    }

    // Compress the image using sharp
    const compressedImageBuffer = await sharp(req.file.buffer)
      .resize(
        originalMetadata.width > 800 || originalMetadata.height > 800
          ? 800
          : null,
        null,
        {
          fit: "inside",
          withoutEnlargement: true,
        }
      )
      .toFormat("webp", { quality: 60 })
      .toBuffer();

    console.log("Compressed file size (bytes):", compressedImageBuffer.length);
    const compressedMetadata = await sharp(compressedImageBuffer).metadata();

    // Check if compressed metadata is valid
    if (!compressedMetadata.width || !compressedMetadata.height) {
      throw new Error("Unable to read compressed image dimensions.");
    }

    console.log(
      "Compressed file dimensions:",
      compressedMetadata.width,
      "x",
      compressedMetadata.height
    );

    // Replace the original file buffer with the compressed one
    req.file.buffer = compressedImageBuffer;

    next();
  } catch (error) {
    next(error);
  }
};
