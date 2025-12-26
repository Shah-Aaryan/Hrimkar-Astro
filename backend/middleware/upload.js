const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Configure Cloudinary storage for payment screenshots
const paymentScreenshotStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'hrimkar-astro/payment-screenshots',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1200, height: 1600, crop: 'limit', quality: 'auto' }]
    }
});

// Multer upload middleware for payment screenshots
const uploadPaymentScreenshot = multer({
    storage: paymentScreenshotStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept only images
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

module.exports = {
    uploadPaymentScreenshot
};
