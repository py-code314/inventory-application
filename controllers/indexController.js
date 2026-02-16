async function home_page_get(req, res) {
  res.render('pages/index', { title: 'Home' })
}

module.exports = {home_page_get}