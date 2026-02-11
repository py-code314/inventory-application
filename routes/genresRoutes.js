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













module.exports = genresRouter
