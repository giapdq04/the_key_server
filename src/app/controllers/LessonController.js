const Section = require('../models/Section');
const { mongooseToObject, multipleMongooseObject } = require('../../util/mongoose');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const { getYouTubeVideoId } = require('../../util/videoId');
const mongoose = require('mongoose');
const { getDocId } = require('../../util/docId');
const { getVideoDuration } = require('../../util/youtubeVideoDuraion');
const fs = require("node:fs");
const csv = require("csv-parser");

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

    async create(req, res) {
        try {
            const { ytbVideoLink, exerciseContent, docLink } = req.body;
            const { courseID, sectionID } = req.params;

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
            const duration = await getVideoDuration(ytbVideoID);

            // Xử lý dữ liệu câu hỏi (từ CSV hoặc form)
            let questions = exerciseContent;
            
            // Trường hợp upload CSV
            if (exerciseContent === undefined && req.file) {
                try {
                    questions = JSON.stringify(await processCSVFile(req.file.path));
                } catch (err) {
                    return res.status(500).json({ error: 'Lỗi khi đọc file CSV' });
                }
            }

            // Tạo và lưu bài học
            const lesson = new Lesson({
                ...req.body,
                courseID,
                sectionID,
                ytbVideoID,
                docID: getDocId(docLink),
                questions,
                duration
            });

            await lesson.save();
            const course = await Course.findById(courseID, 'slug');
            return res.redirect(`/${course.slug}/lessons`);
            
        } catch (error) {
            console.log(error);
            return res.status(500).json({
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
                const ytbVideoID = getYouTubeVideoId(ytbVideoLink);
                updateData.ytbVideoID = ytbVideoID;
                updateData.docID = null;
                updateData.questions = null;

                // Thêm vào: Cập nhật duration khi chuyển sang loại video
                updateData.duration = await getVideoDuration(ytbVideoID);
            } else if (lessonType === 'document') {
                updateData.ytbVideoID = null;
                updateData.docID = getDocId(docLink);
                updateData.questions = null;
                updateData.duration = 0; // Đặt duration = 0 cho tài liệu
            } else if (lessonType === 'exercise') {
                updateData.ytbVideoID = null;
                updateData.docID = null;
                updateData.questions = exerciseContent;
                updateData.duration = 0; // Đặt duration = 0 cho bài tập
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

// Hàm xử lý file CSV (thêm bên ngoài class)
function processCSVFile(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        const convertAnswer = {
            "Đáp án 1": 0, "Đáp án 2": 1, "Đáp án 3": 2, "Đáp án 4": 3
        };

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => {
                results.push({
                    question: data['Câu hỏi'],
                    options: [
                        data['Đáp án 1'],
                        data['Đáp án 2'],
                        data['Đáp án 3'],
                        data['Đáp án 4']
                    ],
                    correctAnswer: convertAnswer[data['Đáp án đúng']]
                });
            })
            .on('end', () => {
                try {
                    fs.unlinkSync(filePath);
                } catch (err) {
                    console.error('Error deleting file:', err);
                }
                resolve(results);
            })
            .on('error', reject);
    });
}

module.exports = new LessonController();