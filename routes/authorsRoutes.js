const express = require('express')
const authorsRouter = express.Router()
const {authors_list_get} = require('../controllers/authorsController')


// Show books
authorsRouter.get('/', authors_list_get)

// Search for a book
authorsRouter.get('/search', (req, res) => res.send('Show searched author'))

// Add a new book
authorsRouter.get('/new', (req, res) => res.send('Show form to add an author'))
authorsRouter.post('/new', (req, res) => res.redirect('/authors'))

// Show book
authorsRouter.get('/:id', (req, res) => res.send('Single author'))


// Update a book
authorsRouter.get('/:id/update', (req, res) => res.send('Show pre-populated author form'))
authorsRouter.post('/:id/update', (req, res) => res.redirect('/authors'))

// Delete a book
authorsRouter.post('/:id/delete', (req, res) => res.redirect('/authors'))


module.exports = authorsRouter
