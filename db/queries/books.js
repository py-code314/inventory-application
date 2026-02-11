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

module.exports = {
  getAllBooks,
  getBooks,
  // addBook,
  getBookDetails,
  // updateBook,
  deleteBook,
}
