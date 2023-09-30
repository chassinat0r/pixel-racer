const { Router } = require('express') // Import Router function from Express library
const authController = require('../controller/auth') // Import all functions from auth controller

const router = Router() // Create new Express.js router

// Pass POST requests onto auth controller functions
router.post('/sign-up', authController.signUp)
router.post('/sign-in', authController.signIn)
router.post('/get-username', authController.getUsername)

module.exports = router
