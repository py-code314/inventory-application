const pool = require('../pool')

// Get all genres from db
async function getAllGenres() {
  const { rows } = await pool.query('SELECT * FROM genre')
  return rows
}

module.exports = {
  getAllGenres,
  // getGenres,
  // addGenre,
  // getGenreDetails,
  // updateGenre,
  // deleteGenre,
}