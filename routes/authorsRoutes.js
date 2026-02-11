const express = require('express')
const authorsRouter = express.Router()
const {
  authors_list_get,
  author_search_get,
  author_create_get,
  author_create_post,
  author_details_get,
  author_update_get,
  author_update_post,
  author_delete_post,
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
authorsRouter.get('/:id/update', author_update_get)
authorsRouter.post('/:id/update', author_update_post)

// Delete a author
authorsRouter.post('/:id/delete', author_delete_post)


module.exports = authorsRouter
