const pool = require('../pool')

/* Get all genres from db */
async function getAllGenres() {
  const { rows } = await pool.query('SELECT * FROM genre ORDER BY id DESC')
  return rows
}

/* Get genres count */
async function getGenresTotal() {
  const { rows } = await pool.query('SELECT COUNT(*) FROM genre')

  return rows[0]
}

/* Add genre to db */
async function addGenre(type) {
  await pool.query('INSERT INTO genre (type) VALUES ($1)', [type])
}

/* Get genre details */
async function getGenreDetails(id) {
  const { rows } = await pool.query('SELECT * FROM genre WHERE id =  $1', [id])
  return rows
}

/* Update genre details */
async function updateGenre(id, type) {
  await pool.query('UPDATE genre SET type = $1 WHERE id = $2', [type, id])
}

/* Get genre by name */
async function searchGenre(type) {
  const { rows } = await pool.query(
    "SELECT * FROM genre WHERE type ILIKE '%' || $1 || '%'",
    [type],
  )
  return rows
}

/* Delete genre */
async function deleteGenre(id) {
  await pool.query('DELETE FROM genre WHERE id = $1', [id])
}

/* Find existing genre id, if not return new genre id after adding it */
async function findOrCreateGenre(type) {
  // Check if genre exists
  const existing = await pool.query(
    'SELECT id FROM genre WHERE type ILIKE $1',
    [type],
  )

  if (existing.rows.length > 0) {
    return existing.rows[0].id
  } else {
    // Create new genre if it don't exist
    const result = await pool.query(
      'INSERT INTO genre (type) VALUES ($1) RETURNING id',
      [type],
    )
    return result.rows[0].id
  }
}

/* Get genre id by type */
async function getGenreId(type) {
  const { rows } = await pool.query('SELECT id FROM genre WHERE type = $1', [
    type,
  ])

  return rows[0].id
}

module.exports = {
  getAllGenres,
  searchGenre,
  addGenre,
  getGenreDetails,
  updateGenre,
  deleteGenre,
  getGenresTotal,
  findOrCreateGenre,
  getGenreId,
}
