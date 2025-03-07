const { mongooseToObject, multipleMongooseObject } = require("../../util/mongoose");
const Course = require("../models/Course");
const { getYouTubeVideoId } = require("../../util/videoId");
const Section = require("../models/Section");
const Lesson = require("../models/Lesson");

class CourseDetailController {

    async dashboard(req, res) {
        try {
            const { slug } = req.params;
            const course = await Course.findOne({ slug });

            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy khóa học 11'
                });
            }

            const sections = await Section.find({ courseID: course._id });

            res.render('courses/dashboard', {
                course: mongooseToObject(course),
                sections: multipleMongooseObject(sections),
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

    async storedLessons(req, res) {
        try {
            const { slug } = req.params;
            const course = await Course.findOne({ slug });

            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy khóa học 2'
                });
            }

            // Lấy tất cả sections của course
            const sections = await Section.find({ courseID: course._id });

            // Lấy lessons cho mỗi section và đợi tất cả hoàn thành
            const sectionsWithLessons = await Promise.all(
                sections.map(async section => {
                    const lessons = await Lesson.find({ sectionID: section._id });
                    return {
                        ...section.toObject(),
                        lessons: lessons.map(lesson => lesson.toObject())
                    };
                })
            );

            res.render('lessons', {
                course: mongooseToObject(course),
                sections: sectionsWithLessons,
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
}

module.exports = new CourseDetailController;