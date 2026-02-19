const pool = require('../pool')

// Get all books from db
async function getAllBooks() {
  const text = `
    SELECT title, full_name, plot_summary, type
    FROM book
    JOIN genre ON genre.id = book.genre_id
    JOIN written_by ON written_by.book_id = book.id
    JOIN author ON author.id = written_by.author_id
  `
  const { rows } = await pool.query(text)
  // console.log('allBooks:', rows)
  return rows
}

// Get inventory stats for books
async function getInventoryStats() {
  const text = `
    SELECT 
      COUNT(*) AS "totalBooks",
      COUNT(*) FILTER (WHERE stock = 0) AS "outOfStock",
      COUNT(*) FILTER (WHERE stock > 0 AND stock <= 5) AS "lowStock"
    FROM book_copy;
  `
  const { rows } = await pool.query(text)
  // console.log('rows:', rows[0])
  return rows[0]
}

// Get book details
async function getBookDetails(id) {
  const text = `
  SELECT
    title,
    plot_summary,
    genre.name AS genre,
    full_name,
    publisher.name AS publisher,
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
  ON book.id = book_copy.book_id 
  JOIN genre
  ON genre.id = book.genre_id
  JOIN written_by
  ON written_by.book_id = book.id
  JOIN author
  ON author.id = author_id
  JOIN publisher
  ON publisher.id = book_copy.publisher_id
  WHERE book.id = $1
  `
  const values = [id]

  const { rows } = await pool.query(text, values)
  return rows
}

// Get books by name
async function getBooks(query) {
  const text = `
    SELECT title, full_name, plot_summary, type
    FROM book
    JOIN genre ON genre.id = book.genre_id
    JOIN written_by ON written_by.book_id = book.id
    JOIN author ON author.id = written_by.author_id
    WHERE book.title ILIKE '%' || $1 || '%';
  `
  const values = [query]

  const { rows } = await pool.query(text, values)
  return rows
}

// Delete book
async function deleteBook(id) {
  await pool.query('DELETE FROM book WHERE id = $1', [id])
}

// Add book to db
async function addBook(
  title,
  summary,
  genreId,
  authorId,
  isbn,
  format,
  totalPages,
  price,
  stock,
  publishDate,
  edition,
  publisherId,
) {
  // Use CTE tables to make it a single query
  const text = `
    WITH new_book AS(
      INSERT INTO book(title, plot_summary, genre_id)
      VALUES($1, $2, $3)
      RETURNING id
    ),
    new_written_by AS (
      INSERT INTO written_by (book_id, author_id)
      VALUES((SELECT id FROM new_book), $4)
    )

    INSERT INTO book_copy(isbn, format, total_pages, price, stock, publish_date, edition,  book_id, publisher_id)
    SELECT $5, $6, $7, $8, $9, $10, $11, id, $12
    FROM new_book
    RETURNING book_id;
    `
  const values = [
    title,
    summary,
    genreId,
    authorId,
    isbn,
    format,
    totalPages,
    price,
    stock,
    publishDate,
    edition,
    publisherId,
  ]

  await pool.query(text, values)
}

// Update book details
async function updateBook(
  id,
  title,
  summary,
  genreId,
  authorId,
  isbn,
  format,
  totalPages,
  price,
  stock,
  publishDate,
  edition,
  publisherId,
) {
  const text = `
    WITH updated_book AS(
      UPDATE book
      SET title = $2, plot_summary = $3, genre_id = $4
      WHERE id = $1
      RETURNING id
    ),
    updated_written_by AS (
      UPDATE written_by
      SET author_id = $5
      WHERE book_id = (SELECT id FROM updated_book)
    )

    UPDATE book_copy
    SET isbn = $6, format = $7, total_pages = $8, price = $9, stock = $10, publish_date = $11, edition = $12, publisher_id = $13
    WHERE book_id = (SELECT id FROM updated_book)
    RETURNING book_id;
    `

  const values = [
    id,
    title,
    summary,
    genreId,
    authorId,
    isbn,
    format,
    totalPages,
    price,
    stock,
    publishDate,
    edition,
    publisherId,
  ]

  await pool.query(text, values)
}

async function checkDuplicate(title, id) {
  const text = `
    SELECT book.id
    FROM book
    JOIN written_by
    ON written_by.book_id = book.id
    WHERE book.title = $1
    AND written_by.author_id = $2
  `
  const values = [title, id]
  const  {rows}  = await pool.query(text, values)
  // console.log('rows:', rows)
  return rows
}

module.exports = {
  getAllBooks,
  getBooks,
  addBook,
  getBookDetails,
  updateBook,
  deleteBook,
  getInventoryStats,
  checkDuplicate
}
