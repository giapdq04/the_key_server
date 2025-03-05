const express = require('express')
const router = express.Router()

const courseCtrl = require('../app/controllers/CourseController')

router.get('/create', courseCtrl.create)
router.post('/store', courseCtrl.store)
router.get('/stored-courses', courseCtrl.storedCourse)
router.get('/trash-course', courseCtrl.trashCourse)
router.get('/:id/edit', courseCtrl.edit)
router.put('/:id', courseCtrl.update)
router.patch('/:id/restore', courseCtrl.restore)
router.delete('/:id', courseCtrl.delete)
router.delete('/:id/force', courseCtrl.forceDelete)
router.get('/:slug', courseCtrl.show)

module.exports = router