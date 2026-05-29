const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// DEBUG
console.log("authController:", authController);

// Register
router.post("/register", authController.registerUserController);

// Login
router.post("/login", authController.loginUserController);

// Logout
router.get("/logout", authController.logoutUserController);

// Get current user
router.get("/get-me", authMiddleware.authUser, authController.getMeController);

module.exports = router;