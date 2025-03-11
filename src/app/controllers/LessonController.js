const Section = require('../models/Section');
const { mongooseToObject, multipleMongooseObject } = require('../../util/mongoose');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const { getYouTubeVideoId } = require('../../util/videoId');

class LessonController {
    // [GET] /courses/:courseID/sections/:sectionID/lessons/create
    async showCreate(req, res) {
        try {
            const { courseID, sectionID } = req.params;

            const course = await Course.findById(courseID);
            const section = await Section.findById(sectionID);

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

    // [POST] /courses/:courseID/sections/:sectionID/lessons
    async create(req, res) {
        try {
            const { ytbVideoLink, exerciseContent } = req.body;
            const { courseID } = req.params;

            const lesson = new Lesson({
                ...req.body,
                ...req.params,
                ytbVideoID: getYouTubeVideoId(ytbVideoLink),
                questions: exerciseContent,
            });
            await lesson.save();
            const course = await Course.findById(courseID);
            res.redirect(`/${course.slug}/lessons`);
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // [DELETE] /courses/:courseID/lessons/:id
    async delete(req, res) {
        try {
            const { id, courseID } = req.params;
            const lesson = await Lesson.findById(id);
            if (!lesson) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy bài học'
                });
            }

            const course = await Course.findById(courseID);

            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy khóa học'
                });
            }

            await Lesson.delete({ _id: id });
            res.redirect(`/${course.slug}/lessons`);
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async showEdit(req, res) {
        try {
            const { courseID, id } = req.params;

            const course = await Course.findById(courseID);

            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy khóa học'
                });
            }
            const lesson = await Lesson.findById(id)

            if (!lesson) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy bài học'
                });
            }

            res.render('lessons/edit', {
                course: mongooseToObject(course),
                lesson: mongooseToObject(lesson),
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

    async update(req, res) {
        try {
            const { id, courseID } = req.params;
            const { title, lessonType, ytbVideoLink, docLink, exerciseContent } = req.body;

            const updateData = { title: title.trim() };

            // Dựa vào loại bài học, cập nhật dữ liệu tương ứng
            if (lessonType === 'video') {
                updateData.ytbVideoID = getYouTubeVideoId(ytbVideoLink);
                updateData.docLink = null;
                updateData.questions = null;
            } else if (lessonType === 'document') {
                updateData.ytbVideoID = null;
                updateData.docLink = docLink.trim();
                updateData.questions = null;
            } else if (lessonType === 'exercise') {
                updateData.ytbVideoID = null;
                updateData.docLink = null;
                updateData.questions = exerciseContent;
            }

            await Lesson.findByIdAndUpdate(id, updateData);

            const course = await Course.findById(courseID);
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