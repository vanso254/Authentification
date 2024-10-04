import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

// Create AuthContext
const AuthContext = createContext();

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);

// AuthProvider to wrap around the app
const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    console.log("Checking token:", token); // Debugging line

    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp > currentTime) {
          setIsAuthenticated(true);
        } else {
          // Token expired, clear it
          setIsAuthenticated(false);
          localStorage.removeItem("accessToken");
        }
      } catch (error) {
        console.error("Failed to decode token:", error);
        setIsAuthenticated(false);
        localStorage.removeItem("accessToken"); // Clear invalid token
      }
    } else {
      // Token is null or not set
      setIsAuthenticated(false);
    }
  }, []);

  const login = (token) => {
    console.log("Logging in with token:", token); // Debugging line
    localStorage.setItem("accessToken", token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    console.log("Logging out"); // Debugging line
    localStorage.removeItem("accessToken");
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
