const Slide = require("../../models/Slide")

class SlideUserController {

    async getAllSlides(req, res) {
        try {
            const { type } = req.query;
            const slides = await Slide
                .find({ active: true, type })
                .sort({ order: 1 })
                .select('-active -__v -deleted -createdAt -updatedAt')
            res.status(200).json(slides)
        } catch (error) {
            console.log(error)
            res.status(500).json({
                message: 'Internal server error'
            })
        }
    }
}

module.exports = new SlideUserController()