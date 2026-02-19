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
  checkDuplicate
} = require('../db/queries/books')
const { getAllAuthors, findOrCreateAuthor } = require('../db/queries/authors')
const { findOrCreateGenre } = require('../db/queries/genres')
const {findOrCreatePublisher} = require('../db/queries/publishers')

// Error messages
const alphaErr = 'must only contain letters.'
const emptyErr = 'must not be empty.'
const isbnErr = 'must be valid 10 or 13 digit number.'
const totalPagesErr =
  'must be a number greater than 0. Leading zeroes are not allowed.'
const priceErr = 'must be a number between 0.01 and 99999999.99.'
const decimalErr = 'must have two decimal places.'
const lengthErr = 'must be below 50 characters in length.'
const dateErr = 'must be in a valid format.'
const intErr = 'must be a number.'
// const genreErr = 'must be in Genres list.'
// const authorErr = 'must be in Authors list.'
// const publisherErr = 'must be in Publishers list.'

// Validate book search query
const validateSearch = [
  query('query').trim().notEmpty().withMessage(`Query ${emptyErr}`),
]

// Validate book data
const validateBook = [
  body('title').trim().notEmpty().withMessage(`Title ${emptyErr}`),
  body('summary').trim().optional({ values: 'falsy' }),
  // body('authorId')
  //   .trim()
  //   .notEmpty()
  //   .withMessage(`Author ${emptyErr}`)
  //   .bail()
  //   .isInt({ min: 1 })
  //   .withMessage(`Author ${authorErr}`)
  //   .toInt(),
  body('authorName')
    .trim()
    .notEmpty()
    .withMessage(`Author ${emptyErr}`)
    .isAlpha('en-US', { ignore: ' -' })
    .withMessage(`Author ${alphaErr}`),
  body('genreName')
    .trim()
    .notEmpty()
    .withMessage(`Genre ${emptyErr}`)
    .bail()
    .isAlpha('en-US', { ignore: ' &-' })
    .withMessage(`Author ${alphaErr}`),
    // .isInt({ min: 1 })
    // .withMessage(`Genre ${genreErr}`)
    // .toInt(),
  body('publisherName')
    .trim()
    .notEmpty()
    .withMessage(`Publisher ${emptyErr}`),
    // .bail()
    // .isInt({ min: 1 })
    // .withMessage(`Publisher ${publisherErr}`)
    // .toInt(),
  body('isbn')
    .trim()
    .notEmpty()
    .withMessage(`ISBN number ${emptyErr}`)
    .bail()
    .customSanitizer(value => value.replace(/[ -]/g, ''))
    .isISBN()
    .withMessage(`ISBN number ${isbnErr}`),
  body('format')
    .trim()
    .notEmpty()
    .withMessage(`Format ${emptyErr}`)
    .bail()
    .isAlpha('en-US', { ignore: ' -' })
    .withMessage(`Format ${alphaErr}`)
    .isLength({ max: 50 })
    .withMessage(`Format ${lengthErr}`),
  body('totalPages')
    .trim()
    .notEmpty()
    .withMessage(`Total pages ${emptyErr}`)
    .bail()
    .isInt({ allow_leading_zeroes: false, gt: 0 })
    .withMessage(`Total pages ${totalPagesErr}`)
    .toInt(),
  body('price')
    .trim()
    .notEmpty()
    .withMessage(`Price ${emptyErr}`)
    .bail()
    .isFloat({ min: 0.01, max: 99999999.99 })
    .withMessage(`Price ${priceErr}`)
    .bail()
    .isDecimal({ decimal_digits: 2 })
    .withMessage(`Price ${decimalErr}`)
    .toFloat(),
  body('stock')
    .trim()
    .notEmpty()
    .withMessage(`Total number of books ${emptyErr}`)
    .isInt({ allow_leading_zeroes: false, min: 0 })
    .withMessage(`Stock ${intErr}`)
    .toInt(),
  body('publishDate')
    .trim()
    .notEmpty()
    .withMessage(`Publish date ${emptyErr}`)
    .isDate()
    .withMessage(`Publish date ${dateErr}`),
  body('edition').trim().optional({ values: 'falsy' }),
]

// Get all books
async function books_list_get(req, res) {
  const books = await getAllBooks()
  res.render('pages/books', { title: 'Books', books })
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

    // Show errors if validation fails
    if (!errors.isEmpty()) {
      return res.status(400).render('pages/books', {
        title: 'Search Results',
        errors: errors.array(),
      })
    }

    const { query } = matchedData(req)
    const filteredBooks = await getBooks(query)
    // console.log('filteredBooks:', filteredBooks)

    res.render('pages/books', { title: 'Search Results', filteredBooks })
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
  const authors = await getAllAuthors()
  res.render('pages/book-form', { title: 'Add Book', authors })
}

// Validate and add new book
const book_create_post = [
  validateBook,
  async (req, res) => {
    // Validate request
    const errors = validationResult(req)
    // console.log('add book errors:', errors)

    // Show errors if validation fails
    if (!errors.isEmpty()) {
      res.send('Error message')
      return
    }

    try {
      const {
      title,
      summary,
      authorName,
      genreName,
      isbn,
      format,
      totalPages,
      price,
      stock,
      publishDate,
      edition,
      publisherName,
      } = matchedData(req)

      const authorId = await findOrCreateAuthor(authorName)

      // Duplicate check
      const duplicate = await checkDuplicate(title, authorId)
      // console.log('duplicate:', duplicate)


      if (duplicate.length > 0) {
        return res.render('pages/book-form', {
          title: 'Add Book',
          book: req.body,
          errorMsg: 'Book and Author combination already exists.',
        })
      }

      const genreId = await findOrCreateGenre(genreName)
      const publisherId = await findOrCreatePublisher(publisherName)
      // console.log('ids:', authorId, genreId, publisherId)
      
      await addBook(
      title,
      summary,
      authorId,
      genreId,
      isbn,
      format,
      totalPages,
      price,
      stock,
      publishDate,
      edition,
      publisherId,
      )
      
      res.redirect('/books')
    } catch (err) {
      // Check for UNIQUE constraint violation
      if (err.code === '23505') {
        // console.log('add book form:', req.body)
        return res.render('pages/book-form', {
          title: 'Add Book',
          book: req.body,
          errorMsg: 'ISBN number must be unique.'
        })
      }
    }
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

    // Show errors if validation fails
    if (!errors.isEmpty()) {
      res.send('Error message')
      return
    }

    const id = Number(req.params.id)
    const {
      title,
      summary,
      authorId,
      genreId,
      isbn,
      format,
      totalPages,
      price,
      stock,
      publishDate,
      edition,
      publisherId,
    } = matchedData(req)
    await updateBook(
      id,
      title,
      summary,
      authorId,
      genreId,
      isbn,
      format,
      totalPages,
      price,
      stock,
      publishDate,
      edition,
      publisherId,
    )
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
