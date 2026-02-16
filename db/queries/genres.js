const pool = require('../pool')

// Get all genres from db
async function getAllGenres() {
  const { rows } = await pool.query('SELECT * FROM genre')
  return rows
}

// Get genres count
async function getGenresTotal() {
  const { rows } = await pool.query('SELECT COUNT(*) FROM genre')
  console.log('genresTotal:', rows[0])
  return rows[0]
}

// Add genre to db
async function addGenre(type) {
  await pool.query('INSERT INTO genre (name) VALUES ($1)', [type])
}

// Get genre details
async function getGenreDetails(id) {
  const { rows } = await pool.query('SELECT * FROM genre WHERE id =  $1', [id])
  return rows
}

// Update genre details
async function updateGenre(id, type) {
  await pool.query(
    'UPDATE genre SET name = $1 WHERE id = $2',
    [type, id],
  )
}

// Get genre by name
async function getGenre(type) {
  const { rows } = await pool.query(
    "SELECT * FROM genre WHERE name ILIKE '%' || $1 || '%'",
    [type],
  )
  return rows
}

// Delete genre
async function deleteGenre(id) {
  await pool.query('DELETE FROM genre WHERE id = $1', [id])
}

module.exports = {
  getAllGenres,
  getGenre,
  addGenre,
  getGenreDetails,
  updateGenre,
  deleteGenre,
  getGenresTotal
}