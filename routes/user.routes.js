const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const userModel = require("../models/user.model.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Render registration page
router.get("/register", (req, res) => {
  /* https://localhost:3000/user/register */
  res.render("register");
});

// Handle user registration
router.post(
  "/register",
  body("username").trim().isLength({ min: 5 }),
  body("email").trim().isEmail().isLength({ min: 12 }),
  body("password").trim().isLength({ min: 8 }),
  async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);

    // If there are validation errors, return them to the client
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        Message: "Invalid data",
      });
    }
    // If no validation errors, proceed to create the user
    const { username, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    // Create a new user instance
    const newUser = await userModel.create({
      username,
      email,
      password: hashedPassword,
    });
    res.json(newUser);
  },
);

// Render login page
router.get( "/login", (req, res) => {
  res.render("login");
});

// Handle user login
router.post( "/login",
  body("email").trim().isEmail().isLength({ min: 12 }),
  body("password").trim().isLength({ min: 8 }),
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: "Invalid data",
      });
    }

    const { email, password } = req.body;

    const user = await userModel.findOne({
      email: email,
    });

    if (!user) {
      return res.status(400).json({
        message: "Email or password is incorrect",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Email or password is incorrect",
      });
    }

    // Generate JWT token => npm install jsonwebtoken

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        username: user.username,
      },
      process.env.JWT_SECRET,
    );
    res.cookie("token",token);
    res.send("Login Successful");

  },
);



// Export the router
module.exports = router;
