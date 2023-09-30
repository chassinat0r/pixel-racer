const bcrypt = require('bcrypt') // Import bcrypt for hashing passwords
const { v4: uuidv4 } = require('uuid') // Import function to randomly generate UUIDv4

// Import SQLite and SQLite3 libraries
const { Database } = require('sqlite3')
const { open } = require('sqlite')

// Function for opening the database
async function openDatabase() {
    const db = await open({
        filename: "data.db",
        driver: Database
    }) // Open or create data.db using SQLite3 driver

    /* Create users and sessions tables if they don't exist
    - Users table stores account information, username and password
    - Sessions table stores unique sessions for authentication alongside username
    */

    await db.run(`CREATE TABLE IF NOT EXISTS users (
        username TEXT UNIQUE,
        password TEXT
    )`) // users table with username and password

    await db.run(`CREATE TABLE IF NOT EXISTS sessions (
        session TEXT UNIQUE,
        username TEXT
    )`) // sessions table with session and username

    return db
}

/* Function to respond to sign up request
- Check if username already taken, display error if so
- Hash password using bcrypt
- Write entry with username and hash to users table
- Go to sign in form
*/

const signUp = async (req, res) => {
    const { username, password } = req.body // Get username and password submitted by user

    const db = await openDatabase() // Open accounts database

    /* Check if username is not already in use by another account 
    - Query entry in users table with given username
    - If matching entry is found, send back 409 conflict
    */

    const userRow = await db.get("SELECT * FROM users WHERE username = ?", username)

    if (userRow) {
        res.status(409).end("Username already in use.")
        return // Stops function executing anymore
    }

    const hash = await bcrypt.hash(password, 10) // Hash password using bcrypt, 10 rounds of salt

    // Write entry with username and hash to users table
    await db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hash])
    await db.close() // Close database
    
    res.redirect('back') // Reload page
}

/* Function to respond to sign in request
- Check if username exists, if not display error
- Compare submitted password with hash to see if they match,
if not, display error
- Generate session using UUIDv4
- Write entry with session and username to sessions table
- Save session in browser cookie
*/

const signIn = async (req, res) => {
    const { username, password } = req.body

    const db = await openDatabase()

    /* Check if username is valid
    - Query entry in users table with matching username
    - If entry not found, so username doesn't exist, 
    return error 401 (unauthorised)
    */

    const entry = await db.get("SELECT * FROM users WHERE username = ?", username)

    if (!entry) {
        res.status(401).end("Incorrect username or password.")
        return
    }

    const { password: hash } = entry // Get hashed password from database entry

    // Check if passwords match
    const passwordCorrect = await bcrypt.compare(password, hash)

    if (!passwordCorrect) {
        res.status(401).end("Incorrect username or password.")
        return
    }

    const session = uuidv4() // Generate UUIDv4 for session

    // Write session and username to sessions table
    await db.run("INSERT INTO sessions (session, username) VALUES (?, ?)", [session, username])
    await db.close()
    
    res.cookie('session', session) // Save session in cookie
    res.redirect('/') // Go to index page (the game)
}

/* Function to get username using a session
- Query sessions table for matching entry to session
- If none found, session invalid/user not signed in, return
404 error
- Otherwise, return username from entry
*/

const getUsername = async (req, res) => {
    const { session } = req.body // Get session from request body

    const db = await openDatabase()
    
    // Check if session given is valid
    const entry = await db.get("SELECT username FROM sessions WHERE session = ?", session)
    await db.close()
        
    if (!entry) { // No entry matching session found.
        res.status(404).end() // 404 error
        return
    }

    const { username } = entry

    res.end(username) // Send username back to client
}

module.exports = {
    signUp,
    signIn,
    getUsername
}
