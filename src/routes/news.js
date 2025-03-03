const express = require('express')
const router = express.Router()

const newsCtrl = require('../app/controllers/NewsController')

router.get('/', newsCtrl.index)
router.get('/:slug', newsCtrl.show)

module.exports = router