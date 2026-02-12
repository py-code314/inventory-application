const {
  body,
  query,
  validationResult,
  matchedData,
} = require('express-validator')
const {
  getAllPublishers,
  getPublisher,
  addPublisher,
  getPublisherDetails,
  updatePublisher,
  deletePublisher,
} = require('../db/queries/publishers')

// Get all publishers
async function publishers_list_get(req, res) {
  const publishers = await getAllPublishers()
  res.send(publishers)
}

// Show publisher details
async function publisher_details_get(req, res) {
  const id = Number(req.params.id)
  const details = await getPublisherDetails(id)

  res.send(details)
}

module.exports = {
  publishers_list_get,
  // publisher_search_get,
  // publisher_create_get,
  // publisher_create_post,
  publisher_details_get,
  // publisher_update_get,
  // publisher_update_post,
  // publisher_delete_post,
}