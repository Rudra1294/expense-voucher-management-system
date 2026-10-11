import { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for an existing session on initial load
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data);
    localStorage.setItem('user', JSON.stringify(data));
    return data.role;
  };

  const registerUser = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    setUser(data);
    localStorage.setItem('user', JSON.stringify(data));
    return data.role;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, registerUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};