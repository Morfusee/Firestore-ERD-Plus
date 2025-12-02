import multer from "multer";
import path from "path";

// Configure Multer to store files temporarily before uploading to Firebase
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = file.mimetype.startsWith('image/');

    if (extName && mimeType) {
      return cb(null, true);
    } else {
      return cb(new Error("Only images (JPEG, JPG, PNG) are allowed"));
    }
  },
});

export default upload;
