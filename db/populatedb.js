const { Client } = require('pg')
const { argv } = require('node:process')

// Create tables and add some initial data
const SQL = `
/* WARNING: Use this only during development */

DROP TABLE IF EXISTS written_by CASCADE;
DROP TABLE IF EXISTS book_copy CASCADE;
DROP TABLE IF EXISTS book CASCADE;
DROP TABLE IF EXISTS genre CASCADE;
DROP TABLE IF EXISTS author CASCADE;
DROP TABLE IF EXISTS publisher CASCADE;


CREATE TABLE IF NOT EXISTS genre (
	id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	type TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS book (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title TEXT NOT NULL,
  plot_summary TEXT,
  genre_id INTEGER NOT NULL,
  CONSTRAINT fk_genre
	  FOREIGN KEY (genre_id)
	  REFERENCES genre (id)
	  ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS author (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  full_name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  
	CONSTRAINT unique_author UNIQUE (full_name, birth_date)
);

CREATE TABLE IF NOT EXISTS publisher (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT UNIQUE NOT NULL,
	email TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS book_copy (
	id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	isbn VARCHAR (13) UNIQUE NOT NULL,
	format TEXT NOT NULL,
	total_pages INTEGER NOT NULL CHECK (total_pages > 0),
	price DECIMAL (10, 2) NOT NULL CHECK (price > 0),
	publish_date DATE,
	edition TEXT,
	stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
	book_id INTEGER NOT NULL,
	publisher_id INTEGER NOT NULL,
	date_added TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
	date_updated TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT fk_book
	  FOREIGN KEY (book_id)
		REFERENCES book (id)
		ON DELETE CASCADE,
	CONSTRAINT fk_publisher
	  FOREIGN KEY (publisher_id)
		REFERENCES publisher (id)
		ON DELETE RESTRICT
);

CREATE OR REPLACE FUNCTION update_date_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.date_updated = current_timestamp;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS book_copy_date_updated_trigger ON book_copy;

CREATE TRIGGER book_copy_date_updated_trigger
BEFORE UPDATE ON book_copy
FOR EACH ROW
EXECUTE FUNCTION update_date_updated();



CREATE TABLE IF NOT EXISTS written_by (
  book_id INTEGER NOT NULL,
  author_id INTEGER NOT NULL,
  CONSTRAINT pk_written_by
	  PRIMARY KEY (book_id, author_id),
  CONSTRAINT fk_book
	  FOREIGN KEY (book_id)
		REFERENCES book (id)
		ON DELETE CASCADE,
	CONSTRAINT fk_author
	  FOREIGN KEY (author_id)
		REFERENCES author (id)
		ON DELETE RESTRICT
);

INSERT INTO genre (type) VALUES 
('Science Fiction'),
('Fantasy'),
('Mystery'),
('Biography'),
('History'), 
('Horror');

INSERT INTO author (full_name, birth_date) VALUES 
('Frank Herbert', '1920-10-08'),
('J.R.R. Tolkien', '1892-01-03'),
('Agatha Christie', '1890-09-15'),
('Walter Isaacson', '1952-05-20'),
('Yuval Noah Harari', '1976-02-24'),
('Stephen King', '1947-09-21');

INSERT INTO publisher (name, email) VALUES 
('Chilton Books', 'contact@chilton.com'),
('George Allen & Unwin', 'info@georgeallen.co.uk'),
('Collins Crime Club', 'support@collins.com'),
('Simon & Schuster', 'sales@simonandschuster.com'),
('Harper', 'contact@harpercollins.com'), 
('Doubleday', 'orders@doubleday.com');

INSERT INTO book (title, plot_summary, genre_id) VALUES 
('Dune', 'A desert planet, spice, and political intrigue.', 1),
('The Fellowship of the Ring', 'A hobbit begins a journey to destroy a ring.', 2),
('Murder on the Orient Express', 'Detective Poirot solves a train murder.', 3),
('Steve Jobs', 'The life story of Apple’s co-founder.', 4),
('Sapiens', 'A brief history of how humankind evolved and conquered the earth.', 5),
('Carrie', 'A girl with telekinetic powers seeks revenge.', 6);

INSERT INTO written_by (book_id, author_id) VALUES 
(1, 1), 
(2, 2), 
(3, 3), 
(4, 4), 
(5, 5), 
(6, 6);

INSERT INTO book_copy (isbn, format, total_pages, price, publish_date, edition, stock, book_id, publisher_id) VALUES 
('9780441172719', 'Hardcover', 412, 29.99, '1965-08-01', '1st Edition', 10, 1, 1),
('9780618346257', 'Paperback', 423, 15.50, '1954-07-29', 'Anniversary Edition', 25, 2, 2),
('9780007119356', 'Hardcover', 256, 12.00, '1934-01-01', 'Standard', 5, 3, 3),
('9781451648539', 'E-book', 656, 19.99, '2011-10-24', '1st', 100, 4, 4),
('9780062316097', 'Paperback', 443, 24.99, '2011-01-01', 'Revised', 15, 5, 5), 
('9780385086950', 'Hardcover', 199, 18.00, '1974-04-05', 'Original', 8, 6, 6);
`

async function main() {
  console.log('seeding...')
  // Access db (public connection) url passed as a command line argument
  const client = new Client({
    connectionString: argv[2],
  })
  await client.connect()
  await client.query(SQL)
  await client.end()
  console.log('done')
}

main()
