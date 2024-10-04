import React from "react";
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Register(){
  const navigate = useNavigate();

  // Define the mutation using useMutation
  const mutation = useMutation({
    mutationFn: (data) => axios.post('http://localhost:4001/user/register', data),
    onSuccess: () => {
      // Redirect to login after successful registration
      navigate('/login');
    },
    onError: (error) => {
      // Handle registration error
      console.error(error);
    }
  });

  const handleRegister = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    // Trigger the mutation
    mutation.mutate({
      email: formData.get('email'),
      password: formData.get('password'),
      name: formData.get('name'), // Include name in the registration data
    });
  };

  return (
    <form onSubmit={handleRegister}>
      <input type="text" name="name" placeholder="Name" required />
      <input type="email" name="email" placeholder="Email" required />
      <input type="password" name="password" placeholder="Password" required />
      <button type="submit" disabled={mutation.isLoading}>Register</button>
      {mutation.isError && <p>Error registering user!</p>} {/* Display error message */}
      {mutation.isSuccess && <p>Registration successful! Redirecting to login...</p>} {/* Display success message */}
    </form>
  );
}