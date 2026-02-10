// Import dotenv
require('dotenv').config()

const express = require('express')
const app = express()
const path = require('node:path')

// Import routers
const indexRouter = require('./routes/indexRoutes')
const genresRouter = require('./routes/genresRoutes')
const addGenreRouter = require('./routes/addGenreRoutes')

// const booksRouter = require('./routes/booksRoutes')



// EJS setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// Setup for static files
const assetsPath = path.join(__dirname, 'public')
app.use(express.static(assetsPath))

// Middleware to process request body
app.use(express.urlencoded({ extended: true }))

// TODO Routes
// * index route - Home page (Landing page)
// * genres route - list of genres
// * show specific genre route
// * add genre route (form)
// * update genre route
// * delete genre route
// * search for a genre route
// * all books route - show all books
// * add new book route (form)
// * update a book route (form)
// * delete book route
// * search for a book route

app.use('/', indexRouter)
app.use('/genres', genresRouter)
app.use('/new-genre', addGenreRouter)

// app.use('/books', booksRouter)






// Port to listen on
const PORT = process.env.PORT || 3000
app.listen(PORT, (error) => {
  if (error) {
    throw error
  }
  console.log(`App Inventory Application - listening on port ${PORT}!`)
})
