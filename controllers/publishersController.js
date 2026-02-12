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

// Error messages
const emailErr = 'must be in a valid format.'
const emptyErr = 'must not be empty.'

// Validate publisher data
const validatePublisher = [
  body('name').trim().notEmpty().withMessage(`Name ${emptyErr}`),
  body('email')
    .trim()
    .notEmpty()
    .withMessage(`Name ${emptyErr}`)
    .bail()
    .isEmail()
    .withMessage(`Email ${emailErr}`),
]

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

// Show new publisher form
async function publisher_create_get(req, res) {
  res.send('Show new publisher form')
}

// Validate and add new publisher
const publisher_create_post = [
  validatePublisher,
  async (req, res) => {
    // Validate request
    const errors = validationResult(req)

    // Show errors if validation fails
    if (!errors.isEmpty()) {
      res.send('Error message')
      return
    }

    const { name, email } = matchedData(req)
    await addPublisher(name, email)
    res.send('Publisher added successfully')
  },
]

// Show publisher details in a pre-populated form
async function publisher_update_get(req, res) {
  const id = Number(req.params.id)
  const details = await getPublisherDetails(id)

  res.send(details)
}

// Validate and update publisher
const publisher_update_post = [
  validatePublisher,
  async (req, res) => {
    // Validate request
    const errors = validationResult(req)
    console.log('errors:', errors)

    // Show errors if validation fails
    if (!errors.isEmpty()) {
      res.send('Error message')
      return
    }

    const id = Number(req.params.id)
    const { name, email } = matchedData(req)
    await updatePublisher(id, name, email)
    // TODO Redirect to publisher details page
    res.send('publisher details updated successfully')
  },
]



module.exports = {
  publishers_list_get,
  // publisher_search_get,
  publisher_create_get,
  publisher_create_post,
  publisher_details_get,
  publisher_update_get,
  publisher_update_post,
  // publisher_delete_post,
}
