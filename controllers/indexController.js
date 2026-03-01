/* Imports */
const { getInventoryStats } = require('../db/queries/books')
const { getGenresTotal } = require('../db/queries/genres')

async function home_page_get(req, res) {
  // Get inventory stats
  const { totalBooks, outOfStock, lowStock } = await getInventoryStats()
  const { count } = await getGenresTotal()

  res.render('pages/index', {
    title: 'Home',
    totalBooks: totalBooks,
    outOfStock: outOfStock,
    lowStock: lowStock,
    genresTotal: count,
  })
}

module.exports = { home_page_get }
