const express = require('express')
const indexRouter = express.Router()
const {home_page_get} = require('../controllers/indexController')


// Homepage route
indexRouter.get('/', home_page_get)



module.exports = indexRouter
