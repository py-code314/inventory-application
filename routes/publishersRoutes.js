const express = require('express')
const publishersRouter = express.Router()
const {
  publishers_list_get,
  publisher_search_get,
  publisher_create_get,
  publisher_create_post,
  publisher_details_get,
  publisher_update_get,
  publisher_update_post,
  publisher_delete_post,
} = require('../controllers/publishersController')

// Show publishers
publishersRouter.get('/', publishers_list_get)

// Search for a publisher
// publishersRouter.get('/search', (req, res) => res.send('Show searched publisher'))

// Add a new publisher
publishersRouter.get('/new', publisher_create_get)
publishersRouter.post('/new', publisher_create_post)

// Show publisher
publishersRouter.get('/:id', publisher_details_get)


// Update a publisher
// publishersRouter.get('/:id/update', (req, res) => res.send('Show pre-populated publisher form'))
// publishersRouter.post('/:id/update', (req, res) => res.redirect('/publishers'))

// Delete a publisher
// publishersRouter.post('/:id/delete', (req, res) => res.redirect('/publishers'))


module.exports = publishersRouter
