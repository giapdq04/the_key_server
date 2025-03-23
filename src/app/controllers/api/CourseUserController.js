const Course = require("../../models/Course")
const User = require("../../models/User")
const Section = require("../../models/Section")
const Lesson = require("../../models/Lesson")
const UserProgress = require("../../models/UserProgress")

class CourseUserController {

    // [GET] /all-courses
    async getAllCourse(req, res) {
        try {
            // Sử dụng aggregation để lấy số lượng đăng ký theo khóa học
            const enrollmentData = await UserProgress.aggregate([
                { $group: { _id: "$courseID", enrolledCount: { $sum: 1 } } }
            ]);

            // Chuyển đổi kết quả thành một đối tượng dễ truy cập
            const enrollmentMap = enrollmentData.reduce((map, item) => {
                map[item._id.toString()] = item.enrolledCount;
                return map;
            }, {});

            // Lấy thông tin khóa học và thêm số lượng đăng ký
            const courses = await Course.find().select('_id title thumbnail slug');

            const result = courses.map(course => {
                const courseObj = course.toObject();
                courseObj.enrolledCount = enrollmentMap[course._id.toString()] || 0;
                return courseObj;
            });

            res.json(result);
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: e.message });
        }
    }

    // [GET] /:slug/:userID
    async getCourseUser(req, res) {
        try {
            const { slug, userID } = req.params

            // Tìm khóa học bằng slug
            const course = await Course
                .findOne({ slug })
                .select('-slug -description -deleted -updatedAt -createdAt -__v -ytbVideoId')
                .lean()

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
                courseID: course._id
            })

            // Nếu chưa đăng ký, chỉ trả về thông tin cơ bản của khóa học
            if (!userProgress) {
                return res.status(200).json({
                    course,
                    isEnrolled: false
                })
            }

            // Lấy tất cả các chương của khóa học
            const sections = await Section
                .find({ courseID: course._id })
                .select('-courseID -__v -deleted -createdAt -updatedAt')

            // Lấy tất cả các bài học của khóa học
            const lessons = await Lesson
                .find({ courseID: course._id })
                .select('-courseID -deleted -createdAt -__v')

            // Nhóm các bài học theo chương
            const sectionsWithLessons = sections.map(section => {
                const sectionLessons = lessons.filter(
                    lesson => lesson.sectionID.toString() === section._id.toString()
                )

                const userProgressCompletedLessonIDs = userProgress.completedLessons.map(lesson => lesson.lessonID.toString())

                // Đánh dấu mỗi bài học đã hoàn thành hay chưa
                const mappedLessons = sectionLessons.map(lesson => {

                    if (userProgressCompletedLessonIDs.includes(lesson._id.toString())) {
                        return {
                            ...lesson.toObject(),
                            isCompleted: true
                        }
                    }

                    return {
                        ...lesson.toObject(),
                        isCompleted: false
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
                course,
                sections: sectionsWithLessons,
                progress: {
                    totalLessons,
                    completedLessons,
                    progressPercentage
                }
            })

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Internal server error" })
        }
    }

    // Thêm phương thức đăng ký khóa học
    async enrollCourse(req, res) {
        try {
            const { courseID, userID } = req.body;

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
                return res.status(200).json({ message: "User already enrolled in this course" });
            }

            // Tạo bản ghi tiến trình mới cho người dùng
            const userProgress = new UserProgress({
                userID: userID,
                courseID: courseID,
                completedLessons: []
            });

            await userProgress.save();

            res.status(201).json({ message: "Enrolled successfully" });

        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    async getUserEnrolledCourses(req, res) {
        try {
            const { userID } = req.params;

            // Kiểm tra xem người dùng có tồn tại không
            const user = await User.findById(userID);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            // Lấy danh sách các khóa học mà người dùng đã đăng ký
            const userProgress = await UserProgress.find({ userID }).populate('courseID', 'title slug thumbnail');

            // Nếu người dùng chưa đăng ký khóa học nào
            if (!userProgress || userProgress.length === 0) {
                return res.status(200).json({ message: "No enrolled courses found", courses: [] });
            }

            // Trích xuất thông tin khóa học và tính toán tiến độ
            const enrolledCourses = await Promise.all(
                userProgress.map(async (progress) => {
                    const totalLessons = await Lesson.countDocuments({ courseID: progress.courseID._id });
                    const completedLessons = progress.completedLessons.length;
                    const progressPercentage = totalLessons > 0
                        ? Math.round((completedLessons / totalLessons) * 100)
                        : 0;

                    return {
                        courseID: progress.courseID._id,
                        title: progress.courseID.title,
                        slug: progress.courseID.slug,
                        ytbVideoId: progress.courseID.ytbVideoId,
                        progressPercentage
                    };
                })
            );

            res.status(200).json(enrolledCourses);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    async showCourseDetail(req, res) {

        try {
            const { slug } = req.params

            const course = await Course.findOne({ slug }).select('-deleted -__v')

            res.json(course)
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: error.message })
        }
    }


}

module.exports = new CourseUserController()