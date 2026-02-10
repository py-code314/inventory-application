const db = require('../db/queries')
const {
  body,
  query,
  validationResult,
  matchedData,
} = require('express-validator')
const { getAllAuthors, getAuthors } = require('../db/queries')

// Error messages
const alphaErr = 'must only contain letters.'
const emptyErr = 'must not be empty.'

// Validate author search query
const validateSearch = [
  query('authorName')
    .trim()
    .notEmpty()
    .withMessage(`Name ${emptyErr}`)
    .bail()
    .isAlpha()
    .withMessage(`Name ${alphaErr}`),
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

    const { authorName } = matchedData(req)
    const filteredAuthors = await getAuthors(authorName)


    if (filteredAuthors.length > 0) {
      res.send('Author search success')
    } else {
      res.send('Author not found')
    }
  },
]

module.exports = {
  authors_list_get,
  author_search_get,
}
