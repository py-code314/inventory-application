const pool = require('./pool')

// Get all authors from db
async function getAllAuthors() {
  const { rows } = await pool.query('SELECT * FROM author')

  return rows
}



module.exports = {
  getAllAuthors,
  
}
