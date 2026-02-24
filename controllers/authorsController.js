// const db = require('../db/queries/authors')
const {
  body,
  query,
  validationResult,
  matchedData,
} = require('express-validator')
const {
  getAllAuthors,
  searchAuthors,
  addAuthor,
  getAuthorDetails,
  updateAuthor,
  deleteAuthor,
} = require('../db/queries/authors')

// Error messages
const alphaErr = 'must only contain letters.'
const emptyErr = 'must not be empty.'
const dateErr = 'must be in a valid format.'

// Validate author search query
const validateSearch = [
  query('query')
    .trim()
    .notEmpty()
    .withMessage(`Name ${emptyErr}`)
    .bail()
    .isAlpha('en-US', { ignore: ' -' })
    .withMessage(`Name ${alphaErr}`),
]

// Validate author data
const validateAuthor = [
  body('full_name')
    .trim()
    .notEmpty()
    .withMessage(`Name ${emptyErr}`)
    .bail()
    .isAlpha('en-US', { ignore: ' -' })
    .withMessage(`Name ${alphaErr}`),
  body('birth_date')
    .trim()
    .optional({ values: 'falsy' })
    .isDate()
    .withMessage(`Date ${dateErr}`),
]

// Get all authors
async function authors_list_get(req, res) {
  const authors = await getAllAuthors()
  // console.log('Authors: ', authors)
  res.render('pages/authors/authors.ejs', { title: 'Authors', authors })
  // res.send('List all authors')
}

// Search for author by name
const author_search_get = [
  validateSearch,

  async (req, res) => {
    // Validate request
    const errors = validationResult(req)

    // Show errors if validation fails
    if (!errors.isEmpty()) {
      return res.status(400).render('pages/authors/authors', {
        title: 'Search Results',
        errors: errors.array(),
      })
    }

    const { query } = matchedData(req)

    const filteredAuthors = await searchAuthors(query)

    res.render('pages/authors/authors', {
      title: 'Search Results',
      search: query,
      filteredAuthors,
    })
  },
]

// Show new author form
async function author_create_get(req, res) {
  res.render('pages/authors/author-form', { title: 'Add Author' })
}

// Validate and add new author
const author_create_post = [
  validateAuthor,
  async (req, res) => {
    // Validate request
    const errors = validationResult(req)
    // console.log('errors:', errors)

    // Show errors if validation fails
    if (!errors.isEmpty()) {
      return res.status(400).render('pages/authors/author-form', {
        title: 'Add Author',
        author: req.body,
        errors: errors.array(),
      })
    }

    try {
      const { full_name, birth_date } = matchedData(req)
      // console.log('message in controller:', message)
      await addAuthor(full_name, birth_date)
      // throw new Error('test error')
      res.redirect('/authors')
    } catch (err) {
      console.error(err)
      // Check for UNIQUE constraint violation
      if (err.code === '23505') {
        return res.status(409).render('pages/authors/author-form', {
          title: 'Add Author',
          author: req.body,
          errors: [{ msg: 'Author name must be unique.' }],
        })
      } else {
        return res.status(500).render('pages/authors/author-form', {
          title: 'Add Author',
          author: req.body,
          errors: [
            { msg: 'A database error occurred. Please try again later.' },
          ],
        })
      }
    }
  },
]

// Show author details
// async function author_details_get(req, res) {
//   const id = Number(req.params.id)
//   const details = await getAuthorDetails(id)

//   res.send(details)
// }

// Show author details in a pre-populated form
async function author_update_get(req, res) {
  const id = Number(req.params.id)
  const details = await getAuthorDetails(id)
  console.log('book details:', details)

  res.render('pages/authors/author-form', {
    title: 'Update Author',
    author: details[0],
    isUpdate: true,
  })
}

// Validate and update author
const author_update_post = [
  validateAuthor,
  async (req, res) => {
    const authorId = Number(req.params.id)
    const existingAuthorData = await getAuthorDetails(authorId)
    // Validate request
    const errors = validationResult(req)
    // console.log('errors:', errors)

    // Show errors if validation fails
    if (!errors.isEmpty()) {
      return res.status(400).render('pages/authors/author-form', {
        title: 'Update Author',
        author: existingAuthorData[0],
        errors: errors.array(),
        isUpdate: true,
      })
    }

    try {
      const { full_name, birth_date } = matchedData(req)
      await updateAuthor(authorId, full_name, birth_date)
      res.redirect('/authors')
    } catch (err) {
      console.error(err)
      return res.status(500).render('pages/authors/author-form', {
        title: 'Update Author',
        author: req.body,
        errors: [{ msg: 'Failed to update author. Please try again.' }],
        isUpdate: true,
      })
    }
  },
]

// TODO ues try catch 
// Delete author
async function author_delete_post(req, res) {
  const id = Number(req.params.id)
  await deleteAuthor(id)
  res.send('Author deleted successfully')
}

module.exports = {
  authors_list_get,
  author_search_get,
  author_create_get,
  author_create_post,
  // author_details_get,
  author_update_get,
  author_update_post,
  author_delete_post,
}
