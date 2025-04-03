const express = require('express')
const router = express.Router()

const siteCtrl = require('../app/controllers/SiteController')

router.get('/', siteCtrl.home)

module.exports = router