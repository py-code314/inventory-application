const pool = require('../pool')

// Get all books from db
async function getAllBooks() {
  const { rows } = await pool.query('SELECT * FROM book')
  return rows
}

// Get author details
async function getBookDetails(id) {
  const { rows } = await pool.query('SELECT * FROM book WHERE id =  $1', [id])
  return rows
}

module.exports = {
  getAllBooks,
  // getBooks,
  // addBook,
  getBookDetails,
  // updateBook,
  // deleteBook,
}
