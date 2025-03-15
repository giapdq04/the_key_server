const Course = require("../../models/Course")
const User = require("../../models/User")
const Section = require("../../models/Section")
const Lesson = require("../../models/Lesson")
const UserProgress = require("../../models/UserProgress")
const { mongooseToObject } = require("../../../util/mongoose")
const axios = require("axios")

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
            const courses = await Course.find().select('_id title ytbVideoId slug');

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

    // [GET] /:courseID/:userID
    async getCourseUser(req, res) {
        try {
            const { courseID, userID } = req.params

            // Tìm khóa học
            const course = await Course.findById(courseID).select('-deleted -updatedAt -createdAt -__v -description -ytbVideoId')

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
            const sections = await Section.find({ courseID: courseID }).select('-courseID -__v -deleted -createdAt -updatedAt')

            // Lấy tất cả các bài học của khóa học
            const lessons = await Lesson.find({ courseID: courseID }).select('-courseID -deleted -createdAt -__v')

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
                    progressPercentage
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
                return res.sendStatus(200);
            }

            // Tạo bản ghi tiến trình mới cho người dùng
            const userProgress = new UserProgress({
                userID: userID,
                courseID: courseID,
                completedLessons: [],
                enrolledAt: new Date()
            });

            await userProgress.save();

            res.sendStatus(201)

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

// async showCourseDetail(req, res) {

//     function durationToSeconds(duration) {
//         const hours = duration.match(/(\d+)H/);
//         const minutes = duration.match(/(\d+)M/);
//         const seconds = duration.match(/(\d+)S/);

//         const h = hours ? parseInt(hours[1]) : 0;
//         const m = minutes ? parseInt(minutes[1]) : 0;
//         const s = seconds ? parseInt(seconds[1]) : 0;

//         return h * 3600 + m * 60 + s;
//     }

//     try {
//         const { slug } = req.params

//         const course = await Course.findOne({ slug }).select('-deleted -__v')

//         const lessons = await Lesson.find({ courseID: course._id }).select('ytbVideoID')

//         let lessonVideoIDs = lessons.map(lesson => lesson.ytbVideoID)

//         const videosData = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${lessonVideoIDs.join(',')}&key=${process.env.YOUTUBE_API_KEY}`)

//         const videosInfo = videosData.data.items

//         const videosDuration = videosInfo.map(video => video.contentDetails.duration)

//         const totalDuration = videosDuration.reduce((acc, duration) => acc + durationToSeconds(duration), 0)

//         const hours = Math.floor(totalDuration / 3600);
//         const minutes = Math.floor((totalDuration % 3600) / 60);
//         const seconds = totalDuration % 60;


//         res.json({ hours: hours, minutes, seconds })
//     } catch (error) {
//         console.log(error)
//         res.status(500).json({ message: error.message })
//     }
// }

module.exports = new CourseUserController()