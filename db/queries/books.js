const pool = require('../pool')

// Get all books from db
async function getAllBooks() {
  const text = `
    SELECT bc.book_id AS "bookId", bc.id AS "copyId", title,
      plot_summary,
      STRING_AGG(full_name, ', ') AS authors,
      type, format, edition
    FROM book_copy bc
    JOIN book b ON b.id = bc.book_id
    JOIN genre g ON g.id = b.genre_id
    JOIN written_by wb ON wb.book_id = b.id
    JOIN author a ON a.id = wb.author_id
    GROUP BY bc.book_id, bc.id, title, plot_summary, type
    ORDER BY bc.id DESC;
  `
  const { rows } = await pool.query(text)
  // console.log('allBooks:', rows)
  return rows
}

// Get books by name
async function searchBooks(query) {
  const text = `
    SELECT bc.book_id AS "bookId", bc.id AS "copyId", title,
      plot_summary,
      STRING_AGG(full_name, ', ') AS authors,
      type, format, edition
    FROM book_copy bc
    JOIN book b ON b.id = bc.book_id
    JOIN genre g ON g.id = b.genre_id
    JOIN written_by wb ON wb.book_id = b.id
    JOIN author a ON a.id = wb.author_id
    WHERE b.title ILIKE '%' || $1 || '%'
    GROUP BY bc.book_id, bc.id, title, plot_summary, type
    ORDER BY bc.id DESC;
  `
  const values = [query]

  const { rows } = await pool.query(text, values)
  return rows
}

// Check for a duplicate book
async function checkDuplicate(title, authorIdArr, format, edition) {
  // console.log('author id arr:', authorIdArr)

  let isDuplicate = true

  for (const authorId of authorIdArr) {
    // console.log('author id:', authorId)
    const text = `
      SELECT bc.id
      FROM book_copy bc
      JOIN book b
      ON b.id = bc.book_id
      JOIN written_by wb
      ON wb.book_id = bc.book_id
      WHERE b.title = $1
      AND wb.author_id = $2
      AND bc.format = $3
      AND bc.edition = $4
    `
    const values = [title, authorId, format, edition]
    const { rows } = await pool.query(text, values)

    if (!rows.length) {
      isDuplicate = false
    }
  }
  return isDuplicate
}

async function checkBookAuthorCombo(title, authorIdArr) {
  let bookId

  for (const authorId of authorIdArr) {
    const text = `
      SELECT b.id
      FROM book b
      JOIN written_by wb
      ON wb.book_id = b.id
      WHERE b.title = $1
      AND wb.author_id = $2
    `
    const values = [title, authorId]
    const { rows } = await pool.query(text, values)

    if (rows.length) {
      bookId = rows[0].id
    } else {
      bookId = ''
    }
  }
  return bookId
  
}

// Add book to db
async function addBook(
  title,
  summary,
  authorIdArr,
  genreId,
  totalPages,
  price,
  stock,
  format,
  publishDate,
  publisherId,
  edition,
  isbn,
  comboBookId,
) {
  // console.log('add book')
  const client = await pool.connect()

  try {
    // console.log('try adding a book')
    await client.query('BEGIN')

    let bookId = comboBookId

    if (!comboBookId) {
      // Insert into book table
      const insertBookText = `
      INSERT INTO book(title, plot_summary, genre_id)
      VALUES($1, $2, $3)
      RETURNING id
    `
      const insertBookValues = [title, summary, genreId]
      const res = await client.query(insertBookText, insertBookValues)
       bookId = res.rows[0].id

      // Insert each author into written_by table
      if (authorIdArr && authorIdArr.length > 0) {
        for (const authorId of authorIdArr) {
          const insertWrittenByText = `
        INSERT INTO written_by (book_id, author_id)
        VALUES($1, $2)
      `
          const insertWrittenByValues = [bookId, authorId]
          await client.query(insertWrittenByText, insertWrittenByValues)
        }
      }
    }
    

    // throw new Error('transaction error')

    // Insert into book_copy table
    const insertBookCopyText = `
      INSERT INTO book_copy(book_id, total_pages, price, stock, format, publish_date, publisher_id, edition, isbn)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `
    const insertBookCopyValues = [
      bookId,
      totalPages,
      price,
      stock,
      format,
      publishDate,
      publisherId,
      edition,
      isbn,
    ]
    await client.query(insertBookCopyText, insertBookCopyValues)
    await client.query('COMMIT')
    console.log('add book id:', bookId)
    return bookId
  } catch (err) {
    // console.error(err)
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

// Get book details
async function getBookDetails(bookId, copyId) {
  console.log('book id:', bookId)
  console.log('copy id:', copyId)
  const text = `
  SELECT
    b.id AS "bookId",
    bc.id AS "copyId",
    title,
    plot_summary,
    STRING_AGG(full_name, ', ') AS "authors",
    g.type AS "genre",
    total_pages,
    price,
    stock,
    format,
    publish_date,
    p.name AS "publisher",
    edition,
    isbn, 
    date_added,
    date_updated
  FROM book_copy bc
  JOIN book b
  ON b.id = bc.book_id 
  JOIN genre g
  ON g.id = b.genre_id
  JOIN written_by wb
  ON wb.book_id = b.id
  JOIN author a
  ON a.id = author_id
  JOIN publisher p
  ON p.id = bc.publisher_id
  WHERE b.id = $1 AND bc.id = $2
  GROUP BY b.id, bc.id, title, plot_summary, g.type,
    total_pages, price, stock, format, publish_date, p.name,
    edition, isbn, date_added, date_updated  
  `
  const values = [bookId, copyId]

  const { rows } = await pool.query(text, values)
  // console.log('book details:', rows)
  return rows
}


/* Delete book copy */
async function deleteBookCopy(bookId, copyId) {
  await pool.query('DELETE FROM book_copy WHERE book_id = $1 AND id = $2 ',
    [bookId, copyId,])
}

// Update book details
async function updateBook(
  bookId,
  copyId,
  summary,
  genreId,
  totalPages,
  price,
  stock,
  format,
  publishDate,
  publisherId,
  edition,
  isbn,
) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    // Update book data
    const updateBookText = `
      UPDATE book
      SET plot_summary = $1, genre_id = $2
      WHERE book.id = $3
    `
    const updateBookValues = [summary, genreId, bookId]

    await client.query(updateBookText, updateBookValues)

    // Update book copy data
    const updateBookCopyText = `
      UPDATE book_copy
      SET total_pages = $1, price = $2, stock = $3, format = $4,
      publish_date = $5, publisher_id = $6,  edition = $7,
      isbn = $8
      WHERE book_copy.id = $9 AND book_copy.book_id = $10
    `
    const updateBookCopyValues = [
      totalPages,
      price,
      stock,
      format,
      publishDate,
      publisherId,
      edition,
      isbn,
      copyId,
      bookId,
    ]

    await client.query(updateBookCopyText, updateBookCopyValues)
    await client.query('COMMIT')

  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }

  
}


// Delete book
async function deleteBook(id) {
  await pool.query('DELETE FROM book WHERE id = $1', [id])
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
  return rows[0]
}

module.exports = {
  getAllBooks,
  searchBooks,
  addBook,
  getBookDetails,
  updateBook,
  deleteBook,
  getInventoryStats,
  checkDuplicate,
  deleteBookCopy,
  checkBookAuthorCombo,
}
