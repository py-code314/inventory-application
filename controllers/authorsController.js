const db = require('../db/queries')
const {getAllAuthors} = require('../db/queries')

// Get all authors
async function authors_list_get(req, res) {
  const authors = await getAllAuthors()
  console.log('Authors: ', authors)
  // res.render('pages/index', { title: 'Home', authors })
  res.send('List all authors')
}



module.exports = {
  authors_list_get,
}
