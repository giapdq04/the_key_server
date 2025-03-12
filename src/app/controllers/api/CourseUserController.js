const Course = require("../../models/Course")
const User = require("../../models/User")
const Section = require("../../models/Section")
const Lesson = require("../../models/Lesson")
const UserProgress = require("../../models/UserProgress")
const { mongooseToObject } = require("../../../util/mongoose")

class CourseUserController {

    async getCourseUser(req, res) {
        try {
            const { courseID, userID } = req.params

            // Tìm khóa học
            const course = await Course.findById(courseID)

            if (!course) {
                return res.status(404).json({ message: "Course not found" })
            }

            const user = await User.findById(userID)

            if (!user) {
                return res.status(404).json({ message: "User not found" })
            }

            // Tìm tiến trình học tập của người dùng cho khóa học này
            const userProgress = await UserProgress.findOne({
                userID: userID,
                courseID: courseID
            })

            // Kiểm tra xem người dùng đã đăng ký khóa học hay chưa
            const isEnrolled = !!userProgress;

            // Nếu chưa đăng ký, chỉ trả về thông tin cơ bản của khóa học
            if (!isEnrolled) {
                return res.status(200).json({
                    course: mongooseToObject(course),
                    isEnrolled: false
                })
            }

            // Lấy tất cả các chương của khóa học
            const sections = await Section.find({ courseID: courseID })

            // Lấy tất cả các bài học của khóa học
            const lessons = await Lesson.find({ courseID: courseID })

            // Nhóm các bài học theo chương
            const sectionsWithLessons = sections.map(section => {
                const sectionLessons = lessons.filter(
                    lesson => lesson.sectionID.toString() === section._id.toString()
                )

                // Đánh dấu mỗi bài học đã hoàn thành hay chưa
                const mappedLessons = sectionLessons.map(lesson => {
                    const isCompleted = userProgress.completedLessons.some(
                        cl => cl.lessonID.toString() === lesson._id.toString()
                    )

                    return {
                        ...lesson.toObject(),
                        isCompleted
                    }
                })

                return {
                    ...section.toObject(),
                    lessons: mappedLessons
                }
            })

            // Tính toán tiến trình tổng thể
            const totalLessons = lessons.length
            const completedLessons = userProgress.completedLessons.length
            const progressPercentage = totalLessons > 0 ?
                Math.round((completedLessons / totalLessons) * 100) : 0

            res.status(200).json({
                course: mongooseToObject(course),
                sections: sectionsWithLessons,
                progress: {
                    totalLessons,
                    completedLessons,
                    progressPercentage,
                    enrolledAt: userProgress.enrolledAt
                },
                isEnrolled: true
            })

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Internal server error" })
        }
    }

    // Thêm phương thức đăng ký khóa học
    async enrollCourse(req, res) {
        try {
            const { courseID, userID } = req.params;

            // Kiểm tra xem khóa học tồn tại không
            const course = await Course.findById(courseID);
            if (!course) {
                return res.status(404).json({ message: "Course not found" });
            }

            // Kiểm tra xem người dùng tồn tại không
            const user = await User.findById(userID);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            // Kiểm tra xem người dùng đã đăng ký khóa học này chưa
            const existingProgress = await UserProgress.findOne({
                userID: userID,
                courseID: courseID
            });

            if (existingProgress) {
                return res.status(400).json({ message: "User already enrolled in this course" });
            }

            // Tạo bản ghi tiến trình mới cho người dùng
            const userProgress = new UserProgress({
                userID: userID,
                courseID: courseID,
                completedLessons: [],
                enrolledAt: new Date()
            });

            await userProgress.save();

            res.status(201).json({
                message: "Enrolled successfully",
                enrolledAt: userProgress.enrolledAt,
                courseID: courseID,
                userID: userID
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}

module.exports = new CourseUserController()