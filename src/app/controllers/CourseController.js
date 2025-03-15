const { mongooseToObject, multipleMongooseObject } = require("../../util/mongoose");
const Course = require("../models/Course");
const { getYouTubeVideoId } = require("../../util/videoId");
const Section = require("../models/Section");
const Lesson = require("../models/Lesson");

class CourseController {

    // [GET] /courses/:slug
    async show(req, res) {
        try {
            const { slug } = req.params
            const course = await Course.findOne({ slug })
            res.render('courses/show', {
                course: mongooseToObject(course),
                layout: 'minimal' // Use minimal layout
            })
        } catch (error) {
            console.log(error);
        }
    }

    // [GET] /courses/create
    async create(req, res) {
        res.render('courses/create')
    }


    // [POST] /courses/store
    async store(req, res) {
        try {
            const { title, description, ytbVideoLink } = req.body

            if (ytbVideoLink === '', title === '', description === '') {
                return res.render('courses/create', {
                    error: 'Hãy điền đầy đủ thông tin'
                })
            }

            const course = new Course({
                title: title.trim(),
                description: description.trim(),
                ytbVideoId: getYouTubeVideoId(ytbVideoLink)
            })
            await course.save()
            res.redirect('/')
        } catch (e) {
            console.log(e)
        }

    }

    // [GET] /courses/stored-courses
    async storedCourse(req, res) {
        try {
            const deletedCourses = await Course.countDocumentsWithDeleted({ deleted: true });
            const courses = await Course.find()

            const convertCourses = multipleMongooseObject(courses).map(course => ({
                ...course,
                updatedAt: course.updatedAt.toLocaleString()
            }))

            res.render('courses/stored-courses', {
                courses: convertCourses,
                deletedCourses
            })
        } catch (e) {
            console.log(e)
        }
    }

    // [GET] /courses/:id/edit
    async edit(req, res) {
        try {
            let course = await Course.findById(req.params.id)

            let convertCourse = mongooseToObject(course)
            convertCourse = {
                ...convertCourse,
                ytbVideoLink: `https://www.youtube.com/watch?v=${convertCourse.ytbVideoId}`
            }
            res.render('courses/edit', {
                course: convertCourse
            })
        } catch (e) {
            console.log(e)
        }
    }

    //[PUT] /courses/:id
    async update(req, res) {
        try {
            const editedCourse = req.body
            const formData = {
                title: editedCourse.title,
                description: editedCourse.description,
                ytbVideoId: getYouTubeVideoId(editedCourse.ytbVideoLink)
            }
            await Course.updateOne({ _id: req.params.id }, formData)
            res.redirect('/courses/stored-courses')
        } catch (e) {
            console.log(e)
        }
    }

    // [DELETE] /courses/:id
    async delete(req, res) {
        try {
            const courseId = req.params.id;

            // Soft delete the course
            await Course.delete({ _id: courseId });

            // Soft delete all sections of this course
            await Section.deleteMany({ courseID: courseId });

            // Soft delete all lessons of this course
            await Lesson.deleteMany({ courseID: courseId });

            res.redirect('back');
        } catch (e) {
            console.log(e);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // [DELETE] /courses/:id/force
    async forceDelete(req, res) {
        try {
            const courseId = req.params.id;

            // Permanently delete all lessons of this course
            await Lesson.deleteMany({ courseID: courseId });

            // Permanently delete all sections of this course
            await Section.deleteMany({ courseID: courseId });

            // Permanently delete the course itself
            await Course.deleteOne({ _id: courseId });

            res.redirect('back');
        } catch (e) {
            console.log(e);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // [GET] /courses/trash
    async trashCourse(req, res) {
        try {
            const deletedCourses = await Course.findWithDeleted({ deleted: true });

            const convertCourses = multipleMongooseObject(deletedCourses).map(course => ({
                ...course,
                deletedAt: course.deletedAt.toLocaleString()
            }))

            res.render('courses/trash-courses', {
                courses: convertCourses
            })
        } catch (e) {
            console.log(e)
        }
    }

    // [PATCH] /courses/:id/restore
    async restore(req, res) {
        try {
            await Course.restore({ _id: req.params.id })
            res.redirect('back')
        } catch (e) {
            console.log(e)
        }
    }

    // [POST] /courses/handle-form-actions
    async handleFormActions(req, res) {
        try {
            switch (req.body.action) {
                case 'delete':
                    await Course.delete({ _id: req.body.courseIds })
                    res.redirect('back')
                    break
                default:
                    res.json({ message: 'Action is invalid!' })
            }
        } catch (e) {
            console.log(e)
        }
    }

    async handleTrashFormActions(req, res) {
        try {
            switch (req.body.action) {
                case 'restore':
                    await Course.restore({ _id: req.body.courseIds })
                    break;

                case 'delete':
                    await Course.deleteMany({ _id: { $in: req.body.courseIds } })
                    break

                default:
                    break;
            }

            res.redirect('back')
        } catch (error) {
            console.log(error);
        }
    }

    // async calculateDuration(req, res) {

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
    //         const { courseID } = req.params
    //         const course = await Course.findById(courseID)
    //         res.json(course)
    //     } catch (error) {
    //         console.log(error);
    //         res.status(500).json({
    //             success: false,
    //             message: 'Internal server error'
    //         })
    //     }
    // }


}

module.exports = new CourseController;