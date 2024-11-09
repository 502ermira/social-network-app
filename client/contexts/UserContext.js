import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      
      const storedToken = await AsyncStorage.getItem('token');
      const storedUsername = await AsyncStorage.getItem('username');
      
      if (storedToken) {
        setIsLoggedIn(true);
        setUsername(storedUsername || '');
        setToken(storedToken);
      } else {
        setIsLoggedIn(false);
        setUsername('');
        setToken('');
      }
      setLoading(false);
    };
  
    checkLoginStatus();
  }, [isLoggedIn]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('username');
    setIsLoggedIn(false);
    setUsername('');
    setToken('');
  };

  return (
    <UserContext.Provider value={{ isLoggedIn, token, username, setIsLoggedIn, setUsername, handleLogout, loading }}>
      {children}
    </UserContext.Provider>
  );
};