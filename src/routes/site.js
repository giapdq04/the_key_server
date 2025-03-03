const express = require('express')
const router = express.Router()

const siteCtrl = require('../app/controllers/SiteController')

router.get('/', siteCtrl.index)
router.get('/search', siteCtrl.search)

module.exports = router