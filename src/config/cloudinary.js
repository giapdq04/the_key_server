// config.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: 'dlmsjy3jd',
    api_key: '211397247755155',
    api_secret: 'lj3xehCpXcYPbnRki2SMYQX1F0Q',
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

const upload = multer({ storage });

module.exports = { upload, cloudinary };