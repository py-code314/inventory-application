
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
// const alphaErr = 'must only contain letters.'
const emptyErr = 'must not be empty.'
// const dateErr = 'must be in a valid format.'

// Validate book search query
const validateSearch = [
  query('title').trim().notEmpty().withMessage(`Title ${emptyErr}`),
]

// Validate book data
const validateBook = [
  body('title').trim().notEmpty().withMessage(`Title ${emptyErr}`),
  body('summary').trim().optional({ values: 'falsy' }),
  body('genreId')
    .trim()
    .notEmpty()
    .withMessage(`Genre ${emptyErr}`)
    .isInt({min: 1})
    .withMessage(`Genre must be in Genres list.`),
]

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

// Search for book by name
const book_search_get = [
  validateSearch,

  async (req, res) => {
    // Validate request
    const errors = validationResult(req)
    console.log('errors:', errors)

    // Show errors if validation fails
    if (!errors.isEmpty()) {
      res.send('Error message')
      return
    }

    const { title } = matchedData(req)
    const filteredBooks = await getBooks(title)

    if (filteredBooks.length > 0) {
      res.send(filteredBooks)
    } else {
      res.send('Book not found')
    }
  },
]

// Delete book
async function book_delete_post(req, res) {
  const id = Number(req.params.id)
  await deleteBook(id)
  res.send('Book deleted successfully')
}

// Show new book form
async function book_create_get(req, res) {
  res.send('Show new book form')
}

// Validate and add new book
const book_create_post = [
  validateBook,
  async (req, res) => {
    // Validate request
    const errors = validationResult(req)
    // console.log('errors:', errors)

    // Show errors if validation fails
    if (!errors.isEmpty()) {
      res.send('Error message')
      return
    }

    const { title, summary, genreId } = matchedData(req)
    // console.log('message in controller:', message)
    await addBook(title, summary, genreId)
    res.send('Book added successfully')
  },
]

// Show book details in a pre-populated form
async function book_update_get(req, res) {
  const id = Number(req.params.id)
  const details = await getBookDetails(id)

  res.send(details)
}

// Validate and update book
const book_update_post = [
  validateBook,
  async (req, res) => {
    // Validate request
    const errors = validationResult(req)
    // console.log('errors:', errors)

    // Show errors if validation fails
    if (!errors.isEmpty()) {
      res.send('Error message')
      return
    }

    const id = Number(req.params.id)
    const { title, summary, genreId } = matchedData(req)
    await updateBook(id, title, summary, genreId)
    // TODO Redirect to book details page
    res.send('Book details updated successfully')
  },
]

module.exports = {
  books_list_get,
  book_search_get,
  book_create_get,
  book_create_post,
  book_details_get,
  book_update_get,
  book_update_post,
  book_delete_post,
}
