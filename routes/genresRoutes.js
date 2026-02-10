const express = require('express')
const genresRouter = express.Router()


// Show genres
genresRouter.get('/', (req, res) => res.send('All genres'))

// Search for a genre
genresRouter.get('/search', (req, res) => res.send('Show searched genre'))

// Add a new genre
genresRouter.get('/new', (req, res) => res.send('Show form to add a genre'))
genresRouter.post('/new', (req, res) => res.redirect('/genres'))

// Show genre
genresRouter.get('/:id', (req, res) => res.send('Single genre'))


// Update a genre
genresRouter.get('/:id/update', (req, res) => res.send('Show pre-populated genre form'))
genresRouter.post('/:id/update', (req, res) => res.redirect('/genres'))

// Delete a genre
genresRouter.post('/:id/delete', (req, res) => res.redirect('/genres'))







module.exports = genresRouter
