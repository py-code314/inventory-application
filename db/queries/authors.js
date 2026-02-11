const pool = require('../pool')

// Get all authors from db
async function getAllAuthors() {
  const { rows } = await pool.query('SELECT * FROM author')
  return rows
}

// Get authors by name
async function getAuthors(name) {
  const { rows } = await pool.query(
    "SELECT * FROM author WHERE full_name ILIKE '%' || $1 || '%'",
    [name],
  )
  return rows
}

// Add author to db
async function addAuthor(name, date) {
  await pool.query(
    'INSERT INTO author (full_name, birth_date) VALUES ($1, $2)',
    [name, date],
  )
}

// Get author details
async function getAuthorDetails(id) {
  const { rows } = await pool.query('SELECT * FROM author WHERE id =  $1', [id])
  return rows
}

// Update author details
async function updateAuthor(id, name, date) {
  await pool.query(
    'UPDATE author SET full_name = $1, birth_date = $2 WHERE id = $3',
    [name, date, id],
  )
}

// Delete author
async function deleteAuthor(id) {
  await pool.query('DELETE FROM author WHERE id = $1', [id])
}

module.exports = {
  getAllAuthors,
  getAuthors,
  addAuthor,
  getAuthorDetails,
  updateAuthor,
  deleteAuthor,
}
