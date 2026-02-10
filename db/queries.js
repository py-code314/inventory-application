const pool = require('./pool')

// Get all authors from db
async function getAllAuthors() {
  const { rows } = await pool.query('SELECT * FROM author')
  return rows
}

// Get authors by name
async function getAuthors(name) {
  const { rows } = await pool.query("SELECT * FROM author WHERE full_name ILIKE '%' || $1 || '%'", [name])
  return rows
}

module.exports = {
  getAllAuthors,
  getAuthors,
}
