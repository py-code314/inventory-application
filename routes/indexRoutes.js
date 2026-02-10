const express = require('express')
const indexRouter = express.Router()


// Homepage route
indexRouter.get('/', (req, res) => res.send('Home page'))



module.exports = indexRouter
