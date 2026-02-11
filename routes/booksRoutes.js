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
} = require('../controllers/booksController')


// Show all books
booksRouter.get('/', books_list_get)

// Search for a book
booksRouter.get('/search', book_search_get)

// Add a new book
booksRouter.get('/new', book_create_get)
booksRouter.post('/new', book_create_post)

// Show book
booksRouter.get('/:id', book_details_get)

// Update a book
booksRouter.get('/:id/update', book_update_get)
booksRouter.post('/:id/update', book_update_post)

// Delete book
booksRouter.post('/:id/delete', book_delete_post)


module.exports = booksRouter
