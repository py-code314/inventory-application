const pool = require('../pool')

// Get all publishers from db
async function getAllPublishers() {
  const { rows } = await pool.query('SELECT * FROM publisher')
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

module.exports = {
  getAllPublishers,
  // getPublisher,
  addPublisher,
  getPublisherDetails,
  updatePublisher,
  // deletePublisher,
}