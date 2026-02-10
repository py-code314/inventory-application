const express = require('express')
const genresRouter = express.Router()


// Show genre/s
genresRouter.get('/', (req, res) => res.send('All genres'))
genresRouter.get('/:id', (req, res) => res.send('Single genre'))


// Update a genre
genresRouter.get('/:id/update', (req, res) => res.send('Show pre-populated genre form'))
genresRouter.post('/:id/update', (req, res) => res.redirect('/genres'))

// Delete a genre
genresRouter.post('/:id/delete', (req, res) => res.redirect('/genres'))




module.exports = genresRouter
