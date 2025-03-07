const Section = require('../models/Section');
const { mongooseToObject, multipleMongooseObject } = require('../../util/mongoose');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');

class LessonController {
    // [GET] /courses/:courseId/sections/:sectionId/lessons/create
    async showCreate(req, res) {
        try {
            const course = await Course.findById(req.params.courseId);
            const section = await Section.findById(req.params.sectionId);

            if (!course || !section) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy khóa học hoặc chương học'
                });
            }

            res.render('lessons/create', {
                course: mongooseToObject(course),
                section: mongooseToObject(section),
                layout: 'minimal'
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // [POST] /courses/:courseId/sections/:sectionId/lessons
    async create(req, res) {
        try {
            const lesson = new Lesson({
                ...req.body,
                courseID: req.params.courseId,
                sectionID: req.params.sectionId
            });
            await lesson.save();
            const course = await Course.findById(req.params.courseId);
            res.redirect(`/${course.slug}/lessons`);
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // [DELETE] /courses/:courseId/lessons/:id
    async delete(req, res) {
        try {
            const lesson = await Lesson.findById(req.params.id);
            if (!lesson) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy bài học'
                });
            }

            const course = await Course.findById(req.params.courseId);
            await Lesson.delete({ _id: req.params.id });
            res.redirect(`/${course.slug}/lessons`);
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}

module.exports = new LessonController();