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

module.exports = {
  getAllPublishers,
  // getPublisher,
  // addPublisher,
  getPublisherDetails,
  // updatePublisher,
  // deletePublisher,
}