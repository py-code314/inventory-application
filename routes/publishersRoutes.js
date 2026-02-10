const express = require('express')
const publishersRouter = express.Router()


// Show books
publishersRouter.get('/', (req, res) => res.send('List all publishers'))

// Search for a book
publishersRouter.get('/search', (req, res) => res.send('Show searched publisher'))

// Add a new book
publishersRouter.get('/new', (req, res) => res.send('Show form to add an publisher'))
publishersRouter.post('/new', (req, res) => res.redirect('/publishers'))

// Show book
publishersRouter.get('/:id', (req, res) => res.send('Single publisher'))


// Update a book
publishersRouter.get('/:id/update', (req, res) => res.send('Show pre-populated publisher form'))
publishersRouter.post('/:id/update', (req, res) => res.redirect('/publishers'))

// Delete a book
publishersRouter.post('/:id/delete', (req, res) => res.redirect('/publishers'))


module.exports = publishersRouter
