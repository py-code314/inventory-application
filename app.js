// Import dotenv
require('dotenv').config()

const express = require('express')
const app = express()
const path = require('node:path')

// Import routers
const indexRouter = require('./routes/indexRoutes')
const genresRouter = require('./routes/genresRoutes')
// const addGenreRouter = require('./routes/addGenreRoutes')
const booksRouter = require('./routes/booksRoutes')
// const addBookRouter = require('./routes/addBookRoutes')
const authorsRouter = require('./routes/authorsRoutes')
const publishersRouter = require('./routes/publishersRoutes')



// EJS setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// Setup for static files
const assetsPath = path.join(__dirname, 'public')
app.use(express.static(assetsPath))

// Middleware to process request body
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/', indexRouter)
app.use('/genres', genresRouter)
// app.use('/new-genre', addGenreRouter)
app.use('/books', booksRouter)
// app.use('/new-book', addBookRouter)
app.use('/authors', authorsRouter)
app.use('/publishers', publishersRouter)





// Port to listen on
const PORT = process.env.PORT || 3000
app.listen(PORT, (error) => {
  if (error) {
    throw error
  }
  console.log(`App Inventory Application - listening on port ${PORT}!`)
})
