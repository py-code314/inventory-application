const express = require('express')
const booksRouter = express.Router()
const {
  books_list_get,
  book_search_get,
  book_create_get,
  book_create_post,
  book_details_get,
  book_update_get,
  book_update_post,
  book_delete_post,
  book_copy_delete_post,
} = require('../controllers/booksController')


// Show all books
booksRouter.get('/', books_list_get)

// Search for a book
booksRouter.get('/search', book_search_get)

// Add a new book
booksRouter.get('/new', book_create_get)
booksRouter.post('/new', book_create_post)

// Show book copy details
booksRouter.get('/:id/copy/:copyId', book_details_get)
// Delete book copy
booksRouter.post('/:id/copy/:copyId/delete', book_copy_delete_post)

// Update a book
booksRouter.get('/:id/copy/:copyId/update', book_update_get)
booksRouter.post('/:id/copy/:copyId/update', book_update_post)
// Delete entire book entry
booksRouter.post('/:id/delete', book_delete_post)




module.exports = booksRouter
