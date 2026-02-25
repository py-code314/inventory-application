const pool = require('../pool')

// Get all publishers from db
async function getAllPublishers() {
  const { rows } = await pool.query('SELECT * FROM publisher ORDER BY id DESC')
  return rows
}

// Get publisher details
async function getPublisherDetails(id) {
  const { rows } = await pool.query('SELECT * FROM publisher WHERE id =  $1', [id])
  return rows
}

// Add publisher to db
async function addPublisher(name, email) {
  await pool.query('INSERT INTO publisher (name, email) VALUES ($1, $2)', [name, email])
}

// Update publisher details
async function updatePublisher(id, name, email) {
  await pool.query('UPDATE publisher SET name = $1, email = $2 WHERE id = $3', [
    name,
    email,
    id,
  ])
}

// Get publisher by name
async function searchPublisher(name) {
  const { rows } = await pool.query(
    "SELECT * FROM publisher WHERE name ILIKE '%' || $1 || '%'",
    [name],
  )
  return rows
}

// Delete publisher
async function deletePublisher(id) {
  await pool.query('DELETE FROM publisher WHERE id = $1', [id])
}

async function findOrCreatePublisher(name) {
  // Check if author exists
  const existing = await pool.query(
    'SELECT id FROM publisher WHERE name ILIKE $1',
    [name],
  )

  if (existing.rows.length > 0) {
    return existing.rows[0].id
  } else {
    // Create new author if they don't exist
    const result = await pool.query(
      'INSERT INTO publisher (name) VALUES ($1) RETURNING id',
      [name],
    )
    return result.rows[0].id
  }
}

module.exports = {
  getAllPublishers,
  searchPublisher,
  addPublisher,
  getPublisherDetails,
  updatePublisher,
  deletePublisher,
  findOrCreatePublisher,
}