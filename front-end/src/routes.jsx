import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Protected from "./pages/Protected";
import Register from "./pages/Register";
import { useAuth } from "./context/authContext";

// Private Route Wrapper
const PrivateRoute = ({ element }) => {
  const { isAuthenticated } = useAuth();
  console.log("PrivateRoute isAuthenticated:", isAuthenticated); // Debugging line
  return isAuthenticated ? element : <Navigate to="/login" />;
};

// Public Route Wrapper
const PublicRoute = ({ element }) => {
  const { isAuthenticated } = useAuth();
  console.log("PublicRoute isAuthenticated:", isAuthenticated); // Debugging line
  return !isAuthenticated ? element : <Navigate to="/" />;
};

// Define routes
const routes = createBrowserRouter([
  {
    path: "/",
    element: <PrivateRoute element={<Protected />} />,
  },
  {
    path: "/login",
    element: <PublicRoute element={<Login />} />,
  },
  {
    path: "/register",
    element: <PublicRoute element={<Register />} />,
  },
]);

export default routes;
