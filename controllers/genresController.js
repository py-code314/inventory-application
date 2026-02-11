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


// Get all genres
async function genres_list_get(req, res) {
  const genres = await getAllGenres()
  res.send('List all genres')
}

module.exports = {
  genres_list_get,
  // genre_search_get,
  // genre_create_get,
  // genre_create_post,
  // genre_details_get,
  // genre_update_get,
  // genre_update_post,
  // genre_delete_post,
}