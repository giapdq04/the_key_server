const Course = require("../../models/Course");
const UserProgress = require("../../models/UserProgress");

class LessonUserController {

    async finishLesson(req, res) {
        try {
            const { userID, slug, lessonID } = req.body;

            const course = await Course.findOne({ slug: slug }).select("_id");

            if (!course) {
                return res.status(404).json({ message: "Course not found" })
            }
            const userProgress = await UserProgress.findOne({
                userID: userID,
                courseID: course._id
            })

            if (!userProgress) {
                return res.status(404).json({ message: "User progress not found" })
            }

            // Check if the lesson is already completed
            const lessonExists = userProgress.completedLessons.some(
                lesson => lesson.lessonID.toString() === lessonID
            );

            if (!lessonExists) {
                // Only add the lesson if it doesn't already exist
                userProgress.completedLessons.push({
                    lessonID: lessonID,
                    status: 1
                });
                
                await userProgress.save();
                res.status(200).json({ message: "Lesson finished successfully" });
            } else {
                // Lesson already completed
                res.status(200).json({ message: "Lesson already completed" });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}

module.exports = new LessonUserController()