require("dotenv").config();
const express = require("express");
const app = express();
const mountRoutes = require("./server/routes/mountRoutes");
const passport = require("./server/services/passportConfig");
const cors = require("cors");
const port = process.env.PORT || 4001; // Make sure the port is consistent

// Import the database connection
const sequelize = require("./server/db/database");

// Import and run the database sync
require("./server/db/syncDb");

// Apply CORS middleware
app.use(cors({
  origin: "http://localhost:5173", // Replace with the origin of your React app
  methods: ["GET", "POST", "PUT", "DELETE"], // Specify the methods you want to allow
  credentials: true // Allow credentials if necessary
}));

app.use(express.json());
app.use(passport.initialize());

mountRoutes(app); // Mount routes after setting up middleware

app.listen(port, async () => {
  try {
    // Test the database connection before starting the server
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");

    console.log(`Server listening on port ${port}`);
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
});
