/* Imports */
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
} = require('../db/queries/genres')
const { booksPerGenre } = require('../db/queries/books')

/* Error messages */
const alphaErr = 'must only contain letters.'
const emptyErr = 'must not be empty.'

/* Validate genre data */
const validateGenre = [
  body('type')
    .trim()
    .notEmpty()
    .withMessage(`Name ${emptyErr}`)
    .bail()
    .isAlpha('en-US', { ignore: ' &' })
    .withMessage(`Name ${alphaErr}`),
]

/* Validate Genre search query */
const validateSearch = [
  query('query')
    .trim()
    .notEmpty()
    .withMessage(`Name ${emptyErr}`)
    .bail()
    .isAlpha('en-US', { ignore: ' &' })
    .withMessage(`Name ${alphaErr}`),
]

/* Show all genres */
async function genres_list_get(req, res) {
  // Get genres
  const genres = await getAllGenres()
  const counts = {}

  // Get book count for each genre
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

/* Show  genre form */
async function genre_create_get(req, res) {
  res.render('pages/genres/genre-form', { title: 'Add Genre' })
}

/* Validate and add new genre */
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
      // Add genre to db
      await addGenre(type)
      res.redirect('/genres')
    } catch (err) {
      console.error(err)
      // Default error details
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

/* Show genre details in a pre-populated form */
async function genre_update_get(req, res) {
  const genreId = Number(req.params.id)
  // Get genre data
  const details = await getGenreDetails(genreId)

  res.render('pages/genres/genre-form', {
    title: 'Update Genre',
    genre: details[0],
    genreId,
    isUpdate: true,
  })
}

/* Validate and update genre */
const genre_update_post = [
  validateGenre,

  async (req, res) => {
    const genreId = Number(req.params.id)
    const { password } = req.body

    // Don't update if admin password doesn't match
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(403).render('pages/genres/genre-form', {
        title: 'Update Genre',
        genre: req.body,
        genreId,
        errors: [{ msg: 'Incorrect Admin Password' }],
        isUpdate: true,
      })
    }

    // Validate request
    const errors = validationResult(req)

    // Show errors if validation fails
    if (!errors.isEmpty()) {
      return res.status(400).render('pages/genres/genre-form', {
        title: 'Update Genre',
        genre: req.body,
        genreId,
        errors: errors.array(),
        isUpdate: true,
      })
    }

    try {
      const { type } = matchedData(req)
      // Update genre data
      await updateGenre(genreId, type)
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
        title: 'Update Genre',
        genre: req.body,
        genreId,
        errors: [{ msg: errorMsg }],
        isUpdate: true
      })
    }
  },
]

/* Search for genre by name */
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
    // Filter genres
    const filteredGenres = await searchGenre(query)
    const counts = {}

    // Get book count for each genre
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
      counts,
    })
  },
]

/* Delete genre */
async function genre_delete_post(req, res) {
  const id = Number(req.params.id)
  console.log('id:', id)
  const { password } = req.body
  const genres = await getAllGenres()
  const counts = {}

  // Get book count for each genre
  for (const genre of genres) {
    const count = await booksPerGenre(genre.id)
    if (!count) {
      counts[genre.id] = 0
    } else {
      counts[genre.id] = count.count
    }
  }

  // Don't delete if admin password doesn't match
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(403).render('pages/genres/genres', {
      title: 'Genres',
      genres,
      counts,
      errors: [{ msg: 'Incorrect Admin Password' }],
    })
  }

  try {
    // Delete genre
    await deleteGenre(id)
    res.redirect('/genres')
  } catch (err) {
    console.error(err)
    
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
      counts
    })
  }
}

module.exports = {
  genres_list_get,
  genre_search_get,
  genre_create_get,
  genre_create_post,
  genre_update_get,
  genre_update_post,
  genre_delete_post,
}
