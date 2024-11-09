import React, { createContext, useState, useContext, useEffect } from 'react';
import { Appearance } from 'react-native';
import { UserContext } from './UserContext';

export const ThemeContext = createContext();

const lightTheme = {
  backgroundColor: '#eee',
  textColor: '#000',
  tertiaryTextColor: '#888',
  secondaryTextColor: '#111',
  inputBackground: '#fff',
  optionBackground: '#fff',
  buttonText: '#fff',
  borderColor: '#ccc',
  placeholderTextColor: '#ccc',
  iconColor: '#3e3e3e',
  violet: '#7049f6',
  darkIconColor: '#3e3e3e'
};

const darkTheme = {
  secondaryTextColor: '#ddd',
  backgroundColor: '#151419',
  textColor: '#fff',
  tertiaryTextColor: '#999',
  inputBackground: '#232323',
  optionBackground: '#3a3a3a',
  buttonText: '#fff',
  borderColor: '#393939',
  placeholderTextColor: '#808080',
  iconColor: '#eee',
  violet: '#8867f7',
  darkIconColor: '#c0c0c0',
};

export const ThemeProvider = ({ children }) => {
  const { token, isLoggedIn } = useContext(UserContext);
  const [theme, setTheme] = useState(Appearance.getColorScheme() || 'dark');

  useEffect(() => {
    const loadThemeFromBackend = async () => {
      if (isLoggedIn && token) {
        try {
          const response = await fetch('http://192.168.1.145:5000/auth/profile', {
            headers: { Authorization: token },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.theme) {
              setTheme(data.theme);
            }
          } else {
            console.error('Failed to load theme from backend');
          }
        } catch (error) {
          console.error('Error fetching theme:', error);
        }
      }
    };

    loadThemeFromBackend();
  }, [isLoggedIn, token]);

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);

    if (isLoggedIn && token) {
      try {
        await fetch('http://192.168.1.145:5000/auth/update-theme', {
          method: 'POST',
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ theme: newTheme }),
        });
      } catch (error) {
        console.error('Error updating theme:', error);
      }
    }
  };

  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, currentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};