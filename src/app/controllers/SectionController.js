const Section = require('../models/Section');
const { mongooseToObject, multipleMongooseObject } = require('../../util/mongoose');
const Course = require('../models/Course');

class SectionController {
    // [POST] /courses/:courseId/sections
    async store(req, res) {
        try {
            const result = await Course.findById(req.params.courseId)

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy khóa học'
                });
            }

            const section = new Section({
                title: req.body.title,
                courseID: req.params.courseId,
            });
            await section.save();
            res.redirect('back');
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // [PUT] /courses/:courseId/sections/:id
    async update(req, res) {
        try {
            await Section.updateOne(
                { _id: req.params.id },
                { title: req.body.title }
            );
            res.redirect('back');
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // [DELETE] /courses/:courseId/sections/:id
    async delete(req, res) {
        try {
            await Section.delete({ _id: req.params.id });
            res.redirect('back');
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // [GET] /courses/:courseId/sections
    async index(req, res) {
        try {
            const sections = await Section.find({ courseID: req.params.courseId });
            res.json({
                success: true,
                sections: multipleMongooseObject(sections)
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}

module.exports = new SectionController();