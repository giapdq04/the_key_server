const {mongooseToObject, multipleMongooseObject} = require("../../util/mongoose");
const Course = require("../models/Course");
const {getYouTubeVideoId} = require("../../util/videoId");

class CourseController {

    // [GET] /courses/:slug
    async show(req, res) {
        try {
            const {slug} = req.params
            const course = await Course.findOne({slug})
            res.render('courses/show', {course: mongooseToObject(course)})
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
            const course = new Course({
                ...req.body,
                ytbVideoId: getYouTubeVideoId(req.body.ytbVideoLink)
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
            const deletedCourses = await Course.countDocumentsWithDeleted({deleted: true});
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
            await Course.updateOne({_id: req.params.id}, formData)
            res.redirect('/courses/stored-courses')
        } catch (e) {
            console.log(e)
        }
    }

    // [DELETE] /courses/:id
    async delete(req, res) {
        try {
            await Course.delete({_id: req.params.id})
            res.redirect('back')
        } catch (e) {
            console.log(e)
        }
    }

    // [DELETE] /courses/:id/force
    async forceDelete(req, res) {
        try {
            await Course.deleteOne({_id: req.params.id})
            res.redirect('back')
        } catch (e) {
            console.log(e)
        }
    }

    // [GET] /courses/trash
    async trashCourse(req, res) {
        try {
            const deletedCourses = await Course.findWithDeleted({deleted: true});

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
            await Course.restore({_id: req.params.id})
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
                    await Course.delete({_id:req.body.courseIds})
                    res.redirect('back')
                    break
                default:
                    res.json({message: 'Action is invalid!'})
            }
        } catch (e) {
            console.log(e)
        }
    }


}

module.exports = new CourseController;