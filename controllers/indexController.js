const { getInventoryStats } = require('../db/queries/books')
const {getGenresTotal} = require('../db/queries/genres')

async function home_page_get(req, res) {
  const { totalBooks, outOfStock, lowStock } = await getInventoryStats()
  // console.log('totalBooks:', totalBooks)
  const { count } = await getGenresTotal()
  // console.log('count:', count)

  res.render('pages/index', { title: 'Home', totalBooks: totalBooks, outOfStock: outOfStock, lowStock: lowStock, genresTotal: count  })
}

module.exports = { home_page_get }
