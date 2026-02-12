const express = require('express')
const publishersRouter = express.Router()
const {
  publishers_list_get,
  publisher_search_get,
  publisher_create_get,
  publisher_create_post,
  publisher_details_get,
  publisher_update_get,
  publisher_update_post,
  publisher_delete_post,
} = require('../controllers/publishersController')

// Show books
publishersRouter.get('/', publishers_list_get)

// Search for a book
// publishersRouter.get('/search', (req, res) => res.send('Show searched publisher'))

// Add a new book
// publishersRouter.get('/new', (req, res) => res.send('Show form to add an publisher'))
// publishersRouter.post('/new', (req, res) => res.redirect('/publishers'))

// Show book
publishersRouter.get('/:id', publisher_details_get)


// Update a book
// publishersRouter.get('/:id/update', (req, res) => res.send('Show pre-populated publisher form'))
// publishersRouter.post('/:id/update', (req, res) => res.redirect('/publishers'))

// Delete a book
// publishersRouter.post('/:id/delete', (req, res) => res.redirect('/publishers'))


module.exports = publishersRouter
