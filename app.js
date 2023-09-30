const express = require('express') // Import Express.js library
const { urlencoded } = require('body-parser') // Import middleware to parse request bodies
const postRouter = require('./router/post') // Import POST router

const app = express() // Create Express app
app.use(express.static(__dirname + "/public")) // Serve static HTML, CSS, JS from public directory
app.use(urlencoded({ extended: true })) // Parse request bodies

app.use("/", postRouter) // Use POST router to handle HTTP requests

module.exports = app
