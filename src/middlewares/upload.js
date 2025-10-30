import multer from "multer";
import AppError from "../utils/AppError.js";

export const upload = multer({
    storage: multer.diskStorage({}),
    limits: {
        fileSize: 5 * 1024 * 1024 
    },
    fileFilter: (req, file, cb) => {
        if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            const err = new AppError('Only image files are allowed', 400);
            return cb(err, false);
        }

        return cb(null, true);
    }
});
