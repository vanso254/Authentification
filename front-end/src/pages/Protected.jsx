import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext"; // Import useAuth to access logout functionality

export default function Protected() {
  const [userData, setUserData] = useState(null); // State to hold user data
  const [loading, setLoading] = useState(true); // State to handle loading
  const [error, setError] = useState(null); // State to handle errors
  const { logout } = useAuth(); // Access logout function from AuthContext
  const navigate = useNavigate(); // For navigation

  useEffect(() => {
    // Get the token from localStorage
    const token = localStorage.getItem("accessToken");

    // If no token, redirect to login
    if (!token) {
      navigate("/login");
      return;
    }

    // Fetch protected data
    axios
      .get("http://localhost:4001/user/protected", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setUserData(response.data); // Set the user data from response
        setLoading(false); // Set loading to false
      })
      .catch((error) => {
        console.error("Error fetching protected route:", error);
        setError("Failed to load protected data. Please login again."); // Set error message
        setLoading(false); // Set loading to false
      });
  }, [navigate]);

  const handleLogout = () => {
    const refreshToken = localStorage.getItem("refreshToken");
  
    // Remove both access and refresh tokens from local storage immediately
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  
    // Update the state using the logout function from AuthContext
    logout();
  
    // Send a request to the logout route with the refresh token (optional)
    if (refreshToken) {
      axios
        .post("http://localhost:4001/user/logout", { refreshToken })
        .then((response) => {
          console.log(response.data.message); // Log success message
        })
        .catch((error) => {
          console.error("Error during logout:", error); // Log error, but tokens are already cleared locally
        });
    }
  
    // Redirect to the login page
    navigate("/login");
  };

  // Show loading state
  if (loading) return <h2>Loading...</h2>;

  // Show error state
  if (error) return <h2>{error}</h2>;

  // Display the user information once loaded
  return (
    <div>
      <h1>Protected Route</h1>
      <p>{userData.message}</p>
      <h3>User Information:</h3>
      <pre>{JSON.stringify(userData.user, null, 2)}</pre> {/* Pretty-print the user info */}
      
      {/* Logout button */}
      <button onClick={handleLogout} style={{ marginTop: "20px", padding: "10px 20px" }}>
        Logout
      </button>
    </div>
  );
}
