const express = require('express')
const genresRouter = express.Router()
const {
  genres_list_get,
  genre_search_get,
  genre_create_get,
  genre_create_post,
  genre_details_get,
  genre_update_get,
  genre_update_post,
  genre_delete_post,
} = require('../controllers/genresController')

// Show genres
genresRouter.get('/', genres_list_get)

// Search for a genre
genresRouter.get('/search', genre_search_get)

// Add a new genre
genresRouter.get('/new', genre_create_get)
genresRouter.post('/new', genre_create_post)

// Update a genre
genresRouter.get('/:id/update', genre_update_get)
genresRouter.post('/:id/update', genre_update_post)

// Delete a genre
genresRouter.post('/:id/delete', genre_delete_post)













module.exports = genresRouter
