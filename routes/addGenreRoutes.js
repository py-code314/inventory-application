const express = require('express')
const addGenreRouter = express.Router()




// Add a new genre
addGenreRouter.get('/', (req, res) => res.send('Show form to add a genre'))
addGenreRouter.post('/', (req, res) => res.redirect('/genres'))






module.exports = addGenreRouter
