const express = require('express')
const booksRouter = express.Router()


// Show books
booksRouter.get('/', (req, res) => res.send('All books'))

// Search for a book
booksRouter.get('/search', (req, res) => res.send('Show searched book'))

// Add a new book
booksRouter.get('/new', (req, res) => res.send('Show form to add a book'))
booksRouter.post('/new', (req, res) => res.redirect('/books'))

// Show book
booksRouter.get('/:id', (req, res) => res.send('Single book'))


// Update a book
booksRouter.get('/:id/update', (req, res) => res.send('Show pre-populated book form'))
booksRouter.post('/:id/update', (req, res) => res.redirect('/books'))

// Delete a book
booksRouter.post('/:id/delete', (req, res) => res.redirect('/books'))


module.exports = booksRouter
