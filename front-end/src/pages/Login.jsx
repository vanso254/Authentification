import React from "react";
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from "../context/authContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth(); // Access the login function from context

  // Place your useMutation hook inside the component
  const mutation = useMutation({
    mutationFn: (data) => axios.post('http://localhost:4000/user/login', data),
    onSuccess: (response) => {
      console.log("Login response:", response.data); // Log the entire response
      const { accessToken, refreshToken } = response.data; // Extract access and refresh tokens
      console.log("Access Token:", accessToken);
      console.log("Refresh Token:", refreshToken);

      if (accessToken) {
        login(accessToken); // Call the login function from AuthContext to store the token
        navigate('/'); // Redirect to the protected route
      } else {
        console.error("No token received in response");
      }
    },
    onError: (error) => {
      // Handle login error
      console.error("Error during login:", error);
    }
  });

  const handleLogin = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    mutation.mutate({
      email: formData.get('email'),
      password: formData.get('password'),
    });
  };

  return (
    <form onSubmit={handleLogin}>
      <input type="email" name="email" placeholder="Email" required />
      <input type="password" name="password" placeholder="Password" required />
      <button type="submit" disabled={mutation.isLoading}>Login</button>
      {mutation.isError && <p>Error logging in!</p>} {/* Display error message */}
      {mutation.isSuccess && <p>Login successful!</p>} {/* Display success message */}
    </form>
  );
}
