// const db = require('../db/queries/authors')
const {
  body,
  query,
  validationResult,
  matchedData,
} = require('express-validator')
const {
  getAllAuthors,
  getAuthors,
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
  query('name')
    .trim()
    .notEmpty()
    .withMessage(`Name ${emptyErr}`)
    .bail()
    .isAlpha('en-US', { ignore: ' -' })
    .withMessage(`Name ${alphaErr}`),
]

// Validate author data
const validateAuthor = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage(`Name ${emptyErr}`)
    .bail()
    .isAlpha('en-US', { ignore: ' -' })
    .withMessage(`Name ${alphaErr}`),
  body('date')
    .trim()
    .notEmpty()
    .withMessage(`Name ${emptyErr}`)
    .bail()
    .isDate()
    .withMessage(`Date ${dateErr}`),
]

// Get all authors
async function authors_list_get(req, res) {
  const authors = await getAllAuthors()
  console.log('Authors: ', authors)
  // res.render('pages/index', { title: 'Home', authors })
  res.send('List all authors')
}

// Search for author by name
const author_search_get = [
  validateSearch,

  async (req, res) => {
    // Validate request
    const errors = validationResult(req)

    // Show errors if validation fails
    if (!errors.isEmpty()) {
      res.send('Error message')
      return
    }

    const { name } = matchedData(req)
    const filteredAuthors = await getAuthors(name)

    if (filteredAuthors.length > 0) {
      res.send('Author search success')
    } else {
      res.send('Author not found')
    }
  },
]

// Show new author form
async function author_create_get(req, res) {
  res.send('Show new author form')
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
      res.send('Error message')
      return
    }

    const { name, date } = matchedData(req)
    // console.log('message in controller:', message)
    await addAuthor(name, date)
    res.send('Author added successfully')
  },
]

// Show author details
async function author_details_get(req, res) {
  const id = Number(req.params.id)
  const details = await getAuthorDetails(id)

  res.send(details)
}

// Show author details in a pre-populated form
async function author_update_get(req, res) {
  const id = Number(req.params.id)
  const details = await getAuthorDetails(id)

  res.send(details)
}

// Validate and update author
const author_update_post = [
  validateAuthor,
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
    const { name, date } = matchedData(req)
    await updateAuthor(id, name, date)
    // TODO Redirect to author details page
    res.send('Author details updated successfully')
  },
]

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
  author_details_get,
  author_update_get,
  author_update_post,
  author_delete_post,
}
