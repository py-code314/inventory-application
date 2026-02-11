const pool = require('../pool')

// Get all books from db
async function getAllBooks() {
  const { rows } = await pool.query('SELECT * FROM book')
  return rows
}

// Get book details
async function getBookDetails(id) {
  const { rows } = await pool.query('SELECT * FROM book WHERE id =  $1', [id])
  return rows
}

// Get books by name
async function getBooks(title) {
  const { rows } = await pool.query(
    "SELECT * FROM book WHERE title ILIKE '%' || $1 || '%'",
    [title],
  )
  return rows
}

// Delete book
async function deleteBook(id) {
  await pool.query('DELETE FROM book WHERE id = $1', [id])
}

// Add book to db
async function addBook(title, summary, genreId) {
  await pool.query('INSERT INTO book (title, plot_summary, genre_id) VALUES ($1, $2, $3)', [
    title,
    summary,
    genreId,
  ])
}

// Update book details
async function updateBook(id, title, summary, genreId) {
  await pool.query(
    'UPDATE book SET title = $1, plot_summary = $2, genre_id = $3 WHERE id = $4',
    [title, summary, genreId, id],
  )
}

module.exports = {
  getAllBooks,
  getBooks,
  addBook,
  getBookDetails,
  updateBook,
  deleteBook,
}
