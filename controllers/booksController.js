const {
  body,
  query,
  validationResult,
  matchedData,
} = require('express-validator')
const {
  getAllBooks,
  searchBooks,
  addBook,
  getBookDetails,
  updateBook,
  deleteBook,
  checkDuplicate,
  deleteBookCopy,
  checkBookAuthorCombo,
} = require('../db/queries/books')
const { findOrCreateAuthor } = require('../db/queries/authors')
const { findOrCreateGenre } = require('../db/queries/genres')
const { findOrCreatePublisher } = require('../db/queries/publishers')
const { copy } = require('../routes/booksRoutes')

// Error messages
const alphaErr = 'must only contain letters.'
const emptyErr = 'must not be empty.'
const isbnErr = 'must be valid 10 or 13 digit number.'
const totalPagesErr = 'must be a number greater than 0. Leading zeroes are not allowed.'
const priceErr = 'must be a number between 0.01 and 99999999.99.'
// const decimalErr = 'must have two decimal places.'
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
  body('plot_summary').trim().optional({ values: 'falsy' }),
  body('authors')
    .trim()
    .notEmpty()
    .withMessage(`Author ${emptyErr}`)
    .isAlpha('en-US', { ignore: ' -,' })
    .withMessage(`Author ${alphaErr}`),
  body('genre')
    .trim()
    .notEmpty()
    .withMessage(`Genre ${emptyErr}`)
    .bail()
    .isAlpha('en-US', { ignore: ' &-' })
    .withMessage(`Author ${alphaErr}`),
  body('publisher').trim().notEmpty().withMessage(`Publisher ${emptyErr}`),
  body('isbn')
    .trim()
    .notEmpty()
    .withMessage(`ISBN number ${emptyErr}`)
    .bail()
    .customSanitizer((value) => value.replace(/[ -]/g, ''))
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
  body('total_pages')
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
    .toFloat(),
  body('stock')
    .trim()
    .notEmpty()
    .withMessage(`Total number of books ${emptyErr}`)
    .isInt({ allow_leading_zeroes: false, min: 0 })
    .withMessage(`Stock ${intErr}`)
    .toInt(),
  body('publish_date')
    .trim()
    .optional({ values: 'falsy' })
    .isDate()
    .withMessage(`Publish date ${dateErr}`),
  body('edition').trim().optional({ values: 'falsy' }),
]

// Get all books
async function books_list_get(req, res) {
  const books = await getAllBooks()
  res.render('pages/books/books', { title: 'Books', books })
}

// Search for book by name
const book_search_get = [
  validateSearch,

  async (req, res) => {
    // Validate request
    const errors = validationResult(req)

    // Show errors if validation fails
    if (!errors.isEmpty()) {
      return res.status(400).render('pages/books/books', {
        title: 'Search Results',
        errors: errors.array(),
      })
    }

    const { query } = matchedData(req)
    const filteredBooks = await searchBooks(query)

    res.render('pages/books/books', {
      title: 'Search Results',
      search: query,
      filteredBooks
    })
  },
]

// Show new book form
async function book_create_get(req, res) {
  res.render('pages/books/book-form', { title: 'Add Book' })
}

// Validate and add new book
const book_create_post = [
  validateBook,
  async (req, res) => {
    // Validate request
    const errors = validationResult(req)

    // Show errors if validation fails
    if (!errors.isEmpty()) {
      return res.status(400).render('pages/books/book-form', {
        title: 'Add Book',
        book: req.body,
        errors: errors.array(),
      })
    }

    try {
      const  bookData  = matchedData(req)
      // console.log('authors:', bookData.authors)

      const authorArr = bookData.authors.split(/,\s*/)
      const authorIdArr = await findOrCreateAuthor(authorArr)

      // Duplicate book check
      const duplicate = await checkDuplicate(
        bookData.title,
        authorIdArr,
        bookData.format,
        bookData.edition,
      )

      if (duplicate) {
        return res.status(409).render('pages/books/book-form', {
          title: 'Add Book',
          book: req.body,
          errors: [{ msg: 'This book combination already exists in the database.' }],
        })
      }

      const genreId = await findOrCreateGenre(bookData.genre)
      const publisherId = await findOrCreatePublisher(bookData.publisher)

      // Check if book title and author combo already exists in db
      const bookId = await checkBookAuthorCombo(bookData.title, authorIdArr)


      await addBook(
        bookData.title,
        bookData.plot_summary,
        authorIdArr,
        genreId,
        bookData.total_pages,
        bookData.price,
        bookData.stock,
        bookData.format,
        bookData.publish_date,
        publisherId,
        bookData.edition,
        bookData.isbn,
        bookId,
      )

      res.redirect('/books')
    } catch (err) {
      console.error(err)
      // Check for UNIQUE constraint violation
      if (err.code === '23505') {
        return res.status(409).render('pages/books/book-form', {
          title: 'Add Book',
          book: req.body,
          errors: [{ msg: 'ISBN number must be unique.' }],
        })
      } else {
        return res.status(500).render('pages/books/book-form', {
          title: 'Add Book',
          book: req.body,
          errors: [
            { msg: 'A database error occurred. Please try again later.' },
          ],
        })
      }
    }
  },
]

// Show book details
async function book_details_get(req, res) {
  const bookId = Number(req.params.id)
  const copyId = Number(req.params.copyId)
  const [rows] = await getBookDetails(bookId, copyId)
  // console.log('book details:', rows)

  res.render('pages/books/book-details', { title: 'Book Details', book: rows })
}

// * Add status codes for errors
// * Check other functions to add try...catch
// Delete book copy
async function book_copy_delete_post(req, res) {
  const bookId = Number(req.params.id)
  const copyId = Number(req.params.copyId)

  try {
    await deleteBookCopy(bookId, copyId)
    res.redirect('/books')
  } catch (err) {
    console.error(err)
    // Fetch book details again
    const [rows] = await getBookDetails(bookId, copyId)
    res.status(500).render('pages/books/book-details', {
      title: 'Book Details',
      book: rows,
      errors: [{msg: 'Failed to delete the book. Please try again.'}]
    })
  }
}

// Show book details form with filled in book data
async function book_update_get(req, res) {
  const bookId = Number(req.params.id)
  const copyId = Number(req.params.copyId)
  const [rows] = await getBookDetails(bookId, copyId)
  // console.log('update book form:', rows)

  res.render('pages/books/book-form', {
    title: 'Update Book',
    book: rows,
    isUpdate: true,
  })
}

// Validate and update book
const book_update_post = [
  validateBook,
  async (req, res) => {
    const bookId = Number(req.params.id)
    const copyId = Number(req.params.copyId)
    const existingBookData = await getBookDetails(bookId, copyId)
    // console.log('existing book data:', existingBookData)

    // Validate request
    const errors = validationResult(req)

    // Show errors if validation fails
    if (!errors.isEmpty()) {
      return res.status(400).render('pages/books/book-form', {
        title: 'Update Book',
        book: existingBookData[0],
        errors: errors.array(),
        isUpdate: true,
      })
    }

    try {
      // const bookId = Number(req.params.id)
      // const copyId = Number(req.params.copyId)
      const bookData = matchedData(req)
      // console.log('book data:', bookData)
      // const existingBookData = await getBookDetails(bookId, copyId)
      // console.log('existing book data:', existingBookData)

      if (bookData.title !== existingBookData[0].title ||
        bookData.authors !== existingBookData[0].authors
      ) {
        return res.status(500).render('pages/books/book-form', {
          title: 'Update Book',
          book: existingBookData[0],
          errors: [{ msg: 'You can not change title or authors.' }],
          isUpdate: true,
        })
      }

      const genreId = await findOrCreateGenre(bookData.genre)
      const publisherId = await findOrCreatePublisher(bookData.publisher)

      await updateBook(
        bookId,
        copyId,
        bookData.plot_summary,
        genreId,
        bookData.total_pages,
        bookData.price,
        bookData.stock,
        bookData.format,
        bookData.publish_date,
        publisherId,
        bookData.edition,
        bookData.isbn,
      )

      res.redirect(`/books/${bookId}/copy/${copyId}`)
    } catch (err) {
      console.error(err)
      // Check for UNIQUE constraint violation
      if (err.code === '23505') {
        return res.status(409).render('pages/books/book-form', {
          title: 'Update Book',
          book: req.body,
          errors: [{ msg: 'ISBN number must be unique.' }],
          isUpdate: true
        })
      } else {
        return res.status(500).render('pages/books/book-form', {
          title: 'Update Book',
          book: req.body,
          errors: [{ msg: 'Failed to update the book. Please try again.' }],
          isUpdate: true
        })
      }
    }
  },
]



// Delete book
async function book_delete_post(req, res) {
  const id = Number(req.params.id)
  
  try {
    await deleteBook(id)
    res.redirect('/books')
  } catch (err) {
    console.error(err)
    // Fetch book list
    const books = await getAllBooks()
    res.status(500).render('pages/books/books', {
      title: 'Books',
      books,
      errors: [{ msg: 'Failed to delete the book. Please try again.' }],
    })
  }
}






module.exports = {
  books_list_get,
  book_search_get,
  book_create_get,
  book_create_post,
  book_details_get,
  book_update_get,
  book_update_post,
  book_delete_post,
  book_copy_delete_post,
  
}
