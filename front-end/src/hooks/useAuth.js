import { useContext } from 'react';
import AuthContext from './authContext';

export const useAuth = () => {
  const { isAuthenticated, login, logout } = useContext(AuthContext);
  return { isAuthenticated, login, logout };
};
