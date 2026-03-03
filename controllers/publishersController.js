/* Imports */
const {
  body,
  query,
  validationResult,
  matchedData,
} = require('express-validator')
const {
  getAllPublishers,
  searchPublisher,
  addPublisher,
  getPublisherDetails,
  updatePublisher,
  deletePublisher,
} = require('../db/queries/publishers')

/* Error messages */
const emailErr = 'must be in a valid format.'
const emptyErr = 'must not be empty.'

/* Validate publisher data */
const validatePublisher = [
  body('name').trim().notEmpty().withMessage(`Name ${emptyErr}`),
  body('email')
    .trim()
    .optional({ values: 'falsy' })
    .isEmail()
    .withMessage(`Email ${emailErr}`),
]

/* Validate publisher search query */
const validateSearch = [
  query('query').trim().notEmpty().withMessage(`Name ${emptyErr}`),
]

/* Show all publishers */
async function publishers_list_get(req, res) {
  // Get all publishers data
  const publishers = await getAllPublishers()
  res.render('pages/publishers/publishers', { title: 'Publishers', publishers })
}

/* Show publisher form */
async function publisher_create_get(req, res) {
  res.render('pages/publishers/publisher-form', { title: 'Add Publisher' })
}

/* Validate and add new publisher */
const publisher_create_post = [
  validatePublisher,

  async (req, res) => {
    // Validate request
    const errors = validationResult(req)

    // Show errors if validation fails
    if (!errors.isEmpty()) {
      return res.status(400).render('pages/publishers/publisher-form', {
        title: 'Add Publisher',
        publisher: req.body,
        errors: errors.array(),
      })
    }

    try {
      const { name, email } = matchedData(req)
      // Add new publisher to db
      await addPublisher(name, email)
      res.redirect('/publishers')
    } catch (err) {
      console.error(err)

      // Default error details
      let statusCode = 500
      let errorMsg = 'A database error occurred. Please try again later.'

      // Update for UNIQUE constraint violation
      if (err.code === '23505') {
        statusCode = 409
        errorMsg = 'Publisher name must be unique.'
      }

      return res.status(statusCode).render('pages/publishers/publisher-form', {
        title: 'Add Publisher',
        publisher: req.body,
        errors: [{ msg: errorMsg }],
      })
    }
  },
]

/* Show publisher details in a pre-populated form */
async function publisher_update_get(req, res) {
  const id = Number(req.params.id)
  // Get publisher data
  const details = await getPublisherDetails(id)
  // console.log('details:', details)

  res.render('pages/publishers/publisher-form', {
    title: 'Update Publisher',
    publisher: details[0],
    publisherId: id,
    isUpdate: true,
  })
}

/* Validate and update publisher */
const publisher_update_post = [
  validatePublisher,

  async (req, res) => {
    const id = Number(req.params.id)
    const { password } = req.body

    // Don't update if admin password doesn't match
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(403).render('pages/publishers/publisher-form', {
        title: 'Update Publisher',
        publisher: req.body,
        publisherId: id,
        errors: [{ msg: 'Incorrect Admin Password' }],
        isUpdate: true,
      })
    }

    // Validate request
    const errors = validationResult(req)

    // Show errors if validation fails
    if (!errors.isEmpty()) {
      return res.status(400).render('pages/publishers/publisher-form', {
        title: 'Update Publisher',
        publisher: req.body,
        publisherId: id,
        errors: errors.array(),
        isUpdate: true,
      })
    }

    try {
      const { name, email } = matchedData(req)
      // Update publisher data
      await updatePublisher(id, name, email)
      res.redirect('/publishers')
    } catch (err) {
      console.error(err)

      // Default
      let statusCode = 500
      let errorMsg = 'A database error occurred. Please try again later.'
      // Update for UNIQUE constraint violation
      if (err.code === '23505') {
        statusCode = 409
        errorMsg = 'Publisher name must be unique.'
      }

      return res.status(statusCode).render('pages/publishers/publisher-form', {
        title: 'Update Publisher',
        publisher: req.body,
        publisherId: id,
        errors: [{ msg: errorMsg }],
        isUpdate: true,
      })
    }
  },
]

/* Search for publisher by name */
const publisher_search_get = [
  validateSearch,

  async (req, res) => {
    // Validate request
    const errors = validationResult(req)

    // Show errors if validation fails
    if (!errors.isEmpty()) {
      return res.status(400).render('pages/publishers/publishers', {
        title: 'Search Results',
        errors: errors.array(),
      })
    }

    const { query } = matchedData(req)
    // Filter publishers
    const filteredPublishers = await searchPublisher(query)

    res.render('pages/publishers/publishers', {
      title: 'Search Results',
      search: query,
      filteredPublishers,
    })
  },
]

/* Delete publisher */
async function publisher_delete_post(req, res) {
  const id = Number(req.params.id)

  try {
    // Delete publisher from db
    await deletePublisher(id)
    res.redirect('/publishers')
  } catch (err) {
    console.error(err)
    // Get all publishers
    const publishers = await getAllPublishers()

    // Default error message
    let errorMsg = 'Failed to delete publisher. Please try again.'

    // Update error message
    if (err.code === '23001') {
      errorMsg =
        'Cannot delete publisher: This publisher has books linked to it. Please delete or reassign the books before removing the publisher.'
    }

    return res.status(500).render('pages/publishers/publishers', {
      title: 'Publishers',
      publishers,
      errors: [{ msg: errorMsg }],
    })
  }
}

module.exports = {
  publishers_list_get,
  publisher_search_get,
  publisher_create_get,
  publisher_create_post,
  publisher_update_get,
  publisher_update_post,
  publisher_delete_post,
}
