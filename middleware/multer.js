import multer from 'multer';

// Memory storage so we can directly use file.buffer
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // console.log('File received:', file.originalname, file.mimetype);
    if (
        file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/msword' || // .doc
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
    ) {
        cb(null, true);
    } else {
        cb(new Error('Only .pdf, .doc, .docx files are allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

export default upload;
