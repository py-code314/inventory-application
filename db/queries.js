const pool = require('./pool')

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

module.exports = {
  getAllAuthors,
  getAuthors,
  addAuthor,
}
