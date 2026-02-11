const pool = require('../pool')

// Get all genres from db
async function getAllGenres() {
  const { rows } = await pool.query('SELECT * FROM genre')
  return rows
}

// Add genre to db
async function addGenre(type) {
  await pool.query('INSERT INTO genre (name) VALUES ($1)', [type])
}

module.exports = {
  getAllGenres,
  // getGenres,
  addGenre,
  // getGenreDetails,
  // updateGenre,
  // deleteGenre,
}