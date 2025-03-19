const Section = require('../models/Section');
const { mongooseToObject, multipleMongooseObject } = require('../../util/mongoose');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const { getYouTubeVideoId } = require('../../util/videoId');
const mongoose = require('mongoose');
const { getDocId } = require('../../util/docId');
const { getVideoDuration } = require('../../util/youtubeVideoDuraion');

class LessonController {
    // [GET] /courses/:courseID/sections/:sectionID/lessons/create
    async showCreate(req, res) {
        try {
            const { courseID, sectionID } = req.params;

            // Kiểm tra tính hợp lệ của ID trước khi truy vấn
            if (!mongoose.Types.ObjectId.isValid(courseID) || !mongoose.Types.ObjectId.isValid(sectionID)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID không hợp lệ'
                });
            }

            // Thực thi truy vấn song song 
            const [course, section] = await Promise.all([
                Course.findById(courseID, 'title slug description'), // Chỉ lấy các trường cần thiết
                Section.findById(sectionID, 'title courseID')
            ]);

            if (!course || !section) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy khóa học hoặc chương học'
                });
            }

            // Kiểm tra xem section có thuộc về course không
            if (section.courseID.toString() !== courseID) {
                return res.status(400).json({
                    success: false,
                    message: 'Chương học không thuộc về khóa học này'
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

    // Tối ưu phương thức create
    async create(req, res) {
        try {
            const { ytbVideoLink, exerciseContent, docLink } = req.body;
            const { courseID, sectionID } = req.params;

            // Kiểm tra ID hợp lệ
            if (!mongoose.Types.ObjectId.isValid(courseID) || !mongoose.Types.ObjectId.isValid(sectionID)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID không hợp lệ'
                });
            }

            // Kiểm tra course và section tồn tại
            const [courseExists, sectionExists] = await Promise.all([
                Course.exists({ _id: courseID }),
                Section.exists({ _id: sectionID, courseID })
            ]);

            if (!courseExists || !sectionExists) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy khóa học hoặc chương học'
                });
            }

            const ytbVideoID = getYouTubeVideoId(ytbVideoLink);

            const duration = await getVideoDuration(ytbVideoID)


            const lesson = new Lesson({
                ...req.body,
                courseID,
                sectionID,
                ytbVideoID,
                docID: getDocId(docLink),
                questions: exerciseContent,
                duration
            });

            // Lưu bài học và lấy khóa học cùng lúc
            await lesson.save();
            const course = await Course.findById(courseID, 'slug');

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

            // Kiểm tra tính hợp lệ của ID trước khi truy vấn
            if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(courseID)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID không hợp lệ'
                });
            }

            // Truy vấn song song bài học và khóa học
            const [lesson, course] = await Promise.all([
                Lesson.exists({ _id: id }), // Chỉ kiểm tra tồn tại, không cần lấy toàn bộ thông tin
                Course.findById(courseID, 'slug') // Chỉ lấy trường slug cần thiết
            ]);

            // Kiểm tra bài học tồn tại
            if (!lesson) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy bài học'
                });
            }

            // Kiểm tra khóa học tồn tại
            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy khóa học'
                });
            }

            // Xóa bài học và chuyển hướng
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

            // Kiểm tra tính hợp lệ của ID trước khi truy vấn
            if (!mongoose.Types.ObjectId.isValid(courseID) || !mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID không hợp lệ'
                });
            }

            // Thực hiện các truy vấn song song để giảm thời gian chờ
            const [course, lesson] = await Promise.all([
                Course.findById(courseID, 'title slug description'), // Chỉ lấy các trường cần thiết
                Lesson.findById(id)
            ]);

            // Kiểm tra course và lesson tồn tại
            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy khóa học'
                });
            }

            if (!lesson) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy bài học'
                });
            }

            // Kiểm tra xem bài học có thuộc về khóa học này không
            if (lesson.courseID.toString() !== courseID) {
                return res.status(400).json({
                    success: false,
                    message: 'Bài học không thuộc về khóa học này'
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

            // Kiểm tra tính hợp lệ của ID trước khi truy vấn
            if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(courseID)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID không hợp lệ'
                });
            }

            // Kiểm tra xem bài học và khóa học tồn tại
            const [lesson, course] = await Promise.all([
                Lesson.exists({ _id: id, courseID }),
                Course.findById(courseID, 'slug') // Chỉ lấy trường slug cần thiết
            ]);

            if (!lesson) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy bài học hoặc bài học không thuộc về khóa học này'
                });
            }

            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy khóa học'
                });
            }

            // Chuẩn bị dữ liệu cập nhật
            const updateData = { title: title.trim() };

            // Dựa vào loại bài học, cập nhật dữ liệu tương ứng
            if (lessonType === 'video') {
                updateData.ytbVideoID = getYouTubeVideoId(ytbVideoLink);
                updateData.docID = null;
                updateData.questions = null;
            } else if (lessonType === 'document') {
                updateData.ytbVideoID = null;
                updateData.docID = getDocId(docLink);
                updateData.questions = null;
            } else if (lessonType === 'exercise') {
                updateData.ytbVideoID = null;
                updateData.docID = null;
                updateData.questions = exerciseContent;
            }

            // Cập nhật bài học
            await Lesson.findByIdAndUpdate(id, updateData, {
                runValidators: true  // Đảm bảo dữ liệu hợp lệ theo schema
            });

            // Chuyển hướng người dùng
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