const pool = require('../pool')

// Get all books from db
async function getAllBooks() {
  const { rows } = await pool.query('SELECT * FROM book')
  return rows
}

// Get book details
async function getBookDetails(id) {
  const text = `
  SELECT
    title,
    plot_summary,
    name AS genreType,
    isbn,
    format,
    total_pages,
    price,
    publish_date,
    edition,
    stock,
    date_added,
    date_updated
  FROM book_copy
  JOIN book
  ON book_copy.book_id = book.id
  JOIN genre
  ON book.genre_id = genre.id
  WHERE book.id = $1;`
  const values = [id]

  const { rows } = await pool.query(text, values)
  // console.log('bookDetails:', rows)
  return rows
}

// Get books by name
async function getBooks(title) {
  const text = `
  SELECT
    title,
    plot_summary,
    name AS genreType,
    isbn,
    format,
    total_pages,
    price,
    publish_date,
    edition,
    stock,
    date_added,
    date_updated
  FROM book_copy
  JOIN book
  ON book_copy.book_id = book.id
  JOIN genre
  ON book.genre_id = genre.id
  WHERE book.title ILIKE '%' || $1 || '%';`
  const values = [title]

  const { rows } = await pool.query(text, values)
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
