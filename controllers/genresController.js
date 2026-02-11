const {
  body,
  query,
  validationResult,
  matchedData,
} = require('express-validator')
const {
  getAllGenres,
  getGenres,
  addGenre,
  getGenreDetails,
  updateGenre,
  deleteGenre,
} = require('../db/queries/genres')

// Error messages
const alphaErr = 'must only contain letters.'
const emptyErr = 'must not be empty.'

// Validate genre data
const validateGenre = [
  body('type')
    .trim()
    .notEmpty()
    .withMessage(`Name ${emptyErr}`)
    .bail()
    .isAlpha()
    .withMessage(`Name ${alphaErr}`),
  
]

// Get all genres
async function genres_list_get(req, res) {
  const genres = await getAllGenres()
  res.send('List all genres')
}

// Show new genre form
async function genre_create_get(req, res) {
  res.send('Show new genre form')
}

// Validate and add new genre
const genre_create_post = [
  validateGenre,
  async (req, res) => {
    // Validate request
    const errors = validationResult(req)

    // Show errors if validation fails
    if (!errors.isEmpty()) {
      res.send('Error message')
      return
    }

    const { type } = matchedData(req)
    await addGenre(type)
    res.send('Genre added successfully')
  },
]

module.exports = {
  genres_list_get,
  // genre_search_get,
  genre_create_get,
  genre_create_post,
  // genre_details_get,
  // genre_update_get,
  // genre_update_post,
  // genre_delete_post,
}