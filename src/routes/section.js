const express = require('express');
const router = express.Router();
const sectionController = require('../app/controllers/SectionController');

router.get('/courses/:courseId/sections', sectionController.index);
router.post('/courses/:courseId/sections', sectionController.store);
router.put('/sections/:id', sectionController.update);
router.delete('/sections/:id', sectionController.delete);

module.exports = router;