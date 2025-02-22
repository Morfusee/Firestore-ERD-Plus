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
    // Get image metadata
    const originalMetadata = await sharp(req.file.buffer).metadata();

    // Check if metadata is valid
    if (!originalMetadata.width || !originalMetadata.height) {
      throw new Error("Unable to read image dimensions.");
    }

    // Skip compression if the image is already small
    if (req.file.buffer.length <= 10240) {
      // 10KB threshold
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

    const compressedMetadata = await sharp(compressedImageBuffer).metadata();

    // Check if compressed metadata is valid
    if (!compressedMetadata.width || !compressedMetadata.height) {
      throw new Error("Unable to read compressed image dimensions.");
    }

    // Replace the original file buffer with the compressed one
    req.file.buffer = compressedImageBuffer;

    next();
  } catch (error) {
    next(error);
  }
};
