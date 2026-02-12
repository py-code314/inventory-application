const {
  body,
  query,
  validationResult,
  matchedData,
} = require('express-validator')
const {
  getAllGenres,
  getGenre,
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
    .isAlpha('en-US', { ignore: ' &' })
    .withMessage(`Name ${alphaErr}`),
]

// Validate Genre search query
const validateSearch = [
  query('type')
    .trim()
    .notEmpty()
    .withMessage(`Name ${emptyErr}`)
    .bail()
    .isAlpha('en-US', { ignore: ' &' })
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

// Show genre details in a pre-populated form
async function genre_update_get(req, res) {
  const id = Number(req.params.id)
  const details = await getGenreDetails(id)

  res.send(details)
}

// Validate and update genre
const genre_update_post = [
  validateGenre,
  async (req, res) => {
    // Validate request
    const errors = validationResult(req)
    console.log('errors:', errors)

    // Show errors if validation fails
    if (!errors.isEmpty()) {
      res.send('Error message')
      return
    }

    const id = Number(req.params.id)
    const { type } = matchedData(req)
    await updateGenre(id, type)
    // TODO Redirect to genre details page
    res.send('Genre details updated successfully')
  },
]

// Search for genre by name
const genre_search_get = [
  validateSearch,

  async (req, res) => {
    // Validate request
    const errors = validationResult(req)

    // Show errors if validation fails
    if (!errors.isEmpty()) {
      res.send('Error message')
      return
    }

    const { type } = matchedData(req)
    const filteredGenres = await getGenre(type)

    if (filteredGenres.length > 0) {
      res.send(filteredGenres)
    } else {
      res.send('Genre not found')
    }
  },
]

// Delete genre
async function genre_delete_post(req, res) {
  const id = Number(req.params.id)
  await deleteGenre(id)
  res.send('Genre deleted successfully')
}

module.exports = {
  genres_list_get,
  genre_search_get,
  genre_create_get,
  genre_create_post,
  // genre_details_get,
  genre_update_get,
  genre_update_post,
  genre_delete_post,
}
