// PrivateRoute.js
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from './authContext';

export default function PrivateRoute({ children }){
  const { isAuthenticated } = useContext(AuthContext);

  return isAuthenticated ? children : <Navigate to="/login" />;
};
