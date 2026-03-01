const {
  body,
  query,
  validationResult,
  matchedData,
} = require('express-validator')
const {
  getAllGenres,
  searchGenre,
  addGenre,
  getGenreDetails,
  updateGenre,
  deleteGenre,
  booksPerGenre
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
  query('query')
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
  const counts = {}

  for (const genre of genres) {
    const count = await booksPerGenre(genre.id)
    if (!count) {
      counts[genre.id] = 0
    } else {
      counts[genre.id] = count.count
    }
  }

  res.render('pages/genres/genres', { title: 'Genres', genres, counts })
}

// Show new genre form
async function genre_create_get(req, res) {
  res.render('pages/genres/genre-form', { title: 'Add Genre' })
}

// Validate and add new genre
const genre_create_post = [
  validateGenre,
  async (req, res) => {
    // Validate request
    const errors = validationResult(req)

    // Show errors if validation fails
    if (!errors.isEmpty()) {
      return res.status(400).render('pages/genres/genre-form', {
        title: 'Add Genre',
        genre: req.body,
        errors: errors.array(),
      })
    }

    try {
      const { type } = matchedData(req)
      // throw new Error()
      await addGenre(type)
      res.redirect('/genres')
    } catch (err) {
      console.error(err)
      // Default
      let statusCode = 500
      let errorMsg = 'A database error occurred. Please try again later.'
      // Update for UNIQUE constraint violation
      if (err.code === '23505') {
        statusCode = 409
        errorMsg = 'Genre name must be unique.'
      }
        
      return res.status(statusCode).render('pages/genres/genre-form', {
        title: 'Add Genre',
        genre: req.body,
        errors: [{ msg: errorMsg }],
      })
        
    }
    
  },
]

// Show genre details in a pre-populated form
async function genre_update_get(req, res) {
  const id = Number(req.params.id)
  const details = await getGenreDetails(id)

  res.render('pages/genres/genre-form', {
    title: 'Update Genre',
    genre: details[0],
    isUpdate: true,
  })
}

// Validate and update genre
const genre_update_post = [
  validateGenre,
  async (req, res) => {
    const id = Number(req.params.id)
    // const existingGenreData = await getGenreDetails(id)
    // Validate request
    const errors = validationResult(req)
    // console.log('errors:', errors)

    // Show errors if validation fails
    if (!errors.isEmpty()) {
      return res.status(400).render('pages/genres/genre-form', {
        title: 'Update Genre',
        // genre: existingGenreData[0],
        genre: req.body,
        errors: errors.array(),
        isUpdate: true,
      })
    }

    try {
      const { type } = matchedData(req)
      await updateGenre(id, type)
      res.redirect('/genres')
    } catch (err) {
      console.error(err)
      return res.status(500).render('pages/genres/genre-form', {
        title: 'Update Genre',
        genre: req.body,
        errors: [{ msg: 'Failed to update genre. Please try again.' }],
        isUpdate: true,
      })
    }
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
      return res.status(400).render('pages/genres/genres', {
        title: 'Search Results',
        errors: errors.array(),
      })
    }

    const { query } = matchedData(req)
    const filteredGenres = await searchGenre(query)
    const counts = {}

    for (const genre of filteredGenres) {
      const count = await booksPerGenre(genre.id)
      if (!count) {
        counts[genre.id] = 0
      } else {
        counts[genre.id] = count.count
      }
    }

    res.render('pages/genres/genres', {
      title: 'Search Results',
      search: query,
      filteredGenres,
      counts
    })
  },
]

// Delete genre
async function genre_delete_post(req, res) {
  const id = Number(req.params.id)

  try {
    await deleteGenre(id)
    res.redirect('/genres')
  } catch (err) {
    console.error(err)
    const genres = await getAllGenres()
    // Default error message
    let errorMsg = 'Failed to delete genre. Please try again.'
    // Update error message
    if (err.code === '23001') {
      errorMsg =
        'Cannot delete genre: This genre has books linked to it. Please delete or reassign the books before removing the genre.'
    }

    return res.status(500).render('pages/genres/genres', {
      title: 'Genres',
      genres,
      errors: [{ msg: errorMsg }],
    })
  }
  

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
