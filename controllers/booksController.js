
const {
  body,
  query,
  validationResult,
  matchedData,
} = require('express-validator')
const {
  getAllBooks,
  getBooks,
  addBook,
  getBookDetails,
  updateBook,
  deleteBook,
} = require('../db/queries/books')

// Error messages
const alphaErr = 'must only contain letters.'
const emptyErr = 'must not be empty.'
const dateErr = 'must be in a valid format.'



// Get all books
async function books_list_get(req, res) {
  const books = await getAllBooks()
  res.send(books)
}

// Show book details
async function book_details_get(req, res) {
  const id = Number(req.params.id)
  const details = await getBookDetails(id)

  res.send(details)
}

module.exports = {
  books_list_get,
  // book_search_get,
  // book_create_get,
  // book_create_post,
  book_details_get,
  // book_update_get,
  // book_update_post,
  // book_delete_post,
}
