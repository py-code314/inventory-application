const { Pool } = require('pg')

// Use env variables instead of hard coding
module.exports = new Pool({
  connectionString: process.env.DATABASE_URL,
})
