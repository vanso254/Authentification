const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("../services/passportConfig");
require("dotenv").config();

// Register route
router.post("/register", async (req, res) => {
  try {
    // Extract email and password from request body
    const { email, password, name } = req.body;

    // Check if the user already exists with the given email
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists." });
    }

    // Hash the password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user with the provided email, name, and hashed password
    const newUser = await User.create({
      email,
      name,
      password: hashedPassword,
    });

    // Save user to the database and respond with a success message
    return res
      .status(201)
      .json({
        message: "User registered successfully!",
        userId: newUser.staff_id,
      });
  } catch (error) {
    console.error("Error during registration:", error);
    return res
      .status(500)
      .json({ error: "Server error. Please try again later." });
  }
});

router.post("/login", async (req, res) => {
  try {
    // Extract email and password from request body
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(401)
        .json({
          error: "Invalid credentials. Please check your email and password.",
        });
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({
          error: "Invalid credentials. Please check your email and password.",
        });
    }

    // Passwords match, create JWT payload with user ID
    const payload = { id: user.staff_id };

    // Generate access token
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRATION } // e.g., '15m'
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRATION } // e.g., '7d'
    );

    // Optionally, store the refresh token in the user's record in the database (if desired)
    user.refreshToken = refreshToken;
    await user.save();

    // Respond with access token and refresh token
    return res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res
      .status(500)
      .json({ error: "Server error. Please try again later." });
  }
});


router.post("/refresh", async (req, res) => {
  try {
    // Extract the refresh token from the request body
    const { refreshToken } = req.body;

    // If no token is provided, respond with an error
    if (!refreshToken) {
      return res.status(400).json({ error: "Token required" });
    }

    // Verify the refresh token using JWT_REFRESH_SECRET
    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
      async (err, decoded) => {
        if (err) {
          // If token verification fails, respond with an error
          return res
            .status(403)
            .json({ error: "Invalid or expired refresh token" });
        }

        // Extract user ID from the decoded token payload
        const { id } = decoded;

        // Optionally, check if refresh token matches stored token in user's record
        const user = await User.findOne({ where: { staff_id: id } });
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        // If stored refresh token does not match, reject the request
        if (user.refreshToken !== refreshToken) {
          return res
            .status(403)
            .json({ error: "Invalid refresh token. Please log in again." });
        }

        // Generate a new access token using jwt.sign(), JWT_SECRET, and expiresIn
        const newAccessToken = jwt.sign(
          { id: user.staff_id },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_ACCESS_EXPIRATION } // e.g., '15m'
        );

        // Respond with the new access token
        return res.status(200).json({
          message: "New access token generated",
          accessToken: newAccessToken,
        });
      }
    );
  } catch (error) {
    console.error("Error in /token route:", error);
    return res
      .status(500)
      .json({ error: "Server error. Please try again later." });
  }
});

router.post("/logout", async (req, res) => {
  try {
    // Extract the refresh token from the request body
    const { refreshToken } = req.body;

    // If no token is provided, respond with an error
    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token required" });
    }

    // Verify the refresh token using JWT_REFRESH_SECRET
    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
      async (err, decoded) => {
        if (err) {
          // If token verification fails, respond with an error
          return res
            .status(403)
            .json({ error: "Invalid or expired refresh token" });
        }

        // Extract user ID from the decoded token payload
        const { id } = decoded;

        // Find user by ID in the database
        const user = await User.findOne({ where: { staff_id: id } });
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        // Remove stored refresh token from user's record
        user.refreshToken = null;
        await user.save();

        // Respond with a success message
        return res.status(200).json({ message: "Logged out successfully" });
      }
    );
  } catch (error) {
    console.error("Error in /logout route:", error);
    return res
      .status(500)
      .json({ error: "Server error. Please try again later." });
  }
});

router.get(
  "/protected",
  passport.authenticate("jwt", { session: false }), // Authenticate using JWT strategy
  (req, res) => {
    // Access authenticated user's information via req.user
    return res.status(200).json({
      message: `Welcome, ${req.user.name}!`, // Respond with a welcome message
      user: req.user, // Include user info in the response
    });
  }
);

// Additional protected route
router.get(
  "/user/profile",
  passport.authenticate("jwt", { session: false }), // Protect this route as well
  (req, res) => {
    return res.status(200).json({
      message: `User profile for: ${req.user.name}`,
      profile: {
        id: req.user.staff_id,
        email: req.user.email, 
        name: req.user.name,
      },
    });
  }
);

module.exports = router;
