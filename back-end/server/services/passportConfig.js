// passportConfig.js
const passport = require("passport");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const User = require("../models/User"); // Adjust the path if necessary
require("dotenv").config();

// Setup options for JWT strategy
const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract JWT from the Authorization header as a Bearer token
  secretOrKey: process.env.JWT_SECRET, // Use the JWT secret from environment variables
};

// Define JWT strategy
passport.use(
  new JwtStrategy(options, async (jwt_payload, done) => {
    try {
      // Extract user ID from jwt_payload and find user in database
      const user = await User.findByPk(jwt_payload.id); // Assuming `id` is the identifier in the token

      if (user) {
        return done(null, user); // If user exists, pass user to next middleware
      } else {
        return done(null, false); // User not found
      }
    } catch (error) {
      return done(error, false); // If error occurs, handle it
    }
  })
);

// Export configured passport
module.exports = passport;
