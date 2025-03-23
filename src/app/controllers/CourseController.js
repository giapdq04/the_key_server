const Course = require("../models/Course");
const Section = require("../models/Section");
const Lesson = require("../models/Lesson");
const extractPublicIdFromUrl = require("../../util/extractPublicIdFromUrl");
const { cloudinary } = require('../../config/cloudinary');


class CourseController {

    // [GET] /courses/:slug
    async show(req, res) {
        try {
            const { slug } = req.params
            const course = await Course.findOne({ slug }).lean()
            res.render('courses/show', {
                course,
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
            const { title, description } = req.body;

            // Kiểm tra dữ liệu đầu vào
            if (!title || !description || !req.file) {
                return res.render('courses/create', {
                    error: 'Hãy điền đầy đủ thông tin và tải lên ảnh thumbnail'
                });
            }

            // Lấy thông tin file đã được upload lên Cloudinary
            const thumbnail = req.file.path;

            const course = new Course({
                title: title.trim(),
                description: description.trim(),
                thumbnail
            });

            await course.save();
            res.redirect('/');
        } catch (e) {
            console.log(e);
            res.render('courses/create', {
                error: 'Đã xảy ra lỗi khi tạo khóa học'
            });
        }
    }

    // [GET] /courses/stored-courses
    async storedCourse(req, res) {
        try {
            const deletedCourses = await Course.countDocumentsWithDeleted({ deleted: true });
            const courses = await Course.find().lean()

            const convertCourses = courses.map(course => ({
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
            let course = await Course.findById(req.params.id).lean()
            res.render('courses/edit', { course })
        } catch (e) {
            console.log(e)
        }
    }

    //[PUT] /courses/:id
    async update(req, res) {
        try {
            const { title, description, currentThumbnail } = req.body;

            // Dữ liệu cập nhật
            const formData = {
                title: title.trim(),
                description: description.trim()
            };

            // Nếu có file ảnh mới được upload, sử dụng đường dẫn mới
            if (req.file) {
                formData.thumbnail = req.file.path;
                // Xóa ảnh cũ từ Cloudinary nếu có
                if (currentThumbnail) {
                    // Lấy public_id từ URL của Cloudinary
                    const publicId = extractPublicIdFromUrl(currentThumbnail);

                    if (publicId) {
                        // Xóa ảnh cũ bất đồng bộ (không cần đợi kết quả)
                        cloudinary.uploader.destroy(publicId)
                            .then(result => console.log('Deleted old thumbnail:', result))
                            .catch(err => console.error('Error deleting old thumbnail:', err));
                    }
                }
            } else {
                // Nếu không, giữ nguyên đường dẫn cũ
                formData.thumbnail = currentThumbnail;
            }

            await Course.updateOne({ _id: req.params.id }, formData);
            res.redirect('/courses/stored-courses');
        } catch (e) {
            console.log(e);
            res.status(500).render('courses/edit', {
                error: 'Đã xảy ra lỗi khi cập nhật khóa học'
            });
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

            // Tìm thông tin khóa học trước khi xóa để lấy URL thumbnail
            const course = await Course.findOneDeleted({ _id: courseId }).select('thumbnail');

            if (course && course.thumbnail) {
                // Lấy public_id từ URL của Cloudinary
                const publicId = extractPublicIdFromUrl(course.thumbnail);

                if (publicId) {
                    // Xóa ảnh thumbnail từ Cloudinary
                    try {
                        const result = await cloudinary.uploader.destroy(publicId);
                    } catch (cloudinaryError) {
                        console.error('Error deleting thumbnail from Cloudinary:', cloudinaryError);
                        // Tiếp tục quá trình xóa khóa học ngay cả khi không thể xóa ảnh
                    }
                }
            }

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
            const deletedCourses = await Course.findWithDeleted({ deleted: true }).lean()

            const convertCourses = deletedCourses.map(course => ({
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