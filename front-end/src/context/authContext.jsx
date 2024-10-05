import React, { createContext, useContext, useState, useEffect } from "react";
import {jwtDecode} from "jwt-decode";
import axios from "axios";

// Create AuthContext
const AuthContext = createContext();

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);

// AuthProvider to wrap around the app
const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // To handle loading state

  // Helper function to refresh the access token
  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return false; // No refresh token found, return false

    try {
      const response = await axios.post("http://localhost:4000/user/refresh", { refreshToken });
      const { accessToken } = response.data;

      // Store the new access token
      localStorage.setItem("accessToken", accessToken);
      setIsAuthenticated(true); // Update state
      return true; // Return success
    } catch (error) {
      console.error("Failed to refresh access token:", error);
      logout(); // Log out if refresh fails
      return false; // Return failure
    }
  };

  useEffect(() => {
    // Auto-login and token validation on initial render
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp > currentTime) {
          setIsAuthenticated(true); // Token is valid, authenticate user
        } else {
          // Token expired, attempt to refresh it
          refreshAccessToken().then((success) => {
            if (!success) {
              setIsAuthenticated(false);
              localStorage.removeItem("accessToken"); // Clear expired access token
              localStorage.removeItem("refreshToken"); // Clear expired refresh token
            }
          });
        }
      } catch (error) {
        console.error("Failed to decode token:", error);
        setIsAuthenticated(false);
        localStorage.removeItem("accessToken"); // Clear invalid token
      }
    } else {
      // No token found
      setIsAuthenticated(false);
    }
    setLoading(false); // Set loading to false after checking
  }, []);

  // Function to handle login and store both tokens
  const login = (accessToken, refreshToken) => {
    console.log("Logging in with tokens:", accessToken, refreshToken); // Debugging line
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    setIsAuthenticated(true);
  };

  // Function to handle logout and clear both tokens
  const logout = () => {
    console.log("Logging out"); // Debugging line
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsAuthenticated(false);
  };

  if (loading) return <h2>Loading...</h2>; // Show loading state if still verifying tokens

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
