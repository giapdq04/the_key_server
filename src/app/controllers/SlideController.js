const Slide = require('../models/Slide')
const extractPublicIdFromUrl = require("../../util/extractPublicIdFromUrl");
const { cloudinary } = require("../../config/cloudinary");

class SlideController {

    async index(req, res) {
        try {
            const slides = await Slide.find().sort({ order: 1 }).lean();
            res.render('slide', { slides });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async store(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng tải lên hình ảnh'
                });
            }

            const { title, link, order, active } = req.body;
            const imageUrl = req.file.path;

            const slide = new Slide({
                title: title.trim(),
                imageUrl,
                link: link || '',
                order: parseInt(order) || 1,
                active: active === 'on'
            });

            await slide.save();
            res.redirect('/slides');
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async update(req, res) {
        try {
            const { title, link, order, active, currentImageUrl } = req.body;

            const updateData = {
                title: title.trim(),
                link: link || '',
                order: parseInt(order) || 1,
                active: active === 'on'
            };

            if (req.file) {
                updateData.imageUrl = req.file.path;

                // Delete old image from Cloudinary
                if (currentImageUrl) {
                    const publicId = extractPublicIdFromUrl(currentImageUrl);
                    if (publicId) {
                        cloudinary.uploader.destroy(publicId)
                            .then(result => console.log('Deleted old slide image:', result))
                            .catch(err => console.error('Error deleting old slide image:', err));
                    }
                }
            } else {
                updateData.imageUrl = currentImageUrl;
            }

            await Slide.findByIdAndUpdate(req.params.id, updateData);
            res.redirect('/slides');
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async destroy(req, res) {
        try {
            const slide = await Slide.findById(req.params.id);

            if (slide && slide.imageUrl) {
                const publicId = extractPublicIdFromUrl(slide.imageUrl);
                if (publicId) {
                    cloudinary.uploader.destroy(publicId)
                        .then(result => console.log('Deleted slide image:', result))
                        .catch(err => console.error('Error deleting slide image:', err));
                }
            }

            await Slide.deleteOne({ _id: req.params.id });
            res.redirect('/slides');
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}

module.exports = new SlideController()