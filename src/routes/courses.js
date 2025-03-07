const express = require('express')
const router = express.Router()

const courseCtrl = require('../app/controllers/CourseController')

router.get('/create', courseCtrl.create)
router.post('/store', courseCtrl.store)
router.post('/handle-form-actions', courseCtrl.handleFormActions)
router.post('/trash/handle-form-actions', courseCtrl.handleTrashFormActions)
router.get('/stored-courses', courseCtrl.storedCourse)
router.get('/trash-course', courseCtrl.trashCourse)
router.get('/:id/edit', courseCtrl.edit)
router.put('/:id', courseCtrl.update)
router.patch('/:id/restore', courseCtrl.restore)
router.delete('/:id', courseCtrl.delete)
router.delete('/:id/force', courseCtrl.forceDelete)

module.exports = router