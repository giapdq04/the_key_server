// config.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
    secure: true
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'thumbnails', // Thư mục trên Cloudinary (tùy chọn)
        allowedFormats: ['jpg', 'png', 'jpeg', 'gif'], // Các định dạng cho phép (tùy chọn)
        transformation: [
            { width: 1280, height: 720, crop: 'limit' } // Giới hạn kích thước tối đa là 1280x720
        ]
    },
});

const storageSlide = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'slides',
        allowedFormats: ['jpg', 'png', 'jpeg', 'gif'],
        transformation: [
            { width: 1776, height: 270, crop: 'limit' }
        ]
    },
});

const upload = multer({ storage });

const uploadSlide = multer({ storage: storageSlide });

module.exports = { upload, cloudinary, uploadSlide };