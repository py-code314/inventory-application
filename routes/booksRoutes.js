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



// Show book
booksRouter.get('/:id', book_details_get)




module.exports = booksRouter
