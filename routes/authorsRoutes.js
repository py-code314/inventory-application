const express = require('express')
const authorsRouter = express.Router()
const {
  authors_list_get,
  author_search_get,
  author_create_get,
  author_create_post,
  author_details_get,
} = require('../controllers/authorsController')


// Show authors
authorsRouter.get('/', authors_list_get)

// Search for a author
authorsRouter.get('/search', author_search_get)

// Add a new author
authorsRouter.get('/new', author_create_get)
authorsRouter.post('/new', author_create_post)

// Show author
authorsRouter.get('/:id', author_details_get)


// Update a author
authorsRouter.get('/:id/update', (req, res) => res.send('Show pre-populated author form'))
authorsRouter.post('/:id/update', (req, res) => res.redirect('/authors'))

// Delete a author
authorsRouter.post('/:id/delete', (req, res) => res.redirect('/authors'))


module.exports = authorsRouter
